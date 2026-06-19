// ==========================
// NAVEGACIÓN SPA
// ==========================
function navegarA(vista) {
  const vistaReal = vista === "login" || vista === "register" ? "auth" : vista;

  document
    .querySelectorAll(".view")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("view-" + vistaReal)?.classList.add("active");

  if (vistaReal === "menu") renderizarProductos();

  if (vistaReal === "admin") {
    if (typeof inicializarAdmin === "function") inicializarAdmin();
  }

  if (vistaReal === "auth") {
    const tab = vista === "login" || vista === "register" ? vista : "login";
    document
      .querySelectorAll(".auth-tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".auth-panel")
      .forEach((p) => p.classList.remove("active"));
    document
      .querySelector(`.auth-tab[data-tab="${tab}"]`)
      ?.classList.add("active");
    document.getElementById(`auth-panel-${tab}`)?.classList.add("active");
  }

  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  document
    .querySelector(`.nav-link[data-view="${vista}"]`)
    ?.classList.add("active");
}

// Delegación de eventos para el navbar (cubre links estáticos y dinámicos)
document.getElementById("navLinks").addEventListener("click", function (e) {
  const enlace = e.target.closest("[data-view]");
  if (!enlace) return;
  e.preventDefault();
  navegarA(enlace.dataset.view);

  const navLinks = document.getElementById("navLinks");
  navLinks.classList.remove("open");
  document.getElementById("navToggle")?.classList.remove("active");
});

// Tabs dentro de la vista auth
document.addEventListener("click", function (e) {
  const tab = e.target.closest(".auth-tab");
  if (!tab) return;
  const panel = tab.dataset.tab;
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-panel")
    .forEach((p) => p.classList.remove("active"));
  tab.classList.add("active");
  document.getElementById(`auth-panel-${panel}`)?.classList.add("active");
});

// ==========================
// PRODUCTOS
// Emojis añadidos para representar visualmente cada producto
// ==========================
// const productos = [
//   {
//     id: 1,
//     nombre: "Café Americano",
//     descripcion: "Café negro clásico",
//     precio: 12,
//     emoji: "☕",
//   },
//   {
//     id: 2,
//     nombre: "Capuccino",
//     descripcion: "Café con leche espumosa",
//     precio: 18,
//     emoji: "🍵",
//   },
//   {
//     id: 3,
//     nombre: "Latte",
//     descripcion: "Café suave con leche",
//     precio: 16,
//     emoji: "🥛",
//   },
//   {
//     id: 4,
//     nombre: "Brownie",
//     descripcion: "Postre de chocolate",
//     precio: 10,
//     emoji: "🍫",
//   },
// ];

// ==========================
// ESTADO DEL CARRITO
// ==========================
let carrito = [];

function guardarCarrito() {
  localStorage.setItem("aroma_carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
  const carritoGuardado = localStorage.getItem("aroma_carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }
}

// ==========================
// RENDER PRODUCTOS
// Se usa la nueva estructura HTML con clases mejoradas
// ==========================
// function renderizarProductos() {
//   const contenedor = document.getElementById("products-container");

//   contenedor.innerHTML = "";

//   productos.forEach(function (producto) {
//     contenedor.innerHTML += `
//       <div class="product-card">

//         <!-- Área visual del producto (emoji como imagen) -->
//         <div class="product-image">${producto.emoji}</div>

//         <!-- Información del producto -->
//         <div class="product-info">
//           <h3>${producto.nombre}</h3>
//           <p class="product-description">${producto.descripcion}</p>
//           <span class="product-price">Bs. ${producto.precio}</span>

//           <button class="btn-add" data-id="${producto.id}">
//             + Agregar al carrito
//           </button>
//         </div>

//       </div>
//     `;
//   });

//   // EVENTOS BOTONES — lógica original sin cambios
//   const botones = document.querySelectorAll(".btn-add");

//   botones.forEach(function (boton) {
//     boton.addEventListener("click", function () {
//       const id = parseInt(this.dataset.id);
//       const producto = productos.find((p) => p.id === id);

//       const existente = carrito.find((p) => p.id === producto.id);

//       if (existente) {
//         existente.cantidad += 1;
//       } else {
//         carrito.push({ ...producto, cantidad: 1 });
//       }
//       guardarCarrito();
//       actualizarContador();
//       renderizarCarrito();

//       // Microinteracción: feedback visual en el botón
//       this.textContent = "✓ Agregado";
//       this.style.background = "#1b5e20";
//       const btn = this;
//       setTimeout(function () {
//         btn.textContent = "+ Agregar al carrito";
//         btn.style.background = "";
//       }, 1000);
//     });
//   });
// }

// DESPUES — productos desde la base de datos real, agrupados por categoría

const PRODUCTOS_RESPALDO = [
  {
    id: 1,
    nombre: "Teclado Mecánico",
    descripcion: "Teclado mecánico gaming con switches azules y retroiluminación RGB",
    precio: 250,
    emoji: "⌨️",
    product_categories: { nombre: "Periféricos", emoji: "🖱️" },
  },
  {
    id: 2,
    nombre: "Mouse Gaming",
    descripcion: "Mouse óptico 6400 DPI con 6 botones programables y luz RGB",
    precio: 120,
    emoji: "🖱️",
    product_categories: { nombre: "Periféricos", emoji: "🖱️" },
  },
  {
    id: 3,
    nombre: "Memoria RAM 8GB",
    descripcion: "Memoria RAM DDR4 8GB 3200MHz compatible con Intel y AMD",
    precio: 180,
    emoji: "💾",
    product_categories: { nombre: "Componentes", emoji: "🔧" },
  },
  {
    id: 4,
    nombre: "Memoria RAM 16GB",
    descripcion: "Memoria RAM DDR4 16GB 3200MHz de alto rendimiento",
    precio: 320,
    emoji: "💾",
    product_categories: { nombre: "Componentes", emoji: "🔧" },
  },
  {
    id: 5,
    nombre: "Cable HDMI 2.0",
    descripcion: "Cable HDMI 2.0 de 2 metros, soporte 4K 60Hz",
    precio: 35,
    emoji: "🔌",
    product_categories: { nombre: "Cables y Accesorios", emoji: "🔌" },
  },
  {
    id: 6,
    nombre: "Hub USB 4 Puertos",
    descripcion: "Hub USB 3.0 de 4 puertos con transferencia de hasta 5Gbps",
    precio: 65,
    emoji: "🔌",
    product_categories: { nombre: "Cables y Accesorios", emoji: "🔌" },
  },
  {
    id: 7,
    nombre: "SSD 240GB",
    descripcion: "Disco sólido SSD SATA 240GB, lectura 550MB/s escritura 500MB/s",
    precio: 220,
    emoji: "💿",
    product_categories: { nombre: "Almacenamiento", emoji: "💿" },
  },
  {
    id: 8,
    nombre: "Pasta Térmica",
    descripcion: "Pasta térmica de alta conductividad para procesadores, 4g",
    precio: 25,
    emoji: "🔧",
    product_categories: { nombre: "Componentes", emoji: "🔧" },
  },
];

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Genera las tarjetas de producto para un array dado
function generarTarjetas(productos) {
  return productos.map((producto) => {
    const nombreImg = escaparHtml(producto.nombre);
    // Usar imagen_url de Storage si existe, si no intentar imagen local por nombre
    const imgSrc = producto.imagen_url
      ? escaparHtml(producto.imagen_url)
      : `img/${producto.nombre}.png`;
    return `
    <div class='product-card'>
      <div class='product-image'>
        <img src='${imgSrc}' alt='${nombreImg}' class='product-img'
             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <span class='product-emoji-fallback' style='display:none'>${escaparHtml(producto.emoji || "📦")}</span>
      </div>
      <div class='product-info'>
        <h3>${escaparHtml(producto.nombre)}</h3>
        <p class='product-description'>${escaparHtml(producto.descripcion)}</p>
        <span class='product-price'>Bs. ${Number(producto.precio).toFixed(2)}</span>
        <button class='btn-add' data-id='${escaparHtml(String(producto.id))}'>
          + Agregar al carrito
        </button>
      </div>
    </div>
  `}).join("");
}

// Asigna eventos a todos los botones "Agregar al carrito" del contenedor
function asignarEventosBotones(contenedor, todosLosProductos) {
  contenedor.querySelectorAll(".btn-add").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const producto = todosLosProductos.find((p) => Number(p.id) === id);
      if (!producto) return;

      const existente = carrito.find((p) => Number(p.id) === id);
      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({
          ...producto,
          id,
          precio: Number(producto.precio),
          cantidad: 1,
        });
      }

      guardarCarrito();
      actualizarContador();
      renderizarCarrito();

      this.textContent = "✓ Agregado";
      this.style.background = "#48ff00";
      const btn = this;
      setTimeout(function () {
        btn.textContent = "+ Agregar al carrito";
        btn.style.background = "";
      }, 1000);
    });
  });
}

