"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import {
  Save,
  Edit,
  Close,
  Person,
  Email,
  Phone,
  Security,
  AssignmentInd,
  CalendarToday,
  VerifiedUser,
  Lock,
  Visibility,
  CheckCircle,
  AccessTime,
  Work,
  VpnKey,
  VisibilityOff,
} from "@material-ui/icons"
import axios from "axios"
import jwtDecode from "jwt-decode"
import Swal from "sweetalert2"
import "./usuarios.styles.css"
// Añadir esta importación al inicio del archivo
import MisReservas from "../clientes/mis-reservas"

// Añadir estas constantes después de las importaciones y antes del componente UserProfile
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

// Validación exhaustiva de teléfono
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

  // Validación de teléfonos de emergencia o servicios
  const numerosEspeciales = ["123", "911", "112", "119"]
  if (numerosEspeciales.includes(tel)) return "No se permite el uso de números de emergencia"

  return ""
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

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
  })
  // Reemplazar la declaración de estados en el componente UserProfile para añadir los estados de mostrar/ocultar contraseña
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    nuevoPassword: "",
    confirmarPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState({
    passwordActual: "",
    nuevoPassword: "",
    confirmarPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswordActual, setShowPasswordActual] = useState(false)
  const [showNuevoPassword, setShowNuevoPassword] = useState(false)
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
  const [roleDetails, setRoleDetails] = useState(null)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [activeTab, setActiveTab] = useState("personal")
  const [errores, setErrores] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    passwordActual: "",
    nuevoPassword: "",
    confirmarPassword: "",
  })

  useEffect(() => {
    // Bandera para controlar si el componente está montado
    let isMounted = true
    // Para cancelar solicitudes pendientes
    const controller = new AbortController()
    const signal = controller.signal

    const fetchUserProfile = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No hay token de autenticación")
        }

        // Decodificar el token para obtener información básica
        const decoded = jwtDecode(token)
        const userId = decoded?.usuario?._id || decoded?.usuario?.id || decoded?.uid
        const userData = decoded?.usuario || {}

        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario")
        }

        // Intentar obtener datos completos del usuario desde la API
        try {
          const response = await axios.get(`http://localhost:5000/api/usuarios/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: signal,
          })

          if (!isMounted) return

          const apiUserData = response.data
          setProfile(apiUserData)
          setFormData({
            nombre: apiUserData.nombre || "",
            email: apiUserData.email || "",
            telefono: apiUserData.telefono || "",
            documento: apiUserData.documento || "",
          })

          // Obtener detalles del rol
          if (apiUserData.rol) {
            try {
              const roleName = typeof apiUserData.rol === "object" ? apiUserData.rol.nombre : apiUserData.rol

              // Intentar obtener detalles del rol, pero manejar el caso en que no exista
              const roleResponse = await axios.get(`http://localhost:5000/api/roles/byName/${roleName}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: signal,
              })

              if (!isMounted) return
              setRoleDetails(roleResponse.data)
            } catch (roleError) {
              console.warn("No se pudieron obtener detalles del rol:", roleError)
              // No establecemos error general, solo continuamos sin los detalles del rol
            }
          }
        } catch (apiError) {
          console.warn("No se pudieron obtener datos completos del usuario desde la API:", apiError)
          console.log("Usando datos del token JWT como alternativa")

          // Si la API falla, usar los datos del token JWT
          setProfile({
            _id: userId,
            nombre: userData.nombre || "Usuario",
            email: userData.email || "",
            telefono: userData.telefono || "",
            documento: userData.documento || "",
            rol: userData.rol || "Usuario",
            fechaCreacion: userData.fechaCreacion || new Date().toISOString(),
            ultimoAcceso: userData.ultimoAcceso || new Date().toISOString(),
            permisos: userData.permisos || [],
          })

          setFormData({
            nombre: userData.nombre || "",
            email: userData.email || "",
            telefono: userData.telefono || "",
            documento: userData.documento || "",
          })
        }

        if (!isMounted) return
        setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error("Error al obtener el perfil del usuario:", error)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)

        // Solo mostrar alerta si el componente sigue montado
        if (isMounted) {
          Swal.fire({
            title: "Error",
            text: "No se pudo cargar la información del perfil",
            icon: "error",
            confirmButtonColor: "#2563eb",
          })
        }
      }
    }

    fetchUserProfile()

    // Función de limpieza para evitar memory leaks
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // Modificar la función handleChange para hacer las validaciones más estrictas
  const handleChange = (e) => {
    const { name, value } = e.target

    // Aplicar validaciones específicas según el campo
    if (name === "nombre") {
      // No permitir más de 30 caracteres
      if (value.length > 30) return

      // Filtrar caracteres no permitidos en tiempo real (solo letras y espacios)
      if (value && !REGEX.SOLO_LETRAS_ESPACIOS.test(value.slice(-1))) {
        return // No actualizar el estado si el último carácter no es una letra o espacio
      }

      // No permitir espacios múltiples consecutivos
      if (/\s{2,}/.test(value)) return

      // Actualizar el estado y validar
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrores((prev) => ({ ...prev, [name]: validarNombre(value) }))
    } else if (name === "documento") {
      // No permitir más de 15 caracteres
      if (value.length > 15) return

      // Filtrar caracteres no permitidos en tiempo real (solo números)
      if (value && !REGEX.SOLO_NUMEROS.test(value)) {
        return // No actualizar el estado si hay caracteres que no son números
      }

      // Actualizar el estado y validar
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrores((prev) => ({ ...prev, [name]: validarDocumento(value) }))
    } else if (name === "telefono") {
      // No permitir más de 10 caracteres
      if (value.length > 10) return

      // Filtrar caracteres no permitidos en tiempo real (solo números)
      if (value && !REGEX.SOLO_NUMEROS.test(value)) {
        return // No actualizar el estado si hay caracteres que no son números
      }

      // Actualizar el estado y validar
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrores((prev) => ({ ...prev, [name]: validarTelefono(value) }))
    } else if (name === "email") {
      // No permitir más de 50 caracteres
      if (value.length > 50) return

      // Validación básica para caracteres permitidos en un email
      const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
      if (!emailRegex.test(value)) {
        return // No actualizar si hay caracteres inválidos
      }

      // No permitir múltiples @ o puntos consecutivos
      if (value.includes("@@") || value.includes("..") || value.includes(".@") || value.includes("@.")) {
        return
      }

      // No permitir más de un @
      const atCount = (value.match(/@/g) || []).length
      if (atCount > 1) {
        return
      }

      // Verificar si ya tiene un TLD válido completo (.com, .net, etc.)
      const completeTLDs = [".com", ".net", ".org", ".edu", ".gov", ".co", ".io", ".info", ".biz", ".app"]

      // Si el email actual ya tiene un @ y un punto
      if (formData.email.includes("@") && formData.email.includes(".")) {
        const currentParts = formData.email.split("@")
        const newParts = value.split("@")

        // Si ambos tienen la parte del dominio
        if (currentParts.length > 1 && newParts.length > 1) {
          const currentDomain = currentParts[1]
          const newDomain = newParts[1]

          // Verificar si el dominio actual termina con alguno de los TLDs completos
          const hasTLDComplete = completeTLDs.some((tld) => {
            // Verificar si el dominio actual termina con el TLD
            if (currentDomain.endsWith(tld)) {
              // Si el nuevo dominio es más largo que el actual, significa que están intentando
              // añadir caracteres después del TLD, lo cual no debe permitirse
              const tldIndex = currentDomain.lastIndexOf(tld)
              const currentDomainWithoutTLD = currentDomain.substring(0, tldIndex)

              // Si el nuevo dominio es más largo que el dominio actual sin el TLD + la longitud del TLD,
              // significa que están intentando añadir caracteres después del TLD
              if (newDomain.length > currentDomainWithoutTLD.length + tld.length) {
                return true // No permitir más caracteres después del TLD
              }
            }
            return false
          })

          if (hasTLDComplete) {
            return // No permitir más caracteres después del TLD
          }
        }
      }

      // Actualizar el estado y validar
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrores((prev) => ({ ...prev, [name]: validarEmail(value) }))
    }
  }

  // Modificar la función handlePasswordChange para hacer las validaciones más estrictas
  const handlePasswordChange = (e) => {
    const { name, value } = e.target

    // Limitar a 15 caracteres máximo para todos los campos de contraseña
    if (value.length > 15) {
      return
    }

    if (name === "passwordActual") {
      setPasswordData((prev) => ({ ...prev, [name]: value }))
      setPasswordErrors((prev) => ({
        ...prev,
        passwordActual: value ? "" : "La contraseña actual es obligatoria",
      }))
    } else if (name === "nuevoPassword") {
      // Validar complejidad en tiempo real
      if (value.length > 0) {
        // Verificar que tenga al menos una minúscula
        if (!/[a-z]/.test(value) && value.length > 0) {
          setPasswordErrors((prev) => ({
            ...prev,
            nuevoPassword: "La contraseña debe contener al menos una letra minúscula",
          }))
          setPasswordData((prev) => ({ ...prev, [name]: value }))
          return
        }

        // Verificar que tenga al menos una mayúscula
        if (!/[A-Z]/.test(value) && value.length > 0) {
          setPasswordErrors((prev) => ({
            ...prev,
            nuevoPassword: "La contraseña debe contener al menos una letra mayúscula",
          }))
          setPasswordData((prev) => ({ ...prev, [name]: value }))
          return
        }

        // Verificar que tenga al menos un número
        if (!/[0-9]/.test(value) && value.length > 0) {
          setPasswordErrors((prev) => ({
            ...prev,
            nuevoPassword: "La contraseña debe contener al menos un número",
          }))
          setPasswordData((prev) => ({ ...prev, [name]: value }))
          return
        }

        // Verificar que tenga al menos un carácter especial
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value) && value.length > 0) {
          setPasswordErrors((prev) => ({
            ...prev,
            nuevoPassword: "La contraseña debe contener al menos un carácter especial",
          }))
          setPasswordData((prev) => ({ ...prev, [name]: value }))
          return
        }
      }

      // Actualizar el estado y validar
      setPasswordData((prev) => ({ ...prev, [name]: value }))
      const error = validarPassword(value)
      setPasswordErrors((prev) => ({
        ...prev,
        nuevoPassword: error,
        confirmarPassword:
          passwordData.confirmarPassword && value !== passwordData.confirmarPassword
            ? "Las contraseñas no coinciden"
            : "",
      }))
    } else if (name === "confirmarPassword") {
      // Actualizar el estado y validar
      setPasswordData((prev) => ({ ...prev, [name]: value }))
      setPasswordErrors((prev) => ({
        ...prev,
        confirmarPassword: value !== passwordData.nuevoPassword ? "Las contraseñas no coinciden" : "",
      }))
    }
  }

  // Añadir estas funciones para manejar los botones de mostrar/ocultar contraseña
  const handleTogglePasswordActual = () => {
    setShowPasswordActual(!showPasswordActual)
  }

  const handleToggleNuevoPassword = () => {
    setShowNuevoPassword(!showNuevoPassword)
  }

  const handleToggleConfirmarPassword = () => {
    setShowConfirmarPassword(!showConfirmarPassword)
  }

  // Añadir estas funciones para manejar el evento keyDown
  const handlePasswordActualKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      if (!passwordData.passwordActual) {
        setPasswordErrors((prev) => ({
          ...prev,
          passwordActual: "La contraseña actual es obligatoria",
        }))
        return
      }
      document.getElementById("nuevoPassword").focus()
    }
  }

  const handleNuevoPasswordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarPassword(passwordData.nuevoPassword)
      setPasswordErrors((prev) => ({
        ...prev,
        nuevoPassword: error,
      }))
      if (!error) {
        document.getElementById("confirmarPassword").focus()
      }
    }
  }

  const handleConfirmarPasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (passwordData.confirmarPassword !== passwordData.nuevoPassword) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmarPassword: "Las contraseñas no coinciden",
        }))
        return
      }
      handlePasswordSubmit(e)
    }
  }

  // Modificar la función handleSubmit para asegurar que todas las validaciones se cumplan
  const handleSubmit = async () => {
    try {
      // Validar todos los campos antes de enviar
      const errNombre = validarNombre(formData.nombre)
      const errDocumento = validarDocumento(formData.documento)
      const errTelefono = validarTelefono(formData.telefono)
      const errEmail = validarEmail(formData.email)

      // Actualizar todos los errores
      setErrores({
        ...errores,
        nombre: errNombre,
        documento: errDocumento,
        telefono: errTelefono,
        email: errEmail,
      })

      // Verificar si hay algún error o campo vacío
      if (
        errNombre ||
        errDocumento ||
        errTelefono ||
        errEmail ||
        !formData.nombre ||
        !formData.documento ||
        !formData.telefono ||
        !formData.email
      ) {
        setNotification({
          open: true,
          message: "Por favor, corrige los errores en el formulario antes de continuar.",
          severity: "error",
        })
        return
      }

      // Verificar longitudes mínimas
      if (formData.nombre.length < 6) {
        setErrores((prev) => ({ ...prev, nombre: "El nombre debe tener al menos 6 caracteres" }))
        setNotification({
          open: true,
          message: "El nombre debe tener al menos 6 caracteres",
          severity: "error",
        })
        return
      }

      if (formData.documento.length < 6) {
        setErrores((prev) => ({ ...prev, documento: "El documento debe tener al menos 6 dígitos" }))
        setNotification({
          open: true,
          message: "El documento debe tener al menos 6 dígitos",
          severity: "error",
        })
        return
      }

      if (formData.telefono.length < 7) {
        setErrores((prev) => ({ ...prev, telefono: "El teléfono debe tener al menos 7 dígitos" }))
        setNotification({
          open: true,
          message: "El teléfono debe tener al menos 7 dígitos",
          severity: "error",
        })
        return
      }

      if (formData.email.length < 6) {
        setErrores((prev) => ({ ...prev, email: "El correo debe tener al menos 6 caracteres" }))
        setNotification({
          open: true,
          message: "El correo debe tener al menos 6 caracteres",
          severity: "error",
        })
        return
      }

      setLoading(true)
      const token = localStorage.getItem("token")

      if (!profile || !profile._id) {
        throw new Error("No se pudo identificar al usuario")
      }

      // Actualizar solo los campos permitidos
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        documento: formData.documento,
      }

      try {
        const response = await axios.put(`http://localhost:5000/api/usuarios/${profile._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Actualizar el perfil local con los datos actualizados
        setProfile((prev) => ({
          ...prev,
          ...updateData,
        }))

        setEditing(false)
        setLoading(false)

        setNotification({
          open: true,
          message: "Perfil actualizado correctamente",
          severity: "success",
        })
      } catch (apiError) {
        console.warn("No se pudo actualizar el perfil en la API:", apiError)

        // Si la API falla, actualizar solo la interfaz local
        setProfile((prev) => ({
          ...prev,
          ...updateData,
        }))

        setEditing(false)
        setLoading(false)

        setNotification({
          open: true,
          message: "Perfil actualizado localmente (los cambios no se guardaron en el servidor)",
          severity: "warning",
        })

        // Mostrar alerta informativa
        Swal.fire({
          title: "Actualización local",
          text: "Tu perfil se ha actualizado solo en esta sesión. Los cambios no se han guardado en el servidor debido a restricciones de permisos.",
          icon: "info",
          confirmButtonColor: "#2563eb",
        })
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      setLoading(false)

      setNotification({
        open: true,
        message: "Error al actualizar el perfil: " + (error.response?.data?.message || error.message),
        severity: "error",
      })
    }
  }

  // Modificar la función handlePasswordSubmit para asegurar que todas las validaciones se cumplan
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    // Validar la contraseña actual
    if (!passwordData.passwordActual) {
      setPasswordErrors((prev) => ({
        ...prev,
        passwordActual: "La contraseña actual es obligatoria",
      }))
      return
    }

    // Validar la nueva contraseña
    const passwordError = validarPassword(passwordData.nuevoPassword)
    const confirmError =
      passwordData.nuevoPassword !== passwordData.confirmarPassword ? "Las contraseñas no coinciden" : ""

    setPasswordErrors({
      passwordActual: passwordData.passwordActual ? "" : "La contraseña actual es obligatoria",
      nuevoPassword: passwordError,
      confirmarPassword: confirmError,
    })

    // Si hay errores, no continuar
    if (!passwordData.passwordActual || passwordError || confirmError) {
      setNotification({
        open: true,
        message: "Por favor, corrige los errores en el formulario antes de continuar.",
        severity: "error",
      })
      return
    }

    // Verificar longitud mínima de la nueva contraseña
    if (passwordData.nuevoPassword.length < 8) {
      setPasswordErrors((prev) => ({
        ...prev,
        nuevoPassword: "La contraseña debe tener al menos 8 caracteres",
      }))
      setNotification({
        open: true,
        message: "La contraseña debe tener al menos 8 caracteres",
        severity: "error",
      })
      return
    }

    try {
      setPasswordLoading(true)
      const token = localStorage.getItem("token")
      const decoded = jwtDecode(token)
      const userId = profile?._id || decoded?.uid || decoded?.usuario?._id || decoded?.usuario?.id

      // Datos para enviar en la solicitud
      const passwordPayload = {
        passwordActual: passwordData.passwordActual,
        nuevoPassword: passwordData.nuevoPassword,
      }

      // Opciones de configuración para axios
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Intentar con la primera ruta: /api/usuarios/cambiar-password
      console.log("Intentando cambiar contraseña con ruta 1: /api/usuarios/cambiar-password")
      try {
        const response = await axios.post(
          "http://localhost:5000/api/usuarios/cambiar-password",
          passwordPayload,
          axiosConfig,
        )

        handlePasswordSuccess()
        return
      } catch (error1) {
        console.log("Error en ruta 1:", error1.response?.status)

        // Si la primera ruta falla, intentar con la segunda: /api/usuarios/:id/cambiar-password
        if (userId) {
          console.log(`Intentando cambiar contraseña con ruta 2: /api/usuarios/${userId}/cambiar-password`)
          try {
            const response2 = await axios.post(
              `http://localhost:5000/api/usuarios/${userId}/cambiar-password`,
              passwordPayload,
              axiosConfig,
            )

            handlePasswordSuccess()
            return
          } catch (error2) {
            console.log("Error en ruta 2:", error2.response?.status)

            // Si la segunda ruta falla, intentar con la tercera: /api/clientes/cambiar-password
            console.log("Intentando cambiar contraseña con ruta 3: /api/clientes/cambiar-password")
            try {
              const response3 = await axios.post(
                "http://localhost:5000/api/clientes/cambiar-password",
                passwordPayload,
                axiosConfig,
              )

              handlePasswordSuccess()
              return
            } catch (error3) {
              console.log("Error en ruta 3:", error3.response?.status)
              throw error3
            }
          }
        } else {
          throw error1
        }
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      setPasswordLoading(false)

      const errorMessage = error.response?.data?.msg || "Error al cambiar la contraseña"

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })

      // Mostrar alerta de error
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  // Función auxiliar para manejar el éxito al cambiar la contraseña
  const handlePasswordSuccess = () => {
    setPasswordLoading(false)

    // Limpiar el formulario
    setPasswordData({
      passwordActual: "",
      nuevoPassword: "",
      confirmarPassword: "",
    })

    setNotification({
      open: true,
      message: "Contraseña actualizada correctamente",
      severity: "success",
    })

    // Mostrar alerta de éxito
    Swal.fire({
      title: "¡Éxito!",
      text: "Tu contraseña ha sido actualizada correctamente",
      icon: "success",
      confirmButtonColor: "#2563eb",
    })
  }

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Fecha inválida"
    }
  }

  const formatPermissions = (permisos) => {
    if (!permisos || permisos.length === 0) return "Sin permisos asignados"

    if (typeof permisos[0] === "string") {
      return permisos.join(", ")
    }

    return permisos
      .map((p) => {
        const acciones = p.acciones
          ? Object.entries(p.acciones)
              .filter(([_, value]) => value)
              .map(([key, _]) => key)
              .join(", ")
          : ""

        return `${p.modulo} (${acciones})`
      })
      .join("; ")
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función para obtener color basado en el rol
  const getRoleColor = (role) => {
    if (!role) return "#2563eb"
    const roleLower = typeof role === "object" ? role.nombre.toLowerCase() : role.toLowerCase()

    if (roleLower.includes("admin")) return "#2563eb" // Cambiado de rojo a azul
    if (roleLower.includes("gerente")) return "#3b82f6"
    if (roleLower.includes("supervisor")) return "#60a5fa"
    return "#2563eb"
  }

  if (loading && !profile) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-content">
          <CircularProgress style={{ color: "#2563eb" }} />
          <Typography variant="h6" className="profile-loading-text">
            Cargando información del perfil...
          </Typography>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="profile-error-container">
        <div className="profile-error-content">
          <Typography variant="h6" color="error" className="profile-error-text">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            className="profile-retry-button"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const roleName = typeof profile?.rol === "object" ? profile?.rol?.nombre : profile?.rol || "Usuario"
  const roleColor = getRoleColor(profile?.rol)

  return (
    <div className="profile-page-container">
      {/* Cabecera del perfil */}
      <div className="profile-header" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)` }}>
        <div className="profile-header-content">
          <div className="profile-avatar-container">
            <Avatar className="profile-avatar" style={{ backgroundColor: roleColor }}>
              {getInitials(profile?.nombre)}
            </Avatar>
            <Chip
              label={roleName}
              className="profile-role-chip"
              style={{ backgroundColor: `${roleColor}22`, color: roleColor, borderColor: roleColor }}
            />
          </div>
          <div className="profile-header-text">
            <Typography variant="h4" className="profile-name">
              {profile?.nombre || "Usuario"}
            </Typography>
            <Typography variant="body1" className="profile-email">
              {profile?.email || "correo@ejemplo.com"}
            </Typography>
            <div className="profile-status">
              <Chip
                icon={<CheckCircle style={{ color: "#10b981" }} />}
                label="Cuenta Activa"
                className="profile-status-chip"
              />
              <Typography variant="body2" className="profile-last-login">
                <AccessTime fontSize="small" /> Último acceso: {formatDate(profile?.ultimoAcceso)}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="profile-tabs">
        <Button
          className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <Person /> Información Personal
        </Button>
        <Button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Security /> Seguridad y Permisos
        </Button>
        {/* Añadir esta nueva pestaña */}
        <Button
          className={`profile-tab ${activeTab === "reservas" ? "active" : ""}`}
          onClick={() => setActiveTab("reservas")}
        >
          <CalendarToday /> Mis Reservas
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="profile-content">
        {activeTab === "personal" && (
          <Card className="profile-card">
            <CardContent>
              <div className="profile-card-header">
                <Typography variant="h5" className="profile-card-title">
                  Información Personal
                </Typography>
                <Button
                  variant={editing ? "outlined" : "contained"}
                  color={editing ? "default" : "primary"}
                  startIcon={editing ? <Close /> : <Edit />}
                  onClick={() => setEditing(!editing)}
                  className={editing ? "usuarios-cancelButton" : "profile-edit-highlight-button"}
                >
                  {editing ? "Cancelar" : "Editar Información"}
                </Button>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Person className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Nombre Completo</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <div>
                        <TextField
                          fullWidth
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          variant="outlined"
                          placeholder="Ingrese su nombre completo (6-30 caracteres)"
                          className="profile-text-field"
                          error={!!errores.nombre}
                          helperText={errores.nombre}
                          inputProps={{
                            minLength: 6,
                            maxLength: 30,
                            pattern: "[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+",
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <Typography variant="body1">{profile?.nombre || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <AssignmentInd className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Documento</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <div>
                        <TextField
                          fullWidth
                          name="documento"
                          value={formData.documento}
                          onChange={handleChange}
                          variant="outlined"
                          placeholder="Ingrese su número de documento (6-15 dígitos)"
                          className="profile-text-field"
                          error={!!errores.documento}
                          helperText={errores.documento}
                          inputProps={{
                            minLength: 6,
                            maxLength: 15,
                            pattern: "[0-9]+",
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <Typography variant="body1">{profile?.documento || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Email className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Correo Electrónico</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <div>
                        <TextField
                          fullWidth
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          variant="outlined"
                          type="email"
                          placeholder="Ingrese su correo electrónico (6-50 caracteres)"
                          className="profile-text-field"
                          error={!!errores.email}
                          helperText={errores.email}
                          inputProps={{
                            minLength: 6,
                            maxLength: 50,
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <Typography variant="body1">{profile?.email || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Teléfono</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <div>
                        <TextField
                          fullWidth
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          variant="outlined"
                          placeholder="Ingrese su número de teléfono (7-10 dígitos)"
                          className="profile-text-field"
                          error={!!errores.telefono}
                          helperText={errores.telefono}
                          inputProps={{
                            minLength: 7,
                            maxLength: 10,
                            pattern: "[0-9]+",
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <Typography variant="body1">{profile?.telefono || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <CalendarToday className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Fecha de Registro</Typography>
                  </div>
                  <div className="profile-info-value">
                    <Typography variant="body1">{formatDate(profile?.fechaCreacion)}</Typography>
                  </div>
                </div>
              </div>

              {editing && (
                <div className="profile-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    className="profile-save-highlight-button"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="profile-card">
            <CardContent>
              <div className="profile-card-header">
                <Typography variant="h5" className="profile-card-title">
                  Seguridad y Permisos
                </Typography>
                <Chip
                  icon={<VerifiedUser />}
                  label={roleName}
                  className="profile-role-chip-large"
                  style={{ backgroundColor: `${roleColor}22`, color: roleColor, borderColor: roleColor }}
                />
              </div>

              {/* Reemplazar la sección de cambio de contraseña en el JSX con esta versión mejorada */}
              <div className="profile-password-section" style={{ marginBottom: "30px" }}>
                <Typography
                  variant="h6"
                  className="profile-section-title"
                  style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
                >
                  <VpnKey style={{ marginRight: "10px", color: roleColor }} /> Cambiar Contraseña
                </Typography>

                <div
                  className="profile-password-form"
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${roleColor}`,
                  }}
                >
                  <div style={{ marginBottom: "15px" }}>
                    <TextField
                      fullWidth
                      id="passwordActual"
                      name="passwordActual"
                      label="Contraseña Actual"
                      type={showPasswordActual ? "text" : "password"}
                      value={passwordData.passwordActual}
                      onChange={handlePasswordChange}
                      onKeyDown={handlePasswordActualKeyDown}
                      variant="outlined"
                      required
                      error={!!passwordErrors.passwordActual}
                      helperText={passwordErrors.passwordActual}
                      className="profile-text-field"
                      InputProps={{
                        endAdornment: (
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={handleTogglePasswordActual}
                            aria-label={showPasswordActual ? "Ocultar contraseña" : "Mostrar contraseña"}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            {showPasswordActual ? <VisibilityOff /> : <Visibility />}
                          </button>
                        ),
                      }}
                      inputProps={{ maxLength: 15 }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <TextField
                      fullWidth
                      id="nuevoPassword"
                      name="nuevoPassword"
                      label="Nueva Contraseña"
                      type={showNuevoPassword ? "text" : "password"}
                      value={passwordData.nuevoPassword}
                      onChange={handlePasswordChange}
                      onKeyDown={handleNuevoPasswordKeyDown}
                      variant="outlined"
                      required
                      error={!!passwordErrors.nuevoPassword}
                      helperText={
                        passwordErrors.nuevoPassword ||
                        "La contraseña debe tener entre 8-15 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales."
                      }
                      className="profile-text-field"
                      InputProps={{
                        endAdornment: (
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={handleToggleNuevoPassword}
                            aria-label={showNuevoPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            {showNuevoPassword ? <VisibilityOff /> : <Visibility />}
                          </button>
                        ),
                      }}
                      inputProps={{ minLength: 8, maxLength: 15 }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <TextField
                      fullWidth
                      id="confirmarPassword"
                      name="confirmarPassword"
                      label="Confirmar Nueva Contraseña"
                      type={showConfirmarPassword ? "text" : "password"}
                      value={passwordData.confirmarPassword}
                      onChange={handlePasswordChange}
                      onKeyDown={handleConfirmarPasswordKeyDown}
                      variant="outlined"
                      required
                      error={!!passwordErrors.confirmarPassword}
                      helperText={passwordErrors.confirmarPassword}
                      className="profile-text-field"
                      InputProps={{
                        endAdornment: (
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={handleToggleConfirmarPassword}
                            aria-label={showConfirmarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            {showConfirmarPassword ? <VisibilityOff /> : <Visibility />}
                          </button>
                        ),
                      }}
                      inputProps={{ minLength: 8, maxLength: 15 }}
                    />
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordSubmit}
                    disabled={passwordLoading}
                    style={{
                      backgroundColor: roleColor,
                      padding: "10px 20px",
                      fontWeight: "bold",
                    }}
                  >
                    {passwordLoading ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "Actualizar Contraseña"
                    )}
                  </Button>
                </div>
              </div>

              <Divider style={{ margin: "30px 0" }} />

              {roleDetails && (
                <div className="profile-role-description">
                  <Typography variant="body1">
                    <strong>Descripción del Rol:</strong> {roleDetails.descripcion || "Sin descripción"}
                  </Typography>
                </div>
              )}

              <div className="profile-permissions-container">
                <Typography variant="h6" className="profile-permissions-title">
                  <Lock className="profile-permissions-icon" /> Permisos Asignados
                </Typography>

                <div className="profile-permissions-list">
                  {(roleDetails?.permisos || profile?.permisos || []).length > 0 ? (
                    <div className="profile-permissions-grid">
                      {typeof (roleDetails?.permisos || profile?.permisos || [])[0] === "string"
                        ? // Mostrar permisos simples (strings)
                          (roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                            <Chip
                              key={index}
                              icon={<Visibility />}
                              label={permiso}
                              className="profile-permission-chip"
                            />
                          ))
                        : // Mostrar permisos complejos (objetos)
                          (roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                            <div key={index} className="profile-permission-module">
                              <Typography variant="subtitle2" className="profile-permission-module-name">
                                <Work className="profile-permission-module-icon" /> {permiso.modulo}
                              </Typography>
                              <div className="profile-permission-actions">
                                {permiso.acciones &&
                                  Object.entries(permiso.acciones)
                                    .filter(([_, value]) => value)
                                    .map(([key, _], idx) => (
                                      <Chip
                                        key={idx}
                                        label={key}
                                        size="small"
                                        className="profile-permission-action-chip"
                                      />
                                    ))}
                              </div>
                            </div>
                          ))}
                    </div>
                  ) : (
                    <Typography variant="body2" className="profile-no-permissions">
                      No hay permisos asignados para este usuario.
                    </Typography>
                  )}
                </div>
              </div>

              <div className="profile-security-info">
                <div className="profile-security-item">
                  <AccessTime className="profile-security-icon" />
                  <div>
                    <Typography variant="subtitle2">Último Acceso</Typography>
                    <Typography variant="body2">{formatDate(profile?.ultimoAcceso)}</Typography>
                  </div>
                </div>
                <div className="profile-security-item">
                  <CalendarToday className="profile-security-icon" />
                  <div>
                    <Typography variant="subtitle2">Cuenta Creada</Typography>
                    <Typography variant="body2">{formatDate(profile?.fechaCreacion)}</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Añadir esta nueva sección */}
        {activeTab === "reservas" && <MisReservas />}
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        className="profile-notification"
      >
        <Alert
          severity={notification.severity}
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseNotification}>
              <Close fontSize="small" />
            </IconButton>
          }
          className="profile-alert"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UserProfile
