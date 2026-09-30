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
export function preencherComponentesDinamicos() {
  preencherLista("lista-trabalho", trabalho);
  preencherLista("lista-projetos", projetos);
  preencherLista("lista-campanhas", campanhas);
}

