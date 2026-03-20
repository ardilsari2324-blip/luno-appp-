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

type SignInForm = z.infer<typeof signInSchema>;
type RegisterSendForm = z.infer<typeof registerSendSchema>;
type VerifyForm = z.infer<typeof verifySchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale, setLocale } = useLanguage();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [mainTab, setMainTab] = useState<"signin" | "register">("signin");
  const [regStep, setRegStep] = useState<"form" | "verify">("form");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showForgotInfo, setShowForgotInfo] = useState(false);
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
    setShowForgotInfo(false);
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
                  onClick={() => setShowForgotInfo((v) => !v)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t("forgotPassword")}
                </button>
                {showForgotInfo && (
                  <p className="text-sm text-muted-foreground rounded-xl bg-muted/50 p-3 border border-border/50">
                    {t("forgotPasswordInfo")}
                  </p>
                )}
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
