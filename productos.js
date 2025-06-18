function verDetalleProducto(id) {
  const origen = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  localStorage.setItem("productoSeleccionado", JSON.stringify({ id, origen }));
  window.location.href = "visualizacion.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const KEY = "catalogoProductos";
  let productos = [];

  const contIndex = document.getElementById("productos-destacados");
  const esIndexPage = !!contIndex;
  const esLocionesPage = !!document.getElementById("filtros-lociones");
  const esGorrasPage = !!document.getElementById("filtros-gorras");
  const esMaquillajePage = !!document.getElementById("filtros-maquillaje");
  const esPijamaPage = !!document.getElementById("filtros-pijama");
  const esDeportivaPage = !!document.getElementById("filtros-deportiva");

  let filtroGenero = "";
  let filtroMarcasSet = new Set();
  let filtroPrecioLoc = "";
  let filtroDescuentoLoc = false;

  fetch("https://admin-backend-ts85.onrender.com/productos")
    .then(res => res.json())
    .then(data => {
      productos = data;
      iniciarRenderizado();

      if (esLocionesPage) {
        const contMar = document.getElementById("filtro-marcas");
        contMar.innerHTML = "";
        uniqueSorted(productos.filter(p => p.categoria === "Lociones").flatMap(p => p.marcas || []))
          .forEach(marca => {
            const id = "m-" + marca.replace(/\s+/g, "");
            const chk = document.createElement("input");
            chk.type = "checkbox"; chk.id = id; chk.value = marca;
            chk.onchange = () => {
              chk.checked ? filtroMarcasSet.add(marca) : filtroMarcasSet.delete(marca);
              renderSection("productos-lociones", "Lociones");
            };
            const lbl = document.createElement("label");
            lbl.htmlFor = id; lbl.textContent = marca;
            contMar.append(chk, lbl, document.createElement("br"));
          });
      }
    })
    .catch(err => {
      console.error("Error cargando productos:", err);
      productos = [];
    });

  function iniciarRenderizado() {
    if (esIndexPage) {
      renderMixed();
    } else {
      [
        { id: "productos-lociones", cat: "Lociones" },
        { id: "productos-gorras", cat: "Gorras" },
        { id: "productos-maquillaje", cat: "Maquillaje" },
        { id: "productos-pijama", cat: "Pijama" },
        { id: "productos-deportiva", cat: "Ropa Deportiva" }
      ].forEach(({ id, cat }) => {
        if (document.getElementById(id)) renderSection(id, cat);
      });
    }
  }

  document.getElementById("contenedor-productos")?.addEventListener("click", e => {
    const btn = e.target.closest(".eliminar-btn");
    const card = e.target.closest(".producto-card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    if (btn) {
      fetch(`https://admin-backend-ts85.onrender.com/productos/${id}`, {
        method: "DELETE"
      }).then(() => location.reload());
      return;
    }
    const origen = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    localStorage.setItem("productoSeleccionado", JSON.stringify({ id, origen }));
    location.href = "visualizacion.html";
  });

  function uniqueSorted(arr) {
    return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  function renderMixed() {
    const mixed = productos
      .filter(p => ["Lociones", "Gorras", "Maquillaje", "Pijama", "Ropa Deportiva"].includes(p.categoria))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    const cont = document.getElementById("productos-destacados");
    if (cont) cont.innerHTML = mixed.map(p => renderProductCard(p)).join("");
  }

  function renderProductCard(p) {
    const hasDesc = p.descuento > 0;
    const precioAct = hasDesc
      ? (p.precio * (1 - p.descuento / 100)).toFixed(2)
      : p.precio.toFixed(2);
    return `
      <div class="producto-card"
           style="cursor:pointer"
           data-id="${p._id || p.id}"
           data-genero="${p.genero || ''}"
           data-tallas="${(p.talla || '').toUpperCase()}"
           data-precio="${p.precio}"
           data-descuento="${p.descuento || 0}">
        <img src="${p.fotos[0] || ''}" alt="${p.nombre}">
        <div class="producto-info">
          <h4>${p.nombre}</h4>
          ${p.marcas && p.marcas.length ? `<p class="marca">Marca: ${p.marcas.join(', ')}</p>` : ''}
          ${p.productos && p.productos.length ? `<p class="tipo">Producto: ${p.productos.join(', ')}</p>` : ''}
          ${hasDesc
            ? `<p class="precio-ant">Precio anterior: $${p.precio.toFixed(2)}</p>
               <p class="precio-act">Precio ahora: $${precioAct}</p>
               <p class="descuento">Descuento: ${p.descuento}%</p>`
            : `<p class="precio-act">Precio: $${precioAct}</p>`}
          <p class="categoria">${p.categoria}</p>
        </div>
      </div>
    `;
  }

  function renderSection(sectionId, category) {
    const cont = document.getElementById(sectionId);
    if (!cont) return;
    let lista = productos.filter(p => p.categoria === category);

    if (category === "Lociones") {
      if (filtroGenero) lista = lista.filter(p => p.genero === filtroGenero);
      if (filtroDescuentoLoc) lista = lista.filter(p => p.descuento > 0);
      if (filtroMarcasSet.size) lista = lista.filter(p => p.marcas && p.marcas.some(m => filtroMarcasSet.has(m)));
      if (filtroPrecioLoc === "asc") lista.sort((a, b) => a.precio - b.precio);
      if (filtroPrecioLoc === "desc") lista.sort((a, b) => b.precio - a.precio);
    }

    cont.innerHTML = lista.map(p => renderProductCard(p)).join("");
    if (localStorage.getItem("isAdmin") === "true" && window.enableEditDelete) {
      window.enableEditDelete();
    }
  }
});
