# Fluxo de branches

O projeto adota GitFlow a partir desta etapa. As alterações anteriores de modularização e correção da SPA foram enviadas diretamente à `main`; seu histórico foi preservado.

- `main`: versão estável do projeto. Recebe versões validadas e correções urgentes.
- `develop`: integração contínua do desenvolvimento, criada a partir da versão estável da `main`.
- `feature/<nome>`: trabalho isolado, criado a partir de `develop` e integrado de volta após revisão e testes. Nesta etapa, `feature/documentacao-gitflow` adicionou este documento e foi integrada com um merge que preserva o histórico da branch.
- `release/<versao>`: será criada a partir de `develop` quando houver uma versão a preparar. Após validação, será integrada à `main` e à `develop`, com tag de versão.
- `hotfix/<nome>`: será criada a partir de `main` somente quando houver uma falha urgente na versão estável. Sua correção será integrada à `main` e à `develop`.

Não foram criadas branches de release ou hotfix sem uma entrega ou correção correspondente. A feature desta etapa documenta o processo; não representa desenvolvimento de uma nova funcionalidade da aplicação.

## Exemplo de próxima funcionalidade

```sh
git switch develop
git pull --ff-only origin develop
git switch -c feature/nome-da-funcionalidade
# Implementar e revisar a mudança; executar os testes pertinentes.
git add caminho-dos-arquivos-alterados
git commit -m "feat: descrever a funcionalidade"
git push -u origin feature/nome-da-funcionalidade
# Revisar por pull request para develop, ou fazer integração local revisada:
git switch develop
git merge --no-ff feature/nome-da-funcionalidade
git push origin develop
```

Os testes da SPA e seus requisitos estão documentados em `tests/README.md`. Integrações não devem apresentar erros de JavaScript ou regressões nos fluxos alterados. As branches separam o desenvolvimento da versão estável; não há proteção de branch ou revisão obrigatória configurada por este documento.
