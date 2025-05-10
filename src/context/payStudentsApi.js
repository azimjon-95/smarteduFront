import { api } from "./api";

export const payStudentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createPayment: builder.mutation({
            query: (payment) => ({
                url: '/api/payments',
                method: 'POST',
                body: payment,
            }),
            invalidatesTags: ['Payment']
        }),

        processPayments: builder.mutation({
            query: () => ({
                url: '/api/payments/process-payments',
                method: 'POST',

            }),
        }),
        getPayments: builder.query({
            query: () => '/api/payments',
            providesTags: ['Payment']
        }),
        getPaymentById: builder.query({
            query: (id) => `/api/payments/${id}`,
            providesTags: ['Payment']
        }),
        ///generate-mock-data
        getGenerateChartData: builder.query({
            query: () => `/api/generatechartdata`,
            providesTags: ['Payment']
        }),

        getPaymentsByStudentId: builder.query({
            query: (id) => `/api/payments/getByStudentId/${id}`,
            providesTags: ['Payment']
        }),

        updatePayment: builder.mutation({
            query: ({ id, body }) => ({
                url: `/api/payments/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Payment']
        }),
        deletePayment: builder.mutation({
            query: (id) => ({
                url: `/api/payments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Payment']
        }),
    }),
});

export const {
    useCreatePaymentMutation,
    useGetPaymentsQuery,
    useGetPaymentByIdQuery,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,
    useGetPaymentsByStudentIdQuery,
    useProcessPaymentsMutation,
    useGetGenerateChartDataQuery
} = payStudentsApi;

export default api;
