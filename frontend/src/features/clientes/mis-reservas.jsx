"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  Avatar,
  Collapse,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import {
  CalendarToday,
  Home,
  AttachMoney,
  Person,
  Close,
  ExpandMore,
  ExpandLess,
  Info,
  Event,
  LocationOn,
  People,
  Payment,
  Receipt,
} from "@material-ui/icons"
// Corregir la importación para que coincida con el nombre real del archivo
import clienteService from "./clientes.service.js"
import Swal from "sweetalert2"

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
    marginBottom: theme.spacing(4),
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
  tableContainer: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1.5),
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    background: "#fff",
  },
  tableHead: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  },
  tableHeadCell: {
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.9rem",
    padding: theme.spacing(2),
    textAlign: "center",
    letterSpacing: "0.8px",
    borderBottom: "none",
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
  chip: {
    fontWeight: 600,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(1),
  },
  chipPendiente: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  chipConfirmada: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  chipCancelada: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  detailsButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2563eb",
    },
    borderRadius: "50%",
    padding: theme.spacing(1),
    minWidth: "auto",
    width: 36,
    height: 36,
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
  },
  dialogActions: {
    padding: theme.spacing(2, 3, 3),
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1.5),
    borderTop: "1px solid #e2e8f0",
  },
  closeDialogButton: {
    color: "#64748b",
    fontWeight: 500,
    padding: "8px 24px",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
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
  detailCard: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  detailCardContent: {
    padding: theme.spacing(2),
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    "& svg": {
      color: "#2563eb",
      marginRight: theme.spacing(1),
    },
  },
  detailLabel: {
    fontWeight: 600,
    color: "#475569",
    marginRight: theme.spacing(1),
  },
  detailValue: {
    color: "#334155",
  },
  apartmentCard: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  apartmentCardContent: {
    padding: theme.spacing(2),
  },
  apartmentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  apartmentTitle: {
    fontWeight: 600,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    "& svg": {
      color: "#2563eb",
      marginRight: theme.spacing(1),
    },
  },
  expandButton: {
    padding: 0,
    color: "#64748b",
  },
  acompanantesList: {
    marginTop: theme.spacing(2),
  },
  acompananteItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid #e2e8f0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  acompananteAvatar: {
    backgroundColor: "#2563eb",
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: "0.9rem",
    marginRight: theme.spacing(2),
  },
  acompananteInfo: {
    flex: 1,
  },
  acompananteNombre: {
    fontWeight: 600,
    color: "#1e293b",
  },
  acompananteDocumento: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  noReservasContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    backgroundColor: "#f8fafc",
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  noReservasIcon: {
    fontSize: 60,
    color: "#94a3b8",
    marginBottom: theme.spacing(2),
  },
  noReservasTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#334155",
    marginBottom: theme.spacing(1),
  },
  noReservasText: {
    color: "#64748b",
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
  },
  loadingText: {
    marginTop: theme.spacing(2),
    color: "#64748b",
  },
}))

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return "No disponible"
  const options = { day: "2-digit", month: "2-digit", year: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Función para obtener iniciales
const getInitials = (name) => {
  if (!name) return "A"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

const MisReservas = () => {
  const classes = useStyles()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [expandedApartamentos, setExpandedApartamentos] = useState({})

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true)
        // Usar el servicio de cliente en lugar del servicio de reserva
        const data = await clienteService.getMisReservas()
        setReservas(data)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener las reservas:", error)
        setError("No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.")
        setLoading(false)

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.",
          confirmButtonColor: "#2563eb",
        })
      }
    }

    fetchReservas()
  }, [])

  const handleOpenDetails = (reserva) => {
    setSelectedReserva(reserva)
    setOpenDialog(true)
    // Inicializar el estado de expansión de apartamentos
    const initialExpandedState = {}
    reserva.apartamentos.forEach((apt) => {
      initialExpandedState[apt._id] = false
    })
    setExpandedApartamentos(initialExpandedState)
  }

  const handleCloseDetails = () => {
    setOpenDialog(false)
    setSelectedReserva(null)
  }

  const toggleApartamentoExpand = (aptId) => {
    setExpandedApartamentos((prev) => ({
      ...prev,
      [aptId]: !prev[aptId],
    }))
  }

  const getEstadoChipClass = (estado) => {
    switch (estado) {
      case "pendiente":
        return classes.chipPendiente
      case "confirmada":
        return classes.chipConfirmada
      case "cancelada":
        return classes.chipCancelada
      default:
        return ""
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente"
      case "confirmada":
        return "Confirmada"
      case "cancelada":
        return "Cancelada"
      default:
        return estado
    }
  }

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress style={{ color: "#2563eb" }} />
        <Typography variant="body1" className={classes.loadingText}>
          Cargando tus reservas...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className={classes.noReservasContainer}>
        <Info className={classes.noReservasIcon} />
        <Typography variant="h5" className={classes.noReservasTitle}>
          Error al cargar reservas
        </Typography>
        <Typography variant="body1" className={classes.noReservasText}>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          style={{ backgroundColor: "#2563eb" }}
        >
          Reintentar
        </Button>
      </Box>
    )
  }

  if (reservas.length === 0) {
    return (
      <Box className={classes.noReservasContainer}>
        <CalendarToday className={classes.noReservasIcon} />
        <Typography variant="h5" className={classes.noReservasTitle}>
          No tienes reservas
        </Typography>
        <Typography variant="body1" className={classes.noReservasText}>
          Actualmente no tienes ninguna reserva registrada en nuestro sistema.
        </Typography>
      </Box>
    )
  }

  return (
    <Paper
      className={classes.container}
      style={{ paddingTop: "10px", borderTop: "6px solid #2563eb", borderRadius: "8px" }}
    >
      <Box className={classes.pageHeader}>
        <Typography variant="h4" className={classes.pageTitle}>
          Mis Reservas
        </Typography>
        <Typography variant="body1" className={classes.pageSubtitle}>
          Consulta el historial de tus reservas
        </Typography>
      </Box>

      <TableContainer className={classes.tableContainer}>
        <Table>
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell className={classes.tableHeadCell}>Nº Reserva</TableCell>
              <TableCell className={classes.tableHeadCell}>Fechas</TableCell>
              <TableCell className={classes.tableHeadCell}>Noches</TableCell>
              <TableCell className={classes.tableHeadCell}>Total</TableCell>
              <TableCell className={classes.tableHeadCell}>Estado</TableCell>
              <TableCell className={classes.tableHeadCell}>Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservas.map((reserva) => (
              <TableRow key={reserva._id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{reserva.numero_reserva}</TableCell>
                <TableCell className={classes.tableCell}>
                  {formatDate(reserva.fecha_inicio)} - {formatDate(reserva.fecha_fin)}
                </TableCell>
                <TableCell className={classes.tableCell}>{reserva.noches_estadia}</TableCell>
                <TableCell className={classes.tableCell}>{formatCurrency(reserva.total)}</TableCell>
                <TableCell className={classes.tableCell}>
                  <Chip
                    label={getEstadoLabel(reserva.estado)}
                    className={`${classes.chip} ${getEstadoChipClass(reserva.estado)}`}
                  />
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <IconButton className={classes.detailsButton} onClick={() => handleOpenDetails(reserva)}>
                    <Info fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de detalles de reserva */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
        classes={{ paper: classes.dialogPaper }}
      >
        {selectedReserva && (
          <>
            <DialogTitle className={classes.dialogTitle}>
              Detalles de la Reserva #{selectedReserva.numero_reserva}
              <IconButton onClick={handleCloseDetails} className={classes.closeButton}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <Grid container spacing={3}>
                {/* Información general de la reserva */}
                <Grid item xs={12}>
                  <Typography className={classes.sectionTitle}>
                    <Info /> Información General
                  </Typography>
                  <Card className={classes.detailCard}>
                    <CardContent className={classes.detailCardContent}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <Person />
                            <Typography className={classes.detailLabel}>Titular:</Typography>
                            <Typography className={classes.detailValue}>{selectedReserva.titular_reserva}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <Event />
                            <Typography className={classes.detailLabel}>Fecha Entrada:</Typography>
                            <Typography className={classes.detailValue}>
                              {formatDate(selectedReserva.fecha_inicio)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <Event />
                            <Typography className={classes.detailLabel}>Fecha Salida:</Typography>
                            <Typography className={classes.detailValue}>
                              {formatDate(selectedReserva.fecha_fin)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <CalendarToday />
                            <Typography className={classes.detailLabel}>Noches:</Typography>
                            <Typography className={classes.detailValue}>{selectedReserva.noches_estadia}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <People />
                            <Typography className={classes.detailLabel}>Acompañantes:</Typography>
                            <Typography className={classes.detailValue}>
                              {selectedReserva.acompanantes.length}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box className={classes.detailItem}>
                            <Receipt />
                            <Typography className={classes.detailLabel}>Estado:</Typography>
                            <Chip
                              label={getEstadoLabel(selectedReserva.estado)}
                              className={`${classes.chip} ${getEstadoChipClass(selectedReserva.estado)}`}
                              size="small"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Información de pago */}
                <Grid item xs={12}>
                  <Typography className={classes.sectionTitle}>
                    <Payment /> Información de Pago
                  </Typography>
                  <Card className={classes.detailCard}>
                    <CardContent className={classes.detailCardContent}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box className={classes.detailItem}>
                            <AttachMoney />
                            <Typography className={classes.detailLabel}>Total:</Typography>
                            <Typography className={classes.detailValue}>
                              {formatCurrency(selectedReserva.total)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box className={classes.detailItem}>
                            <AttachMoney />
                            <Typography className={classes.detailLabel}>Pagado:</Typography>
                            <Typography className={classes.detailValue}>
                              {formatCurrency(selectedReserva.pagos_parciales)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box className={classes.detailItem}>
                            <AttachMoney />
                            <Typography className={classes.detailLabel}>Pendiente:</Typography>
                            <Typography className={classes.detailValue}>
                              {formatCurrency(selectedReserva.total - selectedReserva.pagos_parciales)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Apartamentos */}
                <Grid item xs={12}>
                  <Typography className={classes.sectionTitle}>
                    <Home /> Apartamentos
                  </Typography>
                  {selectedReserva.apartamentos.map((apartamento) => (
                    <Card key={apartamento._id} className={classes.apartmentCard}>
                      <CardContent className={classes.apartmentCardContent}>
                        <Box className={classes.apartmentHeader}>
                          <Typography className={classes.apartmentTitle}>
                            <LocationOn />
                            {apartamento.Nombre || "Apartamento"} - {apartamento.Ubicacion || "Sin ubicación"}
                          </Typography>
                          <IconButton
                            className={classes.expandButton}
                            onClick={() => toggleApartamentoExpand(apartamento._id)}
                          >
                            {expandedApartamentos[apartamento._id] ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        <Box className={classes.detailItem}>
                          <AttachMoney />
                          <Typography className={classes.detailLabel}>Tarifa por noche:</Typography>
                          <Typography className={classes.detailValue}>{formatCurrency(apartamento.Tarifa)}</Typography>
                        </Box>
                        <Collapse in={expandedApartamentos[apartamento._id]}>
                          <Box mt={2}>
                            <Typography variant="body2" style={{ color: "#475569", marginBottom: 8 }}>
                              <strong>Capacidad:</strong> {apartamento.Capacidad || "No especificada"}
                            </Typography>
                            <Typography variant="body2" style={{ color: "#475569", marginBottom: 8 }}>
                              <strong>Descripción:</strong> {apartamento.Descripcion || "Sin descripción"}
                            </Typography>
                            {apartamento.Servicios && apartamento.Servicios.length > 0 && (
                              <Typography variant="body2" style={{ color: "#475569" }}>
                                <strong>Servicios:</strong> {apartamento.Servicios.join(", ")}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>

                {/* Acompañantes */}
                {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                  <Grid item xs={12}>
                    <Typography className={classes.sectionTitle}>
                      <People /> Acompañantes
                    </Typography>
                    <Card className={classes.detailCard}>
                      <CardContent className={classes.detailCardContent}>
                        <Box className={classes.acompanantesList}>
                          {selectedReserva.acompanantes.map((acompanante) => (
                            <Box key={acompanante._id} className={classes.acompananteItem}>
                              <Avatar className={classes.acompananteAvatar}>
                                {getInitials(`${acompanante.nombre} ${acompanante.apellido}`)}
                              </Avatar>
                              <Box className={classes.acompananteInfo}>
                                <Typography className={classes.acompananteNombre}>
                                  {acompanante.nombre} {acompanante.apellido}
                                </Typography>
                                <Typography className={classes.acompananteDocumento}>
                                  Documento: {acompanante.documento}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button onClick={handleCloseDetails} className={classes.closeDialogButton}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  )
}

export default MisReservas
