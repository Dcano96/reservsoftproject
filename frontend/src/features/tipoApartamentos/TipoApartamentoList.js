"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  Dialog,
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@material-ui/core"
import {
  Edit2, Trash2, Eye, X, Search, Home, FileText, Plus,
  Maximize2, CheckCircle, XCircle, LayoutGrid, Tag,
  ArrowLeft, ArrowRight, ExternalLink,
} from "lucide-react"
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import tipoApartamentoService from "./tipoApartamento.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOKENS
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

const MENSAJES = {
  NOMBRE:     "Ingrese el nombre del tipo, entre 3 y 30 caracteres.",
  DESCRIPCION:"Describe las características del tipo de apartamento.",
  TAMAÑO:     "Ingrese el tamaño en metros cuadrados (m²).",
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
    fontFamily:"'DM Sans',sans-serif", fontSize:".88rem",
    padding:"12px 16px", color:T.ink2,
    borderBottom:`1px solid ${T.bL}`,
    textAlign:"center", verticalAlign:"middle",
  },
}))(TableCell)

const NCell = withStyles(() => ({
  body: {
    fontFamily:"'DM Sans',sans-serif", fontSize:".88rem",
    padding:"12px 16px", color:T.ink,
    borderBottom:`1px solid ${T.bL}`,
    verticalAlign:"middle",
  },
}))(TableCell)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(theme => ({
  root: {
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
    borderRadius:50, padding:"9px 18px", minWidth:250,
    boxShadow:"0 2px 10px rgba(108,63,255,0.07)", transition:"all .2s",
    "&:focus-within":{ borderColor:"rgba(108,63,255,.35)", boxShadow:"0 0 0 3px rgba(108,63,255,.10)", background:T.white },
  },
  searchInput:{ border:"none", outline:"none", background:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, width:"100%" },
  kbd:{ fontSize:10, color:T.ink4, background:"rgba(108,63,255,0.07)", borderRadius:6, padding:"2px 7px", whiteSpace:"nowrap" },
  tblWrap:{ margin:"0 26px 16px", borderRadius:20, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 20px rgba(108,63,255,.07)" },
  tblRow:{ transition:"background .15s", "&:nth-of-type(odd)":{ background:"rgba(244,241,255,.30)" }, "&:hover":{ background:"rgba(108,63,255,.055)" } },
  nameWrap:{ display:"flex", alignItems:"center", gap:10 },
  nameAv:{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 12px rgba(108,63,255,.30)" },
  nameText:{ fontWeight:700, fontSize:".90rem", color:T.ink },
  nameId:{ fontSize:".72rem", color:T.ink4, marginTop:1 },
  chip:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, whiteSpace:"nowrap" },
  cSize:{ background:"rgba(108,63,255,.10)", color:"#5929d9", border:`1px solid rgba(108,63,255,.16)` },
  cOn:  { background:"rgba(0,212,170,.12)",  color:"#00917a" },
  cOff: { background:"rgba(255,59,130,.10)", color:"#cc2060" },
  descTxt:{ fontFamily:"'DM Sans',sans-serif", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:".83rem", color:T.ink3 },
  actWrap:{ display:"flex", justifyContent:"center", gap:6 },
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
  fmSection:{ marginBottom:20 },
  fmSectionLbl:{
    display:"flex", alignItems:"center", gap:8,
    fontFamily:"'Syne',sans-serif", fontSize:".83rem", fontWeight:700,
    color:T.ink, marginBottom:12, paddingBottom:8,
    borderBottom:"1.5px solid rgba(108,63,255,.09)", letterSpacing:"-.1px",
  },
  fmSectionIco:{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
  fmRow:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
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
  btnSecondary:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:"rgba(108,63,255,.08) !important", color:`${T.v1} !important`,
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 22px !important",
    border:"1px solid rgba(108,63,255,.18) !important", transition:"all .18s !important",
    "&:hover":{ background:"rgba(108,63,255,.14) !important" },
  },
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 0 18px" },
  detAv:{ width:76, height:76, borderRadius:22, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12 },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:6, textAlign:"center" },
  detDesc:{ fontFamily:"'DM Sans',sans-serif", fontSize:".87rem", color:T.ink3, textAlign:"center", maxWidth:"82%", lineHeight:1.65 },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ESTILOS DEL BOTÓN NATIVO — igual que UsuariosList
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
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TipoApartamentoList = ({ onModuleChange }) => {
  const cls = useStyles()
  const history = useHistory()

  const [tipos,    setTipos]    = useState([])
  const [open,     setOpen]     = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState({ nombre:"", descripcion:"", tamaño:"", estado:true })
  const [errs,     setErrs]     = useState({ nombre:"", descripcion:"", tamaño:"" })
  const [search,   setSearch]   = useState("")
  const [page,     setPage]     = useState(0)
  const [rpp,      setRpp]      = useState(5)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)

  const load = async () => {
    try { const d = await tipoApartamentoService.getTipoApartamentos(); setTipos(d) }
    catch(e) { console.error(e); Swal.fire({...SW, icon:"error", title:"Error", text:"No se pudieron cargar los tipos de apartamentos."}) }
  }
  useEffect(() => { load() }, [])

  const gotoApts = () => { if (onModuleChange) onModuleChange("apartamentos") }

  const openModal = t => {
    if (t) { setForm({ nombre:t.nombre||"", descripcion:t.descripcion||"", tamaño:t.tamaño||"", estado:t.estado??true }); setEditId(t._id) }
    else   { setForm({ nombre:"", descripcion:"", tamaño:"", estado:true }); setEditId(null) }
    setErrs({ nombre:"", descripcion:"", tamaño:"" }); setOpen(true)
  }
  const closeModal = () => setOpen(false)
  const openView   = t => { setViewData(t); setViewOpen(true) }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: name==="tamaño" ? Number(value) : value }))
    let err = ""
    if (name==="nombre") {
      if (!value.trim())                  err = "El nombre no puede estar vacío"
      else if (value.trim().length < 3)   err = "Mínimo 3 caracteres"
      else if (value.trim().length > 30)  err = "Máximo 30 caracteres"
    } else if (name==="descripcion") {
      if (!value.trim())                  err = "La descripción no puede estar vacía"
      else if (value.trim().length < 3)   err = "Mínimo 3 caracteres"
      else if (/[^\w\s.,áéíóúÁÉÍÓÚñÑ¿?¡!()-]/.test(value)) err = "Caracteres especiales no permitidos"
    } else if (name==="tamaño") {
      if (!value) err = "El tamaño no puede estar vacío"
    }
    setErrs(p => ({ ...p, [name]:err }))
  }

  const handleSubmit = async () => {
    const nE = !form.nombre.trim()?"El nombre no puede estar vacío":form.nombre.trim().length<3?"Mínimo 3 caracteres":form.nombre.trim().length>30?"Máximo 30 caracteres":""
    const dE = !form.descripcion.trim()?"La descripción no puede estar vacía":form.descripcion.trim().length<3?"Mínimo 3 caracteres":/[^\w\s.,áéíóúÁÉÍÓÚñÑ¿?¡!()-]/.test(form.descripcion)?"Caracteres especiales no permitidos":""
    const tE = !form.tamaño?"El tamaño no puede estar vacío":""
    setErrs({ nombre:nE, descripcion:dE, tamaño:tE })
    if (nE||dE||tE) return
    try {
      if (editId) { await tipoApartamentoService.updateTipoApartamento(editId, form); Swal.fire({...SW, icon:"success", title:"¡Actualizado!", text:"El tipo se actualizó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false}) }
      else        { await tipoApartamentoService.createTipoApartamento(form);          Swal.fire({...SW, icon:"success", title:"¡Creado!",      text:"El tipo se creó correctamente.",       timer:2200, timerProgressBar:true, showConfirmButton:false}) }
      load(); closeModal()
    } catch(e) { console.error(e); Swal.fire({...SW, icon:"error", title:"Error", text:"Ocurrió un error al guardar."}) }
  }

  const handleDelete = async (id, estado) => {
    if (estado) { Swal.fire({...SW, icon:"warning", title:"Acción no permitida", text:"No se puede eliminar un tipo de apartamento activo."}); return }
    const r = await Swal.fire({...SWD, title:"¿Eliminar tipo?", text:"Esta acción no se puede deshacer.", icon:"warning", showCancelButton:true, confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar"})
    if (r.isConfirmed) {
      try { await tipoApartamentoService.deleteTipoApartamento(id); Swal.fire({...SW, icon:"success", title:"Eliminado", text:"El tipo se eliminó correctamente.", timer:2000, timerProgressBar:true, showConfirmButton:false}); load() }
      catch(e) { Swal.fire({...SW, icon:"error", title:"Error", text:"Ocurrió un error al eliminar."}) }
    }
  }

  const filtered   = tipos.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()) || t.descripcion.toLowerCase().includes(search.toLowerCase()))
  const paginated  = filtered.slice(page*rpp, page*rpp+rpp)
  const totalPages = Math.max(1, Math.ceil(filtered.length/rpp))
  const totalActive   = tipos.filter(t => t.estado).length
  const totalInactive = tipos.filter(t => !t.estado).length

  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box className={cls.dlgHdr}>
      <Box className={cls.dlgHdrIco}>{icon}</Box>
      <Box>
        <Typography className={cls.dlgHdrTitle}>{title}</Typography>
        <Typography className={cls.dlgHdrSub}>{sub}</Typography>
      </Box>
      <button className={cls.dlgCloseBtn} onClick={onClose}><X size={15} strokeWidth={2.5}/></button>
    </Box>
  )

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <Box className={cls.root}>

      {/* HEADER */}
      <Box className={cls.hdr}>
        <Box className={cls.hdrLeft}>
          <Box className={cls.hdrIcon}><LayoutGrid size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={cls.hdrTitle}>Tipos de Apartamentos</Typography>
            <Typography className={cls.hdrSub}>Administra y organiza las categorías del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={cls.statsRow}>
        {[
          { label:"Total tipos",  val:tipos.length,   sub:"registrados",    c:cls.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Activos",      val:totalActive,    sub:"disponibles",    c:cls.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Inactivos",    val:totalInactive,  sub:"deshabilitados", c:cls.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
        ].map((s,i) => (
          <Box key={i} className={`${cls.stat} ${s.c}`}>
            <Box className={cls.statOrb} style={{ background:s.orb }}/>
            <Typography className={cls.statLabel} style={{ color:s.col }}>{s.label}</Typography>
            <Typography className={cls.statVal}>{s.val}</Typography>
            <Typography className={cls.statSub} style={{ color:s.sc }}>{s.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* TOOLBAR */}
      <Box className={cls.toolbar}>
        <Box className={cls.searchPill}>
          <Search size={14} color={T.ink4} strokeWidth={2.5}/>
          <input
            className={cls.searchInput}
            placeholder="Buscar tipo de apartamento…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
          />
          <span className={cls.kbd}>⌘K</span>
        </Box>

        {/* ── BOTÓN NATIVO — mismo patrón exacto que UsuariosList ── */}
        <button
          onClick={() => openModal(null)}
          style={btnAddStyle}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 9px 26px rgba(108,63,255,.52)" }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 5px 18px rgba(108,63,255,.40)" }}
        >
          <LayoutGrid size={16} strokeWidth={2}/>
          Nuevo Tipo
        </button>
      </Box>

      {/* TABLE */}
      <Box className={cls.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Nombre</HCell>
                <HCell>Descripción</HCell>
                <HCell>Tamaño</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((tipo, i) => (
                <TableRow key={tipo._id} className={cls.tblRow}>
                  <NCell>
                    <Box className={cls.nameWrap}>
                      <Box className={cls.nameAv} style={{ background:avGrad(i) }}>
                        <Home size={16} color="#fff" strokeWidth={2}/>
                      </Box>
                      <Box>
                        <Typography className={cls.nameText}>{tipo.nombre}</Typography>
                        <Typography className={cls.nameId}>#{tipo._id?.slice(-6).toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </NCell>
                  <BCell>
                    <Tooltip title={tipo.descripcion} placement="top">
                      <Typography className={cls.descTxt}>{tipo.descripcion}</Typography>
                    </Tooltip>
                  </BCell>
                  <BCell>
                    <Box className={`${cls.chip} ${cls.cSize}`} component="span">
                      <Maximize2 size={11} strokeWidth={2.5}/> {tipo.tamaño} m²
                    </Box>
                  </BCell>
                  <BCell>
                    <Box className={`${cls.chip} ${tipo.estado ? cls.cOn : cls.cOff}`} component="span">
                      {tipo.estado
                        ? <><CheckCircle size={11} strokeWidth={2.5}/> Activo</>
                        : <><XCircle    size={11} strokeWidth={2.5}/> Inactivo</>
                      }
                    </Box>
                  </BCell>
                  <BCell>
                    <Box className={cls.actWrap}>
                      <Tooltip title="Editar"       placement="top"><button className={`${cls.actBtn} ${cls.bEdit}`} onClick={() => openModal(tipo)}><Edit2  size={14} strokeWidth={2.2}/></button></Tooltip>
                      <Tooltip title="Ver detalles" placement="top"><button className={`${cls.actBtn} ${cls.bView}`} onClick={() => openView(tipo)} ><Eye    size={14} strokeWidth={2.2}/></button></Tooltip>
                      <Tooltip title="Eliminar"     placement="top"><button className={`${cls.actBtn} ${cls.bDel}`}  onClick={() => handleDelete(tipo._id, tipo.estado)}><Trash2 size={14} strokeWidth={2.2}/></button></Tooltip>
                    </Box>
                  </BCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={5} className={cls.emptyCell}>No se encontraron tipos de apartamentos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PAGINATION */}
      <Box className={cls.pagWrap}>
        <Typography className={cls.pagInfo}>
          Mostrando {filtered.length===0?0:page*rpp+1}–{Math.min((page+1)*rpp, filtered.length)} de {filtered.length} tipos
        </Typography>
        <Box className={cls.pagBtns}>
          <button className={cls.pageBtn} onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0} style={{ opacity:page===0?.4:1 }}><ArrowLeft size={12} strokeWidth={2.5}/></button>
          {Array.from({length:totalPages}, (_,i) => (
            <button key={i} className={`${cls.pageBtn} ${page===i?cls.pagBtnOn:""}`} onClick={() => setPage(i)}>{i+1}</button>
          ))}
          <button className={cls.pageBtn} onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ opacity:page>=totalPages-1?.4:1 }}><ArrowRight size={12} strokeWidth={2.5}/></button>
        </Box>
        <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Typography className={cls.pagInfo}>Filas:</Typography>
          <select value={rpp} onChange={e => { setRpp(Number(e.target.value)); setPage(0) }}
            style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}>
            {[5,10,25,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="md" classes={{ paper:cls.dlgPaper }}>
        <DlgHdr
          icon={editId ? <Edit2 size={20} color="#fff" strokeWidth={2.2}/> : <Plus size={20} color="#fff" strokeWidth={2.5}/>}
          title={editId ? "Editar Tipo de Apartamento" : "Nuevo Tipo de Apartamento"}
          sub={editId ? "Modifica los datos del tipo seleccionado" : "Completa los campos para registrar un nuevo tipo"}
          onClose={closeModal}
        />
        <DialogContent className={cls.dlgBody}>

          {/* Sección 1 */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <Tag size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información del Tipo
            </Box>
            <Box className={cls.fmRow}>
              <TextField
                className={cls.fmField} autoFocus margin="dense"
                label="Nombre del Tipo" name="nombre"
                value={form.nombre} onChange={handleChange}
                fullWidth variant="outlined"
                error={!!errs.nombre}
                helperText={errs.nombre || MENSAJES.NOMBRE}
                InputProps={{ startAdornment:(
                  <InputAdornment position="start"><Home size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
                )}}
              />
              <TextField
                className={cls.fmField} margin="dense"
                label="Tamaño (m²)" name="tamaño"
                value={form.tamaño} onChange={handleChange}
                fullWidth type="number" variant="outlined"
                error={!!errs.tamaño}
                helperText={errs.tamaño || MENSAJES.TAMAÑO}
                InputProps={{ startAdornment:(
                  <InputAdornment position="start"><Maximize2 size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
                )}}
              />
            </Box>
          </Box>

          {/* Sección 2 */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                <FileText size={13} color={T.t1} strokeWidth={2.5}/>
              </Box>
              Descripción detallada
            </Box>
            <TextField
              className={cls.fmField} margin="dense"
              label="Descripción" name="descripcion"
              value={form.descripcion} onChange={handleChange}
              fullWidth variant="outlined" multiline minRows={3}
              error={!!errs.descripcion}
              helperText={errs.descripcion || MENSAJES.DESCRIPCION}
              InputProps={{ startAdornment:(
                <InputAdornment position="start" style={{ alignSelf:"flex-start", marginTop:8 }}>
                  <FileText size={16} color={T.ink3} strokeWidth={2}/>
                </InputAdornment>
              )}}
            />
            {editId && (
              <FormControl fullWidth variant="outlined" className={cls.fmField} margin="dense">
                <InputLabel style={{ fontFamily:"'DM Sans',sans-serif", color:T.ink3, fontSize:".88rem" }}>Estado</InputLabel>
                <Select
                  value={form.estado ? "Activo" : "Inactivo"}
                  onChange={e => setForm(p => ({ ...p, estado: e.target.value==="Activo" }))}
                  label="Estado"
                  style={{ fontFamily:"'DM Sans',sans-serif", borderRadius:13 }}
                >
                  <MenuItem value="Activo">
                    <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <CheckCircle size={14} color="#00917a" strokeWidth={2.5}/> Activo
                    </Box>
                  </MenuItem>
                  <MenuItem value="Inactivo">
                    <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <XCircle size={14} color="#cc2060" strokeWidth={2.5}/> Inactivo
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>

        <DialogActions className={cls.dlgFoot}>
          <Button onClick={closeModal} className={cls.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={cls.btnSubmit}>
            {editId
              ? <><Edit2 size={15} strokeWidth={2.2} style={{ flexShrink:0 }}/> Guardar Cambios</>
              : <><Plus  size={15} strokeWidth={2.5} style={{ flexShrink:0 }}/> Crear Tipo</>
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md" classes={{ paper:cls.dlgPaper }}>
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Tipo"
          sub="Información completa del tipo de apartamento"
          onClose={() => setViewOpen(false)}
        />
        <DialogContent className={cls.dlgBody}>
          {viewData && (
            <>
              <Box className={cls.detHero}>
                <Box className={cls.detAv}><Home size={36} color="#fff" strokeWidth={1.8}/></Box>
                <Typography className={cls.detName}>{viewData.nombre}</Typography>
                <Typography className={cls.detDesc}>{viewData.descripcion}</Typography>
              </Box>
              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>
              <Box className={cls.detGrid}>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Tamaño</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Maximize2 size={14} color={T.v1} strokeWidth={2.2}/>
                    <Typography className={cls.detVal}>{viewData.tamaño} m²</Typography>
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Estado</Typography>
                  <Box className={`${cls.chip} ${viewData.estado ? cls.cOn : cls.cOff}`} component="span" style={{ marginTop:2 }}>
                    {viewData.estado
                      ? <><CheckCircle size={12} strokeWidth={2.5}/> Activo</>
                      : <><XCircle    size={12} strokeWidth={2.5}/> Inactivo</>
                    }
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>ID</Typography>
                  <Typography className={cls.detVal} style={{ fontSize:".76rem", color:T.ink3, fontFamily:"monospace" }}>{viewData._id}</Typography>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Categoría</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <LayoutGrid size={14} color={T.v1} strokeWidth={2.2}/>
                    <Typography className={cls.detVal}>Tipo Apto.</Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={cls.dlgFoot}>
          <Button onClick={() => setViewOpen(false)} className={cls.btnCancel}>Cerrar</Button>
          <Button onClick={gotoApts} className={cls.btnSecondary}>
            <ExternalLink size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Ver Apartamentos
          </Button>
          <Button onClick={() => { setViewOpen(false); openModal(viewData) }} className={cls.btnSubmit}>
            <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Editar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default TipoApartamentoList