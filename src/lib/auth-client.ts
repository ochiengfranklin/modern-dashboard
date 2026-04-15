import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL } from "../constants";

export const authClient = createAuthClient({
    // Make sure BACKEND_BASE_URL includes the full path to your auth route
    // e.g., if your backend is https://api.com, this should resolve to https://api.com/api/auth
    baseURL: `${BACKEND_BASE_URL}auth`,
    user: {
        additionalFields: {
            role: {
                type: "string", // FIXED: Must be a primitive string type for the database schema
                required: true,
                defaultValue: "student",
                input: true,
            },
            department: {
                type: "string",
                required: false,
                input: true,
            },
            imageCldPubId: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
});