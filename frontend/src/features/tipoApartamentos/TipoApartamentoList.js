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
import { Edit, Delete, Eye, X, Search, Plus, Home, FileText } from 'lucide-react'
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import tipoApartamentoService from "./tipoApartamento.service"
import "./tipoApartamento.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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

// Personalización de la celda de tipo (alineada a la izquierda)
const TipoTableCell = withStyles((theme) => ({
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
    width: "700px",
    maxWidth: "95vw",
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

  // Manejar cambios en el formulario (sin validaciones custom)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tamaño" ? Number(value) : value,
    }))
  }

  // Enviar formulario para crear o actualizar
  const handleSubmit = async () => {
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
      t.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginación
  const paginatedTipoApartamentos = filteredTipoApartamentos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

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
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>
                Nombre
              </StyledTableCell>
              <StyledTableCell>Descripción</StyledTableCell>
              <StyledTableCell>Tamaño</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTipoApartamentos.map((tipoApartamento) => (
              <TableRow key={tipoApartamento._id} className={classes.tableRow}>
                <TipoTableCell style={{ paddingLeft: "24px" }}>
                  <Box className={classes.tipoContainer}>
                    <Avatar className={classes.tipoAvatar}>
                      <Home size={18} />
                    </Avatar>
                    <Typography variant="body2">{tipoApartamento.nombre}</Typography>
                  </Box>
                </TipoTableCell>
                <TableCell className={classes.tableCell}>
                  {tipoApartamento.descripcion}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {tipoApartamento.tamaño} m²
                </TableCell>
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
                        onClick={() =>
                          handleDelete(tipoApartamento._id, tipoApartamento.estado)
                        }
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
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        classes={{ paper: classes.dialogPaper }}
      >
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
                    const value = e.target.value;
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