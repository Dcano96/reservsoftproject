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
  FormControl,
  InputLabel,
  Select,
} from "@material-ui/core"
import { Edit, Delete, Eye, X, Search, UserPlus, Home, Building, Layers, FileText, DollarSign } from "lucide-react"
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import apartamentoService from "./apartamento.service"
import mobiliarioService from "../mobiliarios/mobiliario.service"
import tipoApartamentoService from "../tipoApartamentos/tipoApartamento.service"
import "./apartamento.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

// Función para formatear la tarifa en COP (peso colombiano)
const formatTarifa = (tarifa) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(tarifa)
}

// Personalización de las celdas del encabezado
const StyledTableCell = withStyles((theme) => ({
  head: {
    background: "#2563eb", // Cambio a un azul sólido
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

// Personalización de la celda de apartamento (alineada a la izquierda)
const ApartamentoTableCell = withStyles((theme) => ({
  body: {
    fontSize: "0.95rem",
    textAlign: "left",
    padding: theme.spacing(1.8),
    color: "#334155",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
}))(TableCell)

// Personalización para las celdas de la tabla de mobiliarios
const MobiliarioTableCell = withStyles((theme) => ({
  head: {
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    padding: theme.spacing(1.5),
    textAlign: "center",
    borderBottom: "none",
  },
  body: {
    fontSize: "0.9rem",
    padding: theme.spacing(1.5),
    textAlign: "center",
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
  tableContainerDetails: {
    marginTop: theme.spacing(2),
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
  apartamentoAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  apartamentoContainer: {
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
  // Estilos actualizados para el modal según usuario-list.tsx
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "600px", // Ajustar al tamaño del modal de usuario-list.tsx
    maxWidth: "90vw", // Para asegurar responsividad
  },
  // Modal de detalles más ancho
  dialogPaperLarge: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "710px", // Reducir el ancho para que no sea tan grande
    maxWidth: "95vw", // Para asegurar responsividad
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
  detailsRow: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  detailsLabel: {
    fontWeight: 600,
    color: "#1e293b",
    marginRight: theme.spacing(1),
  },
  detailsValue: {
    color: "#334155",
  },
  errorMessage: {
    fontSize: "0.95rem",
    color: "#ef4444",
    fontWeight: "500",
    marginTop: "4px",
  },
  tabsContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
  },
  tabButton: {
    padding: theme.spacing(1, 3),
    borderRadius: theme.spacing(1),
    fontWeight: 600,
    transition: "all 0.3s ease",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      transform: "translateY(-2px)",
    },
  },
  activeTabButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "1px solid #2563eb",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },
  tabIcon: {
    marginRight: theme.spacing(1),
  },
  alertRow: {
    backgroundColor: "#fee2e2",
    "& > *": {
      color: "#991b1b",
    },
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
  // Estilos específicos para la tabla de mobiliarios
  mobiliarioTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  mobiliarioTableHead: {
    backgroundColor: "#2563eb",
  },
  mobiliarioHeaderCell: {
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    padding: "12px 16px",
    textAlign: "center",
  },
  mobiliarioCell: {
    padding: "12px 16px",
    fontSize: "0.9rem",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
  },
}))

const ApartamentoList = () => {
  const classes = useStyles()
  const history = useHistory()
  const [apartamentos, setApartamentos] = useState([])
  const [open, setOpen] = useState(false) // Modal para crear/editar
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState("Type 1") // Pestaña activa por defecto
  const [formData, setFormData] = useState({
    Tipo: "Type 1",
    NumeroApto: "",
    Piso: "",
    Tarifa: "",
    Estado: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)

  // Estados para el modal de detalles (apartamento y mobiliarios asociados)
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedApartamento, setSelectedApartamento] = useState(null)
  const [mobiliarios, setMobiliarios] = useState([])

  // Cargar lista de Tipos de Apartamento
  const [tipoApartamentos, setTipoApartamentos] = useState([])
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await tipoApartamentoService.getTipoApartamentos()
        setTipoApartamentos(data)
      } catch (error) {
        console.error("Error fetching tipoApartamentos:", error)
      }
    }
    fetchTipos()
  }, [])

  // Función para cargar apartamentos
  const fetchApartamentos = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      setApartamentos(data)
    } catch (error) {
      console.error("Error fetching apartamentos", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los apartamentos.",
      })
    }
  }

  useEffect(() => {
    fetchApartamentos()
  }, [])

  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(0)
  }

  // Abrir modal para crear o editar
  const handleOpen = (apartamento) => {
    setFormErrors({}) // Limpiar errores previos

    if (apartamento) {
      setFormData({
        Tipo: apartamento.Tipo || activeTab,
        NumeroApto: apartamento.NumeroApto || "",
        Piso: apartamento.Piso || "",
        Tarifa: apartamento.Tarifa || "",
        Estado: apartamento.Estado ?? true,
      })
      setEditingId(apartamento._id)
      setIsFormValid(true)
    } else {
      setFormData({
        Tipo: activeTab,
        NumeroApto: "",
        Piso: "",
        Tarifa: "",
        Estado: true,
      })
      setEditingId(null)
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  // Función para abrir modal de detalles y cargar mobiliarios asociados
  const handleView = async (apartamento) => {
    setSelectedApartamento(apartamento)
    try {
      const data = await mobiliarioService.getMobiliariosPorApartamento(apartamento._id)
      setMobiliarios(data)
    } catch (error) {
      console.error("Error al obtener mobiliarios asociados", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los mobiliarios asociados.",
      })
    }
    setOpenDetails(true)
  }

  const handleCloseDetails = () => {
    setOpenDetails(false)
    setSelectedApartamento(null)
    setMobiliarios([])
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    // Validación específica para campos numéricos
    if (["NumeroApto", "Piso", "Tarifa"].includes(name)) {
      // Verificar que sea un número válido
      if (value === "" || /^\d+$/.test(value)) {
        newValue = value === "" ? "" : Number(value)
      } else {
        // Si no es un número válido, mantener el valor anterior
        return
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Validar el campo que cambió
    validateField(name, newValue)
  }

  // Función para validar campos individuales
  const validateField = async (name, value) => {
    let errorMessage = ""

    if (name === "NumeroApto") {
      if (!value) {
        errorMessage = "El número de apartamento es obligatorio"
      } else {
        // Verificar si el número de apartamento ya existe
        try {
          // Solo verificar duplicados si estamos creando un nuevo apartamento o cambiando el número
          if (!editingId || (editingId && formData.NumeroApto !== value)) {
            const existingApartamentos = apartamentos.filter(
              (apt) => apt.NumeroApto === value && apt.Tipo === formData.Tipo,
            )

            if (existingApartamentos.length > 0) {
              errorMessage = `El apartamento número ${value} ya existe para el tipo ${formData.Tipo}`
            }
          }
        } catch (error) {
          console.error("Error al verificar duplicados:", error)
        }
      }
    } else if (name === "Piso") {
      if (!value) {
        errorMessage = "El piso es obligatorio"
      } else if (value <= 0) {
        errorMessage = "El piso debe ser un número positivo"
      }
    } else if (name === "Tarifa") {
      if (!value) {
        errorMessage = "La tarifa es obligatoria"
      } else if (value <= 0) {
        errorMessage = "La tarifa debe ser un valor positivo"
      } else if (!/^\d+$/.test(String(value))) {
        errorMessage = "La tarifa solo debe contener números"
      }
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    if (errorMessage) {
      // Mostrar SweetAlert2 en tiempo real
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

    setTimeout(() => {
      validateForm({
        ...formData,
        [name]: value,
      })
    }, 0)

    return !errorMessage
  }

  // Validar todo el formulario
  const validateForm = (data) => {
    const isValid = data.NumeroApto && data.Piso && data.Tarifa
    setIsFormValid(isValid)
  }

  // Enviar formulario para crear o actualizar apartamento
  const handleSubmit = async () => {
    const tempErrors = {}

    if (!formData.NumeroApto) {
      tempErrors.NumeroApto = "El número de apartamento es obligatorio"
    } else {
      // Verificar duplicados antes de enviar
      const existingApartamentos = apartamentos.filter(
        (apt) => apt.NumeroApto === formData.NumeroApto && apt.Tipo === formData.Tipo && apt._id !== editingId, // Excluir el apartamento actual si estamos editando
      )

      if (existingApartamentos.length > 0) {
        tempErrors.NumeroApto = `El apartamento número ${formData.NumeroApto} ya existe para el tipo ${formData.Tipo}`
      }
    }

    if (!formData.Piso) {
      tempErrors.Piso = "El piso es obligatorio"
    } else if (formData.Piso <= 0) {
      tempErrors.Piso = "El piso debe ser un número positivo"
    }

    if (!formData.Tarifa) {
      tempErrors.Tarifa = "La tarifa es obligatoria"
    } else if (formData.Tarifa <= 0) {
      tempErrors.Tarifa = "La tarifa debe ser un valor positivo"
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)
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
      if (editingId) {
        await apartamentoService.updateApartamento(editingId, formData)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El apartamento se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await apartamentoService.createApartamento(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El apartamento se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchApartamentos()
      handleClose()
    } catch (error) {
      console.error("Error saving apartamento", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el apartamento.",
      })
    }
  }

  // Eliminar (dar de baja) apartamento (si está activo no se permite la eliminación)
  const handleDelete = async (id, Estado) => {
    if (Estado === true) {
      Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No se puede eliminar un apartamento activo.",
      })
      return
    }
    const confirmDelete = await Swal.fire({
      title: "¿Eliminar apartamento?",
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
        await apartamentoService.darDeBajaApartamento(id)
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El apartamento se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchApartamentos()
      } catch (error) {
        console.error("Error deleting apartamento", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al eliminar el apartamento.",
        })
      }
    }
  }

  // Filtrar por la pestaña activa y por búsqueda
  const filteredApartamentos = apartamentos.filter(
    (a) =>
      a.Tipo === activeTab &&
      (searchTerm === "" ||
        a.NumeroApto.toString().includes(searchTerm) ||
        a.Piso.toString().includes(searchTerm) ||
        a.Tarifa.toString().includes(searchTerm)),
  )

  const paginatedApartamentos = filteredApartamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Obtener el icono correspondiente para cada tipo de apartamento
  const getTabIcon = (tipo) => {
    switch (tipo) {
      case "Type 1":
        return <Home size={18} />
      case "Type 2":
        return <Building size={18} />
      case "Penthouse":
        return <Layers size={18} />
      default:
        return <Home size={18} />
    }
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Apartamentos
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los apartamentos del sistema
        </Typography>
      </Box>

      <div className={classes.searchContainer}>
        <TextField
          label="Buscar apartamento"
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
            Nuevo Apartamento
          </Button>
        </Box>
      </div>

      {/* Pestañas para los tipos de apartamento */}
      <Box className={classes.tabsContainer}>
        {["Type 1", "Type 2", "Penthouse"].map((tab) => (
          <Button
            key={tab}
            className={`${classes.tabButton} ${activeTab === tab ? classes.activeTabButton : ""}`}
            onClick={() => handleTabChange(tab)}
            startIcon={getTabIcon(tab)}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Tabla de apartamentos */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Apartamento</StyledTableCell>
              <StyledTableCell>Piso</StyledTableCell>
              <StyledTableCell>Tarifa</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedApartamentos.map((apartamento) => (
              <TableRow key={apartamento._id} className={classes.tableRow}>
                <ApartamentoTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.apartamentoContainer}>
                    <Avatar className={classes.apartamentoAvatar}>{getTabIcon(apartamento.Tipo)}</Avatar>
                    <Typography variant="body2">Apto {apartamento.NumeroApto}</Typography>
                  </Box>
                </ApartamentoTableCell>
                <TableCell className={classes.tableCell}>{apartamento.Piso}</TableCell>
                <TableCell className={classes.tableCell}>{formatTarifa(apartamento.Tarifa)}</TableCell>
                <TableCell className={classes.tableCell}>{apartamento.Estado ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar apartamento">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(apartamento)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleView(apartamento)}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar apartamento">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleDelete(apartamento._id, apartamento.Estado)}
                      >
                        <Delete size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredApartamentos.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={5} className={classes.noDataCell}>
                  No se encontraron apartamentos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredApartamentos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar apartamento - Diseño actualizado según usuario-list.tsx */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" classes={{ paper: classes.dialogPaper }}>
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Apartamento" : "Nuevo Apartamento"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección de Información Básica */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Home size={20} />
              Información Básica
            </Typography>

            <FormControl fullWidth variant="outlined" className={classes.formField}>
              <InputLabel id="tipo-label">Tipo de Apartamento</InputLabel>
              <Select
                labelId="tipo-label"
                name="Tipo"
                value={formData.Tipo}
                onChange={handleChange}
                label="Tipo de Apartamento"
                fullWidth
              >
                {tipoApartamentos.length > 0 ? (
                  tipoApartamentos.map((tipo) => (
                    <MenuItem key={tipo._id} value={tipo.nombre}>
                      {tipo.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="Type 1">Type 1</MenuItem>
                    <MenuItem value="Type 2">Type 2</MenuItem>
                    <MenuItem value="Penthouse">Penthouse</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>

            <TextField
              className={classes.formField}
              margin="dense"
              label="Número de Apartamento"
              name="NumeroApto"
              value={formData.NumeroApto}
              onChange={handleChange}
              onBlur={() => validateField("NumeroApto", formData.NumeroApto)}
              fullWidth
              type="number"
              variant="outlined"
              error={!!formErrors.NumeroApto}
              helperText={formErrors.NumeroApto}
              required
              InputProps={{
                inputProps: { min: 1 },
              }}
            />
          </Box>

          {/* Sección de Ubicación y Tarifa */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Building size={20} />
              Ubicación y Tarifa
            </Typography>

            <TextField
              className={classes.formField}
              margin="dense"
              label="Piso"
              name="Piso"
              value={formData.Piso}
              onChange={handleChange}
              onBlur={() => validateField("Piso", formData.Piso)}
              fullWidth
              type="number"
              variant="outlined"
              error={!!formErrors.Piso}
              helperText={formErrors.Piso}
              required
              InputProps={{
                inputProps: { min: 1 },
              }}
            />

            <TextField
              className={classes.formField}
              margin="dense"
              label="Tarifa"
              name="Tarifa"
              value={formData.Tarifa}
              onChange={handleChange}
              onBlur={() => validateField("Tarifa", formData.Tarifa)}
              fullWidth
              type="number"
              variant="outlined"
              error={!!formErrors.Tarifa}
              helperText={formErrors.Tarifa}
              required
              InputProps={{
                inputProps: { min: 1 },
              }}
            />

            <FormControl fullWidth variant="outlined" className={classes.formField}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                name="Estado"
                value={formData.Estado}
                onChange={handleChange}
                label="Estado"
                fullWidth
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </Select>
            </FormControl>
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

      {/* Modal de detalles (solo lectura) - Diseño actualizado según usuario-list.tsx */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
        classes={{ paper: classes.dialogPaperLarge }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Apartamento
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedApartamento ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getTabIcon(selectedApartamento.Tipo)}</Avatar>
                <Typography className={classes.detailsName}>Apartamento {selectedApartamento.NumeroApto}</Typography>
                <Typography className={classes.detailsDescription}>
                  {selectedApartamento.Tipo} - Piso {selectedApartamento.Piso}
                </Typography>
                <Chip
                  label={selectedApartamento.Estado ? "Activo" : "Inactivo"}
                  className={`${classes.estadoChip} ${
                    selectedApartamento.Estado ? classes.estadoActivo : classes.estadoInactivo
                  }`}
                  style={{ marginTop: "8px" }}
                />
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3} className={classes.detailsGrid}>
                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Home size={20} />
                      Tipo
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedApartamento.Tipo}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Layers size={20} />
                      Piso
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedApartamento.Piso}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <DollarSign size={20} />
                      Tarifa
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {formatTarifa(selectedApartamento.Tarifa)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography className={classes.sectionTitle} style={{ marginTop: "24px" }}>
                <FileText size={20} />
                Mobiliarios Asociados
              </Typography>

              {/* Tabla de mobiliarios asociados - Con encabezado azul sólido */}
              <TableContainer component={Paper} className={classes.tableContainerDetails}>
                <Table style={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          width: "20%",
                          padding: "16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderBottom: "none",
                        }}
                      >
                        Nombre
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          width: "20%",
                          padding: "16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderBottom: "none",
                        }}
                      >
                        Ident. Mobiliario
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          width: "15%",
                          padding: "16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderBottom: "none",
                        }}
                      >
                        Estado
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          width: "25%",
                          padding: "16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderBottom: "none",
                        }}
                      >
                        Observación
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          width: "20%",
                          padding: "16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderBottom: "none",
                        }}
                      >
                        Última actualización
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mobiliarios
                      .filter((mob) => mob.estado !== "Inactivo")
                      .map((mob) => {
                        const updatedDate = new Date(mob.updatedAt)
                        const currentDate = new Date()
                        const diffTime = currentDate - updatedDate
                        const diffDays = diffTime / (1000 * 60 * 60 * 24)

                        const cellStyle =
                          mob.estado === "Mantenimiento" && diffDays > 1
                            ? { backgroundColor: "#fee2e2", color: "#991b1b" }
                            : {}

                        return (
                          <tr key={mob._id}>
                            <TableCell style={{ width: "20%", padding: "16px" }}>{mob.nombre}</TableCell>
                            <TableCell style={{ width: "20%", padding: "16px" }}>{mob.identMobiliario}</TableCell>
                            <TableCell style={{ width: "15%", padding: "16px" }}>{mob.estado}</TableCell>
                            <TableCell style={{ width: "25%", padding: "16px" }}>{mob.observacion}</TableCell>
                            <TableCell style={{ width: "20%", padding: "16px", ...cellStyle }}>
                              {mob.updatedAt ? new Date(mob.updatedAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                          </tr>
                        )
                      })}
                    {mobiliarios.filter((mob) => mob.estado !== "Inactivo").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" style={{ padding: "24px" }}>
                          No hay mobiliarios asociados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography variant="body1">Cargando detalles...</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedApartamento && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedApartamento)
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

export default ApartamentoList
