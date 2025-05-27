# CapyCash - Aplicación de Presupuesto Personal

CapyCash es una aplicación web diseñada para ayudarte a gestionar tus finanzas personales. Permite registrar ingresos y gastos, categorizarlos, y visualizar resúmenes y reportes para un mejor control de tu presupuesto.

## ✨ Características Principales

* **Registro e Inicio de Sesión de Usuarios:** Sistema de autenticación seguro para proteger tus datos.
* **Gestión de Transacciones:** Añade, edita y elimina ingresos y gastos fácilmente.
* **Categorización:** Organiza tus transacciones por categorías personalizadas.
* **Panel Principal (Dashboard):** Visualiza un resumen de tus ingresos, gastos y balance actual, junto con las transacciones más recientes.
* **Listado Completo de Registros:** Accede a un historial completo de todas tus transacciones.
* **Reportes:** Genera reportes de gastos e ingresos agrupados por categoría.
* **Gestión de Perfil:** Actualiza tu nombre de usuario y correo electrónico.
* **Interfaz Intuitiva:** Diseño amigable y fácil de usar.
* **Lógica en Español:** Todo el código fuente del backend y la interfaz de usuario están orientados al idioma español.

## 🛠️ Tecnologías Utilizadas

* **Frontend (Cliente):**
    * HTML5
    * CSS3
    * JavaScript (Vanilla JS)
* **Backend (Servidor):**
    * Node.js
    * Express.js
    * MongoDB (con Mongoose como ODM)
    * JSON Web Tokens (JWT) para autenticación
* **Base de Datos:**
    * MongoDB

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

* [Node.js](https://nodejs.org/) (incluye npm). Se recomienda la versión LTS.
* [MongoDB Community Server](https://www.mongodb.com/try/download/community).

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1.  **Clona o Descarga el Proyecto:**
    Si tienes git:
    ```bash
    git clone https://URL_DE_TU_REPOSITORIO.git NombreDeTuCarpeta
    cd NombreDeTuCarpeta
    ```
    Si no, simplemente descarga y descomprime los archivos en una carpeta (ej. `CAPYCASH_PROYECTO`).

2.  **Configura las Variables de Entorno:**
    * En la raíz del proyecto (`CAPYCASH_PROYECTO/`), crea un archivo llamado `.env`.
    * Copia el siguiente contenido en el archivo `.env` y personalízalo:
        ```dotenv
        # Configuracion del servidor
        PUERTO=5000
        ENTORNO_DESARROLLO=development

        # Configuracion de MongoDB
        URL_MONGO=mongodb://localhost:27017/capycash_bd

        # Secreto para JSON Web Token (JWT) - ¡CAMBIA ESTO POR ALGO ÚNICO Y SEGURO!
        SECRETO_JWT=TU_PROPIO_SECRETO_JWT_SUPER_SEGURO_AQUI_12345!@#$
        ```
    * **Importante:** Reemplaza `TU_PROPIO_SECRETO_JWT_SUPER_SEGURO_AQUI_12345!@#$` con una cadena de texto larga, aleatoria y secreta.

3.  **Instala las Dependencias del Servidor:**
    * Abre una terminal o línea de comandos.
    * Navega a la carpeta del servidor: `cd CAPYCASH_PROYECTO/servidor`
    * Ejecuta el comando:
        ```bash
        npm install
        ```

## 🏃 Ejecución de la Aplicación

1.  **Inicia MongoDB:**
    * Si instalaste MongoDB como un servicio, debería iniciarse automáticamente con tu sistema operativo.
    * Si no, deberás iniciarlo manualmente. Consulta la documentación de MongoDB para tu sistema operativo.

2.  **Inicia el Servidor Backend (Node.js):**
    * En la terminal, asegúrate de estar en la carpeta `CAPYCASH_PROYECTO/servidor/`.
    * Ejecuta uno de los siguientes comandos:
        * Para desarrollo (con reinicio automático ante cambios, usando `nodemon`):
            ```bash
            npm run desarrollo
            ```
        * Para producción o inicio normal:
            ```bash
            npm start
            ```
    * Verás un mensaje en la consola indicando que el servidor está corriendo en el puerto especificado (ej. `Servidor CapyCash corriendo en modo development en el puerto 5000`). **Mantén esta terminal abierta.**

3.  **Abre la Aplicación Cliente:**
    * Navega en tu explorador de archivos a la carpeta `CAPYCASH_PROYECTO/cliente/`.
    * Abre el archivo `index.html` con tu navegador web preferido (Chrome, Firefox, Edge, etc.).
    * ¡Listo! La aplicación CapyCash debería cargarse y estar lista para usarse.

## 📁 Estructura del Proyecto (Resumen)

* `.env`: Archivo de configuración de variables de entorno.
* `cliente/`: Contiene todos los archivos del frontend (HTML, CSS, JavaScript del lado del cliente, imágenes).
    * `cliente/index.html`: Punto de entrada principal de la aplicación cliente.
    * `cliente/js/aplicacion.js`: Lógica principal y de inicialización del cliente.
* `servidor/`: Contiene todos los archivos del backend (Node.js/Express).
    * `servidor/servidor.js`: Archivo principal que inicia el servidor Express.
    * `servidor/configuracion/bd.js`: Lógica de conexión a MongoDB.
    * `servidor/controladores/`: Lógica de manejo de peticiones para cada ruta.
    * `servidor/middleware/`: Middlewares, como el de autenticación.
    * `servidor/modelos/`: Esquemas y modelos de Mongoose para la base de datos.
    * `servidor/rutas/`: Definición de las rutas de la API.
    * `servidor/package.json`: Dependencias y scripts del servidor.

## 📄 Licencia

Este proyecto es para fines de cumplir con un trabajo de la materia Metodología de Sistemas I, de la Tecnicatura Universitaria en Programación, de la Universidad Tecnológica Nacional, Facultad Regional Resistencia, Extensión Áulica Formosa; con fines demostrativos y de aprendizaje. Te damos permiso de mejorarlo, pero danos el crédito eh!

---
Hecha con ❤️ por Duarte Fabricio, Arias Fabio, Amarilla Sebastián, Azcona Enzo, Coronel Marcelo, Coronel Nahuel y Alvarez Mikaela.