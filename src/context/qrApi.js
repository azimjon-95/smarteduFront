import { api } from "./api";

export const qrApi = api.injectEndpoints({
    endpoints: (builder) => ({

        //post('/mark-attendance',
        markAttendance: builder.mutation({
            query: (data) => ({
                url: '/api/mark-attendance',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Qr'], // PascalCase for consistency
        }),

    }),
});

export const {
    useMarkAttendanceMutation
} = qrApi;
