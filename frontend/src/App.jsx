import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:3000'

function App() {
  const [vista, setVista] = useState('catalogo')
  const [usuario, setUsuario] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const cerrarSesion = () => {
    setUsuario(null)
    setVista('catalogo')
    addToast('Sesion cerrada', 'success')
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => setVista('catalogo')}>
            <span className="logo-icon">🛒</span>
            <span>Feria Libre Digital</span>
          </div>
          <div className="nav-buttons">
            <button 
              className="btn-nav btn-catalogo"
              onClick={() => setVista('catalogo')}
            >
              📦 Catálogo
            </button>

            {usuario && usuario.rol === 'emprendedor' && (
              <button 
                className="btn-nav btn-catalogo"
                onClick={() => setVista('emprendedor')}
              >
                🏪 Mi Panel
              </button>
            )}

            {usuario ? (
              <button 
                className="btn-nav btn-login"
                onClick={cerrarSesion}
              >
                👋 {usuario.nombre} (Salir)
              </button>
            ) : (
              <button 
                className="btn-nav btn-login"
                onClick={() => setVista('login')}
              >
                🔑 Acceder
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {vista === 'catalogo' && <Catalogo addToast={addToast} />}
        {vista === 'login' && <Login setVista={setVista} setUsuario={setUsuario} addToast={addToast} />}
        {vista === 'emprendedor' && <PanelEmprendedor addToast={addToast} />}
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

function Catalogo({ addToast }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

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
      {productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No hay productos aún. ¡Sé el primero en agregar!</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Los emprendedores pueden agregar productos desde su panel.
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {productos.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-image">
                {p.imagen ? (
                  <img src={`${API}${p.imagen}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🛍️'
                )}
              </div>
              <div className="product-content">
                <h3 className="product-title">{p.nombre}</h3>
                <p className="product-description">{p.descripcion}</p>
                <div className="product-price">${p.precio.toLocaleString()}</div>
                <span className="product-category">{p.categoria}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Login({ setVista, setUsuario, addToast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [descripcionNegocio, setDescripcionNegocio] = useState('')
  const [categoriaNegocio, setCategoriaNegocio] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('login')

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

  const handleRegistro = async () => {
    if (!email || !password || !nombre || !nombreNegocio || !categoriaNegocio) {
      addToast('Por favor completa todos los campos obligatorios', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre, 
          email, 
          password, 
          rol: 'emprendedor',
          nombreNegocio,
          descripcionNegocio,
          categoriaNegocio
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        addToast('¡Registro exitoso! Ahora puedes iniciar sesión', 'success')
        setModo('login')
        setEmail('')
        setPassword('')
        setNombre('')
        setNombreNegocio('')
        setDescripcionNegocio('')
        setCategoriaNegocio('')
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
        <button 
          className={`tab-button ${modo === 'login' ? 'active' : ''}`}
          onClick={() => setModo('login')}
        >
          Iniciar Sesión
        </button>
        <button 
          className={`tab-button ${modo === 'registro' ? 'active' : ''}`}
          onClick={() => setModo('registro')}
        >
          Registrarse
        </button>
      </div>

      <div className="form-title">
        {modo === 'login' ? '🔐 Acceso Emprendedor' : '📝 Crear Cuenta'}
      </div>

      {modo === 'registro' && (
        <>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="👤 Tu nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              disabled={loading}
            />
          </div>
        </>
      )}

      <div className="form-group">
        <input
          type="email"
          className="form-input"
          placeholder="📧 Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          className="form-input"
          placeholder="🔒 Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && (modo === 'login' ? handleLogin() : handleRegistro())}
        />
      </div>

      {modo === 'registro' && (
        <>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="🏪 Nombre de tu negocio o puesto"
              value={nombreNegocio}
              onChange={e => setNombreNegocio(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="🏷️ Categoría (ropa, comida, artesanía, etc.)"
              value={categoriaNegocio}
              onChange={e => setCategoriaNegocio(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <textarea
              className="form-input"
              placeholder="📄 Cuenta brevemente de qué trata tu negocio"
              value={descripcionNegocio}
              onChange={e => setDescripcionNegocio(e.target.value)}
              rows="3"
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>
        </>
      )}

      <button 
        className="form-button"
        onClick={modo === 'login' ? handleLogin : handleRegistro}
        disabled={loading}
      >
        {loading ? (
          <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
        ) : (
          modo === 'login' ? '🚀 Iniciar Sesión' : '✨ Registrarse'
        )}
      </button>

      {modo === 'login' && (
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          ¿No tienes cuenta?{' '}
          <button 
            onClick={() => setModo('registro')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            Regístrate aquí
          </button>
        </p>
      )}
    </div>
  )
}

function PanelEmprendedor({ addToast }) {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('agregar')

  useEffect(() => {
    cargarProductos()
  }, [])

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
      if (imagen) {
        formData.append('imagen', imagen)
      }

      const res = await fetch(`${API}/api/productos`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok) {
        addToast('¡Producto agregado exitosamente!', 'success')
        setNombre('')
        setDescripcion('')
        setPrecio('')
        setCategoria('')
        setImagen(null)
        setPreview(null)
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
        const res = await fetch(`${API}/api/productos/${id}`, {
          method: 'DELETE'
        })
        
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

  return (
    <div>
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>
        👨‍💼 Panel del Emprendedor
      </h2>

      <div className="panel-tabs">
        <button 
          className={`tab-button ${tab === 'agregar' ? 'active' : ''}`}
          onClick={() => setTab('agregar')}
        >
          ➕ Agregar Producto
        </button>
        <button 
          className={`tab-button ${tab === 'misproductos' ? 'active' : ''}`}
          onClick={() => setTab('misproductos')}
        >
          📦 Mis Productos ({productos.length})
        </button>
      </div>

      {tab === 'agregar' && (
        <div className="form-container" style={{ maxWidth: '100%' }}>
          <div className="form-grid">
            <div className="form-group">
              <input
                className="form-input"
                placeholder="📝 Nombre del producto"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <input
                className="form-input"
                placeholder="💰 Precio"
                type="number"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <input
                className="form-input"
                placeholder="🏷️ Categoría (ropa, comida, artesanía)"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <textarea
                className="form-input"
                placeholder="📄 Descripción del producto"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows="3"
                disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                📷 Foto del producto
              </label>
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                disabled={loading}
              />
              {preview && (
                <img 
                  src={preview} 
                  alt="Vista previa" 
                  style={{ marginTop: '0.5rem', maxWidth: '150px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }} 
                />
              )}
            </div>
          </div>
          
          <button 
            className="form-button"
            onClick={agregarProducto}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              '✨ Agregar Producto'
            )}
          </button>
        </div>
      )}

      {tab === 'misproductos' && (
        <>
          {productos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No has agregado productos aún</p>
              <button 
                className="form-button" 
                onClick={() => setTab('agregar')}
                style={{ width: 'auto', marginTop: '1rem' }}
              >
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
                    ) : (
                      '🛍️'
                    )}
                  </div>
                  <div className="product-content">
                    <h3 className="product-title">{p.nombre}</h3>
                    <p className="product-description">{p.descripcion}</p>
                    <div className="product-price">${p.precio.toLocaleString()}</div>
                    <span className="product-category">{p.categoria}</span>
                    <button
                      onClick={() => eliminarProducto(p.id)}
                      style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App