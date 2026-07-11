import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="text-gray-400 text-lg">Page not found</p>
      <Link
        to={user ? '/dashboard' : '/'}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        <Home className="w-4 h-4" />
        {user ? 'Go to Dashboard' : 'Go Home'}
      </Link>
    </div>
  );
};
