import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface TerminalLogProps {
  logs: LogEntry[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-dark-950 border border-white/10 rounded-lg overflow-hidden flex flex-col h-full font-mono text-sm shadow-2xl">
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 font-medium">AutoDoc CLI Output</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-2">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Waiting for process to start...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-fade-in">
            <span className="text-gray-600 shrink-0 select-none">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}]
            </span>
            <div className={clsx("flex items-center gap-2", {
              'text-blue-400': log.type === 'info',
              'text-green-400': log.type === 'success',
              'text-yellow-400': log.type === 'warning',
              'text-red-400': log.type === 'error',
            })}>
              {log.type === 'info' && <Info className="w-3 h-3" />}
              {log.type === 'success' && <CheckCircle2 className="w-3 h-3" />}
              {log.type === 'warning' && <AlertCircle className="w-3 h-3" />}
              {log.type === 'error' && <AlertCircle className="w-3 h-3" />}
              <span>{log.message}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};