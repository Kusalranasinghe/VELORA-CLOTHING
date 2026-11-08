# VELORA CLOTHING - Google Sheets & Apps Script Setup Guide

## English Guide

Follow these simple steps to link your Google Sheet with your VELORA CLOTHING store:

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com) and create a blank spreadsheet.
   - Name it: `VELORA CLOTHING DB`.

2. **Open Google Apps Script**:
   - In the spreadsheet menu, click **Extensions** -> **Apps Script**.
   - Rename the project to `VELORA CLOTHING API`.
   - Delete all default code in `Code.gs`.
   - Copy the entire code from [`Code.gs`](file:///c:/myprojects/VELORA%20CLOTHING/google-apps-script/Code.gs) and paste it into the editor.
   - Press `Ctrl + S` to save.

3. **Initialize the Sheets**:
   - In the Apps Script toolbar, find the function dropdown (where it says `doGet` or `myFunction`).
   - Select `setupSheets` and click **Run**.
   - Review permissions -> Click your Google account -> Click **Advanced** -> Click **Go to VELORA CLOTHING API (unsafe)** -> Click **Allow**.
   - Check your Google Spreadsheet: you will see `Products`, `Categories`, and `Settings` sheets automatically created with proper column headers!

4. **Deploy as Web App**:
   - At the top right of Apps Script, click **Deploy** -> **New deployment**.
   - Click the gear icon (Select type) -> Choose **Web app**.
   - Description: `VELORA API v1`
   - Execute as: **Me (your-email@gmail.com)**
   - Who has access: **Anyone** *(Important: Must be 'Anyone' so the website can read/write without OAuth popup)*.
   - Click **Deploy**.
   - Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

5. **Connect to React App**:
   - In the root folder of your project, create or open `.env`.
   - Add:
     ```env
     VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
     ```
   - You can also paste this URL directly in the **Admin Dashboard -> Settings** tab of your website!

---

## සිංහලෙන් උපදෙස් (Sinhala Guide)

1. **Google Sheet එකක් සෑදීම**:
   - [Google Sheets](https://sheets.google.com) වෙත ගොස් නව හිස් Sheet එකක් සාදා ගන්න (`VELORA CLOTHING DB` ලෙස නම් කරන්න).

2. **Apps Script එකට Code එක දැමීම**:
   - උඩ Menu එකේ **Extensions** -> **Apps Script** මත ක්ලික් කරන්න.
   - එහි ඇති පැරණි කේත මකා දමා, අපගේ `google-apps-script/Code.gs` හි ඇති මුළු කේතයම paste කරන්න.
   - `Ctrl + S` ඔබා Save කරන්න.

3. **Sheets Setup කිරීම**:
   - Apps Script උඩ ඇති Dropdown එකෙන් `setupSheets` තෝරා **Run** ක්ලික් කරන්න.
   - Google Permission ඉල්ලන විට **Advanced** -> **Go to VELORA CLOTHING API** -> **Allow** දෙන්න.
   - දැන් ඔබගේ Google Sheet එකට ගොස් බැලූ විට `Products`, `Categories`, `Settings` tabs ස්වයංක්‍රීයව සෑදී ඇති බව පෙනෙනු ඇත!

4. **Web App එකක් ලෙස Deploy කිරීම**:
   - Apps Script හි දකුණු පස උඩ ඇති **Deploy** -> **New deployment** ක්ලික් කරන්න.
   - Gear (Select type) අයිකනයෙන් **Web app** තෝරන්න.
   - Execute as: **Me** තෝරන්න.
   - Who has access: **Anyone** තෝරන්න (මෙය අනිවාර්යයි).
   - **Deploy** ක්ලික් කර ලැබෙන **Web app URL** එක copy කරගන්න.

5. **Website එකට සම්බන්ධ කිරීම**:
   - එම URL එක ඔබගේ `.env` ගොනුවේ `VITE_APPS_SCRIPT_URL=` ඉදිරියට දමන්න (නැතහොත් Admin Dashboard -> Settings තුලටද paste කළ හැක).
