const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/Usuario');

exports.protegerRuta = async (peticion, respuesta, siguiente) => {
    let token;
    if (peticion.headers.authorization && peticion.headers.authorization.startsWith('Bearer')) {
        try {
            token = peticion.headers.authorization.split(' ')[1];
            const decodificado = jwt.verify(token, process.env.SECRETO_JWT);
            peticion.usuarioLogueado = await Usuario.findById(decodificado.id).select('-clave');

            if (!peticion.usuarioLogueado) {
                return respuesta.status(401).json({ exito: false, mensaje: 'No autorizado, usuario no encontrado con este token.' });
            }
            siguiente();
        } catch (error) {
            console.error('Error de token:', error.message);
            let mensajeError = 'No autorizado, token inválido o expirado.';
            if (error.name === 'JsonWebTokenError') mensajeError = 'Token inválido.';
            if (error.name === 'TokenExpiredError') mensajeError = 'Token expirado.';
            return respuesta.status(401).json({ exito: false, mensaje: mensajeError });
        }
    }
    if (!token) {
        return respuesta.status(401).json({ exito: false, mensaje: 'No autorizado, no se proporcionó token.' });
    }
};