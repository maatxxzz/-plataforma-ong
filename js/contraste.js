// Preferência visual independente do histórico de cadastros.
export function iniciarContraste() {
  const botao = document.getElementById('alternar-contraste');
  function aplicar(ativo) {
    document.documentElement.dataset.contraste = ativo ? 'alto' : 'normal';
    botao.setAttribute('aria-pressed', String(ativo));
    document.dispatchEvent(new Event('semear:contraste-alterado'));
  }
  let salvo = null;
  try { salvo = localStorage.getItem('semear:contraste'); } catch { /* usa preferência do sistema */ }
  const preferencia = window.matchMedia('(prefers-contrast: more)');
  aplicar(salvo === null ? preferencia.matches : salvo === 'alto');
  botao.addEventListener('click', function () {
    const ativo = botao.getAttribute('aria-pressed') !== 'true';
    aplicar(ativo);
    salvo = ativo ? 'alto' : 'normal';
    try { localStorage.setItem('semear:contraste', salvo); } catch { /* modo segue ativo nesta sessão */ }
  });
  preferencia.addEventListener('change', function (e) {
    if (salvo === null) aplicar(e.matches);
  });
}
