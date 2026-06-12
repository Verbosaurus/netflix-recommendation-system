import * as fs from 'fs';
import * as path from 'path';

const inputDataPath = path.join(process.cwd(), 'data', 'combined_data_1.txt');
const resultsDir = path.join(process.cwd(), 'results');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

console.log('[Data Processing] Starting dataset pipeline...');
console.log(`[Data Processing] Loading Netflix dataset from ${inputDataPath}...`);

try {
  if (!fs.existsSync(inputDataPath)) {
    throw new Error(`Data file not found: ${inputDataPath}`);
  }
  
  const data = fs.readFileSync(inputDataPath, 'utf8').split('\n');

  const allRatings: { userId: string, movieId: string, rating: number }[] = [];
  let currentMovieId = '';

  for (const line of data) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.endsWith(':')) {
      currentMovieId = trimmed.slice(0, -1);
    } else {
      const parts = trimmed.split(',');
      if (parts.length >= 2) {
        allRatings.push({
          userId: parts[0],
          movieId: currentMovieId,
          rating: parseFloat(parts[1])
        });
      }
    }
  }

  console.log(`[Data Processing] Parsed ${allRatings.length} ratings.`);
  console.log('[Data Processing] Generating 80/20 train/test split...');

  // Shuffle array predictably for testability, or randomly
  Math.seedrandom ? null : Math.random; // just a note
  for (let i = allRatings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allRatings[i], allRatings[j]] = [allRatings[j], allRatings[i]];
  }

  const splitIndex = Math.floor(allRatings.length * 0.8);
  const trainData = allRatings.slice(0, splitIndex);
  const testData = allRatings.slice(splitIndex);

  fs.writeFileSync(path.join(resultsDir, 'train_split.json'), JSON.stringify(trainData));
  fs.writeFileSync(path.join(resultsDir, 'test_split.json'), JSON.stringify(testData));

  console.log(`[Data Processing] Data cleaned and saved to results directory. Train: ${trainData.length}, Test: ${testData.length}.`);
  console.log('[Data Processing] Pipeline completed successfully.');
} catch (e) {
  console.error('[Data Processing] Failed:', e);
}
