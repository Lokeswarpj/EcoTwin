import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Scan, UploadCloud, Video, CheckCircle, RefreshCw } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File) => void;
  onSimulateCapture: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onSimulateCapture,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopWebcam();
      setSelectedFile(null);
      setPreviewUrl(null);
      setUseWebcam(false);
    }
  }, [isOpen]);

  const startWebcam = async () => {
    try {
      setUseWebcam(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err);
      setUseWebcam(false);
      alert('Could not access camera. You can upload a photo from your computer instead!');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-snapshot.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          stopWebcam();
          setUseWebcam(false);
        }
      }, 'image/jpeg');
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
    if (selectedFile) {
      onUploadFile(selectedFile);
    } else {
      onSimulateCapture();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-[32px] p-6 relative border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-display text-2xl text-white">Live AI Planetary Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Preview Area */}
        <div className="relative w-full h-72 rounded-2xl bg-black/50 border border-white/20 overflow-hidden flex items-center justify-center mb-6">
          <div className="scan-beam" />

          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/70">
              <img
                src={previewUrl}
                alt="Uploaded item preview"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-xs text-green-400 flex items-center gap-1.5 border border-green-500/30">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Photo Ready for AI Audit</span>
              </div>
            </div>
          ) : useWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <Scan className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <p className="text-sm text-white/90 font-medium">
                Upload or capture an item photo for instant Gemini AI audit
              </p>
              <p className="text-xs text-white/50 font-mono">
                Supports: Plastic bottles, Tetra Paks, food perishables, utility bills, receipts
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

        {/* Upload & Camera Buttons */}
        <div className="space-y-3">
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
                onClick={captureWebcamSnapshot}
                className="py-3 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Snap Photo Now
              </button>
            ) : (
              <button
                onClick={startWebcam}
                className="py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-green-400" />
                Use Web Camera
              </button>
            )}
          </div>

          <button
            onClick={handleConfirmAudit}
            className="w-full bg-white text-black py-3.5 rounded-full font-semibold btn-hover flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
          >
            <Camera className="w-5 h-5 text-black" />
            {selectedFile
              ? `Audit Uploaded Image with Gemini`
              : `Run AI Planetary Audit (Demo Sample)`}
          </button>
        </div>
      </div>
    </div>
  );
};
