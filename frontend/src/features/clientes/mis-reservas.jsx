"use client"

import { useState, useEffect } from "react"
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import CircularProgress from "@material-ui/core/CircularProgress"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Avatar from "@material-ui/core/Avatar"
import Collapse from "@material-ui/core/Collapse"
import Tooltip from "@material-ui/core/Tooltip"
import MenuItem from "@material-ui/core/MenuItem"
import Paper from "@material-ui/core/Paper"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import CalendarToday from "@material-ui/icons/CalendarToday"
import Home from "@material-ui/icons/Home"
import AttachMoney from "@material-ui/icons/AttachMoney"
import Person from "@material-ui/icons/Person"
import ExpandMore from "@material-ui/icons/ExpandMore"
import ExpandLess from "@material-ui/icons/ExpandLess"
import Info from "@material-ui/icons/Info"
import Event from "@material-ui/icons/Event"
import LocationOn from "@material-ui/icons/LocationOn"
import People from "@material-ui/icons/People"
import Payment from "@material-ui/icons/Payment"
import Receipt from "@material-ui/icons/Receipt"
import {
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  User,
  Home as HomeIcon,
  Users,
} from "lucide-react"
import clienteService from "./clientes.service.js"
import Swal from "sweetalert2"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS — idénticos al componente clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
  ink:"#0C0A14", ink2:"#2D2640", ink3:"#6B5E87", ink4:"#B0A5C8",
  white:"#FFFFFF",
  v1:"#6C3FFF", e1:"#FF3B82", t1:"#00D4AA", b1:"#2563EB", a1:"#FF7B2C",
  gv:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  ge:"linear-gradient(135deg,#FF3B82,#FF7B2C)",
  gt:"linear-gradient(135deg,#00D4AA,#00A3E0)",
  gb:"linear-gradient(135deg,#2563EB,#7C3AED)",
  bL:"rgba(108,63,255,0.10)", bM:"rgba(108,63,255,0.18)",
}

const AV_GRADS = [T.gv, T.ge, T.gt, T.gb,
  "linear-gradient(135deg,#FF7B2C,#F5C518)",
  "linear-gradient(135deg,#AA00FF,#651FFF)"]
