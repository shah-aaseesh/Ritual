import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Palette, 
  Smartphone, 
  Square, 
  Image as ImageIcon,
  MessageCircle,
  Twitter,
  Sliders,
  Camera,
  Upload,
  Monitor,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { ShareCardData, ShareTheme, ShareAspectRatio, PhotoFilter } from '../../types/share';
import { 
  renderShareCardToCanvas, 
  downloadCanvasAsPng, 
  copyCanvasToClipboard, 
  shareCanvasViaWebShare,
  loadImageElement,
  captureScreenSnapshot
} from '../../utils/shareCardCanvas';
import { useApp } from '../../context/AppContext';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

const THEMES: { id: ShareTheme; name: string; color: string; bg: string; icon: string }[] = [
  { id: 'strava_orange', name: 'Strava Orange', color: '#FC5200', bg: 'bg-[#FC5200]', icon: '🔥' },
  { id: 'mosaic_emerald', name: 'Mosaic Emerald', color: '#10B981', bg: 'bg-[#10B981]', icon: '🌲' },
  { id: 'cyber_neon', name: 'Cyber Neon', color: '#CCFF00', bg: 'bg-[#CCFF00]', icon: '⚡' },
  { id: 'sunset_mirage', name: 'Sunset Mirage', color: '#FF5E62', bg: 'bg-gradient-to-r from-[#FF5E62] to-[#FF9966]', icon: '🌅' },
  { id: 'clean_mono', name: 'Clean Mono', color: '#FFFFFF', bg: 'bg-zinc-100', icon: '⚪' },
  { id: 'gold_champion', name: 'Gold Tier', color: '#F59E0B', bg: 'bg-amber-500', icon: '🏆' },
];

const PHOTO_FILTERS: { id: PhotoFilter; name: string }[] = [
  { id: 'dark_scrim', name: 'Dark Scrim' },
  { id: 'contrast', name: 'High Contrast' },
  { id: 'noir', name: 'Cyber Noir' },
  { id: 'warm', name: 'Warm Sunset' },
  { id: 'none', name: 'Clean Fit' },
];

