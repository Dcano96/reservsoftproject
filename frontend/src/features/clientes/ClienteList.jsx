"use client"

import { useState, useEffect, useRef } from "react"
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Avatar,
  InputAdornment,
  Typography,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Grid,
  Tooltip,
} from "@material-ui/core"
import { Search, UserPlus, Edit, Delete, Info, X, User, FileText, Phone, Mail, Key, Check, ArrowLeft, ArrowRight, Edit2, Trash2, Eye, Users } from "lucide-react"
import Swal from "sweetalert2"
import clienteService from "./clientes.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LÓGICA ORIGINAL — 100% sin cambios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const REGEX = {
  SOLO_NUMEROS: /^\d+$/,
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
}

const VALIDACION = {
  DOCUMENTO: { MIN_LENGTH: 6, MAX_LENGTH: 15 },
  NOMBRE:    { MIN_LENGTH: 6, MAX_LENGTH: 30 },
  TELEFONO:  { MIN_LENGTH: 7, MAX_LENGTH: 10 },
  CONTRASENA:{ MIN_LENGTH: 8, MAX_LENGTH: 15 },
}

const MENSAJES_INSTRUCTIVOS = {
  DOCUMENTO: "Ingrese un número de documento entre 6 y 15 dígitos, solo números.",
  NOMBRE:    "Ingrese nombre completo entre 6 y 30 caracteres, solo letras y espacios.",
  TELEFONO:  "Ingrese un número telefónico entre 7 y 10 dígitos, solo números.",
  EMAIL:     "Ingresa tu email (formato: usuario@dominio.com)",
  PASSWORD:  "La contraseña debe tener entre 8 y 15 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.",
}

