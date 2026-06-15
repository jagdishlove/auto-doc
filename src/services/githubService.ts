import { Repository, RepoFile, User } from '../types';

const BASE_URL = 'https://api.github.com';

// Heuristic configuration for finding API files
const API_FILE_PATTERNS = [
  /routes?\//i,        // folders named 'route' or 'routes'
  /controllers?\//i,   // folders named 'controller' or 'controllers'
  /api\//i,            // folders named 'api'
  /server\.(js|ts)$/i, // server.js or server.ts
  /app\.(js|ts)$/i,    // app.js or app.ts
  /index\.(js|ts)$/i,  // index files often contain exports
];

const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.test\./,
  /\.spec\./,
  /dist\//,
  /build\//,
  /\.d\.ts$/,
  /webpack/,
  /babel/,
  /config\//,
];

export const validateToken = async (token: string): Promise<User | null> => {
  try {
    const res = await fetch(`${BASE_URL}/user`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Token validation failed", e);
    return null;
  }
};

export const getRepositories = async (token: string): Promise<Repository[]> => {
  try {
    const res = await fetch(`${BASE_URL}/user/repos?sort=updated&per_page=100&type=all`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    const repos = await res.json();
    return repos;
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Fetches the recursive git tree and filters for interesting "API-like" files
 */
export const getRepositoryFiles = async (token: string, owner: string, repo: string): Promise<RepoFile[]> => {
  try {
    // Get the default branch first
    const repoRes = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, {
      headers: { Authorization: `token ${token}` },
    });
    
    if (!repoRes.ok) throw new Error("Repo not found");
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Fetch the tree recursively
    const treeRes = await fetch(`${BASE_URL}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
      headers: { Authorization: `token ${token}` },
    });
    const treeData = await treeRes.json();
    
    if (!treeData.tree) return [];

    // Filter and Sort files
    const interestingFiles = treeData.tree
      .filter((item: any) => item.type === 'blob') // Only files
      .filter((item: any) => {
        // Exclude irrelevant
        if (EXCLUDED_PATTERNS.some(p => p.test(item.path))) return false;
        
        // Include if matches Node/Express API patterns
        return API_FILE_PATTERNS.some(p => p.test(item.path));
      })
      .map((item: any) => ({
        path: item.path,
        type: 'blob',
        sha: item.sha,
        url: item.url,
        size: item.size
      }))
      // Enhanced sorting to bubble up likely API files
      .sort((a: RepoFile, b: RepoFile) => {
         const score = (path: string) => {
            if (/server\.(js|ts)/.test(path)) return 4;
            if (/app\.(js|ts)/.test(path)) return 3;
            if (/routes?\//.test(path)) return 3;
            if (/api\//.test(path)) return 2;
            if (/controllers?\//.test(path)) return 2;
            if (/index\.(js|ts)/.test(path)) return 1;
            return 0;
         };
         return score(b.path) - score(a.path);
      });

    return interestingFiles;

  } catch (e) {
    console.error("Error fetching file tree", e);
    return [];
  }
};

export const getFileContent = async (token: string, url: string): Promise<string> => {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });
    const data = await res.json();
    
    // GitHub API returns content in base64
    if (data.content && data.encoding === 'base64') {
      try {
         // Handle unicode characters properly in base64
         const binaryString = atob(data.content.replace(/\n/g, ''));
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
           bytes[i] = binaryString.charCodeAt(i);
         }
         return new TextDecoder().decode(bytes);
      } catch (decodeErr) {
         console.error("Base64 decode failed", decodeErr);
         return atob(data.content.replace(/\n/g, '')); // Fallback
      }
    }
    return "";
  } catch (e) {
    console.error("Error fetching file content", e);
    return "";
  }
};