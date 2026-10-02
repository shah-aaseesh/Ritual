import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Crop, 
  RotateCw, 
  X, 
  Sparkles, 
  Maximize2, 
  Info,
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

interface CropRect {
  x: number;      // percent 0-100
  y: number;      // percent 0-100
  width: number;  // percent 0-100
  height: number; // percent 0-100
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Crop Ingredients Section',
  subtitle = 'Crop out warnings, directions & manufacturer info',
  onCropComplete,
  onCancel,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 15, width: 80, height: 60 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropRect } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset crop when new image opens
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setCrop({ x: 10, y: 15, width: 80, height: 60 });
    }
  }, [isOpen, imageSrc]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSelectFullImage = () => {
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
  };

  const handleSelectCenter = () => {
    setCrop({ x: 15, y: 20, width: 70, height: 50 });
  };

  const startDrag = (mode: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w', clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      x: clientX,
      y: clientY,
      crop: { ...crop }
    });
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, mode: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w') => {
    e.stopPropagation();
    if (e.type === 'touchstart') {
      const touch = (e as React.TouchEvent).touches[0];
      startDrag(mode, touch.clientX, touch.clientY);
    } else {
      const mouse = e as React.MouseEvent;
      startDrag(mode, mouse.clientX, mouse.clientY);
    }
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaXPercent = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((clientY - dragStart.y) / rect.height) * 100;
    const initial = dragStart.crop;

    let newCrop = { ...crop };

    if (dragMode === 'move') {
      let nextX = initial.x + deltaXPercent;
      let nextY = initial.y + deltaYPercent;

      nextX = Math.max(0, Math.min(100 - initial.width, nextX));
      nextY = Math.max(0, Math.min(100 - initial.height, nextY));

      newCrop = {
        ...initial,
        x: nextX,
        y: nextY
      };
    } else if (dragMode === 'se') {
      const newWidth = Math.max(10, Math.min(100 - initial.x, initial.width + deltaXPercent));
      const newHeight = Math.max(10, Math.min(100 - initial.y, initial.height + deltaYPercent));
      newCrop = { ...initial, width: newWidth, height: newHeight };
    } else if (dragMode === 'sw') {
      const maxLeftDelta = initial.width - 10;
      const appliedDeltaX = Math.max(-initial.x, Math.min(maxLeftDelta, deltaXPercent));
      const newWidth = initial.width - appliedDeltaX;
      const newHeight = Math.max(10, Math.min(100 - initial.y, initial.height + deltaYPercent));
      newCrop = {
        ...initial,
        x: initial.x + appliedDeltaX,
        width: newWidth,
        height: newHeight
      };
    } else if (dragMode === 'ne') {
      const maxTopDelta = initial.height - 10;
      const appliedDeltaY = Math.max(-initial.y, Math.min(maxTopDelta, deltaYPercent));
      const newHeight = initial.height - appliedDeltaY;
      const newWidth = Math.max(10, Math.min(100 - initial.x, initial.width + deltaXPercent));
      newCrop = {
        ...initial,
        y: initial.y + appliedDeltaY,
        width: newWidth,
        height: newHeight
      };
    } else if (dragMode === 'nw') {
      const maxLeftDelta = initial.width - 10;
      const maxTopDelta = initial.height - 10;
      const appliedDeltaX = Math.max(-initial.x, Math.min(maxLeftDelta, deltaXPercent));
      const appliedDeltaY = Math.max(-initial.y, Math.min(maxTopDelta, deltaYPercent));
      newCrop = {
        x: initial.x + appliedDeltaX,
        y: initial.y + appliedDeltaY,
        width: initial.width - appliedDeltaX,
        height: initial.height - appliedDeltaY
      };
    }

    setCrop(newCrop);
  }, [isDragging, dragStart, dragMode, crop]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      setDragMode(null);
      setDragStart(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalPointerUp);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      window.addEventListener('touchend', handleGlobalPointerUp);
      window.addEventListener('touchcancel', handleGlobalPointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('touchcancel', handleGlobalPointerUp);
    };
  }, [isDragging, handlePointerMove]);

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

      // Handle rotation first
      const isSideways = rotation % 180 !== 0;
      const rotatedWidth = isSideways ? img.naturalHeight : img.naturalWidth;
      const rotatedHeight = isSideways ? img.naturalWidth : img.naturalHeight;

      // Crop coordinates in original image space
      const cropX = (crop.x / 100) * rotatedWidth;
      const cropY = (crop.y / 100) * rotatedHeight;
      const cropW = Math.max(1, (crop.width / 100) * rotatedWidth);
      const cropH = Math.max(1, (crop.height / 100) * rotatedHeight);

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.save();
      ctx.translate(-cropX, -cropY);

      if (rotation !== 0) {
        ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedBase64);
    };

    img.onerror = () => {
      onCropComplete(imageSrc);
    };

    img.src = imageSrc;
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest-900 text-mint-300 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-forest-950 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-charcoal-600 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-charcoal-500 hover:text-forest-900 hover:bg-cream-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Banner */}
        <div className="px-4 py-2.5 bg-mint-50 border-b border-mint-200 flex items-center gap-2 text-[11px] text-forest-900 font-medium">
          <Info className="w-4 h-4 text-forest-700 flex-shrink-0" />
          <span>
            <b>Precision Tip:</b> Frame <i>only</i> the chemical & botanical ingredients list or active nutrient table for maximum AI accuracy.
          </span>
        </div>

        {/* Interactive Cropper Canvas Workspace */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] max-h-[480px] bg-charcoal-900 flex items-center justify-center p-3 overflow-hidden select-none">
          <div
            ref={containerRef}
            className="relative max-w-full max-h-full inline-block shadow-lg rounded-lg overflow-hidden border border-charcoal-700 cursor-crosshair touch-none"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Label to crop"
              className="max-h-[380px] w-auto object-contain block pointer-events-none"
              draggable={false}
            />

            {/* Dark Mask Surrounding Crop Box */}
            <div
              className="absolute inset-0 bg-black/60 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                  ${crop.x}% ${crop.y}%,
                  ${crop.x + crop.width}% ${crop.y}%,
                  ${crop.x + crop.width}% ${crop.y + crop.height}%,
                  ${crop.x}% ${crop.y + crop.height}%,
                  ${crop.x}% ${crop.y}%
                )`
              }}
            />

            {/* Interactive Crop Box Selection */}
            <div
              className="absolute border-2 border-mint-400 bg-mint-400/10 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`
              }}
              onMouseDown={(e) => handlePointerDown(e, 'move')}
              onTouchStart={(e) => handlePointerDown(e, 'move')}
            >
              {/* Internal Rule of Thirds Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-mint-300" />
                <div className="border-r border-b border-mint-300" />
                <div className="border-b border-mint-300" />
                <div className="border-r border-b border-mint-300" />
                <div className="border-r border-b border-mint-300" />
                <div className="border-b border-mint-300" />
                <div className="border-r border-mint-300" />
                <div className="border-r border-mint-300" />
                <div />
              </div>

              {/* Central Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-forest-950/80 text-mint-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow pointer-events-none border border-mint-400/40">
                Ingredients Only
              </div>

              {/* Corner Handles */}
              <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-forest-900 rounded-full cursor-nwse-resize shadow-md"
                onMouseDown={(e) => handlePointerDown(e, 'nw')}
                onTouchStart={(e) => handlePointerDown(e, 'nw')}
              />
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-forest-900 rounded-full cursor-nesw-resize shadow-md"
                onMouseDown={(e) => handlePointerDown(e, 'ne')}
                onTouchStart={(e) => handlePointerDown(e, 'ne')}
              />
              <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-forest-900 rounded-full cursor-nesw-resize shadow-md"
                onMouseDown={(e) => handlePointerDown(e, 'sw')}
                onTouchStart={(e) => handlePointerDown(e, 'sw')}
              />
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-forest-900 rounded-full cursor-nwse-resize shadow-md"
                onMouseDown={(e) => handlePointerDown(e, 'se')}
                onTouchStart={(e) => handlePointerDown(e, 'se')}
              />
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="px-4 py-2.5 bg-cream-100/90 border-t border-cream-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-200 text-charcoal-800 font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Rotate Image 90°"
            >
              <RotateCw className="w-3.5 h-3.5 text-forest-800" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={handleSelectCenter}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-200 text-charcoal-800 font-semibold flex items-center gap-1.5 transition shadow-sm hidden sm:flex"
            >
              <Sliders className="w-3.5 h-3.5 text-forest-800" />
              <span>Center Box</span>
            </button>
            <button
              type="button"
              onClick={handleSelectFullImage}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-200 text-charcoal-800 font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5 text-forest-800" />
              <span>Full</span>
            </button>
          </div>

          <span className="text-[11px] text-charcoal-500 font-medium">
            Drag corners to resize
          </span>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-cream-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl border border-cream-300 hover:bg-cream-100 text-charcoal-700 text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2.5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold flex items-center gap-2 shadow-card hover:shadow-lg transition active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-mint-400" />
            <span>Crop & Analyze Ingredients</span>
          </button>
        </div>

      </div>
    </div>
  );
};
