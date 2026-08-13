import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button, Field, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(" ")[0]} 👋`);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Convenience: pre-fill the seeded demo credentials.
  const useDemo = () => {
    setValue("email", "alex@timetoprogram.com");
    setValue("password", "Test@1234");
    toast.info("Demo credentials filled in");
  };

  return (
    <AuthShell>
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#C9A24B]">
        Workspace access
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Sign in to your Atlass CRM workspace.
      </p>

      <div className="mt-8 rounded-lg border border-[#0E1720]/8 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <Input
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@company.com"
                className="pl-9 focus:border-[#C9A24B] focus:ring-[#C9A24B]/30"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </div>
          </Field>

          <Field
            label={
              <div className="flex items-center justify-between">
                <span>Password</span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#8A6D2E] hover:text-[#C9A24B] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            }
            error={errors.password?.message}
          >
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9 pr-9 focus:border-[#C9A24B] focus:ring-[#C9A24B]/30"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button
            type="submit"
            className="w-full bg-[#0E1720] text-white hover:bg-[#18232F]"
            size="lg"
            loading={submitting}
          >
            Sign in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#0E1720]/8" />
          <span className="text-[11px] uppercase tracking-wider text-ink-soft/70">or</span>
          <div className="h-px flex-1 bg-[#0E1720]/8" />
        </div>

        <button
          onClick={useDemo}
          type="button"
          className="w-full rounded-full border border-dashed border-[#C9A24B]/50 py-2.5 text-sm font-medium text-[#8A6D2E] transition hover:border-[#C9A24B] hover:bg-[#C9A24B]/8"
        >
          Try the demo account
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-[#0E1720] hover:text-[#C9A24B] hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}