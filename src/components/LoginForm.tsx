"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import userStore from "@/store/userStore";
import { useRouter } from "next/navigation";
import { log } from "console";

interface LoginFormProps {
  relogin?: boolean;
  afterLogin?: () => void;
}

function LoginForm({ relogin, afterLogin }: LoginFormProps) {
  const router = useRouter();
  const setUser = userStore((state) => state.setUser);
  const loginMutation = trpc.auth.login.useMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateLogin = () => {
    if (!email || !password) {
      setError("Please enter email and password");
      toast.error("Please enter email and password", { duration: 10000 });
      setIsLoading(false);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address", { duration: 10000 });
      setIsLoading(false);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateLogin()) {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: (data) => {
            if (data) {
              toast.success("Login successful!");
              setUser(data);

              if (relogin && afterLogin) {
                afterLogin();
              } else {
                router.push("/dashboard");
              }
            }
          },
          onError: (err) => {
            console.error(err);

            if ("message" in err) {
              setError(err.message);
              toast.error(err.message, { duration: 10000 });
            } else {
              setError("An unexpected error occurred");
              toast.error("An unexpected error occurred", { duration: 10000 });
            }
            setIsLoading(false);

            setTimeout(() => {
              setError(null);
            }, 10000);
          },
        }
      );
    }
    // setIsLoading(false);
  };

  // Quick login for demo
  // const handleQuickLogin = () => {
  //   const adminUser = mockUsers[0];
  //   onLogin(adminUser.email, adminUser.name);
  //   toast.success("Logged in as Admin");
  // };

  return (
    <div className=" flex items-center justify-center  ">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center  mb-2">
            <Image
              src="/logo2.png"
              alt="Logo"
              width={180}
              height={150}
              priority
              style={{
                // width: "auto",
                height: "auto",
              }}
            />
          </div>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className=" text-center text-red-500">{error}</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="on"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="contact@safewatch-security.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo documentation */}
            {!relogin && (
              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>How to use:</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Click the button below to open the user guide.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  // onClick={handleQuickLogin}
                >
                  Quick Tour
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          SafeWatch Security System
        </p>
      </div>
    </div>
  );
}
export default LoginForm;
