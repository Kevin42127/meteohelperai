const express = require('express');
const axios = require('axios');
const router = express.Router();

const CWA_BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

function getCwaApiKey() {
  const apiKey = process.env.CWA_API_KEY;
  
  if (!apiKey || apiKey === 'undefined') {
    throw new Error('CWA_API_KEY 環境變數未設定');
  }
  
  return apiKey;
}

router.get('/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: '缺少經緯度參數' });
    }

    const apiKey = getCwaApiKey();
    const url = `${CWA_BASE_URL}/O-A0003-001?Authorization=${encodeURIComponent(apiKey)}&format=JSON&lat=${lat}&lon=${lon}&limit=1`;
    
    const locationResponse = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!locationResponse.data.success) {
      throw new Error('無法取得天氣資料');
    }

    const records = locationResponse.data.records?.location || [];
    if (records.length === 0) {
      return res.status(404).json({ error: '找不到該位置的天氣資料' });
    }

    const location = records[0];
    const weatherElement = location.weatherElement || [];
    
    console.log('API 回應資料結構:', JSON.stringify({
      locationName: location.locationName,
      elementCount: weatherElement.length,
      elements: weatherElement.map(e => e.elementName)
    }, null, 2));
    
    const getElementValue = (elementName) => {
      const element = weatherElement.find(e => e.elementName === elementName);
      if (element) {
        const value = element.elementValue || element.elementValue.value || null;
        console.log(`找到元素 ${elementName}:`, value);
        return value;
      }
      console.log(`未找到元素: ${elementName}`);
      return null;
    };

    const temp = getElementValue('TEMP') || getElementValue('T');
    const weather = getElementValue('Weather') || getElementValue('Wx') || getElementValue('WEATHER');
    const humd = getElementValue('HUMD') || getElementValue('RH') || getElementValue('HUMIDITY');
    const wdsd = getElementValue('WDSD') || getElementValue('WS') || getElementValue('WIND_SPEED');
    const precip = getElementValue('H_24R') || getElementValue('PoP') || getElementValue('RAIN') || getElementValue('PRECIPITATION');
    
    console.log('解析的詳細資料:', {
      temp, weather, humd, wdsd, precip
    });

    const weatherData = {
      location: location.locationName || '未知位置',
      temperature: temp,
      description: weather,
      humidity: humd,
      windSpeed: wdsd,
      precipitation: precip,
      feelsLike: temp,
      time: location.time?.obsTime || location.obsTime || new Date().toISOString()
    };

    console.log('解析後的天氣資料:', weatherData);
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('天氣API錯誤:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message ||
                        '無法取得天氣資料';
    
    res.status(error.response?.status || 500).json({ 
      error: '無法取得天氣資料：' + errorMessage,
      details: error.response?.data,
      status: error.response?.status
    });
  }
});

function isCityOnly(locationName) {
  const cities = [
    '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
    '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
    '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
    '臺東縣', '澎湖縣', '金門縣', '連江縣'
  ];
  return cities.includes(locationName);
}

