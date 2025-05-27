/* === LÓGICA PARA MOSTRAR LAS COSAS EN EL PANEL PRINCIPAL (DASHBOARD) === */
/* Estas funciones se encargan de que veas tus ingresos, gastos y últimos movimientos
   bien prolijitos cuando entrás a la aplicación. */

/* Esta función agarra un número (el monto) y le pone el signito de pesos y los puntitos
   como se usa acá en Argentina. Por ejemplo, 1500 lo muestra como "$ 1.500,00". */
function formatearMoneda(monto) {
  // 'es-AR' es para español de Argentina. 'ARS' es el código de nuestra moneda (Pesos Argentinos).
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
}

/* Esta función agarra una fecha que viene media rara del servidor (formato ISO, ej: "2023-10-27T00:00:00.000Z")
   y la deja más linda para mostrar, como "27/10/2023". */
function formatearFecha(fechaISO) {
  // Si no nos pasan ninguna fecha, devolvemos un texto que diga eso.
  if (!fechaISO) return 'Fecha no disp.'; // "Fecha no disponible"
  try {
    // Creamos un objeto de fecha a partir del texto que nos llega.
    const fechaObj = new Date(fechaISO);

    /* A veces, si la fecha viene sin la hora (solo "2023-10-27"), el navegador
       puede pensar que es la medianoche en horario UTC (un horario universal)
       y al mostrarla en nuestro horario local, puede aparecer un día antes.
       Este pedacito intenta corregir eso si la fecha original no tiene la 'T' (que indica la hora). */
    let fechaCorregida = fechaObj;
    if (typeof fechaISO === 'string' && !fechaISO.includes('T')) {
      const partes = fechaISO.split('-'); // Separa el año, mes y día.
      // Creamos la fecha de nuevo, pero diciéndole explícitamente los componentes.
      // Ojo: el mes en JavaScript va de 0 (enero) a 11 (diciembre), por eso el "- 1".
      fechaCorregida = new Date(partes[0], partes[1] - 1, partes[2]);
    }

    // Ahora sí, la mostramos como día/mes/año. 'es-ES' es un formato común para esto.
    return fechaCorregida.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    // Si hay algún error al intentar convertir la fecha, avisamos en la consola y devolvemos "Fecha inválida".
    console.error("Hubo un bardo formateando la fecha:", fechaISO, e);
    return "Fecha inválida";
  }
}

/* Esta función arma el pedacito de HTML para mostrar UNA transacción en la lista.
   'transaccion' es un objeto que viene del "cerebro" (backend) con los datos del movimiento. */
function crearElementoListaTransaccionHTML(transaccion) {
  // Si no hay transacción o no tiene un ID, no podemos armar nada, devolvemos un texto vacío.
  if (!transaccion || !transaccion._id) return '';

  // Del backend esperamos que la transacción tenga: tipo (ingreso/gasto), categoria, monto, fecha, descripcion.
  // Dependiendo si es 'ingreso' o 'gasto', le ponemos una clase CSS distinta para que se vea verde o rojo.
  const claseMonto = transaccion.tipo === 'ingreso' ? 'income' : 'expense';
  // Usamos la función de arriba para que el monto se vea como plata argentina.
  const montoFormateado = formatearMoneda(transaccion.monto);
  // Y la otra función para que la fecha se vea legible.
  const fechaFormateada = formatearFecha(transaccion.fecha);
  // Si hay descripción, la ponemos; si no, no ponemos nada de eso.
  const descripcionHTML = transaccion.descripcion ? `<span class="description">${transaccion.descripcion}</span>` : '';

  // Acá armamos el "molde" HTML con los datos de la transacción.
  // `<li>` es un ítem de lista. `data-id` guarda el ID único de esta transacción.
  // Ponemos la categoría, la fecha, la descripción (si hay), el monto y los botoncitos de editar y borrar.
  return `
    <li data-id="${transaccion._id}">
      <div>
        <span class="category">${transaccion.categoria}</span>
        <span class="date">(${fechaFormateada})</span>
        ${descripcionHTML}
      </div>
      <div class="amount-actions">
        <span class="amount ${claseMonto}">${montoFormateado}</span>
        <div class="actions">
          <button class="edit-btn" title="Editar">✏️</button>
          <button class="delete-btn" title="Eliminar">🗑️</button>
        </div>
      </div>
    </li>
  `;
}