const avGrad = i => AV_GRADS[i % AV_GRADS.length]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SWAL INJECT — idéntico al componente clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (typeof document !== "undefined" && !document.getElementById("rs-swal")) {
  const s = document.createElement("style"); s.id = "rs-swal"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    .rs-pop{font-family:'DM Sans',sans-serif!important;border-radius:26px!important;padding:32px 28px!important;
      background:rgba(255,255,255,.98)!important;border:1px solid rgba(108,63,255,.18)!important;
      box-shadow:0 24px 64px rgba(108,63,255,.22)!important;position:relative!important;overflow:hidden!important;}
    .rs-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#6C3FFF,#C040FF);}
    .rs-ttl{font-family:'Syne',sans-serif!important;font-weight:800!important;font-size:1.18rem!important;color:#0C0A14!important;letter-spacing:-.3px!important;}
    .rs-bod{font-size:.88rem!important;color:#6B5E87!important;line-height:1.6!important;}
    .rs-ok{background:linear-gradient(135deg,#6C3FFF,#C040FF)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:700!important;
      font-size:.82rem!important;padding:10px 28px!important;box-shadow:0 4px 16px rgba(108,63,255,.38)!important;
      cursor:pointer!important;transition:all .2s!important;}
    .rs-ok:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(108,63,255,.50)!important;}
    .rs-cn{background:rgba(108,63,255,.07)!important;color:#6B5E87!important;border:1px solid rgba(108,63,255,.16)!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:600!important;
      font-size:.82rem!important;padding:10px 28px!important;cursor:pointer!important;transition:all .2s!important;}
    .rs-cn:hover{background:rgba(108,63,255,.13)!important;color:#6C3FFF!important;}
    .swal2-icon.swal2-error{border-color:#FF3B82!important;color:#FF3B82!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#FF3B82!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#6C3FFF,#C040FF)!important;}
  `
  document.head.appendChild(s)
}
const SW = { customClass:{ popup:"rs-pop", title:"rs-ttl", htmlContainer:"rs-bod", confirmButton:"rs-ok", cancelButton:"rs-cn" }, buttonsStyling:false }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE CELLS — idénticos al componente clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const HCell = withStyles(() => ({
  head: {
    background:"linear-gradient(135deg,#6C3FFF,#C040FF)",
    color:"#fff", fontFamily:"'DM Sans',sans-serif",
    fontWeight:700, fontSize:".71rem",
    textTransform:"uppercase", letterSpacing:"1.1px",
    padding:"13px 16px", borderBottom:"none", whiteSpace:"nowrap",
    textAlign:"center",
  },
}))(TableCell)

const BCell = withStyles(() => ({
  body: {
    fontFamily:"'DM Sans',sans-serif", fontSize:".86rem",
    padding:"11px 16px", color:T.ink2,
    borderBottom:`1px solid ${T.bL}`,
    textAlign:"center", verticalAlign:"middle",
  },
}))(TableCell)

const NCell = withStyles(() => ({
  body: {
    fontFamily:"'DM Sans',sans-serif", fontSize:".88rem",
    padding:"11px 16px", color:T.ink,
    borderBottom:`1px solid ${T.bL}`,
    verticalAlign:"middle",
  },
}))(TableCell)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES — idénticos al componente clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(() => ({
  root:{
    fontFamily:"'DM Sans',sans-serif",
    borderRadius:26, overflow:"hidden",
    background:"rgba(255,255,255,0.74)",
    backdropFilter:"blur(22px) saturate(180%)",
    WebkitBackdropFilter:"blur(22px) saturate(180%)",
    border:"1px solid rgba(255,255,255,0.85)",
    boxShadow:"0 4px 32px rgba(108,63,255,0.10)",
    position:"relative",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:2 },
  },
  hdr:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 26px 20px", flexWrap:"wrap", gap:14, borderBottom:"1px solid rgba(108,63,255,0.08)" },
  hdrLeft:{ display:"flex", alignItems:"center", gap:14 },
  hdrIcon:{
    width:54, height:54, borderRadius:18, background:T.gv, flexShrink:0,
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 6px 22px rgba(108,63,255,0.42)",
    position:"relative", overflow:"hidden",
    "&::after":{ content:'""', position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,0.20)" },
  },
  hdrTitle:{
    fontFamily:"'Syne',sans-serif !important",
    fontSize:"1.55rem !important", fontWeight:"800 !important",
    background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
    letterSpacing:"-0.5px", lineHeight:1.1,
  },
  hdrSub:{ fontSize:".82rem", color:T.ink3, marginTop:3 },
  statsRow:{ display:"flex", gap:12, padding:"18px 26px 0", flexWrap:"wrap" },
  stat:{
    flex:"1 1 110px", borderRadius:18, padding:"16px 18px",
    position:"relative", overflow:"hidden",
    border:"1px solid rgba(255,255,255,0.80)",
    transition:"transform .2s, box-shadow .2s",
    "&:hover":{ transform:"translateY(-3px)", boxShadow:"0 10px 30px rgba(108,63,255,0.16)" },
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"18px 18px 0 0" },
  },
  sv:{ background:"linear-gradient(145deg,rgba(108,63,255,.11),rgba(192,64,255,.07))", boxShadow:"0 5px 22px rgba(108,63,255,.13)", "&::before":{ background:T.gv } },
  st:{ background:"linear-gradient(145deg,rgba(0,212,170,.11),rgba(0,163,224,.07))", boxShadow:"0 5px 22px rgba(0,212,170,.12)", "&::before":{ background:T.gt } },
  sr:{ background:"linear-gradient(145deg,rgba(255,59,130,.10),rgba(255,123,44,.07))", boxShadow:"0 5px 22px rgba(255,59,130,.11)", "&::before":{ background:T.ge } },
  sa:{ background:"linear-gradient(145deg,rgba(255,123,44,.10),rgba(245,197,24,.07))", boxShadow:"0 5px 22px rgba(255,123,44,.11)", "&::before":{ background:"linear-gradient(135deg,#FF7B2C,#F5C518)" } },
  statOrb:{ position:"absolute", top:-30, right:-30, width:90, height:90, borderRadius:"50%", filter:"blur(22px)", opacity:.4, pointerEvents:"none" },
  statLabel:{ fontFamily:"'DM Sans',sans-serif", fontSize:".70rem", fontWeight:700, letterSpacing:"1.1px", textTransform:"uppercase", marginBottom:5 },
  statVal:{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, lineHeight:1 },
  statSub:{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", marginTop:4, fontWeight:500 },
  toolbar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 26px", gap:12, flexWrap:"wrap" },
  searchPill:{
    display:"flex", alignItems:"center", gap:9,
    background:"rgba(255,255,255,0.88)", border:"1.5px solid rgba(108,63,255,0.12)",
    borderRadius:50, padding:"9px 18px", minWidth:260,
    boxShadow:"0 2px 10px rgba(108,63,255,0.07)", transition:"all .2s",
    "&:focus-within":{ borderColor:"rgba(108,63,255,.35)", boxShadow:"0 0 0 3px rgba(108,63,255,.10)", background:T.white },
  },
  searchInput:{ border:"none", outline:"none", background:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, width:"100%" },
  kbd:{ fontSize:10, color:T.ink4, background:"rgba(108,63,255,0.07)", borderRadius:6, padding:"2px 7px", whiteSpace:"nowrap" },
  tblWrap:{ margin:"0 26px 16px", borderRadius:20, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 20px rgba(108,63,255,.07)" },
  tblRow:{ transition:"background .15s", "&:nth-of-type(odd)":{ background:"rgba(244,241,255,.30)" }, "&:hover":{ background:"rgba(108,63,255,.055)" } },
  nameWrap:{ display:"flex", alignItems:"center", gap:10 },
  nameAv:{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 12px rgba(108,63,255,.30)", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"#fff" },
  nameText:{ fontWeight:700, fontSize:".90rem", color:T.ink },
  nameId:{ fontSize:".72rem", color:T.ink4, marginTop:1 },
  chip:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, whiteSpace:"nowrap" },
  cConfirmada: { background:"rgba(0,212,170,.12)", color:"#00917a" },
  cPendiente:  { background:"rgba(255,123,44,.12)", color:"#c45a00" },
  cCancelada:  { background:"rgba(255,59,130,.10)", color:"#cc2060" },
  actWrap:{ display:"flex", justifyContent:"center", gap:5 },
  actBtn:{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", transition:"all .18s", "&:hover":{ transform:"scale(1.14)", boxShadow:"0 4px 14px rgba(0,0,0,.18)" } },
  bView:{ background:T.gv, color:"#fff" },
  pagWrap:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 26px 22px", flexWrap:"wrap", gap:10 },
  pagInfo:{ fontFamily:"'DM Sans',sans-serif", fontSize:".80rem", color:T.ink3 },
  pagBtns:{ display:"flex", gap:6 },
  pageBtn:{
    width:30, height:30, borderRadius:9, border:`1px solid rgba(108,63,255,.14)`,
    background:"rgba(255,255,255,.80)", color:T.ink3,
    fontFamily:"'DM Sans',sans-serif", fontSize:".80rem",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", transition:"all .15s",
    "&:hover":{ background:T.gv, color:"#fff", borderColor:"transparent", boxShadow:"0 3px 10px rgba(108,63,255,.35)" },
  },
  pagBtnOn:{ background:`${T.gv} !important`, color:"#fff !important", borderColor:"transparent !important", boxShadow:"0 3px 10px rgba(108,63,255,.38) !important" },
  emptyCell:{ textAlign:"center", padding:40, fontFamily:"'DM Sans',sans-serif", fontSize:".94rem", color:T.ink3 },
  /* ── Dialog ── */
  dlgPaper:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:680, maxWidth:"96vw",
    background:"rgba(255,255,255,0.98) !important", backdropFilter:"blur(24px)",
    overflow:"hidden", position:"relative",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:10 },
  },
  dlgHdr:{ background:"linear-gradient(135deg,#6C3FFF,#C040FF)", padding:"20px 22px", display:"flex", alignItems:"center", gap:12, position:"relative" },
  dlgHdrIco:{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  dlgHdrTitle:{ fontFamily:"'Syne',sans-serif !important", fontWeight:"800 !important", fontSize:"1.08rem !important", color:"#fff !important", letterSpacing:"-.2px", lineHeight:1.15 },
  dlgHdrSub:{ fontSize:".75rem", color:"rgba(255,255,255,.76)", marginTop:2, fontFamily:"'DM Sans',sans-serif" },
  dlgCloseBtn:{
    position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
    width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.18)",
    border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", transition:"all .18s",
    "&:hover":{ background:"rgba(255,255,255,.32)", transform:"translateY(-50%) scale(1.08)" },
  },
  dlgBody:{ padding:"22px 24px 10px !important", background:"#fff" },
  dlgFoot:{ padding:"12px 24px 20px !important", background:"#fff", borderTop:"1px solid rgba(108,63,255,.08)", display:"flex", justifyContent:"flex-end", gap:10 },
  btnCancel:{
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    color:`${T.ink3} !important`, borderRadius:"50px !important",
    padding:"9px 22px !important", border:"1.5px solid rgba(108,63,255,.16) !important",
    transition:"all .18s !important",
    "&:hover":{ background:"rgba(108,63,255,.06) !important", color:`${T.v1} !important` },
  },
  /* ── Detail sections ── */
  detSection:{ marginBottom:18 },
  detSectionLbl:{
    display:"flex", alignItems:"center", gap:8,
    fontFamily:"'Syne',sans-serif", fontSize:".83rem", fontWeight:700,
    color:T.ink, marginBottom:12, paddingBottom:8,
    borderBottom:"1.5px solid rgba(108,63,255,.09)", letterSpacing:"-.1px",
  },
  detSectionIco:{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  detGridFull:{ display:"grid", gridTemplateColumns:"1fr", gap:10 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  /* ── Apt expand ── */
  aptCard:{ borderRadius:14, border:`1px solid ${T.bL}`, marginBottom:10, overflow:"hidden" },
  aptHdr:{
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"12px 14px", background:"rgba(244,241,255,.45)",
    cursor:"pointer", transition:"background .15s",
    "&:hover":{ background:"rgba(108,63,255,.07)" },
  },
  aptHdrLeft:{ display:"flex", alignItems:"center", gap:8 },
  aptHdrTitle:{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", fontWeight:700, color:T.ink },
  aptBody:{ padding:"12px 14px", borderTop:`1px solid ${T.bL}` },
  aptBodyRow:{ display:"flex", gap:8, marginBottom:6, alignItems:"center" },
  aptBodyLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", color:T.ink3, minWidth:90 },
  aptBodyVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".86rem", color:T.ink2 },
  /* ── Acompañantes ── */
  acompItem:{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${T.bL}`, "&:last-child":{ borderBottom:"none" } },
  acompAv:{ width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, color:"#fff" },
  acompName:{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", fontWeight:700, color:T.ink },
  acompDoc:{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color:T.ink3 },
  /* ── Loading / Empty ── */
  centered:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 26px", gap:14 },
  emptyIco:{ width:64, height:64, borderRadius:20, background:"rgba(108,63,255,.08)", display:"flex", alignItems:"center", justifyContent:"center" },
  emptyTitle:{ fontFamily:"'Syne',sans-serif", fontSize:"1.15rem", fontWeight:800, color:T.ink, textAlign:"center" },
  emptyText:{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3, textAlign:"center" },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const formatDate = (d) => {
  if (!d) return "No disponible"
  return new Date(d).toLocaleDateString("es-ES", { day:"2-digit", month:"2-digit", year:"numeric" })
}
const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0 }).format(amount || 0)

const getInitials = (name) => {
  if (!name) return "A"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MisReservas = () => {
  const classes = useStyles()

  const [reservas,             setReservas]             = useState([])
  const [loading,              setLoading]              = useState(true)
  const [error,                setError]                = useState(null)
  const [selectedReserva,      setSelectedReserva]      = useState(null)
  const [openDialog,           setOpenDialog]           = useState(false)
  const [expandedApartamentos, setExpandedApartamentos] = useState({})
  const [searchTerm,           setSearchTerm]           = useState("")
  const [page,                 setPage]                 = useState(0)
  const [rowsPerPage,          setRowsPerPage]          = useState(5)

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true)
        const data = await clienteService.getMisReservas()
        setReservas(data)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener las reservas:", error)
        setError("No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
        Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde." })
      }
    }
    fetchReservas()
  }, [])

  const handleOpenDetails = (reserva) => {
    setSelectedReserva(reserva)
    setOpenDialog(true)
    const initialExpandedState = {}
    reserva.apartamentos.forEach((apt) => { initialExpandedState[apt._id] = false })
    setExpandedApartamentos(initialExpandedState)
  }

  const handleCloseDetails = () => {
    if (typeof document !== "undefined" && document.activeElement) document.activeElement.blur()
    setOpenDialog(false)
    setSelectedReserva(null)
  }

  const toggleApartamentoExpand = (aptId) => {
    setExpandedApartamentos(prev => ({ ...prev, [aptId]: !prev[aptId] }))
  }

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "confirmada": return classes.cConfirmada
      case "pendiente":  return classes.cPendiente
      case "cancelada":  return classes.cCancelada
      default:           return classes.cPendiente
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "confirmada": return <><Check size={10} strokeWidth={2.5}/> Confirmada</>
      case "pendiente":  return <><Clock size={10} strokeWidth={2.5}/> Pendiente</>
      case "cancelada":  return <><X     size={10} strokeWidth={2.5}/> Cancelada</>
      default:           return estado
    }
  }

  /* ── Filtro + paginación ── */
  const filteredReservas = reservas.filter(r =>
    r.numero_reserva?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.titular_reserva?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages      = Math.max(1, Math.ceil(filteredReservas.length / rowsPerPage))
  const paginatedReservas = filteredReservas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  /* ── Stats ── */
  const totalConfirmadas = reservas.filter(r => r.estado === "confirmada").length
  const totalPendientes  = reservas.filter(r => r.estado === "pendiente").length
  const totalCanceladas  = reservas.filter(r => r.estado === "cancelada").length

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DlgHdr — idéntico al componente clientes
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box className={classes.dlgHdr}>
      <Box className={classes.dlgHdrIco}>{icon}</Box>
      <Box>
        <Typography className={classes.dlgHdrTitle}>{title}</Typography>
        <Typography className={classes.dlgHdrSub}>{sub}</Typography>
      </Box>
      <button
        className={classes.dlgCloseBtn}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
        onClick={(e) => { e.stopPropagation(); onClose() }}
      >
        <X size={15} strokeWidth={2.5}/>
      </button>
    </Box>
  )

  /* ── Loading ── */
  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.centered}>
          <CircularProgress style={{ color:T.v1 }} size={44}/>
          <Typography className={classes.emptyText}>Cargando tus reservas…</Typography>
        </Box>
      </Box>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <Box className={classes.root}>
        <Box className={classes.centered}>
          <Box className={classes.emptyIco}><X size={28} color={T.e1} strokeWidth={2}/></Box>
          <Typography className={classes.emptyTitle}>Error al cargar reservas</Typography>
          <Typography className={classes.emptyText}>{error}</Typography>
          <button
            onClick={() => window.location.reload()}
            style={{ background:T.gv, color:"#fff", border:"none", borderRadius:50, padding:"10px 26px", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".82rem", cursor:"pointer", boxShadow:"0 4px 14px rgba(108,63,255,.38)" }}
          >
            Reintentar
          </button>
        </Box>
      </Box>
    )
  }

  /* ── Sin reservas ── */
  if (reservas.length === 0) {
    return (
      <Box className={classes.root}>
        <Box className={classes.centered}>
          <Box className={classes.emptyIco}><Calendar size={28} color={T.v1} strokeWidth={2}/></Box>
          <Typography className={classes.emptyTitle}>No tienes reservas</Typography>
          <Typography className={classes.emptyText}>Actualmente no tienes ninguna reserva registrada en nuestro sistema.</Typography>
        </Box>
      </Box>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER PRINCIPAL
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <Box className={classes.root}>

      {/* HEADER */}
      <Box className={classes.hdr}>
        <Box className={classes.hdrLeft}>
          <Box className={classes.hdrIcon}><Calendar size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Mis Reservas</Typography>
            <Typography className={classes.hdrSub}>Consulta el historial de tus reservas</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label:"Total",       val:reservas.length,    sub:"registradas",  c:classes.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Confirmadas", val:totalConfirmadas,   sub:"aprobadas",    c:classes.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Pendientes",  val:totalPendientes,    sub:"por confirmar", c:classes.sa, orb:"#FF7B2C", col:"#c45a00", sc:"#c45a00" },
          { label:"Canceladas",  val:totalCanceladas,    sub:"anuladas",     c:classes.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
        ].map((s, i) => (
          <Box key={i} className={`${classes.stat} ${s.c}`}>
            <Box className={classes.statOrb} style={{ background:s.orb }}/>
            <Typography className={classes.statLabel} style={{ color:s.col }}>{s.label}</Typography>
            <Typography className={classes.statVal}>{s.val}</Typography>
            <Typography className={classes.statSub} style={{ color:s.sc }}>{s.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* TOOLBAR */}
      <Box className={classes.toolbar}>
        <Box className={classes.searchPill}>
          <FileText size={14} color={T.ink4} strokeWidth={2.5}/>
          <input
            className={classes.searchInput}
            placeholder="Buscar por número, titular, estado…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
          />
          <span className={classes.kbd}>⌘K</span>
        </Box>
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table style={{ borderCollapse:"collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Reserva</HCell>
                <HCell>Fechas</HCell>
                <HCell>Noches</HCell>
                <HCell>Total</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReservas.length > 0 ? (
                paginatedReservas.map((reserva, i) => (
                  <TableRow key={reserva._id} className={classes.tblRow}>
                    <NCell>
                      <Box className={classes.nameWrap}>
                        <Box className={classes.nameAv} style={{ background:avGrad(i) }}>
                          {String(reserva.numero_reserva || "").slice(-2) || "RV"}
                        </Box>
                        <Box>
                          <Typography className={classes.nameText}>#{reserva.numero_reserva}</Typography>
                          <Typography className={classes.nameId}>{reserva.titular_reserva}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>
                      <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:T.ink3 }}>
                        {formatDate(reserva.fecha_inicio)} — {formatDate(reserva.fecha_fin)}
                      </Typography>
                    </BCell>
                    <BCell>{reserva.noches_estadia}</BCell>
                    <BCell>
                      <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".86rem", fontWeight:700, color:T.ink2 }}>
                        {formatCurrency(reserva.total)}
                      </Typography>
                    </BCell>
                    <BCell>
                      <Box className={`${classes.chip} ${getEstadoClass(reserva.estado)}`} component="span">
                        {getEstadoLabel(reserva.estado)}
                      </Box>
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        <Tooltip title="Ver detalles" placement="top">
                          <button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleOpenDetails(reserva)}>
                            <Eye size={14} strokeWidth={2.2}/>
                          </button>
                        </Tooltip>
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={6} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron reservas que coincidan con la búsqueda." : "No hay reservas registradas."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PAGINATION */}
      <Box className={classes.pagWrap}>
        <Typography className={classes.pagInfo}>
          Mostrando {filteredReservas.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredReservas.length)} de {filteredReservas.length} reservas
        </Typography>
        <Box className={classes.pagBtns}>
          <button className={classes.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity:page === 0 ? .4 : 1 }}><ArrowLeft  size={12} strokeWidth={2.5}/></button>
          {Array.from({ length:totalPages }, (_, i) => (
            <button key={i} className={`${classes.pageBtn} ${page === i ? classes.pagBtnOn : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className={classes.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity:page >= totalPages - 1 ? .4 : 1 }}><ArrowRight size={12} strokeWidth={2.5}/></button>
        </Box>
        <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Typography className={classes.pagInfo}>Filas:</Typography>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
            style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}
          >
            {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ── MODAL DETALLES ── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDetails}
        maxWidth="md" fullWidth
        classes={{ paper:classes.dlgPaper }}
        disableEnforceFocus
      >
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title={selectedReserva ? `Reserva #${selectedReserva.numero_reserva}` : "Detalles"}
          sub="Información completa de tu reserva"
          onClose={handleCloseDetails}
        />

        <DialogContent className={classes.dlgBody}>
          {selectedReserva && (
            <>
              {/* Sección: Información General */}
              <Box className={classes.detSection}>
                <Box className={classes.detSectionLbl}>
                  <Box className={classes.detSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                    <Info style={{ fontSize:13, color:T.v1 }}/>
                  </Box>
                  Información General
                </Box>
                <Box className={classes.detGrid}>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Titular</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <User size={14} color={T.v1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{selectedReserva.titular_reserva}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Estado</Typography>
                    <Box className={`${classes.chip} ${getEstadoClass(selectedReserva.estado)}`} component="span" style={{ marginTop:2 }}>
                      {getEstadoLabel(selectedReserva.estado)}
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Fecha Entrada</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Calendar size={14} color={T.t1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{formatDate(selectedReserva.fecha_inicio)}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Fecha Salida</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Calendar size={14} color={T.t1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{formatDate(selectedReserva.fecha_fin)}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Noches</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Clock size={14} color={T.a1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{selectedReserva.noches_estadia}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Acompañantes</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Users size={14} color={T.b1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{selectedReserva.acompanantes?.length || 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Sección: Pago */}
              <Box className={classes.detSection}>
                <Box className={classes.detSectionLbl}>
                  <Box className={classes.detSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                    <DollarSign size={13} color={T.t1} strokeWidth={2.5}/>
                  </Box>
                  Información de Pago
                </Box>
                <Box className={classes.detGrid}>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Total</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <DollarSign size={14} color={T.t1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{formatCurrency(selectedReserva.total)}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Pagado</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <DollarSign size={14} color={T.t1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{formatCurrency(selectedReserva.pagos_parciales)}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.detItem} style={{ gridColumn:"1 / -1" }}>
                    <Typography className={classes.detLbl}>Pendiente por pagar</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <DollarSign size={14} color={T.e1} strokeWidth={2.2}/>
                      <Typography className={classes.detVal}>{formatCurrency(selectedReserva.total - selectedReserva.pagos_parciales)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Sección: Apartamentos */}
              <Box className={classes.detSection}>
                <Box className={classes.detSectionLbl}>
                  <Box className={classes.detSectionIco} style={{ background:"rgba(37,99,235,.10)" }}>
                    <HomeIcon size={13} color={T.b1} strokeWidth={2.5}/>
                  </Box>
                  Apartamentos
                </Box>
                {selectedReserva.apartamentos.map((apt) => (
                  <Box key={apt._id} className={classes.aptCard}>
                    <Box className={classes.aptHdr} onClick={() => toggleApartamentoExpand(apt._id)}>
                      <Box className={classes.aptHdrLeft}>
                        <Box style={{ width:28, height:28, borderRadius:8, background:"rgba(37,99,235,.10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <HomeIcon size={13} color={T.b1} strokeWidth={2.5}/>
                        </Box>
                        <Typography className={classes.aptHdrTitle}>
                          {apt.Nombre || "Apartamento"} — {apt.Ubicacion || "Sin ubicación"}
                        </Typography>
                      </Box>
                      {expandedApartamentos[apt._id]
                        ? <ExpandLess style={{ color:T.ink3, fontSize:18 }}/>
                        : <ExpandMore style={{ color:T.ink3, fontSize:18 }}/>
                      }
                    </Box>
                    <Collapse in={expandedApartamentos[apt._id]}>
                      <Box className={classes.aptBody}>
                        <Box className={classes.aptBodyRow}>
                          <Typography className={classes.aptBodyLbl}>Tarifa/noche</Typography>
                          <Typography className={classes.aptBodyVal}>{formatCurrency(apt.Tarifa)}</Typography>
                        </Box>
                        <Box className={classes.aptBodyRow}>
                          <Typography className={classes.aptBodyLbl}>Capacidad</Typography>
                          <Typography className={classes.aptBodyVal}>{apt.Capacidad || "No especificada"}</Typography>
                        </Box>
                        <Box className={classes.aptBodyRow}>
                          <Typography className={classes.aptBodyLbl}>Descripción</Typography>
                          <Typography className={classes.aptBodyVal}>{apt.Descripcion || "Sin descripción"}</Typography>
                        </Box>
                        {apt.Servicios && apt.Servicios.length > 0 && (
                          <Box className={classes.aptBodyRow}>
                            <Typography className={classes.aptBodyLbl}>Servicios</Typography>
                            <Typography className={classes.aptBodyVal}>{apt.Servicios.join(", ")}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>

              {/* Sección: Acompañantes */}
              {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                <Box className={classes.detSection}>
                  <Box className={classes.detSectionLbl}>
                    <Box className={classes.detSectionIco} style={{ background:"rgba(255,59,130,.10)" }}>
                      <Users size={13} color={T.e1} strokeWidth={2.5}/>
                    </Box>
                    Acompañantes
                  </Box>
                  <Box style={{ borderRadius:14, border:`1px solid ${T.bL}`, padding:"10px 14px", background:"rgba(244,241,255,.25)" }}>
                    {selectedReserva.acompanantes.map((ac, i) => (
                      <Box key={ac._id} className={classes.acompItem}>
                        <Box className={classes.acompAv} style={{ background:avGrad(i) }}>
                          {getInitials(`${ac.nombre} ${ac.apellido}`)}
                        </Box>
                        <Box>
                          <Typography className={classes.acompName}>{ac.nombre} {ac.apellido}</Typography>
                          <Typography className={classes.acompDoc}>Documento: {ac.documento}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default MisReservas