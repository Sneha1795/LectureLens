let baseUrl = "http://127.0.0.1:8000";

// Support Webpack / Create React App environment variables
try {
  if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) {
    baseUrl = process.env.REACT_APP_API_URL;
  }
} catch (e) {
  // Ignore reference errors
}

// Support Vite environment variables dynamically to prevent Jest syntax errors (Cannot use 'import.meta' outside a module)
try {
  const getMeta = new Function("return import.meta");
  const meta = getMeta();
  if (meta && meta.env && meta.env.VITE_API_URL) {
    baseUrl = meta.env.VITE_API_URL;
  }
} catch (e) {
  // Ignore reference errors
}

const BASE_URL = baseUrl;

export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  // Clone headers and prepare defaults
  const headers = { ...options.headers };
  
  // Set JSON headers by default if we are passing body, except for FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });

  // Centralize error handling: if response.ok is false, try parsing detail or use fallback
  if (!response.ok) {
    let detail = "Something went wrong.";
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }

  // Handle file/blob downloads vs JSON
  if (endpoint.includes("/export/docx")) {
    return response.blob();
  }

  return response.json();
}
