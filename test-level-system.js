import { CONFIG } from './js/config.js';
import { ScoreManager } from './js/score.js';
import { LevelSystem } from './js/levels.js';

class MockStorage {
  get(key, defaultValue) {
    return defaultValue;
  }
  set(key, value) {}
}

class MockGame {
  constructor(scoreManager) {
    this.scoreManager = scoreManager;
    this.entities = [];
    this.config = CONFIG;
  }
}

console.log('🧪 开始测试关卡系统闭环验证\n');

const storage = new MockStorage();
const scoreManager = new ScoreManager(storage);
const levelSystem = new LevelSystem(CONFIG.levels);
const game = new MockGame(scoreManager);

let scoreChangeCount = 0;
let levelChangeCount = 0;
let lastScore = null;
let lastLevel = null;

scoreManager.onScoreChange((score) => {
  scoreChangeCount++;
  lastScore = score;
  console.log(`  ✓ 计分回调触发 #${scoreChangeCount}: 分数 = ${score}`);
});

levelSystem.onLevelChange = (level) => {
  levelChangeCount++;
  lastLevel = level;
  console.log(`  ✓ 等级回调触发 #${levelChangeCount}: 等级 = ${level}`);
};

levelSystem.onRegister(game);

console.log('\n1️⃣ 测试初始状态:');
console.log(`  初始分数: ${scoreManager.getScore()}`);
console.log(`  初始等级: ${levelSystem.getLevel()}`);
console.log(`  计分回调次数: ${scoreChangeCount}`);
console.log(`  等级回调次数: ${levelChangeCount}`);

console.log('\n2️⃣ 测试分数增加和等级升级:');

scoreManager.addScore(10);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

scoreManager.addScore(50);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

console.log('  达到等级2阈值 (100分):');
scoreManager.addScore(40);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

console.log('  达到等级3阈值 (250分):');
scoreManager.addScore(150);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

console.log('  达到等级5阈值 (800分):');
scoreManager.addScore(550);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

console.log('\n3️⃣ 测试难度参数随等级变化:');
console.log(`  等级 ${levelSystem.getLevel()} 参数:`);
console.log(`    星星生成间隔: ${levelSystem.getSpawnInterval('star')}ms`);
console.log(`    最大星星数: ${levelSystem.getMaxCount('star')}`);
console.log(`    最大陨石数: ${levelSystem.getMaxCount('obstacle')}`);
console.log(`    陨石速度: ${levelSystem.getObstacleSpeed()}`);

console.log('\n4️⃣ 测试重置功能:');
console.log('  调用 reset()...');
levelSystem.reset();
scoreManager.reset();
console.log(`  重置后分数: ${scoreManager.getScore()}`);
console.log(`  重置后等级: ${levelSystem.getLevel()}`);
console.log(`  重置后计分回调次数: ${scoreChangeCount}`);
console.log(`  重置后等级回调次数: ${levelChangeCount}`);

console.log('\n5️⃣ 测试重置后重新升级:');
console.log('  快速达到等级4 (500分):');
scoreManager.addScore(500);
levelSystem.update(16);
console.log(`  当前分数: ${scoreManager.getScore()}, 当前等级: ${levelSystem.getLevel()}`);

console.log('\n📊 测试总结:');
console.log(`  计分回调总次数: ${scoreChangeCount}`);
console.log(`  等级回调总次数: ${levelChangeCount}`);
console.log(`  最终分数: ${lastScore}`);
console.log(`  最终等级: ${lastLevel}`);

const allPassed = scoreChangeCount > 0 && levelChangeCount > 0 && 
                 scoreManager.getScore() === 500 && levelSystem.getLevel() === 4;

console.log(`\n${allPassed ? '✅ 所有测试通过！' : '❌ 部分测试失败'}`);
console.log('\n💡 闭环验证完整流程:');
console.log('  1. ScoreManager.addScore() → 触发 onScoreChange 回调');
console.log('  2. LevelSystem.update() 监测分数变化 → 计算新等级');
console.log('  3. 等级变化 → 触发 onLevelChange 回调');
console.log('  4. 难度参数 (生成间隔/数量/速度) 随等级自动调整');
console.log('  5. reset() 重置分数和等级 → 触发各自回调 → UI 同步更新');
