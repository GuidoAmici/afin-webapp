# Feature flags por variable de entorno, con la puerta real en el servidor

El flujo de deploy es `dev → stg → Release Please → prod` (ver ADR-0004): todo lo que entra a `dev` llega a `stg` y eventualmente se agrupa en un release a producción. Eso significa que una feature a medio terminar no tiene forma de quedarse fuera de producción salvo no mergearla, lo que empuja a ramas largas. Además, el checkout de Mercado Pago todavía no tiene credenciales de producción (#25) y el canal de pedidos necesita poder apagarse si algo sale mal, sin revertir un release.

Se decidió introducir flags de release en `lib/flags.ts`, alimentados por variables de entorno `NEXT_PUBLIC_FF_*` configuradas por entorno en Vercel. `lib/flags.ts` es el único lugar que lee esas variables: expone un objeto `flags` tipado y un parser (`parseFlag`) que acepta `1/true/on` y `0/false/off`, y cae al default del código ante un valor vacío o desconocido en vez de adivinar.

Los dos primeros flags son `pedidos` (carrito, "Agregar al pedido", `POST /api/orders`, `/cuenta/pedidos`) con default `on`, y `checkoutMp` (botón de pago y `POST /api/checkout/mp`) con default `off`.

**La invariante central: un flag `NEXT_PUBLIC_*` viaja al browser y solo decide qué se renderiza — no es un control de acceso.** Toda feature que toque datos o dinero se cierra además en la route handler del servidor, que devuelve 404 cuando el flag está apagado. Ocultar el botón sin cerrar el endpoint no es apagar la feature.

## Considered Options

**Flags en la tabla `settings`:** se descartó *para estos dos flags*. `settings` ya existe y es el lugar correcto para perillas que Andrés mueve en caliente (descuento por transferencia, datos bancarios), pero un flag de release lo mueve quien deploya, no quien opera, y meterlo en la base agrega una consulta en el camino crítico del render y un estado que difiere entre stg y prod sin quedar registrado en git. Un kill switch operativo de pago —que sí hay que poder apagar sin redeploy— pertenece a `settings`, y queda como trabajo pendiente.

**Vercel Edge Config / un servicio de flags:** se descartó por peso: dos flags no justifican una dependencia externa ni un proveedor más en el camino del request.

**Apagar la feature quitando la variable de entorno del proveedor (ej. borrar `MERCADOPAGO_ACCESS_TOKEN`):** se descartó porque falla como error 500 en vez de como feature ausente, y deja la UI ofreciendo un botón que revienta.

## Consequences

- Cambiar un flag exige redeploy del entorno: las `NEXT_PUBLIC_*` se inlinean en el build. Es aceptable para un flag de release y es exactamente lo que lo hace inadecuado como kill switch de emergencia.
- El webhook `/api/webhooks/mp` **no** está detrás de `checkoutMp`, a propósito: si se apaga el checkout con pagos en vuelo, esos pagos igual tienen que poder confirmarse. La ruta ya está protegida por firma HMAC y es idempotente.
- El panel `/empleados` tampoco está detrás de `pedidos`: AFIN sigue recibiendo pedidos por WhatsApp y cargándolos a mano, así que la cola operativa tiene que existir aunque el canal público esté apagado.
- Con `pedidos` apagado, el catálogo sigue vivo y la CTA de producto cae a WhatsApp — la degradación es al canal que la fábrica usaba antes del carrito, no a una pantalla rota.
- Los flags se acumulan si nadie los saca. Un flag de release tiene fecha de vencimiento: cuando la feature está estable en producción, se borra el flag y el código muerto.
