import React from "react";
import { GeneratedDoc, ApiEndpoint } from "../types";
import { FileText, Box, Zap, Database, AlertTriangle } from "lucide-react";
import { EndpointCard } from "./EndpointCard";

interface DocViewerProps {
  projectDocs: GeneratedDoc[];
  selectedDoc: GeneratedDoc | null;
  loading: boolean;
  isBatchScanning: boolean;
  onViewDoc: (fileName: string) => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  projectDocs,
  selectedDoc,
  loading,
  isBatchScanning,
  onViewDoc,
}) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="animate-pulse">Analyzing Codebase...</p>
      </div>
    );
  }

  if (isBatchScanning && projectDocs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
        <div className="relative w-12 h-12 mb-3">
          <div className="absolute inset-0 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p>Scanning multiple files...</p>
        <p className="text-xs text-gray-600 mt-2">
          Checking heuristics and finding endpoints
        </p>
      </div>
    );
  }

  if (projectDocs.length === 0 && !selectedDoc) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p>No documentation generated yet.</p>
        <p className="text-sm mt-2">
          Select a file or click{" "}
          <span className="text-brand-400 font-bold">Auto-Scan</span> to begin.
        </p>
      </div>
    );
  }

  if (selectedDoc) {
    return (
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-dark-800 rounded-xl border border-white/10 p-8 shadow-xl">
          <div className="border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-500 border border-brand-500/20">
                Generated Documentation
              </span>
              {selectedDoc.isMock && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Simulated (Mock Mode)
                </span>
              )}
              <div className="flex-1"></div>
              <button
                onClick={() => onViewDoc("")}
                className="text-gray-500 text-xs hover:text-white transition-colors hover:underline"
              >
                ← Back to Project Overview
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedDoc.fileName}
            </h1>
            <p className="text-gray-400 leading-relaxed">
              {selectedDoc.overview}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-md">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {selectedDoc.astMetrics.functionsFound}
                </div>
                <div className="text-xs text-gray-400 uppercase">Functions</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-md">
                <Box className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {selectedDoc.astMetrics.classesFound}
                </div>
                <div className="text-xs text-gray-400 uppercase">Classes</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {selectedDoc.astMetrics.importsFound}
                </div>
                <div className="text-xs text-gray-400 uppercase">Deps</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Endpoints & Methods
            </h2>

            {selectedDoc.endpoints.length === 0 && (
              <p className="text-gray-500 italic">
                No public endpoints detected in this file.
              </p>
            )}

            {selectedDoc.endpoints.map((endpoint, idx) => (
              <EndpointCard key={idx} endpoint={endpoint} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allEndpoints = projectDocs.flatMap((doc) =>
    doc.endpoints.map((ep) => ({ ...ep, sourceFile: doc.fileName })),
  );

  const hasMockData = projectDocs.some((d) => d.isMock);

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="bg-dark-800 rounded-xl border border-white/10 p-8 shadow-xl min-h-full">
        <div className="border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white">Project Overview</h1>
            {hasMockData && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Some results are simulated
              </span>
            )}
          </div>
          <p className="text-gray-400">
            Consolidated API documentation from {projectDocs.length} analyzed
            file{projectDocs.length !== 1 && "s"}.
          </p>
        </div>

        {allEndpoints.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white/5 rounded-lg">
            <p>Files analyzed, but no clear API endpoints were found.</p>
            <p className="text-sm mt-2">
              Try manually selecting a different file.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allEndpoints.map((endpoint, idx) => (
              <div key={idx} className="relative">
                <div className="absolute top-3.5 right-12 z-10">
                  <button
                    onClick={() => onViewDoc(endpoint.sourceFile!)}
                    className="flex items-center gap-1 text-[10px] bg-dark-950/80 px-2 py-1 rounded text-gray-400 hover:text-white border border-white/10 hover:border-brand-500/30 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    {endpoint.sourceFile}
                  </button>
                </div>
                <EndpointCard endpoint={endpoint} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
