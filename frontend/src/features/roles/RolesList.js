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
  FormControlLabel,
  Grid,
  Divider,
  Tabs,
  Tab,
  Switch,
  Chip,
} from "@material-ui/core"
import {
  Edit,
  Delete,
  Info,
  X,
  Search,
  UserPlus,
  CheckCircle,
  Settings,
  Shield,
  XCircle,
  User,
  Lock,
  Eye,
  PenTool,
  Trash2,
  Key,
} from "lucide-react"
import Swal from "sweetalert2"
import axios from "axios"
import "./roles.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

// Lista de módulos disponibles, incluye todos los módulos del sistema
const availableModules = [
  "dashboard",
  "usuarios",
  "roles",
  "clientes",
  "apartamentos",
  "tipoApartamento",
  "mobiliarios",
  "reservas",
  "pagos",
  "descuentos",
  "hospedaje",
]

// Módulos que no deben mostrar la opción de eliminar
const noDeleteModules = ["apartamentos", "tipoApartamento", "mobiliarios"]

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

// Personalización de la celda de rol (alineada a la izquierda)
const RoleTableCell = withStyles((theme) => ({
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
  roleAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  roleContainer: {
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
  // Diseño mejorado para el modal
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "90%",
    maxWidth: "800px", // Aumentado de su valor original
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
      transform: "rotate(90deg)",
      transition: "transform 0.3s ease",
    },
    transition: "transform 0.3s ease, background-color 0.3s ease",
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
    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
  },
  cancelButton: {
    color: "#64748b",
    fontWeight: 600,
    padding: "10px 24px",
    borderRadius: theme.spacing(1),
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      borderColor: "#cbd5e1",
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 600,
    padding: "10px 24px",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
      boxShadow: "0 6px 15px rgba(37, 99, 235, 0.4)",
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      background: "#94a3b8",
      boxShadow: "none",
      transform: "none",
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
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
    width: "100%",
  },
  modulesList: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  moduleCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: "1px solid #e2e8f0",
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
  },
  moduleTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: "#1e293b",
  },
  permissionsGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  permissionCheckbox: {
    margin: 0,
  },
  tabsContainer: {
    marginBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },
  tab: {
    fontWeight: 600,
    textTransform: "none",
    minWidth: 100,
    color: "#64748b",
    "&.Mui-selected": {
      color: "#2563eb",
    },
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.05)",
    },
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  // Nuevo diseño para las tarjetas de permisos
  permissionCard: {
    transition: "all 0.3s ease",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
    "&:hover": {
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
      transform: "translateY(-2px)",
      borderColor: "#cbd5e1",
    },
  },
  permissionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  permissionTitle: {
    fontWeight: 700,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    fontSize: "1.1rem",
    flex: "1 1 auto",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#2563eb",
    },
  },
  permissionActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  selectAllButton: {
    background: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    padding: "4px 8px", // Reducido aún más
    fontSize: "0.75rem", // Tamaño de fuente más pequeño
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0),
    boxShadow: "none",
    minWidth: "auto", // Permitir que el botón sea más pequeño
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#1d4ed8",
      boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    },
  },
  removeAllButton: {
    background: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    padding: "4px 8px", // Reducido aún más
    fontSize: "0.75rem", // Tamaño de fuente más pequeño
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0),
    boxShadow: "none",
    minWidth: "auto", // Permitir que el botón sea más pequeño
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#1d4ed8",
      boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    },
  },
  moduleButton: {
    background: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    padding: "3px 6px", // Reducido aún más
    fontSize: "0.7rem", // Tamaño de fuente más pequeño
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0, 0.5),
    boxShadow: "none",
    minWidth: "auto", // Permitir que el botón sea más pequeño
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#1d4ed8",
      boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    },
  },
  permissionChip: {
    margin: theme.spacing(0.5),
    fontWeight: 500,
    backgroundColor: "#e2e8f0",
    "& .MuiChip-label": {
      padding: theme.spacing(0, 1),
    },
  },
  activeChip: {
    backgroundColor: "#bfdbfe",
    color: "#1e40af",
  },
  permissionIcon: {
    marginRight: theme.spacing(0.5),
    fontSize: "1.2rem",
  },
  moduleIcon: {
    marginRight: theme.spacing(1),
    color: "#2563eb",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  topButtonsContainer: {
    display: "flex",
    gap: theme.spacing(2), // Reducido de 4 a 2
  },
  moduleButtonsContainer: {
    display: "flex",
    gap: theme.spacing(1), // Reducido de 3 a 1
  },
  permissionSwitch: {
    "& .MuiSwitch-track": {
      backgroundColor: "#cbd5e1",
    },
    "& .MuiSwitch-colorPrimary.Mui-checked": {
      color: "#2563eb",
    },
    "& .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#93c5fd",
    },
  },
  permissionLabel: {
    fontSize: "0.9rem",
    color: "#475569",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#2563eb",
    },
  },
  formField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1),
      transition: "all 0.3s ease",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: "2px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: "2px",
        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#64748b",
      fontWeight: "500",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#2563eb",
    },
  },
  fieldIcon: {
    color: "#2563eb",
  },
  permissionSwitchContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: "rgba(241, 245, 249, 0.7)",
    marginBottom: theme.spacing(1),
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(241, 245, 249, 1)",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
    },
  },
  permissionIcon: {
    marginRight: theme.spacing(1.5),
    color: "#2563eb",
  },
  permissionActionName: {
    flex: 1,
    fontWeight: "500",
    color: "#334155",
  },
  // Estilos para el modal de detalles
  detailsHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: theme.spacing(4),
  },
  detailsAvatar: {
    width: 100,
    height: 100,
    fontSize: 40,
    backgroundColor: "#2563eb",
    marginBottom: theme.spacing(2),
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
  },
  detailsName: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(1),
  },
  detailsStatus: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 600,
    marginTop: theme.spacing(1),
  },
  activeStatus: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  inactiveStatus: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  detailsSection: {
    marginTop: theme.spacing(4),
  },
  permissionsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  permissionChipDetails: {
    margin: theme.spacing(0.5),
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  // Estilos para los iconos de permisos
  permissionActionIcon: {
    marginRight: theme.spacing(0.5),
    fontSize: "1rem",
  },
}))

