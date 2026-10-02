import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  X, 
  Sparkles, 
  Maximize2, 
  Sliders
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  subtitle?: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

interface CropBox {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  w: number; // 0 to 100%
  h: number; // 0 to 100%
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Focus on Ingredients',
  subtitle = 'Frame only the active & ingredient list to eliminate packaging noise',
  onCropComplete,
  onCancel,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [crop, setCrop] = useState<CropBox>({ x: 10, y: 20, w: 80, h: 60 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{ clientX: number; clientY: number; crop: CropBox } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setCrop({ x: 10, y: 20, w: 80, h: 60 });
    }
  }, [isOpen, imageSrc]);

  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveHandle(handle);
    setStartPos({
      clientX: e.clientX,
      clientY: e.clientY,
      crop: { ...crop }
    });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeHandle || !startPos || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dx = ((e.clientX - startPos.clientX) / rect.width) * 100;
    const dy = ((e.clientY - startPos.clientY) / rect.height) * 100;
    const init = startPos.crop;

    let next = { ...init };

    if (activeHandle === 'move') {
      next.x = Math.max(0, Math.min(100 - init.w, init.x + dx));
      next.y = Math.max(0, Math.min(100 - init.h, init.y + dy));
    } else if (activeHandle === 'se') {
      next.w = Math.max(15, Math.min(100 - init.x, init.w + dx));
      next.h = Math.max(15, Math.min(100 - init.y, init.h + dy));
    } else if (activeHandle === 'sw') {
      const allowedDx = Math.max(-init.x, Math.min(init.w - 15, dx));
      next.x = init.x + allowedDx;
      next.w = init.w - allowedDx;
      next.h = Math.max(15, Math.min(100 - init.y, init.h + dy));
    } else if (activeHandle === 'ne') {
      const allowedDy = Math.max(-init.y, Math.min(init.h - 15, dy));
      next.y = init.y + allowedDy;
      next.h = init.h - allowedDy;
      next.w = Math.max(15, Math.min(100 - init.x, init.w + dx));
    } else if (activeHandle === 'nw') {
      const allowedDx = Math.max(-init.x, Math.min(init.w - 15, dx));
      const allowedDy = Math.max(-init.y, Math.min(init.h - 15, dy));
      next.x = init.x + allowedDx;
      next.y = init.y + allowedDy;
      next.w = init.w - allowedDx;
      next.h = init.h - allowedDy;
    }

    setCrop(next);
  }, [activeHandle, startPos]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      setActiveHandle(null);
      setStartPos(null);
    }
  };

  const handleApplyCrop = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onCropComplete(imageSrc);
        return;
      }

      const isSideways = rotation % 180 !== 0;
      const srcW = isSideways ? img.naturalHeight : img.naturalWidth;
      const srcH = isSideways ? img.naturalWidth : img.naturalHeight;

      const cropPxX = (crop.x / 100) * srcW;
      const cropPxY = (crop.y / 100) * srcH;
      const cropPxW = Math.max(10, (crop.w / 100) * srcW);
      const cropPxH = Math.max(10, (crop.h / 100) * srcH);

      canvas.width = cropPxW;
      canvas.height = cropPxH;

      ctx.save();
      ctx.translate(-cropPxX, -cropPxY);

      if (rotation !== 0) {
        ctx.translate(srcW / 2, srcH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedBase64);
    };

    img.onerror = () => onCropComplete(imageSrc);
    img.src = imageSrc;
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-cream-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Minimalist Clean Header */}
        <div className="px-5 py-3.5 bg-white border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] text-charcoal-500 font-medium">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-forest-950 hover:bg-cream-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Workspace */}
        <div className="relative flex-1 min-h-[300px] max-h-[440px] bg-charcoal-950 flex items-center justify-center p-3 overflow-hidden select-none">
          <div
            ref={containerRef}
            className="relative max-w-full max-h-full inline-block shadow-2xl rounded-xl overflow-hidden border border-charcoal-800 touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              src={imageSrc}
              alt="Label scan"
              className="max-h-[360px] w-auto object-contain block pointer-events-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              draggable={false}
            />

            {/* Dark Mask */}
            <div
              className="absolute inset-0 bg-black/65 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                  ${crop.x}% ${crop.y}%,
                  ${crop.x + crop.w}% ${crop.y}%,
                  ${crop.x + crop.w}% ${crop.y + crop.h}%,
                  ${crop.x}% ${crop.y + crop.h}%,
                  ${crop.x}% ${crop.y}%
                )`
              }}
            />

            {/* The Crisp Crop Viewfinder */}
            <div
              className="absolute border-2 border-mint-400 bg-mint-400/10 cursor-move shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`
              }}
              onPointerDown={(e) => handlePointerDown('move', e)}
            >
              {/* Center Guidance Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-forest-950/90 text-mint-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow pointer-events-none border border-mint-400/40">
                Ingredients Box
              </div>

              {/* Handles */}
              <div
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-forest-900 rounded-full cursor-nwse-resize shadow-md"
                onPointerDown={(e) => handlePointerDown('nw', e)}
              />
              <div
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-forest-900 rounded-full cursor-nesw-resize shadow-md"
                onPointerDown={(e) => handlePointerDown('ne', e)}
              />
              <div
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-forest-900 rounded-full cursor-nesw-resize shadow-md"
                onPointerDown={(e) => handlePointerDown('sw', e)}
              />
              <div
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-forest-900 rounded-full cursor-nwse-resize shadow-md"
                onPointerDown={(e) => handlePointerDown('se', e)}
              />
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="p-3.5 bg-white border-t border-cream-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCw className="w-3.5 h-3.5 text-forest-800" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={() => setCrop({ x: 10, y: 20, w: 80, h: 60 })}
              className="px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-forest-800" />
              <span>Center</span>
            </button>
            <button
              type="button"
              onClick={() => setCrop({ x: 0, y: 0, w: 100, h: 100 })}
              className="px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Maximize2 className="w-3.5 h-3.5 text-forest-800" />
              <span>Full</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl text-charcoal-600 hover:bg-cream-100 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint-400" />
              <span>Audit Ingredients</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
