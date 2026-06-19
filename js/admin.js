// ================================================
// admin.js — Panel de administración de productos
// Solo accesible para usuarios con rol = 'admin'
// ================================================

const STORAGE_BUCKET = "product-images";

let adminProductos = [];
let adminCategorias = [];
let adminImagenFile = null; // archivo de imagen seleccionado

// ── GUARD: solo admin puede ver este panel ──────
function verificarRolAdmin(rol) {
  return rol === "admin";
}

// ── URL pública de imagen de un producto ────────
function getImagenUrl(producto) {
  // 1. Si tiene imagen_url guardada en Supabase Storage, úsala
  if (producto.imagen_url) return producto.imagen_url;
  // 2. Fallback: imagen local por nombre
  return `img/${producto.nombre}.png`;
}

// ── CARGAR CATEGORÍAS en el <select> ────────────
async function cargarCategoriasAdmin() {
  if (adminCategorias.length > 0) return;

  const { data, error } = await db
    .from("product_categories")
    .select("id, nombre, emoji")
    .order("nombre");

  if (error || !data) return;

  adminCategorias = data;
  const select = document.getElementById("admin-categoria");
  if (!select) return;

  select.innerHTML =
    '<option value="">— Selecciona categoría —</option>' +
    data
      .map(
        (c) =>
          `<option value="${c.id}">${escaparHtml(c.emoji)} ${escaparHtml(c.nombre)}</option>`
      )
      .join("");
}

// ── CARGAR Y PINTAR LISTA DE PRODUCTOS ──────────
async function cargarProductosAdmin() {
  const lista = document.getElementById("admin-products-list");
  if (!lista) return;
  lista.innerHTML = "<p>Cargando...</p>";

  const { data, error } = await db
    .from("products")
    .select("*, product_categories(id, nombre, emoji)")
    .order("nombre");

  if (error) {
    lista.innerHTML = `<p class="error-msg">Error: ${escaparHtml(error.message)}</p>`;
    return;
  }

  adminProductos = data || [];
  pintarListaAdmin(adminProductos);
}

function pintarListaAdmin(productos) {
  const lista = document.getElementById("admin-products-list");
  if (!lista) return;

  if (!productos.length) {
    lista.innerHTML = "<p>No hay productos.</p>";
    return;
  }

  lista.innerHTML = productos
    .map((p) => {
      const imgSrc = getImagenUrl(p);
      return `
      <div class="admin-product-row" data-id="${escaparHtml(String(p.id))}">
        <div class="admin-product-info">
          <div class="admin-product-thumb">
            <img src="${escaparHtml(imgSrc)}" alt="${escaparHtml(p.nombre)}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="admin-product-emoji-fallback" style="display:none">${escaparHtml(p.emoji || "📦")}</span>
          </div>
          <div>
            <p class="admin-product-nombre">${escaparHtml(p.nombre)}</p>
            <p class="admin-product-meta">
              Bs. ${Number(p.precio).toFixed(2)} · 
              ${escaparHtml(p.product_categories?.emoji || "")} ${escaparHtml(p.product_categories?.nombre || "Sin categoría")}
            </p>
          </div>
        </div>
        <div class="admin-product-btns">
          <button class="btn-admin-edit" data-id="${escaparHtml(String(p.id))}">✏️ Editar</button>
          <button class="btn-admin-delete" data-id="${escaparHtml(String(p.id))}">🗑️ Eliminar</button>
        </div>
      </div>
    `;
    })
    .join("");

  lista.querySelectorAll(".btn-admin-edit").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      const producto = adminProductos.find((p) => String(p.id) === id);
      if (producto) cargarFormularioEdicion(producto);
    });
  });

  lista.querySelectorAll(".btn-admin-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      const producto = adminProductos.find((p) => String(p.id) === id);
      if (producto) confirmarEliminacion(producto);
    });
  });
}

// ── FILTRO DE BÚSQUEDA ───────────────────────────
function inicializarBusquedaAdmin() {
  const input = document.getElementById("admin-search");
  if (!input) return;
  input.addEventListener("input", function () {
    const texto = this.value.toLowerCase().trim();
    const filtrados = adminProductos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        (p.descripcion || "").toLowerCase().includes(texto) ||
        (p.product_categories?.nombre || "").toLowerCase().includes(texto)
    );
    pintarListaAdmin(filtrados);
  });
}

