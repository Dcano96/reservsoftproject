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
  Chip,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  FormHelperText,
} from "@material-ui/core"
import { Edit, Delete, Info, X, Search, UserPlus } from "lucide-react"
import {
  Person,
  AssignmentInd,
  CalendarToday,
  PermIdentity,
  Home,
  DateRange,
  AttachMoney,
  Payment,
  Group,
  EventAvailable,
} from "@material-ui/icons"
import Swal from "sweetalert2"
import { getReservas, createReserva, updateReserva, deleteReserva, getReservaById } from "./reservas.service"
// ==== IMPORTAMOS EL SERVICIO DE APARTAMENTOS ====
import apartamentoService from "../apartamentos/apartamento.service"

import { makeStyles, withStyles } from "@material-ui/core/styles"
import "./reservas.styles.css"

// Estilos globales para SweetAlert2
const swalStyles = document.createElement("style")
swalStyles.innerHTML = `
  .swal-overlay-z-index {
    z-index: 9999 !important;
  }
  .swal-popup-z-index {
    z-index: 10000 !important;
  }
`
document.head.appendChild(swalStyles)

// ============== Estilos de la Tabla ==============
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

// ============== Estilos Generales ==============
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
  statusChip: {
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  activeChip: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#059669",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  inactiveChip: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
    border: "1px solid rgba(239, 68, 68, 0.3)",
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
  // Estilos actualizados para el modal (igual que en usuarios)
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
  // Nuevos estilos para el diseño del modal
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
    fontSize: "0.95rem",
    color: "#ef4444",
    fontWeight: "500",
    marginTop: "4px",
  },
  errorIcon: {
    color: "#ef4444",
    marginRight: theme.spacing(0.5),
  },
  errorField: {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ef4444 !important",
      borderWidth: "2px !important",
    },
  },
}))

// Función para obtener el token y enviarlo en el header (opcional, si usas auth)
const getTokenHeader = () => {
  const token = localStorage.getItem("token")
  return { Authorization: `Bearer ${token}` }
}

