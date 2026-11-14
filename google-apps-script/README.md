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
   - Check your Google Spreadsheet: `Products`, `Categories`, `Settings`, and a private `Users` sheet will be created.

4. **Optional Google sign-in**:
   - Create a Google OAuth 2.0 Web application client ID in Google Cloud Console and add your local and production website origins.
   - Add a Script Property named `GOOGLE_OAUTH_CLIENT_ID` with that client ID. The web app's `VITE_GOOGLE_CLIENT_ID` must match.

5. **Deploy as Web App**:
   - At the top right of Apps Script, click **Deploy** -> **New deployment**.
   - Click the gear icon (Select type) -> Choose **Web app**.
   - Description: `VELORA API v1`
   - Execute as: **Me (your-email@gmail.com)**
   - Who has access: **Anyone** (store reads are public; authenticated admin writes are checked by Apps Script).
   - Click **Deploy**.
   - Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

6. **Connect to React App**:
   - In the root folder of your project, create or open `.env`.
   - Add:
     ```env
     VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
     ```
   - Add the Apps Script URL to `.env`. Add the Google client ID only if Google sign-in is enabled.

7. **Assign an administrator**:
   - Register the intended account through the storefront.
   - In the private `Users` sheet, set that account's `role` cell to `admin`. Keep all other accounts set to `customer`.

Passwords are stored as salted, iterated HMAC-SHA256 hashes, never as plain text. Keep the spreadsheet private: it contains these hashes plus customer addresses, phone numbers, and NICs. This lightweight setup has no email verification or password recovery and is not recommended for sensitive or regulated production data. See [`GOOGLE_SHEETS_AUTH_SETUP.md`](../GOOGLE_SHEETS_AUTH_SETUP.md) for the full guidance.

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

4. **Google sign-in අවශ්‍ය නම්**:
   - Google Cloud Console හි Google OAuth Web client එකක් සාදා website origins එකතු කරන්න.
   - Apps Script හි **Project Settings** -> **Script properties** වෙත ගොස් එහි client ID එක `GOOGLE_OAUTH_CLIENT_ID` ලෙස එකතු කරන්න.
   - Website `.env` හි එම අගය `VITE_GOOGLE_CLIENT_ID` ලෙස යොදන්න.

5. **Web App එකක් ලෙස Deploy කිරීම**:
   - Apps Script හි දකුණු පස උඩ ඇති **Deploy** -> **New deployment** ක්ලික් කරන්න.
   - Gear (Select type) අයිකනයෙන් **Web app** තෝරන්න.
   - Execute as: **Me** තෝරන්න.
   - Who has access: **Anyone** තෝරන්න (store දත්ත කියවීම public; admin ලිවීම් Apps Script එකෙන් පරීක්ෂා වේ).
   - **Deploy** ක්ලික් කර ලැබෙන **Web app URL** එක copy කරගන්න.

6. **Website එකට සම්බන්ධ කිරීම**:
   - Apps Script URL එක project `.env` ගොනුවට `VITE_APPS_SCRIPT_URL` ලෙස එකතු කර website එක නැවත ආරම්භ කරන්න.
   - Admin account එක register කර, private `Users` tab එකේ එම row එකේ `role` අගය `admin` කරන්න.

Passwords plain text ලෙස තබන්නේ නැත. නමුත් `Users` tab එකේ salted password hashes, address, phone, NIC තිබෙන නිසා Google Sheet එක private ලෙස තබන්න. Email verification/password recovery මෙහි නොමැති බැවින් සංවේදී production දත්ත සඳහා මෙය සුදුසු නැත.
