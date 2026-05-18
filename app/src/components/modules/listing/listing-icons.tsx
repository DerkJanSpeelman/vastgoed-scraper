interface IconProps {
  w?: number;
  h?: number;
}

function Icon({ d, w = 14, h = 14 }: { d: React.ReactNode; w?: number; h?: number }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

export function IconLiving({ w, h }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M3 21V11l9-7 9 7v10" />
        <path d="M9 21v-6h6v6" />
      </>
    } />
  );
}

export function IconPlot({ w, h }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18M9 3v18" />
      </>
    } />
  );
}

export function IconBed({ w, h }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7" />
        <path d="M3 14h18M7 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      </>
    } />
  );
}

export function IconBolt({ w, h }: IconProps) {
  return (
    <Icon w={w} h={h} d={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />} />
  );
}

export function IconArrow({ w = 11, h = 11 }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    } />
  );
}

export function IconExt({ w = 10, h = 10 }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </>
    } />
  );
}

export function IconBack({ w = 12, h = 12 }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </>
    } />
  );
}

export function IconFloor({ w = 11, h = 11 }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <rect x="3" y="3" width="18" height="18" rx="0.5" />
        <path d="M3 11h10v10M13 3v8h8" />
      </>
    } />
  );
}

export function IconCam({ w = 11, h = 11 }: IconProps) {
  return (
    <Icon w={w} h={h} d={
      <>
        <path d="M3 7h4l2-3h6l2 3h4v12H3z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    } />
  );
}
