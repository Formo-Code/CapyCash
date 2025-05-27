const express = require('express');
const {
    registrarNuevoUsuario,
    iniciarSesionDeUsuario,
    obtenerDatosUsuarioActual,
    actualizarDatosPerfilUsuario
} = require('../controladores/controladorAutenticacion');
const { protegerRuta } = require('../middleware/autenticacionMiddleware');

const enrutador = express.Router();

enrutador.post('/registrar', registrarNuevoUsuario);
enrutador.post('/login', iniciarSesionDeUsuario);
enrutador.get('/me', protegerRuta, obtenerDatosUsuarioActual);
enrutador.put('/profile', protegerRuta, actualizarDatosPerfilUsuario);

module.exports = enrutador;