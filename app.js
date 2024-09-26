const express = require('express');
const translate = require('node-google-translate-skidz');
const path = require('path');
const { title } = require('process');
const app = express();
const PORT = 3000;

// Configurar el middleware JSON
app.use(express.json());

app.post('/translate', (req, res) => {
    const { text, targetLang } = req.body;

    translate({
        text: text,
        source: 'en', 
        target: targetLang, 
    }, (result) => {
        if (result && result.translation) {
            res.json({ translatedText: result.translation });
        } else {
            res.status(500).json({ error: 'Error al traducir el texto' });
        }
    });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));



// Enviar el archivo HTML al acceder a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

