/* === LÓGICA PARA MANEJAR LOS MANGOS (PRESUPUESTOS/TRANSACCIONES) === */
/* Acá están las funciones para que el usuario pueda cargar sus gastos, ingresos,
   ver toda la lista, modificar algo si se equivocó o borrarlo si ya no va más. */

/* Trae TODOS los movimientos (ingresos y gastos) que el usuario haya cargado
   y los muestra en la pantalla de "Registros". */
async function cargarTodosLosPresupuestos() {
  // Si no hay nadie logueado o no existe el lugar en la página para mostrar la lista, cortamos acá.
  if (!usuarioLogueado || !listaPresupuestosCompleta) return;

  // Mientras carga, ponemos un mensajito para que el usuario no se impaciente.
  listaPresupuestosCompleta.innerHTML = '<li>Aguantame que estoy trayendo todos los registros...</li>';
  try {
    // Le pedimos al "cerebro" (backend) que nos mande todos los presupuestos/transacciones.
    const respuesta = await realizarPeticionAPI('/presupuestos', 'GET');
    // Si todo salió bien y nos llegaron los datos...
    if (respuesta.exito && respuesta.datos) {
      if (respuesta.datos.length > 0) { // Si hay al menos un registro...
        // Transformamos cada registro en un pedacito de HTML (usando la función que ya teníamos)
        // y los juntamos todos para meterlos en la lista.
        listaPresupuestosCompleta.innerHTML = respuesta.datos.map(crearElementoListaTransaccionHTML).join('');
      } else {
        // Si no hay nada, avisamos.
        listaPresupuestosCompleta.innerHTML = '<li>Todavía no cargaste ningún movimiento. ¡Empezá ahora!</li>';
      }
    }
    // Si 'respuesta.exito' es false, la función realizarPeticionAPI ya se encarga del error.
  } catch (error) {
    // Si hubo algún problema al traer los datos, lo mostramos en la lista.
    listaPresupuestosCompleta.innerHTML = `<li>Uhh, no pudimos cargar los registros: ${error.message}</li>`;
  }
}

/* Esta función deja el formulario de cargar transacciones limpito y listo
   para que el usuario agregue un movimiento nuevo. */
function reiniciarFormularioDeTransaccion() {
  if (!formularioTransaccion) return; // Si no existe el formulario, no hacemos nada.
  formularioTransaccion.reset(); // Borra todo lo que el usuario haya escrito en los campos.
  if (inputIdTransaccionOculto) inputIdTransaccionOculto.value = ''; // Borramos el ID oculto, ¡clave para que sepa que es "añadir"!
  if (tituloFormularioTransaccion) tituloFormularioTransaccion.textContent = 'Añadir Nuevo Movimiento'; // Ponemos el título para "nuevo".
  ocultarMensajeErrorDeElemento(divErrorTransaccion); // Sacamos cualquier error viejo.

  // Ponemos la fecha de hoy por defecto en el campo de fecha. ¡Un golazo!
  const campoFecha = document.getElementById('transaction-date');
  if (campoFecha) campoFecha.valueAsDate = new Date();

  // Por defecto, que esté seleccionado "gasto", que es lo más común.
  const campoTipo = document.getElementById('transaction-type');
  if (campoTipo) campoTipo.value = 'gasto';
}

/* Cuando el usuario quiere editar un movimiento, esta función agarra los datos
   de ese movimiento y los pone en el formulario para que pueda cambiarlos. */
