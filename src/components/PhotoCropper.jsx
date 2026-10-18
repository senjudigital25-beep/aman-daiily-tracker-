import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Loader2, ZoomIn } from 'lucide-react';

const VIEW = 256; // on-screen crop window, square
const OUT = 512; // exported image, square
const MAX_BYTES = 200 * 1024;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('unreadable'));
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

// Square crop with drag-to-reposition and zoom. Compresses to a JPEG under
// 200KB before handing the file back for upload.
export default function PhotoCropper({ file, onCancel, onSave, busy = false, error = '' }) {
  const [img, setImg] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [readError, setReadError] = useState('');
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  useEffect(() => {
    let url = '';
    let cancelled = false;
    (async () => {
      try {
        url = URL.createObjectURL(file);
        const image = await loadImage(url);
        if (cancelled) return;
        setImg(image);
        setScale(1);
        setOffset({ x: 0, y: 0 });
      } catch {
        if (!cancelled) setReadError('Could not read that image. Please choose another.');
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const base = img ? Math.max(VIEW / img.width, VIEW / img.height) : 1;
  const k = base * scale;
  const w = img ? img.width * k : 0;
  const h = img ? img.height * k : 0;

  const clamp = useCallback((o) => {
    const maxX = Math.max(0, (w - VIEW) / 2);
    const maxY = Math.max(0, (h - VIEW) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  }, [w, h]);

  useEffect(() => { setOffset((o) => clamp(o)); }, [clamp]);

  const onDown = (e) => {
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    setOffset(clamp({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
  };

  const onUp = () => { drag.current.active = false; };

  const handleSave = async () => {
    if (!img || busy) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, OUT, OUT);
      const sw = VIEW / k;
      const sx = (w / 2 - VIEW / 2 - offset.x) / k;
      const sy = (h / 2 - VIEW / 2 - offset.y) / k;
      ctx.drawImage(img, sx, sy, sw, sw, 0, 0, OUT, OUT);

      let blob = null;
      for (const q of [0.85, 0.7, 0.55, 0.42, 0.3]) {
        blob = await canvasToBlob(canvas, q);
        if (blob && blob.size <= MAX_BYTES) break;
      }
      if (!blob) throw new Error('encode failed');
      onSave(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
    } catch {
      setReadError('Could not prepare that photo. Please try again.');
    }
  };

  const shownError = readError || error;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in" onClick={onCancel} />

      <div className="relative w-full max-w-sm bg-surface border border-surface rounded-3xl card-shadow p-5 slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-pri text-lg">Adjust your photo</h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="h-9 w-9 rounded-full hover:bg-appAccentSoft flex items-center justify-center text-sec transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sec text-xs mb-4">Drag to reposition, then zoom to fit.</p>

        <div className="flex justify-center mb-4">
          <div
            className="relative rounded-full overflow-hidden bg-app border border-surface cursor-grab active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW, touchAction: 'none' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {img && (
              <img
                src={img.src}
                alt=""
                draggable={false}
                className="absolute select-none pointer-events-none"
                style={{
                  width: w,
                  height: h,
                  left: VIEW / 2 + offset.x - w / 2,
                  top: VIEW / 2 + offset.y - h / 2,
                }}
              />
            )}
            {!img && !shownError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-sec" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <ZoomIn className="h-4 w-4 text-sec shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-[var(--app-accent)]"
          />
        </div>

        {shownError && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{shownError}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-xl px-4 text-sm font-medium text-sec bg-app border border-surface hover:bg-appAccentSoft disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!img || busy}
            className="flex-1 min-h-[48px] rounded-xl px-4 text-sm font-semibold bg-accent text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-opacity"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
  );
}