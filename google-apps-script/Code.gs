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
 * 5. Click 'Deploy' -> 'New deployment'.
 *    - Select type: 'Web app'
 *    - Description: 'VELORA Clothing API v1'
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone' (IMPORTANT!)
 * 6. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 7. Paste that URL into your React project's .env file:
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
