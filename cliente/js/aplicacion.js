
const URL_BASE_API = '/api';

/* === SELECCIONANDO ELEMENTOS DE LA PÁGINA (DEL HTML) === */
/* Estas líneas son como decirle a JavaScript: "Che, agarrame esta parte de la página".
   Usamos los 'id' que pusimos en el HTML para encontrar cada cosa.
   Es como tener el control remoto de la tele y cada botón (variable) maneja una parte de la pantalla. */

// Agarra todas las "pantallas" o "vistas" principales de la aplicación.
// Una 'NodeList' es como una lista de los elementos que encontró.
const todasLasVistas = document.querySelectorAll('.view');
// La pantalla para iniciar sesión.
const vistaLogin = document.getElementById('login-view');
// La pantalla para registrarse.
const vistaRegistro = document.getElementById('register-view');
// La pantalla principal cuando ya entraste (el "panel de control").
const vistaPanel = document.getElementById('dashboard-view');
// La pantalla del formulario para agregar o editar una transacción (un gasto o un ingreso).
const vistaFormularioTransaccion = document.getElementById('transaction-form-view');
// La pantalla donde se ven todos los movimientos o presupuestos (la lista completa).
const vistaPresupuestos = document.getElementById('budget-view');
// La pantalla para ver los informes o reportes.
const vistaReportes = document.getElementById('reports-view');
// La pantalla para ver y editar los datos del usuario (el perfil).
const vistaPerfil = document.getElementById('profile-view');

// El lugar donde van a aparecer los botones del menú de navegación (ej: Panel, Registros, Salir).
const contenedorEnlacesNav = document.getElementById('nav-links');

// El formulario para iniciar sesión.
const formularioLogin = document.getElementById('login-form');
// El formulario para registrar una cuenta nueva.
const formularioRegistro = document.getElementById('register-form');
// El formulario para agregar o editar una transacción.
const formularioTransaccion = document.getElementById('transaction-form');
// El formulario para cambiar los datos del perfil del usuario.
const formularioPerfil = document.getElementById('profile-form');

// El link o botón que te lleva a la pantalla de registro.
const enlaceIrARegistro = document.getElementById('show-register');
// El link o botón que te lleva a la pantalla de inicio de sesión.
const enlaceIrALogin = document.getElementById('show-login');
// El botón en el panel para agregar una nueva transacción.
const botonAnadirTransaccionPanel = document.getElementById('add-transaction-btn');
// El botón en la vista de presupuestos para agregar un nuevo ítem (que también lleva al form de transacción).
const botonAnadirElementoPresupuesto = document.getElementById('add-budget-item-btn');
// El botón para cancelar y cerrar el formulario de transacción.
const botonCancelarFormularioTransaccion = document.getElementById('cancel-transaction-btn');
// El botón para generar un reporte.
const botonGenerarReporte = document.getElementById('generate-report-btn');

// El lugarcito en el panel donde se muestra el resumen (ingresos, gastos, balance).
const divResumenPanel = document.getElementById('dashboard-summary');
// La lista donde se muestran las últimas transacciones en el panel.
const listaTransaccionesRecientes = document.getElementById('transactions-list');
// La lista donde se muestran todos los movimientos en la vista de presupuestos.
const listaPresupuestosCompleta = document.getElementById('full-budget-list');
// El título del formulario de transacción (así sabemos si estamos agregando o editando).
const tituloFormularioTransaccion = document.getElementById('transaction-form-title');
// Un campo oculto en el formulario de transacción para guardar el ID si estamos editando algo.
const inputIdTransaccionOculto = document.getElementById('transaction-id');
// El lugar donde se va a mostrar el contenido del reporte generado.
const divContenidoReporte = document.getElementById('report-content');
// El lugarcito para mostrar mensajes en la pantalla de perfil (ej: "Datos actualizados!").
const divMensajePerfil = document.getElementById('profile-message');
// El cosito que aparece y dice "Cargando..." cuando la página está haciendo algo.
const divIndicadorCarga = document.getElementById('loading-indicator');
// Un lugar genérico para mostrar mensajes importantes al usuario en cualquier parte de la app.
const divMensajeGlobal = document.getElementById('global-message');

