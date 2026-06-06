export default function DropIndicatorLine() {
  return (
    <div
      className="pointer-events-none absolute -top-3 left-0 right-0 z-30 flex items-center gap-1 px-1"
      aria-hidden
    >
      <div className="h-2 w-2 shrink-0 rounded-full bg-[#E07A5F]" />
      <div className="h-0.5 flex-1 rounded-full bg-[#E07A5F] shadow-[0_0_6px_rgba(224,122,95,0.6)]" />
      <div className="h-2 w-2 shrink-0 rounded-full bg-[#E07A5F]" />
    </div>
  )
}
