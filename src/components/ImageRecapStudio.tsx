import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Layers, 
  Smartphone,
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { TimelineEvent, AttachedImageRecap } from '../types/timeline';

interface ImageRecapStudioProps {
  events: TimelineEvent[];
  imageRecaps: AttachedImageRecap[];
  onAddImageRecap: (recap: AttachedImageRecap) => void;
  onDeleteImageRecap: (id: string) => void;
  selectedEventForImage?: TimelineEvent | null;
  onClearSelectedEvent: () => void;
}

export const ImageRecapStudio: React.FC<ImageRecapStudioProps> = ({
  events,
  imageRecaps,
  onAddImageRecap,
  onDeleteImageRecap,
  selectedEventForImage,
  onClearSelectedEvent,
}) => {
  const [prompt, setPrompt] = useState(
    selectedEventForImage
      ? selectedEventForImage.type === 'scroll'
        ? `Cinematic stylized digital art illustrating an intense late-night scroll session on ${selectedEventForImage.appName} through ${(selectedEventForImage as any).sectionName}, with glowing screen light and floating dopamine counters`
        : selectedEventForImage.type === 'text'
        ? `Warm nostalgic Polaroid aesthetic showing an iPhone screen displaying an incoming text from ${(selectedEventForImage as any).contact}: "${(selectedEventForImage as any).messageText}" on a cozy wooden table`
        : `Aesthetic futuristic smartphone displaying ${selectedEventForImage.appName} with holographic app widgets and ambient glow`
      : 'Vibrant cyberpunk neon phone screen showing infinite TikTok doomscroll stream with glowing dopamine numbers and futuristic motion blur'
  );

  // Requirements: affordance for user to specify image size: 1K, 2K, 4K
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [linkedEventId, setLinkedEventId] = useState<string>(selectedEventForImage?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<AttachedImageRecap | null>(null);

  // Update prompt when selectedEventForImage changes
  React.useEffect(() => {
    if (selectedEventForImage) {
      setLinkedEventId(selectedEventForImage.id);
      if (selectedEventForImage.type === 'scroll') {
        const s = selectedEventForImage as any;
        setPrompt(`Cinematic stylized digital art illustrating an intense late-night scroll session on ${s.appName} through ${s.sectionName}, with glowing screen light, high dopamine vibes, and floating feed cards`);
      } else if (selectedEventForImage.type === 'text') {
        const t = selectedEventForImage as any;
        setPrompt(`Warm nostalgic Polaroid photo of a modern phone screen displaying a message from ${t.contact} saying "${t.messageText}", surrounded by warm coffee and ambient lighting`);
      } else {
        setPrompt(`Futuristic aesthetic illustration of opening ${selectedEventForImage.appName} on a sleek smartphone in an urban night setting`);
      }
    }
  }, [selectedEventForImage]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate visual recap image.');
      }

      const newRecap: AttachedImageRecap = {
        id: 'img-' + Date.now(),
        eventId: linkedEventId || undefined,
        prompt: prompt.trim(),
        imageUrl: data.imageUrl,
        imageSize: data.imageSize || imageSize,
        aspectRatio: data.aspectRatio || aspectRatio,
        createdAt: new Date().toISOString(),
        title: linkedEventId
          ? `Timeline Memory: ${events.find((e) => e.id === linkedEventId)?.appName || 'Activity'}`
          : `Phone Memory (${imageSize})`,
      };

      onAddImageRecap(newRecap);
      setSuccessMessage(`Successfully generated high-quality ${imageSize} visual recap!`);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMessage(err.message || 'Error occurred while generating image recap.');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    {
      title: 'TikTok Late Night Scroll',
      size: '2K' as const,
      ratio: '9:16',
      text: 'Aesthetic smartphone wallpaper illustration of infinite TikTok FYP doomscrolling at 2 AM, ethereal neon violet and teal reflections, glowing algorithm numbers, surreal aesthetic',
    },
    {
      title: 'Cafe Texting Conversation',
      size: '1K' as const,
      ratio: '1:1',
      text: 'Cozy flat-lay illustration of texting a best friend on an iPhone while sitting at a warm wooden cafe table with latte art and rain outside the window',
    },
    {
      title: 'Daily Screen Time Infographic Poster',
      size: '4K' as const,
      ratio: '16:9',
      text: 'Ultra high-definition artistic 3D visualization of a 24-hour phone timeline journey, showing colorful luminous flowcharts of social feeds, texts, and midnight unlocks',
    },
    {
      title: 'Reddit Deep Dive',
      size: '2K' as const,
      ratio: '16:9',
      text: 'Retro-futuristic cybernetic depiction of deep reading tech forum comments on a dark smartphone screen, glowing code glyphs floating into space',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-purple-950 border border-pink-900/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Visual Timeline Memories</h2>
                <span className="text-[10px] text-pink-300 font-mono">
                  Powered by gemini-3-pro-image-preview
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-xl">
              Turn your scrolling marathons, text conversations, and phone milestones into visual art, custom smartphone lockscreens, or memorable recap cards.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Model Resolution</span>
            <span className="text-base font-bold text-pink-400 font-mono">1K • 2K • 4K UHD</span>
          </div>
        </div>
      </div>

      {/* Generator Studio Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        {selectedEventForImage && (
          <div className="bg-indigo-950/60 border border-indigo-700/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-200">
                Generating visual memory for: <strong className="text-white">{selectedEventForImage.appName}</strong> ({selectedEventForImage.type})
              </span>
            </div>
            <button
              onClick={onClearSelectedEvent}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Clear link
            </button>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Visual Memory Prompt (gemini-3-pro-image-preview)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the visual scene, mood, lighting, or phone moment you want to generate..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        {/* Affordance: Image Size Selector (1K, 2K, 4K) as explicitly mandated */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Image Resolution Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                    imageSize === size
                      ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <span>{size}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {size === '1K' ? '1024px' : size === '2K' ? '2048px' : '4096px UHD'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="1:1">1:1 (Square Profile / Grid)</option>
              <option value="9:16">9:16 (Phone Wallpaper / Reel)</option>
              <option value="16:9">16:9 (Cinematic Landscape)</option>
              <option value="4:3">4:3 (Photo Print)</option>
              <option value="3:4">3:4 (Portrait)</option>
            </select>
          </div>

          {/* Link to Timeline Event */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Attach to Timeline Event
            </label>
            <select
              value={linkedEventId}
              onChange={(e) => setLinkedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="">None (Stand-alone recap)</option>
              {events.slice(0, 15).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.appName} • {e.type} (
                  {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button & Status Messages */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            <span>Model: </span>
            <code className="text-pink-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              gemini-3-pro-image-preview
            </code>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-pink-600/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {imageSize} Visual... (may take ~10-15s)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {imageSize} Visual Memory</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Sample Idea Chips */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
            Prompt Inspirations for Phone Activities:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(s.text);
                  setImageSize(s.size);
                  setAspectRatio(s.ratio);
                }}
                className="text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-800/50 rounded-xl text-xs transition"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-pink-300">{s.title}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {s.size} • {s.ratio}
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                  {s.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery of Generated Timeline Visuals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-pink-400" />
            Visual Memories Gallery ({imageRecaps.length})
          </h3>
          <span className="text-xs text-slate-400">High-Resolution Outputs</span>
        </div>

        {imageRecaps.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No visual timeline memories created yet. Use the prompt studio above to generate one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageRecaps.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group hover:border-pink-800/60 transition shadow-sm flex flex-col justify-between"
              >
                <div 
                  className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => setLightboxImage(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-[10px] text-pink-300 font-mono px-2 py-0.5 rounded-full border border-pink-500/30">
                    {item.imageSize} UHD
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                      "{item.prompt}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{item.aspectRatio}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.imageUrl}
                        download={`phone-timeline-${item.id}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeleteImageRecap(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                        title="Delete recap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-4 overflow-hidden space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white text-sm">{lightboxImage.title}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close ✕
              </button>
            </div>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-800"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Resolution: {lightboxImage.imageSize} ({lightboxImage.aspectRatio})</span>
              <a
                href={lightboxImage.imageUrl}
                download={`phone-timeline-${lightboxImage.id}.png`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium"
              >
                <Download className="w-4 h-4" /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
