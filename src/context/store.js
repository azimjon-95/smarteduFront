import { configureStore } from "@reduxjs/toolkit";
import { groupsApi } from "./groupsApi";
import { studentApi } from "./studentsApi"; // Import the userApi
import { teacherApi } from "./teacherApi"; // Import the userApi

const store = configureStore({
  reducer: {
    [groupsApi.reducerPath]: groupsApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer, // Add  studentApi reducer
    [teacherApi.reducerPath]: teacherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(groupsApi.middleware, studentApi.middleware, teacherApi.middleware), // Add userApi middleware
});

export default store;