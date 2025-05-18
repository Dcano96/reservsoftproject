"use client"

import { useState, useRef } from "react"
import axios from "axios"
import { useParams, useHistory } from "react-router-dom"
import {
  LockOutlined,
  ArrowBack,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons"
import "./style.css"

// Expresiones regulares para validaciones
const REGEX = {
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
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

const ResetPassword = () => {
  const { token } = useParams()
  const history = useHistory()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errores, setErrores] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const newPasswordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  const handleNewPasswordChange = (e) => {
    const valor = e.target.value

    // Limitar a 15 caracteres máximo
    if (valor.length > 15) {
      setErrores({ ...errores, newPassword: "Has alcanzado el límite máximo de 15 caracteres" })
      return
    }

    setNewPassword(valor)
    setErrores({ ...errores, newPassword: validarPassword(valor) })
  }

  const handleConfirmPasswordChange = (e) => {
    const valor = e.target.value

    // Limitar a 15 caracteres máximo
    if (valor.length > 15) {
      setErrores({ ...errores, confirmPassword: "Has alcanzado el límite máximo de 15 caracteres" })
      return
    }

    setConfirmPassword(valor)

    // Validar que coincida con la nueva contraseña
    let error = ""
    if (valor !== newPassword) {
      error = "Las contraseñas no coinciden"
    }

    setErrores({ ...errores, confirmPassword: error })
  }

  // Manejadores de eventos para validar al pasar al siguiente campo
  const handleNewPasswordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarPassword(newPassword)
      setErrores({ ...errores, newPassword: error })
      if (!error) {
        confirmPasswordRef.current.focus()
      }
    }
  }

  const handleConfirmPasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      let error = ""
      if (confirmPassword !== newPassword) {
        error = "Las contraseñas no coinciden"
      }
      setErrores({ ...errores, confirmPassword: error })
      if (!error && !errores.newPassword) {
        handleSubmit(e)
      }
    }
  }

  const validarFormulario = () => {
    // Validar todos los campos
    const errNewPassword = validarPassword(newPassword)
    let errConfirmPassword = ""

    if (confirmPassword !== newPassword) {
      errConfirmPassword = "Las contraseñas no coinciden"
    }

    // Actualizar todos los errores
    setErrores({
      newPassword: errNewPassword,
      confirmPassword: errConfirmPassword,
    })

    // Verificar si hay algún error
    return !errNewPassword && !errConfirmPassword
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    if (!validarFormulario()) {
      setMessage("Por favor, corrige los errores en el formulario antes de continuar.")
      setIsSuccess(false)

      // Enfocar el primer campo con error
      if (errores.newPassword) newPasswordRef.current.focus()
      else if (errores.confirmPassword) confirmPasswordRef.current.focus()

      return
    }

    setLoading(true)

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword })
      setMessage(res.data.msg)
      setIsSuccess(true)
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        history.push("/login") // Cambiado de "/" a "/login"
      }, 2000)
    } catch (error) {
      setMessage(error.response?.data?.msg || "Error al restablecer la contraseña")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
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
            <h2>Restablecer Contraseña</h2>
          </div>

          {message && (
            <div className={isSuccess ? "auth-success" : "auth-error"}>
              <span className={isSuccess ? "auth-success-icon" : "auth-error-icon"}>{isSuccess ? "✓" : "!"}</span>
              <span>{message}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onKeyDown={handleNewPasswordKeyDown}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                  maxLength={15}
                  ref={newPasswordRef}
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
              {!errores.newPassword && (
                <div className="auth-field-info" style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  La contraseña debe tener entre 8-15 caracteres, incluir mayúsculas, minúsculas, números y caracteres
                  especiales.
                </div>
              )}
              {errores.newPassword && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.newPassword}
                </div>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onKeyDown={handleConfirmPasswordKeyDown}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  maxLength={15}
                  ref={confirmPasswordRef}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={handleToggleConfirmPassword}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
              {errores.confirmPassword && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.confirmPassword}
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  <span>Procesando...</span>
                </>
              ) : (
                "Restablecer Contraseña"
              )}
            </button>

            <button type="button" className="auth-back-button" onClick={() => history.push("/login")}>
              {/* Cambiado de "/" a "/login" */}
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
                    history.push("/login") // Cambiado de "/" a "/login"
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
    </div>
  )
}

export default ResetPassword
