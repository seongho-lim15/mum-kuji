"use client"

import { useAuth } from "@/components/AuthProvider";
import ExpenseTracker from "@/components/ExpenseTracker";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={login} />;
  }

  return <ExpenseTracker />;
}
