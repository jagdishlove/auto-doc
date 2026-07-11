export interface User {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email?: string | null;
  type?: string;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: User;
  description: string;
  stargazers_count: number;
  language: string;
  private: boolean;
  html_url: string;
  fork?: boolean;
}

export interface RepoFile {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
  content?: string;
  status?: 'pending' | 'scanning' | 'analyzed' | 'skipped' | 'error';
}

export interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: { type: string; description: string };
  sourceFile?: string;
}

export interface GeneratedDoc {
  fileName: string;
  overview: string;
  endpoints: ApiEndpoint[];
  astMetrics: {
    functionsFound: number;
    classesFound: number;
    importsFound: number;
  };
  isMock?: boolean;
}

export type AnalysisStep = 'IDLE' | 'FETCHING' | 'AST_PARSING' | 'LLM_GENERATING' | 'COMPLETE' | 'BATCH_SCANNING';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AstAnalysisResult {
  functions: string[];
  classes: string[];
  imports: string[];
  routesFound: { method: string; path: string }[];
}
