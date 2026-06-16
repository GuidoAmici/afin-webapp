# Roadmap — PRD #9 (Fase 2: checkout MP + transferencia + panel /empleados)

Generado: 2026-06-15

```mermaid
flowchart TB
  classDef done fill:#16a34a,color:#fff,stroke:#14532d
  classDef ready fill:#facc15,color:#000,stroke:#a16207
  classDef blocked fill:#e5e7eb,color:#111,stroke:#9ca3af
  classDef followup fill:#bfdbfe,color:#111,stroke:#2563eb

  subgraph NUCLEO["Núcleo de datos y pago"]
    I10["#10 precio server-side ✅"]:::done
    I11["#11 revocar UPDATE + proxy admin ✅"]:::done
    I12["#12 schema fundacional ✅"]:::done
    I13["#13 transition_order ✅"]:::done
    I14["#14 checkout Mercado Pago ✅"]:::done
  end

  subgraph FEATURES["Features de fase 2"]
    I15["#15 pago transferencia 🟢 listo"]:::ready
    I16["#16 stock derivado 🟢 listo"]:::ready
    I17["#17 panel pedidos 🟢 listo"]:::ready
    I18["#18 panel catálogo/precios 🟡 bloqueado"]:::blocked
    I19["#19 job expiración impagos 🟢 listo"]:::ready
  end

  subgraph FOLLOWUPS["Follow-ups (triage)"]
    I22["#22 seguridad INSERT estado"]:::followup
    I23["#23 endurecer funciones legacy"]:::followup
    I24["#24 cargar precios (Andrés)"]:::followup
    I25["#25 producción MP (release)"]:::followup
    I26["#26 test integración webhook"]:::followup
  end

  I12 --> I13 --> I14
  I13 --> I15
  I12 --> I16
  I13 --> I17
  I16 --> I18
  I13 --> I19

  I10 -.origen.-> I24
  I14 -.origen.-> I25
  I14 -.origen.-> I26
  I12 -.origen.-> I22
  I13 -.origen.-> I23
```

## Estado

| # | Issue | Estado | Depende de |
|---|-------|--------|------------|
| #10 | Precio server-side | ✅ cerrado | — |
| #11 | Revocar UPDATE + guarda proxy admin | ✅ cerrado | — |
| #12 | Schema fundacional fase 2 | ✅ cerrado | — |
| #13 | `transition_order` | ✅ cerrado | #12 |
| #14 | Checkout Mercado Pago | ✅ cerrado | #13 |
| #15 | Pago por transferencia | 🟢 listo | #13 ✅ |
| #16 | Stock disponible derivado | 🟢 listo | #12 ✅ |
| #17 | Panel /empleados: pedidos | 🟢 listo | #13 ✅ |
| #18 | Panel /empleados: catálogo/precios/stock | 🟡 bloqueado | #16 |
| #19 | Job de expiración de impagos | 🟢 listo | #13 ✅ |
| #22 | Seguridad: estado inicial en INSERT | ⬜ triage | — |
| #23 | Endurecer funciones legacy | ⬜ triage | — |
| #24 | Cargar precios validados (Andrés) | ⬜ triage | — |
| #25 | Producción MP (antes del release) | ⬜ triage | bloqueante release |
| #26 | Test de integración del webhook | ⬜ ready-for-agent | — |

Leyenda: ✅ cerrado · 🟢 abierto y desbloqueado · 🟡 abierto y bloqueado · ⬜ follow-up.
