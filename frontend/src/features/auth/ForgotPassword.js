"use client"

import { useState, useRef } from "react"
import { Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { EmailOutlined, ArrowBack, LockOutlined, Facebook, Twitter, Instagram, LinkedIn } from "@material-ui/icons"
import authService from "./auth.service"
import { useHistory } from "react-router-dom"
import "./style.css"

// Expresiones regulares para validaciones
const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [errorEmail, setErrorEmail] = useState("")
  const history = useHistory()
  const emailRef = useRef(null)

  const handleEmailChange = (e) => {
    const valor = e.target.value

    // Limitar a 50 caracteres máximo
    if (valor.length > 50) {
      setErrorEmail("Has alcanzado el límite máximo de 50 caracteres")
      return
    }

    // Validación básica para caracteres permitidos en un email
    const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
    if (!emailRegex.test(valor)) {
      // No actualizar si hay caracteres inválidos
      setErrorEmail("El correo contiene caracteres no permitidos")
      return
    }

    // No permitir múltiples @ o puntos consecutivos
    if (valor.includes("@@") || valor.includes("..") || valor.includes(".@") || valor.includes("@.")) {
      setErrorEmail("El correo no puede contener @@ .. .@ o @.")
      return
    }

    // No permitir más de un @
    const atCount = (valor.match(/@/g) || []).length
    if (atCount > 1) {
      setErrorEmail("El correo no puede contener más de un @")
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
          setErrorEmail("No se pueden añadir más caracteres después del dominio completo")
          return
        }
      }
    }

    setEmail(valor)
    setErrorEmail(validarEmail(valor))
  }

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const error = validarEmail(email)
      setErrorEmail(error)
      if (!error) {
        handleResetPassword(e)
      }
    }
  }

  const validarFormulario = () => {
    const errEmail = validarEmail(email)
    setErrorEmail(errEmail)
    return !errEmail
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    if (!validarFormulario()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")

      // Enfocar el campo con error
      if (errorEmail) emailRef.current.focus()

      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Llamada real a la API para enviar el correo de recuperación
      const response = await authService.forgotPassword(email)

      // Mostrar mensaje de éxito
      setSuccess(response.msg || "Se ha enviado un enlace de recuperación a tu correo electrónico")
      setSnackbarMessage("Correo enviado con éxito")
      setSnackbarSeverity("success")
      setOpenSnackbar(true)

      // Limpiar el formulario
      setEmail("")
      setErrorEmail("")

      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        history.push("/login")
      }, 5000)
    } catch (error) {
      console.error("Error al enviar correo de recuperación", error)

      // Mejorado el manejo de errores para capturar correctamente el mensaje del backend
      let errorMsg = "Error al enviar el correo. Inténtalo de nuevo."

      if (error.msg) {
        // Si el error viene directamente del backend con formato {msg: "..."}
        errorMsg = error.msg
      } else if (error.message) {
        // Si es un error genérico con propiedad message
        errorMsg = error.message
      }

      setError(errorMsg)
      setSnackbarMessage(errorMsg)
      setSnackbarSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
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
            <h2>Recuperar contraseña</h2>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success">
              <span className="auth-success-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleResetPassword}>
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
                  maxLength={50}
                  ref={emailRef}
                />
              </div>
              {!errorEmail && (
                <div className="auth-field-info" style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)
                </div>
              )}
              {errorEmail && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errorEmail}
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  <span>Enviando...</span>
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </button>

            <button type="button" className="auth-back-button" onClick={() => history.push("/login")}>
              <ArrowBack className="auth-back-icon" />
              <span>Volver al inicio de sesión</span>
            </button>

            <div className="auth-links">
              <p>
                ¿Recordaste tu contraseña?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    history.push("/login")
                  }}
                >
                  Iniciar sesión
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ForgotPassword
