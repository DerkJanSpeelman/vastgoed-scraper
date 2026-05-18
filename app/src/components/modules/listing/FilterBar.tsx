"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GetProvincesDto } from "@/lib/modules/location/application/queries/get-provinces/get-provinces.dto";
import styles from "./FilterBar.module.css";

interface CityOption {
  id: number;
  name: string;
  municipalityName: string;
  municipalityId: number;
}

interface MunicipalityOption {
  id: number;
  name: string;
  provinceName: string;
}

interface FilterBarProps {
  provinces: GetProvincesDto[];
  cities: CityOption[];
  municipalities: MunicipalityOption[];
  counts: {
    total: number;
    nieuwbouw: number;
    bestaandeBouw: number;
    stilleVerkoop: number;
  };
}

const ENERGY_LABELS = ["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"];

function parseIds(val: string | string[] | null | undefined): number[] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(Number).filter((n) => !isNaN(n) && n > 0);
}

export function FilterBar({ provinces, cities, municipalities, counts }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [panelOpen, setPanelOpen] = useState(false);

  // parsed current filter state from URL
  const isNieuwbouw     = params.get("nieuwbouw") === "1";
  const isBestaandeBouw = params.get("bestaandeBouw") === "1";
  const isStilleVerkoop = params.get("stilleVerkoop") === "1";
  const activeProvinceCode = params.get("provincie") ?? "";
  const activeCityIds   = parseIds(params.getAll("stad"));
  const activeGemIds    = parseIds(params.getAll("gemeente"));
  const activeEnergy    = params.get("energie") ? params.get("energie")!.split(",").filter(Boolean) : [];
  const minPrijs   = params.get("minPrijs") ?? "";
  const maxPrijs   = params.get("maxPrijs") ?? "";
  const minWoon    = params.get("minWoon") ?? "";
  const maxWoon    = params.get("maxWoon") ?? "";
  const minPerceel = params.get("minPerceel") ?? "";
  const maxPerceel = params.get("maxPerceel") ?? "";
  const sorteer    = params.get("sorteer") ?? "nieuwste";

  // local input state (before debounce)
  const [localMinPrijs,   setLocalMinPrijs]   = useState(minPrijs);
  const [localMaxPrijs,   setLocalMaxPrijs]   = useState(maxPrijs);
  const [localMinWoon,    setLocalMinWoon]    = useState(minWoon);
  const [localMaxWoon,    setLocalMaxWoon]    = useState(maxWoon);
  const [localMinPerceel, setLocalMinPerceel] = useState(minPerceel);
  const [localMaxPerceel, setLocalMaxPerceel] = useState(maxPerceel);

  // city search
  const [citySearch,      setCitySearch]      = useState("");
  const [gemSearch,       setGemSearch]       = useState("");
  const [cityDropOpen,    setCityDropOpen]    = useState(false);
  const [gemDropOpen,     setGemDropOpen]     = useState(false);

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const pushParams = useCallback((updates: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(params.toString());
    next.delete("pagina");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.delete(key);
        value.forEach((v) => next.append(key, v));
      } else {
        next.set(key, value);
      }
    }
    router.push(`?${next.toString()}`);
  }, [params, router]);

  function toggleBool(key: string, current: boolean) {
    pushParams({ [key]: current ? null : "1" });
  }

  function toggleEnergy(label: string) {
    const next = activeEnergy.includes(label)
      ? activeEnergy.filter((l) => l !== label)
      : [...activeEnergy, label];
    pushParams({ energie: next.length ? next.join(",") : null });
  }

  function addCity(city: CityOption) {
    if (activeCityIds.includes(city.id)) return;
    pushParams({ stad: [...activeCityIds.map(String), String(city.id)] });
    setCitySearch("");
    setCityDropOpen(false);
  }

  function removeCity(id: number) {
    pushParams({ stad: activeCityIds.filter((c) => c !== id).map(String) });
  }

  function addGem(gem: MunicipalityOption) {
    if (activeGemIds.includes(gem.id)) return;
    pushParams({ gemeente: [...activeGemIds.map(String), String(gem.id)] });
    setGemSearch("");
    setGemDropOpen(false);
  }

  function removeGem(id: number) {
    pushParams({ gemeente: activeGemIds.filter((g) => g !== id).map(String) });
  }

  function debounceParam(key: string, value: string) {
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      pushParams({ [key]: value || null });
    }, 500);
  }

  function clearAllFilters() {
    router.push("/");
    setPanelOpen(false);
  }

  const hasAnyFilter =
    isNieuwbouw || isBestaandeBouw || isStilleVerkoop ||
    activeProvinceCode !== "" ||
    activeCityIds.length > 0 || activeGemIds.length > 0 ||
    activeEnergy.length > 0 ||
    !!minPrijs || !!maxPrijs || !!minWoon || !!maxWoon || !!minPerceel || !!maxPerceel;

  // filtered city/gem options
  const filteredCities = citySearch.length >= 1
    ? cities.filter(
        (c) =>
          !activeCityIds.includes(c.id) &&
          (c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
           c.municipalityName.toLowerCase().includes(citySearch.toLowerCase()))
      ).slice(0, 8)
    : [];

  const filteredGems = gemSearch.length >= 1
    ? municipalities.filter(
        (m) =>
          !activeGemIds.includes(m.id) &&
          (m.name.toLowerCase().includes(gemSearch.toLowerCase()) ||
           m.provinceName.toLowerCase().includes(gemSearch.toLowerCase()))
      ).slice(0, 8)
    : [];

  const selectedCities = cities.filter((c) => activeCityIds.includes(c.id));
  const selectedGems   = municipalities.filter((m) => activeGemIds.includes(m.id));

  // sync local range inputs when URL changes
  useEffect(() => { setLocalMinPrijs(minPrijs); },   [minPrijs]);
  useEffect(() => { setLocalMaxPrijs(maxPrijs); },   [maxPrijs]);
  useEffect(() => { setLocalMinWoon(minWoon); },     [minWoon]);
  useEffect(() => { setLocalMaxWoon(maxWoon); },     [maxWoon]);
  useEffect(() => { setLocalMinPerceel(minPerceel); }, [minPerceel]);
  useEffect(() => { setLocalMaxPerceel(maxPerceel); }, [maxPerceel]);

  return (
    <nav className={styles.filterbar} aria-label="Filters">
      {/* Row 1: type chips + controls */}
      <div className={styles.row1}>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${isStilleVerkoop ? styles.chipStille : ""}`}
            onClick={() => toggleBool("stilleVerkoop", isStilleVerkoop)}
            aria-pressed={isStilleVerkoop}
          >
            Stille verkoop
            <span className={styles.count}>{counts.stilleVerkoop}</span>
          </button>

          <button
            className={`${styles.chip} ${isNieuwbouw ? styles.active : ""}`}
            onClick={() => toggleBool("nieuwbouw", isNieuwbouw)}
            aria-pressed={isNieuwbouw}
          >
            Nieuwbouw
            <span className={styles.count}>{counts.nieuwbouw}</span>
          </button>

          <button
            className={`${styles.chip} ${isBestaandeBouw ? styles.active : ""}`}
            onClick={() => toggleBool("bestaandeBouw", isBestaandeBouw)}
            aria-pressed={isBestaandeBouw}
          >
            Bestaande bouw
            <span className={styles.count}>{counts.bestaandeBouw}</span>
          </button>
        </div>

        <span className={styles.sep} role="separator" />

        <div className={styles.controls}>
          <button
            className={`${styles.chip} ${panelOpen ? styles.active : ""}`}
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
          >
            <IconFilter />
            Filters
          </button>

          {hasAnyFilter && (
            <button className={styles.wis} onClick={clearAllFilters}>
              <IconReset />
              Wis filters
            </button>
          )}

          <select
            className={styles.sortSelect}
            value={sorteer}
            onChange={(e) => pushParams({ sorteer: e.target.value === "nieuwste" ? null : e.target.value })}
            aria-label="Sorteren"
          >
            <option value="nieuwste">Nieuwste eerst</option>
            <option value="prijs-laag">Prijs laag → hoog</option>
            <option value="prijs-hoog">Prijs hoog → laag</option>
          </select>
        </div>
      </div>

      {/* Row 2: expandable filter panel */}
      <div className={`${styles.panelOuter} ${panelOpen ? styles.panelOpen : ""}`}>
        <div className={styles.panelInner}>
          <div className={styles.panel}>

            {/* STEDEN */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Steden</span>
              <div className={styles.filterInput}>
                {selectedCities.length > 0 && (
                  <div className={styles.tags}>
                    {selectedCities.map((c) => (
                      <span key={c.id} className={styles.tag}>
                        {c.name}
                        <button className={styles.tagRemove} onClick={() => removeCity(c.id)} aria-label={`Verwijder ${c.name}`}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.searchWrap}>
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Zoek een stad..."
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setCityDropOpen(true); }}
                    onFocus={() => setCityDropOpen(true)}
                    onBlur={() => setTimeout(() => setCityDropOpen(false), 200)}
                  />
                  {cityDropOpen && filteredCities.length > 0 && (
                    <ul className={styles.dropdown}>
                      {filteredCities.map((c) => (
                        <li key={c.id}>
                          <button className={styles.dropItem} onMouseDown={() => addCity(c)}>
                            <span>{c.name}</span>
                            <span className={styles.dropMeta}>{c.municipalityName}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button className={styles.resetBtn} onClick={() => pushParams({ stad: null })} aria-label="Wis steden filter">↺</button>
            </div>

            {/* GEMEENTE */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Gemeente</span>
              <div className={styles.filterInput}>
                {selectedGems.length > 0 && (
                  <div className={styles.tags}>
                    {selectedGems.map((g) => (
                      <span key={g.id} className={styles.tag}>
                        {g.name}
                        <button className={styles.tagRemove} onClick={() => removeGem(g.id)} aria-label={`Verwijder ${g.name}`}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.searchWrap}>
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Zoek een gemeente..."
                    value={gemSearch}
                    onChange={(e) => { setGemSearch(e.target.value); setGemDropOpen(true); }}
                    onFocus={() => setGemDropOpen(true)}
                    onBlur={() => setTimeout(() => setGemDropOpen(false), 200)}
                  />
                  {gemDropOpen && filteredGems.length > 0 && (
                    <ul className={styles.dropdown}>
                      {filteredGems.map((g) => (
                        <li key={g.id}>
                          <button className={styles.dropItem} onMouseDown={() => addGem(g)}>
                            <span>{g.name}</span>
                            <span className={styles.dropMeta}>{g.provinceName}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button className={styles.resetBtn} onClick={() => pushParams({ gemeente: null })} aria-label="Wis gemeente filter">↺</button>
            </div>

            {/* PROVINCIE */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Provincie</span>
              <div className={styles.filterInput}>
                <select
                  className={styles.provinceSelect}
                  value={activeProvinceCode}
                  onChange={(e) => pushParams({ provincie: e.target.value || null })}
                  aria-label="Filter op provincie"
                >
                  <option value="">Alle provincies</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button className={styles.resetBtn} onClick={() => pushParams({ provincie: null })} aria-label="Wis provincie filter">↺</button>
            </div>

            {/* ENERGIE */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Energie</span>
              <div className={`${styles.filterInput} ${styles.energyChips}`}>
                {ENERGY_LABELS.map((label) => (
                  <button
                    key={label}
                    className={`${styles.energyChip} ${activeEnergy.includes(label) ? styles.active : ""}`}
                    onClick={() => toggleEnergy(label)}
                    aria-pressed={activeEnergy.includes(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button className={styles.resetBtn} onClick={() => pushParams({ energie: null })} aria-label="Wis energie filter">↺</button>
            </div>

            {/* PRIJS */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Prijs</span>
              <div className={`${styles.filterInput} ${styles.rangeRow}`}>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Min"
                  value={localMinPrijs}
                  onChange={(e) => {
                    setLocalMinPrijs(e.target.value);
                    debounceParam("minPrijs", e.target.value);
                  }}
                  aria-label="Minimale prijs"
                />
                <span className={styles.rangeSep}>—</span>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Max"
                  value={localMaxPrijs}
                  onChange={(e) => {
                    setLocalMaxPrijs(e.target.value);
                    debounceParam("maxPrijs", e.target.value);
                  }}
                  aria-label="Maximale prijs"
                />
                <span className={styles.rangeUnit}>€</span>
              </div>
              <button className={styles.resetBtn} onClick={() => { setLocalMinPrijs(""); setLocalMaxPrijs(""); pushParams({ minPrijs: null, maxPrijs: null }); }} aria-label="Wis prijs filter">↺</button>
            </div>

            {/* WOONOPP. */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Woonopp.</span>
              <div className={`${styles.filterInput} ${styles.rangeRow}`}>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Min"
                  value={localMinWoon}
                  onChange={(e) => {
                    setLocalMinWoon(e.target.value);
                    debounceParam("minWoon", e.target.value);
                  }}
                  aria-label="Minimaal woonoppervlak"
                />
                <span className={styles.rangeSep}>—</span>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Max"
                  value={localMaxWoon}
                  onChange={(e) => {
                    setLocalMaxWoon(e.target.value);
                    debounceParam("maxWoon", e.target.value);
                  }}
                  aria-label="Maximaal woonoppervlak"
                />
                <span className={styles.rangeUnit}>m²</span>
              </div>
              <button className={styles.resetBtn} onClick={() => { setLocalMinWoon(""); setLocalMaxWoon(""); pushParams({ minWoon: null, maxWoon: null }); }} aria-label="Wis woonoppervlak filter">↺</button>
            </div>

            {/* PERCEEL */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Perceel</span>
              <div className={`${styles.filterInput} ${styles.rangeRow}`}>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Min"
                  value={localMinPerceel}
                  onChange={(e) => {
                    setLocalMinPerceel(e.target.value);
                    debounceParam("minPerceel", e.target.value);
                  }}
                  aria-label="Minimaal perceeloppervlak"
                />
                <span className={styles.rangeSep}>—</span>
                <input
                  className={styles.rangeInput}
                  type="number"
                  placeholder="Max"
                  value={localMaxPerceel}
                  onChange={(e) => {
                    setLocalMaxPerceel(e.target.value);
                    debounceParam("maxPerceel", e.target.value);
                  }}
                  aria-label="Maximaal perceeloppervlak"
                />
                <span className={styles.rangeUnit}>m²</span>
              </div>
              <button className={styles.resetBtn} onClick={() => { setLocalMinPerceel(""); setLocalMaxPerceel(""); pushParams({ minPerceel: null, maxPerceel: null }); }} aria-label="Wis perceel filter">↺</button>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

function IconFilter() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
