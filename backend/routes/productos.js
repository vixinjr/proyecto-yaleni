const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

// Configuracion de multer para guardar imagenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, nombreUnico)
  }
})

const upload = multer({ storage })

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

// Agregar un producto (con imagen opcional)
router.post('/', upload.single('imagen'), (req, res) => {
  const { nombre, descripcion, precio, categoria } = req.body
  const nuevo = {
    id: productos.length + 1,
    nombre,
    descripcion,
    precio: parseInt(precio),
    categoria,
    imagen: req.file ? `/uploads/${req.file.filename}` : null
  }
  productos.push(nuevo)
  res.status(201).json({ mensaje: 'Producto agregado', producto: nuevo })
})

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const index = productos.findIndex(p => p.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' })
  productos.splice(index, 1)
  res.json({ mensaje: 'Producto eliminado' })
})

module.exports = router