import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ScanBarcode, X, Image, AlertCircle, RefreshCw } from 'lucide-react';
import { lookupProductByBarcode, BarcodeLookupResult, KNOWN_BARCODES } from '../../services/barcodeService';
import { WellnessGoal } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (result: BarcodeLookupResult) => void;
  userGoal: WellnessGoal;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
  userGoal
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'ritual-barcode-reader-view';

  useEffect(() => {
    if (isOpen) {
      startCameraScanner();
    } else {
      stopCameraScanner();
      setScanError(null);
      setScannedCode(null);
      setManualBarcode('');
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen]);

  const startCameraScanner = async () => {
    try {
      setScanError(null);
      setIsScanning(true);

      // Wait for DOM element to be ready
      await new Promise(r => setTimeout(r, 200));

      if (qrReaderRef.current) {
        try {
          await qrReaderRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE
      ];

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport,
        verbose: false
      });
      qrReaderRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 280, height: 180 }
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame error (no code in current frame) - ignore
        }
      );
    } catch (err: any) {
      console.warn('Camera barcode start error:', err);
      setIsScanning(false);
      setScanError(
        'Camera permission was denied or camera is not accessible. You can upload a photo of the barcode or enter the number below.'
      );
    }
  };

  const stopCameraScanner = async () => {
    if (qrReaderRef.current) {
      try {
        if (qrReaderRef.current.isScanning) {
          await qrReaderRef.current.stop();
        }
        await qrReaderRef.current.clear();
      } catch (e) {
        // ignore
      }
      qrReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleBarcodeDetected = async (barcodeText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScannedCode(barcodeText);
    await stopCameraScanner();

    try {
      const result = await lookupProductByBarcode(barcodeText, userGoal);
      onProductFound(result);
      onClose();
    } catch (e) {
      setScanError('Product lookup failed for barcode. Try entering manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setScanError(null);

    try {
      if (!qrReaderRef.current) {
        qrReaderRef.current = new Html5Qrcode(readerElementId);
      }
      
      const decodedResult = await qrReaderRef.current.scanFile(file, true);
      if (decodedResult) {
        await handleBarcodeDetected(decodedResult);
      }
    } catch (err) {
      setScanError('No readable barcode found in this photo. Make sure the barcode lines are clear and well-lit.');
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleBarcodeDetected(manualBarcode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#121217] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#181822]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3B30] to-rose-700 text-white flex items-center justify-center shadow-md shadow-[#FF3B30]/20">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Barcode Scanner</h3>
              <p className="text-xs text-zinc-400">Instant verified formula lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Scanner Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="relative bg-[#09090D] rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-white/10 shadow-inner">
            {/* Html5Qrcode Render Target */}
            <div id={readerElementId} className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

            {/* Visual Laser Scanner Overlay */}
            {isScanning && !scannedCode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-36 border-2 border-[#FF3B30]/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                  {/* Corner Accent Marks */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#FF3B30] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#FF3B30] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#FF3B30] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#FF3B30] rounded-br-lg" />
                  
                  {/* Animated Laser Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-[#FF3B30] shadow-[0_0_12px_#FF3B30] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-xs font-semibold text-white bg-[#09090D]/90 px-3 py-1 rounded-full mt-3 border border-white/10 backdrop-blur-sm font-mono">
                  Align barcode inside viewfinder
                </span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-[#09090D]/95 flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30] flex items-center justify-center text-[#FF3B30] animate-spin mb-3">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm">Decoding Barcode: {scannedCode}</h4>
                <p className="text-xs text-zinc-400 mt-1">Cross-referencing verified INCI catalog...</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {scanError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <p>{scanError}</p>
            </div>
          )}

          {/* Alternate Actions: Photo Upload & Presets */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#181822] hover:bg-[#20202c] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/10"
            >
              <Image className="w-4 h-4 text-[#FF3B30]" />
              <span>Scan Barcode from Photo</span>
            </button>
            <button
              onClick={startCameraScanner}
              className="p-2.5 rounded-xl bg-[#181822] hover:bg-[#20202c] text-white text-xs font-bold flex items-center justify-center transition-colors border border-white/10"
              title="Restart Camera"
            >
              <RefreshCw className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Quick Preset Barcode Chips */}
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Quick Test Barcodes (1-Tap Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(KNOWN_BARCODES).slice(0, 4).map(([code, item]) => (
                <button
                  key={code}
                  onClick={() => handleBarcodeDetected(code)}
                  className="p-3 text-left rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/25 transition-all text-xs group"
                >
                  <div className="font-bold text-white truncate group-hover:text-[#FF3B30]">
                    {item.name.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {code}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Or type 12-13 digit barcode..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:ring-1 focus:ring-[#FF3B30] focus:outline-none bg-[#09090D] text-white font-mono placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim() || isProcessing}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-black text-xs transition-colors shadow-md"
              >
                Lookup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
