"use client"

import { useState, useEffect, useRef } from "react"
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

// Expresiones regulares para validaciones
const REGEX = {
  SOLO_NUMEROS: /^\d+$/,
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
}

// Validación exhaustiva de email
const validarEmail = (em) => {
  // Validaciones básicas
  if (!em) return "El correo electrónico es obligatorio"
  if (em.trim() === "") return "El correo electrónico no puede estar vacío"

  // Validación de formato básico
  if (!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"

  // Validación de patrones inválidos específicos
  if (REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos (como @.com, @., etc.)"

  // Validación de longitud
  if (em.length < 6) return "El correo debe tener al menos 6 caracteres"
  if (em.length > 50) return "El correo no puede tener más de 50 caracteres"

  // Validación de partes del email
  const [localPart, domainPart] = em.split("@")

  // Validación de la parte local
  if (!localPart || localPart.length < 1) return "La parte local del correo no puede estar vacía"
  if (localPart.length > 64) return "La parte local del correo es demasiado larga"
  if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"

  // Validación del dominio
  if (!domainPart || !domainPart.includes("."))
    return "El dominio del correo debe incluir una extensión (ej: .com, .net)"

  // Verificar que el dominio tenga un formato válido y que no haya caracteres después del TLD
  // Dividir el dominio en partes separadas por puntos
  const domainParts = domainPart.split(".")

  // Verificar que todas las partes del dominio sean válidas
  for (let i = 0; i < domainParts.length; i++) {
    const part = domainParts[i]
    // Cada parte debe contener al menos un carácter y solo caracteres alfanuméricos o guiones
    if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
      return "El dominio del correo contiene partes inválidas"
    }
  }

  // Verificar que el TLD sea válido (2-6 caracteres, solo letras)
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) {
    return "La extensión del dominio no es válida o contiene caracteres no permitidos"
  }

  // Validación de dominios temporales o no recomendados
  const dominiosNoRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
  for (const dominio of dominiosNoRecomendados) {
    if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
  }

  return ""
}

// Validación exhaustiva de contraseña
const validarPassword = (pass) => {
  // Validaciones básicas
  if (!pass) return "La contraseña es obligatoria"
  if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (pass.length > 15) return "La contraseña no puede tener más de 15 caracteres"

  // Validación de complejidad
  if (!/[a-z]/.test(pass)) return "La contraseña debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(pass)) return "La contraseña debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass))
    return "La contraseña debe contener al menos un carácter especial"

  // Validación de secuencias comunes
  if (REGEX.SECUENCIAS_COMUNES.test(pass))
    return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"

  // Validación de caracteres repetidos
  if (REGEX.CARACTERES_REPETIDOS.test(pass))
    return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"

  // Validación de secuencias de teclado
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase()))
    return "La contraseña no puede contener secuencias de teclado"

  return ""
}

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errores, setErrores] = useState({
    email: "",
    password: "",
  })
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const emailParam = params.get("email")
    const messageParam = params.get("message")

    if (emailParam) {
      // Limitar el email a 50 caracteres máximo
      setEmail(emailParam.slice(0, 50))
      // Validar el email recibido por parámetro
      setErrores({ ...errores, email: validarEmail(emailParam.slice(0, 50)) })
    }

    if (messageParam) {
      setSuccessMessage(decodeURIComponent(messageParam))
    }
  }, [location])

  // Manejadores de cambio con validación en tiempo real
  const handleEmailChange = (e) => {
    const valor = e.target.value

    // Limitar a 50 caracteres máximo
    if (valor.length > 50) {
      return
    }

    // Validación básica para caracteres permitidos en un email
    const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
    if (!emailRegex.test(valor)) {
      // No actualizar si hay caracteres inválidos
      return
    }

    // No permitir múltiples @ o puntos consecutivos
    if (valor.includes("@@") || valor.includes("..") || valor.includes(".@") || valor.includes("@.")) {
      return
    }

    // No permitir más de un @
    const atCount = (valor.match(/@/g) || []).length
    if (atCount > 1) {
      return
    }

    // Verificar si ya tiene un TLD válido completo (.com, .net, etc.)
    if (email.includes("@") && email.includes(".")) {
      const currentParts = email.split("@")
      const newParts = valor.split("@")

      if (currentParts.length > 1 && newParts.length > 1) {
        const currentDomain = currentParts[1]
        const newDomain = newParts[1]

        // Verificar si el dominio actual termina con un TLD completo
        // Lista de TLDs completos comunes que no deben permitir más caracteres
        const completeTLDs = [".com", ".net", ".org", ".edu", ".gov", ".mil", ".int"]

        // Verificar si el dominio actual termina con alguno de los TLDs completos
        const hasTLDComplete = completeTLDs.some((tld) => currentDomain.endsWith(tld))

        // Si tiene un TLD completo y el nuevo dominio es más largo, no permitir más caracteres
        if (hasTLDComplete && newDomain.length > currentDomain.length) {
          return
        }
      }
    }

    setEmail(valor)
    setErrores({ ...errores, email: validarEmail(valor) })
  }

  const handlePasswordChange = (e) => {
    const valor = e.target.value
    
    // Limitar a 15 caracteres máximo
    if (valor.length > 15) {
      return
    }
    
    setPassword(valor)
    setErrores({ ...errores, password: validarPassword(valor) })
  }

  // Manejadores de eventos para validar al pasar al siguiente campo
  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarEmail(email)
      setErrores({ ...errores, email: error })
      if (!error) {
        passwordRef.current.focus()
      }
    }
  }

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const error = validarPassword(password)
      setErrores({ ...errores, password: error })
      if (!error) {
        handleLogin(e)
      }
    }
  }

  // Validación completa del formulario antes de enviar
  const validarFormulario = () => {
    // Validar todos los campos
    const errEmail = validarEmail(email)
    const errPassword = validarPassword(password)

    // Actualizar todos los errores
    setErrores({
      email: errEmail,
      password: errPassword,
    })

    // Verificar si hay algún error
    return !errEmail && !errPassword
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    if (!validarFormulario()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")

      // Enfocar el primer campo con error
      if (errores.email) emailRef.current.focus()
      else if (errores.password) passwordRef.current.focus()

      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Intentando login con:", email, "y contraseña proporcionada")

      const response = await authService.login(email, password)

      console.log("Respuesta de login:", response)

      // Verificar si el rol está activo
      if (response.usuario && (response.usuario.rolEliminado || response.usuario.rolInactivo)) {
        setError("Tu rol ha sido desactivado o eliminado. Por favor, contacta al administrador.")
        setLoading(false)
        return
      }

      if (response.token) {
        localStorage.setItem("token", response.token)

        const isCliente =
          response.usuario &&
          (response.usuario.isCliente === true ||
            response.usuario.rol === "cliente" ||
            (typeof response.usuario.rol === "string" && response.usuario.rol.toLowerCase() === "cliente"))

        console.log("¿Es cliente?", isCliente, "Datos:", response.usuario)

        if (response.usuario) {
          const userInfo = {
            id: response.usuario.id,
            nombre: response.usuario.nombre,
            email: response.usuario.email,
            rol: response.usuario.rol,
            isCliente: isCliente,
            // Guardar información sobre el estado del rol
            rolEliminado: response.usuario.rolEliminado || false,
            rolInactivo: response.usuario.rolInactivo || false,
          }

          localStorage.setItem("usuario", JSON.stringify(userInfo))
          console.log("Información de usuario guardada:", userInfo)
          localStorage.setItem("userType", isCliente ? "cliente" : "admin")
        }

        sessionStorage.setItem("navegacionDirecta", "true")

        // Redireccionar a la última ruta protegida si existe
        const ultimaRuta = localStorage.getItem("ultimaRuta")
        const redirectPath = ultimaRuta || "/dashboard"

        if (isCliente) {
          localStorage.setItem("clienteLogin", "true")
          console.log("Usuario identificado como cliente, redirigiendo al dashboard común:", redirectPath)
        } else {
          console.log("Usuario no cliente, redirigiendo a:", redirectPath)
        }

        setTimeout(() => {
          console.log("Ejecutando redirección a:", redirectPath)
          history.replace(redirectPath)
        }, 100)
      } else {
        throw new Error("No se recibió un token válido")
      }
    } catch (error) {
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

  // Estilos adicionales para los mensajes de error
  const estilosAdicionales = {
    error: {
      fontSize: "14px",
      marginTop: "6px",
      marginBottom: "10px",
      textAlign: "left",
      color: "#e53e3e",
    },
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
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Ingresa tu correo electrónico"
                  required
                  maxLength={50} // Añadido límite máximo de caracteres
                  ref={emailRef}
                />
              </div>
              {errores.email && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.email}
                </div>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Ingresa tu contraseña"
                  required
                  maxLength={15} // Añadido límite máximo de caracteres
                  ref={passwordRef}
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
              {errores.password && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.password}
                </div>
              )}
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