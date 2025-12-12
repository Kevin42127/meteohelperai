const express = require('express');
const { Groq } = require('groq-sdk');
const router = express.Router();

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY 環境變數未設定');
  }
  return new Groq({
    apiKey: apiKey
  });
}

router.post('/chat', async (req, res) => {
  try {
    const { message, weatherData } = req.body;

    if (!message) {
      return res.status(400).json({ error: '缺少訊息內容' });
    }

    if (!weatherData) {
      return res.status(400).json({ error: '缺少天氣資料' });
    }

    const weatherContext = `
當前天氣資訊：
- 位置：${weatherData.location || '未知'}
- 溫度：${weatherData.temperature || '--'}°C
- 天氣狀況：${weatherData.description || '未知'}
- 降雨機率：${weatherData.precipitation || '--'}%
- 濕度：${weatherData.humidity || '--'}%
- 風速：${weatherData.windSpeed || '--'} m/s
- 體感溫度：${weatherData.feelsLike || '--'}°C
`;

    const systemPrompt = `你是一個友善的氣象助手，就像朋友一樣自然地聊天。請根據提供的天氣資料，用繁體中文以自然、口語化的方式回答用戶的問題。

重要語言規範：
- 無論用戶使用什麼語言提問（英文、簡體中文、日文等），你必須「只使用繁體中文」回應
- 絕對禁止使用英文、簡體中文、日文或其他任何語言
- 所有回應必須完全使用繁體中文

回答指南：
1. 回答要親切、簡潔，就像在跟朋友聊天一樣
2. 可以適度使用表情符號讓回應更生動（但不要過度使用）
3. 如果回答較長，可以自然地分段，讓內容更容易閱讀
4. 重點資訊可以用簡單的方式強調（例如重複或換行）
5. 不要太正式或機械化，保持輕鬆的語調
6. 如果問題與天氣無關，可以輕鬆地引導用戶回到天氣話題

請使用純文字回答，不要使用任何 Markdown 格式、HTML 標籤或特殊符號。`;

    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `${weatherContext}\n\n用戶問題：${message}`
        }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.8,
      max_completion_tokens: 2000,
      top_p: 0.9,
      stream: false,
      reasoning_effort: 'medium',
      stop: null
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '無法取得AI回應';

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Groq AI API錯誤:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    res.status(500).json({ 
      error: 'AI服務錯誤：' + (error.message || '未知錯誤')
    });
  }
});

module.exports = router;

