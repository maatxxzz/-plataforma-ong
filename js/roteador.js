const app = document.getElementById("app");

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
  var reconhecida = Object.hasOwn(titulos, bruto);
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
function renderizarRota(aposRenderizar) {
  var atual = lerHash();
  var template = document.getElementById("rota-" + atual.rota);

  if (!template) {
    app.innerHTML = "<h1>Página não encontrada</h1><p>Volte para o <a href=\"#/inicio\">início</a>.</p>";
    return;
  }

  document.dispatchEvent(new Event("semear:antes-de-navegar"));

  // Limpa o container alvo e injeta o novo conteúdo (clone do template)
  app.replaceChildren(template.content.cloneNode(true));
  aposRenderizar();

  document.title = titulos[atual.rota] + " | Instituto Semear";
  marcarLinkAtivo(atual.rota);
  // Anuncia a nova página pelo foco, sem tornar todo o main uma região live.
  var titulo = app.querySelector("h1");
  if (titulo) { titulo.tabIndex = -1; titulo.focus({ preventScroll: true }); }

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


export function iniciarRoteador(aposRenderizar) {
  window.addEventListener("hashchange", function () {
    if (window.location.hash !== "#app") renderizarRota(aposRenderizar);
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest("#menu-principal a")) {
      document.getElementById("menu-toggle").checked = false;
      var detalhes = document.querySelector(".tem-submenu details");
      if (detalhes) detalhes.open = false;
    }
    if (e.target.closest(".pular")) { e.preventDefault(); app.focus(); }
  });
  renderizarRota(aposRenderizar);
}
