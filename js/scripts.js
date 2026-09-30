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
  window.addEventListener("hashchange", function () {
    if (lerHash().reconhecida) renderizarRota();
  });
  window.addEventListener("DOMContentLoaded", renderizarRota);
})();