// ── PREVIEW DE IMAGEN ────────────────────────────
function inicializarInputImagen() {
  const input = document.getElementById("admin-imagen");
  if (!input) return;
  input.addEventListener("change", function () {
    adminImagenFile = this.files[0] || null;
    const preview = document.getElementById("admin-imagen-preview");
    if (!preview) return;
    if (adminImagenFile) {
      const url = URL.createObjectURL(adminImagenFile);
      preview.src = url;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  });
}

// ── SUBIR IMAGEN A STORAGE ───────────────────────
async function subirImagen(archivo, nombreProducto) {
  // Nombre único: timestamp + nombre limpio
  const ext = archivo.name.split(".").pop().toLowerCase();
  const nombreLimpio = nombreProducto
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
  const path = `${Date.now()}-${nombreLimpio}.${ext}`;

  const { error } = await db.storage
    .from(STORAGE_BUCKET)
    .upload(path, archivo, { upsert: false });

  if (error) throw new Error("No se pudo subir la imagen: " + error.message);

  const { data } = db.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── FORMULARIO: MODO EDICIÓN ─────────────────────
function cargarFormularioEdicion(producto) {
  document.getElementById("admin-form-title").textContent = "✏️ Editar Producto";
  document.getElementById("admin-product-id").value = producto.id;
  document.getElementById("admin-nombre").value = producto.nombre;
  document.getElementById("admin-precio").value = producto.precio;
  document.getElementById("admin-emoji").value = producto.emoji || "";
  document.getElementById("admin-descripcion").value = producto.descripcion || "";
  document.getElementById("admin-categoria").value =
    producto.product_categories?.id || producto.category_id || "";

  // Mostrar imagen actual si existe
  const preview = document.getElementById("admin-imagen-preview");
  if (preview) {
    const src = getImagenUrl(producto);
    preview.src = src;
    preview.style.display = "block";
    preview.onerror = () => (preview.style.display = "none");
  }

  adminImagenFile = null;
  const inputImg = document.getElementById("admin-imagen");
  if (inputImg) inputImg.value = "";

  document.getElementById("admin-submit-btn").textContent = "Actualizar Producto";
  document.getElementById("admin-cancel-btn").style.display = "inline-flex";
  document.getElementById("admin-form-msg").textContent = "";
  document.getElementById("admin-product-form").scrollIntoView({ behavior: "smooth" });
}

// ── FORMULARIO: RESETEAR ─────────────────────────
function resetearFormularioAdmin() {
  document.getElementById("admin-form-title").textContent = "➕ Agregar Producto";
  document.getElementById("admin-product-id").value = "";
  document.getElementById("admin-product-form").reset();
  document.getElementById("admin-submit-btn").textContent = "Guardar Producto";
  document.getElementById("admin-cancel-btn").style.display = "none";
  document.getElementById("admin-form-msg").textContent = "";
  const preview = document.getElementById("admin-imagen-preview");
  if (preview) preview.style.display = "none";
  adminImagenFile = null;
  limpiarErroresAdmin();
}

function limpiarErroresAdmin() {
  ["err-admin-nombre", "err-admin-precio", "err-admin-categoria"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    }
  );
  ["admin-nombre", "admin-precio", "admin-categoria"].forEach((id) => {
    document.getElementById(id)?.classList.remove("input-error");
  });
}

// ── VALIDAR FORMULARIO ────────────────────────────
function validarFormularioAdmin() {
  limpiarErroresAdmin();
  let valido = true;

  const nombre = document.getElementById("admin-nombre").value.trim();
  const precio = document.getElementById("admin-precio").value.trim();
  const categoria = document.getElementById("admin-categoria").value;

  if (!nombre) {
    document.getElementById("err-admin-nombre").textContent = "El nombre es obligatorio";
    document.getElementById("admin-nombre").classList.add("input-error");
    valido = false;
  }

  if (!precio || isNaN(Number(precio)) || Number(precio) < 0) {
    document.getElementById("err-admin-precio").textContent = "Ingresa un precio válido";
    document.getElementById("admin-precio").classList.add("input-error");
    valido = false;
  }

  if (!categoria) {
    document.getElementById("err-admin-categoria").textContent = "Selecciona una categoría";
    document.getElementById("admin-categoria").classList.add("input-error");
    valido = false;
  }

  return valido;
}

// ── GUARDAR (INSERT / UPDATE) ────────────────────
async function guardarProductoAdmin(e) {
  e.preventDefault();
  if (!validarFormularioAdmin()) return;

  const btn = document.getElementById("admin-submit-btn");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const msg = document.getElementById("admin-form-msg");
  msg.style.color = "";
  msg.textContent = "";

  const id = document.getElementById("admin-product-id").value;
  const nombre = document.getElementById("admin-nombre").value.trim();

  try {
    // Subir imagen si se seleccionó una nueva
    let imagen_url = undefined;
    if (adminImagenFile) {
      btn.textContent = "Subiendo imagen...";
      imagen_url = await subirImagen(adminImagenFile, nombre);
    }

    const payload = {
      nombre,
      precio: parseFloat(parseFloat(document.getElementById("admin-precio").value).toFixed(2)),
      emoji: document.getElementById("admin-emoji").value.trim() || "📦",
      descripcion: document.getElementById("admin-descripcion").value.trim(),
      category_id: Number(document.getElementById("admin-categoria").value),
    };

    // Solo incluir imagen_url si se subió una nueva
    if (imagen_url !== undefined) payload.imagen_url = imagen_url;

    btn.textContent = "Guardando...";

    let error;
    if (id) {
      ({ error } = await db.from("products").update(payload).eq("id", id));
    } else {
      ({ error } = await db.from("products").insert(payload));
    }

    if (error) throw new Error(error.message);

    msg.textContent = id ? "✅ Producto actualizado." : "✅ Producto agregado.";
    resetearFormularioAdmin();
    await cargarProductosAdmin();
    setTimeout(() => (msg.textContent = ""), 3000);

  } catch (err) {
    msg.style.color = "var(--color-accent2)";
    msg.textContent = "Error: " + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = id ? "Actualizar Producto" : "Guardar Producto";
  }
}

// ── ELIMINAR ─────────────────────────────────────
function confirmarEliminacion(producto) {
  const existente = document.getElementById("admin-confirm-modal");
  if (existente) existente.remove();

  const modal = document.createElement("div");
  modal.id = "admin-confirm-modal";
  modal.className = "admin-modal-overlay";
  modal.innerHTML = `
    <div class="admin-modal">
      <p class="admin-modal-titulo">¿Eliminar producto?</p>
      <p class="admin-modal-desc">${escaparHtml(producto.emoji || "📦")} <strong>${escaparHtml(producto.nombre)}</strong></p>
      <p class="admin-modal-warning">Esta acción no se puede deshacer.</p>
      <div class="admin-modal-btns">
        <button id="modal-cancel" class="btn btn-admin-cancel">Cancelar</button>
        <button id="modal-confirm" class="btn btn-admin-delete-confirm">🗑️ Sí, eliminar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("modal-cancel").addEventListener("click", () => modal.remove());
  document.getElementById("modal-confirm").addEventListener("click", async () => {
    modal.remove();
    await eliminarProducto(producto.id);
  });
}

async function eliminarProducto(id) {
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) {
    mostrarMensaje("Error al eliminar: " + error.message, "error");
    return;
  }
  mostrarMensaje("Producto eliminado correctamente.", "exito");
  await cargarProductosAdmin();
}

// ── INICIALIZAR PANEL ADMIN ──────────────────────
function inicializarAdmin() {
  const form = document.getElementById("admin-product-form");
  if (!form) return;

  // Evitar doble binding si se navega varias veces
  const nuevoForm = form.cloneNode(true);
  form.parentNode.replaceChild(nuevoForm, form);
  nuevoForm.addEventListener("submit", guardarProductoAdmin);

  document.getElementById("admin-cancel-btn").addEventListener("click", resetearFormularioAdmin);

  inicializarInputImagen();
  cargarCategoriasAdmin();
  cargarProductosAdmin();
  inicializarBusquedaAdmin();
}

// ── ROL ──────────────────────────────────────────
function mostrarSeccionSegunRol(rol) {
  const linkAdmin = document.getElementById("nav-admin-link");
  if (linkAdmin) {
    linkAdmin.style.display = verificarRolAdmin(rol) ? "list-item" : "none";
  }
}
