import React, { useState, useEffect } from 'react';
import { X, MapPin, Share2, Bookmark, Check, Download, ExternalLink, QrCode, Eye } from 'lucide-react';
import { Post } from '../types.ts';
import { generateQRDataURL, downloadQRCodePNG } from '../utils/qr.ts';

interface PostDetailModalProps {
  post: Post | null;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
  onClose: () => void;
  onOpenQR: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isSaved,
  onToggleSave,
  onClose,
  onOpenQR,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!post) return;
    const dest = post.qr_destination || `${window.location.origin}#/p/${post.id}`;
    generateQRDataURL(dest, { width: 220, margin: 1 }).then((url) => {
      setQrUrl(url);
    });
  }, [post]);

  if (!post) return null;

  const destination = post.qr_destination || `${window.location.origin}#/p/${post.id}`;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}#/p/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E5E5E5] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with category & close */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#171717] text-white text-[11px] font-bold uppercase tracking-wider">
              {post.category}
            </span>
            {post.price && (
              <span className="px-2 py-0.5 rounded-full bg-[#EFF9E5] text-[#3d681c] text-[11px] font-bold border border-[#B8D99A]">
                {post.price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(post.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-[#EFF9E5] border-[#8DBD60] text-[#5B8F2B]'
                  : 'bg-white border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5]'
              }`}
              title="Save post"
              aria-label="Save post"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#5B8F2B]' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#F5F5F5] transition-all cursor-pointer"
              title="Share post"
              aria-label="Share post"
            >
              {copied ? <Check className="w-4 h-4 text-[#5B8F2B]" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#171717] cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Player / Cover */}
        <div className="mt-4 rounded-2xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
          {post.media_type === 'video' ? (
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={post.media_url || post.thumbnail_url}
                alt={post.title}
                className="w-full h-full object-cover opacity-85"
              />
              <a
                href={post.qr_destination}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/30 transition-colors text-white gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#B8F36B] text-[#171717] flex items-center justify-center pl-1 font-bold shadow-lg">
                  ▶
                </div>
                <span className="text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">
                  Watch Video ↗
                </span>
              </a>
            </div>
          ) : (
            <img
              src={post.media_url || post.thumbnail_url}
              alt={post.title}
              className="w-full max-h-72 object-cover"
            />
          )}
        </div>

        {/* Creator Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={post.creator_avatar}
              alt={post.creator_name}
              className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
            />
            <div>
              <p className="text-xs font-bold text-[#171717]">{post.creator_name}</p>
              <p className="text-[10px] text-[#737373]">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#737373]">
            <span className="flex items-center gap-1" title="Scans">
              <QrCode className="w-3.5 h-3.5 text-[#5B8F2B]" />
              <strong>{post.scans}</strong> scans
            </span>
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5" />
              <strong>{post.views}</strong> views
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-[#171717] leading-tight">
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-[#555555] leading-relaxed whitespace-pre-line">
            {post.description}
          </p>

          {post.details && (
            <div className="mt-3 p-3 bg-[#F9F9F9] border border-[#EEEEEE] rounded-xl text-xs text-[#666666] leading-relaxed">
              <strong className="text-[#171717] block mb-1">Post Details & Instructions:</strong>
              {post.details}
            </div>
          )}

          {post.location_name && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#171717]">
              <MapPin className="w-4 h-4 text-[#FF8C42] shrink-0" />
              <span>{post.location_name}</span>
              {post.latitude && post.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5B8F2B] hover:underline ml-1 font-semibold"
                >
                  (Maps ↗)
                </a>
              )}
            </div>
          )}
        </div>

        {/* QR Section inside detail card */}
        <div className="mt-6 p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onOpenQR(post)}
            className="w-28 h-28 p-1.5 bg-white border border-[#DDDDDD] rounded-xl flex items-center justify-center shrink-0 hover:border-[#B8F36B] transition-colors cursor-pointer shadow-xs"
            title="Enlarge QR"
          >
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-12 h-12 text-[#171717]" />
            )}
          </button>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              QR Destination
            </h4>
            <p className="text-xs font-mono text-[#171717] truncate mt-0.5">
              {destination}
            </p>
            <p className="text-[11px] text-[#777777] mt-1">
              Stick this QR code in physical locations or on product packaging.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <a
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#171717] text-white text-xs font-semibold hover:bg-[#333333] transition-colors"
              >
                <span>Visit Destination</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => downloadQRCodePNG(destination, post.title, true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#5B8F2B]" />
                <span>Save Sticker</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
