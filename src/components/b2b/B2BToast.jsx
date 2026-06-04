import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useB2B } from '../../context/B2BContext'
import {
  proToastError,
  proToastInfo,
  proToastSuccess,
} from './proDesignTokens'

const TOAST_STYLES = {
  success: proToastSuccess,
  error: proToastError,
  info: proToastInfo,
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export default function B2BToast() {
  const { toast } = useB2B()
  if (!toast) return null

  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
  const Icon = TOAST_ICONS[toast.type] || Info

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] w-full max-w-sm -translate-x-1/2 px-4">
      <div role="status" className={`flex items-center gap-2.5 ${style}`}>
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span className="min-w-0 flex-1">{toast.message}</span>
        {toast.action ? (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="pointer-events-auto shrink-0 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold underline-offset-2 hover:underline"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}
