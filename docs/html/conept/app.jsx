/* global React, ReactDOM, LISTINGS */
const { useState, useMemo, useEffect, useRef, useLayoutEffect } = React;

// --------------- formatting helpers ----------------
const fmtPrice = (n) =>
  typeof n === "number"
    ? "€\u00A0" + n.toLocaleString("nl-NL").replace(/,/g, ".") + ",-"
    : "—";

const fmtInt = (n) =>
  typeof n === "number" ? n.toLocaleString("nl-NL") : null;

const fmtTimeAgo = (iso) => {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - t) / 60000);
  if (diffMin < 1) return "zojuist";
  if (diffMin < 60) return `${diffMin} min geleden`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} uur geleden`;
  const d = Math.round(h / 24);
  return `${d} dag${d === 1 ? "" : "en"} geleden`;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const energyClass = (label) => {
  if (!label) return "na";
  return label.replace(/\+/g, "p");
};

const Placeholder = ({ hue, label }) => (
  <div
    style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg,
        oklch(0.86 0.04 ${hue}) 0%,
        oklch(0.72 0.06 ${hue}) 100%)`,
    }}
  >
    <div
      style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(135deg,
          transparent 0 14px,
          color-mix(in oklab, oklch(0.4 0.04 ${hue}) 12%, transparent) 14px 15px)`,
      }}
    />
    <div className="label">{label}</div>
  </div>
);

// --------------- icons ----------------
const Icon = ({ d, w = 14, h = 14 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IconLiving = () => <Icon d={<><path d="M3 21V11l9-7 9 7v10"/><path d="M9 21v-6h6v6"/></>} />;
const IconPlot   = () => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></>} />;
const IconBed    = () => <Icon d={<><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18M7 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></>} />;
const IconBolt   = () => <Icon d={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>} />;
const IconArrow  = () => <Icon d={<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>} w={11} h={11} />;
const IconExt    = () => <Icon d={<><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>} w={10} h={10} />;
const IconBack   = () => <Icon d={<><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>} w={12} h={12} />;
const IconFloor  = () => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="0.5"/><path d="M3 11h10v10M13 3v8h8"/></>} w={11} h={11} />;
const IconCam    = () => <Icon d={<><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></>} w={11} h={11} />;

// --------------- stat item ----------------
const StatItem = ({ icon, value, unit, title }) => {
  const isPlaceholder = value === null || value === undefined || value === "";
  return (
    <span className="item" title={title}>
      {icon}
      <span className={"v" + (isPlaceholder ? " placeholder" : "")}>
        {isPlaceholder ? "—" : value}
      </span>
      {unit && !isPlaceholder ? <span className="u">{unit}</span> : null}
    </span>
  );
};

// --------------- energy badge ----------------
const EnergyBadge = ({ label }) => (
  <span className={"energy " + energyClass(label || "na")}>
    {label || "—"}
  </span>
);

// --------------- LIST ROW ----------------
function ListRow({ l, onOpen }) {
  return (
    <div
      className={"row" + (l.stilleVerkoop ? " silent" : "")}
      onClick={() => onOpen(l.id)}
    >
      <div className="thumb">
        <Placeholder hue={l.placeholder.hue} label={l.placeholder.label} />
        <span className="count">
          <IconCam /> {l.images}
        </span>
      </div>

      <div className="row-main">
        <div className="row-head">
          <span className="addr">{l.address}</span>
          <span className="muni">{l.postcode} {l.city}{l.district ? ` — ${l.district}` : ""}</span>
        </div>

        <div className="meta">
          <StatItem icon={<IconLiving/>} value={fmtInt(l.livingArea)} unit="m²" title="Woonoppervlak" />
          <StatItem icon={<IconPlot/>}   value={fmtInt(l.plotArea)}   unit="m²" title="Perceeloppervlak" />
          <StatItem icon={<IconBed/>}    value={l.bedrooms}           unit="slk." title="Slaapkamers" />
          <span className="item" title="Energielabel">
            <IconBolt />
            <EnergyBadge label={l.energyLabel} />
          </span>
        </div>

        <div className="agency">
          <span style={{ color: "var(--ink-4)" }}>via</span>
          <a
            className="a"
            href={"https://" + l.agencyUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {l.agency}
          </a>
          <span className="ext-arrow">↗ {l.agencyUrl}</span>
        </div>
      </div>

      <div className="row-right">
        <div style={{ display: "flex", gap: 6 }}>
          {l.nieuwbouw && <span className="badge nieuwbouw">Nieuwbouw</span>}
          {l.stilleVerkoop && <span className="badge silent">Stille verkoop</span>}
        </div>
        <div className="price-block">
          <span className="price">{fmtPrice(l.price)}</span>
          <span className="price-type">{l.priceType}</span>
        </div>
        <div className="ts">
          <span className="dot" />
          {fmtTimeAgo(l.listedAt)}
        </div>
      </div>
    </div>
  );
}

// --------------- icons (extras) ----------------
const IconFilter = () => <Icon d={<><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></>} w={13} h={13} />;
const IconSort   = () => <Icon d={<><path d="M3 6h13"/><path d="M3 12h9"/><path d="M3 18h5"/><path d="m17 14 3 3 3-3"/><path d="M20 6v11"/></>} w={13} h={13} />;
const IconClose  = () => <Icon d={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} w={11} h={11} />;
const IconReset  = ({ w = 13, h = 13 }) => <Icon d={<><path d="M3 12a9 9 0 1 0 3.2-6.9"/><path d="M3 4v5h5"/></>} w={w} h={h} />;
const IconX      = () => <Icon d={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} w={10} h={10} />;

// --------------- LIST VIEW ----------------
const INITIAL_FILTERS = {
  stille: false,
  nieuwbouw: false,
  bestaand: false,
  cities: [],
  municipalities: [],
  energy: [],
  priceMin: "", priceMax: "",
  livingMin: "", livingMax: "",
  plotMin: "", plotMax: "",
};

function ListView({ onOpen }) {
  const [f, setF] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState("nieuwste");
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const PAGE_SIZE = 5;

  const counts = useMemo(() => ({
    alles: LISTINGS.length,
    silent: LISTINGS.filter(l => l.stilleVerkoop).length,
    nieuwbouw: LISTINGS.filter(l => l.nieuwbouw).length,
    bestaand: LISTINGS.filter(l => !l.nieuwbouw).length,
  }), []);

  const cityList = useMemo(() => {
    const m = new Map();
    LISTINGS.forEach(l => m.set(l.city, (m.get(l.city) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);

  const municipalityList = useMemo(() => {
    const m = new Map();
    LISTINGS.forEach(l => m.set(l.municipality, (m.get(l.municipality) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);

  const energyList = useMemo(() => {
    const m = new Map();
    LISTINGS.forEach(l => {
      const k = l.energyLabel || "—";
      m.set(k, (m.get(k) || 0) + 1);
    });
    const order = ["A++", "A+", "A", "B", "C", "D", "E", "F", "G", "—"];
    return order.filter(k => m.has(k)).map(k => [k, m.get(k)]);
  }, []);

  const parseNum = (s) => {
    if (s === "" || s == null) return null;
    const n = Number(String(s).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const filtered = useMemo(() => {
    const pMin = parseNum(f.priceMin), pMax = parseNum(f.priceMax);
    const lMin = parseNum(f.livingMin), lMax = parseNum(f.livingMax);
    const tMin = parseNum(f.plotMin), tMax = parseNum(f.plotMax);

    return LISTINGS.filter(l => {
      if (f.stille && !l.stilleVerkoop) return false;
      // Type: nieuwbouw + bestaand are independent toggles. Neither = both. One = only that.
      if (f.nieuwbouw && !f.bestaand && !l.nieuwbouw) return false;
      if (f.bestaand && !f.nieuwbouw && l.nieuwbouw) return false;

      if (f.cities.length > 0 && !f.cities.includes(l.city)) return false;
      if (f.municipalities.length > 0 && !f.municipalities.includes(l.municipality)) return false;
      if (f.energy.length > 0 && !f.energy.includes(l.energyLabel || "—")) return false;

      if (pMin != null && (l.price ?? 0) < pMin) return false;
      if (pMax != null && (l.price ?? Infinity) > pMax) return false;
      if (lMin != null) { if (l.livingArea == null || l.livingArea < lMin) return false; }
      if (lMax != null) { if (l.livingArea == null || l.livingArea > lMax) return false; }
      if (tMin != null) { if (l.plotArea == null || l.plotArea < tMin) return false; }
      if (tMax != null) { if (l.plotArea == null || l.plotArea > tMax) return false; }

      return true;
    });
  }, [f]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) =>
      sort === "nieuwste"
        ? new Date(b.listedAt) - new Date(a.listedAt)
        : sort === "oudste"
          ? new Date(a.listedAt) - new Date(b.listedAt)
          : sort === "prijs-laag"
            ? a.price - b.price
            : sort === "prijs-hoog"
              ? b.price - a.price
              : sort === "opp-hoog"
                ? (b.livingArea || 0) - (a.livingArea || 0)
                : 0
    );
    return arr;
  }, [filtered, sort]);

  // reset to page 1 when filters or sort change
  useEffect(() => { setPage(1); }, [f, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = sorted.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, sorted.length);

  // count of advanced filters active (the ones in the panel)
  const advCount =
    (f.cities.length > 0 ? 1 : 0) +
    (f.municipalities.length > 0 ? 1 : 0) +
    (f.energy.length > 0 ? 1 : 0) +
    (f.priceMin || f.priceMax ? 1 : 0) +
    (f.livingMin || f.livingMax ? 1 : 0) +
    (f.plotMin || f.plotMax ? 1 : 0);

  const toggleArr = (key, val) => setF(s => ({
    ...s,
    [key]: s[key].includes(val) ? s[key].filter(v => v !== val) : [...s[key], val]
  }));
  const setVal  = (key, val) => setF(s => ({ ...s, [key]: val }));
  const setBool = (key) => setF(s => ({ ...s, [key]: !s[key] }));
  const resetAll = () => setF(INITIAL_FILTERS);

  return (
    <>
      <section className="hero" data-screen-label="01 Overzicht">
        <div>
          <h1>
            Nieuwe woningen,<br/>
            inclusief <em>stille verkoop.</em>
          </h1>
          <p className="lede">
            Verzamelt aanbod van makelaarsites, off-market netwerken en
            nieuwbouwportals — gesorteerd op datum, met alles wat Funda nog
            niet ziet.
          </p>
        </div>
        <div className="stats">
          <div className="cell">
            <div className="label">In feed</div>
            <div className="value">{counts.alles}</div>
            <div className="sub">actieve listings</div>
          </div>
          <div className="cell">
            <div className="label">Stille verkoop</div>
            <div className="value accent">{counts.silent}</div>
            <div className="sub">off-market</div>
          </div>
          <div className="cell">
            <div className="label">Nieuwbouw</div>
            <div className="value">{counts.nieuwbouw}</div>
            <div className="sub">projecten / units</div>
          </div>
          <div className="cell">
            <div className="label">Vandaag</div>
            <div className="value">7</div>
            <div className="sub">nieuw binnen</div>
          </div>
        </div>
      </section>

      <div className="filterbar">
        <Chip active={f.stille} onClick={() => setBool("stille")} flag>
          Stille verkoop <span className="count">{counts.silent}</span>
        </Chip>
        <Chip active={f.nieuwbouw} onClick={() => setBool("nieuwbouw")}>
          Nieuwbouw <span className="count">{counts.nieuwbouw}</span>
        </Chip>
        <Chip active={f.bestaand} onClick={() => setBool("bestaand")}>
          Bestaande bouw <span className="count">{counts.bestaand}</span>
        </Chip>
        <span className="sep"/>
        <button
          className={"chip filter-toggle-btn" + (panelOpen ? " active" : "")}
          onClick={() => setPanelOpen(o => !o)}
          aria-expanded={panelOpen}
        >
          <IconFilter />
          Filters
          {advCount > 0 && <span className="badge-count">{advCount}</span>}
        </button>
        {(advCount > 0 || f.stille || f.nieuwbouw || f.bestaand) && (
          <button className="chip" onClick={resetAll} title="Filters wissen">
            <IconReset /> Wis filters
          </button>
        )}

        <div className="right">
          <div className="sort-wrap">
            <svg className="sort-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h13"/><path d="M3 12h9"/><path d="M3 18h5"/>
              <path d="m17 14 3 3 3-3"/><path d="M20 6v11"/>
            </svg>
            <select
              className="chip-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sorteren"
            >
              <option value="nieuwste">Nieuwste eerst</option>
              <option value="oudste">Oudste eerst</option>
              <option value="prijs-laag">Prijs ↑</option>
              <option value="prijs-hoog">Prijs ↓</option>
              <option value="opp-hoog">Woonopp. ↓</option>
            </select>
          </div>
        </div>
      </div>

      <FilterPanel
        open={panelOpen}
        cityList={cityList}
        municipalityList={municipalityList}
        energyList={energyList}
        f={f}
        toggleArr={toggleArr}
        setVal={setVal}
      />

      {pageItems.length > 0 ? (
        <div className="list">
          {pageItems.map(l => (
            <ListRow key={l.id} l={l} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>Geen woningen gevonden</strong>
          Pas je filters aan om meer aanbod te zien.
        </div>
      )}

      {sorted.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          showingFrom={showingFrom}
          showingTo={showingTo}
          total={sorted.length}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
}

// --------------- combobox (typeable multi-select) ----------------
function Combobox({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = options.filter(([name]) =>
    name.toLowerCase().includes(q) && !value.includes(name)
  );

  const add = (name) => {
    onChange([...value, name]);
    setQuery("");
    setHighlight(0);
    inputRef.current?.focus();
  };
  const remove = (name) => onChange(value.filter(v => v !== name));

  const onKey = (e) => {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      remove(value[value.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); setOpen(true);
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && filtered[highlight]) {
      e.preventDefault();
      add(filtered[highlight][0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="combo" ref={wrapRef}>
      <div
        className={"combo-input-wrap" + (open ? " focused" : "")}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {value.map(v => (
          <span key={v} className="combo-pill">
            {v}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(v); }}
              aria-label={`Verwijder ${v}`}
            >
              <IconX/>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="combo-input"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={value.length === 0 ? placeholder : "Voeg toe…"}
          aria-autocomplete="list"
        />
      </div>
      {open && (
        <div className="combo-menu" role="listbox">
          {filtered.length === 0 ? (
            <div className="combo-option"><span className="empty">Geen resultaten</span></div>
          ) : filtered.slice(0, 12).map(([name, count], idx) => (
            <button
              key={name}
              type="button"
              className={"combo-option" + (idx === highlight ? " highlighted" : "")}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => add(name)}
              role="option"
              aria-selected={idx === highlight}
            >
              <span>{name}</span>
              <span className="c">{count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ResetBtn = ({ onClick, title }) => (
  <button
    type="button"
    className="reset-icon-btn"
    onClick={onClick}
    title={title || "Wissen"}
    aria-label={title || "Wissen"}
  >
    <IconReset />
  </button>
);

// --------------- filter panel ----------------
function FilterPanel({ open, cityList, municipalityList, energyList, f, toggleArr, setVal }) {
  const hasCity   = f.cities.length > 0;
  const hasMuni   = f.municipalities.length > 0;
  const hasEnergy = f.energy.length > 0;
  const hasPrice  = !!(f.priceMin || f.priceMax);
  const hasLiving = !!(f.livingMin || f.livingMax);
  const hasPlot   = !!(f.plotMin || f.plotMax);

  return (
    <div className={"advanced-wrap" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="advanced">
        <div className="advanced-inner">
          <div className="adv-row">
            <div className="adv-label">Steden</div>
            <div className="adv-content">
              <Combobox
                options={cityList}
                value={f.cities}
                onChange={(v) => setVal("cities", v)}
                placeholder="Zoek een stad…"
              />
              {hasCity && <ResetBtn onClick={() => setVal("cities", [])} title="Steden wissen" />}
            </div>
          </div>

          <div className="adv-row">
            <div className="adv-label">Gemeente</div>
            <div className="adv-content">
              <Combobox
                options={municipalityList}
                value={f.municipalities}
                onChange={(v) => setVal("municipalities", v)}
                placeholder="Zoek een gemeente…"
              />
              {hasMuni && <ResetBtn onClick={() => setVal("municipalities", [])} title="Gemeentes wissen" />}
            </div>
          </div>

          <div className="adv-row energy-row">
            <div className="adv-label">Energie</div>
            <div className="adv-content">
              <div className="adv-chips">
                {energyList.map(([label, count]) => (
                  <button
                    key={label}
                    className={"energy-chip" + (f.energy.includes(label) ? " active" : "")}
                    onClick={() => toggleArr("energy", label)}
                  >
                    {label} <span className="c">{count}</span>
                  </button>
                ))}
              </div>
              {hasEnergy && <ResetBtn onClick={() => setVal("energy", [])} title="Energielabels wissen" />}
            </div>
          </div>

          <div className="adv-row">
            <div className="adv-label">Prijs</div>
            <div className="adv-content">
              <div className="range">
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Min"
                  value={f.priceMin}
                  onChange={e => setVal("priceMin", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="sep-x">–</span>
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Max"
                  value={f.priceMax}
                  onChange={e => setVal("priceMax", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="unit">€</span>
              </div>
              {hasPrice && <ResetBtn onClick={() => { setVal("priceMin", ""); setVal("priceMax", ""); }} title="Prijs wissen" />}
            </div>
          </div>

          <div className="adv-row">
            <div className="adv-label">Woonopp.</div>
            <div className="adv-content">
              <div className="range">
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Min"
                  value={f.livingMin}
                  onChange={e => setVal("livingMin", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="sep-x">–</span>
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Max"
                  value={f.livingMax}
                  onChange={e => setVal("livingMax", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="unit">m²</span>
              </div>
              {hasLiving && <ResetBtn onClick={() => { setVal("livingMin", ""); setVal("livingMax", ""); }} title="Woonopp. wissen" />}
            </div>
          </div>

          <div className="adv-row">
            <div className="adv-label">Perceel</div>
            <div className="adv-content">
              <div className="range">
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Min"
                  value={f.plotMin}
                  onChange={e => setVal("plotMin", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="sep-x">–</span>
                <input
                  className="range-input"
                  type="text" inputMode="numeric"
                  placeholder="Max"
                  value={f.plotMax}
                  onChange={e => setVal("plotMax", e.target.value.replace(/[^\d]/g, ""))}
                />
                <span className="unit">m²</span>
              </div>
              {hasPlot && <ResetBtn onClick={() => { setVal("plotMin", ""); setVal("plotMax", ""); }} title="Perceel wissen" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Chip = ({ active, flag, onClick, children }) => (
  <button
    className={"chip" + (active ? " active" : "") + (flag ? " flag" : "")}
    onClick={onClick}
  >
    {children}
  </button>
);

// --------------- pagination ----------------
function Pagination({ page, totalPages, showingFrom, showingTo, total, onChange }) {
  // Build a compact page list with ellipses, max ~7 slots
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push("…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav className="pagination" aria-label="Pagina-navigatie">
      <div className="count-info">
        <strong>{showingFrom}–{showingTo}</strong> van <strong>{total}</strong> woningen
      </div>
      <div className="pages">
        <button
          className="page-btn arrow"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Vorige pagina"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Vorige
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={"e" + i} className="page-btn ellipsis" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              className={"page-btn" + (p === page ? " active" : "")}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          className="page-btn arrow"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Volgende pagina"
        >
          Volgende
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

// --------------- floor plan placeholder ----------------
const FloorPlanPlaceholder = () => <div className="fp-placeholder"/>;

// --------------- ReadMore ----------------
function ReadMore({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!expanded && ref.current) {
      setOverflow(ref.current.scrollHeight > ref.current.clientHeight + 2);
    }
  }, [text, expanded]);

  const isPh = !text;
  const showBtn = overflow || expanded;
  const clamped = showBtn && !expanded;

  return (
    <div className={"desc-wrap" + (clamped ? " clamped" : "")}>
      <p
        ref={ref}
        className={"desc" + (clamped ? " clamped" : "") + (isPh ? " placeholder" : "")}
      >
        {text || "—  Geen omschrijving beschikbaar."}
      </p>
      {showBtn && (
        <button
          type="button"
          className={"desc-more" + (expanded ? " open" : "")}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? "Lees minder" : "Lees meer"}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// --------------- Lightbox ----------------
function Lightbox({ items, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const stripRef = useRef(null);

  // lock body scroll
  useEffect(() => {
    document.body.classList.add("lb-open");
    return () => { document.body.classList.remove("lb-open"); };
  }, []);

  const resetZoom = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  const goTo = (i) => {
    const next = Math.max(0, Math.min(items.length - 1, i));
    if (next !== index) { setIndex(next); resetZoom(); }
  };
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);
  const zoomIn  = () => setScale(s => Math.min(4, +(s + 0.5).toFixed(2)));
  const zoomOut = () => {
    setScale(s => {
      const ns = Math.max(1, +(s - 0.5).toFixed(2));
      if (ns === 1) setPan({ x: 0, y: 0 });
      return ns;
    });
  };

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-" || e.key === "_") zoomOut();
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  // scroll active thumb into view (manual — no scrollIntoView)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector(".lb-thumb.active");
    if (!active) return;
    const sRect = strip.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const targetLeft = strip.scrollLeft + (aRect.left - sRect.left) - (sRect.width - aRect.width) / 2;
    strip.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [index]);

  // wheel zoom (Ctrl+wheel or just wheel)
  const onWheel = (e) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // drag handling — swipe (scale=1) or pan (scale>1)
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (scale > 1) {
      setDrag({ kind: "pan", startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y });
    } else {
      setDrag({ kind: "swipe", startX: e.clientX, startY: e.clientY });
    }
  };
  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      if (drag.kind === "pan") {
        setPan({ x: drag.baseX + (e.clientX - drag.startX), y: drag.baseY + (e.clientY - drag.startY) });
      } else {
        setSwipeOffset(e.clientX - drag.startX);
      }
    };
    const onUp = (e) => {
      if (drag.kind === "swipe") {
        const dx = e.clientX - drag.startX;
        if (Math.abs(dx) > 80) {
          if (dx < 0) next(); else prev();
        }
        setSwipeOffset(0);
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, index]);

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  };
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const cur = items[index];

  // track translate: -index * 100% + drag offset
  const trackStyle = {
    transform: `translateX(calc(${-index * 100}% + ${swipeOffset}px))`,
  };

  return (
    <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lb-topbar">
        <span className={"lb-kind" + (cur.kind === "floor" ? " floor" : "")}>
          {cur.kind === "floor" ? "Plattegrond" : "Foto"}
        </span>
        <span className="lb-counter">
          {String(index + 1).padStart(2, "0")}<span className="sep">/</span>{String(items.length).padStart(2, "0")}
        </span>
        <div className="lb-controls">
          <button className="lb-btn" onClick={zoomOut} disabled={scale <= 1} title="Uitzoomen (−)" aria-label="Uitzoomen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M8 11h6"/>
            </svg>
          </button>
          <button className="lb-btn" onClick={zoomIn} disabled={scale >= 4} title="Inzoomen (+)" aria-label="Inzoomen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M11 8v6M8 11h6"/>
            </svg>
          </button>
          <button className="lb-btn" onClick={toggleFs} title="Volledig scherm" aria-label="Volledig scherm">
            {isFs ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3v3a3 3 0 0 1-3 3H3"/><path d="M15 3v3a3 3 0 0 0 3 3h3"/>
                <path d="M9 21v-3a3 3 0 0 0-3-3H3"/><path d="M15 21v-3a3 3 0 0 1 3-3h3"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/>
              </svg>
            )}
          </button>
          <button className="lb-btn" onClick={onClose} title="Sluiten (Esc)" aria-label="Sluiten">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={"lb-stage" + (drag ? " dragging" : "") + (scale > 1 ? " zoomed" : "")}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
        onDoubleClick={() => (scale === 1 ? setScale(2) : resetZoom())}
      >
        <div className={"lb-track" + (drag ? "" : " snap")} style={trackStyle}>
          {items.map((item, i) => (
            <div className="lb-item" key={i}>
              <div className={"lb-frame" + (item.kind === "floor" ? " is-floor" : "")}>
                {i === index ? (
                  <div
                    className={"lb-scaler" + (drag && drag.kind === "pan" ? " no-anim" : "")}
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
                  >
                    {item.kind === "photo"
                      ? <Placeholder hue={item.hue} label={item.label}/>
                      : <FloorPlanPlaceholder />}
                  </div>
                ) : (
                  item.kind === "photo"
                    ? <Placeholder hue={item.hue} label={item.label}/>
                    : <FloorPlanPlaceholder />
                )}
                <div className="lb-imglabel">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lb-arrows">
        <button className="lb-arrow" onClick={prev} disabled={index === 0} aria-label="Vorige">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button className="lb-arrow" onClick={next} disabled={index === items.length - 1} aria-label="Volgende">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6"/>
          </svg>
        </button>
      </div>

      <div className="lb-hint">
        <kbd>←</kbd><kbd>→</kbd> navigeer · <kbd>+</kbd><kbd>−</kbd> zoom · <kbd>Esc</kbd> sluit
      </div>

      <div className="lb-strip">
        <div className="lb-strip-inner" ref={stripRef}>
          {items.map((item, i) => {
            const isFirstFloor = item.kind === "floor" && (i === 0 || items[i - 1].kind === "photo");
            return (
              <React.Fragment key={i}>
                {isFirstFloor && i > 0 && <div className="lb-thumb-sep" aria-hidden="true"/>}
                <div
                  className={"lb-thumb" + (i === index ? " active" : "") + (item.kind === "floor" ? " is-floor" : "")}
                  onClick={() => goTo(i)}
                  title={item.label}
                >
                  {item.kind === "photo"
                    ? <Placeholder hue={item.hue} label={String(i + 1)}/>
                    : <FloorPlanPlaceholder />}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --------------- DETAIL VIEW ----------------
function DetailView({ id, onBack }) {
  const l = LISTINGS.find(x => x.id === id);
  if (!l) return null;

  const photoItems = useMemo(
    () => Array.from({ length: l.images }, (_, i) => ({
      kind: "photo",
      hue: (l.placeholder.hue + i * 14) % 360,
      label: `${l.placeholder.label} · Foto ${String(i + 1).padStart(2, "0")}`,
    })),
    [l.id]
  );
  const floorItems = useMemo(
    () => Array.from({ length: l.floorPlans }, (_, i) => ({
      kind: "floor",
      label: `Plattegrond ${i + 1}`,
    })),
    [l.id]
  );
  const allItems = useMemo(() => [...photoItems, ...floorItems], [photoItems, floorItems]);

  const [lbIndex, setLbIndex] = useState(-1);
  const openLb = (i) => setLbIndex(i);
  const closeLb = () => setLbIndex(-1);

  const tilesShown = Math.min(5, photoItems.length);
  const extraCount = Math.max(0, allItems.length - tilesShown);

  return (
    <main className="detail" data-screen-label="02 Detail">
      <button className="back" onClick={onBack}>
        <IconBack /> Terug naar overzicht
      </button>

      <header className="detail-head">
        <div>
          <div className="crumbs">
            {l.city} / {l.district || "—"} / <span style={{color:"var(--ink-2)"}}>{l.id}</span>
          </div>
          <h1>{l.address}</h1>
          <div className="sub">
            <span>{l.postcode} {l.city}</span>
            <span style={{color:"var(--ink-4)"}}>·</span>
            <span>{l.type}</span>
            {l.nieuwbouw && <span className="badge nieuwbouw">Nieuwbouw</span>}
            {l.stilleVerkoop && <span className="badge silent">Stille verkoop</span>}
          </div>
        </div>
        <div>
          <div className="price-big">{fmtPrice(l.price)}</div>
          <div className="price-big-sub">{l.priceType}</div>
        </div>
      </header>

      <div className="gallery">
        {[0, 1, 2, 3, 4].map(i => {
          const photo = photoItems[i];
          if (!photo) return <div className={"g" + (i === 0 ? " big" : "")} key={i}/>;
          return (
            <div
              className={"g" + (i === 0 ? " big" : "")}
              key={i}
              onClick={() => openLb(i)}
            >
              <Placeholder hue={photo.hue} label={photo.label}/>
              {i === 4 && extraCount > 0 && (
                <div
                  className="more"
                  onClick={(e) => { e.stopPropagation(); openLb(Math.min(5, allItems.length - 1)); }}
                >
                  <strong>+{extraCount}</strong>
                  <span>media</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {floorItems.length > 0 ? (
        <section className="section" style={{ marginTop: 28, paddingTop: 0, borderTop: "none" }}>
          <h2>Plattegronden <span style={{color:"var(--ink-4)", marginLeft: 8}}>({floorItems.length})</span></h2>
          <div className="fp-strip">
            {floorItems.map((fp, i) => (
              <div
                className="fp-tile"
                key={i}
                onClick={() => openLb(photoItems.length + i)}
                title={fp.label}
              >
                <FloorPlanPlaceholder />
                <div className="fp-label">Plattegrond {i + 1}</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="section" style={{ marginTop: 28, paddingTop: 0, borderTop: "none" }}>
          <h2>Plattegronden <span style={{color:"var(--ink-4)", marginLeft: 8}}>(0)</span></h2>
          <div className="fp-strip-empty">— geen plattegronden gevonden —</div>
        </section>
      )}

      {l.stilleVerkoop && (
        <div className="flag-banner">
          <span className="lbl">Off-market</span>
          <span className="txt">
            Deze woning is in stille verkoop — verschijnt niet op Funda. Bezichtigingen lopen via {l.agency}.
          </span>
        </div>
      )}

      <div className="detail-grid">
        <div>
          <section className="section">
            <h2>Kerncijfers</h2>
            <div className="kpi">
              <div className="c">
                <div className="lbl">Woonopp.</div>
                <div className={"val" + (l.livingArea == null ? " placeholder" : "")}>
                  {l.livingArea != null ? fmtInt(l.livingArea) : "—"}
                  {l.livingArea != null && <span className="u">m²</span>}
                </div>
              </div>
              <div className="c">
                <div className="lbl">Perceel</div>
                <div className={"val" + (l.plotArea == null ? " placeholder" : "")}>
                  {l.plotArea != null ? fmtInt(l.plotArea) : "—"}
                  {l.plotArea != null && <span className="u">m²</span>}
                </div>
              </div>
              <div className="c">
                <div className="lbl">Slaapkamers</div>
                <div className={"val" + (l.bedrooms == null ? " placeholder" : "")}>
                  {l.bedrooms != null ? l.bedrooms : "—"}
                </div>
              </div>
              <div className="c">
                <div className="lbl">Energielabel</div>
                <div className="val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <EnergyBadge label={l.energyLabel} />
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Omschrijving</h2>
            <ReadMore text={l.description} />
          </section>
        </div>

        <aside className="side">
          <div className="block">
            <h3>Stats</h3>
            <div className="kv">
              <span className="k">Bouwjaar</span>
              <span className={"v" + (l.yearBuilt == null ? " placeholder" : "")}>
                {l.yearBuilt ?? "—"}
              </span>
              <span className="k">Type</span>
              <span className="v">{l.type || "—"}</span>
              <span className="k">Aantal kamers</span>
              <span className={"v" + (l.rooms == null ? " placeholder" : "")}>
                {l.rooms ?? "—"}
              </span>
              <hr/>
              <span className="k">Vraagprijs</span>
              <span className="v">{fmtPrice(l.price)}</span>
              <span className="k">Prijsvorm</span>
              <span className="v">{l.priceType}</span>
              <span className="k">Prijs per m²</span>
              <span className={"v" + (l.pricePerM2 == null ? " placeholder" : "")}>
                {l.pricePerM2 != null ? `€\u00A0${fmtInt(l.pricePerM2)}` : "—"}
              </span>
              <hr/>
              <span className="k">Listing-ID</span>
              <span className="v">{l.id}</span>
              <span className="k">Op markt</span>
              <span className="v">{fmtDate(l.listedAt)}</span>
              <span className="k">Gescraped</span>
              <span className="v">{fmtTimeAgo(l.scrapedAt)}</span>
            </div>
          </div>

          <div className="block">
            <h3>Bron</h3>
            <a
              className={"source-pill" + (l.stilleVerkoop ? " silent" : "")}
              href={l.sourceUrl.startsWith("http") ? l.sourceUrl : "#"}
              target="_blank"
              rel="noreferrer"
              onClick={e => { if (!l.sourceUrl.startsWith("http")) e.preventDefault(); }}
            >
              <IconExt />
              {l.sourceUrl.startsWith("http")
                ? l.sourceUrl.replace(/^https?:\/\//, "").slice(0, 38) + (l.sourceUrl.length > 46 ? "…" : "")
                : "off-market — geen publieke bron"}
            </a>
          </div>

          <div className="block">
            <h3>Makelaar</h3>
            <div className="agency-block">
              <div style={{
                width: 44, height: 44, borderRadius: 4,
                background: `linear-gradient(135deg, oklch(0.72 0.08 ${l.placeholder.hue}), oklch(0.50 0.14 ${l.placeholder.hue}))`,
                color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                flex: "0 0 auto",
              }}>
                {l.agency.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="ag-name">{l.agency}</div>
                <a
                  className="ag-url"
                  href={"https://" + l.agencyUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.agencyUrl} <IconExt />
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {lbIndex >= 0 && (
        <Lightbox
          items={allItems}
          startIndex={lbIndex}
          onClose={closeLb}
        />
      )}
    </main>
  );
}

// --------------- ROOT ----------------
function App() {
  const [route, setRoute] = useState(() => {
    const h = location.hash.match(/#\/listing\/(.+)$/);
    return h ? { name: "detail", id: h[1] } : { name: "list" };
  });

  useEffect(() => {
    const onHash = () => {
      const h = location.hash.match(/#\/listing\/(.+)$/);
      setRoute(h ? { name: "detail", id: h[1] } : { name: "list" });
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const open = (id) => { location.hash = `#/listing/${id}`; };
  const back = () => { location.hash = ""; };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="dot"/>
            <span>Vastgoed Scraper</span>
            <small>v0.4 — intern</small>
          </div>
          <div className="sync">
            <span className="live">live</span>
            <span>laatste sync · 4 min geleden</span>
            <span>volgende run · 14:30</span>
          </div>
        </div>
      </header>

      {route.name === "list"
        ? <ListView onOpen={open} />
        : <DetailView id={route.id} onBack={back} />
      }

      <footer className="footer">
        <span>Vastgoed Scraper · intern dashboard · niet voor distributie</span>
        <span>scraping interval · 15 min · {LISTINGS.length} actieve bronnen</span>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
