"use client"

import { useState } from "react"
import axios from "axios"
import { useParams, useHistory } from "react-router-dom"
import { LockOutlined, ArrowBack, Facebook, Twitter, Instagram, LinkedIn } from "@material-ui/icons"
import "./style.css"

const ResetPassword = () => {
  const { token } = useParams()
  const history = useHistory()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden")
      setIsSuccess(false)
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
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>
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