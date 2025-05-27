const express = require('express');
const {
    obtenerTodosLosPresupuestos,
    agregarNuevoPresupuesto,
    obtenerPresupuestoUnicoPorId,
    actualizarPresupuestoExistente,
    eliminarPresupuestoPorId,
    obtenerResumenDePresupuestos,
    obtenerPresupuestosAgrupadosPorCategoria
} = require('../controladores/controladorPresupuesto');
const { protegerRuta } = require('../middleware/autenticacionMiddleware');

const enrutador = express.Router();

enrutador.use(protegerRuta); // Todas estas rutas están protegidas

enrutador.route('/')
    .get(obtenerTodosLosPresupuestos)
    .post(agregarNuevoPresupuesto);

enrutador.get('/summary', obtenerResumenDePresupuestos);
enrutador.get('/category', obtenerPresupuestosAgrupadosPorCategoria);

enrutador.route('/:id')
    .get(obtenerPresupuestoUnicoPorId)
    .put(actualizarPresupuestoExistente)
    .delete(eliminarPresupuestoPorId);

module.exports = enrutador;