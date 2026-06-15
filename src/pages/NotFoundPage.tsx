import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
    <h1 className="text-6xl font-bold text-white">404</h1>
    <p className="text-gray-400 text-lg">Page not found</p>
    <Link
      to="/dashboard"
      className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      <Home className="w-4 h-4" />
      Go to Dashboard
    </Link>
  </div>
);
