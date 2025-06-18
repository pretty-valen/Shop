// productos.js
document.addEventListener("DOMContentLoaded", () => {
  let productos = [];

  // Detectar en qué página estamos
  const esIndexPage      = !!document.getElementById("productos-destacados");
  const esLocionesPage   = !!document.getElementById("filtros-lociones");
  const esGorrasPage     = !!document.getElementById("filtros-gorras");
  const esMaquillajePage = !!document.getElementById("filtros-maquillaje");
  const esPijamaPage     = !!document.getElementById("filtros-pijama");
  const esDeportivaPage  = !!document.getElementById("filtros-deportiva");

  // Variables de filtro
  // Lociones
  let filtroGeneroLoc    = "";
  let filtroMarcasLoc    = new Set();
  let filtroOrdenPrecioLoc = "";
  let filtroDescuentoLoc   = false;
  // Gorras
  let filtroOrdenPrecioG  = "";
  let filtroDescuentoG    = false;
  // Maquillaje
  let filtroMarcasMQ      = new Set();
  let filtroProductosMQ   = new Set();
  let filtroOrdenPrecioMQ = "";
  let filtroDescuentoMQ   = false;
  let filtroPackMQ        = false;
  // Pijama
  let filtroOrdenPrecioPJ = "";
  let filtroDescuentoPJ   = false;
  let filtroTallasPJ      = new Set();
  let filtroGeneroPJ      = "";
  // Deportiva
  let filtroGeneroDep     = "";
  let filtroMarcasDep     = new Set();
  let filtroTallasDep     = new Set();
  let filtroOrdenPrecioDep = "";
  let filtroDescuentoDep   = false;

  // Cargar productos desde el backend
  fetch("https://admin-backend-ts85.onrender.com/productos")
    .then(res => res.json())
    .then(data => {
      productos = data;
      localStorage.setItem("catalogoProductos", JSON.stringify(data));
      montarFiltros();
      iniciarRenderizado();
    })
    .catch(err => {
      console.error("Error cargando productos:", err);
      productos = [];
    });

  // Genera dinámicamente los controles de filtro de cada página
  function montarFiltros() {
    // === LOCIONES ===
    if (esLocionesPage) {
      // Género
      document.getElementById("filtro-genero").addEventListener("change", e => {
        filtroGeneroLoc = e.target.value;
        renderSection("productos-lociones", "Lociones");
      });
      // Orden precio
      document.getElementById("filtro-precio").addEventListener("change", e => {
        filtroOrdenPrecioLoc = e.target.value;
        renderSection("productos-lociones", "Lociones");
      });
      // Solo con descuento
      document.getElementById("filtro-descuento").addEventListener("change", e => {
        filtroDescuentoLoc = e.target.checked;
        renderSection("productos-lociones", "Lociones");
      });
      // Reset filtros
      document.getElementById("btn-reset-filtros").addEventListener("click", () => {
        filtroGeneroLoc = "";
        filtroOrdenPrecioLoc = "";
        filtroDescuentoLoc = false;
        filtroMarcasLoc.clear();
        document.getElementById("filtro-genero").value = "";
        document.getElementById("filtro-precio").value = "";
        document.getElementById("filtro-descuento").checked = false;
        document.querySelectorAll("#filtro-marcas input").forEach(cb => cb.checked = false);
        renderSection("productos-lociones", "Lociones");
      });
      // Marcas dinámicas
      const marcasLoc = uniqueSorted(
        productos.filter(p => p.categoria === "Lociones").flatMap(p => p.marcas || [])
      );
      const contM = document.getElementById("filtro-marcas");
      contM.innerHTML = "";
      marcasLoc.forEach(marca => {
        const id = "loc-" + marca.replace(/\s+/g, "");
        const chk = document.createElement("input");
        chk.type = "checkbox"; chk.id = id; chk.value = marca;
        chk.addEventListener("change", () => {
          chk.checked ? filtroMarcasLoc.add(marca) : filtroMarcasLoc.delete(marca);
          renderSection("productos-lociones", "Lociones");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = marca;
        contM.append(chk, lbl, document.createElement("br"));
      });
    }

    // === GORRAS ===
    if (esGorrasPage) {
      // Orden precio
      document.getElementById("sort-precio-gorras").addEventListener("change", e => {
        filtroOrdenPrecioG = e.target.value;
        renderSection("productos-gorras", "Gorras");
      });
      // Solo con descuento
      document.getElementById("filter-descuento-gorras").addEventListener("change", e => {
        filtroDescuentoG = e.target.checked;
        renderSection("productos-gorras", "Gorras");
      });
    }

    // === MAQUILLAJE ===
    if (esMaquillajePage) {
      // Dinámico: marcas
      const marcasMQ = uniqueSorted(
        productos.filter(p => p.categoria === "Maquillaje").flatMap(p => p.marcas || [])
      );
      const contMM = document.getElementById("filter-brand-container");
      marcasMQ.forEach(marca => {
        const id = "mq-" + marca.replace(/\s+/g, "");
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.id = id; cb.value = marca;
        cb.addEventListener("change", () => {
          cb.checked ? filtroMarcasMQ.add(marca) : filtroMarcasMQ.delete(marca);
          renderSection("productos-maquillaje", "Maquillaje");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = marca;
        contMM.append(cb, lbl, document.createElement("br"));
      });
      // Dinámico: productos
      const tiposMQ = uniqueSorted(
        productos.filter(p => p.categoria === "Maquillaje")
                 .flatMap(p => p.productos || [])
      );
      const contPM = document.getElementById("filter-product-container");
      tiposMQ.forEach(prod => {
        const id = "pr-" + prod.replace(/\s+/g, "");
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.id = id; cb.value = prod;
        cb.addEventListener("change", () => {
          cb.checked ? filtroProductosMQ.add(prod) : filtroProductosMQ.delete(prod);
          renderSection("productos-maquillaje", "Maquillaje");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = prod;
        contPM.append(cb, lbl, document.createElement("br"));
      });
      // Orden precio
      document.getElementById("filter-price-order").addEventListener("change", e => {
        filtroOrdenPrecioMQ = e.target.value;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      // Solo con descuento
      document.getElementById("filter-discount").addEventListener("change", e => {
        filtroDescuentoMQ = e.target.checked;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      // Pack
      document.getElementById("filter-pack").addEventListener("change", e => {
        filtroPackMQ = e.target.checked;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      // Limpiar
      document.getElementById("clear-filters").addEventListener("click", () => {
        filtroMarcasMQ.clear();
        filtroProductosMQ.clear();
        filtroOrdenPrecioMQ = "none";
        filtroDescuentoMQ = false;
        filtroPackMQ = false;
        document.querySelectorAll("#filter-brand-container input, #filter-product-container input").forEach(cb => cb.checked = false);
        document.getElementById("filter-price-order").value = "none";
        document.getElementById("filter-discount").checked = false;
        document.getElementById("filter-pack").checked = false;
        renderSection("productos-maquillaje", "Maquillaje");
      });
    }

    // === PIJAMA ===
    if (esPijamaPage) {
      // Dinámico: tallas
      const tallasPJ = uniqueSorted(
        productos.filter(p => p.categoria === "Pijama")
                 .flatMap(p => (p.talla || "").split(","))
      );
      const contTP = document.getElementById("tallas-lista");
      tallasPJ.forEach(t => {
        const talla = t.trim();
        if (!talla) return;
        const id = "pj-" + talla;
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.id = id; cb.value = talla;
        cb.addEventListener("change", () => {
          cb.checked ? filtroTallasPJ.add(talla) : filtroTallasPJ.delete(talla);
          renderSection("productos-pijama", "Pijama");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = talla;
        contTP.append(cb, lbl, document.createElement("br"));
      });
      // Orden precio
      document.getElementById("filter-price-pijama").addEventListener("change", e => {
        filtroOrdenPrecioPJ = e.target.value;
        renderSection("productos-pijama", "Pijama");
      });
      // Solo con descuento
      document.getElementById("filter-discount-pijama").addEventListener("change", e => {
        filtroDescuentoPJ = e.target.checked;
        renderSection("productos-pijama", "Pijama");
      });
      // Género
      document.getElementById("filtro-genero-pijama").addEventListener("change", e => {
        filtroGeneroPJ = e.target.value;
        renderSection("productos-pijama", "Pijama");
      });
      // Limpiar
      document.getElementById("clear-filters-pijama").addEventListener("click", () => {
        filtroOrdenPrecioPJ = "none";
        filtroDescuentoPJ = false;
        filtroTallasPJ.clear();
        filtroGeneroPJ = "";
        document.getElementById("filter-price-pijama").value = "none";
        document.getElementById("filter-discount-pijama").checked = false;
        document.getElementById("filtro-genero-pijama").value = "";
        document.querySelectorAll("#tallas-lista input").forEach(cb => cb.checked = false);
        renderSection("productos-pijama", "Pijama");
      });
    }

    // === ROPA DEPORTIVA ===
    if (esDeportivaPage) {
      // Género
      document.getElementById("filtro-genero-deportiva").addEventListener("change", e => {
        filtroGeneroDep = e.target.value;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
      // Dinámico: marcas
      const marcasDep = uniqueSorted(
        productos.filter(p => p.categoria === "Ropa Deportiva").flatMap(p => p.marcas || [])
      );
      const contMD = document.getElementById("filtro-marcas-deportiva");
      marcasDep.forEach(m => {
        const id = "dep-" + m.replace(/\s+/g, "");
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.id = id; cb.value = m;
        cb.addEventListener("change", () => {
          cb.checked ? filtroMarcasDep.add(m) : filtroMarcasDep.delete(m);
          renderSection("productos-deportiva", "Ropa Deportiva");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = m;
        contMD.append(cb, lbl, document.createElement("br"));
      });
      // Dinámico: tallas
      const tallasDepList = uniqueSorted(
        productos.filter(p => p.categoria === "Ropa Deportiva")
                 .flatMap(p => (p.talla || "").split(","))
      );
      const contTD = document.getElementById("filtro-tallas-deportiva");
      tallasDepList.forEach(t => {
        const talla = t.trim();
        if (!talla) return;
        const id = "dep-t-" + talla;
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.id = id; cb.value = talla;
        cb.addEventListener("change", () => {
          cb.checked ? filtroTallasDep.add(talla) : filtroTallasDep.delete(talla);
          renderSection("productos-deportiva", "Ropa Deportiva");
        });
        const lbl = document.createElement("label");
        lbl.htmlFor = id; lbl.textContent = talla;
        contTD.append(cb, lbl, document.createElement("br"));
      });
      // Orden precio
      document.getElementById("filtro-precio-deportiva").addEventListener("change", e => {
        filtroOrdenPrecioDep = e.target.value;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
      // Solo con descuento
      document.getElementById("filtro-descuento-deportiva").addEventListener("change", e => {
        filtroDescuentoDep = e.target.checked;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
      // Limpiar
      document.getElementById("btn-reset-filtros-deportiva").addEventListener("click", () => {
        filtroGeneroDep = "";
        filtroMarcasDep.clear();
        filtroTallasDep.clear();
        filtroOrdenPrecioDep = "";
        filtroDescuentoDep = false;
        document.getElementById("filtro-genero-deportiva").value = "";
        document.getElementById("filtro-precio-deportiva").value = "";
        document.getElementById("filtro-descuento-deportiva").checked = false;
        document.querySelectorAll("#filtro-marcas-deportiva input, #filtro-tallas-deportiva input")
          .forEach(cb => cb.checked = false);
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
    }
  }

  // Inicialización de la vista
  function iniciarRenderizado() {
    if (esIndexPage) {
      renderMixed();
    } else {
      const secciones = [
        { id: "productos-lociones",   cat: "Lociones" },
        { id: "productos-gorras",     cat: "Gorras" },
        { id: "productos-maquillaje", cat: "Maquillaje" },
        { id: "productos-pijama",     cat: "Pijama" },
        { id: "productos-deportiva",  cat: "Ropa Deportiva" }
      ];
      secciones.forEach(({ id, cat }) => {
        if (document.getElementById(id)) renderSection(id, cat);
      });
    }
  }

  // Render aleatorio para la home
  function renderMixed() {
    const mixed = productos
      .filter(p => ["Lociones","Gorras","Maquillaje","Pijama","Ropa Deportiva"].includes(p.categoria))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    document.getElementById("productos-destacados").innerHTML =
      mixed.map(renderProductCard).join("");
  }

  // Plantilla de cada tarjeta
  function renderProductCard(p) {
    const hasDesc = p.descuento > 0;
    const precioAct = hasDesc
      ? (p.precio * (1 - p.descuento/100)).toFixed(2)
      : p.precio.toFixed(2);
    return `
      <div class="producto-card"
           onclick="verDetalleProducto('${p._id || p.id}')"
           data-id="${p._id||p.id}"
           data-genero="${p.genero||''}"
           data-tallas="${(p.talla||'').toUpperCase()}"
           data-precio="${p.precio}"
           data-descuento="${p.descuento||0}"
           style="cursor:pointer">
        <img src="${p.fotos[0]||''}" alt="${p.nombre}">
        <div class="producto-info">
          <h4>${p.nombre}</h4>
          ${p.marcas?.length ? `<p class="marca">Marca: ${p.marcas.join(", ")}</p>` : ""}
          ${p.productos?.length ? `<p class="tipo">Producto: ${p.productos.join(", ")}</p>` : ""}
          ${hasDesc
            ? `<p class="precio-ant">Precio anterior: $${p.precio.toFixed(2)}</p>
               <p class="precio-act">Precio: $${precioAct}</p>
               <p class="descuento">Descuento: ${p.descuento}%</p>`
            : `<p class="precio-act">Precio: $${precioAct}</p>`}
          <p class="categoria">${p.categoria}</p>
        </div>
      </div>
    `;
  }

  // Render dinámico según filtros
  function renderSection(sectionId, category) {
    const cont = document.getElementById(sectionId);
    if (!cont) return;
    let lista = productos.filter(p => p.categoria === category);

    // LOCIONES
    if (category === "Lociones") {
      if (filtroGeneroLoc) lista = lista.filter(p => p.genero === filtroGeneroLoc);
      if (filtroDescuentoLoc) lista = lista.filter(p => p.descuento > 0);
      if (filtroMarcasLoc.size) lista = lista.filter(p =>
        p.marcas?.some(m => filtroMarcasLoc.has(m))
      );
      if (filtroOrdenPrecioLoc === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioLoc === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    // GORRAS
    if (category === "Gorras") {
      if (filtroDescuentoG) lista = lista.filter(p => p.descuento > 0);
      if (filtroOrdenPrecioG === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioG === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    // MAQUILLAJE
    if (category === "Maquillaje") {
      if (filtroMarcasMQ.size)    lista = lista.filter(p => p.marcas?.some(m=>filtroMarcasMQ.has(m)));
      if (filtroProductosMQ.size) lista = lista.filter(p => p.productos?.some(x=>filtroProductosMQ.has(x)));
      if (filtroDescuentoMQ)      lista = lista.filter(p => p.descuento > 0);
      if (filtroPackMQ)           lista = lista.filter(p => p.isPack);
      if (filtroOrdenPrecioMQ === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioMQ === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    // PIJAMA
    if (category === "Pijama") {
      if (filtroDescuentoPJ) lista = lista.filter(p => p.descuento > 0);
      if (filtroOrdenPrecioPJ === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioPJ === "desc") lista.sort((a,b)=>b.precio-a.precio);
      if (filtroGeneroPJ)  lista = lista.filter(p => p.genero === filtroGeneroPJ);
      if (filtroTallasPJ.size) lista = lista.filter(p =>
        p.talla?.split(",").some(t => filtroTallasPJ.has(t.trim()))
      );
    }

    // ROPA DEPORTIVA
    if (category === "Ropa Deportiva") {
      if (filtroGeneroDep) lista = lista.filter(p => p.genero === filtroGeneroDep);
      if (filtroDescuentoDep) lista = lista.filter(p => p.descuento > 0);
      if (filtroMarcasDep.size) lista = lista.filter(p => p.marcas?.some(m=>filtroMarcasDep.has(m)));
      if (filtroTallasDep.size) lista = lista.filter(p =>
        p.talla?.split(",").some(t => filtroTallasDep.has(t.trim()))
      );
      if (filtroOrdenPrecioDep === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioDep === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    cont.innerHTML = lista.map(renderProductCard).join("");
    // Si es admin, habilitar editar/borrar
    if (localStorage.getItem("isAdmin")==="true" && window.enableEditDelete) {
      window.enableEditDelete();
    }
  }

  // Utilitario
  function uniqueSorted(arr) {
    return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
                .sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  // Detalle de producto
  window.verDetalleProducto = id => {
    const origen = location.pathname.split("/").pop().replace(".html","") || "index";
    localStorage.setItem("productoSeleccionado", JSON.stringify({ id, origen }));
    location.href = "visualizacion.html";
  };
});
  // Al final de productos.js
  window.verDetalleProducto = id => {
    const origen = location.pathname.split("/").pop().replace(".html","") || "index";
    localStorage.setItem("productoSeleccionado",
      JSON.stringify({ id, origen })
    );
    location.href = "visualizacion.html";
  };
