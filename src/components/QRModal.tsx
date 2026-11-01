import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Post } from '../types.ts';
import { generateQRDataURL, downloadQRCodePNG } from '../utils/qr.ts';

interface QRModalProps {
  post: Post | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ post, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!post) return;
    const dest = post.qr_destination || `${window.location.origin}#/p/${post.id}`;
    generateQRDataURL(dest, { width: 400, margin: 2 }).then((url) => {
      setQrUrl(url);
    });
  }, [post]);

  if (!post) return null;

  const destination = post.qr_destination || `${window.location.origin}#/p/${post.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(destination);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy destination:', err);
    }
  };

  const handleDownload = async (withBranding: boolean) => {
    setDownloading(true);
    await downloadQRCodePNG(destination, post.title, withBranding);
    setDownloading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E5E5] flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#171717] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Accent Top */}
        <div className="w-16 h-1 rounded-full bg-[#B8F36B] mb-4" />

        <h3 className="font-bold text-lg text-[#171717] leading-snug px-4">
          {post.title}
        </h3>
        <p className="text-xs text-[#737373] mt-1">
          Scan to unlock content or stick in physical spaces
        </p>

        {/* Large QR Display Box with Sticker Aesthetics */}
        <div className="my-5 p-4 bg-[#F8F9FA] border-2 border-dashed border-[#DDDDDD] rounded-2xl relative group">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR Code for ${post.title}`}
              className="w-56 h-56 rounded-lg shadow-xs bg-white"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-[#737373]">
              Generating QR...
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#5B8F2B]">
            <Sparkles className="w-3.5 h-3.5 text-[#5B8F2B]" />
            <span>SENND Verified Destination</span>
          </div>
        </div>

        {/* Destination preview box */}
        <div className="w-full bg-[#F5F5F5] p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-mono text-[#333333] mb-4 overflow-hidden">
          <span className="truncate text-left">{destination}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white rounded-md text-[#171717] transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#5B8F2B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white rounded-md text-[#171717] transition-colors"
              title="Open destination link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDownload(true)}
            disabled={downloading}
            className="w-full py-2.5 px-3 bg-[#171717] hover:bg-[#333333] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#B8F36B]" />
            <span>Sticker Card PNG</span>
          </button>

          <button
            onClick={() => handleDownload(false)}
            disabled={downloading}
            className="w-full py-2.5 px-3 bg-white hover:bg-[#F5F5F5] active:scale-98 border border-[#E5E5E5] text-[#171717] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#737373]" />
            <span>Pure QR PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
