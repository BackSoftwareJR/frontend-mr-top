import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import DropIndicatorLine from './DropIndicatorLine'
import { getSortableId } from './useSortableList'

export default function SortableBlockRow({
  block,
  index,
  label,
  disabled,
  showDropIndicator,
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
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'opacity-60' : ''}`}>
      {showDropIndicator ? <DropIndicatorLine /> : null}

      <div className="flex gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={disabled}
          className={`mt-4 flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-accent-coral/10 hover:text-accent-coral ${
            disabled ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing'
          }`}
          title="Trascina per riordinare"
          aria-label="Trascina per riordinare"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
            {!disabled ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-red-500/20 p-1.5 text-red-400/80 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                title="Elimina blocco"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
