import { api } from "./api";

export const groupsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Group CRUD Endpoints
    createGroupLesson: builder.mutation({
      query: (groupData) => ({
        url: '/api/lessons',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Group'],
    }),
    getGroupById: builder.query({
      query: (id) => `/api/lesson/${id}`,
      providesTags: ['Group'],
    }),
    getAllGroups: builder.query({
      query: () => '/api/lesson',
      providesTags: ['Group'],
    }),
    updateGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/lesson/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Group'],
    }),
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/api/lesson/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group'],
    }),

    // GroupaId Management Endpoints
    addGroupaId: builder.mutation({
      query: ({ id, groupaId }) => ({
        url: `/api/lesson/${id}/add-groupa-id`,
        method: 'PUT',
        body: { groupaId },
      }),
      invalidatesTags: ['Group'],
    }),
    removeGroupaId: builder.mutation({
      query: ({ id, groupaId }) => ({
        url: `/api/lesson/${id}/remove-groupa-id`,
        method: 'PUT',
        body: { groupaId },
      }),
      invalidatesTags: ['Group'],
    }),

    // Lesson CRUD Endpoints
    createLesson: builder.mutation({
      query: ({ id, lessonData }) => ({
        url: `/api/lesson/${id}/lessons`,
        method: 'POST',
        body: lessonData,
      }),
      invalidatesTags: ['Group', 'Lesson'],
    }),
    updateLesson: builder.mutation({
      query: ({ id, lessonId, lessonData }) => ({
        url: `/api/lesson/${id}/lessons/${lessonId}`,
        method: 'PUT',
        body: lessonData,
      }),
      invalidatesTags: ['Group', 'Lesson'],
    }),
    deleteLesson: builder.mutation({
      query: ({ id, lessonId }) => ({
        url: `/api/lesson/${id}/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group', 'Lesson'],
      connotate: ['Lesson'],
    }),
  }),
});

export const {
  useCreateGroupLessonMutation,
  useGetGroupByIdQuery,
  useGetAllGroupsQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useAddGroupaIdMutation,
  useRemoveGroupaIdMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} = groupsApi;


