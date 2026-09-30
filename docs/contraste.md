# Alto contraste

O botão Alto contraste alterna o atributo `data-contraste` do elemento html e expõe seu estado por `aria-pressed`. O módulo `js/contraste.js` mantém a preferência na chave `semear:contraste`. Sem escolha salva, usa `prefers-contrast: more` e acompanha mudanças dessa preferência. Falhas de storage não impedem a troca na sessão atual.

O perfil CSS usa fundo preto, texto branco e amarelo para links e botões. Campos, alertas, badges, menu e modal têm regras próprias para evitar combinações inadequadas decorrentes apenas da inversão das variáveis. Erros continuam identificados por mensagens e ARIA; os estados não dependem exclusivamente de cor. `:focus-visible` mantém contorno amarelo. A mudança também solicita a atualização do gráfico, quando sua biblioteca está disponível. Não foi implementado dark mode separado: esta entrega é um perfil de alto contraste.

## Medições

Ferramenta: `tests/contraste.cjs`, com Playwright/Chromium para obter as cores computadas e cálculo de luminância relativa sRGB e razão WCAG `(LmaisClara + 0.05)/(LmaisEscura + 0.05)`. Os pares testados são opacos; a busca de fundo considera ancestrais transparentes. Não é uma auditoria completa de imagens, gradientes ou todos os estados visuais.

| Modo | Elemento | Texto | Fundo | Razão |
|---|---|---|---|---|
| Normal | Corpo | #16241f | #ffffff | 16,08:1 |
| Normal | Marca no cabeçalho | #ffffff | #1d5c4a | 7,83:1 |
| Normal | Botão de contraste | #16241f | #f2b632 | 8,81:1 |
| Normal | Texto auxiliar | #4a5b54 | #ffffff | 7,20:1 |
| Normal | Campo doador | #000000 | #ffffff | 21:1 |
| Alto | Corpo | #ffffff | #000000 | 21:1 |
| Alto | Marca no cabeçalho | #ffff00 | #000000 | 19,56:1 |
| Alto | Botão de contraste | #000000 | #ffff00 | 19,56:1 |
| Alto | Texto auxiliar | #ffffff | #000000 | 21:1 |
| Alto | Campo doador | #ffffff | #000000 | 21:1 |

## Repetir

Com o servidor local ativo e os requisitos descritos em `tests/README.md`, execute `node tests/contraste.cjs`. O teste aceita `SPA_BASE_URL` e `CHROMIUM_PATH`, assim como a suíte SPA. Verifica limite de 4,5:1 para os pares acima, ativação por Enter, persistência ao recarregar, troca com gravação indisponível e preferência de contraste do sistema. A suíte SPA também passou nos 11 cenários existentes. Essas verificações não estabelecem conformidade WCAG integral.