router.get('/city', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: '缺少城市參數' });
    }

    const apiKey = getCwaApiKey();
    let location = null;
    let weatherElements = [];
    let isTownship = false;

    // 策略：如果輸入包含鄉鎮區，先嘗試鄉鎮區查詢，失敗則降級到縣市查詢
    const cityMatch = city.match(/^(.*?[市縣])/);
    const cityName = cityMatch ? cityMatch[1] : city;
    const isInputCityOnly = isCityOnly(city);

    if (isInputCityOnly) {
      // 純縣市名稱，直接使用縣市 API
      const cityUrl = `${CWA_BASE_URL}/F-C0032-001?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(city)}`;
      
      const response = await axios.get(cityUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.data.success || !response.data.records?.location?.length) {
        throw new Error(`無法取得「${city}」的天氣資料，請確認輸入的縣市名稱是否正確`);
      }

      const records = response.data.records.location;
      location = records[0];
      weatherElements = location.weatherElement || [];
    } else {
      // 包含鄉鎮區，先嘗試鄉鎮區查詢，失敗則降級到縣市查詢
      const townshipUrl = `${CWA_BASE_URL}/F-D0047-093?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(city)}`;
      
      try {
        const townshipResponse = await axios.get(townshipUrl, {
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('鄉鎮區 API 回應:', {
          success: townshipResponse.data.success,
          hasRecords: !!townshipResponse.data.records?.location?.length,
          locationCount: townshipResponse.data.records?.location?.length || 0,
          responseData: townshipResponse.data
        });

        if (townshipResponse.data.success && townshipResponse.data.records?.location?.length > 0) {
          const records = townshipResponse.data.records.location;
          location = records[0];
          weatherElements = location.weatherElement || [];
          isTownship = true;
          console.log('成功使用鄉鎮區 API 取得資料:', location.locationName);
        } else {
          throw new Error('鄉鎮區查詢無資料，降級到縣市查詢');
        }
      } catch (townshipError) {
        console.log('鄉鎮區查詢失敗，降級到縣市查詢:', {
          error: townshipError.message,
          input: city,
          extractedCity: cityName,
          responseStatus: townshipError.response?.status,
          responseData: townshipError.response?.data
        });

        // 降級到縣市查詢
        const cityUrl = `${CWA_BASE_URL}/F-C0032-001?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(cityName)}`;
        
        try {
          const cityResponse = await axios.get(cityUrl, {
            headers: {
              'Accept': 'application/json'
            }
          });

          console.log('降級縣市 API 回應:', {
            success: cityResponse.data.success,
            hasRecords: !!cityResponse.data.records?.location?.length,
            locationCount: cityResponse.data.records?.location?.length || 0
          });

          if (cityResponse.data.success && cityResponse.data.records?.location?.length > 0) {
            const records = cityResponse.data.records.location;
            location = records[0];
            weatherElements = location.weatherElement || [];
            console.log('成功使用縣市 API 取得資料（降級）:', location.locationName);
          } else {
            throw new Error(`無法取得「${city}」的天氣資料。已嘗試鄉鎮區和縣市查詢，請確認輸入的地名是否正確。`);
          }
        } catch (cityError) {
          console.error('降級縣市查詢也失敗:', {
            message: cityError.message,
            response: cityError.response?.data,
            status: cityError.response?.status
          });
          
          throw new Error(`無法取得「${city}」的天氣資料。請嘗試查詢縣市名稱（如：${cityName}），或確認輸入的地名是否正確。`);
        }
      }
    }

    if (!location || !weatherElements) {
      return res.status(404).json({ error: '找不到該位置的天氣資料' });
    }

    console.log('城市 API 回應資料結構:', JSON.stringify({
      locationName: location.locationName,
      elementCount: weatherElements.length,
      elements: weatherElements.map(e => ({
        name: e.elementName,
        hasTime: !!e.time,
        timeCount: e.time?.length || 0
      }))
    }, null, 2));

    const getElementValue = (elementName, timeIndex = 0) => {
      const element = weatherElements.find(e => e.elementName === elementName);
      if (!element) {
        return null;
      }
      
      if (!element.time || !element.time[timeIndex]) {
        return null;
      }
      
      const timeData = element.time[timeIndex];
      let value = null;
      
      if (timeData.parameter) {
        if (Array.isArray(timeData.parameter)) {
          const param = timeData.parameter[0];
          value = param?.parameterName || param?.parameterValue || null;
        } else {
          value = timeData.parameter?.parameterName || timeData.parameter?.parameterValue || timeData.parameter?.parameterUnit || null;
        }
      }
      
      if (value && typeof value === 'string') {
        value = value.trim();
        if (value === '' || value === 'null' || value === 'undefined' || value === 'NaN') {
          value = null;
        }
      }
      
      return value;
    };

    const temp = getElementValue('T', 0);
    const wx = getElementValue('Wx', 0);
    const minTemp = getElementValue('MinT', 0);
    const maxTemp = getElementValue('MaxT', 0);
    const pop = getElementValue('PoP', 0);
    
    let rh = null;
    let ws = null;
    let ci = null;
    
    for (let i = 0; i < 3; i++) {
      if (!rh) rh = getElementValue('RH', i);
      if (!ws) ws = getElementValue('WS', i);
      if (!ci) ci = getElementValue('CI', i);
    }
    
    console.log('解析的詳細資料:', {
      temp, wx, minTemp, maxTemp, pop, rh, ws, ci,
      allElements: weatherElements.map(e => e.elementName)
    });

    let finalTemp = temp;
    if (!finalTemp && minTemp && maxTemp) {
      finalTemp = `${minTemp}~${maxTemp}`;
    } else if (!finalTemp && minTemp) {
      finalTemp = minTemp;
    } else if (!finalTemp && maxTemp) {
      finalTemp = maxTemp;
    }

    const weatherData = {
      location: location.locationName || city,
      temperature: finalTemp,
      description: wx,
      minTemp: minTemp,
      maxTemp: maxTemp,
      precipitation: pop,
      humidity: rh,
      windSpeed: ws,
      comfortIndex: ci,
      feelsLike: finalTemp || minTemp || maxTemp,
      time: new Date().toISOString()
    };

    console.log('解析後的城市天氣資料:', weatherData);
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('天氣API錯誤:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message ||
                        '無法取得天氣資料';
    
    res.status(error.response?.status || 500).json({ 
      error: '無法取得天氣資料：' + errorMessage,
      details: error.response?.data,
      status: error.response?.status
    });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: '缺少城市參數' });
    }

    const apiKey = getCwaApiKey();
    let location = null;
    let weatherElements = [];

    if (isCityOnly(city)) {
      const url = `${CWA_BASE_URL}/F-C0032-003?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(city)}`;
      
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error('無法取得天氣預報資料');
      }

      const records = response.data.records?.location || [];
      if (records.length === 0) {
        return res.status(404).json({ error: '找不到該城市的天氣預報資料' });
      }

      location = records[0];
      weatherElements = location.weatherElement || [];
    } else {
      const townshipUrl = `${CWA_BASE_URL}/F-D0047-093?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(city)}`;
      
      try {
        const townshipResponse = await axios.get(townshipUrl, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (townshipResponse.data.success && townshipResponse.data.records?.location?.length > 0) {
          const records = townshipResponse.data.records.location;
          location = records[0];
          weatherElements = location.weatherElement || [];
        } else {
          const cityMatch = city.match(/^(.*?[市縣])/);
          if (cityMatch) {
            const cityName = cityMatch[1];
            const fallbackUrl = `${CWA_BASE_URL}/F-C0032-003?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(cityName)}`;
            const fallbackResponse = await axios.get(fallbackUrl, {
              headers: {
                'Accept': 'application/json'
              }
            });
            if (fallbackResponse.data.success && fallbackResponse.data.records?.location?.length > 0) {
              const records = fallbackResponse.data.records.location;
              location = records[0];
              weatherElements = location.weatherElement || [];
            } else {
              throw new Error('無法取得天氣預報資料');
            }
          } else {
            throw new Error('無法取得天氣預報資料');
          }
        }
      } catch (townshipError) {
        const cityMatch = city.match(/^(.*?[市縣])/);
        if (cityMatch) {
          const cityName = cityMatch[1];
          const fallbackUrl = `${CWA_BASE_URL}/F-C0032-003?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(cityName)}`;
          const fallbackResponse = await axios.get(fallbackUrl, {
            headers: {
              'Accept': 'application/json'
            }
          });
          if (fallbackResponse.data.success && fallbackResponse.data.records?.location?.length > 0) {
            const records = fallbackResponse.data.records.location;
            location = records[0];
            weatherElements = location.weatherElement || [];
          } else {
            throw new Error('無法取得天氣預報資料');
          }
        } else {
          throw new Error('無法取得天氣預報資料');
        }
      }
    }

    if (!location || !weatherElements) {
      return res.status(404).json({ error: '找不到該位置的天氣預報資料' });
    }

    const getElementValue = (elementName, timeIndex = 0) => {
      const element = weatherElements.find(e => e.elementName === elementName);
      if (!element || !element.time || !element.time[timeIndex]) {
        return null;
      }
      
      const timeData = element.time[timeIndex];
      let value = null;
      
      if (timeData.parameter) {
        if (Array.isArray(timeData.parameter)) {
          const param = timeData.parameter[0];
          value = param?.parameterName || param?.parameterValue || null;
        } else {
          value = timeData.parameter?.parameterName || timeData.parameter?.parameterValue || null;
        }
      }
      
      if (value && typeof value === 'string') {
        value = value.trim();
        if (value === '' || value === 'null' || value === 'undefined' || value === 'NaN') {
          value = null;
        }
      }
      
      return value;
    };

    const forecast = [];
    const maxDays = 7;
    
    for (let i = 0; i < maxDays; i++) {
      const wx = getElementValue('Wx', i);
      const minTemp = getElementValue('MinT', i);
      const maxTemp = getElementValue('MaxT', i);
      const pop = getElementValue('PoP', i);
      
      if (wx || minTemp || maxTemp) {
        forecast.push({
          day: i,
          weather: wx,
          minTemp: minTemp,
          maxTemp: maxTemp,
          precipitation: pop,
          startTime: weatherElements[0]?.time?.[i]?.startTime || null,
          endTime: weatherElements[0]?.time?.[i]?.endTime || null
        });
      }
    }

    res.status(200).json({
      location: location.locationName || city,
      forecast: forecast
    });
  } catch (error) {
    console.error('天氣預報API錯誤:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message ||
                        '無法取得天氣預報資料';
    
    res.status(error.response?.status || 500).json({ 
      error: '無法取得天氣預報資料：' + errorMessage,
      details: error.response?.data
    });
  }
});

