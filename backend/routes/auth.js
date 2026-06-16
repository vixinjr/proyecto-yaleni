const express = require('express')
const router = express.Router()

let usuarios = []

// Registro de emprendedor
router.post('/registro/emprendedor', (req, res) => {
  const { nombre, email, password, nombreNegocio } = req.body

  if (!nombre || !email || !password || !nombreNegocio) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' })
  }

  const existe = usuarios.find(u => u.email === email)
  if (existe) return res.status(400).json({ mensaje: 'El email ya esta registrado' })

  const nuevo = {
    id: usuarios.length + 1,
    nombre,
    email,
    password,
    rol: 'emprendedor',
    nombreNegocio,
    descripcionNegocio: '',
    categoriaNegocio: '',
    logo: null
  }
  usuarios.push(nuevo)
  res.status(201).json({ 
    mensaje: 'Cuenta de emprendedor creada exitosamente', 
    usuario: { 
      id: nuevo.id, 
      nombre: nuevo.nombre, 
      email: nuevo.email, 
      rol: nuevo.rol,
      nombreNegocio: nuevo.nombreNegocio,
      descripcionNegocio: nuevo.descripcionNegocio,
      categoriaNegocio: nuevo.categoriaNegocio,
      logo: nuevo.logo
    } 
  })
})

// Registro de vecino
router.post('/registro/vecino', (req, res) => {
  const { nombre, email, password } = req.body

  if (!nombre || !email || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' })
  }

  const existe = usuarios.find(u => u.email === email)
  if (existe) return res.status(400).json({ mensaje: 'El email ya esta registrado' })

  const nuevo = {
    id: usuarios.length + 1,
    nombre,
    email,
    password,
    rol: 'vecino'
  }
  usuarios.push(nuevo)
  res.status(201).json({ 
    mensaje: 'Cuenta de vecino creada exitosamente', 
    usuario: { 
      id: nuevo.id, 
      nombre: nuevo.nombre, 
      email: nuevo.email, 
      rol: nuevo.rol
    } 
  })
})

// Login (mismo para ambos)
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' })
  }

  const usuario = usuarios.find(u => u.email === email && u.password === password)
  if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' })
  
  res.json({ 
    mensaje: 'Login exitoso', 
    usuario: { 
      id: usuario.id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol,
      nombreNegocio: usuario.nombreNegocio || null,
      descripcionNegocio: usuario.descripcionNegocio || null,
      categoriaNegocio: usuario.categoriaNegocio || null,
      logo: usuario.logo || null
    } 
  })
})
// Editar perfil del emprendedor
router.put('/perfil/:id', (req, res) => {
  const { nombreNegocio, descripcionNegocio, categoriaNegocio, nombre } = req.body
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id))
  
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

  if (nombre) usuario.nombre = nombre
  if (nombreNegocio) usuario.nombreNegocio = nombreNegocio
  if (descripcionNegocio !== undefined) usuario.descripcionNegocio = descripcionNegocio
  if (categoriaNegocio) usuario.categoriaNegocio = categoriaNegocio

  res.json({ 
    mensaje: 'Perfil actualizado', 
    usuario: { 
      id: usuario.id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol,
      nombreNegocio: usuario.nombreNegocio,
      descripcionNegocio: usuario.descripcionNegocio,
      categoriaNegocio: usuario.categoriaNegocio,
      logo: usuario.logo || null
    } 
  })
})

const multer = require('multer')
const path = require('path')

const storagelogo = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname))
  }
})
const uploadLogo = multer({ storage: storagelogo })

router.post('/perfil/:id/logo', uploadLogo.single('logo'), (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id))
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
  
  usuario.logo = `/uploads/${req.file.filename}`
  
  res.json({ 
    mensaje: 'Logo actualizado', 
    usuario: { 
      id: usuario.id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol,
      nombreNegocio: usuario.nombreNegocio,
      descripcionNegocio: usuario.descripcionNegocio,
      categoriaNegocio: usuario.categoriaNegocio,
      logo: usuario.logo
    } 
  })
})

module.exports = router
