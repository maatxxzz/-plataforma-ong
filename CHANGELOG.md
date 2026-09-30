# Histórico de versões

## 1.0.0

Primeira versão identificada por tag: SPA educacional com rotas, templates, formulários de voluntário e doador, máscaras, validação e histórico local. Cadastros não são enviados a um servidor e doações não processam pagamentos.

- `6dbc369` — `refactor: organizar JavaScript em módulos ES por responsabilidade`.
- `6fefa65` — `fix: corrigir falhas de navegação, validação e armazenamento da SPA`.
- `64902f6` — `docs: definir fluxo GitFlow para o projeto`.

Validação: 11 cenários automatizados de navegador, documentados em `tests/README.md`. Recursos CDN são bloqueados propositalmente nos testes para verificar o fallback; a renderização real do gráfico não é validada por essa suíte.

## Política de versões e commits

Adota-se SemVer (`MAJOR.MINOR.PATCH`): MAJOR para mudanças incompatíveis no comportamento ou nos contratos existentes; MINOR para funcionalidades compatíveis; PATCH para correções compatíveis. A versão inicial é `v1.0.0`. Versões futuras serão escolhidas conforme o impacto real da alteração.

As mensagens de alteração seguem Conventional Commits: `tipo: descrição`, com escopo opcional e `!` ou rodapé `BREAKING CHANGE` para incompatibilidades. Os tipos usados incluem `feat`, `fix`, `refactor`, `docs` e `chore`. O histórico anterior não foi reescrito; commits de integração antigos podem não seguir esse padrão.

A release é preparada em `release/1.0.0`, integrada à `main` e à `develop` e marcada por tag anotada na `main`. Uma tag Git identifica o código entregue; não implica criação de uma GitHub Release ou publicação de um site. Não há geração automática de versões ou changelog configurada.
