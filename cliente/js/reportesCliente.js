/* === LÓGICA PARA LA PANTALLA DE REPORTES === */
/* Estas funciones se encargan de que el usuario pueda ver sus gastos o ingresos
   agrupados de distintas maneras, como por categoría. ¡Para analizar la info que tenemos*/

/* Cuando el usuario entra a la pantalla de "Reportes", esta función prepara todo. */
function prepararInterfazDeReportes() {
  // Si existe el lugar donde se muestra el reporte, lo limpiamos y ponemos un mensaje inicial.
  if (divContenidoReporte) divContenidoReporte.innerHTML = '<p>Elegí qué tipo de reporte querés ver y después dale al botón de "Generar".</p>';
  // Si había algún mensaje de error de reportes, lo escondemos.
  if (divErrorReporte) ocultarMensajeErrorDeElemento(divErrorReporte);

}

/* Esta se ejecuta cuando el usuario aprieta el botón "Generar Reporte". */
async function procesarGeneracionDeReporte() {
  // Agarramos el menú desplegable donde el usuario elige qué reporte quiere.
  const selectorTipoReporte = document.getElementById('report-type');

  // Chequeamos que existan los lugares en el HTML para mostrar el reporte y los errores. Si no, algo anda mal.
  if (!divContenidoReporte || !divErrorReporte || !selectorTipoReporte) {
    console.error("Faltan elementos en la página para mostrar los reportes. Revisá el HTML, che.");
    return;
  }
  // Escondemos cualquier error viejo.
  ocultarMensajeErrorDeElemento(divErrorReporte);
  // Ponemos un mensaje de "cargando" mientras se genera el reporte.
  divContenidoReporte.innerHTML = '<p>Estamos cocinando el reporte, aguantame un cachito...</p>';

  // Vemos qué tipo de reporte eligió el usuario.
  const valorTipoReporte = selectorTipoReporte.value; // Ej: 'category-expense' o 'category-income'
  let endpointAPI = ''; // La dirección del "cerebro" (backend) a la que vamos a llamar.
  let tituloReporte = ''; // El título que va a tener el reporte en la pantalla.

  // Según lo que eligió, preparamos la dirección y el título.
  // El "cerebro" espera que le digamos si queremos 'type=income' (ingresos) o 'type=expense' (gastos).
  if (valorTipoReporte === 'category-expense') {
    endpointAPI = '/presupuestos/category?type=expense'; // Le pedimos gastos por categoría.
    tituloReporte = 'Gastos Agrupados por Categoría';
  } else if (valorTipoReporte === 'category-income') {
    endpointAPI = '/presupuestos/category?type=income'; // Le pedimos ingresos por categoría.
    tituloReporte = 'Ingresos Agrupados por Categoría';
  } else {
    // Si eligió algo que no conocemos, le mostramos un error.
    mostrarMensajeErrorEnElemento(divErrorReporte, 'Mmm, ese tipo de reporte no lo conozco.');
    divContenidoReporte.innerHTML = ''; // Limpiamos el "cargando".
    return;
  }

  try {
    // ¡A buscar los datos! Llamamos al "cerebro" con la dirección que armamos.
    const respuesta = await realizarPeticionAPI(endpointAPI, 'GET');
    // Esperamos que el "cerebro" nos devuelva los datos así:
    // [{ _id: 'NombreDeLaCategoria', totalAmount: 1250.75, count: 5 }, { ... }]
    // O sea, una lista donde cada ítem es una categoría con su monto total y cuántos movimientos tiene.

    if (respuesta.exito && respuesta.datos) {
      // Si todo salió bien y tenemos datos, llamamos a la función que arma la tabla linda.
      renderizarReporteDeCategorias(respuesta.datos, tituloReporte, divContenidoReporte);
    } else {
      // Si no, mostramos un error. Usamos el mensaje que nos dio el "cerebro" o uno genérico.
      mostrarMensajeErrorEnElemento(divErrorReporte, respuesta.mensaje || 'No pudimos conseguir los datos para el reporte.');
      divContenidoReporte.innerHTML = '<p>No se pudo generar el reporte. Intentá de nuevo.</p>';
    }
  } catch (error) {
    // Si hubo un error más grave (ej: no anda el servidor), lo mostramos.
    mostrarMensajeErrorEnElemento(divErrorReporte, error.message);
    divContenidoReporte.innerHTML = '<p>¡Macana! Hubo un error groso generando el reporte.</p>';
  }
}

/* Esta función agarra los datos del reporte y los transforma en una tabla HTML bien bonita.
   'datos' es la lista de categorías con sus totales.
   'titulo' es el título que va arriba de la tabla.
   'contenedor' es el lugar en la página (div) donde vamos a meter la tabla. */
function renderizarReporteDeCategorias(datos, titulo, contenedor) {
  if (!contenedor) return; // Si no sabemos dónde poner la tabla, no hacemos nada.

  // Si no hay datos o la lista está vacía, mostramos un mensaje.
  if (!datos || datos.length === 0) {
    contenedor.innerHTML = `<h3>${titulo}</h3><p>Parece que no hay nada para mostrar en este reporte.</p>`;
    return;
  }

  // Empezamos a armar el HTML de la tabla.
  let htmlTabla = `<h3>${titulo}</h3>
    <table>
      <thead><tr><th>Categoría</th><th>Nº de Movimientos</th><th>Monto Total</th></tr></thead>
      <tbody>`; // Cabecera de la tabla.

  let granTotalMonto = 0; // Para ir sumando el total de todos los montos.

  // Por cada categoría en los datos que nos llegaron...
  datos.forEach(item => { // 'item' tiene _id (la categoría), totalAmount (monto total de esa categoría) y count (cantidad).
    granTotalMonto += item.totalAmount; // Sumamos al gran total.
    // Armamos una fila (`<tr>`) para esta categoría con sus datos.
    htmlTabla += `<tr>
      <td>${item._id}</td>
      <td>${item.count}</td>
      <td>${formatearMoneda(item.totalAmount)}</td>
    </tr>`;
  });

  // Cerramos el cuerpo de la tabla y agregamos el pie (`<tfoot>`) con el total general.
  htmlTabla += `</tbody>
    <tfoot><tr class="total-row"><td colspan="2"><strong>Total General</strong></td><td><strong>${formatearMoneda(granTotalMonto)}</strong></td></tr></tfoot>
    </table>`;

  // Y ahora Metemos toda la tabla que armamos adentro del contenedor en la página.
  contenedor.innerHTML = htmlTabla;
}