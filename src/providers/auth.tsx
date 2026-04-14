import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

export const authProvider: AuthProvider = {
    register: async ({
                         email,
                         password,
                         name,
                         role,
                         image,
                         imageCldPubId,
                     }: SignUpPayload) => {
        try {
            const { data, error } = await authClient.signUp.email({
                name,
                email,
                password,
                image,
                role,
                imageCldPubId,
            } as SignUpPayload);

            if (error) {
                return {
                    success: false,
                    error: {
                        name: "Registration failed",
                        message:
                            error?.message || "Unable to create account. Please try again.",
                    },
                };
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            return {
                success: true,
                redirectTo: "/",
            };
        } catch (error) {
            console.error("Register error:", error);
            return {
                success: false,
                error: {
                    name: "Registration failed",
                    message: "Unable to create account. Please try again.",
                },
            };
        }
    },
    login: async ({ email, password }) => {
        try {
            const { data, error } = await authClient.signIn.email({
                email: email,
                password: password,
            });

            if (error) {
                console.error("Login error from auth client:", error);
                return {
                    success: false,
                    error: {
                        name: "Login failed",
                        message: error?.message || "Please try again later.",
                    },
                };
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            return {
                success: true,
                redirectTo: "/",
            };
        } catch (error) {
            console.error("Login exception:", error);
            return {
                success: false,
                error: {
                    name: "Login failed",
                    message: "Please try again later.",
                },
            };
        }
    },
    forgotPassword: async ({ email }) => {
        try {
            // @ts-expect-error - Better Auth types may be out of sync
            const { error } = await authClient.forgetPassword({
                email: email,
                redirectTo: "/reset-password",
            });

            if (error) {
                console.error("Forgot password error from auth client:", error);
                return {
                    success: false,
                    error: {
                        name: "Reset failed",
                        message: error?.message || "Failed to send reset email.",
                    },
                };
            }

            return {
                success: true,
            };
        } catch (error) {
            console.error("Forgot password exception:", error);
            return {
                success: false,
                error: {
                    name: "Reset failed",
                    message: "An unexpected error occurred. Please try again later.",
                },
            };
        }
    },
    logout: async () => {
        const { error } = await authClient.signOut();

        if (error) {
            console.error("Logout error:", error);
            return {
                success: false,
                error: {
                    name: "Logout failed",
                    message: "Unable to log out. Please try again.",
                },
            };
        }

        localStorage.removeItem("user");

        return {
            success: true,
            redirectTo: "/login",
        };
    },
    onError: async (error) => {
        if (error.response?.status === 401) {
            return {
                logout: true,
            };
        }

        return { error };
    },

    // --- UPDATED CHECK METHOD FOR SOCIAL LOGINS ---
    check: async () => {
        try {
            // Ask Better Auth if a valid session exists (checks the cookies Google/GitHub set)
            const { data } = await authClient.getSession();

            if (data?.session) {
                // Since they are logged in via social, sync user data to localStorage
                // so the rest of your app can still use it!
                localStorage.setItem("user", JSON.stringify(data.user));

                return {
                    authenticated: true,
                };
            }
        } catch (error) {
            console.error("Session check error:", error);
        }

        // If no Better Auth session exists, clean up and kick them out
        localStorage.removeItem("user");
        return {
            authenticated: false,
            logout: true,
            redirectTo: "/login",
            error: {
                name: "Unauthorized",
                message: "Please log in to continue",
            },
        };
    },
    // ----------------------------------------------

    getPermissions: async () => {
        const user = localStorage.getItem("user");

        if (!user) return null;
        const parsedUser: User = JSON.parse(user);

        return {
            role: parsedUser.role,
        };
    },
    getIdentity: async () => {
        const user = localStorage.getItem("user");

        if (!user) return null;
        const parsedUser: User = JSON.parse(user);

        return {
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email,
            image: parsedUser.image,
            role: parsedUser.role,
            imageCldPubId: parsedUser.imageCldPubId,
        };
    },
};