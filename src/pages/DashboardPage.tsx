import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Repository } from '../types';
import { getRepositories } from '../services/githubService';
import { Navbar } from '../components/Navbar';
import { FolderGit2, Search, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [repoSearch, setRepoSearch] = useState('');

  useEffect(() => {
    if (token) {
      getRepositories(token).then(setRepos);
    }
  }, [token]);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(repoSearch.toLowerCase()))
  );

  const selectRepo = (repo: Repository) => {
    navigate(`/editor/${repo.owner.login}/${repo.name}`, { state: { repo } });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Repositories</h2>
            <p className="text-gray-400">Select a project to scan for API endpoints.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 w-64 text-white"
            />
          </div>
        </div>

        {repos.length === 0 ? (
          <div className="text-center py-20 opacity-50">
             <div className="animate-pulse mb-4">Loading repositories...</div>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
            <p className="text-gray-400">No repositories found matching "{repoSearch}"</p>
            <button onClick={() => setRepoSearch('')} className="text-brand-400 text-sm mt-2 hover:underline">Clear filter</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map(repo => (
              <div
                key={repo.id}
                onClick={() => selectRepo(repo)}
                className="group bg-dark-900 border border-white/10 rounded-xl p-6 hover:border-brand-500/50 hover:bg-dark-800 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    {repo.private ? <FolderGit2 className="w-5 h-5 text-yellow-500" /> : <FolderGit2 className="w-5 h-5 text-brand-500" />}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-lg truncate" title={repo.name}>{repo.name}</h3>
                    <span className="text-xs text-gray-500 truncate block" title={repo.full_name}>{repo.full_name}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{repo.description || "No description provided."}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${repo.language === 'TypeScript' || repo.language === 'JavaScript' ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
                    {repo.language || 'Unknown'}
                  </span>
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
