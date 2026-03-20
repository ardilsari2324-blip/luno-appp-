import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Veilon gizlilik politikası ve kişisel verilerin korunması.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Veilon
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Ana sayfa
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-invert prose-sm max-w-none">
        <h1 className="text-2xl font-bold mb-6">Gizlilik Politikası</h1>
        <p className="text-muted-foreground mb-4">
          Son güncelleme: Mart 2025
        </p>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Toplanan veriler</h2>
          <p>
            Giriş için e-posta veya telefon numarası, paylaştığınız içerikler (gönderi, yorum, mesaj) ve cihazdan gelen teknik bilgiler (ör. IP) işlenebilir.
          </p>
          <h2 className="text-lg font-semibold">2. Amaç</h2>
          <p>
            Veriler hizmetin sunulması, güvenlik, spam ve kötüye kullanımın önlenmesi ve yasal yükümlülükler için kullanılır.
          </p>
          <h2 className="text-lg font-semibold">3. Anonimlik</h2>
          <p>
            Diğer kullanıcılara yalnızca sistemin atadığı anonim rumuz gösterilir. Gerçek kimliğiniz paylaşılmaz.
          </p>
          <h2 className="text-lg font-semibold">4. Saklama ve silme</h2>
          <p>
            Hesabınızı sildiğinizde ilgili kişisel veriler ve içerikler silinir veya anonimleştirilir.
          </p>
          <h2 className="text-lg font-semibold">5. KVKK / GDPR</h2>
          <p>
            Kişisel verileriniz 6698 sayılı KVKK ve ilgili mevzuat kapsamında işlenir. Haklarınız (erişim, düzeltme, silme vb.) için bizimle iletişime geçebilirsiniz.
          </p>
          <h2 className="text-lg font-semibold">6. Çerezler ve benzeri</h2>
          <p>
            Oturum ve güvenlik için gerekli çerezler kullanılabilir.
          </p>
        </section>
        <p className="mt-8 text-muted-foreground text-sm">
          <Link href="/terms" className="text-primary hover:underline">Kullanım koşulları</Link>
          {" · "}
          <Link href="/" className="text-primary hover:underline">Ana sayfa</Link>
        </p>
      </main>
    </div>
  );
}
