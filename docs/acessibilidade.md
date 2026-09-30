# Semântica e acessibilidade

## Estrutura existente revisada

O HTML declara `lang="pt-BR"` e usa `header`, `nav` com nome Principal, `main` e `footer`. Seções têm títulos associados por `aria-labelledby`; imagens têm texto alternativo. O link Pular para o conteúdo move o foco para o main. Labels associados por `for`/`id` nomeiam os campos; fieldset e legend agrupam dados. Erros usam `aria-invalid` e `aria-describedby`, e mensagens têm `role="alert"` ou `role="status"`. O gráfico possui nome e alternativa textual.

## Alterações desta etapa

- Formulários nomeados com `aria-labelledby`, usando os títulos Cadastro de voluntário e Cadastro de doador.
- Após a navegação da SPA, o foco passa ao h1 da nova página com tabindex -1, sem adicioná-lo à sequência normal de Tab. Removido aria-live do main inteiro para evitar anúncios extensos a cada atualização; status e alertas específicos permanecem.
- Modal mantém role dialog, aria-modal e associação ao título, e passa a ter descrição ligada por aria-describedby. Elementos de fundo recebem inert temporariamente, impedindo interação e exposição como conteúdo ativo. Estados inert anteriores são preservados.
- Tab e Shift+Tab permanecem entre os botões do modal. Escape fecha; o foco retorna ao acionador. Navegar cancela a confirmação pendente.
- Botões do exemplo estático de modal estão disabled: o exemplo continua visível, mas não oferece ações sem implementação.

## Validação e limites

Os 11 cenários de tests/spa.cjs passaram. Foram acrescentadas verificações de landmarks e nomes por role, atributos dos erros, foco após navegação, nome/descrição do diálogo, bloqueio do fundo e restauração de foco.

Essas verificações não constituem certificação WCAG nem substituem avaliação manual com leitores de tela. Não foi executada uma sessão com NVDA ou VoiceOver nesta etapa.
