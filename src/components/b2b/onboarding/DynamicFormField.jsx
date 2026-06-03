import { obGlassCardSm, obInput, obLabel } from '../onboardingStyles'

export default function DynamicFormField({ field, value, onChange, readOnly = false }) {
  const id = `field-${field.id}`

  if (field.type === 'toggle') {
    return (
      <label
        htmlFor={id}
        className={`${obGlassCardSm} flex cursor-pointer items-center justify-between transition-shadow hover:shadow-md ${readOnly ? 'pointer-events-none opacity-95' : ''}`}
      >
        <div>
          <span className="text-sm font-medium text-charcoal">{field.label}</span>
          {field.hint && <p className="mt-0.5 text-xs text-charcoal-muted">{field.hint}</p>}
        </div>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(e) => onChange(field.id, e.target.checked)}
          className="h-5 w-5 rounded-md border-black/10 text-accent-coral focus:ring-accent-coral/25"
        />
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <div>
        <label htmlFor={id} className={obLabel}>
          {field.label}
          {field.required && <span className="text-accent-rose"> *</span>}
        </label>
        <select
          id={id}
          value={value ?? ''}
          disabled={readOnly}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={obInput}
        >
          <option value="">Seleziona…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label htmlFor={id} className={obLabel}>
          {field.label}
          {field.required && <span className="text-accent-rose"> *</span>}
        </label>
        <textarea
          id={id}
          rows={field.rows ?? 3}
          value={value ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className={obInput}
        />
      </div>
    )
  }

  return (
    <div>
      <label htmlFor={id} className={obLabel}>
        {field.label}
        {field.required && <span className="text-accent-rose"> *</span>}
      </label>
      <input
        id={id}
        type={field.type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        readOnly={readOnly}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        className={obInput}
      />
    </div>
  )
}
