function verDetalleProducto(id) {
  const productos = JSON.parse(localStorage.getItem("catalogoProductos") || "[]");
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  const origen = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  localStorage.setItem("productoSeleccionado", JSON.stringify({ id: prod.id, origen }));
  window.location.href = "visualizacion.html";
}


document.addEventListener("DOMContentLoaded", () => {
  const KEY = "catalogoProductos";
  const productos = JSON.parse(localStorage.getItem(KEY) || "[]");

  // ————— Plantilla de tarjeta de producto —————
  function renderProductCard(p) {
  const hasDesc = p.descuento > 0;
  const precioAct = hasDesc
    ? (p.precio * (1 - p.descuento / 100)).toFixed(2)
    : p.precio.toFixed(2);
  return `
    <div class="producto-card"
         style="cursor:pointer"
         data-id="${p.id}"
         data-genero="${p.genero || ''}"
         data-tallas="${(p.talla || '').toUpperCase()}"
         data-precio="${p.precio}"
         data-descuento="${p.descuento || 0}">
      <img src="${p.fotos[0] || ''}" alt="${p.nombre}">
      <div class="producto-info">
        <h4>${p.nombre}</h4>
        ${p.marcas && p.marcas.length
  ? `<p class="marca">Marca: ${p.marcas.join(', ')}</p>`
  : ''}
${p.productos && p.productos.length
  ? `<p class="tipo">Producto: ${p.productos.join(', ')}</p>`
  : ''}

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



  // ————————— Detectar páginas —————————
  const contIndex = document.getElementById("productos-destacados");
  const esIndexPage      = !!contIndex;
  const esLocionesPage   = !!document.getElementById("filtros-lociones");
  const esGorrasPage     = !!document.getElementById("filtros-gorras");
  const esMaquillajePage = !!document.getElementById("filtros-maquillaje");
  const esPijamaPage     = !!document.getElementById("filtros-pijama");
  const esDeportivaPage  = !!document.getElementById("filtros-deportiva");
  let filtroGeneroDep = "";
let filtroMarcasDep = new Set();
let filtroTallasDep = new Set();
let filtroPrecioDep = "";
let filtroDescuentoDep = false;


  // ————— Helper: únicos ordenados —————
  function uniqueSorted(arr) {
    return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  // ————————— Mix para index (hasta 5 de cada) —————————
  const MIX_TS_KEY   = "indexMixTs";
  const MIX_DATA_KEY = "indexMixData";
  function getMixed() {
    const now    = Date.now();
    const lastTs = parseInt(localStorage.getItem(MIX_TS_KEY) || "0", 10);
    if (now - lastTs < 24 * 3600 * 1000) {
      return JSON.parse(localStorage.getItem(MIX_DATA_KEY) || "[]");
    }
    const cats = ["Lociones","Gorras","Maquillaje","Pijama","Ropa Deportiva"];
    let mixed = cats.flatMap(cat => {
      const list = productos.filter(p => p.categoria === cat);
      list.sort(() => Math.random() - 0.5);
      return list.slice(0, 5);
    });
    mixed.sort(() => Math.random() - 0.5);
    localStorage.setItem(MIX_DATA_KEY, JSON.stringify(mixed));
    localStorage.setItem(MIX_TS_KEY, now.toString());
    return mixed;
  }

  function renderMixed() {
    const mixed = getMixed();
    contIndex.innerHTML = mixed.map(p => renderProductCard(p)).join("");
    if (localStorage.getItem("isAdmin") === "true" && !document.getElementById("btn-reload-mix")) {
      const btn = document.createElement("button");
      btn.id = "btn-reload-mix";
      btn.textContent = "Recargar Productos";
      Object.assign(btn.style, {
        position: "fixed", bottom: "20px", right: "160px",
        padding: "12px 16px", background: "#ffc0cb",
        color: "#001f3f", border: "none",
        borderRadius: "4px", cursor: "pointer", zIndex: "1000"
      });
      btn.onclick = () => {
        localStorage.removeItem(MIX_TS_KEY);
        localStorage.removeItem(MIX_DATA_KEY);
        renderMixed();
      };
      document.body.appendChild(btn);
    }
  }

  // ————— Variables de filtro —————
  let filtroGenero       = "";
  let filtroMarcasSet    = new Set();
  let filtroPrecioLoc    = "";
  let filtroDescuentoLoc = false;

  let sortPrecioG = "asc";
  let onlyDiscG   = false;

  let filterBrandsMQ     = new Set();
  let filterProductsMQ   = new Set();
  let filterPriceOrderMQ = "none";
  let filterDiscountMQ   = false;
  let filterPackMQ       = false;

  // ————— Variables de filtro pijamas —————
  let filterPriceOrderPJ = "none";
  let filterDiscountPJ   = false;

  // ————————— Init controles —————————
  if (esLocionesPage) {
    const selGen = document.getElementById("filtro-genero");
    const contMar= document.getElementById("filtro-marcas");
    const selPre = document.getElementById("filtro-precio");
    const chkDes = document.getElementById("filtro-descuento");
    const btnRes = document.getElementById("btn-reset-filtros");

    selGen.onchange = () => { filtroGenero = selGen.value; renderSection("productos-lociones","Lociones"); };
    selPre.onchange = () => { filtroPrecioLoc = selPre.value; renderSection("productos-lociones","Lociones"); };
    chkDes.onchange = () => { filtroDescuentoLoc = chkDes.checked; renderSection("productos-lociones","Lociones"); };
    btnRes.onclick = () => {
      selGen.value = ""; filtroGenero="";
      selPre.value = ""; filtroPrecioLoc="";
      chkDes.checked = false; filtroDescuentoLoc=false;
      filtroMarcasSet.clear();
      contMar.querySelectorAll("input").forEach(i=>i.checked=false);
      renderSection("productos-lociones","Lociones");
    };

    contMar.innerHTML = "";
    uniqueSorted(productos.filter(p=>p.categoria==="Lociones").flatMap(p=>p.marcas||[]))
      .forEach(marca => {
        const id = "m-"+marca.replace(/\s+/g,"");
        const chk = document.createElement("input");
        chk.type="checkbox"; chk.id=id; chk.value=marca;
        chk.onchange = () => {
          chk.checked ? filtroMarcasSet.add(marca):filtroMarcasSet.delete(marca);
          renderSection("productos-lociones","Lociones");
        };
        const lbl = document.createElement("label");
        lbl.htmlFor=id; lbl.textContent=marca;
        contMar.append(chk,lbl,document.createElement("br"));
      });
  }

  if (esGorrasPage) {
    const selSortG = document.getElementById("sort-precio-gorras");
    const chkDesG  = document.getElementById("filter-descuento-gorras");
    selSortG.onchange = () => { sortPrecioG = selSortG.value; renderSection("productos-gorras","Gorras"); };
    chkDesG.onchange  = () => { onlyDiscG = chkDesG.checked;    renderSection("productos-gorras","Gorras"); };
  }

  if (esMaquillajePage) {
    const cbBrand = document.getElementById("filter-brand-container");
    const cbProd  = document.getElementById("filter-product-container");
    const selP    = document.getElementById("filter-price-order");
    const chkD    = document.getElementById("filter-discount");
    const chkP    = document.getElementById("filter-pack");
    const btnC    = document.getElementById("clear-filters");

    uniqueSorted(productos.filter(p=>p.categoria==="Maquillaje").flatMap(p=>p.marcas||[]))
      .forEach(marca => {
        const id="mbq-"+marca.replace(/\s+/g,"");
        const cb=document.createElement("input");
        cb.type="checkbox"; cb.id=id; cb.value=marca;
        cb.onchange=()=>{cb.checked?filterBrandsMQ.add(marca):filterBrandsMQ.delete(marca);renderSection("productos-maquillaje","Maquillaje");};
        const lbl=document.createElement("label"); lbl.htmlFor=id; lbl.textContent=marca;
        cbBrand.append(cb,lbl,document.createElement("br"));
      });

    uniqueSorted(productos.filter(p=>p.categoria==="Maquillaje").flatMap(p=>p.productos||[]))
      .forEach(prod => {
        const id="pbq-"+prod.replace(/\s+/g,"");
        const cb=document.createElement("input");
        cb.type="checkbox"; cb.id=id; cb.value=prod;
        cb.onchange=()=>{cb.checked?filterProductsMQ.add(prod):filterProductsMQ.delete(prod);renderSection("productos-maquillaje","Maquillaje");};
        const lbl=document.createElement("label"); lbl.htmlFor=id; lbl.textContent=prod;
        cbProd.append(cb,lbl,document.createElement("br"));
      });

    selP.onchange = () => { filterPriceOrderMQ = selP.value; renderSection("productos-maquillaje","Maquillaje"); };
    chkD.onchange = () => { filterDiscountMQ   = chkD.checked; renderSection("productos-maquillaje","Maquillaje"); };
    chkP.onchange = () => { filterPackMQ       = chkP.checked; renderSection("productos-maquillaje","Maquillaje"); };

    btnC.onclick = () => {
      filterBrandsMQ.clear(); filterProductsMQ.clear();
      filterPriceOrderMQ="none"; filterDiscountMQ=false; filterPackMQ=false;
      selP.value="none"; chkD.checked=false; chkP.checked=false;
      cbBrand.querySelectorAll("input").forEach(i=>i.checked=false);
      cbProd .querySelectorAll("input").forEach(i=>i.checked=false);
      renderSection("productos-maquillaje","Maquillaje");
    };
  }

  if (esPijamaPage) {
    const selPj = document.getElementById("filter-price-pijama");
    const chkDj = document.getElementById("filter-discount-pijama");
    const btnPj = document.getElementById("clear-filters-pijama");

    selPj.onchange = () => {
      filterPriceOrderPJ = selPj.value;
      renderSection("productos-pijama","Pijama");
    };
    chkDj.onchange = () => {
      filterDiscountPJ = chkDj.checked;
      renderSection("productos-pijama","Pijama");
    };
    btnPj.onclick = () => {
      filterPriceOrderPJ = "none";
      filterDiscountPJ   = false;
      selPj.value        = "none";
      chkDj.checked      = false;
      renderSection("productos-pijama","Pijama");
    };
  }
  if (esDeportivaPage) {
  const selGen = document.getElementById("filtro-genero-deportiva");
  const contMar= document.getElementById("filtro-marcas-deportiva");
  const contTal= document.getElementById("filtro-tallas-deportiva");
  const selPre = document.getElementById("filtro-precio-deportiva");
  const chkDes = document.getElementById("filtro-descuento-deportiva");
  const btnRes = document.getElementById("btn-reset-filtros-deportiva");

  selGen.onchange = () => { filtroGeneroDep = selGen.value; renderSection("productos-deportiva","Ropa Deportiva"); };
  selPre.onchange = () => { filtroPrecioDep = selPre.value; renderSection("productos-deportiva","Ropa Deportiva"); };
  chkDes.onchange = () => { filtroDescuentoDep = chkDes.checked; renderSection("productos-deportiva","Ropa Deportiva"); };
  btnRes.onclick = () => {
    selGen.value = ""; filtroGeneroDep="";
    selPre.value = ""; filtroPrecioDep="";
    chkDes.checked = false; filtroDescuentoDep=false;
    filtroMarcasDep.clear();
    filtroTallasDep.clear();
    contMar.querySelectorAll("input").forEach(i=>i.checked=false);
    contTal.querySelectorAll("input").forEach(i=>i.checked=false);
    renderSection("productos-deportiva","Ropa Deportiva");
  };

  contMar.innerHTML = "";
  uniqueSorted(productos.filter(p=>p.categoria==="Ropa Deportiva").flatMap(p=>(p.marcas || [])))
    .forEach(marca => {
      const id = "mdep-"+marca.replace(/\s+/g,"");
      const chk = document.createElement("input");
      chk.type="checkbox"; chk.id=id; chk.value=marca;
      chk.onchange = () => {
        chk.checked ? filtroMarcasDep.add(marca) : filtroMarcasDep.delete(marca);
        renderSection("productos-deportiva","Ropa Deportiva");
      };
      const lbl = document.createElement("label");
      lbl.htmlFor=id; lbl.textContent=marca;
      contMar.append(chk,lbl,document.createElement("br"));
    });

  contTal.innerHTML = "";
  uniqueSorted(productos.filter(p=>p.categoria==="Ropa Deportiva").flatMap(p=>(p.talla || "").split(",")))
    .forEach(talla => {
      const id = "tdep-"+talla.replace(/\s+/g,"");
      const chk = document.createElement("input");
      chk.type="checkbox"; chk.id=id; chk.value=talla;
      chk.onchange = () => {
        chk.checked ? filtroTallasDep.add(talla) : filtroTallasDep.delete(talla);
        renderSection("productos-deportiva","Ropa Deportiva");
      };
      const lbl = document.createElement("label");
      lbl.htmlFor=id; lbl.textContent=talla;
      contTal.append(chk,lbl,document.createElement("br"));
    });
}


  // ————————— Render genérico —————————
  function renderSection(sectionId, category) {
    const cont = document.getElementById(sectionId);
    if (!cont) return;
    let lista = productos.filter(p => p.categoria === category);

    if (esLocionesPage && category==="Lociones") {
      if (filtroGenero) lista=lista.filter(p=>p.genero===filtroGenero);
      if (filtroDescuentoLoc) lista=lista.filter(p=>p.descuento>0);
      if (filtroMarcasSet.size) lista=lista.filter(p=>p.marcas.some(m=>filtroMarcasSet.has(m)));
      if (filtroPrecioLoc==="asc") lista.sort((a,b)=>a.precio-b.precio);
      if (filtroPrecioLoc==="desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    if (esGorrasPage && category==="Gorras") {
      if (onlyDiscG) lista=lista.filter(p=>p.descuento>0);
      lista.sort((a,b)=>sortPrecioG==="asc"?a.precio-b.precio:b.precio-a.precio);
    }

    if (esMaquillajePage && category==="Maquillaje") {
      if (filterBrandsMQ.size) lista=lista.filter(p=>p.marcas.some(m=>filterBrandsMQ.has(m)));
      if (filterProductsMQ.size) lista=lista.filter(p=>p.productos.some(x=>filterProductsMQ.has(x)));
      if (filterDiscountMQ) lista=lista.filter(p=>p.descuento>0);
      if (filterPackMQ) lista=lista.filter(p=>p.isPack);
      if (filterPriceOrderMQ==="asc") lista.sort((a,b)=>a.precio-b.precio);
      if (filterPriceOrderMQ==="desc") lista.sort((a,b)=>b.precio-a.precio);
    }

    if (esPijamaPage && category==="Pijama") {
      if (filterDiscountPJ) lista = lista.filter(p => p.descuento > 0);
      if (filterPriceOrderPJ === "asc")  lista.sort((a,b) => a.precio - b.precio);
      if (filterPriceOrderPJ === "desc") lista.sort((a,b) => b.precio - a.precio);
    }
    if (esDeportivaPage && category==="Ropa Deportiva") {
  if (filtroGeneroDep) lista=lista.filter(p=>p.genero===filtroGeneroDep);
  if (filtroDescuentoDep) lista=lista.filter(p=>p.descuento>0);
  if (filtroMarcasDep.size) lista=lista.filter(p=>p.marcas && p.marcas.some(m=>filtroMarcasDep.has(m)));
  if (filtroTallasDep.size) lista=lista.filter(p=>p.talla && p.talla.split(",").some(t=>filtroTallasDep.has(t.trim())));
  if (filtroPrecioDep==="asc") lista.sort((a,b)=>a.precio-b.precio);
  if (filtroPrecioDep==="desc") lista.sort((a,b)=>b.precio-a.precio);
}


    cont.innerHTML = lista.map(p => renderProductCard(p)).join("");

    if (localStorage.getItem("isAdmin")==="true" && window.enableEditDelete) {
      window.enableEditDelete();
    }
  }

  // ————————— Llamada inicial —————————
  if (esIndexPage) {
    renderMixed();
  } else {
    [
      {id:"productos-lociones",   cat:"Lociones"},
      {id:"productos-gorras",     cat:"Gorras"},
      {id:"productos-maquillaje", cat:"Maquillaje"},
      {id:"productos-pijama",     cat:"Pijama"},
      {id:"productos-deportiva",  cat:"Ropa Deportiva"}
    ].forEach(({id,cat}) => {
      if (document.getElementById(id)) renderSection(id,cat);
    });
  }
});
document.addEventListener("click", (e) => {
  const card = e.target.closest(".producto-card");
  if (!card) return;

  const id = card.getAttribute("data-id");
  const origen = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  localStorage.setItem("productoSeleccionado", JSON.stringify({ id, origen }));
  location.href = "visualizacion.html";
});






