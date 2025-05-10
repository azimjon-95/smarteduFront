import { api } from "./api";

export const botApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendMessages: builder.mutation({
      query: (body) => ({
        url: '/api/bot/send-messages',
        method: 'POST',
        body
      }),
      invalidatesTags: ['messages'],
    }),
    sendCertificate: builder.mutation({
      query: (body) => ({
        url: '/api/bot/upload',
        method: 'POST',
        body
      }),
      invalidatesTags: ['messages'],
    }),
  }),
});

export const { useSendMessagesMutation, useSendCertificateMutation } = botApi;
