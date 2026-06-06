import { useCallback, useMemo, useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export function getSortableId(item, index) {
  return item?.id ?? `sortable-${index}`
}

/**
 * Shared drag-and-drop list logic for TileEditor sections and BlockEditor rows.
 * @param {{ items: unknown[], onReorder: (next: unknown[]) => void, disabled?: boolean }} options
 */
export function useSortableList({ items, onReorder, disabled = false }) {
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)

  const itemIds = useMemo(
    () => (Array.isArray(items) ? items : []).map((item, index) => getSortableId(item, index)),
    [items]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback(
    ({ active }) => {
      if (disabled) return
      setActiveId(active.id)
    },
    [disabled]
  )

  const handleDragOver = useCallback(({ over }) => {
    setOverId(over?.id ?? null)
  }, [])

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null)
      setOverId(null)

      if (disabled || !over || active.id === over.id) return

      const oldIndex = itemIds.indexOf(active.id)
      const newIndex = itemIds.indexOf(over.id)
      if (oldIndex === -1 || newIndex === -1) return

      onReorder(arrayMove(items, oldIndex, newIndex))
    },
    [disabled, itemIds, items, onReorder]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const activeIndex = activeId != null ? itemIds.indexOf(activeId) : -1
  const overIndex = overId != null ? itemIds.indexOf(overId) : -1

  return {
    sensors,
    collisionDetection: closestCenter,
    itemIds,
    activeId,
    overId,
    activeIndex,
    overIndex,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
    disabled,
  }
}
