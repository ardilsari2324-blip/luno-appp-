import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Veilon kullanım koşulları, yasak içerikler, hesap silme politikası ve yasal şartlar.",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold mb-6">Kullanım Koşulları</h1>
        <p className="text-muted-foreground mb-4">
          Son güncelleme: Mart 2026
        </p>
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">1. Hizmetin kapsamı ve kabul</h2>
          <p>
            Veilon (&quot;uygulama&quot;, &quot;hizmet&quot;, &quot;biz&quot;), anonim sosyal paylaşım platformu sunar. Bu Kullanım Koşulları (&quot;Koşullar&quot;), hizmete erişiminiz ve kullanımınız için geçerlidir. Uygulamayı kullanmaya başladığınızda bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız. Kabul etmiyorsanız hizmeti kullanmayınız.
          </p>

          <h2 className="text-lg font-semibold">2. Hesap, kimlik doğrulama ve güvenlik</h2>
          <p>
            Hizmete erişim için <strong>e-posta adresi ve şifre</strong> kullanılır. Yeni kayıtlarda e-postanıza gönderilen <strong>tek seferlik doğrulama kodu</strong> ile hesabınızı tamamlamanız gerekir. Şifrenizi unuttuysanız, giriş ekranındaki &quot;Şifremi unuttum&quot; akışı ile e-postanıza kod alıp yeni şifre belirleyebilirsiniz.
          </p>
          <p>
            Şifreler sistemde tek yönlü olarak işlenmiş biçimde (hash) saklanır; düz metin olarak tutulmaz. Oturum bilgilerinizi ve şifrenizi üçüncü kişilerle paylaşmayınız. Hesabınız üzerinden gerçekleşen tüm işlemlerden siz sorumlusunuz. Şüpheli bir durum fark ederseniz derhal şifrenizi değiştirin ve bizimle iletişime geçin.
          </p>
          <p className="text-sm text-muted-foreground">
            Hizmeti kullanarak, yerel yasalar gereği hizmete uygun yaşta olduğunuzu beyan edersiniz. Özellikle çocuklara yönelik içerik ve güvenlik kurallarına uygun davranmak kullanıcının sorumluluğundadır.
          </p>

          <h2 className="text-lg font-semibold">3. Kullanıcı içeriği ve genel yasaklar</h2>
          <p>
            Gönderi, yorum, mesaj veya başka biçimde paylaştığınız tüm içeriklerden (&quot;kullanıcı içeriği&quot;) yalnızca siz sorumlusunuz. Aşağıdakiler dahil ancak bunlarla sınırlı olmamak üzere yasaktır:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Yasadışı faaliyetleri teşvik eden veya yasadışı içerik barındıran paylaşımlar</li>
            <li>Taciz, zorbalık, tehdit veya hedef gösterme</li>
            <li>Irk, etnik köken, din, cinsiyet, cinsel yönelim veya engellilik temelinde nefret söylemi</li>
            <li>Spam, yanıltıcı reklam veya istenmeyen ticari iletişim</li>
            <li>Sahte bilgi veya kimlik taklidi</li>
            <li>Üçüncü kişilerin fikri mülkiyet haklarını ihlal eden içerik</li>
          </ul>
          <p>
            Şikayet edilen içerikler incelenir; ihlal tespit edilirse içerik kaldırılır ve gerektiğinde hesap uyarılır veya kısıtlanır.
          </p>

          <h2 className="text-lg font-semibold">4. Kesin yasak içerikler — içerik kaldırma ve hesap silme</h2>
          <p>
            Aşağıdaki içerik türleri kesinlikle yasaktır. 5651 sayılı Kanun, 5237 sayılı Türk Ceza Kanunu ve ilgili mevzuat kapsamında bu tür içerikler tespit edildiğinde:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Terör örgütü propagandası veya savunusu:</strong> Terör örgütlerini öven, destekleyen, propagandasını yapan veya terör eylemlerini meşrulaştıran içerik. Terör örgütü listesi, ilgili ulusal ve uluslararası mevzuat ile yetkili makamların açıklamalarına göre belirlenir.
            </li>
            <li>
              <strong>Çocuk istismarı (CSAM):</strong> 18 yaş altındaki bireylere yönelik cinsel istismar içeriği; çocuk pornografisi; çocukların cinsel istismarını betimleyen, teşvik eden veya kolaylaştıran metin, görsel veya video. Bu tür içerikler yasal zorunluluk gereği derhal yetkili makamlara bildirilir.
            </li>
            <li>
              <strong>Cinsel şiddet / tecavüz:</strong> Tecavüz, cinsel saldırı veya cinsel şiddeti öven, teşvik eden, betimleyen veya normalleştiren içerik. Mağdurun rızası olmadan paylaşılan cinsel içerikler (revenge porn) dahildir.
            </li>
            <li>
              <strong>İnsan ticareti:</strong> İnsan ticaretini, zorla çalıştırmayı veya cinsel sömürüyü teşvik eden, kolaylaştıran veya reklamını yapan içerik.
            </li>
            <li>
              <strong>Şiddet teşviki ve tehdit:</strong> Gerçek kişilere yönelik ciddi fiziksel şiddet, ölüm tehdidi veya hedef gösterme içeren içerik.
            </li>
            <li>
              <strong>Zararlı madde ve silah ticareti:</strong> Yasadışı uyuşturucu, silah veya patlayıcı satışı/dağıtımını teşvik eden içerik.
            </li>
          </ul>
          <p className="font-medium mt-3">
            Sonuçlar:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>İlgili içerik (gönderi, yorum, mesaj) derhal kaldırılır.</li>
            <li>Hesap önceden uyarı yapılmaksızın kalıcı olarak silinir.</li>
            <li>5651 sayılı Kanun ve ilgili mevzuat gereği yetkili makamlara bildirim yapılabilir.</li>
            <li>Aynı kişinin yeni hesaplar açması engellenebilir.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Bu tür ihlallerde itiraz veya geri alma hakkı tanınmaz. Yasal süreçler ilgili makamlar nezdinde yürütülür.
          </p>

          <h2 className="text-lg font-semibold">5. Engelleme ve şikayet mekanizması</h2>
          <p>
            Kullanıcıları engelleyebilir ve içerik veya kullanıcıları şikayet edebilirsiniz. Şikayetler, özellikle 4. maddede sayılan kesin yasak içerikler açısından öncelikli olarak incelenir. Şikayet sonucu ihlal tespit edilirse gerekli işlemler (içerik kaldırma, hesap uyarısı veya silme) uygulanır. Şikayetlerin gizliliği korunur; ancak yasal zorunluluk halinde yetkili makamlarla paylaşılabilir.
          </p>

          <h2 className="text-lg font-semibold">6. Hesabın sonlandırılması</h2>
          <p>
            Hesabınızı istediğiniz zaman ayarlar üzerinden silebilirsiniz. Silme işlemi geri alınamaz; kişisel verileriniz ve paylaştığınız içerikler silinir veya anonimleştirilir. İhlal nedeniyle hesabınızın bizim tarafımızdan sonlandırılması halinde, bu Koşulların 4. maddesi uygulanır.
          </p>

          <h2 className="text-lg font-semibold">7. Fikri mülkiyet</h2>
          <p>
            Paylaştığınız içeriğin size ait olduğunu veya paylaşım yetkiniz bulunduğunu kabul edersiniz. Veilon&apos;a, içeriğinizi hizmet kapsamında göstermek, depolamak ve işlemek için sınırlı ve devredilemez bir lisans verirsiniz. Üçüncü kişilerin telif hakkı, ticari marka veya diğer haklarını ihlal etmeyiniz.
          </p>

          <h2 className="text-lg font-semibold">8. Sorumluluk sınırlaması</h2>
          <p>
            Hizmet &quot;olduğu gibi&quot; sunulur. Veilon, kullanıcı içeriğinin doğruluğu, yasallığı veya uygunluğu konusunda garanti vermez. Yasalara uygunluk ve içerik sorumluluğu kullanıcıya aittir. Kanunun izin verdiği ölçüde, Veilon dolaylı, arızi veya cezai zararlardan sorumlu tutulamaz.
          </p>

          <h2 className="text-lg font-semibold">9. Uygulanacak hukuk ve uyuşmazlık çözümü</h2>
          <p>
            Bu Koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türkiye mahkemeleri ve icra daireleri yetkilidir.
          </p>

          <h2 className="text-lg font-semibold">10. Değişiklikler</h2>
          <p>
            Bu Koşullar güncellenebilir. Önemli değişiklikler uygulama üzerinden veya e-posta ile duyurulur. Değişikliklerden sonra hizmeti kullanmaya devam etmeniz, güncel Koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2 className="text-lg font-semibold">11. İletişim</h2>
          <p className="text-sm">
            Hizmetle ilgili yasal veya içerik talepleri için işleten tarafından duyurulan resmi iletişim kanalları kullanılmalıdır (ör. destek e-postası veya güvenlik bildirimi için <code className="text-xs bg-muted px-1 rounded">/.well-known/security.txt</code> dosyasındaki iletişim).
          </p>

          <p className="text-xs text-muted-foreground border-t border-border pt-4 mt-6">
            Bu metin bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez. Özel durumlarınız için bir avukata başvurunuz.
          </p>
        </section>
        <p className="mt-8 text-muted-foreground text-sm">
          <Link href="/privacy" className="text-primary hover:underline">Gizlilik politikası</Link>
          {" · "}
          <Link href="/" className="text-primary hover:underline">Ana sayfa</Link>
        </p>
      </main>
    </div>
  );
}
