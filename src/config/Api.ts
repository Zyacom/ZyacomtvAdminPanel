import axios, { AxiosResponse } from "axios";
import { BACKEND_API_ENDPOINT, TOKEN_KEYWORD, xApiKey } from "./config";

type RequestParams = { [key: string]: any };
type RequestBody = { [key: string]: any };
type RequestHeaders = { [key: string]: string };

export function handleInvalidTokenOrSession() {
  console.log("🚨 handleInvalidTokenOrSession called");
  localStorage.removeItem("token");
  localStorage.removeItem("adminUser");
  sessionStorage.removeItem("token");
  window.location.href = "/login";
}

axios.interceptors.response.use(
  (response) => {
    console.log("Axios response interceptor - success:", response.status);
    return response;
  },
  (error) => {
    console.log("Axios response interceptor - error:", error.response?.status);

    if (error.response && error.response.status === 401) {
      console.log("🚨 401 Unauthorized detected, logging out admin...");
      handleInvalidTokenOrSession();
      return Promise.reject(new Error("Session expired - admin logged out"));
    }

    return Promise.reject(error);
  },
);

console.log("✅ Axios interceptor initialized successfully");

export async function makeGetRequest(
  url: string,
  accessToken?: string,
  params?: RequestParams,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API GET request to: ${fullUrl}`);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "x-api-key": xApiKey,
  };

  if (token) {
    headers["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.get(fullUrl, {
      headers,
      params,
    });
    console.log(`API GET request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API GET request failed: ${fullUrl}`, error);
    throw error;
  }
}

export async function makePostRequest(
  url: string,
  body: RequestBody,
  accessToken?: string,
  headers?: RequestHeaders,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API POST request to: ${fullUrl}`, body);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const requestHeaders: { [key: string]: string } = {
    "Content-Type": "application/json",
    "x-api-key": xApiKey,
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.post(fullUrl, body, {
      headers: requestHeaders,
    });
    console.log(`API POST request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API POST request failed: ${fullUrl}`, error);
    throw error;
  }
}

export async function makePutRequest(
  url: string,
  body: RequestBody,
  accessToken?: string,
  headers?: RequestHeaders,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API PUT request to: ${fullUrl}`, body);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const requestHeaders: { [key: string]: string } = {
    "Content-Type": "application/json",
    "x-api-key": xApiKey,
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.put(fullUrl, body, {
      headers: requestHeaders,
    });
    console.log(`API PUT request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API PUT request failed: ${fullUrl}`, error);
    throw error;
  }
}

export async function makePatchRequest(
  url: string,
  body: RequestBody,
  accessToken?: string,
  headers?: RequestHeaders,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API PATCH request to: ${fullUrl}`, body);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const requestHeaders: { [key: string]: string } = {
    "Content-Type": "application/json",
    "x-api-key": xApiKey,
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.patch(fullUrl, body, {
      headers: requestHeaders,
    });
    console.log(`API PATCH request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API PATCH request failed: ${fullUrl}`, error);
    throw error;
  }
}

export async function makeDeleteRequest(
  url: string,
  accessToken?: string,
  params?: RequestParams,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API DELETE request to: ${fullUrl}`);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "x-api-key": xApiKey,
  };

  if (token) {
    headers["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.delete(fullUrl, {
      headers,
      params,
    });
    console.log(`API DELETE request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API DELETE request failed: ${fullUrl}`, error);
    throw error;
  }
}

export async function makeFormDataRequest(
  url: string,
  formData: FormData,
  accessToken?: string,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<AxiosResponse<any>> {
  const fullUrl = `${BACKEND_API_ENDPOINT}${url}`;
  console.log(`Making API FormData request to: ${fullUrl}`);

  const token =
    accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const headers: { [key: string]: string } = {
    "Content-Type": "multipart/form-data",
    "x-api-key": xApiKey,
  };

  if (token) {
    headers["Authorization"] = `${TOKEN_KEYWORD} ${token}`;
  }

  try {
    const response = await axios.post(fullUrl, formData, {
      headers,
      onUploadProgress,
    });
    console.log(`API FormData request successful: ${fullUrl}`, response.data);
    return response;
  } catch (error) {
    console.error(`API FormData request failed: ${fullUrl}`, error);
    throw error;
  }
}