const getInitials = (name) => {
  if (!name) return "CL"
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().substring(0, 2)
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS
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
   SWAL INJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (typeof document !== "undefined" && !document.getElementById("rs-swal")) {
  const s = document.createElement("style"); s.id = "rs-swal"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    .rs-pop{font-family:'DM Sans',sans-serif!important;border-radius:26px!important;padding:32px 28px!important;
      background:rgba(255,255,255,.98)!important;border:1px solid rgba(108,63,255,.18)!important;
      box-shadow:0 24px 64px rgba(108,63,255,.22)!important;position:relative!important;overflow:hidden!important;}
    .rs-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#6C3FFF,#C040FF);}
    .rs-pop.rs-danger::before{background:linear-gradient(135deg,#FF3B82,#FF7B2C);}
    .rs-ttl{font-family:'Syne',sans-serif!important;font-weight:800!important;font-size:1.18rem!important;color:#0C0A14!important;letter-spacing:-.3px!important;}
    .rs-bod{font-size:.88rem!important;color:#6B5E87!important;line-height:1.6!important;}
    .rs-ok{background:linear-gradient(135deg,#6C3FFF,#C040FF)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:700!important;
      font-size:.82rem!important;padding:10px 28px!important;box-shadow:0 4px 16px rgba(108,63,255,.38)!important;
      cursor:pointer!important;transition:all .2s!important;}
    .rs-ok:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(108,63,255,.50)!important;}
    .rs-pop.rs-danger .rs-ok{background:linear-gradient(135deg,#FF3B82,#FF7B2C)!important;box-shadow:0 4px 16px rgba(255,59,130,.34)!important;}
    .rs-cn{background:rgba(108,63,255,.07)!important;color:#6B5E87!important;border:1px solid rgba(108,63,255,.16)!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:600!important;
      font-size:.82rem!important;padding:10px 28px!important;cursor:pointer!important;transition:all .2s!important;}
    .rs-cn:hover{background:rgba(108,63,255,.13)!important;color:#6C3FFF!important;}
    .swal2-icon.swal2-question{border-color:#6C3FFF!important;color:#6C3FFF!important;}
    .swal2-icon.swal2-warning{border-color:#FF7B2C!important;color:#FF7B2C!important;}
    .swal2-icon.swal2-success{border-color:#00D4AA!important;color:#00D4AA!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#00D4AA!important;}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(0,212,170,.30)!important;}
    .swal2-icon.swal2-error{border-color:#FF3B82!important;color:#FF3B82!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#FF3B82!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#6C3FFF,#C040FF)!important;}
  `
  document.head.appendChild(s)
}
const SW  = { customClass:{ popup:"rs-pop", title:"rs-ttl", htmlContainer:"rs-bod", confirmButton:"rs-ok", cancelButton:"rs-cn" }, buttonsStyling:false }
const SWD = { ...SW, customClass:{ ...SW.customClass, popup:"rs-pop rs-danger" } }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE CELLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const HCell = withStyles(() => ({
  head: {
    background:"linear-gradient(135deg,#6C3FFF,#C040FF)",
    color:"#fff", fontFamily:"'DM Sans',sans-serif",
    fontWeight:700, fontSize:".71rem",
    textTransform:"uppercase", letterSpacing:"1.1px",
    padding:"13px 16px", borderBottom:"none", whiteSpace:"nowrap",
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
   BOTÓN NATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const btnAddStyle = {
  display:"flex", alignItems:"center", gap:8,
  background:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  color:"#fff",
  fontFamily:"'DM Sans',sans-serif", fontWeight:700,
  fontSize:".80rem", letterSpacing:".7px",
  padding:"10px 22px", borderRadius:50,
  border:"none", cursor:"pointer",
  boxShadow:"0 5px 18px rgba(108,63,255,.40)",
  textTransform:"uppercase",
  transition:"all .22s",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(theme => ({
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
  cOn: { background:"rgba(0,212,170,.12)", color:"#00917a" },
  cOff:{ background:"rgba(255,59,130,.10)", color:"#cc2060" },
  actWrap:{ display:"flex", justifyContent:"center", gap:5 },
  actBtn:{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", transition:"all .18s", "&:hover":{ transform:"scale(1.14)", boxShadow:"0 4px 14px rgba(0,0,0,.18)" } },
  bEdit:{ background:"linear-gradient(135deg,#00D4AA,#00A3E0)", color:"#fff" },
  bView:{ background:T.gv, color:"#fff" },
  bDel: { background:T.ge, color:"#fff" },
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
  dlgPaper:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:640, maxWidth:"96vw",
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
  fmSection:{ marginBottom:16 },
  fmSectionLbl:{
    display:"flex", alignItems:"center", gap:8,
    fontFamily:"'Syne',sans-serif", fontSize:".83rem", fontWeight:700,
    color:T.ink, marginBottom:12, paddingBottom:8,
    borderBottom:"1.5px solid rgba(108,63,255,.09)", letterSpacing:"-.1px",
  },
  fmSectionIco:{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
  fmField:{
    marginBottom:"14px !important",
    "& .MuiOutlinedInput-root":{
      borderRadius:"13px !important", fontFamily:"'DM Sans',sans-serif !important",
      fontSize:".90rem", background:"rgba(244,241,255,.38)",
      "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:T.v1 },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:T.v1, borderWidth:2 },
    },
    "& .MuiInputLabel-outlined":{ fontFamily:"'DM Sans',sans-serif", color:T.ink3, fontSize:".88rem" },
    "& .MuiInputLabel-outlined.Mui-focused":{ color:T.v1 },
    "& .MuiFormHelperText-root":{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem" },
  },
  fmRow:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  dlgFoot:{ padding:"12px 24px 20px !important", background:"#fff", borderTop:"1px solid rgba(108,63,255,.08)", display:"flex", justifyContent:"flex-end", gap:10 },
  btnCancel:{
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    color:`${T.ink3} !important`, borderRadius:"50px !important",
    padding:"9px 22px !important", border:"1.5px solid rgba(108,63,255,.16) !important",
    transition:"all .18s !important",
    "&:hover":{ background:"rgba(108,63,255,.06) !important", color:`${T.v1} !important` },
  },
  btnSubmit:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 26px !important",
    boxShadow:"0 4px 14px rgba(108,63,255,.38) !important", transition:"all .2s !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(108,63,255,.50) !important" },
  },
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0 18px" },
  detAv:{ width:76, height:76, borderRadius:22, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#fff" },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:4, textAlign:"center" },
  detSub:{ fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", color:T.ink3, textAlign:"center" },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  container:{ fontFamily:"'DM Sans',sans-serif" },
  errorMessage:{ fontSize:".90rem", color:"#ef4444", fontWeight:500, marginTop:4 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ClienteList = () => {
  const classes = useStyles()

  const [clientes,        setClientes]        = useState([])
  const [open,            setOpen]            = useState(false)
  const [detailsOpen,     setDetailsOpen]     = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [editingId,       setEditingId]       = useState(null)
  const [formData,        setFormData]        = useState({ nombre:"", documento:"", email:"", telefono:"", password:"", estado:true })
  const [formErrors,      setFormErrors]      = useState({ nombre:"", documento:"", email:"", telefono:"", password:"" })
  const [searchTerm,      setSearchTerm]      = useState("")
  const [page,            setPage]            = useState(0)
  const [rowsPerPage,     setRowsPerPage]     = useState(5)
  const [fieldValidation, setFieldValidation] = useState({ documento:false, nombre:false, telefono:false, email:false, password:false })
  const [touched,         setTouched]         = useState({ documento:false, nombre:false, telefono:false, email:false, password:false })

  const documentoRef = useRef(null)
  const nombreRef    = useRef(null)
  const telefonoRef  = useRef(null)
  const emailRef     = useRef(null)
  const passwordRef  = useRef(null)
  const estadoRef    = useRef(null)

  const fetchClientes = async () => {
    try {
      const data = await clienteService.getClientes()
      setClientes(data)
    } catch (error) {
      console.error("Error fetching clientes", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los clientes." })
    }
  }
  useEffect(() => { fetchClientes() }, [])

  const handleOpen = (cliente) => {
    setFormErrors({ nombre:"", documento:"", email:"", telefono:"", password:"" })
    setFieldValidation({ documento:false, nombre:false, telefono:false, email:false, password:false })
    setTouched({ documento:false, nombre:false, telefono:false, email:false, password:false })
    if (cliente) {
      setFormData({ nombre:cliente.nombre, documento:cliente.documento, email:cliente.email, telefono:cliente.telefono, password:"", estado:cliente.estado })
      setEditingId(cliente._id)
      setFieldValidation({ documento:true, nombre:true, telefono:true, email:true, password:true })
    } else {
      setFormData({ nombre:"", documento:"", email:"", telefono:"", password:"", estado:true })
      setEditingId(null)
    }
    setOpen(true)
    setTimeout(() => { if (documentoRef.current) documentoRef.current.focus() }, 100)
  }

  const handleClose = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      document.activeElement.blur()
    }
    setOpen(false)
    setFormErrors({ nombre:"", documento:"", email:"", telefono:"", password:"" })
  }

  const handleDetails = (cliente) => { setSelectedCliente(cliente); setDetailsOpen(true) }

  const handleCloseDetails = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      document.activeElement.blur()
    }
    setDetailsOpen(false)
  }

  const validarDocumento = (value) => {
    if (!value) return "El documento es obligatorio"
    if (value.trim() === "") return "El documento no puede estar vacío"
    if (!REGEX.SOLO_NUMEROS.test(value)) return "El documento debe contener solo números"
    if (value.length < VALIDACION.DOCUMENTO.MIN_LENGTH) return `El documento debe tener al menos ${VALIDACION.DOCUMENTO.MIN_LENGTH} dígitos`
    if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) return `El documento no puede tener más de ${VALIDACION.DOCUMENTO.MAX_LENGTH} dígitos`
    if (REGEX.CARACTERES_REPETIDOS.test(value)) return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
    if (REGEX.SECUENCIAS_NUMERICAS.test(value)) return "El documento no puede contener secuencias numéricas obvias"
    if (/^0+$/.test(value)) return "El documento no puede contener solo ceros"
    if (Number.parseInt(value) < 1000) return "El documento no parece válido (valor muy bajo)"
    return ""
  }

  const validarNombre = (value) => {
    if (!value) return "El nombre es obligatorio"
    if (value.trim() === "") return "El nombre no puede estar vacío"
    if (!REGEX.SOLO_LETRAS_ESPACIOS.test(value)) return "El nombre solo debe contener letras y espacios"
    if (value.length < VALIDACION.NOMBRE.MIN_LENGTH) return `El nombre debe tener al menos ${VALIDACION.NOMBRE.MIN_LENGTH} caracteres`
    if (value.length > VALIDACION.NOMBRE.MAX_LENGTH) return `El nombre no puede tener más de ${VALIDACION.NOMBRE.MAX_LENGTH} caracteres`
    if (/\s{2,}/.test(value)) return "El nombre no puede contener espacios múltiples consecutivos"
    const palabras = value.trim().split(/\s+/)
    if (palabras.length < 2) return "Debe ingresar al menos nombre y apellido"
    for (const palabra of palabras) if (palabra.length < 2) return "Cada palabra del nombre debe tener al menos 2 caracteres"
    const palabrasProhibidas = ["admin", "usuario", "test", "prueba", "administrador"]
    for (const prohibida of palabrasProhibidas) if (value.toLowerCase().includes(prohibida)) return "El nombre contiene palabras no permitidas"
    return ""
  }

  const validarTelefono = (value) => {
    if (!value) return "El teléfono es obligatorio"
    if (value.trim() === "") return "El teléfono no puede estar vacío"
    if (!REGEX.SOLO_NUMEROS.test(value)) return "El teléfono debe contener solo números"
    if (value.length < VALIDACION.TELEFONO.MIN_LENGTH) return `El teléfono debe tener al menos ${VALIDACION.TELEFONO.MIN_LENGTH} dígitos`
    if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) return `El teléfono no puede tener más de ${VALIDACION.TELEFONO.MAX_LENGTH} dígitos`
    if (REGEX.SECUENCIAS_NUMERICAS.test(value)) return "El teléfono no puede contener secuencias numéricas obvias"
    if (/^0+$/.test(value)) return "El teléfono no puede contener solo ceros"
    const numerosEspeciales = ["123", "911", "112", "119"]
    if (numerosEspeciales.includes(value)) return "No se permite el uso de números de emergencia"
    return ""
  }

  const validarEmail = (em) => {
    if (!em) return "El correo electrónico es obligatorio"
    if (em.trim() === "") return "El correo electrónico no puede estar vacío"
    if (!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"
    if (REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos (como @.com, @., etc.)"
    if (em.length < 6) return "El correo debe tener al menos 6 caracteres"
    if (em.length > 50) return "El correo no puede tener más de 50 caracteres"
    const [localPart, domainPart] = em.split("@")
    if (!localPart || localPart.length < 1) return "La parte local del correo no puede estar vacía"
    if (localPart.length > 64) return "La parte local del correo es demasiado larga"
    if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"
    if (!domainPart || !domainPart.includes(".")) return "El dominio del correo debe incluir una extensión (ej: .com, .net)"
    const domainParts = domainPart.split(".")
    for (let i = 0; i < domainParts.length; i++) {
      const part = domainParts[i]
      if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) return "El dominio del correo contiene partes inválidas"
    }
    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) return "La extensión del dominio no es válida o contiene caracteres no permitidos"
    const dominiosNoRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
    for (const dominio of dominiosNoRecomendados) if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
    return ""
  }

  const validarPassword = (password, nombre = "", documento = "", email = "") => {
    if (!password) return "La contraseña es obligatoria"
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    if (password.length > 15) return "La contraseña no puede tener más de 15 caracteres"
    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula"
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula"
    if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número"
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return "La contraseña debe contener al menos un carácter especial"
    if (REGEX.SECUENCIAS_COMUNES.test(password)) return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"
    if (REGEX.CARACTERES_REPETIDOS.test(password)) return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"
    if (/qwert|asdfg|zxcvb|12345|09876/.test(password.toLowerCase())) return "La contraseña no puede contener secuencias de teclado"
    if (nombre) {
      const nombreParts = nombre.toLowerCase().split(/\s+/)
      for (const part of nombreParts) if (part.length > 2 && password.toLowerCase().includes(part)) return "La contraseña no puede contener partes de tu nombre"
    }
    if (documento && password.includes(documento)) return "La contraseña no puede contener tu número de documento"
    if (email) {
      const emailPart = email.split("@")[0].toLowerCase()
      if (emailPart.length > 2 && password.toLowerCase().includes(emailPart)) return "La contraseña no puede contener partes de tu correo electrónico"
    }
    return ""
  }

  const validateField = (name, value) => {
    let error = ""
    const isEditing = !!editingId
    switch (name) {
      case "documento": error = validarDocumento(value); break
      case "nombre":    error = validarNombre(value);    break
      case "telefono":  error = validarTelefono(value);  break
      case "email":     error = validarEmail(value);     break
      case "password":
        error = validarPassword(value, formData.nombre, formData.documento, formData.email)
        if (isEditing && !value) error = ""
        break
      default: break
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }))
    setFieldValidation((prev) => ({ ...prev, [name]: !error }))
    return !error
  }

  const handleFieldBlur = (e) => {
    if (!open) return
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    if (name === "email") {
      const error = validarEmail(value)
      setFormErrors((prev) => ({ ...prev, email: error }))
      setFieldValidation((prev) => ({ ...prev, email: !error }))
    } else if (name === "password") {
      if (editingId && !value) {
        setFormErrors((prev) => ({ ...prev, password: "" }))
        setFieldValidation((prev) => ({ ...prev, password: true }))
      } else {
        const error = validarPassword(value, formData.nombre, formData.documento, formData.email)
        setFormErrors((prev) => ({ ...prev, password: error }))
        setFieldValidation((prev) => ({ ...prev, password: !error }))
      }
    } else {
      validateField(name, value)
    }
  }

  const handleKeyDown = (e, nextFieldName) => {
    const { name, value } = e.target
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      let isValid = false
      if (name === "email") {
        const error = validarEmail(value)
        setFormErrors((prev) => ({ ...prev, email: error }))
        setFieldValidation((prev) => ({ ...prev, email: !error }))
        isValid = !error
      } else if (name === "password") {
        if (editingId && !value) {
          setFormErrors((prev) => ({ ...prev, password: "" }))
          setFieldValidation((prev) => ({ ...prev, password: true }))
          isValid = true
        } else {
          const error = validarPassword(value, formData.nombre, formData.documento, formData.email)
          setFormErrors((prev) => ({ ...prev, password: error }))
          setFieldValidation((prev) => ({ ...prev, password: !error }))
          isValid = !error
        }
      } else {
        isValid = validateField(name, value)
      }
      if (isValid && nextFieldName) {
        switch (nextFieldName) {
          case "nombre":   nombreRef.current?.focus();   break
          case "telefono": telefonoRef.current?.focus(); break
          case "email":    emailRef.current?.focus();    break
          case "password": passwordRef.current?.focus(); break
          case "estado":   estadoRef.current?.focus();   break
          default: break
        }
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    let updatedValue = value

    // FIX: el campo "estado" llega como string desde el <select>, convertir a booleano
    if (name === "estado") {
      const boolValue = value === true || value === "true"
      setFormData((prev) => ({ ...prev, estado: boolValue }))
      return
    }

    if (name === "nombre") {
      const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
      if (!letrasRegex.test(value)) return
    } else if (name === "documento") {
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) return
      if (value.length > VALIDACION.DOCUMENTO.MAX_LENGTH) updatedValue = value.substring(0, VALIDACION.DOCUMENTO.MAX_LENGTH)
    } else if (name === "telefono") {
      const numerosRegex = /^[0-9]*$/
      if (!numerosRegex.test(value)) return
      if (value.length > VALIDACION.TELEFONO.MAX_LENGTH) updatedValue = value.substring(0, VALIDACION.TELEFONO.MAX_LENGTH)
    } else if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
      if (!emailRegex.test(value)) return
      if (value.includes("@@") || value.includes("..") || value.includes(".@") || value.includes("@.")) return
      const atCount = (value.match(/@/g) || []).length
      if (atCount > 1) return
      if (formData.email.includes("@") && formData.email.includes(".")) {
        const currentParts = formData.email.split("@")
        const newParts = value.split("@")
        if (currentParts.length > 1 && newParts.length > 1) {
          const currentDomain = currentParts[1]
          const newDomain = newParts[1]
          const completeTLDs = [".com", ".net", ".org", ".edu", ".gov", ".mil", ".int"]
          const hasTLDComplete = completeTLDs.some((tld) => currentDomain.endsWith(tld))
          if (hasTLDComplete && newDomain.length > currentDomain.length) return
        }
      }
    } else if (name === "password" && value.length > VALIDACION.CONTRASENA.MAX_LENGTH) {
      updatedValue = value.substring(0, VALIDACION.CONTRASENA.MAX_LENGTH)
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue }))

    let error = ""
    const isEditing = !!editingId
    switch (name) {
      case "documento": error = validarDocumento(updatedValue); break
      case "nombre":    error = validarNombre(updatedValue);    break
      case "telefono":  error = validarTelefono(updatedValue);  break
      case "email":     error = validarEmail(updatedValue);     break
      case "password":
        if (isEditing && !updatedValue) error = ""
        else error = validarPassword(updatedValue, formData.nombre, formData.documento, formData.email)
        break
      default: break
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }))
    setFieldValidation((prev) => ({ ...prev, [name]: !error }))
  }

  const validateForm = () => {
    setTouched({ documento:true, nombre:true, telefono:true, email:true, password:true })
    const documentoError = validarDocumento(formData.documento)
    const nombreError    = validarNombre(formData.nombre)
    const telefonoError  = validarTelefono(formData.telefono)
    const emailError     = validarEmail(formData.email)
    let passwordError = ""
    if (!(editingId && !formData.password)) {
      passwordError = validarPassword(formData.password, formData.nombre, formData.documento, formData.email)
    }
    setFormErrors({ documento:documentoError, nombre:nombreError, telefono:telefonoError, email:emailError, password:passwordError })
    setFieldValidation({ documento:!documentoError, nombre:!nombreError, telefono:!telefonoError, email:!emailError, password:editingId ? true : !passwordError })
    return !documentoError && !nombreError && !telefonoError && !emailError && (editingId ? true : !passwordError)
  }

  const handleSubmit = async () => {
    const isValid = validateForm()
    if (!isValid) {
      if (!fieldValidation.documento)            documentoRef.current?.focus()
      else if (!fieldValidation.nombre)          nombreRef.current?.focus()
      else if (!fieldValidation.telefono)        telefonoRef.current?.focus()
      else if (!fieldValidation.email)           emailRef.current?.focus()
      else if (!fieldValidation.password && !editingId) passwordRef.current?.focus()
      return
    }
    try {
      if (editingId) {
        const dataToSend = { ...formData }
        if (!dataToSend.password) delete dataToSend.password
        await clienteService.updateCliente(editingId, dataToSend)
        Swal.fire({ ...SW, icon:"success", title:"Actualizado", text:"El cliente se actualizó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      } else {
        const dataToSend = { ...formData, estado: true }
        await clienteService.createCliente(dataToSend)
        Swal.fire({ ...SW, icon:"success", title:"Creado", text:"El cliente se creó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      }
      fetchClientes()
      handleClose()
    } catch (error) {
      console.error("Error saving cliente", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:error.response?.data?.msg || "Ocurrió un error al guardar el cliente." })
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      ...SWD,
      title:"¿Eliminar cliente?", text:"Esta acción no se puede deshacer",
      icon:"question", showCancelButton:true,
      confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar",
    })
    if (confirmDelete.isConfirmed) {
      try {
        await clienteService.deleteCliente(id)
        Swal.fire({ ...SW, icon:"success", title:"Eliminado", text:"El cliente se eliminó correctamente.", timer:2000, timerProgressBar:true, showConfirmButton:false })
        fetchClientes()
      } catch (error) {
        console.error("Error deleting cliente", error)
        Swal.fire({ ...SW, icon:"error", title:"No se puede eliminar", text:error.response?.data?.msg || "Ocurrió un error al eliminar el cliente." })
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
  const totalPages        = Math.max(1, Math.ceil(filteredClientes.length / rowsPerPage))

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(Number.parseInt(event.target.value, 10)); setPage(0) }

  const totalActive   = clientes.filter(c => c.estado).length
  const totalInactive = clientes.filter(c => !c.estado).length

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

  return (
    <Box className={classes.root}>

      {/* HEADER */}
      <Box className={classes.hdr}>
        <Box className={classes.hdrLeft}>
          <Box className={classes.hdrIcon}><Users size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Clientes</Typography>
            <Typography className={classes.hdrSub}>Administra los clientes del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label:"Total",    val:clientes.length, sub:"registrados",  c:classes.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Activos",  val:totalActive,     sub:"habilitados",  c:classes.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Inactivos",val:totalInactive,   sub:"desactivados", c:classes.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
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
          <Search size={14} color={T.ink4} strokeWidth={2.5}/>
          <input
            className={classes.searchInput}
            placeholder="Buscar cliente, documento, email…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
          />
          <span className={classes.kbd}>⌘K</span>
        </Box>
        <button
          onClick={() => handleOpen(null)}
          style={btnAddStyle}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 9px 26px rgba(108,63,255,.52)" }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 5px 18px rgba(108,63,255,.40)" }}
        >
          <UserPlus size={16} strokeWidth={2.2}/>
          Nuevo Cliente
        </button>
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table style={{ borderCollapse:"collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Cliente</HCell>
                <HCell>Documento</HCell>
                <HCell>Email</HCell>
                <HCell>Teléfono</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClientes.length > 0 ? (
                paginatedClientes.map((cliente, i) => (
                  <TableRow key={cliente._id} className={classes.tblRow}>
                    <NCell>
                      <Box className={classes.nameWrap}>
                        <Box className={classes.nameAv} style={{ background:avGrad(i) }}>{getInitials(cliente.nombre)}</Box>
                        <Box>
                          <Typography className={classes.nameText}>{cliente.nombre}</Typography>
                          <Typography className={classes.nameId}>#{cliente._id?.slice(-6).toUpperCase()}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>{cliente.documento}</BCell>
                    <BCell>
                      <Tooltip title={cliente.email} placement="top">
                        <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:T.ink3, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {cliente.email}
                        </Typography>
                      </Tooltip>
                    </BCell>
                    <BCell>{cliente.telefono}</BCell>
                    <BCell>
                      <Box className={`${classes.chip} ${cliente.estado ? classes.cOn : classes.cOff}`} component="span">
                        {cliente.estado
                          ? <><Check  size={10} strokeWidth={2.5}/> Activo</>
                          : <><X      size={10} strokeWidth={2.5}/> Inactivo</>
                        }
                      </Box>
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        <Tooltip title="Editar"       placement="top"><button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(cliente)}><Edit2  size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Ver detalles" placement="top"><button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleDetails(cliente)}><Eye    size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Eliminar"     placement="top"><button className={`${classes.actBtn} ${classes.bDel}`}  onClick={() => handleDelete(cliente._id)}><Trash2 size={14} strokeWidth={2.2}/></button></Tooltip>
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={6} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron clientes que coincidan con la búsqueda." : "No hay clientes registrados."}
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
          Mostrando {filteredClientes.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredClientes.length)} de {filteredClientes.length} clientes
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
          <select value={rowsPerPage} onChange={handleChangeRowsPerPage}
            style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}>
            {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* MODAL CREAR / EDITAR */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm" fullWidth
        classes={{ paper:classes.dlgPaper }}
        aria-labelledby="form-dialog-title"
        disableEnforceFocus
      >
        <DlgHdr
          icon={editingId ? <Edit2 size={20} color="#fff" strokeWidth={2.2}/> : <UserPlus size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId ? "Editar Cliente" : "Nuevo Cliente"}
          sub={editingId ? "Modifica los datos del cliente seleccionado" : "Completa los campos para registrar un nuevo cliente"}
          onClose={handleClose}
        />
        <DialogContent className={classes.dlgBody}>

          {/* Sección 1: Información Personal */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <User size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información Personal
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                autoFocus margin="dense" id="documento" name="documento" label="Documento" type="text"
                fullWidth variant="outlined" value={formData.documento} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "nombre")}
                error={!!formErrors.documento} helperText={formErrors.documento || MENSAJES_INSTRUCTIVOS.DOCUMENTO}
                inputRef={documentoRef} className={classes.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><FileText size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                inputProps={{ maxLength: VALIDACION.DOCUMENTO.MAX_LENGTH }}
              />
              <TextField
                margin="dense" id="nombre" name="nombre" label="Nombre Completo" type="text"
                fullWidth variant="outlined" value={formData.nombre} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "telefono")}
                error={!!formErrors.nombre} helperText={formErrors.nombre || MENSAJES_INSTRUCTIVOS.NOMBRE}
                inputRef={nombreRef} className={classes.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><User size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                inputProps={{ maxLength: VALIDACION.NOMBRE.MAX_LENGTH }}
              />
            </Box>
          </Box>

          {/* Sección 2: Información de Contacto */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                <Phone size={13} color={T.t1} strokeWidth={2.5}/>
              </Box>
              Información de Contacto
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                margin="dense" id="telefono" name="telefono" label="Teléfono" type="tel"
                fullWidth variant="outlined" value={formData.telefono} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "email")}
                error={!!formErrors.telefono} helperText={formErrors.telefono || MENSAJES_INSTRUCTIVOS.TELEFONO}
                inputRef={telefonoRef} className={classes.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><Phone size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                inputProps={{ maxLength: VALIDACION.TELEFONO.MAX_LENGTH }}
              />
              <TextField
                margin="dense" id="email" name="email" label="Email" type="email"
                fullWidth variant="outlined" value={formData.email} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "password")}
                error={!!formErrors.email} helperText={formErrors.email || MENSAJES_INSTRUCTIVOS.EMAIL}
                inputRef={emailRef} className={classes.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                inputProps={{ maxLength: 50 }}
              />
            </Box>
          </Box>

          {/* Sección 3: Seguridad y Estado */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(255,59,130,.10)" }}>
                <Key size={13} color={T.e1} strokeWidth={2.5}/>
              </Box>
              Seguridad{editingId ? " y Estado" : ""}
            </Box>
            <TextField
              margin="dense" id="password" name="password"
              label={editingId ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"} type="password"
              fullWidth variant="outlined" value={formData.password} onChange={handleChange}
              onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, editingId ? "estado" : null)}
              error={!!formErrors.password} helperText={formErrors.password || MENSAJES_INSTRUCTIVOS.PASSWORD}
              inputRef={passwordRef} className={classes.fmField}
              InputProps={{ startAdornment:<InputAdornment position="start"><Key size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
              inputProps={{ maxLength: VALIDACION.CONTRASENA.MAX_LENGTH }}
            />
            {editingId && (
              <TextField
                className={classes.fmField} select margin="dense" label="Estado" name="estado"
                value={formData.estado} onChange={handleChange} fullWidth variant="outlined"
                inputRef={estadoRef}
                helperText="Cambiar el estado del cliente"
              >
                <MenuItem value={true}>✅ Activo</MenuItem>
                <MenuItem value={false}>❌ Inactivo</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>

        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={classes.btnSubmit}>
            <Check size={15} strokeWidth={2.5} style={{ flexShrink:0 }}/>
            {editingId ? "Actualizar Cliente" : "Crear Cliente"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DETALLES */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm" fullWidth
        classes={{ paper:classes.dlgPaper }}
        aria-labelledby="details-dialog-title"
        disableEnforceFocus
      >
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Cliente"
          sub="Información completa del cliente seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedCliente && (
            <>
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>{getInitials(selectedCliente.nombre)}</Box>
                <Typography className={classes.detName}>{selectedCliente.nombre}</Typography>
                <Typography className={classes.detSub}>
                  Cliente {selectedCliente.estado ? "activo" : "inactivo"} desde{" "}
                  {new Date(selectedCliente.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>
              <Box className={classes.detGrid}>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Documento</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <FileText size={14} color={T.v1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedCliente.documento}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Teléfono</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Phone size={14} color={T.a1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedCliente.telefono}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem} style={{ gridColumn:"1 / -1" }}>
                  <Typography className={classes.detLbl}>Email</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Mail size={14} color={T.t1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal} style={{ fontSize:".82rem", wordBreak:"break-all" }}>{selectedCliente.email}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Estado</Typography>
                  <Box className={`${classes.chip} ${selectedCliente.estado ? classes.cOn : classes.cOff}`} component="span" style={{ marginTop:2 }}>
                    {selectedCliente.estado
                      ? <><Check size={11} strokeWidth={2.5}/> Activo</>
                      : <><X     size={11} strokeWidth={2.5}/> Inactivo</>
                    }
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>ID</Typography>
                  <Typography style={{ fontFamily:"monospace", fontSize:".76rem", color:T.ink3, fontWeight:500 }}>{selectedCliente._id}</Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
          <Button onClick={() => { handleCloseDetails(); handleOpen(selectedCliente) }} className={classes.btnSubmit}>
            <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Editar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default ClienteList