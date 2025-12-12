# 氣象AI助手

整合中央氣象署天氣資料與 Groq AI 的 Chrome 瀏覽器擴充功能。

## 功能特色

- 手動城市天氣搜尋（支援自動完成）
- AI 天氣相關問答（使用 Groq AI）
- 對話記錄保存
- 現代化扁平設計風格

## 安裝步驟

### 1. 安裝後端服務

```bash
cd server
npm install
npm start
```

後端服務將運行於 `http://localhost:3000`

### 2. 安裝 Chrome 擴充功能

1. 開啟 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案根目錄（包含 `manifest.json` 的資料夾）

### 3. 建立圖示檔案

1. 開啟 `icons/generate-icons.html` 在瀏覽器中
2. 點擊下載按鈕生成三個尺寸的圖示檔案
3. 將下載的圖示檔案放置在 `icons/` 資料夾中

或使用您自己的圖示設計工具建立：
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

### 4. 設定 API 金鑰

**必須設定環境變數才能使用！**

1. 在 `server/` 目錄下建立 `.env` 檔案
2. 編輯 `server/.env` 設定您的 API 金鑰：
   ```
   GROQ_API_KEY=your_groq_api_key_here
   CWA_API_KEY=your_cwa_api_key_here
   ```

   - `GROQ_API_KEY` - Groq API 金鑰（從 https://console.groq.com/ 取得）
   - `CWA_API_KEY` - 中央氣象署 API 金鑰（從 https://opendata.cwa.gov.tw/ 申請）

## 使用說明

1. 點擊瀏覽器工具列的擴充功能圖示
2. 輸入縣市名稱查詢天氣（例如：臺北市、新北市、臺中市）
3. 在 AI 問答區域輸入天氣相關問題，AI 會根據當前天氣資料回答
4. 可點擊刪除按鈕清除所有對話記錄

## 技術架構

- **前端**: Chrome Extension Manifest V3
- **後端**: Node.js + Express
- **天氣API**: 中央氣象署開放資料平台
- **AI服務**: Groq API (openai/gpt-oss-120b)

## 注意事項

- 後端服務必須運行才能使用擴充功能
- API 金鑰必須在 `server/.env` 檔案中設定
- `.env` 檔案已加入 `.gitignore`，不會被推送到版本控制

