const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

//crear el servidor
const app = express();

//Conectar a la bd
conectarDB();

//puerto de la app
const port = process.env.PORT || 4000;

//habilitar leer los valores de un body
app.use(express.json());

// habilitar carpeta publica
app.use( express.static('uploads')) ;

//habilitar cors
console.log(process.env.FRONTEND_URL);
const opcionesCors = {
    origin: process.env.FRONTEND_URL
}
app.use( cors(opcionesCors) );

//Rutas de la app
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

//arrancar la app
app.listen(port, '0.0.0.0', () =>{
    console.log(`El servidor esta funcionado en el puerto ${port}`);
});