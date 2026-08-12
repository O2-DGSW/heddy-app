import axios from "axios";

// const DEFAULT_API_BASE_URL = "https://api.heddy.site";

// 현재 env가 없기에 잠깐 주석 처리
// const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const api = axios.create({
  // baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
