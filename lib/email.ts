import { Resend } from "resend";

/** Gönderen: Vercel'de RESEND_FROM_EMAIL ile ayarlanır. Eski "Luno" ismi kalmışsa Veilon'a çeviririz. */
function resolveFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return "Veilon <onboarding@resend.dev>";
  // "Luno <...>" / "LUNO <...>" → "Veilon <...>" (domain aynı kalır: noreply@lunoapp.org)
  if (/^luno\s*</i.test(raw)) {
    return raw.replace(/^luno\s*</i, "Veilon <");
  }
  return raw;
}

const FROM = resolveFromAddress();

/**
 * E-posta ile OTP kodu gönderir. RESEND_API_KEY yoksa false döner.
 */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: "Veilon — Giriş kodunuz",
      html: `
        <p>Merhaba,</p>
        <p>Veilon giriş kodunuz: <strong>${code}</strong></p>
        <p>Bu kod 10 dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
        <p>— Veilon</p>
      `,
    });
    if (error) {
      console.error("[Resend]", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[Resend] send error:", e);
    return false;
  }
}
