import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiResponseError extends Error {
  code = 400;

  constructor(message: string, code = 400) {
    super(message || "Oops! Something went wrong");
    this.name = "ApiResponseError";
    this.code = code;
  }
}

/**
 * Generate Request URL
 */
const getURL = (
  url: string,
  options?: { baseURL?: string; isMockedURL?: boolean }
) => {
  const baseURL = options?.baseURL ? options.baseURL : API_URL;
  return baseURL + url;
};

/**
 * Refresh the access and refresh tokens, and
 * returns the new access token
 */
export const refreshTokens = async (): Promise<string> => {
  try {
    const token = localStorage.getItem("REFRESH_TOKEN");

    if (!token) throw new ApiResponseError("No refresh token found", 401);

    const headers = new Headers();

    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const response = await fetch(
      getURL("/api/v1/authentication/user/refresh"),
      {
        method: "GET",
        headers
      }
    );

    const res = await response.json();

    if (!response.ok)
      throw new ApiResponseError(res.message || "Something went wrong", 401);

    if (localStorage.getItem("KEEP_ME_LOGGED_IN") === "true") {
      localStorage.setItem("ACCESS_TOKEN", res.access_token);
      return res.access_token;
    }

    localStorage.setItem("ACCESS_TOKEN", res.access_token);

    return res.access_token as string;
  } catch {
    throw new ApiResponseError("Login session expired", 401);
  }
};

export type ITokenDetails = {
  email: string;
  exp: number;
  iat: number;
  sub: string;
  tokenType: "access" | "refresh";
  type: "USER";
};

/**
 * Checks token's validity
 */
export const getToken = async (): Promise<string | null> => {
  let accessToken: string | null | true;

  try {
    accessToken = localStorage.getItem("ACCESS_TOKEN") || null;

    if (typeof accessToken === "boolean") return null;

    if (accessToken === null) return null;
  } catch {
    return null;
  }

  const decodedToken = jwtDecode<ITokenDetails>(accessToken);

  const isExpired = dayjs.unix(decodedToken.exp).diff(dayjs(), "seconds") < 0;

  if (isExpired) {
    return refreshTokens();
  }

  return accessToken;
};

/**
 * Generate HTTP headers
 */
export const getHeader = async (
  additionalHeader: Headers | null | undefined
): Promise<Headers> => {
  const headers = new Headers();
  headers.append("Accept", "application/json");

  if (additionalHeader) {
    additionalHeader.forEach((value: string, key: string) =>
      headers.append(key, value)
    );
  } else {
    headers.append("Content-Type", "application/json");
  }

  let token: string | null;

  try {
    token = await getToken();
  } catch {
    token = null;
  }

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  return headers;
};

/**
 * Generate HTTP body
 */

const getBody = (body?: BodyInit) => {
  if (body instanceof FormData) return body;
  if (body instanceof URLSearchParams) return body;
  return JSON.stringify(body);
};

type ErrorResponse = {
  message?: string;
  code?: string;
};

/**
 * Handle HTTP error
 */
const handleError = (
  httpStatusCode: number,
  response: unknown | ErrorResponse
) => {
  if (httpStatusCode === 401) {
    throw new ApiResponseError(
      "Session expired, please login again",
      httpStatusCode
    );
  }

  if (!/^(2|3)[0-9][0-9]$/.test(String(httpStatusCode))) {
    throw new ApiResponseError(
      (response as ErrorResponse)?.message || "Something went wrong!!",
      httpStatusCode ?? 501
    );
  }
};

export type HTTPOptions = {
  baseURL?: string;
  isMockedURL?: boolean;
  headers?: Headers;
};

/**
 * HTTP GET Request
 */
const fetchGet = async <T extends unknown | ErrorResponse>(
  url: string,
  options?: HTTPOptions
) => {
  const result = await fetch(
    getURL(url, {
      isMockedURL: options?.isMockedURL,
      baseURL: options?.baseURL
    }),
    {
      method: "GET",
      headers: await getHeader(options?.headers)
    }
  );

  const response: T = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP POST Request
 */
const fetchPost = async <T extends unknown | ErrorResponse>(
  url: string,
  body?: unknown,
  options?: HTTPOptions
) => {
  const result = await fetch(
    getURL(url, {
      isMockedURL: options?.isMockedURL,
      baseURL: options?.baseURL
    }),
    {
      method: "POST",
      headers: await getHeader(options?.headers),
      body: getBody(body as BodyInit)
    }
  );

  const response: T = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP PATCH Request
 */
const fetchPatch = async <T extends unknown | ErrorResponse>(
  url: string,
  body?: unknown,
  options?: HTTPOptions
) => {
  const result = await fetch(
    getURL(url, {
      isMockedURL: options?.isMockedURL,
      baseURL: options?.baseURL
    }),
    {
      method: "PATCH",
      headers: await getHeader(options?.headers),
      body: getBody(body as BodyInit)
    }
  );

  const response: T = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP PUT Request
 */
const fetchPut = async <T extends unknown | ErrorResponse>(
  url: string,
  body?: unknown,
  options?: HTTPOptions
) => {
  const result = await fetch(
    getURL(url, {
      isMockedURL: options?.isMockedURL,
      baseURL: options?.baseURL
    }),
    {
      method: "PUT",
      headers: await getHeader(options?.headers),
      body: getBody(body as BodyInit)
    }
  );

  const response: T = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP DELETE Request
 */
const fetchDelete = async <T extends unknown | ErrorResponse>(
  url: string,
  body?: unknown,
  options?: HTTPOptions
) => {
  const result = await fetch(
    getURL(url, {
      isMockedURL: options?.isMockedURL,
      baseURL: options?.baseURL
    }),
    {
      method: "DELETE",
      headers: await getHeader(options?.headers),
      body: getBody(body as BodyInit)
    }
  );

  const response: T = await result.json();
  handleError(result.status, response);
  return response;
};

const http = {
  get: fetchGet,
  post: fetchPost,
  put: fetchPut,
  patch: fetchPatch,
  delete: fetchDelete
};

export default http;
