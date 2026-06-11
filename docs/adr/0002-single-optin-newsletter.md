# ADR-0002: Single opt-in para suscripción al newsletter

**Fecha:** 2026-06-08
**Estado:** Aceptado

## Contexto

Al implementar el newsletter hay que decidir si el suscriptor queda activo inmediatamente (single opt-in) o si primero debe confirmar su email haciendo click en un link enviado por Brevo (double opt-in).

## Decisión

Se usa **single opt-in**: el contacto queda suscripto en Brevo inmediatamente al enviar el formulario, sin requerir confirmación adicional.

La limpieza de la lista (remover suscriptores inactivos o sin engagement) se hace manualmente de forma periódica desde el dashboard de Brevo.

## Consecuencias

- **A favor:** Menor fricción en el flujo de suscripción — el visitante completa una acción (ingresar email) en lugar de dos (ingresar email + abrir otro mail y hacer click). Tasas de conversión significativamente más altas.
- **En contra:** Mayor riesgo de emails inválidos o falsos en la lista. La Ley 25.326 (Argentina) prefiere consentimiento explícito, aunque no exige double opt-in. Para el volumen y contexto de una pyme B2B el riesgo legal es bajo.
- **Mitigación:** El operador de AFIN revisa periódicamente la lista en Brevo y elimina contactos sin engagement. Brevo también identifica automáticamente bounces y suscriptores inactivos.