// Los lugarcitos específicos para mostrar mensajes de error en cada formulario.
const divErrorLogin = document.getElementById('login-error');
const divErrorRegistro = document.getElementById('register-error');
const divErrorTransaccion = document.getElementById('transaction-error');
const divErrorReporte = document.getElementById('report-error');


/* === ESTADO GENERAL DE LA APLICACIÓN === */
/* Acá guardamos información importante que puede cambiar mientras el usuario usa la página. */

// Para saber quién es el usuario que inició sesión. Al principio, nadie (null).
let usuarioLogueado = null;
// El "pase VIP" (token) que nos da el servidor cuando iniciamos sesión.
// Lo guardamos en el navegador (localStorage) para no tener que pedirlo a cada rato.
let tokenAutenticacion = localStorage.getItem('tokenAutenticacion');


/* === FUNCIONES CHICAS QUE AYUDAN (UTILITARIAS) === */
/* Estas son como pequeñas herramientas que usamos en varias partes del código para no repetirnos. */

// Muestra el cartelito de "Cargando...". Le saca la clase 'hidden' (oculto).
function mostrarIndicadorCarga() { if (divIndicadorCarga) divIndicadorCarga.classList.remove('hidden'); }
// Oculta el cartelito de "Cargando...". Le pone la clase 'hidden'.
function ocultarIndicadorCarga() { if (divIndicadorCarga) divIndicadorCarga.classList.add('hidden'); }

/* Muestra un mensaje general al usuario, como una notificación.
   'mensaje' es lo que queremos decir, y 'tipo' puede ser 'info' (normal), 'success' (todo OK) o 'error' (algo salió mal).
   El mensaje desaparece solo después de 5 segundos. */
function mostrarMensajeAlertaGlobal(mensaje, tipo = 'info') {
  if (!divMensajeGlobal) return; // Si no existe el lugar para el mensaje, no hace nada.
  divMensajeGlobal.textContent = mensaje; // Pone el texto.
  divMensajeGlobal.className = 'message hidden'; // Reinicia las clases por las dudas.
  divMensajeGlobal.classList.add(tipo); // Le da el estilo según el tipo.
  divMensajeGlobal.classList.remove('hidden'); // Lo muestra.
  // Después de 5000 milisegundos (5 segundos), lo vuelve a ocultar.
  setTimeout(() => divMensajeGlobal.classList.add('hidden'), 5000);
}

/* Muestra un mensaje de error en un lugar específico de un formulario.
   'elemento' es el lugarcito (div) donde va el mensaje, y 'mensaje' es el error. */
function mostrarMensajeErrorEnElemento(elemento, mensaje) {
  if (elemento) { // Si encontró el lugarcito...
    elemento.textContent = mensaje; // Pone el texto del error.
    elemento.style.display = 'block'; // Lo hace visible.
    // Se asegura que tenga la pinta de un mensaje de error (clase CSS).
    if (!elemento.classList.contains('error-message')) {
      elemento.classList.add('error-message');
    }
    // Si por casualidad tenía pinta de mensaje normal, se la saca.
    if (elemento.classList.contains('message')) {
      elemento.classList.remove('message');
    }
  } else { // Si no encontró el lugarcito, avisa en la consola y muestra un mensaje global.
    console.error("Elemento de error no encontrado:", mensaje);
    mostrarMensajeAlertaGlobal(`Error: ${mensaje}`, 'error');
  }
}

// Oculta un mensaje de error que estaba en un lugarcito específico.
function ocultarMensajeErrorDeElemento(elemento) {
  if (elemento) { // Si existe el lugarcito...
    elemento.textContent = ''; // Borra el texto.
    elemento.style.display = 'none'; // Lo oculta.
  }
}

