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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core"
import {
  Edit,
  Delete,
  Eye,
  X,
  Search,
  Plus,
  Home,
  FileText,
  Building,
  Layers,
  DollarSign,
  Settings,
  PenTool,
  Check,
  UserPlus,
} from "lucide-react"
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import tipoApartamentoService from "./tipoApartamento.service"
import "./tipoApartamento.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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

const ApartamentoTableCell = withStyles((theme) => ({
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
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    marginTop: theme.spacing(0),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(3),
    background: "radial-gradient(circle at top left, #e0f2fe 0, #f9fafb 45%, #e5e7eb 100%)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: "linear-gradient(135deg, #ffffff, #e5edff)",
    boxShadow: "0 18px 40px rgba(148, 163, 184, 0.35)",
  },
  pageTitle: {
    fontSize: "1.9rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  pageSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
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
    background: "#ffffff",
    borderRadius: 999,
    boxShadow: "0 6px 18px rgba(148, 163, 184, 0.35)",
    minWidth: 260,
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      paddingRight: theme.spacing(1),
      "& input": {
        color: "#0f172a",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: 2,
      },
    },
  },
  addButton: {
    background: "linear-gradient(135deg, #38bdf8, #6366f1, #a855f7)",
    color: "#f9fafb",
    fontWeight: 600,
    padding: "10px 22px",
    borderRadius: 999,
    boxShadow: "0 14px 35px rgba(56, 189, 248, 0.55)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #0ea5e9, #4f46e5, #9333ea)",
      boxShadow: "0 20px 45px rgba(56, 189, 248, 0.7)",
      transform: "translateY(-2px)",
    },
  },
  tableContainer: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(148, 163, 184, 0.4)",
    background: "#ffffff",
    width: "100%",
    border: "1px solid rgba(226, 232, 240, 1)",
  },
  tableRow: {
    transition: "all 0.3s ease",
    "&:nth-of-type(odd)": {
      backgroundColor: "#f9fafb",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#ffffff",
    },
    "&:hover": {
      backgroundColor: "#eef2ff",
      boxShadow: "0 8px 16px rgba(148, 163, 184, 0.45)",
      transform: "translateY(-1px)",
    },
  },
  tableCell: {
    textAlign: "center",
    padding: theme.spacing(1.6),
    fontSize: "0.9rem",
    letterSpacing: "0.01em",
    color: "#0f172a",
    borderBottom: "1px solid rgba(226, 232, 240, 1)",
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
  tipoAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  tipoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  pagination: {
    borderRadius: theme.spacing(2),
    boxShadow: "0 6px 18px rgba(148, 163, 184, 0.4)",
    background: "#ffffff",
    color: "#0f172a",
    "& .MuiTablePagination-toolbar": {
      padding: theme.spacing(1.5),
    },
    "& .MuiTablePagination-selectRoot": {
      marginRight: theme.spacing(2),
      color: "#0f172a",
    },
    "& .MuiTablePagination-actions svg": {
      color: "#0f172a",
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
    borderRadius: theme.spacing(3),
    boxShadow: "0 26px 70px rgba(148, 163, 184, 0.55)",
    overflow: "hidden",
    width: "92%",
    maxWidth: "860px",
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 1)",
  },
  dialogTitle: {
    background: "linear-gradient(120deg, #2563eb, #1d4ed8)",
    color: "#f9fafb",
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
    background: "#ffffff",
  },
  dialogActions: {
    padding: theme.spacing(2, 3, 3),
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    borderTop: "1px solid rgba(226, 232, 240, 1)",
  },
  cancelButton: {
    color: "#64748b",
    fontWeight: 600,
    padding: "9px 22px",
    borderRadius: 999,
    border: "1px solid rgba(203, 213, 225, 1)",
    transition: "all 0.3s ease",
    textTransform: "none",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#f9fafb",
      borderColor: "#94a3b8",
      boxShadow: "0 8px 20px rgba(148, 163, 184, 0.45)",
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontWeight: 600,
    padding: "9px 26px",
    borderRadius: 999,
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.55)",
    transition: "all 0.3s ease",
    textTransform: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
      boxShadow: "0 20px 40px rgba(37, 99, 235, 0.7)",
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      background: "rgba(148, 163, 184, 0.9)",
      boxShadow: "none",
      transform: "none",
      color: "#f9fafb",
    },
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  formCard: {
    transition: "all 0.3s ease",
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    background: "#f8fafc",
    border: "1px solid rgba(226, 232, 240, 1)",
    boxShadow: "0 10px 26px rgba(148, 163, 184, 0.4)",
    height: "100%",
    "&:hover": {
      boxShadow: "0 16px 36px rgba(148, 163, 184, 0.55)",
      transform: "translateY(-2px)",
      borderColor: "rgba(59, 130, 246, 0.7)",
    },
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
}))

