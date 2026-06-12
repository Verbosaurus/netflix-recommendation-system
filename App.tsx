/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserRecommendations from './pages/UserRecommendations';
import SimilarMovies from './pages/SimilarMovies';
import SimilarUsers from './pages/SimilarUsers';
import MovieExplorer from './pages/MovieExplorer';
import Analytics from './pages/Analytics';
import Trending from './pages/Trending';
import ColdStart from './pages/ColdStart';
import ModelEvaluation from './pages/ModelEvaluation';
import Login from './pages/Login';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="trending" element={<Trending />} />
          <Route path="cold-start" element={<ColdStart />} />
          <Route path="evaluation" element={<ModelEvaluation />} />
          <Route path="recommendations" element={<UserRecommendations />} />
          <Route path="similar-movies" element={<SimilarMovies />} />
          <Route path="similar-users" element={<SimilarUsers />} />
          <Route path="movies" element={<MovieExplorer />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
