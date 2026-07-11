import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Github, KeyRound, ExternalLink } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { token, isAuthenticating, authError, login } = useAuth();
  const navigate = useNavigate();
  const [localToken, setLocalToken] = React.useState(token);

  const handleLogin = async () => {
    if (!localToken) return;
    const success = await login(localToken);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <div className="mb-8 flex justify-center">
          <img src="/logo.svg" alt="AutoDoc AI" className="w-20 h-20 drop-shadow-2xl" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          AutoDoc <span className="text-brand-400">AI</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Connect your GitHub to automatically generate API docs using AST + Gemini.
        </p>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">

          <div className="mb-6 bg-brand-900/30 border border-brand-500/20 rounded-lg p-4">
             <div className="flex items-start gap-3">
                <div className="mt-1 bg-brand-500/20 p-1.5 rounded-full">
                   <KeyRound className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-brand-100 mb-1">Authentication Required</h3>
                  <p className="text-xs text-brand-200/70 leading-relaxed">
                    Client-side apps cannot securely perform GitHub SSO (OAuth) without a backend. Please use a Personal Access Token.
                  </p>
                  <a
                    href="https://github.com/settings/tokens/new?description=AutoDoc%20AI%20(Browser)&scopes=repo,read:user"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-md mt-3 transition-colors"
                  >
                    Generate Token Automatically <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
             </div>
          </div>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paste Token Here
          </label>
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <KeyRound className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="password"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-dark-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className={`w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/20 ${isAuthenticating ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isAuthenticating ? (
              <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Github className="w-5 h-5" />
                <span>Connect GitHub</span>
              </>
            )}
          </button>

          {authError && (
             <p className="text-red-400 text-xs mt-3 text-center animate-fade-in">{authError}</p>
          )}
        </div>
      </div>
    </div>
  );
};
