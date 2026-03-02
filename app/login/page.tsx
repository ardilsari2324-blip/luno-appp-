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
import { Mail, Phone, ArrowRight, Loader2, Languages, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const sendOtpSchema = z.object({
  email: z.string().email("Geçerli e-posta girin.").optional().or(z.literal("")),
  phone: z.string().min(10, "En az 10 karakter.").optional().or(z.literal("")),
}).refine((d) => d.email || d.phone, { message: "E-posta veya telefon girin.", path: ["email"] });

const verifySchema = z.object({
  code: z.string().length(6, "6 haneli kodu girin."),
});

type SendOtp = z.infer<typeof sendOtpSchema>;
type VerifyOtp = z.infer<typeof verifySchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale, setLocale } = useLanguage();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [step, setStep] = useState<"send" | "verify">("send");
  const [identifier, setIdentifier] = useState<{ email?: string; phone?: string }>({});
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [showForgotInfo, setShowForgotInfo] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const sendForm = useForm<SendOtp>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: "", phone: "" },
  });

  const verifyForm = useForm<VerifyOtp>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  async function onSend(data: SendOtp) {
    const email = mode === "email" ? data.email?.trim() || undefined : undefined;
    const phone = mode === "phone" ? data.phone?.trim() || undefined : undefined;
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });
    const json = await res.json();
    if (!res.ok) {
      sendForm.setError("root", { message: json.error?.message || json.error || "Kod gönderilemedi." });
      return;
    }
    setIdentifier({ email, phone });
    setStep("verify");
  }

  async function onResendCode() {
    setResendSuccess(false);
    setResending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.email, phone: identifier.phone }),
      });
      if (res.ok) setResendSuccess(true);
      else {
        const json = await res.json();
        verifyForm.setError("root", { message: json.error || "Kod tekrar gönderilemedi." });
      }
    } catch {
      verifyForm.setError("root", { message: "Kod tekrar gönderilemedi." });
    } finally {
      setResending(false);
    }
  }

  async function onVerify(data: VerifyOtp) {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...identifier,
        code: data.code,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      verifyForm.setError("root", { message: json.error || "Doğrulama başarısız." });
      return;
    }
    const signInResult = await signIn("otp", {
      token: json.token,
      redirect: false,
      callbackUrl,
    });
    if (signInResult?.error) {
      verifyForm.setError("root", { message: "Oturum açılamadı." });
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            {t("appName")}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLocale(locale === "tr" ? "en" : "tr")}>
            <Languages className="h-4 w-4 mr-1" />
            {locale === "tr" ? "EN" : "TR"}
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 shadow-xl glow-primary">
          <h1 className="text-xl font-bold mb-1">
            {step === "send" ? t("loginWelcome") : t("loginEnterCode")}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {step === "send"
              ? t("loginDesc")
              : `${identifier.email || identifier.phone} ${t("loginCodeDesc")}`}
          </p>

          {step === "send" ? (
            <form onSubmit={sendForm.handleSubmit(onSend)} className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as "email" | "phone")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {t("email")}
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("phone")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-2 pt-4">
                  <Input
                    placeholder="ornek@email.com"
                    type="email"
                    className="h-12 rounded-xl border-border bg-background/50"
                    {...sendForm.register("email")}
                  />
                  {sendForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{sendForm.formState.errors.email.message}</p>
                  )}
                </TabsContent>
                <TabsContent value="phone" className="space-y-2 pt-4">
                  <Input
                    placeholder="5XX XXX XX XX"
                    className="h-12 rounded-xl border-border bg-background/50"
                    {...sendForm.register("phone")}
                  />
                  {sendForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">{sendForm.formState.errors.phone.message}</p>
                  )}
                </TabsContent>
              </Tabs>
              {sendForm.formState.errors.root && (
                <p className="text-sm text-destructive">{sendForm.formState.errors.root.message}</p>
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
              <Button type="submit" className="w-full h-12 rounded-xl font-semibold" size="lg">
                {t("sendCode")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
              <Input
                placeholder="000000"
                maxLength={6}
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
                onClick={onResendCode}
                disabled={resending}
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("resendCode")}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setStep("send")}
                >
                  {t("back")}
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl font-semibold" disabled={verifyForm.formState.isSubmitting}>
                  {verifyForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("signIn")
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground space-x-3">
          <Link href="/" className="text-primary hover:underline">{t("backToHome")}</Link>
          <span>·</span>
          <Link href="/terms" className="text-primary hover:underline">{t("termsTitle")}</Link>
          <span>·</span>
          <Link href="/privacy" className="text-primary hover:underline">{t("privacyTitle")}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