router.get('/warnings', async (req, res) => {
  try {
    const apiKey = getCwaApiKey();
    const url = `${CWA_BASE_URL}/W-C0033-001?Authorization=${encodeURIComponent(apiKey)}&format=JSON`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error('無法取得天氣警特報資料');
    }

    const records = response.data.records?.location || [];
    const warnings = [];

    records.forEach(location => {
      if (location.hazardConditions && location.hazardConditions.hazardConditions) {
        location.hazardConditions.hazardConditions.forEach(hazard => {
          warnings.push({
            location: location.locationName,
            hazardType: hazard.hazard?.hazardType || null,
            hazardLevel: hazard.hazard?.hazardLevel || null,
            startTime: hazard.hazard?.startTime || null,
            endTime: hazard.hazard?.endTime || null,
            content: hazard.hazard?.hazardStatistics || null
          });
        });
      }
    });

    res.status(200).json({
      warnings: warnings,
      count: warnings.length,
      updateTime: response.data.records?.datasetInfo?.datasetUpdateTime || new Date().toISOString()
    });
  } catch (error) {
    console.error('天氣警特報API錯誤:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message ||
                        '無法取得天氣警特報資料';
    
    res.status(error.response?.status || 500).json({ 
      error: '無法取得天氣警特報資料：' + errorMessage,
      details: error.response?.data
    });
  }
});

