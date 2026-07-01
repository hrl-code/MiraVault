const qualityMap = {
  '4K': 'bg-[#6d4ff7]/20 text-[#c4b5fd]',
  '1080p': 'bg-[#2d6cdf]/20 text-[#93c5fd]',
  '720p': 'bg-[#5b667f]/25 text-[#cbd5e1]'
}

const languageMap = {
  ESP: 'bg-[#1f8b58]/20 text-[#86efac]',
  VOSE: 'bg-[#2d6cdf]/20 text-[#93c5fd]',
  DUAL: 'bg-[#b7791f]/20 text-[#fcd34d]',
  ENG: 'bg-[#5b667f]/25 text-[#cbd5e1]'
}

const statusMap = {
  downloading: 'bg-[#2d6cdf]/20 text-[#93c5fd]',
  completed: 'bg-[#1f8b58]/20 text-[#86efac]',
  error: 'bg-[#7c2632]/20 text-[#ffb8c0]',
  paused: 'bg-[#5b667f]/25 text-[#cbd5e1]'
}

export default function Badge({ type, value }) {
  const normalized = String(value || '')
  const classMap = type === 'quality' ? qualityMap : type === 'language' ? languageMap : statusMap

  return (
    <span
      className={[
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
        classMap[normalized] || 'bg-black/20 text-[color:var(--text-secondary)]'
      ].join(' ')}
    >
      {normalized}
    </span>
  )
}
