import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "Luno <onboarding@resend.dev>";

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
      subject: "Luno — Giriş kodunuz",
      html: `
        <p>Merhaba,</p>
        <p>Luno giriş kodunuz: <strong>${code}</strong></p>
        <p>Bu kod 10 dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
        <p>— Luno</p>
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
