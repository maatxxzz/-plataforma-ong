import { adicionarCadastro, limparCadastros } from './armazenamento.js';
import { validarFormulario, limparEstados } from './validacao.js';
import { renderizarHistorico } from './historico.js';
import { mostrarToast, abrirModal } from './feedback.js';

// Monta o registro (sem CPF, telefone ou endereço, por serem dados sensíveis)
function registrarCadastro(form) {
  var voluntario = Boolean(form.elements["cpf"]);
  var registro = {
    tipo: voluntario ? "voluntario" : "doador",
    nome: form.elements["nome"].value.trim(),
    email: form.elements["email"].value.trim(),
    data: new Date().toISOString(),
  };
  if (voluntario) {
    registro.area = form.elements["area"].value;
  } else {
    registro.valor = Number(form.elements["valor"].value);
    registro.frequencia = form.elements["frequencia"].value;
  }
  return adicionarCadastro(registro);
}

function mostrarErro(mensagem) {
  var erro = document.querySelector(".alerta-erro");
  if (erro) { erro.querySelector("div").textContent = mensagem; erro.hidden = false; }
  var ok = document.querySelector(".alerta-sucesso");
  if (ok) ok.hidden = true;
}

// Conclui o envio: mostra o alerta de sucesso, limpa o formulário e avisa com toast
function concluirEnvio(form) {
  if (!form.isConnected) return;
  if (!registrarCadastro(form)) {
    mostrarErro("Não foi possível salvar neste navegador. Seus dados continuam no formulário; verifique o armazenamento e tente novamente.");
    return;
  }
  var ok = document.querySelector(".alerta-sucesso");
  if (ok) ok.hidden = false;
  form.reset();
  limparEstados(form);
  renderizarHistorico();
  mostrarToast("Cadastro enviado com sucesso!");
}

// Evento "submit": preventDefault() impede o envio/recarregamento da página
// e a validação passa a ser feita pelas regras do módulo de validação
export function iniciarFormularios() {
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    var form = e.target;
    var erro = document.querySelector(".alerta-erro");
    var ok = document.querySelector(".alerta-sucesso");

    if (!validarFormulario(form)) {
      mostrarErro("Verifique os campos destacados em vermelho e tente novamente.");
      return;
    }
    if (erro) erro.hidden = true;

    var freq = form.elements["frequencia"];
    if (freq && freq.value === "mensal") {
      abrirModal(form.elements["valor"].value, function () { concluirEnvio(form); }); // doação recorrente pede confirmação antes de enviar
      return;
    }
    concluirEnvio(form);
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-acao="limpar-historico"]')) {
      if (!limparCadastros()) { mostrarErro("Não foi possível apagar o histórico neste navegador. Tente novamente."); return; }
      renderizarHistorico();
      mostrarToast("Histórico apagado.");
    }
  });
}
