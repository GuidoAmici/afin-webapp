# PRD-0002: Fase 2 — checkout (MP + transferencia) y panel de operaciones /empleados

**Fecha:** 2026-06-22
**Estado:** Aprobado
**Fase:** 2
**Issue de tracking:** #9

## Problem Statement

Hoy AFIN recibe pedidos por WhatsApp y Andrés los cotiza y carga a mano desde `/empleados`. No hay forma de que un cliente complete una compra de punta a punta por el sitio: no puede pagar, y AFIN no tiene un panel donde administrar el ciclo de vida del pedido (estados, pago, stock, precios) de forma confiable.

Peor aún, la implementación inicial del checkout dejó huecos de seguridad que, con dinero real en juego, son explotables:
- El **precio de cada ítem viaja desde el frontend** — un cliente puede crear un pedido con precios arbitrarios.
- El cliente **puede auto-promover el estado** de su propio pedido vía UPDATE directo (la policy RLS no restringe la transición de destino) — equivale a marcarse como pagado sin pagar.
- El `proxy.ts` del panel **expulsa a los admin** porque chequea `=== 'empleado'` y el modelo ahora tiene tres roles.

## Solution

Implementar el checkout de fase 2 y el panel de operaciones sobre un modelo de seguridad donde **el cliente nunca escribe precios ni estados**. Los precios se resuelven server-side; toda transición de estado pasa por una única función Postgres (`transition_order`) que valida la máquina de estados, el rol del caller y las barreras de pago, y deja rastro de auditoría.

El cliente puede pagar de dos formas: **Mercado Pago** (Checkout Pro, precio de lista, confirmación automática por webhook) o **transferencia** (descuento configurable, comprobante obligatorio, corroboración manual por un empleado). Andrés y otros empleados administran pedidos, productos, precios y stock desde `/empleados`, con operaciones sensibles (forzar estados, editar precios, habilitar crédito) reservadas al rol admin.

El catálogo deja de tener un eje editorial manual: el **tag visible se deriva 100% del estado real** del producto (stock, precio, foto, antigüedad). El empleado controla la oferta cargando datos, no eligiendo un badge.

Las decisiones de arquitectura están registradas en los ADR-005 a ADR-009 de la documentación de afin (`documentation/arquitectura/CONTEXT.md` y `documentation/adr/`).

## User Stories

### Cliente — checkout y pago
1. Como cliente, quiero ver el total de mi pedido calculado por el servidor, para confiar en que el precio es el real de catálogo y no uno manipulable.
2. Como cliente, quiero elegir entre pagar con Mercado Pago o por transferencia, para usar el medio que me convenga.
3. Como cliente, quiero ver el descuento por transferencia reflejado en el total antes de confirmar, para decidir con la información completa.
4. Como cliente, quiero cambiar de medio de pago mientras mi pago siga pendiente, para corregir mi elección sin rehacer el pedido.
5. Como cliente que paga con Mercado Pago, quiero ser redirigido a la plataforma y volver con mi pago confirmado automáticamente, para no esperar una validación manual.
6. Como cliente que paga por transferencia, quiero ver los datos bancarios de AFIN en el checkout, para hacer la transferencia.
7. Como cliente que pagó por transferencia, quiero informar mi pago subiendo el comprobante, para que AFIN lo corrobore.
8. Como cliente, quiero recibir aviso si el producto que pagué no tiene stock inmediato, para saber que mi pedido se demora pero sigue en pie.
9. Como cliente, quiero que mi pedido impago no quede vivo para siempre, entendiendo que expira a los 7 días con aviso previo, para no perder mi lugar sin enterarme.
10. Como cliente, quiero ver el estado logístico y el estado de pago de mi pedido por separado, para entender en qué etapa está realmente.
11. Como cliente, quiero ver el historial de mi pedido (cuándo se confirmó, se pagó, se despachó), para hacer seguimiento.

### Cliente — catálogo
12. Como cliente, quiero ver de un vistazo si un producto está disponible para pedir, hay que consultarlo, está sin stock o es nuevo, para decidir rápido. El tag es automático y honesto: si dice "En stock", el producto tiene unidades, precio y foto y se puede comprar de punta a punta.

