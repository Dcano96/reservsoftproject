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
  InputAdornment,
  Grid,
  Chip,
  Card,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
} from "@material-ui/core"
import {
  Edit,
  Info,
  X,
  Search,
  FolderSyncIcon as Sync,
  Eye,
  DollarSign,
  DoorClosedIcon as CloseIcon,
  UploadIcon,
  CheckIcon,
  BugIcon as ErrorIcon,
} from "lucide-react"
import Swal from "sweetalert2"
import pagoService from "./pago.service"
import "./pagos.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  AssignmentInd,
  CalendarToday,
  VerifiedUser,
  AttachMoney,
  Payment,
  Receipt,
  EventNote,
  Visibility,
} from "@material-ui/icons"

// Personalización de las celdas del encabezado
const StyledTableCell = withStyles((theme) => ({
  head: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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

const useStyles = makeStyles((theme) => ({
  container: {
    fontFamily: '"Inter", "Montserrat", sans-serif',
    marginTop: theme.spacing(0),
    padding: theme.spacing(3),
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
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(1),
    textAlign: "center",
    background: "linear-gradient(to right, #2563eb, #1d4ed8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  pageSubtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    textAlign: "center",
  },
  // Estilos para comprobantes
  comprobanteCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  comprobanteAvatar: {
    width: 40,
    height: 40,
    cursor: "pointer",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  comprobanteDisponible: {
    backgroundColor: "#10b981",
  },
  comprobanteNoDisponible: {
    backgroundColor: "#ef4444",
  },
  comprobanteButton: {
    minWidth: "auto",
    padding: theme.spacing(0.5),
    borderRadius: "50%",
  },
  // Modal de comprobante
  comprobanteModal: {
    borderRadius: theme.spacing(2),
    maxWidth: "800px",
    width: "100%",
  },
  comprobanteModalTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: theme.spacing(3),
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: "#fff",
  },
  imageContainer: {
    position: "relative",
    marginBottom: theme.spacing(2),
  },
  comprobanteImage: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    borderRadius: theme.spacing(1),
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    },
  },
  placeholderImage: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f1f5f9",
    border: "2px dashed #cbd5e1",
    borderRadius: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#64748b",
  },
  fileInput: {
    display: "none",
  },
  uploadButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
    marginBottom: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  previewButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },
  editButton: {
    backgroundColor: "#10b981",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#059669",
    },
  },
  saveButton: {
    backgroundColor: "#059669",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#047857",
    },
  },
  cancelButton: {
    color: "#64748b",
    "&:hover": {
      backgroundColor: "rgba(100, 116, 139, 0.1)",
    },
  },
  statusChip: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  },
  validChip: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#059669",
  },
  invalidChip: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing(1),
  },
  imageInfo: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(0.5),
  },
  // Estilos existentes...
  statsContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    border: "1px solid #e2e8f0",
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    },
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(0.5),
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    "& .MuiTabs-indicator": {
      background: "linear-gradient(to right, #2563eb, #1d4ed8)",
      height: 3,
    },
  },
  tab: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "1rem",
    "&.Mui-selected": {
      color: "#2563eb",
    },
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
  syncButton: {
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "#fff",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(5, 150, 105, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #047857, #065f46)",
      boxShadow: "0 6px 15px rgba(5, 150, 105, 0.4)",
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
  actionsCell: {
    minWidth: 200,
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
  btnDetails: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },
  btnHistorial: {
    backgroundColor: "#8b5cf6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#7c3aed",
    },
  },
  // Chips para estado
  realizadoChip: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#059669",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  pendienteChip: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#d97706",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
  anuladoChip: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  fallidoChip: {
    backgroundColor: "rgba(107, 114, 128, 0.15)",
    color: "#374151",
    border: "1px solid rgba(107, 114, 128, 0.3)",
  },
  // Chips para origen
  origenChip: {
    fontWeight: 500,
    fontSize: "0.8rem",
  },
  landingChip: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#2563eb",
  },
  reservasChip: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    color: "#7c3aed",
  },
  adminChip: {
    backgroundColor: "rgba(107, 114, 128, 0.15)",
    color: "#374151",
  },
  dialogPaper: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    maxWidth: "900px",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: theme.spacing(3),
    fontSize: "1.5rem",
    fontWeight: 600,
    position: "relative",
  },
  dialogContent: {
    padding: theme.spacing(4),
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
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 600,
    padding: "8px 24px",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    },
  },
  // Resto de estilos existentes...
  historialItem: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    position: "relative",
  },
  historialHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  historialTipo: {
    fontWeight: 600,
    color: "#1e293b",
    textTransform: "capitalize",
  },
  historialFecha: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  historialMonto: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#059669",
  },
  comprobanteContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: "#fff",
    borderRadius: theme.spacing(1),
    border: "1px solid #d1d5db",
  },
  noDataContainer: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
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
    backgroundColor: "rgba(243, 244, 246, 0.5)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
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
}))