const QUICK_CAPTIONS: Record<string, string[]> = {
  workout: [
    'Crushed morning session! 💪',
    'Consistency beats intensity every day. ⚡',
    'Chasing progressive overload. 🏋️',
    'Anabolic window open. Fueling up! 🥗',
    'New Personal Record unlocked! 🏆'
  ],
  protocol: [
    '100% Protocol locked in today. 🌿',
    'Evidence-based wellness stack complete! 🧪',
    'Small daily habits, massive compound results. 📈',
    'Unbroken wellness streak active! 🔥'
  ],
  nutrition: [
    'Hit protein & calorie targets cleanly today! 🥗',
    'Fueling recovery with clinical precision. ⚡',
    'Macronutrient goals locked. 🎯'
  ],
  milestone: [
    'Major milestone achieved in Ritual! 🏆',
    'Leveling up my fitness & longevity journey. 🚀',
    'Discipline becomes identity. 💥'
  ]
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  data: initialData
}) => {
  const { showToast, profile } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [selectedTheme, setSelectedTheme] = useState<ShareTheme>('strava_orange');
  const [aspectRatio, setAspectRatio] = useState<ShareAspectRatio>('post');
  const [userCaption, setUserCaption] = useState<string>(
    initialData.userCaption || (initialData.type === 'workout' ? 'Crushed today’s session! 💪' : '100% daily protocol locked in! 🌿')
  );
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const [showNote, setShowNote] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Background Screenshot / Photo State
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(initialData.backgroundImage || null);
  const [loadedBgImage, setLoadedBgImage] = useState<HTMLImageElement | null>(null);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('dark_scrim');
  const [photoOpacity, setPhotoOpacity] = useState<number>(0.95);

  // Live Camera Snapshot State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Listen for paste (Ctrl+V) of screenshots directly into the modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              setBackgroundImageUrl(base64);
              showToast('📸 Screenshot pasted from clipboard!', 'success');
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, showToast]);

  // Load image element when backgroundImageUrl changes
  useEffect(() => {
    if (!backgroundImageUrl) {
      setLoadedBgImage(null);
      return;
    }

    let isMounted = true;
    loadImageElement(backgroundImageUrl)
      .then((img) => {
        if (isMounted) setLoadedBgImage(img);
      })
      .catch((err) => {
        console.warn('Failed to load background image:', err);
        if (isMounted) setLoadedBgImage(null);
      });

    return () => {
      isMounted = false;
    };
  }, [backgroundImageUrl]);

  // Clean up camera stream on close
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Merge profile user name if available
  const cardData: ShareCardData = {
    ...initialData,
    userName: initialData.userName || profile.name || 'Alex Patel',
    userCaption: showNote ? userCaption : undefined,
    backgroundImage: backgroundImageUrl || undefined,
    photoFilter,
    photoOpacity
  };

  // Re-draw canvas whenever customization states change
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    renderShareCardToCanvas(
      canvasRef.current,
      cardData,
      selectedTheme,
      aspectRatio,
      {
        showWatermark,
        showHighlights,
        showNote,
        loadedImage: loadedBgImage
      }
    );

    // Update preview data URL for mobile tap-and-hold saving
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);
    } catch (e) {}
  }, [isOpen, selectedTheme, aspectRatio, userCaption, showWatermark, showHighlights, showNote, cardData, loadedBgImage, photoFilter, photoOpacity]);

  if (!isOpen) return null;

  // Photo Upload Handler (Works for screenshots and gallery photos on all phones)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setBackgroundImageUrl(base64);
      showToast('📸 Screenshot / Photo loaded as Strava backdrop!', 'success');
    };
    reader.readAsDataURL(file);
    // Reset value so user can pick the same file again if desired
    e.target.value = '';
  };

  // Screen Snapshot Capture (with mobile fallback)
  const handleScreenSnapshot = async () => {
    if (isMobile) {
      // Mobile browsers do not support getDisplayMedia window picker. Direct user to phone screenshot gallery!
      showToast('📱 On phone: Tap "Phone Gallery / Screenshots" to pick your phone screenshot!', 'info');
      fileInputRef.current?.click();
      return;
    }

    showToast('🖥️ Select screen/window to snapshot...', 'info');
    const screenshotDataUrl = await captureScreenSnapshot();
    if (screenshotDataUrl) {
      setBackgroundImageUrl(screenshotDataUrl);
      showToast('📸 Screen snapshot captured!', 'success');
    } else {
      fileInputRef.current?.click();
    }
  };

  // Live Camera Controls
  const startCamera = async () => {
    try {
      if (isMobile && cameraInputRef.current) {
        // Native mobile camera capture
        cameraInputRef.current.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        showToast('Camera access denied or unavailable', 'warning');
      }
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 640;
    captureCanvas.height = video.videoHeight || 480;
    const ctx = captureCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.92);
      setBackgroundImageUrl(dataUrl);
      stopCamera();
      showToast('📸 Workout selfie captured!', 'success');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Actions
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    if (isMobile && typeof navigator.share === 'function') {
      // On mobile, native share provides "Save Image to Camera Roll"
      const shareText = `${cardData.title} • ${cardData.primaryStat.label}: ${cardData.primaryStat.value} ${cardData.primaryStat.unit || ''} | Tracked on Ritual ⚡`;
      const shared = await shareCanvasViaWebShare(canvasRef.current, cardData.title, shareText);
      if (shared) {
        showToast('📸 Image saved / shared!', 'success');
        setIsExporting(false);
        return;
      }
    }

    const sanitizedTitle = (cardData.title || 'activity').toLowerCase().replace(/\s+/g, '-');
    downloadCanvasAsPng(canvasRef.current, `ritual-${sanitizedTitle}-${aspectRatio}.png`);
    showToast('📸 Card downloaded in high-resolution (1080p)!', 'success');
    setIsExporting(false);
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setCopied(true);
      showToast('📋 High-res image copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      handleDownload();
    }
    setIsExporting(false);
  };

  const handleNativeShare = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const shareText = `${cardData.title} • ${cardData.primaryStat.label}: ${cardData.primaryStat.value} ${cardData.primaryStat.unit || ''} | Tracked on Ritual ⚡`;
    const shared = await shareCanvasViaWebShare(canvasRef.current, cardData.title, shareText);
    if (shared) {
      showToast('🚀 Activity shared successfully!', 'success');
    } else {
      handleDownload();
    }
    setIsExporting(false);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Just finished ${cardData.title}! 💥\n${cardData.primaryStat.label}: ${cardData.primaryStat.value} ${cardData.primaryStat.unit || ''}\n\nTracked with @RitualApp #StravaForWellness #MosaicWellness #Fitness`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${cardData.title}* ⚡\n${cardData.primaryStat.label}: ${cardData.primaryStat.value} ${cardData.primaryStat.unit || ''}\n${userCaption ? `"${userCaption}"\n` : ''}Tracked with Ritual App`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const quickQuotes = QUICK_CAPTIONS[cardData.type] || QUICK_CAPTIONS.workout;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#121316] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#181A20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FC5200]/20 border border-[#FC5200]/40 flex items-center justify-center text-[#FC5200] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Social Media Share Card
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#FC5200] text-white">
                  Strava & Photos
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">
                Overlay workout stats on screenshots, selfies, or gradients
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Column 1: Live Card Graphic Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/50 rounded-2xl p-3 sm:p-4 border border-white/5 relative group">
            <div className="w-full flex items-center justify-between mb-2.5 px-1 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold text-[11px]">
                <ImageIcon className="w-3.5 h-3.5 text-[#FC5200]" />
                Live 1080p Canvas
              </span>
              <div className="flex items-center gap-1.5">
                {loadedBgImage && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
                    📸 Photo Backdrop
                  </span>
                )}
                <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-zinc-300">
                  {aspectRatio === 'story' ? '9:16 Story' : aspectRatio === 'square' ? '1:1 Square' : '4:5 Feed Post'}
                </span>
              </div>
            </div>

            {/* Live Camera Feed Overlay (if active) */}
            {isCameraActive ? (
              <div className="w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden relative bg-black border border-white/20 flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-5 py-2.5 rounded-full bg-[#FC5200] hover:bg-[#E04800] text-white font-black text-xs shadow-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2.5 rounded-full bg-black/70 text-white font-bold text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Render Canvas with Touch-Friendly Image Overlay */
              <div className={`relative flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-300 ${
                aspectRatio === 'story' ? 'max-w-[270px] aspect-[9/16]' : aspectRatio === 'square' ? 'max-w-[340px] aspect-square' : 'max-w-[310px] aspect-[4/5]'
              }`}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain rounded-xl block"
                />

                {/* Touch overlay on mobile for long-press to save */}
                {previewDataUrl && isMobile && (
                  <img
                    src={previewDataUrl}
                    alt="Social Card Preview (Tap and hold to save)"
                    className="absolute inset-0 w-full h-full object-contain opacity-0 pointer-events-auto"
                    title="Tap & Hold to Save Image to Photos"
                  />
                )}
              </div>
            )}

            {/* Helper Tips */}
            <div className="text-[11px] text-zinc-400 text-center mt-2.5 space-y-1">
              {isMobile ? (
                <p className="flex items-center justify-center gap-1 text-emerald-400 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Tap <strong>"Share Card"</strong> or tap & hold preview to save to Photos!</span>
                </p>
              ) : (
                <p className="text-zinc-500">
                  💡 Press <strong className="text-zinc-300">Ctrl + V</strong> to paste any copied screenshot directly as background!
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* 1. Screenshot & Photo Backdrop Toolbar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#FC5200]" />
                  Screenshot & Photo Backdrop
                </label>
                {backgroundImageUrl && (
                  <button
                    type="button"
                    onClick={() => setBackgroundImageUrl(null)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Photo Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* 1. Upload Screenshot / Gallery Photo */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-[#FC5200]" />
                  <span>{isMobile ? 'Phone Screenshots' : 'Upload Image'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* 2. Snap Live Selfie */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Camera Selfie</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* 3. Screen Capture */}
                <button
                  type="button"
                  onClick={handleScreenSnapshot}
                  className={`py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                    isMobile ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isMobile ? 'Pick Photo Album' : 'Screen Capture'}</span>
                </button>
              </div>

              {/* Photo Filter & Scrim Controls (if photo is active) */}
              {backgroundImageUrl && (
                <div className="pt-2.5 border-t border-white/10 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Photo Filter Preset</span>
                    <span>Opacity: {Math.round(photoOpacity * 100)}%</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPhotoFilter(f.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-bold ${
                          photoFilter === f.id
                            ? 'bg-[#FC5200] text-white border-[#FC5200]'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={photoOpacity}
                    onChange={(e) => setPhotoOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[#FC5200]"
                  />
                </div>
              )}
            </div>

            {/* 2. Format / Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#FC5200]" />
                Card Format / Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('post')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    aspectRatio === 'post'
                      ? 'bg-[#FC5200] text-white border-[#FC5200] shadow-lg shadow-[#FC5200]/25'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4:5 Feed Post</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('story')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    aspectRatio === 'story'
                      ? 'bg-[#FC5200] text-white border-[#FC5200] shadow-lg shadow-[#FC5200]/25'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Story</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('square')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    aspectRatio === 'square'
                      ? 'bg-[#FC5200] text-white border-[#FC5200] shadow-lg shadow-[#FC5200]/25'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>1:1 Square</span>
                </button>
              </div>
            </div>

            {/* 3. Aesthetic Theme Palette */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#FC5200]" />
                Accent Colorway & Badges
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border text-left ${
                      selectedTheme === th.id
                        ? 'bg-white/15 text-white border-white ring-2 ring-offset-2 ring-offset-[#121316] ring-white/50'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${th.bg} border border-white/30`} />
                    <span className="truncate">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Athlete Note & Quick Quotes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#FC5200]" />
                Custom Caption / Athlete Note
              </label>
              <input
                type="text"
                value={userCaption}
                onChange={(e) => setUserCaption(e.target.value)}
                placeholder="e.g. Crushed leg day! Consistency beats intensity..."
                className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FC5200] transition"
                maxLength={90}
              />
              {/* Quick Quote Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {quickQuotes.map((quote, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserCaption(quote)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition text-left"
                  >
                    {quote}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Display Toggles */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#FC5200]" />
                Card Elements
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShowHighlights(!showHighlights)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-between ${
                    showHighlights ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}
                >
                  <span>Tags & Muscles</span>
                  <span className={`w-2 h-2 rounded-full ${showHighlights ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowNote(!showNote)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-between ${
                    showNote ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}
                >
                  <span>Caption Note</span>
                  <span className={`w-2 h-2 rounded-full ${showNote ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowWatermark(!showWatermark)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-between ${
                    showWatermark ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}
                >
                  <span>Brand Seal</span>
                  <span className={`w-2 h-2 rounded-full ${showWatermark ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-5 border-t border-white/10 bg-[#181A20] flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Secondary Quick Share links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              title="Share to WhatsApp"
              className="p-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 transition text-xs font-bold flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleTwitterShare}
              title="Share to X / Twitter"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition text-xs font-bold flex items-center gap-1.5"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">X / Post</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isExporting}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition text-xs font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Primary Actions: Download / Save to Photos & Native Share */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isMobile ? 'Save to Photos' : 'Download PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isExporting}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#FC5200] hover:bg-[#E04800] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#FC5200]/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Card</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
