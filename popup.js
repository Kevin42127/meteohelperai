const API_BASE_URL = 'https://meteohelperai.vercel.app';

let currentWeatherData = null;

const CITY_LIST = [
  '基隆市', '基隆市仁愛區', '基隆市信義區', '基隆市中正區', '基隆市中山區', '基隆市安樂區', '基隆市暖暖區', '基隆市七堵區',
  '臺北市', '臺北市松山區', '臺北市信義區', '臺北市大安區', '臺北市中山區', '臺北市中正區', '臺北市大同區', '臺北市萬華區', '臺北市文山區', '臺北市南港區', '臺北市內湖區', '臺北市士林區', '臺北市北投區',
  '新北市', '新北市板橋區', '新北市三重區', '新北市中和區', '新北市永和區', '新北市新莊區', '新北市新店區', '新北市樹林區', '新北市鶯歌區', '新北市三峽區', '新北市淡水區', '新北市汐止區', '新北市瑞芳區', '新北市土城區', '新北市蘆洲區', '新北市五股區', '新北市泰山區', '新北市林口區', '新北市深坑區', '新北市石碇區', '新北市坪林區', '新北市三芝區', '新北市石門區', '新北市八里區', '新北市平溪區', '新北市雙溪區', '新北市貢寮區', '新北市金山區', '新北市萬里區', '新北市烏來區',
  '桃園市', '桃園市桃園區', '桃園市中壢區', '桃園市大溪區', '桃園市楊梅區', '桃園市蘆竹區', '桃園市大園區', '桃園市龜山區', '桃園市八德區', '桃園市龍潭區', '桃園市平鎮區', '桃園市新屋區', '桃園市觀音區', '桃園市復興區',
  '新竹市', '新竹市東區', '新竹市北區', '新竹市香山區',
  '新竹縣', '新竹縣竹北市', '新竹縣竹東鎮', '新竹縣新埔鎮', '新竹縣關西鎮', '新竹縣湖口鄉', '新竹縣新豐鄉', '新竹縣芎林鄉', '新竹縣橫山鄉', '新竹縣北埔鄉', '新竹縣寶山鄉', '新竹縣峨眉鄉', '新竹縣尖石鄉', '新竹縣五峰鄉',
  '苗栗縣', '苗栗縣苗栗市', '苗栗縣頭份市', '苗栗縣竹南鎮', '苗栗縣後龍鎮', '苗栗縣通霄鎮', '苗栗縣苑裡鎮', '苗栗縣卓蘭鎮', '苗栗縣大湖鄉', '苗栗縣公館鄉', '苗栗縣銅鑼鄉', '苗栗縣南庄鄉', '苗栗縣頭屋鄉', '苗栗縣三義鄉', '苗栗縣西湖鄉', '苗栗縣造橋鄉', '苗栗縣三灣鄉', '苗栗縣獅潭鄉', '苗栗縣泰安鄉',
  '臺中市', '臺中市中區', '臺中市東區', '臺中市南區', '臺中市西區', '臺中市北區', '臺中市西屯區', '臺中市南屯區', '臺中市北屯區', '臺中市豐原區', '臺中市東勢區', '臺中市大甲區', '臺中市清水區', '臺中市沙鹿區', '臺中市梧棲區', '臺中市后里區', '臺中市神岡區', '臺中市潭子區', '臺中市大雅區', '臺中市新社區', '臺中市石岡區', '臺中市外埔區', '臺中市大安區', '臺中市烏日區', '臺中市大肚區', '臺中市龍井區', '臺中市霧峰區', '臺中市太平區', '臺中市大里區', '臺中市和平區',
  '彰化縣', '彰化縣彰化市', '彰化縣員林市', '彰化縣鹿港鎮', '彰化縣和美鎮', '彰化縣溪湖鎮', '彰化縣田中鎮', '彰化縣線西鄉', '彰化縣伸港鄉', '彰化縣福興鄉', '彰化縣秀水鄉', '彰化縣花壇鄉', '彰化縣芬園鄉', '彰化縣大村鄉', '彰化縣埔鹽鄉', '彰化縣埔心鄉', '彰化縣永靖鄉', '彰化縣社頭鄉', '彰化縣二水鄉', '彰化縣北斗鎮', '彰化縣二林鎮', '彰化縣田尾鄉', '彰化縣埤頭鄉', '彰化縣芳苑鄉', '彰化縣大城鄉', '彰化縣竹塘鄉', '彰化縣溪州鄉',
  '南投縣', '南投縣南投市', '南投縣埔里鎮', '南投縣草屯鎮', '南投縣竹山鎮', '南投縣集集鎮', '南投縣名間鄉', '南投縣鹿谷鄉', '南投縣中寮鄉', '南投縣魚池鄉', '南投縣國姓鄉', '南投縣水里鄉', '南投縣信義鄉', '南投縣仁愛鄉',
  '雲林縣', '雲林縣斗六市', '雲林縣斗南鎮', '雲林縣虎尾鎮', '雲林縣西螺鎮', '雲林縣土庫鎮', '雲林縣北港鎮', '雲林縣古坑鄉', '雲林縣大埤鄉', '雲林縣莿桐鄉', '雲林縣林內鄉', '雲林縣二崙鄉', '雲林縣崙背鄉', '雲林縣麥寮鄉', '雲林縣東勢鄉', '雲林縣褒忠鄉', '雲林縣臺西鄉', '雲林縣元長鄉', '雲林縣四湖鄉', '雲林縣口湖鄉', '雲林縣水林鄉',
  '嘉義市', '嘉義市東區', '嘉義市西區',
  '嘉義縣', '嘉義縣太保市', '嘉義縣朴子市', '嘉義縣布袋鎮', '嘉義縣大林鎮', '嘉義縣民雄鄉', '嘉義縣溪口鄉', '嘉義縣新港鄉', '嘉義縣六腳鄉', '嘉義縣東石鄉', '嘉義縣義竹鄉', '嘉義縣鹿草鄉', '嘉義縣水上鄉', '嘉義縣中埔鄉', '嘉義縣竹崎鄉', '嘉義縣梅山鄉', '嘉義縣番路鄉', '嘉義縣大埔鄉', '嘉義縣阿里山鄉',
  '臺南市', '臺南市中西區', '臺南市東區', '臺南市南區', '臺南市北區', '臺南市安平區', '臺南市安南區', '臺南市永康區', '臺南市歸仁區', '臺南市新化區', '臺南市左鎮區', '臺南市玉井區', '臺南市楠西區', '臺南市南化區', '臺南市仁德區', '臺南市關廟區', '臺南市龍崎區', '臺南市官田區', '臺南市麻豆區', '臺南市佳里區', '臺南市西港區', '臺南市七股區', '臺南市將軍區', '臺南市學甲區', '臺南市北門區', '臺南市新營區', '臺南市後壁區', '臺南市白河區', '臺南市東山區', '臺南市六甲區', '臺南市下營區', '臺南市柳營區', '臺南市鹽水區', '臺南市善化區', '臺南市大內區', '臺南市山上區', '臺南市新市區', '臺南市安定區',
  '高雄市', '高雄市新興區', '高雄市前金區', '高雄市苓雅區', '高雄市鹽埕區', '高雄市鼓山區', '高雄市旗津區', '高雄市前鎮區', '高雄市三民區', '高雄市左營區', '高雄市楠梓區', '高雄市小港區', '高雄市鳳山區', '高雄市林園區', '高雄市大寮區', '高雄市大樹區', '高雄市大社區', '高雄市仁武區', '高雄市鳥松區', '高雄市岡山區', '高雄市橋頭區', '高雄市燕巢區', '高雄市田寮區', '高雄市阿蓮區', '高雄市路竹區', '高雄市湖內區', '高雄市茄萣區', '高雄市永安區', '高雄市彌陀區', '高雄市梓官區', '高雄市旗山區', '高雄市美濃區', '高雄市六龜區', '高雄市甲仙區', '高雄市杉林區', '高雄市內門區', '高雄市茂林區', '高雄市桃源區', '高雄市那瑪夏區',
  '屏東縣', '屏東縣屏東市', '屏東縣三地門鄉', '屏東縣霧臺鄉', '屏東縣瑪家鄉', '屏東縣九如鄉', '屏東縣里港鄉', '屏東縣高樹鄉', '屏東縣鹽埔鄉', '屏東縣長治鄉', '屏東縣麟洛鄉', '屏東縣竹田鄉', '屏東縣內埔鄉', '屏東縣萬丹鄉', '屏東縣潮州鎮', '屏東縣泰武鄉', '屏東縣來義鄉', '屏東縣萬巒鄉', '屏東縣崁頂鄉', '屏東縣新埤鄉', '屏東縣南州鄉', '屏東縣林邊鄉', '屏東縣東港鎮', '屏東縣琉球鄉', '屏東縣佳冬鄉', '屏東縣新園鄉', '屏東縣枋寮鄉', '屏東縣枋山鄉', '屏東縣春日鄉', '屏東縣獅子鄉', '屏東縣車城鄉', '屏東縣牡丹鄉', '屏東縣恆春鎮', '屏東縣滿州鄉',
  '宜蘭縣', '宜蘭縣宜蘭市', '宜蘭縣頭城鎮', '宜蘭縣礁溪鄉', '宜蘭縣壯圍鄉', '宜蘭縣員山鄉', '宜蘭縣羅東鎮', '宜蘭縣三星鄉', '宜蘭縣大同鄉', '宜蘭縣五結鄉', '宜蘭縣冬山鄉', '宜蘭縣蘇澳鎮', '宜蘭縣南澳鄉',
  '花蓮縣', '花蓮縣花蓮市', '花蓮縣鳳林鎮', '花蓮縣玉里鎮', '花蓮縣新城鄉', '花蓮縣吉安鄉', '花蓮縣壽豐鄉', '花蓮縣光復鄉', '花蓮縣豐濱鄉', '花蓮縣瑞穗鄉', '花蓮縣富里鄉', '花蓮縣秀林鄉', '花蓮縣萬榮鄉', '花蓮縣卓溪鄉',
  '臺東縣', '臺東縣臺東市', '臺東縣成功鎮', '臺東縣關山鎮', '臺東縣卑南鄉', '臺東縣鹿野鄉', '臺東縣池上鄉', '臺東縣東河鄉', '臺東縣長濱鄉', '臺東縣太麻里鄉', '臺東縣大武鄉', '臺東縣綠島鄉', '臺東縣海端鄉', '臺東縣延平鄉', '臺東縣金峰鄉', '臺東縣達仁鄉', '臺東縣蘭嶼鄉',
  '澎湖縣', '澎湖縣馬公市', '澎湖縣湖西鄉', '澎湖縣白沙鄉', '澎湖縣西嶼鄉', '澎湖縣望安鄉', '澎湖縣七美鄉',
  '金門縣', '金門縣金城鎮', '金門縣金湖鎮', '金門縣金沙鎮', '金門縣金寧鄉', '金門縣烈嶼鄉', '金門縣烏坵鄉',
  '連江縣', '連江縣南竿鄉', '連江縣北竿鄉', '連江縣莒光鄉', '連江縣東引鄉'
];

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadChatHistory();
});

