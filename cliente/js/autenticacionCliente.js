/* === LÓGICA PARA QUE EL USUARIO ENTRE O SE REGISTRE (AUTENTICACIÓN) === */
/* Estas funciones se encargan de todo el asunto para que el usuario pueda
   iniciar sesión con su cuenta o crear una nueva. */

/* Cuando el usuario aprieta "Entrar" en el formulario de Login.
   'evento' es la información de lo que pasó (en este caso, el envío del formulario). */
async function gestionarSubmitLogin(evento) {
  // Esto evita que la página se recargue, que es lo que hacen los formularios por defecto.
  evento.preventDefault();
  // Si había algún mensaje de error viejo en el login, lo escondemos.
  ocultarMensajeErrorDeElemento(divErrorLogin);

  // Agarramos lo que el usuario escribió en el campo de email y le sacamos los espacios de más.
  const email = document.getElementById('login-email').value.trim();
  // Agarramos la contraseña que escribió. 'login-password' es el ID que tiene en el HTML.
  const clave = document.getElementById('login-password').value.trim();

  // Si no escribió ni el email ni la contraseña, le mostramos un error y no seguimos.
  if (!email || !clave) {
    return mostrarMensajeErrorEnElemento(divErrorLogin, 'Capo, el email y la contraseña son obligatorios.');
  }

  try {
    // Le pedimos al "cerebro" (backend) que verifique el email y la clave.
    // Mandamos los datos como '{ email, clave }'. El 'false' al final significa que esta
    // operación no necesita el "pase VIP" (token) porque justamente estamos tratando de conseguirlo.
    const respuesta = await realizarPeticionAPI('/usuarios/login', 'POST', { email, clave }, false);

    // Si el cerebro nos dice que todo salió bien ('exito: true') y nos da un token...
    if (respuesta.exito && respuesta.token) {
      // Guardamos el token en el navegador para usarlo después.
      localStorage.setItem('tokenAutenticacion', respuesta.token);
      // También lo guardamos en nuestra variable 'tokenAutenticacion'.
      tokenAutenticacion = respuesta.token;
      // Guardamos los datos del usuario que nos mandó el cerebro (nombre, email, etc.).
      usuarioLogueado = respuesta.datos;
      // Actualizamos el menú de arriba para que muestre las opciones de usuario logueado.
      actualizarMenuNavegacion();
      // Limpiamos los campos del formulario de login.
      if (formularioLogin) formularioLogin.reset();
      // Cargamos los datos del panel y mostramos esa pantalla.
      precargarDatosYCambiarVista('dashboard-view');
      // Le damos la bienvenida con un mensajito lindo.
      mostrarMensajeAlertaGlobal('¡Qué bueno verte de nuevo, crack!', 'success');
    }
    // Si 'respuesta.exito' es falso, la función 'realizarPeticionAPI' ya se encargó de
    // preparar un error con el mensaje que vino del servidor. Ese error se agarra en el 'catch' de abajo.
  } catch (error) {
    // Si algo salió mal (contraseña incorrecta, usuario no existe, etc.), mostramos el error.
    mostrarMensajeErrorEnElemento(divErrorLogin, error.message);
  }
}

