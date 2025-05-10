import { api } from "./api";

export const teacherApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllTeachers: builder.query({
            query: () => '/api/teacher',
            providesTags: ['Teacher']
        }),
        getTeacherById: builder.query({
            query: (id) => `/api/teacher/${id}`,
            providesTags: (result, error, id) => [{ type: 'Teacher', id }
            ],
        }),
        createTeacher: builder.mutation({
            query: (newTeacher) => ({
                url: '/api/teacher',
                method: 'POST',
                body: newTeacher,
            }),
            invalidatesTags: [{ type: 'Teacher', id: 'LIST' }],
        }),
        updateTeacher: builder.mutation({
            query: ({ id, ...update }) => ({
                url: `/api/teacher/${id}`,
                method: 'PUT',
                body: update,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }],
        }),
        deleteTeacher: builder.mutation({
            query: (id) => ({
                url: `/api/teacher/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Teacher', id }],
        }),
        signIn: builder.mutation({
            query: (credentials) => ({
                url: '/api/teacher/signin',
                method: 'POST',
                body: credentials,
            }),
            invalidTags: ["Teacher"]
        }),
    }),
});

export const {
    useGetAllTeachersQuery,
    useGetTeacherByIdQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
    useSignInMutation,
} = teacherApi;
