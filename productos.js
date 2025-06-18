// productos.js
document.addEventListener("DOMContentLoaded", () => {
  let productos = [];

  const esIndexPage      = !!document.getElementById("productos-destacados");
  const esLocionesPage   = !!document.getElementById("filtros-lociones");
  const esGorrasPage     = !!document.getElementById("filtros-gorras");
  const esMaquillajePage = !!document.getElementById("filtros-maquillaje");
  const esPijamaPage     = !!document.getElementById("filtros-pijama");
  const esDeportivaPage  = !!document.getElementById("filtros-deportiva");

  let filtroGeneroLoc    = "";
  let filtroMarcasLoc    = new Set();
  let filtroOrdenPrecioLoc = "";
  let filtroDescuentoLoc   = false;

  let filtroOrdenPrecioG  = "";
  let filtroDescuentoG    = false;

  let filtroMarcasMQ      = new Set();
  let filtroProductosMQ   = new Set();
  let filtroOrdenPrecioMQ = "";
  let filtroDescuentoMQ   = false;
  let filtroPackMQ        = false;

  let filtroOrdenPrecioPJ = "";
  let filtroDescuentoPJ   = false;
  let filtroTallasPJ      = new Set();
  let filtroGeneroPJ      = "";

  let filtroGeneroDep     = "";
  let filtroMarcasDep     = new Set();
  let filtroTallasDep     = new Set();
  let filtroOrdenPrecioDep = "";
  let filtroDescuentoDep   = false;

  fetch("https://admin-backend-ts85.onrender.com/productos")
    .then(res => res.json())
    .then(data => {
      productos = data;
      montarFiltros();
      iniciarRenderizado();
    })
    .catch(() => {
      productos = [];
    });

  function montarFiltros() {
    if (esLocionesPage) {
      document.getElementById("filtro-genero").addEventListener("change", e => {
        filtroGeneroLoc = e.target.value;
        renderSection("productos-lociones", "Lociones");
      });
      document.getElementById("filtro-precio").addEventListener("change", e => {
        filtroOrdenPrecioLoc = e.target.value;
        renderSection("productos-lociones", "Lociones");
      });
      document.getElementById("filtro-descuento").addEventListener("change", e => {
        filtroDescuentoLoc = e.target.checked;
        renderSection("productos-lociones", "Lociones");
      });
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

    if (esMaquillajePage) {
      const marcasMQ = uniqueSorted(
        productos.filter(p => p.categoria === "Maquillaje").flatMap(p => p.marcas || [])
      );
      const contMM = document.getElementById("filter-brand-container");
      contMM.innerHTML = "";
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
      const tiposMQ = uniqueSorted(
        productos.filter(p => p.categoria === "Maquillaje").flatMap(p => p.productos || [])
      );
      const contPM = document.getElementById("filter-product-container");
      contPM.innerHTML = "";
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
      document.getElementById("filter-price-order").addEventListener("change", e => {
        filtroOrdenPrecioMQ = e.target.value;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      document.getElementById("filter-discount").addEventListener("change", e => {
        filtroDescuentoMQ = e.target.checked;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      document.getElementById("filter-pack").addEventListener("change", e => {
        filtroPackMQ = e.target.checked;
        renderSection("productos-maquillaje", "Maquillaje");
      });
      document.getElementById("clear-filters").addEventListener("click", () => {
        filtroMarcasMQ.clear();
        filtroProductosMQ.clear();
        filtroOrdenPrecioMQ = "";
        filtroDescuentoMQ = false;
        filtroPackMQ = false;
        document.querySelectorAll("#filter-brand-container input, #filter-product-container input").forEach(cb => cb.checked = false);
        document.getElementById("filter-price-order").value = "";
        document.getElementById("filter-discount").checked = false;
        document.getElementById("filter-pack").checked = false;
        renderSection("productos-maquillaje", "Maquillaje");
      });
    }

    if (esPijamaPage) {
      const tallasPJ = uniqueSorted(
        productos.filter(p => p.categoria === "Pijama").flatMap(p => (p.talla||"").split(","))
      );
      const contTP = document.getElementById("tallas-lista");
      contTP.innerHTML = "";
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
        filtroOrdenPrecioPJ = "";
        filtroDescuentoPJ = false;
        filtroTallasPJ.clear();
        filtroGeneroPJ = "";
        document.getElementById("filter-price-pijama").value = "";
        document.getElementById("filter-discount-pijama").checked = false;
        document.getElementById("filtro-genero-pijama").value = "";
        document.querySelectorAll("#tallas-lista input").forEach(cb => cb.checked = false);
        renderSection("productos-pijama", "Pijama");
      });
    }

    if (esDeportivaPage) {
      document.getElementById("filtro-genero-deportiva").addEventListener("change", e => {
        filtroGeneroDep = e.target.value;
        renderSection("productos-deportiva", "Ropa Deportiva");
      });
      const marcasDep = uniqueSorted(
        productos.filter(p => p.categoria === "Ropa Deportiva").flatMap(p => p.marcas || [])
      );
      const contMD = document.getElementById("filtro-marcas-deportiva");
      contMD.innerHTML = "";
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
        productos.filter(p => p.categoria === "Ropa Deportiva").flatMap(p => (p.talla||"").split(","))
      );
      const contTD = document.getElementById("filtro-tallas-deportiva");
      contTD.innerHTML = "";
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

  function renderProductCard(p) {
    return `
      <div class="producto-card" onclick="verDetalleProducto('${p.id}')">
        <img src="${p.fotos[0]||''}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p>$${p.precio.toFixed(2)}</p>
      </div>
    `;
  }

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

  function renderMixed() {
    const mixed = productos
      .filter(p => ["Lociones","Gorras","Maquillaje","Pijama","Ropa Deportiva"].includes(p.categoria))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    document.getElementById("productos-destacados").innerHTML =
      mixed.map(renderProductCard).join("");
  }

  function renderSection(sectionId, category) {
    const cont = document.getElementById(sectionId);
    if (!cont) return;
    let lista = productos.filter(p => p.categoria === category);

    if (category === "Lociones") {
      if (filtroGeneroLoc) lista = lista.filter(p => p.genero === filtroGeneroLoc);
      if (filtroDescuentoLoc) lista = lista.filter(p => p.descuento > 0);
      if (filtroMarcasLoc.size) lista = lista.filter(p =>
        p.marcas?.some(m => filtroMarcasLoc.has(m))
      );
      if (filtroOrdenPrecioLoc === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioLoc === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    if (category === "Gorras") {
      if (filtroDescuentoG) lista = lista.filter(p => p.descuento > 0);
      if (filtroOrdenPrecioG === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioG === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    if (category === "Maquillaje") {
      if (filtroMarcasMQ.size)    lista = lista.filter(p => p.marcas?.some(m=>filtroMarcasMQ.has(m)));
      if (filtroProductosMQ.size) lista = lista.filter(p => p.productos?.some(x=>filtroProductosMQ.has(x)));
      if (filtroDescuentoMQ)      lista = lista.filter(p => p.descuento > 0);
      if (filtroPackMQ)           lista = lista.filter(p => p.isPack);
      if (filtroOrdenPrecioMQ === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioMQ === "desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    if (category === "Pijama") {
      if (filtroDescuentoPJ) lista = lista.filter(p => p.descuento > 0);
      if (filtroOrdenPrecioPJ === "asc")  lista.sort((a,b)=>a.precio-b.precio);
      if (filtroOrdenPrecioPJ === "desc") lista.sort((a,b)=>b.precio-a.precio);
      if (filtroGeneroPJ)  lista = lista.filter(p => p.genero === filtroGeneroPJ);
      if (filtroTallasPJ.size) lista = lista.filter(p =>
        p.talla?.split(",").some(t => filtroTallasPJ.has(t.trim()))
      );
    }

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
  }

  function uniqueSorted(arr) {
    return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
                .sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  window.verDetalleProducto = id => {
    window.location.href = `visual.html?id=${id}`;
  };
});