// Pinta los productos agrupados por categoría
function pintarProductos(contenedor, productos) {
  contenedor.innerHTML = "";

  // Agrupar por categoría usando el join con product_categories
  const grupos = {};
  productos.forEach((p) => {
    const cat = p.product_categories?.nombre ?? "Sin categoría";
    const emoji = p.product_categories?.emoji ?? "🧩";
    if (!grupos[cat]) grupos[cat] = { emoji, items: [] };
    grupos[cat].items.push(p);
  });

  // Renderizar cada sección de categoría
  Object.keys(grupos).sort().forEach((categoria) => {
    const { emoji, items } = grupos[categoria];
    const seccion = document.createElement("div");
    seccion.className = "categoria-seccion";
    seccion.innerHTML = `
      <div class="categoria-header">
        <span class="categoria-emoji">${escaparHtml(emoji)}</span>
        <h3 class="categoria-titulo">${escaparHtml(categoria)}</h3>
        <span class="categoria-cantidad">${items.length} producto${items.length !== 1 ? "s" : ""}</span>
      </div>
      <div class="categoria-productos">
        ${generarTarjetas(items)}
      </div>
    `;
    contenedor.appendChild(seccion);
  });

  asignarEventosBotones(contenedor, productos);
}

async function renderizarProductos() {
  const contenedor = document.getElementById("products-container");
  contenedor.innerHTML = "<p>Cargando catálogo...</p>";

  try {
    if (typeof db === "undefined") {
      throw new Error("No se pudo inicializar Supabase");
    }

    const consultaProductos = db
      .from("products")
      .select("*, product_categories(nombre, emoji)")
      .order("nombre", { ascending: true });

    const { data: productos, error } = await Promise.race([
      consultaProductos,
      new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("La carga de productos tardó demasiado")),
          5000,
        );
      }),
    ]);

    if (error) throw error;

    if (!productos || productos.length === 0) {
      contenedor.innerHTML =
        "<p>No hay productos disponibles en este momento.</p>";
      return;
    }

    pintarProductos(contenedor, productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    pintarProductos(contenedor, PRODUCTOS_RESPALDO);
  }
}

