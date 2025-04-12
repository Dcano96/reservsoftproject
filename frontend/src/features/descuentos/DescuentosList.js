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
import descuentoService from "./descuentos.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import "./descuentos.styles.css"
import {
  LocalOffer,
  Description,
  AttachMoney,
  CalendarToday,
  VerifiedUser,
  Apartment,
  ShowChart,
  MoneyOff,
  EventAvailable,
  EventBusy,
} from "@material-ui/icons"

// Función para formatear precio a peso colombiano
const formatPrice = (value) => {
  if (isNaN(value) || value === "") return ""
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(Number(value))
}

// Personalización de las celdas del encabezado
const StyledTableCell = withStyles((theme) => ({
  head: {
    background: "#2563eb", // Azul sólido como en la imagen
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
  estadoButton: {
    borderRadius: theme.spacing(1.5),
    padding: "4px 12px",
    fontWeight: 600,
    textTransform: "none",
    minWidth: "100px",
  },
  estadoActivo: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#059669",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    "&:hover": {
      backgroundColor: "rgba(16, 185, 129, 0.25)",
    },
  },
  estadoInactivo: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.25)",
    },
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

const DescuentosList = ({ canCreate, canUpdate, canDelete }) => {
  const classes = useStyles()
  const [descuentos, setDescuentos] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedDescuento, setSelectedDescuento] = useState(null)
  const [formData, setFormData] = useState({
    tipoApartamento: "",
    descripcion: "",
    porcentaje: "",
    precio: "",
    precio_con_descuento: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: true,
  })
  const [formErrors, setFormErrors] = useState({
    descripcion: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Helper para obtener la fecha actual en formato yyyy-mm-dd
  const getTodayDate = () => new Date().toISOString().split("T")[0]

  // Cargar descuentos
  const fetchDescuentos = async () => {
    try {
      const data = await descuentoService.getDescuentos()
      setDescuentos(data)
    } catch (error) {
      console.error("Error fetching descuentos", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los descuentos.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  useEffect(() => {
    fetchDescuentos()
  }, [])

  // Calcular precio con descuento automáticamente
  useEffect(() => {
    const precio = Number.parseFloat(formData.precio)
    const porcentaje = Number.parseFloat(formData.porcentaje)
    if (!isNaN(precio) && !isNaN(porcentaje)) {
      const calculo = precio * (1 - porcentaje / 100)
      setFormData((prev) => ({ ...prev, precio_con_descuento: calculo.toFixed(2) }))
    } else {
      setFormData((prev) => ({ ...prev, precio_con_descuento: "" }))
    }
  }, [formData.precio, formData.porcentaje])

  const handleToggleState = async (id, currentState) => {
    try {
      await descuentoService.updateDescuento(id, { estado: !currentState })
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "El estado del descuento se actualizó correctamente.",
        confirmButtonColor: "#2563eb",
      })
      fetchDescuentos()
    } catch (error) {
      console.error("Error toggling state", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar el estado.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  const handleOpen = (descuento) => {
    // Limpiar errores previos
    setFormErrors({
      descripcion: "",
    })

    if (descuento) {
      setFormData({
        tipoApartamento: descuento.tipoApartamento || "",
        descripcion: descuento.descripcion || "",
        porcentaje: descuento.porcentaje || "",
        precio: descuento.precio || "",
        precio_con_descuento: descuento.precio_con_descuento || "",
        fecha_inicio: descuento.fecha_inicio ? descuento.fecha_inicio.substring(0, 10) : "",
        fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.substring(0, 10) : "",
        estado: descuento.estado ?? true,
      })
      setEditingId(descuento._id)
    } else {
      setFormData({
        tipoApartamento: "",
        descripcion: "",
        porcentaje: "",
        precio: "",
        precio_con_descuento: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: true,
      })
      setEditingId(null)
    }
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleDetails = (descuento) => {
    setSelectedDescuento(descuento)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validación para el campo descripción (solo letras y espacios)
    if (name === "descripcion") {
      if (value && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value)) {
        setFormErrors({
          ...formErrors,
          descripcion: "La descripción solo debe contener letras y espacios",
        })

        // Mostrar SweetAlert2 para el error
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "La descripción solo debe contener letras y espacios",
          confirmButtonColor: "#2563eb",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })

        return
      } else {
        setFormErrors({
          ...formErrors,
          descripcion: "",
        })
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errors = {}

    // Validar descripción
    if (!formData.descripcion.trim()) {
      errors.descripcion = "La descripción es obligatoria"
    } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(formData.descripcion)) {
      errors.descripcion = "La descripción solo debe contener letras y espacios"
    }

    // Validar fechas
    if (formData.fecha_inicio && formData.fecha_inicio < getTodayDate()) {
      Swal.fire({
        icon: "warning",
        title: "Fecha Inválida",
        text: "La fecha de inicio no puede ser anterior a la fecha actual.",
        confirmButtonColor: "#2563eb",
      })
      return false
    }

    if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_fin < formData.fecha_inicio) {
      Swal.fire({
        icon: "warning",
        title: "Fecha Inválida",
        text: "La fecha final no puede ser anterior a la fecha de inicio.",
        confirmButtonColor: "#2563eb",
      })
      return false
    }

    // Actualizar errores y retornar si el formulario es válido
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      if (editingId) {
        await descuentoService.updateDescuento(editingId, formData)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El descuento se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await descuentoService.createDescuento(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El descuento se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchDescuentos()
      handleClose()
    } catch (error) {
      console.error("Error saving descuento", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el descuento.",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  const handleDelete = async (id, estado) => {
    if (estado === true) {
      Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No se puede eliminar un descuento activo.",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })

    if (result.isConfirmed) {
      try {
        await descuentoService.deleteDescuento(id)
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El descuento se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchDescuentos()
      } catch (error) {
        console.error("Error deleting descuento", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al eliminar el descuento.",
          confirmButtonColor: "#2563eb",
        })
      }
    }
  }

  const filteredDescuentos = descuentos.filter(
    (d) =>
      d.tipoApartamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedDescuentos = filteredDescuentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
          Gestión de Descuentos
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los descuentos del sistema
        </Typography>
      </Box>

      <Box className={classes.searchContainer}>
        <TextField
          label="Buscar por Tipo o Descripción"
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
        {canCreate && (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              className={classes.addButton}
              onClick={() => handleOpen(null)}
              startIcon={<UserPlus size={20} />}
              style={{ minWidth: "180px" }}
            >
              Nuevo Descuento
            </Button>
          </Box>
        )}
      </Box>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell>Tipo</StyledTableCell>
              <StyledTableCell>Descripción</StyledTableCell>
              <StyledTableCell>Porcentaje</StyledTableCell>
              <StyledTableCell>Precio Original</StyledTableCell>
              <StyledTableCell>Precio c/Desc</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDescuentos.map((descuento) => (
              <TableRow key={descuento._id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{descuento.tipoApartamento}</TableCell>
                <TableCell className={classes.tableCell}>{descuento.descripcion}</TableCell>
                <TableCell className={classes.tableCell}>{descuento.porcentaje}%</TableCell>
                <TableCell className={classes.tableCell}>{formatPrice(descuento.precio)}</TableCell>
                <TableCell className={classes.tableCell}>{formatPrice(descuento.precio_con_descuento)}</TableCell>
                <TableCell className={classes.tableCell}>{descuento.estado ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    {canUpdate && (
                      <Tooltip title="Editar descuento">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnEdit}`}
                          onClick={() => handleOpen(descuento)}
                        >
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleDetails(descuento)}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Tooltip>
                    {canDelete && (
                      <Tooltip title="Eliminar descuento">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDelete}`}
                          onClick={() => handleDelete(descuento._id, descuento.estado)}
                        >
                          <Delete size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDescuentos.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={7} className={classes.noDataCell}>
                  No se encontraron descuentos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredDescuentos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar descuento - Diseño actualizado */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" classes={{ paper: classes.dialogPaper }}>
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Descuento" : "Agregar Descuento"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección de Información del Descuento */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <LocalOffer />
              Información del Descuento
            </Typography>
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Tipo de Apartamento"
              name="tipoApartamento"
              value={formData.tipoApartamento}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Apartment className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="Apartamento Tipo1">Apartamento Tipo1</MenuItem>
              <MenuItem value="Apartamento Tipo2">Apartamento Tipo2</MenuItem>
              <MenuItem value="Penthouse">Penthouse</MenuItem>
            </TextField>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!formErrors.descripcion}
              required
              helperText={formErrors.descripcion}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Precios y Descuentos */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <MoneyOff />
              Precios y Descuentos
            </Typography>
            <TextField
              className={classes.formField}
              select
              margin="dense"
              label="Porcentaje"
              name="porcentaje"
              value={formData.porcentaje}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ShowChart className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              {[5, 10, 15, 20, 25].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}%
                </MenuItem>
              ))}
            </TextField>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Precio Original"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              fullWidth
              type="number"
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Precio con Descuento"
              name="precio_con_descuento"
              value={formatPrice(formData.precio_con_descuento)}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyOff className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Box>

          {/* Sección de Fechas y Estado */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <CalendarToday />
              Vigencia y Estado
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Fecha Inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayDate() }}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventAvailable className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Fecha Fin"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.fecha_inicio || getTodayDate() }}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventBusy className={classes.fieldIcon} />
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
              value={formData.estado ? "true" : "false"}
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
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
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

      {/* Modal de detalles (solo lectura) - Diseño actualizado */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Descuento
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedDescuento ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>
                  <LocalOffer fontSize="large" />
                </Avatar>
                <Typography className={classes.detailsName}>{selectedDescuento.descripcion}</Typography>
                <Typography className={classes.detailsDescription}>
                  Descuento del {selectedDescuento.porcentaje}% para {selectedDescuento.tipoApartamento}
                </Typography>
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3} className={classes.detailsGrid}>
                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Apartment />
                      Tipo de Apartamento
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedDescuento.tipoApartamento}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <ShowChart />
                      Porcentaje
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedDescuento.porcentaje}%</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <AttachMoney />
                      Precio Original
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {formatPrice(selectedDescuento.precio)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <MoneyOff />
                      Precio con Descuento
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {formatPrice(selectedDescuento.precio_con_descuento)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <EventAvailable />
                      Fecha Inicio
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedDescuento.fecha_inicio ? selectedDescuento.fecha_inicio.substring(0, 10) : "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <EventBusy />
                      Fecha Fin
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedDescuento.fecha_fin ? selectedDescuento.fecha_fin.substring(0, 10) : "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <VerifiedUser />
                      Estado
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedDescuento.estado ? "Activo" : "Inactivo"}
                    </Typography>
                  </Box>
                </Grid>
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
          {canUpdate && selectedDescuento && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedDescuento)
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

export default DescuentosList
