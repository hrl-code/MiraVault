import { create } from 'zustand'

const useToastStore = create((set) => ({
  toasts: [],
  show(message, type = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }))

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      }))
    }, 3000)
  }
}))

const toneClasses = {
  success: 'bg-[#1f8b58] text-white',
  error: 'bg-[#7c2632] text-[#ffe1e5]',
  info: 'bg-[color:var(--accent)] text-white'
}

export function useToast() {
  return {
    show: useToastStore((state) => state.show)
  }
}

export default function Toast() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex max-w-sm flex-col items-end gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            'pointer-events-auto min-w-[220px] rounded-2xl px-4 py-3 text-sm shadow-2xl',
            'animate-[toast-slide-in_0.24s_ease-out]',
            toneClasses[toast.type] || toneClasses.info
          ].join(' ')}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
