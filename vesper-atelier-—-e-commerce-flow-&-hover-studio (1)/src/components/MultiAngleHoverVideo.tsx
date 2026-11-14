import { useEffect, useRef, useState } from 'react';

interface MultiAngleHoverVideoProps {
  active: boolean;
  primaryImage: string;
  angleImage: string;
  angleLabels: [string, string, string, string];
  productName: string;
}

interface AngleFrameSpec {
  useAlternate: boolean;
  scaleStart: number;
  scaleEnd: number;
  panXStart: number;
  panXEnd: number;
  panYStart: number;
  panYEnd: number;
  label: string;
}

const ANGLE_DURATION_MS = 1650;

export function MultiAngleHoverVideo({
  active,
  primaryImage,
  angleImage,
  angleLabels,
  productName,
}: MultiAngleHoverVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setStreamReady(false);
      setCurrentAngleIndex(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let rafId = 0;

    const imgA = new Image();
    imgA.crossOrigin = 'anonymous';
    imgA.referrerPolicy = 'no-referrer';
    imgA.src = primaryImage;

    const imgB = new Image();
    imgB.crossOrigin = 'anonymous';
    imgB.referrerPolicy = 'no-referrer';
    imgB.src = angleImage;

    const specs: AngleFrameSpec[] = [
      {
        useAlternate: false,
        scaleStart: 1.02,
        scaleEnd: 1.1,
        panXStart: 0,
        panXEnd: -16,
        panYStart: 0,
        panYEnd: -8,
        label: angleLabels[0],
      },
      {
        useAlternate: true,
        scaleStart: 1.04,
        scaleEnd: 1.12,
        panXStart: 14,
        panXEnd: -12,
        panYStart: 4,
        panYEnd: -6,
        label: angleLabels[1],
      },
      {
        useAlternate: true,
        scaleStart: 1.32,
        scaleEnd: 1.44,
        panXStart: -18,
        panXEnd: 18,
        panYStart: -12,
        panYEnd: 10,
        label: angleLabels[2],
      },
      {
        useAlternate: false,
        scaleStart: 1.24,
        scaleEnd: 1.34,
        panXStart: 16,
        panXEnd: -16,
        panYStart: 12,
        panYEnd: -12,
        label: angleLabels[3],
      },
    ];

    // Pipe canvas output into a real HTMLVideoElement stream when supported
    let mediaStream: MediaStream | null = null;
    const video = videoRef.current;
    if (video && typeof canvas.captureStream === 'function') {
      try {
        mediaStream = canvas.captureStream(30);
        video.srcObject = mediaStream;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              if (!cancelled) setStreamReady(true);
            })
            .catch(() => {
              if (!cancelled) setStreamReady(false);
            });
        }
      } catch {
        setStreamReady(false);
      }
    }

    const drawCoverImage = (
      img: HTMLImageElement,
      scale: number,
      panX: number,
      panY: number,
      alpha: number
    ) => {
      if (!img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let baseW = cw;
      let baseH = ch;
      if (imgRatio > canvasRatio) {
        baseW = ch * imgRatio;
      } else {
        baseH = cw / imgRatio;
      }
      const drawW = baseW * scale;
      const drawH = baseH * scale;
      const dx = (cw - drawW) / 2 + panX;
      const dy = (ch - drawH) / 2 + panY;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    };

    const startTime = performance.now();
    let lastReportedIdx = -1;

    const renderFrame = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startTime;
      const totalCycle = ANGLE_DURATION_MS * specs.length;
      const cyclePos = elapsed % totalCycle;
      const idx = Math.floor(cyclePos / ANGLE_DURATION_MS);
      const localT = (cyclePos % ANGLE_DURATION_MS) / ANGLE_DURATION_MS;
      const nextIdx = (idx + 1) % specs.length;

      if (idx !== lastReportedIdx) {
        lastReportedIdx = idx;
        setCurrentAngleIndex(idx);
      }

      const cur = specs[idx];
      const nxt = specs[nextIdx];

      ctx.fillStyle = '#EFECE5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth ease-in-out progress
      const easeT = localT * localT * (3 - 2 * localT);
      const scale = cur.scaleStart + (cur.scaleEnd - cur.scaleStart) * easeT;
      const panX = cur.panXStart + (cur.panXEnd - cur.panXStart) * easeT;
      const panY = cur.panYStart + (cur.panYEnd - cur.panYStart) * easeT;

      const curImg = cur.useAlternate ? imgB : imgA;
      drawCoverImage(curImg, scale, panX, panY, 1);

      // Crossfade into next angle in the final 22% of the segment
      if (localT > 0.78) {
        const fadeAlpha = (localT - 0.78) / 0.22;
        const nxtImg = nxt.useAlternate ? imgB : imgA;
        drawCoverImage(nxtImg, nxt.scaleStart, nxt.panXStart, nxt.panYStart, fadeAlpha);
      }

      // Subtle royal studio vignette for angle caption legibility
      const grad = ctx.createLinearGradient(0, canvas.height * 0.62, 0, canvas.height);
      grad.addColorStop(0, 'rgba(24,24,27,0)');
      grad.addColorStop(1, 'rgba(24,24,27,0.78)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height * 0.62, canvas.width, canvas.height * 0.38);

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (video) {
        video.srcObject = null;
      }
    };
  }, [active, primaryImage, angleImage, angleLabels]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-[#EFECE5] transition-opacity duration-200 ease-flow"
      aria-label={`Multi-angle video preview of ${productName}`}
    >
      {/* Offscreen/Fallback Render Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className={`w-full h-full object-cover ${streamReady ? 'opacity-0 absolute inset-0' : 'opacity-100'}`}
      />

      {/* Live HTML5 Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover ${streamReady ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
      />

      {/* Multi-Angle Reel Indicator */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/80">
            Angle 0{currentAngleIndex + 1} / 04 · Live Reel
          </p>
          <p className="text-xs font-medium truncate mt-0.5">
            {angleLabels[currentAngleIndex]}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
          {angleLabels.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-200 ${
                idx === currentAngleIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
