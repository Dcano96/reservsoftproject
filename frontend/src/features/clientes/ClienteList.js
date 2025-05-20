"use client"

import { useState, useEffect, useRef } from "react"
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Avatar,
  InputAdornment,
  Typography,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Switch,
  Grid,
} from "@material-ui/core"
// Cambiar la importación de iconos para usar Delete en lugar de Trash2
import { Search, UserPlus, Edit, Delete, Info, X, User, FileText, Phone, Mail, Key, Check } from "lucide-react"
import Swal from "sweetalert2"
import clienteService from "./clientes.service"
import "./clientes.styles.css"
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

// Modificar el StyledTableCell para que tenga un fondo azul sólido sin gradiente
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#2563EB", // Azul sólido como en la imagen
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.9rem",
    padding: theme.spacing(2),
    textAlign: "center",
    letterSpacing: "0.8px",
    borderBottom: "none",
    boxShadow: "none", // Quitar sombra
    borderRight: "none",
  },
  body: {
    fontSize: "0.95rem",
    textAlign: "center",
    padding: theme.spacing(1.8),
  },
}))(TableCell)

// Primero, añadir un nuevo componente TableCell personalizado para alinear a la izquierda
// Después de la definición de StyledTableCell, añadir:

// Personalización de la celda de cliente (alineada a la izquierda)
const ClienteTableCell = withStyles((theme) => ({
  body: {
    fontSize: "0.95rem",
    textAlign: "left",
    padding: theme.spacing(1.8),
    color: "#334155",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
}))(TableCell)

// Estilos mejorados para la tabla
const useStyles = makeStyles((theme) => ({
  container: {
    fontFamily: '"Inter", "Montserrat", sans-serif',
    marginTop: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
    width: "100%", // Make container wider
    maxWidth: "100%", // Cambiar de 1200px a 100% para ocupar todo el ancho
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
    width: "100%", // Make table wider
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
  tableHead: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    "& th": {
      borderRight: "none",
      borderLeft: "none",
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
    transition: "transform 0.3s",
    borderRadius: "50%",
    padding: theme.spacing(1),
    width: 36,
    height: 36,
    minWidth: 36,
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  btnEdit: {
    backgroundColor: "#10b981",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#10b981",
    },
  },
  btnDelete: {
    backgroundColor: "#ef4444",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#ef4444",
    },
  },
  btnDetails: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#3b82f6",
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
  nameCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(1),
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
  // Estilos para los modales
  // Reemplazar los estilos del dialogPaper
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
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

  // Añadir los nuevos estilos para el diseño del modal
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
  clienteContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Alineación a la izquierda
    width: "100%",
  },
}))