### Empleado — operación de pedidos
13. Como empleado, quiero ver una cola de pedidos con transferencias informadas pendientes de corroborar, para procesarlas en orden.
14. Como empleado, quiero corroborar un pago contra el home banking y registrarlo, para avanzar el pedido a pagado.
15. Como empleado, quiero rechazar un informe de transferencia que no cierra, dejando una nota visible al cliente, sin cancelar el pedido.
16. Como empleado, quiero ejecutar solo transiciones de estado válidas (protocolares), para no romper el flujo operativo por error.
17. Como empleado, quiero ver el estado de pago y logístico de cada pedido de un vistazo (dos badges), para priorizar mi trabajo.
18. Como empleado, quiero ver el timeline de eventos de un pedido y quién ejecutó cada transición, para entender su historia y resolver disputas.
19. Como empleado, quiero que el sistema me impida preparar un pedido que no está pagado (salvo crédito habilitado), para no trabajar sobre pedidos sin cobrar.

### Admin — operaciones sensibles
20. Como admin (Andrés o Guido), quiero forzar una transición de estado fuera del protocolo, para corregir errores operativos.
21. Como admin, quiero editar el porcentaje de descuento por transferencia, para ajustar la política de pricing sin tocar código.
22. Como admin, quiero editar los datos bancarios que ve el cliente, para mantenerlos actualizados sin un deploy.
23. Como admin, quiero habilitar crédito a un cliente de confianza, para permitirle que su pedido avance sin pago previo.
24. Como admin, quiero editar precios de los productos, sabiendo que los pedidos ya confirmados conservan su precio snapshot.
25. Como admin, quiero editar la ventana de "Nuevo" (`producto_nuevo_dias`), para controlar cuánto tiempo un producto recién dado de alta luce el distintivo.
26. Como admin, quiero que las operaciones admin-only estén protegidas en la base de datos, no solo ocultas en la UI, para que un empleado no pueda ejecutarlas aunque manipule el frontend.

### Empleado/Admin — productos y stock
27. Como empleado, quiero administrar productos (alta, edición, categoría, precios mayoristas, foto, stock), para mantener el catálogo al día.
28. Como empleado, quiero ver el stock disponible (físico menos comprometido) de cada producto, para saber qué puedo vender sin demora.
29. Como empleado, quiero que el tag del catálogo (En stock / Consultar / Sin stock / Nuevo) se **derive automáticamente** de los datos reales del producto y que el panel me muestre **por qué** un producto cae en "Consultar" (ej. "Falta precio mayorista 1", "Falta foto"), para controlar la oferta cargando datos reales en vez de eligiendo un badge.
30. Como admin, quiero que el stock físico solo baje al despachar, para que el inventario refleje la realidad del depósito.

### Sistema
31. Como sistema, quiero confirmar pagos de Mercado Pago verificando el monto contra la API de MP y no contra el payload, para no aceptar pagos manipulados.
32. Como sistema, quiero procesar las notificaciones de MP de forma idempotente, para no duplicar pagos cuando MP reintenta.
33. Como sistema, quiero cancelar automáticamente los pedidos confirmados impagos a los 7 días con aviso a las 48 hs, para liberar precios congelados y stock comprometido.
34. Como sistema, quiero registrar cada transición en un log append-only, para preservar la trazabilidad que no se puede reconstruir después.

## Implementation Decisions

**Modelo de roles (ADR-008)**
- Tres roles: `cliente` (default, sin claim), `empleado`, `admin`. El rol vive en `app_metadata` del JWT (solo escribible con service role key). Ya no existe `profiles.role`.
- La guarda de `proxy.ts` debe aceptar `empleado` **y** `admin`. La distinción `empleado`/`admin` se enforza en RLS/funciones, no solo en la UI.
- Ninguna ruta del panel usa `service_role`: corre con el JWT del empleado y RLS aplica sola (ADR-004). `service_role` se confina al webhook de MP y a los jobs de sistema (server-only).

**Dos ejes de estado ortogonales (ADR-005)**
- `orders` tiene `status` (logístico: `pendiente → confirmado → en_preparacion → listo → despachado → entregado`, desvío `en_espera_stock`, `cancelado`) y `payment_status` (`pendiente → en_revision → pagado`; futuro `reembolsado`).
- Barrera cross-eje: `confirmado → en_preparacion` exige `payment_status = 'pagado'` salvo `credito_habilitado` en el perfil.
- Se elimina el estado `contactado`.

**`transition_order` como cuello único (ADR-006)**
- Función Postgres `SECURITY DEFINER`, firma `transition_order(p_order_id, p_axis, p_to, p_metadata)`. Único camino para mutar `status`/`payment_status`; se revoca el UPDATE directo de esas columnas a usuarios autenticados.
- En una transacción: deduce el rol del caller desde el JWT, valida contra la máquina de estados hardcodeada (cada transición declara su `min_role`), aplica barreras cross-eje, escribe `order_events` y hace el UPDATE.
- `pendiente → en_revision` es la única transición de pago permitida al cliente, solo sobre su propio pedido.
- El webhook y los jobs de sistema entran por una variante con actor explícito (corren con `service_role`, sin JWT de usuario).

