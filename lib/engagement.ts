/**
 * Bağımlılık algoritması — engagement skoru
 * Beğeni, yorum ve yenilik (recency) ile sıralama.
 * Yüksek skor = daha üstte, kullanıcı daha fazla scroll eder.
 */

export interface EngagementInput {
  likes: number;
  comments: number;
  createdAt: Date | string;
  hasMedia?: boolean;
}

/**
 * "Hot" skoru — Reddit benzeri formül
 * score = (likes*2 + comments*3) / (1 + hours)^1.5
 * - Yorumlar daha değerli (tartışma = bağımlılık)
 * - Zamanla skor düşer (yenilik önemli)
 * - Medya içerik hafif bonus
 */
export function computeEngagementScore(input: EngagementInput): number {
  const { likes, comments, createdAt, hasMedia } = input;
  const now = new Date();
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  const engagement = likes * 2 + comments * 3;
  const decay = Math.pow(1 + hoursSince, 1.5);
  let score = engagement / decay;

  // Yeni gönderilere boost (ilk 2 saat)
  if (hoursSince < 2) {
    score *= 1.5;
  }
  // Medya içerik daha çok tıklanır
  if (hasMedia) {
    score *= 1.2;
  }
  // Sıfır etkileşimli yeni gönderilere minimum skor (keşif)
  if (engagement === 0 && hoursSince < 24) {
    score = Math.max(score, 0.5 / decay);
  }

  return score;
}

/**
 * Gönderileri engagement skoruna göre sırala
 */
export function sortByEngagement<T extends EngagementInput>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const scoreA = computeEngagementScore(a);
    const scoreB = computeEngagementScore(b);
    return scoreB - scoreA;
  });
}