const TipoApartamentoList = ({ onModuleChange }) => {
  const classes = useStyles()
  const history = useHistory()
  const [tipoApartamentos, setTipoApartamentos] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tamaño: "",
    estado: true,
  })
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    descripcion: "",
    tamaño: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Estados para el modal de detalles
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)

  // Función para cargar tipos de apartamentos
  const fetchTipoApartamentos = async () => {
    try {
      const data = await tipoApartamentoService.getTipoApartamentos()
      setTipoApartamentos(data)
    } catch (error) {
      console.error("Error fetching tipoApartamentos", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los tipos de apartamentos.",
      })
    }
  }

  useEffect(() => {
    fetchTipoApartamentos()
  }, [])

  // Función para cambiar de módulo a la vista de apartamentos
  const handleGoToApartamentos = () => {
    if (onModuleChange) {
      onModuleChange("apartamentos")
    }
  }

  // Abrir modal para crear o editar
  const handleOpen = (tipoApartamento) => {
    if (tipoApartamento) {
      setFormData({
        nombre: tipoApartamento.nombre || "",
        descripcion: tipoApartamento.descripcion || "",
        tamaño: tipoApartamento.tamaño || "",
        estado: tipoApartamento.estado ?? true,
      })
      setEditingId(tipoApartamento._id)
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        tamaño: "",
        estado: true,
      })
      setEditingId(null)
    }
    // Reset form errors
    setFormErrors({
      nombre: "",
      descripcion: "",
      tamaño: "",
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Función para mostrar detalles en un modal
  const handleView = (tipoApartamento) => {
    setViewData(tipoApartamento)
    setViewOpen(true)
  }

  // Manejar cambios en el formulario con validaciones
  const handleChange = (e) => {
    const { name, value } = e.target

    // Actualizar el valor del campo
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tamaño" ? Number(value) : value,
    }))

    // Validar el campo según su nombre
    let error = ""

    if (name === "nombre") {
      if (!value.trim()) {
        error = "El nombre no puede estar vacío"
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres"
      } else if (value.trim().length > 30) {
        error = "El nombre no puede tener más de 30 caracteres"
      }
    } else if (name === "descripcion") {
      if (!value.trim()) {
        error = "La descripción no puede estar vacía"
      } else if (value.trim().length < 3) {
        error = "La descripción debe tener al menos 3 caracteres"
      } else if (/[^\w\s.,áéíóúÁÉÍÓÚñÑ¿?¡!()-]/.test(value)) {
        error = "La descripción no debe contener caracteres especiales sin sentido"
      }
    } else if (name === "tamaño") {
      if (!value) {
        error = "El tamaño no puede estar vacío"
      }
    }

    // Actualizar el estado de errores
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  // Enviar formulario para crear o actualizar
  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const nombreError = !formData.nombre.trim()
      ? "El nombre no puede estar vacío"
      : formData.nombre.trim().length < 3
        ? "El nombre debe tener al menos 3 caracteres"
        : formData.nombre.trim().length > 30
          ? "El nombre no puede tener más de 30 caracteres"
          : ""

    const descripcionError = !formData.descripcion.trim()
      ? "La descripción no puede estar vacía"
      : formData.descripcion.trim().length < 3
        ? "La descripción debe tener al menos 3 caracteres"
        : /[^\w\s.,áéíóúÁÉÍÓÚñÑ¿?¡!()-]/.test(formData.descripcion)
          ? "La descripción no debe contener caracteres especiales sin sentido"
          : ""

    const tamañoError = !formData.tamaño ? "El tamaño no puede estar vacío" : ""

    // Actualizar todos los errores
    setFormErrors({
      nombre: nombreError,
      descripcion: descripcionError,
      tamaño: tamañoError,
    })

    // Si hay algún error, no continuar con el envío
    if (nombreError || descripcionError || tamañoError) {
      return
    }

    try {
      if (editingId) {
        await tipoApartamentoService.updateTipoApartamento(editingId, formData)
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El tipo de apartamento se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      } else {
        await tipoApartamentoService.createTipoApartamento(formData)
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "El tipo de apartamento se creó correctamente.",
          confirmButtonColor: "#2563eb",
        })
      }
      fetchTipoApartamentos()
      handleClose()
    } catch (error) {
      console.error("Error saving tipoApartamento", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el tipo de apartamento.",
      })
    }
  }

  // Eliminar tipo de apartamento
  const handleDelete = async (id, estado) => {
    if (estado === true) {
      Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No se puede eliminar un tipo de apartamento activo.",
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
        await tipoApartamentoService.deleteTipoApartamento(id)
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El tipo de apartamento se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
        })
        fetchTipoApartamentos()
      } catch (error) {
        console.error("Error deleting tipoApartamento", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al eliminar el tipo de apartamento.",
        })
      }
    }
  }

  // Filtrar por búsqueda (por nombre o descripción)
  const filteredTipoApartamentos = tipoApartamentos.filter(
    (t) =>
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginación
  const paginatedTipoApartamentos = filteredTipoApartamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
      style={{
        paddingTop: "10px",
        borderTop: "6px solid #2563eb",
        borderRadius: "8px",
      }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Tipos de Apartamentos
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los tipos de apartamentos del sistema
        </Typography>
      </Box>

      <div className={classes.searchContainer}>
        <TextField
          label="Buscar tipo de apartamento"
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
            style={{ minWidth: "180px" }}
          >
            NUEVO TIPO
          </Button>
        </Box>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table style={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Nombre</StyledTableCell>
              <StyledTableCell>Descripción</StyledTableCell>
              <StyledTableCell>Tamaño</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTipoApartamentos.map((tipoApartamento) => (
              <TableRow key={tipoApartamento._id} className={classes.tableRow}>
                <ApartamentoTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.tipoContainer}>
                    <Avatar className={classes.tipoAvatar}>
                      <Home size={18} />
                    </Avatar>
                    <Typography variant="body2">{tipoApartamento.nombre}</Typography>
                  </Box>
                </ApartamentoTableCell>
                <TableCell className={classes.tableCell}>{tipoApartamento.descripcion}</TableCell>
                <TableCell className={classes.tableCell}>{tipoApartamento.tamaño} m²</TableCell>
                <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar tipo">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpen(tipoApartamento)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleView(tipoApartamento)}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar tipo">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleDelete(tipoApartamento._id, tipoApartamento.estado)}
                      >
                        <Delete size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTipoApartamentos.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={4} className={classes.noDataCell}>
                  No se encontraron tipos de apartamentos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredTipoApartamentos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar tipo de apartamento */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" classes={{ paper: classes.dialogPaper }}>
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Tipo de Apartamento" : "Nuevo Tipo de Apartamento"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección para ingresar el nombre del tipo */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Home size={20} />
              Información del Tipo
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Nombre del Tipo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de detalles */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <FileText size={20} />
              Detalles
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              multiline
              minRows={3}

              error={!!formErrors.descripcion}
              helperText={formErrors.descripcion}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FileText size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Tamaño (m²)"
              name="tamaño"
              value={formData.tamaño}
              onChange={handleChange}
              fullWidth
              type="number"
              variant="outlined"
              required
              error={!!formErrors.tamaño}
              helperText={formErrors.tamaño}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home size={18} className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            {/* Selector para cambiar el estado en modo edición */}
            {editingId && (
              <FormControl fullWidth variant="outlined" className={classes.formField}>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  value={formData.estado ? "Activo" : "Inactivo"}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      estado: value === "Activo",
                    }))
                  }}
                  label="Estado"
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            )}
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
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="md"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Tipo de Apartamento
          <IconButton onClick={() => setViewOpen(false)} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {viewData && (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>
                  <Home size={40} />
                </Avatar>
                <Typography className={classes.detailsName}>{viewData.nombre}</Typography>
                <Typography className={classes.detailsDescription}>{viewData.descripcion}</Typography>
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Tamaño:</span>
                  <span className={classes.detailsValue}>{viewData.tamaño} m²</span>
                </Typography>
              </Box>

              <Box className={classes.detailsRow}>
                <Typography variant="body1">
                  <span className={classes.detailsLabel}>Estado:</span>
                  <span className={classes.detailsValue}>{viewData.estado ? "Activo" : "Inactivo"}</span>
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={() => setViewOpen(false)} className={classes.cancelButton}>
            Cerrar
          </Button>
          <Button
            onClick={() => {
              setViewOpen(false)
              handleOpen(viewData)
            }}
            className={classes.submitButton}
          >
            Editar
          </Button>
          <Button onClick={handleGoToApartamentos} className={classes.submitButton}>
            Ver Apartamentos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TipoApartamentoList
