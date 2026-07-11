import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-16 border-b border-white/10 bg-dark-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img src="/logo.svg" alt="AutoDoc AI" className="w-8 h-8" />
        <span className="font-bold text-lg hidden sm:block">AutoDoc AI</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-white/5 rounded-full pl-2 pr-4 py-1 border border-white/10">
            <img src={user.avatar_url} alt="User" className="w-8 h-8 rounded-full" />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user.name || user.login}</span>
              <span className="text-[10px] text-gray-500 leading-none mt-1">Connected</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
