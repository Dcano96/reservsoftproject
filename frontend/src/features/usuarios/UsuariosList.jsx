"use client"

import { useState, useEffect, useRef } from "react"
import Typography from "@material-ui/core/Typography"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import Paper from "@material-ui/core/Paper"
import Box from "@material-ui/core/Box"
import TablePagination from "@material-ui/core/TablePagination"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import Avatar from "@material-ui/core/Avatar"
import InputAdornment from "@material-ui/core/InputAdornment"
import Chip from "@material-ui/core/Chip"
import MenuItem from "@material-ui/core/MenuItem"
import {
  Edit2,
  Trash2,
  Info,
  X,
  Search,
  UserPlus,
  Check,
  Eye,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  FileText,
  Tag,
  Users,
} from "lucide-react"
import Person from "@material-ui/icons/Person"
import Email from "@material-ui/icons/Email"
import AssignmentInd from "@material-ui/icons/AssignmentInd"
import AccountCircle from "@material-ui/icons/AccountCircle"
import ContactMail from "@material-ui/icons/ContactMail"
import PermIdentity from "@material-ui/icons/PermIdentity"
import VpnKey from "@material-ui/icons/VpnKey"
import Swal from "sweetalert2"
import usuarioService from "./usuarios.service"
import rolesService from "../roles/roles.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VALIDACIONES — idénticas al original
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
  DOCUMENTO:  { MIN_LENGTH:6,  MAX_LENGTH:15 },
  NOMBRE:     { MIN_LENGTH:6,  MAX_LENGTH:30 },
  TELEFONO:   { MIN_LENGTH:7,  MAX_LENGTH:10 },
  CONTRASENA: { MIN_LENGTH:8,  MAX_LENGTH:15 },
}
const MENSAJES_INSTRUCTIVOS = {
  DOCUMENTO: "Ingrese un número de documento entre 6 y 15 dígitos, solo números.",
  NOMBRE:    "Ingrese nombre completo entre 6 y 30 caracteres, solo letras y espacios.",
  TELEFONO:  "Ingrese un número telefónico entre 7 y 10 dígitos, solo números.",
  EMAIL:     "Ingresa tu email (formato: usuario@dominio.com)",
  PASSWORD:  "La contraseña debe tener entre 8 y 15 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.",
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
    .rs-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
      background:linear-gradient(135deg,#6C3FFF,#C040FF);}
    .rs-pop.rs-danger::before{background:linear-gradient(135deg,#FF3B82,#FF7B2C);}
    .rs-ttl{font-family:'Syne',sans-serif!important;font-weight:800!important;font-size:1.18rem!important;
      color:#0C0A14!important;letter-spacing:-.3px!important;}
    .rs-bod{font-size:.88rem!important;color:#6B5E87!important;line-height:1.6!important;}
    .rs-ok{background:linear-gradient(135deg,#6C3FFF,#C040FF)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:700!important;
      font-size:.82rem!important;padding:10px 28px!important;box-shadow:0 4px 16px rgba(108,63,255,.38)!important;
      cursor:pointer!important;transition:all .2s!important;}
    .rs-ok:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(108,63,255,.50)!important;}
    .rs-pop.rs-danger .rs-ok{background:linear-gradient(135deg,#FF3B82,#FF7B2C)!important;
      box-shadow:0 4px 16px rgba(255,59,130,.34)!important;}
    .rs-cn{background:rgba(108,63,255,.07)!important;color:#6B5E87!important;
      border:1px solid rgba(108,63,255,.16)!important;border-radius:50px!important;
      font-family:'DM Sans',sans-serif!important;font-weight:600!important;
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
  sb:{ background:"linear-gradient(145deg,rgba(37,99,235,.10),rgba(124,58,237,.07))", boxShadow:"0 5px 22px rgba(37,99,235,.11)", "&::before":{ background:T.gb } },
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
  searchInput:{ border:"none", outline:"none", background:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, width:"100%", "&::placeholder":{ color:T.ink4 } },
  kbd:{ fontSize:10, color:T.ink4, background:"rgba(108,63,255,0.07)", borderRadius:6, padding:"2px 7px", whiteSpace:"nowrap" },
  addBtn:{
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    fontSize:".80rem !important", letterSpacing:".7px",
    padding:"10px 22px !important", borderRadius:"50px !important",
    boxShadow:"0 5px 18px rgba(108,63,255,.40) !important", transition:"all .22s !important",
    textTransform:"uppercase",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 9px 26px rgba(108,63,255,.52) !important" },
  },
  tblWrap:{ margin:"0 26px 16px", borderRadius:20, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 20px rgba(108,63,255,.07)" },
  tblRow:{ transition:"background .15s", "&:nth-of-type(odd)":{ background:"rgba(244,241,255,.30)" }, "&:hover":{ background:"rgba(108,63,255,.055)" } },
  nameWrap:{ display:"flex", alignItems:"center", gap:10 },
  nameAv:{ width:36, height:36, borderRadius:12, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 12px rgba(108,63,255,.30)", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"#fff" },
  nameText:{ fontWeight:700, fontSize:".90rem", color:T.ink },
  nameId:{ fontSize:".72rem", color:T.ink4, marginTop:1 },
  chip:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, whiteSpace:"nowrap" },
  cOn:  { background:"rgba(0,212,170,.12)", color:"#00917a" },
  cOff: { background:"rgba(255,59,130,.10)", color:"#cc2060" },
  cRole:{ background:"rgba(108,63,255,.10)", color:"#5929d9", border:`1px solid rgba(108,63,255,.16)` },
  cNoRole:{ background:"rgba(176,165,200,.15)", color:T.ink3 },
  actWrap:{ display:"flex", justifyContent:"center", gap:5 },
  actBtn:{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", transition:"all .18s", "&:hover":{ transform:"scale(1.14)", boxShadow:"0 4px 14px rgba(0,0,0,.18)" } },
  bEdit:  { background:"linear-gradient(135deg,#00D4AA,#00A3E0)", color:"#fff" },
  bView:  { background:T.gv, color:"#fff" },
  bRole:  { background:"linear-gradient(135deg,#FF7B2C,#F5C518)", color:"#fff" },
  bDel:   { background:T.ge, color:"#fff" },
  bGhost: { visibility:"hidden", background:"transparent" },
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
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 26px !important",
    boxShadow:"0 4px 14px rgba(108,63,255,.38) !important", transition:"all .2s !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(108,63,255,.50) !important" },
  },
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0 18px" },
  detAv:{ width:76, height:76, borderRadius:22, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#fff" },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:4, textAlign:"center" },
  detRole:{ fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", color:T.ink3, textAlign:"center" },
  detDivider:{ margin:"14px 0", background:T.bL },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  detValMono:{ fontFamily:"monospace", fontSize:".78rem", color:T.ink3 },
  container:{ fontFamily:"'DM Sans',sans-serif" },
  errorMessage:{ fontSize:".90rem", color:"#ef4444", fontWeight:500, marginTop:4 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const UsuarioList = () => {
  const cls = useStyles()

  const [usuarios,        setUsuarios]        = useState([])
  const [open,            setOpen]            = useState(false)
  const [detailsOpen,     setDetailsOpen]     = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [editingId,       setEditingId]       = useState(null)
  const [formData,        setFormData]        = useState({ nombre:"", documento:"", email:"", telefono:"", password:"", rol:"", estado:true })
  const [formErrors,      setFormErrors]      = useState({ nombre:"", documento:"", email:"", telefono:"", password:"", rol:"" })
  const [searchTerm,      setSearchTerm]      = useState("")
  const [page,            setPage]            = useState(0)
  const [rowsPerPage,     setRowsPerPage]     = useState(5)
  const [availableRoles,  setAvailableRoles]  = useState([])
  const [fieldValidation, setFieldValidation] = useState({ documento:false, nombre:false, telefono:false, email:false, password:false, rol:false })
  const [touched,         setTouched]         = useState({ documento:false, nombre:false, telefono:false, email:false, password:false, rol:false })

  const documentoRef = useRef(null)
  const nombreRef    = useRef(null)
  const telefonoRef  = useRef(null)
  const emailRef     = useRef(null)
  const passwordRef  = useRef(null)
  const rolRef       = useRef(null)
  const estadoRef    = useRef(null)

  const fetchUsuarios = async () => {
    try { const data = await usuarioService.getUsuarios(); setUsuarios(data) }
    catch(e) { console.error("Error fetching usuarios",e); Swal.fire({...SW,icon:"error",title:"Error",text:"No se pudieron cargar los usuarios."}) }
  }
  const fetchAvailableRoles = async () => {
    try {
      const rolesData = await rolesService.getRoles()
      if (Array.isArray(rolesData) && rolesData.length > 0) setAvailableRoles(rolesData)
      else setAvailableRoles([])
    } catch(e) { console.error("Error fetching roles:",e); setAvailableRoles([]) }
  }
  useEffect(() => { fetchUsuarios(); fetchAvailableRoles() }, [])

  const isAdminUser = u => u.documento==="1152458310" && u.nombre==="David Andres Goez Cano"
  const getInitials = name => name.split(" ").map(w=>w[0]).join("").toUpperCase().substring(0,2)

  /* ━━━━━━━━ VALIDATION FUNCTIONS — identical to original ━━━━━━━━ */
  const validarDocumento = v => {
    if(!v) return "El documento es obligatorio"
    if(v.trim()==="") return "El documento no puede estar vacío"
    if(!REGEX.SOLO_NUMEROS.test(v)) return "El documento debe contener solo números"
    if(v.length<VALIDACION.DOCUMENTO.MIN_LENGTH) return `El documento debe tener al menos ${VALIDACION.DOCUMENTO.MIN_LENGTH} dígitos`
    if(v.length>VALIDACION.DOCUMENTO.MAX_LENGTH) return `El documento no puede tener más de ${VALIDACION.DOCUMENTO.MAX_LENGTH} dígitos`
    if(REGEX.CARACTERES_REPETIDOS.test(v)) return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
    if(REGEX.SECUENCIAS_NUMERICAS.test(v)) return "El documento no puede contener secuencias numéricas obvias"
    if(/^0+$/.test(v)) return "El documento no puede contener solo ceros"
    if(parseInt(v)<1000) return "El documento no parece válido (valor muy bajo)"
    return ""
  }
  const validarNombre = v => {
    if(!v) return "El nombre es obligatorio"
    if(v.trim()==="") return "El nombre no puede estar vacío"
    if(!REGEX.SOLO_LETRAS_ESPACIOS.test(v)) return "El nombre solo debe contener letras y espacios"
    if(v.length<VALIDACION.NOMBRE.MIN_LENGTH) return `El nombre debe tener al menos ${VALIDACION.NOMBRE.MIN_LENGTH} caracteres`
    if(v.length>VALIDACION.NOMBRE.MAX_LENGTH) return `El nombre no puede tener más de ${VALIDACION.NOMBRE.MAX_LENGTH} caracteres`
    if(/\s{2,}/.test(v)) return "El nombre no puede contener espacios múltiples consecutivos"
    const palabras = v.trim().split(/\s+/)
    if(palabras.length<2) return "Debe ingresar al menos nombre y apellido"
    for(const p of palabras) if(p.length<2) return "Cada palabra del nombre debe tener al menos 2 caracteres"
    for(const x of ["admin","usuario","test","prueba","administrador"]) if(v.toLowerCase().includes(x)) return "El nombre contiene palabras no permitidas"
    return ""
  }
  const validarTelefono = v => {
    if(!v) return "El teléfono es obligatorio"
    if(v.trim()==="") return "El teléfono no puede estar vacío"
    if(!REGEX.SOLO_NUMEROS.test(v)) return "El teléfono debe contener solo números"
    if(v.length<VALIDACION.TELEFONO.MIN_LENGTH) return `El teléfono debe tener al menos ${VALIDACION.TELEFONO.MIN_LENGTH} dígitos`
    if(v.length>VALIDACION.TELEFONO.MAX_LENGTH) return `El teléfono no puede tener más de ${VALIDACION.TELEFONO.MAX_LENGTH} dígitos`
    if(REGEX.SECUENCIAS_NUMERICAS.test(v)) return "El teléfono no puede contener secuencias numéricas obvias"
    if(/^0+$/.test(v)) return "El teléfono no puede contener solo ceros"
    if(["123","911","112","119"].includes(v)) return "No se permite el uso de números de emergencia"
    return ""
  }
  const validarEmail = em => {
    if(!em) return "El correo electrónico es obligatorio"
    if(em.trim()==="") return "El correo electrónico no puede estar vacío"
    if(!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"
    if(REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos"
    if(em.length<6) return "El correo debe tener al menos 6 caracteres"
    if(em.length>50) return "El correo no puede tener más de 50 caracteres"
    const [local,domain] = em.split("@")
    if(!local||local.length<1) return "La parte local del correo no puede estar vacía"
    if(local.length>64) return "La parte local del correo es demasiado larga"
    if(/^[.-]|[.-]$/.test(local)) return "La parte local no puede comenzar ni terminar con puntos o guiones"
    if(!domain||!domain.includes(".")) return "El dominio del correo debe incluir una extensión"
    const dParts = domain.split(".")
    for(const p of dParts) if(p.length===0||!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(p)) return "El dominio del correo contiene partes inválidas"
    const tld = dParts[dParts.length-1]
    if(!tld||tld.length<2||tld.length>6||!/^[a-zA-Z]+$/.test(tld)) return "La extensión del dominio no es válida"
    for(const d of ["tempmail","mailinator","guerrillamail","10minutemail","yopmail"]) if(domain.toLowerCase().includes(d)) return "No se permiten correos de servicios temporales"
    return ""
  }
  const validarPassword = (pw,nombre="",doc="",email="") => {
    if(!pw) return "La contraseña es obligatoria"
    if(pw.length<8) return "La contraseña debe tener al menos 8 caracteres"
    if(pw.length>15) return "La contraseña no puede tener más de 15 caracteres"
    if(!/[a-z]/.test(pw)) return "La contraseña debe contener al menos una letra minúscula"
    if(!/[A-Z]/.test(pw)) return "La contraseña debe contener al menos una letra mayúscula"
    if(!/[0-9]/.test(pw)) return "La contraseña debe contener al menos un número"
    if(!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return "La contraseña debe contener al menos un carácter especial"
    if(REGEX.SECUENCIAS_COMUNES.test(pw)) return "La contraseña no puede contener secuencias comunes"
    if(REGEX.CARACTERES_REPETIDOS.test(pw)) return "La contraseña no puede contener más de 3 caracteres repetidos"
    if(/qwert|asdfg|zxcvb|12345|09876/.test(pw.toLowerCase())) return "La contraseña no puede contener secuencias de teclado"
    if(nombre){ const parts=nombre.toLowerCase().split(/\s+/); for(const p of parts) if(p.length>2&&pw.toLowerCase().includes(p)) return "La contraseña no puede contener partes de tu nombre" }
    if(doc&&pw.includes(doc)) return "La contraseña no puede contener tu número de documento"
    if(email){ const ep=email.split("@")[0].toLowerCase(); if(ep.length>2&&pw.toLowerCase().includes(ep)) return "La contraseña no puede contener partes de tu correo" }
    return ""
  }
  const validarRol = v => (!v||v.trim()==="") ? "Debe seleccionar un rol para el usuario" : ""

  const validateField = (name, value) => {
    let error = ""; const isEditing=!!editingId
    switch(name){
      case "documento": error=validarDocumento(value); break
      case "nombre":    error=validarNombre(value); break
      case "telefono":  error=validarTelefono(value); break
      case "email":     error=validarEmail(value); break
      case "password":  error=(isEditing&&!value)?"":validarPassword(value,formData.nombre,formData.documento,formData.email); break
      case "rol":       error=validarRol(value); break
    }
    setFormErrors(p=>({...p,[name]:error}))
    setFieldValidation(p=>({...p,[name]:!error}))
    return !error
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX: handleFieldBlur guarda con !open para
     ignorar el blur que se dispara cuando el
     Dialog está en proceso de cerrarse.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleFieldBlur = e => {
    if (!open) return
    const{name,value}=e.target
    setTouched(p=>({...p,[name]:true}))
    if(name==="email"){ const er=validarEmail(value); setFormErrors(p=>({...p,email:er})); setFieldValidation(p=>({...p,email:!er})) }
    else if(name==="password"){ if(editingId&&!value){setFormErrors(p=>({...p,password:""}));setFieldValidation(p=>({...p,password:true}))}else{const er=validarPassword(value,formData.nombre,formData.documento,formData.email);setFormErrors(p=>({...p,password:er}));setFieldValidation(p=>({...p,password:!er}))}}
    else validateField(name,value)
  }

  const handleKeyDown = (e,next) => {
    const{name,value}=e.target
    if(e.key==="Enter"||e.key==="Tab"){
      e.preventDefault()
      let ok=false
      if(name==="email"){const er=validarEmail(value);setFormErrors(p=>({...p,email:er}));setFieldValidation(p=>({...p,email:!er}));ok=!er}
      else if(name==="password"){if(editingId&&!value){setFormErrors(p=>({...p,password:""}));setFieldValidation(p=>({...p,password:true}));ok=true}else{const er=validarPassword(value,formData.nombre,formData.documento,formData.email);setFormErrors(p=>({...p,password:er}));setFieldValidation(p=>({...p,password:!er}));ok=!er}}
      else ok=validateField(name,value)
      if(ok&&next){
        const map={nombre:nombreRef,telefono:telefonoRef,email:emailRef,password:passwordRef,rol:rolRef,estado:estadoRef}
        map[next]?.current?.focus()
      }
    }
  }

  const handleChange = e => {
    const{name,value}=e.target
    setTouched(p=>({...p,[name]:true}))
    let val=value
    if(name==="nombre"){ if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) return }
    else if(name==="documento"){ if(!/^[0-9]*$/.test(value)) return; if(value.length>VALIDACION.DOCUMENTO.MAX_LENGTH) val=value.substring(0,VALIDACION.DOCUMENTO.MAX_LENGTH) }
    else if(name==="telefono"){ if(!/^[0-9]*$/.test(value)) return; if(value.length>VALIDACION.TELEFONO.MAX_LENGTH) val=value.substring(0,VALIDACION.TELEFONO.MAX_LENGTH) }
    else if(name==="email"){
      if(!/^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/.test(value)) return
      if(value.includes("@@")||value.includes("..")||value.includes(".@")||value.includes("@.")) return
      if((value.match(/@/g)||[]).length>1) return
    }
    else if(name==="password"&&value.length>VALIDACION.CONTRASENA.MAX_LENGTH) val=value.substring(0,VALIDACION.CONTRASENA.MAX_LENGTH)

    if(editingId&&isAdminUser(formData)&&name==="email"&&val!==formData.email){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede modificar el correo electrónico del usuario administrador"}); return }
    if(editingId&&isAdminUser(formData)&&name==="estado"&&val===false){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede desactivar al usuario administrador"}); return }

    setFormData(p=>({...p,[name]:val}))
    let error=""
    switch(name){
      case "documento": error=validarDocumento(val); break
      case "nombre":    error=validarNombre(val); break
      case "telefono":  error=validarTelefono(val); break
      case "email":     error=validarEmail(val); break
      case "password":  error=(editingId&&!val)?"":validarPassword(val,formData.nombre,formData.documento,formData.email); break
      case "rol":       error=validarRol(val); break
    }
    setFormErrors(p=>({...p,[name]:error}))
    setFieldValidation(p=>({...p,[name]:!error}))
  }

  const validateForm = () => {
    setTouched({documento:true,nombre:true,telefono:true,email:true,password:true,rol:true})
    const dE=validarDocumento(formData.documento), nE=validarNombre(formData.nombre),
          tE=validarTelefono(formData.telefono),   eE=validarEmail(formData.email),
          pE=(editingId&&!formData.password)?"":validarPassword(formData.password,formData.nombre,formData.documento,formData.email),
          rE=validarRol(formData.rol)
    setFormErrors({documento:dE,nombre:nE,telefono:tE,email:eE,password:pE,rol:rE})
    setFieldValidation({documento:!dE,nombre:!nE,telefono:!tE,email:!eE,password:editingId?true:!pE,rol:!rE})
    return !dE&&!nE&&!tE&&!eE&&(editingId?true:!pE)&&!rE
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX: handleClose y handleCloseDetails hacen
     blur del elemento activo ANTES de cerrar el
     Dialog, evitando que el onBlur de un campo
     dispare validaciones durante el cierre.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleOpen = u => {
    setFormErrors({nombre:"",documento:"",email:"",telefono:"",password:"",rol:""})
    setFieldValidation({documento:false,nombre:false,telefono:false,email:false,password:false,rol:false})
    setTouched({documento:false,nombre:false,telefono:false,email:false,password:false,rol:false})
    if(u){ setFormData({nombre:u.nombre,documento:u.documento,email:u.email,telefono:u.telefono,password:"",rol:u.rol,estado:u.estado}); setEditingId(u._id); setFieldValidation({documento:true,nombre:true,telefono:true,email:true,password:true,rol:true}) }
    else  { setFormData({nombre:"",documento:"",email:"",telefono:"",password:"",rol:"",estado:true}); setEditingId(null) }
    setOpen(true)
    setTimeout(()=>documentoRef.current?.focus(),100)
  }

  const handleClose = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      document.activeElement.blur()
    }
    setOpen(false)
    setFormErrors({nombre:"",documento:"",email:"",telefono:"",password:"",rol:""})
  }

  const handleDetails = u => { setSelectedUsuario(u); setDetailsOpen(true) }

  const handleCloseDetails = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      document.activeElement.blur()
    }
    setDetailsOpen(false)
  }

  const handleSubmit = async () => {
    if(!validateForm()){
      if(!fieldValidation.documento) documentoRef.current?.focus()
      else if(!fieldValidation.nombre) nombreRef.current?.focus()
      else if(!fieldValidation.telefono) telefonoRef.current?.focus()
      else if(!fieldValidation.email) emailRef.current?.focus()
      else if(!fieldValidation.password&&!editingId) passwordRef.current?.focus()
      else if(!fieldValidation.rol) rolRef.current?.focus()
      return
    }
    if(editingId&&isAdminUser(formData)&&formData.estado===false){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede desactivar al usuario administrador"}); return }
    const orig=usuarios.find(u=>u._id===editingId)
    if(editingId&&isAdminUser(formData)&&orig&&formData.email!==orig.email){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede modificar el correo del administrador"}); return }
    try {
      if(editingId){ const d={...formData}; if(!d.password) delete d.password; await usuarioService.updateUsuario(editingId,d); Swal.fire({...SW,icon:"success",title:"Actualizado",text:"El usuario se actualizó correctamente."}) }
      else { await usuarioService.createUsuario({...formData,estado:true}); Swal.fire({...SW,icon:"success",title:"Creado",text:"El usuario se creó correctamente."}) }
      fetchUsuarios(); handleClose()
    } catch(e){ console.error(e); Swal.fire({...SW,icon:"error",title:"Error",text:e.response?.data?.msg||"Ocurrió un error al guardar el usuario."}) }
  }

  const handleDelete = async id => {
    const u=usuarios.find(x=>x._id===id)
    if(u&&isAdminUser(u)){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede eliminar al usuario administrador"}); return }
    if(u&&u.rol&&u.rol!==""){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"Debe quitar el rol del usuario antes de eliminarlo"}); return }
    const r=await Swal.fire({...SWD,title:"¿Eliminar usuario?",text:"Esta acción no se puede deshacer",icon:"question",showCancelButton:true,confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"})
    if(r.isConfirmed){
      try { await usuarioService.deleteUsuario(id); Swal.fire({...SW,icon:"success",title:"Eliminado",text:"El usuario se eliminó correctamente."}); fetchUsuarios() }
      catch(e){ Swal.fire({...SW,icon:"error",title:"No se puede eliminar",text:e.response?.data?.msg||"Ocurrió un error al eliminar el usuario."}) }
    }
  }

  const handleRemoveRole = async id => {
    const u=usuarios.find(x=>x._id===id)
    if(u&&isAdminUser(u)){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"No se puede quitar el rol al usuario administrador"}); return }
    const r=await Swal.fire({...SWD,title:"¿Quitar rol?",text:"¿Está seguro que desea quitar el rol asignado?",icon:"question",showCancelButton:true,confirmButtonText:"Sí, quitar rol",cancelButtonText:"Cancelar"})
    if(r.isConfirmed){
      try { await usuarioService.updateUsuario(id,{rol:""}); Swal.fire({...SW,icon:"success",title:"Rol eliminado",text:"El rol del usuario ha sido eliminado correctamente."}); fetchUsuarios() }
      catch(e){ Swal.fire({...SW,icon:"error",title:"Error",text:e.response?.data?.msg||"Ocurrió un error al quitar el rol."}) }
    }
  }

  const filtered   = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telefono.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated  = filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length/rowsPerPage))
  const totalActive   = usuarios.filter(u=>u.estado).length
  const totalInactive = usuarios.filter(u=>!u.estado).length
  const totalWithRole = usuarios.filter(u=>u.rol&&u.rol!=="").length

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX: DlgHdr — onMouseDown preventDefault +
     stopPropagation evita que MUI Dialog reciba
     el evento de clic y re-dispare onClose antes
     de que el campo pierda el foco correctamente.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box className={cls.dlgHdr}>
      <Box className={cls.dlgHdrIco}>{icon}</Box>
      <Box>
        <Typography className={cls.dlgHdrTitle}>{title}</Typography>
        <Typography className={cls.dlgHdrSub}>{sub}</Typography>
      </Box>
      <button
        className={cls.dlgCloseBtn}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
        onClick={(e) => { e.stopPropagation(); onClose() }}
      >
        <X size={15} strokeWidth={2.5}/>
      </button>
    </Box>
  )

  return (
    <Box className={cls.root}>

      {/* HEADER */}
      <Box className={cls.hdr}>
        <Box className={cls.hdrLeft}>
          <Box className={cls.hdrIcon}><Users size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={cls.hdrTitle}>Gestión de Usuarios</Typography>
            <Typography className={cls.hdrSub}>Administra los usuarios y roles del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={cls.statsRow}>
        {[
          { label:"Total",       val:usuarios.length, sub:"registrados",  c:cls.sv, orb:"#6C3FFF", col:"#6C3FFF",  sc:"#5929d9" },
          { label:"Activos",     val:totalActive,     sub:"habilitados",  c:cls.st, orb:"#00D4AA", col:"#007a62",  sc:"#007a62" },
          { label:"Inactivos",   val:totalInactive,   sub:"desactivados", c:cls.sr, orb:"#FF3B82", col:"#cc2060",  sc:"#cc2060" },
          { label:"Con Rol",     val:totalWithRole,   sub:"asignados",    c:cls.sb, orb:"#2563EB", col:"#1d4ed8",  sc:"#1d4ed8" },
        ].map((s,i)=>(
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
          <input className={cls.searchInput} placeholder="Buscar usuario, documento, email…"
            value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setPage(0) }}/>
          <span className={cls.kbd}>⌘K</span>
        </Box>
        <Button className={cls.addBtn} onClick={()=>handleOpen(null)} startIcon={<UserPlus size={16} strokeWidth={2.5}/>}>
          Nuevo Usuario
        </Button>
      </Box>

      {/* TABLE */}
      <Box className={cls.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Usuario</HCell>
                <HCell>Documento</HCell>
                <HCell>Email</HCell>
                <HCell>Teléfono</HCell>
                <HCell>Rol</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((u, i) => (
                <TableRow key={u._id} className={cls.tblRow}>
                  <NCell>
                    <Box className={cls.nameWrap}>
                      <Box className={cls.nameAv} style={{ background:avGrad(i) }}>
                        {getInitials(u.nombre)}
                      </Box>
                      <Box>
                        <Typography className={cls.nameText}>{u.nombre}</Typography>
                        <Typography className={cls.nameId}>#{u._id?.slice(-6).toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </NCell>
                  <BCell>{u.documento}</BCell>
                  <BCell>
                    <Tooltip title={u.email} placement="top">
                      <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:T.ink3, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {u.email}
                      </Typography>
                    </Tooltip>
                  </BCell>
                  <BCell>{u.telefono}</BCell>
                  <BCell>
                    <Box className={`${cls.chip} ${u.rol&&u.rol!==""?cls.cRole:cls.cNoRole}`} component="span">
                      <Shield size={10} strokeWidth={2.5}/> {u.rol||"Sin rol"}
                    </Box>
                  </BCell>
                  <BCell>
                    <Box className={`${cls.chip} ${u.estado?cls.cOn:cls.cOff}`} component="span">
                      {u.estado
                        ? <><Check size={10} strokeWidth={2.5}/> Activo</>
                        : <><X     size={10} strokeWidth={2.5}/> Inactivo</>
                      }
                    </Box>
                  </BCell>
                  <BCell>
                    <Box className={cls.actWrap}>
                      <Tooltip title="Editar" placement="top">
                        <button className={`${cls.actBtn} ${cls.bEdit}`} onClick={()=>handleOpen(u)}>
                          <Edit2 size={14} strokeWidth={2.2}/>
                        </button>
                      </Tooltip>
                      <Tooltip title="Ver detalles" placement="top">
                        <button className={`${cls.actBtn} ${cls.bView}`} onClick={()=>handleDetails(u)}>
                          <Eye size={14} strokeWidth={2.2}/>
                        </button>
                      </Tooltip>
                      {u.rol&&!isAdminUser(u)
                        ? <Tooltip title="Quitar rol" placement="top">
                            <button className={`${cls.actBtn} ${cls.bRole}`} onClick={()=>handleRemoveRole(u._id)}>
                              <Shield size={14} strokeWidth={2.2}/>
                            </button>
                          </Tooltip>
                        : <button className={`${cls.actBtn} ${cls.bGhost}`} disabled><Shield size={14}/></button>
                      }
                      {!isAdminUser(u)&&(!u.rol||u.rol==="")
                        ? <Tooltip title="Eliminar" placement="top">
                            <button className={`${cls.actBtn} ${cls.bDel}`} onClick={()=>handleDelete(u._id)}>
                              <Trash2 size={14} strokeWidth={2.2}/>
                            </button>
                          </Tooltip>
                        : <button className={`${cls.actBtn} ${cls.bGhost}`} disabled><Trash2 size={14}/></button>
                      }
                    </Box>
                  </BCell>
                </TableRow>
              ))}
              {paginated.length===0&&(
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={7} className={cls.emptyCell}>No se encontraron usuarios que coincidan con la búsqueda.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PAGINATION */}
      <Box className={cls.pagWrap}>
        <Typography className={cls.pagInfo}>
          Mostrando {filtered.length===0?0:page*rowsPerPage+1}–{Math.min((page+1)*rowsPerPage,filtered.length)} de {filtered.length} usuarios
        </Typography>
        <Box className={cls.pagBtns}>
          <button className={cls.pageBtn} onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{ opacity:page===0?.4:1 }}>
            <ArrowLeft size={12} strokeWidth={2.5}/>
          </button>
          {Array.from({length:totalPages},(_,i)=>(
            <button key={i} className={`${cls.pageBtn} ${page===i?cls.pagBtnOn:""}`} onClick={()=>setPage(i)}>{i+1}</button>
          ))}
          <button className={cls.pageBtn} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ opacity:page>=totalPages-1?.4:1 }}>
            <ArrowRight size={12} strokeWidth={2.5}/>
          </button>
        </Box>
        <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Typography className={cls.pagInfo}>Filas:</Typography>
          <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setPage(0)}}
            style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}>
            {[5,10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm" fullWidth
        classes={{ paper:cls.dlgPaper }}
        /* FIX: disableEnforceFocus evita que MUI intente devolver el foco
           a un campo del Dialog cuando el usuario hace clic en el botón X,
           lo cual disparaba el onBlur → validación antes del cierre. */
        disableEnforceFocus
      >
        <DlgHdr
          icon={editingId?<Edit2 size={20} color="#fff" strokeWidth={2.2}/>:<UserPlus size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId?"Editar Usuario":"Nuevo Usuario"}
          sub={editingId?"Modifica los datos del usuario seleccionado":"Completa los campos para registrar un nuevo usuario"}
          onClose={handleClose}
        />
        <DialogContent className={cls.dlgBody}>

          {/* Sección 1: Personal */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <User size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información Personal
            </Box>
            <Box className={cls.fmRow}>
              <TextField autoFocus margin="dense" id="documento" name="documento" label="Documento" type="text"
                fullWidth variant="outlined" value={formData.documento} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={e=>handleKeyDown(e,"nombre")}
                error={!!formErrors.documento} helperText={formErrors.documento||MENSAJES_INSTRUCTIVOS.DOCUMENTO}
                inputRef={documentoRef} className={cls.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><PermIdentity style={{ color:T.ink3, fontSize:18 }}/></InputAdornment> }}
                inputProps={{ maxLength:VALIDACION.DOCUMENTO.MAX_LENGTH }}
              />
              <TextField margin="dense" id="nombre" name="nombre" label="Nombre Completo" type="text"
                fullWidth variant="outlined" value={formData.nombre} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={e=>handleKeyDown(e,"telefono")}
                error={!!formErrors.nombre} helperText={formErrors.nombre||MENSAJES_INSTRUCTIVOS.NOMBRE}
                inputRef={nombreRef} className={cls.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><Person style={{ color:T.ink3, fontSize:18 }}/></InputAdornment> }}
                inputProps={{ maxLength:VALIDACION.NOMBRE.MAX_LENGTH }}
              />
            </Box>
          </Box>

          {/* Sección 2: Contacto */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}>
                <Mail size={13} color={T.t1} strokeWidth={2.5}/>
              </Box>
              Información de Contacto
            </Box>
            <Box className={cls.fmRow}>
              <TextField margin="dense" id="telefono" name="telefono" label="Teléfono" type="tel"
                fullWidth variant="outlined" value={formData.telefono} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={e=>handleKeyDown(e,"email")}
                error={!!formErrors.telefono} helperText={formErrors.telefono||MENSAJES_INSTRUCTIVOS.TELEFONO}
                inputRef={telefonoRef} className={cls.fmField}
                InputProps={{ startAdornment:<InputAdornment position="start"><Phone size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                inputProps={{ maxLength:VALIDACION.TELEFONO.MAX_LENGTH }}
              />
              <TextField margin="dense" id="email" name="email" label="Email" type="email"
                fullWidth variant="outlined" value={formData.email} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={e=>handleKeyDown(e,"password")}
                error={!!formErrors.email}
                helperText={formErrors.email||MENSAJES_INSTRUCTIVOS.EMAIL||(editingId&&isAdminUser(formData)?"El email del administrador no se puede modificar":"")}
                inputRef={emailRef} className={cls.fmField}
                disabled={editingId&&isAdminUser(formData)}
                InputProps={{ startAdornment:<InputAdornment position="start"><Email style={{ color:T.ink3, fontSize:18 }}/></InputAdornment> }}
                inputProps={{ maxLength:50 }}
              />
            </Box>
          </Box>

          {/* Sección 3: Seguridad y Rol */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(255,59,130,.10)" }}>
                <Lock size={13} color={T.e1} strokeWidth={2.5}/>
              </Box>
              Seguridad y Rol
            </Box>
            <TextField margin="dense" id="password" name="password"
              label={editingId?"Contraseña (dejar en blanco para no cambiar)":"Contraseña"} type="password"
              fullWidth variant="outlined" value={formData.password} onChange={handleChange}
              onBlur={handleFieldBlur} onKeyDown={e=>handleKeyDown(e,"rol")}
              error={!!formErrors.password} helperText={formErrors.password||MENSAJES_INSTRUCTIVOS.PASSWORD}
              inputRef={passwordRef} className={cls.fmField}
              InputProps={{ startAdornment:<InputAdornment position="start"><VpnKey style={{ color:T.ink3, fontSize:18 }}/></InputAdornment> }}
              inputProps={{ maxLength:VALIDACION.CONTRASENA.MAX_LENGTH }}
            />
            <Box className={cls.fmRow}>
              <TextField className={cls.fmField} select margin="dense" label="Rol" name="rol"
                value={formData.rol} onChange={handleChange} onBlur={handleFieldBlur}
                onKeyDown={e=>handleKeyDown(e,"estado")} fullWidth variant="outlined"
                disabled={editingId&&isAdminUser(formData)} inputRef={rolRef}
                error={!!formErrors.rol}
                helperText={formErrors.rol||(availableRoles.length>0?`${availableRoles.length} roles disponibles`:"Cargando roles...")}
                InputProps={{ startAdornment:<InputAdornment position="start"><AssignmentInd style={{ color:T.ink3, fontSize:18 }}/></InputAdornment> }}
              >
                {availableRoles.length>0
                  ? availableRoles.map(r=><MenuItem key={r._id} value={r.nombre}>{r.nombre}</MenuItem>)
                  : <MenuItem value="" disabled>No hay roles disponibles</MenuItem>
                }
              </TextField>
              {editingId&&(
                <TextField className={cls.fmField} select margin="dense" label="Estado" name="estado"
                  value={formData.estado} onChange={handleChange} fullWidth variant="outlined"
                  disabled={editingId&&isAdminUser(formData)} inputRef={estadoRef}
                  helperText={editingId&&isAdminUser(formData)?"El estado del administrador no se puede modificar":""}
                >
                  <MenuItem value={true}>✅ Activo</MenuItem>
                  <MenuItem value={false}>❌ Inactivo</MenuItem>
                </TextField>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className={cls.dlgFoot}>
          <Button onClick={handleClose}  className={cls.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={cls.btnSubmit} startIcon={<Check size={15} strokeWidth={2.5}/>}>
            {editingId?"Actualizar Usuario":"Crear Usuario"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth maxWidth="sm"
        classes={{ paper:cls.dlgPaper }}
        disableEnforceFocus
      >
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Usuario"
          sub="Información completa del usuario seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={cls.dlgBody}>
          {selectedUsuario&&(
            <>
              <Box className={cls.detHero}>
                <Box className={cls.detAv}>{getInitials(selectedUsuario.nombre)}</Box>
                <Typography className={cls.detName}>{selectedUsuario.nombre}</Typography>
                <Typography className={cls.detRole}>{selectedUsuario.rol||"Usuario sin rol asignado"}</Typography>
              </Box>
              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>
              <Box className={cls.detGrid}>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Documento</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <PermIdentity style={{ fontSize:14, color:T.v1 }}/>
                    <Typography className={cls.detVal}>{selectedUsuario.documento}</Typography>
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Estado</Typography>
                  <Box className={`${cls.chip} ${selectedUsuario.estado?cls.cOn:cls.cOff}`} component="span" style={{ marginTop:2 }}>
                    {selectedUsuario.estado?<><Check size={11} strokeWidth={2.5}/> Activo</>:<><X size={11} strokeWidth={2.5}/> Inactivo</>}
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Email</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Email style={{ fontSize:14, color:T.t1 }}/>
                    <Typography className={cls.detVal} style={{ fontSize:".82rem", wordBreak:"break-all" }}>{selectedUsuario.email}</Typography>
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Teléfono</Typography>
                  <Box style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Phone size={14} color={T.a1} strokeWidth={2.2}/>
                    <Typography className={cls.detVal}>{selectedUsuario.telefono}</Typography>
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>Rol</Typography>
                  <Box className={`${cls.chip} ${selectedUsuario.rol&&selectedUsuario.rol!==""?cls.cRole:cls.cNoRole}`} component="span" style={{ marginTop:2 }}>
                    <Shield size={11} strokeWidth={2.5}/> {selectedUsuario.rol||"Sin rol"}
                  </Box>
                </Box>
                <Box className={cls.detItem}>
                  <Typography className={cls.detLbl}>ID</Typography>
                  <Typography className={cls.detValMono}>{selectedUsuario._id}</Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={cls.dlgFoot}>
          <Button onClick={handleCloseDetails} className={cls.btnCancel}>Cerrar</Button>
          <Button onClick={()=>{ handleCloseDetails(); handleOpen(selectedUsuario) }} className={cls.btnSubmit}>
            <Edit2 size={14} strokeWidth={2.2} style={{ marginRight:6 }}/>Editar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default UsuarioList