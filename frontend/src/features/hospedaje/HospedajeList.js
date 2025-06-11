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
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
} from "@material-ui/core"
import {
  Edit,
  Delete,
  Info,
  X,
  Search,
  Download,
  UserPlus,
  Home,
  ArrowUpIcon as ArrowBack,
  ArrowUpIcon as ArrowForward,
  Check,
  Trash2,
} from "lucide-react"
import {
  Person,
  AssignmentInd,
  CalendarToday,
  AccountCircle,
  ContactMail,
  PermIdentity,
  AttachMoney,
  EventAvailable,
  EventNote,
  Group,
  LocalOffer,
  CheckCircle,
  Email,
  PhoneAndroid,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@material-ui/icons"
import Swal from "sweetalert2"
import hospedajeService from "./hospedaje.service"
import apartamentoService from "../apartamentos/apartamento.service"
import * as XLSX from "xlsx"
import "./Hospedajes.styles.css"
import { makeStyles, withStyles } from "@material-ui/core/styles"

// Personalización de las celdas del encabezado
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
    minWidth: "280px",
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
      transform: "translate(14px, 14px) scale(1)",
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "12px 14px 12px 0",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
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
  exportButton: {
    background: "linear-gradient(135deg, #4caf50, #388e3c)",
    color: "#fff",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(76, 175, 80, 0.3)",
    transition: "all 0.3s ease",
    marginRight: theme.spacing(1),
    "&:hover": {
      background: "linear-gradient(135deg, #388e3c, #2e7d32)",
      boxShadow: "0 6px 15px rgba(76, 175, 80, 0.4)",
      transform: "translateY(-2px)",
    },
  },
  roomsButton: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      boxShadow: "0 6px 15px rgba(59, 130, 246, 0.4)",
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
  checkedInRow: {
    backgroundColor: "rgba(220, 252, 231, 0.7) !important", // Changed back to green
    "&:hover": {
      backgroundColor: "rgba(220, 252, 231, 0.9) !important", // Changed back to green
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
  btnDownload: {
    backgroundColor: "#8A2BE2",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#7B1FA2",
    },
  },
  hospedajeAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  checkedInAvatar: {
    backgroundColor: "#10b981", // Changed back to green
  },
  hospedajeContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  checkInIndicator: {
    display: "flex",
    alignItems: "center",
    color: "#10b981", // Changed back to green
    fontWeight: 600,
    "& svg": {
      marginRight: theme.spacing(0.5),
      fontSize: "1rem",
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
  // Estilos optimizados para modales más pequeños y manejables
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    width: "90vw",
    maxWidth: "900px",
    height: "85vh", // Increased height
    maxHeight: "800px", // Increased max height
    margin: "auto",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: theme.spacing(2, 3),
    fontSize: "1.3rem",
    fontWeight: 600,
    position: "relative",
    minHeight: "50px",
    flexShrink: 0, // Prevent title from shrinking
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1.5),
    top: theme.spacing(1.5),
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
  },
  dialogContent: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#fff",
    flex: 1,
    overflow: "auto", // Enable scroll
    "& .MuiTextField-root": {
      marginBottom: theme.spacing(2),
    },
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    borderTop: "1px solid #e2e8f0",
    minHeight: "70px", // Increased height for better visibility
    flexShrink: 0, // Prevent actions from shrinking
  },
  cancelButton: {
    color: "#64748b",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    },
  },
  deleteCheckInButton: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
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
    padding: theme.spacing(2),
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
    marginBottom: theme.spacing(2),
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
  // Estilos para el modal de detalles optimizado
  detailsHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(1),
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    fontSize: 28,
    backgroundColor: "#2563eb",
    marginBottom: theme.spacing(2),
  },
  detailsName: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(1),
  },
  detailsDescription: {
    fontSize: "1rem",
    color: "#64748b",
    textAlign: "center",
    maxWidth: "90%",
    margin: "0 auto",
    lineHeight: 1.5,
  },
  detailsGrid: {
    marginTop: theme.spacing(2),
  },
  detailsCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
    minHeight: "100px",
  },
  detailsCardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(1.5),
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
    lineHeight: 1.4,
  },
  // Estilos para los estados
  estadoChip: {
    fontWeight: 600,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(1),
    fontSize: "0.85rem",
  },
  estadoPendiente: {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
  },
  estadoConfirmada: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  estadoCancelada: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  // Estilos para acompañantes
  acompananteContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    alignItems: "flex-end",
  },
  acompananteField: {
    flex: "1 1 200px",
    minWidth: "180px",
  },
  acompananteDeleteBtn: {
    marginLeft: theme.spacing(1),
    backgroundColor: "#ef4444",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },
  addAcompananteBtn: {
    marginTop: theme.spacing(1.5),
    color: "#2563eb",
    borderColor: "#2563eb",
    padding: "10px 20px",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.05)",
    },
  },
  // Estilos para el modal de habitaciones CON PAGINACIÓN
  roomsTableContainer: {
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    height: "auto",
  },
  roomAvailableBtn: {
    backgroundColor: "#4caf50",
    color: "#fff",
    padding: "6px 12px",
    fontSize: "0.85rem",
    "&:hover": {
      backgroundColor: "#388e3c",
    },
  },
  roomUnavailableBtn: {
    backgroundColor: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    fontSize: "0.85rem",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },
  // Iconos mejorados
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
  },
  excelButton: {
    backgroundColor: "#1D6F42",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#16593A",
    },
  },
  habitacionesButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },
  // Estilos optimizados para el wizard paso a paso
  stepperContainer: {
    marginBottom: theme.spacing(2),
    flexShrink: 0, // Prevent stepper from shrinking
  },
  stepContent: {
    padding: theme.spacing(2, 0),
    minHeight: "auto",
  },
  stepperNavButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
    padding: theme.spacing(1, 0),
  },
  stepIcon: {
    color: "#2563eb",
    "&.MuiStepIcon-active": {
      color: "#2563eb",
    },
    "&.MuiStepIcon-completed": {
      color: "#10b981",
    },
  },
  stepLabel: {
    "& .MuiStepLabel-label": {
      fontSize: "0.9rem",
      fontWeight: 500,
      "&.MuiStepLabel-active": {
        fontWeight: 600,
        color: "#2563eb",
      },
      "&.MuiStepLabel-completed": {
        fontWeight: 600,
        color: "#10b981",
      },
    },
  },
  stepperRoot: {
    backgroundColor: "transparent",
    padding: theme.spacing(1, 0),
  },
  stepperMobile: {
    backgroundColor: "transparent",
    padding: theme.spacing(1, 0),
    flexGrow: 1,
  },
  stepperMobileButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "8px 16px",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    },
  },
  stepperProgress: {
    width: "100%",
    marginBottom: theme.spacing(2),
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0, // Prevent progress bar from shrinking
  },
  stepperProgressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#2563eb",
    transition: "width 0.3s ease",
  },
  stepperTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: theme.spacing(1.5),
    textAlign: "center",
  },
  stepperSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  stepperNextButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    },
  },
  stepperBackButton: {
    color: "#64748b",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
  },
  stepperFinishButton: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    fontWeight: 500,
    padding: "10px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      background: "linear-gradient(135deg, #059669, #047857)",
    },
  },
  stepperSummaryItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    borderBottom: "1px solid #e2e8f0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  stepperSummaryLabel: {
    fontWeight: 600,
    color: "#1e293b",
    fontSize: "0.95rem",
  },
  stepperSummaryValue: {
    color: "#334155",
    fontSize: "0.95rem",
  },
  stepperSummaryCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
  },
  // Estilos optimizados para el modal de creación
  wizardDialog: {
    "& .MuiDialog-paper": {
      width: "90vw",
      maxWidth: "1000px",
      margin: "16px",
      height: "85vh", // Increased height
      maxHeight: "800px", // Increased max height
      display: "flex",
      flexDirection: "column",
    },
  },
  wizardContent: {
    padding: theme.spacing(2, 3),
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto", // Enable scroll
  },
  fieldGroup: {
    marginBottom: theme.spacing(2),
  },
  inputField: {
    marginBottom: theme.spacing(2),
    "& .MuiInputBase-input": {
      fontSize: "0.95rem",
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.95rem",
    },
  },
  stepContentWrapper: {
    flex: 1,
    padding: theme.spacing(1, 0),
    overflow: "auto", // Enable scroll for step content
  },
  // Modal de Check-in optimizado
  checkInDialog: {
    "& .MuiDialog-paper": {
      width: "85vw",
      maxWidth: "700px",
      height: "85vh", // Increased height
      maxHeight: "750px", // Increased max height
    },
  },
  // Modal de habitaciones optimizado
  roomsDialog: {
    "& .MuiDialog-paper": {
      width: "90vw",
      maxWidth: "800px",
      height: "85vh", // Increased height
      maxHeight: "750px", // Increased max height
    },
  },
  // Estilos para el indicador de check-in realizado
  checkInStatusCard: {
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: "#dcfce7", // Changed back to green
    border: "2px solid #10b981", // Changed back to green
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkInStatusText: {
    color: "#166534", // Changed back to green
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    fontSize: "0.95rem",
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
  // Paginación para habitaciones
  roomsPagination: {
    padding: theme.spacing(1),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  compactForm: {
    "& .MuiGrid-container": {
      marginBottom: 0,
    },
    "& .MuiFormControl-root": {
      marginBottom: theme.spacing(1.5),
    },
  },
}))

