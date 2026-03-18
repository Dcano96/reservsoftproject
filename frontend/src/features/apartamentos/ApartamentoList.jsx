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
  Chip,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from "@material-ui/core"
import { Edit, Delete, Eye, X, Search, UserPlus, Home, Building, Layers, FileText, DollarSign, Check, ArrowLeft, ArrowRight, Edit2, Trash2 } from "lucide-react"
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import apartamentoService from "./apartamento.service"
import mobiliarioService from "../mobiliarios/mobiliario.service"
import tipoApartamentoService from "../tipoApartamentos/tipoApartamento.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LÓGICA ORIGINAL — 100% sin cambios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const formatTarifa = (tarifa) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(tarifa)
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENSAJES INSTRUCTIVOS — modal helper texts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MENSAJES_INSTRUCTIVOS = {
  TIPO:       "Seleccione el tipo de apartamento. Solo se muestran los tipos activos.",
  NUMERO_APTO:"Ingrese un número entre 1 y 200. Ej: 101, 205.",
  PISO:       "Ingrese el número de piso entre 1 y 20. Ej: 1, 5, 10.",
  CAPACIDAD:  "Ingrese la capacidad máxima de personas entre 1 y 6. Ej: 2, 4.",
  TARIFA:     "Ingrese la tarifa en pesos colombianos (solo números). Ej: 150000.",
  ESTADO:     "Seleccione el estado actual del apartamento.",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS — idénticos a ClienteList
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
   SWAL INJECT — idéntico a ClienteList
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
   TABLE CELLS — idénticos a ClienteList
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
   BOTÓN NATIVO — igual que ClienteList
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
   STYLES — copiados 1:1 de ClienteList
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
  filterRow:{ padding:"0 26px 16px", display:"flex", gap:12, flexWrap:"wrap" },
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
  /* DIALOG */
  dlgPaper:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:640, maxWidth:"96vw",
    background:"rgba(255,255,255,0.98) !important", backdropFilter:"blur(24px)",
    overflow:"hidden", position:"relative",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:10 },
  },
  dlgPaperLarge:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:900, maxWidth:"95vw", maxHeight:"70vh",
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
    "&:disabled":{ opacity:.5, transform:"none !important", boxShadow:"none !important" },
  },
  /* DETAILS */
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0 18px" },
  detAv:{ width:76, height:76, borderRadius:22, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12 },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:4, textAlign:"center" },
  detSub:{ fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", color:T.ink3, textAlign:"center" },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  /* mobiliarios table */
  mobTblWrap:{ borderRadius:16, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 16px rgba(108,63,255,.07)", marginTop:12 },
  mobHCell:{ background:"linear-gradient(135deg,#6C3FFF,#C040FF)", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".71rem", textTransform:"uppercase", letterSpacing:"1.1px", padding:"11px 14px", borderBottom:"none" },
  mobBCell:{ fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", padding:"10px 14px", color:T.ink2, borderBottom:`1px solid ${T.bL}` },
  errorMessage:{ fontSize:".90rem", color:"#ef4444", fontWeight:500, marginTop:4 },
  container:{ fontFamily:"'DM Sans',sans-serif" },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ApartamentoList = () => {
  const classes = useStyles()
  const history = useHistory()

  /* ── state — idéntico al original ── */
  const [apartamentos, setApartamentos] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    Tipo: "Type 1",
    NumeroApto: "",
    Piso: "",
    Capacidad: "",
    Tarifa: "",
    Estado: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState("Todos")
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedApartamento, setSelectedApartamento] = useState(null)
  const [mobiliarios, setMobiliarios] = useState([])
  const [tipoApartamentos, setTipoApartamentos] = useState([])

  /* ── fetch tipos — idéntico al original ── */
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await tipoApartamentoService.getTipoApartamentos()
        setTipoApartamentos(data)
      } catch (error) {
        console.error("Error fetching tipoApartamentos:", error)
      }
    }
    fetchTipos()
  }, [])

  /* ── fetchApartamentos — idéntico al original ── */
  const fetchApartamentos = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      console.log("Datos recibidos de la API:", data)
      const dataWithCapacidad = data.map((apt) => ({
        ...apt,
        Capacidad: apt.Capacidad != null ? apt.Capacidad : 0,
      }))
      console.log("Datos procesados con Capacidad:", dataWithCapacidad)
      const sortedData = dataWithCapacidad.sort((a, b) => Number(a.NumeroApto) - Number(b.NumeroApto))
      setApartamentos(sortedData)
    } catch (error) {
      console.error("Error fetching apartamentos", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los apartamentos." })
    }
  }

  useEffect(() => { fetchApartamentos() }, [])

  /* ── handleOpen — idéntico al original ── */
  const handleOpen = (apartamento) => {
    setFormErrors({})
    if (apartamento) {
      console.log("Abriendo formulario para editar apartamento:", apartamento)
      setFormData({
        Tipo: apartamento.Tipo || "",
        NumeroApto: apartamento.NumeroApto || "",
        Piso: apartamento.Piso || "",
        Capacidad: apartamento.Capacidad != null ? apartamento.Capacidad : 0,
        Tarifa: apartamento.Tarifa || "",
        Estado: apartamento.Estado ?? true,
      })
      setEditingId(apartamento._id)
      setIsFormValid(true)
    } else {
      const tiposActivos = tipoApartamentos.filter((tipo) => tipo.estado)
      if (tiposActivos.length === 0) {
        Swal.fire({ ...SW, icon:"warning", title:"No hay tipos disponibles", text:"No hay tipos de apartamentos activos disponibles para crear un nuevo apartamento." })
        return
      }
      const tipoInicial =
        selectedTipo === "Todos" || !tiposActivos.some((t) => t.nombre === selectedTipo)
          ? tiposActivos[0]?.nombre || ""
          : selectedTipo
      setFormData({ Tipo: tipoInicial, NumeroApto: "", Piso: "", Capacidad: 0, Tarifa: "", Estado: true })
      setEditingId(null)
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  /* ── handleView — idéntico al original ── */
  const handleView = async (apartamento) => {
    setSelectedApartamento(apartamento)
    try {
      const data = await mobiliarioService.getMobiliariosPorApartamento(apartamento._id)
      setMobiliarios(data)
    } catch (error) {
      console.error("Error al obtener mobiliarios asociados", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los mobiliarios asociados." })
    }
    setOpenDetails(true)
  }

  const handleCloseDetails = () => {
    setOpenDetails(false)
    setSelectedApartamento(null)
    setMobiliarios([])
  }

  /* ── handleChange — idéntico al original ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value
    console.log(`Campo cambiado: ${name}, Valor: ${value}, Tipo: ${typeof value}`)
    if (name === "Piso") {
      if (value === "" || /^\d+$/.test(value)) {
        newValue = value === "" ? "" : Number(value)
      } else { return }
    } else if (["NumeroApto", "Capacidad", "Tarifa"].includes(name)) {
      if (value === "" || /^\d+$/.test(value)) {
        newValue = value === "" ? "" : Number(value)
      } else { return }
    } else if (name === "Estado") {
      newValue = value === "true"
      console.log(`Valor de Estado convertido a: ${newValue} (${typeof newValue})`)
    }
    const updatedFormData = { ...formData, [name]: newValue }
    console.log("Datos del formulario actualizados:", updatedFormData)
    setFormData(updatedFormData)
    validateField(name, newValue)
    validateForm(updatedFormData)
  }

  /* ── validateField — idéntico al original ── */
  const validateField = (name, value) => {
    let errorMessage = ""
    if (name === "NumeroApto") {
      if (value === 0 || value === "") {
        errorMessage = "El número de apartamento es obligatorio"
      } else if (Number(value) < 1 || Number(value) > 200) {
        errorMessage = "El número de apartamento debe estar entre 1 y 200"
      } else {
        try {
          if (!editingId || (editingId && formData.NumeroApto !== value)) {
            const existingApartamentos = apartamentos.filter(
              (apt) => apt.NumeroApto === value && apt.Tipo === formData.Tipo,
            )
            if (existingApartamentos.length > 0) {
              errorMessage = `El apartamento número ${value} ya existe para el tipo ${formData.Tipo}`
            }
          }
        } catch (error) {
          console.error("Error al verificar duplicados:", error)
        }
      }
    } else if (name === "Piso") {
      if (value === 0 || value === "") {
        errorMessage = "El piso es obligatorio"
      } else if (!Number.isInteger(Number(value))) {
        errorMessage = "El piso debe ser un número entero"
      } else if (Number(value) < 1 || Number(value) > 20) {
        errorMessage = "El piso debe estar entre 1 y 20"
      }
    } else if (name === "Capacidad") {
      if (value === "" || value === undefined || value === null) {
        errorMessage = "La capacidad es obligatoria"
      } else if (Number(value) < 1 || Number(value) > 6) {
        errorMessage = "La capacidad debe estar entre 1 y 6"
      }
    } else if (name === "Tarifa") {
      if (value === 0 || value === "") {
        errorMessage = "La tarifa es obligatoria"
      } else if (Number(value) <= 0) {
        errorMessage = "La tarifa debe ser un valor positivo"
      } else if (!/^\d+$/.test(String(value))) {
        errorMessage = "La tarifa solo debe contener números"
      }
    }
    setFormErrors((prev) => ({ ...prev, [name]: errorMessage }))
    return !errorMessage
  }

  /* ── validateForm — idéntico al original ── */
  const validateForm = (data) => {
    const isValid =
      data.NumeroApto !== "" &&
      Number(data.NumeroApto) > 0 &&
      data.Piso !== "" &&
      Number(data.Piso) > 0 &&
      data.Capacidad !== "" &&
      Number(data.Capacidad) > 0 &&
      data.Tarifa !== "" &&
      Number(data.Tarifa) > 0
    setIsFormValid(isValid)
  }

  /* ── handleSubmit — idéntico al original ── */
  const handleSubmit = async () => {
    const tipoSeleccionado = tipoApartamentos.find((tipo) => tipo.nombre === formData.Tipo)
    if (tipoSeleccionado && !tipoSeleccionado.estado && !editingId) {
      Swal.fire({ ...SW, icon:"error", title:"Error de validación", text:"No se puede crear un apartamento con un tipo inactivo." })
      return
    }
    const tempErrors = {}
    if (Number(formData.NumeroApto) <= 0) {
      tempErrors.NumeroApto = "El número de apartamento es obligatorio"
    } else {
      const existingApartamentos = apartamentos.filter(
        (apt) => apt.NumeroApto === formData.NumeroApto && apt.Tipo === formData.Tipo && apt._id !== editingId,
      )
      if (existingApartamentos.length > 0) {
        tempErrors.NumeroApto = `El apartamento número ${formData.NumeroApto} ya existe para el tipo ${formData.Tipo}`
      }
    }
    if (Number(formData.Piso) <= 0) tempErrors.Piso = "El piso es obligatorio y debe ser mayor que 0"
    if (Number(formData.Capacidad) <= 0) tempErrors.Capacidad = "La capacidad es obligatoria y debe ser mayor que 0"
    if (Number(formData.Tarifa) <= 0) tempErrors.Tarifa = "La tarifa es obligatoria y debe ser un valor positivo"
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)
      const firstError = Object.values(tempErrors)[0]
      Swal.fire({ ...SW, icon:"error", title:"Error de validación", text:firstError })
      return
    }
    const dataToSend = {
      ...formData,
      NumeroApto: Number(formData.NumeroApto),
      Piso: Number(formData.Piso),
      Capacidad: Number(formData.Capacidad),
      Tarifa: Number(formData.Tarifa),
    }
    console.log("Datos a enviar para guardar:", dataToSend)
    try {
      if (editingId) {
        await apartamentoService.updateApartamento(editingId, dataToSend)
        Swal.fire({ ...SW, icon:"success", title:"Actualizado", text:"El apartamento se actualizó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      } else {
        await apartamentoService.createApartamento(dataToSend)
        Swal.fire({ ...SW, icon:"success", title:"Creado", text:"El apartamento se creó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      }
      setTimeout(async () => { await fetchApartamentos(); handleClose() }, 500)
    } catch (error) {
      console.error("Error saving apartamento", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al guardar el apartamento." })
    }
  }

  /* ── handleDelete — idéntico al original ── */
  const handleDelete = async (id) => {
    const apartamentoToDelete = apartamentos.find((apt) => apt._id === id)
    if (apartamentoToDelete && apartamentoToDelete.Estado) {
      Swal.fire({ ...SW, icon:"warning", title:"Acción no permitida", text:"No se puede eliminar un apartamento activo." })
      return
    }
    const confirmDelete = await Swal.fire({
      ...SWD,
      title:"¿Eliminar apartamento?", text:"Esta acción no se puede deshacer",
      icon:"question", showCancelButton:true,
      confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar",
    })
    if (confirmDelete.isConfirmed) {
      try {
        await apartamentoService.deleteApartamento(id)
        Swal.fire({ ...SW, icon:"success", title:"Eliminado", text:"El apartamento se eliminó correctamente.", timer:2000, timerProgressBar:true, showConfirmButton:false })
        fetchApartamentos()
      } catch (error) {
        console.error("Error deleting apartamento", error)
        if (error.response && error.response.status === 400) {
          Swal.fire({ ...SW, icon:"warning", title:"Acción no permitida", text:"No se puede eliminar este apartamento porque tiene registros asociados." })
        } else {
          Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al eliminar el apartamento." })
        }
      }
    }
  }

  /* ── filter + paginate — idéntico al original ── */
  const filteredApartamentos = apartamentos.filter(
    (a) =>
      (selectedTipo === "Todos" || a.Tipo === selectedTipo) &&
      (searchTerm === "" ||
        a.NumeroApto.toString().includes(searchTerm) ||
        a.Piso.toString().includes(searchTerm) ||
        a.Capacidad.toString().includes(searchTerm) ||
        a.Tarifa.toString().includes(searchTerm)),
  )
  const paginatedApartamentos = filteredApartamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredApartamentos.length / rowsPerPage))

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(Number.parseInt(event.target.value, 10)); setPage(0) }

  const getTabIcon = (tipo) => {
    switch (tipo) {
      case "Type 1":   return <Home size={18} />
      case "Type 2":   return <Building size={18} />
      case "Penthouse":return <Layers size={18} />
      default:         return <Home size={18} />
    }
  }

  /* stats */
  const totalActive   = apartamentos.filter(a => a.Estado).length
  const totalInactive = apartamentos.filter(a => !a.Estado).length

  /* shared dialog header */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box className={classes.dlgHdr}>
      <Box className={classes.dlgHdrIco}>{icon}</Box>
      <Box>
        <Typography className={classes.dlgHdrTitle}>{title}</Typography>
        <Typography className={classes.dlgHdrSub}>{sub}</Typography>
      </Box>
      <button className={classes.dlgCloseBtn} onClick={onClose}><X size={15} strokeWidth={2.5}/></button>
    </Box>
  )

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <Box className={classes.root}>

      {/* HEADER */}
      <Box className={classes.hdr}>
        <Box className={classes.hdrLeft}>
          <Box className={classes.hdrIcon}><Home size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Apartamentos</Typography>
            <Typography className={classes.hdrSub}>Administra los apartamentos del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label:"Total",    val:apartamentos.length, sub:"registrados",  c:classes.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Activos",  val:totalActive,         sub:"habilitados",  c:classes.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Inactivos",val:totalInactive,       sub:"desactivados", c:classes.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
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
            placeholder="Buscar por número, piso, tarifa…"
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
          <Home size={16} strokeWidth={2.2}/>
          Nuevo Apartamento
        </button>
      </Box>

      {/* FILTRO DE TIPO */}
      <Box className={classes.filterRow}>
        <FormControl variant="outlined" size="small" style={{ minWidth:220 }}>
          <InputLabel id="select-tipo-label" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3 }}>Tipo de apartamento</InputLabel>
          <Select
            labelId="select-tipo-label"
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            label="Tipo de apartamento"
            style={{ borderRadius:13, fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", background:"rgba(244,241,255,.38)" }}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            {tipoApartamentos.map((tipo) => (
              <MenuItem key={tipo._id} value={tipo.nombre} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>
                {tipo.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table style={{ borderCollapse:"collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Apartamento</HCell>
                <HCell>Piso</HCell>
                <HCell>Capacidad</HCell>
                <HCell>Tarifa</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApartamentos.length > 0 ? (
                paginatedApartamentos.map((apartamento, i) => (
                  <TableRow key={apartamento._id} className={classes.tblRow}>
                    <NCell>
                      <Box className={classes.nameWrap}>
                        <Box className={classes.nameAv} style={{ background:avGrad(i) }}>
                          {getTabIcon(apartamento.Tipo)}
                        </Box>
                        <Box>
                          <Typography className={classes.nameText}>Apto {apartamento.NumeroApto}</Typography>
                          <Typography className={classes.nameId}>{apartamento.Tipo}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>{apartamento.Piso}</BCell>
                    <BCell>{apartamento.Capacidad}</BCell>
                    <BCell>{formatTarifa(apartamento.Tarifa)}</BCell>
                    <BCell>
                      <Box className={`${classes.chip} ${apartamento.Estado ? classes.cOn : classes.cOff}`} component="span">
                        {apartamento.Estado
                          ? <><Check  size={10} strokeWidth={2.5}/> Activo</>
                          : <><X      size={10} strokeWidth={2.5}/> Inactivo</>
                        }
                      </Box>
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        <Tooltip title="Editar"       placement="top"><button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(apartamento)}><Edit2  size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Ver detalles" placement="top"><button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleView(apartamento)}><Eye    size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Eliminar"     placement="top"><button className={`${classes.actBtn} ${classes.bDel}`}  onClick={() => handleDelete(apartamento._id)}><Trash2 size={14} strokeWidth={2.2}/></button></Tooltip>
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={6} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron apartamentos que coincidan con la búsqueda." : "No hay apartamentos registrados."}
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
          Mostrando {filteredApartamentos.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredApartamentos.length)} de {filteredApartamentos.length} apartamentos
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
            {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth classes={{ paper:classes.dlgPaper }}
        disablePortal={false} container={document.body}>
        <DlgHdr
          icon={editingId ? <Edit2 size={20} color="#fff" strokeWidth={2.2}/> : <Home size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId ? "Editar Apartamento" : "Nuevo Apartamento"}
          sub={editingId ? "Modifica los datos del apartamento seleccionado" : "Completa los campos para registrar un nuevo apartamento"}
          onClose={handleClose}
        />
        <DialogContent className={classes.dlgBody}>

          {/* Sección 1: Información Básica */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <Home size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información Básica
            </Box>
            <FormControl fullWidth variant="outlined" className={classes.fmField}>
              <InputLabel id="tipo-label">Tipo de Apartamento</InputLabel>
              <Select
                labelId="tipo-label"
                name="Tipo"
                value={formData.Tipo}
                onChange={handleChange}
                label="Tipo de Apartamento"
                fullWidth
              >
                {tipoApartamentos.length > 0 ? (
                  tipoApartamentos.map((tipo) => (
                    <MenuItem key={tipo._id} value={tipo.nombre} disabled={!tipo.estado}
                      style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>
                      {tipo.nombre} {!tipo.estado && "(Inactivo)"}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="Type 1">Type 1</MenuItem>
                    <MenuItem value="Type 2">Type 2</MenuItem>
                    <MenuItem value="Penthouse">Penthouse</MenuItem>
                  </>
                )}
              </Select>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color:T.ink3, marginTop:4, marginLeft:14 }}>{MENSAJES_INSTRUCTIVOS.TIPO}</Typography>
            </FormControl>
            <TextField
              className={classes.fmField}
              margin="dense"
              label="Número de Apartamento"
              name="NumeroApto"
              value={formData.NumeroApto}
              onChange={handleChange}
              onBlur={() => validateField("NumeroApto", formData.NumeroApto)}
              fullWidth
              type="number"
              variant="outlined"
              error={!!formErrors.NumeroApto}
              helperText={formErrors.NumeroApto || MENSAJES_INSTRUCTIVOS.NUMERO_APTO}
              required
              InputProps={{ inputProps: { min: 1, max: 200 } }}
            />
          </Box>

          {/* Sección 2: Ubicación y Tarifa */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                <Building size={13} color={T.t1} strokeWidth={2.5}/>
              </Box>
              Ubicación y Tarifa
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField}
                margin="dense"
                label="Piso"
                name="Piso"
                value={formData.Piso}
                onChange={handleChange}
                onBlur={() => validateField("Piso", formData.Piso)}
                fullWidth
                type="number"
                variant="outlined"
                error={!!formErrors.Piso}
                helperText={formErrors.Piso || MENSAJES_INSTRUCTIVOS.PISO}
                required
                InputProps={{ inputProps: { min: 1, max: 20 } }}
              />
              <TextField
                className={classes.fmField}
                margin="dense"
                label="Capacidad"
                name="Capacidad"
                value={formData.Capacidad === 0 ? "" : formData.Capacidad}
                onChange={handleChange}
                onBlur={() => validateField("Capacidad", formData.Capacidad)}
                fullWidth
                type="number"
                variant="outlined"
                error={!!formErrors.Capacidad}
                helperText={formErrors.Capacidad || MENSAJES_INSTRUCTIVOS.CAPACIDAD}
                required
                InputProps={{ inputProps: { min: 1, max: 6 } }}
              />
            </Box>
            <TextField
              className={classes.fmField}
              margin="dense"
              label="Tarifa"
              name="Tarifa"
              value={formData.Tarifa}
              onChange={handleChange}
              onBlur={() => validateField("Tarifa", formData.Tarifa)}
              fullWidth
              type="number"
              variant="outlined"
              error={!!formErrors.Tarifa}
              helperText={formErrors.Tarifa || MENSAJES_INSTRUCTIVOS.TARIFA}
              required
              InputProps={{
                inputProps: { min: 1 },
                startAdornment:<InputAdornment position="start"><DollarSign size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
              }}
            />
            <FormControl fullWidth variant="outlined" className={classes.fmField}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                name="Estado"
                value={formData.Estado.toString()}
                onChange={handleChange}
                label="Estado"
                fullWidth
              >
                <MenuItem value="true">✅ Activo</MenuItem>
                <MenuItem value="false">❌ Inactivo</MenuItem>
              </Select>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color:T.ink3, marginTop:4, marginLeft:14 }}>{MENSAJES_INSTRUCTIVOS.ESTADO}</Typography>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={classes.btnSubmit} disabled={!isFormValid}>
            <Check size={15} strokeWidth={2.5} style={{ flexShrink:0 }}/>
            {editingId ? "Actualizar Apartamento" : "Crear Apartamento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth
        classes={{ paper:classes.dlgPaperLarge }} disablePortal={false} container={document.body}>
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Apartamento"
          sub="Información completa del apartamento seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedApartamento ? (
            <>
              {/* Hero */}
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>
                  {getTabIcon(selectedApartamento.Tipo)}
                </Box>
                <Typography className={classes.detName}>Apartamento {selectedApartamento.NumeroApto}</Typography>
                <Typography className={classes.detSub}>{selectedApartamento.Tipo}</Typography>
                <Box className={`${classes.chip} ${selectedApartamento.Estado ? classes.cOn : classes.cOff}`}
                  component="span" style={{ marginTop:8 }}>
                  {selectedApartamento.Estado
                    ? <><Check size={11} strokeWidth={2.5}/> Activo</>
                    : <><X     size={11} strokeWidth={2.5}/> Inactivo</>
                  }
                </Box>
              </Box>

              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>

              {/* Info grid */}
              <Box className={classes.detGrid}>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Tipo</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Home size={14} color={T.v1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedApartamento.Tipo}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Piso</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Layers size={14} color={T.t1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedApartamento.Piso}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Capacidad</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Layers size={14} color={T.a1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedApartamento.Capacidad} personas</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Tarifa</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <DollarSign size={14} color={T.t1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{formatTarifa(selectedApartamento.Tarifa)}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Mobiliarios */}
              <Box style={{ display:"flex", alignItems:"center", gap:8, margin:"20px 0 10px", fontFamily:"'Syne',sans-serif", fontSize:".85rem", fontWeight:700, color:T.ink, paddingBottom:8, borderBottom:"1.5px solid rgba(108,63,255,.09)" }}>
                <Box style={{ width:28, height:28, borderRadius:8, background:"rgba(108,63,255,.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <FileText size={13} color={T.v1} strokeWidth={2.5}/>
                </Box>
                Mobiliarios Asociados
              </Box>

              <Box className={classes.mobTblWrap}>
                <TableContainer component={Paper} elevation={0}>
                  <Table style={{ tableLayout:"fixed", width:"100%" }}>
                    <TableHead>
                      <TableRow>
                        {["Nombre","Ident. Mobiliario","Estado","Observación","Última actualización"].map((h, i) => (
                          <TableCell key={i} className={classes.mobHCell}
                            style={{ width:i===0||i===1?"20%":i===2?"15%":i===3?"25%":"20%" }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mobiliarios.filter(mob => mob.estado !== "Inactivo").map((mob) => {
                        const updatedDate = new Date(mob.updatedAt)
                        const currentDate = new Date()
                        const diffTime = currentDate - updatedDate
                        const diffDays = diffTime / (1000 * 60 * 60 * 24)
                        const cellStyle = mob.estado === "Mantenimiento" && diffDays > 1
                          ? { background:"rgba(255,59,130,.08)", color:"#cc2060" } : {}
                        return (
                          <TableRow key={mob._id} className={classes.tblRow}>
                            <TableCell className={classes.mobBCell}>{mob.nombre}</TableCell>
                            <TableCell className={classes.mobBCell}>{mob.identMobiliario}</TableCell>
                            <TableCell className={classes.mobBCell}>{mob.estado}</TableCell>
                            <TableCell className={classes.mobBCell}>{mob.observacion}</TableCell>
                            <TableCell className={classes.mobBCell} style={cellStyle}>
                              {mob.updatedAt ? new Date(mob.updatedAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {mobiliarios.filter(mob => mob.estado !== "Inactivo").length === 0 && (
                        <TableRow style={{ height:80 }}>
                          <TableCell colSpan={5} className={classes.emptyCell}>
                            No hay mobiliarios asociados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          ) : (
            <Typography style={{ fontFamily:"'DM Sans',sans-serif", color:T.ink3, padding:"2rem", textAlign:"center" }}>
              Cargando detalles…
            </Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
          {selectedApartamento && (
            <Button onClick={() => { handleCloseDetails(); handleOpen(selectedApartamento) }} className={classes.btnSubmit}>
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default ApartamentoList