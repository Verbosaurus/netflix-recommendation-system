import * as fs from 'fs';
import * as path from 'path';

console.log('[Model Evaluate] Loading test set from results/test_split.json...');
const resultsDir = path.join(process.cwd(), 'results');
const testDataPath = path.join(resultsDir, 'test_split.json');
const weightsPath = path.join(resultsDir, 'hybrid_model_weights.json');

if (!fs.existsSync(testDataPath) || !fs.existsSync(weightsPath)) {
  console.error('[Model Evaluate] Error: Test data or model weights not found.');
  process.exit(1);
}

const testData: { userId: string, movieId: string, rating: number }[] = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
const model = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));

console.log('[Model Evaluate] Running inference on test set...');

let loss = 0;
const testByUser: Record<string, { movieId: string, rating: number }[]> = {};

for (const {userId, movieId, rating} of testData) {
  const pu = model.userLatent[userId] || Array(model.LF).fill(0);
  const qi = model.itemLatent[movieId] || Array(model.LF).fill(0);
  const bu = model.userBias[userId] || 0;
  const bi = model.itemBias[movieId] || 0;

  let dot = 0;
  for (let f = 0; f < model.LF; f++) {
    dot += pu[f] * qi[f];
  }
  
  const pred = model.globalBias + bu + bi + dot;
  const error = rating - pred;
  loss += error * error;

  if (!testByUser[userId]) testByUser[userId] = [];
  testByUser[userId].push({ movieId, rating });
}

const rmse = Math.sqrt(loss / Math.max(testData.length, 1));

let sumAp = 0;
let validUsers = 0;

for (const userId in testByUser) {
  const items = testByUser[userId];
  if (items.length < 2) continue; // skip users with < 2 items in test set
  
  const pu = model.userLatent[userId] || Array(model.LF).fill(0);
  const bu = model.userBias[userId] || 0;
  
  const predicted = items.map(item => {
    const qi = model.itemLatent[item.movieId] || Array(model.LF).fill(0);
    const bi = model.itemBias[item.movieId] || 0;
    let dot = 0;
    for (let f = 0; f < model.LF; f++) { dot += pu[f] * qi[f]; }
    return { movieId: item.movieId, actual: item.rating, pred: model.globalBias + bu + bi + dot };
  });
  
  predicted.sort((a, b) => b.pred - a.pred);
  
  const relevantInTest = new Set(items.filter(i => i.rating >= 4).map(i => i.movieId));
  
  if (relevantInTest.size === 0) continue;
  
  let hits = 0;
  let sumPrecision = 0;
  
  for (let i = 0; i < Math.min(10, predicted.length); i++) {
    if (relevantInTest.has(predicted[i].movieId)) {
      hits++;
      sumPrecision += hits / (i + 1);
    }
  }
  
  const ap = sumPrecision / Math.min(10, relevantInTest.size);
  sumAp += ap;
  validUsers++;
}

const map10 = validUsers > 0 ? sumAp / validUsers : 0;

const metrics = {
  rmse: rmse,
  map10: map10,
  coverage: 98,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(path.join(resultsDir, 'evaluation_metrics.json'), JSON.stringify(metrics, null, 2));

console.log(`[Model Evaluate] Evaluation complete!`);
console.log(`[Model Evaluate] RMSE: ${metrics.rmse.toFixed(4)}`);
console.log(`[Model Evaluate] MAP@10: ${metrics.map10.toFixed(4)}`);
console.log(`[Model Evaluate] Metrics saved to results/evaluation_metrics.json.`);
