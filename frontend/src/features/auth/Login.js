"use client"

import { useState } from "react"
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from "@material-ui/icons"
import authService from "./auth.service"
import { useHistory } from "react-router-dom"
import "./style.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const history = useHistory()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authService.login(email, password)
      localStorage.setItem("token", response.token)
      history.replace("/dashboard")
    } catch (error) {
      const errorMsg =
        error.response && error.response.data && error.response.data.msg ? error.response.data.msg : "Error en el login"
      setError(errorMsg)
      console.error("Error en el login", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
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
            <h2>Iniciar sesión</h2>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
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

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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