router.get('/sunrise', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: '缺少城市參數' });
    }

    const apiKey = getCwaApiKey();
    const url = `${CWA_BASE_URL}/A-B0062-001?Authorization=${encodeURIComponent(apiKey)}&format=JSON&locationName=${encodeURIComponent(city)}`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error('無法取得日出日落資料');
    }

    const records = response.data.records?.location || [];
    if (records.length === 0) {
      return res.status(404).json({ error: '找不到該城市的日出日落資料' });
    }

    const location = records[0];
    const time = location.time || [];
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayData = time.find(t => {
      const dataTime = t.dataTime || t.DataTime || '';
      return dataTime.startsWith(todayStr);
    }) || time[0];
    
    if (!todayData) {
      return res.status(404).json({ error: '找不到今日的日出日落資料' });
    }

    let sunrise = null;
    let sunset = null;

    if (todayData.parameter) {
      if (Array.isArray(todayData.parameter)) {
        const sunriseParam = todayData.parameter.find(p => 
          (p.parameterName && p.parameterName.includes('日出')) ||
          (p.parameterName && p.parameterName.includes('Sunrise'))
        );
        const sunsetParam = todayData.parameter.find(p => 
          (p.parameterName && p.parameterName.includes('日落')) ||
          (p.parameterName && p.parameterName.includes('Sunset'))
        );
        sunrise = sunriseParam?.parameterValue || sunriseParam?.parameterName || null;
        sunset = sunsetParam?.parameterValue || sunsetParam?.parameterName || null;
      } else {
        sunrise = todayData.parameter.parameterValue || todayData.parameter.parameterName || null;
      }
    }

    if (todayData.parameter2) {
      sunset = todayData.parameter2.parameterValue || todayData.parameter2.parameterName || null;
    }

    if (!sunrise && !sunset) {
      const allParams = Array.isArray(todayData.parameter) ? todayData.parameter : [todayData.parameter].filter(Boolean);
      allParams.forEach(param => {
        const name = param?.parameterName || '';
        const value = param?.parameterValue || '';
        if (name.includes('日出') || name.includes('Sunrise')) {
          sunrise = value || name;
        }
        if (name.includes('日落') || name.includes('Sunset')) {
          sunset = value || name;
        }
      });
    }

    res.status(200).json({
      location: location.locationName || city,
      date: todayData.dataTime || todayData.DataTime || todayStr,
      sunrise: sunrise,
      sunset: sunset
    });
  } catch (error) {
    console.error('日出日落API錯誤:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message ||
                        '無法取得日出日落資料';
    
    res.status(error.response?.status || 500).json({ 
      error: '無法取得日出日落資料：' + errorMessage,
      details: error.response?.data
    });
  }
});

module.exports = router;

