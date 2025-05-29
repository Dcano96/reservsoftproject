"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  TablePagination,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  Chip,
  MenuItem,
} from "@material-ui/core"
import { Edit, Delete, Info, X, Search, UserPlus } from "lucide-react"
import {
  Person,
  Email,
  AssignmentInd,
  AccountCircle,
  ContactMail,
  PermIdentity,
  VpnKey,
  Phone,
} from "@material-ui/icons"
import Swal from "sweetalert2"
import usuarioService from "./usuarios.service"
import rolesService from "../roles/roles.service" // Importamos el servicio de Roles
import "./usuarios.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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

// Actualizar las constantes de validación para que coincidan con el controlador
const VALIDACION = {
  DOCUMENTO: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 15,
  },
  NOMBRE: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 30,
  },
  TELEFONO: {
    MIN_LENGTH: 7,
    MAX_LENGTH: 10,
  },
  CONTRASENA: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 15,
  },
}

// Añadir mensajes instructivos para cada campo
const MENSAJES_INSTRUCTIVOS = {
  DOCUMENTO: "Ingrese un número de documento entre 6 y 15 dígitos, solo números.",
  NOMBRE: "Ingrese nombre completo entre 6 y 30 caracteres, solo letras y espacios.",
  TELEFONO: "Ingrese un número telefónico entre 7 y 10 dígitos, solo números.",
  EMAIL: "Ingresa tu email (formato: usuario@dominio.com)",
  PASSWORD:
    "La contraseña debe tener entre 8 y 15 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.",
}

// Personalización de las celdas del encabezado
const StyledTableCell = withStyles((theme) => ({
  head: {
    background: "#2563eb", // Cambio a un azul sólido como en la imagen
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.9rem",
    padding: theme.spacing(2),
    textAlign: "center",
    letterSpacing: "0.8px",
    borderBottom: "none",
    boxShadow: "0 4px 6px rgba(37, 99, 235, 0.1)",
  },
  body: {
    fontSize: "0.95rem",
    textAlign: "center",
    padding: theme.spacing(1.8),
  },
}))(TableCell)

