'use client';

import { useState } from 'react';
import { Download, Music, Video, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4' | 'wav'>('mp3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; downloadUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/convert?url=${encodeURIComponent(url)}&format=${format}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="p-3 bg-purple-600/30 rounded-2xl border border-purple-400/30">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Media Converter</h1>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConvert} className="space-y-4">
          <div>
            <input
              type="url"
              placeholder="Paste YouTube link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 text-sm transition"
            />
          </div>

          {/* Format Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mp3', label: 'MP3 (Audio)', icon: Music },
              { id: 'mp4', label: 'MP4 (Video)', icon: Video },
              { id: 'wav', label: 'WAV (HD)', icon: Music },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id as any)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Convert Media'}
          </button>
        </form>

        {/* Errors */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success / Download Area */}
        {result && (
          <div className="mt-6 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-sm font-medium text-slate-300 truncate">{result.title}</p>
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" /> Download File
            </a>
          </div>
        )}
      </div>
    </main>
  );
}