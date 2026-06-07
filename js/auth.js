// js/auth.js
function supabaseAuthDisponible() {
  return typeof db !== "undefined" && db?.auth;
}

function mensajeSupabaseNoDisponible() {
  return "No se pudo conectar con Supabase. Revisa tu conexion a internet y recarga la pagina.";
}

function conTiempoLimite(promesa, mensaje, ms = 8000) {
  return Promise.race([
    promesa,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(mensaje)), ms);
    }),
  ]);
}

// ── REGISTRO ────────────────────────────────
async function registrarUsuario(nombre, email, password) {
  try {
    if (!supabaseAuthDisponible()) {
      return { ok: false, error: mensajeSupabaseNoDisponible() };
    }

    const { data, error } = await conTiempoLimite(
      db.auth.signUp({
        email,
        password,
        options: { data: { nombre } }
      }),
      "El registro tardo demasiado. Revisa tu conexion o la configuracion de Supabase.",
    );
    console.log("signUp result:", { data, error });
    if (error) {
      return { ok: false, error: error.message || JSON.stringify(error) };
    }
    if (!data?.user?.id) {
      return {
        ok: false,
        error: "Supabase no devolvio un usuario valido.",
      };
    }
    return { ok: true, usuario: data.user };
  } catch (e) {
    console.error("registrarUsuario exception:", e);
    return { ok: false, error: "Error inesperado: " + e.message };
  }
}

// ── LOGIN ───────────────────────────────────
async function iniciarSesion(email, password) {
  try {
    if (!supabaseAuthDisponible()) {
      return { ok: false, error: mensajeSupabaseNoDisponible() };
    }

    const { data, error } = await conTiempoLimite(
      db.auth.signInWithPassword({ email, password }),
      "El login tardo demasiado. Revisa tu conexion o la configuracion de Supabase.",
    );
    console.log("signIn result:", { data, error });
    if (error) {
      return { ok: false, error: error.message || JSON.stringify(error) };
    }
    const { data: perfil } = await conTiempoLimite(
      db
        .from("profiles")
        .select("nombre, rol")
        .eq("id", data.user.id)
        .single(),
      "El perfil tardo demasiado en cargarse.",
    );
    return {
      ok: true,
      usuario: data.user,
      nombre: perfil?.nombre ?? email,
      rol: perfil?.rol ?? "cliente",
    };
  } catch (e) {
    console.error("iniciarSesion exception:", e);
    return { ok: false, error: "Error inesperado: " + e.message };
  }
}
// ── LOGOUT ──────────────────────────────────
async function cerrarSesion() {
  if (!supabaseAuthDisponible()) return;
  await db.auth.signOut();
  actualizarNavbar(null);
}
// ── OBTENER USUARIO ACTUAL ───────────────────
async function obtenerUsuarioActual() {
  if (!supabaseAuthDisponible()) return null;

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await db
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();
  return { ...user, nombre: perfil?.nombre, rol: perfil?.rol };
}

// ── LISTENER DE SESION ──────────────────────
if (supabaseAuthDisponible()) {
  db.auth.onAuthStateChange(async (evento, sesion) => {
    if (evento === "SIGNED_IN") {
      setTimeout(async () => {
        const usuario = await obtenerUsuarioActual();
        actualizarNavbar(usuario);
        mostrarSeccionSegunRol(usuario?.rol);
      }, 0);
    }
    if (evento === "SIGNED_OUT") {
      actualizarNavbar(null);
      mostrarSeccionSegunRol(null);
    }
  });
}

// Conectar formulario de LOGIN
function inicializarLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errEl = document.getElementById("login-error");
    const okEl = document.getElementById("login-success");
    errEl.textContent = "";
    okEl.textContent = "";
    if (!email || !password) {
      errEl.textContent = "Completa todos los campos";
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Ingresando...";

    const resultado = await iniciarSesion(email, password);
    btn.disabled = false;
    btn.textContent = "Ingresar";

    if (!resultado.ok) {
      errEl.textContent = resultado.error || "Email o contrasena incorrectos";
      return;
    }
    okEl.textContent = "Bienvenido, " + resultado.nombre + "!";
    setTimeout(() => navegarA("home"), 1500);
  });
}

// Conectar formulario de REGISTRO
function inicializarRegistro() {
  const form = document.getElementById("register-form");
  if (!form) return;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const errEl = document.getElementById("register-error");
    const okEl = document.getElementById("register-success");
    errEl.textContent = "";
    okEl.textContent = "";

    if (!nombre || !email || !password) {
      errEl.textContent = "Completa todos los campos";
      return;
    }
    if (password.length < 6) {
      errEl.textContent = "La contraseña debe tener al menos 6 caracteres";
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Creando...";

    const resultado = await registrarUsuario(nombre, email, password);
    btn.disabled = false;
    btn.textContent = "Crear cuenta";

    console.log("resultado registro:", resultado);
    if (!resultado.ok) {
      errEl.textContent = resultado.error || "Error al registrarse";
      return;
    }
    okEl.textContent = "¡Registro exitoso! Revisa tu email y confirma tu cuenta para poder iniciar sesión.";
    form.reset();
  });
}

function mostrarSeccionSegunRol(_rol) {
  // Reservado para funciones de admin en el futuro
}

function actualizarNavbar(usuario) {
  // Eliminar items de auth anteriores
  document.querySelectorAll(".auth-item").forEach((el) => el.remove());
  const navLinks = document.getElementById("navLinks");
  if (usuario) {
    // Usuario autenticado
    navLinks.innerHTML += `
<li class='auth-item'>
<span class='nav-user'>
Hola, ${usuario.nombre} (${usuario.rol})
</span>
</li>
<li class='auth-item'>
<a href='#' id='btn-logout' class='nav-link'>Salir</a>
</li>
`;
    document
      .getElementById("btn-logout")
      ?.addEventListener("click", cerrarSesion);
  } else {
    // Sin sesion
    navLinks.innerHTML += `
<li class='auth-item'>
<a href='#' class='nav-link' data-view='login'>Ingresar</a>
</li>
<li class='auth-item'>
<a href='#' class='nav-link' data-view='register'>Registrarse</a>
</li>
`;
  }
}
