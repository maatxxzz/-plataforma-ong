// js/scripts.js
// Roteador da Single Page Application (SPA) do Instituto Semear.
// Não há requisição ao servidor a cada navegação: o conteúdo de cada
// "página" já está embutido no próprio index.html, dentro de elementos
// <template>. O roteador só troca o que aparece em <main id="app">.

(function () {
  "use strict";

  var app = document.getElementById("app");

  // ---------------------------------------------------------------------
  // Sistema de templates: dados de origem (arrays de objetos) que
  // alimentam os componentes repetitivos da tela (cards). Em vez de
  // escrever cada <article> manualmente no HTML, cada card é gerado a
  // partir de um objeto de dados, usando Template Literals.
  // ---------------------------------------------------------------------

  var trabalho = [
    { titulo: "Reforço escolar", texto: "Aulas de leitura e matemática em três turnos." },
    { titulo: "Alimentação", texto: "Café da manhã e almoço para 200 crianças." },
    { titulo: "Apoio às famílias", texto: "Orientação sobre benefícios e documentos." },
  ];

  var projetos = [
    { badge: "badge-educacao", rotulo: "Educação", titulo: "Semear Leitura", texto: "Rodas de leitura e biblioteca comunitária aos sábados." },
    { badge: "badge-alimentacao", rotulo: "Alimentação", titulo: "Prato Cheio", texto: "Refeições diárias e oficinas de alimentação saudável." },
    { badge: "badge-educacao", rotulo: "Educação", titulo: "Futuro em Cartaz", texto: "Orientação para jovens sobre estudo e primeiro emprego." },
  ];

  var campanhas = [
    { badges: [{ classe: "badge-doacao", rotulo: "Doação" }, { classe: "badge-urgente", rotulo: "Urgente" }],
      titulo: "Kit material escolar", texto: "R$ 60 garantem cadernos, lápis e mochila para uma criança." },
    { badges: [{ classe: "badge-doacao", rotulo: "Doação" }],
      titulo: "Semana de refeições", texto: "R$ 30 garantem uma semana de almoço para uma criança." },
  ];

  // Converte um objeto de dados em um <article> (Template Literal),
  // aceitando 0, 1 ou vários selos (badge) por card
  function cardHTML(item) {
    var selos = "";
    if (item.badge) {
      selos = '<span class="badge ' + item.badge + '">' + item.rotulo + "</span>";
    } else if (item.badges) {
      selos = item.badges
        .map(function (b) { return '<span class="badge ' + b.classe + '">' + b.rotulo + "</span>"; })
        .join(" ");
    }
    return (
      "<article>" +
      selos +
      "<h3>" + item.titulo + "</h3>" +
      "<p>" + item.texto + "</p>" +
      "</article>"
    );
  }

  // Percorre um array com .map(), converte cada item em HTML e injeta
  // tudo de uma vez no contêiner, via innerHTML
  function preencherLista(idContainer, lista) {
    var container = document.getElementById(idContainer);
    if (!container) return; // o contêiner só existe quando a rota certa está na tela
    container.innerHTML = lista.map(cardHTML).join("");
  }

  // Gera os três blocos de cards dinâmicos (chamada depois de cada
  // renderização de rota; cada função verifica se seu contêiner existe
  // na tela antes de preencher, então não há problema em chamar sempre)
  function preencherComponentesDinamicos() {
    preencherLista("lista-trabalho", trabalho);
    preencherLista("lista-projetos", projetos);
    preencherLista("lista-campanhas", campanhas);
    renderizarHistorico();
  }

  // Título de cada rota, para atualizar <title> e a acessibilidade
  var titulos = {
    inicio: "Início",
    sobre: "Sobre",
    projetos: "Projetos",
    cadastro: "Participe",
  };

  // Lê a rota atual a partir do hash da URL, no formato #/rota ou #/rota/ancora
  function lerHash() {
    var hash = window.location.hash.replace(/^#\/?/, ""); // remove "#" ou "#/"
    var partes = hash.split("/").filter(Boolean); // remove vazios
    var bruto = partes[0] || "inicio";
    var ancora = partes[1] || null;
    var reconhecida = Boolean(titulos[bruto]);
    var rota = reconhecida ? bruto : "inicio";
    return { rota: rota, ancora: ancora, reconhecida: reconhecida || !partes[0] };
  }

  // Marca o link do menu correspondente à rota atual, para leitores de tela
  // e para o destaque visual (mesmo papel que o aria-current fazia antes,
  // quando cada página HTML era um arquivo separado)
  function marcarLinkAtivo(rota) {
    // Só os itens diretos do menu principal recebem aria-current;
    // os links do submenu (.submenu) apontam para a mesma rota com
    // âncoras diferentes e não devem repetir a marcação
    document.querySelectorAll("#menu-principal > ul > li > a[data-rota]").forEach(function (a) {
      if (a.dataset.rota === rota) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
    // "Projetos" não tem um <a> direto no menu principal (é um <summary>
    // que abre o submenu), então a marcação dele é tratada à parte
    var resumo = document.querySelector(".tem-submenu summary");
    if (resumo) {
      if (rota === "projetos") resumo.setAttribute("aria-current", "page");
      else resumo.removeAttribute("aria-current");
    }
  }

  // Função principal: limpa o contêiner alvo (#app) e injeta o fragmento
  // de HTML correspondente à rota, clonado do <template> respectivo
  function renderizarRota() {
    var atual = lerHash();
    var template = document.getElementById("rota-" + atual.rota);

    if (!template) {
      app.innerHTML = "<h1>Página não encontrada</h1><p>Volte para o <a href=\"#/inicio\">início</a>.</p>";
      return;
    }

    // Limpa o container alvo e injeta o novo conteúdo (clone do template)
    app.replaceChildren(template.content.cloneNode(true));
    preencherComponentesDinamicos();

    document.title = titulos[atual.rota] + " | Instituto Semear";
    marcarLinkAtivo(atual.rota);

    // Se a rota pedia uma âncora específica (ex.: #/projetos/t-vol),
    // rola a tela até o elemento com esse id depois de o conteúdo existir
    if (atual.ancora) {
      var alvo = document.getElementById(atual.ancora);
      if (alvo) {
        alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Intercepta a navegação: o evento "hashchange" dispara sempre que o
  // usuário clica em um link #/... ou usa voltar/avançar do navegador,
  // sem recarregar o documento inteiro.
  // Exceção: o link "Pular para o conteúdo" aponta para "#app" (o próprio
  // main), que não é uma rota. Nesse caso deixamos o navegador fazer o
  // salto de foco normal, sem trocar o conteúdo exibido.
  // ---------------------------------------------------------------------
  // Eventos de interação com EVENT DELEGATION: os listeners ficam no
  // document (que nunca é substituído) e usam e.target / closest() para
  // descobrir qual elemento disparou. Assim funcionam também nos
  // formulários e botões que só passam a existir depois que o roteador
  // clona o <template> para dentro de #app.
  // ---------------------------------------------------------------------

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

  document.addEventListener("input", function (e) {
    var campo = e.target;
    if (mascaras[campo.id]) campo.value = mascaras[campo.id](campo.value);
    if (campo.dataset && campo.dataset.tocado) validarCampo(campo);
  });

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
  function validarFormulario(form) {
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
  function limparEstados(form) {
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

  // Toast: aviso temporário criado dinamicamente no canto da tela
  var timerToast = null;
  function mostrarToast(mensagem) {
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
  var formPendente = null;
  function abrirModal(form) {
    var valor = Number(form.elements["valor"].value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    formPendente = form;
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
    formPendente = null;
  }

  // ---------------------------------------------------------------------
  // Persistência com localStorage: histórico dos cadastros enviados.
  // O localStorage só guarda strings, então o array de objetos é
  // convertido com JSON.stringify ao gravar e reconstruído com
  // JSON.parse ao ler.
  // ---------------------------------------------------------------------
  var CHAVE = "semear:cadastros";
  var rotulosArea = { educacao: "Reforço escolar", alimentacao: "Alimentação", eventos: "Eventos" };

  function lerCadastros() {
    try {
      var bruto = localStorage.getItem(CHAVE);          // string ou null
      var lista = bruto ? JSON.parse(bruto) : [];        // string -> array
      return Array.isArray(lista) ? lista : [];          // garante a estrutura esperada
    } catch (err) {
      return []; // JSON corrompido ou storage indisponível: começa vazio
    }
  }

  function salvarCadastros(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista)); // array -> string
    } catch (err) { /* modo privado ou cota cheia: o site segue funcionando */ }
  }

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
    var lista = lerCadastros();       // get + parse
    lista.unshift(registro);          // o mais recente primeiro
    salvarCadastros(lista.slice(0, 20)); // stringify + set (guarda no máximo 20)
  }

  function criar(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto; // textContent evita injetar HTML digitado pelo usuário
    return el;
  }

  // Reconstrói a interface a partir do que está salvo. É chamada em toda
  // renderização de rota, então também roda quando a página é aberta de novo.
  function renderizarHistorico() {
    var container = document.getElementById("historico");
    if (!container) return;
    var lista = lerCadastros();
    var botao = document.querySelector('[data-acao="limpar-historico"]');
    if (botao) botao.hidden = lista.length === 0;

    if (!lista.length) {
      container.replaceChildren(criar("p", "dica", "Nenhum cadastro enviado neste navegador ainda."));
      return;
    }
    container.replaceChildren.apply(container, lista.map(function (r) {
      var card = criar("article");
      var ehVol = r.tipo === "voluntario";
      card.append(
        criar("span", "badge " + (ehVol ? "badge-voluntario" : "badge-doacao"), ehVol ? "Voluntário" : "Doador"),
        criar("h3", "", r.nome),
        criar("p", "", ehVol
          ? "Área: " + (rotulosArea[r.area] || r.area)
          : Number(r.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) +
            (r.frequencia === "mensal" ? " por mês" : " (doação única)")),
        criar("p", "dica", new Date(r.data).toLocaleString("pt-BR"))
      );
      return card;
    }));
  }

  function limparCadastros() {
    try { localStorage.removeItem(CHAVE); } catch (err) { /* ignora */ }
    renderizarHistorico();
  }

  // Conclui o envio: mostra o alerta de sucesso, limpa o formulário e avisa com toast
  function concluirEnvio(form) {
    var ok = document.querySelector(".alerta-sucesso");
    if (ok) ok.hidden = false;
    registrarCadastro(form); // antes do reset(), enquanto os campos ainda têm valor
    form.reset();
    limparEstados(form);
    renderizarHistorico();
    mostrarToast("Cadastro enviado com sucesso!");
  }

  // Evento "submit": preventDefault() impede o envio/recarregamento da página
  // e a validação passa a ser feita pelo JavaScript (Constraint Validation API)
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    var form = e.target;
    var erro = document.querySelector(".alerta-erro");
    var ok = document.querySelector(".alerta-sucesso");

    if (!validarFormulario(form)) {
      if (ok) ok.hidden = true;
      if (erro) erro.hidden = false;
      return;
    }
    if (erro) erro.hidden = true;

    var freq = form.elements["frequencia"];
    if (freq && freq.value === "mensal") {
      abrirModal(form); // doação recorrente pede confirmação antes de enviar
      return;
    }
    concluirEnvio(form);
  });

  // Evento "click" delegado: botões com data-acao, links do menu e "pular conteúdo"
  document.addEventListener("click", function (e) {
    var acao = e.target.closest("[data-acao]");
    if (acao) {
      var tipo = acao.dataset.acao;
      if (tipo === "fechar-toast") fecharToast();
      if (tipo === "cancelar-modal") fecharModal();
      if (tipo === "limpar-historico") { limparCadastros(); mostrarToast("Histórico apagado."); }
      if (tipo === "confirmar-modal") {
        var form = formPendente;
        fecharModal();
        if (form) concluirEnvio(form);
      }
      return;
    }

    // Clicar em um link do menu fecha o menu hambúrguer e o submenu
    if (e.target.closest("#menu-principal a")) {
      document.getElementById("menu-toggle").checked = false;
      var detalhes = document.querySelector(".tem-submenu details");
      if (detalhes) detalhes.open = false;
    }

    // "Pular para o conteúdo": preventDefault evita mudar o hash (que
    // acionaria o roteador) e o foco vai direto para o <main>
    if (e.target.closest(".pular")) {
      e.preventDefault();
      app.focus();
    }
  });

  // Tecla Esc fecha o modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModal();
  });

  window.addEventListener("hashchange", function () {
    if (lerHash().reconhecida) renderizarRota();
  });
  window.addEventListener("DOMContentLoaded", renderizarRota);
})();
