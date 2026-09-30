var CHAVE = "semear:cadastros";

export function lerCadastros() {
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


export function adicionarCadastro(registro) {
  var lista = lerCadastros();
  lista.unshift(registro);
  salvarCadastros(lista.slice(0, 20));
}
export function limparCadastros() {
  try { localStorage.removeItem(CHAVE); } catch (err) { /* storage indisponível */ }
}
