const CHAVE = "semear:cadastros";

function registroValido(r) {
  if (!r || typeof r !== "object" || typeof r.nome !== "string" ||
      typeof r.email !== "string" || typeof r.data !== "string" ||
      !Number.isFinite(Date.parse(r.data))) return false;
  if (r.tipo === "voluntario") return ["educacao", "alimentacao", "eventos"].includes(r.area);
  return r.tipo === "doador" && Number.isFinite(r.valor) && r.valor >= 5 &&
    ["unica", "mensal"].includes(r.frequencia);
}

export function lerCadastros() {
  try {
    var bruto = localStorage.getItem(CHAVE);
    var lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter(registroValido).slice(0, 20) : [];
  } catch (err) {
    return []; // JSON corrompido ou storage indisponível não interrompe a interface.
  }
}

export function adicionarCadastro(registro) {
  if (!registroValido(registro)) return false;
  try {
    var lista = lerCadastros();
    lista.unshift(registro);
    localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 20)));
    return true;
  } catch (err) {
    return false; // O chamador informa a falha e preserva os campos.
  }
}

export function limparCadastros() {
  try { localStorage.removeItem(CHAVE); return true; }
  catch (err) { return false; }
}