function initEventListeners() {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  
  searchBtn.addEventListener('click', handleCitySearch);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const suggestions = document.getElementById('citySuggestions');
      const firstSuggestion = suggestions.querySelector('.suggestion-item');
      if (firstSuggestion && suggestions.style.display !== 'none') {
        cityInput.value = firstSuggestion.textContent;
        hideSuggestions();
        handleCitySearch();
      } else {
        handleCitySearch();
      }
    }
  });
  cityInput.addEventListener('input', handleCityInput);
  cityInput.addEventListener('focus', handleCityInput);
  
  document.getElementById('sendBtn').addEventListener('click', handleSendMessage);
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
  document.getElementById('clearAllBtn').addEventListener('click', clearAllMessages);
  
  document.getElementById('aiInfoBtn').addEventListener('click', () => {
    const dialog = document.getElementById('aiInfoDialog');
    dialog.classList.add('visible');
  });
  
  document.getElementById('closeInfoBtn').addEventListener('click', () => {
    const dialog = document.getElementById('aiInfoDialog');
    dialog.classList.remove('visible');
  });
  
  document.getElementById('infoOkBtn').addEventListener('click', () => {
    const dialog = document.getElementById('aiInfoDialog');
    dialog.classList.remove('visible');
  });
  
  document.getElementById('aiInfoDialog').addEventListener('click', (e) => {
    if (e.target.id === 'aiInfoDialog') {
      const dialog = document.getElementById('aiInfoDialog');
      dialog.classList.remove('visible');
    }
  });
  
  document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    const dialog = document.getElementById('confirmDialog');
    dialog.classList.remove('visible');
  });
  
  document.getElementById('confirmOkBtn').addEventListener('click', () => {
    const dialog = document.getElementById('confirmDialog');
    dialog.classList.remove('visible');
    performClearAllMessages();
  });
  
  document.getElementById('confirmDialog').addEventListener('click', (e) => {
    if (e.target.id === 'confirmDialog') {
      const dialog = document.getElementById('confirmDialog');
      dialog.classList.remove('visible');
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.location-input-wrapper')) {
      hideSuggestions();
    }
  });
}

