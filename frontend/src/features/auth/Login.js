"use client"

import { useState, useEffect } from "react"
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Home,
} from "@material-ui/icons"
import authService from "./auth.service"
import { useHistory, useLocation } from "react-router-dom"
import "./style.css"

// Eliminar la importación directa
// import piscinaImage from "/piscina.png"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const history = useHistory()
  const location = useLocation()

  // Extraer parámetros de la URL si existen
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const emailParam = params.get("email")
    const messageParam = params.get("message")

    if (emailParam) {
      setEmail(emailParam)
    }

    if (messageParam) {
      setSuccessMessage(decodeURIComponent(messageParam))
    }
  }, [location])

  const handleLogin = async (e) => {
    e.preventDefault()

    // Validar campos antes de enviar
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico")
      return
    }

    if (!password) {
      setError("Por favor, ingresa tu contraseña")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Intentando login con:", email, "y contraseña proporcionada")

      // Llamada al servicio de autenticación
      const response = await authService.login(email, password)

      console.log("Respuesta de login:", response)

      // Si hay un token en la respuesta, guardarlo y redirigir
      if (response.token) {
        // Guardar el token en localStorage
        localStorage.setItem("token", response.token)

        // Verificar si es un cliente
        const isCliente =
          response.usuario &&
          (response.usuario.isCliente === true ||
            response.usuario.rol === "cliente" ||
            (typeof response.usuario.rol === "string" && response.usuario.rol.toLowerCase() === "cliente"))

        console.log("¿Es cliente?", isCliente, "Datos:", response.usuario)

        // Guardar información del usuario con la bandera isCliente actualizada
        if (response.usuario) {
          const userInfo = {
            id: response.usuario.id,
            nombre: response.usuario.nombre,
            email: response.usuario.email,
            rol: response.usuario.rol,
            // Asegurarse de que isCliente sea correcto basado en nuestra verificación
            isCliente: isCliente,
          }

          localStorage.setItem("usuario", JSON.stringify(userInfo))
          console.log("Información de usuario guardada:", userInfo)

          // También guardar una bandera específica para el tipo de usuario
          // Esto nos ayudará a detectar el tipo de usuario en otras partes de la app
          localStorage.setItem("userType", isCliente ? "cliente" : "admin")
        }

        // Establecer la bandera de navegación directa para que ProtectedRoute permita el acceso
        sessionStorage.setItem("navegacionDirecta", "true")

        // Determinar la ruta de redirección
        // CAMBIO: Ahora todos los usuarios van al dashboard, independientemente de su rol
        let redirectPath

        // Para cualquier usuario, usar returnUrl o dashboard
        const returnUrl = new URLSearchParams(location.search).get("returnUrl")
        redirectPath = returnUrl || "/dashboard"

        // Guardar una bandera para indicar que es un cliente que acaba de iniciar sesión
        // Esto puede ser útil si el dashboard necesita mostrar contenido específico para clientes
        if (isCliente) {
          localStorage.setItem("clienteLogin", "true")
          console.log("Usuario identificado como cliente, redirigiendo al dashboard común:", redirectPath)
        } else {
          console.log("Usuario no cliente, redirigiendo a:", redirectPath)
        }

        // Pequeño retraso para asegurar que localStorage se actualice antes de la redirección
        setTimeout(() => {
          console.log("Ejecutando redirección a:", redirectPath)
          history.replace(redirectPath)
        }, 100)
      } else {
        throw new Error("No se recibió un token válido")
      }
    } catch (error) {
      // Mejorar el manejo de errores para mostrar mensajes más descriptivos
      let errorMsg = "Error en el login"

      if (error.response && error.response.data && error.response.data.msg) {
        errorMsg = error.response.data.msg
      } else if (error.message) {
        errorMsg = error.message
      }

      setError(errorMsg)
      console.error("Error en el login:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const goToLandingPage = () => {
    history.push("/")
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image-column">
          <img
            src={process.env.PUBLIC_URL + "/piscina.png" || "/placeholder.svg"}
            alt="Piscina Hotel Nido Sky"
            className="auth-image"
          />
        </div>

        <div className="auth-form-column">
          <div className="auth-logo-container">
            <LockOutlined className="auth-logo-icon" />
          </div>

          <div className="auth-header">
            <h2>Iniciar sesión</h2>
          </div>

          {successMessage && (
            <div className="auth-success">
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="auth-input-container">
                <EmailOutlined className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            <div className="auth-forgot-password">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  history.push("/recuperar-password")
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            <button type="button" className="auth-button auth-button-secondary" onClick={goToLandingPage}>
              <Home className="auth-button-icon" />
              Ir a Página Principal
            </button>

            <div className="auth-links">
              <p>
                ¿No tienes una cuenta?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    history.push("/register")
                  }}
                >
                  Regístrate
                </a>
              </p>
            </div>

            <div className="auth-social-icons">
              <a href="#" className="auth-social-icon">
                <Facebook />
              </a>
              <a href="#" className="auth-social-icon">
                <Twitter />
              </a>
              <a href="#" className="auth-social-icon">
                <Instagram />
              </a>
              <a href="#" className="auth-social-icon">
                <LinkedIn />
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