const HospedajeList = () => {
  const classes = useStyles()
  const [hospedajes, setHospedajes] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedHospedaje, setSelectedHospedaje] = useState(null)
  const [formData, setFormData] = useState({
    numeroReserva: "",
    cliente: "",
    numeroIdentificacion: "",
    email: "",
    telefono: "",
    fecha_inicio: "",
    fecha_fin: "",
    apartamentos: [],
    estadia: "",
    total: "",
    estado: "pendiente",
    acompanantes: [],
    descuento: { porcentaje: "", precioOriginal: "", precioConDescuento: "" },
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [checkInModalOpen, setCheckInModalOpen] = useState(false)
  const [checkInData, setCheckInData] = useState({
    horaEntrada: "",
    horaSalida: "",
    total: "",
    observaciones: "",
    acompanantes: [],
  })
  const [editMode, setEditMode] = useState(false)
  const [rooms, setRooms] = useState([])
  const [roomsModalOpen, setRoomsModalOpen] = useState(false)
  const [apartamentosOptions, setApartamentosOptions] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  // Estado para la paginación de habitaciones
  const [roomsPage, setRoomsPage] = useState(0)
  const [roomsPerPage, setRoomsPerPage] = useState(4)

  // Pasos del wizard
  const steps = [
    { label: "Información del Cliente", description: "Datos personales del cliente" },
    { label: "Fechas y Apartamentos", description: "Selección de fechas y apartamentos" },
    { label: "Descuentos", description: "Aplicar descuentos (opcional)" },
    { label: "Acompañantes", description: "Agregar acompañantes (opcional)" },
    { label: "Resumen", description: "Revisar y confirmar" },
  ]

  // Función MEJORADA para formatear apartamentos - SOLO muestra "Apartamento X"
  const formatApartamentosSimple = (apartamentos) => {
    if (!apartamentos) return "Sin apartamentos"

    if (Array.isArray(apartamentos)) {
      return apartamentos
        .map((apt) => {
          // Si es un objeto con NumeroApto
          if (typeof apt === "object" && apt !== null && apt.NumeroApto) {
            return `Apartamento ${apt.NumeroApto}`
          }
          // Si es un ID string, buscar en las opciones
          if (typeof apt === "string") {
            const option = apartamentosOptions.find((item) => item.id === apt)
            if (option && option.numeroApto) {
              return `Apartamento ${option.numeroApto}`
            }
            // Si no se encuentra, asumir que es un número de apartamento
            return `Apartamento ${apt}`
          }
          // Fallback
          return `Apartamento ${apt}`
        })
        .join(", ")
    }

    // Si no es array, convertir a string
    return `Apartamento ${apartamentos}`
  }

  // Función para obtener solo el número de apartamento
  const getApartmentNumber = (apt) => {
    if (typeof apt === "object" && apt !== null && apt.NumeroApto) {
      return apt.NumeroApto
    }
    if (typeof apt === "string") {
      const option = apartamentosOptions.find((item) => item.id === apt)
      if (option && option.numeroApto) {
        return option.numeroApto
      }
    }
    return apt
  }

  // Cargar hospedajes
  const fetchHospedajes = async () => {
    try {
      const data = await hospedajeService.getHospedajes()
      setHospedajes(data)
    } catch (error) {
      console.error("Error al obtener hospedajes", error)
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los hospedajes." })
    }
  }

  // Cargar opciones de apartamentos
  const fetchApartamentosOptions = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      const options = data.map((apt) => ({
        id: apt._id,
        label: `Apartamento ${apt.NumeroApto} - Piso ${apt.Piso} - Tarifa ${apt.Tarifa}`,
        tarifa: apt.Tarifa,
        numeroApto: apt.NumeroApto,
      }))
      setApartamentosOptions(options)
    } catch (error) {
      console.error("Error al obtener apartamentos", error)
    }
  }

  useEffect(() => {
    fetchHospedajes()
    fetchApartamentosOptions()
    const initialRooms = []
    for (let i = 1; i <= 18; i++) {
      initialRooms.push({ number: i, available: true, observation: "", numeroReserva: "" })
    }
    setRooms(initialRooms)
  }, [])

  // Cálculos Automáticos de Estadía y Total
  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      const start = new Date(formData.fecha_inicio)
      const end = new Date(formData.fecha_fin)
      const diffTime = end - start
      const diffDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0
      setFormData((prev) => ({ ...prev, estadia: diffDays }))
    } else {
      setFormData((prev) => ({ ...prev, estadia: "" }))
    }
  }, [formData.fecha_inicio, formData.fecha_fin])

  useEffect(() => {
    if (formData.apartamentos.length > 0 && formData.estadia) {
      let sumTarifas = 0
      formData.apartamentos.forEach((aptId) => {
        const apt = apartamentosOptions.find((item) => item.id === aptId)
        if (apt && apt.tarifa) {
          sumTarifas += Number(apt.tarifa)
        }
      })
      const newTotal = sumTarifas * Number(formData.estadia)
      setFormData((prev) => ({
        ...prev,
        total: newTotal,
        descuento: {
          ...prev.descuento,
          precioOriginal: newTotal,
          precioConDescuento: prev.descuento.porcentaje
            ? newTotal - (newTotal * Number(prev.descuento.porcentaje)) / 100
            : newTotal,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, total: "" }))
    }
  }, [formData.apartamentos, formData.estadia, apartamentosOptions])

  // Funciones para crear/editar hospedaje
  const handleOpen = (hospedaje) => {
    if (hospedaje) {
      // Extraer IDs de apartamentos correctamente
      let apartamentosIds = []
      if (Array.isArray(hospedaje.apartamentos)) {
        apartamentosIds = hospedaje.apartamentos.map((apt) => {
          if (typeof apt === "object" && apt._id) {
            return apt._id
          }
          return apt
        })
      }

      setFormData({
        numeroReserva: hospedaje.numeroReserva || "",
        cliente: hospedaje.cliente || "",
        numeroIdentificacion: hospedaje.numeroIdentificacion || "",
        email: hospedaje.email || "",
        telefono: hospedaje.telefono || "",
        fecha_inicio: hospedaje.fecha_inicio ? hospedaje.fecha_inicio.substring(0, 10) : "",
        fecha_fin: hospedaje.fecha_fin ? hospedaje.fecha_fin.substring(0, 10) : "",
        apartamentos: apartamentosIds,
        estadia: hospedaje.estadia || "",
        total: hospedaje.total || "",
        estado: hospedaje.estado || "pendiente", // Mantener el estado actual
        acompanantes: hospedaje.acompanantes || [],
        descuento: hospedaje.descuento || { porcentaje: "", precioOriginal: "", precioConDescuento: "" },
      })
      setEditingId(hospedaje._id)
    } else {
      setFormData({
        numeroReserva: "",
        cliente: "",
        numeroIdentificacion: "",
        email: "",
        telefono: "",
        fecha_inicio: "",
        fecha_fin: "",
        apartamentos: [],
        estadia: "",
        total: "",
        estado: "pendiente",
        acompanantes: [],
        descuento: { porcentaje: "", precioOriginal: "", precioConDescuento: "" },
      })
      setEditingId(null)
    }
    setActiveStep(0)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setActiveStep(0)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "cliente") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value) || value === "") {
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El campo cliente solo acepta letras",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else if (name === "numeroIdentificacion") {
      if (/^[A-Za-z0-9]*$/.test(value) || value === "") {
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El número de identificación solo acepta letras y números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else if (name === "telefono") {
      if (/^[0-9]*$/.test(value) || value === "") {
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El teléfono solo acepta números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else if (name === "fecha_inicio") {
      const today = new Date().toISOString().split("T")[0]
      if (value < today) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha de inicio no puede ser anterior a hoy",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (formData.fecha_fin && formData.fecha_fin <= value) {
          Swal.fire({
            icon: "warning",
            title: "Fecha inválida",
            text: "La fecha fin debe ser posterior a la fecha inicio",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          })
        }
      }
    } else if (name === "fecha_fin") {
      if (formData.fecha_inicio && value <= formData.fecha_inicio) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha fin debe ser posterior a la fecha inicio",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleApartamentosChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, apartamentos: value }))
  }

  const agregarAcompanante = () => {
    setFormData((prev) => ({
      ...prev,
      acompanantes: [...(prev.acompanantes || []), { nombre: "", apellido: "", documento: "" }],
    }))
  }

  const handleAcompananteChange = (index, e) => {
    const { name, value } = e.target

    if (name === "nombre" || name === "apellido") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value) || value === "") {
        setFormData((prev) => {
          const nuevosAcompanantes = [...prev.acompanantes]
          nuevosAcompanantes[index] = { ...nuevosAcompanantes[index], [name]: value }
          return { ...prev, acompanantes: nuevosAcompanantes }
        })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: `El campo ${name} solo acepta letras`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else if (name === "documento") {
      if (/^[A-Za-z0-9]*$/.test(value) || value === "") {
        setFormData((prev) => {
          const nuevosAcompanantes = [...prev.acompanantes]
          nuevosAcompanantes[index] = { ...nuevosAcompanantes[index], [name]: value }
          return { ...prev, acompanantes: nuevosAcompanantes }
        })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El número de documento solo acepta letras y números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else {
      setFormData((prev) => {
        const nuevosAcompanantes = [...prev.acompanantes]
        nuevosAcompanantes[index] = { ...nuevosAcompanantes[index], [name]: value }
        return { ...prev, acompanantes: nuevosAcompanantes }
      })
    }
  }

  const handleDeleteAcompanante = (index) => {
    setFormData((prev) => {
      const nuevosAcompanantes = [...prev.acompanantes]
      nuevosAcompanantes.splice(index, 1)
      return { ...prev, acompanantes: nuevosAcompanantes }
    })
  }

  const handleDescuentoChange = (e) => {
    const { name, value } = e.target

    if (name === "porcentaje") {
      const porcentaje = Number(value)
      const precioOriginal = Number(formData.total)
      const descuentoAplicado = (precioOriginal * porcentaje) / 100
      const precioConDescuento = precioOriginal - descuentoAplicado

      setFormData((prev) => ({
        ...prev,
        descuento: {
          ...prev.descuento,
          [name]: value,
          precioOriginal: precioOriginal,
          precioConDescuento: precioConDescuento,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, descuento: { ...prev.descuento, [name]: value } }))
    }
  }

  const getTodayDate = () => new Date().toISOString().split("T")[0]

  // Función mejorada para guardar hospedaje con cierre automático
  const handleSaveHospedaje = async () => {
    try {
      if (editingId) {
        const res = await hospedajeService.updateHospedaje(editingId, formData)
        await Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "El hospedaje se actualizó correctamente.",
          confirmButtonColor: "#2563eb",
          timer: 3000,
          showConfirmButton: false,
        })
        // Actualizar el estado local inmediatamente con formato correcto
        const updatedHospedaje = { ...res.hospedaje }
        setHospedajes((prev) => prev.map((h) => (h._id === updatedHospedaje._id ? updatedHospedaje : h)))
      } else {
        const res = await hospedajeService.createHospedaje(formData)
        await Swal.fire({
          icon: "success",
          title: "¡Creado!",
          text: "El hospedaje se creó correctamente.",
          confirmButtonColor: "#2563eb",
          timer: 3000,
          showConfirmButton: false,
        })
        setHospedajes((prev) => [...prev, res.hospedaje])
      }
      handleClose()
      // Refrescar después de un pequeño delay para asegurar consistencia
      setTimeout(() => {
        fetchHospedajes()
      }, 500)
    } catch (error) {
      console.error("Error al guardar hospedaje", error)
      Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al guardar el hospedaje." })
    }
  }

  const handleDetails = (hospedaje) => {
    setSelectedHospedaje(hospedaje)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setSelectedHospedaje(null)
  }

  const handleDelete = async (id, estado) => {
    if (estado === "confirmada") {
      Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No se puede eliminar un hospedaje confirmada.",
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
        await hospedajeService.deleteHospedaje(id)
        await Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El hospedaje se eliminó correctamente.",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          showConfirmButton: false,
        })
        setHospedajes((prev) => prev.filter((h) => h._id !== id))
      } catch (error) {
        console.error("Error al eliminar hospedaje", error)
        Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al eliminar el hospedaje." })
      }
    }
  }

  const nextState = (currentState) => {
    if (currentState === "pendiente") return "confirmada"
    if (currentState === "confirmada") return "cancelada"
    return "pendiente"
  }

  const handleToggleState = async (id, currentState) => {
    const newState = nextState(currentState)
    try {
      const res = await hospedajeService.updateHospedaje(id, { estado: newState })
      await Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "El estado del hospedaje se actualizó correctamente.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      })
      // Actualizar inmediatamente el estado local
      const updatedHospedaje = { ...res.hospedaje }
      setHospedajes((prev) => prev.map((h) => (h._id === updatedHospedaje._id ? updatedHospedaje : h)))

      // Refrescar después de un pequeño delay para asegurar consistencia
      setTimeout(() => {
        fetchHospedajes()
      }, 500)
    } catch (error) {
      console.error("Error al actualizar estado", error)
      Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al actualizar el estado." })
    }
  }

  const openCheckInModal = (hospedaje) => {
    setSelectedHospedaje(hospedaje)
    let horaEntrada = ""
    let horaSalida = ""
    const total = hospedaje.total || ""
    const acompanantes = hospedaje.acompanantes || []
    let observaciones = ""
    const checkInGeneral = (hospedaje.checkInData || []).find((d) => d.servicio === "CheckInGeneral")
    if (checkInGeneral) {
      if (checkInGeneral.checkIn) {
        const dateIn = new Date(checkInGeneral.checkIn)
        horaEntrada = dateIn.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      }
      if (checkInGeneral.checkOut) {
        const dateOut = new Date(checkInGeneral.checkOut)
        horaSalida = dateOut.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      }
      observaciones = checkInGeneral.observaciones || ""
    }
    setCheckInData({
      horaEntrada,
      horaSalida,
      total,
      observaciones,
      acompanantes,
    })
    setEditMode(false)
    setCheckInModalOpen(true)
  }

  const closeCheckInModal = () => {
    setCheckInModalOpen(false)
    setSelectedHospedaje(null)
  }

  const toggleEdicionRapida = () => {
    setEditMode(!editMode)
  }

  // Función mejorada para confirmar check-in con cierre automático
  const confirmCheckInCheckOut = async () => {
    if (!selectedHospedaje) return
    try {
      const today = new Date()
      const [entryHours, entryMinutes] = checkInData.horaEntrada.split(":")
      const [exitHours, exitMinutes] = checkInData.horaSalida.split(":")
      const checkInDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        Number.parseInt(entryHours || 0),
        Number.parseInt(entryMinutes || 0),
      )
      const checkOutDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        Number.parseInt(exitHours || 0),
        Number.parseInt(exitMinutes || 0),
      )
      const serviciosToSend = [
        {
          servicio: "CheckInGeneral",
          checkIn: checkInData.horaEntrada ? checkInDate : null,
          checkOut: checkInData.horaSalida ? checkOutDate : null,
          observaciones: checkInData.observaciones,
          estado: "Disponible",
        },
      ]
      const response = await hospedajeService.checkInCheckOut(selectedHospedaje._id, serviciosToSend)
      const updatedData = await hospedajeService.updateHospedaje(selectedHospedaje._id, {
        total: checkInData.total,
        acompanantes: checkInData.acompanantes,
      })
      await Swal.fire({
        icon: "success",
        title: "¡Check-in Realizado!",
        text: "Datos guardados correctamente.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      })
      setHospedajes((prev) => prev.map((h) => (h._id === updatedData.hospedaje._id ? updatedData.hospedaje : h)))
      closeCheckInModal()
      setTimeout(() => {
        fetchHospedajes()
      }, 500)
    } catch (error) {
      console.error("Error en check‑in check‑out", error)
      Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al realizar check‑in check‑out." })
    }
  }

  // Función mejorada para eliminar check-in con cierre automático
  const handleDeleteCheckIn = async () => {
    if (!selectedHospedaje) return

    const result = await Swal.fire({
      title: "¿Eliminar Check-in?",
      text: "Esta acción eliminará todos los datos de check-in/check-out. ¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })

    if (result.isConfirmed) {
      try {
        const serviciosToSend = [
          {
            servicio: "CheckInGeneral",
            checkIn: null,
            checkOut: null,
            observaciones: "",
            estado: "Disponible",
          },
        ]

        await hospedajeService.checkInCheckOut(selectedHospedaje._id, serviciosToSend)

        setCheckInData({
          horaEntrada: "",
          horaSalida: "",
          total: selectedHospedaje.total || "",
          observaciones: "",
          acompanantes: selectedHospedaje.acompanantes || [],
        })

        await Swal.fire({
          icon: "success",
          title: "¡Check-in Eliminado!",
          text: "El check-in se ha eliminado correctamente.",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          showConfirmButton: false,
        })

        closeCheckInModal()
        setTimeout(() => {
          fetchHospedajes()
        }, 500)
      } catch (error) {
        console.error("Error al eliminar check-in", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al eliminar el check-in.",
        })
      }
    }
  }

  const handleCheckInFieldChange = (field, value) => {
    setCheckInData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckInAcompananteChange = (index, e) => {
    const { name, value } = e.target

    if (name === "nombre" || name === "apellido") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value) || value === "") {
        setCheckInData((prev) => {
          const newAcomps = [...prev.acompanantes]
          newAcomps[index] = { ...newAcomps[index], [name]: value }
          return { ...prev, acompanantes: newAcomps }
        })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: `El campo ${name} solo acepta letras`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else if (name === "documento") {
      if (/^[A-Za-z0-9]*$/.test(value) || value === "") {
        setCheckInData((prev) => {
          const newAcomps = [...prev.acompanantes]
          newAcomps[index] = { ...newAcomps[index], [name]: value }
          return { ...prev, acompanantes: newAcomps }
        })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "El número de documento solo acepta letras y números",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        })
      }
    } else {
      setCheckInData((prev) => {
        const newAcomps = [...prev.acompanantes]
        newAcomps[index] = { ...newAcomps[index], [name]: value }
        return { ...prev, acompanantes: newAcomps }
      })
    }
  }

  const addCheckInAcompanante = () => {
    setCheckInData((prev) => ({
      ...prev,
      acompanantes: [...prev.acompanantes, { nombre: "", apellido: "", documento: "" }],
    }))
  }

  const removeCheckInAcompanante = (index) => {
    setCheckInData((prev) => {
      const newAcomps = [...prev.acompanantes]
      newAcomps.splice(index, 1)
      return { ...prev, acompanantes: newAcomps }
    })
  }

  const openRoomsModal = () => {
    const updatedRooms = rooms.map((room) => {
      const updatedRoom = { ...room }
      hospedajes.forEach((hospedaje) => {
        if (Array.isArray(hospedaje.apartamentos)) {
          hospedaje.apartamentos.forEach((apt) => {
            if (apt && typeof apt === "object" && apt.NumeroApto && Number.parseInt(apt.NumeroApto) === room.number) {
              updatedRoom.numeroReserva = hospedaje.numeroReserva
              updatedRoom.available = false
            }
          })
        }
      })
      return updatedRoom
    })
    setRooms(updatedRooms)
    setRoomsPage(0) // Resetear la página al abrir el modal
    setRoomsModalOpen(true)
  }

  const closeRoomsModal = () => setRoomsModalOpen(false)

  // Función mejorada para guardar habitaciones con cierre automático
  const handleSaveRooms = async () => {
    try {
      const response = await hospedajeService.saveHabitaciones(rooms)
      await Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: response.msg,
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      })
      closeRoomsModal()
    } catch (error) {
      console.error("Error al guardar habitaciones", error)
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron guardar los cambios." })
    }
  }

  const handleDownloadPDF = (hospedaje) => {
    const content = `Factura
Número de Reserva: ${hospedaje.numeroReserva}
Cliente: ${hospedaje.cliente}
Fecha: ${hospedaje.fecha_inicio ? new Date(hospedaje.fecha_inicio).toLocaleDateString() : ""}
Total: ${hospedaje.total}
Estado: ${hospedaje.estado}`
    downloadFile(content, `${hospedaje.numeroReserva}_factura.pdf`, "application/pdf")
  }

  const downloadFile = (content, filename, mimeType) => {
    let blob
    if (content instanceof Blob) {
      blob = content
    } else {
      blob = new Blob([content], { type: mimeType })
    }
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.setAttribute("download", filename)
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const data = hospedajes.map((h) => ({
      "Número de Reserva": h.numeroReserva,
      Cliente: h.cliente,
      "Fecha Inicio": h.fecha_inicio ? h.fecha_inicio.substring(0, 10) : "",
      "Fecha Fin": h.fecha_fin ? h.fecha_fin.substring(0, 10) : "",
      Apartamentos: formatApartamentosSimple(h.apartamentos),
      Estadía: h.estadia,
      Total: Number(h.total).toLocaleString("es-CO", { style: "currency", currency: "COP" }),
      Estado: h.estado,
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hospedajes")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    downloadFile(excelBuffer, "hospedajes.xlsx", "application/octet-stream")
  }

  const filteredHospedajes = hospedajes.filter(
    (h) =>
      (h.numeroReserva + "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedHospedajes = filteredHospedajes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Funciones para la paginación de habitaciones
  const handleRoomsChangePage = (event, newPage) => setRoomsPage(newPage)
  const handleRoomsChangeRowsPerPage = (event) => {
    setRoomsPerPage(Number.parseInt(event.target.value, 10))
    setRoomsPage(0)
  }

  // Habitaciones paginadas
  const paginatedRooms = rooms.slice(roomsPage * roomsPerPage, roomsPage * roomsPerPage + roomsPerPage)

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "HO"
  }

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "pendiente":
        return classes.estadoPendiente
      case "confirmada":
        return classes.estadoConfirmada
      case "cancelada":
        return classes.estadoCancelada
      default:
        return ""
    }
  }

  const hasCheckIn = (hospedaje) => {
    return (
      hospedaje.checkInData &&
      hospedaje.checkInData.find((d) => d.servicio === "CheckInGeneral" && d.checkIn) !== undefined
    )
  }

  // Funciones para el wizard paso a paso
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const canAdvance = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.cliente.trim() !== "" &&
          formData.numeroIdentificacion.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.telefono.trim() !== ""
        )
      case 1:
        return (
          formData.fecha_inicio !== "" &&
          formData.fecha_fin !== "" &&
          formData.apartamentos.length > 0 &&
          formData.estadia !== "" &&
          formData.total !== ""
        )
      case 2:
        return true
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box className={classes.compactForm}>
            <Typography className={classes.stepperTitle}>Información del Cliente</Typography>
            <Typography className={classes.stepperSubtitle}>
              Ingrese los datos personales del cliente para el hospedaje
            </Typography>

            <Grid container spacing={2}>
              {editingId && (
                <Grid item xs={12}>
                  <TextField
                    className={classes.inputField}
                    margin="dense"
                    label="Número de Reserva"
                    name="numeroReserva"
                    value={formData.numeroReserva}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PermIdentity className={classes.fieldIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Número de Identificación"
                  name="numeroIdentificacion"
                  value={formData.numeroIdentificacion}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactMail className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroid className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )
      case 1:
        return (
          <Box className={classes.compactForm}>
            <Typography className={classes.stepperTitle}>Fechas y Apartamentos</Typography>
            <Typography className={classes.stepperSubtitle}>
              Seleccione las fechas de hospedaje y los apartamentos
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Fecha Inicio"
                  name="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventNote className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Fecha Fin"
                  name="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventNote className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense" className={classes.inputField} size="small">
                  <InputLabel id="apartamentos-label">Apartamentos</InputLabel>
                  <Select
                    labelId="apartamentos-label"
                    multiple
                    name="apartamentos"
                    value={formData.apartamentos}
                    onChange={handleApartamentosChange}
                    renderValue={(selected) => (
                      <Box display="flex" flexWrap="wrap">
                        {selected.map((value) => {
                          const apt = apartamentosOptions.find((item) => item.id === value)
                          return (
                            <Chip
                              key={value}
                              label={apt ? `Apartamento ${apt.numeroApto}` : `Apartamento ${value}`}
                              style={{ margin: 2 }}
                              size="small"
                            />
                          )
                        })}
                      </Box>
                    )}
                    variant="outlined"
                    required
                  >
                    {apartamentosOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Estadía"
                  name="estadia"
                  value={formData.estadia}
                  fullWidth
                  variant="outlined"
                  disabled
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Total"
                  name="total"
                  type="number"
                  value={formData.total}
                  fullWidth
                  variant="outlined"
                  disabled
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth className={classes.inputField} margin="dense" size="small">
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    variant="outlined"
                    startAdornment={
                      <InputAdornment position="start">
                        <AssignmentInd className={classes.fieldIcon} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="confirmada">Confirmada</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )
      case 2:
        return (
          <Box className={classes.compactForm}>
            <Typography className={classes.stepperTitle}>Descuentos</Typography>
            <Typography className={classes.stepperSubtitle}>Aplique descuentos al hospedaje (opcional)</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth className={classes.inputField} margin="dense" size="small">
                  <InputLabel id="porcentaje-label">Porcentaje</InputLabel>
                  <Select
                    labelId="porcentaje-label"
                    name="porcentaje"
                    value={formData.descuento.porcentaje}
                    onChange={handleDescuentoChange}
                    variant="outlined"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocalOffer className={classes.fieldIcon} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Seleccionar</MenuItem>
                    <MenuItem value="5">5%</MenuItem>
                    <MenuItem value="10">10%</MenuItem>
                    <MenuItem value="15">15%</MenuItem>
                    <MenuItem value="20">20%</MenuItem>
                    <MenuItem value="25">25%</MenuItem>
                    <MenuItem value="30">30%</MenuItem>
                    <MenuItem value="35">35%</MenuItem>
                    <MenuItem value="40">40%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Precio Original"
                  name="precioOriginal"
                  type="number"
                  value={formData.descuento.precioOriginal}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  className={classes.inputField}
                  margin="dense"
                  label="Precio con Descuento"
                  name="precioConDescuento"
                  type="number"
                  value={formData.descuento.precioConDescuento}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney className={classes.fieldIcon} />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        )
      case 3:
        return (
          <Box className={classes.compactForm}>
            <Typography className={classes.stepperTitle}>Acompañantes</Typography>
            <Typography className={classes.stepperSubtitle}>Agregue acompañantes al hospedaje (opcional)</Typography>

            {formData.acompanantes &&
              formData.acompanantes.map((acomp, index) => (
                <Box key={index} className={classes.acompananteContainer}>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={acomp.nombre}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    className={classes.acompananteField}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person className={classes.fieldIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Apellido"
                    name="apellido"
                    value={acomp.apellido}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    className={classes.acompananteField}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person className={classes.fieldIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Documento"
                    name="documento"
                    value={acomp.documento}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    className={classes.acompananteField}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ContactMail className={classes.fieldIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    onClick={() => handleDeleteAcompanante(index)}
                    className={classes.acompananteDeleteBtn}
                    size="small"
                  >
                    <Delete size={16} />
                  </IconButton>
                </Box>
              ))}
            <Button
              variant="outlined"
              onClick={agregarAcompanante}
              className={classes.addAcompananteBtn}
              startIcon={<Group />}
              size="small"
            >
              Agregar Acompañante
            </Button>
          </Box>
        )
      case 4:
        return (
          <Box className={classes.compactForm}>
            <Typography className={classes.stepperTitle}>Resumen del Hospedaje</Typography>
            <Typography className={classes.stepperSubtitle}>Revise la información antes de finalizar</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box className={classes.stepperSummaryCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <AccountCircle />
                    Información del Cliente
                  </Typography>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Cliente:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.cliente}</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Identificación:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.numeroIdentificacion}</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Email:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.email}</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Teléfono:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.telefono}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.stepperSummaryCard}>
                  <Typography className={classes.detailsCardTitle}>
                    <EventAvailable />
                    Fechas y Apartamentos
                  </Typography>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Fecha Inicio:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.fecha_inicio}</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Fecha Fin:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.fecha_fin}</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Apartamentos:</Typography>
                    <Typography className={classes.stepperSummaryValue}>
                      {formData.apartamentos
                        .map((aptId) => {
                          const apt = apartamentosOptions.find((item) => item.id === aptId)
                          return apt ? `Apartamento ${apt.numeroApto}` : `Apartamento ${aptId}`
                        })
                        .join(", ")}
                    </Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Estadía:</Typography>
                    <Typography className={classes.stepperSummaryValue}>{formData.estadia} días</Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Total:</Typography>
                    <Typography className={classes.stepperSummaryValue}>
                      {Number(formData.total).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                    </Typography>
                  </Box>
                  <Box className={classes.stepperSummaryItem}>
                    <Typography className={classes.stepperSummaryLabel}>Estado:</Typography>
                    <Typography className={classes.stepperSummaryValue}>
                      <Chip
                        label={formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)}
                        className={`${classes.estadoChip} ${getEstadoClass(formData.estado)}`}
                        size="small"
                      />
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {formData.descuento && formData.descuento.porcentaje && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.stepperSummaryCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <LocalOffer />
                      Descuento
                    </Typography>
                    <Box className={classes.stepperSummaryItem}>
                      <Typography className={classes.stepperSummaryLabel}>Porcentaje:</Typography>
                      <Typography className={classes.stepperSummaryValue}>{formData.descuento.porcentaje}%</Typography>
                    </Box>
                    <Box className={classes.stepperSummaryItem}>
                      <Typography className={classes.stepperSummaryLabel}>Precio Original:</Typography>
                      <Typography className={classes.stepperSummaryValue}>
                        {Number(formData.descuento.precioOriginal).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        })}
                      </Typography>
                    </Box>
                    <Box className={classes.stepperSummaryItem}>
                      <Typography className={classes.stepperSummaryLabel}>Precio con Descuento:</Typography>
                      <Typography className={classes.stepperSummaryValue}>
                        {Number(formData.descuento.precioConDescuento).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {formData.acompanantes && formData.acompanantes.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.stepperSummaryCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Group />
                      Acompañantes
                    </Typography>
                    {formData.acompanantes.map((acomp, index) => (
                      <Box key={index} className={classes.stepperSummaryItem}>
                        <Typography className={classes.stepperSummaryLabel}>Acompañante {index + 1}:</Typography>
                        <Typography className={classes.stepperSummaryValue}>
                          {acomp.nombre} {acomp.apellido} - {acomp.documento}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )
      default:
        return "Paso desconocido"
    }
  }

  return (
    <Box
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Gestión de Hospedajes
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Administra los hospedajes del sistema
        </Typography>
      </Box>

      {/* Barra de búsqueda */}
      <Box className={classes.searchContainer}>
        <TextField
          label="Buscar por reserva o cliente"
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
          <Tooltip title="Exportar Excel">
            <IconButton className={`${classes.iconButton} ${classes.excelButton}`} onClick={handleExportExcel}>
              <Download size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver Habitaciones">
            <IconButton className={`${classes.iconButton} ${classes.habitacionesButton}`} onClick={openRoomsModal}>
              <Home size={20} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            className={classes.addButton}
            onClick={() => handleOpen(null)}
            startIcon={<UserPlus size={20} />}
          >
            Crear Hospedaje
          </Button>
        </Box>
      </Box>

      {/* Tabla de hospedajes */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#2563eb" }}>
              <StyledTableCell style={{ textAlign: "left", paddingLeft: "24px" }}>Cliente</StyledTableCell>
              <StyledTableCell>Número</StyledTableCell>
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
            {paginatedHospedajes.map((h) => {
              const checkedIn = hasCheckIn(h)
              return (
                <TableRow key={h._id} className={`${classes.tableRow} ${checkedIn ? classes.checkedInRow : ""}`}>
                  <UserTableCell
                    style={{
                      paddingLeft: "24px",
                      cursor: "pointer",
                    }}
                    onClick={() => openCheckInModal(h)}
                    title="Hacer Check‑in / Check‑out"
                  >
                    <Box className={classes.hospedajeContainer}>
                      <Avatar className={`${classes.hospedajeAvatar} ${checkedIn ? classes.checkedInAvatar : ""}`}>
                        {getInitials(h.cliente)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: checkedIn ? 600 : 400 }}>
                          {h.cliente}
                        </Typography>
                        {checkedIn && (
                          <Typography variant="caption" className={classes.checkInIndicator}>
                            <CheckCircle fontSize="small" /> Check-in realizado
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </UserTableCell>
                  <TableCell className={classes.tableCell}>{h.numeroReserva}</TableCell>
                  <TableCell className={classes.tableCell}>
                    {h.fecha_inicio ? h.fecha_inicio.substring(0, 10) : ""}
                  </TableCell>
                  <TableCell className={classes.tableCell}>{h.fecha_fin ? h.fecha_fin.substring(0, 10) : ""}</TableCell>
                  <TableCell className={classes.tableCell}>{formatApartamentosSimple(h.apartamentos)}</TableCell>
                  <TableCell className={classes.tableCell}>{h.estadia}</TableCell>
                  <TableCell className={classes.tableCell}>
                    {Number(h.total).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Chip
                      label={h.estado.charAt(0).toUpperCase() + h.estado.slice(1)}
                      className={`${classes.estadoChip} ${getEstadoClass(h.estado)}`}
                      onClick={() => handleToggleState(h._id, h.estado)}
                    />
                  </TableCell>
                  <TableCell className={`${classes.tableCell} ${classes.actionsCell}`}>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDetails}`}
                          onClick={() => handleDetails(h)}
                        >
                          <Info size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar hospedaje">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnEdit}`}
                          onClick={() => handleOpen(h)}
                        >
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                    

                      <Tooltip title="Eliminar hospedaje">
                        <IconButton
                          className={`${classes.actionButton} ${classes.btnDelete}`}
                          onClick={() => handleDelete(h._id, h.estado)}
                        >
                          <Delete size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
            {paginatedHospedajes.length === 0 && (
              <TableRow className={classes.noDataRow}>
                <TableCell colSpan={9} className={classes.noDataCell}>
                  No se encontraron hospedajes que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component={Paper}
        count={filteredHospedajes.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        className={classes.pagination}
      />

      {/* Modal para crear/editar hospedaje - Diseño optimizado CON SCROLL */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        classes={{ paper: classes.dialogPaper }}
        className={classes.wizardDialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          {editingId ? "Editar Hospedaje" : "Agregar Hospedaje"}
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.wizardContent}>
          {/* Barra de progreso */}
          <Box className={classes.stepperProgress}>
            <Box
              className={classes.stepperProgressBar}
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </Box>

          {/* Stepper para pantallas medianas y grandes */}
          <Box className={classes.stepperContainer} display={{ xs: "none", sm: "block" }}>
            <Stepper activeStep={activeStep} className={classes.stepperRoot}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel StepIconProps={{ classes: { root: classes.stepIcon } }} className={classes.stepLabel}>
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Stepper para móviles */}
          <Box className={classes.stepperContainer} display={{ xs: "block", sm: "none" }}>
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              className={classes.stepperMobile}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1 || !canAdvance()}
                  className={classes.stepperMobileButton}
                >
                  Siguiente
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  className={classes.stepperMobileButton}
                >
                  <KeyboardArrowLeft />
                  Atrás
                </Button>
              }
            />
          </Box>

          {/* Contenido del paso actual */}
          <Box className={classes.stepContentWrapper}>
            <Box className={classes.stepContent}>{getStepContent(activeStep)}</Box>
          </Box>
        </DialogContent>

        {/* Botones de navegación */}
        <DialogActions className={classes.dialogActions}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className={classes.stepperBackButton}
            startIcon={<ArrowBack />}
          >
            Atrás
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSaveHospedaje}
                className={classes.stepperFinishButton}
                startIcon={<Check />}
              >
                Finalizar
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                className={classes.stepperNextButton}
                disabled={!canAdvance()}
                endIcon={<ArrowForward />}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles optimizado */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth={false}
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Detalles del Hospedaje
          <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedHospedaje ? (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedHospedaje.cliente)}</Avatar>
                <Typography className={classes.detailsName}>{selectedHospedaje.cliente}</Typography>
                <Chip
                  label={selectedHospedaje.estado.charAt(0).toUpperCase() + selectedHospedaje.estado.slice(1)}
                  className={`${classes.estadoChip} ${getEstadoClass(selectedHospedaje.estado)}`}
                  style={{ marginTop: "8px" }}
                />
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={2} className={classes.detailsGrid}>
                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <PermIdentity />
                      Número de Reserva
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedHospedaje.numeroReserva}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <ContactMail />
                      Número de Identificación
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedHospedaje.numeroIdentificacion}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Email />
                      Email
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedHospedaje.email || "No especificado"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <PhoneAndroid />
                      Teléfono
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {selectedHospedaje.telefono || "No especificado"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <EventNote />
                      Fechas
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      <strong>Inicio:</strong>{" "}
                      {selectedHospedaje.fecha_inicio ? selectedHospedaje.fecha_inicio.substring(0, 10) : ""}
                      <br />
                      <strong>Fin:</strong>{" "}
                      {selectedHospedaje.fecha_fin ? selectedHospedaje.fecha_fin.substring(0, 10) : ""}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <Home />
                      Apartamentos
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {formatApartamentosSimple(selectedHospedaje.apartamentos)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <CalendarToday />
                      Estadía
                    </Typography>
                    <Typography className={classes.detailsCardContent}>{selectedHospedaje.estadia} días</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <Box className={classes.detailsCard}>
                    <Typography className={classes.detailsCardTitle}>
                      <AttachMoney />
                      Total
                    </Typography>
                    <Typography className={classes.detailsCardContent}>
                      {Number(selectedHospedaje.total).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Sección de Descuento */}
              {selectedHospedaje.descuento && selectedHospedaje.descuento.porcentaje && (
                <Box mt={2}>
                  <Typography className={classes.sectionTitle}>
                    <LocalOffer />
                    Descuento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box className={classes.detailsCard}>
                        <Typography className={classes.detailsCardTitle}>Porcentaje</Typography>
                        <Typography className={classes.detailsCardContent}>
                          {selectedHospedaje.descuento.porcentaje}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className={classes.detailsCard}>
                        <Typography className={classes.detailsCardTitle}>Precio Original</Typography>
                        <Typography className={classes.detailsCardContent}>
                          {Number(selectedHospedaje.descuento.precioOriginal).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className={classes.detailsCard}>
                        <Typography className={classes.detailsCardTitle}>Precio con Descuento</Typography>
                        <Typography className={classes.detailsCardContent}>
                          {Number(selectedHospedaje.descuento.precioConDescuento).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Sección de Acompañantes */}
              {selectedHospedaje.acompanantes && selectedHospedaje.acompanantes.length > 0 && (
                <Box mt={2}>
                  <Typography className={classes.sectionTitle}>
                    <Group />
                    Acompañantes
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedHospedaje.acompanantes.map((ac, idx) => (
                      <Grid item xs={12} md={6} lg={4} key={idx}>
                        <Box className={classes.detailsCard}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar
                              style={{
                                width: 40,
                                height: 40,
                                backgroundColor: "#2563eb",
                                marginRight: 12,
                                fontSize: "1rem",
                              }}
                            >
                              {getInitials(`${ac.nombre} ${ac.apellido}`)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 2 }}>
                                {ac.nombre} {ac.apellido}
                              </Typography>
                              <Typography variant="caption" style={{ color: "#64748b" }}>
                                Documento: {ac.documento}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Sección de Check-in / Check-out */}
              {selectedHospedaje.checkInData && selectedHospedaje.checkInData.length > 0 && (
                <Box mt={2}>
                  <Typography className={classes.sectionTitle}>
                    <EventAvailable />
                    Check‑in / Check‑out
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedHospedaje.checkInData.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box className={classes.detailsCard}>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 600, color: "#2563eb", marginBottom: 12 }}
                          >
                            {item.servicio}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4 }}>
                                Check‑in:
                              </Typography>
                              <Typography variant="body2">
                                {item.checkIn ? new Date(item.checkIn).toLocaleString() : "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4 }}>
                                Check‑out:
                              </Typography>
                              <Typography variant="body2">
                                {item.checkOut ? new Date(item.checkOut).toLocaleString() : "N/A"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4 }}>
                                Observaciones:
                              </Typography>
                              <Typography variant="body2">{item.observaciones || "N/A"}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <Typography variant="body1">Cargando detalles...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDetails} className={classes.cancelButton}>
            Cerrar
          </Button>
          {selectedHospedaje && (
            <Button
              onClick={() => {
                handleCloseDetails()
                handleOpen(selectedHospedaje)
              }}
              className={classes.submitButton}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Check-in / Check-out optimizado */}
      <Dialog
        open={checkInModalOpen}
        onClose={closeCheckInModal}
        fullWidth
        maxWidth={false}
        classes={{ paper: classes.dialogPaper }}
        className={classes.checkInDialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          Check‑in / Check‑out
          <IconButton onClick={closeCheckInModal} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedHospedaje && (
            <>
              <Box className={classes.detailsHeader}>
                <Avatar className={classes.detailsAvatar}>{getInitials(selectedHospedaje.cliente)}</Avatar>
                <Typography className={classes.detailsName}>{selectedHospedaje.cliente}</Typography>
                <Typography className={classes.detailsDescription}>
                  ID: {selectedHospedaje.numeroIdentificacion} | Reserva: {selectedHospedaje.numeroReserva}
                </Typography>
              </Box>

              {/* Indicador de check-in realizado */}
              {hasCheckIn(selectedHospedaje) && (
                <Box className={classes.checkInStatusCard}>
                  <Typography className={classes.checkInStatusText}>
                    <CheckCircle />
                    Check-in realizado exitosamente
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Trash2 size={16} />}
                    onClick={handleDeleteCheckIn}
                    size="small"
                    style={{
                      color: "#ef4444",
                      borderColor: "#ef4444",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                      },
                    }}
                  >
                    Eliminar Check-in
                  </Button>
                </Box>
              )}

              <Divider style={{ margin: "16px 0" }} />

              <Box className={classes.formSection}>
                <Typography className={classes.sectionTitle}>
                  <EventAvailable />
                  Horarios
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      className={classes.formField}
                      label="Hora de Entrada"
                      type="time"
                      value={checkInData.horaEntrada}
                      onChange={(e) => handleCheckInFieldChange("horaEntrada", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                      disabled={!editMode}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventNote className={classes.fieldIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      className={classes.formField}
                      label="Hora de Salida"
                      type="time"
                      value={checkInData.horaSalida}
                      onChange={(e) => handleCheckInFieldChange("horaSalida", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                      disabled={!editMode}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventNote className={classes.fieldIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      className={classes.formField}
                      label="Total"
                      type="number"
                      value={checkInData.total}
                      onChange={(e) => handleCheckInFieldChange("total", e.target.value)}
                      fullWidth
                      disabled={!editMode}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney className={classes.fieldIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      className={classes.formField}
                      label="Observaciones"
                      value={checkInData.observaciones}
                      onChange={(e) => handleCheckInFieldChange("observaciones", e.target.value)}
                      fullWidth
                      disabled={!editMode}
                      variant="outlined"
                      multiline
                      rows={2}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                            <Info className={classes.fieldIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box className={classes.formSection}>
                <Typography className={classes.sectionTitle}>
                  <Group />
                  Acompañantes
                </Typography>
                <Grid container spacing={2}>
                  {checkInData.acompanantes &&
                    checkInData.acompanantes.map((acomp, index) => (
                      <Grid item xs={12} key={index}>
                        <Box className={classes.acompananteContainer}>
                          <TextField
                            label="Nombre"
                            name="nombre"
                            value={acomp.nombre}
                            onChange={(e) => handleCheckInAcompananteChange(index, e)}
                            className={classes.acompananteField}
                            variant="outlined"
                            disabled={!editMode}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person className={classes.fieldIcon} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            label="Apellido"
                            name="apellido"
                            value={acomp.apellido}
                            onChange={(e) => handleCheckInAcompananteChange(index, e)}
                            className={classes.acompananteField}
                            variant="outlined"
                            disabled={!editMode}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person className={classes.fieldIcon} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            label="Documento"
                            name="documento"
                            value={acomp.documento}
                            onChange={(e) => handleCheckInAcompananteChange(index, e)}
                            className={classes.acompananteField}
                            variant="outlined"
                            disabled={!editMode}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ContactMail className={classes.fieldIcon} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {editMode && (
                            <IconButton
                              onClick={() => removeCheckInAcompanante(index)}
                              className={classes.acompananteDeleteBtn}
                              size="small"
                            >
                              <Delete size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    ))}
                </Grid>
                {editMode && (
                  <Button
                    variant="outlined"
                    onClick={addCheckInAcompanante}
                    className={classes.addAcompananteBtn}
                    startIcon={<Group />}
                    size="small"
                  >
                    Agregar Acompañante
                  </Button>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={toggleEdicionRapida}
            variant="outlined"
            size="small"
            style={{ color: editMode ? "#ef4444" : "#2563eb", borderColor: editMode ? "#ef4444" : "#2563eb" }}
          >
            {editMode ? "Desactivar Edición" : "Edición rápida"}
          </Button>
          <Button onClick={confirmCheckInCheckOut} className={classes.submitButton} size="small">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Habitaciones optimizado - CON PAGINACIÓN */}
      <Dialog
        open={roomsModalOpen}
        onClose={closeRoomsModal}
        fullWidth
        maxWidth={false}
        classes={{ paper: classes.dialogPaper }}
        className={classes.roomsDialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          Habitaciones Disponibles
          <IconButton onClick={closeRoomsModal} className={classes.closeButton}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TableContainer component={Paper} className={classes.roomsTableContainer}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#2563eb" }}>
                  <StyledTableCell>Apartamentos</StyledTableCell>
                  <StyledTableCell>Número de Reserva</StyledTableCell>
                  <StyledTableCell>Disponibilidad</StyledTableCell>
                  <StyledTableCell>Observación</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRooms.map((room) => (
                  <TableRow key={room.number} className={classes.tableRow}>
                    <TableCell className={classes.tableCell}>{room.number}</TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        value={room.numeroReserva}
                        onChange={(e) => {
                          const newValue = e.target.value
                          setRooms((prev) =>
                            prev.map((r) => (r.number === room.number ? { ...r, numeroReserva: newValue } : r)),
                          )
                        }}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <Button
                        variant="contained"
                        className={room.available ? classes.roomAvailableBtn : classes.roomUnavailableBtn}
                        onClick={() => {
                          setRooms((prev) =>
                            prev.map((r) => (r.number === room.number ? { ...r, available: !r.available } : r)),
                          )
                        }}
                        size="small"
                      >
                        {room.available ? "Disponible" : "No disponible"}
                      </Button>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        value={room.observation}
                        onChange={(e) => {
                          const newObs = e.target.value
                          setRooms((prev) =>
                            prev.map((r) => (r.number === room.number ? { ...r, observation: newObs } : r)),
                          )
                        }}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación para habitaciones */}
          <TablePagination
            component={Paper}
            count={rooms.length}
            page={roomsPage}
            onPageChange={handleRoomsChangePage}
            rowsPerPage={roomsPerPage}
            onRowsPerPageChange={handleRoomsChangeRowsPerPage}
            labelRowsPerPage="Habitaciones por página:"
            rowsPerPageOptions={[4, 8, 12]}
            className={classes.roomsPagination}
          />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={closeRoomsModal} className={classes.cancelButton}>
            Cerrar
          </Button>
          <Button onClick={handleSaveRooms} className={classes.submitButton}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HospedajeList
