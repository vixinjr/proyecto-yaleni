const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Marketplace Puente Alto API funcionando!'
    });
});

app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.listen(PORT, '0.0.0.0', () => {
    console.log("Servidor corriendo en http://localhost:" + PORT);
});