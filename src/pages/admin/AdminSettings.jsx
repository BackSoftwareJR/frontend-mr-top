import { Bell, Shield, Zap } from 'lucide-react'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

const SETTINGS_SECTIONS = [
  {
    icon: Shield,
    title: 'Sicurezza & Accesso',
    description: 'Gestisci ruoli Super Admin, 2FA e sessioni attive.',
    accent: 'text-cyan-400',
  },
  {
    icon: Zap,
    title: 'Automazioni AI',
    description: 'Configura soglie di matching, routing automatico e override.',
    accent: 'text-purple-400',
  },
  {
    icon: Bell,
    title: 'Notifiche Piattaforma',
    description: 'Alert per approvazioni partner, lead urgenti e anomalie.',
    accent: 'text-emerald-400',
  },
]

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Impostazioni</h1>
        <p className={adminPageSubtitle}>Configurazione God Mode — area riservata Super Admin</p>
      </div>

      <div className="space-y-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.title}
              type="button"
              className={`flex w-full items-start gap-4 ${adminGlassCard} p-4 text-left transition-all hover:border-white/15 sm:p-5`}
            >
              <div className={`rounded-xl border border-white/10 bg-white/5 p-2.5 ${section.accent}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white sm:text-base">{section.title}</h2>
                <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{section.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className={`${adminGlassCard} p-4 sm:p-5`}>
        <p className="text-xs text-zinc-500">
          Wenando God Mode v1.0 — Super Admin Dashboard. Le impostazioni avanzate saranno disponibili in una prossima release.
        </p>
      </div>
    </div>
  )
}