function handleCityInput() {
  const cityInput = document.getElementById('cityInput');
  const value = cityInput.value.trim();
  
  if (value.length === 0) {
    hideSuggestions();
    return;
  }
  
  const filtered = CITY_LIST.filter(city => 
    city.includes(value) || city.replace('臺', '台').includes(value.replace('臺', '台'))
  );
  
  if (filtered.length > 0) {
    showSuggestions(filtered);
  } else {
    hideSuggestions();
  }
}

function showSuggestions(cities) {
  const suggestions = document.getElementById('citySuggestions');
  suggestions.innerHTML = '';
  
  cities.slice(0, 5).forEach(city => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = city;
    item.addEventListener('click', () => {
      document.getElementById('cityInput').value = city;
      hideSuggestions();
      handleCitySearch();
    });
    suggestions.appendChild(item);
  });
  
  suggestions.style.display = 'block';
}

function hideSuggestions() {
  const suggestions = document.getElementById('citySuggestions');
  suggestions.style.display = 'none';
}

async function handleCitySearch() {
  const cityInput = document.getElementById('cityInput');
  const cityName = cityInput.value.trim();

  if (!cityName) {
    showError('請輸入縣市名稱');
    return;
  }
  
  hideSuggestions();

  const weatherInfo = document.getElementById('weatherInfo');
  weatherInfo.innerHTML = '<div class="loading">載入中...</div>';

  try {
    const [weather, forecast, warnings, sunrise] = await Promise.allSettled([
      fetchWeatherByCity(cityName),
      fetchForecastByCity(cityName),
      fetchWarnings(),
      fetchSunriseByCity(cityName)
    ]);
    
    const weatherData = weather.status === 'fulfilled' ? weather.value : null;
    const forecastData = forecast.status === 'fulfilled' ? forecast.value : null;
    const warningsData = warnings.status === 'fulfilled' ? warnings.value : null;
    const sunriseData = sunrise.status === 'fulfilled' ? sunrise.value : null;
    
    currentWeatherData = weatherData;
    displayWeather(weatherData, forecastData, warningsData, sunriseData);
  } catch (error) {
    showError('無法取得天氣資料：' + error.message);
  }
}


