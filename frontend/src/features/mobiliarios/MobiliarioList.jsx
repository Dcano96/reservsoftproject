"use client"

import { useState, useEffect } from "react"
import Typography from "@material-ui/core/Typography"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import MenuItem from "@material-ui/core/MenuItem"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import Paper from "@material-ui/core/Paper"
import Box from "@material-ui/core/Box"
import Tooltip from "@material-ui/core/Tooltip"
import InputAdornment from "@material-ui/core/InputAdornment"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import Menu from "@material-ui/core/Menu"
import Checkbox from "@material-ui/core/Checkbox"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  Plus,
  Package,
  FileText,
  Home,
  Tag,
  Activity,
  Check,
  ArrowLeft,
  ArrowRight,
  Filter,
  AlertTriangle,
  Info,
} from "lucide-react"
import Swal from "sweetalert2"
import mobiliarioService from "./mobiliario.service"
import apartamentoService from "../apartamentos/apartamento.service"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENSAJES INSTRUCTIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MENSAJES_INSTRUCTIVOS = {
  NOMBRE:           "Ingrese el nombre del mobiliario. Solo letras, números y espacios. Ej: Sofá, Cama doble.",
  IDENT_MOBILIARIO: "Ingrese un identificador único para el mobiliario. Ej: MOB-001, S-204.",
  ESTADO:           "Seleccione el estado actual del mobiliario.",
  OBSERVACION:      "Agregue una observación o nota relevante sobre el mobiliario. Mínimo 3 caracteres.",
  APARTAMENTO:      "Seleccione el apartamento al que pertenece este mobiliario.",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS — idénticos a ApartamentoList
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
   SWAL INJECT — idéntico a ApartamentoList
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
   TABLE CELLS — idénticos a ApartamentoList
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
   BOTÓN NATIVO — igual que ApartamentoList
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const btnAddStyle = {
  display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  color:"#fff",
  fontFamily:"'DM Sans',sans-serif", fontWeight:700,
  fontSize:".80rem", letterSpacing:".7px",
  padding:"10px 22px", borderRadius:50,
  border:"none", cursor:"pointer",
  boxShadow:"0 5px 18px rgba(108,63,255,.40)",
  textTransform:"uppercase",
  transition:"all .22s",
  lineHeight:1,
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES — copiados 1:1 de ApartamentoList
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
  sa:{ background:"linear-gradient(145deg,rgba(255,123,44,.10),rgba(245,197,24,.07))", boxShadow:"0 5px 22px rgba(255,123,44,.11)", "&::before":{ background:T.ge } },
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
  filterRow:{ padding:"0 26px 16px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" },
  tblWrap:{ margin:"0 26px 16px", borderRadius:20, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 20px rgba(108,63,255,.07)" },
  tblRow:{ transition:"background .15s", "&:nth-of-type(odd)":{ background:"rgba(244,241,255,.30)" }, "&:hover":{ background:"rgba(108,63,255,.055)" } },
  nameWrap:{ display:"flex", alignItems:"center", gap:10 },
  nameAv:{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 12px rgba(108,63,255,.30)", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"#fff" },
  nameText:{ fontWeight:700, fontSize:".90rem", color:T.ink },
  nameId:{ fontSize:".72rem", color:T.ink4, marginTop:1 },
  chip:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, whiteSpace:"nowrap" },
  cOn:      { background:"rgba(0,212,170,.12)",   color:"#00917a" },
  cOff:     { background:"rgba(255,59,130,.10)",  color:"#cc2060" },
  cMant:    { background:"rgba(255,123,44,.12)",  color:"#c25a00" },
  actWrap:{ display:"flex", justifyContent:"center", gap:5 },
  actBtn:{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", transition:"all .18s", "&:hover":{ transform:"scale(1.14)", boxShadow:"0 4px 14px rgba(0,0,0,.18)" } },
  bEdit:{ background:"linear-gradient(135deg,#00D4AA,#00A3E0)", color:"#fff" },
  bView:{ background:T.gv, color:"#fff" },
  bDel: { background:T.ge, color:"#fff" },
  bBaja:{ background:"linear-gradient(135deg,#FF7B2C,#F5C518)", color:"#fff" },
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
    border:`1px solid ${T.bM}`, width:680, maxWidth:"95vw", maxHeight:"80vh",
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
  detItemFull:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4, gridColumn:"1 / -1" },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  filterChip:{
    display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px",
    borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700,
    cursor:"pointer", border:"1.5px solid transparent", transition:"all .18s",
  },
  filterChipActive:{ background:T.gv, color:"#fff", boxShadow:"0 3px 10px rgba(108,63,255,.30)" },
  filterChipInactive:{ background:"rgba(108,63,255,.07)", color:T.ink3, borderColor:"rgba(108,63,255,.12)" },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MobiliarioList = () => {
  const classes = useStyles()

  /* ── state — idéntico al original ── */
  const [mobiliarios, setMobiliarios] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedMobiliario, setSelectedMobiliario] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    identMobiliario: "",
    estado: "Activo",
    observacion: "",
    apartamento: "",
  })
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [estadoAnchorEl, setEstadoAnchorEl] = useState(null)

  /* ── cargar filtro guardado en localStorage ── */
  useEffect(() => {
    const savedFilter = localStorage.getItem("mobiliarioEstadoFilter")
    if (savedFilter) {
      try { setEstadoFilter(JSON.parse(savedFilter)) }
      catch (error) { console.error("Error al parsear el filtro guardado:", error) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("mobiliarioEstadoFilter", JSON.stringify(estadoFilter))
  }, [estadoFilter])

  /* ── fetchMobiliarios ── */
  const fetchMobiliarios = async () => {
    try {
      const data = await mobiliarioService.getMobiliarios()
      setMobiliarios(data)
    } catch (error) {
      console.error("Error fetching mobiliarios", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los mobiliarios." })
    }
  }

  const fetchApartamentos = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      setApartamentos(data)
    } catch (error) {
      console.error("Error fetching apartments", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los apartamentos." })
    }
  }

  useEffect(() => { fetchMobiliarios(); fetchApartamentos() }, [])

  /* ── handleOpen — idéntico al original ── */
  const handleOpen = (mobiliario) => {
    if (mobiliario) {
      setFormData({
        nombre: mobiliario.nombre || "",
        identMobiliario: mobiliario.identMobiliario || "",
        estado: mobiliario.estado || "Activo",
        observacion: mobiliario.observacion || "",
        apartamento:
          typeof mobiliario.apartamento === "object" && mobiliario.apartamento !== null
            ? mobiliario.apartamento._id
            : mobiliario.apartamento || "",
      })
      setEditingId(mobiliario._id)
    } else {
      setFormData({ nombre:"", identMobiliario:"", estado:"Activo", observacion:"", apartamento:"" })
      setEditingId(null)
    }
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleDetails = (mobiliario) => {
    setSelectedMobiliario(mobiliario)
    setDetailsOpen(true)
  }
  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setSelectedMobiliario(null)
  }

  /* ── handleChange — idéntico al original ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    let errorMessage = ""

    if (name === "nombre") {
      if (!value.trim()) errorMessage = "El nombre es requerido"
      else if (value.trim().length < 3) errorMessage = "El nombre debe tener al menos 3 caracteres"
      else if (value.trim().length > 50) errorMessage = "El nombre debe tener máximo 50 caracteres"
      else if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(value)) errorMessage = "No se permiten caracteres especiales"
    }
    if (name === "identMobiliario") {
      if (!value.trim()) errorMessage = "La identificación es requerida"
      else if (value.trim().length < 3) errorMessage = "La identificación debe tener al menos 3 caracteres"
      else if (value.trim().length > 20) errorMessage = "La identificación debe tener máximo 20 caracteres"
      else {
        const duplicate = mobiliarios.find((m) => m.identMobiliario === value && m._id !== editingId)
        if (duplicate) errorMessage = "Ya existe un mobiliario con esta identificación"
        const specialChars = value.replace(/[a-zA-Z0-9\s]/g, "")
        if (specialChars.length > 2) errorMessage = "No se permiten más de 2 caracteres especiales"
      }
    }
    if (name === "observacion") {
      if (!value.trim()) errorMessage = "La observación es requerida"
      else if (value.trim().length < 3) errorMessage = "La observación debe tener al menos 3 caracteres"
      else if (value.trim().length > 500) errorMessage = "La observación debe tener máximo 500 caracteres"
    }
    if (name === "apartamento" && !value) errorMessage = "El apartamento es requerido"

    setErrors((prev) => ({ ...prev, [name]: errorMessage }))
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ── handleSubmit — idéntico al original ── */
  const handleSubmit = async () => {
    const newErrors = {}
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido."
    else if (formData.nombre.trim().length < 3) newErrors.nombre = "El nombre debe tener al menos 3 caracteres."
    else if (formData.nombre.trim().length > 50) newErrors.nombre = "El nombre debe tener máximo 50 caracteres."
    else if (/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/.test(formData.nombre)) newErrors.nombre = "No se permiten caracteres especiales en el nombre."
    if (!formData.identMobiliario.trim()) newErrors.identMobiliario = "La identificación es requerida."
    else {
      const specialChars = formData.identMobiliario.replace(/[a-zA-Z0-9\s]/g, "")
      if (specialChars.length > 2) newErrors.identMobiliario = "No se permiten más de 2 caracteres especiales."
    }
    if (editingId && !formData.estado.trim()) newErrors.estado = "El estado es requerido."
    if (!formData.observacion.trim()) newErrors.observacion = "La observación es requerida."
    else if (formData.observacion.trim().length < 3) newErrors.observacion = "La observación debe tener al menos 3 caracteres."
    else if (formData.observacion.trim().length > 500) newErrors.observacion = "La observación debe tener máximo 500 caracteres."
    if (!formData.apartamento.trim()) newErrors.apartamento = "El apartamento es requerido."
    const duplicate = mobiliarios.find((m) => m.identMobiliario === formData.identMobiliario && m._id !== editingId)
    if (duplicate) newErrors.identMobiliario = "Ya existe un mobiliario con esa identificación."
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    try {
      if (editingId) {
        await mobiliarioService.updateMobiliario(editingId, formData)
        Swal.fire({ ...SW, icon:"success", title:"Actualizado", text:"El mobiliario se actualizó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      } else {
        await mobiliarioService.createMobiliario(formData)
        Swal.fire({ ...SW, icon:"success", title:"Creado", text:"El mobiliario se creó correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
      }
      setErrors({})
      fetchMobiliarios()
      handleClose()
    } catch (error) {
      console.error("Error saving mobiliario", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al guardar el mobiliario." })
    }
  }

  /* ── handleDarDeBaja — idéntico al original ── */
  const handleDarDeBaja = async (id, estado) => {
    if (estado === "Inactivo") {
      Swal.fire({ ...SW, icon:"warning", title:"Acción no permitida", text:"Este mobiliario ya está inactivo." })
      return
    }
    const { value: motivo } = await Swal.fire({
      ...SWD,
      title:"Dar de baja", text:"Ingrese el motivo para dar de baja este mobiliario:",
      icon:"warning", input:"text", inputPlaceholder:"Motivo de baja",
      showCancelButton:true, confirmButtonText:"Dar de baja", cancelButtonText:"Cancelar",
      inputValidator:(value) => { if (!value) return "El motivo es obligatorio" },
    })
    if (motivo) {
      try {
        const mobiliarioActual = mobiliarios.find((m) => m._id === id)
        if (!mobiliarioActual) {
          Swal.fire({ ...SW, icon:"error", title:"Error", text:"Mobiliario no encontrado." })
          return
        }
        const updatedPayload = {
          nombre: mobiliarioActual.nombre,
          identMobiliario: mobiliarioActual.identMobiliario,
          estado: "Inactivo",
          observacion: motivo,
          apartamento:
            typeof mobiliarioActual.apartamento === "object" && mobiliarioActual.apartamento !== null
              ? mobiliarioActual.apartamento._id
              : mobiliarioActual.apartamento || "",
        }
        await mobiliarioService.updateMobiliario(id, updatedPayload)
        Swal.fire({ ...SW, icon:"success", title:"Dado de baja", text:"El mobiliario se ha dado de baja correctamente.", timer:2200, timerProgressBar:true, showConfirmButton:false })
        fetchMobiliarios()
      } catch (error) {
        console.error("Error dando de baja mobiliario", error)
        Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al dar de baja el mobiliario." })
      }
    }
  }

  /* ── filter + paginate — idéntico al original ── */
  const filteredMobiliarios = mobiliarios.filter((m) => {
    const searchMatch =
      m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.identMobiliario?.toLowerCase().includes(searchTerm.toLowerCase())
    const estadoMatch = estadoFilter.length > 0 ? estadoFilter.includes(m.estado) : true
    return searchMatch && estadoMatch
  })
  const paginatedMobiliarios = filteredMobiliarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredMobiliarios.length / rowsPerPage))

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(Number.parseInt(e.target.value, 10)); setPage(0) }

  /* ── filtro menú ── */
  const handleEstadoHeaderClick = (e) => setEstadoAnchorEl(e.currentTarget)
  const handleEstadoClose = () => setEstadoAnchorEl(null)
  const handleToggleEstado = (estado) => {
    setEstadoFilter(prev => prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado])
  }

  /* ── stats ── */
  const totalActivo      = mobiliarios.filter(m => m.estado === "Activo").length
  const totalInactivo    = mobiliarios.filter(m => m.estado === "Inactivo").length
  const totalMant        = mobiliarios.filter(m => m.estado === "Mantenimiento").length

  /* ── chip helpers ── */
  const estadoChipClass = (estado) => {
    if (estado === "Activo")       return classes.cOn
    if (estado === "Inactivo")     return classes.cOff
    if (estado === "Mantenimiento") return classes.cMant
    return ""
  }
  const estadoChipIcon = (estado) => {
    if (estado === "Activo")        return <><Check size={10} strokeWidth={2.5}/> Activo</>
    if (estado === "Inactivo")      return <><X     size={10} strokeWidth={2.5}/> Inactivo</>
    if (estado === "Mantenimiento") return <><AlertTriangle size={10} strokeWidth={2.5}/> Mantenimiento</>
    return estado
  }

  /* ── associated apartment (for details) ── */
  const associatedApt =
    selectedMobiliario?.apartamento
      ? typeof selectedMobiliario.apartamento === "object"
        ? selectedMobiliario.apartamento
        : apartamentos.find((apt) => apt._id === selectedMobiliario.apartamento)
      : null

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
          <Box className={classes.hdrIcon}><Package size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Mobiliarios</Typography>
            <Typography className={classes.hdrSub}>Administra los mobiliarios del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label:"Total",         val:mobiliarios.length, sub:"registrados",   c:classes.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Activos",       val:totalActivo,        sub:"habilitados",   c:classes.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Inactivos",     val:totalInactivo,      sub:"desactivados",  c:classes.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
          { label:"Mantenimiento", val:totalMant,          sub:"en revisión",   c:classes.sa, orb:"#FF7B2C", col:"#c25a00", sc:"#c25a00" },
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
            placeholder="Buscar por nombre, identificación…"
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
          <Package size={16} strokeWidth={2.2}/>
          Nuevo Mobiliario
        </button>
      </Box>

      {/* FILTRO DE ESTADO */}
      <Box className={classes.filterRow}>
        <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".80rem", color:T.ink3, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
          <Filter size={13} strokeWidth={2.5}/> Filtrar por estado:
        </Typography>
        {["Activo", "Inactivo", "Mantenimiento"].map(estado => (
          <Box
            key={estado}
            className={`${classes.filterChip} ${estadoFilter.includes(estado) ? classes.filterChipActive : classes.filterChipInactive}`}
            onClick={() => handleToggleEstado(estado)}
          >
            {estadoChipIcon(estado)}
          </Box>
        ))}
        {estadoFilter.length > 0 && (
          <Box
            onClick={() => setEstadoFilter([])}
            style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:600, color:T.ink4, cursor:"pointer", background:"rgba(108,63,255,.04)", border:"1.5px solid rgba(108,63,255,.10)", transition:"all .15s" }}
          >
            <X size={10} strokeWidth={2.5}/> Limpiar
          </Box>
        )}
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table style={{ borderCollapse:"collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Mobiliario</HCell>
                <HCell>Identificación</HCell>
                <HCell>Estado</HCell>
                <HCell>Observación</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMobiliarios.length > 0 ? (
                paginatedMobiliarios.map((mob, i) => (
                  <TableRow key={mob._id} className={classes.tblRow}>
                    <NCell>
                      <Box className={classes.nameWrap}>
                        <Box className={classes.nameAv} style={{ background:avGrad(i) }}>
                          <Package size={16} strokeWidth={2.2}/>
                        </Box>
                        <Box>
                          <Typography className={classes.nameText}>{mob.nombre}</Typography>
                          <Typography className={classes.nameId}>{mob.identMobiliario}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>{mob.identMobiliario}</BCell>
                    <BCell>
                      <Box className={`${classes.chip} ${estadoChipClass(mob.estado)}`} component="span">
                        {estadoChipIcon(mob.estado)}
                      </Box>
                    </BCell>
                    <BCell style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {mob.observacion?.length > 35 ? `${mob.observacion.substring(0, 35)}…` : mob.observacion}
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        <Tooltip title="Editar"      placement="top"><button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(mob)}><Edit2 size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Ver detalles" placement="top"><button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleDetails(mob)}><Eye   size={14} strokeWidth={2.2}/></button></Tooltip>
                        <Tooltip title="Dar de baja"  placement="top"><button className={`${classes.actBtn} ${classes.bBaja}`} onClick={() => handleDarDeBaja(mob._id, mob.estado)} disabled={mob.estado === "Inactivo"} style={{ opacity:mob.estado === "Inactivo" ? .4 : 1 }}><AlertTriangle size={14} strokeWidth={2.2}/></button></Tooltip>
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={5} className={classes.emptyCell}>
                    {searchTerm || estadoFilter.length > 0 ? "No se encontraron mobiliarios que coincidan con la búsqueda." : "No hay mobiliarios registrados."}
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
          Mostrando {filteredMobiliarios.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredMobiliarios.length)} de {filteredMobiliarios.length} mobiliarios
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
        disablePortal={false} container={typeof document !== "undefined" ? document.body : undefined}>
        <DlgHdr
          icon={editingId ? <Edit2 size={20} color="#fff" strokeWidth={2.2}/> : <Package size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId ? "Editar Mobiliario" : "Nuevo Mobiliario"}
          sub={editingId ? "Modifica los datos del mobiliario seleccionado" : "Completa los campos para registrar un nuevo mobiliario"}
          onClose={handleClose}
        />
        <DialogContent className={classes.dlgBody}>

          {/* Sección 1: Información del Mobiliario */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <Package size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información del Mobiliario
            </Box>
            <TextField
              className={classes.fmField}
              margin="dense"
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.nombre}
              helperText={errors.nombre || MENSAJES_INSTRUCTIVOS.NOMBRE}
              required
              InputProps={{
                startAdornment:<InputAdornment position="start"><Package size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
              }}
            />
            <TextField
              className={classes.fmField}
              margin="dense"
              label="Identificación del Mobiliario"
              name="identMobiliario"
              value={formData.identMobiliario}
              onChange={handleChange}
              onBlur={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.identMobiliario}
              helperText={errors.identMobiliario || MENSAJES_INSTRUCTIVOS.IDENT_MOBILIARIO}
              required
              InputProps={{
                startAdornment:<InputAdornment position="start"><Tag size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
              }}
            />
          </Box>

          {/* Sección 2: Estado y Observaciones */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                <Activity size={13} color={T.t1} strokeWidth={2.5}/>
              </Box>
              Estado y Observaciones
            </Box>
            {editingId && (
              <FormControl fullWidth variant="outlined" className={classes.fmField}>
                <InputLabel id="estado-mob-label">Estado</InputLabel>
                <Select
                  labelId="estado-mob-label"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  label="Estado"
                  fullWidth
                >
                  <MenuItem value="Activo">✅ Activo</MenuItem>
                  <MenuItem value="Inactivo">❌ Inactivo</MenuItem>
                  <MenuItem value="Mantenimiento">🔧 Mantenimiento</MenuItem>
                </Select>
                <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color:T.ink3, marginTop:4, marginLeft:14 }}>{MENSAJES_INSTRUCTIVOS.ESTADO}</Typography>
              </FormControl>
            )}
            <TextField
              className={classes.fmField}
              margin="dense"
              label="Observación"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              onBlur={handleChange}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              error={!!errors.observacion}
              helperText={errors.observacion || MENSAJES_INSTRUCTIVOS.OBSERVACION}
              required
              InputProps={{
                startAdornment:<InputAdornment position="start"><FileText size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>
              }}
            />
          </Box>

          {/* Sección 3: Ubicación */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(37,99,235,.12)" }}>
                <Home size={13} color={T.b1} strokeWidth={2.5}/>
              </Box>
              Ubicación
            </Box>
            <FormControl fullWidth variant="outlined" className={classes.fmField}>
              <InputLabel id="apto-label">Apartamento</InputLabel>
              <Select
                labelId="apto-label"
                name="apartamento"
                value={formData.apartamento}
                onChange={handleChange}
                label="Apartamento"
                fullWidth
                error={!!errors.apartamento}
              >
                {apartamentos.length > 0 ? (
                  apartamentos.map((apt) => (
                    <MenuItem key={apt._id} value={apt._id} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>
                      {`Apartamento ${apt.NumeroApto} (Piso ${apt.Piso})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No hay apartamentos disponibles</MenuItem>
                )}
              </Select>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color: errors.apartamento ? "#ef4444" : T.ink3, marginTop:4, marginLeft:14 }}>
                {errors.apartamento || MENSAJES_INSTRUCTIVOS.APARTAMENTO}
              </Typography>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            className={classes.btnSubmit}
            disabled={Object.values(errors).some(e => e !== "")}
          >
            <Check size={15} strokeWidth={2.5} style={{ flexShrink:0 }}/>
            {editingId ? "Actualizar Mobiliario" : "Crear Mobiliario"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth
        classes={{ paper:classes.dlgPaperLarge }} disablePortal={false} container={typeof document !== "undefined" ? document.body : undefined}>
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Mobiliario"
          sub="Información completa del mobiliario seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedMobiliario ? (
            <>
              {/* Hero */}
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>
                  <Package size={32} color="#fff" strokeWidth={2}/>
                </Box>
                <Typography className={classes.detName}>{selectedMobiliario.nombre}</Typography>
                <Typography className={classes.detSub}>{selectedMobiliario.identMobiliario}</Typography>
                <Box className={`${classes.chip} ${estadoChipClass(selectedMobiliario.estado)}`}
                  component="span" style={{ marginTop:8 }}>
                  {estadoChipIcon(selectedMobiliario.estado)}
                </Box>
              </Box>

              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>

              {/* Info grid */}
              <Box className={classes.detGrid}>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Identificación</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Tag size={14} color={T.v1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>{selectedMobiliario.identMobiliario}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Apartamento</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Home size={14} color={T.b1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>
                      {associatedApt
                        ? `Apto ${associatedApt.NumeroApto} — Piso ${associatedApt.Piso}`
                        : "No asignado"}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Creado</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Activity size={14} color={T.t1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>
                      {selectedMobiliario.createdAt ? new Date(selectedMobiliario.createdAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Última actualización</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Activity size={14} color={T.a1} strokeWidth={2.2}/>
                    <Typography className={classes.detVal}>
                      {selectedMobiliario.updatedAt ? new Date(selectedMobiliario.updatedAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItemFull}>
                  <Typography className={classes.detLbl}>Observación</Typography>
                  <Box style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                    <FileText size={14} color={T.ink3} strokeWidth={2.2} style={{ marginTop:2, flexShrink:0 }}/>
                    <Typography className={classes.detVal} style={{ whiteSpace:"pre-wrap", fontWeight:500 }}>
                      {selectedMobiliario.observacion || "Sin observaciones"}
                    </Typography>
                  </Box>
                </Box>
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
          {selectedMobiliario && selectedMobiliario.estado !== "Inactivo" && (
            <Button onClick={() => { handleCloseDetails(); handleOpen(selectedMobiliario) }} className={classes.btnSubmit}>
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default MobiliarioList