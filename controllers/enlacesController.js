
const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


exports.nuevoEnlace = async (req, res, next) => {
    
    //Mostrar mensajes de error de express validator
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()})
    }

    console.log(req.body);

    //crear un objeto de enlace
    const { nombre_original, nombre } = req.body;
    
    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;

    //si el usuario esta autenticado
    if(req.usuario){
        const { password, descargas } = req.body;

        //Asignar a enlace el número de descargas
        if(descargas){
            enlace.descargas = descargas;
        }

        //asignar un password
        if(password){
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        //Asignar el autor
        enlace.autor = req.usuario.id;
    }
    
    //almacenar en la BD
    try {
        await enlace.save();
        res.json({msg: `${enlace.url}`});
        next();
    } catch (error) {
        console.error(error);
    }
}

//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {

    const url = req.params.url;

    //Verificar si existe el enlace
    const enlace = await Enlaces.findOne({ url });

    if(!enlace){
        res.status(404).json({msg: 'Ese enlace no existe'});
        return next();
    }

    res.json({ archivo: enlace.nombre });

    // Si las descargas son igual a 1 , borrar laentrada y borrar el archivo
    const { descargas, nombre } = enlace;
    if(descargas === 1){

        //eliminar el enlace
        req.archivo = nombre;

        //eliminar la entrada de la bd
        await Enlaces.findOneAndRemove(req.params.url);

         //eliminar el archivo, se va al controller de archivo
        next();
    } else {
        // Si las descragas son mayor a 1, restar 1 descarga
        enlace.descargas--;
        await enlace.save();
    }

    
}