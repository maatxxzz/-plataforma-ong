# Gestão de tarefas e integração

## Situação desta etapa

O repositório possui branches de desenvolvimento, feature e release e a tag `v1.0.0`. As integrações anteriores foram feitas por merges locais. Não se deve descrevê-las como pull requests ou atribuir issues e milestones retroativamente.

Nesta etapa, a branch `feature/gestao-colaborativa` adiciona o fluxo de gestão abaixo. Ela deve ser revisada por um pull request com destino a `develop` antes da integração. A criação de issues, milestones e PRs pela API retornou `Forbidden` durante a tentativa de acesso; esses registros devem ser criados pela interface do GitHub. Este documento não prova sua criação.

## Issue proposta

Título: `Documentar gestão de tarefas e revisão por pull requests`

Contexto: a organização GitFlow e os testes já existem, mas faltava documentar como planejar tarefas e revisar alterações antes do merge.

Critérios de conclusão:

- [ ] Criar uma milestone para a etapa de gestão colaborativa.
- [ ] Associar esta issue à milestone.
- [ ] Abrir um PR de `feature/gestao-colaborativa` para `develop`.
- [ ] Revisar o conteúdo de `docs/gestao-colaborativa.md`.
- [ ] Integrar o PR e encerrar a issue com referência ao PR.

## Milestone proposta

Título: `Gestão colaborativa e rastreabilidade`

Objetivo: reunir a documentação do planejamento por issues, acompanhamento por milestone e integração revisada por PR. Não corresponde à release `v1.0.0`, que já foi marcada antes desta etapa. A milestone deve ser concluída somente após a revisão e integração do PR.

## Pull request proposto

Base: `develop`

Comparação: `feature/gestao-colaborativa`

Título: `docs: documentar gestão por issues, milestones e pull requests`

Descrição: o projeto já adotava branches GitFlow, mas ainda não registrava o processo de gestão e revisão. Este PR adiciona o fluxo em `docs/gestao-colaborativa.md`, com critérios de conclusão, proposta de milestone e responsabilidades de revisão. A alteração é somente documental. Validação: `git diff --check`; não altera o comportamento da SPA. Inclua `Closes #numero` após criar a issue, substituindo pelo número real.

## Próximas tarefas

Cada mudança deve começar com uma issue que explique problema, resultado esperado e critérios de conclusão. Agrupe issues relacionadas em uma milestone com objetivo definido. Crie uma feature a partir de `develop`, faça commits claros e abra um PR para `develop` antes do merge. No PR, descreva o problema, a solução, os testes e a issue relacionada. Em trabalho individual, faça uma revisão própria antes de integrar; não a descreva como aprovação por outro colaborador. Para releases e hotfixes, aplique o mesmo registro e revisão, respeitando as bases previstas no GitFlow.
