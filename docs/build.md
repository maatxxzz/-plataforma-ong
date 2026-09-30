# Build de produção e minificação

A partir desta etapa, a SPA possui pipeline de build. Documentos anteriores que descrevem ausência de build refletem a situação histórica.

## Configuração

Vite 7.3.6 processa index.html, agrupa os ES Modules e minifica JS/CSS com esbuild. `vite.config.js` define `base: './'`, saída em `dist/` e ausência de source maps de produção. Recursos locais recebem nomes com hash. Chart.js e fontes continuam externos e não entram nas medições.

`npm run build` executa Vite e depois `scripts/minificar-html.mjs`, com html-minifier-terser 7.2.0. O HTML tem comentários removidos e espaços reduzidos com `conservativeCollapse`; tags opcionais e aspas dos atributos são preservadas. Os templates, IDs e atributos ARIA continuam presentes. O processo só altera a saída de produção.

## Comandos

- `npm ci`: instala versões do lockfile. Se o cache padrão estiver indisponível, use `npm ci --cache /tmp/semear-npm-cache`.
- `npm run dev`: desenvolvimento com Vite.
- `npm run build`: gera dist.
- `npm run preview`: serve a build para validação local; não é servidor de produção.
- `SPA_BASE_URL=http://127.0.0.1:4173 npm test`: testes SPA contra a build.
- `SPA_BASE_URL=http://127.0.0.1:4173 npm run test:contraste`: testes visuais contra a build.

Playwright e Chromium são pré-requisitos de teste descritos em tests/README.md. Publique apenas dist no serviço de hospedagem estática escolhido. node_modules e dist estão ignorados no Git.

## Medição

Comparação dos bytes UTF-8 em disco, sem gzip: fonte index.html, css/style.css e todos os js/*.js versus HTML e bundles CSS/JS em dist. A redução inclui empacotamento e otimização, não apenas retirada de espaços. Imagens, dependências de desenvolvimento e recursos CDN não entram no cálculo.

| Grupo | Fonte (bytes) | Produção (bytes) | Redução |
|---|---:|---:|---:|
| HTML | 13.407 | 11.580 | 13,63% |
| CSS | 15.570 | 13.379 | 14,07% |
| JS | 25.877 | 14.566 | 43,71% |
| Total | 54.854 | 39.525 | 27,95% |

## Validação

Os 11 cenários SPA e os testes de contraste passaram usando o preview de dist. Foram verificados templates, rotas, eventos delegados, localStorage, modal, nomes acessíveis, foco e alternância de contraste. A suíte bloqueia CDNs propositalmente e não valida a renderização real do Chart.js. Não houve falha funcional atribuída à minificação.
