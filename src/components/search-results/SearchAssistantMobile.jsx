import SearchAssistantPanel from './SearchAssistantPanel'

export default function SearchAssistantMobile({ panelProps }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <SearchAssistantPanel {...panelProps} />
    </div>
  )
}
