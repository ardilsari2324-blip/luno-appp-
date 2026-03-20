import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const anon1 = await prisma.user.upsert({
    where: { email: "demo@veilon.app" },
    update: {},
    create: {
      email: "demo@veilon.app",
      anonymousNickname: "Anon_demo1",
      name: "Anon_demo1",
    },
  });

  const anon2 = await prisma.user.upsert({
    where: { email: "test@veilon.app" },
    update: {},
    create: {
      email: "test@veilon.app",
      anonymousNickname: "Anon_test1",
      name: "Anon_test1",
    },
  });

  const post1 = await prisma.post.create({
    data: {
      authorId: anon1.id,
      content: "Merhaba, bu bir demo gönderi. Anonim paylaşım güzel.",
    },
  });

  await prisma.post.create({
    data: {
      authorId: anon2.id,
      content: "İkinci kullanıcıdan bir gönderi. Herkes anonim.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: anon2.id,
      content: "Katılıyorum!",
    },
  });

  console.log("Seed tamamlandı:", { anon1: anon1.anonymousNickname, anon2: anon2.anonymousNickname });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
