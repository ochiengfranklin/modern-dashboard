import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL } from "../constants";

export const authClient = createAuthClient({
    baseURL: `${BACKEND_BASE_URL}auth`,
    user: {
        additionalFields: {
            role: {
                type: ["student", "teacher", "admin"], // fixed: enum-style array
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