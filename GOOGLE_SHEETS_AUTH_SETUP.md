# Google Sheets customer sign-in setup

The storefront uses a Google Apps Script web app to create and check accounts
against a private `Users` sheet. Passwords are never saved as plain text: the
script stores a random salt and a slow, iterated HMAC-SHA256 hash. Customer
profiles, including address, phone, and NIC, are returned only to the signed-in
customer. Keep the spreadsheet private and share it only with trusted operators.

This is a simple, low-volume solution, not a replacement for a dedicated
identity provider. Google Sheets is not designed as an authentication
database, and this setup does not provide email verification or password
recovery. Do not use it for sensitive or regulated information.

## 1. Set up Apps Script

1. Open the VELORA Google Sheet and choose **Extensions → Apps Script**.
2. Replace `Code.gs` with the current contents of `google-apps-script/Code.gs`.
3. Save, select `setupSheets` in the function menu, and run it once. Approve
   the requested spreadsheet and external-request permissions. This creates a
   private `Users` tab as well as the store data tabs.
4. For Google account sign-in, create an OAuth 2.0 **Web application** client ID
   in Google Cloud Console. Add your local and production website origins to
   its authorized JavaScript origins. In Apps Script **Project Settings →
   Script properties**, add `GOOGLE_OAUTH_CLIENT_ID` with that client ID.
   Email/password sign-in works without this optional Google sign-in setup.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to you and
   **Who has access** to **Anyone**. Store reads are public; account and admin
   operations are handled by the script. Deploy again as a new version whenever
   you update the script.

## 2. Connect the website

Copy `.env.example` to `.env`, set the deployed web app URL, and restart Vite:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

`VITE_GOOGLE_CLIENT_ID` is only needed for Google sign-in. If it is configured,
it must match the `GOOGLE_OAUTH_CLIENT_ID` Apps Script property.

## 3. Assign an administrator

Register the intended account first. In the private `Users` tab, set only that
account's `role` cell to `admin`; leave all other accounts as `customer`. The
role is checked on the server for every store-data change. Never allow customers
to edit the spreadsheet or the role column.

The user columns include password salt/hash and private customer details. Do
not rename the columns, publish the sheet, or return the `Users` tab in a public
API response. If access to the spreadsheet or Apps Script project is exposed,
revoke it and rotate the script's `AUTH_SIGNING_SECRET` property.

## සිංහලෙන්

1. Google Sheet එකේ **Extensions → Apps Script** වෙත ගොස්
   `google-apps-script/Code.gs` හි අලුත් code එක දමා save කරන්න.
2. `setupSheets` තෝරා Run කර අවසර දෙන්න. එවිට `Users` ඇතුළු අවශ්‍ය tabs
   සකස් වේ. Sheet එක private ලෙස තබා විශ්වාසදායක අයට පමණක් share කරන්න.
3. **Deploy → New deployment → Web app** තෝරා **Execute as: Me** සහ
   **Who has access: Anyone** ලෙස deploy කරන්න.
4. `.env.example` copy කර `.env` සාදා `VITE_APPS_SCRIPT_URL` එකට deploy කළ
   Apps Script URL එක දමා Vite නැවත start කරන්න.
5. Google login අවශ්‍ය නම් Google Cloud Console හි Web OAuth client එකක් සාදා
   local/production website origins එකතු කරන්න. එම client ID එක `.env` හි
   `VITE_GOOGLE_CLIENT_ID` සහ Apps Script Script Properties හි
   `GOOGLE_OAUTH_CLIENT_ID` ලෙස දෙන්න.
6. Admin account එක register කරලා, private `Users` tab එකේ එම email එකේ
   `role` අගය පමණක් `admin` කරන්න. Password plain text ලෙස save නොවේ; salted
   hash එකක් ලෙස පමණක් තබයි.

මෙය කුඩා පරිමාණ අත්හදා බැලීමක් සඳහා සරල ක්‍රමයක් පමණි. Google Sheets එක
authentication database එකක් ලෙස නිර්මාණය කර නැති අතර email verification හෝ
password recovery මෙහි නැත. NIC සහ address වැනි දත්ත සංවේදී බැවින්, මෙය
production/regulated දත්ත සඳහා භාවිතා නොකරන්න.
