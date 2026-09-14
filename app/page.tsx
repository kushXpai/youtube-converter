'use client';

import { useState } from 'react';
import { Download, Music, Video, Loader2, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; downloadUrl: string; author?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // AbortController to handle network delays on mobile cleanly
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s client-side cutoff

      const res = await fetch(`/api/convert?url=${encodeURIComponent(url)}&format=${format}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Conversion failed. Please try again.');
      setResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Network timeout. Mobile connection took too long to complete.');
      } else {
        setError(err.message || 'Server error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold">Media Converter</h1>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConvert} className="space-y-4">
          <input
            type="url"
            placeholder="Paste YouTube link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />

          {/* Format Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'mp3', label: 'MP3 Audio', icon: Music },
              { id: 'mp4', label: 'MP4 Video', icon: Video },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id as any)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
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
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Convert Media'}
          </button>
        </form>

        {/* Error Notice */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Download Link Card */}
        {result && (
          <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <p className="text-xs font-medium text-slate-300 line-clamp-2">{result.title}</p>
            {result.author && <p className="text-[10px] text-slate-500">By {result.author}</p>}
            
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" /> Download File <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        )}
      </div>
    </main>
  );
}