const Usuario = require('../modelos/Usuario');
const jwt = require('jsonwebtoken');

const generarTokenJWT = (idUsuario) => {
    if (!process.env.SECRETO_JWT) {
        console.error("Error Crítico: SECRETO_JWT no configurado en .env");
        throw new Error("Error de configuración del servidor.");
    }
    return jwt.sign({ id: idUsuario }, process.env.SECRETO_JWT, { expiresIn: '30d' });
};

exports.registrarNuevoUsuario = async (peticion, respuesta, siguiente) => {
    const { nombreUsuario, email, clave } = peticion.body;

    if (!nombreUsuario || !email || !clave) {
        return respuesta.status(400).json({ exito: false, mensaje: 'Nombre de usuario, email y clave son obligatorios.' });
    }
    if (clave.length < 6) {
        return respuesta.status(400).json({ exito: false, mensaje: 'La clave debe tener al menos 6 caracteres.' });
    }

    try {
        const existeUsuario = await Usuario.findOne({ $or: [{ email: email.toLowerCase() }, { nombreUsuario }] });
        if (existeUsuario) {
            const campo = existeUsuario.email === email.toLowerCase() ? 'email' : 'nombre de usuario';
            return respuesta.status(400).json({ exito: false, mensaje: `El ${campo} ya está en uso.` });
        }

        const usuarioCreado = await Usuario.create({ nombreUsuario, email, clave });
        const token = generarTokenJWT(usuarioCreado._id);

        respuesta.status(201).json({
            exito: true,
            token,
            datos: { _id: usuarioCreado._id, nombreUsuario: usuarioCreado.nombreUsuario, email: usuarioCreado.email }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        if (error.name === 'ValidationError') {
            return respuesta.status(400).json({ exito: false, mensaje: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor al registrar.' });
    }
};

exports.iniciarSesionDeUsuario = async (peticion, respuesta, siguiente) => {
    const { email, clave } = peticion.body;
    if (!email || !clave) {
        return respuesta.status(400).json({ exito: false, mensaje: 'Email y clave son obligatorios.' });
    }
    try {
        const usuarioEncontrado = await Usuario.findOne({ email: email.toLowerCase() }).select('+clave');
        if (!usuarioEncontrado || !(await usuarioEncontrado.compararClave(clave))) {
            return respuesta.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas.' });
        }
        const token = generarTokenJWT(usuarioEncontrado._id);
        respuesta.status(200).json({
            exito: true,
            token,
            datos: { _id: usuarioEncontrado._id, nombreUsuario: usuarioEncontrado.nombreUsuario, email: usuarioEncontrado.email }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor al iniciar sesión.' });
    }
};

exports.obtenerDatosUsuarioActual = async (peticion, respuesta, siguiente) => {
    // peticion.usuarioLogueado es establecido por el middleware protegerRuta
    respuesta.status(200).json({ exito: true, datos: peticion.usuarioLogueado });
};

exports.actualizarDatosPerfilUsuario = async (peticion, respuesta, siguiente) => {
    const { nombreUsuario, email } = peticion.body;
    const camposParaActualizar = {};

    if (nombreUsuario) camposParaActualizar.nombreUsuario = nombreUsuario;
    if (email) camposParaActualizar.email = email.toLowerCase();

    if (Object.keys(camposParaActualizar).length === 0) {
        return respuesta.status(400).json({ exito: false, mensaje: 'No hay datos para actualizar.' });
    }
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(peticion.usuarioLogueado._id, camposParaActualizar, {
            new: true, runValidators: true
        }).select('-clave');

        if (!usuarioActualizado) {
            return respuesta.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
        }
        respuesta.status(200).json({ exito: true, datos: usuarioActualizado });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        if (error.code === 11000) { // Error de duplicado Mongoose
             return respuesta.status(400).json({ exito: false, mensaje: `El ${Object.keys(error.keyValue)[0]} ya está en uso.` });
        }
        if (error.name === 'ValidationError') {
            return respuesta.status(400).json({ exito: false, mensaje: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        respuesta.status(500).json({ exito: false, mensaje: 'Error interno del servidor al actualizar perfil.' });
    }
};