// Componente para Tab Panel
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const PagosList = () => {
  const classes = useStyles()

  // Estados principales
  const [tabValue, setTabValue] = useState(0)
  const [pagos, setPagos] = useState([])
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Estados para modales
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [historialOpen, setHistorialOpen] = useState(false)
  const [comprobanteOpen, setComprobanteOpen] = useState(false)
  const [selectedPago, setSelectedPago] = useState(null)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [historialData, setHistorialData] = useState(null)
  const [editingId, setEditingId] = useState(null)

  // Estados para comprobante
  const [comprobanteData, setComprobanteData] = useState({
    file: null,
    preview: "",
    editMode: false,
    loading: false,
    validando: false,
    valido: false,
    error: "",
    imageInfo: null,
  })

  // Estados para formulario
  const [formData, setFormData] = useState({
    fecha: "",
    reserva: "",
    estado: "pendiente",
    monto: "",
    metodo_pago: "transferencia",
    comprobante: "",
    notas: "",
    origen: "admin",
  })

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_pagos: 0,
    monto_total: 0,
    pagos_pendientes: 0,
    pagos_realizados: 0,
  })

  // Estados para validación de formulario
  const [formErrors, setFormErrors] = useState({
    fecha: "",
    reserva: "",
    estado: "",
    monto: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)
  const [shouldValidate, setShouldValidate] = useState(false)

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: "",
    origen: "",
    fecha_inicio: "",
    fecha_fin: "",
  })

  // Función para formatear a moneda COP
  const formatCOP = (value) => {
    const formatter = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    })
    return formatter.format(value)
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchPagos()
    fetchReservas()
    fetchEstadisticas()
  }, [page, rowsPerPage, tabValue])

  // Función para obtener pagos con filtros según tab
  const fetchPagos = async () => {
    setLoading(true)
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filtros,
      }

      // Aplicar filtro según tab activo
      switch (tabValue) {
        case 1:
          params.origen = "landing"
          break
        case 2:
          params.origen = "reservas"
          break
        case 3:
          params.origen = "admin"
          break
        default:
          // Tab 0: todos los pagos
          break
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await pagoService.getPagos(params)

      if (response.pagos) {
        setPagos(response.pagos)
        setTotalItems(response.pagination?.total_items || 0)
      } else {
        // Formato anterior para compatibilidad
        setPagos(response)
        setTotalItems(response.length)
      }
    } catch (error) {
      console.error("Error al cargar pagos:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pagos",
        confirmButtonColor: "#2563eb",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/reservas", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setReservas(data)
    } catch (error) {
      console.error("Error fetching reservas", error)
    }
  }

  // Función para obtener estadísticas
  const fetchEstadisticas = async () => {
    try {
      const stats = await pagoService.getEstadisticas(filtros.fecha_inicio, filtros.fecha_fin)

      // Procesar estadísticas
      const estadisticasProcesadas = {
        total_pagos: 0,
        monto_total: 0,
        pagos_pendientes: 0,
        pagos_realizados: 0,
      }

      if (stats.por_estado) {
        stats.por_estado.forEach((stat) => {
          estadisticasProcesadas.total_pagos += stat.total_pagos
          estadisticasProcesadas.monto_total += stat.monto_total

          if (stat._id === "realizado") {
            estadisticasProcesadas.pagos_realizados = stat.total_pagos
          } else if (stat._id === "pendiente") {
            estadisticasProcesadas.pagos_pendientes = stat.total_pagos
          }
        })
      }

      setEstadisticas(estadisticasProcesadas)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  // Función para ver historial de una reserva
  const verHistorial = async (reservaId) => {
    try {
      setLoading(true)
      const historial = await pagoService.getHistorialReserva(reservaId)
      setHistorialData(historial)
      setSelectedReserva(reservaId)
      setHistorialOpen(true)
    } catch (error) {
      console.error("Error al cargar historial:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el historial de pagos",
        confirmButtonColor: "#2563eb",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para sincronizar pagos
  const sincronizarPagos = async () => {
    const result = await Swal.fire({
      title: "¿Sincronizar pagos?",
      text: "Esto actualizará todos los pagos con la información de las reservas y comprobantes",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, sincronizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)
        const response = await pagoService.sincronizarPagos()

        Swal.fire({
          icon: "success",
          title: "Sincronización completada",
          text: response.msg,
          confirmButtonColor: "#2563eb",
        })

        fetchPagos()
        fetchEstadisticas()
      } catch (error) {
        console.error("Error en sincronización:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error durante la sincronización",
          confirmButtonColor: "#2563eb",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  // Función para ver comprobante
  const verComprobante = (pago) => {
    setSelectedPago(pago)
    setComprobanteData({
      file: null,
      preview: pago.comprobante || "",
      editMode: false,
      loading: false,
      validando: false,
      valido: !!pago.comprobante_valido,
      error: "",
      imageInfo: null,
    })
    setComprobanteOpen(true)
  }

  // Función para manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setComprobanteData((prev) => ({
          ...prev,
          error: "Por favor seleccione un archivo de imagen válido",
        }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setComprobanteData((prev) => ({
          ...prev,
          error: "El archivo es demasiado grande. Máximo 5MB permitido",
        }))
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setComprobanteData((prev) => ({
          ...prev,
          file: file,
          preview: e.target.result,
          valido: true,
          error: "",
          imageInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para guardar comprobante
  const guardarComprobante = async () => {
    if (!comprobanteData.file && !comprobanteData.preview) {
      setComprobanteData((prev) => ({ ...prev, error: "Debe seleccionar una imagen" }))
      return
    }

    setComprobanteData((prev) => ({ ...prev, loading: true }))

    try {
      let comprobanteUrl = comprobanteData.preview

      // Si hay un archivo nuevo, subirlo
      if (comprobanteData.file) {
        const formData = new FormData()
        formData.append("comprobante", comprobanteData.file)
        formData.append("pagoId", selectedPago._id)

        const uploadResponse = await pagoService.subirComprobante(formData)
        comprobanteUrl = uploadResponse.url
      }

      await pagoService.updatePago(selectedPago._id, { comprobante: comprobanteUrl })

      // Actualizar el pago en la lista
      setPagos((prev) =>
        prev.map((pago) =>
          pago._id === selectedPago._id
            ? { ...pago, comprobante: comprobanteUrl, comprobante_disponible: true, comprobante_valido: true }
            : pago,
        ),
      )

      setComprobanteData((prev) => ({
        ...prev,
        editMode: false,
        loading: false,
        error: "",
        preview: comprobanteUrl,
      }))

      Swal.fire({
        icon: "success",
        title: "Comprobante actualizado",
        text: "El comprobante se guardó correctamente",
        confirmButtonColor: "#2563eb",
      })
    } catch (error) {
      setComprobanteData((prev) => ({
        ...prev,
        loading: false,
        error: error.msg || "Error al guardar el comprobante",
      }))
    }
  }

  const handleOpen = (pago) => {
    setShouldValidate(true)

    setFormErrors({
      fecha: "",
      reserva: "",
      estado: "",
      monto: "",
    })

    if (pago) {
      setFormData({
        fecha: pago.fecha ? new Date(pago.fecha).toISOString().split("T")[0] : "",
        reserva: pago.reserva ? pago.reserva._id || pago.reserva : "",
        estado: pago.estado || "pendiente",
        monto: pago.monto || "",
        metodo_pago: pago.metodo_pago || "transferencia",
        comprobante: pago.comprobante || "",
        notas: pago.notas || "",
        origen: pago.origen || "admin",
      })
      setEditingId(pago._id)
      setIsFormValid(true)
    } else {
      setFormData({
        fecha: "",
        reserva: "",
        estado: "pendiente",
        monto: "",
        metodo_pago: "transferencia",
        comprobante: "",
        notas: "",
        origen: "admin",
      })
      setEditingId(null)
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setShouldValidate(false)
    Swal.close()
    setOpen(false)

    setTimeout(() => {
      setFormErrors({
        fecha: "",
        reserva: "",
        estado: "",
        monto: "",
      })
      setFormData({
        fecha: "",
        reserva: "",
        estado: "pendiente",
        monto: "",
        metodo_pago: "transferencia",
        comprobante: "",
        notas: "",
        origen: "admin",
      })
      setEditingId(null)
      setIsFormValid(false)
    }, 100)
  }

  const handleDetails = (pago) => {
    setSelectedPago(pago)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setTimeout(() => {
      setSelectedPago(null)
    }, 100)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (shouldValidate) {
      validateField(name, value)
    }
  }

  const validateField = (name, value) => {
    if (!shouldValidate) return true

    let errorMessage = ""
    switch (name) {
      case "fecha":
        if (!value.trim()) {
          errorMessage = "La fecha es obligatoria"
        }
        break
      case "reserva":
        if (!value.trim()) {
          errorMessage = "La reserva es obligatoria"
        }
        break
      case "estado":
        if (!value.trim()) {
          errorMessage = "El estado es obligatorio"
        }
        break
      case "monto":
        if (!value || isNaN(value) || Number.parseFloat(value) <= 0) {
          errorMessage = "El monto debe ser un número mayor a 0"
        }
        break
      default:
        break
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    if (errorMessage && shouldValidate) {
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

  const validateForm = (data) => {
    if (!shouldValidate) return

    const isValid =
      data.fecha.trim() !== "" &&
      data.reserva.trim() !== "" &&
      data.estado.trim() !== "" &&
      data.monto &&
      !isNaN(data.monto) &&
      Number.parseFloat(data.monto) > 0
    setIsFormValid(isValid)
  }

  const handleSubmit = async () => {
    setShouldValidate(true)

    const tempErrors = {}
    if (!formData.fecha.trim()) {
      tempErrors.fecha = "La fecha es obligatoria"
    }
    if (!formData.reserva.trim()) {
      tempErrors.reserva = "La reserva es obligatoria"
    }
    if (!formData.estado.trim()) {
      tempErrors.estado = "El estado es obligatorio"
    }
    if (!formData.monto || isNaN(formData.monto) || Number.parseFloat(formData.monto) <= 0) {
      tempErrors.monto = "El monto debe ser un número mayor a 0"
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
        const updatedPago = await pagoService.updatePago(editingId, formData)
        setPagos((prev) => prev.map((pago) => (pago._id === editingId ? updatedPago : pago)))
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El pago se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        const newPago = await pagoService.createPago(formData)
        fetchPagos() // Recargar para obtener datos completos
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El pago se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      handleClose()
      fetchEstadisticas()
    } catch (error) {
      console.error("Error saving pago", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.msg || "Ocurrió un error al guardar el pago.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  // Función para obtener chip de estado
  const getEstadoChip = (estado) => {
    const chipClass =
      estado === "realizado"
        ? classes.realizadoChip
        : estado === "pendiente"
          ? classes.pendienteChip
          : estado === "anulado"
            ? classes.anuladoChip
            : classes.fallidoChip

    return (
      <Chip
        label={estado.charAt(0).toUpperCase() + estado.slice(1)}
        className={`${classes.statusChip} ${chipClass}`}
        size="small"
      />
    )
  }

  // Función para obtener chip de origen
  const getOrigenChip = (origen) => {
    const chipClass =
      origen === "landing" ? classes.landingChip : origen === "reservas" ? classes.reservasChip : classes.adminChip

    return (
      <Chip
        label={origen.charAt(0).toUpperCase() + origen.slice(1)}
        className={`${classes.origenChip} ${chipClass}`}
        size="small"
      />
    )
  }

  const filteredPagos = pagos.filter(
    (pago) => pago.estado && pago.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Box className={classes.container}>
      {/* Header */}
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Sistema de Pagos Completo
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Gestión integral de pagos desde landing page, reservas y administración
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Box className={classes.statsContainer}>
        <Card className={classes.statCard}>
          <Box className={classes.statIcon} style={{ backgroundColor: "#2563eb" }}>
            <Receipt />
          </Box>
          <Box className={classes.statContent}>
            <Typography className={classes.statValue}>{estadisticas.total_pagos}</Typography>
            <Typography className={classes.statLabel}>Total Pagos</Typography>
          </Box>
        </Card>

        <Card className={classes.statCard}>
          <Box className={classes.statIcon} style={{ backgroundColor: "#059669" }}>
            <DollarSign />
          </Box>
          <Box className={classes.statContent}>
            <Typography className={classes.statValue}>{formatCOP(estadisticas.monto_total)}</Typography>
            <Typography className={classes.statLabel}>Monto Total</Typography>
          </Box>
        </Card>

        <Card className={classes.statCard}>
          <Box className={classes.statIcon} style={{ backgroundColor: "#16a34a" }}>
            <AttachMoney />
          </Box>
          <Box className={classes.statContent}>
            <Typography className={classes.statValue}>{estadisticas.pagos_realizados}</Typography>
            <Typography className={classes.statLabel}>Realizados</Typography>
          </Box>
        </Card>
      </Box>

      {/* Tabs */}
      <Box className={classes.tabsContainer}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue)
            setPage(0) // Reset page when changing tabs
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Todos los Pagos" className={classes.tab} />
          <Tab label="Desde Landing" className={classes.tab} />
          <Tab label="Desde Reservas" className={classes.tab} />
        </Tabs>
      </Box>

      {/* Controles */}
      <Box className={classes.searchContainer}>
        <TextField
          label="Buscar por estado"
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
            className={classes.syncButton}
            onClick={sincronizarPagos}
            startIcon={<Sync size={20} />}
            disabled={loading}
          >
            Sincronizar
          </Button>
        </Box>
      </Box>

      {/* Tabla de Pagos */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Fecha</StyledTableCell>
              <StyledTableCell>Reserva</StyledTableCell>
              <StyledTableCell>Monto</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Origen</StyledTableCell>
              <StyledTableCell>Tipo</StyledTableCell>
              <StyledTableCell>Comprobante</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className={classes.loadingContainer}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredPagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className={classes.noDataContainer}>
                  <Typography variant="h6">No se encontraron pagos</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPagos.map((pago) => (
                <TableRow key={pago._id} className={classes.tableRow}>
                  <TableCell>{new Date(pago.fecha).toLocaleDateString("es-CO")}</TableCell>
                  <TableCell>
                    {pago.reserva ? (
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          #{pago.reserva.numero_reserva}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {pago.reserva.titular_reserva}
                        </Typography>
                      </Box>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: 600, color: "#059669" }}>
                      {formatCOP(pago.monto)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getEstadoChip(pago.estado)}</TableCell>
                  <TableCell>{getOrigenChip(pago.origen)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" style={{ textTransform: "capitalize" }}>
                      {pago.tipo_pago?.replace("_", " ")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className={classes.comprobanteCell}>
                      <Avatar
                        className={`${classes.comprobanteAvatar} ${
                          pago.comprobante_disponible ? classes.comprobanteDisponible : classes.comprobanteNoDisponible
                        }`}
                        onClick={() => pago.comprobante_disponible && verComprobante(pago)}
                      >
                        <CheckIcon />
                      </Avatar>
                      {!pago.comprobante_disponible && (
                        <Typography variant="caption" color="textSecondary">
                          Sin comprobante
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className={classes.actionsCell}>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Editar pago">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnEdit}`}
                          onClick={() => handleOpen(pago)}
                        >
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDetails}`}
                          onClick={() => handleDetails(pago)}
                        >
                          <Info size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver historial">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnHistorial}`}
                          onClick={() => verHistorial(pago.reserva?._id)}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component={Paper}
        count={totalItems}
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

      {/* Modal para crear/editar pago */}
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          classes={{ paper: classes.dialogPaper }}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle className={classes.dialogTitle}>
            {editingId ? "Editar Pago" : "Agregar Pago"}
            <IconButton onClick={handleClose} className={classes.closeButton}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <Payment />
                Información del Pago
              </Typography>
              <TextField
                className={classes.formField}
                margin="dense"
                label="Fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                error={!!formErrors.fecha}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className={classes.formField}
                margin="dense"
                label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.monto}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <EventNote />
                Detalles de la Reserva
              </Typography>
              <TextField
                className={classes.formField}
                select
                margin="dense"
                label="Reserva"
                name="reserva"
                value={formData.reserva}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!formErrors.reserva}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              >
                {reservas.length > 0 ? (
                  reservas.map((reserva) => (
                    <MenuItem key={reserva._id} value={reserva._id}>
                      {reserva.numero_reserva} - {reserva.titular_reserva}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No hay reservas disponibles</MenuItem>
                )}
              </TextField>
            </Box>

            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <AssignmentInd />
                Estado y Método
              </Typography>
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
                error={!!formErrors.estado}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUser className={classes.fieldIcon} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="realizado">Realizado</MenuItem>
                <MenuItem value="fallido">Fallido</MenuItem>
              </TextField>

              <TextField
                className={classes.formField}
                select
                margin="dense"
                label="Método de Pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>

              <TextField
                className={classes.formField}
                select
                margin="dense"
                label="Origen"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="landing">Landing Page</MenuItem>
                <MenuItem value="reservas">Módulo Reservas</MenuItem>
              </TextField>

              <TextField
                className={classes.formField}
                margin="dense"
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                placeholder="Notas adicionales sobre el pago..."
              />
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
      )}

      {/* Modal de detalles */}
      {detailsOpen && selectedPago && (
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          fullWidth
          maxWidth="sm"
          classes={{ paper: classes.dialogPaper }}
        >
          <DialogTitle className={classes.dialogTitle}>
            Detalles del Pago
            <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box className={classes.detailsRow}>
                  <Typography className={classes.detailsLabel}>Monto:</Typography>
                  <Typography className={classes.detailsValue}>{formatCOP(selectedPago.monto)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className={classes.detailsRow}>
                  <Typography className={classes.detailsLabel}>Fecha:</Typography>
                  <Typography className={classes.detailsValue}>
                    {new Date(selectedPago.fecha).toLocaleDateString("es-CO")}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className={classes.detailsRow}>
                  <Typography className={classes.detailsLabel}>Estado:</Typography>
                  <Typography className={classes.detailsValue}>{getEstadoChip(selectedPago.estado)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className={classes.detailsRow}>
                  <Typography className={classes.detailsLabel}>Origen:</Typography>
                  <Typography className={classes.detailsValue}>{getOrigenChip(selectedPago.origen)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className={classes.detailsRow}>
                  <Typography className={classes.detailsLabel}>Método:</Typography>
                  <Typography className={classes.detailsValue}>{selectedPago.metodo_pago}</Typography>
                </Box>
              </Grid>
              {selectedPago.reserva && (
                <Grid item xs={12}>
                  <Box className={classes.detailsRow}>
                    <Typography className={classes.detailsLabel}>Reserva:</Typography>
                    <Typography className={classes.detailsValue}>
                      #{selectedPago.reserva.numero_reserva} - {selectedPago.reserva.titular_reserva}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {selectedPago.comprobante && (
                <Grid item xs={12}>
                  <Box className={classes.detailsRow}>
                    <Typography className={classes.detailsLabel}>Comprobante:</Typography>
                    <Button size="small" startIcon={<Visibility />} onClick={() => verComprobante(selectedPago)}>
                      Ver Comprobante
                    </Button>
                  </Box>
                </Grid>
              )}
              {selectedPago.notas && (
                <Grid item xs={12}>
                  <Box className={classes.detailsRow}>
                    <Typography className={classes.detailsLabel}>Notas:</Typography>
                    <Typography className={classes.detailsValue}>{selectedPago.notas}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button onClick={handleCloseDetails} className={classes.cancelButton}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedPago)
              }}
              className={classes.submitButton}
            >
              Editar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Modal de Comprobante */}
      <Dialog
        open={comprobanteOpen}
        onClose={() => setComprobanteOpen(false)}
        maxWidth="md"
        fullWidth
        classes={{ paper: classes.comprobanteModal }}
      >
        <DialogTitle className={classes.comprobanteModalTitle}>
          {comprobanteData.editMode ? "Editar Comprobante de Pago" : "Ver Comprobante de Pago"}
          <IconButton onClick={() => setComprobanteOpen(false)} className={classes.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ padding: "24px" }}>
          {comprobanteData.error && (
            <Box
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                borderRadius: "8px",
                color: "#dc2626",
              }}
            >
              {comprobanteData.error}
            </Box>
          )}

          {comprobanteData.editMode ? (
            <Box>
              <input
                accept="image/*"
                className={classes.fileInput}
                id="comprobante-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="comprobante-file-input">
                <Button
                  variant="contained"
                  component="span"
                  className={classes.uploadButton}
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  Seleccionar Imagen del Comprobante
                </Button>
              </label>

              {comprobanteData.preview && (
                <Box className={classes.imageContainer} style={{ marginTop: "16px" }}>
                  {comprobanteData.loading && (
                    <Box className={classes.loadingOverlay}>
                      <CircularProgress />
                    </Box>
                  )}

                  <Chip
                    icon={comprobanteData.valido ? <CheckIcon /> : <ErrorIcon />}
                    label={comprobanteData.valido ? "Imagen válida" : "Imagen no válida"}
                    className={`${classes.statusChip} ${comprobanteData.valido ? classes.validChip : classes.invalidChip}`}
                    size="small"
                  />

                  <img
                    src={comprobanteData.preview || "/placeholder.svg"}
                    alt="Previsualización del comprobante"
                    className={classes.comprobanteImage}
                    onError={() => {
                      setComprobanteData((prev) => ({
                        ...prev,
                        valido: false,
                        error: "Error al cargar la imagen",
                      }))
                    }}
                  />

                  {comprobanteData.imageInfo && (
                    <Box className={classes.imageInfo}>
                      <Typography variant="caption" display="block">
                        <strong>Archivo:</strong> {comprobanteData.imageInfo.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>Tamaño:</strong> {(comprobanteData.imageInfo.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Typography variant="caption" display="block">
                        <strong>Tipo:</strong> {comprobanteData.imageInfo.type}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              {comprobanteData.preview ? (
                <Box className={classes.imageContainer}>
                  <img
                    src={comprobanteData.preview || "/placeholder.svg"}
                    alt="Comprobante de pago"
                    className={classes.comprobanteImage}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=400&text=Error+al+cargar+imagen"
                    }}
                  />
                </Box>
              ) : (
                <Box className={classes.placeholderImage}>
                  <ErrorIcon style={{ fontSize: "48px", marginBottom: "8px" }} />
                  <Typography variant="body2">No hay comprobante disponible</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions style={{ padding: "16px 24px" }}>
          {comprobanteData.editMode ? (
            <>
              <Button
                onClick={() => setComprobanteData((prev) => ({ ...prev, editMode: false, error: "" }))}
                className={classes.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarComprobante}
                disabled={!comprobanteData.valido || comprobanteData.loading}
                className={classes.saveButton}
                startIcon={comprobanteData.loading ? <CircularProgress size={20} /> : <CheckIcon />}
              >
                {comprobanteData.loading ? "Guardando..." : "Guardar"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setComprobanteOpen(false)} className={classes.cancelButton}>
                Cerrar
              </Button>
              <Button
                onClick={() => setComprobanteData((prev) => ({ ...prev, editMode: true }))}
                className={classes.editButton}
                startIcon={<Edit />}
              >
                Editar Comprobante
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Historial de Pagos */}
      <Dialog
        open={historialOpen}
        onClose={() => setHistorialOpen(false)}
        maxWidth="md"
        fullWidth
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Historial Completo de Pagos
          <IconButton onClick={() => setHistorialOpen(false)} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {historialData ? (
            <Box>
              {/* Información de la reserva */}
              <Card style={{ marginBottom: 24, padding: 16 }}>
                <Typography variant="h6" gutterBottom>
                  Reserva #{historialData.reserva?.numero_reserva}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Titular: {historialData.reserva?.titular_reserva}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Estado: {historialData.reserva?.estado}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total: {formatCOP(historialData.reserva?.total || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Pagado: {formatCOP(historialData.reserva?.pagos_parciales || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Resumen */}
              <Card style={{ marginBottom: 24, padding: 16, backgroundColor: "#f8fafc" }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de Pagos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">
                      Total Pagado
                    </Typography>
                    <Typography variant="h6" style={{ color: "#059669" }}>
                      {formatCOP(historialData.resumen?.total_pagado || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">
                      % Pagado
                    </Typography>
                    <Typography variant="h6" style={{ color: "#2563eb" }}>
                      {historialData.resumen?.porcentaje_pagado || 0}%
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">
                      Comprobantes
                    </Typography>
                    <Typography variant="h6">{historialData.resumen?.comprobantes_subidos || 0}</Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Historial de pagos */}
              <Typography variant="h6" gutterBottom>
                Historial de Transacciones
              </Typography>

              {historialData.historial && historialData.historial.length > 0 ? (
                historialData.historial.map((item, index) => (
                  <Box key={index} className={classes.historialItem}>
                    <Box className={classes.historialHeader}>
                      <Box>
                        <Typography className={classes.historialTipo}>
                          {item.tipo?.replace("_", " ") || "Pago"}
                        </Typography>
                        <Typography className={classes.historialFecha}>
                          {new Date(item.fecha).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography className={classes.historialMonto}>{formatCOP(item.monto || 0)}</Typography>
                        {getEstadoChip(item.estado)}
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        {getOrigenChip(item.origen)}
                        {item.metodo_pago && <Chip label={item.metodo_pago} size="small" style={{ marginLeft: 8 }} />}
                      </Box>

                      {item.comprobante && (
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => window.open(item.comprobante, "_blank")}
                        >
                          Ver Comprobante
                        </Button>
                      )}
                    </Box>

                    {item.comprobante && (
                      <Box className={classes.comprobanteContainer}>
                        <Typography variant="subtitle2" gutterBottom>
                          Comprobante de Pago
                        </Typography>
                        <img
                          src={item.comprobante || "/placeholder.svg"}
                          alt="Comprobante de pago"
                          className={classes.comprobanteImage}
                          onClick={() => window.open(item.comprobante, "_blank")}
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=200&width=400&text=Error+al+cargar+imagen"
                          }}
                        />
                        {item.fecha_comprobante && (
                          <Typography variant="caption" color="textSecondary">
                            Subido el: {new Date(item.fecha_comprobante).toLocaleDateString("es-CO")}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {item.notas && (
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Notas:</strong> {item.notas}
                        </Typography>
                      </Box>
                    )}

                    {item.procesado_por && (
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Procesado por: {item.procesado_por}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Box className={classes.noDataContainer}>
                  <Typography>No hay historial de pagos disponible</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setHistorialOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PagosList
