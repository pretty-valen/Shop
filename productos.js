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

  let filtroMarcasGorras = new Set();
  let filtroMarcasMQ = new Set();
  let filtroProductosMQ = new Set();
  let filtroTallasPijama = new Set();
  let filtroMarcasDep = new Set();
  let filtroTallasDep = new Set();

  fetch("https://admin-backend-ts85.onrender.com/productos")
    .then(res => res.json())
    .then(data => {
      productos = data;
      iniciarRenderizado();

      const mapFilters = [
        {
          cond: esLocionesPage,
          cat: "Lociones",
          container: "filtro-marcas",
          targetSet: filtroMarcasSet,
          renderId: "productos-lociones"
        },
        {
          cond: esGorrasPage,
          cat: "Gorras",
          container: "filtro-marcas-gorras",
          targetSet: filtroMarcasGorras,
          renderId: "productos-gorras"
        },
        {
          cond: esMaquillajePage,
          cat: "Maquillaje",
          container: "filtro-marcas-maquillaje",
          targetSet: filtroMarcasMQ,
          renderId: "productos-maquillaje"
        },
        {
          cond: esPijamaPage,
          cat: "Pijama",
          container: "filtro-tallas-pijama",
          targetSet: filtroTallasPijama,
          renderId: "productos-pijama",
          split: true
        },
        {
          cond: esDeportivaPage,
          cat: "Ropa Deportiva",
          container: "filtro-marcas-deportiva",
          targetSet: filtroMarcasDep,
          renderId: "productos-deportiva"
        }
      ];

      mapFilters.forEach(({ cond, cat, container, targetSet, renderId, split }) => {
        if (!cond) return;
        const cont = document.getElementById(container);
        if (!cont) return;
        cont.innerHTML = "";
        uniqueSorted(productos.filter(p => p.categoria === cat).flatMap(p => {
          const val = container.includes("tallas") ? p.talla : p.marcas;
          return split ? (val || "").split(",") : (val || []);
        })).forEach(valor => {
          const id = `${container}-${valor.replace(/\s+/g, '')}`;
          const chk = document.createElement("input");
          chk.type = "checkbox"; chk.id = id; chk.value = valor;
          chk.onchange = () => {
            chk.checked ? targetSet.add(valor) : targetSet.delete(valor);
            renderSection(renderId, cat);
          };
          const lbl = document.createElement("label");
          lbl.htmlFor = id; lbl.textContent = valor;
          cont.append(chk, lbl, document.createElement("br"));
        });
      });
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

    if (category === "Lociones" && filtroMarcasSet.size)
      lista = lista.filter(p => p.marcas && p.marcas.some(m => filtroMarcasSet.has(m)));
    if (category === "Gorras" && filtroMarcasGorras.size)
      lista = lista.filter(p => p.marcas && p.marcas.some(m => filtroMarcasGorras.has(m)));
    if (category === "Maquillaje" && filtroMarcasMQ.size)
      lista = lista.filter(p => p.marcas && p.marcas.some(m => filtroMarcasMQ.has(m)));
    if (category === "Pijama" && filtroTallasPijama.size)
      lista = lista.filter(p => p.talla && p.talla.split(',').some(t => filtroTallasPijama.has(t.trim())));
    if (category === "Ropa Deportiva" && filtroMarcasDep.size)
      lista = lista.filter(p => p.marcas && p.marcas.some(m => filtroMarcasDep.has(m)));

    cont.innerHTML = lista.map(p => renderProductCard(p)).join("");
    if (localStorage.getItem("isAdmin") === "true" && window.enableEditDelete) {
      window.enableEditDelete();
    }
  }
});
