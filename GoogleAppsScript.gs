/**
 * EICHER CUSTOMER PREFERENCE STUDY - GOOGLE SHEETS BACKEND (V5 - UNIFIED ATTRIBUTES)
 *
 * HOW TO UPDATE:
 * 1. Open your Google Sheet > Extensions > Apps Script.
 * 2. Delete ALL the old code and paste THIS ENTIRE NEW CODE.
 * 3. Click the Save icon (Ctrl+S).
 * 4. Click Deploy > Manage deployments.
 * 5. Click the Edit (pencil) icon next to your active deployment.
 * 6. Under "Version", select "New version" and click Deploy.
 *
 * IMPORTANT: Run setupFreshSheets() once to recreate sheets with correct headers.
 */

// ─── 15 UNIFIED ATTRIBUTE KEYS (shared across both forms) ────────────────────
// These must EXACTLY match the keys used in the React form ratings objects.
var UNIFIED_ATTR_KEYS = [
  "Fuel Mileage",
  "Engine Power",
  "Load Capacity",
  "Reliability",
  "Durability",
  "Service Network",
  "Service TAT",
  "Spare Parts",
  "Resale Value",
  "Purchase Price",
  "Finance/Loan",
  "Cabin Comfort",
  "Brand Trust",
  "Tyre & Brake Life",
  "Body/Chassis"
];

// ─── BUILD RATING HEADERS FROM UNIFIED KEYS ─────────────────────────────────
// Generates 30 columns: 15 Importance + 15 Score
function buildRatingHeaders() {
  return UNIFIED_ATTR_KEYS.map(function(k) { return k + " – Importance"; });
}

// ─── EXPLICIT COLUMN HEADERS FOR TELEPHONIC SHEET ────────────────────────────
var TELEPHONIC_HEADERS = [
  "Timestamp",
  "Interviewer",
  "Customer Name",
  "Phone No",
  "Brand",
  "Model",
  "Competition Model",
  "Reason of Loss (Data)",
  "Actual Reason of Loss",
  "Role",
  "Years Running Brand",
  "Purchase Reason",
  "Switched Brand?",
  "Switch Reason",
  "Breakdowns (1yr)",
  "Decision Maker"
].concat(buildRatingHeaders()).concat([
  "Quote / Note"
]);

// ─── EXPLICIT COLUMN HEADERS FOR IN-PERSON SHEET ─────────────────────────────
var IN_PERSON_HEADERS = [
  "Timestamp",
  "Interviewer",
  "Date",
  "Time",
  "Interviewer Name",
  "Respondent Code",
  "Brand",
  "Model",
  "Competition Model",
  "Reason of Loss (Data)",
  "Actual Reason of Loss",
  "Role",
  "Trucks Owned",
  "Years with Brand",
  "Previous Brand",
  "Truck Age (yrs)",
  "Route Type",
  "Goods Carried",
  "Avg KM/Month",
  "Purchase Trigger",
  "Switched Brand?",
  "Switch Reason",
  "Breakdowns (1yr)",
  "Part Most Broken",
  "Decision Maker",
  "Decision Focus"
].concat(buildRatingHeaders()).concat([
  "Verbatim Quote",
  "Interviewer Note"
]);

// ─── MAIN ROUTER ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    if (action === "getData") return handleGetData();
    if (action === "submit")  return handleSubmit(payload);
    if (action === "delete")  return handleDelete(payload);
    return jsonOut({ error: "Unknown action: " + action });
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}

// ─── SUBMIT ──────────────────────────────────────────────────────────────────
function handleSubmit(payload) {
  const type = payload.type;
  const data = payload.data;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(type);
  if (!sheet) return jsonOut({ error: "Sheet not found: " + type });

  const isNew = sheet.getLastRow() === 0;

  if (type === "telephonic") {
    // Write headers if first time
    if (isNew) writeHeaders(sheet, TELEPHONIC_HEADERS, "#1e40af");

    const ratings = data.ratings || {};
    const row = [
      new Date(),
      data.interviewer || "",
      data.customerName || "",
      data.phoneNo || "",
      data.brand || "",
      data.model || "",
      data.competitionModel || "",
      data.reasonOfLossData || "",
      data.actualReasonOfLoss || "",
      data.role || "",
      data.yearsRunning || "",
      data.purchaseReason || "",
      data.switchedBrand || "",
      data.switchReason || "",
      data.breakdowns || "",
      data.decisionMaker || ""
    ];
    // All 15 Importance ratings (telephonic only fills 5, rest will be "")
    UNIFIED_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "importance")));
    row.push(data.quote || "");
    sheet.appendRow(row);

  } else if (type === "in-person") {
    if (isNew) writeHeaders(sheet, IN_PERSON_HEADERS, "#6b21a8");

    const ratings = data.ratings || {};
    const row = [
      new Date(),
      data.interviewer || "",
      data.date || "",
      data.time || "",
      data.interviewerName || "",
      data.respondentCode || "",
      data.brand || "",
      data.model || "",
      data.competitionModel || "",
      data.reasonOfLossData || "",
      data.actualReasonOfLoss || "",
      data.role || "",
      data.trucksOwned || "",
      data.yearsWithBrand || "",
      data.previousBrand || "",
      data.truckAge || "",
      data.routeType || "",
      data.goodsCarried || "",
      data.avgKm || "",
      data.purchaseTrigger || "",
      data.switchedBrand || "",
      data.switchReason || "",
      data.breakdowns || "",
      data.brokenPart || "",
      data.decisionMaker || "",
      data.decisionFocus || ""
    ];
    // All 15 Importance ratings
    UNIFIED_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "importance")));
    row.push(data.verbatimQuote || "");
    row.push(data.interviewerNote || "");
    sheet.appendRow(row);
  }

  // Auto-resize ALL columns to fit content
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  // Freeze header row
  sheet.setFrozenRows(1);

  return jsonOut({ status: "success" });
}