const getInitials = (name) => {
  if (!name) return "CL"
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

const ClienteList = () => {
  const classes = useStyles()
  const [clientes, setClientes] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
    estado: true,
  })
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [fieldValidation, setFieldValidation] = useState({
    documento: false,
    nombre: false,
    telefono: false,
    email: false,
    password: false,
  })
  const [touched, setTouched] = useState({
    documento: false,
    nombre: false,
    telefono: false,
    email: false,
    password: false,
  })

  // Referencias para los campos del formulario
  const documentoRef = useRef(null)
  const nombreRef = useRef(null)
  const telefonoRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const estadoRef = useRef(null)

  const fetchClientes = async () => {
    try {
      const data = await clienteService.getClientes()
      setClientes(data)
    } catch (error) {
      console.error("Error fetching clientes", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes.",
      })
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleOpen = (cliente) => {
    // Reset form errors and validation states
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
    })
    setFieldValidation({
      documento: false,
      nombre: false,
      telefono: false,
      email: false,
      password: false,
    })
    setTouched({
      documento: false,
      nombre: false,
      telefono: false,
      email: false,
      password: false,
    })

    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        documento: cliente.documento,
        email: cliente.email,
        telefono: cliente.telefono,
        password: "", // Dejar en blanco para no cambiar la contraseña
        estado: cliente.estado,
      })
      setEditingId(cliente._id)
      // Si estamos editando, consideramos los campos existentes como válidos
      setFieldValidation({
        documento: true,
        nombre: true,
        telefono: true,
        email: true,
        password: true, // La contraseña es opcional al editar
      })
    } else {
      setFormData({
        nombre: "",
        documento: "",
        email: "",
        telefono: "",
        password: "",
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
    // Cerrar el modal sin validaciones
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

  const handleDetails = (cliente) => {
    setSelectedCliente(cliente)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
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

  // Modificar la función validarTelefono para permitir cualquier número inicial
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

    // Eliminamos la validación que requiere que los números de 10 dígitos empiecen con 3
    // y que los números de 7 dígitos no empiecen con 0

    const numerosEspeciales = ["123", "911", "112", "119"]
    if (numerosEspeciales.includes(value)) {
      return "No se permite el uso de números de emergencia"
    }

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

  // Actualizar la función validarPassword para que sea exactamente igual a la del componente register
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

    return "" // Devuelve cadena vacía en lugar de null para ser exactamente igual al registro
  }

  // Función para validar un campo específico
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
        // Usar la nueva función validarPassword con los datos del formulario
        error = validarPassword(value, formData.nombre, formData.documento, formData.email)
        // Si estamos editando y el campo está vacío, no hay error
        if (isEditing && !value) {
          error = ""
        }
        break
      default:
        break
    }

    // Actualizar el estado de errores
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    // Actualizar el estado de validación del campo
    setFieldValidation((prev) => ({
      ...prev,
      [name]: !error,
    }))

    return !error // Retorna true si no hay error
  }

  // Manejar el cambio de foco entre campos
  const handleFieldBlur = (e) => {
    const { name, value } = e.target

    // Marcar el campo como tocado
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validar el campo
    if (name === "email") {
      const error = validarEmail(value)
      setFormErrors((prev) => ({ ...prev, email: error }))
      setFieldValidation((prev) => ({ ...prev, email: !error }))
    } else if (name === "password") {
      // Si estamos editando y el campo está vacío, no validamos
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

  // Manejar la tecla Enter/Tab para navegar entre campos
  const handleKeyDown = (e, nextFieldName) => {
    const { name, value } = e.target

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()

      // Validar el campo actual
      let isValid = false

      if (name === "email") {
        const error = validarEmail(value)
        setFormErrors((prev) => ({ ...prev, email: error }))
        setFieldValidation((prev) => ({ ...prev, email: !error }))
        isValid = !error
      } else if (name === "password") {
        // Si estamos editando y el campo está vacío, es válido
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

      // Si el campo es válido, pasar al siguiente
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
          case "estado":
            estadoRef.current?.focus()
            break
          default:
            break
        }
      }
    }
  }

  // Modificar la función handleChange para asegurar que el campo de teléfono se marque como "tocado" inmediatamente
  // y que la validación se realice con cada pulsación de tecla

  // Reemplazar la función handleChange completa con esta versión:
  const handleChange = (e) => {
    const { name, value } = e.target

    // Marcar el campo como tocado tan pronto como el usuario comience a escribir
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validaciones específicas durante la escritura
    let updatedValue = value

    if (name === "nombre") {
      // Solo permitir letras y espacios
      const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
      if (!letrasRegex.test(value)) {
        // No actualizar el estado si el último carácter no es una letra o espacio
        return
      }
    } else if (name === "documento") {
      // Solo permitir números
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) {
        // No actualizar el estado si hay caracteres que no son números
        return
      }

      if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) {
        updatedValue = value.substring(0, VALIDACION.DOCUMENTO.MAX_LENGTH)
      }
    } else if (name === "telefono") {
      // Solo permitir números
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) {
        // No actualizar el estado si hay caracteres que no son números
        return
      }

      if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) {
        updatedValue = value.substring(0, VALIDACION.TELEFONO.MAX_LENGTH)
      }
    } else if (name === "email") {
      // Validación para email en tiempo real
      // Permitir solo caracteres válidos para email
      const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
      if (!emailRegex.test(value)) {
        // No actualizar si hay caracteres inválidos
        return
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
      if (formData.email.includes("@") && formData.email.includes(".")) {
        const currentParts = formData.email.split("@")
        const newParts = value.split("@")

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
    } else if (name === "password" && value.length > VALIDACION.CONTRASENA.MAX_LENGTH) {
      updatedValue = value.substring(0, VALIDACION.CONTRASENA.MAX_LENGTH)
    }

    // Actualizar el estado del formulario con el nuevo valor
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
        // Si estamos editando y el campo está vacío, no hay error
        if (isEditing && !updatedValue) {
          error = ""
        } else {
          // Usar la nueva función validarPassword con los datos del formulario
          error = validarPassword(updatedValue, formData.nombre, formData.documento, formData.email)
        }
        break
      default:
        break
    }

    // Actualizar errores y estado de validación
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    setFieldValidation((prev) => ({
      ...prev,
      [name]: !error,
    }))
  }

  // Validar todo el formulario
  const validateForm = () => {
    // Marcar todos los campos como tocados
    setTouched({
      documento: true,
      nombre: true,
      telefono: true,
      email: true,
      password: true,
    })

    // Validar todos los campos
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

    // Actualizar el estado de validación de los campos
    setFieldValidation({
      documento: !documentoError,
      nombre: !nombreError,
      telefono: !telefonoError,
      email: !emailError,
      password: editingId ? true : !passwordError, // Si estamos editando, la contraseña es opcional
    })

    // El formulario es válido si no hay errores
    return !documentoError && !nombreError && !telefonoError && !emailError && (editingId ? true : !passwordError)
  }

  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const isValid = validateForm()

    // Si hay errores, enfocar el primer campo con error
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
      }
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

        await clienteService.updateCliente(editingId, dataToSend)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El cliente se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await clienteService.createCliente(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El cliente se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchClientes()
      handleClose()
    } catch (error) {
      console.error("Error saving cliente", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.msg || "Ocurrió un error al guardar el cliente.",
      })
    }
  }

  // Función para eliminar cliente
  const handleDelete = async (id) => {
    // Primero mostramos el diálogo de confirmación
    const confirmDelete = await Swal.fire({
      title: "¿Eliminar cliente?",
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
        // Intentamos eliminar el cliente
        await clienteService.deleteCliente(id)

        // Si no hay error, mostramos mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El cliente se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })

        // Actualizamos la lista de clientes
        fetchClientes()
      } catch (error) {
        console.error("Error deleting cliente", error)

        // Mostramos el mensaje de error específico o genérico
        Swal.fire({
          icon: "error",
          title: "No se puede eliminar",
          text: error.response?.data?.msg || "Ocurrió un error al eliminar el cliente.",
          confirmButtonColor: "#2563eb",
        })
      }
    }
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedClientes = filteredClientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Clientes
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los clientes del sistema
        </Typography>
      </Box>

      <div className={classes.searchContainer}>
        <TextField
          label="Buscar cliente"
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
          >
            Nuevo Cliente
          </Button>
        </Box>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table style={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563EB" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Cliente</StyledTableCell>
              <StyledTableCell>Documento</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Teléfono</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>ACCIONES</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClientes.length > 0 ? (
              paginatedClientes.map((cliente) => (
                <TableRow key={cliente._id} className={classes.tableRow}>
                  <ClienteTableCell style={{ paddingLeft: "24px" }}>
                    <Box className={classes.clienteContainer}>
                      <Avatar className={classes.userAvatar}>{getInitials(cliente.nombre)}</Avatar>
                      <Typography variant="body2">{cliente.nombre}</Typography>
                    </Box>
                  </ClienteTableCell>
                  <TableCell>{cliente.documento}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.estado ? "Activo" : "Inactivo"}</TableCell>
                  <TableCell className={classes.actionsCell}>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(cliente)}
                        aria-label="Editar"
                      >
                        <Edit size={20} />
                      </IconButton>
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(cliente)}
                        aria-label="Ver detalles"
                      >
                        <Info size={20} />
                      </IconButton>
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleDelete(cliente._id)}
                        aria-label="Eliminar"
                      >
                        <Delete size={20} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={6} className={classes.noDataCell}>
                  {searchTerm
                    ? "No se encontraron clientes que coincidan con la búsqueda."
                    : "No hay clientes registrados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredClientes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        className={classes.pagination}
      />

      {/* Modal para crear/editar cliente */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {editingId ? "Editar Cliente" : "Nuevo Cliente"}
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <User size={20} />
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
                    <FileText size={20} className={classes.fieldIcon} />
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
                    <User size={20} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.NOMBRE.MAX_LENGTH }}
            />
          </div>

          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Phone size={20} />
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
                    <Phone size={20} className={classes.fieldIcon} />
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
              helperText={formErrors.email || MENSAJES_INSTRUCTIVOS.EMAIL}
              inputRef={emailRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 50 }}
            />
          </div>

          <div className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Key size={20} />
              Seguridad y Estado
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
              onKeyDown={(e) => handleKeyDown(e, "estado")}
              error={!!formErrors.password}
              helperText={formErrors.password || MENSAJES_INSTRUCTIVOS.PASSWORD}
              inputRef={passwordRef}
              className={classes.formField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key size={20} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: VALIDACION.CONTRASENA.MAX_LENGTH }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                  name="estado"
                  color="primary"
                  inputRef={estadoRef}
                />
              }
              label="Cliente Activo"
            />
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

      {/* Modal para ver detalles del cliente */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="details-dialog-title"
      >
        <DialogTitle id="details-dialog-title" className={classes.dialogTitle}>
          Detalles del Cliente
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleCloseDetails}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedCliente && (
            <>
              <div className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedCliente.nombre)}</Avatar>
                <Typography className={classes.detailsName}>{selectedCliente.nombre}</Typography>
                <Typography className={classes.detailsDescription}>
                  Cliente {selectedCliente.estado ? "activo" : "inactivo"} desde{" "}
                  {new Date(selectedCliente.createdAt).toLocaleDateString()}
                </Typography>
              </div>

              <Grid container spacing={2} className={classes.detailsGrid}>
                <Grid item xs={12} sm={6}>
                  <div className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <FileText size={18} />
                      Documento
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedCliente.documento}</Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Phone size={18} />
                      Teléfono
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedCliente.telefono}</Typography>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Mail size={18} />
                      Email
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedCliente.email}</Typography>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <User size={18} />
                      Estado
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedCliente.estado ? "Activo" : "Inactivo"}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
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
              handleOpen(selectedCliente)
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

export default ClienteList
