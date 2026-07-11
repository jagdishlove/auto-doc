import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Repository } from '../types';
import { getRepositories } from '../services/githubService';
import { Navbar } from '../components/Navbar';
import { FolderGit2, Search, ArrowRight, ChevronLeft, ChevronRight, Globe, Lock, Building2, Users } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PER_PAGE = 12;

interface RepoSection {
  key: string;
  label: string;
  icon: React.ReactNode;
  repos: Repository[];
}

const RepoSkeletonCard: React.FC = () => (
  <div className="bg-dark-900 border border-white/10 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton circle width={40} height={40} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
      <div className="flex-1">
        <Skeleton width="60%" height={18} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
        <Skeleton width="40%" height={12} baseColor="#1e1e1e" highlightColor="#2a2a2a" style={{ marginTop: 6 }} />
      </div>
    </div>
    <Skeleton count={2} baseColor="#1e1e1e" highlightColor="#2a2a2a" style={{ marginBottom: 8 }} />
    <div className="flex items-center gap-4">
      <Skeleton width={50} height={12} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
      <Skeleton width={40} height={12} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
      <Skeleton width={35} height={12} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoSearch, setRepoSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (token) {
      setLoading(true);
      getRepositories(token).then((data) => {
        setRepos(data);
        setLoading(false);
      });
    }
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [repoSearch, activeTab]);

  const sections = useMemo<RepoSection[]>(() => {
    const userLogin = user?.login || '';
    const owned: Repository[] = [];
    const privateOwned: Repository[] = [];
    const orgs: Repository[] = [];
    const collabs: Repository[] = [];

    for (const repo of repos) {
      const isOwner = repo.owner.login === userLogin;
      const isOrg = repo.owner.type === 'Organization';

      if (isOwner && !repo.private) {
        owned.push(repo);
      } else if (isOwner && repo.private) {
        privateOwned.push(repo);
      } else if (isOrg) {
        orgs.push(repo);
      } else {
        collabs.push(repo);
      }
    }

    const result: RepoSection[] = [];
    if (owned.length) result.push({ key: 'public', label: 'My Public Repos', icon: <Globe className="w-4 h-4" />, repos: owned });
    if (privateOwned.length) result.push({ key: 'private', label: 'My Private Repos', icon: <Lock className="w-4 h-4" />, repos: privateOwned });
    if (orgs.length) result.push({ key: 'orgs', label: 'Organizations', icon: <Building2 className="w-4 h-4" />, repos: orgs });
    if (collabs.length) result.push({ key: 'collabs', label: 'Collaborations', icon: <Users className="w-4 h-4" />, repos: collabs });

    return result;
  }, [repos, user]);

  const tabs = useMemo(() => {
    const all = [{ key: 'all', label: 'All', count: repos.length }];
    for (const s of sections) {
      all.push({ key: s.key, label: s.label, count: s.repos.length });
    }
    return all;
  }, [sections, repos]);

  const filteredRepos = useMemo(() => {
    const searchLower = repoSearch.toLowerCase();
    const result: Repository[] = [];

    for (const section of sections) {
      if (activeTab !== 'all' && section.key !== activeTab) continue;
      for (const repo of section.repos) {
        if (
          !searchLower ||
          repo.name.toLowerCase().includes(searchLower) ||
          (repo.description && repo.description.toLowerCase().includes(searchLower))
        ) {
          result.push(repo);
        }
      }
    }

    return result;
  }, [sections, activeTab, repoSearch]);

  const totalPages = Math.ceil(filteredRepos.length / PER_PAGE);
  const paginatedRepos = filteredRepos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const selectRepo = (repo: Repository) => {
    navigate(`/editor/${repo.owner.login}/${repo.name}`, { state: { repo } });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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

        {loading ? (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={80 + i * 20} height={32} borderRadius={8} baseColor="#1e1e1e" highlightColor="#2a2a2a" />
            ))}
          </div>
        ) : repos.length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 -mx-1 px-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === t.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/5'
                }`}
              >
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === t.key ? 'bg-white/20' : 'bg-white/5'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoSkeletonCard key={i} />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-20 opacity-50">
             <div className="animate-pulse mb-4">Loading repositories...</div>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
            <p className="text-gray-400">No repositories found matching "{repoSearch}"</p>
            <button onClick={() => { setRepoSearch(''); setActiveTab('all'); }} className="text-brand-400 text-sm mt-2 hover:underline">Clear filter</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRepos.map(repo => {
                const isOwner = repo.owner.login === user?.login;
                const isOrg = repo.owner.type === 'Organization';
                const categoryLabel = isOwner
                  ? (repo.private ? 'Private' : 'Public')
                  : (isOrg ? repo.owner.login : `by ${repo.owner.login}`);
                const categoryColor = isOwner
                  ? (repo.private ? 'text-yellow-500' : 'text-brand-400')
                  : (isOrg ? 'text-purple-400' : 'text-green-400');

                return (
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
                      <span className={`font-medium ${categoryColor}`}>{categoryLabel}</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${repo.language === 'TypeScript' || repo.language === 'JavaScript' ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
                        {repo.language || 'Unknown'}
                      </span>
                      <span>⭐ {repo.stargazers_count}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-gray-400">
                  Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
