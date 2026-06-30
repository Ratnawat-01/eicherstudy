// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwaa6JKt10Y3DROHY5Na-0CZMiCA8kBLra5AFiXpr_3A-O5byvnOEbb0MbWqAA85lgx/exec";

// Utility function to make a POST request as text/plain to avoid CORS preflight
const postToGoogle = async (payload) => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    throw new Error("Google Apps Script URL is not configured.");
  }
  
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
    redirect: "follow"
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

export const submitFormData = async (formType, data) => {
  return postToGoogle({
    action: "submit",
    type: formType,
    data: data
  });
};

export const fetchDashboardData = async () => {
  return postToGoogle({
    action: "getData"
  });
};

export const deleteEntry = async (formType, rowIndex) => {
  return postToGoogle({
    action: "delete",
    type: formType,
    rowIndex: rowIndex
  });
};
