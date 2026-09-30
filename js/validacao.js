function soDigitos(v) { return v.replace(/\D/g, ""); }

// Máscaras aplicadas enquanto o usuário digita (evento "input")
var mascaras = {
  "v-cpf": function (v) {
    v = soDigitos(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  },
  "v-cep": function (v) {
    return soDigitos(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  },
  "v-tel": function (v) {
    v = soDigitos(v).slice(0, 11);
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    if (v.length > 2) return v.replace(/^(\d{2})(\d*)$/, "($1) $2");
    return v;
  },
};

// ---------------------------------------------------------------------
// Validação de consistência dos formulários
// ---------------------------------------------------------------------

// Validação dos dígitos verificadores do CPF (algoritmo oficial)
function cpfValido(cpf) {
  var n = soDigitos(cpf);
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false; // rejeita 111.111.111-11 etc.
  for (var t = 9; t < 11; t++) {
    var soma = 0;
    for (var i = 0; i < t; i++) soma += Number(n[i]) * (t + 1 - i);
    if ((soma * 10) % 11 % 10 !== Number(n[t])) return false;
  }
  return true;
}

// Cada validador recebe o valor já sem espaços nas pontas e devolve
// uma mensagem de erro ("" quando o valor é válido). Os nomes são os
// atributos name dos campos.
var validadores = {
  nome: function (v) {
    return /^\S+(\s+\S+)+$/.test(v) ? "" : "Informe nome e sobrenome.";
  },
  cpf: function (v) {
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)) return "Use o formato 000.000.000-00.";
    return cpfValido(v) ? "" : "CPF inválido. Confira os números.";
  },
  email: function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Informe um e-mail válido, como nome@dominio.com.";
  },
  telefone: function (v) {
    return /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(v) ? "" : "Use o formato (11) 91234-5678.";
  },
  cep: function (v) {
    return /^\d{5}-\d{3}$/.test(v) ? "" : "Use o formato 00000-000.";
  },
  nascimento: function (v) {
    var d = new Date(v + "T00:00:00");
    var hoje = new Date();
    if (isNaN(d.getTime()) || d > hoje) return "Informe uma data de nascimento válida.";
    var idade = hoje.getFullYear() - d.getFullYear();
    var fezAniversario = hoje.getMonth() > d.getMonth() ||
      (hoje.getMonth() === d.getMonth() && hoje.getDate() >= d.getDate());
    if (!fezAniversario) idade--;
    return idade >= 16 ? "" : "É preciso ter 16 anos ou mais para ser voluntário.";
  },
  endereco: function (v) {
    return v.length >= 5 ? "" : "Informe o endereço com o número.";
  },
  valor: function (v) {
    return Number(v) >= 5 ? "" : "O valor mínimo da doação é R$ 5,00.";
  },
};

// Devolve o texto de erro de um campo ("" quando está válido)
function obterMensagem(c) {
  if (c.type === "radio") {
    var marcado = c.form.querySelector('input[name="' + c.name + '"]:checked');
    return c.required && !marcado ? "Escolha uma das opções." : "";
  }
  if (c.type === "checkbox") {
    return c.required && !c.checked ? "Você precisa autorizar para continuar." : "";
  }
  var v = c.value.trim();
  if (!v) {
    if (!c.required) return "";
    return c.tagName === "SELECT" ? "Selecione uma opção." : "Preencha este campo.";
  }
  return validadores[c.name] ? validadores[c.name](v) : "";
}

// Manipulação condicional do DOM: alterna as classes de estado, os
// atributos ARIA e injeta (ou remove) o <p class="msg-campo"> com o aviso
function mostrarEstado(c, msg) {
  var radio = c.type === "radio";
  var alvo = radio ? c.closest("fieldset") : c; // radios são estilizados pelo fieldset
  var idMsg = "erro-" + (radio ? c.name : c.id);
  var aviso = document.getElementById(idMsg);
  var temValor = radio ? Boolean(c.form.querySelector('input[name="' + c.name + '"]:checked'))
               : c.type === "checkbox" ? c.checked : c.value.trim() !== "";

  alvo.classList.toggle("campo-erro", Boolean(msg));
  alvo.classList.toggle("campo-ok", !msg && temValor);

  if (msg) {
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.id = idMsg;
      aviso.className = "msg-campo";
      if (radio) alvo.appendChild(aviso);
      else (c.closest(".opcao") || c).after(aviso);
    }
    aviso.textContent = msg;
    alvo.setAttribute("aria-invalid", "true");
    alvo.setAttribute("aria-describedby", idMsg);
  } else {
    if (aviso) aviso.remove();
    alvo.removeAttribute("aria-invalid");
    alvo.removeAttribute("aria-describedby");
  }
}

function validarCampo(c) {
  var msg = obterMensagem(c);
  mostrarEstado(c, msg);
  return msg === "";
}

// Valida todos os campos; foca o primeiro inválido e devolve true/false
export function validarFormulario(form) {
  var primeiro = null;
  Array.prototype.forEach.call(form.elements, function (c) {
    if (!/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName)) return;
    c.dataset.tocado = "1"; // a partir daqui valida a cada tecla digitada
    if (!validarCampo(c) && !primeiro) primeiro = c;
  });
  if (primeiro) primeiro.focus();
  return primeiro === null;
}

// Remove mensagens e classes de estado depois de enviar/limpar
export function limparEstados(form) {
  form.querySelectorAll(".msg-campo").forEach(function (m) { m.remove(); });
  form.querySelectorAll(".campo-erro, .campo-ok").forEach(function (el) {
    el.classList.remove("campo-erro", "campo-ok");
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  });
  form.querySelectorAll("[data-tocado]").forEach(function (el) { delete el.dataset.tocado; });
}

// Tempo real: ao sair do campo (focusout) ele passa a ser "tocado" e é
// validado; depois disso o evento "input" revalida a cada tecla. Em
// selects, radios e checkboxes o evento é "change".

export function iniciarValidacao() {
  document.addEventListener("input", function (e) {
    var campo = e.target;
    if (mascaras[campo.id]) campo.value = mascaras[campo.id](campo.value);
    if (campo.dataset && campo.dataset.tocado) validarCampo(campo);
  });

  document.addEventListener("focusout", function (e) {
    var c = e.target;
    if (!c.form || c.type === "radio" || !/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName)) return;
    c.dataset.tocado = "1";
    validarCampo(c);
  });
  document.addEventListener("change", function (e) {
    var c = e.target;
    if (!c.form || !/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName)) return;
    c.dataset.tocado = "1";
    validarCampo(c);
  });

}
