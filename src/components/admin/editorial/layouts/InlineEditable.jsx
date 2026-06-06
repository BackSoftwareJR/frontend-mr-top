import { useEffect, useRef } from 'react'

/**
 * Click-to-edit field — Wix-style inline editing on the canvas.
 */
export default function InlineEditable({
  value,
  onChange,
  placeholder = 'Clicca per scrivere…',
  multiline = false,
  className = '',
  as: Tag = 'div',
  disabled = false,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && ref.current.textContent !== (value ?? '')) {
      ref.current.textContent = value ?? ''
    }
  }, [value])

  const handleBlur = () => {
    if (!ref.current) return
    onChange(ref.current.textContent?.trim() ?? '')
  }

  const handleKeyDown = (event) => {
    if (!multiline && event.key === 'Enter') {
      event.preventDefault()
      ref.current?.blur()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <Tag
      ref={ref}
      role="textbox"
      contentEditable={!disabled}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      className={`outline-none transition-[box-shadow] focus:ring-2 focus:ring-accent-coral/30 focus:ring-offset-2 focus:ring-offset-transparent empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)] ${className} ${disabled ? 'cursor-default' : 'cursor-text'}`}
    />
  )
}
