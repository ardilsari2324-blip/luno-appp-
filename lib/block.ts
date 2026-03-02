import { prisma } from "@/lib/db";

/** Oturum açan kullanıcının engellediği kullanıcı ID'lerini döner */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  return blocks.map((b) => b.blockedId);
}

/** Feed/profil listesinde engellenenleri filtrelemek için authorId NOT IN blockedIds */
export function excludeBlockedAuthors<T extends { authorId: string }>(
  items: T[],
  blockedIds: string[]
): T[] {
  if (blockedIds.length === 0) return items;
  const set = new Set(blockedIds);
  return items.filter((p) => !set.has(p.authorId));
}
