export default function EmptyState({ icon, title, description, action = null }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[color:var(--border)] bg-black/10 px-6 py-14 text-center">
      <div className="flex justify-center text-[color:var(--text-muted)]">{icon}</div>
      <h2 className="mt-5 text-2xl font-semibold text-[color:var(--text-primary)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
