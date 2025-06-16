// rotate.js
document.addEventListener("DOMContentLoaded", () => {
  const KEY_IDS = "highlightIds";
  const KEY_TS  = "highlightTs";
  const DIA_MS  = 24 * 3600 * 1000;

  // 1) Cargo el catálogo completo
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos") || "[]")
    // filtro solo productos válidos
    .filter(p => p.nombre && Array.isArray(p.fotos) && p.fotos.length > 0);

  const maxDisplay = Math.min(5, catalogo.length);

  // 2) Leo cache previa (solo IDs) y timestamp
  let ids = JSON.parse(localStorage.getItem(KEY_IDS) || "[]");
  let ts  = parseInt(localStorage.getItem(KEY_TS) || "0", 10);

  // 3) Decido si regenerar:
  //    - nunca hubo selección
  //    - cambió el nº de productos
  //    - expiró (>24h)
  const needRegen =
    !ids.length ||
    ids.length !== maxDisplay ||
    (Date.now() - ts) > DIA_MS;

  if (needRegen) {
    // construyo pool duplicando con descuento
    const pool = catalogo.flatMap(p => p.descuento > 0 ? [p, p] : [p]);
    const nextIds = [];
    while (nextIds.length < maxDisplay && pool.length) {
      const idx  = Math.floor(Math.random() * pool.length);
      const pick = pool.splice(idx, 1)[0];
      if (!nextIds.includes(pick.id)) nextIds.push(pick.id);
    }
    ids = nextIds;
    localStorage.setItem(KEY_IDS, JSON.stringify(ids));
    localStorage.setItem(KEY_TS, Date.now().toString());
  }

  // 4) Render en #productos-destacados
  const container = document.getElementById("productos-destacados");
  if (!container) return;
  container.innerHTML = "";

  // por cada ID reconstruyo el objeto desde el catálogo
  ids.forEach(id => {
    const p = catalogo.find(x => x.id === id);
    if (!p) return;
    const card = document.createElement("div");
    card.className   = "producto-card";
    card.dataset.id  = p.id;
    card.innerHTML   = `
      <img src="${p.fotos[0]}" alt="${p.nombre}">
      <div class="producto-info">
        <h4>${p.nombre}</h4>
        ${
          p.descuento > 0
  ? `<p class="precio-anterior">Precio anterior: $${p.precio.toFixed(2)}</p>
     <p class="precio">Precio ahora: $${(p.precio*(1-p.descuento/100)).toFixed(2)}</p>
     <p class="descuento">Descuento: ${p.descuento}%</p>`
  : `<p class="precio">Precio: $${p.precio.toFixed(2)}</p>`

        }
        <p class="origen">${p.categoria}</p>
      </div>`;
    container.appendChild(card);
  });
});
