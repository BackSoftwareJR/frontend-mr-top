import { motion } from 'framer-motion'
import { Building2, FileCheck2 } from 'lucide-react'
import DynamicFormField from './DynamicFormField'
import FileDropZone from './FileDropZone'
import { obGlassCard } from '../onboardingStyles'

const LEGAL_FIELDS = [
  {
    id: 'vat',
    type: 'text',
    label: 'Partita IVA',
    placeholder: 'IT12345678901',
    required: true,
  },
  {
    id: 'sdi',
    type: 'text',
    label: 'Codice SDI',
    placeholder: 'ABCDEFG',
    required: true,
  },
]

export default function StepLegal({ data, onChange, onFilesChange }) {
  const handleField = (id, value) => onChange({ [id]: value })

  return (
    <div className="space-y-6">
      <motion.div
        className={`${obGlassCard} flex items-start gap-3`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-coral/15 text-accent-coral">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-charcoal">Verifica identità legale</p>
          <p className="mt-1 text-xs text-charcoal-muted">
            I dati devono corrispondere alla visura camerale della struttura partner.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LEGAL_FIELDS.map((field) => (
          <DynamicFormField
            key={field.id}
            field={field}
            value={data[field.id]}
            onChange={handleField}
          />
        ))}
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-charcoal-muted">Documenti richiesti</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDropZone
            label="Visura Camerale"
            hint="PDF, max 10 MB"
            accept=".pdf,application/pdf"
            fileName={data.visura}
            onFile={(name) => onFilesChange?.({ visura: name })}
          />
          <FileDropZone
            label="Documento Identità"
            hint="PDF o immagine"
            accept=".pdf,image/*"
            fileName={data.identityDoc}
            onFile={(name) => onFilesChange?.({ identityDoc: name })}
          />
        </div>
      </div>

      {(data.visura || data.identityDoc) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-800 backdrop-blur-sm"
        >
          <FileCheck2 className="h-4 w-4 shrink-0" />
          <span>
            {data.visura && data.identityDoc
              ? 'Entrambi i documenti caricati.'
              : 'Documento caricato — completa l\'altro file per procedere.'}
          </span>
        </motion.div>
      )}
    </div>
  )
}
