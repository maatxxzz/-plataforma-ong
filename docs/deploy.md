# Publicação no GitHub Pages

## Escolha

GitHub Pages é adequado à SPA estática: serve HTML, CSS, JavaScript e imagens por HTTPS, sem backend. GitHub Actions integra build e testes ao repositório e oferece logs por execução. Não há processamento de pagamentos nem API nesta aplicação. Rotas por hash não exigem reescrita no servidor. O Vite usa base relativa para recursos em um subdiretório.

## Habilitar

1. No repositório, abra Settings → Pages.
2. Em Build and deployment → Source, selecione GitHub Actions.
3. Integre o PR de feature/deploy-pages à develop e depois à main.
4. Em Actions, acompanhe o fluxo Validar e publicar no GitHub Pages.
5. Aguarde os jobs build e deploy concluírem. A URL confirmada aparecerá no deployment e em Settings → Pages.

Se o workflow já estiver na main quando o Pages for habilitado, abra Actions, selecione o workflow e execute Run workflow na main. Se a política da conta impedir Actions ou Pages, será necessário habilitar a capacidade ou escolher outro serviço. A disponibilidade do Pages pode depender da visibilidade do repositório e do plano.

## Pipeline

Em PRs para main/develop, o workflow instala Node.js 24, executa npm ci, instala Chromium com Playwright, gera dist e testa a build. Em pushes para main e execuções manuais na main, os mesmos passos precedem o upload do artefato dist e o deploy. PRs não publicam. O deploy depende do sucesso do job build e usa permissões pages:write e id-token:write; não exige token pessoal salvo no projeto.

O servidor Python é temporário e encerrado após os testes. CHROMIUM_PATH aponta ao navegador instalado pelo Playwright. Dependências estão fixadas pelo lockfile, incluindo Playwright.

## Estado da configuração

Workflow preparado no repositório e build/testes validados localmente. Isso não confirma publicação: habilitar Pages, integrar o workflow na main e verificar uma execução remota bem-sucedida são etapas necessárias. Não foi verificada a URL pública durante esta preparação.
