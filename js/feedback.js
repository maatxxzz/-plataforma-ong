// Toast: aviso temporário criado dinamicamente no canto da tela
var timerToast = null;
export function mostrarToast(mensagem) {
  fecharToast();
  var toast = document.createElement("div");
  toast.className = "toast toast-sucesso";
  toast.setAttribute("role", "status");
  var texto = document.createElement("span");
  texto.textContent = mensagem;
  var fechar = document.createElement("button");
  fechar.type = "button";
  fechar.className = "toast-fechar";
  fechar.dataset.acao = "fechar-toast";
  fechar.setAttribute("aria-label", "Fechar aviso");
  fechar.textContent = "×";
  toast.append(texto, fechar);
  document.body.appendChild(toast);
  timerToast = setTimeout(fecharToast, 5000);
}
function fecharToast() {
  clearTimeout(timerToast);
  var toast = document.querySelector(".toast");
  if (toast) toast.remove();
}

// Modal de confirmação da doação mensal
var confirmarPendente = null;
export function abrirModal(valorDoacao, aoConfirmar) {
  var valor = Number(valorDoacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  confirmarPendente = aoConfirmar;
  var fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="t-modal-real">' +
    '<h2 id="t-modal-real">Confirmar doação mensal?</h2>' +
    "<p>Você fará uma doação de <strong>" + valor + "</strong> todo mês para o Instituto Semear.</p>" +
    '<div class="acoes">' +
    '<button type="button" class="botao-secundario" data-acao="cancelar-modal">Cancelar</button>' +
    '<button type="button" data-acao="confirmar-modal">Confirmar doação</button>' +
    "</div></div>";
  document.body.appendChild(fundo);
  fundo.querySelector('[data-acao="confirmar-modal"]').focus();
}
function fecharModal() {
  var fundo = document.querySelector(".modal-fundo");
  if (fundo) fundo.remove();
  confirmarPendente = null;
}


export function iniciarFeedback() {
  document.addEventListener("click", function (e) {
    var acao = e.target.closest("[data-acao]");
    if (!acao) return;
    if (acao.dataset.acao === "fechar-toast") fecharToast();
    if (acao.dataset.acao === "cancelar-modal") fecharModal();
    if (acao.dataset.acao === "confirmar-modal") {
      var confirmar = confirmarPendente;
      fecharModal();
      if (confirmar) confirmar();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModal();
  });
}
