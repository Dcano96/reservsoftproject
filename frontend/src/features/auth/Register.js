"use client"

import { useState, useEffect, useRef } from "react"
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

// Modificar los estilos adicionales para hacer los inputs más grandes
const estilosAdicionales = {
  input: {
    fontSize: "16px",
    padding: "12px 12px 12px 10px", // Reducir el padding izquierdo al mínimo
    height: "48px",
    borderRadius: "6px",
    textAlign: "left", // Alinear el texto a la izquierda
    width: "100%", // Asegurar que el input ocupe todo el ancho disponible
  },
  icon: {
    fontSize: "22px",
    left: "20px",
    display: "none", // Ocultar los iconos para que no interfieran con el texto
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
    textAlign: "left", // Alinear los placeholders a la izquierda
    paddingLeft: "0px", // Sin padding izquierdo
  },
  inputContainer: {
    width: "100%", // Asegurar que el contenedor ocupe todo el ancho disponible
  },
}

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

const Register = () => {
  // Referencias para los campos del formulario
  const documentoRef = useRef(null)
  const nombreRef = useRef(null)
  const telefonoRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

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

  // Validación exhaustiva de documento
  const validarDocumento = (doc) => {
    // Validaciones básicas
    if (!doc) return "El documento es obligatorio"
    if (doc.trim() === "") return "El documento no puede estar vacío"
    if (!REGEX.SOLO_NUMEROS.test(doc)) return "El documento debe contener solo números"
    if (doc.length < 6) return "El documento debe tener al menos 6 dígitos"
    if (doc.length > 15) return "El documento no puede tener más de 15 dígitos"

    // Validaciones de seguridad
    if (REGEX.CARACTERES_REPETIDOS.test(doc))
      return "El documento no puede contener más de 3 dígitos repetidos consecutivos"

    if (REGEX.SECUENCIAS_NUMERICAS.test(doc)) return "El documento no puede contener secuencias numéricas obvias"

    // Validación de documento con todos ceros
    if (/^0+$/.test(doc)) return "El documento no puede contener solo ceros"

    // Validación de documento con valor muy bajo
    if (Number.parseInt(doc) < 1000) return "El documento no parece válido (valor muy bajo)"

    return ""
  }

  // Validación exhaustiva de nombre
  const validarNombre = (nom) => {
    // Validaciones básicas
    if (!nom) return "El nombre es obligatorio"
    if (nom.trim() === "") return "El nombre no puede estar vacío"
    if (nom.length < 6) return "El nombre debe tener al menos 6 caracteres"
    if (nom.length > 30) return "El nombre no puede tener más de 30 caracteres"

    // Validación de solo letras y espacios (sin caracteres especiales ni números)
    if (!REGEX.SOLO_LETRAS_ESPACIOS.test(nom)) return "El nombre solo debe contener letras y espacios"

    // Validación de espacios múltiples
    if (/\s{2,}/.test(nom)) return "El nombre no puede contener espacios múltiples consecutivos"

    // Validación de al menos dos palabras (nombre y apellido)
    const palabras = nom.trim().split(/\s+/)
    if (palabras.length < 2) return "Debe ingresar al menos nombre y apellido"

    // Validación de longitud mínima para cada palabra
    for (const palabra of palabras) {
      if (palabra.length < 2) return "Cada palabra del nombre debe tener al menos 2 caracteres"
    }

    // Validación de palabras inapropiadas o nombres genéricos
    const palabrasProhibidas = ["admin", "usuario", "test", "prueba", "administrador"]
    for (const prohibida of palabrasProhibidas) {
      if (nom.toLowerCase().includes(prohibida)) return "El nombre contiene palabras no permitidas"
    }

    return ""
  }

  // Modificar la función validarTelefono para permitir cualquier número inicial
  const validarTelefono = (tel) => {
    // Validaciones básicas
    if (!tel) return "El teléfono es obligatorio"
    if (tel.trim() === "") return "El teléfono no puede estar vacío"
    if (!REGEX.SOLO_NUMEROS.test(tel)) return "El teléfono debe contener solo números"
    if (tel.length < 7) return "El teléfono debe tener al menos 7 dígitos"
    if (tel.length > 10) return "El teléfono no puede tener más de 10 dígitos"

    // Validaciones de seguridad
    if (REGEX.CARACTERES_REPETIDOS.test(tel))
      return "El teléfono no puede contener más de 3 dígitos repetidos consecutivos"

    if (REGEX.SECUENCIAS_NUMERICAS.test(tel)) return "El teléfono no puede contener secuencias numéricas obvias"

    // Validación de teléfono con todos ceros
    if (/^0+$/.test(tel)) return "El teléfono no puede contener solo ceros"

    // Eliminamos la validación que requiere que los números de 10 dígitos empiecen con 3
    // y que los números de 7 dígitos no empiecen con 0

    // Validación de teléfonos de emergencia o servicios
    const numerosEspeciales = ["123", "911", "112", "119"]
    if (numerosEspeciales.includes(tel)) return "No se permite el uso de números de emergencia"

    return ""
  }

  // Modificar la función validarEmail para no permitir caracteres después del TLD
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

    // Validación de relación con otros campos
    if (nombre) {
      const nombreParts = nombre.toLowerCase().split(/\s+/)
      for (const part of nombreParts) {
        if (part.length > 2 && pass.toLowerCase().includes(part))
          return "La contraseña no puede contener partes de tu nombre"
      }
    }

    if (documento && pass.includes(documento)) return "La contraseña no puede contener tu número de documento"

    if (telefono && pass.includes(telefono)) return "La contraseña no puede contener tu número de teléfono"

    if (email) {
      const emailPart = email.split("@")[0].toLowerCase()
      if (emailPart.length > 2 && pass.toLowerCase().includes(emailPart))
        return "La contraseña no puede contener partes de tu correo electrónico"
    }

    return ""
  }

  // Manejadores de cambio con validación en tiempo real
  const handleNombreChange = (e) => {
    const valor = e.target.value

    // Filtrar caracteres no permitidos en tiempo real
    if (valor && !REGEX.SOLO_LETRAS_ESPACIOS.test(valor.slice(-1))) {
      // No actualizar el estado si el último carácter no es una letra o espacio
      return
    }

    setNombre(valor)
    setErrores({ ...errores, nombre: validarNombre(valor) })
  }

  const handleDocumentoChange = (e) => {
    const valor = e.target.value

    // Filtrar caracteres no permitidos en tiempo real
    if (valor && !REGEX.SOLO_NUMEROS.test(valor)) {
      // No actualizar el estado si hay caracteres que no son números
      return
    }

    setDocumento(valor)
    setErrores({ ...errores, documento: validarDocumento(valor) })
  }

  const handleTelefonoChange = (e) => {
    const valor = e.target.value

    // Filtrar caracteres no permitidos en tiempo real
    if (valor && !REGEX.SOLO_NUMEROS.test(valor)) {
      // No actualizar el estado si hay caracteres que no son números
      return
    }

    setTelefono(valor)
    setErrores({ ...errores, telefono: validarTelefono(valor) })
  }

  // Modificar la función handleEmailChange para validar el email en tiempo real y permitir dominios como .co y luego .com
  const handleEmailChange = (e) => {
    const valor = e.target.value

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
    setPassword(valor)
    setErrores({ ...errores, password: validarPassword(valor) })
  }

  // Manejadores de eventos para validar al pasar al siguiente campo
  const handleDocumentoKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarDocumento(documento)
      setErrores({ ...errores, documento: error })
      if (!error) {
        nombreRef.current.focus()
      }
    }
  }

  const handleNombreKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarNombre(nombre)
      setErrores({ ...errores, nombre: error })
      if (!error) {
        telefonoRef.current.focus()
      }
    }
  }

  const handleTelefonoKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarTelefono(telefono)
      setErrores({ ...errores, telefono: error })
      if (!error) {
        emailRef.current.focus()
      }
    }
  }

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
        handleRegister(e)
      }
    }
  }

  // Validación completa del formulario antes de enviar
  const validarFormulario = () => {
    // Validar todos los campos
    const errNombre = validarNombre(nombre)
    const errDocumento = validarDocumento(documento)
    const errTelefono = validarTelefono(telefono)
    const errEmail = validarEmail(email)
    const errPassword = validarPassword(password)

    // Actualizar todos los errores
    setErrores({
      nombre: errNombre,
      documento: errDocumento,
      telefono: errTelefono,
      email: errEmail,
      password: errPassword,
    })

    // Verificar si hay algún error
    return !errNombre && !errDocumento && !errTelefono && !errEmail && !errPassword
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    if (!validarFormulario()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")

      // Enfocar el primer campo con error
      if (errores.documento) documentoRef.current.focus()
      else if (errores.nombre) nombreRef.current.focus()
      else if (errores.telefono) telefonoRef.current.focus()
      else if (errores.email) emailRef.current.focus()
      else if (errores.password) passwordRef.current.focus()

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

  // Modificar el estilo personalizado para los inputs
  const inputStyle = {
    ...estilosAdicionales.input,
    textAlign: "left", // Alinear el texto a la izquierda
    paddingLeft: "10px", // Padding izquierdo mínimo
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
              <div className="auth-input-container" style={estilosAdicionales.inputContainer}>
                {/* Iconos ocultos para mantener la estructura pero no interferir con el texto */}
                <AssignmentIndOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="documento"
                  type="text"
                  value={documento}
                  onChange={handleDocumentoChange}
                  onKeyDown={handleDocumentoKeyDown}
                  placeholder="Número de documento (6-15 dígitos)"
                  required
                  maxLength={15}
                  style={inputStyle}
                  ref={documentoRef}
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
              <div className="auth-input-container" style={estilosAdicionales.inputContainer}>
                <PersonOutline className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={handleNombreChange}
                  onKeyDown={handleNombreKeyDown}
                  placeholder="Ingresa tu nombre completo (6-30 caracteres)"
                  required
                  maxLength={30}
                  style={inputStyle}
                  ref={nombreRef}
                />
              </div>
              {errores.nombre && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.nombre}
                </div>
              )}
            </div>

            {/* Teléfono en su propia fila */}
            <div className="auth-input-group">
              <label htmlFor="telefono" style={estilosAdicionales.label}>
                Teléfono
              </label>
              <div className="auth-input-container" style={estilosAdicionales.inputContainer}>
                <PhoneOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={handleTelefonoChange}
                  onKeyDown={handleTelefonoKeyDown}
                  placeholder="Número de teléfono (7-10 dígitos)"
                  required
                  maxLength={10}
                  style={inputStyle}
                  ref={telefonoRef}
                />
              </div>
              {errores.telefono && (
                <div className="auth-field-error" style={estilosAdicionales.error}>
                  {errores.telefono}
                </div>
              )}
            </div>

            {/* Email en su propia fila */}
            <div className="auth-input-group">
              <label htmlFor="email" style={estilosAdicionales.label}>
                Email
              </label>
              <div className="auth-input-container" style={estilosAdicionales.inputContainer}>
                <EmailOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Ingresa tu email (6-30 caracteres)"
                  required
                  maxLength={30}
                  style={inputStyle}
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
              <label htmlFor="password" style={estilosAdicionales.label}>
                Contraseña
              </label>
              <div className="auth-input-container" style={estilosAdicionales.inputContainer}>
                <LockOutlined className="auth-input-icon" style={estilosAdicionales.icon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Contraseña segura (8-15 caracteres)" // Modificado para quitar "Crea una"
                  required
                  maxLength={15}
                  style={inputStyle}
                  ref={passwordRef}
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