// Limpia todos los mensajes de error que puedan estar visibles en los formularios.
// Útil cuando cambiamos de pantalla o empezamos algo nuevo.
function limpiarTodosLosErroresDeFormulario() {
  ocultarMensajeErrorDeElemento(divErrorLogin);
  ocultarMensajeErrorDeElemento(divErrorRegistro);
  ocultarMensajeErrorDeElemento(divErrorTransaccion);
  ocultarMensajeErrorDeElemento(divErrorReporte);
  if (divMensajePerfil) { // El del perfil puede ser de éxito o error, así que también lo limpiamos.
    divMensajePerfil.textContent = '';
    divMensajePerfil.style.display = 'none';
  }
}

/* Esta es LA función para hablar con nuestro servidor (el "cerebro" o API).
   'endpoint' es la parte específica de la dirección a la que queremos llamar (ej: '/usuarios/login').
   'metodo' es qué queremos hacer: 'GET' (pedir datos), 'POST' (mandar datos nuevos), 'PUT' (actualizar datos), etc.
   'cuerpo' son los datos que mandamos (ej: el email y contraseña para login).
   'requiereAuth' dice si necesitamos el "pase VIP" (token) para esta operación. */
async function realizarPeticionAPI(endpoint, metodo = 'GET', cuerpo = null, requiereAuth = true) {
  const url = `${URL_BASE_API}${endpoint}`; // Arma la dirección completa.
  const opciones = { // Prepara las "valijas" para el viaje al servidor.
    method: metodo, // El método que vamos a usar.
    headers: { // Las "etiquetas" de la valija.
      'Content-Type': 'application/json', // Avisa que mandamos datos en formato JSON.
      'Accept': 'application/json' // Avisa que esperamos respuesta en formato JSON.
    },
  };

  if (requiereAuth) { // Si necesita el pase VIP...
    const token = localStorage.getItem('tokenAutenticacion'); // Busca el pase en el navegador.
    if (!token) { // Si no hay pase...
      console.warn('Esta operación necesita un pase VIP (token), pero no lo encontramos. Mejor cerramos sesión.');
      gestionarLogoutUsuario(); // Cierra la sesión por seguridad.
      // Tira un error para que la operación se detenga.
      throw new Error('Acceso denegado. Necesitás iniciar sesión.');
    }
    opciones.headers['Authorization'] = `Bearer ${token}`; // Pone el pase en la etiqueta "Authorization".
  }

  // Si vamos a mandar datos ('POST', 'PUT', 'PATCH') y tenemos algo en 'cuerpo'...
  if (cuerpo && (metodo === 'POST' || metodo === 'PUT' || metodo === 'PATCH')) {
    opciones.body = JSON.stringify(cuerpo); // Convierte los datos a texto JSON y los mete en la valija.
  }

  mostrarIndicadorCarga(); // Muestra "Cargando..."

  try {
    // ¡A viajar! Hace la llamada al servidor. 'await' espera a que el servidor responda.
    const respuestaHTTP = await fetch(url, opciones);
    // Asumimos que el servidor siempre responde con JSON, así que intentamos leerlo.
    const datosRespuestaJSON = await respuestaHTTP.json();

    // Si la respuesta no fue "OK" (ej: error 404, 500) O si el servidor dijo que no tuvo éxito...
    if (!respuestaHTTP.ok || datosRespuestaJSON.exito === false) {
      // Arma un mensaje de error, usando el que mandó el servidor o uno genérico.
      const mensajeError = datosRespuestaJSON.mensaje || `Error del servidor (${respuestaHTTP.status})`;
      console.error(`Hubo bardo con la API [${metodo} ${url}]: ${mensajeError}`, datosRespuestaJSON);
      throw new Error(mensajeError); // Tira un error para que se maneje más arriba.
    }
    // Si todo salió bien, devuelve los datos que mandó el servidor.
    // Esperamos algo como { exito: true, datos: ..., mensaje: ... }
    return datosRespuestaJSON;
  } catch (error) { // Si hubo cualquier otro problema (ej: no hay internet, el servidor no responde)...
    console.error(`Falló la conexión o algo al leer la respuesta de la API [${metodo} ${url}]:`, error.message);
    // Si el error ya es uno que creamos nosotros antes (por respuestaHTTP.ok false), lo volvemos a tirar.
    // Si es un error de red (ej: 'Failed to fetch'), error.message tendrá ese texto.
    throw error; // Tira el error para que se maneje más arriba.
  } finally { // Esto se ejecuta SIEMPRE, haya salido bien o mal.
    ocultarIndicadorCarga(); // Esconde el "Cargando..."
  }
}

