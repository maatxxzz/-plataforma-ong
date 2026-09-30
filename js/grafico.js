import { criar } from './dom.js';

var grafico = null; // instância atual, para destruir antes de recriar
var atendimentos = {
  anos: ["2016", "2018", "2020", "2022", "2024", "2026"],
  criancas: [15, 60, 90, 140, 180, 200],
};

export function criarGrafico() {
  if (grafico) { grafico.destroy(); grafico = null; } // libera o canvas antigo (a rota foi trocada)
  var canvas = document.getElementById("grafico-atendimentos");
  if (!canvas) return; // só existe na rota "início"

  // Se o CDN falhar (sem internet ou bloqueado), o site continua funcionando
  if (typeof window.Chart === "undefined") {
    canvas.replaceWith(criar("p", "dica", "Não foi possível carregar o gráfico agora."));
    return;
  }

  // Reaproveita as cores e a fonte do design system (variáveis CSS)
  var css = getComputedStyle(document.documentElement);
  window.Chart.defaults.font.family = css.getPropertyValue("--fonte-texto");
  window.Chart.defaults.color = css.getPropertyValue("--neutro-700").trim();

  var opcoes = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: "Crianças" } } },
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) opcoes.animation = false;

  grafico = new window.Chart(canvas, {
    type: "bar",
    data: {
      labels: atendimentos.anos,
      datasets: [{
        label: "Crianças atendidas",
        data: atendimentos.criancas,
        backgroundColor: css.getPropertyValue("--cor-primaria").trim(),
        borderRadius: 4,
      }],
    },
    options: opcoes,
  });
}