async function fetchWeatherByCity(cityName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/city?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (!response.ok && !data.location) {
      throw new Error(data.error || 'API 請求失敗');
    }
    
    return data;
  } catch (error) {
    console.error('取得天氣資料錯誤:', error);
    throw error;
  }
}

async function fetchForecastByCity(cityName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/forecast?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
    
    if (data.error) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('取得天氣預報錯誤:', error);
    return null;
  }
}

async function fetchWarnings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/warnings`);
    const data = await response.json();
    
    if (data.error) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('取得天氣警特報錯誤:', error);
    return null;
  }
}

async function fetchSunriseByCity(cityName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/sunrise?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
    
    if (data.error) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('取得日出日落錯誤:', error);
    return null;
  }
}

function displayWeather(data, forecastData, warningsData, sunriseData) {
  const weatherInfo = document.getElementById('weatherInfo');
  
  if (!data) {
    showError('無法取得天氣資料');
    return;
  }
  
  if (data.error) {
    showError(data.error);
    return;
  }
  
  console.log('顯示天氣資料:', data, forecastData, warningsData, sunriseData);

  let tempDisplay = '--';
  if (data.temperature) {
    tempDisplay = data.temperature;
  } else if (data.minTemp && data.maxTemp) {
    tempDisplay = `${data.minTemp}~${data.maxTemp}`;
  } else if (data.minTemp) {
    tempDisplay = data.minTemp;
  } else if (data.maxTemp) {
    tempDisplay = data.maxTemp;
  }

  const detailItems = [];
  
  if (data.precipitation !== null && data.precipitation !== undefined && data.precipitation !== '--') {
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">water_drop</span>
        <span>降雨機率<br>${formatValue(data.precipitation, '%')}</span>
      </div>
    `);
  }
  
  if (data.humidity !== null && data.humidity !== undefined && data.humidity !== '--') {
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">air</span>
        <span>濕度<br>${formatValue(data.humidity, '%')}</span>
      </div>
    `);
  }
  
  if (data.windSpeed !== null && data.windSpeed !== undefined && data.windSpeed !== '--') {
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">speed</span>
        <span>風速<br>${formatValue(data.windSpeed, ' m/s')}</span>
      </div>
    `);
  }
  
  if (data.comfortIndex !== null && data.comfortIndex !== undefined && data.comfortIndex !== '--') {
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">sentiment_satisfied</span>
        <span>舒適度<br>${formatValue(data.comfortIndex, '')}</span>
      </div>
    `);
  }

  if (sunriseData && (sunriseData.sunrise || sunriseData.sunset)) {
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">wb_twilight</span>
        <span>日出<br>${sunriseData.sunrise || '--'}</span>
      </div>
    `);
    detailItems.push(`
      <div class="weather-detail-item">
        <span class="material-icons">nightlight</span>
        <span>日落<br>${sunriseData.sunset || '--'}</span>
      </div>
    `);
  }
  
  if (detailItems.length === 0) {
    detailItems.push(`
      <div class="weather-detail-item" style="grid-column: 1 / -1; text-align: center; color: #8a9ba8;">
        <span>目前僅提供溫度與降雨機率資訊</span>
      </div>
    `);
  }

  let warningsHtml = '';
  if (warningsData && warningsData.warnings && warningsData.warnings.length > 0) {
    const relevantWarnings = warningsData.warnings.filter(w => 
      w.location && data.location && w.location.includes(data.location.replace('市', '').replace('縣', ''))
    );
    
    if (relevantWarnings.length > 0) {
      warningsHtml = `
        <div class="weather-warnings">
          <div class="warnings-header">
            <span class="material-icons">warning</span>
            <span>天氣警特報</span>
          </div>
          <div class="warnings-list">
            ${relevantWarnings.slice(0, 3).map(w => `
              <div class="warning-item">
                <span class="warning-type">${w.hazardType || '天氣特報'}</span>
                <span class="warning-level">${w.hazardLevel || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  let forecastHtml = '';
  if (forecastData && forecastData.forecast && forecastData.forecast.length > 0) {
    const weekDays = ['今天', '明天', '後天', '週四', '週五', '週六', '週日'];
    forecastHtml = `
      <div class="weather-forecast">
        <div class="forecast-header">
          <span class="material-icons">calendar_today</span>
          <span>一週預報</span>
        </div>
        <div class="forecast-list">
          ${forecastData.forecast.slice(0, 7).map((day, index) => {
            const dayName = weekDays[index] || `第${index + 1}天`;
            const tempRange = day.minTemp && day.maxTemp ? `${day.minTemp}~${day.maxTemp}°C` : 
                            day.minTemp ? `${day.minTemp}°C` : 
                            day.maxTemp ? `${day.maxTemp}°C` : '--';
            return `
              <div class="forecast-item">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-weather">${day.weather || '--'}</div>
                <div class="forecast-temp">${tempRange}</div>
                ${day.precipitation ? `<div class="forecast-pop">降雨 ${day.precipitation}%</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  const html = `
    <div class="weather-card">
      <div class="weather-location">${data.location || '未知位置'}</div>
      <div class="weather-main">
        <div>
          <div class="weather-temp">${tempDisplay}°C</div>
          <div class="weather-desc">${data.description || '無資料'}</div>
        </div>
      </div>
      <div class="weather-details">
        ${detailItems.join('')}
      </div>
      ${warningsHtml}
      ${forecastHtml}
    </div>
  `;
  
  weatherInfo.innerHTML = html;
}

function showError(message) {
  const weatherInfo = document.getElementById('weatherInfo');
  weatherInfo.innerHTML = `<div class="error">${message}</div>`;
}

async function handleSendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();

  if (!message) return;

  if (!currentWeatherData) {
    showChatError('請先載入天氣資料');
    return;
  }

  addChatMessage('user', message);
  chatInput.value = '';
  
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  
  const loadingMessageId = addLoadingMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        weatherData: currentWeatherData
      })
    });

    const data = await response.json();
    
    removeLoadingMessage(loadingMessageId);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (!response.ok && !data.response) {
      throw new Error(data.error || 'AI 請求失敗');
    }

    const cleanResponse = cleanText(data.response || '無法取得回應');
    const formattedResponse = formatAIResponse(cleanResponse);
    addChatMessage('ai', formattedResponse);
    saveChatHistory();
  } catch (error) {
    console.error('AI 請求錯誤:', error);
    removeLoadingMessage(loadingMessageId);
    addChatMessage('ai', '抱歉，我暫時無法回應。請稍後再試。');
  } finally {
    sendBtn.disabled = false;
  }
}

function addChatMessage(role, content) {
  const chatMessages = document.getElementById('chatMessages');
  
  const row = document.createElement('div');
  row.className = `message-row ${role}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const messageId = Date.now() + Math.random();
  messageDiv.setAttribute('data-message-id', messageId);
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  row.appendChild(messageDiv);
  chatMessages.appendChild(row);
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  saveChatHistory();
}

function clearAllMessages() {
  const dialog = document.getElementById('confirmDialog');
  dialog.classList.add('visible');
}

function performClearAllMessages() {
  const chatMessages = document.getElementById('chatMessages');
  
  chrome.storage.local.remove(['chatHistory'], () => {
    console.log('聊天記錄已清除');
  });
  
  const rows = chatMessages.querySelectorAll('.message-row');
  
  if (rows.length === 0) {
    return;
  }
  
  rows.forEach((row, index) => {
    setTimeout(() => {
      row.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => {
        row.remove();
      }, 200);
    }, index * 50);
  });
  
  setTimeout(() => {
    const remainingRows = chatMessages.querySelectorAll('.message-row');
    if (remainingRows.length > 0) {
      remainingRows.forEach(row => row.remove());
    }
  }, rows.length * 50 + 500);
}

function showChatError(message) {
  addChatMessage('ai', message);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

function formatValue(value, unit = '') {
  if (value === null || value === undefined || value === '' || value === '--' || value === 'null' || value === 'undefined' || value === 'NaN') {
    return '--';
  }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return value + unit;
  }
  return numValue.toFixed(1) + unit;
}

function formatAIResponse(text) {
  if (!text) return '';
  
  let formatted = text;
  
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  formatted = formatted.replace(/([。！？])\s*([^\n])/g, '$1\n$2');
  
  return formatted.trim();
}

function addLoadingMessage() {
  const chatMessages = document.getElementById('chatMessages');
  
  const row = document.createElement('div');
  row.className = 'message-row ai';
  
  const loadingDiv = document.createElement('div');
  const loadingId = 'loading-' + Date.now();
  loadingDiv.id = loadingId;
  loadingDiv.className = 'message ai loading-message';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  
  contentDiv.appendChild(typingIndicator);
  loadingDiv.appendChild(contentDiv);
  row.appendChild(loadingDiv);
  chatMessages.appendChild(row);
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return loadingId;
}

function removeLoadingMessage(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  if (loadingDiv) {
    const row = loadingDiv.closest('.message-row');
    if (row) {
      row.remove();
    } else {
      loadingDiv.remove();
    }
  }
}

function saveChatHistory() {
  const chatMessages = document.getElementById('chatMessages');
  const messages = Array.from(chatMessages.querySelectorAll('.message-row')).map(row => {
    const msg = row.querySelector('.message');
    return {
      role: row.classList.contains('user') ? 'user' : 'ai',
      content: msg.querySelector('.message-content').textContent,
      id: msg.getAttribute('data-message-id')
    };
  });
  
  chrome.storage.local.set({ chatHistory: messages });
}

function loadChatHistory() {
  chrome.storage.local.get(['chatHistory'], (result) => {
    if (result.chatHistory) {
      const chatMessages = document.getElementById('chatMessages');
      chatMessages.innerHTML = '';
      result.chatHistory.forEach(msg => {
        const row = document.createElement('div');
        row.className = `message-row ${msg.role}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role}`;
        const messageId = msg.id || Date.now() + Math.random();
        messageDiv.setAttribute('data-message-id', messageId);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = msg.content;
        
        messageDiv.appendChild(contentDiv);
        row.appendChild(messageDiv);
        chatMessages.appendChild(row);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
}

