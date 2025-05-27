import { api } from "./api";

export const lessonReviewApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createLessonReview: builder.mutation({
            query: (data) => ({
                url: '/lessonReview',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['LessonReview'],
        }),
        getAllLessonReviews: builder.query({
            query: () => '/lessonReview',
            providesTags: ['LessonReview'],
            transformResponse: (response) => response.data,
        }),
        getLessonReviewById: builder.query({
            query: (id) => `/lessonReview/${id}`,
            providesTags: (result, error, id) => [{ type: 'LessonReview', id }],
            transformResponse: (response) => response.data,
        }),
        getByGroupaId: builder.query({
            query: (groupaId) => `/lessonReview/groupaId/${groupaId}`,
            providesTags: ['LessonReview'],
            transformResponse: (response) => response.data,
        }),
        getByGroupaIdAndDate: builder.query({
            query: ({ groupaId, startDate, endDate }) => ({
                url: '/lessonReview/group-date',
                params: { groupaId, startDate, endDate },
            }),
            providesTags: ['LessonReview'],
            transformResponse: (response) => response.data,
        }),
        updateLessonReview: builder.mutation({
            query: ({ id, data }) => ({
                url: `/lessonReview/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['LessonReview'],
        }),
        deleteLessonReview: builder.mutation({
            query: (id) => ({
                url: `/lessonReview/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['LessonReview'],
        }),
    }),
});


export const {
    useCreateLessonReviewMutation,
    useGetAllLessonReviewsQuery,
    useGetLessonReviewByIdQuery,
    useGetByGroupaIdQuery,
    useGetByGroupaIdAndDateQuery,
    useUpdateLessonReviewMutation,
    useDeleteLessonReviewMutation,
} = lessonReviewApi;