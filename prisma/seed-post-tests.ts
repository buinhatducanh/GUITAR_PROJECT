import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding post_tests...');

  await prisma.postTest.createMany({
    data: [
      {
        title: 'Hướng dẫn chọn đàn guitar đầu tiên cho người mới bắt đầu',
        content: `Nếu bạn đang tìm kiếm cây đàn guitar đầu tiên, đây là những điều bạn cần biết:

1. **Chọn loại guitar phù hợp**: Guitar acoustic phù hợp cho nhạc folk, pop và người tự học. Guitar điện phù hợp cho rock, blues và jazz. Guitar classic có âm thanh ấm, phù hợp cho nhạc cổ điển.

2. **Ngân sách**: Với người mới bắt đầu, một cây guitar trong tầm giá 2-5 triệu đồng là hoàn toàn đủ để học.

3. **Kích thước**: Chọn kích thước phù hợp với vóc người - người nhỏ con nên chọn guitar 3/4 hoặc 1/2 size.

4. **Thương hiệu uy tín**: Yamaha, Fender, Gibson, Epiphone là những thương hiệu đáng tin cậy cho người mới.

5. **Đến cửa hàng thử trực tiếp**: Trước khi mua, hãy thử cầm và gảy để cảm nhận sự thoải mái khi chơi.`,
      },
      {
        title: 'Top 5 kỹ thuật fingerpicking cơ bản mà mọi guitarist cần biết',
        content: `Fingerpicking là một kỹ thuật đẹp và tinh tế trong guitar. Dưới đây là 5 pattern cơ bản bạn nên học:

1. **Travis Picking**: Ngón cái đảm nhận bass note ở dây 4-5-6, trong khi ngón trỏ, giữa, áp út đảm nhận phần melody ở dây 1-2-3. Đây là nền tảng của fingerpicking.

2. **Alternating Bass**: Ngón cái luân phiên giữa hai dây bass trong khi tay phải đánh melody. Tạo cảm giác nhịp điệu ổn định.

3. **Arpeggio Pattern**: Đánh từng nốt của một hợp âm theo thứ tự - thường là root, 5th, 3rd, rồi lên xuống. Tạo âm thanh lung linh như đàn harp.

4. **Classical Pattern (p-i-m-a)**: Ngón cái (p), trỏ (i), giữa (m), áp út (a) - pattern cơ bản trong guitar cổ điển.

5. **Hybrid Picking**: Kết hợp plectrum và fingerpicking - giúp tăng tốc độ và linh hoạt trong cách chơi.

Hãy luyện tập từng pattern với metronome, bắt đầu từ tempo chậm (60 BPM) rồi tăng dần lên.`,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeded 2 post_tests successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
