# Problemas identificados e correções

A validação foi realizada em Chromium com Playwright. Foram capturadas exceções `pageerror`, inspecionados DOM, títulos, foco e localStorage e simulados bloqueios de recursos externos e falhas de armazenamento. A inspeção do fluxo das funções permitiu localizar as causas. Não se afirma aqui uma sessão manual com breakpoints do DevTools.

## 1. Histórico corrompido interrompia a tela

Reprodução: inserir `[null]` na chave `semear:cadastros` e recarregar a rota de cadastro. O acesso a `r.tipo` produzia `Cannot read properties of null`.

Causa: a leitura validava apenas se o JSON era um array, sem conferir seus registros.

Correção: `armazenamento.js` valida os campos, tipo, data, área e valores dos registros antes de disponibilizá-los para a interface. JSON inválido e itens malformados não interrompem a renderização.

## 2. Valores com precisão inválida eram aceitos

Reprodução: cadastrar uma doação de `5.001`. O registro era salvo apesar do `step="0.01"` declarado no HTML.

Causa: com `novalidate`, a verificação JavaScript do mínimo não incluía as restrições nativas do campo.

Correção: `validacao.js` consulta também `ValidityState`, incluindo `stepMismatch`, e apresenta mensagem específica para mais de duas casas decimais.

## 3. Rotas desconhecidas deixavam URL e conteúdo inconsistentes

Reprodução: mudar de Projetos para `#/nao-existe`; o conteúdo anterior permanecia. `#/constructor` era considerado uma rota por ser uma propriedade herdada do objeto de títulos, resultando em página não encontrada com título anterior.

Correção: `roteador.js` reconhece apenas propriedades próprias com `Object.hasOwn` e aplica consistentemente a rota inicial como fallback. O hash `#app` é preservado como salto para o conteúdo.

## 4. Modal e confirmação permaneciam ativos após navegar

Reprodução: abrir uma doação mensal e mudar o hash para Sobre. O modal permanecia e permitia cadastrar os dados do formulário removido do DOM.

Correção: antes de trocar o template, o roteador emite um evento de ciclo de vida. O módulo de feedback fecha o modal, elimina a confirmação pendente e remove o toast. O envio também verifica se o formulário continua conectado ao DOM. O modal agora mantém a navegação por Tab entre seus botões e restaura o foco ao fechar.

## 5. Falhas de armazenamento exibiam sucesso incorreto

Reprodução: simular `QuotaExceededError` em `Storage.prototype.setItem` e concluir o cadastro. A interface mostrava sucesso e limpava o formulário sem salvar o registro. A falha de `removeItem` também era ignorada.

Correção: as operações retornam seu resultado ao módulo de formulário. Em caso de erro ao salvar, os campos são preservados e uma mensagem é exibida; em caso de erro ao apagar, a interface mantém o histórico e informa a falha.

## Rede e limitações

O CDN foi bloqueado pelo proxy durante a preparação. A aplicação já possuía fallback para Chart.js indisponível, que foi validado. A perda de conexão após carregar a SPA não impede a navegação local nem o cadastro em localStorage. Recarregar a página completamente offline não foi implementado: não há service worker. Não existe envio real de cadastro ou pagamento para servidor.

## Resultado

Os 11 cenários de `tests/spa.cjs` passaram após as correções, sem exceções JavaScript não tratadas. As instruções para repetir os testes estão em `tests/README.md`.
