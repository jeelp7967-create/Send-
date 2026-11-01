import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Upload, ExternalLink, Check, Copy, ArrowLeft, RefreshCw, AlertCircle, Sparkles, QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../utils/api.ts';
import { Post } from '../types.ts';

interface ScannerPageProps {
  onBack: () => void;
  onOpenPost: (post: Post) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onBack, onOpenPost }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [matchedPost, setMatchedPost] = useState<Post | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'sennd-qr-reader-container';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  }, []);

  const handleDecodedText = useCallback(async (decodedText: string) => {
    // Stop scanning once code detected
    await stopScanner();
    setScanResult(decodedText);
    setErrorMessage(null);

    // Audio / vibration feedback if supported
    try {
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch {}

    // Check if the decoded text references a SENND post ID or URL
    // Examples: https://example.com/#/p/sennd-post-1, /p/sennd-post-1, or sennd-post-1
    const match = decodedText.match(/sennd-[a-zA-Z0-9-]+/);
    if (match) {
      const postId = match[0];
      setLoadingPost(true);
      try {
        const post = await api.getPostById(postId);
        if (post) {
          setMatchedPost(post);
          // Record scan event in the database
          api.recordScan(post.id).catch(() => {});
        }
      } catch (err) {
        console.error('Error fetching matched post:', err);
      } finally {
        setLoadingPost(false);
      }
    }
  }, [stopScanner]);

  const startScanner = async () => {
    setErrorMessage(null);
    setScanResult(null);
    setMatchedPost(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }

      const config = {
        fps: 15,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Prefer rear camera on mobile
        config,
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // Scanner frame processing - ignore per-frame failures
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or upload a QR image from your device below.');
      } else if (err?.name === 'NotFoundError') {
        setErrorMessage('No camera was detected on this device. You can test by uploading a QR code image below.');
      } else {
        setErrorMessage('Could not start camera scanner. You can test by scanning a QR image from your files.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      handleDecodedText(result);
    } catch (err) {
      console.warn('QR file scan error:', err);
      setErrorMessage('No valid QR code could be found in this image. Please try another image.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cleanup on unmount or tab switch
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-24">
      {/* Back button & Title */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            stopScanner();
            onBack();
          }}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#171717] hover:text-[#5B8F2B] transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
          SENND Camera Reader
        </span>
      </div>

      <div className="text-center mb-5">
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">
          Scan QR Code
        </h2>
        <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
          Scan any SENND sticker, product label, or place code using your camera.
        </p>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="relative w-full max-w-sm mx-auto aspect-square bg-[#171717] rounded-3xl overflow-hidden shadow-md border-2 border-[#E5E5E5] flex items-center justify-center">
        {/* html5-qrcode reader mounting element */}
        <div id={readerElementId} className="w-full h-full" />

        {/* Viewfinder Target Graphic (when idle or scanning) */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder box with 4 corners */}
            <div className="relative w-60 h-60 border-2 border-white/20 rounded-2xl">
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#B8F36B] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#B8F36B] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#B8F36B] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#B8F36B] rounded-br-lg" />

              {/* Animated laser scan bar */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#B8F36B] to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_12px_#B8F36B]" />
            </div>
          </div>
        )}

        {/* Idle / Stopped Overlay */}
        {!isScanning && !scanResult && (
          <div className="absolute inset-0 bg-[#171717] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-[#262626] border border-[#333333] flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-[#B8F36B]" />
            </div>
            <p className="text-sm font-bold">Camera is paused</p>
            <p className="text-xs text-[#888888] mt-1 max-w-xs">
              Tap below to turn on the camera or select a QR image from your gallery.
            </p>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="w-full sm:w-auto flex-1 py-3 px-5 bg-[#171717] hover:bg-[#2b2b2b] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Camera className="w-4 h-4 text-[#B8F36B]" />
            <span>Start Camera Scanner</span>
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full sm:w-auto flex-1 py-3 px-5 bg-white hover:bg-[#F5F5F5] active:scale-98 border border-[#E5E5E5] text-[#171717] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CameraOff className="w-4 h-4 text-red-500" />
            <span>Stop Scanner</span>
          </button>
        )}

        {/* Scan from file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="qr-file-upload"
        />
        <label
          htmlFor="qr-file-upload"
          className="w-full sm:w-auto py-3 px-4 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-98 border border-[#E5E5E5] text-[#171717] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4 text-[#737373]" />
          <span>Upload QR Image</span>
        </label>
      </div>

      {/* Error Message banner */}
      {errorMessage && (
        <div className="mt-4 max-w-sm mx-auto p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-amber-700 font-bold">×</button>
        </div>
      )}

      {/* Decoded QR Result Card */}
      {scanResult && (
        <div className="mt-6 max-w-sm mx-auto bg-white border-2 border-[#B8F36B] rounded-2xl p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B8F2B]">
              <Sparkles className="w-4 h-4 text-[#5B8F2B]" />
              <span>QR Code Successfully Decoded</span>
            </div>
            <button
              onClick={() => {
                setScanResult(null);
                setMatchedPost(null);
                startScanner();
              }}
              className="text-[11px] font-semibold text-[#171717] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Scan another</span>
            </button>
          </div>

          <div className="p-2.5 bg-[#F8F9FA] rounded-xl text-xs font-mono text-[#171717] break-all mb-3 border border-[#EEEEEE]">
            {scanResult}
          </div>

          {/* If matches a SENND post */}
          {loadingPost && (
            <div className="py-2 text-center text-xs text-[#737373] animate-pulse">
              Looking up SENND post details...
            </div>
          )}

          {matchedPost && (
            <div className="p-3 bg-[#F4FBEA] border border-[#B8D99A] rounded-xl mb-3 flex items-center gap-3">
              <img
                src={matchedPost.thumbnail_url || matchedPost.media_url}
                alt={matchedPost.title}
                className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E5]"
              />
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[9px] font-bold text-[#5B8F2B] uppercase">SENND Match</span>
                <h4 className="text-xs font-bold text-[#171717] truncate">{matchedPost.title}</h4>
                <p className="text-[10px] text-[#737373] truncate">{matchedPost.location_name || matchedPost.category}</p>
              </div>
              <button
                onClick={() => onOpenPost(matchedPost)}
                className="px-2.5 py-1.5 bg-[#171717] text-white rounded-lg text-xs font-bold hover:bg-[#333333] cursor-pointer"
              >
                View
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(scanResult)}
              className="flex-1 py-2 px-3 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#5B8F2B]" /> : <Copy className="w-3.5 h-3.5 text-[#737373]" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {scanResult.startsWith('http') && (
              <a
                href={scanResult}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#171717] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#333333] transition-colors"
              >
                <span>Open URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
