# PRD-0003: Fase 3 — Órdenes de Compra/Producción, tag "Próximamente" y pricing por cantidad

**Fecha:** 2026-06-22
**Estado:** Borrador
**Fase:** 3
**Issue de tracking:** _(pendiente de crear)_

## Problem Statement

La Fase 2 (PRD-0002, issue #9) dejó el catálogo con tags derivados del estado real (ADR-009) y un modelo de precios Good-Better-Best (`price_wholesale_1/2/3`), pero tres piezas quedaron deliberadamente fuera de alcance por depender de entidades que aún no existen o de lógica de pricing más profunda:

1. El tag **"Próximamente"** necesita saber que un producto está *encargado o en producción*, hecho que hoy no vive en ninguna tabla. Su regla quedó escrita pero **dormida** por falta de datos.
2. AFIN repone stock de dos formas (compra a proveedor / producción propia) que el sistema no modela — se gestionan a mano, fuera del sistema.
3. Los tres escalones mayoristas se **muestran** pero no operan: el checkout cobra siempre `price_wholesale_1`, sin quiebres reales por cantidad.

## Solution

Modelar las **Órdenes de Compra** y **Órdenes de Producción** como entidades de primera clase (independientes del Pedido; ver glosario), derivar de ellas el tag **"Próximamente"** que la Fase 2 dejó dormido, y activar los **quiebres reales de precio por cantidad** sobre el modelo Good-Better-Best ya cargado.

## User Stories

### Reposición — Órdenes de Compra / Producción
1. Como empleado, quiero registrar una Orden de Compra a un proveedor (qué producto, cantidad, fecha estimada), para dejar constancia de la reposición en camino.
2. Como empleado, quiero registrar una Orden de Producción (qué producto, cantidad, estado), para reflejar lo que se está fabricando.
3. Como sistema, quiero sumar stock físico al **recibir** una Orden de Compra o **completar** una Orden de Producción, para que el inventario refleje la realidad sin carga manual paralela.

### Catálogo — tag "Próximamente"
4. Como cliente, quiero ver "Próximamente" en un producto sin stock pero con reposición en camino, para saber que vuelve y no que desapareció.
5. Como sistema, quiero derivar el tag "Próximamente" (`disponible = 0` + orden de compra/producción abierta que lo repone) automáticamente, sin que nadie marque un badge.

### Pricing — quiebres por cantidad
6. Como cliente, quiero que comprar más cantidad baje el precio unitario de mi pedido según los escalones (`price_wholesale_1/2/3`), para aprovechar el descuento por volumen.
7. Como admin, quiero definir los umbrales de cantidad de cada escalón, para ajustar la política de volumen sin tocar código.
8. Como sistema, quiero que el checkout snapshotee el escalón correcto según la cantidad pedida, manteniendo el modelo de snapshot server-side (el frontend nunca elige el precio).

## Implementation Decisions

**Tag "Próximamente" (ADR-009, activación)**
- La regla ya está escrita en Fase 2 pero dormida por falta de datos. Aquí se enciende: `disponible = 0` y existe una Orden de Compra/Producción **abierta** que repone el producto → "Próximamente".
- 100% derivado, sin flag manual: la fuente es la existencia de la orden.

**Órdenes de Compra y de Producción**
- Entidades independientes del Pedido (glosario). La Orden de Compra suma stock al **recibirse**; la Orden de Producción suma stock al **completarse**.
- Doctrina ADR-007 intacta: el stock físico solo se mueve por hechos reales (despacho lo baja; recepción/producción lo suben).

**Quiebres reales de precio por cantidad**
- Umbrales de cantidad por escalón (¿por producto? ¿globales? — a definir en triage/grill).
- El checkout elige el escalón según la cantidad y snapshotea ese unitario, sin romper el invariante de snapshot server-side del PRD-0002.

## Out of Scope

- Lo ya cubierto por el PRD-0002 (checkout, panel de operaciones, tags En stock / Consultar / Sin stock / Nuevo, display de los tres escalones).
- Integración con proveedores / compras automáticas.

## Referencias

- Glosario de dominio y decisiones: `documentation/arquitectura/CONTEXT.md`, `documentation/adr/009-tag-catalogo-derivado.md`.
- PRD Fase 2: PRD-0002 / issue #9.
