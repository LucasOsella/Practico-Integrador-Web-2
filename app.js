const express = require('express');
const translate = require('node-google-translate-skidz');
const path = require('path');
const { title } = require('process');
const app = express();
const PORT = 3000;

console.log("hola a desde apps")
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
//hola
// Enviar el archivo HTML al acceder a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});