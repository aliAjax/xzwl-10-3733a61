function getDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateSeed(dateStr) {
  let seed = 2166136261;
  const fnvPrime = 16777619;
  for (let i = 0; i < dateStr.length; i++) {
    seed ^= dateStr.charCodeAt(i);
    seed = Math.imul(seed, fnvPrime);
  }
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 2246822507);
  seed ^= seed >>> 13;
  seed = Math.imul(seed, 3266489909);
  seed ^= seed >>> 16;
  return Math.abs(seed) % 2147483647;
}

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

const CHALLENGE_TEMPLATES = [
  { type: 'score_time', titles: ['速战速决', '闪电战', '时间赛跑', '竞速挑战', '分秒必争'], targetRange: [100, 400], constraintRange: [45, 90] },
  { type: 'no_damage_stars', titles: ['完美闪避', '无伤大师', '毫发无损', '优雅收集', '零失误'], targetRange: [10, 40], constraintRange: [0, 0] },
  { type: 'heal_survive', titles: ['生存专家', '坚韧不拔', '回血战士', '不屈不挠', '续命达人'], targetRange: [3, 7], constraintRange: [1, 3] }
];

function generateChallengeForDate(dateStr) {
  const seed = getDateSeed(dateStr);
  const rng = new SeededRandom(seed);
  const templateIndex = rng.nextInt(0, CHALLENGE_TEMPLATES.length - 1);
  const template = CHALLENGE_TEMPLATES[templateIndex];
  const target = rng.nextInt(template.targetRange[0], template.targetRange[1]);
  const title = rng.pick(template.titles);
  return { dateStr, seed, type: template.type, title, target };
}

console.log('=== 日期种子算法测试 ===\n');

console.log('测试1: 连续日期的种子和挑战:');
const dates = [];
for (let i = 1; i <= 10; i++) {
  const dateStr = `2024-01-${String(i).padStart(2, '0')}`;
  const challenge = generateChallengeForDate(dateStr);
  dates.push(challenge);
  console.log(`  ${dateStr}: seed=${challenge.seed}, type=${challenge.type}, title=${challenge.title}, target=${challenge.target}`);
}

console.log('\n测试2: 同一天多次生成应该相同:');
const date1 = generateChallengeForDate('2024-01-15');
const date2 = generateChallengeForDate('2024-01-15');
console.log(`  第一次: ${date1.type} - ${date1.title} (${date1.target})`);
console.log(`  第二次: ${date2.type} - ${date2.title} (${date2.target})`);
console.log(`  相同: ${date1.type === date2.type && date1.title === date2.title && date1.target === date2.target}`);

console.log('\n测试3: 不同年份同一天应该不同:');
const d2023 = generateChallengeForDate('2023-06-08');
const d2024 = generateChallengeForDate('2024-06-08');
const d2025 = generateChallengeForDate('2025-06-08');
console.log(`  2023-06-08: ${d2023.type} - ${d2023.title} (${d2023.target})`);
console.log(`  2024-06-08: ${d2024.type} - ${d2024.title} (${d2024.target})`);
console.log(`  2025-06-08: ${d2025.type} - ${d2025.title} (${d2025.target})`);

console.log('\n测试4: 统计30天内各类型出现次数:');
const typeCounts = { score_time: 0, no_damage_stars: 0, heal_survive: 0 };
for (let i = 1; i <= 30; i++) {
  const challenge = generateChallengeForDate(`2024-06-${String(i).padStart(2, '0')}`);
  typeCounts[challenge.type]++;
}
console.log(`  score_time: ${typeCounts.score_time}天`);
console.log(`  no_damage_stars: ${typeCounts.no_damage_stars}天`);
console.log(`  heal_survive: ${typeCounts.heal_survive}天`);

console.log('\n=== 测试完成 ===');
