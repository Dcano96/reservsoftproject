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
  Menu,
  Checkbox,
  ListItemText,
  Divider,
  Grid,
  Chip,
} from "@material-ui/core"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  Edit,
  AlertTriangle,
  Info,
  X,
  Search,
  Filter,
  Plus,
  Package,
  FileText,
  Home,
  Tag,
  Activity,
  Calendar,
  Clock,
} from "lucide-react"
import Swal from "sweetalert2"
import mobiliarioService from "./mobiliario.service"
import apartamentoService from "../apartamentos/apartamento.service"
import "./mobiliario.styles.css"

// Personalización de las celdas del encabezado con anchos fijos
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#2563EB",
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.9rem",
    padding: theme.spacing(2),
    textAlign: "center",
    letterSpacing: "0.8px",
    borderBottom: "none",
    boxShadow: "none",
    borderRight: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  body: {
    fontSize: "0.95rem",
    textAlign: "center",
    padding: theme.spacing(1.8),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
  btnDarDeBaja: {
    backgroundColor: "#f59e0b",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#d97706",
    },
  },
  mobiliarioAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  mobiliarioContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Cambiado de center a flex-start
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
  // Nuevo diseño para los modales
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  dialogTitle: {
    background: "#2563EB", // Cambiado de "#f8fafc" a "#2563EB" para usar el azul
    color: "#fff", // Cambiado de "#1e293b" a "#fff" para mejor contraste
    padding: theme.spacing(2.5, 3),
    fontSize: "1.4rem",
    fontWeight: 600,
    position: "relative",
    borderBottom: "1px solid #e2e8f0",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: "#fff", // Cambiado de "#64748b" a "#fff" para mejor visibilidad
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Añadido fondo semi-transparente
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)", // Ajustado el hover para mejor contraste
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
    background: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    padding: "8px 24px",
    "&:hover": {
      background: "#1d4ed8",
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
  estadoMantenimiento: {
    backgroundColor: "#ffedd5",
    color: "#9a3412",
  },
  filterButton: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}))

