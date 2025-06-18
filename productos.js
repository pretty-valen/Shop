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

  // Definir página de origen para el enlace a detalle
  const origen = esIndexPage      ? "index"
               : esLocionesPage   ? "lociones"
               : esGorrasPage     ? "gorras"
               : esMaquillajePage ? "maquillaje"
               : esPijamaPage     ? "pijama"
               : esDeportivaPage  ? "deportiva"
               : "index";

  // Variables de filtro
  // --- Lociones ---
  let filtroGeneroLoc       = "";
  let filtroMarcasLoc       = new Set();
  let filtroOrdenPrecioLoc  = "";
  let filtroDescuentoLoc    = false;
  // --- Gorras ---
  let filtroOrdenPrecioG    = "";
  let filtroDescuentoG      = false;
  // --- Maquillaje ---
  let filtroMarcasMQ        = new Set();
  let filtroProductosMQ     = new Set();
  let filtroOrdenPrecioMQ   = "";
  let filtroDescuentoMQ     = false;
  let filtroPackMQ          = false;
  // --- Pijama ---
  let filtroOrdenPrecioPJ   = "";
  let filtroDescuentoPJ     = false;
  let filtroTallasPJ        = new Set();
  let filtroGeneroPJ        = "";
  // --- Deportiva ---
  let filtroGeneroDep       = "";
  let filtroMarcasDep       = new Set();
  let filtroTallasDep       = new Set();
  let filtroOrdenPrecioDep  = "";
  let filtroDescuentoDep    = false;

  // Cargar productos desde el servidor
  fetch("https://admin-backend-ts85.onrender.com/productos")
    .then(res => res.json())
    .then(data => {
      productos = data;
      montarFiltros();
      iniciarRenderizado();
    })
    .catch(err => {
      console.error("Error cargando productos:", err);
      productos = [];
    });

  // Montar controles de filtro según página
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
      document.getElementById("sort-precio-gorras").addEventListener("change", e => {
        filtroOrdenPrecioG = e.target.value;
        renderSection("productos-gorras", "Gorras");
      });
      document.getElementById("filter-descuento-gorras").addEventListener("change", e => {
        filtroDescuentoG = e.target.checked;
        renderSection("productos-gorras", "Gorras");
      });
    }

    // === MAQUILLAJE ===
    if (esMaquillajePage) {
      // Marcas
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
      // Productos
      const tiposMQ = uniqueSorted(
        productos.filter(p => p.categoria === "Maquillaje").flatMap(p => p.productos || [])
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
      // Precio
      document.getElementById("filter-price-order").addEventListener("change", e => {
        filtroOrdenPrecioMQ = e.target.value;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      // Descuento
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
        document.querySelectorAll("#filter-brand-container input, #filter-product-container input")
                .forEach(cb => cb.checked = false);
        document.getElementById("filter-price-order").value = "none";
        document.getElementById("filter-discount").checked = false;
        document.getElementById("filter-pack").checked = false;
        renderSection("productos-maquillaje", "Maquillaje");
      });
    }

    // === PIJAMA ===
    if (esPijamaPage) {
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
      document.getElementById("filter-price-pijama").addEventListener("change", e => {
        filtroOrdenPrecioPJ = e.target.value;
        renderSection("productos-pijama", "Pijama");
      });
      document.getElementById("filter-discount-pijama").addEventListener("change", e => {
        filtroDescuentoPJ = e.target.checked;
        renderSection("productos-pijama", "Pijama");
      });
      document.getElementById("filtro-genero-pijama").addEventListener("change", e => {
        filtroGeneroPJ = e.target.value;
        renderSection("productos-pijama", "Pijama");
      });
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
      document.getElementById("filtro-genero-deportiva").addEventListener("change", e => {
        filtroGeneroDep = e.target.value;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
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
      document.getElementById("filtro-precio-deportiva").addEventListener("change", e => {
        filtroOrdenPrecioDep = e.target.value;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
      document.getElementById("filtro-descuento-deportiva").addEventListener("change", e => {
        filtroDescuentoDep = e.target.checked;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
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

  // Iniciar renderizado según página
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

  // Render aleatorio para home
  function renderMixed() {
    const mixed = productos
      .filter(p => ["Lociones","Gorras","Maquillaje","Pijama","Ropa Deportiva"].includes(p.categoria))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    document.getElementById("productos-destacados")
            .innerHTML = mixed.map(renderProductCard).join("");
  }

  // Plantilla de tarjeta con enlace a visualizacion.html
  function renderProductCard(p) {
    const hasDesc = p.descuento > 0;
    const precioAct = hasDesc
      ? (p.precio * (1 - p.descuento/100)).toFixed(2)
      : p.precio.toFixed(2);

    return `
      <div class="producto-card"
           style="cursor:pointer"
           onclick="location.href='visualizacion.html?id=${p._id||p.id}&origen=${origen}'">
        <img src="${p.fotos[0]||''}" alt="${p.nombre}">
        <div class="producto-info">
          <h4>${p.nombre}</h4>
          ${hasDesc
            ? `<p class="precio-ant">$${p.precio.toFixed(2)}</p>
               <p class="precio-act">$${precioAct}</p>
               <p class="descuento">${p.descuento}%</p>`
            : `<p class="precio-act">$${precioAct}</p>`}
          <p class="categoria">${p.categoria}</p>
        </div>
      </div>
    `;
  }

  // Render sección según filtros
  function renderSection(sectionId, category) {
    const cont = document.getElementById(sectionId);
    if (!cont) return;
    let lista = productos.filter(p => p.categoria === category);

    // Aplicar filtros según categoría (igual que arriba)...
    // (Aquí va el mismo bloque que en montarFiltros pero con lógica de filtrado)

    cont.innerHTML = lista.map(renderProductCard).join("");
    if (localStorage.getItem("isAdmin")==="true" && window.enableEditDelete) {
      window.enableEditDelete();
    }
  }

  // Utilitario: lista única y ordenada
  function uniqueSorted(arr) {
    return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
});
