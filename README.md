# Netflix Prize Recommender System

## Overview
This repository contains our competition submission for the Netflix Prize recommendation challenge. We developed a robust **Hybrid Ensemble Model** designed to tackle data sparsity and the cold start problem, blending advanced latent factor derivation with robust neighborhood mapping. The application also provides an interactive frontend to visualize dataset statistics, model evaluation metrics, cold start experiences, and real-time recommendations.

## Dataset
The dataset utilized is the **Netflix Prize Dataset**, consisting of:
- **100,480,507** ratings (from 1 to 5 stars)
- **480,189** anonymous users
- **17,770** movies
- A high data sparsity of **98.82%**, meaning the vast majority of possible user-movie interactions are missing.

*Note: For the purposes of this demo environment, data processing pipeline scripts and an extensive pre-computed mock dataset are used to demonstrate inference and evaluation capabilities.*

## Architecture
Our system architecture comprises:
- **Node.js/Express Backend:** API layer serving data, handling algorithmic combinations, and simulating ML workloads.
- **Data Engineering Pipeline:** Dedicated scripts (`scripts/`) for processing, training models, running evaluations, and generating recommendations.
- **React/Vite Frontend:** A Single-Page Application (SPA) offering insightful visualization into model performance, EDA (Exploratory Data Analysis), trends, and the hybrid recommender engine.

## Recommendation Approach
- Matrix Factorization (SVD-style latent factor model)
- User and Item Bias Modeling
- Top-N Recommendation Generation

## Installation
Ensure you have **Node.js** (v18+) installed. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

## How to Run

### Command Line ML Pipeline
```bash
# 1. Start the Data Processing pipeline (clean data, create train/test split)
npm run preprocess

# 2. Train the models and save artifacts
npm run train

# 3. Evaluate the models and compute metrics (RMSE, MAP@10)
npm run evaluate

# 4. Generate Top-10 recommendations for a specific user ID
npm run recommend -- 12345
```

### Full-Stack Web Application Prototype
To launch the interactive frontend dashboard with EDA and live inference capabilities:
```bash
# Start the development server
npm run dev

# Or build and start for production
npm run build
npm run start
```
The application will be accessible at `http://localhost:3000`.

## Evaluation
The evaluation pipeline relies on the test split (approx. 20% of data) and computes standard algorithmic benchmarks.
- **RMSE (Root Mean Square Error):** Measures the average magnitude of prediction errors. Lower is better.
- **MAP@10 (Mean Average Precision at 10):** Measures the precision and ranking quality of the top 10 recommended output list. Higher is better.

## Results

### Example Evaluation Metrics
- **RMSE:** Generated through evaluation pipeline
- **MAP@10:** Generated through evaluation pipeline

### To reproduce:
```bash
npm run preprocess
npm run train
npm run evaluate
```

## Future Improvements
- **Deep Learning Integration (Neural CF):** Introduce deep neural networks to capture non-linear user-item interactions.
- **Content-Based Filtering:** Ingest movie metadata (synopsis, cast, directors) to improve cold-start routing prior to user ratings.
- **Real-Time Data Streaming:** Transition from batch-trained pipelines to incremental online stochastic gradient descent (SGD) for updating model weights in real-time.
