document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_ADMIN    = "isAdmin";
  const STORAGE_LOGIN_TS = "adminLoginTs";
  const TIMEOUT_SEC      = 3600; // 1 hora

  const adminModal    = document.getElementById("admin-login-modal");
  const catalogoModal = document.getElementById("admin-catalogo-modal");
  const loginBtn      = document.getElementById("login-btn");
  const closeLogin    = adminModal.querySelector(".close");
  const closeCat      = catalogoModal.querySelector(".close-catalogo");

  function isSessionActive() {
    const ts = parseInt(localStorage.getItem(STORAGE_LOGIN_TS) || "0", 10);
    return (
      localStorage.getItem(STORAGE_ADMIN) === "true" &&
      (Date.now() / 1000 - ts) < TIMEOUT_SEC
    );
  }

  function touchSession() {
    localStorage.setItem(STORAGE_LOGIN_TS, Math.floor(Date.now() / 1000));
  }

  function logout() {
    localStorage.removeItem(STORAGE_ADMIN);
    localStorage.removeItem(STORAGE_LOGIN_TS);
    if (document.getElementById("btn-add-catalogo")) location.reload();
  }

  // Abrir modal login o catálogo con Ctrl+Shift+A
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
      if (!isSessionActive()) {
        adminModal.classList.add("open");
      } else {
        touchSession();
        createAddCatBtn();
        enableEditDelete();
        catalogoModal.classList.add("open");
      }
    }
  });

  // Si ya hay sesión activa
  if (isSessionActive()) {
    touchSession();
    createAddCatBtn();
    enableEditDelete();
  }

  // Login
    loginBtn.addEventListener("click", async () => {
    const u = document.getElementById("admin-user").value.trim();
    const p = document.getElementById("admin-pass").value.trim();

    const res = await fetch("https://admin-backend-ts85.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: u, clave: p })
    });

    if (res.ok) {
      localStorage.setItem(STORAGE_ADMIN, "true");
      touchSession();
      adminModal.classList.remove("open");
      createAddCatBtn();
      enableEditDelete();
    } else {
      alert("Credenciales incorrectas");
    }
  });

  closeLogin.addEventListener("click", () => adminModal.classList.remove("open"));
  closeCat.addEventListener("click", () => catalogoModal.classList.remove("open"));

  // —————————————
  // FORMULARIO CATÁLOGO
  // —————————————
  const form = document.getElementById("form-catalogo");
  if (!form) return;

  // Mostrar/ocultar campos extra
  const selectCat     = document.getElementById("categoria");
  const grupoLociones = document.getElementById("grupo-lociones");

  // Añadido: campos de Maquillaje y Pijama
  const grupoMaquillaje = document.getElementById("maquillaje-extra");
  const grupoPijama     = document.getElementById("pijama-extra");

  function toggleCamposExtra() {
    if (grupoLociones) {
      grupoLociones.style.display =
        selectCat.value === "Lociones" ? "block" : "none";
    }
    if (grupoMaquillaje) {
      grupoMaquillaje.style.display =
        selectCat.value === "Maquillaje" ? "block" : "none";
    }
    if (grupoPijama) {
      grupoPijama.style.display =
        selectCat.value === "Pijama" ? "block" : "none";
    }
    const grupoDeportiva = document.getElementById("deportiva-extra");

if (grupoDeportiva) {
  grupoDeportiva.style.display = selectCat.value === "Ropa Deportiva" ? "block" : "none";
}

  }
  selectCat.addEventListener("change", toggleCamposExtra);
  catalogoModal.addEventListener("transitionend", toggleCamposExtra);
  toggleCamposExtra();

  form.addEventListener("submit", async e => {
  e.preventDefault();

  const files = Array.from(document.getElementById("fotos").files);
  if (!files.length) return alert("Selecciona al menos una imagen");
  const fotos = await Promise.all(
    files.map(file =>
      new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
      })
    )
  );

  const nombre      = form.nombre.value.trim();
  const categoria   = form.categoria.value;
  const precio      = parseFloat(form.precio.value);
  const descripcion = form.descripcion.value.trim();
  const descuento   = parseFloat(form.descuento.value) || 0;

  let marcasArr    = [];
  let productosArr = [];
  let isPack       = false;
  let talla        = "";
  let genero       = "";

  if (categoria === "Lociones") {
    marcasArr = form.marcas.value.split(",").map(s => s.trim()).filter(Boolean);
    genero = form.genero.value;
  }

  if (categoria === "Maquillaje" && form.marcas) {
    marcasArr    = form.marcas.value.split(",").map(s => s.trim()).filter(Boolean);
    productosArr = form.productos.value.split(",").map(s => s.trim()).filter(Boolean);
    isPack       = form.isPack.checked;
  }

  if (categoria === "Pijama") {
    talla  = form.talla.value.split(",").map(t => t.trim()).join(",");
    genero = form.genero.value;
  }

  const nuevo = {
    fotos,
    nombre,
    categoria,
    precio,
    descripcion,
    descuento,
    marcas:    marcasArr,
    productos: productosArr,
    isPack,
    talla,
    genero
  };

  const res = await fetch("https://admin-backend-ts85.onrender.com/productos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo)
  });

  if (res.ok) {
    alert("✅ Producto añadido");
    location.reload();
  } else {
    alert("❌ Error al guardar el producto");
  }
});


  // —————————————
  // BOTÓN FLOTANTE “Añadir al catálogo”
  // —————————————
  function createAddCatBtn() {
    if (!document.getElementById("btn-add-catalogo")) {
      const btn = document.createElement("button");
      btn.id = "btn-add-catalogo";
      btn.textContent = "Añadir al catálogo";
      Object.assign(btn.style, {
        position:     "fixed",
        bottom:       "20px",
        right:        "20px",
        padding:      "12px 16px",
        background:   "#001f3f",
        color:        "#ffc0cb",
        border:       "none",
        borderRadius: "4px",
        cursor:       "pointer",
        zIndex:       "1000"
      });
      btn.onclick = () => {
        if (!isSessionActive()) return logout();
        touchSession();
        catalogoModal.classList.add("open");
      };
      document.body.appendChild(btn);
    }
  }

  // —————————————
  // EDIT / DELETE CONTROLS
  // —————————————
  function enableEditDelete() {
    document.querySelectorAll(".producto-card").forEach(card => {
      if (card.querySelector(".admin-controls")) return;
      const id    = card.dataset.id;
      const ctrl  = document.createElement("div");
      ctrl.className = "admin-controls";
      Object.assign(ctrl.style, {
        position: "absolute",
        top:      "8px",
        right:    "8px",
        display:  "flex",
        gap:      "4px"
      });
      ctrl.innerHTML = `
        <button class="btn-edit">✏️</button>
        <button class="btn-del">🗑️</button>
      `;
      card.style.position = "relative";
      card.appendChild(ctrl);
      ctrl.querySelector(".btn-edit").onclick = () => openEditModal(id);
      ctrl.querySelector(".btn-del").onclick  = () => {
        if (confirm("¿Eliminar este producto?")) deleteProduct(id);
      };
    });
  }

  function deleteProduct(id) {
  fetch("https://admin-backend-ts85.onrender.com/productos/" + id, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("Producto eliminado");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Error al eliminar producto");
    });
}


  

  async function openEditModal(id) {
  const res = await fetch("https://admin-backend-ts85.onrender.com/productos");
  const productosList = await res.json();
  const p = productosList.find(x => x._id === id || x.id == id);
  if (!p) return alert("Producto no encontrado");

  touchSession();
  catalogoModal.classList.add("open");

  const inputFotos = document.getElementById("fotos");
  inputFotos.required = false;

  form.nombre.value      = p.nombre;
  form.categoria.value   = p.categoria;
  form.precio.value      = p.precio;
  form.descripcion.value = p.descripcion;
  form.descuento.value   = p.descuento;

    if (form.marcas)    form.marcas.value    = p.marcas.join(", ");
    if (form.productos) form.productos.value = p.productos.join(", ");
    if (form.isPack)    form.isPack.checked  = p.isPack;
    if (p.categoria === "Pijama") {
      form.talla.value  = p.talla || "";
      form.genero.value = p.genero || "";
    }

    form.onsubmit = async e => {
  e.preventDefault();
  const newFiles = Array.from(inputFotos.files || []);
  if (newFiles.length) {
    const more = await Promise.all(
      newFiles.map(f => new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(f);
      }))
    );
    p.fotos = p.fotos.concat(more);
  }

  p.nombre      = form.nombre.value.trim();
  p.categoria   = form.categoria.value;
  p.precio      = parseFloat(form.precio.value);
  p.descripcion = form.descripcion.value.trim();
  p.descuento   = parseFloat(form.descuento.value) || 0;

  if (form.marcas)    p.marcas    = form.marcas.value.split(",").map(s=>s.trim()).filter(Boolean);
  if (form.productos) p.productos = form.productos.value.split(",").map(s=>s.trim()).filter(Boolean);
  if (form.isPack)    p.isPack    = form.isPack.checked;
  if (p.categoria === "Pijama") {
    p.talla  = form.talla.value.trim();
    p.genero = form.genero.value;
  }

  await fetch("https://admin-backend-ts85.onrender.com/productos/" + p._id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p)
  });

  catalogoModal.classList.remove("open");
  location.reload();
  alert("✅ Producto actualizado");
};
  }


  window.createAddCatBtn   = createAddCatBtn;
  window.enableEditDelete = enableEditDelete;
});