/* Cuando el usuario aprieta "Registrarme" en el formulario de Registro. */
async function gestionarSubmitRegistro(evento) {
  evento.preventDefault(); // Que no se recargue la página.
  ocultarMensajeErrorDeElemento(divErrorRegistro); // Escondemos errores viejos.

  // Agarramos todos los datos que puso el usuario.
  const nombreUsuario = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const clave = document.getElementById('register-password').value.trim();
  const confirmarClave = document.getElementById('register-confirm-password').value.trim();

  // Verificamos que haya llenado todos los campos.
  if (!nombreUsuario || !email || !clave || !confirmarClave) {
    return mostrarMensajeErrorEnElemento(divErrorRegistro, 'Che, tenés que llenar todos los campos, ¿eh?');
  }
  // La contraseña tiene que tener al menos 6 letras o números.
  if (clave.length < 6) {
    return mostrarMensajeErrorEnElemento(divErrorRegistro, 'La contraseña tiene que ser más larga, probá con 6 caracteres como mínimo.');
  }
  // Verificamos que las dos contraseñas que puso sean iguales.
  if (clave !== confirmarClave) {
    return mostrarMensajeErrorEnElemento(divErrorRegistro, 'Las contraseñas no son iguales, revisalas.');
  }

  try {
    // Le pedimos al "cerebro" que cree un usuario nuevo con estos datos.
    // No necesita token porque es un usuario nuevo.
    const respuesta = await realizarPeticionAPI('/usuarios/registrar', 'POST', { nombreUsuario, email, clave }, false);

    // Si el cerebro dice que todo OK y nos da un token...
    if (respuesta.exito && respuesta.token) {
      localStorage.setItem('tokenAutenticacion', respuesta.token); // Guardamos el token.
      tokenAutenticacion = respuesta.token; // Lo ponemos en nuestra variable.
      usuarioLogueado = respuesta.datos; // Guardamos los datos del nuevo usuario.
      actualizarMenuNavegacion(); // Actualizamos el menú.
      if (formularioRegistro) formularioRegistro.reset(); // Limpiamos el formulario.
      precargarDatosYCambiarVista('dashboard-view'); // Lo mandamos al panel.
      // Mensajito de bienvenida para el nuevo integrante.
      mostrarMensajeAlertaGlobal('¡De primera! Ya estás registrado en CapyCash. ¡Bienvenido/a!', 'success');
    }
  } catch (error) {
    // Si hubo algún bardo (ej: el email ya estaba usado), mostramos el error.
    mostrarMensajeErrorEnElemento(divErrorRegistro, error.message);
  }
}

/* Cuando el usuario aprieta "Salir" o cuando necesitamos cerrar la sesión. */
function gestionarLogoutUsuario() {
  // Borramos el token del navegador. ¡Chau pase VIP!
  localStorage.removeItem('tokenAutenticacion');
  // Limpiamos nuestras variables.
  tokenAutenticacion = null;
  usuarioLogueado = null;
  // Actualizamos el menú para que muestre "Login" y "Registro".
  actualizarMenuNavegacion();

  // Limpiamos la información que se veía en las distintas pantallas
  // para que no quede nada del usuario anterior.
  if (divResumenPanel) divResumenPanel.innerHTML = '<p>Cargando resumen...</p>';
  if (listaTransaccionesRecientes) listaTransaccionesRecientes.innerHTML = '';
  if (listaPresupuestosCompleta) listaPresupuestosCompleta.innerHTML = '';
  if (divContenidoReporte) divContenidoReporte.innerHTML = '<p>Elegí qué tipo de reporte querés y dale generar.</p>';
  
  // Mandamos al usuario a la pantalla de Login.
  cambiarVista('login-view');
}

/* Esta función se usa para verificar si el token que tenemos guardado sigue siendo válido
   y para traer los datos del usuario que está logueado. */
async function obtenerYEstablecerUsuarioLogueado() {
  // Si no tenemos ningún token guardado, no hay nada que hacer.
  if (!tokenAutenticacion) {
    usuarioLogueado = null;
    return;
  }

  try {
    // Le pedimos al cerebro: "Che, con este token, ¿quién soy?".
    // '/usuarios/me' es una dirección común para pedir los datos del usuario actual.
    // El 'true' significa que SÍ necesita el token para esta operación.
    const respuesta = await realizarPeticionAPI('/usuarios/me', 'GET', null, true);

    // Si el cerebro nos responde bien y nos da los datos del usuario...
    if (respuesta.exito && respuesta.datos) {
      // Guardamos los datos del usuario (nombre, email, etc.).
      usuarioLogueado = respuesta.datos;
    } else {
      // Si no se pudo (ej: el token ya no sirve), avisamos y limpiamos.
      console.warn("No pudimos traer los datos del usuario:", respuesta.mensaje);
      usuarioLogueado = null;
      // Tiramos un error para que se maneje donde se llamó a esta función.
      throw new Error(respuesta.mensaje || "El token no es válido o la sesión se venció.");
    }
  } catch (error) {
    // Si hubo cualquier problema (ej: el token expiró, el servidor no está)...
    console.error("Hubo un error al tratar de obtener el usuario actual (seguro el token está fulero):", error.message);
    usuarioLogueado = null; // Limpiamos por si acaso.
    throw error; // Volvemos a tirar el error para que lo agarre la función que llamó a esta.
  }
}