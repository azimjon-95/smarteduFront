import { api } from "./api";

export const balansApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBalans: builder.query({
            query: () => '/balans',
            providesTags: ['Balans']
        }),
        getBalansById: builder.query({
            query: (id) => `/balans/${id}`,
            providesTags: ['Balans']
        }),
        createBalans: builder.mutation({
            query: (newBalans) => ({
                url: '/balans',
                method: 'POST',
                body: newBalans,
            }),
            invalidatesTags: ['Balans']
        }),
        updateBalans: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/balans/${id}`,
                method: 'PUT',
                body: rest,
            }),
            invalidatesTags: ['Balans']
        }),
        deleteBalans: builder.mutation({
            query: (id) => ({
                url: `/balans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Balans']
        }),
        // /monthly-analysis
        getMonthlyAnalysis: builder.query({
            query: () => '/balans/monthly_analysis',
            providesTags: ['Balans']
        }),
    }),
});

export const {
    useGetBalansQuery,
    useGetBalansByIdQuery,
    useCreateBalansMutation,
    useUpdateBalansMutation,
    useDeleteBalansMutation,
    useGetMonthlyAnalysisQuery
} = balansApi;
