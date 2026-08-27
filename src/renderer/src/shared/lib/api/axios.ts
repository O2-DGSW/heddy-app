import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || undefined;

export const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
