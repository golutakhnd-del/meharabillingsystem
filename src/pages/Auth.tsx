import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ForgotPasswordStep = "email" | "otp" | "newPassword";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = z.object({ 
        email: z.string().email("Please enter a valid email address") 
      }).parse({ email });
      
      const { error } = await supabase.auth.signInWithOtp({
        email: validated.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        toast.error("Failed to send OTP: " + error.message);
        return;
      }

      toast.success("OTP sent! Check your email inbox and spam folder.");
      setForgotPasswordStep("otp");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error("Invalid OTP. Please try again.");
        return;
      }

      toast.success("OTP verified! Now set your new password.");
      setForgotPasswordStep("newPassword");
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = z.object({
        password: z.string().min(6, "Password must be at least 6 characters"),
      }).parse({ password: newPassword });

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) {
        toast.error("Failed to reset password: " + error.message);
        return;
      }

      toast.success("Password reset successfully! You are now logged in.");
      resetForgotPasswordState();
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setIsForgotPassword(false);
    setForgotPasswordStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = authSchema.parse({ email, password });
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome back!");
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            toast.error("This email is already registered. Please login instead.");
            setIsLogin(true);
          } else if (error.message.includes("Password")) {
            toast.error("Password must be at least 6 characters long.");
          } else {
            toast.error("Failed to create account: " + error.message);
          }
          return;
        }

        if (data.user) {
          toast.success("Account created successfully! You can now login.");
          setEmail("");
          setPassword("");
          setIsLogin(true);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background safe-area-inset">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? forgotPasswordStep === "email"
                ? "Enter your email to receive a security code"
                : forgotPasswordStep === "otp"
                ? "Enter the 6-digit code sent to your email"
                : "Create your new password"
              : isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <>
              {forgotPasswordStep === "email" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP Code"}
                  </Button>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={resetForgotPasswordState}
                      className="text-primary hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              )}

              {forgotPasswordStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter 6-digit OTP sent to {email}</Label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep("email")}
                      className="text-primary hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {forgotPasswordStep === "newPassword" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          )}
          {!isForgotPassword && (
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}