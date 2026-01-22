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
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Globe className="w-6 h-6 text-white" />
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