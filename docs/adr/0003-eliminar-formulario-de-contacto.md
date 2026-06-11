# ADR-0003: Eliminar el formulario de contacto, reemplazar por datos de empresa + WhatsApp

**Fecha:** 2026-06-08
**Estado:** Aceptado

## Contexto

El sitio tiene un `ContactForm` en `/contacto` que actualmente no funciona — simula un envío pero no registra ni transmite datos. Había que decidir si repararlo (integrarlo con un backend) o reemplazarlo por otro mecanismo.

Se analizaron tres opciones para el flujo de captación:

1. **Formulario → email** — registrar la consulta y enviar un mail a AFIN
2. **Formulario → Supabase** — guardar el lead en DB, requiere que el cliente tenga cuenta para verlo
3. **Eliminar el formulario** — las consultas van por WhatsApp (ya existe en el sitio), el interés de largo plazo se captura con newsletter

## Decisión

Se **elimina el `ContactForm`**. La página `/contacto` pasa a mostrar:

- Datos de contacto de la empresa (email, teléfono, WhatsApp, dirección) con links funcionales
- Embed de Google Maps con la ubicación de la fábrica
- Widget de suscripción al newsletter

Las consultas puntuales se resuelven por WhatsApp, que ya está presente en todas las páginas. El formulario de contacto agregaba fricción sin aportar valor diferencial frente al canal de WhatsApp que el cliente (AFIN) ya usa y prefiere.

## Consecuencias

- **A favor:** Sin deuda técnica de integración de formulario. WhatsApp es el canal que AFIN opera naturalmente. La página `/contacto` gana transparencia empresarial mostrando datos reales de la empresa.
- **En contra:** Sin historial de consultas previo a la creación de cuentas (fase 2). Si en el futuro AFIN quiere un CRM básico para gestionar leads, habrá que construirlo.
- **Futuro:** En fase 2, cuando se introduzcan cuentas de usuario y pedidos, se puede evaluar si tiene sentido un formulario de contacto nuevamente o si WhatsApp sigue siendo suficiente para el volumen.
