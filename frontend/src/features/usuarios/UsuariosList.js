"use client"

import { useState, useEffect, useRef } from "react"
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
import { Edit, Delete, Info, X, Search, UserPlus, Check } from "lucide-react"
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
import rolesService from "../roles/roles.service"
import "./usuarios.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

// Expresiones regulares para validaciones (IDÉNTICAS A CLIENTES)
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

// Constantes de validación (IDÉNTICAS A CLIENTES)
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

// Mensajes instructivos (IDÉNTICAS A CLIENTES)
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
    background: "#2563eb",
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
    maxWidth: "100%",
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
    justifyContent: "flex-start",
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
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "600px",
    maxWidth: "90vw",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
    fontSize: "0.95rem",
    color: "#ef4444",
    fontWeight: "500",
    marginTop: "4px",
  },
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
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#94a3b8",
    "&:hover": {
      backgroundColor: "#94a3b8",
      transform: "none",
      boxShadow: "none",
    },
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  actionButtonPlaceholder: {
    width: "40px",
    height: "40px",
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
  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
    rol: "",
    estado: true,
  })
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
    rol: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [availableRoles, setAvailableRoles] = useState([])
  const [fieldValidation, setFieldValidation] = useState({
    documento: false,
    nombre: false,
    telefono: false,
    email: false,
    password: false,
    rol: false,
  })
  const [touched, setTouched] = useState({
    documento: false,
    nombre: false,
    telefono: false,
    email: false,
    password: false,
    rol: false,
  })

  // Referencias para los campos del formulario (IGUAL QUE CLIENTES)
  const documentoRef = useRef(null)
  const nombreRef = useRef(null)
  const telefonoRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const rolRef = useRef(null)
  const estadoRef = useRef(null)

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
      setAvailableRoles([])
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchAvailableRoles()
  }, [])

  useEffect(() => {
    console.log("Available roles updated:", availableRoles)
  }, [availableRoles])

  // Verificar si el usuario es el administrador
  const isAdminUser = (usuario) => {
    return usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano"
  }

  // FUNCIONES DE VALIDACIÓN IDÉNTICAS A CLIENTES
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
    if (!em) return "El correo electrónico es obligatorio"
    if (em.trim() === "") return "El correo electrónico no puede estar vacío"

    if (!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"

    if (REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos (como @.com, @., etc.)"

    if (em.length < 6) return "El correo debe tener al menos 6 caracteres"
    if (em.length > 50) return "El correo no puede tener más de 50 caracteres"

    const [localPart, domainPart] = em.split("@")

    if (!localPart || localPart.length < 1) return "La parte local del correo no puede estar vacía"
    if (localPart.length > 64) return "La parte local del correo es demasiado larga"
    if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"

    if (!domainPart || !domainPart.includes("."))
      return "El dominio del correo debe incluir una extensión (ej: .com, .net)"

    const domainParts = domainPart.split(".")

    for (let i = 0; i < domainParts.length; i++) {
      const part = domainParts[i]
      if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
        return "El dominio del correo contiene partes inválidas"
      }
    }

    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) {
      return "La extensión del dominio no es válida o contiene caracteres no permitidos"
    }

    const dominiosNoRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
    for (const dominio of dominiosNoRecomendados) {
      if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
    }

    return ""
  }

  const validarPassword = (password, nombre = "", documento = "", email = "") => {
    if (!password) return "La contraseña es obligatoria"
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    if (password.length > 15) return "La contraseña no puede tener más de 15 caracteres"

    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula"
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula"
    if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número"
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return "La contraseña debe contener al menos un carácter especial"

    if (REGEX.SECUENCIAS_COMUNES.test(password))
      return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"

    if (REGEX.CARACTERES_REPETIDOS.test(password))
      return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"

    if (/qwert|asdfg|zxcvb|12345|09876/.test(password.toLowerCase()))
      return "La contraseña no puede contener secuencias de teclado"

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

  const validarRol = (value) => {
    if (!value || value.trim() === "") {
      return "Debe seleccionar un rol para el usuario"
    }
    return ""
  }

  // Función para validar un campo específico (IGUAL QUE CLIENTES)
  const validateField = (name, value) => {
    let error = ""
    const isEditing = !!editingId

    switch (name) {
      case "documento":
        error = validarDocumento(value)
        break
      case "nombre":
        error = validarNombre(value)
        break
      case "telefono":
        error = validarTelefono(value)
        break
      case "email":
        error = validarEmail(value)
        break
      case "password":
        error = validarPassword(value, formData.nombre, formData.documento, formData.email)
        if (isEditing && !value) {
          error = ""
        }
        break
      case "rol":
        error = validarRol(value)
        break
      default:
        break
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    setFieldValidation((prev) => ({
      ...prev,
      [name]: !error,
    }))

    return !error
  }

  // Manejar el cambio de foco entre campos (IGUAL QUE CLIENTES)
  const handleFieldBlur = (e) => {
    const { name, value } = e.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    if (name === "email") {
      const error = validarEmail(value)
      setFormErrors((prev) => ({ ...prev, email: error }))
      setFieldValidation((prev) => ({ ...prev, email: !error }))
    } else if (name === "password") {
      if (editingId && !value) {
        setFormErrors((prev) => ({ ...prev, password: "" }))
        setFieldValidation((prev) => ({ ...prev, password: true }))
      } else {
        const error = validarPassword(value, formData.nombre, formData.documento, formData.email)
        setFormErrors((prev) => ({ ...prev, password: error }))
        setFieldValidation((prev) => ({ ...prev, password: !error }))
      }
    } else {
      validateField(name, value)
    }
  }

  // Manejar la tecla Enter/Tab para navegar entre campos (IGUAL QUE CLIENTES)
  const handleKeyDown = (e, nextFieldName) => {
    const { name, value } = e.target

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()

      let isValid = false

      if (name === "email") {
        const error = validarEmail(value)
        setFormErrors((prev) => ({ ...prev, email: error }))
        setFieldValidation((prev) => ({ ...prev, email: !error }))
        isValid = !error
      } else if (name === "password") {
        if (editingId && !value) {
          setFormErrors((prev) => ({ ...prev, password: "" }))
          setFieldValidation((prev) => ({ ...prev, password: true }))
          isValid = true
        } else {
          const error = validarPassword(value, formData.nombre, formData.documento, formData.email)
          setFormErrors((prev) => ({ ...prev, password: error }))
          setFieldValidation((prev) => ({ ...prev, password: !error }))
          isValid = !error
        }
      } else {
        isValid = validateField(name, value)
      }

      if (isValid && nextFieldName) {
        switch (nextFieldName) {
          case "nombre":
            nombreRef.current?.focus()
            break
          case "telefono":
            telefonoRef.current?.focus()
            break
          case "email":
            emailRef.current?.focus()
            break
          case "password":
            passwordRef.current?.focus()
            break
          case "rol":
            rolRef.current?.focus()
            break
          case "estado":
            estadoRef.current?.focus()
            break
          default:
            break
        }
      }
    }
  }

  // Función handleChange con validaciones en tiempo real (IGUAL QUE CLIENTES)
  const handleChange = (e) => {
    const { name, value } = e.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    let updatedValue = value

    if (name === "nombre") {
      const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
      if (!letrasRegex.test(value)) {
        return
      }
    } else if (name === "documento") {
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) {
        return
      }

      if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) {
        updatedValue = value.substring(0, VALIDACION.DOCUMENTO.MAX_LENGTH)
      }
    } else if (name === "telefono") {
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) {
        return
      }

      if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) {
        updatedValue = value.substring(0, VALIDACION.TELEFONO.MAX_LENGTH)
      }
    } else if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
      if (!emailRegex.test(value)) {
        return
      }

      if (value.includes("@@") || value.includes("..") || value.includes(".@") || value.includes("@.")) {
        return
      }

      const atCount = (value.match(/@/g) || []).length
      if (atCount > 1) {
        return
      }

      if (formData.email.includes("@") && formData.email.includes(".")) {
        const currentParts = formData.email.split("@")
        const newParts = value.split("@")

        if (currentParts.length > 1 && newParts.length > 1) {
          const currentDomain = currentParts[1]
          const newDomain = newParts[1]

          const completeTLDs = [".com", ".net", ".org", ".edu", ".gov", ".mil", ".int"]

          const hasTLDComplete = completeTLDs.some((tld) => currentDomain.endsWith(tld))

          if (hasTLDComplete && newDomain.length > currentDomain.length) {
            return
          }
        }
      }
    } else if (name === "password" && value.length > VALIDACION.CONTRASENA.MAX_LENGTH) {
      updatedValue = value.substring(0, VALIDACION.CONTRASENA.MAX_LENGTH)
    }

    // Si estamos editando al administrador y se intenta cambiar el email, no permitirlo
    if (editingId && isAdminUser(formData) && name === "email" && updatedValue !== formData.email) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede modificar el correo electrónico del usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    // Si estamos editando al administrador, no permitir cambiar el estado a inactivo
    if (editingId && isAdminUser(formData) && name === "estado" && updatedValue === false) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No se puede desactivar al usuario administrador",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }))

    // Validar todos los campos en tiempo real
    let error = ""
    const isEditing = !!editingId

    switch (name) {
      case "documento":
        error = validarDocumento(updatedValue)
        break
      case "nombre":
        error = validarNombre(updatedValue)
        break
      case "telefono":
        error = validarTelefono(updatedValue)
        break
      case "email":
        error = validarEmail(updatedValue)
        break
      case "password":
        if (isEditing && !updatedValue) {
          error = ""
        } else {
          error = validarPassword(updatedValue, formData.nombre, formData.documento, formData.email)
        }
        break
      case "rol":
        error = validarRol(updatedValue)
        break
      default:
        break
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    setFieldValidation((prev) => ({
      ...prev,
      [name]: !error,
    }))
  }

  // Validar todo el formulario (IGUAL QUE CLIENTES)
  const validateForm = () => {
    setTouched({
      documento: true,
      nombre: true,
      telefono: true,
      email: true,
      password: true,
      rol: true,
    })

    const documentoError = validarDocumento(formData.documento)
    const nombreError = validarNombre(formData.nombre)
    const telefonoError = validarTelefono(formData.telefono)
    const emailError = validarEmail(formData.email)

    let passwordError = ""
    if (!(editingId && !formData.password)) {
      passwordError = validarPassword(formData.password, formData.nombre, formData.documento, formData.email)
    }

    const rolError = validarRol(formData.rol)

    setFormErrors({
      documento: documentoError,
      nombre: nombreError,
      telefono: telefonoError,
      email: emailError,
      password: passwordError,
      rol: rolError,
    })

    setFieldValidation({
      documento: !documentoError,
      nombre: !nombreError,
      telefono: !telefonoError,
      email: !emailError,
      password: editingId ? true : !passwordError,
      rol: !rolError,
    })

    return (
      !documentoError &&
      !nombreError &&
      !telefonoError &&
      !emailError &&
      (editingId ? true : !passwordError) &&
      !rolError
    )
  }

  // Abrir modal para crear o editar usuario (ACTUALIZADO CON VALIDACIONES)
  const handleOpen = (usuario) => {
    // Reset form errors and validation states (IGUAL QUE CLIENTES)
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
      rol: "",
    })
    setFieldValidation({
      documento: false,
      nombre: false,
      telefono: false,
      email: false,
      password: false,
      rol: false,
    })
    setTouched({
      documento: false,
      nombre: false,
      telefono: false,
      email: false,
      password: false,
      rol: false,
    })

    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        documento: usuario.documento,
        email: usuario.email,
        telefono: usuario.telefono,
        password: "",
        rol: usuario.rol,
        estado: usuario.estado,
      })
      setEditingId(usuario._id)
      // Si estamos editando, consideramos los campos existentes como válidos
      setFieldValidation({
        documento: true,
        nombre: true,
        telefono: true,
        email: true,
        password: true,
        rol: true,
      })
    } else {
      setFormData({
        nombre: "",
        documento: "",
        email: "",
        telefono: "",
        password: "",
        rol: "",
        estado: true,
      })
      setEditingId(null)
    }
    setOpen(true)

    // Enfocar el primer campo después de que el modal se abra
    setTimeout(() => {
      if (documentoRef.current) {
        documentoRef.current.focus()
      }
    }, 100)
  }

  const handleClose = () => {
    setOpen(false)
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
      rol: "",
    })
  }

  const handleDetails = (usuario) => {
    setSelectedUsuario(usuario)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  // Guardar cambios (ACTUALIZADO CON VALIDACIONES)
  const handleSubmit = async () => {
    const isValid = validateForm()

    if (!isValid) {
      if (!fieldValidation.documento) {
        documentoRef.current?.focus()
      } else if (!fieldValidation.nombre) {
        nombreRef.current?.focus()
      } else if (!fieldValidation.telefono) {
        telefonoRef.current?.focus()
      } else if (!fieldValidation.email) {
        emailRef.current?.focus()
      } else if (!fieldValidation.password && !editingId) {
        passwordRef.current?.focus()
      } else if (!fieldValidation.rol) {
        rolRef.current?.focus()
      }
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

    try {
      if (editingId) {
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
        const dataToSend = { ...formData, estado: true }
        await usuarioService.createUsuario(dataToSend)
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
          title: "No se puede eliminar",
          text: error.response?.data?.msg || "Ocurrió un error al eliminar el usuario.",
          confirmButtonColor: "#2563eb",
        })
      }
    }
  }

  // Quitar el rol de un usuario
  const handleRemoveRole = async (id) => {
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
                <TableCell className={classes.tableCell}>{usuario.rol || "No asignado"}</TableCell>
                <TableCell className={classes.tableCell}>{usuario.estado ? "Activo" : "Inactivo"}</TableCell>

                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box className={classes.actionsContainer}>
                    <Tooltip title="Editar usuario">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(usuario)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(usuario)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>

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

      {/* Modal para crear/editar usuario - CON VALIDACIONES COMPLETAS */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {editingId ? "Editar Usuario" : "Nuevo Usuario"}
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <AccountCircle />
              Información Personal
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="documento"
              name="documento"
              label="Documento"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.documento}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "nombre")}
              error={!!formErrors.documento}
              helperText={formErrors.documento || MENSAJES_INSTRUCTIVOS.DOCUMENTO}
              inputRef={documentoRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PermIdentity className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.DOCUMENTO.MAX_LENGTH }}
            />
            <TextField
              margin="dense"
              id="nombre"
              name="nombre"
              label="Nombre Completo"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "telefono")}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre || MENSAJES_INSTRUCTIVOS.NOMBRE}
              inputRef={nombreRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.NOMBRE.MAX_LENGTH }}
            />
          </div>

          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <ContactMail />
              Información de Contacto
            </Typography>
            <TextField
              margin="dense"
              id="telefono"
              name="telefono"
              label="Teléfono"
              type="tel"
              fullWidth
              variant="outlined"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "email")}
              error={!!formErrors.telefono}
              helperText={formErrors.telefono || MENSAJES_INSTRUCTIVOS.TELEFONO}
              inputRef={telefonoRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.TELEFONO.MAX_LENGTH }}
            />
            <TextField
              margin="dense"
              id="email"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "password")}
              error={!!formErrors.email}
              helperText={
                formErrors.email ||
                MENSAJES_INSTRUCTIVOS.EMAIL ||
                (editingId && isAdminUser(formData) ? "El email del administrador no se puede modificar" : "")
              }
              inputRef={emailRef}
              className={classes.formField}
              disabled={editingId && isAdminUser(formData)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 50 }}
            />
          </div>

          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <VpnKey />
              Seguridad y Rol
            </Typography>
            <TextField
              margin="dense"
              id="password"
              name="password"
              label={editingId ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "rol")}
              error={!!formErrors.password}
              helperText={formErrors.password || MENSAJES_INSTRUCTIVOS.PASSWORD}
              inputRef={passwordRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.CONTRASENA.MAX_LENGTH }}
            />
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "estado")}
              fullWidth
              variant="outlined"
              disabled={editingId && isAdminUser(formData)}
              inputRef={rolRef}
              error={!!formErrors.rol}
              helperText={
                formErrors.rol ||
                (availableRoles.length > 0
                  ? editingId
                    ? `Rol obligatorio. ${availableRoles.length} roles disponibles: ${availableRoles.map((r) => r.nombre).join(", ")}`
                    : `Rol obligatorio. El usuario se creará como activo por defecto. ${availableRoles.length} roles disponibles: ${availableRoles.map((r) => r.nombre).join(", ")}`
                  : "Cargando roles...")
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentInd className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              {availableRoles.length > 0 ? (
                availableRoles.map((rol) => (
                  <MenuItem key={rol._id} value={rol.nombre}>
                    {rol.nombre}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No hay roles disponibles
                </MenuItem>
              )}
            </TextField>

            {/* Campo de estado (activo/inactivo) - SOLO EN MODO EDICIÓN */}
            {editingId && (
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
                disabled={editingId && isAdminUser(formData)}
                inputRef={estadoRef}
                helperText={
                  editingId && isAdminUser(formData) ? "El estado del administrador no se puede modificar" : ""
                }
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </TextField>
            )}
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className={classes.submitButton} startIcon={<Check size={18} />}>
            {editingId ? "Actualizar" : "Guardar"}
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
            startIcon={<Edit size={18} />}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsuarioList
