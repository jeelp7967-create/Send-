import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Eye, QrCode, ArrowUpRight, Check, MapPin } from 'lucide-react';
import { Post } from '../types.ts';
import { generateQRDataURL } from '../utils/qr.ts';

interface PostCardProps {
  post: Post;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
  onOpenDetails: (post: Post) => void;
  onOpenQR: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onOpenQR,
}) => {
  const [qrSrc, setQrSrc] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR code for destination (or post direct URL)
  useEffect(() => {
    let isMounted = true;
    const destination = post.qr_destination || `${window.location.origin}#/p/${post.id}`;
    generateQRDataURL(destination, { width: 160, margin: 1 }).then((url) => {
      if (isMounted && url) {
        setQrSrc(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [post.qr_destination, post.id]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}#/p/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SENND: ${post.title}`,
          text: post.description,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <article className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs hover:border-[#D0D0D0] transition-all flex flex-col justify-between group">
      {/* Upper Content: Image + Info */}
      <div className="p-3.5 grid grid-cols-1 sm:grid-cols-[1fr_1.3fr] gap-3.5">
        {/* Cover Image / Thumbnail */}
        <div
          onClick={() => onOpenDetails(post)}
          className="relative w-full aspect-16/10 sm:aspect-4/3 rounded-xl overflow-hidden bg-[#F1F1F1] cursor-pointer group-hover:opacity-95 transition-opacity"
        >
          {!imageError ? (
            <img
              src={post.thumbnail_url || post.media_url}
              alt={post.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold text-white text-lg"
              style={{ backgroundColor: post.color || '#171717' }}
            >
              {post.category}
            </div>
          )}

          {/* Category Tag overlay on mobile or upper tag */}
          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#171717] uppercase tracking-wider shadow-xs">
            {post.category}
          </span>

          {post.price && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#171717] text-white text-[11px] font-bold shadow-xs">
              {post.price}
            </span>
          )}
        </div>

        {/* Text Info */}
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] text-[#737373] font-medium truncate">
                by {post.creator_name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                <span className="flex items-center gap-0.5" title="Total Scans">
                  <QrCode className="w-3 h-3 text-[#5B8F2B]" />
                  {post.scans}
                </span>
                <span className="flex items-center gap-0.5" title="Total Views">
                  <Eye className="w-3 h-3 text-[#737373]" />
                  {post.views}
                </span>
              </div>
            </div>

            <h3
              onClick={() => onOpenDetails(post)}
              className="font-bold text-[15px] sm:text-[16px] text-[#171717] leading-snug line-clamp-2 hover:text-[#5B8F2B] cursor-pointer transition-colors"
            >
              {post.title}
            </h3>

            <p className="mt-1.5 text-xs text-[#666666] leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </div>

          {post.details && (
            <p className="mt-2 text-[11px] text-[#888888] line-clamp-1 italic">
              ↳ {post.details}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Scannable QR Box + Location / URL + Actions */}
      <div className="border-t border-[#EEEEEE] p-3 flex items-center justify-between gap-3 bg-[#FAFAFA]/50">
        {/* Interactive QR Code Box */}
        <button
          onClick={() => onOpenQR(post)}
          className="shrink-0 w-[68px] h-[68px] p-1 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-center hover:border-[#B8F36B] hover:shadow-xs transition-all cursor-pointer relative group/qr"
          title="Tap to enlarge & download QR"
          aria-label={`Enlarge QR code for ${post.title}`}
        >
          {qrSrc ? (
            <img src={qrSrc} alt="Post QR" className="w-full h-full object-contain" />
          ) : (
            <QrCode className="w-8 h-8 text-[#171717] animate-pulse" />
          )}
          <span className="absolute -bottom-1 -right-1 bg-[#171717] text-white p-0.5 rounded-full text-[8px] opacity-0 group-hover/qr:opacity-100 transition-opacity">
            <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* Post Metadata: Location & QR Destination */}
        <div className="flex-1 min-w-0 pr-1">
          {post.location_name && (
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#222222] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#FF8C42] shrink-0" />
              <span className="truncate">{post.location_name}</span>
            </div>
          )}
          <div className="text-[10px] text-[#737373] truncate mt-0.5 font-mono">
            {post.qr_destination.replace(/^https?:\/\//, '')}
          </div>
        </div>

        {/* Small Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Details Button */}
          <button
            onClick={() => onOpenDetails(post)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[11px] font-semibold text-[#171717] hover:bg-[#F5F5F5] active:scale-95 transition-all cursor-pointer"
            aria-label="View post details"
          >
            Details
          </button>

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(post.id);
            }}
            className={`p-2 rounded-lg border transition-all cursor-pointer active:scale-90 ${
              isSaved
                ? 'bg-[#EFF9E5] border-[#8DBD60] text-[#5B8F2B]'
                : 'bg-white border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5]'
            }`}
            title={isSaved ? 'Saved to collection' : 'Save post'}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#5B8F2B]' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#F5F5F5] active:scale-90 transition-all cursor-pointer relative"
            title="Share post"
            aria-label="Share post"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#5B8F2B]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
