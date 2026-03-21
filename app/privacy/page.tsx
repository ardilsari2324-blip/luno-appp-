import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Veilon gizlilik politikası, kişisel veriler, KVKK ve alt işleyenler.",
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
        <p className="text-muted-foreground mb-4">Son güncelleme: Mart 2026</p>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold">1. Veri sorumlusu</h2>
          <p>
            Bu politika, Veilon hizmetini kullandığınızda kişisel verilerinizin nasıl işlendiğini açıklar. Hizmeti işleten taraf (işleten iletişim bilgileri ürün içinde veya destek kanallarında duyurulur) veri sorumlusu sıfatıyla hareket eder.
          </p>

          <h2 className="text-lg font-semibold">2. Toplanan veriler</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <strong>Hesap:</strong> e-posta adresi; şifre yalnızca tek yönlü dönüştürülmüş (hash) biçimde saklanır.
            </li>
            <li>
              <strong>Kayıt / güvenlik:</strong> e-posta doğrulama ve şifre sıfırlama için gönderilen tek kullanımlık kodlar (işlem süresi boyunca).
            </li>
            <li>
              <strong>İçerik:</strong> gönderi, yorum, mesaj, medya dosyaları (yüklediğiniz ölçüde).
            </li>
            <li>
              <strong>Teknik:</strong> oturum çerezleri; güvenlik ve kötüye kullanım önleme amaçlı IP veya benzeri günlük veriler (altyapı sağlayıcılarının politikalarına tabi).
            </li>
            <li>
              <strong>Tercihler:</strong> dil, tema, e-posta bildirimi tercihleri (uygulama ayarlarında).
            </li>
          </ul>

          <h2 className="text-lg font-semibold">3. İşleme amaçları</h2>
          <p>
            Veriler; hesabın oluşturulması ve yönetimi, hizmetin sunulması, güvenlik (spam, kötüye kullanım, şikayet incelemesi), yasal yükümlülüklerin yerine getirilmesi ve — açık rızanız veya meşru menfaat kapsamında — ürün iyileştirme için işlenir.
          </p>

          <h2 className="text-lg font-semibold">4. Anonim rumuz</h2>
          <p>
            Diğer kullanıcılara yalnızca sistemin atadığı anonim rumuz gösterilir. E-posta adresiniz diğer kullanıcılara gösterilmez.
          </p>

          <h2 className="text-lg font-semibold">5. Hukuki dayanak (KVKK / GDPR)</h2>
          <p>
            Türkiye&apos;de 6698 sayılı KVKK ve ilgili mevzuat; Avrupa Ekonomik Alanı&apos;ndaki kullanıcılar için GDPR kapsamında haklarınız (erişim, düzeltme, silme, itiraz, veri taşınabilirliği vb.) saklıdır. Veri dışa aktarma talebi, uygulama içi &quot;Verilerimi indir&quot; özelliği ile karşılanabilir (teknik sınırlar dahilinde).
          </p>

          <h2 className="text-lg font-semibold">6. Saklama ve silme</h2>
          <p>
            Hesabınızı sildiğinizde kişisel verileriniz ve içerikleriniz silinir veya anonimleştirilir; yasal zorunluluk veya meşru menfaat gerektiren süreler saklıdır.
          </p>

          <h2 className="text-lg font-semibold">7. Alt işleyenler ve barındırma</h2>
          <p>
            Hizmetin sunulması için üçüncü taraf sağlayıcılar kullanılabilir (örnek türler — işletmenizin gerçek sözleşmelerine tabidir):
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Barındırma ve dağıtım (ör. Vercel)</li>
            <li>Veritabanı (ör. Neon PostgreSQL)</li>
            <li>E-posta gönderimi (ör. Resend)</li>
            <li>Medya depolama (ör. Vercel Blob)</li>
            <li>Hata izleme (ör. Sentry) — etkinse</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Bu liste örnektir; güncel sağlayıcılar işleten tarafından yönetilir ve gerekli sözleşmeler (KVKK aydınlatması / DPA) işleten sorumluluğundadır.
          </p>

          <h2 className="text-lg font-semibold">8. Çerezler ve benzeri teknolojiler</h2>
          <p>
            Oturumun korunması ve güvenlik için gerekli çerezler kullanılabilir. Uygulama, çerez bandı ile bilgilendirme yapabilir; ayrıntılar için tarayıcı ayarlarınızı kullanabilirsiniz.
          </p>

          <h2 className="text-lg font-semibold">9. Haklarınız ve iletişim</h2>
          <p>
            KVKK kapsamındaki taleplerinizi ve sorularınızı, işletenin duyurduğu iletişim adresine iletebilirsiniz. Talebinize makul sürede yanıt verilmeye çalışılır.
          </p>

          <p className="text-xs text-muted-foreground border-t border-border pt-4 mt-6">
            Bu metin bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez.
          </p>
        </section>

        <p className="mt-8 text-muted-foreground text-sm">
          <Link href="/terms" className="text-primary hover:underline">
            Kullanım koşulları
          </Link>
          {" · "}
          <Link href="/" className="text-primary hover:underline">
            Ana sayfa
          </Link>
        </p>
      </main>
    </div>
  );
}
