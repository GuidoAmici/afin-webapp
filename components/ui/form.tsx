'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '@/components/icons'

// Primitivas de formulario compartidas entre modales y páginas de cuenta.
// Los estilos viven en globals.css (.form-label, .form-input, .form-error, etc.).

export function FieldInput({ inputRef, label, type = 'text', value, onChange, placeholder, inputMode, autoComplete, required, disabled }: {
  inputRef?: React.RefObject<HTMLInputElement | null>
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  required?: boolean
  disabled?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label className="form-label">
        {label}
        <span style={{ position: 'relative', display: 'block', marginTop: 5 }}>
          <input
            ref={inputRef}
            className="form-input"
            type={inputType}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            style={isPassword ? { paddingRight: 40 } : undefined}
          />
          {isPassword && (
            <button
              type="button"
              className="form-input-affix"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </span>
      </label>
    </div>
  )
}

export function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="form-error" role="alert">{children}</p>
}

export function SubmitBtn({ loading, loadingLabel = 'Cargando...', onClick, children }: {
  loading: boolean
  loadingLabel?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      className="btn-block"
      disabled={loading}
      onClick={onClick}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}

/** Selector binario tipo "Personal | Empresa". */
export function ChoiceToggle<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`choice-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
