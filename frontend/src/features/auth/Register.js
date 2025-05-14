"use client"

import { useState, useEffect } from "react"
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

// Modificar los estilos adicionales para mover los placeholders más a la derecha
const estilosAdicionales = {
  input: {
    fontSize: "16px",
    padding: "12px 12px 12px 60px", // Aumentar padding izquierdo para mover el texto más a la derecha
    height: "48px",
    borderRadius: "6px",
    textAlign: "left",
  },
  icon: {
    fontSize: "22px",
    left: "20px", // Mover los iconos más a la derecha
  },
  button: {
    fontSize: "16px",
    padding: "14px 20px",
    height: "auto",
    borderRadius: "6px",
  },
  toggleButton: {
    fontSize: "22px",
    right: "12px",
  },
  label: {
    fontSize: "16px",
    marginBottom: "8px",
    textAlign: "left",
  },
  error: {
    fontSize: "14px",
    marginTop: "6px",
    marginBottom: "10px",
    textAlign: "left",
  },
  placeholder: {
    textAlign: "left",
    paddingLeft: "20px", // Aumentar el padding izquierdo de los placeholders
  },
}

const Register = () => {
  const [nombre, setNombre] = useState("")
  const [documento, setDocumento] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errores, setErrores] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    password: "",
  })
  const [isMounted, setIsMounted] = useState(true)
  const history = useHistory()

  // Efecto para limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

  // Validación de documento
  const validarDocumento = (doc) => {
    if (!doc.trim()) return "El documento es obligatorio"
    if (!/^\d+$/.test(doc)) return "El documento debe contener solo números"
    if (doc.length < 6 || doc.length > 15) return "El documento debe tener entre 6 y 15 dígitos"
    return ""
  }

  // Validación de nombre
  const validarNombre = (nom) => {
    if (!nom.trim()) return "El nombre es obligatorio"
    if (/\d/.test(nom)) return "El nombre no debe contener números"
    if (nom.length < 6 || nom.length > 30) return "El nombre debe tener entre 6 y 30 caracteres"
    return ""
  }

  // Validación de teléfono
  const validarTelefono = (tel) => {
    if (!tel.trim()) return "El teléfono es obligatorio"
    if (!/^\d+$/.test(tel)) return "El teléfono debe contener solo números"
    if (tel.length < 7 || tel.length > 10) return "El teléfono debe tener entre 7 y 10 dígitos"
    return ""
  }

  // Validación de email
  const validarEmail = (em) => {
    if (!em.trim()) return "El correo electrónico es obligatorio"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return "Ingresa un correo electrónico válido"
    if (em.length < 6 || em.length > 30) return "El correo debe tener entre 6 y 30 caracteres"
    return ""
  }

  // Validación de contraseña
  const validarPassword = (pass) => {
    if (!pass) return "La contraseña es obligatoria"
    if (pass.length < 8 || pass.length > 15) return "La contraseña debe tener entre 8 y 15 caracteres"
    if (!/[a-zA-Z]/.test(pass)) return "La contraseña debe contener al menos una letra"
    if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número"
    if (!/[^a-zA-Z0-9]/.test(pass)) return "La contraseña debe contener al menos un carácter especial"
    return ""
  }

  // Manejadores de cambio con validación
  const handleNombreChange = (e) => {
    const valor = e.target.value
    // No permitir números en el nombre
    if (/\d/.test(valor)) {
      setErrores({ ...errores, nombre: "El nombre no debe contener números" })
      return
    }
    setNombre(valor)
    setErrores({ ...errores, nombre: validarNombre(valor) })
  }

  const handleDocumentoChange = (e) => {
    const valor = e.target.value
    // Solo permitir números
    if (!/^\d*$/.test(valor)) return
    setDocumento(valor)
    setErrores({ ...errores, documento: validarDocumento(valor) })
  }

  const handleTelefonoChange = (e) => {
    const valor = e.target.value
    // Solo permitir números
    if (!/^\d*$/.test(valor)) return
    setTelefono(valor)
    setErrores({ ...errores, telefono: validarTelefono(valor) })
  }

  const handleEmailChange = (e) => {
    const valor = e.target.value
    setEmail(valor)
    setErrores({ ...errores, email: validarEmail(valor) })
  }

  const handlePasswordChange = (e) => {
    const valor = e.target.value
    setPassword(valor)
    setErrores({ ...errores, password: validarPassword(valor) })
  }

  const validarFormulario = () => {
    const errNombre = validarNombre(nombre)
    const errDocumento = validarDocumento(documento)
    const errTelefono = validarTelefono(telefono)
    const errEmail = validarEmail(email)
    const errPassword = validarPassword(password)

    setErrores({
      nombre: errNombre,
      documento: errDocumento,
      telefono: errTelefono,
      email: errEmail,
      password: errPassword,
    })

    return !errNombre && !errDocumento && !errTelefono && !errEmail && !errPassword
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    if (!validarFormulario()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }

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
      history.push("/login")
    } catch (error) {
      console.error("Error en el registro", error)
      if (isMounted) {
        const errorMsg =
          error.response && error.response.data && error.response.data.msg
            ? error.response.data.msg
            : "Error al registrarse. Por favor, inténtelo de nuevo."
        setError(errorMsg)
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  // Más abajo en el código, modificar el estilo personalizado para los inputs
  const inputStyle = {
    ...estilosAdicionales.input,
    textAlign: "left",
    paddingLeft: "60px", // Asegurar que el padding izquierdo sea consistente
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
            <LockOutlined className="auth-logo-icon" style={{ fontSize: "28px" }} />
          </div>

          <div className="auth-header">
            <h2 style={{ fontSize: "24px" }}>Crear cuenta</h2>
          </div>

          {error && (
            <div className="auth-error" style={{ fontSize: "16px", padding: "12px", textAlign: "left" }}>
              <span className="auth-error-icon" style={{ fontSize: "18px" }}>
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label htmlFor="documento" style={estilosAdicionales.label}>
                Documento
              </label>
              <div className="auth-input-container">
                <AssignmentIndOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="documento"
                  type="text"
                  value={documento}
                  onChange={handleDocumentoChange}
                  placeholder="Número de documento (6-15 dígitos)"
                  required
                  maxLength={15}
                  style={inputStyle}
                />
              </div>
              {errores.documento && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.documento}
                </div>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="nombre" style={estilosAdicionales.label}>
                Nombre completo
              </label>
              <div className="auth-input-container">
                <PersonOutline className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={handleNombreChange}
                  placeholder="Ingresa tu nombre completo (6-30 caracteres)"
                  required
                  maxLength={30}
                  style={inputStyle}
                />
              </div>
              {errores.nombre && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.nombre}
                </div>
              )}
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <label htmlFor="telefono" style={estilosAdicionales.label}>
                  Teléfono
                </label>
                <div className="auth-input-container">
                  <PhoneOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="Número de teléfono (7-10 dígitos)"
                    required
                    maxLength={10}
                    style={inputStyle}
                  />
                </div>
                {errores.telefono && (
                  <div className="auth-field-error" style={estilosAdicionales.error}>
                    {errores.telefono}
                  </div>
                )}
              </div>

              <div className="auth-input-group">
                <label htmlFor="email" style={estilosAdicionales.label}>
                  Email
                </label>
                <div className="auth-input-container">
                  <EmailOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Ingresa tu email (6-30 caracteres)"
                    required
                    maxLength={30}
                    style={inputStyle}
                  />
                </div>
                {errores.email && (
                  <div className="auth-field-error" style={estilosAdicionales.error}>
                    {errores.email}
                  </div>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password" style={estilosAdicionales.label}>
                Contraseña
              </label>
              <div className="auth-input-container">
                <LockOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Crea una contraseña segura (8-15 caracteres)"
                  required
                  maxLength={15}
                  style={inputStyle}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={estilosAdicionales.toggleButton}
                >
                  {showPassword ? (
                    <VisibilityOff style={{ fontSize: "22px" }} />
                  ) : (
                    <Visibility style={{ fontSize: "22px" }} />
                  )}
                </button>
              </div>
              {errores.password && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.password}
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading} style={estilosAdicionales.button}>
              {loading ? (
                <>
                  <span className="auth-loading" style={{ width: "20px", height: "20px" }}></span>
                  <span>Registrando...</span>
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>

            <button
              type="button"
              className="auth-back-button"
              onClick={() => history.push("/login")}
              style={{ ...estilosAdicionales.button, marginTop: "16px" }}
            >
              <ArrowBack className="auth-back-icon" style={{ fontSize: "20px", marginRight: "8px" }} />
              <span>Volver al inicio de sesión</span>
            </button>

            <div className="auth-links" style={{ fontSize: "16px", marginTop: "20px", textAlign: "center" }}>
              <p>
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    history.push("/login")
                  }}
                  style={{ fontWeight: "bold" }}
                >
                  Iniciar sesión
                </a>
              </p>
            </div>

            <div className="auth-social-icons" style={{ marginTop: "20px" }}>
              <a href="#" className="auth-social-icon" style={{ fontSize: "24px" }}>
                <Facebook />
              </a>
              <a href="#" className="auth-social-icon" style={{ fontSize: "24px" }}>
                <Twitter />
              </a>
              <a href="#" className="auth-social-icon" style={{ fontSize: "24px" }}>
                <Instagram />
              </a>
              <a href="#" className="auth-social-icon" style={{ fontSize: "24px" }}>
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
