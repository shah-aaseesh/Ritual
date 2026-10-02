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
        await qrReaderRef.current.stop();
        qrReaderRef.current.clear();
      } catch (e) {
        // ignore
      }
      qrReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setScannedCode(barcode);
    setIsProcessing(true);
    stopCameraScanner();

    try {
      const result = await lookupProductByBarcode(barcode, userGoal);
      onProductFound(result);
      onClose();
    } catch (err: any) {
      setScanError(err.message || 'Product not found for this barcode.');
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setScanError(null);

    try {
      const html5QrCode = new Html5Qrcode('barcode-file-hidden-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleBarcodeDetected(decodedText);
    } catch (err) {
      setScanError('Could not detect a clear barcode in this photo. Please try another angle or enter digits manually.');
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
    <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div id="barcode-file-hidden-reader" className="hidden" />
      
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-modal border border-mint-200 flex flex-col max-h-[92vh] text-charcoal-900">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-mint-100 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-800 to-mint-700 text-white flex items-center justify-center shadow-soft">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-forest-950 text-base">Barcode Scanner</h3>
              <p className="text-xs text-charcoal-500">Instant verified formula lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-mint-50 transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Scanner Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="relative bg-cream-100 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-mint-200 shadow-inner">
            {/* Html5Qrcode Render Target */}
            <div id={readerElementId} className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

            {/* Visual Laser Scanner Overlay */}
            {isScanning && !scannedCode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-36 border-2 border-forest-800/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(20,41,29,0.3)]">
                  {/* Corner Accent Marks */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-forest-900 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-forest-900 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-forest-900 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-forest-900 rounded-br-lg" />
                  
                  {/* Animated Laser Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-mint-500 shadow-[0_0_12px_#317353] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-xs font-semibold text-white bg-forest-950/90 px-3 py-1 rounded-full mt-3 border border-mint-200/30 backdrop-blur-sm font-mono">
                  Align barcode inside viewfinder
                </span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-forest-900 animate-spin mb-3">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-forest-950 text-sm">Decoding Barcode: {scannedCode}</h4>
                <p className="text-xs text-charcoal-500 mt-1">Cross-referencing verified INCI catalog...</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {scanError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
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
              className="flex-1 py-2.5 px-3 rounded-xl bg-cream-50 hover:bg-mint-50 text-forest-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-mint-200"
            >
              <Image className="w-4 h-4 text-forest-800" />
              <span>Scan Barcode from Photo</span>
            </button>
            <button
              onClick={startCameraScanner}
              className="p-2.5 rounded-xl bg-cream-50 hover:bg-mint-50 text-forest-950 text-xs font-bold flex items-center justify-center transition-colors border border-mint-200"
              title="Restart Camera"
            >
              <RefreshCw className="w-4 h-4 text-charcoal-500" />
            </button>
          </div>

          {/* Quick Preset Barcode Chips */}
          <div>
            <span className="text-[11px] font-mono font-bold text-charcoal-500 uppercase tracking-wider block mb-2">
              Quick Test Barcodes (1-Tap Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(KNOWN_BARCODES).slice(0, 4).map(([code, item]) => (
                <button
                  key={code}
                  onClick={() => handleBarcodeDetected(code)}
                  className="p-3 text-left rounded-xl bg-cream-50/70 hover:bg-mint-50 border border-mint-100 hover:border-mint-300 transition-all text-xs group"
                >
                  <div className="font-bold text-forest-950 truncate group-hover:text-forest-800">
                    {item.name.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">
                    {code}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-mint-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Or type 12-13 digit barcode..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-mint-200 text-xs focus:ring-2 focus:ring-mint-500 focus:outline-none bg-cream-50 text-charcoal-900 font-mono placeholder:text-charcoal-400"
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim() || isProcessing}
                className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-black text-xs transition-colors shadow-soft"
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
