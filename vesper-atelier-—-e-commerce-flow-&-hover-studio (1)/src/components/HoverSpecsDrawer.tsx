import { useState } from 'react';
import { Check, Copy, Layers, X } from 'lucide-react';
import { HOVER_STYLES } from '../data/products';

interface HoverSpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HoverSpecsDrawer({ isOpen, onClose }: HoverSpecsDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (id: string, rule: string) => {
    try {
      await navigator.clipboard.writeText(rule);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = rule;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Hover Interaction Specifications"
        className="relative z-10 w-full max-w-lg bg-[#F8F7F4] h-full flex flex-col border-l border-[#E6E3DC] shadow-2xl"
      >
        <div className="px-6 py-5 bg-white border-b border-[#E6E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#2D4A3E]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-medium text-[#18181B]">
                Flow &amp; Hover Specifications
              </h2>
              <p className="text-xs text-[#71717A]">
                Compositor-only transitions (140–200ms) active across DASBROTHERS cards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close hover specifications"
            className="p-2 text-[#52525B] hover:text-[#18181B] rounded-md hover:bg-[#F1EFEA] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {HOVER_STYLES.map((style) => {
            const isCopied = copiedId === style.id;
            return (
              <div
                key={style.id}
                className="bg-white border border-[#E6E3DC] rounded-lg p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#18181B]">{style.name}</h3>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      Featured on: {style.productExample} · {style.timing}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(style.id, style.cssRule)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] ${
                      isCopied
                        ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                        : 'bg-[#F8F7F4] text-[#18181B] border-[#E6E3DC] hover:border-[#18181B]'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>Copy CSS</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#52525B] leading-relaxed">{style.summary}</p>

                <pre className="p-3 rounded bg-[#18181B] text-[#E4E4E7] font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                  {style.cssRule}
                </pre>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
