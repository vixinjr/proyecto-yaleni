import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:3000'

function App() {
  const [vista, setVista] = useState('catalogo')
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  })
  const [toasts, setToasts] = useState([])
  const [letraGrande, setLetraGrande] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [vistaCarrito, setVistaCarrito] = useState(false)

  useEffect(() => {
    if (letraGrande) {
      document.body.classList.add('letra-grande')
    } else {
      document.body.classList.remove('letra-grande')
    }
  }, [letraGrande])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const handleSetUsuario = (user) => {
    setUsuario(user)
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user))
    } else {
      localStorage.removeItem('usuario')
    }
  }

  const cerrarSesion = () => {
    handleSetUsuario(null)
    setCarrito([])
    setVista('catalogo')
    addToast('Sesion cerrada', 'success')
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => { setVista('catalogo'); setVistaCarrito(false) }}>
            <span className="logo-icon">🛒</span>
            <span>Feria Libre Digital</span>
          </div>
          <div className="nav-buttons">
            <button className="btn-nav btn-catalogo" onClick={() => { setVista('catalogo'); setVistaCarrito(false) }}>
              📦 Catálogo
            </button>
            <button
              className={`btn-nav ${letraGrande ? 'btn-login' : 'btn-catalogo'}`}
              onClick={() => setLetraGrande(!letraGrande)}
            >
              {letraGrande ? '🔡 Normal' : '🔠 Letra Grande'}
            </button>
            {usuario && usuario.rol === 'vecino' && (
              <button className="btn-nav btn-catalogo" onClick={() => setVistaCarrito(true)}
                style={{ position: 'relative' }}>
                🛒 Carrito {carrito.length > 0 && (
                  <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%',
                    padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                    {carrito.length}
                  </span>
                )}
              </button>
            )}
            {usuario && usuario.rol === 'emprendedor' && (
              <button className="btn-nav btn-catalogo" onClick={() => { setVista('emprendedor'); setVistaCarrito(false) }}>
                🏪 Mi Panel
              </button>
            )}
            {usuario ? (
              <button className="btn-nav btn-login" onClick={cerrarSesion}>
                👋 {usuario.nombre} (Salir)
              </button>
            ) : (
              <button className="btn-nav btn-login" onClick={() => { setVista('login'); setVistaCarrito(false) }}>
                🔑 Acceder
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {vistaCarrito ? (
          <Carrito carrito={carrito} setCarrito={setCarrito} setVistaCarrito={setVistaCarrito} addToast={addToast} />
        ) : (
          <>
            {vista === 'catalogo' && <Catalogo addToast={addToast} usuario={usuario} carrito={carrito} setCarrito={setCarrito} setVistaCarrito={setVistaCarrito} />}
            {vista === 'login' && <Login setVista={setVista} setUsuario={handleSetUsuario} addToast={addToast} />}
            {vista === 'emprendedor' && <PanelEmprendedor addToast={addToast} usuario={usuario} setUsuario={handleSetUsuario} />}
          </>
        )}
      </main>

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Catalogo({ addToast, usuario, carrito, setCarrito, setVistaCarrito }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')

  useEffect(() => {
    fetch(`${API}/api/productos`)
      .then(r => r.json())
      .then(data => {
        setProductos(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error:', error)
        addToast('Error al cargar productos', 'error')
        setLoading(false)
      })
  }, [addToast])

  const categorias = ['todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))]

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro
    return coincideBusqueda && coincideCategoria
  })

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id)
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
    addToast(`¡${producto.nombre} agregado al carrito!`, 'success')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>Cargando productos...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>
        🌟 Catálogo de Productos
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="🔍 Buscar productos..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          className="form-input"
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'todas' ? '🏷️ Todas las categorías' : cat}
            </option>
          ))}
        </select>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>{productos.length === 0 ? 'No hay productos aún.' : 'No se encontraron productos con ese filtro.'}</p>
          {(busqueda || categoriaFiltro !== 'todas') && (
            <button className="form-button" onClick={() => { setBusqueda(''); setCategoriaFiltro('todas') }}
              style={{ width: 'auto', marginTop: '1rem' }}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {productosFiltrados.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-image">
                {p.imagen ? (
                  <img src={`${API}${p.imagen}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🛍️'}
              </div>
              <div className="product-content">
                <h3 className="product-title">{p.nombre}</h3>
                <p className="product-description">{p.descripcion}</p>
                <div className="product-price">${p.precio.toLocaleString()}</div>
                <span className="product-category">{p.categoria}</span>
                {usuario && usuario.rol === 'vecino' && (
                  <button onClick={() => agregarAlCarrito(p)}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.5rem',
                      background: 'var(--primary)', color: 'white', border: 'none',
                      borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: '600' }}>
                    🛒 Agregar al carrito
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Carrito({ carrito, setCarrito, setVistaCarrito, addToast }) {
  const [paso, setPaso] = useState('carrito')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [comprobante, setComprobante] = useState(null)

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nueva = item.cantidad + delta
        if (nueva <= 0) return null
        return { ...item, cantidad: nueva }
      }
      return item
    }).filter(Boolean))
  }

  const eliminarItem = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const confirmarPago = async () => {
   if (!nombre || !email || tarjeta.length < 16 || !vencimiento || cvv.length < 3) {
      addToast('Por favor completa todos los datos de pago', 'error')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    const numero = Math.random().toString(36).substring(2, 10).toUpperCase()
    setComprobante({
      numero,
      fecha: new Date().toLocaleString('es-CL'),
      productos: [...carrito],
      total,
      email
    })
    setCarrito([])
    setPaso('confirmado')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      {paso === 'carrito' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setVistaCarrito(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
              ←
            </button>
            <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>🛒 Mi Carrito</h2>
          </div>

          {carrito.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <button className="form-button" onClick={() => setVistaCarrito(false)}
                style={{ width: 'auto', marginTop: '1rem' }}>
                Ver catálogo
              </button>
            </div>
          ) : (
            <>
              {carrito.map(item => (
                <div key={item.id} style={{ background: 'white', borderRadius: 'var(--radius)',
                  padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem',
                  alignItems: 'center', boxShadow: 'var(--shadow)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius)',
                    background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden', flexShrink: 0 }}>
                    {item.imagen ? (
                      <img src={`${API}${item.imagen}`} alt={item.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🛍️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', margin: '0 0 4px' }}>{item.nombre}</p>
                    <p style={{ color: 'var(--primary)', fontWeight: '700', margin: 0 }}>
                      ${item.precio.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => cambiarCantidad(item.id, -1)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--gray-300)',
                        background: 'white', cursor: 'pointer', fontWeight: '700' }}>-</button>
                    <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--gray-300)',
                        background: 'white', cursor: 'pointer', fontWeight: '700' }}>+</button>
                  </div>
                  <p style={{ fontWeight: '700', color: 'var(--primary-dark)', minWidth: '80px', textAlign: 'right' }}>
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                  <button onClick={() => eliminarItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)',
                      cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                </div>
              ))}

              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem',
                boxShadow: 'var(--shadow)', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '600' }}>Total:</span>
                  <span style={{ fontWeight: '700', fontSize: '1.3rem', color: 'var(--primary)' }}>
                    ${total.toLocaleString()}
                  </span>
                </div>
                <button className="form-button" onClick={() => setPaso('pago')}>
                  💳 Proceder al pago
                </button>
              </div>
            </>
          )}
        </>
      )}

      {paso === 'pago' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setPaso('carrito')}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
              ←
            </button>
            <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>💳 Datos de pago</h2>
          </div>

          <div className="form-container" style={{ maxWidth: '100%' }}>
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)',
              padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>Total a pagar:</span>
              <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>
                ${total.toLocaleString()}
              </span>
            </div>

            <div className="form-group">
              <input className="form-input" placeholder="👤 Nombre en la tarjeta"
                value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="📧 Email para el comprobante" type="email"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="💳 Número de tarjeta (16 dígitos)"
                value={tarjeta} maxLength={16}
                onChange={e => setTarjeta(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <input className="form-input" placeholder="📅 MM/AA"
                  value={vencimiento} maxLength={5}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '')
                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
                    setVencimiento(v)
                  }} />
              </div>
              <div className="form-group">
                <input className="form-input" placeholder="🔒 CVV"
                  value={cvv} maxLength={3} type="password"
                  onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <button className="form-button" onClick={confirmarPago} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                  <span>Procesando pago...</span>
                </>
              ) : '✅ Confirmar pago'}
            </button>
          </div>
        </>
      )}

      {paso === 'confirmado' && comprobante && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>¡Pago exitoso!</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
            Tu comprobante fue enviado a {comprobante.email}
          </p>

          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            boxShadow: 'var(--shadow-lg)', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem',
              paddingBottom: '1rem', borderBottom: '1px solid var(--gray-300)' }}>
              <span style={{ fontWeight: '600' }}>N° de comprobante:</span>
              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>#{comprobante.numero}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600' }}>Fecha:</span>
              <span>{comprobante.fecha}</span>
            </div>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-300)' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Productos:</p>
              {comprobante.productos.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                  <span>{p.nombre} x{p.cantidad}</span>
                  <span>${(p.precio * p.cantidad).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total pagado:</span>
              <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>
                ${comprobante.total.toLocaleString()}
              </span>
            </div>
          </div>

          <button className="form-button" onClick={() => { setPaso('carrito'); setVistaCarrito(false) }}>
            🏪 Seguir comprando
          </button>
        </div>
      )}
    </div>
  )
}

function Login({ setVista, setUsuario, addToast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('login')

  const limpiarCampos = () => {
    setEmail(''); setPassword(''); setConfirmarPassword('')
    setNombre(''); setNombreNegocio('')
  }

  const handleLogin = async () => {
    if (!email || !password) {
      addToast('Por favor completa todos los campos', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        setUsuario(data.usuario)
        addToast(`¡Bienvenido ${data.usuario.nombre}!`, 'success')
        setVista(data.usuario.rol === 'emprendedor' ? 'emprendedor' : 'catalogo')
      } else {
        addToast(data.mensaje || 'Error al iniciar sesión', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistroVecino = async () => {
    if (!nombre || !email || !password || !confirmarPassword) {
      addToast('Por favor completa todos los campos', 'error')
      return
    }
    if (password !== confirmarPassword) {
      addToast('Las contraseñas no coinciden', 'error')
      return
    }
    if (password.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/registro/vecino`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      })
      const data = await res.json()
      if (res.ok) {
        addToast('¡Cuenta de vecino creada! Ahora puedes iniciar sesión', 'success')
        setModo('login')
        limpiarCampos()
      } else {
        addToast(data.mensaje || 'Error en el registro', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistroEmprendedor = async () => {
    if (!nombre || !email || !password || !confirmarPassword || !nombreNegocio) {
      addToast('Por favor completa todos los campos', 'error')
      return
    }
    if (password !== confirmarPassword) {
      addToast('Las contraseñas no coinciden', 'error')
      return
    }
    if (password.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/registro/emprendedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, nombreNegocio })
      })
      const data = await res.json()
      if (res.ok) {
        addToast('¡Cuenta de emprendedor creada! Ahora puedes iniciar sesión', 'success')
        setModo('login')
        limpiarCampos()
      } else {
        addToast(data.mensaje || 'Error en el registro', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="panel-tabs">
        <button className={`tab-button ${modo === 'login' ? 'active' : ''}`} onClick={() => { setModo('login'); limpiarCampos() }}>
          🔑 Iniciar Sesión
        </button>
        <button className={`tab-button ${modo === 'vecino' ? 'active' : ''}`} onClick={() => { setModo('vecino'); limpiarCampos() }}>
          🏘️ Soy Vecino
        </button>
        <button className={`tab-button ${modo === 'emprendedor' ? 'active' : ''}`} onClick={() => { setModo('emprendedor'); limpiarCampos() }}>
          🏪 Soy Emprendedor
        </button>
      </div>

      <div className="form-title">
        {modo === 'login' && '🔐 Iniciar Sesión'}
        {modo === 'vecino' && '🏘️ Crear cuenta de vecino'}
        {modo === 'emprendedor' && '🏪 Crear cuenta de emprendedor'}
      </div>

      {(modo === 'vecino' || modo === 'emprendedor') && (
        <div className="form-group">
          <input type="text" className="form-input" placeholder="👤 Tu nombre completo"
            value={nombre} onChange={e => setNombre(e.target.value)} disabled={loading} />
        </div>
      )}

      <div className="form-group">
        <input type="email" className="form-input" placeholder="📧 Correo electrónico"
          value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
      </div>

      <div className="form-group">
        <input type="password" className="form-input" placeholder="🔒 Contraseña"
          value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
          onKeyPress={e => e.key === 'Enter' && modo === 'login' && handleLogin()} />
      </div>

      {(modo === 'vecino' || modo === 'emprendedor') && (
        <div className="form-group">
          <input type="password" className="form-input" placeholder="🔒 Confirmar contraseña"
            value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} disabled={loading} />
        </div>
      )}

      {modo === 'emprendedor' && (
        <div className="form-group">
          <input type="text" className="form-input" placeholder="🏪 Nombre de tu negocio o puesto"
            value={nombreNegocio} onChange={e => setNombreNegocio(e.target.value)} disabled={loading} />
        </div>
      )}

      <button className="form-button"
        onClick={modo === 'login' ? handleLogin : modo === 'vecino' ? handleRegistroVecino : handleRegistroEmprendedor}
        disabled={loading}>
        {loading ? (
          <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
        ) : (
          modo === 'login' ? '🚀 Iniciar Sesión' :
          modo === 'vecino' ? '✨ Crear cuenta de vecino' :
          '✨ Crear cuenta de emprendedor'
        )}
      </button>
    </div>
  )
}

function PanelEmprendedor({ addToast, usuario, setUsuario }) {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('agregar')
  const [perfilNombre, setPerfilNombre] = useState(usuario?.nombre || '')
  const [perfilNombreNegocio, setPerfilNombreNegocio] = useState(usuario?.nombreNegocio || '')
  const [perfilDescripcion, setPerfilDescripcion] = useState(usuario?.descripcionNegocio || '')
  const [perfilCategoria, setPerfilCategoria] = useState(usuario?.categoriaNegocio || '')
  const [loadingPerfil, setLoadingPerfil] = useState(false)

  useEffect(() => { cargarProductos() }, [])

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API}/api/productos`)
      const data = await res.json()
      setProductos(data)
    } catch (error) {
      addToast('Error al cargar productos', 'error')
    }
  }

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const agregarProducto = async () => {
    if (!nombre || !descripcion || !precio || !categoria) {
      addToast('Por favor completa todos los campos', 'error')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('nombre', nombre)
      formData.append('descripcion', descripcion)
      formData.append('precio', precio)
      formData.append('categoria', categoria)
      if (imagen) formData.append('imagen', imagen)

      const res = await fetch(`${API}/api/productos`, { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        addToast('¡Producto agregado exitosamente!', 'success')
        setNombre(''); setDescripcion(''); setPrecio(''); setCategoria('')
        setImagen(null); setPreview(null)
        await cargarProductos()
        setTab('misproductos')
      } else {
        addToast(data.mensaje || 'Error al agregar producto', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const res = await fetch(`${API}/api/productos/${id}`, { method: 'DELETE' })
        if (res.ok) {
          addToast('Producto eliminado correctamente', 'success')
          await cargarProductos()
        } else {
          addToast('Error al eliminar producto', 'error')
        }
      } catch (error) {
        addToast('Error de conexión', 'error')
      }
    }
  }

  const actualizarPerfil = async () => {
    if (!perfilNombre || !perfilNombreNegocio) {
      addToast('Por favor completa los campos obligatorios', 'error')
      return
    }
    setLoadingPerfil(true)
    try {
      const res = await fetch(`${API}/api/auth/perfil/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: perfilNombre,
          nombreNegocio: perfilNombreNegocio,
          descripcionNegocio: perfilDescripcion,
          categoriaNegocio: perfilCategoria
        })
      })
      const data = await res.json()
      if (res.ok) {
        setUsuario(data.usuario)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        addToast('¡Perfil actualizado correctamente!', 'success')
      } else {
        addToast(data.mensaje || 'Error al actualizar perfil', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    } finally {
      setLoadingPerfil(false)
    }
  }

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('logo', file)
    try {
      const res = await fetch(`${API}/api/auth/perfil/${usuario.id}/logo`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setUsuario(data.usuario)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        addToast('¡Logo actualizado!', 'success')
      } else {
        addToast('Error al subir logo', 'error')
      }
    } catch (error) {
      addToast('Error de conexión', 'error')
    }
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>👨‍💼 Panel del Emprendedor</h2>

      <div className="panel-tabs">
        <button className={`tab-button ${tab === 'agregar' ? 'active' : ''}`} onClick={() => setTab('agregar')}>
          ➕ Agregar Producto
        </button>
        <button className={`tab-button ${tab === 'misproductos' ? 'active' : ''}`} onClick={() => setTab('misproductos')}>
          📦 Mis Productos ({productos.length})
        </button>
        <button className={`tab-button ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>
          ✏️ Mi Perfil
        </button>
      </div>

      {tab === 'agregar' && (
        <div className="form-container" style={{ maxWidth: '100%' }}>
          <div className="form-grid">
            <div className="form-group">
              <input className="form-input" placeholder="📝 Nombre del producto"
                value={nombre} onChange={e => setNombre(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="💰 Precio" type="number"
                value={precio} onChange={e => setPrecio(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="🏷️ Categoría (ropa, comida, artesanía)"
                value={categoria} onChange={e => setCategoria(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <textarea className="form-input" placeholder="📄 Descripción del producto"
                value={descripcion} onChange={e => setDescripcion(e.target.value)}
                rows="3" disabled={loading} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                📷 Foto del producto
              </label>
              <input className="form-input" type="file" accept="image/*"
                onChange={handleImagenChange} disabled={loading} />
              {preview && (
                <img src={preview} alt="Vista previa"
                  style={{ marginTop: '0.5rem', maxWidth: '150px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }} />
              )}
            </div>
          </div>
          <button className="form-button" onClick={agregarProducto} disabled={loading}>
            {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : '✨ Agregar Producto'}
          </button>
        </div>
      )}

      {tab === 'misproductos' && (
        <>
          {productos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No has agregado productos aún</p>
              <button className="form-button" onClick={() => setTab('agregar')} style={{ width: 'auto', marginTop: '1rem' }}>
                ➕ Agregar tu primer producto
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {productos.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-image">
                    {p.imagen ? (
                      <img src={`${API}${p.imagen}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '🛍️'}
                  </div>
                  <div className="product-content">
                    <h3 className="product-title">{p.nombre}</h3>
                    <p className="product-description">{p.descripcion}</p>
                    <div className="product-price">${p.precio.toLocaleString()}</div>
                    <span className="product-category">{p.categoria}</span>
                    <button onClick={() => eliminarProducto(p.id)}
                      style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: 'var(--danger)',
                        color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: '600' }}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'perfil' && (
        <div className="form-container" style={{ maxWidth: '100%' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>✏️ Editar mi perfil</h3>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {usuario?.logo ? (
              <img src={`${API}${usuario.logo}`} alt="Logo del negocio"
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto' }}>
                🏪
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--gray-600)' }}>
              📷 Logo del negocio
            </label>
            <input className="form-input" type="file" accept="image/*" onChange={subirLogo} disabled={loadingPerfil} />
          </div>

          <div className="form-group">
            <input className="form-input" placeholder="👤 Tu nombre completo"
              value={perfilNombre} onChange={e => setPerfilNombre(e.target.value)} disabled={loadingPerfil} />
          </div>
          <div className="form-group">
            <input className="form-input" placeholder="🏪 Nombre de tu negocio"
              value={perfilNombreNegocio} onChange={e => setPerfilNombreNegocio(e.target.value)} disabled={loadingPerfil} />
          </div>
          <div className="form-group">
            <input className="form-input" placeholder="🏷️ Categoría del negocio"
              value={perfilCategoria} onChange={e => setPerfilCategoria(e.target.value)} disabled={loadingPerfil} />
          </div>
          <div className="form-group">
            <textarea className="form-input" placeholder="📄 Descripción del negocio (opcional)"
              value={perfilDescripcion} onChange={e => setPerfilDescripcion(e.target.value)}
              rows="3" disabled={loadingPerfil} style={{ resize: 'vertical' }} />
          </div>
          <button className="form-button" onClick={actualizarPerfil} disabled={loadingPerfil}>
            {loadingPerfil ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : '💾 Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App