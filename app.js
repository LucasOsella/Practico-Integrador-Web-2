const express = require('express');
const translate = require('node-google-translate-skidz');
const path = require('path');
const { title } = require('process');
const app = express();
const PORT = 3000;

app.use(express.json());


// app.post('/', async (req,res)=> {
//     try{
//         const {text, targetLang} = req.body
//         const translation = await traducir(text, targetLang)
//         res.json({ translation })
//     }catch(error){
//         console.log (error)
//     }

// })

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
 

function traducir(texto, targetLang) {
    return new Promise((resolve, reject) => {
        translate({
            texto: texto,
            sourceLang: 'en',
            targetLang: targetLang
        }, function (result) {
            if (result & result.translation) {
                resolve(result.translation)
            } else {
                reject('Error al traducir')
            }
        }
        );
    });
}



// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Enviar el archivo HTML al acceder a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});