import { DailyChallengeSystem } from './js/dailyChallenge.js';

class MockStorage {
  constructor() {
    this.data = {};
  }
  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }
  set(key, value) {
    this.data[key] = value;
    return true;
  }
}

console.log('=== 每日挑战系统测试 ===\n');

const storage = new MockStorage();
const challengeSystem = new DailyChallengeSystem(storage);

console.log('1. 测试今日挑战生成:');
const todayChallenge = challengeSystem.getTodayChallenge();
console.log('   日期:', todayChallenge.date);
console.log('   类型:', todayChallenge.type);
console.log('   标题:', todayChallenge.title);
console.log('   描述:', todayChallenge.description);
console.log('   目标:', todayChallenge.target);
console.log('   约束:', todayChallenge.constraint);
console.log('   图标:', todayChallenge.icon);
console.log('   颜色:', todayChallenge.color);

console.log('\n2. 测试日期种子稳定性（同一天应该生成相同挑战）:');
const challenge1 = challengeSystem.getTodayChallenge();
const challenge2 = challengeSystem.getTodayChallenge();
console.log('   两次获取是否相同:', challenge1.title === challenge2.title && challenge1.target === challenge2.target);

console.log('\n3. 测试不同日期生成不同挑战:');
const originalDate = challengeSystem.todayStr;
challengeSystem.todayStr = '2024-01-01';
challengeSystem.generateTodayChallenge();
const challengeJan1 = challengeSystem.getTodayChallenge();
console.log('   2024-01-01 挑战:', challengeJan1.title, '-', challengeJan1.description);

challengeSystem.todayStr = '2024-01-02';
challengeSystem.generateTodayChallenge();
const challengeJan2 = challengeSystem.getTodayChallenge();
console.log('   2024-01-02 挑战:', challengeJan2.title, '-', challengeJan2.description);
console.log('   两天挑战是否不同:', challengeJan1.title !== challengeJan2.title || challengeJan1.target !== challengeJan2.target);

challengeSystem.todayStr = originalDate;
challengeSystem.generateTodayChallenge();

console.log('\n4. 测试 SCORE_TIME 类型挑战进度:');
if (todayChallenge.type === 'score_time') {
  challengeSystem.resetSessionProgress();
  console.log('   初始进度:', challengeSystem.getProgressDisplay());
  challengeSystem.notify('score', 50);
  challengeSystem.notify('star_collected', 5);
  console.log('   得分50后进度:', challengeSystem.getProgressDisplay());
  console.log('   结果:', challengeSystem.getSessionResult());
  challengeSystem.notify('score', todayChallenge.target + 10);
  console.log('   达到目标后完成状态:', challengeSystem.getSessionResult().completed);
}

console.log('\n5. 测试 NO_DAMAGE_STARS 类型挑战进度:');
challengeSystem.todayStr = '2024-01-01';
challengeSystem.generateTodayChallenge();
const noDamageChallenge = challengeSystem.getTodayChallenge();
if (noDamageChallenge.type === 'no_damage_stars') {
  challengeSystem.resetSessionProgress();
  challengeSystem.notify('star_collected', 5);
  console.log('   收集5颗星后进度:', challengeSystem.getProgressDisplay());
  console.log('   完成状态:', challengeSystem.getSessionResult().completed);
  challengeSystem.notify('damage_taken', 1);
  console.log('   受伤后失败状态:', challengeSystem.getSessionResult().failed);
}

console.log('\n6. 测试 localStorage 持久化:');
challengeSystem.todayStr = originalDate;
challengeSystem.generateTodayChallenge();
challengeSystem.resetSessionProgress();
challengeSystem.notify('score', todayChallenge.target + 100);
challengeSystem.notify('star_collected', todayChallenge.target + 10);
const isCompleted = challengeSystem.isTodayCompleted();
console.log('   今日挑战是否已完成:', isCompleted);
console.log('   存储数据:', storage.data);

const newStorage = new MockStorage();
newStorage.data = { ...storage.data };
const newChallengeSystem = new DailyChallengeSystem(newStorage);
console.log('   新系统读取完成状态:', newChallengeSystem.isTodayCompleted());

console.log('\n7. 测试进度显示:');
const result = challengeSystem.getSessionResult();
console.log('   完成:', result.completed);
console.log('   失败:', result.failed);
console.log('   进度:', Math.round(result.progress) + '%');
console.log('   今日已完成:', result.alreadyCompletedToday);

console.log('\n=== 测试完成 ===');
