const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlace');


exports.subirArchivo = async(req, res, next) => {

    const configuracionMulter = {
        limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            },
            fileFilter: (req, file, cb) => {
                if(file.mimetype === "application/pdf"){
                    return cb(null, true);
                }
            }
        })
    }

    const upload = multer(configuracionMulter).single('archivo');

    upload(req, res, async (error) => {
        console.log(req.file);

        if(!error){
            res.json({archivo: req.file.filename})
        }else{
            console.log(error);
            return next();
        }
    });
}


exports.eliminarArchivo = async(req, res) => {
        console.log(req.archivo);
        console.log(__dirname);
        
        try {
            fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
            console.log('Archivo eliminado');
        } catch (error) {
            console.error(error);
        }
}

// Descarga una archivo
exports.descargar = async(req, res, next) => {

    // Obtiene el enlace
    const { archivo } = req.params;
    const enlace = await Enlaces.findOne({ nombre: archivo });

    console.log(enlace);

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);

    // Eliminar archivo y la entrada de la bd
    // Si las descargas son igual a 1 , borrar laentrada y borrar el archivo
    const { descargas, nombre } = enlace;
    if(descargas === 1){

        //eliminar el enlace
        req.archivo = nombre;

        //eliminar la entrada de la bd
        await Enlaces.findOneAndRemove(enlace.id);

         //eliminar el archivo, se va al controller de archivo
        next();
    } else {
        // Si las descragas son mayor a 1, restar 1 descarga
        enlace.descargas--;
        await enlace.save();
    }
}