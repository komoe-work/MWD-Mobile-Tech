# Google Apps Script Backend (Code.gs)

Follow these instructions to set up your backend for the MobileMart e-commerce site.

## 1. Create a Google Sheet
1. Go to [sheets.new](https://sheets.new) and create a new spreadsheet.
2. Name it "MobileMart Orders".
3. In the first row, create these headers:
   - **Column A:** Date
   - **Column B:** Name
   - **Column C:** Phone
   - **Column D:** Address
   - **Column E:** Items Ordered
   - **Column F:** Total Price

## 2. Open Apps Script
1. In your Google Sheet, go to **Extensions** > **Apps Script**.
2. Delete any existing code and paste the code below.

```javascript
// CONFIGURATION
const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // From the URL of your Google Sheet
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID_HERE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Append to Sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];
    sheet.appendRow([
      data.date, 
      data.name, 
      data.phone, 
      data.address, 
      data.items, 
      data.total
    ]);
    
    // 2. Send Telegram Notification
    const message = `
🚀 *New Order Received!*
------------------------
👤 *Customer:* ${data.name}
📞 *Phone:* ${data.phone}
📍 *Address:* ${data.address}
🛍️ *Items:* ${data.items}
💰 *Total:* $${data.total}
------------------------
📅 *Date:* ${data.date}
    `;
    
    sendTelegram(message);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'Markdown'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

// Handle CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## 3. Deploy as a Web App
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Description: `MobileMart API`.
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. Click **Deploy**.
7. **IMPORTANT:** Copy the "Web App URL". You will need to paste this into your `App.tsx` file (search for `GOOGLE_SCRIPT_URL`).

## 4. Get Telegram Credentials
### Get BOT_TOKEN
1. Open Telegram and search for [@BotFather](https://t.me/botfather).
2. Type `/newbot` and follow instructions.
3. BotFather will provide an API Token (the `BOT_TOKEN`).

### Get CHAT_ID
1. Search for [@userinfobot](https://t.me/userinfobot) on Telegram.
2. Send a message to it.
3. It will reply with your `Id` (this is your `CHAT_ID`).

## 5. Final Step
Go back to your `src/App.tsx` file in this editor and replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you got in Step 3.
