"use client";

import { Globe } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                                <Globe className="w-5 h-5 text-background" />
                            </div>
                            <span className="text-2xl font-semibold text-gray-900">LaunchOnce</span>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </AuthProvider>
    );
}