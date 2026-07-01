import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchProgressStore, getProgressKey, progressPercent, formatProgress } from '@/store/watchProgressStore'
import { useLibraryStatusStore } from '@/store/libraryStatusStore'
import { getEffectiveStatus, STATUS_LABELS } from '@/utils/libraryProgress'

const languageTones = {
  ESP: 'bg-[#1d7a46]',
  VOSE: 'bg-[#2d6cdf]',
  DUAL: 'bg-[#7b4de0]'
}

const fallbackByType = {
  series: 'from-[#2446aa] to-[#132250]',
  movie: 'from-[#a86a24] to-[#4b2a11]',
  book: 'from-[#1f8b58] to-[#0f3e28]'
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#f3cf63] text-[#f3cf63]">
      <path d="m12 3.8 2.5 5 5.5.8-4 3.9.9 5.5L12 16.4 7.1 19l.9-5.5-4-3.9 5.5-.8L12 3.8Z" />
    </svg>
  )
}

function PosterFallback({ item }) {
  return (
    <div
      className={[
        'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br text-white',
        fallbackByType[item.type] || fallbackByType.movie
      ].join(' ')}
    >
      <span className="text-[11px] uppercase tracking-[0.28em] text-white/70">{item.provider}</span>
      <span className="mt-3 px-4 text-center text-lg font-semibold">{item.title}</span>
    </div>
  )
}

export default function MediaCard({ item, overlay = null }) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const allProgress = useWatchProgressStore((state) => state.progress)
  const statuses = useLibraryStatusStore((state) => state.statuses)
  const progress = allProgress[getProgressKey(item)]
  const status = getEffectiveStatus(item, allProgress, statuses)
  const pct = progressPercent(progress)
  const progressText = formatProgress(progress)

  return (
    <>
      <article
        className="group w-[160px] cursor-pointer overflow-hidden rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-card)] transition-all hover:border-[color:var(--accent)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]"
        onClick={() => navigate(`/media/${encodeURIComponent(item.id)}`, {
          state: { item }
        })}
      >
        <div className="relative h-[220px] overflow-hidden">
          {overlay ? <div className="absolute right-2 top-2 z-10">{overlay}</div> : null}
          {!imageError && item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => setImageError(true)}
            />
          ) : (
            <PosterFallback item={item} />
          )}

          {item.language ? (
            <span
              className={[
                'absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white',
                languageTones[item.language] || 'bg-black/70'
              ].join(' ')}
            >
              {item.language}
            </span>
          ) : null}

          {item.quality ? (
            <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              {item.quality}
            </span>
          ) : null}

          {progress && !progress.watched && pct > 0 ? (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
              {pct}%
            </span>
          ) : null}

          {progress?.watched ? (
            <span className="absolute bottom-2 left-2 rounded-full bg-[#1f8b58]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Visto
            </span>
          ) : null}

          {!progress?.watched && status !== 'pending' ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
              {STATUS_LABELS[status]}
            </span>
          ) : null}

          {/* Barra de progreso */}
          {pct > 0 && pct < 100 ? (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
              <div
                className="h-full bg-[color:var(--accent)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : null}

          {pct >= 100 ? (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1f8b58]" />
          ) : null}
        </div>

        <div className="space-y-1 p-3">
          <h3 className="truncate text-sm font-medium text-[color:var(--text-primary)]">{item.title}</h3>
          <div className="flex items-center justify-between gap-2 text-xs text-[color:var(--text-secondary)]">
            <span>{item.year || 'Sin fecha'}</span>
            {item.rating ? (
              <span className="flex items-center gap-1">
                <StarIcon />
                {item.rating}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </>
  )
}
