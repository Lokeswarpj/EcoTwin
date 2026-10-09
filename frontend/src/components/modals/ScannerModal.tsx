import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, Scan, UploadCloud, Video, CheckCircle, Sparkles, RefreshCw, Zap, Crosshair, FileText, Receipt } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File) => void;
  onSimulateCapture: () => void;
  onUploadBill?: (file: File) => void;
  onSimulateBill?: () => void;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onSimulateCapture,
  onUploadBill,
  onSimulateBill
}) => {
  const [scanMode, setScanMode] = useState<'item' | 'bill'>('item');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [trackingBox, setTrackingBox] = useState<BoundingBox | null>(null);
  const [detectionProgress, setDetectionProgress] = useState<number>(0);
  const [detectionState, setDetectionState] = useState<'idle' | 'tracking' | 'locking' | 'captured'>('idle');
  const [shutterFlash, setShutterFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stabilityCounterRef = useRef<number>(0);
  const lastCapturedTimeRef = useRef<number>(0);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopWebcam();
      setSelectedFile(null);
      setPreviewUrl(null);
      setUseWebcam(false);
      setTrackingBox(null);
      setDetectionProgress(0);
      setDetectionState('idle');
    }
  }, [isOpen, stopWebcam]);

  const captureSnapshot = useCallback(() => {
    if (!videoRef.current) return;

    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    // Optimized high-performance downscaled canvas
    const maxDim = 800;
    let vw = videoRef.current.videoWidth || 640;
    let vh = videoRef.current.videoHeight || 480;
    if (vw > maxDim || vh > maxDim) {
      if (vw > vh) {
        vh = Math.round((vh * maxDim) / vw);
        vw = maxDim;
      } else {
        vw = Math.round((vw * maxDim) / vh);
        vh = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, vw, vh);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `snap-audit-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setDetectionState('captured');
          stopWebcam();
          setUseWebcam(false);
          // Auto-trigger upload and AI audit seamlessly
          onUploadFile(file);
        }
      }, 'image/jpeg', 0.85);
    }
  }, [stopWebcam, onUploadFile]);

  // Optical frame analysis loop for auto-detection and tracking
  const runFrameTracker = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runFrameTracker);
      return;
    }

    // Hidden canvas for computer vision sampling
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 160;
    offCanvas.height = 120;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    if (offCtx) {
      offCtx.drawImage(video, 0, 0, 160, 120);
      const imgData = offCtx.getImageData(0, 0, 160, 120);
      const pixels = imgData.data;

      // Real-time luminance & edge gradient analysis
      let centerEnergy = 0;
      let totalVariance = 0;
      let minX = 160, maxX = 0, minY = 120, maxY = 0;
      let count = 0;

      // Sample central target region
      for (let y = 20; y < 100; y += 4) {
        for (let x = 30; x < 130; x += 4) {
          const i = (y * 160 + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Edge contrast detection
          const rightLum = 0.299 * pixels[i + 4] + 0.587 * pixels[i + 5] + 0.114 * pixels[i + 6];
          const diff = Math.abs(lum - rightLum);

          if (diff > 18) {
            centerEnergy += diff;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            count++;
          }
          totalVariance += lum;
        }
      }

      // Object detection heuristic based on optical entropy
      const hasDistinctObject = count > 18 && (maxX - minX) > 18 && (maxY - minY) > 16;

      if (hasDistinctObject) {
        const boxX = Math.max(12, (minX / 160) * 100 - 4);
        const boxY = Math.max(12, (minY / 120) * 100 - 4);
        const boxW = Math.min(76, ((maxX - minX) / 160) * 100 + 8);
        const boxH = Math.min(76, ((maxY - minY) / 120) * 100 + 8);

        setTrackingBox({
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          confidence: Math.min(0.98, 0.75 + (count / 140) * 0.23),
        });

        stabilityCounterRef.current += 1;

        if (stabilityCounterRef.current > 4) {
          setDetectionState('locking');
          // Progress from 0% to 100%
          const progress = Math.min(100, (stabilityCounterRef.current - 4) * 14);
          setDetectionProgress(progress);

          // Auto-trigger snapshot when locked 100%
          if (autoCaptureEnabled && progress >= 100 && Date.now() - lastCapturedTimeRef.current > 2500) {
            lastCapturedTimeRef.current = Date.now();
            captureSnapshot();
            return;
          }
        } else {
          setDetectionState('tracking');
          setDetectionProgress(30);
        }
      } else {
        stabilityCounterRef.current = Math.max(0, stabilityCounterRef.current - 2);
        setDetectionProgress(0);
        setDetectionState('idle');
        setTrackingBox(null);
      }
    }

    animFrameRef.current = requestAnimationFrame(runFrameTracker);
  }, [autoCaptureEnabled, captureSnapshot]);

  const startWebcam = async () => {
    try {
      setUseWebcam(true);
      setDetectionState('idle');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          runFrameTracker();
        };
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err);
      setUseWebcam(false);
      alert('Could not access camera. You can upload a photo from your device instead!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopWebcam();
      setUseWebcam(false);
    }
  };

  const handleConfirmAudit = () => {
    if (scanMode === 'bill') {
      if (selectedFile && onUploadBill) {
        onUploadBill(selectedFile);
      } else if (onSimulateBill) {
        onSimulateBill();
      }
    } else {
      if (selectedFile) {
        onUploadFile(selectedFile);
      } else {
        onSimulateCapture();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-[32px] p-6 relative border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-display text-2xl text-white">AI Vision Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <button
            onClick={() => {
              setScanMode('item');
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              scanMode === 'item'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Physical Item Lens
          </button>

          <button
            onClick={() => {
              setScanMode('bill');
              stopWebcam();
              setUseWebcam(false);
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              scanMode === 'bill'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Bill &amp; Receipt OCR
          </button>
        </div>

        {/* Viewfinder Preview Area with Live Frame Tracking HUD */}
        <div className="relative w-full h-80 rounded-2xl bg-black/60 border border-white/20 overflow-hidden flex items-center justify-center mb-5">
          {/* Laser scanning beam */}
          <div className="scan-beam" />

          {/* Shutter White Flash Animation */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-40 transition-opacity duration-200 pointer-events-none" />
          )}

          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/80">
              <img
                src={previewUrl}
                alt="Captured target"
                className="max-h-full max-w-full object-contain p-2"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-mono">Auto-Locked &amp; Captured</span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  startWebcam();
                }}
                className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/90 flex items-center gap-1.5 border border-white/20 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                <span>Re-Snap</span>
              </button>
            </div>
          ) : useWebcam ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Dynamic Auto-Tracking Bounding Box HUD */}
              {trackingBox && (
                <div
                  className="absolute pointer-events-none transition-all duration-75 border-2 rounded-xl"
                  style={{
                    left: `${trackingBox.x}%`,
                    top: `${trackingBox.y}%`,
                    width: `${trackingBox.width}%`,
                    height: `${trackingBox.height}%`,
                    borderColor: detectionState === 'locking' ? '#4ade80' : '#38bdf8',
                    boxShadow: detectionState === 'locking'
                      ? '0 0 20px rgba(74, 222, 128, 0.6), inset 0 0 15px rgba(74, 222, 128, 0.3)'
                      : '0 0 15px rgba(56, 189, 248, 0.5)',
                  }}
                >
                  {/* Four Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />

                  {/* Target Lock Label */}
                  <div className="absolute -top-7 left-0 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border border-white/20">
                    <Crosshair className="w-3 h-3 text-emerald-400 animate-spin-slow" />
                    <span className={detectionState === 'locking' ? 'text-emerald-400 font-bold' : 'text-cyan-300'}>
                      {detectionState === 'locking' ? `AUTO-LOCK ${detectionProgress}%` : 'TRACKING ITEM'}
                    </span>
                  </div>
                </div>
              )}

              {/* Auto Capture Status Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center justify-between border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    detectionState === 'locking'
                      ? 'bg-emerald-400 animate-ping'
                      : detectionState === 'tracking'
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-white/40'
                  }`} />
                  <span className="font-mono text-white/90">
                    {detectionState === 'locking'
                      ? `Locking target... Hold steady`
                      : detectionState === 'tracking'
                      ? `Item detected • Stabilizing`
                      : `Align item in viewfinder`}
                  </span>
                </div>

                {detectionState === 'locking' && (
                  <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-75"
                      style={{ width: `${detectionProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Scan className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <p className="text-sm text-white/90 font-medium">
                Auto-Frame Tracking &amp; Instant AI Audit
              </p>
              <p className="text-xs text-white/50 font-mono">
                Point camera at any phone, packaging, bottle, or bill — camera will auto-lock and snap!
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="hidden"
        />

        {/* Action Controls & Auto-Capture Toggle */}
        <div className="space-y-3">
          {useWebcam && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${autoCaptureEnabled ? 'text-emerald-400' : 'text-white/40'}`} />
                <span className="text-white/90 font-medium">Auto-Snap on Target Detection</span>
              </div>
              <button
                onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                  autoCaptureEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-white/10 text-white/60 border border-white/10'
                }`}
              >
                {autoCaptureEnabled ? 'ENABLED' : 'MANUAL'}
              </button>
            </div>
          )}

          {scanMode === 'bill' ? (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">
                Quick Sample Audits:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onSimulateBill) onSimulateBill();
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-medium text-left cursor-pointer transition-all"
                >
                  ⚡ BESCOM Power Bill
                  <span className="block text-[10px] text-white/50">340 kWh • ₹2,850</span>
                </button>
                <button
                  onClick={() => {
                    if (onSimulateBill) onSimulateBill();
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-medium text-left cursor-pointer transition-all"
                >
                  🛒 Grocery Order Bill
                  <span className="block text-[10px] text-white/50">8 items • ₹1,420</span>
                </button>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer text-xs"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                Upload Custom Bill / Receipt (PDF or Image)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                Upload from Device
              </button>

              {useWebcam ? (
                <button
                  onClick={captureSnapshot}
                  className="py-3 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Camera className="w-4 h-4" />
                  Manual Snap
                </button>
              ) : (
                <button
                  onClick={startWebcam}
                  className="py-3 px-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Video className="w-4 h-4 text-black" />
                  Start Auto Scanner
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleConfirmAudit}
            className="w-full bg-white text-black py-3.5 rounded-full font-semibold btn-hover flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
          >
            <Sparkles className="w-5 h-5 text-emerald-600" />
            {selectedFile
              ? `Audit with Gemini AI`
              : scanMode === 'bill'
              ? `Run AI Bill Planetary Audit (BESCOM Sample)`
              : `Run AI Planetary Audit (Demo Sample)`}
          </button>
        </div>
      </div>
    </div>
  );
};