**Modelo de precios (Good-Better-Best)**
- AFIN **no vende a retail**: `price_retail` queda como **referencia** (revendedor / compra por debajo del mínimo). La venta real es mayorista en tres escalones por cantidad: `price_wholesale_1` (venta normal sobre el mínimo), `price_wholesale_2` (mejor precio por más cantidad), `price_wholesale_3` (aún más). Presentación Good-Better-Best (efecto señuelo / Goldilocks).
- El catálogo muestra **solo los escalones cargados** (si un producto tiene solo `wholesale_1`, muestra uno).
- **Gate de venta:** sin `price_wholesale_1` el producto no es vendible (cae a "Consultar"; ver Tag de catálogo).
- Los **quiebres reales por cantidad** (que `_2`/`_3` bajen el unitario del total según lo pedido) son **Fase 3** (PRD-0003). En esta fase los tres escalones son **display** y el checkout cobra `price_wholesale_1`.

**Pricing y snapshot**
- Al confirmar, el servidor copia `unit_price` (= `price_wholesale_1`) desde `products` a `order_items` y calcula `discount_pct` y `total` en la misma transacción. El frontend nunca envía montos.
- Descuento por transferencia global y configurable (`transfer_discount_pct` en tabla `settings`, valor inicial 5%, editable solo por admin).
- El medio de pago puede cambiarse solo mientras `payment_status = 'pendiente'`, recalculando el total server-side; desde `en_revision` queda congelado.
- Pago web siempre por el total; pagos parciales solo en cuenta corriente (WhatsApp).

**Integración Mercado Pago**
- Checkout Pro con `external_reference = order_id`. MVP solo MP (Modo es extensión futura; `payment_method` es enum extensible).
- Webhook `/api/webhooks/mp` (público, server-only): valida la firma `x-signature` antes de procesar; **nunca** toma el monto del payload — consulta el pago a la API de MP y verifica `transaction_amount` contra el total del pedido y el `external_reference`; idempotente vía `provider_payment_id` único en `payments`; recién entonces transiciona `payment_status` como actor sistema.

**Transferencia**
- Checkout muestra total con descuento + datos bancarios desde `settings` (nunca hardcodeados).
- Cliente informa con comprobante **obligatorio** (bucket privado de Supabase Storage, RLS: visible solo para el dueño del pedido y empleados) → `en_revision` + notificación CallMeBot (patrón ya existente).
- Empleado corrobora contra el banco → acción protocolar "Registrar pago" crea fila en `payments` (fecha, monto, medio, quién corroboró) → `pagado`. "Rechazar informe" → vuelve a `pendiente` con nota; el reloj de expiración no se reinicia.

**Stock (ADR-007)**
- Stock físico solo baja al despachar. `comprometido` = suma de ítems en pedidos pagados no despachados, **derivado** (vista/query, nunca contador). `disponible = físico − comprometido` es lo que usa el catálogo.
- Un pedido impago no compromete stock; si al pagar no hay disponible, el pedido sigue adelante (no se bloquea el pago) y entra en `en_espera_stock` con aviso de demora.

**Tag de catálogo derivado (ADR-009)**
- Se **elimina el eje editorial manual `products.stock_status`**. El tag visible del catálogo pasa a ser 100% derivado del estado real; el empleado no elige badge, controla el catálogo cargando datos (precio, foto, stock).
- Eje de disponibilidad (primer match gana):
  - **En stock** — `disponible > 0` (o stock no rastreado) **y** `price_wholesale_1` cargado **y** portada (`image`) → botón "Agregar al pedido".
  - **Consultar** — hay stock pero falta `price_wholesale_1` o portada (dato incompleto) → botón WhatsApp con el producto precargado; el panel `/empleados` muestra el motivo del faltante.
  - **Sin stock** — `disponible = 0` y nada en camino.
  - **Próximamente** — `disponible = 0` + orden de compra/producción abierta. **Diferido a Fase 3** (PRD-0003): sin fuente de datos hoy; la regla se escribe pero queda dormida hasta que existan esas órdenes.
- Overlay **Nuevo** (ortogonal a la disponibilidad): `products.created_at` dentro de una ventana configurable por admin (`producto_nuevo_dias` en `settings`). Un producto puede ser "Nuevo" **y** "En stock" a la vez.
- La invariante "qué producto es vendible" vive en la vista pública `products_with_stock` (server-side, ADR-008), no en el frontend; `catalogBadge` queda como puro mapeo de presentación.

