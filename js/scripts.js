// Ponto de entrada: coordena módulos com dependências explícitas e sem ciclos.
import { iniciarRoteador } from './roteador.js';
import { preencherComponentesDinamicos } from './componentes.js';
import { criarGrafico } from './grafico.js';
import { renderizarHistorico } from './historico.js';
import { iniciarValidacao } from './validacao.js';
import { iniciarFormularios } from './formularios.js';
import { iniciarFeedback } from './feedback.js';

import { iniciarContraste } from './contraste.js';

iniciarContraste();
iniciarValidacao();
iniciarFormularios();
iniciarFeedback();
iniciarRoteador(function () {
  preencherComponentesDinamicos();
  renderizarHistorico();
  criarGrafico();
});

document.addEventListener('semear:contraste-alterado', criarGrafico);
