import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Trash2 } from 'lucide-react'
import DropIndicatorLine from './DropIndicatorLine'
import { getSortableId } from './useSortableList'

export default function SortableSection({
  block,
  index,
  label,
  selected,
  disabled,
  showDropIndicator,
  onSelect,
  onDuplicate,
  onDelete,
  children,
}) {
  const id = getSortableId(block, index)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/section relative flex gap-2 ${isDragging ? 'opacity-60' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(id)
      }}
    >
      {showDropIndicator ? <DropIndicatorLine /> : null}

      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        className={`mt-1 flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#E07A5F]/10 hover:text-[#E07A5F] ${
          disabled ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing'
        }`}
        title="Trascina per riordinare"
        aria-label="Trascina per riordinare"
        onClick={(event) => event.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div
        className={`relative min-w-0 flex-1 rounded-xl transition-shadow ${
          selected
            ? 'ring-2 ring-[#E07A5F] ring-offset-2 ring-offset-[#FDFBF7]'
            : 'ring-1 ring-transparent hover:ring-[#E07A5F]/20'
        }`}
      >
        {selected && !disabled ? (
          <div className="absolute -top-3 right-2 z-20 flex items-center gap-1 rounded-lg border border-[#E07A5F]/30 bg-white px-1 py-0.5 shadow-md">
            <span className="hidden px-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] sm:inline">
              {label}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDuplicate?.()
              }}
              className="rounded p-1.5 text-[#6B7280] transition-colors hover:bg-[#E07A5F]/10 hover:text-[#E07A5F]"
              title="Duplica sezione"
              aria-label="Duplica sezione"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDelete?.()
              }}
              className="rounded p-1.5 text-red-400/80 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Elimina sezione"
              aria-label="Elimina sezione"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  )
}