const MobiliarioList = () => {
  const classes = useStyles()
  const [mobiliarios, setMobiliarios] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedMobiliario, setSelectedMobiliario] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    identMobiliario: "",
    estado: "Activo",
    observacion: "",
    apartamento: "",
  })
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  // Filtro de estado (selección múltiple) y se guarda en localStorage
  const [estadoFilter, setEstadoFilter] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  // Para manejar el menú desplegable en la cabecera "Estado"
  const [estadoAnchorEl, setEstadoAnchorEl] = useState(null)

  // Cargar filtro guardado en localStorage al montar el componente
  useEffect(() => {
    const savedFilter = localStorage.getItem("mobiliarioEstadoFilter")
    if (savedFilter) {
      try {
        setEstadoFilter(JSON.parse(savedFilter))
      } catch (error) {
        console.error("Error al parsear el filtro guardado:", error)
      }
    }
  }, [])

  // Guardar filtro en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("mobiliarioEstadoFilter", JSON.stringify(estadoFilter))
  }, [estadoFilter])

  const fetchMobiliarios = async () => {
    try {
      const data = await mobiliarioService.getMobiliarios()
      setMobiliarios(data)
    } catch (error) {
      console.error("Error fetching mobiliarios", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los mobiliarios.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  const fetchApartamentos = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      setApartamentos(data)
    } catch (error) {
      console.error("Error fetching apartments", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los apartamentos.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  useEffect(() => {
    fetchMobiliarios()
    fetchApartamentos()
  }, [])

  const handleOpen = (mobiliario) => {
    if (mobiliario) {
      setFormData({
        nombre: mobiliario.nombre || "",
        identMobiliario: mobiliario.identMobiliario || "",
        estado: mobiliario.estado || "Activo",
        observacion: mobiliario.observacion || "",
        apartamento:
          typeof mobiliario.apartamento === "object" && mobiliario.apartamento !== null
            ? mobiliario.apartamento._id
            : mobiliario.apartamento || "",
      })
      setEditingId(mobiliario._id)
    } else {
      setFormData({
        nombre: "",
        identMobiliario: "",
        estado: "Activo",
        observacion: "",
        apartamento: "",
      })
      setEditingId(null)
    }
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => setOpen(false)
  const handleDetails = (mobiliario) => {
    setSelectedMobiliario(mobiliario)
    setDetailsOpen(true)
  }
  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validaciones en tiempo real
    if (name === "nombre") {
      // Solo permitir letras, números y espacios (sin caracteres especiales)
      if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(value) && value.length > 0) {
        setErrors((prev) => ({ ...prev, [name]: "No se permiten caracteres especiales" }))
        return
      }
      // Validar longitud
      if (value.length > 50) {
        setErrors((prev) => ({ ...prev, [name]: "El nombre debe tener máximo 50 caracteres" }))
        return
      }
    }

    if (name === "identMobiliario") {
      // Contar caracteres especiales
      const specialChars = value.replace(/[a-zA-Z0-9\s]/g, "")
      if (specialChars.length > 2) {
        setErrors((prev) => ({ ...prev, [name]: "No se permiten más de 2 caracteres especiales" }))
        return
      }
    }

    if (name === "observacion") {
      // Validar longitud
      if (value.length > 500) {
        setErrors((prev) => ({ ...prev, [name]: "La observación debe tener máximo 500 caracteres" }))
        return
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = async () => {
    const newErrors = {}

    // Validación del nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido."
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres."
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = "El nombre debe tener máximo 50 caracteres."
    } else if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(formData.nombre)) {
      newErrors.nombre = "No se permiten caracteres especiales en el nombre."
    }

    // Validación de identificación de mobiliario
    if (!formData.identMobiliario.trim()) {
      newErrors.identMobiliario = "La identificación es requerida."
    } else {
      // Contar caracteres especiales
      const specialChars = formData.identMobiliario.replace(/[a-zA-Z0-9\s]/g, "")
      if (specialChars.length > 2) {
        newErrors.identMobiliario = "No se permiten más de 2 caracteres especiales."
      }
    }

    // Solo validar estado en modo edición
    if (editingId && !formData.estado.trim()) {
      newErrors.estado = "El estado es requerido."
    }

    // Validación de observaciones
    if (!formData.observacion.trim()) {
      newErrors.observacion = "La observación es requerida."
    } else if (formData.observacion.trim().length < 3) {
      newErrors.observacion = "La observación debe tener al menos 3 caracteres."
    } else if (formData.observacion.trim().length > 500) {
      newErrors.observacion = "La observación debe tener máximo 500 caracteres."
    }

    if (!formData.apartamento.trim()) {
      newErrors.apartamento = "El apartamento es requerido."
    }

    const duplicate = mobiliarios.find((m) => m.identMobiliario === formData.identMobiliario && m._id !== editingId)
    if (duplicate) {
      newErrors.identMobiliario = "Ya existe un mobiliario con esa identificación."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      console.log("Enviando datos:", JSON.stringify(formData))
      if (editingId) {
        await mobiliarioService.updateMobiliario(editingId, formData)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El mobiliario se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await mobiliarioService.createMobiliario(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El mobiliario se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      setErrors({})
      fetchMobiliarios()
      handleClose()
    } catch (error) {
      console.error("Error saving mobiliario", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el mobiliario. Revise la consola para más detalles.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  const handleDarDeBaja = async (id, estado) => {
    if (estado === "Inactivo") {
      Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "Este mobiliario ya está inactivo.",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    const { value: motivo } = await Swal.fire({
      title: "Dar de baja",
      text: "Ingrese el motivo para dar de baja este mobiliario:",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Motivo de baja",
      showCancelButton: true,
      confirmButtonText: "Dar de baja",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      inputValidator: (value) => {
        if (!value) {
          return "El motivo es obligatorio"
        }
      },
    })

    if (motivo) {
      try {
        const mobiliarioActual = mobiliarios.find((m) => m._id === id)
        if (!mobiliarioActual) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Mobiliario no encontrado.",
            confirmButtonColor: "#2563eb",
          })
          return
        }

        const updatedPayload = {
          nombre: mobiliarioActual.nombre,
          identMobiliario: mobiliarioActual.identMobiliario,
          estado: "Inactivo",
          observacion: motivo,
          apartamento:
            typeof mobiliarioActual.apartamento === "object" && mobiliarioActual.apartamento !== null
              ? mobiliarioActual.apartamento._id
              : mobiliarioActual.apartamento || "",
        }

        console.log("Actualizando mobiliario:", id, updatedPayload)
        await mobiliarioService.updateMobiliario(id, updatedPayload)
        Swal.fire({
          icon: "success",
          title: "Dado de baja",
          text: "El mobiliario se ha dado de baja correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchMobiliarios()
      } catch (error) {
        console.error("Error dando de baja mobiliario", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al dar de baja el mobiliario.",
          confirmButtonColor: "#2563eb",
        })
      }
    }
  }

  // Filtrado combinando búsqueda y filtro de estado múltiple
  const filteredMobiliarios = mobiliarios.filter((m) => {
    const searchMatch =
      m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.identMobiliario?.toLowerCase().includes(searchTerm.toLowerCase())
    const estadoMatch = estadoFilter.length > 0 ? estadoFilter.includes(m.estado) : true
    return searchMatch && estadoMatch
  })

  const paginatedMobiliarios = filteredMobiliarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Manejo del menú desplegable en la cabecera "Estado"
  const handleEstadoHeaderClick = (event) => {
    setEstadoAnchorEl(event.currentTarget)
  }

  const handleEstadoClose = () => {
    setEstadoAnchorEl(null)
  }

  const handleToggleEstado = (estado) => {
    if (estadoFilter.includes(estado)) {
      setEstadoFilter(estadoFilter.filter((e) => e !== estado))
    } else {
      setEstadoFilter([...estadoFilter, estado])
    }
  }

  const associatedApt =
    selectedMobiliario && selectedMobiliario.apartamento
      ? typeof selectedMobiliario.apartamento === "object"
        ? selectedMobiliario.apartamento
        : apartamentos.find((apt) => apt._id === selectedMobiliario.apartamento)
      : null

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Mobiliarios
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los mobiliarios del sistema
        </Typography>
      </Box>

      <div className={classes.searchContainer}>
        <TextField
          label="Buscar mobiliario"
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
            startIcon={<Plus size={20} />}
          >
            Nuevo Mobiliario
          </Button>
        </Box>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table style={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563EB" }}>
              <StyledTableCell style={{ width: "25%" }}>Nombre</StyledTableCell>
              <StyledTableCell style={{ width: "20%" }}>Ident. Mobiliario</StyledTableCell>
              <StyledTableCell onClick={handleEstadoHeaderClick} style={{ width: "15%", cursor: "pointer" }}>
                <span className={classes.filterButton}>
                  Estado <Filter size={14} style={{ marginLeft: "4px" }} />
                </span>
              </StyledTableCell>
              <StyledTableCell style={{ width: "25%" }}>Observación</StyledTableCell>
              <StyledTableCell style={{ width: "15%" }}>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMobiliarios.map((mobiliario) => (
              <TableRow key={mobiliario._id} className={classes.tableRow}>
                <TableCell
                  className={classes.tableCell}
                  style={{ width: "25%", maxWidth: "25%", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <Box display="flex" alignItems="center" justifyContent="flex-start" style={{ width: "100%" }}>
                    <Avatar className={classes.mobiliarioAvatar}>
                      <Package size={18} />
                    </Avatar>
                    <Typography
                      variant="body2"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {mobiliario.nombre}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  style={{ width: "20%", maxWidth: "20%", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {mobiliario.identMobiliario}
                </TableCell>
                <TableCell className={classes.tableCell} style={{ width: "15%", maxWidth: "15%" }}>
                  <Chip
                    label={mobiliario.estado}
                    className={`${classes.estadoChip} ${
                      mobiliario.estado === "Activo"
                        ? classes.estadoActivo
                        : mobiliario.estado === "Inactivo"
                          ? classes.estadoInactivo
                          : mobiliario.estado === "Mantenimiento"
                            ? classes.estadoMantenimiento
                            : ""
                    }`}
                  />
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  style={{ width: "25%", maxWidth: "25%", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {mobiliario.observacion.length > 30
                    ? `${mobiliario.observacion.substring(0, 30)}...`
                    : mobiliario.observacion}
                </TableCell>
                <TableCell
                  className={`${classes.tableCell} ${classes.actionsCell}`}
                  style={{ width: "15%", maxWidth: "15%" }}
                >
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar mobiliario">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(mobiliario)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(mobiliario)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dar de baja">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDarDeBaja}`}
                        onClick={() => handleDarDeBaja(mobiliario._id, mobiliario.estado)}
                        disabled={mobiliario.estado === "Inactivo"}
                      >
                        <AlertTriangle size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedMobiliarios.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={5} className={classes.noDataCell}>
                  No se encontraron mobiliarios que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredMobiliarios.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Menú desplegable del filtro en la cabecera "Estado" */}
      <Menu anchorEl={estadoAnchorEl} open={Boolean(estadoAnchorEl)} onClose={handleEstadoClose}>
        {["Activo", "Inactivo", "Mantenimiento"].map((estado) => (
          <MenuItem key={estado} onClick={() => handleToggleEstado(estado)}>
            <Checkbox checked={estadoFilter.includes(estado)} />
            <ListItemText primary={estado} />
          </MenuItem>
        ))}
      </Menu>

      {/* Modal para crear/editar mobiliario */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" classes={{ paper: classes.dialogPaper }}>
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Mobiliario" : "Agregar Mobiliario"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Package size={20} />
              Información del Mobiliario
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.nombre}
              helperText={errors.nombre || `${formData.nombre.length}/50 caracteres`}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Package size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Identificación del Mobiliario"
              name="identMobiliario"
              value={formData.identMobiliario}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.identMobiliario}
              helperText={errors.identMobiliario}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tag size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Activity size={20} />
              Estado y Observaciones
            </Typography>
            {/* Campo Estado - Solo visible en modo edición */}
            {editingId ? (
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
                error={!!errors.estado}
                helperText={errors.estado}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Activity size={18} className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
                <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              </TextField>
            ) : null}
            <TextField
              className={classes.formField}
              margin="dense"
              label="Observación"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              error={!!errors.observacion}
              helperText={errors.observacion || `${formData.observacion.length}/500 caracteres`}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FileText size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Home size={20} />
              Ubicación
            </Typography>
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Apartamento"
              name="apartamento"
              value={formData.apartamento}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.apartamento}
              helperText={errors.apartamento}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              {apartamentos.length > 0 ? (
                apartamentos.map((apt) => (
                  <MenuItem key={apt._id} value={apt._id}>
                    {`Apartamento ${apt.NumeroApto} (Piso ${apt.Piso})`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No hay apartamentos disponibles</MenuItem>
              )}
            </TextField>
          </Box>
        </DialogContent>
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
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Mobiliario
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedMobiliario && (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>
                  <Package size={40} />
                </Avatar>
                <Typography className={classes.detailsName}>{selectedMobiliario.nombre}</Typography>
                <Chip
                  label={selectedMobiliario.estado}
                  className={`${classes.estadoChip} ${
                    selectedMobiliario.estado === "Activo"
                      ? classes.estadoActivo
                      : selectedMobiliario.estado === "Inactivo"
                        ? classes.estadoInactivo
                        : selectedMobiliario.estado === "Mantenimiento"
                          ? classes.estadoMantenimiento
                          : ""
                  }`}
                  style={{ marginTop: "8px" }}
                />
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3} className={classes.detailsGrid}>
                <Grid item xs={12}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <FileText size={18} />
                      Información
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: "150px" }}>
                          <Tag size={16} style={{ marginRight: "8px" }} />
                          <Typography variant="body2" fontWeight={600}>
                            Identificación:
                          </Typography>
                        </Box>
                        <Typography variant="body2">{selectedMobiliario.identMobiliario}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: "150px" }}>
                          <Home size={16} style={{ marginRight: "8px" }} />
                          <Typography variant="body2" fontWeight={600}>
                            Apartamento:
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {associatedApt
                            ? `Apartamento ${associatedApt.NumeroApto} (Piso ${associatedApt.Piso})`
                            : "No asignado"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: "150px" }}>
                          <FileText size={16} style={{ marginRight: "8px" }} />
                          <Typography variant="body2" fontWeight={600}>
                            Observación:
                          </Typography>
                        </Box>
                        <Typography variant="body2">{selectedMobiliario.observacion}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Calendar size={18} />
                      Fecha de Creación
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {new Date(selectedMobiliario.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Clock size={18} />
                      Última Actualización
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {new Date(selectedMobiliario.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedMobiliario && selectedMobiliario.estado !== "Inactivo" && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedMobiliario)
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

export default MobiliarioList
