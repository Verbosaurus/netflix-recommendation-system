export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  averageRating: number;
  totalRatings: number;
  popularityScore: number;
  posterUrl?: string;
}

export interface User {
  id: string;
  joinDate: string;
  ratingsCount: number;
  favoriteGenres: string[];
}

export interface Recommendation {
  movie: Movie;
  predictedRating: number;
  confidenceScore: number;
  explanation: string;
  rank: number;
  hybridMetrics?: {
    svdContribution: number;
    itemCfContribution: number;
    finalScore: number;
  };
}

export interface SimilarMovie {
  movie: Movie;
  similarityScore: number;
  rank: number;
}

export interface SimilarUser {
  user: User;
  similarityScore: number;
  commonMoviesCount: number;
  topSharedGenre: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalRatings: number;
  sparsityPercentage: number;
  status: string;
  activeModels: number;
  avgLatencyMs: number;
}

// Model types
export type RecommendationModelType = 'popularity' | 'user-cf' | 'item-cf' | 'svd' | 'als' | 'hybrid';
