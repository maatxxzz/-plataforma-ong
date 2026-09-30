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
var focoAnterior = null;
var elementosInertes = [];
export function abrirModal(valorDoacao, aoConfirmar) {
  fecharModal();
  focoAnterior = document.activeElement;
  var valor = Number(valorDoacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  confirmarPendente = aoConfirmar;
  var fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="t-modal-real" aria-describedby="descricao-modal-real">' +
    '<h2 id="t-modal-real">Confirmar doação mensal?</h2>' +
    '<p id="descricao-modal-real">Você fará uma doação de <strong>' + valor + "</strong> todo mês para o Instituto Semear.</p>" +
    '<div class="acoes">' +
    '<button type="button" class="botao-secundario" data-acao="cancelar-modal">Cancelar</button>' +
    '<button type="button" data-acao="confirmar-modal">Confirmar doação</button>' +
    "</div></div>";
  document.body.appendChild(fundo);
  elementosInertes = Array.from(document.body.children).filter(function (el) {
    return el !== fundo && !el.inert && !["SCRIPT", "TEMPLATE"].includes(el.tagName);
  });
  elementosInertes.forEach(function (el) { el.inert = true; });
  fundo.querySelector('[data-acao="confirmar-modal"]').focus();
}
function fecharModal() {
  var fundo = document.querySelector(".modal-fundo");
  if (fundo) fundo.remove();
  elementosInertes.forEach(function (el) { el.inert = false; });
  elementosInertes = [];
  confirmarPendente = null;
  if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus();
  focoAnterior = null;
}


export function iniciarFeedback() {
  document.addEventListener("semear:antes-de-navegar", function () {
    fecharModal();
    fecharToast();
  });
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
    var modal = document.querySelector(".modal-fundo");
    if (e.key === "Tab" && modal) {
      var botoes = modal.querySelectorAll("button");
      var primeiro = botoes[0], ultimo = botoes[botoes.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });
}