const RolesList = () => {
  const classes = useStyles()
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    estado: true,
    permisos: [],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  // Estados para validación de formulario
  const [formErrors, setFormErrors] = useState({
    nombre: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)

  // Función para obtener el token en el header
  const getTokenHeader = () => {
    const token = localStorage.getItem("token")
    return { Authorization: `Bearer ${token}` }
  }

  // Cargar roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles", {
        headers: getTokenHeader(),
      })
      setRoles(res.data)
    } catch (error) {
      console.error("Error fetching roles", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los roles.",
      })
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  // Inicializar permisos para un nuevo rol (incluye todos los módulos disponibles)
  const initializePermissions = () => {
    return availableModules.map((modulo) => ({
      modulo,
      acciones: {
        crear: false,
        leer: modulo === "dashboard" ? true : false,
        actualizar: false,
        eliminar: false,
      },
    }))
  }

  // Abrir modal para crear o editar rol
  const handleOpen = (role) => {
    // Limpiar errores previos
    setFormErrors({
      nombre: "",
    })

    if (role) {
      let permisos = role.permisos || []
      // Convertir formato antiguo a granular si es necesario
      if (permisos.length > 0 && typeof permisos[0] === "string") {
        permisos = permisos.map((modulo) => ({
          modulo,
          acciones: {
            crear: false,
            leer: true,
            actualizar: false,
            eliminar: false,
          },
        }))
      }
      const modulosExistentes = permisos.map((p) => p.modulo)
      const modulosFaltantes = availableModules.filter((m) => !modulosExistentes.includes(m))
      modulosFaltantes.forEach((modulo) => {
        permisos.push({
          modulo,
          acciones: {
            crear: false,
            leer: false,
            actualizar: false,
            eliminar: false,
          },
        })
      })
      setFormData({
        nombre: role.nombre,
        estado: role.estado,
        permisos: permisos,
      })
      setEditingId(role._id)
      // Al editar, el formulario es válido inicialmente
      setIsFormValid(true)
    } else {
      setFormData({
        nombre: "",
        estado: true,
        permisos: initializePermissions(),
      })
      setEditingId(null)
      // Al crear, el formulario no es válido inicialmente
      setIsFormValid(false)
    }
    setOpen(true)
    setTabValue(0)
  }

  const handleClose = () => {
    setOpen(false)
    // Limpiar errores al cerrar
    setFormErrors({
      nombre: "",
    })
  }

  // Abrir modal de detalles (solo lectura)
  const handleDetails = (role) => {
    let permisos = role.permisos || []
    if (permisos.length > 0 && typeof permisos[0] === "string") {
      permisos = permisos.map((modulo) => ({
        modulo,
        acciones: {
          crear: false,
          leer: true,
          actualizar: false,
          eliminar: false,
        },
      }))
    }
    setSelectedRole({ ...role, permisos })
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Validar el campo que cambió
    validateField(name, value)
  }

  // Modificar la función validateField para que no valide agresivamente cuando estamos en modo edición
  // y el usuario está seleccionando un rol del dropdown

  // Buscar la función validateField y reemplazarla con esta versión mejorada:
  const validateField = (name, value) => {
    let errorMessage = ""

    if (name === "nombre") {
      // Si estamos editando un rol existente y el usuario está seleccionando
      // del dropdown, no validamos agresivamente
      if (editingId && ["administrador", "recepcion", "cliente", "otro"].includes(value)) {
        return true // No mostrar error para selecciones válidas en el dropdown
      }

      // Solo validar si el campo está vacío cuando es obligatorio
      if (!value.trim() && (name === "nombre" || (name === "nombrePersonalizado" && formData.nombre === "otro"))) {
        errorMessage = "El nombre es obligatorio"
      }
    }

    // Actualizar el estado de errores
    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    // ELIMINADO: Ya no mostramos SweetAlert2 aquí para evitar congelamiento

    // Validar todo el formulario después de actualizar este campo
    setTimeout(() => {
      validateForm({
        ...formData,
        [name]: value,
      })
    }, 0)

    return !errorMessage // Retorna true si no hay error
  }

  // Validar todo el formulario
  const validateForm = (data) => {
    const isValid = data.nombre.trim() !== ""
    setIsFormValid(isValid)
  }

  // Manejar cambios en los permisos CRUD
  const handlePermissionChange = (moduloIndex, accion, checked) => {
    const updatedPermisos = [...formData.permisos]
    updatedPermisos[moduloIndex].acciones[accion] = checked
    setFormData({ ...formData, permisos: updatedPermisos })
  }

  // Seleccionar todos los permisos para un módulo
  const handleSelectAllForModule = (moduloIndex) => {
    const updatedPermisos = [...formData.permisos]
    const modulo = updatedPermisos[moduloIndex].modulo

    // Si es dashboard, solo permitir leer
    if (modulo === "dashboard") {
      updatedPermisos[moduloIndex].acciones = {
        crear: false,
        leer: true,
        actualizar: false,
        eliminar: false,
      }
    } else {
      // Para otros módulos, activar todos los permisos excepto eliminar para los módulos especificados
      updatedPermisos[moduloIndex].acciones = {
        crear: true,
        leer: true,
        actualizar: true,
        eliminar: !noDeleteModules.includes(modulo),
      }
    }

    setFormData({ ...formData, permisos: updatedPermisos })
  }

  // Quitar todos los permisos para un módulo
  const handleRemoveAllForModule = (moduloIndex) => {
    const updatedPermisos = [...formData.permisos]
    const modulo = updatedPermisos[moduloIndex].modulo

    updatedPermisos[moduloIndex].acciones = {
      crear: false,
      leer: false,
      actualizar: false,
      eliminar: false,
    }

    setFormData({ ...formData, permisos: updatedPermisos })
  }

  // Seleccionar todos los permisos para todos los módulos
  const handleSelectAllPermissions = () => {
    const updatedPermisos = formData.permisos.map((permiso) => {
      // Si es dashboard, solo permitir leer
      if (permiso.modulo === "dashboard") {
        return {
          ...permiso,
          acciones: {
            crear: false,
            leer: true,
            actualizar: false,
            eliminar: false,
          },
        }
      } else {
        // Para otros módulos, activar todos los permisos excepto eliminar para los módulos especificados
        return {
          ...permiso,
          acciones: {
            crear: true,
            leer: true,
            actualizar: true,
            eliminar: !noDeleteModules.includes(permiso.modulo),
          },
        }
      }
    })

    setFormData({ ...formData, permisos: updatedPermisos })
  }

  // Quitar todos los permisos para todos los módulos
  const handleRemoveAllPermissions = () => {
    const updatedPermisos = formData.permisos.map((permiso) => {
      return {
        ...permiso,
        acciones: {
          crear: false,
          leer: false,
          actualizar: false,
          eliminar: false,
        },
      }
    })

    setFormData({ ...formData, permisos: updatedPermisos })
  }

  // Preparar datos antes de enviar (si el rol es "otro", usar el nombre personalizado)
  const prepareFormData = () => {
    const form = { ...formData }
    if (form.nombre === "otro") {
      form.nombre = form.nombrePersonalizado || ""
      delete form.nombrePersonalizado
    }
    return form
  }

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const tempErrors = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      tempErrors.nombre = "El nombre es obligatorio"
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

    try {
      const rolData = prepareFormData()
      if (editingId) {
        await axios.put(`http://localhost:5000/api/roles/${editingId}`, rolData, {
          headers: getTokenHeader(),
        })
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El rol se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await axios.post("http://localhost:5000/api/roles", rolData, {
          headers: getTokenHeader(),
        })
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El rol se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchRoles()
      handleClose()
    } catch (error) {
      console.error("Error saving role", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el rol.",
      })
    }
  }

  // Eliminar rol
  const handleDelete = async (id) => {
    // Verificar primero si es el rol de administrador
    const rolToDelete = roles.find((role) => role._id === id)
    if (rolToDelete && rolToDelete.nombre.toLowerCase() === "administrador") {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "El rol de administrador no puede ser eliminado",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    const confirmDelete = await Swal.fire({
      title: "¿Eliminar rol?",
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
        await axios.delete(`http://localhost:5000/api/roles/${id}`, {
          headers: getTokenHeader(),
        })
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El rol se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchRoles()
      } catch (error) {
        console.error("Error deleting role", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.msg || "Ocurrió un error al eliminar el rol.",
        })
      }
    }
  }

  // Filtrar roles por búsqueda (por nombre)
  const filteredRoles = roles.filter((role) => role.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  // Función auxiliar para obtener las iniciales
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Formatear permisos para mostrar en la tabla
  const formatPermissions = (permisos) => {
    if (!permisos || permisos.length === 0) return "Sin permisos"
    if (typeof permisos[0] === "string") {
      return permisos.join(", ")
    }
    return permisos
      .filter((p) => p.acciones.crear || p.acciones.leer || p.acciones.actualizar || p.acciones.eliminar)
      .map((p) => p.modulo)
      .join(", ")
  }

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // También modificar la función handleFieldBlur para evitar problemas similares
  const handleFieldBlur = (e) => {
    const { name, value } = e.target

    // Si estamos editando y es el campo nombre con un valor válido del dropdown, no validar
    if (editingId && name === "nombre" && ["administrador", "recepcion", "cliente", "otro"].includes(value)) {
      return
    }

    // Solo validar el campo, sin intentar devolver el foco
    validateField(name, value)
  }

  // Modificar la función handleKeyDown para evitar problemas similares
  const handleKeyDown = (e, nextFieldName) => {
    // Si se presiona Tab y el campo no es válido, no prevenir el comportamiento por defecto
    if (e.key === "Tab") {
      const { name, value } = e.target

      // Si estamos editando y es el campo nombre con un valor válido del dropdown, permitir el Tab
      if (editingId && name === "nombre" && ["administrador", "recepcion", "cliente", "otro"].includes(value)) {
        return
      }

      // Solo validar, sin prevenir el comportamiento por defecto
      validateField(name, value)
    }
  }

  // Obtener el icono correspondiente para cada módulo
  const getModuleIcon = (modulo) => {
    switch (modulo) {
      case "dashboard":
        return <Settings size={20} />
      case "usuarios":
        return <User size={20} />
      case "roles":
        return <Shield size={20} />
      case "clientes":
        return <User size={20} />
      default:
        return <Settings size={20} />
    }
  }

  // Obtener el icono correspondiente para cada acción
  const getActionIcon = (accion) => {
    switch (accion) {
      case "crear":
        return <PenTool size={16} />
      case "leer":
        return <Eye size={16} />
      case "actualizar":
        return <Edit size={16} />
      case "eliminar":
        return <Trash2 size={16} />
      default:
        return <Settings size={16} />
    }
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Roles
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los roles del sistema
        </Typography>
      </Box>

      {/* Barra de búsqueda */}
      <Box className={classes.searchContainer}>
        <TextField
          label="Buscar rol"
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
            Nuevo Rol
          </Button>
        </Box>
      </Box>

      {/* Tabla de roles */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Rol</StyledTableCell>
              <StyledTableCell>Permisos</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((role) => (
              <TableRow key={role._id} className={classes.tableRow}>
                <RoleTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.roleContainer}>
                    <Avatar className={classes.roleAvatar}>{getInitials(role.nombre)}</Avatar>
                    <Typography variant="body2">{role.nombre}</Typography>
                  </Box>
                </RoleTableCell>
                <TableCell className={classes.tableCell}>{formatPermissions(role.permisos)}</TableCell>
                <TableCell className={classes.tableCell}>{role.estado ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar rol">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(role)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(role)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>
                    {role.nombre.toLowerCase() !== "administrador" && (
                      <Tooltip title="Eliminar rol">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDelete}`}
                          onClick={() => handleDelete(role._id)}
                        >
                          <Delete size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {role.nombre.toLowerCase() === "administrador" && (
                      <div style={{ width: "40px", height: "40px" }}></div> // Espacio para mantener alineación
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredRoles.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={4} className={classes.noDataCell}>
                  No se encontraron roles que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredRoles.length}
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

      {/* Modal para crear/editar rol - Diseño mejorado */}
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
          {editingId ? "Editar Rol" : "Agregar Rol"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography className={classes.sectionTitle}>
                <User size={22} />
                Información del Rol
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Campo de rol: select con opciones predefinidas y opción "otro" */}
              <TextField
                select
                margin="dense"
                label="Rol"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleFieldBlur}
                onKeyDown={(e) => handleKeyDown(e, "estado")}
                fullWidth
                variant="outlined"
                error={!!formErrors.nombre}
                required
                className={classes.formField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shield size={20} className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="administrador">Administrador</MenuItem>
                <MenuItem value="recepcion">Recepción</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>
              {formData.nombre === "otro" && (
                <TextField
                  margin="dense"
                  label="Nombre personalizado"
                  name="nombrePersonalizado"
                  value={formData.nombrePersonalizado || ""}
                  onChange={(e) => setFormData({ ...formData, nombrePersonalizado: e.target.value })}
                  onBlur={handleFieldBlur}
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.nombrePersonalizado}
                  required
                  className={classes.formField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                margin="dense"
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className={classes.formField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key size={20} className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography className={classes.sectionTitle}>
              <Lock size={22} />
              Configuración de Permisos
            </Typography>

            <Box className={classes.buttonGroup}>
              <Box className={classes.topButtonsContainer}>
                <Button
                  variant="contained"
                  size="small"
                  className={classes.submitButton}
                  onClick={handleSelectAllPermissions}
                  startIcon={<CheckCircle size={16} />}
                >
                  Asignar todos
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  className={classes.cancelButton}
                  onClick={handleRemoveAllPermissions}
                  startIcon={<XCircle size={16} />}
                >
                  Quitar todos
                </Button>
              </Box>
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabsContainer}
              variant="fullWidth"
            >
              <Tab label="Administración" className={classes.tab} icon={<Settings size={18} />} />
              <Tab label="Gestión" className={classes.tab} icon={<User size={18} />} />
              <Tab label="Operaciones" className={classes.tab} icon={<Shield size={18} />} />
            </Tabs>

            {/* Panel de Administración */}
            {tabValue === 0 && (
              <div className={classes.tabPanel}>
                {formData.permisos
                  .filter((p) => ["dashboard", "usuarios", "roles"].includes(p.modulo))
                  .map((permiso, index) => {
                    const moduloIndex = formData.permisos.findIndex((p) => p.modulo === permiso.modulo)
                    return (
                      <Box key={permiso.modulo} className={classes.permissionCard}>
                        <Box className={classes.permissionHeader}>
                          <Typography className={classes.permissionTitle}>
                            {getModuleIcon(permiso.modulo)}
                            {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                          </Typography>
                          <Box className={classes.moduleButtonsContainer}>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.submitButton}
                              onClick={() => handleSelectAllForModule(moduloIndex)}
                            >
                              Seleccionar
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.cancelButton}
                              onClick={() => handleRemoveAllForModule(moduloIndex)}
                            >
                              Quitar
                            </Button>
                          </Box>
                        </Box>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionActions}>
                          {permiso.modulo === "dashboard" ? (
                            <Box className={classes.permissionSwitchContainer}>
                              <Eye className={classes.permissionIcon} size={20} />
                              <Typography className={classes.permissionActionName}>Acceso</Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={permiso.acciones.leer}
                                    onChange={(e) => handlePermissionChange(moduloIndex, "leer", e.target.checked)}
                                    color="primary"
                                    className={classes.permissionSwitch}
                                  />
                                }
                                label=""
                              />
                            </Box>
                          ) : (
                            <>
                              <Box className={classes.permissionSwitchContainer}>
                                <PenTool className={classes.permissionIcon} size={20} />
                                <Typography className={classes.permissionActionName}>Crear</Typography>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={permiso.acciones.crear}
                                      onChange={(e) => handlePermissionChange(moduloIndex, "crear", e.target.checked)}
                                      color="primary"
                                      className={classes.permissionSwitch}
                                    />
                                  }
                                  label=""
                                />
                              </Box>
                              <Box className={classes.permissionSwitchContainer}>
                                <Eye className={classes.permissionIcon} size={20} />
                                <Typography className={classes.permissionActionName}>Ver</Typography>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={permiso.acciones.leer}
                                      onChange={(e) => handlePermissionChange(moduloIndex, "leer", e.target.checked)}
                                      color="primary"
                                      className={classes.permissionSwitch}
                                    />
                                  }
                                  label=""
                                />
                              </Box>
                              <Box className={classes.permissionSwitchContainer}>
                                <Edit className={classes.permissionIcon} size={20} />
                                <Typography className={classes.permissionActionName}>Editar</Typography>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={permiso.acciones.actualizar}
                                      onChange={(e) =>
                                        handlePermissionChange(moduloIndex, "actualizar", e.target.checked)
                                      }
                                      color="primary"
                                      className={classes.permissionSwitch}
                                    />
                                  }
                                  label=""
                                />
                              </Box>
                              {!noDeleteModules.includes(permiso.modulo) && (
                                <Box className={classes.permissionSwitchContainer}>
                                  <Trash2 className={classes.permissionIcon} size={20} />
                                  <Typography className={classes.permissionActionName}>Eliminar</Typography>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={permiso.acciones.eliminar}
                                        onChange={(e) =>
                                          handlePermissionChange(moduloIndex, "eliminar", e.target.checked)
                                        }
                                        color="primary"
                                        className={classes.permissionSwitch}
                                      />
                                    }
                                    label=""
                                  />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
              </div>
            )}

            {/* Panel de Gestión */}
            {tabValue === 1 && (
              <div className={classes.tabPanel}>
                {formData.permisos
                  .filter((p) => ["clientes", "apartamentos", "tipoApartamento", "mobiliarios"].includes(p.modulo))
                  .map((permiso, index) => {
                    const moduloIndex = formData.permisos.findIndex((p) => p.modulo === permiso.modulo)
                    return (
                      <Box key={permiso.modulo} className={classes.permissionCard}>
                        <Box className={classes.permissionHeader}>
                          <Typography className={classes.permissionTitle}>
                            {getModuleIcon(permiso.modulo)}
                            {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                          </Typography>
                          <Box className={classes.moduleButtonsContainer}>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.submitButton}
                              onClick={() => handleSelectAllForModule(moduloIndex)}
                            >
                              Seleccionar
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.cancelButton}
                              onClick={() => handleRemoveAllForModule(moduloIndex)}
                            >
                              Quitar
                            </Button>
                          </Box>
                        </Box>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionActions}>
                          <Box className={classes.permissionSwitchContainer}>
                            <PenTool className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Crear</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.crear}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "crear", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          <Box className={classes.permissionSwitchContainer}>
                            <Eye className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Ver</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.leer}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "leer", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          <Box className={classes.permissionSwitchContainer}>
                            <Edit className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Editar</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.actualizar}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "actualizar", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          {!noDeleteModules.includes(permiso.modulo) && (
                            <Box className={classes.permissionSwitchContainer}>
                              <Trash2 className={classes.permissionIcon} size={20} />
                              <Typography className={classes.permissionActionName}>Eliminar</Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={permiso.acciones.eliminar}
                                    onChange={(e) => handlePermissionChange(moduloIndex, "eliminar", e.target.checked)}
                                    color="primary"
                                    className={classes.permissionSwitch}
                                  />
                                }
                                label=""
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
              </div>
            )}

            {/* Panel de Operaciones */}
            {tabValue === 2 && (
              <div className={classes.tabPanel}>
                {formData.permisos
                  .filter((p) => ["reservas", "pagos", "descuentos", "hospedaje"].includes(p.modulo))
                  .map((permiso, index) => {
                    const moduloIndex = formData.permisos.findIndex((p) => p.modulo === permiso.modulo)
                    return (
                      <Box key={permiso.modulo} className={classes.permissionCard}>
                        <Box className={classes.permissionHeader}>
                          <Typography className={classes.permissionTitle}>
                            {getModuleIcon(permiso.modulo)}
                            {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                          </Typography>
                          <Box className={classes.moduleButtonsContainer}>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.submitButton}
                              onClick={() => handleSelectAllForModule(moduloIndex)}
                            >
                              Seleccionar
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              className={classes.cancelButton}
                              onClick={() => handleRemoveAllForModule(moduloIndex)}
                            >
                              Quitar
                            </Button>
                          </Box>
                        </Box>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionActions}>
                          <Box className={classes.permissionSwitchContainer}>
                            <PenTool className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Crear</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.crear}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "crear", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          <Box className={classes.permissionSwitchContainer}>
                            <Eye className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Ver</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.leer}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "leer", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          <Box className={classes.permissionSwitchContainer}>
                            <Edit className={classes.permissionIcon} size={20} />
                            <Typography className={classes.permissionActionName}>Editar</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiso.acciones.actualizar}
                                  onChange={(e) => handlePermissionChange(moduloIndex, "actualizar", e.target.checked)}
                                  color="primary"
                                  className={classes.permissionSwitch}
                                />
                              }
                              label=""
                            />
                          </Box>
                          {!noDeleteModules.includes(permiso.modulo) && (
                            <Box className={classes.permissionSwitchContainer}>
                              <Trash2 className={classes.permissionIcon} size={20} />
                              <Typography className={classes.permissionActionName}>Eliminar</Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={permiso.acciones.eliminar}
                                    onChange={(e) => handlePermissionChange(moduloIndex, "eliminar", e.target.checked)}
                                    color="primary"
                                    className={classes.permissionSwitch}
                                  />
                                }
                                label=""
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className={classes.submitButton} disabled={!isFormValid}>
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles (solo lectura) - Diseño mejorado */}
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
          Detalles del Rol
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedRole ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedRole.nombre)}</Avatar>
                <Typography className={classes.detailsName}>{selectedRole.nombre}</Typography>
                <div
                  className={`${classes.detailsStatus} ${selectedRole.estado ? classes.activeStatus : classes.inactiveStatus}`}
                >
                  {selectedRole.estado ? "Activo" : "Inactivo"}
                </div>
              </Box>

              <Typography className={classes.sectionTitle}>
                <Shield size={22} />
                Permisos por Módulo
              </Typography>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                className={classes.tabsContainer}
                variant="fullWidth"
              >
                <Tab label="Administración" className={classes.tab} icon={<Settings size={18} />} />
                <Tab label="Gestión" className={classes.tab} icon={<User size={18} />} />
                <Tab label="Operaciones" className={classes.tab} icon={<Shield size={18} />} />
              </Tabs>

              {/* Panel de Administración */}
              {tabValue === 0 && (
                <div className={classes.tabPanel}>
                  {selectedRole.permisos
                    .filter((p) => ["dashboard", "usuarios", "roles"].includes(p.modulo))
                    .map((permiso, index) => (
                      <Box key={index} className={classes.permissionCard}>
                        <Typography className={classes.permissionTitle}>
                          {getModuleIcon(permiso.modulo)}
                          {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                        </Typography>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionsList}>
                          {permiso.modulo === "dashboard" ? (
                            <Chip
                              icon={<Eye className={classes.permissionActionIcon} />}
                              label="Acceso"
                              className={`${classes.permissionChipDetails} ${permiso.acciones.leer ? classes.activeChip : ""}`}
                              variant={permiso.acciones.leer ? "default" : "outlined"}
                            />
                          ) : (
                            <>
                              <Chip
                                icon={<PenTool className={classes.permissionActionIcon} />}
                                label="Crear"
                                className={`${classes.permissionChipDetails} ${permiso.acciones.crear ? classes.activeChip : ""}`}
                                variant={permiso.acciones.crear ? "default" : "outlined"}
                              />
                              <Chip
                                icon={<Eye className={classes.permissionActionIcon} />}
                                label="Ver"
                                className={`${classes.permissionChipDetails} ${permiso.acciones.leer ? classes.activeChip : ""}`}
                                variant={permiso.acciones.leer ? "default" : "outlined"}
                              />
                              <Chip
                                icon={<Edit className={classes.permissionActionIcon} />}
                                label="Editar"
                                className={`${classes.permissionChipDetails} ${permiso.acciones.actualizar ? classes.activeChip : ""}`}
                                variant={permiso.acciones.actualizar ? "default" : "outlined"}
                              />
                              {!noDeleteModules.includes(permiso.modulo) && (
                                <Chip
                                  icon={<Trash2 className={classes.permissionActionIcon} />}
                                  label="Eliminar"
                                  className={`${classes.permissionChipDetails} ${permiso.acciones.eliminar ? classes.activeChip : ""}`}
                                  variant={permiso.acciones.eliminar ? "default" : "outlined"}
                                />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    ))}
                </div>
              )}

              {/* Panel de Gestión */}
              {tabValue === 1 && (
                <div className={classes.tabPanel}>
                  {selectedRole.permisos
                    .filter((p) => ["clientes", "apartamentos", "tipoApartamento", "mobiliarios"].includes(p.modulo))
                    .map((permiso, index) => (
                      <Box key={index} className={classes.permissionCard}>
                        <Typography className={classes.permissionTitle}>
                          {getModuleIcon(permiso.modulo)}
                          {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                        </Typography>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionsList}>
                          <Chip
                            icon={<PenTool className={classes.permissionActionIcon} />}
                            label="Crear"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.crear ? classes.activeChip : ""}`}
                            variant={permiso.acciones.crear ? "default" : "outlined"}
                          />
                          <Chip
                            icon={<Eye className={classes.permissionActionIcon} />}
                            label="Ver"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.leer ? classes.activeChip : ""}`}
                            variant={permiso.acciones.leer ? "default" : "outlined"}
                          />
                          <Chip
                            icon={<Edit className={classes.permissionActionIcon} />}
                            label="Editar"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.actualizar ? classes.activeChip : ""}`}
                            variant={permiso.acciones.actualizar ? "default" : "outlined"}
                          />
                          {!noDeleteModules.includes(permiso.modulo) && (
                            <Chip
                              icon={<Trash2 className={classes.permissionActionIcon} />}
                              label="Eliminar"
                              className={`${classes.permissionChipDetails} ${permiso.acciones.eliminar ? classes.activeChip : ""}`}
                              variant={permiso.acciones.eliminar ? "default" : "outlined"}
                            />
                          )}
                        </Box>
                      </Box>
                    ))}
                </div>
              )}

              {/* Panel de Operaciones */}
              {tabValue === 2 && (
                <div className={classes.tabPanel}>
                  {selectedRole.permisos
                    .filter((p) => ["reservas", "pagos", "descuentos", "hospedaje"].includes(p.modulo))
                    .map((permiso, index) => (
                      <Box key={index} className={classes.permissionCard}>
                        <Typography className={classes.permissionTitle}>
                          {getModuleIcon(permiso.modulo)}
                          {permiso.modulo.charAt(0).toUpperCase() + permiso.modulo.slice(1)}
                        </Typography>
                        <Divider style={{ margin: "16px 0" }} />
                        <Box className={classes.permissionsList}>
                          <Chip
                            icon={<PenTool className={classes.permissionActionIcon} />}
                            label="Crear"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.crear ? classes.activeChip : ""}`}
                            variant={permiso.acciones.crear ? "default" : "outlined"}
                          />
                          <Chip
                            icon={<Eye className={classes.permissionActionIcon} />}
                            label="Ver"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.leer ? classes.activeChip : ""}`}
                            variant={permiso.acciones.leer ? "default" : "outlined"}
                          />
                          <Chip
                            icon={<Edit className={classes.permissionActionIcon} />}
                            label="Editar"
                            className={`${classes.permissionChipDetails} ${permiso.acciones.actualizar ? classes.activeChip : ""}`}
                            variant={permiso.acciones.actualizar ? "default" : "outlined"}
                          />
                          {!noDeleteModules.includes(permiso.modulo) && (
                            <Chip
                              icon={<Trash2 className={classes.permissionActionIcon} />}
                              label="Eliminar"
                              className={`${classes.permissionChipDetails} ${permiso.acciones.eliminar ? classes.activeChip : ""}`}
                              variant={permiso.acciones.eliminar ? "default" : "outlined"}
                            />
                          )}
                        </Box>
                      </Box>
                    ))}
                </div>
              )}
            </>
          ) : (
            <Typography variant="body1">Cargando detalles...</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedRole && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedRole)
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

export default RolesList
