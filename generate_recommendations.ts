import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const userId = args[0] || '1042';

console.log(`[Inference] Loading Hybrid model artifacts...`);

const resultsDir = path.join(process.cwd(), 'results');
const weightsPath = path.join(resultsDir, 'hybrid_model_weights.json');

if (!fs.existsSync(weightsPath)) {
  console.error('[Inference] Error: Model weights not found. Run training first.');
  process.exit(1);
}

const model = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));

// Load movies
const moviesDataPath = path.join(process.cwd(), 'data', 'movie_titles.csv');
const moviesList: { id: string, title: string }[] = [];
if (fs.existsSync(moviesDataPath)) {
  const lines = fs.readFileSync(moviesDataPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    moviesList.push({ id: parts[0], title: parts.slice(2).join(',') });
  }
} else {
  // if not found, just use item params
  for (const movieId in model.itemBias) {
    moviesList.push({ id: movieId, title: `Movie ${movieId}` });
  }
}

console.log(`[Inference] Generating Top-10 recommendations for user_id: ${userId}...`);

const pu = model.userLatent[userId] || Array(model.LF).fill(0);
const bu = model.userBias[userId] || 0;

const recommendations = moviesList.map(movie => {
  const qi = model.itemLatent[movie.id] || Array(model.LF).fill(0);
  const bi = model.itemBias[movie.id] || 0;
  
  let dot = 0;
  for (let f = 0; f < model.LF; f++) {
    dot += pu[f] * qi[f];
  }
  
  const pred = model.globalBias + bu + bi + dot;
  return { movieId: movie.id, title: movie.title, predictedRating: pred };
});

recommendations.sort((a, b) => b.predictedRating - a.predictedRating);

const top10 = recommendations.slice(0, 10).map((r, index) => ({
  rank: index + 1,
  movieId: r.movieId,
  title: r.title,
  predictedRating: r.predictedRating.toFixed(4)
}));

console.log(`\n=== Top 10 Recommendations for User ${userId} ===`);
console.table(top10);
console.log(`\n[Inference] Recommendations generation complete.`);