// ==========================
// CONTADOR CARRITO
// Actualiza el badge del navbar con animación
// ==========================
function actualizarContador() {
  const contador = document.getElementById("cart-count");

  // Total de unidades (suma de cantidades)
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  contador.textContent = total;

  // Animación "bump" al actualizar
  contador.classList.remove("bump");
  void contador.offsetWidth; // Fuerza reflow para reiniciar la animación
  contador.classList.add("bump");
  setTimeout(() => contador.classList.remove("bump"), 300);
}

// ==========================
// RENDER CARRITO
// Muestra items con controles de cantidad y total
// ==========================
function renderizarCarrito() {
  const contenedor = document.getElementById("cart-container");

  contenedor.innerHTML = "";

  // Carrito vacío
  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde el menú</p>
      </div>
    `;
    return;
  }

  // Renderizar cada item
  carrito.forEach(function (producto) {
    contenedor.innerHTML += `
      <div class="cart-item">

        <!-- Imagen del producto -->
        <div class="cart-item-emoji">
          <img src="img/${producto.nombre}.png" alt="${producto.nombre}" class="cart-item-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
          <span style="display:none">${producto.emoji}</span>
        </div>

        <!-- Nombre y precio unitario -->
        <div class="cart-item-info">
          <p class="cart-item-name">${producto.nombre}</p>
          <p class="cart-item-price">Bs. ${producto.precio} c/u</p>
        </div>

        <!-- Controles de cantidad -->
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-id="${producto.id}">−</button>
          <span class="qty-value">${producto.cantidad}</span>
          <button class="qty-btn" data-action="increase" data-id="${producto.id}">+</button>
        </div>

        <!-- Subtotal del item -->
        <div class="cart-item-total">
          Bs. ${(producto.precio * producto.cantidad).toFixed(2)}
        </div>

      </div>
    `;
  });

  // Calcular total general
  const subtotal = carrito.reduce((acc, producto) => {
    return acc + producto.precio * producto.cantidad;
  }, 0);

  const delivery = subtotal * 0.15;
  const total = subtotal + delivery;

  // Resumen y botón de checkout
  contenedor.innerHTML += `
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>Bs. ${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Delivery</span>
        <span>Bs. ${delivery.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span class="cart-total-label">Total</span>
        <span class="cart-total-amount">Bs. ${total.toFixed(2)}</span>
      </div>
      <button class="btn-checkout" onclick="confirmarPedido()">
        🛍️ Confirmar Pedido
      </button>
      <button class="btn-whatsapp" onclick="confirmarPorWhatsapp()">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Confirmar por WhatsApp
      </button>
    </div>
  `;

  // Eventos para los botones + y −
  contenedor.querySelectorAll(".qty-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      const accion = this.dataset.action;
      const item = carrito.find((p) => String(p.id) === id);

      if (!item) return;

      if (accion === "increase") {
        item.cantidad += 1;
      } else if (accion === "decrease") {
        item.cantidad -= 1;
        // Si llega a 0, eliminar del carrito
        if (item.cantidad <= 0) {
          carrito = carrito.filter((p) => String(p.id) !== id);
        }
      }
      guardarCarrito();
      actualizarContador();
      renderizarCarrito();
    });
  });
}

function inicializarFormularioContacto() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const mensaje = document.getElementById("contact-message");

    const errorNombre = document.getElementById("error-name");
    const errorEmail = document.getElementById("error-email");
    const errorMensaje = document.getElementById("error-message");

    const exito = document.getElementById("form-success");

    errorNombre.textContent = "";
    errorEmail.textContent = "";
    errorMensaje.textContent = "";
    exito.textContent = "";

    nombre.classList.remove("input-error");
    email.classList.remove("input-error");
    mensaje.classList.remove("input-error");

    let valido = true;

    if (nombre.value.trim() === "") {
      errorNombre.textContent = "El nombre es obligatorio";
      nombre.classList.add("input-error");
      valido = false;
    }

    if (email.value.trim() === "") {
      errorEmail.textContent = "El email es obligatorio";
      email.classList.add("input-error");
      valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      errorEmail.textContent = "Ingresa un email válido";
      email.classList.add("input-error");
      valido = false;
    }

    if (mensaje.value.trim() === "") {
      errorMensaje.textContent = "El mensaje es obligatorio";
      mensaje.classList.add("input-error");
      valido = false;
    }
    if (!valido) return;

    exito.textContent = "Mensaje enviado correctamente";
    form.reset();
  });
}

async function confirmarPedido() {
  const btnCheckout = document.querySelector(".btn-checkout");
  if (btnCheckout) {
    btnCheckout.disabled = true;
    btnCheckout.textContent = "Procesando...";
  }

  const restoreBtn = () => {
    if (btnCheckout) {
      btnCheckout.disabled = false;
      btnCheckout.textContent = "🛍️ Confirmar Pedido";
    }
  };

  // 1. Verificar sesion activa
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    mostrarMensaje("Debes iniciar sesion primero", "error");
    navegarA("login");
    restoreBtn();
    return;
  }
  if (carrito.length === 0) {
    mostrarMensaje("El carrito esta vacio", "error");
    restoreBtn();
    return;
  }

  // 2. Calcular total
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const delivery = subtotal * 0.15;
  const total = subtotal + delivery;

  // 3. Insertar en orders
  const { data: pedido, error: e1 } = await db
    .from("orders")
    .insert({
      user_id: user.id,
      total: parseFloat(total.toFixed(2)),
      estado: "pending",
    })
    .select()
    .single();

  if (e1) {
    mostrarMensaje("Error al registrar pedido: " + e1.message, "error");
    restoreBtn();
    return;
  }

  // 4. Insertar items del pedido
  const items = carrito.map((item) => ({
    order_id: pedido.id,
    product_id: item.id,
    cantidad: item.cantidad,
    precio_unit: item.precio,
  }));
  const { error: e2 } = await db.from("order_items").insert(items);
  if (e2) {
    mostrarMensaje("Error al registrar productos: " + e2.message, "error");
    restoreBtn();
    return;
  }

  // 5. Limpiar carrito y confirmar
  carrito = [];
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  mostrarMensaje(
    "Pedido #" + pedido.id + " confirmado! Gracias por tu compra.",
    "exito",
  );
}

function confirmarPorWhatsapp() {
  if (carrito.length === 0) {
    mostrarMensaje("El carrito está vacío", "error");
    return;
  }

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const delivery = subtotal * 0.15;
  const total = subtotal + delivery;

  // Construir lista de productos con formato compacto
  const lineas = carrito.map(
    (item) =>
      `${item.nombre} x${item.cantidad} - Bs.${(item.precio * item.cantidad).toFixed(2)}`
  );

  const encabezado = "Hola! Quiero hacer un pedido en Tecno Orion:\n\n";
  const pie = `\nSubtotal: Bs.${subtotal.toFixed(2)}\nDelivery: Bs.${delivery.toFixed(2)}\nTOTAL: Bs.${total.toFixed(2)}`;
  const NUMERO = "59174330341";
  const LIMITE = 1900; // margen de seguridad por debajo del límite de WhatsApp

  // Intentar meter todos los productos en un solo mensaje
  const mensajeCompleto = encabezado + lineas.join("\n") + pie;

  if (encodeURIComponent(mensajeCompleto).length <= LIMITE) {
    // Todo entra en un solo mensaje
    window.open(
      `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensajeCompleto)}`,
      "_blank"
    );
    // Vaciar carrito
    carrito = [];
    guardarCarrito();
    actualizarContador();
    renderizarCarrito();
    return;
  }

  // Si no entra todo, dividir en partes
  const partes = [];
  let parteActual = encabezado;
  const totalPartes = Math.ceil(lineas.length / 1); // se calcularán dinámicamente

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i] + "\n";
    const esUltima = i === lineas.length - 1;
    const candidato = parteActual + linea + (esUltima ? pie : "");

    if (encodeURIComponent(candidato).length > LIMITE && parteActual !== encabezado) {
      // Esta parte está llena, cerrarla y empezar otra
      partes.push(parteActual.trimEnd());
      parteActual = "(continuación)\n" + linea;
    } else {
      parteActual += linea;
    }
  }

  // Agregar pie al último trozo
  parteActual += pie;
  partes.push(parteActual.trimEnd());

  // Abrir cada parte con un pequeño delay para no bloquear popups
  partes.forEach((parte, i) => {
    setTimeout(() => {
      window.open(
        `https://wa.me/${NUMERO}?text=${encodeURIComponent(parte)}`,
        "_blank"
      );
    }, i * 800);
  });

  if (partes.length > 1) {
    mostrarMensaje(
      `Se abrirán ${partes.length} ventanas de WhatsApp con tu pedido completo`,
      "exito"
    );
  }

  // Vaciar carrito después de enviar por WhatsApp
  carrito = [];
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
}

function mostrarMensaje(texto, tipo) {
  let el = document.getElementById("mensaje-global");
  if (!el) {
    el = document.createElement("div");
    el.id = "mensaje-global";
    el.style.cssText =
      "position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:8px;font-weight:600;z-index:1000;color:white;";
    document.body.appendChild(el);
  }
  el.textContent = texto;
  el.style.background = tipo === "exito" ? "#090364" : "#DC2626";
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}

// ==========================
// INICIALIZAR
// ==========================
cargarCarrito();
renderizarCarrito();
actualizarContador();
inicializarFormularioContacto();
if (typeof inicializarLogin === "function") inicializarLogin();
if (typeof inicializarRegistro === "function") inicializarRegistro();
if (typeof actualizarNavbar === "function") actualizarNavbar(null);
