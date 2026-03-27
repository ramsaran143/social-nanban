
import React, { useState } from 'react';
import { MessageSquare, Loader2, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { askClaudeJSON } from '../data/claude';
import { saveAIResult } from '../data/api';

const CommentReplyGenerator = () => {
  const [comment, setComment] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [replies, setReplies] = useState<{
    friendly: string;
    professional: string;
    witty: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerateReplies = async () => {
    if (!comment.trim()) { toast.error('Paste a comment first'); return; }
    setLoading(true);
    
    const prompt = `
      You are a social media engagement expert.
      
      Platform: ${platform}
      Original comment received: "${comment}"
      
      Generate 3 different reply options for this comment:
      
      Return ONLY this JSON:
      {
        "friendly": "Warm friendly reply here — feels personal and genuine",
        "professional": "Clear professional reply here — informative and on-brand",
        "witty": "Clever witty reply here — light humor, memorable"
      }
      
      Rules for all replies:
      - Keep each reply under 150 characters
      - Sound human, not robotic
      - Match the tone of the original comment
      - For Instagram: can use 1-2 emojis
      - For LinkedIn: no emojis, formal tone
      - For Twitter: brief and punchy
    `;

    try {
      const result = await askClaudeJSON(prompt);
      setReplies(result);
      await saveAIResult({
        feature_type: 'comment_reply',
        input_data: { comment, platform },
        result_json: result,
        platform
      });
      toast.success('Replies generated!');
    } catch {
      toast.error('Reply generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Reply copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <MessageSquare size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Comment Reply Generator</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Paste a comment from your post..."
            rows={3}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            maxLength={500}
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-bold uppercase">{comment.length}/500</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select 
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full md:w-fit bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <button 
            onClick={handleGenerateReplies}
            disabled={loading}
            className="w-full md:flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
            Generate Strategy Replies
          </button>
        </div>
      </div>

      {replies && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2">
          {Object.entries(replies).map(([type, text]) => (
            <div key={type} className="group relative bg-white border border-gray-100 p-5 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all">
               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${type === 'friendly' ? 'bg-green-100 text-green-600' : type === 'professional' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                 {type}
               </span>
               <p className="mt-4 text-sm font-medium text-gray-700 leading-relaxed mb-12 italic">"{text}"</p>
               
               <button 
                 onClick={() => handleCopy(text, type)}
                 className={`absolute bottom-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === type ? 'bg-green-600 text-white scale-105' : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
               >
                 {copied === type ? <CheckCircle size={14} /> : <Copy size={14} />}
                 {copied === type ? 'Copied ✓' : 'Copy'}
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentReplyGenerator;
