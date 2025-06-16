document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-hamburguesa");
  const nav = document.querySelector(".nav-menu");
  const ul  = nav.querySelector("ul");
  const items = [
    { title: "Inicio",    href: "index.html"    },
    { title: "Lociones",  href: "lociones.html" },
    { title: "Gorras",    href: "gorras.html"   },
    { title: "Maquillaje",href: "maquillaje.html"},
    { title: "Pijama",    href: "pijama.html"   },
    { title: "Ropa Deportiva", href: "deportiva.html" }
  ];
  ul.innerHTML = items.map(i => `<li><a href="${i.href}">${i.title}</a></li>`).join("");
  btn.addEventListener("click", () => nav.classList.toggle("open"));
});
