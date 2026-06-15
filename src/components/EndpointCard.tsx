import React, { useState } from 'react';
import { ApiEndpoint } from '../types';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface EndpointCardProps {
  endpoint: ApiEndpoint;
}

export const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    POST: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
    PUT: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    PATCH: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
  };

  const baseColor = methodColors[endpoint.method] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <div className={`group rounded-lg border overflow-hidden transition-all ${expanded ? 'bg-dark-900 border-white/20' : 'bg-dark-900 border-white/10 hover:border-white/20'}`}>
      <div
        className="px-4 py-3 cursor-pointer flex items-center justify-between select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${baseColor}`}>
            {endpoint.method || 'FUNC'}
          </span>
          <code className="text-sm text-gray-200 font-mono truncate" title={endpoint.path}>{endpoint.path}</code>
          <p className="text-xs text-gray-500 truncate hidden sm:block"> - {endpoint.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyPath} className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Copy path">
             {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className="p-1 text-gray-500">
             {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-white/5 bg-black/20 space-y-5 animate-fade-in">
          <div>
             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
             <p className="text-gray-300 text-sm leading-relaxed">{endpoint.summary}</p>
          </div>

          {endpoint.parameters.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parameters</h4>
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-white/5">
                    <tr>
                      <th className="px-3 py-2 border-b border-white/5">Name</th>
                      <th className="px-3 py-2 border-b border-white/5">Type</th>
                      <th className="px-3 py-2 border-b border-white/5">Required</th>
                      <th className="px-3 py-2 border-b border-white/5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {endpoint.parameters.map((param, pIdx) => (
                      <tr key={pIdx} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2 font-mono text-brand-400">{param.name}</td>
                        <td className="px-3 py-2 text-yellow-500/80 font-mono text-xs">{param.type}</td>
                        <td className="px-3 py-2">
                          {param.required ?
                            <span className="text-red-400 text-[10px] font-bold uppercase">Required</span> :
                            <span className="text-gray-600 text-[10px] uppercase">Optional</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-gray-400">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Response</h4>
              <div className="bg-dark-950 rounded p-3 border border-white/5 font-mono text-xs text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">{endpoint.response.type}</span>
                <span className="text-gray-600 shrink-0">→</span>
                <span className="text-gray-400">{endpoint.response.description}</span>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
