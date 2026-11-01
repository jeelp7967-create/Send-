import QRCode from 'qrcode';

export async function generateQRDataURL(text: string, options?: {
  width?: number;
  margin?: number;
  color?: { dark?: string; light?: string };
}): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.color?.dark || '#171717',
        light: options?.color?.light || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

/**
 * Downloads a generated QR code image as PNG.
 * Can optionally composite a clean SENND branded sticker border.
 */
export async function downloadQRCodePNG(
  text: string,
  title: string,
  includeBranding: boolean = true
): Promise<void> {
  try {
    const qrDataUrl = await generateQRDataURL(text, { width: 600, margin: 2 });
    if (!qrDataUrl) return;

    if (!includeBranding) {
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
      link.href = qrDataUrl;
      link.click();
      return;
    }

    // Composite branded SENND sticker card
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background white card
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Subtle border
    ctx.strokeStyle = '#E5E5E5';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Accent line at top
    ctx.fillStyle = '#B8F36B';
    ctx.fillRect(0, 0, width * 0.5, 8);
    ctx.fillStyle = '#FF8C42';
    ctx.fillRect(width * 0.5, 0, width * 0.3, 8);
    ctx.fillStyle = '#171717';
    ctx.fillRect(width * 0.8, 0, width * 0.2, 8);

    // Header Brand
    ctx.fillStyle = '#171717';
    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SENND', width / 2, 60);

    // Tagline
    ctx.fillStyle = '#737373';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('STICK. SCAN. SHARE.', width / 2, 82);

    // Draw QR code image
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    const qrSize = 480;
    const qrX = (width - qrSize) / 2;
    const qrY = 110;

    // Rounded QR container background
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
    ctx.fill();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Post title
    ctx.fillStyle = '#171717';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const truncatedTitle = title.length > 40 ? title.substring(0, 38) + '...' : title;
    ctx.fillText(truncatedTitle, width / 2, qrY + qrSize + 55);

    // Scan instruction pill
    ctx.fillStyle = '#B8F36B';
    const pillWidth = 260;
    const pillHeight = 36;
    const pillX = (width - pillWidth) / 2;
    const pillY = qrY + qrSize + 75;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fill();

    ctx.fillStyle = '#171717';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SCAN WITH ANY CAMERA', width / 2, pillY + 23);

    // Trigger download
    const finalDataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `sennd-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    link.href = finalDataUrl;
    link.click();
  } catch (err) {
    console.error('Error generating branded sticker:', err);
  }
}
