import { api } from "./api";

// Define userApi with injected endpoints for user-related operations
export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all users
        getUser: builder.query({
            query: () => `/controller`,
        }),
        // Fetch a user by ID
        getUserById: builder.query({
            query: (id) => `/controller/${id}`,
        }),
        // Create a new user
        createUser: builder.mutation({
            query: (userData) => ({
                url: '/controller/create',
                method: 'POST',
                body: userData,
            }),
        }),
        // Update an existing user by ID
        updateUser: builder.mutation({
            query: ({ id, userData }) => ({
                url: `/controller/${id}`,
                method: 'PUT',
                body: userData,
            }),
        }),
        // Delete a user by ID
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/controller/del/${id}`,
                method: 'DELETE',
            }),
        }),
        // Authenticate a user
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/controller/login',
                method: 'POST',
                body: credentials,
            }),
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useGetUserQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useLoginUserMutation,
} = userApi;
