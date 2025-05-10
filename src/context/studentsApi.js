import { api } from "./api";

export const studentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentStats: builder.query({
      query: () => "/api/studentStats",
      providesTags: ["Student"],
    }),

    getStudent: builder.query({
      query: () => "/api/student/",
      providesTags: ["Student"],
    }),

    createStudent: builder.mutation({
      query: (newStudent) => ({
        url: "/api/student/",
        method: "POST",
        body: newStudent,
      }),
      invalidatesTags: ["Student"],
    }),

    changeGroup: builder.mutation({
      query: (newStudent) => ({
        url: "/api/student/change/",
        method: "POST",
        body: newStudent,
      }),
      invalidatesTags: ["Student"],
    }),
    getStudentById: builder.query({
      query: (id) => `/api/student/${id}`,
      providesTags: ["Student"],

    }),
    updateStudent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/student/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Student"],
    }),
    updateStudentsState: builder.mutation({
      query: ({ groupId }) => ({
        url: `/api/student/update-state/${groupId}`,
        method: "PUT"
      }),
      invalidatesTags: ["Student"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/api/student/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Student"],
    }),
    getDebtors: builder.query({
      query: () => "/api/getDebtorStudents",
      providesTags: ["Student"],
    }),
  }),
});

export const {
  useGetStudentQuery,
  useGetDebtorsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentByIdQuery,
  useUpdateStudentsStateMutation,
  useGetStudentStatsQuery,
  useChangeGroupMutation
} = studentApi;
