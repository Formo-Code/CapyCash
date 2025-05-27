/* === LÓGICA PARA QUE EL USUARIO MANEJE SU PERFIL === */
/* Estas funciones son para que el usuario pueda ver y cambiar sus datos,
   como el nombre de usuario o el correo electrónico. */

/* Esta función agarra los datos del usuario que ya está logueado y los pone
   en los campitos del formulario de perfil para que los vea. */
async function cargarDatosDelPerfil() {
  // Si no hay nadie logueado, no podemos mostrar ningún perfil.
  if (!usuarioLogueado) {
    console.warn("Perfil: No hay nadie conectado. ¡Rajando de acá!");
    gestionarLogoutUsuario(); // Lo pateamos al login.
    return; // No sigas, que no hay nada que cargar.
  }
  // Buscamos el campito para el nombre de usuario en el HTML y le ponemos el nombre guardado.
  // Si por alguna razón no hay nombre, lo dejamos vacío.
  const inputUsername = document.getElementById('profile-username');
  if (inputUsername) inputUsername.value = usuarioLogueado.nombreUsuario || '';

  // Hacemos lo mismo con el campito del email.
  const inputEmail = document.getElementById('profile-email');
  if (inputEmail) inputEmail.value = usuarioLogueado.email || '';

  // Si había algún mensaje viejo (de error o de éxito) en la vista de perfil, lo escondemos.
  ocultarMensajeErrorDeElemento(divMensajePerfil);
}

/* Esta se activa cuando el usuario aprieta "Guardar Cambios" en su perfil.
   'evento' tiene la data del envío del formulario. */
async function gestionarActualizacionDePerfil(evento) {
  // Frenamos la recarga de la página, ¡que no se nos vaya todo al diablo!
  evento.preventDefault();
  // Escondemos cualquier mensaje que haya quedado de antes.
  ocultarMensajeErrorDeElemento(divMensajePerfil);

  // Agarramos lo que el usuario escribió ahora en el campo de nombre de usuario.
  const nombreUsuarioActual = document.getElementById('profile-username').value.trim();
  // Y lo que escribió en el campo de email.
  const emailActual = document.getElementById('profile-email').value.trim();

  // Chequeamos que no haya dejado los campos vacíos, ¡un nombre y un email necesitamos!
  if (!nombreUsuarioActual || !emailActual) {
    return mostrarMensajeErrorEnElemento(divMensajePerfil, 'Capo, el nombre de usuario y el email no pueden estar vacíos.');
  }

  // Preparamos un paquetito para mandar al "cerebro" (backend)
  // SOLAMENTE con las cosas que cambiaron. No vamos a gastar pólvora en chimangos.
  const datosParaEnviar = {};
  // Comparamos el nombre que está ahora en el formulario con el que teníamos guardado.
  if (nombreUsuarioActual !== usuarioLogueado.nombreUsuario) {
    datosParaEnviar.nombreUsuario = nombreUsuarioActual; // Si cambió, lo metemos al paquete.
  }
  // Hacemos lo mismo con el email.
  if (emailActual !== usuarioLogueado.email) {
    datosParaEnviar.email = emailActual; // Si cambió, al paquete también.
  }

  // Si después de comparar, el paquete está vacío, significa que el usuario no cambió nada.
  if (Object.keys(datosParaEnviar).length === 0) {
    // Le avisamos que no tocó nada, con buena onda.
    if (divMensajePerfil) {
        divMensajePerfil.textContent = 'No cambiaste nada, ¡todo sigue igual!';
        divMensajePerfil.className = 'message info'; // Estilo de mensaje informativo.
        divMensajePerfil.style.display = 'block'; // Lo mostramos.
    }
    return; // No hacemos nada más.
  }

  try {
    // Ahora sí, mandamos el paquetito con los cambios al "cerebro".
    // Usamos 'PUT' que es el método para actualizar cosas que ya existen.
    // El 'true' es porque para cambiar el perfil, obvio que necesita estar logueado (tener token).
    const respuesta = await realizarPeticionAPI('/usuarios/profile', 'PUT', datosParaEnviar, true);

    // Si el "cerebro" nos dice que todo joya y nos devuelve los datos actualizados...
    if (respuesta.exito && respuesta.datos) {
      // Actualizamos nuestros datos guardados del usuario con los nuevos que llegaron.
      usuarioLogueado = respuesta.datos;
      // Actualizamos el menú de navegación, por si cambió el nombre de usuario que se muestra ahí.
      actualizarMenuNavegacion();
      // Volvemos a cargar los datos en el formulario para que se vean los cambios reflejados.
      cargarDatosDelPerfil();
      // Le mostramos un mensaje al usuario de que todo salió pipí cucú.
      if (divMensajePerfil) {
          divMensajePerfil.textContent = '¡Listo el pollo! Perfil actualizado como un campeón.';
          divMensajePerfil.className = 'message success'; // Estilo de mensaje de éxito.
          divMensajePerfil.style.display = 'block';
      }
    }
    // Si 'respuesta.exito' es false, 'realizarPeticionAPI' ya tiró el error.
  } catch (error) {
    // Si hubo algún quilombo (ej: el email nuevo ya lo usa otro), mostramos el error.
    mostrarMensajeErrorEnElemento(divMensajePerfil, error.message);
  }
}