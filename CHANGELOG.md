# Changelog

## [1.1.0](https://github.com/GuidoAmici/afin-website/compare/afin-website-v1.0.0...afin-website-v1.1.0) (2026-06-05)


### ✨ Novedades

* agregar imagen real de productos al hero section ([9198e57](https://github.com/GuidoAmici/afin-website/commit/9198e573a2474b7df57957facbf02ddcf597ea1b))
* favicon + Open Graph preview para compartir en WhatsApp ([26d1cf1](https://github.com/GuidoAmici/afin-website/commit/26d1cf1f60125a5b19b0c456303f09665027691e))
* implement full website from design system ([118c171](https://github.com/GuidoAmici/afin-website/commit/118c171fb2396052988993b717af7c16e43df9ec))
* migrar a Next.js 15 + TypeScript + Tailwind CSS ([56eab39](https://github.com/GuidoAmici/afin-website/commit/56eab3923130ac9a843295aef78e1f536f5e42fe))
* product card modal + image cover + real contact data ([897fa86](https://github.com/GuidoAmici/afin-website/commit/897fa8637bee17cf7c41f567c7726d04cc00d967))


### 🐛 Correcciones

* acotar selector de Playwright al sidebar para evitar ambigüedad ([1c7631c](https://github.com/GuidoAmici/afin-website/commit/1c7631c84b39cadf01316a147f155880b704f6fc))
* actualizar Next.js 15.3.3 → 16.2.7 (vulnerabilidad detectada por Vercel) ([05dc548](https://github.com/GuidoAmici/afin-website/commit/05dc548fe2920e569d7c5077cf6e2a3009cade51))
* agregar eslint.config.mjs para next lint en CI ([40b8f34](https://github.com/GuidoAmici/afin-website/commit/40b8f3426ac455ae5852db8945e388f0b95eb308))
* checkout stg explícito en deploy-stg.yml ([c8cc70b](https://github.com/GuidoAmici/afin-website/commit/c8cc70bfc2f4d36ae31d0cb8b152124235a95de1))
* corregir errores de lint react-hooks/set-state-in-effect ([a6be537](https://github.com/GuidoAmici/afin-website/commit/a6be53779e94f2e58dbdad5dcb8991d7d86c881f))
* eliminar opengraph-image dinámico, usar og-image.jpg estático ([4f7662d](https://github.com/GuidoAmici/afin-website/commit/4f7662d2652e6a87bdb5671a92540e461741a961))
* evitar doble deploy en Vercel al mergear a stg ([cb95f7e](https://github.com/GuidoAmici/afin-website/commit/cb95f7e41b7024157b1655d573a73ecd53595f26))
* evitar que el botón WhatsApp tape el pie del footer ([967d307](https://github.com/GuidoAmici/afin-website/commit/967d307d8fed718d398046e2ea29289de8322149))
* mostrar imagen del hero en recuadro sin fade ([806e600](https://github.com/GuidoAmici/afin-website/commit/806e600bc3427bb4d458d53f7a2e67ce744dcfc2))
* mover release-please a dev-ci.yml para evitar limitación de GITHUB_TOKEN ([3642f0a](https://github.com/GuidoAmici/afin-website/commit/3642f0a487a119dd1d33a74bf0641f81db35527f))
* Next.js 16 — lint script + eslint flat config + ThemeToggle ([41e08c2](https://github.com/GuidoAmici/afin-website/commit/41e08c250f2c7574a9e05bca4b5bfce67d6cbe8a))
* og:image apuntaba al dominio incorrecto en staging ([92651a8](https://github.com/GuidoAmici/afin-website/commit/92651a86427e0afa7c2024754aeb8f3a7e5e3ab5))
* sincronizar package-lock.json con eslint-config-next@16 ([5201061](https://github.com/GuidoAmici/afin-website/commit/5201061b8e0e700a198f1e1aea5a512ad415f4d9))
* suavizar el fade de la imagen del hero ([4e55fbe](https://github.com/GuidoAmici/afin-website/commit/4e55fbe4a31ea94eeac48a5316081d3e037b45f7))
* triggerear deploy-stg via repository_dispatch, sin PAT ([01bf314](https://github.com/GuidoAmici/afin-website/commit/01bf314aa6a4a78ba39e92fbe14afd2e5ae7b0c5))
* usar GH_PAT en merge-to-stg para triggerear deploy-stg.yml ([2ed978a](https://github.com/GuidoAmici/afin-website/commit/2ed978a283d6a6182db7b421db7cbaa7a0e1faa5))


### ⚡ Rendimiento

* agregar caché de node_modules, Next.js y Playwright al CI ([b03df85](https://github.com/GuidoAmici/afin-website/commit/b03df8507dfc09d13660b855155242c32b568347))


### ♻️ Refactors

* consolidar deploy-stg en dev-ci.yml ([b070655](https://github.com/GuidoAmici/afin-website/commit/b07065586c358e94f0ea3a44edf091b47a244e9c))


### 🔧 Mantenimiento

* agregar package-lock.json ([647cd87](https://github.com/GuidoAmici/afin-website/commit/647cd87dcbacab2865cf0a8b1773c71b1c66d4ed))
* auto-merge dev → stg ([1185c6b](https://github.com/GuidoAmici/afin-website/commit/1185c6b28a4b40aa08887ad4751b5c886988948a))
* auto-merge dev → stg ([dc04105](https://github.com/GuidoAmici/afin-website/commit/dc0410527294219dd8b43d109d8b60f4a3f28601))
* auto-merge dev → stg ([5408bbd](https://github.com/GuidoAmici/afin-website/commit/5408bbd2f77225b999de29a0bc5396a4045cdc4a))
* auto-merge dev → stg ([16b45dc](https://github.com/GuidoAmici/afin-website/commit/16b45dcac34fe8d0db0da2cdb728f5dc571f793f))
* auto-merge dev → stg ([991c337](https://github.com/GuidoAmici/afin-website/commit/991c33700648b6185fb1357049402a662b668dad))
* auto-merge dev → stg ([7ecc135](https://github.com/GuidoAmici/afin-website/commit/7ecc1356dc460755378da2ed75975b73afb50c21))
* auto-merge dev → stg [skip ci] ([958a1b0](https://github.com/GuidoAmici/afin-website/commit/958a1b02e89251f1342a2f42693f80b038ff2b12))
* auto-merge dev → stg [skip ci] ([70a06ae](https://github.com/GuidoAmici/afin-website/commit/70a06aecaacf79c85b14b9f846b2a223f1c18f8a))
* auto-merge dev → stg [skip ci] ([541e7bf](https://github.com/GuidoAmici/afin-website/commit/541e7bf9b118ae214760e4c3d618ba9c7e4c18d0))
* auto-merge dev → stg [skip ci] ([d978bf8](https://github.com/GuidoAmici/afin-website/commit/d978bf88d32a7df0cc2d5edb3614796ce6a49f01))
* auto-merge dev → stg [skip ci] ([931255f](https://github.com/GuidoAmici/afin-website/commit/931255f3b9c9cd37a039fbd27155c1d3175246bf))
* auto-merge dev → stg [skip ci] ([67ac624](https://github.com/GuidoAmici/afin-website/commit/67ac6247dc7bf0df78ded5fb695b2ba0a66f624f))
* auto-merge dev → stg [skip ci] ([8487157](https://github.com/GuidoAmici/afin-website/commit/84871573890c871c5a5c1c6473da67696806bf55))
* auto-merge dev → stg [skip ci] ([8b0a77e](https://github.com/GuidoAmici/afin-website/commit/8b0a77ed8267da2bf8da2e70de132154075c949f))
* auto-merge dev → stg [skip ci] ([4cb72a4](https://github.com/GuidoAmici/afin-website/commit/4cb72a48a1a4ce021aefad5ebab263b3b190d47c))
* auto-merge dev → stg [skip ci] ([7ef0ac4](https://github.com/GuidoAmici/afin-website/commit/7ef0ac4ce0b8204536cbbc4f47949566862a474e))
* auto-merge dev → stg [skip ci] ([c527249](https://github.com/GuidoAmici/afin-website/commit/c52724987562861e11d70cb4b62aa7ae12b857a0))
* bootstrap Release Please config en prod ([fc6209c](https://github.com/GuidoAmici/afin-website/commit/fc6209c1b98fd30cce8a4ef4450fd24a08fc1c42))
* configurar Release Please para semver automático ([9064cae](https://github.com/GuidoAmici/afin-website/commit/9064cae33d6c22339445d8eba28a86655e63bcfb))
* sync inicial stg → prod (bootstrap v1.0.0) ([544c962](https://github.com/GuidoAmici/afin-website/commit/544c9620bbcdd7ad37068c7fa2a25d877aba8056))
