export function criar(tag, classe, texto) {
  var el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto; // textContent evita injetar HTML digitado pelo usuário
  return el;
}