// Personalización de la celda de usuario (alineada a la izquierda)
const UserTableCell = withStyles((theme) => ({
  body: {
    fontSize: "0.95rem",
    textAlign: "left",
    padding: theme.spacing(1.8),
    color: "#334155",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
}))(TableCell)

const useStyles = makeStyles((theme) => ({
  container: {
    fontFamily: '"Inter", "Montserrat", sans-serif',
    marginTop: theme.spacing(0),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%", // Changed from 1200px to 100%
  },
  pageHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-10px",
      width: "80px",
      height: "4px",
      background: "linear-gradient(to right, #2563eb, #1d4ed8)",
      borderRadius: "2px",
    },
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(1),
    textAlign: "center",
    background: "linear-gradient(to right, #2563eb, #1d4ed8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    textAlign: "center",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  searchField: {
    background: "#fff",
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1),
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: "2px",
      },
    },
  },
  addButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
      boxShadow: "0 6px 15px rgba(37, 99, 235, 0.4)",
      transform: "translateY(-2px)",
    },
  },
  tableContainer: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1.5),
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    background: "#fff",
    width: "100%",
  },
  tableRow: {
    transition: "all 0.3s ease",
    "&:nth-of-type(odd)": {
      backgroundColor: "rgba(243, 244, 246, 0.5)",
    },
    "&:hover": {
      background: "rgba(37, 99, 235, 0.08)",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
    },
  },
  tableCell: {
    textAlign: "center",
    padding: theme.spacing(1.8),
    fontSize: "0.95rem",
    color: "#334155",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
  actionsCell: {
    minWidth: 150,
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
    transition: "transform 0.3s, box-shadow 0.3s",
    borderRadius: "50%",
    padding: theme.spacing(1),
    "&:hover": {
      transform: "scale(1.15)",
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.2)",
    },
  },
  btnEdit: {
    backgroundColor: "#10b981",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#059669",
    },
  },
  btnDelete: {
    backgroundColor: "#ef4444",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },
  btnDetails: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },
  btnRemoveRole: {
    backgroundColor: "#f59e0b",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#d97706",
    },
  },
  userAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  userContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Alineación a la izquierda
    width: "100%",
  },
  pagination: {
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
    "& .MuiTablePagination-toolbar": {
      padding: theme.spacing(1.5),
    },
    "& .MuiTablePagination-selectRoot": {
      marginRight: theme.spacing(2),
    },
  },
  noDataRow: {
    height: "200px",
  },
  noDataCell: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
    fontSize: "1.1rem",
  },
  // Estilos actualizados para el modal
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "600px", // Haciendo el modal más grande
    maxWidth: "90vw",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)", // Mantener el azul como solicitado
    color: "#fff",
    padding: theme.spacing(2.5, 3),
    fontSize: "1.4rem",
    fontWeight: 600,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
  },
  dialogContent: {
    padding: theme.spacing(4, 3, 3, 3),
    backgroundColor: "#fff",
    "& .MuiTextField-root": {
      marginBottom: theme.spacing(2.5),
    },
  },
  dialogActions: {
    padding: theme.spacing(2, 3, 3),
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    borderTop: "1px solid #e2e8f0",
  },
  cancelButton: {
    color: "#64748b",
    fontWeight: 500,
    padding: "8px 24px",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 500,
    padding: "8px 24px",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    },
  },
  detailsLabel: {
    fontWeight: 600,
    color: "#1e293b",
    marginRight: theme.spacing(1),
  },
  detailsValue: {
    color: "#334155",
  },
  detailsRow: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  errorMessage: {
    fontSize: "0.95rem", // Tamaño más grande para los mensajes de error
    color: "#ef4444",
    fontWeight: "500",
    marginTop: "4px",
  },
  // Nuevos estilos para el diseño del modal
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#2563eb",
    },
  },
  formField: {
    marginBottom: theme.spacing(2.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1),
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#64748b",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#2563eb",
    },
  },
  fieldIcon: {
    color: "#64748b",
  },
  // Estilos para el modal de detalles
  detailsHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    fontSize: 32,
    backgroundColor: "#2563eb",
    marginBottom: theme.spacing(2),
  },
  detailsName: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(0.5),
  },
  detailsDescription: {
    fontSize: "1rem",
    color: "#64748b",
    textAlign: "center",
    maxWidth: "80%",
    margin: "0 auto",
  },
  detailsGrid: {
    marginTop: theme.spacing(3),
  },
  detailsCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
  },
  detailsCardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#2563eb",
    },
  },
  detailsCardContent: {
    fontSize: "0.95rem",
    color: "#334155",
  },
  // Estilos para los estados
  estadoChip: {
    fontWeight: 600,
    padding: theme.spacing(0.5, 0),
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  estadoActivo: {
    color: "#10b981",
  },
  estadoInactivo: {
    color: "#ef4444",
  },
  // Estilo para botones deshabilitados
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#94a3b8",
    "&:hover": {
      backgroundColor: "#94a3b8",
      transform: "none",
      boxShadow: "none",
    },
  },
  // Nuevo estilo para alinear las acciones
  actionsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  actionButtonPlaceholder: {
    width: "40px", // Ancho aproximado de un botón
    height: "40px", // Alto aproximado de un botón
    visibility: "hidden",
  },
}))

