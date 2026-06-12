import * as fs from 'fs';
import * as path from 'path';

console.log('[Model Train] Loading preprocessed training data from results/train_split.json...');
const resultsDir = path.join(process.cwd(), 'results');
const trainDataPath = path.join(resultsDir, 'train_split.json');

if (!fs.existsSync(trainDataPath)) {
  console.error('[Model Train] Error: Training data not found. Run "npm run preprocess" first.');
  process.exit(1);
}

const trainData: { userId: string, movieId: string, rating: number }[] = JSON.parse(fs.readFileSync(trainDataPath, 'utf8'));

// Basic SVD Matrix Factorization using SGD
const LF = 10; // latent features
const learningRate = 0.01;
const regularization = 0.05;
const epochs = 50;

const userLatent: Record<string, number[]> = {};
const itemLatent: Record<string, number[]> = {};

// Initialize latent matrices
trainData.forEach(r => {
  if (!userLatent[r.userId]) {
    userLatent[r.userId] = Array(LF).fill(0).map(() => Math.random() * 0.1);
  }
  if (!itemLatent[r.movieId]) {
    itemLatent[r.movieId] = Array(LF).fill(0).map(() => Math.random() * 0.1);
  }
});

let globalBias = trainData.length > 0 ? trainData.reduce((sum, r) => sum + r.rating, 0) / trainData.length : 3.0;
const userBias: Record<string, number> = {};
const itemBias: Record<string, number> = {};

trainData.forEach(r => {
  if (userBias[r.userId] === undefined) userBias[r.userId] = 0;
  if (itemBias[r.movieId] === undefined) itemBias[r.movieId] = 0;
});

console.log(`[Model Train] Initializing Hybrid SVD Model (SGD) with ${LF} factors...`);

for (let epoch = 1; epoch <= epochs; epoch++) {
  let loss = 0;
  for (const {userId, movieId, rating} of trainData) {
    const pu = userLatent[userId];
    const qi = itemLatent[movieId];
    const bu = userBias[userId];
    const bi = itemBias[movieId];

    let dot = 0;
    for (let f = 0; f < LF; f++) {
      dot += pu[f] * qi[f];
    }
    
    const pred = globalBias + bu + bi + dot;
    const error = rating - pred;
    loss += error * error;

    userBias[userId] += learningRate * (error - regularization * bu);
    itemBias[movieId] += learningRate * (error - regularization * bi);

    for (let f = 0; f < LF; f++) {
      const puf = pu[f];
      const qif = qi[f];
      pu[f] += learningRate * (error * qif - regularization * puf);
      qi[f] += learningRate * (error * puf - regularization * qif);
    }
  }
  
  if (epoch === 1 || epoch % 10 === 0 || epoch === epochs) {
    console.log(`[Model Train] Epoch ${epoch}/${epochs} - RMSE Loss: ${Math.sqrt(loss / Math.max(trainData.length, 1)).toFixed(4)}`);
  }
}

const model = {
  globalBias,
  userBias,
  itemBias,
  userLatent,
  itemLatent,
  LF
};

fs.writeFileSync(path.join(resultsDir, 'hybrid_model_weights.json'), JSON.stringify(model));
console.log('[Model Train] Training complete. Model artifacts saved to results/hybrid_model_weights.json.');
