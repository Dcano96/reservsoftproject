"use client"

import { useState } from "react"
import { Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { EmailOutlined, ArrowBack, LockOutlined, Facebook, Twitter, Instagram, LinkedIn } from "@material-ui/icons"
import authService from "./auth.service"
import { useHistory } from "react-router-dom"
import "./style.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const history = useHistory()

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico")
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image-column">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Hotel Nido Sky"
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
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-container">
                <EmailOutlined className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
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
