import { api } from "./api";

export const attendancesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllAttendance: builder.query({
            query: () => '/api/attendance', // Barcha guruhlar va ularning davomat/baho ma'lumotlari
            providesTags: ['Registrations'],
        }),
        updateAttendance: builder.mutation({
            query: ({ groupId, data }) => ({
                url: '/api/attendance',
                method: 'POST',
                body: { groupId, data },
            }),
            invalidatesTags: ['Registrations'],
        }),
        // '/attendance/:groupId'
        getAttendanceByGroup: builder.query({
            query: (groupId) => ({
                url: `/api/attendance/${groupId}`, // Guruhga oid davomat/baho ma'lumotlari
                method: 'GET',
            }), // Guruhga oid davomat/baho ma'lumotlari
            providesTags: ['Registrations'],
        }),

        //'/attendance/:groupId/:studentId'
        getAttendanceByGroupAndStudent: builder.query({
            query: ({ groupId, studentId }) => ({
                url: `/api/attendance/${groupId}/${studentId}`, // Guruh va talaba bo'yicha davomat/baho ma'lumotlari
                method: 'GET',
            }),
            providesTags: ['Registrations'],
        }),
    }),
});

export const {
    useGetAllAttendanceQuery,
    useUpdateAttendanceMutation,
    useGetAttendanceByGroupQuery,
    useGetAttendanceByGroupAndStudentQuery
} = attendancesApi;