const ReservasList = () => {
  const classes = useStyles()

  // ====== Estados para Reservas ======
  const [reservas, setReservas] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)

  // ====== Estado para el formulario de Reserva ======
  const [formData, setFormData] = useState({
    titular_reserva: "",
    fecha_inicio: "",
    fecha_fin: "",
    apartamentos: [],
    noches_estadia: 1,
    total: 0,
    pagos_parciales: 0,
    estado: "pendiente",
    acompanantes: [],
  })

  // ====== Estados para validación de formulario ======
  const [formErrors, setFormErrors] = useState({
    titular_reserva: "",
    fecha_inicio: "",
    fecha_fin: "",
    apartamentos: "",
    acompanantes: {},
  })

  // ====== Estados para Búsqueda y Paginación ======
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // ====== Estados para Apartamentos ======
  const [apartamentos, setApartamentos] = useState([])
  const [mappedApartamentosOptions, setMappedApartamentosOptions] = useState([])

  // 1. Cargar reservas al montar
  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    try {
      const data = await getReservas(getTokenHeader())
      setReservas(data)
    } catch (error) {
      console.error("Error fetching reservas", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las reservas.",
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }
  }

  // 2. Cargar apartamentos al montar
  useEffect(() => {
    fetchApartamentos()
  }, [])

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
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }
  }

  // 3. Generar opciones para el Select de apartamentos
  useEffect(() => {
    const options = apartamentos.map((apt) => ({
      id: apt._id,
      label: `Apartamento ${apt.NumeroApto} - Piso ${apt.Piso} (Tarifa: COP ${apt.Tarifa})`,
      price: apt.Tarifa,
    }))
    setMappedApartamentosOptions(options)
  }, [apartamentos])

  // 4. Auto-calcular noches_estadia
  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      const start = new Date(formData.fecha_inicio)
      const end = new Date(formData.fecha_fin)
      const diffTime = end - start
      const diffDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0
      if (diffDays !== formData.noches_estadia) {
        setFormData((prev) => ({ ...prev, noches_estadia: diffDays }))
      }
    }
  }, [formData.fecha_inicio, formData.fecha_fin])

  // 5. Auto-calcular el total basado en apartamentos y noches
  useEffect(() => {
    if (mappedApartamentosOptions.length === 0 || formData.apartamentos.length === 0) {
      return
    }
    const selectedApartamentos = formData.apartamentos
      .map((id) => mappedApartamentosOptions.find((item) => item.id === id))
      .filter(Boolean)
    const sumPrices = selectedApartamentos.reduce((acc, apto) => acc + apto.price, 0)
    const newTotal = sumPrices * Number(formData.noches_estadia)
    if (newTotal !== formData.total) {
      setFormData((prev) => ({ ...prev, total: newTotal }))
    }
  }, [formData.apartamentos, formData.noches_estadia, mappedApartamentosOptions])

  // ====== Exportar a Excel ======
  const exportToExcel = async () => {
    if (reservas.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin datos",
        text: "No hay reservas para exportar.",
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
      return
    }
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Reservas")

    worksheet.columns = [
      { header: "Número de Reserva", key: "numero_reserva", width: 20 },
      { header: "Cliente", key: "titular_reserva", width: 30 },
      { header: "Fecha Inicio", key: "fecha_inicio", width: 15 },
      { header: "Fecha Fin", key: "fecha_fin", width: 15 },
      { header: "Apartamentos", key: "apartamentos", width: 30 },
      { header: "Estadía", key: "noches_estadia", width: 10 },
      { header: "Total", key: "total", width: 20 },
      { header: "Estado", key: "estado", width: 15 },
    ]

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })

    reservas.forEach((reserva) => {
      const apartamentosInfo =
        reserva.apartamentos && reserva.apartamentos.length > 0
          ? reserva.apartamentos.map((apt) => apt.NumeroApto || apt).join(", ")
          : ""

      worksheet.addRow({
        numero_reserva: reserva.numero_reserva,
        titular_reserva: reserva.titular_reserva,
        fecha_inicio: reserva.fecha_inicio ? reserva.fecha_inicio.substring(0, 10) : "",
        fecha_fin: reserva.fecha_fin ? reserva.fecha_fin.substring(0, 10) : "",
        apartamentos: apartamentosInfo,
        noches_estadia: reserva.noches_estadia,
        total: Number(reserva.total).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        }),
        estado: reserva.estado,
      })
    })

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
          cell.alignment = { horizontal: "center", vertical: "middle" }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "reservas.xlsx"
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // ====== Lógica de Paginación y Búsqueda ======
  const filteredReservas = reservas.filter((reserva) =>
    reserva.titular_reserva.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedReservas = filteredReservas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // ====== Abrir/Cerrar modal de Crear/Editar Reserva ======
  const handleOpenEdit = async (reserva) => {
    setDetailsOpen(false)
    // Reiniciar errores
    setFormErrors({
      titular_reserva: "",
      fecha_inicio: "",
      fecha_fin: "",
      apartamentos: "",
      acompanantes: {},
    })

    if (reserva) {
      try {
        // Al editar, se obtienen los datos actualizados de la reserva
        const updatedReserva = await getReservaById(reserva._id)
        const apartamentosIds = updatedReserva.apartamentos
          ? updatedReserva.apartamentos.map((apt) => (typeof apt === "object" ? apt._id : apt))
          : []

        setFormData({
          ...updatedReserva,
          apartamentos: apartamentosIds,
          fecha_inicio: updatedReserva.fecha_inicio ? updatedReserva.fecha_inicio.substring(0, 10) : "",
          fecha_fin: updatedReserva.fecha_fin ? updatedReserva.fecha_fin.substring(0, 10) : "",
        })
        setEditingId(updatedReserva._id)
      } catch (error) {
        console.error("Error al obtener los detalles de la reserva", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los detalles de la reserva.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      }
    } else {
      setFormData({
        titular_reserva: "",
        fecha_inicio: "",
        fecha_fin: "",
        apartamentos: [],
        noches_estadia: 1,
        total: 0,
        pagos_parciales: 0,
        estado: "pendiente",
        acompanantes: [],
      })
      setEditingId(null)
    }
    setOpen(true)
  }

  const handleCloseEdit = () => {
    setOpen(false)
    setEditingId(null)
  }

  // ====== Abrir/Cerrar modal de Detalles ======
  const handleOpenDetails = async (reserva) => {
    setOpen(false)
    try {
      const detailedReserva = await getReservaById(reserva._id)
      setSelectedReserva(detailedReserva)
      setDetailsOpen(true)
    } catch (error) {
      console.error("Error al obtener los detalles de la reserva", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los detalles de la reserva.",
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  // ====== Validaciones de campos ======
  const validateField = (name, value, index = null) => {
    let error = ""

    // Si estamos validando un campo de acompañante
    if (index !== null) {
      const fieldName = name
      const acompananteErrors = { ...formErrors.acompanantes }

      if (!acompananteErrors[index]) {
        acompananteErrors[index] = {}
      }

      switch (fieldName) {
        case "nombre":
          if (!value.trim()) {
            error = "El nombre es obligatorio"
          } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
            error = "El nombre solo debe contener letras"
          }
          acompananteErrors[index].nombre = error
          break

        case "apellido":
          if (!value.trim()) {
            error = "El apellido es obligatorio"
          } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
            error = "El apellido solo debe contener letras"
          }
          acompananteErrors[index].apellido = error
          break

        case "documento":
          if (!value.trim()) {
            error = "El documento es obligatorio"
          } else if (!/^\d+$/.test(value)) {
            error = "El documento solo debe contener números"
          } else if (value.length > 10) {
            error = "El documento no debe exceder 10 dígitos"
          }
          acompananteErrors[index].documento = error
          break
      }

      setFormErrors((prev) => ({
        ...prev,
        acompanantes: acompananteErrors,
      }))

      // Mostrar SweetAlert2 si hay error
      if (error) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: error,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      }

      return error === ""
    }

    // Validación de campos principales
    switch (name) {
      case "titular_reserva":
        if (!value.trim()) {
          error = "El nombre del cliente es obligatorio"
        } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
          error = "El nombre del cliente solo debe contener letras"
        }
        break

      case "fecha_inicio":
        if (!value) {
          error = "La fecha de inicio es obligatoria"
        } else {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const minDate = new Date(today)
          minDate.setDate(today.getDate() + 2) // Fecha mínima: 2 días después de hoy

          const selectedDate = new Date(value)
          selectedDate.setHours(0, 0, 0, 0)

          if (selectedDate < minDate) {
            error = "La fecha de inicio debe ser al menos 2 días después de hoy"
          }
        }
        break

      case "fecha_fin":
        if (!value) {
          error = "La fecha de fin es obligatoria"
        } else if (formData.fecha_inicio) {
          const startDate = new Date(formData.fecha_inicio)
          const endDate = new Date(value)

          if (endDate <= startDate) {
            error = "La fecha de fin debe ser posterior a la fecha de inicio"
          }
        }
        break

      case "apartamentos":
        if (!value || value.length === 0) {
          error = "Debe seleccionar al menos un apartamento"
        }
        break
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    // Mostrar SweetAlert2 si hay error
    if (error) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: error,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }

    return error === ""
  }

  // ====== Manejadores de Formulario ======
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validar el campo en tiempo real
    validateField(name, value)
  }

  // Cambio en la selección múltiple de apartamentos
  const handleApartamentosChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, apartamentos: value }))

    // Validar el campo en tiempo real
    validateField(name, value)
  }

  // Acompañantes
  const agregarAcompanante = () => {
    setFormData((prev) => ({
      ...prev,
      acompanantes: [...(prev.acompanantes || []), { nombre: "", apellido: "", documento: "" }],
    }))
  }

  // Confirmación para eliminar acompañante
  const handleDeleteAcompanante = (index) => {
    Swal.fire({
      title: "¿Eliminar acompañante?",
      text: "Esta acción eliminará el acompañante seleccionado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      customClass: {
        container: "swal-overlay-z-index",
        popup: "swal-popup-z-index",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData((prev) => {
          const nuevosAcompanantes = [...prev.acompanantes]
          nuevosAcompanantes.splice(index, 1)
          return { ...prev, acompanantes: nuevosAcompanantes }
        })

        // También eliminar los errores asociados a este acompañante
        setFormErrors((prev) => {
          const newAcompErrors = { ...prev.acompanantes }
          delete newAcompErrors[index]
          return { ...prev, acompanantes: newAcompErrors }
        })

        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El acompañante fue eliminado.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      }
    })
  }

  const handleAcompananteChange = (index, e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const nuevosAcompanantes = [...prev.acompanantes]
      nuevosAcompanantes[index] = { ...nuevosAcompanantes[index], [name]: value }
      return { ...prev, acompanantes: nuevosAcompanantes }
    })

    // Validar el campo del acompañante en tiempo real
    validateField(name, value, index)
  }

  // ====== Validar todo el formulario ======
  const validateForm = () => {
    let isValid = true
    const errors = {
      titular_reserva: "",
      fecha_inicio: "",
      fecha_fin: "",
      apartamentos: "",
      acompanantes: {},
    }

    // Validar titular_reserva
    if (!formData.titular_reserva.trim()) {
      errors.titular_reserva = "El nombre del cliente es obligatorio"
      isValid = false
    } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(formData.titular_reserva)) {
      errors.titular_reserva = "El nombre del cliente solo debe contener letras"
      isValid = false
    }

    // Validar fecha_inicio
    if (!formData.fecha_inicio) {
      errors.fecha_inicio = "La fecha de inicio es obligatoria"
      isValid = false
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const minDate = new Date(today)
      minDate.setDate(today.getDate() + 2) // Fecha mínima: 2 días después de hoy

      const selectedDate = new Date(formData.fecha_inicio)
      selectedDate.setHours(0, 0, 0, 0)

      if (selectedDate < minDate) {
        errors.fecha_inicio = "La fecha de inicio debe ser al menos 2 días después de hoy"
        isValid = false
      }
    }

    // Validar fecha_fin
    if (!formData.fecha_fin) {
      errors.fecha_fin = "La fecha de fin es obligatoria"
      isValid = false
    } else if (formData.fecha_inicio) {
      const startDate = new Date(formData.fecha_inicio)
      const endDate = new Date(formData.fecha_fin)

      if (endDate <= startDate) {
        errors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio"
        isValid = false
      }
    }

    // Validar apartamentos
    if (!formData.apartamentos || formData.apartamentos.length === 0) {
      errors.apartamentos = "Debe seleccionar al menos un apartamento"
      isValid = false
    }

    // Validar acompañantes
    if (formData.acompanantes && formData.acompanantes.length > 0) {
      formData.acompanantes.forEach((acomp, index) => {
        if (!errors.acompanantes[index]) {
          errors.acompanantes[index] = {}
        }

        // Validar nombre
        if (!acomp.nombre.trim()) {
          errors.acompanantes[index].nombre = "El nombre es obligatorio"
          isValid = false
        } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(acomp.nombre)) {
          errors.acompanantes[index].nombre = "El nombre solo debe contener letras"
          isValid = false
        }

        // Validar apellido
        if (!acomp.apellido.trim()) {
          errors.acompanantes[index].apellido = "El apellido es obligatorio"
          isValid = false
        } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(acomp.apellido)) {
          errors.acompanantes[index].apellido = "El apellido solo debe contener letras"
          isValid = false
        }

        // Validar documento
        if (!acomp.documento.trim()) {
          errors.acompanantes[index].documento = "El documento es obligatorio"
          isValid = false
        } else if (!/^\d+$/.test(acomp.documento)) {
          errors.acompanantes[index].documento = "El documento solo debe contener números"
          isValid = false
        } else if (acomp.documento.length > 10) {
          errors.acompanantes[index].documento = "El documento no debe exceder 10 dígitos"
          isValid = false
        }
      })
    }

    setFormErrors(errors)
    return isValid
  }

  // ====== Guardar (Crear/Actualizar) Reserva ======
  const handleSubmit = async () => {
    // Validar todo el formulario antes de enviar
    if (!validateForm()) {
      // Mostrar todos los errores en un solo SweetAlert
      const errorMessages = []

      if (formErrors.titular_reserva) errorMessages.push(formErrors.titular_reserva)
      if (formErrors.fecha_inicio) errorMessages.push(formErrors.fecha_inicio)
      if (formErrors.fecha_fin) errorMessages.push(formErrors.fecha_fin)
      if (formErrors.apartamentos) errorMessages.push(formErrors.apartamentos)

      // Errores de acompañantes
      Object.keys(formErrors.acompanantes).forEach((index) => {
        const acompErrors = formErrors.acompanantes[index]
        if (acompErrors.nombre) errorMessages.push(`Acompañante ${Number(index) + 1}: ${acompErrors.nombre}`)
        if (acompErrors.apellido) errorMessages.push(`Acompañante ${Number(index) + 1}: ${acompErrors.apellido}`)
        if (acompErrors.documento) errorMessages.push(`Acompañante ${Number(index) + 1}: ${acompErrors.documento}`)
      })

      return Swal.fire({
        icon: "error",
        title: "Error de validación",
        html: errorMessages.map((err) => `• ${err}`).join("<br>"),
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }

    try {
      // Convertir campos numéricos antes de enviar
      const dataToSend = {
        ...formData,
        pagos_parciales: Number(formData.pagos_parciales),
        noches_estadia: Number(formData.noches_estadia),
        total: Number(formData.total),
      }

      if (editingId) {
        await updateReserva(editingId, dataToSend, getTokenHeader())
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "La reserva se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      } else {
        await createReserva(dataToSend, getTokenHeader())
        Swal.fire({
          icon: "success",
          title: "Creado",
          text: "La reserva se creó correctamente.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      }
      fetchReservas()
      handleCloseEdit()
      setDetailsOpen(false)
    } catch (error) {
      console.error("Error al guardar la reserva:", error)
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message || "Ocurrió un error al guardar la reserva.",
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }
  }

  // ====== Eliminar Reserva ======
  const handleDelete = async (id) => {
    const reservaToDelete = reservas.find((r) => r._id === id)
    if (reservaToDelete && reservaToDelete.estado === "confirmada") {
      return Swal.fire({
        icon: "error",
        title: "No se puede eliminar",
        text: "Una reserva confirmada no puede ser eliminada.",
        confirmButtonColor: "#2563eb",
        customClass: {
          container: "swal-overlay-z-index",
          popup: "swal-popup-z-index",
        },
      })
    }
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      customClass: {
        container: "swal-overlay-z-index",
        popup: "swal-popup-z-index",
      },
    })
    if (result.isConfirmed) {
      try {
        await deleteReserva(id, getTokenHeader())
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "La reserva se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
        fetchReservas()
      } catch (error) {
        console.error("Error al eliminar la reserva:", error)
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: error.message || "Ocurrió un error al eliminar la reserva.",
          confirmButtonColor: "#2563eb",
          customClass: {
            container: "swal-overlay-z-index",
            popup: "swal-popup-z-index",
          },
        })
      }
    }
  }

  // Mostrar información de apartamentos
  const renderApartamentosInfo = (reserva) => {
    if (!reserva.apartamentos) return "-"

    if (reserva.apartamentos.length > 0 && typeof reserva.apartamentos[0] === "object") {
      return reserva.apartamentos.map((apt) => apt.NumeroApto || "N/A").join(", ")
    }

    return reserva.apartamentos
      .map((aptId) => {
        const apt = mappedApartamentosOptions.find((opt) => opt.id === aptId)
        return apt ? apt.label.split(" - ")[0] : aptId
      })
      .join(", ")
  }

  // Iniciales para el avatar (para el modal de detalles)
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // ====== Render ======
  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      {/* Encabezado de la página */}
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Reservas
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra las reservas del sistema
        </Typography>
      </Box>

      {/* Barra de Búsqueda y Botón de Agregar */}
      <div className={classes.searchContainer}>
        <TextField
          label="Buscar por cliente"
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
            onClick={() => handleOpenEdit(null)}
            startIcon={<UserPlus size={20} />}
            style={{ minWidth: "180px" }}
          >
            NUEVA RESERVA
          </Button>
        </Box>
      </div>

      {/* Tabla de Reservas */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Número</StyledTableCell>
              <StyledTableCell>Cliente</StyledTableCell>
              <StyledTableCell>Fecha Inicio</StyledTableCell>
              <StyledTableCell>Fecha Fin</StyledTableCell>
              <StyledTableCell>Apartamentos</StyledTableCell>
              <StyledTableCell>Estadía</StyledTableCell>
              <StyledTableCell>Total</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReservas.map((reserva) => (
              <TableRow key={reserva._id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{reserva.numero_reserva}</TableCell>
                <TableCell className={classes.tableCell}>{reserva.titular_reserva}</TableCell>
                <TableCell className={classes.tableCell}>
                  {reserva.fecha_inicio ? reserva.fecha_inicio.substring(0, 10) : ""}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {reserva.fecha_fin ? reserva.fecha_fin.substring(0, 10) : ""}
                </TableCell>
                <TableCell className={classes.tableCell}>{renderApartamentosInfo(reserva)}</TableCell>
                <TableCell className={classes.tableCell}>{reserva.noches_estadia}</TableCell>
                <TableCell className={classes.tableCell}>
                  {Number(reserva.total).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <Select
                    variant="standard"
                    disableUnderline
                    IconComponent={() => null}
                    value={reserva.estado}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      updateReserva(reserva._id, { estado: newStatus }, getTokenHeader())
                        .then(() => {
                          Swal.fire({
                            icon: "success",
                            title: "Estado actualizado",
                            confirmButtonColor: "#2563eb",
                            customClass: {
                              container: "swal-overlay-z-index",
                              popup: "swal-popup-z-index",
                            },
                          })
                          fetchReservas()
                        })
                        .catch(() => {
                          Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo actualizar el estado.",
                            confirmButtonColor: "#2563eb",
                            customClass: {
                              container: "swal-overlay-z-index",
                              popup: "swal-popup-z-index",
                            },
                          })
                        })
                    }}
                    renderValue={(value) => {
                      const chipClass =
                        value === "confirmada"
                          ? `${classes.statusChip} ${classes.activeChip}`
                          : `${classes.statusChip} ${classes.inactiveChip}`
                      return <Chip label={value.charAt(0).toUpperCase() + value.slice(1)} className={chipClass} />
                    }}
                  >
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                    <MenuItem value="confirmada">Confirmada</MenuItem>
                  </Select>
                </TableCell>
                <TableCell className={classes.actionsCell}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar reserva">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnEdit}`}
                        onClick={() => handleOpenEdit(reserva)}
                      >
                        <Edit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDetails}`}
                        onClick={() => handleOpenDetails(reserva)}
                      >
                        <Info size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar reserva">
                      <IconButton
                        className={`${classes.actionButton} ${classes.btnDelete}`}
                        onClick={() => handleDelete(reserva._id)}
                      >
                        <Delete size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedReservas.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={9} className={classes.noDataCell}>
                  No se encontraron reservas que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component={Paper}
        count={filteredReservas.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal Crear/Editar Reserva - Estilo actualizado como el de usuarios */}
      <Dialog open={open} onClose={handleCloseEdit} fullWidth maxWidth="sm" classes={{ paper: classes.dialogPaper }}>
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Reserva" : "Crear Reserva"}
          <IconButton onClick={handleCloseEdit} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Sección de Información del Cliente */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Person />
              Información del Cliente
            </Typography>
            <TextField
              className={`${classes.formField} ${formErrors.titular_reserva ? classes.errorField : ""}`}
              margin="dense"
              label="Cliente"
              name="titular_reserva"
              value={formData.titular_reserva}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              required
              error={!!formErrors.titular_reserva}
              helperText={formErrors.titular_reserva}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className={formErrors.titular_reserva ? classes.errorIcon : classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Fechas */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <DateRange />
              Fechas de Reserva
            </Typography>
            <TextField
              className={`${classes.formField} ${formErrors.fecha_inicio ? classes.errorField : ""}`}
              margin="dense"
              label="Fecha de Inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              required
              error={!!formErrors.fecha_inicio}
              helperText={formErrors.fecha_inicio}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventAvailable className={formErrors.fecha_inicio ? classes.errorIcon : classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={`${classes.formField} ${formErrors.fecha_fin ? classes.errorField : ""}`}
              margin="dense"
              label="Fecha de Fin"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              required
              error={!!formErrors.fecha_fin}
              helperText={formErrors.fecha_fin}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventAvailable className={formErrors.fecha_fin ? classes.errorIcon : classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Sección de Apartamentos */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Home />
              Apartamentos
            </Typography>
            <FormControl
              fullWidth
              margin="dense"
              variant="outlined"
              className={classes.formField}
              error={!!formErrors.apartamentos}
            >
              <InputLabel id="apartamentos-label">Apartamentos</InputLabel>
              <Select
                labelId="apartamentos-label"
                multiple
                name="apartamentos"
                value={formData.apartamentos || []}
                onChange={handleApartamentosChange}
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap">
                    {selected.map((value) => {
                      const apt = mappedApartamentosOptions.find((item) => item.id === value)
                      return <Chip key={value} label={apt ? apt.label : value} style={{ margin: 2 }} />
                    })}
                  </Box>
                )}
                className={formErrors.apartamentos ? classes.errorField : ""}
              >
                {mappedApartamentosOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.apartamentos && <FormHelperText error>{formErrors.apartamentos}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Sección de Detalles Financieros */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <AttachMoney />
              Detalles Financieros
            </Typography>
            <TextField
              className={classes.formField}
              margin="dense"
              label="Estadía (Noches)"
              name="noches_estadia"
              type="number"
              value={formData.noches_estadia}
              fullWidth
              disabled
              variant="outlined"
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
              label="Pagos Parciales"
              name="pagos_parciales"
              type="number"
              value={formData.pagos_parciales}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Payment className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.formField}
              margin="dense"
              label="Total"
              name="total"
              type="text"
              value={Number(formData.total).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
              fullWidth
              disabled
              variant="outlined"
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
              label="50% del Total"
              name="half_total"
              type="text"
              value={Number(formData.total / 2).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
              fullWidth
              disabled
              variant="outlined"
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
              select
              margin="dense"
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentInd className={classes.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
              <MenuItem value="confirmada">Confirmada</MenuItem>
            </TextField>
          </Box>

          {/* Sección de Acompañantes */}
          <Box className={classes.formSection}>
            <Typography className={classes.sectionTitle}>
              <Group />
              Acompañantes
            </Typography>
            {formData.acompanantes &&
              formData.acompanantes.map((acomp, index) => (
                <Box key={index} display="flex" alignItems="flex-start" mb={2} flexWrap="wrap">
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={acomp.nombre}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    style={{ marginRight: 8, flex: "1 1 30%" }}
                    variant="outlined"
                    className={`${classes.formField} ${
                      formErrors.acompanantes[index]?.nombre ? classes.errorField : ""
                    }`}
                    error={!!formErrors.acompanantes[index]?.nombre}
                    helperText={formErrors.acompanantes[index]?.nombre}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            className={formErrors.acompanantes[index]?.nombre ? classes.errorIcon : classes.fieldIcon}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Apellido"
                    name="apellido"
                    value={acomp.apellido}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    style={{ marginRight: 8, flex: "1 1 30%" }}
                    variant="outlined"
                    className={`${classes.formField} ${
                      formErrors.acompanantes[index]?.apellido ? classes.errorField : ""
                    }`}
                    error={!!formErrors.acompanantes[index]?.apellido}
                    helperText={formErrors.acompanantes[index]?.apellido}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            className={formErrors.acompanantes[index]?.apellido ? classes.errorIcon : classes.fieldIcon}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Documento"
                    name="documento"
                    value={acomp.documento}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    style={{ flex: "1 1 30%" }}
                    variant="outlined"
                    className={`${classes.formField} ${
                      formErrors.acompanantes[index]?.documento ? classes.errorField : ""
                    }`}
                    error={!!formErrors.acompanantes[index]?.documento}
                    helperText={formErrors.acompanantes[index]?.documento}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PermIdentity
                            className={
                              formErrors.acompanantes[index]?.documento ? classes.errorIcon : classes.fieldIcon
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    onClick={() => handleDeleteAcompanante(index)}
                    style={{ marginLeft: 8, backgroundColor: "#f44336", color: "#fff" }}
                  >
                    <Delete size={16} />
                  </IconButton>
                </Box>
              ))}
            <Button variant="outlined" onClick={agregarAcompanante} startIcon={<Group />} style={{ marginTop: 8 }}>
              Agregar Acompañante
            </Button>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseEdit} className={classes.cancelButton}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className={classes.submitButton}>
            {editingId ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Detalles de la Reserva - Estilo actualizado como el de usuarios */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles de la Reserva
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedReserva ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>
                  {selectedReserva.titular_reserva ? getInitials(selectedReserva.titular_reserva) : "R"}
                </Avatar>
                <Typography className={classes.detailsName}>{selectedReserva.titular_reserva}</Typography>
                <Chip
                  label={selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1)}
                  className={`${classes.statusChip} ${
                    selectedReserva.estado === "confirmada" ? classes.activeChip : classes.inactiveChip
                  }`}
                  style={{ marginTop: "8px" }}
                />
                <Typography className={classes.detailsDescription}>
                  Reserva #{selectedReserva.numero_reserva}
                </Typography>
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3} className={classes.detailsGrid}>
                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <EventAvailable />
                      Fecha de Inicio
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedReserva.fecha_inicio ? selectedReserva.fecha_inicio.substring(0, 10) : ""}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <EventAvailable />
                      Fecha de Fin
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedReserva.fecha_fin ? selectedReserva.fecha_fin.substring(0, 10) : ""}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Home />
                      Apartamentos
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {renderApartamentosInfo(selectedReserva)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <CalendarToday />
                      Estadía
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedReserva.noches_estadia} noches
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <AttachMoney />
                      Total
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {Number(selectedReserva.total).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Payment />
                      Pagos Parciales
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {Number(selectedReserva.pagos_parciales).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <AttachMoney />
                      50% del Total
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {Number(selectedReserva.total / 2).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Group />
                      Acompañantes
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0
                        ? selectedReserva.acompanantes.map((acomp, idx) => (
                            <Box key={idx} display="flex" alignItems="center" mb={1}>
                              <Person fontSize="small" style={{ marginRight: 8, color: "#64748b" }} />
                              <span>
                                {acomp.nombre} {acomp.apellido} ({acomp.documento})
                              </span>
                            </Box>
                          ))
                        : "No hay acompañantes registrados"}
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
          {selectedReserva && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpenEdit(selectedReserva)
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

export default ReservasList
