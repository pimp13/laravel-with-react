/**
 * My Theme  
Background       #f8fafc
Card             #ffffff
Primary          Slate 950
Secondary        Slate 500
Border           Slate 200
Primary Accent   Indigo
Success          Emerald
Warning          Amber
Danger           Red
 */

import { FormEvent, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface TErrorsRegister {
  errors: {
    password: string[];
    email: string[];
    name: string[];
    password_confirmation: string[];
  };
  message: string;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<TErrorsRegister>();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    try {
      if (isLogin) {
        // TODO:
        // اتصال به API Login
        //
        // await axios.post("/api/auth/login", {
        //     email: form.email,
        //     password: form.password,
        // });

        console.log("Login", {
          email: form.email,
          password: form.password,
          remember: form.remember,
        });
      } else {
        try {
          const resp = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              password: form.password,
              password_confirmation: form.password_confirmation,
            }),
          });
          const data = await resp.json();
          console.log("data from backend => ", data);
          if (data?.errors) {
            setErrors(data);
          }

          console.log("Register", {
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation,
          });
        } catch (err: any) {
          console.log("server error := ", err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);

    setForm((current) => ({
      ...current,
      password: "",
      password_confirmation: "",
    }));

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#f8fafc]"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/60" />
      </div>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[460px]">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-xl shadow-slate-950/10">
              <span className="text-xl font-bold text-white">A</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {isLogin ? "خوش آمدید" : "ایجاد حساب کاربری"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isLogin
                ? "برای ادامه وارد حساب کاربری خود شوید"
                : "برای شروع، حساب کاربری خود را ایجاد کنید"}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)] sm:p-8">
            {/* Auth tabs */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isLogin
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ورود
              </button>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  !isLogin
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ثبت نام
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    نام و نام خانوادگی
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="نام خود را وارد کنید"
                      autoComplete="name"
                      className={cn(
                        "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100",
                        errors &&
                          errors.errors &&
                          errors.errors.name &&
                          "border-rose-500",
                      )}
                    />
                  </div>
                  {errors && errors.errors && errors.errors.name && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  ایمیل
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="example@email.com"
                    autoComplete="email"
                    dir="ltr"
                    className={cn(
                      "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-left text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100",
                      errors &&
                        errors.errors &&
                        errors.errors.email &&
                        "border-rose-500",
                    )}
                  />
                </div>
                {errors && errors.errors && errors.errors.email && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    رمز عبور
                  </label>

                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline"
                    >
                      رمز عبور را فراموش کرده‌اید؟
                    </button>
                  )}
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="رمز عبور خود را وارد کنید"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    dir="ltr"
                    className={cn(
                      "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 text-left text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100",
                      errors &&
                        errors.errors &&
                        errors.errors.password &&
                        "border-rose-500",
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors && errors.errors && errors.errors.password && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="password_confirmation"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    تکرار رمز عبور
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.password_confirmation}
                      onChange={(event) =>
                        updateField("password_confirmation", event.target.value)
                      }
                      placeholder="رمز عبور را دوباره وارد کنید"
                      autoComplete="new-password"
                      dir="ltr"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-11 text-left text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showConfirmPassword
                          ? "مخفی کردن رمز عبور"
                          : "نمایش رمز عبور"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors &&
                    errors.errors &&
                    errors.errors.password_confirmation && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.errors.password_confirmation}
                      </p>
                    )}
                </div>
              )}

              {/* Remember me */}
              {isLogin && (
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(event) =>
                      updateField("remember", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 accent-slate-950"
                  />

                  <span className="text-sm text-slate-600">
                    مرا به خاطر بسپار
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading
                    ? "لطفاً صبر کنید..."
                    : isLogin
                      ? "ورود به حساب"
                      : "ایجاد حساب کاربری"}
                </span>

                {!loading && (
                  <ArrowLeft
                    size={17}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">یا ادامه دهید با</span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.35 12.27C21.35 11.56 21.29 10.85 21.17 10.16H12V14.1H17.04C16.82 15.37 16.08 16.44 14.96 17.15V19.73H18.26C20.19 17.95 21.35 15.32 21.35 12.27Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 21.6C14.76 21.6 17.08 20.69 18.26 19.73L14.96 17.15C14.04 17.77 12.87 18.14 12 18.14C9.33 18.14 7.07 16.34 6.23 13.91H2.82V16.57C4.03 19.56 7.09 21.6 12 21.6Z"
                  fill="#34A853"
                />
                <path
                  d="M6.23 13.91C6.03 13.31 5.92 12.67 5.92 12C5.92 11.33 6.03 10.69 6.23 10.09V7.43H2.82C2.27 8.52 1.96 9.75 1.96 12C1.96 14.25 2.27 15.48 2.82 16.57L6.23 13.91Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.86C13.5 5.86 14.84 6.38 15.9 7.4L18.34 4.96C16.85 3.56 14.76 2.4 12 2.4C7.09 2.4 4.03 4.44 2.82 7.43L6.23 10.09C7.07 7.66 9.33 5.86 12 5.86Z"
                  fill="#EA4335"
                />
              </svg>
              ورود با حساب گوگل
            </button>

            {/* Footer text */}
            <p className="mt-7 text-center text-xs leading-6 text-slate-400">
              با ادامه دادن، شما با{" "}
              <button
                type="button"
                className="font-medium text-slate-600 hover:text-slate-950"
              >
                قوانین استفاده
              </button>{" "}
              و{" "}
              <button
                type="button"
                className="font-medium text-slate-600 hover:text-slate-950"
              >
                حریم خصوصی
              </button>{" "}
              موافقت می‌کنید.
            </p>
          </div>

          {/* Bottom branding */}
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} My CMS
          </p>
        </div>
      </section>
    </main>
  );
}
