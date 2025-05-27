const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EsquemaUsuario = new mongoose.Schema({
    nombreUsuario: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio.'],
        unique: true,
        trim: true
    },
    email: { // Mantenemos 'email' por consistencia con IDs HTML y estándar
        type: String,
        required: [true, 'El correo electrónico es obligatorio.'],
        unique: true,
        match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, ingrese un correo electrónico válido.'],
        trim: true,
        lowercase: true
    },
    clave: { // Contraseña
        type: String,
        required: [true, 'La contraseña es obligatoria.'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
        select: false 
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

EsquemaUsuario.pre('save', async function(siguiente) {
    if (!this.isModified('clave')) {
        return siguiente();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.clave = await bcrypt.hash(this.clave, salt);
        siguiente();
    } catch (error) {
        siguiente(error);
    }
});

EsquemaUsuario.methods.compararClave = async function(claveIngresada) {
    return await bcrypt.compare(claveIngresada, this.clave);
};

module.exports = mongoose.model('Usuario', EsquemaUsuario);