// ─── GET DATA ─────────────────────────────────────────────────────────────────
function handleGetData() {
  // Automatically heal and migrate schemas if mismatched
  migrateSheetSchema("telephonic", TELEPHONIC_HEADERS);
  migrateSheetSchema("in-person", IN_PERSON_HEADERS);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const telephonicData = getSheetData(ss.getSheetByName("telephonic"), TELEPHONIC_HEADERS);
  const inPersonData   = getSheetData(ss.getSheetByName("in-person"),  IN_PERSON_HEADERS);
  return jsonOut({ telephonic: telephonicData, inPerson: inPersonData });
}

// ─── AUTO-HEALING MIGRATION HELPER ───────────────────────────────────────────
function migrateSheetSchema(sheetName, targetHeaders) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) {
    sheet.clear();
    writeHeaders(sheet, targetHeaders, sheetName === "telephonic" ? "#1e40af" : "#6b21a8");
    return;
  }
  
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Check if currentHeaders matches targetHeaders exactly
  let matches = currentHeaders.length === targetHeaders.length;
  if (matches) {
    for (let i = 0; i < targetHeaders.length; i++) {
      if (currentHeaders[i] !== targetHeaders[i]) {
        matches = false;
        break;
      }
    }
  }
  
  if (matches) {
    return; // Already matches!
  }
  
  // Safe migration of existing data to match target headers
  const dataValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const oldHeaders = dataValues[0];
  
  const oldRows = [];
  for (let i = 1; i < dataValues.length; i++) {
    let rowObj = {};
    for (let j = 0; j < oldHeaders.length; j++) {
      rowObj[oldHeaders[j]] = dataValues[i][j];
    }
    oldRows.push(rowObj);
  }
  
  sheet.clear();
  writeHeaders(sheet, targetHeaders, sheetName === "telephonic" ? "#1e40af" : "#6b21a8");
  
  const newRows = oldRows.map(rowObj => {
    return targetHeaders.map(header => {
      if (rowObj[header] !== undefined) {
        return rowObj[header];
      }
      
      // Fallback: old Engine -> new Engine Power
      if (header === "Engine Power – Importance" && rowObj["Engine – Importance"] !== undefined) {
        return rowObj["Engine – Importance"];
      }
      
      // Fallback: misplaced Quote / Note
      if (header === "Quote / Note") {
        // If there was a key that looks like a quote (e.g. not a rating and not empty)
        const keys = Object.keys(rowObj);
        const lastKey = keys[keys.length - 1];
        if (lastKey && lastKey.indexOf("Importance") === -1 && lastKey.indexOf("Score") === -1 && lastKey !== "_rowIndex") {
          return rowObj[lastKey];
        }
      }
      
      return "";
    });
  });
  
  if (newRows.length > 0) {
    sheet.getRange(2, 1, newRows.length, targetHeaders.length).setValues(newRows);
  }
  
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  sheet.setFrozenRows(1);
}

// ─── DELETE ROW ───────────────────────────────────────────────────────────────
function handleDelete(payload) {
  const type = payload.type;
  const rowIndex = parseInt(payload.rowIndex, 10);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(type);
  if (!sheet) return jsonOut({ error: "Sheet not found" });
  if (rowIndex > 1 && rowIndex <= sheet.getLastRow()) {
    sheet.deleteRow(rowIndex);
    return jsonOut({ status: "success" });
  }
  return jsonOut({ error: "Invalid row index: " + rowIndex });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function writeHeaders(sheet, headers, bgColor) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight("bold");
  range.setFontColor("#ffffff");
  range.setBackground(bgColor);
  range.setHorizontalAlignment("center");
  range.setWrap(false);
}

function getRating(ratings, attrKey, field) {
  if (ratings[attrKey] && ratings[attrKey][field] !== undefined) {
    return ratings[attrKey][field];
  }
  return "";
}

function getSheetData(sheet, headers) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const sheetHeaders = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    let obj = { _rowIndex: i + 1 };
    for (let j = 0; j < sheetHeaders.length; j++) {
      obj[sheetHeaders[j]] = data[i][j];
    }
    results.push(obj);
  }
  return results;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * RUN THIS ONCE in the Apps Script editor if your sheet columns are mismatched!
 * This will delete the old sheets and create fresh ones with the correct headers.
 * WARNING: This will clear all existing entries.
 */
function setupFreshSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Recreate 'telephonic' sheet
  let telephonicSheet = ss.getSheetByName("telephonic");
  if (telephonicSheet) {
    ss.deleteSheet(telephonicSheet);
  }
  telephonicSheet = ss.insertSheet("telephonic");
  writeHeaders(telephonicSheet, TELEPHONIC_HEADERS, "#1e40af");
  telephonicSheet.autoResizeColumns(1, telephonicSheet.getLastColumn());
  telephonicSheet.setFrozenRows(1);
  
  // Recreate 'in-person' sheet
  let inPersonSheet = ss.getSheetByName("in-person");
  if (inPersonSheet) {
    ss.deleteSheet(inPersonSheet);
  }
  inPersonSheet = ss.insertSheet("in-person");
  writeHeaders(inPersonSheet, IN_PERSON_HEADERS, "#6b21a8");
  inPersonSheet.autoResizeColumns(1, inPersonSheet.getLastColumn());
  inPersonSheet.setFrozenRows(1);
  
  Logger.log("Sheets successfully recreated with correct new headers!");
}