/* Cambia la "pantalla" que se está mostrando.
   'idVista' es el nombre (ID) de la pantalla que queremos mostrar (ej: 'login-view'). */
function cambiarVista(idVista) {
  // Primero, esconde todas las pantallas.
  todasLasVistas.forEach(vista => vista.classList.add('hidden'));
  // Busca la pantalla que queremos mostrar.
  const vistaSeleccionada = document.getElementById(idVista);
  if (vistaSeleccionada) { // Si la encontró...
    vistaSeleccionada.classList.remove('hidden'); // La muestra.
    limpiarTodosLosErroresDeFormulario(); // Limpia cualquier error viejo.
    window.scrollTo(0, 0); // Manda la vista de la página para arriba de todo.
  } else { // Si no encontró la pantalla con ese ID...
    console.error(`No encontramos la pantalla con ID "${idVista}".`);
    // Muestra una pantalla por defecto: el panel si estás logueado, o el login si no.
    cambiarVista(tokenAutenticacion && usuarioLogueado ? 'dashboard-view' : 'login-view');
  }
}

/* Actualiza los botones del menú de navegación de arriba.
   Si el usuario está logueado, muestra Panel, Registros, Reportes, Perfil y Salir.
   Si no, muestra Login y Registro. */
function actualizarMenuNavegacion() {
  if (!contenedorEnlacesNav) return; // Si no existe el contenedor del menú, no hace nada.
  contenedorEnlacesNav.innerHTML = ''; // Borra lo que había antes en el menú.

  if (tokenAutenticacion && usuarioLogueado) { // Si hay "pase VIP" y sabemos quién es el usuario...
    // Arma los botones para usuario logueado.
    // `<li>` son los ítems de la lista del menú. `<a>` son links.
    // `data-vista` es un truquito para saber a qué pantalla lleva cada link.
    contenedorEnlacesNav.innerHTML = `
      <li><a href="#" data-vista="dashboard-view">Panel</a></li>
      <li><a href="#" data-vista="budget-view">Registros</a></li>
      <li><a href="#" data-vista="reports-view">Reportes</a></li>
      <li><a href="#" data-vista="profile-view">Perfil (${usuarioLogueado.nombreUsuario})</a></li>
      <li><button id="logout-btn" class="logout-button">Salir</button></li>
    `;
    // Al botón de "Salir" le decimos que cuando le hagan clic, llame a la función para cerrar sesión.
    document.getElementById('logout-btn')?.addEventListener('click', gestionarLogoutUsuario);
  } else { // Si no está logueado...
    // Arma los botones para usuario no logueado.
    contenedorEnlacesNav.innerHTML = `
      <li><a href="#" data-vista="login-view">Login</a></li>
      <li><a href="#" data-vista="register-view">Registro</a></li>
    `;
  }
  // A todos los links del menú que tienen 'data-vista'...
  contenedorEnlacesNav.querySelectorAll('a[data-vista]').forEach(enlace => {
    // Les decimos que cuando les hagan clic...
    enlace.addEventListener('click', (e) => {
      e.preventDefault(); // Evita que el link navegue a otra página (porque es '#').
      // Llama a la función para cargar datos (si hace falta) y cambiar de pantalla.
      precargarDatosYCambiarVista(e.target.getAttribute('data-vista'));
    });
  });
}

/* Antes de cambiar de pantalla, esta función puede cargar datos necesarios para esa nueva pantalla.
   Por ejemplo, si vas al Panel, carga el resumen y las últimas transacciones. */
