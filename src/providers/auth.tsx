import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

// Example server/session call
async function getSession(): Promise<{ user: User | null }> {
    try {
        const res = await fetch("/api/session");
        if (!res.ok) return { user: null };
        const data = await res.json();
        return { user: data?.user ?? null };
    } catch {
        return { user: null };
    }
}

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
                        message: error?.message || "Unable to create account. Please try again.",
                    },
                };
            }

            // Optional: cache user locally
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
            const { data, error } = await authClient.signIn.email({ email, password });

            if (error) {
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

    logout: async () => {
        const { error } = await authClient.signOut();

        if (error) {
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
            return { logout: true };
        }
        return { error };
    },

    check: async () => {
        const { user } = await getSession();

        if (!user || !user.id) {
            return {
                authenticated: false,
                logout: true,
                redirectTo: "/login",
                error: { name: "Unauthorized", message: "Session missing or invalid" },
            };
        }

        return { authenticated: true };
    },

    getPermissions: async () => {
        try {
            const { user } = await getSession();
            if (!user || !user.role) return null;
            return { role: user.role };
        } catch {
            return null;
        }
    },

    getIdentity: async () => {
        try {
            const { user } = await getSession();
            if (!user || !user.id || !user.role) return null;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                imageCldPubId: user.imageCldPubId,
            };
        } catch {
            return null;
        }
    },
};