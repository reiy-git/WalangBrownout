// File: PhotoCropModal.jsx
import { useEffect, useRef, useState } from "react";

// A small, dependency-free circular photo cropper: drag to reposition, slider to zoom.
// Usage: <PhotoCropModal src={dataUrl} onCancel={fn} onSave={(croppedDataUrl) => ...} />

const FRAME_SIZE = 220; // on-screen crop circle, in px
const OUTPUT_SIZE = 320; // exported image size, in px

export default function PhotoCropModal({ src, onCancel, onSave }) {
  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState(null); // { width, height }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null); // { startX, startY, startOffsetX, startOffsetY }

  // Base scale = smallest scale that makes the image fully cover the frame
  const baseScale = naturalSize
    ? Math.max(FRAME_SIZE / naturalSize.width, FRAME_SIZE / naturalSize.height)
    : 1;
  const scale = baseScale * zoom;
  const displayWidth = naturalSize ? naturalSize.width * scale : 0;
  const displayHeight = naturalSize ? naturalSize.height * scale : 0;

  function clampOffset(next, width = displayWidth, height = displayHeight) {
    const minX = Math.min(0, FRAME_SIZE - width);
    const minY = Math.min(0, FRAME_SIZE - height);
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  }

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const size = { width: img.naturalWidth, height: img.naturalHeight };
    setNaturalSize(size);
    const initialScale = Math.max(FRAME_SIZE / size.width, FRAME_SIZE / size.height);
    setOffset({
      x: (FRAME_SIZE - size.width * initialScale) / 2,
      y: (FRAME_SIZE - size.height * initialScale) / 2,
    });
    setZoom(1);
  };

  const handleZoomChange = (e) => {
    const nextZoom = Number(e.target.value);
    setZoom(nextZoom);
    if (!naturalSize) return;
    const nextScale = baseScale * nextZoom;
    setOffset((prev) =>
      clampOffset(prev, naturalSize.width * nextScale, naturalSize.height * nextScale)
    );
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { startX: clientX, startY: clientY, startOffset: offset };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragRef.current) return;
    const { startX, startY, startOffset } = dragRef.current;
    const next = { x: startOffset.x + (clientX - startX), y: startOffset.y + (clientY - startY) };
    setOffset(clampOffset(next));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e) => {
      if (e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, displayWidth, displayHeight]);

  const handleSave = () => {
    if (!naturalSize) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    const outputScaleFactor = OUTPUT_SIZE / FRAME_SIZE;

    ctx.drawImage(
      imgRef.current,
      offset.x * outputScaleFactor,
      offset.y * outputScaleFactor,
      displayWidth * outputScaleFactor,
      displayHeight * outputScaleFactor
    );

    onSave(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crop photo"
    >
      <div className="w-full max-w-xs rounded-xl bg-violet-50 shadow-lg p-4">
        <h3 className="text-[11px] font-medium text-violet-900 text-center mb-3">
          Adjust Photo
        </h3>

        {/* Crop frame */}
        <div
          className="relative mx-auto overflow-hidden rounded-full ring-2 ring-white cursor-grab active:cursor-grabbing select-none touch-none bg-violet-200"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onTouchStart={(e) => e.touches[0] && startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            ref={imgRef}
            src={src}
            onLoad={handleImageLoad}
            draggable={false}
            alt=""
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: displayWidth || undefined,
              height: displayHeight || undefined,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[10px] text-violet-700">Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            className="range range-xs flex-1"
            disabled={!naturalSize}
          />
        </div>

        <p className="text-[9px] text-violet-500 text-center mt-2">
          Drag to reposition &middot; use the slider to zoom
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!naturalSize}
            className="btn btn-primary btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}