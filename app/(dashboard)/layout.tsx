"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </AuthProvider>
  );
};

export default DashboardLayout;