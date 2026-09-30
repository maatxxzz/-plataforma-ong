# Validação da SPA

Requisitos: Node.js, Python 3, Playwright e Chromium.

No ambiente preparado, inicie o servidor em uma sessão:

```sh
cd /workspace/-plataforma-ong
python3 -m http.server 8000 --bind 127.0.0.1
```

Em outra sessão, execute:

```sh
cd /workspace/-plataforma-ong
node tests/spa.cjs
```

Se Playwright não estiver instalado, instale-o fora do repositório:

```sh
npm install --prefix /tmp/semear-tests --no-save playwright
NODE_PATH=/tmp/semear-tests/node_modules node tests/spa.cjs
```

O runner usa `/usr/bin/chromium` por padrão. Defina `CHROMIUM_PATH` para outro executável instalado e `SPA_BASE_URL` se o servidor usar outra porta.

Os 11 cenários verificam navegação, cards, histórico, validação, máscaras, modais, falhas de armazenamento e perda de conexão. Cada cenário usa um contexto isolado e falha se ocorrer uma exceção JavaScript não tratada. Os CDNs são bloqueados propositalmente: o teste valida a degradação controlada, não a renderização real do Chart.js. Não há suporte a recarregamento totalmente offline; o cenário de desconexão parte da SPA já carregada.

Para verificar o novo perfil visual, execute `node tests/contraste.cjs`. A suíte mede cinco pares de texto e fundo em cada modo, exige ao menos 4,5:1 e verifica teclado, persistência e preferência do sistema. Consulte `docs/contraste.md` para valores e limites da medição.
