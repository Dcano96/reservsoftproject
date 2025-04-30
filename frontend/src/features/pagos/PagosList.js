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
  Divider,
  Grid,
  Avatar,
} from "@material-ui/core"
import { Edit, Delete, Info, X, Search, UserPlus } from "lucide-react"
import Swal from "sweetalert2"
import pagoService from "./pago.service"
import "./pagos.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  Person,
  AssignmentInd,
  CalendarToday,
  VerifiedUser,
  AttachMoney,
  Payment,
  Receipt,
  EventNote,
} from "@material-ui/icons"

// Personalización de las celdas del encabezado
const StyledTableCell = withStyles((theme) => ({
  head: {
    background: "#2563eb", // Azul sólido
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
  dialogPaper: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: theme.spacing(2.5, 3),
    fontSize: "1.5rem",
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
  },
  cancelButton: {
    color: "#64748b",
    fontWeight: 600,
    "&:hover": {
      background: "rgba(100, 116, 139, 0.1)",
    },
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
}))

const PagosList = () => {
  const classes = useStyles()
  const [pagos, setPagos] = useState([])
  const [reservas, setReservas] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedPago, setSelectedPago] = useState(null)
  const [editingId, setEditingId] = useState(null)
  // Los campos del formulario son: fecha, reserva y estado.
  const [formData, setFormData] = useState({
    fecha: "",
    reserva: "",
    estado: "pendiente",
  })
  // Estado para mostrar los datos completos de la reserva seleccionada
  const [selectedReservaData, setSelectedReservaData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  // Estados para validación de formulario
  const [formErrors, setFormErrors] = useState({
    fecha: "",
    reserva: "",
    estado: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)
  // Estado para controlar si se debe validar el formulario
  const [shouldValidate, setShouldValidate] = useState(false)

  // Función para formatear a moneda COP
  const formatCOP = (value) => {
    const formatter = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    })
    return formatter.format(value)
  }

  const fetchPagos = async () => {
    try {
      const data = await pagoService.getPagos()
      setPagos(data)
    } catch (error) {
      console.error("Error fetching pagos", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pagos.",
        confirmButtonColor: "#2563eb",
      })
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

  useEffect(() => {
    fetchPagos()
    fetchReservas()
  }, [])

  // Efecto para actualizar automáticamente los datos de la reserva en cada pago cuando cambie la información en "reservas"
  useEffect(() => {
    setPagos((prev) =>
      prev.map((pago) => {
        if (pago.reserva && typeof pago.reserva === "object") {
          const updatedReserva = reservas.find((r) => r._id.toString() === pago.reserva._id.toString())
          if (updatedReserva) {
            return { ...pago, reserva: updatedReserva }
          }
        }
        return pago
      }),
    )
  }, [reservas])

  // Efecto para actualizar de forma optimista el pago en la tabla mientras se edita
  useEffect(() => {
    if (editingId) {
      setPagos((prev) =>
        prev.map((pago) => (pago._id === editingId ? { ...pago, ...formData, reserva: selectedReservaData } : pago)),
      )
    }
  }, [formData, selectedReservaData, editingId])

  const handleOpen = (pago) => {
    // Activar validación cuando se abre el formulario para crear/editar
    setShouldValidate(true)

    setFormErrors({
      fecha: "",
      reserva: "",
      estado: "",
    })

    if (pago) {
      setFormData({
        fecha: pago.fecha ? new Date(pago.fecha).toISOString().split("T")[0] : "",
        reserva: pago.reserva ? pago.reserva._id || pago.reserva : "",
        estado: pago.estado || "pendiente",
      })
      setEditingId(pago._id)
      setSelectedReservaData(pago.reserva)
      setIsFormValid(true)
    } else {
      setFormData({
        fecha: "",
        reserva: "",
        estado: "pendiente",
      })
      setEditingId(null)
      setSelectedReservaData(null)
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => {
    // Desactivar validación al cerrar el formulario
    setShouldValidate(false)

    // Cerrar cualquier SweetAlert2 que pueda estar abierto
    Swal.close()

    // Cerrar el modal
    setOpen(false)

    // Limpiar estados después de un breve retraso para evitar problemas de renderizado
    setTimeout(() => {
      setFormErrors({
        fecha: "",
        reserva: "",
        estado: "",
      })
      setFormData({
        fecha: "",
        reserva: "",
        estado: "pendiente",
      })
      setEditingId(null)
      setSelectedReservaData(null)
      setIsFormValid(false)
    }, 100)
  }

  const handleDetails = (pago) => {
    setSelectedPago(pago)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    // Cerrar el modal de detalles
    setDetailsOpen(false)

    // Limpiar el estado después de un breve retraso
    setTimeout(() => {
      setSelectedPago(null)
    }, 100)
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "reserva") {
      setFormData({ ...formData, reserva: value })
      const resData = reservas.find((r) => r._id === value)
      setSelectedReservaData(resData)
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Solo validar si shouldValidate es true
    if (shouldValidate) {
      validateField(name, value)
    }
  }

  const validateField = (name, value) => {
    // Si no se debe validar, retornar true sin hacer nada
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
      default:
        break
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))

    // Solo mostrar SweetAlert si hay un error y shouldValidate es true
    if (errorMessage && shouldValidate) {
      // Usar toast para mensajes menos intrusivos
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

    // Validar el formulario completo
    setTimeout(() => {
      validateForm({
        ...formData,
        [name]: value,
      })
    }, 0)

    return !errorMessage
  }

  const handleFieldBlur = (e) => {
    // Si no se debe validar, no hacer nada
    if (!shouldValidate) return

    const { name, value } = e.target
    validateField(name, value)
  }

  const handleKeyDown = (e, nextFieldName) => {
    // Si no se debe validar, no hacer nada
    if (!shouldValidate) return

    if (e.key === "Tab") {
      const { name, value } = e.target
      validateField(name, value)
    }
  }

  const validateForm = (data) => {
    // Si no se debe validar, no hacer nada
    if (!shouldValidate) return

    const isValid = data.fecha.trim() !== "" && data.reserva.trim() !== "" && data.estado.trim() !== ""
    setIsFormValid(isValid)
  }

  // Guardar (crear o actualizar) y actualizar el estado local de pagos de forma optimista
  const handleSubmit = async () => {
    // Activar validación para el envío del formulario
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
        setPagos((prev) =>
          prev.map((pago) => (pago._id === editingId ? { ...pago, ...formData, reserva: selectedReservaData } : pago)),
        )
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El pago se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        const newPago = await pagoService.createPago(formData)
        newPago.reserva = selectedReservaData
        setPagos((prev) => [newPago, ...prev])
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El pago se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      handleClose()
    } catch (error) {
      console.error("Error saving pago", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el pago.",
      })
    }
  }

  // Función para anular el pago en lugar de eliminarlo
  const handleAnular = async (id) => {
    const confirmAnular = await Swal.fire({
      title: "¿Anular pago?",
      text: "Esta acción cambiará el estado del pago a 'anulado'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })
    if (confirmAnular.isConfirmed) {
      try {
        // Actualizamos el pago cambiando su estado a "anulado"
        const updatedPago = await pagoService.updatePago(id, { estado: "anulado" })
        setPagos((prev) => prev.map((pago) => (pago._id === id ? updatedPago : pago)))
        Swal.fire({
          icon: "success",
          title: "Anulado",
          text: "El pago se anuló correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } catch (error) {
        console.error("Error anulando el pago", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al anular el pago.",
        })
      }
    }
  }

  const filteredPagos = pagos.filter(
    (pago) => pago.estado && pago.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calcularFaltante = (pago) => {
    if (pago.reserva && typeof pago.reserva === "object") {
      const totalReserva = pago.reserva.total || 0
      const pagoParcial = pago.pagoParcial || pago.monto || 0
      return totalReserva - pagoParcial
    }
    return 0
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Pagos
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los pagos del sistema
        </Typography>
      </Box>
      {/* Barra de búsqueda */}
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
            className={classes.addButton}
            onClick={() => handleOpen(null)}
            startIcon={<UserPlus size={20} />}
            style={{ minWidth: "180px" }}
          >
            Nuevo Pago
          </Button>
        </Box>
      </Box>

      {/* Tabla de pagos */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell>Pago Parcial</StyledTableCell>
              <StyledTableCell>Fecha</StyledTableCell>
              <StyledTableCell>Reserva</StyledTableCell>
              <StyledTableCell>Total Reserva</StyledTableCell>
              <StyledTableCell>Faltante</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPagos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pago) => (
              <TableRow key={pago._id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{formatCOP(pago.pagoParcial || pago.monto || 0)}</TableCell>
                <TableCell className={classes.tableCell}>{new Date(pago.fecha).toLocaleDateString()}</TableCell>
                <TableCell className={classes.tableCell}>
                  {pago.reserva && typeof pago.reserva === "object"
                    ? `${pago.reserva.numero_reserva} - ${pago.reserva.titular_reserva}`
                    : pago.reserva || "N/A"}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {pago.reserva && typeof pago.reserva === "object" ? formatCOP(pago.reserva.total || 0) : "N/A"}
                </TableCell>
                <TableCell className={classes.tableCell}>{formatCOP(calcularFaltante(pago))}</TableCell>
                <TableCell className={classes.tableCell}>{pago.estado}</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
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
                    <Tooltip title="Anular pago">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleAnular(pago._id)}
                      >
                        <Delete size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredPagos.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={7} className={classes.noDataCell}>
                  No se encontraron pagos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredPagos.length}
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

      {/* Modal para crear/editar pago - Diseño actualizado */}
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
            {/* Sección de Información del Pago */}
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
                onBlur={handleFieldBlur}
                onKeyDown={(e) => handleKeyDown(e, "reserva")}
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
            </Box>

            {/* Sección de Reserva */}
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
                onBlur={handleFieldBlur}
                onKeyDown={(e) => handleKeyDown(e, "estado")}
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
              {selectedReservaData && (
                <Box mt={2} p={2} border="1px solid #e2e8f0" borderRadius={4} className={classes.detailsCard}>
                  <Typography variant="subtitle1" gutterBottom className={classes.detailsCardTitle}>
                    <Person />
                    Información de la Reserva
                  </Typography>
                  <Typography variant="body2" className={classes.detailsCardContent}>
                    <strong>Titular:</strong> {selectedReservaData.titular_reserva}
                  </Typography>
                  <Typography variant="body2" className={classes.detailsCardContent}>
                    <strong>Número de Reserva:</strong> {selectedReservaData.numero_reserva}
                  </Typography>
                  <Typography variant="body2" className={classes.detailsCardContent}>
                    <strong>Total:</strong> {formatCOP(selectedReservaData.total || 0)}
                  </Typography>
                  <Typography variant="body2" className={classes.detailsCardContent}>
                    <strong>Pagos Parciales:</strong> {formatCOP(selectedReservaData.pagos_parciales || 0)}
                  </Typography>
                  <Typography variant="body2" className={classes.detailsCardContent}>
                    <strong>Faltante:</strong>{" "}
                    {formatCOP((selectedReservaData.total || 0) - (selectedReservaData.pagos_parciales || 0))}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Sección de Estado */}
            <Box className={classes.formSection}>
              <Typography className={classes.sectionTitle}>
                <AssignmentInd />
                Estado del Pago
              </Typography>
              <TextField
                className={classes.formField}
                select
                margin="dense"
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                onBlur={handleFieldBlur}
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
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="realizado">Realizado</MenuItem>
                <MenuItem value="fallido">Fallido</MenuItem>
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
      )}

      {/* Modal de detalles (solo lectura) - Diseño actualizado */}
      {detailsOpen && selectedPago && (
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          fullWidth
          maxWidth="sm"
          classes={{ paper: classes.dialogPaper }}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle className={classes.dialogTitle}>
            Detalles del Pago
            <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Box className={classes.detailsHeader}>
              <Avatar className={classes.detailsAvatar}>
                <AttachMoney fontSize="large" />
              </Avatar>
              <Typography className={classes.detailsName}>
                {formatCOP(selectedPago.pagoParcial || selectedPago.monto || 0)}
              </Typography>
              <Typography className={classes.detailsDescription}>
                Pago {selectedPago.estado} del {new Date(selectedPago.fecha).toLocaleDateString()}
              </Typography>
            </Box>

            <Divider style={{ margin: "16px 0" }} />

            <Grid container spacing={3} className={classes.detailsGrid}>
              <Grid item xs={12} md={6}>
                <Box className={classes.detailsCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <Payment />
                    Pago Parcial
                  </Typography>
                  <Typography className={classes.detailsCardContent}>
                    {formatCOP(selectedPago.pagoParcial || selectedPago.monto || 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.detailsCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <AttachMoney />
                    Faltante
                  </Typography>
                  <Typography className={classes.detailsCardContent}>
                    {formatCOP(calcularFaltante(selectedPago))}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.detailsCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <CalendarToday />
                    Fecha
                  </Typography>
                  <Typography className={classes.detailsCardContent}>
                    {new Date(selectedPago.fecha).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.detailsCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <VerifiedUser />
                    Estado
                  </Typography>
                  <Typography className={classes.detailsCardContent}>{selectedPago.estado}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className={classes.detailsCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <Receipt />
                    Reserva
                  </Typography>
                  <Typography className={classes.detailsCardContent}>
                    {selectedPago.reserva && typeof selectedPago.reserva === "object"
                      ? `${selectedPago.reserva.numero_reserva} - ${selectedPago.reserva.titular_reserva}`
                      : selectedPago.reserva || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {selectedPago.reserva && typeof selectedPago.reserva === "object" && (
                <Grid item xs={12}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <AttachMoney />
                      Total Reserva
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {formatCOP(selectedPago.reserva.total || 0)}
                    </Typography>
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
    </Box>
  )
}

export default PagosList
