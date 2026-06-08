const express = require('express')
const router = express.Router()

let productos = []

// Obtener todos los productos
router.get('/', (req, res) => {
  res.json(productos)
})

// Obtener un producto por id
router.get('/:id', (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id))
  if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' })
  res.json(producto)
})

// Agregar un producto (solo emprendedor)
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, categoria } = req.body
  const nuevo = {
    id: productos.length + 1,
    nombre,
    descripcion,
    precio,
    categoria
  }
  productos.push(nuevo)
  res.status(201).json({ mensaje: 'Producto agregado', producto: nuevo })
})

module.exports = router