const UsuarioList = () => {
  const classes = useStyles()
  const [usuarios, setUsuarios] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [editingId, setEditingId] = useState(null)
  // Campos: nombre, documento, email, teléfono, password y rol
  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
    rol: "", // Cambiado de "cliente" a cadena vacía para que no asuma ningún rol por defecto
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [availableRoles, setAvailableRoles] = useState([])
  // Estados para validación de formulario
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)
  // Estado para controlar si se debe validar el formulario
  const [shouldValidate, setShouldValidate] = useState(false)

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.getUsuarios()
      setUsuarios(data)
    } catch (error) {
      console.error("Error fetching usuarios", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
      })
    }
  }

  // Cargar lista de roles desde rolesService
  const fetchAvailableRoles = async () => {
    try {
      console.log("Cargando roles disponibles...")
      const rolesData = await rolesService.getRoles()
      console.log("Respuesta del servicio de roles:", rolesData)

      // Verificar si rolesData es un array válido
      if (Array.isArray(rolesData) && rolesData.length > 0) {
        console.log("Roles válidos encontrados:", rolesData)
        setAvailableRoles(rolesData)
      } else {
        console.warn("No se encontraron roles válidos en la respuesta:", rolesData)
        setAvailableRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      console.error("Detalles del error:", error.response?.data || error.message)
      // En caso de error, establecer array vacío en lugar de roles hardcodeados
      setAvailableRoles([])
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchAvailableRoles()
  }, [])

  // Agregar este useEffect después del existente
  useEffect(() => {
    console.log("Available roles updated:", availableRoles)
  }, [availableRoles])

  // Verificar si el usuario es el administrador (David Andres Goez Cano)
  const isAdminUser = (usuario) => {
    return usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano"
  }

  // Abrir modal para crear o editar usuario
  const handleOpen = (usuario) => {
    // Activar validación cuando se abre el formulario para crear/editar
    setShouldValidate(true)

    // Limpiar errores previos
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
    })

    if (usuario) {
      const userData = {
        nombre: usuario.nombre,
        documento: usuario.documento,
        email: usuario.email,
        telefono: usuario.telefono,
        password: "", // Dejar en blanco para no cambiar la contraseña
        rol: usuario.rol,
        estado: usuario.estado,
      }
      setFormData(userData)
      setEditingId(usuario._id)
      // Al editar, el formulario es válido inicialmente
      setIsFormValid(true)
    } else {
      const newUserData = {
        nombre: "",
        documento: "",
        email: "",
        telefono: "",
        password: "",
        rol: "", // Cambiado a cadena vacía para que no asuma ningún rol por defecto
        estado: true,
      }
      setFormData(newUserData)
      setEditingId(null)
      // Al crear, el formulario no es válido inicialmente
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => {
    // Desactivar validación al cerrar el formulario
    setShouldValidate(false)

    setOpen(false)
    // Limpiar errores al cerrar
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
    })
  }

  // Abrir modal de detalles
  const handleDetails = (usuario) => {
    setSelectedUsuario(usuario)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  // Modificar la función handleChange para que no permita escribir más caracteres de los permitidos
  // y solo permita los caracteres válidos según el tipo de campo

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    // Aplicar restricciones según el tipo de campo
    switch (name) {
      case "nombre":
        // Solo letras y espacios
        const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
        if (!letrasRegex.test(value)) {
          // No actualizar el estado si el último carácter no es una letra o espacio
          return
        }
        break

      case "documento":
        // Solo números
        const numerosRegex = /^[0-9]*$/
        if (!numerosRegex.test(value)) {
          // No actualizar el estado si hay caracteres que no son números
          return
        }

        if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) {
          newValue = value.substring(0, VALIDACION.DOCUMENTO.MAX_LENGTH)
        }
        break

      case "telefono":
        // Solo números
        const telefonoRegex = /^[0-9]*$/
        if (!telefonoRegex.test(value)) {
          // No actualizar el estado si hay caracteres que no son números
          return
        }

        if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) {
          newValue = value.substring(0, VALIDACION.TELEFONO.MAX_LENGTH)
        }
        break

      default:
        break
    }

    // Si estamos editando al administrador y se intenta cambiar el email, no permitirlo
    if (editingId && isAdminUser(formData) && name === "email" && newValue !== formData.email) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede modificar el correo electrónico del usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Si estamos editando al administrador, no permitir cambiar el estado a inactivo
    if (editingId && isAdminUser(formData) && name === "estado" && newValue === false) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede desactivar al usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Actualizar el estado con el valor filtrado (SIN VALIDAR)
    setFormData({ ...formData, [name]: newValue })
  }

  // Función para validar campos individuales
  const validateField = (name, value, showAlert = false) => {
    // Si no se debe validar, retornar true sin hacer nada
    if (!shouldValidate) return true

    let errorMessage = ""

    switch (name) {
      case "documento":
        errorMessage = validarDocumento(value)
        break
      case "nombre":
        errorMessage = validarNombre(value)
        break
      case "telefono":
        errorMessage = validarTelefono(value)
        break
      case "email":
        errorMessage = validarEmail(value)
        break
      case "password":
        // Si estamos editando y el campo está vacío, no validamos
        if (editingId && !value) {
          errorMessage = ""
        } else {
          errorMessage = validarPassword(value, formData.nombre, formData.documento, formData.email)
        }
        break
      default:
        break
    }

    // Actualizar el estado de errores
    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    return !errorMessage // Retorna true si no hay error
  }

  // Agregar función para manejar el cambio de foco entre campos
  const handleFieldBlur = (e) => {
    // Si no se debe validar, no hacer nada
    if (!shouldValidate) return

    const { name, value } = e.target

    let errorMessage = ""
    switch (name) {
      case "documento":
        errorMessage = validarDocumento(value)
        break
      case "nombre":
        errorMessage = validarNombre(value)
        break
      case "telefono":
        errorMessage = validarTelefono(value)
        break
      case "email":
        errorMessage = validarEmail(value)
        break
      case "password":
        // Si estamos editando y el campo está vacío, no hay error
        if (editingId && !value) {
          errorMessage = ""
        } else {
          errorMessage = validarPassword(value, formData.nombre, formData.documento, formData.email)
        }
        break
      default:
        break
    }

    // Actualizar el estado de errores SOLO para este campo
    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    // Actualizar el estado de validación del formulario
    validateForm({
      ...formData,
      [name]: value,
    })
  }

  // Agregar función para manejar la tecla Tab
  const handleKeyDown = (e, nextFieldName) => {
    // Si no se debe validar, no hacer nada
    if (!shouldValidate) return

    if (e.key === "Tab") {
      const { name, value } = e.target

      let errorMessage = ""
      switch (name) {
        case "documento":
          errorMessage = validarDocumento(value)
          break
        case "nombre":
          errorMessage = validarNombre(value)
          break
        case "telefono":
          errorMessage = validarTelefono(value)
          break
        case "email":
          errorMessage = validarEmail(value)
          break
        case "password":
          // Si estamos editando y el campo está vacío, no hay error
          if (editingId && !value) {
            errorMessage = ""
          } else {
            errorMessage = validarPassword(value, formData.nombre, formData.documento, formData.email)
          }
          break
        default:
          break
      }

      // Actualizar el estado de errores
      setFormErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }))

      // Si hay error, prevenir el Tab (pero sin mostrar SweetAlert)
      if (errorMessage) {
        e.preventDefault()
      }
    }
  }

  // Validar todo el formulario
  const validateForm = (data) => {
    const documentoError = validarDocumento(data.documento)
    const nombreError = validarNombre(data.nombre)
    const telefonoError = validarTelefono(data.telefono)
    const emailError = validarEmail(data.email)

    // Para la contraseña, si estamos editando y está vacía, no hay error
    let passwordError = ""
    if (!(editingId && !data.password)) {
      passwordError = validarPassword(data.password, data.nombre, data.documento, data.email)
    }

    // El formulario es válido si no hay errores
    const isValid =
      !documentoError && !nombreError && !telefonoError && !emailError && (editingId ? true : !passwordError)
    setIsFormValid(isValid)

    return isValid
  }

  // Guardar cambios (crear o actualizar)
  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar y mostrar errores
    const documentoError = validarDocumento(formData.documento)
    const nombreError = validarNombre(formData.nombre)
    const telefonoError = validarTelefono(formData.telefono)
    const emailError = validarEmail(formData.email)

    // Para la contraseña, si estamos editando y está vacía, no hay error
    let passwordError = ""
    if (!(editingId && !formData.password)) {
      passwordError = validarPassword(formData.password, formData.nombre, formData.documento, formData.email)
    }

    // Actualizar todos los errores
    setFormErrors({
      documento: documentoError,
      nombre: nombreError,
      telefono: telefonoError,
      email: emailError,
      password: passwordError,
    })

    // Si hay errores, no continuar
    const isValid =
      !documentoError && !nombreError && !telefonoError && !emailError && (editingId ? true : !passwordError)

    if (!isValid) {
      return
    }

    // Si estamos editando al administrador, verificar que no se esté desactivando
    if (editingId && isAdminUser(formData) && formData.estado === false) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede desactivar al usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Si estamos editando al administrador, verificar que no se esté cambiando el email
    const originalUsuario = usuarios.find((u) => u._id === editingId)
    if (editingId && isAdminUser(formData) && originalUsuario && formData.email !== originalUsuario.email) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede modificar el correo electrónico del usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Si no hay errores, continuar con el envío
    try {
      if (editingId) {
        // Si la contraseña está vacía, eliminarla del objeto para no actualizarla
        const dataToSend = { ...formData }
        if (!dataToSend.password) {
          delete dataToSend.password
        }

        await usuarioService.updateUsuario(editingId, dataToSend)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El usuario se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await usuarioService.createUsuario(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El usuario se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchUsuarios()
      handleClose()
    } catch (error) {
      console.error("Error saving usuario", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.msg || "Ocurrió un error al guardar el usuario.",
      })
    }
  }

  // Eliminar usuario
  const handleDelete = async (id) => {
    // Verificar si es el usuario administrador
    const usuarioToDelete = usuarios.find((u) => u._id === id)
    if (usuarioToDelete && isAdminUser(usuarioToDelete)) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede eliminar al usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Verificar si el usuario tiene un rol asignado
    if (usuarioToDelete && usuarioToDelete.rol && usuarioToDelete.rol !== "") {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "Debe quitar el rol del usuario antes de eliminarlo",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    const confirmDelete = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })

    if (confirmDelete.isConfirmed) {
      try {
        await usuarioService.deleteUsuario(id)
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El usuario se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchUsuarios()
      } catch (error) {
        console.error("Error deleting usuario", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.msg || "Ocurrió un error al eliminar el usuario.",
        })
      }
    }
  }

  // Añadir una nueva función para quitar el rol de un usuario
  const handleRemoveRole = async (id) => {
    // Verificar si es el usuario administrador
    const usuarioToUpdate = usuarios.find((u) => u._id === id)
    if (usuarioToUpdate && isAdminUser(usuarioToUpdate)) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede quitar el rol al usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    const confirmRemove = await Swal.fire({
      title: "¿Quitar rol?",
      text: "¿Está seguro que desea quitar el rol asignado a este usuario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar rol",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })

    if (confirmRemove.isConfirmed) {
      try {
        // Actualizar el usuario quitando el rol
        await usuarioService.updateUsuario(id, { rol: "" })
        Swal.fire({
          icon: "success",
          title: "Rol eliminado",
          text: "El rol del usuario ha sido eliminado correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchUsuarios()
      } catch (error) {
        console.error("Error removing role", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.msg || "Ocurrió un error al quitar el rol del usuario.",
        })
      }
    }
  }

  // Filtro de búsqueda
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefono.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Funciones de validación mejoradas
  const validarDocumento = (value) => {
    if (!value) {
      return "El documento es obligatorio"
    }
    if (value.trim() === "") {
      return "El documento no puede estar vacío"
    }
    if (!REGEX.SOLO_NUMEROS.test(value)) {
      return "El documento debe contener solo números"
    }
    if (value.length < VALIDACION.DOCUMENTO.MIN_LENGTH) {
      return `El documento debe tener al menos ${VALIDACION.DOCUMENTO.MIN_LENGTH} dígitos`
    }
    if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) {
      return `El documento no puede tener más de ${VALIDACION.DOCUMENTO.MAX_LENGTH} dígitos`
    }
    if (REGEX.CARACTERES_REPETIDOS.test(value)) {
      return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
    }
    if (REGEX.SECUENCIAS_NUMERICAS.test(value)) {
      return "El documento no puede contener secuencias numéricas obvias"
    }
    if (/^0+$/.test(value)) {
      return "El documento no puede contener solo ceros"
    }
    if (Number.parseInt(value) < 1000) {
      return "El documento no parece válido (valor muy bajo)"
    }
    return ""
  }

  const validarNombre = (value) => {
    if (!value) {
      return "El nombre es obligatorio"
    }
    if (value.trim() === "") {
      return "El nombre no puede estar vacío"
    }
    if (!REGEX.SOLO_LETRAS_ESPACIOS.test(value)) {
      return "El nombre solo debe contener letras y espacios"
    }
    if (value.length < VALIDACION.NOMBRE.MIN_LENGTH) {
      return `El nombre debe tener al menos ${VALIDACION.NOMBRE.MIN_LENGTH} caracteres`
    }
    if (value.length > VALIDACION.NOMBRE.MAX_LENGTH) {
      return `El nombre no puede tener más de ${VALIDACION.NOMBRE.MAX_LENGTH} caracteres`
    }
    if (/\s{2,}/.test(value)) {
      return "El nombre no puede contener espacios múltiples consecutivos"
    }

    const palabras = value.trim().split(/\s+/)
    if (palabras.length < 2) {
      return "Debe ingresar al menos nombre y apellido"
    }

    for (const palabra of palabras) {
      if (palabra.length < 2) {
        return "Cada palabra del nombre debe tener al menos 2 caracteres"
      }
    }

    const palabrasProhibidas = ["admin", "usuario", "test", "prueba", "administrador"]
    for (const prohibida of palabrasProhibidas) {
      if (value.toLowerCase().includes(prohibida)) {
        return "El nombre contiene palabras no permitidas"
      }
    }

    return ""
  }

  const validarTelefono = (value) => {
    if (!value) {
      return "El teléfono es obligatorio"
    }
    if (value.trim() === "") {
      return "El teléfono no puede estar vacío"
    }
    if (!REGEX.SOLO_NUMEROS.test(value)) {
      return "El teléfono debe contener solo números"
    }
    if (value.length < VALIDACION.TELEFONO.MIN_LENGTH) {
      return `El teléfono debe tener al menos ${VALIDACION.TELEFONO.MIN_LENGTH} dígitos`
    }
    if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) {
      return `El teléfono no puede tener más de ${VALIDACION.TELEFONO.MAX_LENGTH} dígitos`
    }
    if (REGEX.SECUENCIAS_NUMERICAS.test(value)) {
      return "El teléfono no puede contener secuencias numéricas obvias"
    }
    if (/^0+$/.test(value)) {
      return "El teléfono no puede contener solo ceros"
    }

    const numerosEspeciales = ["123", "911", "112", "119"]
    if (numerosEspeciales.includes(value)) {
      return "No se permite el uso de números de emergencia"
    }

    return ""
  }

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

  const validarPassword = (password, nombre = "", documento = "", email = "") => {
    // Validaciones básicas
    if (!password) return "La contraseña es obligatoria"
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    if (password.length > 15) return "La contraseña no puede tener más de 15 caracteres"

    // Validación de complejidad
    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula"
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula"
    if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número"
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return "La contraseña debe contener al menos un carácter especial"

    // Validación de secuencias comunes
    if (REGEX.SECUENCIAS_COMUNES.test(password))
      return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"

    // Validación de caracteres repetidos
    if (REGEX.CARACTERES_REPETIDOS.test(password))
      return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"

    // Validación de secuencias de teclado
    if (/qwert|asdfg|zxcvb|12345|09876/.test(password.toLowerCase()))
      return "La contraseña no puede contener secuencias de teclado"

    // Validación de relación con otros campos
    if (nombre) {
      const nombreParts = nombre.toLowerCase().split(/\s+/)
      for (const part of nombreParts) {
        if (part.length > 2 && password.toLowerCase().includes(part))
          return "La contraseña no puede contener partes de tu nombre"
      }
    }

    if (documento && password.includes(documento)) return "La contraseña no puede contener tu número de documento"

    if (email) {
      const emailPart = email.split("@")[0].toLowerCase()
      if (emailPart.length > 2 && password.toLowerCase().includes(emailPart))
        return "La contraseña no puede contener partes de tu correo electrónico"
    }

    return ""
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los usuarios del sistema
        </Typography>
      </Box>

      {/* Barra de búsqueda */}
      <Box className={classes.searchContainer}>
        <TextField
          label="Buscar usuario"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#64748b" />
              </InputAdornment>
            ),
          }}
        />
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            className={classes.addButton}
            onClick={() => handleOpen(null)}
            startIcon={<UserPlus size={20} />}
            style={{ minWidth: "180px" }}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Usuario</StyledTableCell>
              <StyledTableCell>Documento</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Teléfono</StyledTableCell>
              <StyledTableCell>Rol</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((usuario) => (
              <TableRow key={usuario._id} className={classes.tableRow}>
                <UserTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.userContainer}>
                    <Avatar className={classes.userAvatar}>{getInitials(usuario.nombre)}</Avatar>
                    <Typography variant="body2">{usuario.nombre}</Typography>
                  </Box>
                </UserTableCell>
                <TableCell className={classes.tableCell}>{usuario.documento}</TableCell>
                <TableCell className={classes.tableCell}>{usuario.email}</TableCell>
                <TableCell className={classes.tableCell}>{usuario.telefono}</TableCell>
                <TableCell className={classes.tableCell}>{usuario.rol || "Sin rol"}</TableCell>
                <TableCell className={classes.tableCell}>{usuario.estado ? "Activo" : "Inactivo"}</TableCell>

                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box className={classes.actionsContainer}>
                    {/* Botón de editar - siempre visible */}
                    <Tooltip title="Editar usuario">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(usuario)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>

                    {/* Botón de detalles - siempre visible */}
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(usuario)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>

                    {/* Botón de quitar rol - visible solo para usuarios con rol que NO sean administrador */}
                    {usuario.rol && !isAdminUser(usuario) ? (
                      <Tooltip title="Quitar rol">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnRemoveRole}`}
                          onClick={() => handleRemoveRole(usuario._id)}
                        >
                          <AssignmentInd style={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <div className={classes.actionButtonPlaceholder}></div>
                    )}

                    {/* Botón de eliminar - visible solo si no tiene rol y no es administrador */}
                    {!isAdminUser(usuario) && (!usuario.rol || usuario.rol === "") ? (
                      <Tooltip title="Eliminar usuario">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDelete}`}
                          onClick={() => handleDelete(usuario._id)}
                        >
                          <Delete size={18} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <div className={classes.actionButtonPlaceholder}></div>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsuarios.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={7} className={classes.noDataCell}>
                  No se encontraron usuarios que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredUsuarios.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number.parseInt(event.target.value, 10))
          setPage(0)
        }}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar usuario - Diseño actualizado */}
      <Dialog
        open={open}
        onClose={(event, reason) => {
          // Solo permitir cerrar con el botón X o el botón Cerrar
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose()
          }
        }}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        fullWidth
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Usuario" : "Agregar Usuario"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección de Información Personal */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <AccountCircle />
              Información Personal
            </Typography>

            {/* Documento como primer campo */}
            <TextField
              className={classes.formField}
              margin="dense"
              label="Documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "nombre")}
              fullWidth
              variant="outlined"
              error={!!formErrors.documento}
              helperText={formErrors.documento || MENSAJES_INSTRUCTIVOS.DOCUMENTO}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PermIdentity className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              className={classes.formField}
              margin="dense"
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "email")}
              fullWidth
              variant="outlined"
              error={!!formErrors.nombre}
              helperText={formErrors.nombre || MENSAJES_INSTRUCTIVOS.NOMBRE}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Contacto */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <ContactMail />
              Contacto
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "telefono")}
              fullWidth
              variant="outlined"
              error={!!formErrors.email}
              helperText={
                formErrors.email ||
                MENSAJES_INSTRUCTIVOS.EMAIL ||
                (editingId && isAdminUser(formData) ? "El email del administrador no se puede modificar" : "")
              }
              required
              type="email"
              disabled={editingId && isAdminUser(formData)} // Deshabilitar el campo si es el administrador
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "password")}
              fullWidth
              variant="outlined"
              error={!!formErrors.telefono}
              helperText={formErrors.telefono || MENSAJES_INSTRUCTIVOS.TELEFONO}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Seguridad */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <VpnKey />
              Seguridad
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label={editingId ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "rol")}
              fullWidth
              variant="outlined"
              error={!!formErrors.password}
              helperText={formErrors.password || MENSAJES_INSTRUCTIVOS.PASSWORD}
              required={!editingId}
              type="password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Rol */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <AssignmentInd />
              Rol y Estado
            </Typography>
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={editingId && isAdminUser(formData)}
              helperText={
                availableRoles.length > 0
                  ? `${availableRoles.length} roles disponibles: ${availableRoles.map((r) => r.nombre).join(", ")}`
                  : "Cargando roles..."
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentInd className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              {/* Solo mostrar "Sin rol" si hay roles disponibles */}
              {availableRoles.length > 0 && <MenuItem value="">Sin rol</MenuItem>}
              {availableRoles.map((rol) => (
                <MenuItem key={rol._id} value={rol.nombre}>
                  {rol.nombre}
                </MenuItem>
              ))}
              {/* Mostrar mensaje si no hay roles */}
              {availableRoles.length === 0 && (
                <MenuItem value="" disabled>
                  No hay roles disponibles
                </MenuItem>
              )}
            </TextField>

            {/* Campo de estado (activo/inactivo) */}
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={editingId && isAdminUser(formData)} // Deshabilitar el campo si es el administrador
            >
              <MenuItem value={true}>Activo</MenuItem>
              <MenuItem value={false}>Inactivo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className={classes.submitButton}
            disabled={shouldValidate && (!isFormValid || Object.values(formErrors).some((error) => error !== ""))}
          >
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles (solo lectura) */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Usuario
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedUsuario && (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedUsuario.nombre)}</Avatar>
                <Typography className={classes.detailsName}>{selectedUsuario.nombre}</Typography>
                <Typography className={classes.detailsDescription}>
                  {selectedUsuario.rol || "Usuario sin rol asignado"}
                </Typography>
              </Box>

              <Box className={classes.detailsCard}>
                <Typography className={classes.detailsCardTitle}>
                  <PermIdentity />
                  Información Personal
                </Typography>
                <Typography className={classes.detailsCardContent}>
                  <strong>Documento:</strong> {selectedUsuario.documento}
                </Typography>
                <Typography className={classes.detailsCardContent}>
                  <strong>Estado:</strong>{" "}
                  <Chip
                    label={selectedUsuario.estado ? "Activo" : "Inactivo"}
                    className={`${classes.estadoChip} ${
                      selectedUsuario.estado ? classes.estadoActivo : classes.estadoInactivo
                    }`}
                    size="small"
                  />
                </Typography>
              </Box>

              <Box className={classes.detailsCard}>
                <Typography className={classes.detailsCardTitle}>
                  <ContactMail />
                  Contacto
                </Typography>
                <Typography className={classes.detailsCardContent}>
                  <strong>Email:</strong> {selectedUsuario.email}
                </Typography>
                <Typography className={classes.detailsCardContent}>
                  <strong>Teléfono:</strong> {selectedUsuario.telefono}
                </Typography>
              </Box>

              <Box className={classes.detailsCard}>
                <Typography className={classes.detailsCardTitle}>
                  <AssignmentInd />
                  Rol y Permisos
                </Typography>
                <Typography className={classes.detailsCardContent}>
                  <strong>Rol:</strong> {selectedUsuario.rol || "Sin rol asignado"}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          <Button
            onClick={() => {
              handleCloseDetails()
              handleOpen(selectedUsuario)
            }}
            className={classes.submitButton}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsuarioList
