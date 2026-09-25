type Props = { className?: string }

function svg(className?: string) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  }
}

export function IconRadio({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M5 9a7 7 0 0 1 14 0" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconAlert({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M12 4.5 20.2 19H3.8L12 4.5Z" />
      <path d="M12 10v4" />
      <path d="M12 16.5h.01" />
    </svg>
  )
}

export function IconInbox({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M5 13 7 6h10l2 7v5H5v-5Z" />
    </svg>
  )
}

export function IconShield({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M12 3.5 19 6.5v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8v-6L12 3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function IconLayers({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </svg>
  )
}

export function IconGrid({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

export function IconScale({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M12 4v16" />
      <path d="M5 8h14" />
      <path d="M5 8 3 14h4L5 8Z" />
      <path d="M19 8l-2 6h4l-2-6Z" />
    </svg>
  )
}

export function IconFlag({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M6 4v16" />
      <path d="M6 5h11l-2 4 2 4H6" />
    </svg>
  )
}

export function IconBack({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M15 6 9 12l6 6" />
    </svg>
  )
}

export function IconCheck({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  )
}

export function IconFile({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M7 3.5h7l4 4V20H7V3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}

export function IconBars({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M5 19V10" />
      <path d="M10 19V6" />
      <path d="M15 19v-6" />
      <path d="M20 19V8" />
    </svg>
  )
}

export function IconHistory({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2-5" />
      <path d="M4.5 4.5V8H8" />
      <path d="M12 8v4.5l2.5 1.5" />
    </svg>
  )
}

export function IconNodes({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="7" r="1.5" />
      <circle cx="19" cy="7" r="1.5" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
      <path d="m10.2 11-3.6-3M13.8 11l3.6-3M10.5 13.5 7.2 16.5M13.5 13.5 16.8 16.5" />
    </svg>
  )
}

export function IconDb({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  )
}

export function IconChevron({ className, down }: Props & { down?: boolean }) {
  return (
    <svg {...svg(className)} style={{ transform: down ? 'rotate(90deg)' : undefined }}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function IconClock({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l2.5 1.5" />
    </svg>
  )
}

export function IconArrow({ className }: Props) {
  return (
    <svg {...svg(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}