/* Esta función se encarga de pedirle al "cerebro" (backend) los datos
   para el panel principal y después mostrarlos en la pantalla. */
async function cargarDatosDelPanel() {
  // Si no hay un usuario logueado, o si no encontramos los lugares en el HTML
  // para poner el resumen y la lista, no hacemos nada.
  if (!usuarioLogueado || !divResumenPanel || !listaTransaccionesRecientes) return;

  // Mientras carga, ponemos unos mensajitos provisorios.
  divResumenPanel.innerHTML = '<p>Trayendo el resumen, bancame un toque...</p>';
  listaTransaccionesRecientes.innerHTML = '<li>Viendo los últimos movimientos...</li>';

  try {
    // `Promise.all` es una forma piola de hacer varias llamadas al "cerebro" al mismo tiempo
    // y esperar a que todas terminen.
    // Pedimos dos cosas: el resumen de cuentas y las últimas 5 transacciones.
    const [respuestaResumen, respuestaPresupuestosRecientes] = await Promise.all([
      // El endpoint '/presupuestos/summary' nos debería dar los totales de ingresos, gastos y el balance.
      realizarPeticionAPI('/presupuestos/summary', 'GET'),
      // El endpoint '/presupuestos?sort=-fecha&limit=5' nos da los últimos 5 movimientos,
      // ordenados por fecha (el '-' antes de 'fecha' significa orden descendente, o sea, los más nuevos primero).
      realizarPeticionAPI('/presupuestos?sort=-fecha&limit=5', 'GET')
    ]);

    // --- MOSTRAR EL RESUMEN ---
    // Si la respuesta del resumen fue exitosa y tiene datos...
    if (respuestaResumen.exito && respuestaResumen.datos) {
      const { totalIncome, totalExpense, balance } = respuestaResumen.datos; // Sacamos los valores.
      // Armamos el HTML para mostrar el resumen, usando la función de formatear moneda.
      divResumenPanel.innerHTML = `
        <div><p>Ingresos Totales</p><span class="value income">${formatearMoneda(totalIncome)}</span></div>
        <div><p>Gastos Totales</p><span class="value expense">${formatearMoneda(totalExpense)}</span></div>
        <div><p>Balance Actual</p><span class="value balance">${formatearMoneda(balance)}</span></div>
      `;
    } else {
      // Si no, mostramos un mensaje de que no se pudo.
      divResumenPanel.innerHTML = '<p>Ufa, no pudimos cargar el resumen.</p>';
    }

    // --- MOSTRAR LAS TRANSACCIONES RECIENTES ---
    // Si la respuesta de las transacciones recientes fue exitosa y tiene datos...
    if (respuestaPresupuestosRecientes.exito && respuestaPresupuestosRecientes.datos) {
      const transacciones = respuestaPresupuestosRecientes.datos; // Agarramos la lista de transacciones.
      if (transacciones.length > 0) { // Si hay al menos una...
        // Usamos 'map' para convertir cada transacción de la lista en su pedacito de HTML
        // (usando la función que creamos antes) y después 'join' para unir todos esos pedacitos.
        listaTransaccionesRecientes.innerHTML = transacciones.map(crearElementoListaTransaccionHTML).join('');
      } else {
        // Si no hay ninguna, mostramos un mensaje.
        listaTransaccionesRecientes.innerHTML = '<li>Parece que no hay movimientos recientes para mostrar.</li>';
      }
    } else {
      // Si no, mensaje de error.
      listaTransaccionesRecientes.innerHTML = '<li>Error al traer las últimas transacciones. Probá después.</li>';
    }
  } catch (error) {
    // Si hubo cualquier otro bardo al cargar los datos del panel...
    console.error("Error cargando los datos del panel:", error.message);
    // Mostramos mensajes de error más detallados en la pantalla.
    divResumenPanel.innerHTML = `<p>Error feo al cargar resumen: ${error.message}</p>`;
    listaTransaccionesRecientes.innerHTML = `<li>Error feo al cargar transacciones: ${error.message}</li>`;
  }
}