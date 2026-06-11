# PRD-0001: Newsletter y rediseño de página de Contacto

**Fecha:** 2026-06-08
**Estado:** Aprobado
**Fase:** 1

## Objetivo

Reemplazar el formulario de contacto no funcional por un flujo honesto con tres caminos diferenciados según el nivel de compromiso del visitante, e introducir un mecanismo de newsletter para mantener a los interesados actualizados sobre productos, promociones y novedades del blog.

## Contexto

El formulario de contacto actual simula enviar una consulta pero no hace nada — solo muestra un mensaje de éxito falso. Adicionalmente, la arquitectura de captación de leads fue revisada y se concluyó que:

- Una cuenta de usuario solo tiene valor si hay algo concreto por lo cual el visitante volvería (pedidos, precios mayoristas, historial). Esa funcionalidad es fase 2+.
- El formulario de contacto compite innecesariamente con WhatsApp, que ya está en el sitio y es más directo para consultas.
- El newsletter es el mecanismo de menor fricción para mantener interés sin pedir compromiso.

## Tres caminos del visitante

| Intención | Acción | Fricción |
|-----------|--------|----------|
| Hacer una consulta puntual | Botón de WhatsApp | Mínima |
| Mantenerse informado | Suscripción al newsletter (solo email) | Baja |
| Hacer un pedido | Crear cuenta → fase 2 | Media |

## Alcance

### Incluye

**Página `/contacto` — rediseño completo**
- Eliminar `ContactForm`
- Mostrar datos de contacto de AFIN srl: email, teléfono de línea, número de WhatsApp, dirección física
- Embed de Google Maps (iframe) con la ubicación de la fábrica
- Widget de suscripción al newsletter al final de la página

**Widget de suscripción al newsletter**
- Campo: solo email
- Opt-in: single (suscripción inmediata, sin confirmación por click)
- Mensaje de éxito en página tras suscripción
- Welcome email automático configurado en Brevo (automation "nuevo suscriptor")
- Se muestra en tres lugares: footer del home, final de `/contacto`, final de `/blog`

**Integración con Brevo**
- Server Action de Next.js que llama a la API de Brevo
- `BREVO_API_KEY` en Doppler → sincronizado a Vercel

### No incluye

- Panel de administración para ver suscriptores (se gestiona desde el dashboard de Brevo)
- Double opt-in / flujo de confirmación por email
- Cuenta de usuario / autenticación (fase 2)
- Checkout o sistema de pedidos (fase 3)
- Google Maps JavaScript API con marcadores custom (iframe es suficiente)
- Mapa en otras páginas que no sean `/contacto`

## Requerimientos funcionales

### RF-01 — Widget de suscripción
- Input de email con validación de formato client-side
- Botón "Suscribirme" que llama al Server Action
- Estado de loading durante el request
- Mensaje de éxito: "¡Suscripto! Vas a recibir novedades de AFIN srl."
- Mensaje de error genérico si falla la API: "Algo salió mal. Intentá de nuevo."
- Si el email ya existe en Brevo, mostrar éxito (sin exponer que ya estaba en la lista)

### RF-02 — Página `/contacto`
- Heading principal: "Contacto"
- Sección de datos de empresa con iconos: email clicable (`mailto:`), teléfono clicable (`tel:`), WhatsApp clicable (`https://wa.me/...`), dirección de texto
- Iframe de Google Maps centrado en la dirección de la fábrica
- Widget de newsletter al final

### RF-03 — Limpieza periódica de suscriptores
- Sin automatización. El operador de AFIN revisa periódicamente en Brevo y elimina suscriptores inactivos o no comprometidos.

## Requerimientos técnicos

- Server Action en `/app/actions/newsletter.ts` (no exponer la API key al cliente)
- Variable de entorno: `BREVO_API_KEY` (Doppler, sincronizada a Vercel)
- Lista de Brevo: crear lista "AFIN srl — Newsletter" y registrar el ID como `BREVO_LIST_ID`
- Endpoint de Brevo: `POST https://api.brevo.com/v3/contacts` con `{ email, listIds: [BREVO_LIST_ID], updateEnabled: true }`
- El componente `NewsletterForm` es `'use client'` con estado local para loading/success/error
- El iframe de Google Maps no requiere API key, se obtiene desde "Compartir → Insertar mapa" en maps.google.com

## Criterios de aceptación

- [ ] El formulario de contacto viejo está eliminado
- [ ] `/contacto` muestra datos de empresa completos con links funcionales
- [ ] El mapa carga correctamente en `/contacto`
- [ ] Suscribirse con email válido devuelve éxito y agrega el contacto en Brevo
- [ ] Suscribirse con el mismo email dos veces no muestra error
- [ ] Suscribirse con email inválido muestra error de validación client-side
- [ ] El widget aparece en footer del home, final de `/contacto` y final de `/blog`
- [ ] La API key nunca aparece en el bundle del cliente
