"use client";

import { useState } from "react";
import Image from "next/image";
import { ListingImageDto } from "@/lib/modules/listing/application/queries/get-listing-by-id/get-listing-by-id.dto";
import { ImageLightbox } from "./ImageLightbox";
import styles from "./ListingGallery.module.css";

interface ListingGalleryProps {
  images: ListingImageDto[];
  address: string;
}

export function ListingGallery({ images, address }: ListingGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const photos = images.filter((i) => !i.isFloorPlan);
  const floors = images.filter((i) => i.isFloorPlan);
  const allImages = [...photos, ...floors];
  const [main, ...rest] = photos;
  const visible = rest.slice(0, 4);
  const hiddenCount = photos.length - 1 - visible.length;

  return (
    <div>
      <div className={styles.gallery}>
        <div
          className={`${styles.tile} ${styles.big} ${styles.clickable}`}
          onClick={() => setOpenIndex(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setOpenIndex(0)}
          aria-label={`${address} — foto 1 bekijken`}
        >
          {main ? (
            <Image src={main.url} alt={address} fill sizes="(max-width:1320px) 60vw, 800px" className={styles.img} />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
        {visible.map((img, i) => {
          const photoIndex = i + 1;
          const isLast = i === visible.length - 1;
          return (
            <div
              key={img.id}
              className={`${styles.tile} ${styles.clickable}`}
              onClick={() => isLast && hiddenCount > 0 ? setOpenIndex(photoIndex) : setOpenIndex(photoIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpenIndex(photoIndex)}
              aria-label={`${address} — foto ${photoIndex + 1} bekijken`}
            >
              <Image src={img.url} alt={`${address} — foto ${i + 2}`} fill sizes="300px" className={styles.img} />
              {isLast && hiddenCount > 0 && (
                <div className={styles.more}>
                  <strong>+{hiddenCount}</strong>
                  <span>meer foto&apos;s</span>
                </div>
              )}
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, 4 - visible.length) }).map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.tile} ${styles.empty}`} />
        ))}
      </div>

      {floors.length > 0 ? (
        <div className={styles.floorStrip}>
          {floors.map((fp, i) => {
            const floorIndex = photos.length + i;
            return (
              <div
                key={fp.id}
                className={`${styles.floorTile} ${styles.clickable}`}
                onClick={() => setOpenIndex(floorIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setOpenIndex(floorIndex)}
                aria-label={`Plattegrond ${i + 1} bekijken`}
              >
                <Image src={fp.url} alt={`Plattegrond ${i + 1}`} fill sizes="160px" className={styles.img} />
                <span className={styles.floorLabel}>Plattegrond {i + 1}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.floorEmpty}>Geen plattegronden beschikbaar</div>
      )}

      {openIndex !== null && (
        <ImageLightbox
          images={allImages}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
