/**
 * =========================================================================
 * VELORA CLOTHING - Google Apps Script API Backend
 * =========================================================================
 * This script connects your React Frontend with your Google Spreadsheet.
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new spreadsheet named 'VELORA CLOTHING DB').
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any default code, paste this entire file, and click Save (Ctrl + S).
 * 4. Run the 'setupSheets' function once from the dropdown to create headers & demo data.
 * 5. In Project Settings -> Script properties, add GOOGLE_OAUTH_CLIENT_ID if
 *    Google sign-in is enabled. Never put passwords or signing secrets in the sheet.
 * 6. Click 'Deploy' -> 'New deployment'.
 *    - Select type: 'Web app'
 *    - Description: 'VELORA Clothing API v1'
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone' (store reads are public; writes require an admin session)
 * 7. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 8. Paste that URL into your React project's .env file:
 *    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 * =========================================================================
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Products Sheet
  var pSheet = ss.getSheetByName("Products");
  if (!pSheet) {
    pSheet = ss.insertSheet("Products");
  }
  if (pSheet.getLastRow() === 0) {
    pSheet.appendRow([
      "id", "name", "category", "subcategory", "description",
      "originalPrice", "discountPercent", "discountedPrice",
      "sizes", "colors", "stockQuantity", "imageUrl",
      "additionalImages", "isFeatured", "isNewArrival", "isBestSeller", "status"
    ]);
  }

  // 2. Categories Sheet
  var cSheet = ss.getSheetByName("Categories");
  if (!cSheet) {
    cSheet = ss.insertSheet("Categories");
  }
  if (cSheet.getLastRow() === 0) {
    cSheet.appendRow(["id", "name", "slug", "subcategories", "imageUrl", "status"]);
  }

  // 3. Settings Sheet
  var sSheet = ss.getSheetByName("Settings");
  if (!sSheet) {
    sSheet = ss.insertSheet("Settings");
  }
  if (sSheet.getLastRow() === 0) {
    sSheet.appendRow(["key", "value"]);
    sSheet.appendRow(["shopName", "VELORA CLOTHING"]);
    sSheet.appendRow(["whatsappNumber", "94771234567"]);
    sSheet.appendRow(["email", "contact@veloraclothing.com"]);
    sSheet.appendRow(["address", "No. 124, Galle Road, Colombo 03, Sri Lanka"]);
    sSheet.appendRow(["currency", "Rs."]);
    sSheet.appendRow(["heroTitle", "NEW COLLECTION 2026"]);
    sSheet.appendRow(["heroSubtitle", "Discover modern luxury fashion & contemporary styles."]);
    sSheet.appendRow(["deliveryNote", "Islandwide Cash on Delivery & Bank Transfer Available"]);
  }

  var uSheet = ss.getSheetByName("Users");
  if (!uSheet) {
    uSheet = ss.insertSheet("Users");
  }
  if (uSheet.getLastRow() === 0) {
    uSheet.appendRow([
      "id", "email", "name", "address", "phone", "nic", "passwordSalt",
      "passwordHash", "passwordIterations", "role", "authProvider",
      "createdAt", "updatedAt", "failedAttempts", "lockedUntil"
    ]);
  }

  return "Setup completed successfully!";
}

// Handle GET requests
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAllData";
    var result = {};

    if (action === "getAllData") {
      result = {
        products: getProductsData_(),
        categories: getCategoriesData_(),
        settings: getSettingsData_()
      };
    } else if (action === "getProducts") {
      result = { products: getProductsData_() };
    } else if (action === "getCategories") {
      result = { categories: getCategoriesData_() };
    } else if (action === "getSettings") {
      result = { settings: getSettingsData_() };
    } else {
      result = { status: "error", message: "Unknown action: " + action };
    }

    return respondJson_({ status: "success", data: result });
  } catch (err) {
    return respondJson_({ status: "error", message: err.toString() });
  }
}

// Handle POST requests (CRUD actions)
function doPost(e) {
  try {
    var body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = body.action || (e.parameter && e.parameter.action);

    if (action === "registerCustomer") {
      return respondJson_({ status: "success", data: registerCustomer_(body) });
    }
    if (action === "loginCustomer") {
      return respondJson_({ status: "success", data: loginCustomer_(body.email, body.password) });
    }
    if (action === "googleSignIn") {
      return respondJson_({ status: "success", data: googleSignIn_(body.credential) });
    }
    if (action === "getSession") {
      return respondJson_({ status: "success", data: getSession_(body.authToken) });
    }
    if (action === "updateCustomerProfile") {
      return respondJson_({ status: "success", data: updateCustomerProfile_(body.authToken, body.profile) });
    }

    requireAdminSession_(body.authToken);

    var result = {};

    switch (action) {
      // PRODUCT CRUD
      case "addProduct":
        result = addProduct_(body.data);
        break;
      case "updateProduct":
        result = updateProduct_(body.data);
        break;
      case "deleteProduct":
        result = deleteProduct_(body.id);
        break;

      // CATEGORY CRUD
      case "addCategory":
        result = addCategory_(body.data);
        break;
      case "updateCategory":
        result = updateCategory_(body.data);
        break;
      case "deleteCategory":
        result = deleteCategory_(body.id);
        break;

      // SETTINGS
      case "updateSettings":
        result = updateSettings_(body.data);
        break;

      default:
        result = { status: "error", message: "Unsupported POST action: " + action };
    }

    return respondJson_(result);
  } catch (err) {
    return respondJson_({ status: "error", message: err.toString() });
  }
}

var PASSWORD_HASH_ITERATIONS_ = 10000;
var MAX_LOGIN_FAILURES_ = 5;
var LOGIN_LOCKOUT_MILLIS_ = 15 * 60 * 1000;
var SESSION_LIFETIME_SECONDS_ = 12 * 60 * 60;

function registerCustomer_(body) {
  var profile = body.profile || {};
  var email = normalizeEmail_(profile.email);
  var password = String(profile.password || "");
  var name = String(profile.name || "").trim();
  var address = String(profile.address || "").trim();
  var phone = String(profile.phone || "").trim();
  var nic = String(profile.nic || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Choose a password with at least 8 characters.");
  if (password.length > 128) throw new Error("Password must be 128 characters or fewer.");
  if (!name || !address || !phone || !nic) throw new Error("Complete all customer and delivery details.");
  if (name.length > 120 || address.length > 500 || phone.length > 40 || nic.length > 40) {
    throw new Error("One or more customer details are too long.");
  }

  var salt = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  var passwordHash = passwordHash_(password, salt, PASSWORD_HASH_ITERATIONS_);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getUsersSheet_();
    if (findUserRowByEmail_(sheet, email)) throw new Error("An account already exists for this email. Sign in instead.");
    var id = Utilities.getUuid();
    var now = new Date();
    sheet.appendRow([
      id, email, safeSheetText_(name), safeSheetText_(address), safeSheetText_(phone),
      safeSheetText_(nic), salt, passwordHash, PASSWORD_HASH_ITERATIONS_,
      "customer", "password", now, now, 0, ""
    ]);
    return createSession_(readUserById_(sheet, id));
  } finally {
    lock.releaseLock();
  }
}

function loginCustomer_(emailValue, passwordValue) {
  var email = normalizeEmail_(emailValue);
  var password = String(passwordValue || "");
  if (password.length > 128) throw new Error("Email or password is incorrect.");
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getUsersSheet_();
    var match = findUserRowByEmail_(sheet, email);
    if (!match || !match.values[7] || !match.values[6]) {
      throw new Error("Email or password is incorrect.");
    }

    var lockUntil = match.values[14] ? new Date(match.values[14]).getTime() : 0;
    if (lockUntil > Date.now()) throw new Error("Email or password is incorrect. Try again later.");

    var iterations = Math.max(1000, Number(match.values[8]) || PASSWORD_HASH_ITERATIONS_);
    var candidate = passwordHash_(password, String(match.values[6]), iterations);
    if (!constantTimeEquals_(candidate, String(match.values[7]))) {
      var failures = Number(match.values[13]) || 0;
      failures++;
      sheet.getRange(match.row, 14).setValue(failures);
      sheet.getRange(match.row, 15).setValue(
        failures >= MAX_LOGIN_FAILURES_ ? new Date(Date.now() + LOGIN_LOCKOUT_MILLIS_) : ""
      );
      throw new Error("Email or password is incorrect.");
    }

    sheet.getRange(match.row, 14, 1, 2).setValues([[0, ""]]);
    var user = userFromRow_(match.values);
    return createSession_(user);
  } finally {
    lock.releaseLock();
  }
}

function googleSignIn_(credential) {
  var clientId = PropertiesService.getScriptProperties().getProperty("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientId) throw new Error("Google sign-in is not configured. Add GOOGLE_OAUTH_CLIENT_ID in Apps Script properties.");
  if (!credential) throw new Error("Google sign-in did not return a credential.");

  var response = UrlFetchApp.fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(String(credential)),
    { muteHttpExceptions: true }
  );
  if (response.getResponseCode() !== 200) throw new Error("Google could not verify this sign-in. Please try again.");
  var identity = JSON.parse(response.getContentText());
  if (identity.aud !== clientId || String(identity.email_verified) !== "true" || !identity.email) {
    throw new Error("Google could not verify this sign-in. Please try again.");
  }

  var email = normalizeEmail_(identity.email);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getUsersSheet_();
    var match = findUserRowByEmail_(sheet, email);
    if (match) {
      sheet.getRange(match.row, 11).setValue("password,google");
      return createSession_(userFromRow_(match.values));
    }

    var id = Utilities.getUuid();
    var now = new Date();
    var name = String(identity.name || "").trim();
    sheet.appendRow([
      id, email, safeSheetText_(name), "", "", "", "", "", "",
      "customer", "google", now, now, 0, ""
    ]);
    return createSession_(readUserById_(sheet, id));
  } finally {
    lock.releaseLock();
  }
}

function getSession_(authToken) {
  var tokenData = verifySessionToken_(authToken);
  var user = readUserById_(getUsersSheet_(), tokenData.uid);
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return { user: user };
}

function updateCustomerProfile_(authToken, profile) {
  var tokenData = verifySessionToken_(authToken);
  profile = profile || {};
  var name = String(profile.name || "").trim();
  var address = String(profile.address || "").trim();
  var phone = String(profile.phone || "").trim();
  var nic = String(profile.nic || "").trim();
  if (!name || !address || !phone || !nic) throw new Error("Complete all customer and delivery details.");
  if (name.length > 120 || address.length > 500 || phone.length > 40 || nic.length > 40) {
    throw new Error("One or more customer details are too long.");
  }

  var sheet = getUsersSheet_();
  var match = findUserRowById_(sheet, tokenData.uid);
  if (!match) throw new Error("Your session has expired. Please sign in again.");
  sheet.getRange(match.row, 3, 1, 4).setValues([[
    safeSheetText_(name), safeSheetText_(address), safeSheetText_(phone), safeSheetText_(nic)
  ]]);
  sheet.getRange(match.row, 13).setValue(new Date());
  return { user: userFromRow_(match.values, [name, address, phone, nic]) };
}

function requireAdminSession_(authToken) {
  var tokenData = verifySessionToken_(authToken);
  var match = findUserRowById_(getUsersSheet_(), tokenData.uid);
  if (!match || String(match.values[9]).toLowerCase() !== "admin") {
    throw new Error("This account does not have admin access.");
  }
}

function createSession_(user) {
  var now = Math.floor(Date.now() / 1000);
  var payload = { uid: user.id, iat: now, exp: now + SESSION_LIFETIME_SECONDS_ };
  var encodedPayload = base64UrlEncode_(JSON.stringify(payload));
  var unsignedToken = encodedPayload;
  var signature = Utilities.computeHmacSha256Signature(unsignedToken, getAuthSigningSecret_());
  return {
    token: unsignedToken + "." + base64UrlEncode_(signature),
    user: user
  };
}

function verifySessionToken_(authToken) {
  var parts = String(authToken || "").split(".");
  if (parts.length !== 2) throw new Error("Your session has expired. Please sign in again.");
  var expected = base64UrlEncode_(Utilities.computeHmacSha256Signature(parts[0], getAuthSigningSecret_()));
  if (!constantTimeEquals_(expected, parts[1])) throw new Error("Your session has expired. Please sign in again.");

  var payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (error) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!payload.uid || Number(payload.exp) <= Math.floor(Date.now() / 1000)) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  return payload;
}

function getAuthSigningSecret_() {
  var properties = PropertiesService.getScriptProperties();
  var secret = properties.getProperty("AUTH_SIGNING_SECRET");
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    properties.setProperty("AUTH_SIGNING_SECRET", secret);
  }
  return secret;
}

function passwordHash_(password, salt, iterations) {
  var digest = Utilities.computeHmacSha256Signature(salt + ":VELORA-AUTH-V1", password);
  var result = digest.slice();
  for (var i = 1; i < iterations; i++) {
    digest = Utilities.computeHmacSha256Signature(Utilities.base64Encode(digest), password);
    for (var j = 0; j < result.length; j++) {
      var combined = (result[j] ^ digest[j]) & 255;
      result[j] = combined > 127 ? combined - 256 : combined;
    }
  }
  return Utilities.base64Encode(result);
}

function constantTimeEquals_(left, right) {
  if (left.length !== right.length) return false;
  var difference = 0;
  for (var i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

function base64UrlEncode_(value) {
  var encoded = value instanceof Array
    ? Utilities.base64EncodeWebSafe(value)
    : Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8);
  return encoded.replace(/=+$/g, "");
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function getUsersSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  if (!sheet || sheet.getLastRow() === 0) {
    throw new Error("Users sheet is not set up. Run setupSheets in Apps Script first.");
  }
  return sheet;
}

function findUserRowByEmail_(sheet, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var rows = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (normalizeEmail_(rows[i][1]) === email) return { row: i + 2, values: rows[i] };
  }
  return null;
}

function findUserRowById_(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var rows = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) return { row: i + 2, values: rows[i] };
  }
  return null;
}

function readUserById_(sheet, id) {
  var match = findUserRowById_(sheet, id);
  return match ? userFromRow_(match.values) : null;
}

function userFromRow_(row, profileOverride) {
  var profile = profileOverride || [row[2], row[3], row[4], row[5]];
  return {
    id: String(row[0]),
    email: userText_(row[1]),
    name: userText_(profile[0]),
    address: userText_(profile[1]),
    phone: userText_(profile[2]),
    nic: userText_(profile[3]),
    role: String(row[9] || "customer")
  };
}

function userText_(value) {
  var text = String(value || "");
  return /^'[=+\-@]/.test(text) ? text.substring(1) : text;
}

function safeSheetText_(value) {
  var text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

// --- HELPER FUNCTIONS ---

function getProductsData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Products");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var products = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // Skip empty rows
    var item = {};
    for (var h = 0; h < headers.length; h++) {
      item[headers[h]] = row[h];
    }
    // Convert arrays & numbers
    item.originalPrice = Number(item.originalPrice) || 0;
    item.discountPercent = Number(item.discountPercent) || 0;
    item.discountedPrice = Number(item.discountedPrice) || Math.round(item.originalPrice * (1 - item.discountPercent / 100));
    item.stockQuantity = Number(item.stockQuantity) || 0;
    item.sizes = (typeof item.sizes === 'string') ? item.sizes.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : item.sizes;
    item.colors = (typeof item.colors === 'string') ? item.colors.split(',').map(function(c){ return c.trim(); }).filter(Boolean) : item.colors;
    item.isFeatured = String(item.isFeatured).toLowerCase() === 'true';
    item.isNewArrival = String(item.isNewArrival).toLowerCase() === 'true';
    item.isBestSeller = String(item.isBestSeller).toLowerCase() === 'true';
    products.push(item);
  }
  return products;
}

function getCategoriesData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Categories");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var categories = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var item = {};
    for (var h = 0; h < headers.length; h++) {
      item[headers[h]] = row[h];
    }
    item.subcategories = (typeof item.subcategories === 'string') ? item.subcategories.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : item.subcategories;
    categories.push(item);
  }
  return categories;
}

function getSettingsData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[data[i][0]] = data[i][1];
    }
  }
  return settings;
}

function addProduct_(product) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Products");
  if (!sheet) throw new Error("Products sheet not found");

  var id = product.id || ("prod_" + new Date().getTime());
  var sizes = Array.isArray(product.sizes) ? product.sizes.join(",") : (product.sizes || "");
  var colors = Array.isArray(product.colors) ? product.colors.join(",") : (product.colors || "");
  var originalPrice = Number(product.originalPrice) || 0;
  var discountPercent = Number(product.discountPercent) || 0;
  var discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

  sheet.appendRow([
    id,
    product.name || "",
    product.category || "",
    product.subcategory || "",
    product.description || "",
    originalPrice,
    discountPercent,
    discountedPrice,
    sizes,
    colors,
    Number(product.stockQuantity) || 0,
    product.imageUrl || "",
    product.additionalImages || "",
    product.isFeatured ? "true" : "false",
    product.isNewArrival ? "true" : "false",
    product.isBestSeller ? "true" : "false",
    product.status || "active"
  ]);

  return { status: "success", message: "Product added successfully", id: id };
}

function updateProduct_(product) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Products");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(product.id)) {
      var row = i + 1;
      var sizes = Array.isArray(product.sizes) ? product.sizes.join(",") : (product.sizes || "");
      var colors = Array.isArray(product.colors) ? product.colors.join(",") : (product.colors || "");
      var originalPrice = Number(product.originalPrice) || 0;
      var discountPercent = Number(product.discountPercent) || 0;
      var discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

      sheet.getRange(row, 2).setValue(product.name || "");
      sheet.getRange(row, 3).setValue(product.category || "");
      sheet.getRange(row, 4).setValue(product.subcategory || "");
      sheet.getRange(row, 5).setValue(product.description || "");
      sheet.getRange(row, 6).setValue(originalPrice);
      sheet.getRange(row, 7).setValue(discountPercent);
      sheet.getRange(row, 8).setValue(discountedPrice);
      sheet.getRange(row, 9).setValue(sizes);
      sheet.getRange(row, 10).setValue(colors);
      sheet.getRange(row, 11).setValue(Number(product.stockQuantity) || 0);
      sheet.getRange(row, 12).setValue(product.imageUrl || "");
      sheet.getRange(row, 13).setValue(product.additionalImages || "");
      sheet.getRange(row, 14).setValue(product.isFeatured ? "true" : "false");
      sheet.getRange(row, 15).setValue(product.isNewArrival ? "true" : "false");
      sheet.getRange(row, 16).setValue(product.isBestSeller ? "true" : "false");
      sheet.getRange(row, 17).setValue(product.status || "active");

      return { status: "success", message: "Product updated successfully" };
    }
  }
  return { status: "error", message: "Product with ID " + product.id + " not found" };
}

function deleteProduct_(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Products");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Product deleted successfully" };
    }
  }
  return { status: "error", message: "Product not found" };
}

function addCategory_(category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Categories");
  var id = category.id || ("cat_" + new Date().getTime());
  var subcats = Array.isArray(category.subcategories) ? category.subcategories.join(",") : (category.subcategories || "");

  sheet.appendRow([
    id,
    category.name || "",
    category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : ""),
    subcats,
    category.imageUrl || "",
    category.status || "active"
  ]);
  return { status: "success", message: "Category added successfully", id: id };
}

function updateCategory_(category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Categories");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(category.id)) {
      var row = i + 1;
      var subcats = Array.isArray(category.subcategories) ? category.subcategories.join(",") : (category.subcategories || "");
      sheet.getRange(row, 2).setValue(category.name || "");
      sheet.getRange(row, 3).setValue(category.slug || "");
      sheet.getRange(row, 4).setValue(subcats);
      sheet.getRange(row, 5).setValue(category.imageUrl || "");
      sheet.getRange(row, 6).setValue(category.status || "active");
      return { status: "success", message: "Category updated successfully" };
    }
  }
  return { status: "error", message: "Category not found" };
}

function deleteCategory_(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Categories");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Category deleted successfully" };
    }
  }
  return { status: "error", message: "Category not found" };
}

function updateSettings_(newSettings) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  var data = sheet.getDataRange().getValues();
  var existingKeys = {};

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    if (key && newSettings.hasOwnProperty(key)) {
      sheet.getRange(i + 1, 2).setValue(newSettings[key]);
      existingKeys[key] = true;
    }
  }

  // Add keys that didn't exist yet
  for (var k in newSettings) {
    if (newSettings.hasOwnProperty(k) && !existingKeys[k]) {
      sheet.appendRow([k, newSettings[k]]);
    }
  }

  return { status: "success", message: "Settings updated successfully" };
}

function respondJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