async function precargarDatosYCambiarVista(idVista) {
  // Si no estás logueado y querés ir a una pantalla que no sea Login o Registro, te manda al Login.
  if (!usuarioLogueado && !['login-view', 'register-view'].includes(idVista)) {
    console.log("No tenés permiso para ver esto, ¡a loguearse!");
    cambiarVista('login-view');
    return;
  }

  mostrarIndicadorCarga(); // Muestra "Cargando..."
  try {
    // Dependiendo de a qué pantalla querés ir, carga distintos datos.
    // 'await' espera a que la función de carga termine antes de seguir.
    switch (idVista) {
      case 'dashboard-view': await cargarDatosDelPanel(); break;
      case 'budget-view': await cargarTodosLosPresupuestos(); break;
      case 'profile-view': await cargarDatosDelPerfil(); break;
      case 'reports-view': prepararInterfazDeReportes(); break; // Esta no carga datos del server, solo prepara.
      case 'transaction-form-view':
        // Si el campo oculto del ID de transacción está vacío, significa que es una NUEVA transacción.
        // Entonces, resetea el formulario. Si tiene un ID, es porque estamos EDITANDO, y no lo resetea.
        if (inputIdTransaccionOculto && !inputIdTransaccionOculto.value) {
          reiniciarFormularioDeTransaccion();
        }
        break;
    }
    cambiarVista(idVista); // Ahora sí, cambia la pantalla.
  } catch (error) { // Si hubo algún problema cargando los datos...
    console.error(`No se pudieron cargar los datos para ${idVista}:`, error.message);
    // Si el error tiene que ver con el "pase VIP" (token) o sesión expirada...
    if (error.message.toLowerCase().includes('token') ||
        error.message.toLowerCase().includes('autorizado') ||
        error.message.toLowerCase().includes('sesión')) {
      mostrarMensajeAlertaGlobal('Parece que tu sesión se venció. Porfa, iniciá sesión de nuevo.', 'error');
      gestionarLogoutUsuario(); // Cierra la sesión.
    } else {
      // Si es otro error, te manda a una pantalla segura (Panel si estás logueado, Login si no).
      cambiarVista(usuarioLogueado ? 'dashboard-view' : 'login-view');
    }
  } finally { // Siempre, al final...
    ocultarIndicadorCarga(); // Esconde el "Cargando..."
  }
}


