/**
 * SMS ile OTP kodu gönderir. TWILIO_* env vars yoksa false döner.
 */
export async function sendOtpSms(to: string, code: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return false;
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(sid, token);
    await client.messages.create({
      body: `Veilon giriş kodunuz: ${code}. 10 dakika geçerlidir.`,
      from,
      to: to.startsWith("+") ? to : `+90${to.replace(/\D/g, "")}`,
    });
    return true;
  } catch (e) {
    console.error("[Twilio] SMS error:", e);
    return false;
  }
}
