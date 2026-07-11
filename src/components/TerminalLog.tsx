import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface TerminalLogProps {
  logs: LogEntry[];
}

const relativeTime = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (logs.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, [logs.length]);

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
            <span className="text-gray-600 shrink-0 select-none text-xs">
              {relativeTime(log.timestamp)}
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