/* === FUNCIÓN PRINCIPAL QUE ARRANCA TODO CUANDO LA PÁGINA CARGA === */
// 'async' significa que adentro puede usar 'await' para esperar operaciones.
async function inicializarAplicacionCliente() {
  console.log("🚀 Arrancando CapyCash Cliente... ¡Vamos los carpinchos!");

  /* --- CONFIGURACIÓN DE EVENTOS (QUÉ HACER CUANDO EL USUARIO HACE ALGO) --- */
  // Cuando se envía el formulario de Login, llama a 'gestionarSubmitLogin'.
  formularioLogin?.addEventListener('submit', gestionarSubmitLogin);
  // Cuando se envía el formulario de Registro, llama a 'gestionarSubmitRegistro'.
  formularioRegistro?.addEventListener('submit', gestionarSubmitRegistro);
  // Cuando se envía el formulario de Transacción, llama a 'gestionarGuardadoDeTransaccion'.
  formularioTransaccion?.addEventListener('submit', gestionarGuardadoDeTransaccion);
  // Cuando se envía el formulario de Perfil, llama a 'gestionarActualizacionDePerfil'.
  formularioPerfil?.addEventListener('submit', gestionarActualizacionDePerfil);

  // Cuando se hace clic en "Ir a Registro", previene la navegación y cambia a la vista de registro.
  enlaceIrARegistro?.addEventListener('click', (e) => { e.preventDefault(); cambiarVista('register-view'); });
  // Cuando se hace clic en "Ir a Login", previene la navegación y cambia a la vista de login.
  enlaceIrALogin?.addEventListener('click', (e) => { e.preventDefault(); cambiarVista('login-view'); });

  // Esta función se va a usar para los botones de "Añadir Transacción" (tanto en Panel como en Presupuestos).
  const accionAbrirFormularioTransaccion = (e) => {
    e.preventDefault(); // Evita que el botón haga cosas raras.
    reiniciarFormularioDeTransaccion(); // Limpia el formulario por si había datos viejos.
    precargarDatosYCambiarVista('transaction-form-view'); // Carga y muestra el formulario.
  };
  // Cuando se hace clic en el botón "Añadir Transacción" del Panel...
  botonAnadirTransaccionPanel?.addEventListener('click', accionAbrirFormularioTransaccion);
  // Cuando se hace clic en el botón "Añadir Elemento" de la vista de Presupuestos...
  botonAnadirElementoPresupuesto?.addEventListener('click', accionAbrirFormularioTransaccion);

  // Cuando se hace clic en "Cancelar" en el formulario de transacción...
  botonCancelarFormularioTransaccion?.addEventListener('click', (e) => {
    e.preventDefault();
    // Vuelve al Panel (o a la vista que corresponda según la lógica de precargar).
    precargarDatosYCambiarVista('dashboard-view');
  });
  // Cuando se hace clic en "Generar Reporte"...
  botonGenerarReporte?.addEventListener('click', procesarGeneracionDeReporte);


  /* Esta función maneja los clics en los botones de "Editar" o "Eliminar"
     que aparecen en cada ítem de las listas de transacciones. */
  const gestionarAccionesDeLista = (evento) => {
    // 'closest' busca el botón más cercano al lugar donde se hizo clic.
    const botonPulsado = evento.target.closest('button');
    if (!botonPulsado) return; // Si no se hizo clic en un botón, no hace nada.

    // Busca el ítem de la lista (`<li>`) que contiene ese botón.
    // `data-id` es un atributo en el HTML donde guardamos el ID del ítem.
    const itemDeLista = botonPulsado.closest('li[data-id]');
    if (!itemDeLista) return; // Si no está dentro de un ítem con ID, no hace nada.

    const idItem = itemDeLista.dataset.id; // Saca el ID del ítem.

    if (botonPulsado.classList.contains('edit-btn')) { // Si el botón tiene la clase 'edit-btn'...
      prepararEdicionDeTransaccion(idItem); // Llama a la función para editar.
    } else if (botonPulsado.classList.contains('delete-btn')) { // Si tiene la clase 'delete-btn'...
      // Pregunta al usuario si está seguro, ¡esto no se puede deshacer fácil!
      if (confirm('¿Posta querés borrar este movimiento? Una vez hecho, caput.')) {
        procesarEliminacionDeTransaccion(idItem); // Llama a la función para borrar.
      }
    }
  };
  // Le dice a la lista de transacciones recientes que use 'gestionarAccionesDeLista' cuando haya un clic.
  listaTransaccionesRecientes?.addEventListener('click', gestionarAccionesDeLista);
  // Ídem para la lista completa de presupuestos.
  listaPresupuestosCompleta?.addEventListener('click', gestionarAccionesDeLista);


  /* --- VERIFICACIÓN INICIAL DEL ESTADO DE AUTENTICACIÓN --- */
  // Si encontramos un "pase VIP" (token) guardado en el navegador...
  if (tokenAutenticacion) {
    try {
      // Intenta obtener los datos del usuario usando ese token para ver si sigue siendo válido.
      // Esto también actualiza la variable 'usuarioLogueado'.
      await obtenerYEstablecerUsuarioLogueado();
      if (usuarioLogueado) { // Si se pudo obtener el usuario (el token era bueno)...
        actualizarMenuNavegacion(); // Muestra el menú para usuarios logueados.
        precargarDatosYCambiarVista('dashboard-view'); // Lo manda al Panel.
      } else { // Si el token era inválido o el usuario ya no existe...
        gestionarLogoutUsuario(); // Cierra la sesión.
      }
    } catch (error) { // Si hubo un error validando el token (ej: expiró, el server no responde)...
      console.error("Falló la validación del token al inicio:", error.message);
      gestionarLogoutUsuario(); // Cierra la sesión por las dudas.
    }
  } else { // Si no había ningún token guardado...
    gestionarLogoutUsuario(); // Asegura que todo esté limpio y muestra la pantalla de Login.
  }
}

// Esto hace que la función 'inicializarAplicacionCliente' se ejecute recién cuando
// toda la página HTML se haya cargado completamente. Es como decir "Cuando esté todo listo, arrancamos".
document.addEventListener('DOMContentLoaded', inicializarAplicacionCliente);

