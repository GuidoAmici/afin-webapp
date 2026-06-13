# Changelog

## [1.2.0](https://github.com/GuidoAmici/afin-website/compare/afin-website-v1.1.0...afin-website-v1.2.0) (2026-06-13)


### ✨ Novedades

* auth + route groups (Etapa 2 base) ([2630f22](https://github.com/GuidoAmici/afin-website/commit/2630f22f99ee362d6f5c808c34bc7fae9780d80b))
* **auth:** agregar toggle mostrar/ocultar contraseña en páginas de login y registro ([83c6992](https://github.com/GuidoAmici/afin-website/commit/83c6992bc1f1084b1f073e769ea1b80fccbfb7a7))
* carrito modal, auth modal, mi perfil y pedidos (Etapa 2) ([0dee955](https://github.com/GuidoAmici/afin-website/commit/0dee9557d3429e0c75e5719bf0b7f32e221dc54c))
* **db:** schema fundacional fase 2 — ejes de estado, order_events, payments, settings ([d19a29c](https://github.com/GuidoAmici/afin-website/commit/d19a29c551dd466d3406aeb5eb383b7b6548e78a))
* newsletter + rediseño /contacto y /blog (PRD-0001) ([e6dfbf7](https://github.com/GuidoAmici/afin-website/commit/e6dfbf748c42c781b4ecae63c2a7313d5d4df162))
* sistema de pedidos completo (Etapa 2) ([1664108](https://github.com/GuidoAmici/afin-website/commit/1664108ca7efbe673faa987ea667fc0166de6c18))


### 🐛 Correcciones

* agregar .dockerignore para evitar que COPY sobreescriba node_modules de Alpine ([2605808](https://github.com/GuidoAmici/afin-website/commit/2605808dd599a840d391b4dba30ad29e416953b1))
* botón 'Ver productos' en carrito vacío oculto en mobile ([e71a6e1](https://github.com/GuidoAmici/afin-website/commit/e71a6e18de684e26a6bc83cee3077e48e93383f4))
* **ci:** desvincular stg domain de git branch antes de vercel alias set ([5104b59](https://github.com/GuidoAmici/afin-website/commit/5104b593115e7b4175aad59633a94d7554f3525d))
* **ci:** eliminar migration repair hardcodeado del job de stg ([ae0a7fd](https://github.com/GuidoAmici/afin-website/commit/ae0a7fd692196901023efbd2a631e0b965cd636f))
* **ci:** quitar --yes de vercel alias set — no soportado en CLI v54 ([f36c9ea](https://github.com/GuidoAmici/afin-website/commit/f36c9ea9bf92256fa73a767058217a2320f2d551))
* **ci:** reemplazar vercel alias set por API POST /deployments/{id}/aliases ([486ecc5](https://github.com/GuidoAmici/afin-website/commit/486ecc5104840ce4311dfce422fd3bb5dfc13820))
* **ci:** reparar historial de migraciones Supabase stg antes de db push ([515e3c0](https://github.com/GuidoAmici/afin-website/commit/515e3c0f6ae29db26c3ebd8c68c5c5f9cac00951))
* **db:** alinear versión de migración fase 2 con el historial remoto ([965ecf3](https://github.com/GuidoAmici/afin-website/commit/965ecf392d633e1bf2227bb1ccc675744b0c6ed1))
* eliminar middleware.ts obsoleto — Next.js 16 requiere proxy.ts ([70ff543](https://github.com/GuidoAmici/afin-website/commit/70ff5432912790a31cd1368b49c3715398a99135))
* envolver LoginPage en Suspense para useSearchParams (Next.js 16) ([f4eb84b](https://github.com/GuidoAmici/afin-website/commit/f4eb84b2c495e412af72c358245054c58ea110e3))
* **lint:** reemplazar &lt;img&gt; con &lt;Image unoptimized&gt; en AccountButton ([6dc73e8](https://github.com/GuidoAmici/afin-website/commit/6dc73e8aefaf21c5605e67813463de2b73786456))
* **migrations:** hacer idempotentes con IF NOT EXISTS / DROP ... IF EXISTS ([508b277](https://github.com/GuidoAmici/afin-website/commit/508b2771cf7a1f38271511411506dedd0e5d1c29))
* **orders:** resolver precio server-side desde products, ignorar unitPrice del cliente ([6e03365](https://github.com/GuidoAmici/afin-website/commit/6e0336567064fc8d36e54b7a1c028937841569d6)), closes [#10](https://github.com/GuidoAmici/afin-website/issues/10)
* **orders:** resolver precio server-side, ignorar unitPrice del cliente ([9d2ca6c](https://github.com/GuidoAmici/afin-website/commit/9d2ca6cad90594a90e7980841d7a289d750c3bff))
* **security:** RLS status lock en orders + guarda proxy.ts acepta admin ([dbfb41f](https://github.com/GuidoAmici/afin-website/commit/dbfb41fdbd4e8bbd5759df06d9f017ffc036ca19)), closes [#11](https://github.com/GuidoAmici/afin-website/issues/11)
* **tests:** acotar locator newsletter a #main-content (strict mode) ([fd79a19](https://github.com/GuidoAmici/afin-website/commit/fd79a1956ca3be0c834723038c54e97dd89f799a))
* **tests:** actualizar smoke test de /contacto tras rediseño PRD-0001 ([1e7159e](https://github.com/GuidoAmici/afin-website/commit/1e7159eb98af79bdc75aeab79752ed85f2953b6e))
* **tests:** reemplazar test.todo() con comentarios — API no soportada en esta versión de Playwright ([8cb997e](https://github.com/GuidoAmici/afin-website/commit/8cb997efb6c8e937c20dbe35985698736abeb523))
* **tests:** test.todo → test.skip(true) + diagnóstico versión Playwright en CI ([436dd23](https://github.com/GuidoAmici/afin-website/commit/436dd2334cba1016dc652be93a562a04c2483836))


### ♻️ Refactors

* **frontend:** UI header/carrito/cuenta + estándar de espaciado de página ([b8a7a53](https://github.com/GuidoAmici/afin-website/commit/b8a7a5365f444952b3d466816e91d1a25496f6ad))


### 🔧 Mantenimiento

* agregar package-lock.json con Playwright 1.60.0 ([a69d43c](https://github.com/GuidoAmici/afin-website/commit/a69d43ca728964e041b040efaff30a8a6a4c07e3))
* auto-merge dev → stg ([007fcd6](https://github.com/GuidoAmici/afin-website/commit/007fcd6a61f2c9b110de07353498fdc586e46e79))
* auto-merge dev → stg ([9f9a83c](https://github.com/GuidoAmici/afin-website/commit/9f9a83c45e5d5aa28a18596fb64e11d57c770393))
* auto-merge dev → stg ([1c1178a](https://github.com/GuidoAmici/afin-website/commit/1c1178a7d7c013b456f2a10c3ce7e2ec542d921f))
* auto-merge dev → stg ([014104d](https://github.com/GuidoAmici/afin-website/commit/014104d21d472ae558d4a1b9f365113335340386))
* auto-merge dev → stg ([fd5a468](https://github.com/GuidoAmici/afin-website/commit/fd5a468a0381006aabad50cdadae0b9208777e24))
* auto-merge dev → stg ([5e5020d](https://github.com/GuidoAmici/afin-website/commit/5e5020dfaf9fa1e3845827c93a4dccec674235f6))
* auto-merge dev → stg ([a2c6d9e](https://github.com/GuidoAmici/afin-website/commit/a2c6d9ea98c4e3475ddc78babc0775d93b4a6a9b))
* auto-merge dev → stg ([b5aab8e](https://github.com/GuidoAmici/afin-website/commit/b5aab8ecf51399d791c3589f14728a733c181476))
* auto-merge dev → stg ([bcf8a23](https://github.com/GuidoAmici/afin-website/commit/bcf8a239523d77475a1adc851b828575fdcbb6eb))
* auto-merge dev → stg ([61cc35c](https://github.com/GuidoAmici/afin-website/commit/61cc35ceaf3bc12dfb1ce3b76a4e56c9e147a9b1))
* auto-merge dev → stg ([e3f8db8](https://github.com/GuidoAmici/afin-website/commit/e3f8db8e2eacfd65190cdeaf3d96ae9c68b83cef))
* auto-merge dev → stg ([88a2c8f](https://github.com/GuidoAmici/afin-website/commit/88a2c8faa00c0c5907882ec15cfe257c4c3b287b))
* auto-merge dev → stg ([efd5820](https://github.com/GuidoAmici/afin-website/commit/efd58205d4d460cd20b9a8e89be8b1864a39ea11))
* auto-merge dev → stg ([421d83a](https://github.com/GuidoAmici/afin-website/commit/421d83a4276197c0ccc56c3869765992e76b7fba))
* auto-merge dev → stg ([6145d8c](https://github.com/GuidoAmici/afin-website/commit/6145d8ca01da5939270f341730206d7ddd6fc2e1))
* auto-merge dev → stg ([fd8d1b1](https://github.com/GuidoAmici/afin-website/commit/fd8d1b1bfa6014af2ffd51d9ccacb92f3ad19bc0))
* auto-merge dev → stg ([3f06639](https://github.com/GuidoAmici/afin-website/commit/3f066390b0bfa47ad0bce7db2a628b8dc9143228))
* **deps:** actualizar @playwright/test a ^1.60.0 + restaurar test.todo() ([84f137c](https://github.com/GuidoAmici/afin-website/commit/84f137cf70a5ac22d68f5662664cd619d5439073))
* renombrar stg DB → test DB en dev-ci.yml ([90b35e0](https://github.com/GuidoAmici/afin-website/commit/90b35e007c08b937105240e89c857ccdfd379391))

## [1.1.0](https://github.com/GuidoAmici/afin-website/compare/afin-website-v1.0.0...afin-website-v1.1.0) (2026-06-08)


### ✨ Novedades

* agregar imagen real de productos al hero section ([9198e57](https://github.com/GuidoAmici/afin-website/commit/9198e573a2474b7df57957facbf02ddcf597ea1b))
* favicon + Open Graph preview para compartir en WhatsApp ([26d1cf1](https://github.com/GuidoAmici/afin-website/commit/26d1cf1f60125a5b19b0c456303f09665027691e))
* implement full website from design system ([118c171](https://github.com/GuidoAmici/afin-website/commit/118c171fb2396052988993b717af7c16e43df9ec))
* migrar a Next.js 15 + TypeScript + Tailwind CSS ([56eab39](https://github.com/GuidoAmici/afin-website/commit/56eab3923130ac9a843295aef78e1f536f5e42fe))
* migrar catálogo de productos a Supabase + CI con migraciones automáticas ([ba3aaee](https://github.com/GuidoAmici/afin-website/commit/ba3aaee8936d3edf94610367fcde494a2ba148fa))
* product card modal + image cover + real contact data ([897fa86](https://github.com/GuidoAmici/afin-website/commit/897fa8637bee17cf7c41f567c7726d04cc00d967))
* **productos:** catálogo completo con taxonomía 2 niveles y búsqueda ([6f59390](https://github.com/GuidoAmici/afin-website/commit/6f59390cc0a1f532832cb763b96e24abdd1d15b2))


### 🐛 Correcciones

* a11y, SEO y consistencia de nombre de empresa ([33ad79e](https://github.com/GuidoAmici/afin-website/commit/33ad79e3100c4b6989c3d4634927c8d4003d0c2a))
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
* product card images use 1:1 aspect ratio ([8372b3f](https://github.com/GuidoAmici/afin-website/commit/8372b3f6fe0c74608769c44781202f5ca07ad996))
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
* auto-merge dev → stg ([2311239](https://github.com/GuidoAmici/afin-website/commit/23112399bd88cf5caa97eddc7c19f36be25ab281))
* auto-merge dev → stg ([537ef39](https://github.com/GuidoAmici/afin-website/commit/537ef39cbbab7e7b91f7d24176279a592cd7970d))
* auto-merge dev → stg ([d8e25d2](https://github.com/GuidoAmici/afin-website/commit/d8e25d26aff82b56703d05865a063c63124f9b68))
* auto-merge dev → stg ([be9ff6f](https://github.com/GuidoAmici/afin-website/commit/be9ff6fcb013845b6d822de8f9e759e0bfa2a6f6))
* auto-merge dev → stg ([80cf826](https://github.com/GuidoAmici/afin-website/commit/80cf82607024c4c5033e6332f459637c11fb5886))
* auto-merge dev → stg ([be13c17](https://github.com/GuidoAmici/afin-website/commit/be13c17618ed4300dd61ab2ae2c030ae0c2e67fb))
* auto-merge dev → stg ([7a5933f](https://github.com/GuidoAmici/afin-website/commit/7a5933f6668230628464887058dda27b4a5fce94))
* auto-merge dev → stg ([fb0aed0](https://github.com/GuidoAmici/afin-website/commit/fb0aed08b14d2c8c60ac6d967cde42bc666eb0ec))
* auto-merge dev → stg ([22fa807](https://github.com/GuidoAmici/afin-website/commit/22fa807c1e7c03da15aa10ee226c3df4550d106f))
* auto-merge dev → stg ([43be5dd](https://github.com/GuidoAmici/afin-website/commit/43be5dd6295d8aff47188b6deb5ab3b446ed7c1a))
* auto-merge dev → stg ([e9cdeaf](https://github.com/GuidoAmici/afin-website/commit/e9cdeaf9435c21fcb4705b6f8e9b7f50f1565c52))
* auto-merge dev → stg ([edfd4af](https://github.com/GuidoAmici/afin-website/commit/edfd4afc04a9f8ed3dd5f7e5ae18bfc460b0d8ab))
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
* ignorar tsconfig.tsbuildinfo ([9249031](https://github.com/GuidoAmici/afin-website/commit/924903160967a2a1557ca9244711f444f5fc5d47))
* sync inicial stg → prod (bootstrap v1.0.0) ([544c962](https://github.com/GuidoAmici/afin-website/commit/544c9620bbcdd7ad37068c7fa2a25d877aba8056))
