"use client"

import { useState, useEffect } from "react"
import {
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
  Typography,
} from "@material-ui/core"
import { Edit, Delete, Info, X, Search, UserPlus } from "lucide-react"
// Añadir las importaciones necesarias para los iconos
import { Person, Email, Phone, Security, AssignmentInd, VpnKey, VerifiedUser } from "@material-ui/icons"
import Swal from "sweetalert2"
import clienteService from "./clientes.service"
import "./clientes.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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
  const [isValidating, setIsValidating] = useState(false)

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
    // Reset form errors
    setFormErrors({
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      password: "",
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
  }

  // Modificar la función handleClose para que siempre permita cerrar el modal
  // Reemplazar la función handleClose actual con esta versión:

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

  // Modificar la función validateField para evitar validaciones agresivas
  // Reemplazar la función validateField actual con esta versión mejorada:

  // Validación en tiempo real
  const validateField = (name, value, showAlert = false) => {
    let error = ""

    // Si estamos en modo edición, ser menos estrictos con las validaciones
    const isEditing = !!editingId

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          error = "El nombre es obligatorio"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre solo debe contener letras"
        } else if (value.length > 50) {
          error = "El nombre no puede tener más de 50 caracteres"
        }
        break

      case "documento":
        if (!value.trim()) {
          error = "El documento es obligatorio"
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = "El documento solo debe contener letras y números"
        } else if (value.length > 17) {
          error = "El documento no puede tener más de 17 caracteres"
        }
        break

      case "email":
        if (!value.trim()) {
          error = "El email es obligatorio"
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = "Formato de email inválido"
        }
        break

      case "telefono":
        if (!value.trim()) {
          error = "El teléfono es obligatorio"
        } else if (!/^\d+$/.test(value)) {
          error = "El teléfono solo debe contener números"
        }
        break

      case "password":
        // Solo validar si no está en modo edición o si se está ingresando una contraseña
        if ((!editingId || value) && value) {
          if (!/(?=.*[A-Z])/.test(value)) {
            error = "Debe contener al menos una letra mayúscula"
          } else if (!/(?=.*\d)/.test(value)) {
            error = "Debe contener al menos un número"
          } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
            error = "Debe contener al menos un carácter especial (!@#$%^&*)"
          }
        } else if (!editingId && !value) {
          error = "La contraseña es obligatoria"
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

    // Mostrar SweetAlert2 solo si hay error y se debe mostrar la alerta
    if (error && showAlert) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: error,
        confirmButtonColor: "#2563eb",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
    }

    return !error // Retorna true si no hay error
  }

  // Agregar función para manejar el cambio de foco entre campos
  // Actualizar la función handleFieldBlur para que no valide si estamos cerrando el modal:

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
  // Actualizar la función handleKeyDown para que no valide si estamos cerrando el modal:

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

  // Modificar la función handleChange para usar las nuevas funciones
  // Reemplazar la función handleChange actual con:

  const handleChange = (e) => {
    const { name, value } = e.target
    const prevValue = formData[name]

    // Validaciones específicas durante la escritura
    let updatedValue = value

    if (name === "nombre") {
      // Solo permitir letras y espacios, máximo 50 caracteres
      const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
      if (!letrasRegex.test(value)) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El nombre solo debe contener letras",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
        updatedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      }
    } else if (name === "documento") {
      // Solo permitir letras y números, máximo 17 caracteres
      const alfanumericoRegex = /^[a-zA-Z0-9]*$/
      if (!alfanumericoRegex.test(value)) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El documento solo debe contener letras y números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
        updatedValue = value.replace(/[^a-zA-Z0-9]/g, "")
      }
      if (value.length > 17) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El documento no puede tener más de 17 caracteres",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
        updatedValue = value.substring(0, 17)
      }
    } else if (name === "telefono") {
      // Solo permitir números, máximo 15 caracteres
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El teléfono solo debe contener números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
        updatedValue = value.replace(/[^0-9]/g, "")
      }
      if (value.length > 15) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El teléfono no puede tener más de 15 caracteres",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
        updatedValue = value.substring(0, 15)
      }
    }

    setFormData({ ...formData, [name]: updatedValue })

    // Determinar si estamos borrando texto (la longitud del valor está disminuyendo)
    const isDeletingText = prevValue && value.length < prevValue.length

    // Validar el campo que cambió, pero no mostrar alertas si:
    // 1. Es email o password, o
    // 2. Estamos borrando texto
    validateField(name, updatedValue, !isDeletingText && name !== "email" && name !== "password")
  }

  const validateForm = () => {
    // Si estamos editando, la contraseña puede estar vacía
    const isPasswordValid = editingId
      ? true
      : formData.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)
        ? false
        : true

    const isValid =
      formData.nombre.trim() !== "" &&
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre) &&
      formData.documento.trim() !== "" &&
      /^[a-zA-Z0-9]+$/.test(formData.documento) &&
      formData.email.trim() !== "" &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) &&
      formData.telefono.trim() !== "" &&
      /^\d+$/.test(formData.telefono) &&
      isPasswordValid

    return isValid
  }

  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const tempErrors = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      tempErrors.nombre = "El nombre es obligatorio"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      tempErrors.nombre = "El nombre solo debe contener letras"
    }

    // Validar documento
    if (!formData.documento.trim()) {
      tempErrors.documento = "El documento es obligatorio"
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.documento)) {
      tempErrors.documento = "El documento solo debe contener letras y números"
    }

    // Validar email
    if (!formData.email.trim()) {
      tempErrors.email = "El email es obligatorio"
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      tempErrors.email = "Formato de email inválido"
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      tempErrors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d+$/.test(formData.telefono)) {
      tempErrors.telefono = "El teléfono solo debe contener números"
    }

    // Validar contraseña (solo si es nuevo usuario o si se está cambiando)
    if (!editingId && !formData.password) {
      tempErrors.password = "La contraseña es obligatoria"
    } else if (formData.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      tempErrors.password = "La contraseña debe contener al menos una mayúscula, un número y un carácter especial"
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

  const handleDelete = async (id) => {
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
        await clienteService.deleteCliente(id)
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El cliente se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchClientes()
      } catch (error) {
        console.error("Error deleting cliente", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al eliminar el cliente.",
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
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClientes.map((cliente) => (
              <TableRow key={cliente._id} className={classes.tableRow}>
                <ClienteTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.clienteContainer}>
                    <Avatar className={classes.userAvatar}>{getInitials(cliente.nombre)}</Avatar>
                    <Typography variant="body2">{cliente.nombre}</Typography>
                  </Box>
                </ClienteTableCell>
                <TableCell className={classes.tableCell}>{cliente.documento}</TableCell>
                <TableCell className={classes.tableCell}>{cliente.email}</TableCell>
                <TableCell className={classes.tableCell}>{cliente.telefono}</TableCell>
                <TableCell className={classes.tableCell}>{cliente.estado ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar cliente">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(cliente)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(cliente)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar cliente">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleDelete(cliente._id)}
                      >
                        <Delete size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredClientes.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={7} className={classes.noDataCell}>
                  No se encontraron clientes que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredClientes.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar cliente */}
      {/* Reemplazar el modal de crear/editar cliente con el diseño actualizado */}
      {/* Buscar la sección del modal de crear/editar y reemplazarla con: */}
      {/* Modificar el componente Dialog para quitar las validaciones al cerrar */}
      {/* Reemplazar el Dialog actual con esta versión: */}
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
          {editingId ? "Editar Cliente" : "Agregar Cliente"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección de Información Personal */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Person />
              Información Personal
            </Typography>
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
              inputProps={{ maxLength: 17 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentInd className={classes.fieldIcon} />
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
              inputProps={{ maxLength: 50 }}
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
              <Email />
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
              helperText={formErrors.email}
              required
              type="email"
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
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 15 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone className={classes.fieldIcon} />
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
              onKeyDown={(e) => handleKeyDown(e, "estado")}
              type="password"
              fullWidth
              variant="outlined"
              error={!!formErrors.password}
              helperText={
                formErrors.password ||
                (editingId
                  ? "Dejar en blanco para no cambiar la contraseña"
                  : "Debe contener al menos una mayúscula, un número y un carácter especial")
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
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value === "true" })}
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
              <MenuItem value={true}>Activo</MenuItem>
              <MenuItem value={false}>Inactivo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        {/* Modificar los botones de acción para asegurar que Cancelar siempre cierre */}
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className={classes.submitButton}>
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles (solo lectura) */}
      {/* Reemplazar la sección del modal de detalles */}
      {/* Modificar también el Dialog de detalles para asegurar que se pueda cerrar sin problemas: */}
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
          Detalles del Cliente
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedCliente ? (
            <>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Avatar style={{ width: 80, height: 80, fontSize: 32, backgroundColor: "#2563eb" }}>
                  {getInitials(selectedCliente.nombre)}
                </Avatar>
              </Box>
              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Nombre:</span>
                  <span className={classes.detailsValue}>{selectedCliente.nombre}</span>
                </Typography>
              </Box>
              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Documento:</span>
                  <span className={classes.detailsValue}>{selectedCliente.documento}</span>
                </Typography>
              </Box>
              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Email:</span>
                  <span className={classes.detailsValue}>{selectedCliente.email}</span>
                </Typography>
              </Box>
              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Teléfono:</span>
                  <span className={classes.detailsValue}>{selectedCliente.telefono}</span>
                </Typography>
              </Box>
              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Estado:</span>
                  <span className={classes.detailsValue}>{selectedCliente.estado ? "Activo" : "Inactivo"}</span>
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body1">Cargando detalles...</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedCliente && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedCliente)
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

export default ClienteList