function popularFormularioTransaccionConDatos(transaccion) { // 'transaccion' viene del backend.
  if (!formularioTransaccion || !transaccion) return; // Si falta algo, no seguimos.
  reiniciarFormularioDeTransaccion(); // Primero, lo limpiamos y ponemos el título como si fuera nuevo.
  if (tituloFormularioTransaccion) tituloFormularioTransaccion.textContent = 'Editar Movimiento'; // ¡Pero ahora cambiamos el título a "Editar"!
  if (inputIdTransaccionOculto) inputIdTransaccionOculto.value = transaccion._id; // Ponemos el ID del movimiento en el campo oculto.

  // Llenamos cada campito del formulario con los datos de la transacción.
  // El backend nos manda: tipo, categoria, monto, fecha, descripcion.
  const campoTipo = document.getElementById('transaction-type');
  if (campoTipo) campoTipo.value = transaccion.tipo; // 'ingreso' o 'gasto'.

  const campoCategoria = document.getElementById('transaction-category');
  if (campoCategoria) campoCategoria.value = transaccion.categoria;

  const campoMonto = document.getElementById('transaction-amount');
  if (campoMonto) campoMonto.value = transaccion.monto;

  // Para el campo de fecha (que es de tipo "date"), necesitamos la fecha en formato "AAAA-MM-DD".
  // La fecha del backend viene más completa, así que la "cortamos".
  const campoFecha = document.getElementById('transaction-date');
  if (campoFecha) campoFecha.value = new Date(transaccion.fecha).toISOString().split('T')[0];

  const campoDescripcion = document.getElementById('transaction-description');
  if (campoDescripcion) campoDescripcion.value = transaccion.descripcion || ''; // Si no hay descripción, queda vacío.
}

/* Esta función se ejecuta cuando el usuario aprieta "Guardar" en el formulario de transacciones.
   Se fija si es un movimiento nuevo o si está editando uno viejo y actúa como corresponde. */
async function gestionarGuardadoDeTransaccion(evento) {
  evento.preventDefault(); // Frenamos la recarga de la página.
  ocultarMensajeErrorDeElemento(divErrorTransaccion); // Limpiamos errores viejos.

  // Sacamos el ID del campo oculto. Si hay algo, es porque estamos editando.
  const idTransaccion = inputIdTransaccionOculto ? inputIdTransaccionOculto.value : null;

  // Recolectamos todos los datos que el usuario puso en el formulario.
  // Los nombres de las claves (type, category, etc.) son los que espera el "cerebro" (backend).
  const datosTransaccion = {
    type: document.getElementById('transaction-type')?.value,
    category: document.getElementById('transaction-category')?.value.trim(),
    amount: parseFloat(document.getElementById('transaction-amount')?.value), // Convertimos el monto a número.
    date: document.getElementById('transaction-date')?.value,
    description: document.getElementById('transaction-description')?.value.trim()
  };

  // ¡A validar! Chequeamos que los campos importantes estén llenos y bien.
  if (!datosTransaccion.type || !datosTransaccion.category || isNaN(datosTransaccion.amount) || datosTransaccion.amount <= 0 || !datosTransaccion.date) {
    return mostrarMensajeErrorEnElemento(divErrorTransaccion, 'Pará, pará. Necesitás poner el tipo, la categoría, un monto mayor a cero y la fecha.');
  }

  try {
    let respuesta;
    if (idTransaccion) { // Si hay un ID, estamos EDITANDO.
      // Le mandamos los datos al "cerebro" para que actualice ese movimiento. Usamos 'PUT'.
      respuesta = await realizarPeticionAPI(`/presupuestos/${idTransaccion}`, 'PUT', datosTransaccion);
    } else { // Si no hay ID, estamos AÑADIENDO uno nuevo.
      // Le mandamos los datos al "cerebro" para que cree un movimiento nuevo. Usamos 'POST'.
      respuesta = await realizarPeticionAPI('/presupuestos', 'POST', datosTransaccion);
    }

    // Si el "cerebro" nos dice que todo salió bien...
    if (respuesta.exito) {
      mostrarMensajeAlertaGlobal(`Movimiento ${idTransaccion ? 'actualizado' : 'añadido'} de diez.`, 'success');
      reiniciarFormularioDeTransaccion(); // Limpiamos el formulario.

      // Volvemos a cargar los datos del panel (porque el resumen pudo cambiar)
      // y la lista completa de presupuestos (para que aparezca el nuevo o el cambio).
      // Usamos Promise.all para que se hagan las dos cargas al mismo tiempo si se puede, ¡más rápido!
      await Promise.all([
        cargarDatosDelPanel(),
        cargarTodosLosPresupuestos()
      ]);
      cambiarVista('dashboard-view'); // Llevamos al usuario de vuelta al panel principal.
    }
    // Si no, 'realizarPeticionAPI' maneja el error del backend.
  } catch (error) {
    // Si hubo cualquier otro bardo, mostramos el mensaje de error en el formulario.
    mostrarMensajeErrorEnElemento(divErrorTransaccion, error.message);
  }
}

/* Cuando el usuario hace clic en el lapicito (editar) de un movimiento en la lista. */
async function prepararEdicionDeTransaccion(idTransaccion) {
  if (!idTransaccion) return; // Si no nos pasan un ID, no podemos hacer nada.
  try {
    // Le pedimos al "cerebro" los datos completos de ESE movimiento en particular.
    const respuesta = await realizarPeticionAPI(`/presupuestos/${idTransaccion}`, 'GET');
    // Si todo OK y tenemos los datos...
    if (respuesta.exito && respuesta.datos) {
      // Usamos la función para llenar el formulario con esos datos.
      popularFormularioTransaccionConDatos(respuesta.datos);
      // Y mostramos la pantalla del formulario para que el usuario pueda editar.
      cambiarVista('transaction-form-view');
    }
  } catch (error) {
    // Si no se pudo cargar, le avisamos al usuario con un mensaje global.
    mostrarMensajeAlertaGlobal(`No pudimos cargar el movimiento para editarlo: ${error.message}`, 'error');
  }
}

/* Cuando el usuario hace clic en el tachito de basura (eliminar) de un movimiento.
   (Acordate que antes de llamar a esta, ya le preguntamos si estaba seguro). */
async function procesarEliminacionDeTransaccion(idTransaccion) {
  if (!idTransaccion) return; // Sin ID, no hay tu tía.
  try {
    // Le decimos al "cerebro": "Che, borrame este movimiento". Usamos 'DELETE'.
    const respuesta = await realizarPeticionAPI(`/presupuestos/${idTransaccion}`, 'DELETE');
    // Si el "cerebro" dice que lo borró bien...
    if (respuesta.exito) {
      mostrarMensajeAlertaGlobal('Movimiento eliminado, ¡chau picho!', 'success');

      // OPTIMIZACIÓN: En vez de recargar toda la lista de la página,
      // intentamos borrar el elementito directamente del HTML. ¡Más veloz!
      const itemEnRecientes = document.querySelector(`#transactions-list li[data-id="${idTransaccion}"]`);
      if (itemEnRecientes) itemEnRecientes.remove();

      const itemEnCompleta = document.querySelector(`#full-budget-list li[data-id="${idTransaccion}"]`);
      if (itemEnCompleta) itemEnCompleta.remove();
      
      // De todas formas, el resumen del panel SÍ hay que recargarlo porque los totales cambiaron.
      await cargarDatosDelPanel();

      // Chusmeamos si las listas quedaron vacías después de borrar.
      if (listaTransaccionesRecientes && listaTransaccionesRecientes.children.length === 0) {
        listaTransaccionesRecientes.innerHTML = '<li>Ya no quedan movimientos recientes.</li>';
      }
      if (listaPresupuestosCompleta && listaPresupuestosCompleta.children.length === 0) {
        listaPresupuestosCompleta.innerHTML = '<li>¡Vacío por acá! No hay registros.</li>';
      }
    }
    // Si no, el error lo maneja 'realizarPeticionAPI'.
  } catch (error) {
    // Si hubo un problema al intentar borrar, le avisamos.
    mostrarMensajeAlertaGlobal(`Hubo un error al querer eliminar el movimiento: ${error.message}`, 'error');
  }
}