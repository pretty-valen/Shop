<script>
document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("contenedor-secciones");
  const leftBtn  = document.getElementById("scroll-left");
  const rightBtn = document.getElementById("scroll-right");

  // calcula desplazamiento: ancho de una tarjeta + gap
  const itemStyle = getComputedStyle(cont.querySelector(".seccion"));
  const gap = parseInt(itemStyle.marginRight) + parseInt(itemStyle.marginLeft);
  const itemWidth = cont.querySelector(".seccion").offsetWidth + gap;

  function updateArrows() {
    const overflow = cont.scrollWidth > cont.clientWidth;
    leftBtn.style.display  = overflow && cont.scrollLeft > 0                       ? "block" : "none";
    rightBtn.style.display = overflow && cont.scrollLeft + cont.clientWidth < cont.scrollWidth ? "block" : "none";
  }

  rightBtn.addEventListener("click", () => {
    cont.scrollBy({ left: itemWidth, behavior: "smooth" });
  });
  leftBtn.addEventListener("click", () => {
    cont.scrollBy({ left: -itemWidth, behavior: "smooth" });
  });
  cont.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);

  updateArrows(); // primera comprobación
});
</script>
