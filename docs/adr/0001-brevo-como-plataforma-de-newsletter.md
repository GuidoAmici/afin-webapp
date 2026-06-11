# ADR-0001: Brevo como plataforma de envío de newsletter

**Fecha:** 2026-06-08
**Estado:** Aceptado

## Contexto

El sitio de AFIN srl necesita un mecanismo para enviar newsletters a suscriptores. Las opciones consideradas fueron:

1. **Servicio externo** (Brevo, Mailchimp, etc.) — AFIN redacta y manda desde un panel no-técnico
2. **Construido en el sitio** — panel de admin custom dentro de afin-website con editor, gestión de listas y envío

## Decisión

Se usa **Brevo** como plataforma de gestión y envío de newsletters.

El sitio solo captura el email del suscriptor y lo agrega a la lista de Brevo vía API. AFIN gestiona el envío de campañas íntegramente desde el dashboard de Brevo sin intervención técnica.

## Consecuencias

- **A favor:** Cero mantenimiento de infraestructura de email. AFIN opera de forma autónoma — redacta, programa y manda desde Brevo sin depender del desarrollador. El plan gratuito de Brevo cubre el volumen inicial (300 emails/día, contactos ilimitados).
- **En contra:** Dependencia de un servicio externo. Si Brevo cambia precios o política, hay que migrar la lista. Mitigado: exportar la lista de contactos desde Brevo es trivial.
- **Descartado:** Construir el sistema de envío dentro del sitio implicaría desarrollar editor de contenido, gestión de listas, cola de envío, bounce handling y tracking de aperturas — equivalente a construir un Mailchimp propio. No justificado en esta etapa.
