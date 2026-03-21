"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2, Languages, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { passwordFieldSchema } from "@/lib/password";

const signInSchema = z.object({
  email: z.string().email("Invalid email."),
  password: z.string().min(1, "Required."),
});

const registerSendSchema = z
  .object({
    email: z.string().email("Invalid email."),
    password: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "mismatch",
    path: ["confirmPassword"],
  });

const verifySchema = z.object({
  code: z.string().length(6, "6 digits."),
});

const forgotEmailSchema = z.object({
  email: z.string().email("Invalid email."),
});

const forgotResetSchema = z
  .object({
    code: z.string().length(6, "6 digits."),
    newPassword: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "mismatch",
    path: ["confirmPassword"],
  });

type SignInForm = z.infer<typeof signInSchema>;
type RegisterSendForm = z.infer<typeof registerSendSchema>;
type VerifyForm = z.infer<typeof verifySchema>;
type ForgotEmailForm = z.infer<typeof forgotEmailSchema>;
type ForgotResetForm = z.infer<typeof forgotResetSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale, setLocale } = useLanguage();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [mainTab, setMainTab] = useState<"signin" | "register">("signin");
  const [regStep, setRegStep] = useState<"form" | "verify">("form");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  /** none | email | code — şifre sıfırlama */
  const [forgotView, setForgotView] = useState<"none" | "email" | "code">("none");
  const [forgotEmail, setForgotEmailState] = useState("");
  const [forgotResendSuccess, setForgotResendSuccess] = useState(false);
  const [forgotResending, setForgotResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterSendForm>({
    resolver: zodResolver(registerSendSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const forgotEmailForm = useForm<ForgotEmailForm>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const forgotResetForm = useForm<ForgotResetForm>({
    resolver: zodResolver(forgotResetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  function apiErrorMessage(json: { error?: unknown }): string {
    const e = json.error;
    if (typeof e === "string") return e;
    if (e && typeof e === "object") {
      const flat = e as Record<string, string[] | undefined>;
      const first = Object.values(flat).flat()[0];
      if (first) return first;
    }
    return t("errFailed");
  }

  async function onSignIn(data: SignInForm) {
    const res = await signIn("credentials", {
      email: data.email.trim(),
      password: data.password,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      signInForm.setError("root", { message: t("errInvalidCredentials") });
      return;
    }
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  function closeForgot() {
    setForgotView("none");
    setForgotEmailState("");
    setForgotResendSuccess(false);
    forgotEmailForm.reset();
    forgotResetForm.reset();
  }

  async function onForgotSendEmail(data: ForgotEmailForm) {
    const res = await fetch("/api/auth/forgot-password/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email.trim() }),
    });
    const json = await res.json();
    if (!res.ok) {
      forgotEmailForm.setError("root", { message: apiErrorMessage(json) });
      return;
    }
    setForgotEmailState(data.email.trim());
    setForgotView("code");
    forgotResetForm.reset({ code: "", newPassword: "", confirmPassword: "" });
  }

  async function onForgotResendCode() {
    setForgotResendSuccess(false);
    setForgotResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.ok) setForgotResendSuccess(true);
      else {
        const j = await res.json();
        forgotResetForm.setError("root", { message: apiErrorMessage(j) });
      }
    } catch {
      forgotResetForm.setError("root", { message: t("errFailed") });
    } finally {
      setForgotResending(false);
    }
  }

  async function onForgotReset(data: ForgotResetForm) {
    const res = await fetch("/api/auth/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: forgotEmail,
        code: data.code,
        newPassword: data.newPassword,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      if (json.error === "NEW_PASSWORD_SAME_AS_OLD") {
        forgotResetForm.setError("newPassword", { message: t("errNewPasswordSameAsOld") });
      } else {
        forgotResetForm.setError("root", { message: apiErrorMessage(json) });
      }
      return;
    }
    const signInResult = await signIn("credentials", {
      email: forgotEmail,
      password: data.newPassword,
      redirect: false,
      callbackUrl,
    });
    if (signInResult?.error) {
      forgotResetForm.setError("root", { message: t("errInvalidCredentials") });
      return;
    }
    closeForgot();
    router.push(callbackUrl);
    router.refresh();
  }

  async function onRegisterSend(data: RegisterSendForm) {
    const res = await fetch("/api/auth/register/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email.trim(),
        password: data.password,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      registerForm.setError("root", { message: apiErrorMessage(json) });
      return;
    }
    setRegEmail(data.email.trim());
    setRegPassword(data.password);
    setRegStep("verify");
    verifyForm.reset({ code: "" });
  }

  async function onResendRegisterCode() {
    setResendSuccess(false);
    setResending(true);
    try {
      const res = await fetch("/api/auth/register/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      if (res.ok) setResendSuccess(true);
      else {
        const json = await res.json();
        verifyForm.setError("root", { message: apiErrorMessage(json) });
      }
    } catch {
      verifyForm.setError("root", { message: t("errFailed") });
    } finally {
      setResending(false);
    }
  }

  async function onVerify(data: VerifyForm) {
    const res = await fetch("/api/auth/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, code: data.code }),
    });
    const json = await res.json();
    if (!res.ok) {
      verifyForm.setError("root", { message: apiErrorMessage(json) });
      return;
    }
    const signInResult = await signIn("credentials", {
      email: regEmail,
      password: regPassword,
      redirect: false,
      callbackUrl,
    });
    if (signInResult?.error) {
      verifyForm.setError("root", { message: t("errInvalidCredentials") });
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  function switchTab(tab: "signin" | "register") {
    setMainTab(tab);
    setRegStep("form");
    closeForgot();
    registerForm.reset();
    verifyForm.reset();
    signInForm.clearErrors("root");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent"
          >
            {t("appName")}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLocale(locale === "tr" ? "en" : "tr")}>
            <Languages className="h-4 w-4 mr-1" />
            {locale === "tr" ? "EN" : "TR"}
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 shadow-xl glow-primary">
          <Tabs value={mainTab} onValueChange={(v) => switchTab(v as "signin" | "register")}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("loginTabSignIn")}
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("loginTabRegister")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0 space-y-4">
              {forgotView === "none" && (
                <>
                  <div>
                    <h1 className="text-xl font-bold mb-1">{t("loginWelcome")}</h1>
                    <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
                  </div>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("email")}</label>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...signInForm.register("email")}
                      />
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("password")}</label>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...signInForm.register("password")}
                      />
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    {signInForm.formState.errors.root && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.root.message}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        forgotEmailForm.reset({ email: signInForm.getValues("email") || "" });
                        setForgotView("email");
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <HelpCircle className="h-4 w-4" />
                      {t("forgotPassword")}
                    </button>
                    <Button type="submit" className="w-full h-12 rounded-xl font-semibold" size="lg" disabled={signInForm.formState.isSubmitting}>
                      {signInForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {t("signIn")}
                          <ArrowRight className="h-4 w-4 ml-2 inline" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {forgotView === "email" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1">{t("forgotPasswordTitle")}</h1>
                    <p className="text-sm text-muted-foreground">{t("forgotPasswordSubtitle")}</p>
                  </div>
                  <form onSubmit={forgotEmailForm.handleSubmit(onForgotSendEmail)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("email")}</label>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...forgotEmailForm.register("email")}
                      />
                      {forgotEmailForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{forgotEmailForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    {forgotEmailForm.formState.errors.root && (
                      <p className="text-sm text-destructive">{forgotEmailForm.formState.errors.root.message}</p>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={closeForgot}>
                        {t("backToLogin")}
                      </Button>
                      <Button type="submit" className="flex-1 h-12 rounded-xl font-semibold" disabled={forgotEmailForm.formState.isSubmitting}>
                        {forgotEmailForm.formState.isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {t("sendCode")}
                            <ArrowRight className="h-4 w-4 ml-2 inline" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {forgotView === "code" && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1">{t("forgotPasswordStep2Title")}</h1>
                    <p className="text-sm text-muted-foreground">
                      {forgotEmail} {t("loginCodeDesc")}
                    </p>
                  </div>
                  <form onSubmit={forgotResetForm.handleSubmit(onForgotReset)} className="space-y-4">
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border-border bg-background/50"
                      {...forgotResetForm.register("code")}
                    />
                    {forgotResetForm.formState.errors.code && (
                      <p className="text-sm text-destructive">{forgotResetForm.formState.errors.code.message}</p>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("newPassword")}</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...forgotResetForm.register("newPassword")}
                      />
                      {forgotResetForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">{forgotResetForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("confirmPassword")}</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...forgotResetForm.register("confirmPassword")}
                      />
                      {forgotResetForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {forgotResetForm.formState.errors.confirmPassword.message === "mismatch"
                            ? t("errPasswordMismatch")
                            : forgotResetForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    {forgotResetForm.formState.errors.root && (
                      <p className="text-sm text-destructive">{forgotResetForm.formState.errors.root.message}</p>
                    )}
                    {forgotResendSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400">{t("codeSentAgain")}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={onForgotResendCode}
                      disabled={forgotResending}
                    >
                      {forgotResending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("resendCode")}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-xl"
                        onClick={() => {
                          setForgotView("email");
                          forgotResetForm.reset();
                        }}
                      >
                        {t("back")}
                      </Button>
                      <Button type="submit" className="flex-1 h-12 rounded-xl font-semibold" disabled={forgotResetForm.formState.isSubmitting}>
                        {forgotResetForm.formState.isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("resetPasswordAndSignIn")
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              {regStep === "form" ? (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1">{t("loginTabRegister")}</h1>
                    <p className="text-sm text-muted-foreground">{t("registerSubtitle")}</p>
                  </div>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSend)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("email")}</label>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("password")}</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("confirmPassword")}</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-border bg-background/50"
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.confirmPassword.message === "mismatch"
                            ? t("errPasswordMismatch")
                            : registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    {registerForm.formState.errors.root && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.root.message}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-semibold"
                      size="lg"
                      disabled={registerForm.formState.isSubmitting}
                    >
                      {registerForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {t("sendCode")}
                          <ArrowRight className="h-4 w-4 ml-2 inline" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1">{t("verifyEmailTitle")}</h1>
                    <p className="text-sm text-muted-foreground">
                      {regEmail} {t("loginCodeDesc")}
                    </p>
                  </div>
                  <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border-border bg-background/50"
                      {...verifyForm.register("code")}
                    />
                    {verifyForm.formState.errors.code && (
                      <p className="text-sm text-destructive">{verifyForm.formState.errors.code.message}</p>
                    )}
                    {verifyForm.formState.errors.root && (
                      <p className="text-sm text-destructive">{verifyForm.formState.errors.root.message}</p>
                    )}
                    {resendSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400">{t("codeSentAgain")}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={onResendRegisterCode}
                      disabled={resending}
                    >
                      {resending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("resendCode")}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-xl"
                        onClick={() => {
                          setRegStep("form");
                          verifyForm.reset();
                        }}
                      >
                        {t("back")}
                      </Button>
                      <Button type="submit" className="flex-1 h-12 rounded-xl font-semibold" disabled={verifyForm.formState.isSubmitting}>
                        {verifyForm.formState.isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("createAccount")
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground space-x-3">
          <Link href="/" className="text-primary hover:underline">
            {t("backToHome")}
          </Link>
          <span>·</span>
          <Link href="/terms" className="text-primary hover:underline">
            {t("termsTitle")}
          </Link>
          <span>·</span>
          <Link href="/privacy" className="text-primary hover:underline">
            {t("privacyTitle")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gradient-mesh">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
