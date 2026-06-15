import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Repository, RepoFile, LogEntry, GeneratedDoc, AnalysisStep } from '../types';
import { getRepositoryFiles, getFileContent } from '../services/githubService';
import { performAstAnalysis, detectApiPatterns } from '../services/astService';
import { generateApiDocs } from '../services/geminiService';
import { generateMarkdown, generateHtmlReport, downloadFile } from '../services/exportService';
import { Navbar } from '../components/Navbar';
import { TerminalLog } from '../components/TerminalLog';
import { DocViewer } from '../components/DocViewer';
import { FolderGit2, FileCode2, Search, ChevronRight, Play, Loader2, Download, FileJson, FileType, X } from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { token } = useAuth();
  const { owner, repo: repoName } = useParams<{ owner: string; repo: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationRepo = (location.state as { repo?: Repository })?.repo;

  const [selectedRepo] = useState<Repository | null>(() => {
    if (locationRepo) return locationRepo;
    if (owner && repoName) {
      return {
        id: 0,
        node_id: '',
        name: repoName,
        full_name: `${owner}/${repoName}`,
        owner: { id: 0, login: owner, name: null, avatar_url: '' },
        description: '',
        stargazers_count: 0,
        language: 'javascript',
        private: false,
        html_url: `https://github.com/${owner}/${repoName}`,
      } as Repository;
    }
    return null;
  });

  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [fileSearch, setFileSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('IDLE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projectDocs, setProjectDocs] = useState<GeneratedDoc[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: Date.now(),
      message,
      type
    }]);
  }, []);

  useEffect(() => {
    if (!selectedRepo || !token) return;
    addLog(`Scanning ${selectedRepo.name} for API structures...`, 'info');
    getRepositoryFiles(token, selectedRepo.owner.login, selectedRepo.name)
      .then(files => {
        setRepoFiles(files);
        if (files.length > 0) {
          addLog(`Found ${files.length} candidate files for API analysis.`, 'success');
          addLog(`Ready to scan. Click 'Auto-Scan Project' to begin.`, 'info');
        } else {
          addLog(`No obvious Express/Node API patterns found. Showing all JS/TS files.`, 'warning');
        }
      })
      .catch(e => addLog(`Failed to scan repository: ${(e as Error).message}`, 'error'));
  }, [selectedRepo?.name]);

  const scanProject = async () => {
    if (repoFiles.length === 0 || !token || !selectedRepo) return;
    setAnalysisStep('BATCH_SCANNING');
    setProjectDocs([]);
    addLog("Starting automated project scan...", "info");

    let generatedCount = 0;
    const MAX_FILES_TO_SCAN = 50;
    const MAX_DOCS_TO_GENERATE = 10;
    const filesToScan = repoFiles.slice(0, MAX_FILES_TO_SCAN);
    addLog(`Queueing top ${filesToScan.length} files for analysis...`, 'info');

    for (const file of filesToScan) {
      if (generatedCount >= MAX_DOCS_TO_GENERATE) {
        addLog(`Analysis limit reached (${MAX_DOCS_TO_GENERATE} files). Stopping scan.`, 'warning');
        break;
      }

      try {
        setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'scanning' as const } : f));
        addLog(`Checking ${file.path}...`, "info");

        const code = await getFileContent(token, file.url!);
        if (!code) {
           addLog(`Skipping ${file.path} (empty/binary)`, "warning");
           setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'skipped' as const } : f));
           continue;
        }

        const hasApiPatterns = detectApiPatterns(code);
        if (!hasApiPatterns) {
           addLog(`Skipping ${file.path} (no API patterns detected)`, "info");
           setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'skipped' as const } : f));
           continue;
        }

        addLog(`Patterns detected in ${file.path}. Generating docs...`, "success");

        const astData = await performAstAnalysis(code, selectedRepo.language);
        const doc = await generateApiDocs(code, file.path, astData);

        if (doc.isMock) {
          addLog("\u26a0\ufe0f Using Mock Data: Gemini API Key invalid or missing.", "warning");
        }

        setProjectDocs(prev => [...prev, doc]);
        setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'analyzed' as const } : f));
        generatedCount++;

      } catch (e) {
        addLog(`Error analyzing ${file.path}: ${(e as Error).message}`, "error");
        setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'error' as const } : f));
      }
    }

    setAnalysisStep('COMPLETE');
    if (generatedCount === 0) {
      addLog("Scan complete. No documented APIs found in top candidates.", "warning");
    } else {
      addLog(`Scan complete. Generated docs for ${generatedCount} files.`, "success");
    }
  };

  const startSingleAnalysis = async (file: RepoFile) => {
    if (!selectedRepo || !file.url || !token) return;

    setSelectedFile(file);
    setAnalysisStep('FETCHING');
    setLogs([]);

    addLog(`Initiating manual analysis for ${file.path}...`);

    try {
      addLog("Fetching file content...", "info");
      const code = await getFileContent(token, file.url);

      if (!code) throw new Error("Failed to retrieve content");

      setAnalysisStep('AST_PARSING');
      addLog("Running AST analysis...", "info");
      const astData = await performAstAnalysis(code, selectedRepo.language);

      setAnalysisStep('LLM_GENERATING');
      addLog("Generating documentation with Gemini...", "info");
      const doc = await generateApiDocs(code, file.path, astData);

      if (doc.isMock) {
         addLog("\u26a0\ufe0f Warning: Results are simulated (Invalid API Key).", "warning");
      }

      setProjectDocs(prev => {
        const filtered = prev.filter(d => d.fileName !== doc.fileName);
        return [...filtered, doc];
      });

      setRepoFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'analyzed' as const } : f));
      setAnalysisStep('COMPLETE');
      addLog("Documentation generated successfully!", "success");

    } catch (error) {
      addLog("Process failed: " + (error as Error).message, "error");
      setAnalysisStep('IDLE');
    }
  };

  const handleExport = (type: 'markdown' | 'json' | 'html') => {
    if (!selectedRepo || projectDocs.length === 0) return;

    const safeName = selectedRepo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (type === 'markdown') {
      const content = generateMarkdown(selectedRepo.name, projectDocs);
      downloadFile(`${safeName}_api_docs.md`, content, 'text/markdown');
      addLog("Exported documentation as Markdown.", "success");
    } else if (type === 'html') {
      const content = generateHtmlReport(selectedRepo.name, projectDocs);
      downloadFile(`${safeName}_docs_report.html`, content, 'text/html');
      addLog("Exported documentation as HTML Report.", "success");
    } else {
      const content = JSON.stringify({ meta: { repo: selectedRepo.name, date: new Date().toISOString() }, docs: projectDocs }, null, 2);
      downloadFile(`${safeName}_api_data.json`, content, 'application/json');
      addLog("Exported raw data as JSON.", "success");
    }
    setShowExportMenu(false);
  };

  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Repository not found.</p>
          <button onClick={() => navigate('/dashboard')} className="text-brand-400 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredFiles = repoFiles.filter(f =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="h-screen bg-dark-950 text-white flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-dark-900 border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <FolderGit2 className="w-4 h-4" />
                <span className="truncate max-w-[180px]" title={selectedRepo.name}>{selectedRepo.name}</span>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-dark-950 border border-white/10 rounded-md pl-8 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
              {fileSearch && (
                <button onClick={() => setFileSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {repoFiles.length > 0 && (
              <button
                  onClick={scanProject}
                  disabled={analysisStep === 'BATCH_SCANNING'}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded transition-colors"
                >
                  {analysisStep === 'BATCH_SCANNING' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  {analysisStep === 'BATCH_SCANNING' ? 'Scanning...' : 'Auto-Scan Project'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {repoFiles.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                  Scanning file structure...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                 No files found.
              </div>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  {fileSearch ? 'Search Results' : 'Detected Candidates'}
                </div>
                {filteredFiles.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => startSingleAnalysis(file)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono cursor-pointer transition-colors mb-1 ${
                      selectedFile?.path === file.path
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className="w-4 h-4 shrink-0" />
                      <span className="truncate" title={file.path}>{file.path}</span>
                    </div>
                    {file.status && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                          file.status === 'analyzed' ? 'bg-green-500' :
                          file.status === 'error' ? 'bg-red-500' :
                          file.status === 'skipped' ? 'bg-gray-700' :
                          file.status === 'scanning' ? 'bg-blue-500 animate-pulse' : 'bg-transparent'
                      }`} title={file.status} />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-dark-900/50">
            <div className="flex items-center gap-2 text-sm text-gray-400 overflow-hidden flex-1 mr-4">
                <span onClick={() => navigate('/dashboard')} className="hover:text-white cursor-pointer hover:underline shrink-0">Dashboard</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="text-white truncate shrink-0 max-w-[150px]">{selectedRepo.name}</span>
                {projectDocs.length > 0 && !selectedFile && (
                  <>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="text-brand-400">Project Overview</span>
                  </>
                )}
                {selectedFile && (
                  <>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="text-brand-400 font-mono truncate">{selectedFile.path}</span>
                  </>
                )}
            </div>

            <div className="flex items-center gap-3">
              {analysisStep === 'BATCH_SCANNING' && (
                  <div className="flex items-center gap-2 text-xs text-brand-400 animate-pulse bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                    <div className="w-2 h-2 bg-brand-500 rounded-full" />
                    Auto-Scanning...
                  </div>
              )}

              {projectDocs.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>

                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-dark-900 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                        <button onClick={() => handleExport('markdown')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                          <FileType className="w-4 h-4 text-blue-400" />
                          Export as Markdown
                        </button>
                        <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors border-t border-white/5">
                          <FileCode2 className="w-4 h-4 text-orange-400" />
                          Export HTML Report
                        </button>
                        <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors border-t border-white/5">
                          <FileJson className="w-4 h-4 text-yellow-400" />
                          Export as JSON
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden p-6 gap-6">
            <div className="w-1/3 flex flex-col gap-4 min-w-[300px]">
              <div className="flex-1 min-h-0">
                <TerminalLog logs={logs} />
              </div>
            </div>

            <div className="w-2/3 min-h-0 bg-dark-900/30 rounded-xl border border-white/5 overflow-hidden relative">
              <DocViewer
                  projectDocs={projectDocs}
                  selectedDoc={projectDocs.find(d => d.fileName === selectedFile?.path) || null}
                  loading={analysisStep === 'FETCHING' || analysisStep === 'AST_PARSING' || analysisStep === 'LLM_GENERATING'}
                  isBatchScanning={analysisStep === 'BATCH_SCANNING'}
                  onViewDoc={(fileName) => {
                    const file = repoFiles.find(f => f.path === fileName);
                    if (file) setSelectedFile(file);
                  }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
