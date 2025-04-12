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
  const [rowsPerPage, setRowsPerPage] = useState(10)

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

  const handleClose = () => setOpen(false)

  const handleDetails = (cliente) => {
    setSelectedCliente(cliente)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  // Modificar la función validateField para evitar validaciones agresivas
  // Reemplazar la función validateField actual con esta versión mejorada:

  // Validación en tiempo real
  const validateField = (name, value) => {
    let error = ""

    // Si estamos en modo edición, ser menos estrictos con las validaciones
    // para evitar bloqueos de la interfaz
    const isEditing = !!editingId

    switch (name) {
      case "nombre":
        if (!value) {
          error = "El nombre es obligatorio"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre solo debe contener letras"
          // Mostrar SweetAlert2 solo si no estamos editando o si el error es grave
          if (!isEditing) {
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
          }
        }
        break

      case "documento":
        if (!value) {
          error = "El documento es obligatorio"
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = "El documento solo debe contener letras y números"
          if (!isEditing) {
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
          }
        }
        break

      case "email":
        if (!value) {
          error = "El email es obligatorio"
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = "Formato de email inválido"
          if (!isEditing) {
            Swal.fire({
              icon: "warning",
              title: "Validación",
              text: "Por favor ingrese un formato de email válido",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            })
          }
        }
        break

      case "telefono":
        if (!value) {
          error = "El teléfono es obligatorio"
        } else if (!/^\d+$/.test(value)) {
          error = "El teléfono solo debe contener números"
          if (!isEditing) {
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
          }
        }
        break

      case "password":
        // Solo validar si no está en modo edición o si se está ingresando una contraseña
        if ((!editingId || value) && value) {
          if (!/(?=.*[A-Z])/.test(value)) {
            error = "Debe contener al menos una letra mayúscula"
            if (!isEditing) {
              Swal.fire({
                icon: "warning",
                title: "Validación de contraseña",
                text: "La contraseña debe contener al menos una letra mayúscula",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
              })
            }
          } else if (!/(?=.*\d)/.test(value)) {
            error = "Debe contener al menos un número"
            if (!isEditing) {
              Swal.fire({
                icon: "warning",
                title: "Validación de contraseña",
                text: "La contraseña debe contener al menos un número",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
              })
            }
          } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
            error = "Debe contener al menos un carácter especial (!@#$%^&*)"
            if (!isEditing) {
              Swal.fire({
                icon: "warning",
                title: "Validación de contraseña",
                text: "La contraseña debe contener al menos un carácter especial (!@#$%^&*)",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
              })
            }
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

    return error
  }

  // Añadir funciones para manejar el blur y keydown de los campos
  // Después de la función validateForm, añadir:

  // Agregar función para manejar el cambio de foco entre campos
  const handleFieldBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)

    // Si no es válido y no estamos en modo edición, devolver el foco al campo
    if (error && !editingId) {
      setTimeout(() => {
        e.target.focus()
      }, 100)
    }
  }

  // Agregar función para manejar la tecla Tab
  const handleKeyDown = (e, nextFieldName) => {
    // Si se presiona Tab y el campo no es válido, prevenir el cambio de foco
    if (e.key === "Tab") {
      const { name, value } = e.target
      const error = validateField(name, value)

      // Solo bloquear si hay error y no estamos en modo edición
      if (error && !editingId) {
        e.preventDefault()

        // Mostrar SweetAlert2 con el error
        Swal.fire({
          icon: "error",
          title: "Campo inválido",
          text: formErrors[name] || "Por favor, complete correctamente este campo antes de continuar",
          confirmButtonColor: "#2563eb",
        })
      }
    }
  }

  // Modificar la función handleChange para usar las nuevas funciones
  // Reemplazar la función handleChange actual con:

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Validar el campo en tiempo real
    const error = validateField(name, value)
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = () => {
    const errors = {
      nombre: validateField("nombre", formData.nombre),
      documento: validateField("documento", formData.documento),
      email: validateField("email", formData.email),
      telefono: validateField("telefono", formData.telefono),
      password: validateField("password", formData.password),
    }

    setFormErrors(errors)

    // Verificar si hay errores
    return !Object.values(errors).some((error) => error)
  }

  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const isValid = validateForm()

    if (!isValid) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor corrija los errores en el formulario",
      })
      return
    }

    try {
      if (editingId) {
        await clienteService.updateCliente(editingId, formData)
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
        text: "Ocurrió un error al guardar el cliente.",
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" classes={{ paper: classes.dialogPaper }}>
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
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "documento")}
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
            <TextField
              className={classes.formField}
              margin="dense"
              label="Documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              onKeyDown={(e) => handleKeyDown(e, "email")}
              fullWidth
              variant="outlined"
              error={!!formErrors.documento}
              helperText={formErrors.documento}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentInd className={classes.fieldIcon} />
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
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
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
