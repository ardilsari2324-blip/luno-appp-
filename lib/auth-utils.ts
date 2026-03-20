import { nanoid } from "nanoid";
import * as jose from "jose";

const ANON_PREFIX = "Anon_";
const NICK_LENGTH = 8;

/** Sistem tarafından atanmış benzersiz anonim nickname üretir */
export function generateAnonymousNickname(): string {
  const suffix = nanoid(NICK_LENGTH).replace(/[-_]/g, "x").toLowerCase();
  return `${ANON_PREFIX}${suffix}`;
}

const OTP_TOKEN_ISSUER = "veilon-otp";
const OTP_TOKEN_EXP_SEC = 5 * 60; // 5 minutes

/** OTP doğrulandıktan sonra istemciye verilecek tek kullanımlık JWT üretir */
export async function createOtpToken(userId: string, emailOrPhone: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  if (!secret.length || (secret.length === 1 && secret[0] === 0)) {
    throw new Error("AUTH_SECRET is required for OTP token");
  }
  return new jose.SignJWT({ sub: userId, emailOrPhone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(OTP_TOKEN_ISSUER)
    .setExpirationTime(Math.floor(Date.now() / 1000) + OTP_TOKEN_EXP_SEC)
    .sign(secret);
}

/** Credentials ile gelen token'ı doğrular, payload döner */
export async function verifyOtpToken(token: string): Promise<{ userId: string; emailOrPhone: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: OTP_TOKEN_ISSUER,
      maxTokenAge: OTP_TOKEN_EXP_SEC,
    });
    const sub = payload.sub;
    const emailOrPhone = payload.emailOrPhone as string;
    if (!sub || !emailOrPhone) return null;
    return { userId: sub, emailOrPhone };
  } catch {
    return null;
  }
}
