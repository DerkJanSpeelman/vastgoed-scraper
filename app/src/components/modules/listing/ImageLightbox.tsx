"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ListingImageDto } from "@/lib/modules/listing/application/queries/get-listing-by-id/get-listing-by-id.dto";
import styles from "./ImageLightbox.module.css";

interface ImageLightboxProps {
  images: ListingImageDto[];
  initialIndex: number;
  onClose: () => void;
}

const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [visible, setVisible] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const thumbsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const isTransitioningRef = useRef(false);

  const zoom = ZOOM_LEVELS[zoomIdx];

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const navigate = useCallback((newIndex: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setImgVisible(false);
    setTimeout(() => {
      setIndex(newIndex);
      setZoomIdx(0);
      setPanX(0);
      setPanY(0);
      setImgVisible(true);
      isTransitioningRef.current = false;
    }, 150);
  }, []);

  const prev = useCallback(() => {
    navigate(index > 0 ? index - 1 : images.length - 1);
  }, [index, images.length, navigate]);

  const next = useCallback(() => {
    navigate(index < images.length - 1 ? index + 1 : 0);
  }, [index, images.length, navigate]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const zoomIn = () => setZoomIdx((z) => Math.min(z + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => {
    setZoomIdx((z) => {
      const next = Math.max(z - 1, 0);
      if (next === 0) { setPanX(0); setPanY(0); }
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, prev, next]);

  // scroll wheel zoom
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // auto-scroll active thumb into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector(`.${styles.thumbActive}`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  // mouse drag for pan / navigate
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX, panY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (zoom > 1) {
      setPanX(dragRef.current.panX + dx);
      setPanY(dragRef.current.panY + dy);
    }
  }

  function onMouseUp(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (zoom === 1 && Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
    dragRef.current = null;
  }

  // touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (zoom === 1 && Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
    touchRef.current = null;
  }

  if (!mounted) return null;

  const current = images[index];

  return createPortal(
    <div
      className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
      role="dialog"
      aria-modal
      aria-label="Foto's bekijken"
    >
      {/* top bar */}
      <div className={styles.topBar}>
        <span className={styles.counter}>{index + 1} / {images.length}</span>
        <div className={styles.topRight}>
          <button className={styles.iconBtn} onClick={toggleFullscreen} aria-label="Volledig scherm">
            <IconFullscreen />
          </button>
          <button className={styles.iconBtn} onClick={handleClose} aria-label="Sluiten">
            <IconClose />
          </button>
        </div>
      </div>

      {/* image area */}
      <div
        className={styles.imageArea}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { dragRef.current = null; }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          className={`${styles.navBtn} ${styles.navLeft}`}
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Vorige foto"
        >
          <IconChevronLeft />
        </button>

        {current && (
          <div
            className={`${styles.imgWrap} ${imgVisible ? styles.imgVisible : ""}`}
            style={{
              transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
              cursor: zoom > 1 ? "grab" : "default",
            }}
          >
            <img
              src={current.url}
              alt={`Foto ${index + 1}`}
              className={styles.img}
              draggable={false}
            />
          </div>
        )}

        <button
          className={`${styles.navBtn} ${styles.navRight}`}
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Volgende foto"
        >
          <IconChevronRight />
        </button>
      </div>

      {/* bottom controls */}
      <div className={styles.bottomBar}>
        <div className={styles.zoomControls}>
          <button
            className={styles.zoomBtn}
            onClick={zoomOut}
            disabled={zoomIdx === 0}
            aria-label="Uitzoomen"
          >
            −
          </button>
          <span className={styles.zoomLevel}>{zoom}×</span>
          <button
            className={styles.zoomBtn}
            onClick={zoomIn}
            disabled={zoomIdx === ZOOM_LEVELS.length - 1}
            aria-label="Inzoomen"
          >
            +
          </button>
        </div>

        <div className={styles.thumbStrip} ref={thumbsRef}>
          {images.map((img, i) => (
            <button
              key={img.id}
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ""}`}
              onClick={() => navigate(i)}
              aria-label={`Foto ${i + 1}`}
            >
              <img src={img.url} alt="" className={styles.thumbImg} draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconFullscreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
