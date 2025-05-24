import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000",
  // baseUrl: "https://smarteduapi.vercel.app",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authentication", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const api = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'messages',
    "Teacher",
    "Student",
    "Balans",
    "Attendances",
    "Payment",
    "Registration",
    "Pdf",
    'expenses'
  ],
  endpoints: () => ({}),
});

