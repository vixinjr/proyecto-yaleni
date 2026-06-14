const express = require('express')
const router = express.Router()

let usuarios = []

// Registro de emprendedor
router.post('/registro', (req, res) => {
  const { nombre, email, password, rol, nombreNegocio, descripcionNegocio, categoriaNegocio } = req.body
  const existe = usuarios.find(u => u.email === email)
  if (existe) return res.status(400).json({ mensaje: 'El email ya esta registrado' })
  
  const nuevo = {
    id: usuarios.length + 1,
    nombre,
    email,
    password,
    rol: rol || 'vecino',
    nombreNegocio: nombreNegocio || '',
    descripcionNegocio: descripcionNegocio || '',
    categoriaNegocio: categoriaNegocio || ''
  }
  usuarios.push(nuevo)
  res.status(201).json({ 
    mensaje: 'Usuario registrado', 
    usuario: { 
      id: nuevo.id, 
      nombre: nuevo.nombre, 
      email: nuevo.email, 
      rol: nuevo.rol,
      nombreNegocio: nuevo.nombreNegocio,
      descripcionNegocio: nuevo.descripcionNegocio,
      categoriaNegocio: nuevo.categoriaNegocio
    } 
  })
})

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  const usuario = usuarios.find(u => u.email === email && u.password === password)
  if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' })
  
  res.json({ 
    mensaje: 'Login exitoso', 
    usuario: { 
      id: usuario.id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol,
      nombreNegocio: usuario.nombreNegocio,
      descripcionNegocio: usuario.descripcionNegocio,
      categoriaNegocio: usuario.categoriaNegocio
    } 
  })
})

module.exports = router