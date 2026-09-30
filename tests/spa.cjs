// Execute com o servidor local ativo e Playwright + Chromium instalados.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.SPA_BASE_URL || 'http://127.0.0.1:8000';
let total = 0;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    async function test(name, run) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      // Testes independem da disponibilidade dos CDNs.
      await page.route('https://**/*', route => route.abort());
      try {
        await page.goto(base + '/#/cadastro');
        await page.waitForFunction(() => document.title.startsWith('Participe'));
        await run(page, context);
        assert.deepEqual(errors, [], 'Nenhum erro de JavaScript esperado');
        console.log('PASS', name); total++;
      } finally { await context.close(); }
    }
    async function donor(p, value = '10', frequency = 'unica') {
      await p.locator('#d-nome').fill('Pessoa Teste');
      await p.locator('#d-email').fill('teste@example.com');
      await p.locator('#d-valor').fill(value);
      await p.locator('#d-freq').selectOption(frequency);
      await p.locator('#d-lgpd').check();
    }
    const submit = p => p.locator('form').last().locator('button[type=submit]').click();
    const count = p => p.locator('#historico article').count();
    await test('Rotas, cards, voltar/avançar e fallback do CDN', async p => {
      for (const [r, title] of Object.entries({inicio:'Início',sobre:'Sobre',projetos:'Projetos',cadastro:'Participe'})) {
        await p.evaluate(r => location.hash = '#/' + r, r);
        await p.waitForFunction(t => document.title.startsWith(t), title);
        assert(await p.locator('main h1').isVisible());
        if (r === 'inicio') { assert.equal(await p.locator('#lista-trabalho article').count(), 3); assert.match(await p.locator('main').innerText(), /Não foi possível carregar o gráfico/); }
        if (r === 'projetos') assert.equal(await p.locator('#lista-projetos article').count(), 3);
      }
      await p.goBack(); await p.waitForFunction(() => document.title.startsWith('Projetos'));
      await p.goForward(); await p.waitForFunction(() => document.title.startsWith('Participe'));
    });
    await test('Rotas desconhecidas e nomes herdados', async p => {
      for (const route of ['nao-existe','constructor','toString','__proto__']) {
        await p.evaluate(r => location.hash = '#/' + r, route);
        await p.waitForFunction(() => document.title.startsWith('Início'));
        assert.match(await p.locator('main h1').innerText(), /Cada criança/);
      }
    });
    await test('Campos vazios, email inválido, valor mínimo e precisão', async p => {
      await submit(p); assert.equal(await p.locator('.msg-campo').count(), 5);
      await donor(p, '4.99'); await submit(p); assert.equal(await count(p), 0);
      await donor(p, '5.001'); await submit(p); assert.match(await p.locator('#erro-d-valor').innerText(), /duas casas/); assert.equal(await count(p), 0);
      await donor(p); await p.locator('#d-email').fill('email-invalido'); await submit(p); assert.equal(await count(p), 0);
      await donor(p, '5.00'); await submit(p); assert.equal(await count(p), 1);
    });
    await test('Máscaras e CPF inválido', async p => {
      await p.locator('#v-cpf').fill('11111111111'); await p.locator('#v-cep').fill('12345678'); await p.locator('#v-tel').fill('11912345678');
      assert.equal(await p.locator('#v-cpf').inputValue(), '111.111.111-11');
      assert.equal(await p.locator('#v-cep').inputValue(), '12345-678');
      assert.equal(await p.locator('#v-tel').inputValue(), '(11) 91234-5678');
      assert.match(await p.locator('#erro-v-cpf').innerText(), /CPF inválido/);
    });
    await test('Histórico com JSON inválido ou registros malformados', async p => {
      for (const raw of ['{','{}','[null,3,{}, {"tipo":"doador"}]']) {
        await p.evaluate(raw => localStorage.setItem('semear:cadastros', raw), raw);
        await p.reload(); await p.waitForFunction(() => document.title.startsWith('Participe'));
        assert.equal(await count(p), 0); assert.match(await p.locator('#historico').innerText(), /Nenhum cadastro/);
      }
    });
    await test('Persistência, texto seguro e limite de 20 cadastros', async p => {
      await donor(p); await p.locator('#d-nome').fill('<img src=x onerror=alert(1)> Teste'); await submit(p);
      assert.equal(await p.locator('#historico img').count(), 0);
      await p.reload(); await p.waitForFunction(() => document.title.startsWith('Participe')); assert.equal(await count(p), 1);
      await p.evaluate(() => {const r=JSON.parse(localStorage.getItem('semear:cadastros'))[0];localStorage.setItem('semear:cadastros',JSON.stringify(Array(20).fill(r)));});
      await donor(p); await submit(p); assert.equal(await count(p), 20);
      await p.locator('[data-acao=limpar-historico]').click(); assert.equal(await count(p), 0);
    });
    await test('Modal: cancelar, foco, Escape e confirmar', async p => {
      await donor(p, '10', 'mensal'); await submit(p);
      await p.keyboard.press('Tab'); assert.equal(await p.locator('[data-acao=cancelar-modal]').evaluate(e=>e===document.activeElement), true);
      await p.keyboard.press('Shift+Tab'); assert.equal(await p.locator('[data-acao=confirmar-modal]').evaluate(e=>e===document.activeElement), true);
      await p.keyboard.press('Escape'); assert.equal(await p.locator('.modal-fundo').count(), 0); assert.equal(await count(p), 0);
      await submit(p); await p.locator('[data-acao=cancelar-modal]').click(); assert.equal(await count(p), 0);
      await submit(p); await p.locator('[data-acao=confirmar-modal]').click(); assert.equal(await count(p), 1);
    });
    await test('Navegação cancela confirmação pendente', async p => {
      await donor(p, '10', 'mensal'); await submit(p);
      await p.evaluate(() => location.hash = '#/sobre'); await p.waitForFunction(() => document.title.startsWith('Sobre'));
      assert.equal(await p.locator('.modal-fundo').count(), 0);
      assert.equal(await p.evaluate(()=>localStorage.getItem('semear:cadastros')), null);
    });
    await test('Falha ao gravar preserva os campos sem anunciar sucesso', async p => {
      await p.evaluate(() => {Storage.prototype.setItem = () => {throw new DOMException('Quota', 'QuotaExceededError');};});
      await donor(p); await submit(p);
      assert(await p.locator('.alerta-erro').isVisible()); assert.equal(await p.locator('.alerta-sucesso').isVisible(), false);
      assert.equal(await p.locator('#d-nome').inputValue(), 'Pessoa Teste'); assert.equal(await count(p), 0);
    });
    await test('Falha ao apagar mantém histórico e informa erro', async p => {
      await donor(p); await submit(p);
      await p.evaluate(() => {Storage.prototype.removeItem = () => {throw new DOMException('Blocked', 'SecurityError');};});
      await p.locator('[data-acao=limpar-historico]').click(); assert.equal(await count(p), 1); assert(await p.locator('.alerta-erro').isVisible());
    });
    await test('Sem conexão após carregar: navegação local e cadastro', async (p, context) => {
      await context.setOffline(true);
      await p.evaluate(()=>location.hash='#/projetos'); await p.waitForFunction(()=>document.title.startsWith('Projetos'));
      await p.evaluate(()=>location.hash='#/cadastro'); await p.waitForFunction(()=>document.title.startsWith('Participe'));
      await donor(p); await submit(p); assert.equal(await count(p), 1);
    });
    console.log(`${total} cenários passaram.`);
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
