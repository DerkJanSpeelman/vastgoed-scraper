"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GetProvincesDto } from "@/lib/modules/location/application/queries/get-provinces/get-provinces.dto";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  provinces: GetProvincesDto[];
  totalCount: number;
}

const FILTER_CHIPS = [
  { label: "Alle woningen", value: "" },
  { label: "Bestaande bouw", value: "bestaande-bouw" },
  { label: "Nieuwbouw",      value: "nieuwbouw" },
  { label: "Stille verkoop", value: "stille-verkoop" },
];

export function FilterBar({ provinces, totalCount }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const activeType = params.get("type") ?? "";
  const activeProvince = params.get("provincie") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`?${next.toString()}`);
  }

  return (
    <nav className={styles.filterbar} aria-label="Filters">
      {FILTER_CHIPS.map((chip) => (
        <button
          key={chip.value}
          className={`${styles.chip} ${activeType === chip.value ? styles.active : ""}`}
          onClick={() => setParam("type", chip.value)}
          aria-pressed={activeType === chip.value}
        >
          {chip.label}
          {chip.value === "" && (
            <span className={styles.count}>{totalCount}</span>
          )}
        </button>
      ))}

      <span className={styles.sep} role="separator" />

      <div className={styles.right}>
        <select
          className={styles.chipSelect}
          value={activeProvince}
          onChange={(e) => setParam("provincie", e.target.value)}
          aria-label="Filter op provincie"
        >
          <option value="">Alle provincies</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.code}>{p.name}</option>
          ))}
        </select>
      </div>
    </nav>
  );
}
