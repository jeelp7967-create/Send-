import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Post, CategoryType } from '../types.ts';
import { api } from '../utils/api.ts';
import { generateQRDataURL } from '../utils/qr.ts';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('Product');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [qrDestination, setQrDestination] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');

  const [liveQR, setLiveQR] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Live QR preview updates whenever qrDestination or title changes
  useEffect(() => {
    const dest = qrDestination.trim() || 'https://sennd.app/preview';
    generateQRDataURL(dest, { width: 140, margin: 1 }).then((url) => {
      setLiveQR(url);
    });
  }, [qrDestination]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit. Please select a smaller media file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const loc = [data.address?.city || data.address?.town, data.address?.state, data.address?.country].filter(Boolean).join(', ');
            setLocationName(loc || 'Current Location');
          } else {
            setLocationName(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
          }
        } catch {
          setLocationName(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setError('Location permission denied or unavailable. Please type your location manually.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }

    const effectiveMedia = mediaFilePreview || mediaUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    const effectiveDestination = qrDestination.trim() || `${window.location.origin}#/p/sennd-temp`;

    setLoading(true);
    try {
      const created = await api.createPost({
        title: title.trim(),
        description: description.trim(),
        category: category === 'All' ? 'Product' : category,
        media_url: effectiveMedia,
        thumbnail_url: effectiveMedia,
        qr_destination: effectiveDestination,
        location_name: locationName.trim(),
        latitude,
        longitude,
        visibility,
        price: price.trim() || undefined,
        details: details.trim() || undefined,
      });

      // If user left destination blank, update it with the permanent post link
      if (!qrDestination.trim()) {
        created.qr_destination = `${window.location.origin}#/p/${created.id}`;
      }

      onPostCreated(created);
    } catch (err: any) {
      console.error('Failed to publish post:', err);
      setError(err?.message || 'Failed to publish post. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E5E5E5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
          <div>
            <h2 className="text-xl font-bold text-[#171717]">Create SENND Post</h2>
            <p className="text-xs text-[#737373]">Publish content and generate physical stickable QR code</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#171717] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(['Product', 'Place', 'Video', 'Audio', 'Document', 'Link'] as CategoryType[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#CCCCCC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Handmade Ceramic Cup or Heritage Stepwell Guide"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717] focus:ring-1 focus:ring-[#171717]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what discoverers will find when they scan..."
              className="w-full p-3 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717] focus:ring-1 focus:ring-[#171717]"
            />
          </div>

          {/* Media / Photo Upload or URL */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Cover Image / Media (Upload or URL)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setMediaFilePreview(null);
                }}
                placeholder="Paste image or media URL (optional)"
                className="flex-1 h-10 px-3 text-xs rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
              />
              <label className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#171717] flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {mediaFilePreview && (
              <div className="relative mt-2 w-full h-32 rounded-xl overflow-hidden bg-black/5 border border-[#E5E5E5]">
                <img src={mediaFilePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMediaFilePreview(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Location with GPS pin button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#171717]">
                Location (Optional)
              </label>
              <button
                type="button"
                onClick={handleFetchCurrentLocation}
                disabled={locating}
                className="text-[11px] font-semibold text-[#5B8F2B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Ahmedabad, Gujarat or Coffee Shop Desk #4"
              className="w-full h-10 px-3.5 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
            />
          </div>

          {/* QR Destination Link & Live Preview */}
          <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-24 h-24 bg-white border border-[#DDDDDD] rounded-xl p-1 flex items-center justify-center">
                {liveQR ? (
                  <img src={liveQR} alt="QR Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[10px] text-gray-400">QR Code</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  QR Destination URL
                </label>
                <input
                  type="text"
                  value={qrDestination}
                  onChange={(e) => setQrDestination(e.target.value)}
                  placeholder="https://... (Leave empty for SENND post page)"
                  className="w-full h-9 px-2.5 text-xs font-mono rounded-lg border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
                />
                <p className="text-[11px] text-[#737373] mt-1.5">
                  When scanned with any phone camera, this destination will open instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Product price & Details */}
          {category === 'Product' && (
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Product Price (Optional)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $49.00 or ₹1,999"
                className="w-full h-10 px-3.5 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Instructions / Secret Notes for Scanners (Optional)
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Show this QR at the counter for 10% off"
              className="w-full h-10 px-3.5 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
            />
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-bold text-[#171717]">Visibility</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                  visibility === 'public'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#737373] border-[#E5E5E5]'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility('unlisted')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                  visibility === 'unlisted'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#737373] border-[#E5E5E5]'
                }`}
              >
                Unlisted
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#171717] hover:bg-[#2e2e2e] active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#B8F36B]" />
                <span>Publishing & Generating QR...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#B8F36B]" />
                <span>Publish & Generate QR</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
