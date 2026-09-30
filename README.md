# Instituto Semear — Plataforma ONG

## Apresentação

Projeto acadêmico de uma Single Page Application (SPA) para uma ONG fictícia. Apresenta a instituição, projetos e campanhas, além de demonstrar cadastros de voluntários e doadores. A navegação troca templates no DOM sem recarregar o documento.

## Funcionalidades

- Rotas por hash: `#/inicio`, `#/sobre`, `#/projetos` e `#/cadastro`.
- Cards gerados a partir de dados JavaScript e templates HTML.
- Formulários com máscaras de CPF, CEP e telefone, validação e feedback acessível.
- Confirmação de doação mensal em modal e notificações temporárias.
- Histórico no localStorage, limitado a 20 registros, com leitura de dados malformados e tratamento de falhas de gravação.
- Gráfico de atendimentos com Chart.js e mensagem alternativa quando a biblioteca está indisponível.

## Tecnologias

HTML5 (`template`, formulários e elementos semânticos), CSS3 (Grid, media queries e variáveis), JavaScript com ES Modules (`import`/`export`), APIs DOM e Web Storage. Chart.js é carregado por CDN; as fontes Bitter e Source Sans 3 são fornecidas pelo Google Fonts. Python 3 serve os arquivos localmente. Node.js, Playwright e Chromium são utilizados nos testes.

## Estrutura e modularização

```text
index.html                  Templates e ponto de entrada
css/style.css               Estilos responsivos
imagens/                    Recursos visuais
js/scripts.js               Inicialização e coordenação dos módulos
js/roteador.js              Navegação por hash
js/componentes.js           Cards dinâmicos
js/validacao.js              Máscaras e regras dos campos
js/formularios.js            Fluxo dos cadastros
js/armazenamento.js          Leitura e escrita no localStorage
js/historico.js              Apresentação dos registros
js/feedback.js               Modal e toast
js/grafico.js                Integração com Chart.js
js/dom.js                    Criação reutilizável de elementos
tests/spa.cjs               Testes de navegador
docs/                      Documentação complementar
```

Os módulos expõem funções específicas e trocam dados por parâmetros e callbacks. O armazenamento não manipula os formulários. A navegação emite um evento antes da troca de conteúdo para cancelar confirmações pendentes. Não há dependências circulares entre os módulos.

## Pré-requisitos

Para executar o site: Git, Python 3 e navegador moderno com suporte a ES Modules e localStorage. Node.js 22.12 ou superior e npm são necessários para a build com Vite. O código-fonte ainda pode ser servido diretamente por Python. Para testes: Node.js, Playwright e Chromium. Os testes foram executados com Node.js 24 e Python 3.12. As ferramentas de build possuem versões fixadas no package-lock.json.

## Instalação e execução local

```sh
git clone https://github.com/maatxxzz/-plataforma-ong.git plataforma-ong
cd plataforma-ong
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, se necessário, use `py -3 -m http.server 8000 --bind 127.0.0.1`. Abra `http://127.0.0.1:8000` no navegador local e encerre o servidor com Ctrl+C. Se a porta estiver ocupada, escolha outra, por exemplo 8001.

Não abra diretamente por `file://`: os módulos JavaScript precisam ser servidos por HTTP. Para desenvolvimento com Vite, execute `npm ci` e `npm run dev`. Para produção, execute `npm run build` e publique o conteúdo de `dist/`. Chart.js e fontes são obtidos durante o carregamento, de `cdnjs.cloudflare.com`, `fonts.googleapis.com` e `fonts.gstatic.com`. O funcionamento local tem fallback para recursos externos indisponíveis.

## Build e testes

A build usa Vite para empacotar e minificar JavaScript e CSS, seguida de html-minifier-terser para HTML. Execute `npm ci`, `npm run build` e `npm run preview`. Para testar essa build, execute `SPA_BASE_URL=http://127.0.0.1:4173 npm test` e `SPA_BASE_URL=http://127.0.0.1:4173 npm run test:contraste`. Playwright está incluído nas dependências de desenvolvimento; Chromium deve ser instalado para os testes. Consulte [medição da build](docs/build.md).

Para instalar o navegador de teste:

```sh
npm ci
npx playwright install chromium
```

O runner usa `/usr/bin/chromium` por padrão. Para usar o navegador instalado por Playwright, execute:

```sh
CHROMIUM_PATH="$(node -p "require('playwright').chromium.executablePath()")" SPA_BASE_URL=http://127.0.0.1:4173 npm test
```

Use o mesmo CHROMIUM_PATH e SPA_BASE_URL com `npm run test:contraste`. O servidor precisa estar ativo em outra sessão.

A suíte verifica 11 cenários de navegação, validação, persistência, modais, histórico malformado, erros de armazenamento e desconexão. Cada cenário falha diante de exceções JavaScript não tratadas. Os recursos CDN são bloqueados propositalmente para testar o fallback; a renderização real do gráfico não é coberta. Consulte [instruções de testes](tests/README.md) e [relatório de validação](docs/validacao-spa.md).

## GitFlow e revisão

`main` mantém a versão estável; `develop` integra desenvolvimento. Branches `feature/` partem de `develop` e devem ser revisadas por PR antes da integração. `release/` prepara entregas e `hotfix/` corrige falhas urgentes a partir de `main`. As primeiras alterações foram integradas diretamente; o uso de PR foi adotado posteriormente, com o PR #2 de gestão colaborativa.

Issues registram tarefas e critérios de conclusão; milestones agrupam objetivos; PRs explicam e revisam mudanças. Leia [GitFlow](docs/gitflow.md) e [gestão colaborativa](docs/gestao-colaborativa.md). Registros efetivos podem ser consultados nas abas Issues e Pull requests do GitHub.

## Commits e versões

Adota-se Conventional Commits (`tipo: descrição`), com tipos como `feat`, `fix`, `refactor`, `docs` e `chore`. SemVer usa MAJOR para alterações incompatíveis, MINOR para funcionalidades compatíveis e PATCH para correções. A tag anotada `v1.0.0` identifica a primeira versão. Consulte o [CHANGELOG](CHANGELOG.md). Não há automação de releases configurada, e tag Git não equivale à publicação do site.

## Limitações

O projeto é uma demonstração educacional: não possui backend, autenticação, envio real de cadastros ou processamento de pagamentos. Os dados ficam no navegador e não são sincronizados. Evite dados pessoais reais nos testes. A navegação funciona sem conexão após carregar a SPA; recarregar totalmente offline exige recursos adicionais, como service worker, ainda não implementados. O gráfico e as fontes dependem de acesso aos respectivos CDNs.

## Perfil de alto contraste

O botão Alto contraste alterna o perfil visual, indica seu estado com `aria-pressed` e salva a preferência no navegador. Sem preferência salva, respeita `prefers-contrast: more`. O modo usa preto, branco e amarelo, com estados identificados também por texto e ARIA. Consulte [medições de contraste](docs/contraste.md); execute `node tests/contraste.cjs` para repetir as verificações. Não existe dark mode separado.

## Hospedagem e CI/CD

O deploy foi preparado para GitHub Pages por GitHub Actions. O workflow valida PRs para main/develop e publica dist após build e testes em atualizações da main. É necessário habilitar Settings → Pages → GitHub Actions e conferir o deployment remoto. Consulte [configuração de deploy](docs/deploy.md). A presença do workflow não comprova publicação.
