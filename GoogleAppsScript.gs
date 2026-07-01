/**
 * EICHER CUSTOMER PREFERENCE STUDY - GOOGLE SHEETS BACKEND (V4 - STRUCTURED)
 *
 * HOW TO UPDATE:
 * 1. Open your Google Sheet > Extensions > Apps Script.
 * 2. Delete ALL the old code and paste THIS ENTIRE NEW CODE.
 * 3. Click the Save icon (Ctrl+S).
 * 4. Click Deploy > Manage deployments.
 * 5. Click the Edit (pencil) icon next to your active deployment.
 * 6. Under "Version", select "New version" and click Deploy.
 *
 * IMPORTANT: Also manually delete all old rows (row 1 onwards) from your 
 * 'telephonic' sheet so the new structured headers get created fresh.
 */

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
  "Decision Maker",
  // Ratings – Importance
  "Fuel Mileage – Importance",
  "Engine – Importance",
  "Service Network – Importance",
  "Resale Value – Importance",
  "Finance/Loan – Importance",
  // Ratings – Brand Score
  "Fuel Mileage – Score",
  "Engine – Score",
  "Service Network – Score",
  "Resale Value – Score",
  "Finance/Loan – Score",
  // Quote
  "Quote / Note"
];

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
  "Decision Focus",
  // Ratings – Importance (15 attributes)
  "Fuel Economy – Importance",
  "Engine Power – Importance",
  "Load Capacity – Importance",
  "Reliability – Importance",
  "Durability – Importance",
  "Service Network – Importance",
  "Service TAT – Importance",
  "Spare Parts – Importance",
  "Resale Value – Importance",
  "Purchase Price – Importance",
  "Finance/EMI – Importance",
  "Cabin Comfort – Importance",
  "Brand Trust – Importance",
  "Tyre & Brake Life – Importance",
  "Body/Chassis – Importance",
  // Ratings – Brand Score
  "Fuel Economy – Score",
  "Engine Power – Score",
  "Load Capacity – Score",
  "Reliability – Score",
  "Durability – Score",
  "Service Network – Score",
  "Service TAT – Score",
  "Spare Parts – Score",
  "Resale Value – Score",
  "Purchase Price – Score",
  "Finance/EMI – Score",
  "Cabin Comfort – Score",
  "Brand Trust – Score",
  "Tyre & Brake Life – Score",
  "Body/Chassis – Score",
  // Quotes
  "Verbatim Quote",
  "Interviewer Note"
];

// ─── MAP FORM FIELD KEYS TO COLUMN HEADERS ───────────────────────────────────
var TELEPHONIC_ATTR_KEYS = [
  "Fuel mileage",
  "Engine",
  "Service network",
  "Resale value",
  "Finance / Loan"
];

var IN_PERSON_ATTR_KEYS = [
  "Fuel economy / mileage",
  "Engine power & pickup (loaded)",
  "Load / payload capacity vs claimed",
  "Reliability — frequency of breakdowns",
  "Engine & gearbox durability (long-term)",
  "Service centre network & distance",
  "Service turnaround time (TAT)",
  "Spare parts availability & cost",
  "Resale value after 3-5 years",
  "On-road purchase price",
  "Finance / EMI flexibility & down payment",
  "Driver cabin comfort & space",
  "Brand trust / reputation",
  "Tyre life & brake performance",
  "Body / chassis strength & load durability"
];

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
    // Importance ratings
    TELEPHONIC_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "importance")));
    // Brand scores
    TELEPHONIC_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "score")));
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
    // Importance ratings (15 attrs)
    IN_PERSON_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "importance")));
    // Brand scores
    IN_PERSON_ATTR_KEYS.forEach(attr => row.push(getRating(ratings, attr, "score")));
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const telephonicData = getSheetData(ss.getSheetByName("telephonic"), TELEPHONIC_HEADERS);
  const inPersonData   = getSheetData(ss.getSheetByName("in-person"),  IN_PERSON_HEADERS);
  return jsonOut({ telephonic: telephonicData, inPerson: inPersonData });
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
