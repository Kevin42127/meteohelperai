const API_BASE_URL = 'https://meteohelperai.vercel.app';

let currentWeatherData = null;

const CITY_LIST = [
  '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
  '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
  '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
  '臺東縣', '澎湖縣', '金門縣', '連江縣'
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
    const weather = await fetchWeatherByCity(cityName);
    currentWeatherData = weather;
    displayWeather(weather);
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

function displayWeather(data) {
  const weatherInfo = document.getElementById('weatherInfo');
  
  if (!data) {
    showError('無法取得天氣資料');
    return;
  }
  
  if (data.error) {
    showError(data.error);
    return;
  }
  
  console.log('顯示天氣資料:', data);

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
  
  if (detailItems.length === 0) {
    detailItems.push(`
      <div class="weather-detail-item" style="grid-column: 1 / -1; text-align: center; color: #8a9ba8;">
        <span>目前僅提供溫度與降雨機率資訊</span>
      </div>
    `);
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