**Auditoría**
- Tabla `order_events` append-only escrita por `transition_order` en la misma transacción: `order_id`, `event_type`, `from`, `to`, `actor_id` (NULL si sistema), `actor_role`, `timestamp`, `metadata`. Provee el timeline del panel y la base de disputas.

**Expiración**
- Job de sistema: pedidos `confirmado` con `payment_status = 'pendiente'` se cancelan a los 7 días (transición de sistema), con aviso al cliente a las 48 hs previas.

**Esquema (resumen)**
- `orders`: agrega `payment_status`, `payment_method`, `discount_pct`, `total`, timestamps de hito.
- `products`: **elimina `stock_status`**; los precios mayoristas pasan a `price_wholesale_1/2/3` (con `price_retail` como referencia); agrega `created_at`.
- Nuevas tablas: `payments`, `order_events`, `settings` (incluye `transfer_discount_pct` y `producto_nuevo_dias`). `profiles` agrega `credito_habilitado`.
- Storage: bucket privado para comprobantes con RLS.

## Testing Decisions

Un buen test verifica **comportamiento externo observable**, no detalles de implementación: dado un input por la interfaz pública del módulo, se afirma sobre el output o el efecto observable, sin acoplarse a cómo está construido por dentro.

Tres capas:

**pgTAP (invariantes de DB)** — donde vive la seguridad real:
- `transition_order` rechaza transiciones inválidas y transiciones protocolares ejecutadas por un rol insuficiente.
- Un cliente no puede UPDATE directo de `status`/`payment_status` (revocado).
- Un cliente no puede leer/escribir pedidos ajenos (RLS por `app_metadata.role`).
- La barrera `confirmado → en_preparacion` se respeta salvo `credito_habilitado`.
- `order_events` se escribe en la misma transacción que cada transición.
- La vista `products_with_stock` deriva "En stock" solo con `disponible > 0` + `price_wholesale_1` + portada; degrada a "Consultar" si falta precio/foto.

**vitest (módulos puros)**:
- Pricing/snapshot: dado ítems + medio de pago + `transfer_discount_pct`, calcula el total correcto; el frontend no puede inyectar montos.
- Verificación de pago MP: dado un payment de MP y un pedido, acepta solo si firma válida + monto coincide + `external_reference` coincide; rechaza monto distinto; es idempotente ante el mismo `provider_payment_id`.
- Stock disponible: `disponible = físico − comprometido` para distintos estados de pedidos.
- `catalogBadge`: mapea cada combinación (disponible / precio / foto / antigüedad) al tag correcto, incluido el overlay "Nuevo".

**Playwright (flujos E2E)** — prior art: `tests/smoke.spec.ts` ya existe:
- Checkout con MP confirma el pedido tras el webhook.
- Transferencia: cliente informa con comprobante → empleado corrobora → pagado.
- Un cliente no puede acceder a `/empleados`; un admin sí.
- Un cliente no puede forzar el estado ni el precio de su pedido.

## Out of Scope

- **Modo** como medio de pago (extensión futura; el enum lo permite sin rediseño).
- **Venta anticipada con descuento** (feature futura, pendiente de definición de Andrés).
- **Cuenta corriente con Eduardo / Envío Flex** y la integración con Mercado Envíos.
- **Integración con Correo Argentino** (cotización por localidad/CP).
- **Facturación electrónica** (AFIP) — la transferencia da flexibilidad de facturación, pero la emisión no es parte de esta fase.
- **Pagos parciales en web** — siguen siendo solo de cuenta corriente WhatsApp.
- **Campanita de re-stock** y notificaciones de cambio de disponibilidad.
- **Máquina de estados configurable por tenant** — hoy hardcodeada en la función (ADR-006).
- **Diferido a Fase 3 (PRD-0003):** el tag **"Próximamente"** derivado de Órdenes de Compra/Producción, las **Órdenes de Compra y de Producción** como entidades, y los **quiebres reales de precio por cantidad** (`price_wholesale_2/3` afectando el total del checkout).

## Further Notes

- Hay tres huecos de seguridad ya identificados en el código actual (precio desde el frontend en la route de orders, auto-promoción de estado vía policy de UPDATE, y la guarda de `proxy.ts` que expulsa a los admin). Son tracer bullets ideales para abrir la implementación antes de construir el checkout encima.
- El proyecto está en Next.js 16: el middleware es `proxy.ts` (función exportada `proxy`, Node.js runtime). La CVE-2025-29927 es la razón por la que la frontera de seguridad es RLS y no el proxy.
- El glosario de dominio y los ADR-005 a 009 viven en la documentación de la organización afin (`documentation/arquitectura/CONTEXT.md` y `documentation/adr/`).
