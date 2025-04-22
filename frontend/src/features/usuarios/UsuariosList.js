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
  MenuItem,
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
  Divider,
  Grid,
  Chip,
} from "@material-ui/core"
import { Edit, Delete, Info, X, Search, UserPlus } from "lucide-react"
import {
  Person,
  Email,
  Phone,
  Security,
  AssignmentInd,
  CalendarToday,
  VerifiedUser,
  VpnKey,
  AccountCircle,
  ContactMail,
  ContactPhone,
  PermIdentity, // Reemplazamos Badge por PermIdentity
} from "@material-ui/icons"
import Swal from "sweetalert2"
import usuarioService from "./usuarios.service"
import rolesService from "../roles/roles.service" // Importamos el servicio de Roles
import "./usuarios.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(1),
  },
  estadoActivo: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  estadoInactivo: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
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
    rol: "cliente", // Valor por defecto
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
      const rolesData = await rolesService.getRoles()
      setAvailableRoles(rolesData)
    } catch (error) {
      console.error("Error fetching roles", error)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchAvailableRoles()
  }, [])

  // Verificar si el usuario es el administrador (David Andres Goez Cano)
  const isAdminUser = (usuario) => {
    return usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano"
  }

  // Abrir modal para crear o editar usuario
  const handleOpen = (usuario) => {
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
    const prevValue = formData[name]
    let newValue = value

    // Aplicar restricciones según el tipo de campo
    switch (name) {
      case "nombre":
        // Solo letras y espacios, máximo 55 caracteres
        if (value.length > 55) {
          newValue = value.slice(0, 55)
        }
        // Filtrar caracteres no permitidos (solo letras y espacios)
        newValue = newValue.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, "")
        break

      case "documento":
        // Letras y números, máximo 17 caracteres
        if (value.length > 17) {
          newValue = value.slice(0, 17)
        }
        // Filtrar caracteres no permitidos (solo letras y números)
        newValue = newValue.replace(/[^A-Za-z0-9]/g, "")
        break

      case "telefono":
        // Solo números, máximo 15 caracteres
        if (value.length > 15) {
          newValue = value.slice(0, 15)
        }
        // Filtrar caracteres no permitidos (solo números)
        newValue = newValue.replace(/[^0-9]/g, "")
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

    // Actualizar el estado con el valor filtrado
    setFormData({ ...formData, [name]: newValue })

    // Determinar si estamos borrando texto (la longitud del valor está disminuyendo)
    const isDeletingText = prevValue && newValue.length < prevValue.length

    // Validar el campo que cambió, pero no mostrar alertas si:
    // 1. Es email o password, o
    // 2. Estamos borrando texto
    validateField(name, newValue, !isDeletingText && name !== "email" && name !== "password")
  }

  // Función para validar campos individuales
  const validateField = (name, value, showAlert = true) => {
    let errorMessage = ""

    switch (name) {
      case "nombre":
        // Solo letras y espacios, máximo 55 caracteres
        if (!value.trim()) {
          errorMessage = "El nombre es obligatorio"
        } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
          errorMessage = "El nombre solo debe contener letras"
        } else if (value.length > 55) {
          errorMessage = "El nombre no puede exceder los 55 caracteres"
        }
        break

      case "documento":
        // Letras y números, máximo 17 caracteres
        if (!value.trim()) {
          errorMessage = "El documento es obligatorio"
        } else if (!/^[A-Za-z0-9]+$/.test(value)) {
          errorMessage = "El documento solo debe contener letras y números"
        } else if (value.length > 17) {
          errorMessage = "El documento no puede exceder los 17 caracteres"
        }
        break

      case "email":
        // Formato de email
        if (!value.trim()) {
          errorMessage = "El email es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Formato de email inválido"
        }
        break

      case "telefono":
        // Solo números, máximo 15 caracteres
        if (!value.trim()) {
          errorMessage = "El teléfono es obligatorio"
        } else if (!/^\d+$/.test(value)) {
          errorMessage = "El teléfono solo debe contener números"
        } else if (value.length > 15) {
          errorMessage = "El teléfono no puede exceder los 15 caracteres"
        }
        break

      case "password":
        // Si estamos editando y el campo está vacío, no validamos
        if (editingId && !value) {
          break
        }

        if (!editingId && !value) {
          errorMessage = "La contraseña es obligatoria"
        } else if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
          errorMessage =
            "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
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

    // Mostrar SweetAlert2 solo si hay error y se debe mostrar la alerta
    if (errorMessage && showAlert) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: errorMessage,
        confirmButtonColor: "#2563eb",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
    }

    // Validar todo el formulario después de actualizar este campo
    setTimeout(() => {
      validateForm({
        ...formData,
        [name]: value,
      })
    }, 0)

    return !errorMessage // Retorna true si no hay error
  }

  // Agregar función para manejar el cambio de foco entre campos
  const handleFieldBlur = (e) => {
    const { name, value } = e.target
    // Al perder el foco, validamos pero solo mostramos alertas si el campo no está vacío
    // o si es un campo obligatorio
    const showAlert =
      value.trim() !== "" ||
      ["nombre", "documento", "email", "telefono"].includes(name) ||
      (name === "password" && !editingId)
    const isValidField = validateField(name, value, showAlert)

    // Si no es válido y debemos mostrar alerta, mostrarla
    if (!isValidField && showAlert) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: formErrors[name],
        confirmButtonColor: "#2563eb",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
    }
  }

  // Agregar función para manejar la tecla Tab
  const handleKeyDown = (e, nextFieldName) => {
    if (e.key === "Tab") {
      const { name, value } = e.target
      const isValidField = validateField(name, value, true)

      // No prevenimos el comportamiento por defecto, permitiendo que el Tab funcione normalmente
      // Solo mostramos la alerta si hay un error
      if (!isValidField) {
        Swal.fire({
          icon: "warning",
          title: "Campo con errores",
          text: formErrors[name] || "Este campo contiene errores. Deberá corregirlo antes de enviar el formulario.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    }
  }

  // Validar todo el formulario
  const validateForm = (data) => {
    // Si estamos editando, la contraseña puede estar vacía
    const isPasswordValid = editingId
      ? true
      : data.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)
        ? false
        : true

    const isValid =
      data.nombre.trim() !== "" &&
      /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(data.nombre) &&
      data.nombre.length <= 55 &&
      data.documento.trim() !== "" &&
      /^[A-Za-z0-9]+$/.test(data.documento) &&
      data.documento.length <= 17 &&
      data.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
      data.telefono.trim() !== "" &&
      /^\d+$/.test(data.telefono) &&
      data.telefono.length <= 15 &&
      isPasswordValid

    setIsFormValid(isValid)
  }

  // Guardar cambios (crear o actualizar)
  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const tempErrors = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      tempErrors.nombre = "El nombre es obligatorio"
    } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(formData.nombre)) {
      tempErrors.nombre = "El nombre solo debe contener letras"
    } else if (formData.nombre.length > 55) {
      tempErrors.nombre = "El nombre no puede exceder los 55 caracteres"
    }

    // Validar documento
    if (!formData.documento.trim()) {
      tempErrors.documento = "El documento es obligatorio"
    } else if (!/^[A-Za-z0-9]+$/.test(formData.documento)) {
      tempErrors.documento = "El documento solo debe contener letras y números"
    } else if (formData.documento.length > 17) {
      tempErrors.documento = "El documento no puede exceder los 17 caracteres"
    }

    // Validar email
    if (!formData.email.trim()) {
      tempErrors.email = "El email es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "Formato de email inválido"
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      tempErrors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d+$/.test(formData.telefono)) {
      tempErrors.telefono = "El teléfono solo debe contener números"
    } else if (formData.telefono.length > 15) {
      tempErrors.telefono = "El teléfono no puede exceder los 15 caracteres"
    }

    // Validar contraseña (solo si es nuevo usuario o si se está cambiando)
    if (!editingId && !formData.password) {
      tempErrors.password = "La contraseña es obligatoria"
    } else if (
      formData.password &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)
    ) {
      tempErrors.password =
        "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
    }

    // Si hay errores, mostrarlos y detener el envío
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)

      // Mostrar alerta con el primer error encontrado
      const firstError = Object.values(tempErrors)[0]
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: firstError,
        confirmButtonColor: "#2563eb",
      })

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
                <TableCell className={classes.tableCell}>
                  <Chip
                    label={usuario.estado ? "Activo" : "Inactivo"}
                    className={`${classes.estadoChip} ${
                      usuario.estado ? classes.estadoActivo : classes.estadoInactivo
                    }`}
                  />
                </TableCell>

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
              helperText={formErrors.documento}
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
              helperText={formErrors.nombre}
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
              helperText={formErrors.telefono}
              required
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ContactPhone className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Seguridad y Acceso */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Security />
              Seguridad y Acceso
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Contraseña"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "rol")}
              type="password"
              fullWidth
              variant="outlined"
              error={!!formErrors.password}
              helperText={
                !editingId
                  ? "Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
                  : "Dejar en blanco para mantener la contraseña actual"
              }
              required={!editingId}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Mostrar campos de rol y estado solo si NO es el administrador */}
            {!(editingId && isAdminUser(formData)) && (
              <>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VerifiedUser className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Seleccionar rol</MenuItem>
                  {availableRoles.length > 0 ? (
                    availableRoles.map((rol) => (
                      <MenuItem key={rol._id} value={rol.nombre}>
                        {rol.nombre}
                      </MenuItem>
                    ))
                  ) : (
                    <>
                      <MenuItem value="administrador">administrador</MenuItem>
                      <MenuItem value="recepcion">recepcion</MenuItem>
                      <MenuItem value="cliente">cliente</MenuItem>
                    </>
                  )}
                </TextField>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentInd className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className={classes.submitButton}
            disabled={!isFormValid && Object.values(formErrors).some((error) => error !== "")}
          >
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles (solo lectura) - Diseño actualizado */}
      <Dialog
        open={detailsOpen}
        onClose={(event, reason) => {
          // Solo permitir cerrar con el botón X o el botón Cerrar
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseDetails()
          }
        }}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
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
          {selectedUsuario ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedUsuario.nombre)}</Avatar>
                <Typography className={classes.detailsName}>{selectedUsuario.nombre}</Typography>
                <Chip
                  label={selectedUsuario.estado ? "Activo" : "Inactivo"}
                  className={`${classes.estadoChip} ${
                    selectedUsuario.estado ? classes.estadoActivo : classes.estadoInactivo
                  }`}
                  style={{ marginTop: "8px" }}
                />
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3} className={classes.detailsGrid}>
                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <PermIdentity />
                      Documento
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedUsuario.documento}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <VerifiedUser />
                      Rol
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedUsuario.rol || "Sin rol"}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Email />
                      Correo Electrónico
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedUsuario.email}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Phone />
                      Teléfono
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedUsuario.telefono}</Typography>
                  </Box>
                </Grid>

                {selectedUsuario.fechaCreacion && (
                  <Grid item xs={12} md={6}>
                    <Box className={classes.detailsCard}>
                      <Typography className={classes.detailsCardTitle}>
                        <CalendarToday />
                        Fecha de Creación
                      </Typography>
                      <Typography className={classes.detailsCardContent}>
                        {new Date(selectedUsuario.fechaCreacion).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {selectedUsuario.ultimoAcceso && (
                  <Grid item xs={12} md={6}>
                    <Box className={classes.detailsCard}>
                      <Typography className={classes.detailsCardTitle}>
                        <CalendarToday />
                        Último Acceso
                      </Typography>
                      <Typography className={classes.detailsCardContent}>
                        {new Date(selectedUsuario.ultimoAcceso).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <Typography variant="body1">Cargando detalles...</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedUsuario && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedUsuario)
              }}
              className={classes.submitButton}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsuarioList
