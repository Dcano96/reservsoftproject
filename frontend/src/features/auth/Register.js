"use client"

import { useState } from "react"
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  AssignmentIndOutlined,
  PhoneOutlined,
  EmailOutlined,
  LockOutlined,
  ArrowBack,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from "@material-ui/icons"
import authService from "./auth.service"
import { useHistory } from "react-router-dom"
import "./style.css"

// Importar la imagen de piscina
import piscinaImage from "../img/piscina.png"

const Register = () => {
  const [nombre, setNombre] = useState("")
  const [documento, setDocumento] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const history = useHistory()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authService.register({
        nombre,
        documento,
        telefono,
        email,
        password,
        rol: "cliente",
      })
      console.log(response.msg)
      history.push("/login") // Cambiado de "/" a "/login"
    } catch (error) {
      console.error("Error en el registro", error)
      const errorMsg =
        error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : "Error al registrarse. Por favor, inténtelo de nuevo."
      setError(errorMsg)
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
            src={piscinaImage || "/placeholder.svg"}
            alt="Piscina Hotel Nido Sky"
            className="auth-image"
          />
        </div>

        <div className="auth-form-column">
          <div className="auth-logo-container">
            <LockOutlined className="auth-logo-icon" />
          </div>

          <div className="auth-header">
            <h2>Crear cuenta</h2>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label htmlFor="nombre">Nombre completo</label>
              <div className="auth-input-container">
                <PersonOutline className="auth-input-icon" />
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <label htmlFor="documento">Documento</label>
                <div className="auth-input-container">
                  <AssignmentIndOutlined className="auth-input-icon" />
                  <input
                    id="documento"
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Número de documento"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="telefono">Teléfono</label>
                <div className="auth-input-container">
                  <PhoneOutlined className="auth-input-icon" />
                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Número de teléfono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <div className="auth-input-container">
                <EmailOutlined className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu email"
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
                  placeholder="Crea una contraseña segura"
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  <span>Registrando...</span>
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>

            <button type="button" className="auth-back-button" onClick={() => history.push("/login")}>
              {/* Cambiado de "/" a "/login" */}
              <ArrowBack className="auth-back-icon" />
              <span>Volver al inicio de sesión</span>
            </button>

            <div className="auth-links">
              <p>
                ¿Ya tienes una cuenta?{" "}
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

export default Register