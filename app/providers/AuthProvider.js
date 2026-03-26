"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/http";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await http.get(`api/checkingUser`);
            if (!res.ok) {
                setUser(null);
                setLoading(false);
                return null;
            }
            const data = await res.json();
            setUser(data.user);
            return data.user;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await http.post(`api/auth/logout`);
            await fetch('/api/clear-token', { method: 'POST' }).catch(() => {});
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            setUser(null);
            router.push("/");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);