import { lerCadastros } from './armazenamento.js';
import { criar } from './dom.js';

const rotulosArea = { educacao: 'Reforço escolar', alimentacao: 'Alimentação', eventos: 'Eventos' };

// Reconstrói a interface a partir do que está salvo. É chamada em toda
// renderização de rota, então também roda quando a página é aberta de novo.
export function renderizarHistorico() {
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

