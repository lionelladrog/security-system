"use client";
import LoginForm from "@/components/LoginForm";
import TestDbPage from "../test-db/page";

function Login() {
  return (
    <div className="min-h-screen  bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-100 p-4">
      <TestDbPage />
      <LoginForm />
    </div>
  );
}
export default Login;
