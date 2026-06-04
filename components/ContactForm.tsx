'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {submitted ? (
        <div className="form-success visible" role="alert">
          <div className="form-success-icon">✓</div>
          <h3>¡Consulta enviada!</h3>
          <p>Te respondemos en el próximo día hábil.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div>
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" required />
            </div>
            <div>
              <label htmlFor="empresa">Empresa</label>
              <input type="text" id="empresa" name="empresa" placeholder="Razón social" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" placeholder="correo@empresa.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" placeholder="+54 9 11 0000-0000" />
          </div>
          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <input type="text" id="asunto" name="asunto" placeholder="Presupuesto / Consulta técnica / Otro" />
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea id="mensaje" name="mensaje" rows={5} placeholder="Describa su consulta o pedido de presupuesto..." required />
          </div>
          <button type="submit" className="btn-submit">Enviar consulta</button>
        </form>
      )}
    </>
  )
}
