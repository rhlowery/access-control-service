# [](https://github.com/rhlowery/access-control-service/compare/v1.0.0...v) (2026-04-13)


### Bug Fixes

* **10:** [DevOps] Synchronize Project Configuration & IDE Language Server ([72dc65f](https://github.com/rhlowery/access-control-service/commit/72dc65f17b7a1b699d171220f6a08c08ebd1426a)), closes [#10](https://github.com/rhlowery/access-control-service/issues/10)
* add TypeScript interfaces and strict typing across frontend services, components, and application state ([0e1489c](https://github.com/rhlowery/access-control-service/commit/0e1489c4630eedf38541017f099640fafdaf55b3))
* **ci:** add helm installation to release workflow for issue [#22](https://github.com/rhlowery/access-control-service/issues/22) ([#23](https://github.com/rhlowery/access-control-service/issues/23)) ([f79586a](https://github.com/rhlowery/access-control-service/commit/f79586a1ec5c06c08e39c01b36bc68f21d4ec4bc))
* **config:** update deprecated cors configuration key to resolve warnings for issue [#4](https://github.com/rhlowery/access-control-service/issues/4) ([#24](https://github.com/rhlowery/access-control-service/issues/24)) ([c4bb3b1](https://github.com/rhlowery/access-control-service/commit/c4bb3b1850d01c250bfa468c7d9777f1d4185840))
* **docs:** add frontend documentation and update project README with TypeScript transition details ([06c33cb](https://github.com/rhlowery/access-control-service/commit/06c33cb772cd8867b86c0fd57ef7d5940ae3a1e3))
* **ide:** synchronize language server parsing via explicit compiler properties ([eab657f](https://github.com/rhlowery/access-control-service/commit/eab657fe557d8b764b4c257215aafbf046e3ef0c))
* release failure - .releaserc.json ([#44](https://github.com/rhlowery/access-control-service/issues/44)) ([0580ae9](https://github.com/rhlowery/access-control-service/commit/0580ae99dc18402986575d326f022728693dc73d))
* release failure - do not override path ([#46](https://github.com/rhlowery/access-control-service/issues/46)) ([5c5a5b9](https://github.com/rhlowery/access-control-service/commit/5c5a5b9d6c51e609693f8865d06cfadbd9f8873d))
* release failure - skip helm dependency ([#45](https://github.com/rhlowery/access-control-service/issues/45)) ([8d45826](https://github.com/rhlowery/access-control-service/commit/8d45826a512a05e973a16a9f8e2aa98c7b75919b))
* release failure ([#28](https://github.com/rhlowery/access-control-service/issues/28)) ([7a110c6](https://github.com/rhlowery/access-control-service/commit/7a110c6e157e2601cabb32632c3d492d3ce2de7e))
* release failure ([#29](https://github.com/rhlowery/access-control-service/issues/29)) ([e01d985](https://github.com/rhlowery/access-control-service/commit/e01d9856580cd9120633685aeaab362b3ee91427))
* release failure ([#30](https://github.com/rhlowery/access-control-service/issues/30)) ([f038a85](https://github.com/rhlowery/access-control-service/commit/f038a85bbf4fe4c098966f41bdfcae54c1a9de76))
* release failure ([#31](https://github.com/rhlowery/access-control-service/issues/31)) ([5905bcd](https://github.com/rhlowery/access-control-service/commit/5905bcdc42a4c046312213e907460dde7ae8fb75))
* release failure ([#32](https://github.com/rhlowery/access-control-service/issues/32)) ([39a2b86](https://github.com/rhlowery/access-control-service/commit/39a2b86ef0bad34050542b50cbad52b99c884c91))
* release failure ([#33](https://github.com/rhlowery/access-control-service/issues/33)) ([b8e6dd6](https://github.com/rhlowery/access-control-service/commit/b8e6dd66a2a2fa91036325ec0b86cbfacaf5bb38))
* release failure ([#34](https://github.com/rhlowery/access-control-service/issues/34)) ([a6f594a](https://github.com/rhlowery/access-control-service/commit/a6f594ae42404a316809deadc1b72623ff119f82))
* release failure ([#35](https://github.com/rhlowery/access-control-service/issues/35)) ([f60ff72](https://github.com/rhlowery/access-control-service/commit/f60ff72e9a7f31efc3d030b2c2eabaa03bf2daad))
* release failure ([#37](https://github.com/rhlowery/access-control-service/issues/37)) ([b0135ae](https://github.com/rhlowery/access-control-service/commit/b0135aee255fdd640c05ba456991fa54fc1f1ab1))
* release failure ([#38](https://github.com/rhlowery/access-control-service/issues/38)) ([831abf8](https://github.com/rhlowery/access-control-service/commit/831abf8709980f12808214d57597c70fe6a0d84f))
* release failure ([#40](https://github.com/rhlowery/access-control-service/issues/40)) ([85c6d5a](https://github.com/rhlowery/access-control-service/commit/85c6d5a02883d89e479cef8acfafeb39ec9b9737))
* release failure ([#41](https://github.com/rhlowery/access-control-service/issues/41)) ([d7cc6ce](https://github.com/rhlowery/access-control-service/commit/d7cc6cedb218af75c1a56c7bae235341827eecb5))
* release failure ([#42](https://github.com/rhlowery/access-control-service/issues/42)) ([54800aa](https://github.com/rhlowery/access-control-service/commit/54800aa2a4387994506bc821c7dc410d8798f3de))
* release failure ([#48](https://github.com/rhlowery/access-control-service/issues/48)) ([6ffe91b](https://github.com/rhlowery/access-control-service/commit/6ffe91bc92f7518287e3eddfce4e016e5e05d47d))
* release failures - path issue ([#43](https://github.com/rhlowery/access-control-service/issues/43)) ([8465a7c](https://github.com/rhlowery/access-control-service/commit/8465a7c7142e0c002690f879b29a2c3daf5b1b34))
* **release:** making sure helm is in the path during the release build ([#25](https://github.com/rhlowery/access-control-service/issues/25)) ([39ea7e4](https://github.com/rhlowery/access-control-service/commit/39ea7e4e1658008d6e8f76df0c8089d64969df49))


### Features

* setup semantic versioning, conventional commits and repository governance ([#20](https://github.com/rhlowery/access-control-service/issues/20)) ([51614e0](https://github.com/rhlowery/access-control-service/commit/51614e05710c437b1b2533cd9e8d73a0611a4dee))
# 1.0.0 (2026-04-02)


### Bug Fixes

* chart ([5f6e112](https://github.com/rhlowery/access-control-service/commit/5f6e11248046fcff6c33bf2507cb78beba2c3e7d))
* **chart:** Helm Chart work ([e2f715a](https://github.com/rhlowery/access-control-service/commit/e2f715a488701bf9991ce36e14759fa8b5bcb4c2))
* clean ([23e891a](https://github.com/rhlowery/access-control-service/commit/23e891a712d91748202ce5085c3f0625bee899df))
* gitignore ([41fa334](https://github.com/rhlowery/access-control-service/commit/41fa3349a92b6564ac11f7a725292b04cb72f8f0))
* gitignore ([6653547](https://github.com/rhlowery/access-control-service/commit/6653547f3cd52d6c806a50cd1160d066a14fcaa2))
* resolve multi-component docker build failure and reorder site publication ([d20f68c](https://github.com/rhlowery/access-control-service/commit/d20f68c07cd95f1f8a7e3d6dc73fff277987f611))


### Features

* Add and update Helm chart dependencies, including MinIO, configure their values, and update the Maven build for Helm dependency management. ([fbd6a74](https://github.com/rhlowery/access-control-service/commit/fbd6a74a09667913b232dd9b29a5add99fa99644))
* add conventional commits and semantic versioning support ([ce138b3](https://github.com/rhlowery/access-control-service/commit/ce138b329ba447069e550d1e959158dd9bce7707))
* add project documentation sites and implement Helm chart template testing with Cucumber ([00e8507](https://github.com/rhlowery/access-control-service/commit/00e85071cf546ebdbbc1a6f39d4b5e93ce84b9e8))
* implement AuthService and ThemeContext with supporting configuration files ([f0e5cae](https://github.com/rhlowery/access-control-service/commit/f0e5cae7747be4eac1c9602920c4174ea5b10ad9))
* implement CatalogProvider service and add audit approval feature tests ([3cc8cc1](https://github.com/rhlowery/access-control-service/commit/3cc8cc134f07af480cc5beaaaf0ce58fec818a97))
* Implement CloudNativePG for PostgreSQL, add Keycloak setup, Minio patching, Cert-Manager issuers, and Unity Catalog OIDC secret while removing the old PostgreSQL chart. ([dbb0a94](https://github.com/rhlowery/access-control-service/commit/dbb0a9488d2bfa64ed8fada6ef768d1b570c1783))
* integrate Allure reporting tools and update backend DTOs and resource logic ([4b45fa2](https://github.com/rhlowery/access-control-service/commit/4b45fa22f59d492529a9ef18046d54a0408af7ad))
* integrate Allure reporting tools and update backend DTOs and resource logic ([c1a86f4](https://github.com/rhlowery/access-control-service/commit/c1a86f42cb79c0eca8e9f1fee5f7a977f7e1afb0))
* Set up initial Maven project with wrapper and Helm chart for deployment. ([e47807f](https://github.com/rhlowery/access-control-service/commit/e47807f06281b3a710ad3e14d77329551aff72db))
* Upgrade Helm chart dependencies, add Prometheus and OpenTelemetry, and refine service configurations. ([97d359c](https://github.com/rhlowery/access-control-service/commit/97d359c0a324315940ff6ee3f9294a17de9f36d4))
