import Image from "next/image";
import { ListingImageDto } from "@/lib/modules/listing/application/queries/get-listing-by-id/get-listing-by-id.dto";
import styles from "./ListingGallery.module.css";

interface ListingGalleryProps {
  images: ListingImageDto[];
  address: string;
}

export function ListingGallery({ images, address }: ListingGalleryProps) {
  const photos = images.filter((i) => !i.isFloorPlan);
  const floors = images.filter((i) => i.isFloorPlan);
  const [main, ...rest] = photos;
  const visible = rest.slice(0, 4);
  const hiddenCount = photos.length - 1 - visible.length;

  return (
    <div>
      <div className={styles.gallery}>
        <div className={`${styles.tile} ${styles.big}`}>
          {main ? (
            <Image src={main.url} alt={address} fill sizes="(max-width:1320px) 60vw, 800px" className={styles.img} />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
        {visible.map((img, i) => (
          <div key={img.id} className={styles.tile}>
            <Image src={img.url} alt={`${address} — foto ${i + 2}`} fill sizes="300px" className={styles.img} />
            {i === visible.length - 1 && hiddenCount > 0 && (
              <div className={styles.more}>
                <strong>+{hiddenCount}</strong>
                <span>meer foto&apos;s</span>
              </div>
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - visible.length) }).map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.tile} ${styles.empty}`} />
        ))}
      </div>

      {floors.length > 0 ? (
        <div className={styles.floorStrip}>
          {floors.map((fp, i) => (
            <div key={fp.id} className={styles.floorTile}>
              <Image src={fp.url} alt={`Plattegrond ${i + 1}`} fill sizes="160px" className={styles.img} />
              <span className={styles.floorLabel}>Plattegrond {i + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.floorEmpty}>Geen plattegronden beschikbaar</div>
      )}
    </div>
  );
}
