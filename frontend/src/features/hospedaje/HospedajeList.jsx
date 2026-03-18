"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  Dialog,
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
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
  Divider,
} from "@material-ui/core"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  Check,
  ArrowLeft,
  ArrowRight,
  Home,
  User,
  Users,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Tag,
  Hash,
  PlusCircle,
  BookOpen,
  Hotel,
  KeyRound,
  FileText,
  Phone,
  Mail,
  Clock,
  CreditCard,
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENSAJES INSTRUCTIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MI = {
  CLIENTE:       "Ingrese el nombre completo del cliente. Solo letras y espacios.",
  IDENTIFICACION:"Ingrese el número de identificación. Letras y números.",
  EMAIL:         "Ingrese un correo electrónico válido. Ej: cliente@email.com.",
  TELEFONO:      "Ingrese el número de teléfono. Solo números.",
  FECHA_INICIO:  "Seleccione la fecha de inicio del hospedaje.",
  FECHA_FIN:     "Seleccione la fecha de fin. Debe ser posterior a la fecha de inicio.",
  APARTAMENTOS:  "Seleccione uno o más apartamentos para el hospedaje.",
  ESTADIA:       "Se calcula automáticamente según las fechas seleccionadas.",
  TOTAL:         "Se calcula automáticamente según apartamentos y estadía.",
  ESTADO:        "Seleccione el estado actual del hospedaje.",
  DESCUENTO:     "Seleccione el porcentaje de descuento a aplicar (opcional).",
  ACOMP_NOMBRE:  "Nombre del acompañante. Solo letras.",
  ACOMP_APELLIDO:"Apellido del acompañante. Solo letras.",
  ACOMP_DOC:     "Número de documento del acompañante. Letras y números.",
  HORA_ENTRADA:  "Hora de entrada del huésped.",
  HORA_SALIDA:   "Hora de salida del huésped.",
  OBSERVACIONES: "Agregue observaciones relevantes sobre el check-in.",
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
   STYLES
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
  sp:{ background:"linear-gradient(145deg,rgba(255,123,44,.10),rgba(245,197,24,.07))", boxShadow:"0 5px 22px rgba(255,123,44,.11)", "&::before":{ background:"linear-gradient(135deg,#FF7B2C,#F5C518)" } },
  sc:{ background:"linear-gradient(145deg,rgba(37,99,235,.10),rgba(124,58,237,.07))", boxShadow:"0 5px 22px rgba(37,99,235,.11)", "&::before":{ background:T.gb } },
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
  tblRowCheckedIn:{ background:"rgba(0,212,170,.07) !important", "&:hover":{ background:"rgba(0,212,170,.12) !important" } },
  nameWrap:{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" },
  nameAv:{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 12px rgba(108,63,255,.30)", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, color:"#fff" },
  nameAvCheckedIn:{ boxShadow:"0 3px 12px rgba(0,212,170,.40)" },
  nameText:{ fontWeight:700, fontSize:".90rem", color:T.ink },
  nameId:{ fontSize:".72rem", color:T.ink4, marginTop:1 },
  checkInBadge:{ display:"inline-flex", alignItems:"center", gap:4, fontSize:".70rem", fontWeight:700, color:"#00917a", marginTop:2 },
  chip:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, whiteSpace:"nowrap" },
  cConfirmada:{ background:"rgba(0,212,170,.12)",  color:"#00917a" },
  cPendiente: { background:"rgba(255,123,44,.12)", color:"#c25a00" },
  cCancelada: { background:"rgba(255,59,130,.10)", color:"#cc2060" },
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
  /* DIALOGS */
  dlgPaper:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:"90vw", maxWidth:780, maxHeight:"88vh",
    background:"rgba(255,255,255,0.98) !important", backdropFilter:"blur(24px)",
    overflow:"hidden", position:"relative", display:"flex", flexDirection:"column",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:10 },
  },
  dlgPaperWizard:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:"92vw", maxWidth:920, maxHeight:"90vh",
    background:"rgba(255,255,255,0.98) !important", backdropFilter:"blur(24px)",
    overflow:"hidden", position:"relative", display:"flex", flexDirection:"column",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:10 },
  },
  dlgHdr:{ background:"linear-gradient(135deg,#6C3FFF,#C040FF)", padding:"20px 22px", display:"flex", alignItems:"center", gap:12, position:"relative", flexShrink:0 },
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
  dlgBody:{ padding:"22px 24px 10px !important", background:"#fff", flex:1, overflowY:"auto" },
  dlgBodyWizard:{ padding:"16px 24px 0 !important", background:"#fff", flex:1, overflowY:"auto", display:"flex", flexDirection:"column" },
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
  fmRow3:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 },
  dlgFoot:{
    padding:"12px 24px 20px !important", background:"#fff",
    borderTop:"1px solid rgba(108,63,255,.08)", display:"flex",
    justifyContent:"space-between", alignItems:"center", gap:10, flexShrink:0,
  },
  dlgFootRight:{ display:"flex", gap:10 },
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
  btnFinish:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:"linear-gradient(135deg,#00D4AA,#00A3E0) !important", color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 26px !important",
    boxShadow:"0 4px 14px rgba(0,212,170,.38) !important", transition:"all .2s !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(0,212,170,.50) !important" },
  },
  btnEdicion:{
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    borderRadius:"50px !important", padding:"9px 22px !important",
    transition:"all .18s !important",
  },
  btnDelCheckin:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.ge} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 22px !important",
    boxShadow:"0 4px 14px rgba(255,59,130,.38) !important", transition:"all .2s !important",
    "&:hover":{ transform:"translateY(-2px)" },
  },
  btnAgregarAcomp:{
    display:"inline-flex", alignItems:"center", gap:6,
    fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".78rem",
    color:T.v1, border:`1.5px solid rgba(108,63,255,.28)`,
    borderRadius:50, padding:"7px 18px", background:"rgba(108,63,255,.06)",
    cursor:"pointer", transition:"all .18s", letterSpacing:".4px",
    "&:hover":{ background:"rgba(108,63,255,.12)", boxShadow:"0 3px 10px rgba(108,63,255,.18)" },
  },
  btnDelAcomp:{
    width:32, height:32, borderRadius:10, flexShrink:0,
    display:"flex", alignItems:"center", justifyContent:"center",
    background:T.ge, color:"#fff", border:"none", cursor:"pointer",
    transition:"all .18s", alignSelf:"flex-start", marginTop:8,
    "&:hover":{ transform:"scale(1.10)", boxShadow:"0 4px 14px rgba(255,59,130,.35)" },
  },
  acompCard:{ borderRadius:14, padding:"14px 14px 10px", background:"rgba(244,241,255,.35)", border:`1px solid ${T.bL}`, marginBottom:12 },
  acompCardHdr:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  acompLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, color:T.ink3, letterSpacing:".6px", textTransform:"uppercase" },
  /* WIZARD */
  progressBar:{ height:4, borderRadius:2, background:"rgba(108,63,255,.10)", margin:"0 0 14px", flexShrink:0, overflow:"hidden" },
  progressFill:{ height:"100%", borderRadius:2, background:T.gv, transition:"width .3s" },
  stepperRoot:{ background:"transparent", padding:"8px 0 4px", flexShrink:0,
    "& .MuiStepIcon-root":{ color:"rgba(108,63,255,.30)" },
    "& .MuiStepIcon-root.MuiStepIcon-active":{ color:T.v1 },
    "& .MuiStepIcon-root.MuiStepIcon-completed":{ color:T.t1 },
    "& .MuiStepLabel-label":{ fontFamily:"'DM Sans',sans-serif", fontSize:".80rem" },
    "& .MuiStepLabel-label.MuiStepLabel-active":{ fontWeight:700, color:T.v1 },
    "& .MuiStepLabel-label.MuiStepLabel-completed":{ fontWeight:600, color:"#00917a" },
  },
  stepMobileStepper:{ background:"transparent", flexGrow:1, padding:0,
    "& .MuiMobileStepper-dot":{ background:"rgba(108,63,255,.20)" },
    "& .MuiMobileStepper-dotActive":{ background:T.v1 },
  },
  stepTitle:{ fontFamily:"'Syne',sans-serif", fontSize:"1.05rem", fontWeight:800, color:T.ink, textAlign:"center", marginBottom:4 },
  stepSubtitle:{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", color:T.ink3, textAlign:"center", marginBottom:16 },
  stepContentWrapper:{ flex:1, overflowY:"auto", paddingBottom:8 },
  summaryCard:{ borderRadius:14, padding:"14px 16px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, marginBottom:12 },
  summaryTitle:{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Syne',sans-serif", fontSize:".83rem", fontWeight:800, color:T.ink, marginBottom:10, paddingBottom:8, borderBottom:`1.5px solid rgba(108,63,255,.09)` },
  summaryRow:{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid rgba(108,63,255,.06)`,
    "&:last-child":{ borderBottom:"none" } },
  summaryLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", fontWeight:700, color:T.ink3 },
  summaryVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", fontWeight:600, color:T.ink },
  /* DETAILS */
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0 18px" },
  detAv:{ width:76, height:76, borderRadius:22, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:"#fff" },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:4, textAlign:"center" },
  detSub:{ fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", color:T.ink3, textAlign:"center" },
  detGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 },
  detItem:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4 },
  detItemFull:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:4, gridColumn:"1 / -1" },
  detLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3 },
  detVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".90rem", fontWeight:600, color:T.ink },
  checkInCard:{ borderRadius:14, padding:"12px 16px", background:"rgba(0,212,170,.07)", border:"1.5px solid rgba(0,212,170,.28)", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 },
  checkInCardText:{ display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Sans',sans-serif", fontSize:".84rem", fontWeight:700, color:"#00917a" },
  /* ROOMS */
  roomsTableWrap:{ borderRadius:16, overflow:"hidden", border:`1px solid rgba(108,63,255,.10)`, boxShadow:"0 4px 16px rgba(108,63,255,.07)" },
  roomAvailBtn:{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 14px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, border:"none", cursor:"pointer", transition:"all .15s" },
  roomAvail:{ background:"rgba(0,212,170,.12)", color:"#00917a" },
  roomUnavail:{ background:"rgba(255,59,130,.10)", color:"#cc2060" },
  roomsPagWrap:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0 4px", flexWrap:"wrap", gap:8 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const formatCOP = v => Number(v).toLocaleString("es-CO", { style:"currency", currency:"COP" })
const getInitials = n => n ? n.split(" ").map(w=>w[0]).join("").toUpperCase().substring(0,2) : "HO"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const HospedajeList = () => {
  const classes = useStyles()

  /* ── state — idéntico al original ── */
  const [hospedajes, setHospedajes]                           = useState([])
  const [open, setOpen]                                       = useState(false)
  const [detailsOpen, setDetailsOpen]                         = useState(false)
  const [editingId, setEditingId]                             = useState(null)
  const [selectedHospedaje, setSelectedHospedaje]             = useState(null)
  const [formData, setFormData]                               = useState({
    numeroReserva:"", cliente:"", numeroIdentificacion:"", email:"", telefono:"",
    fecha_inicio:"", fecha_fin:"", apartamentos:[], estadia:"", total:"",
    estado:"pendiente", acompanantes:[],
    descuento:{ porcentaje:"", precioOriginal:"", precioConDescuento:"" },
  })
  const [searchTerm, setSearchTerm]                           = useState("")
  const [page, setPage]                                       = useState(0)
  const [rowsPerPage, setRowsPerPage]                         = useState(5)
  const [checkInModalOpen, setCheckInModalOpen]               = useState(false)
  const [checkInData, setCheckInData]                         = useState({ horaEntrada:"", horaSalida:"", total:"", observaciones:"", acompanantes:[] })
  const [editMode, setEditMode]                               = useState(false)
  const [rooms, setRooms]                                     = useState([])
  const [roomsModalOpen, setRoomsModalOpen]                   = useState(false)
  const [apartamentosOptions, setApartamentosOptions]         = useState([])
  const [activeStep, setActiveStep]                           = useState(0)
  const [roomsPage, setRoomsPage]                             = useState(0)
  const [roomsPerPage, setRoomsPerPage]                       = useState(4)

  const steps = [
    { label:"Cliente",        description:"Datos personales del cliente" },
    { label:"Fechas / Aptos", description:"Selección de fechas y apartamentos" },
    { label:"Descuentos",     description:"Aplicar descuentos (opcional)" },
    { label:"Acompañantes",   description:"Agregar acompañantes (opcional)" },
    { label:"Resumen",        description:"Revisar y confirmar" },
  ]

  /* ── formatApartamentosSimple — idéntico al original ── */
  const formatApartamentosSimple = (apartamentos) => {
    if (!apartamentos) return "Sin apartamentos"
    if (Array.isArray(apartamentos)) {
      return apartamentos.map(apt => {
        if (typeof apt === "object" && apt !== null && apt.NumeroApto) return `Apartamento ${apt.NumeroApto}`
        if (typeof apt === "string") {
          const opt = apartamentosOptions.find(i => i.id === apt)
          if (opt?.numeroApto) return `Apartamento ${opt.numeroApto}`
          return `Apartamento ${apt}`
        }
        return `Apartamento ${apt}`
      }).join(", ")
    }
    return `Apartamento ${apartamentos}`
  }

  /* ── fetches — idénticos al original ── */
  const fetchHospedajes = async () => {
    try {
      const data = await hospedajeService.getHospedajes()
      setHospedajes(data)
    } catch (error) {
      console.error("Error al obtener hospedajes", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron cargar los hospedajes." })
    }
  }

  const fetchApartamentosOptions = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      setApartamentosOptions(data.map(apt => ({
        id: apt._id,
        label: `Apartamento ${apt.NumeroApto} - Piso ${apt.Piso} - Tarifa ${apt.Tarifa}`,
        tarifa: apt.Tarifa,
        numeroApto: apt.NumeroApto,
      })))
    } catch (error) { console.error("Error al obtener apartamentos", error) }
  }

  useEffect(() => {
    fetchHospedajes()
    fetchApartamentosOptions()
    const initialRooms = []
    for (let i = 1; i <= 18; i++) initialRooms.push({ number:i, available:true, observation:"", numeroReserva:"" })
    setRooms(initialRooms)
  }, [])

  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      const start = new Date(formData.fecha_inicio), end = new Date(formData.fecha_fin)
      const diffDays = end - start > 0 ? Math.floor((end - start) / (1000*60*60*24)) : 0
      setFormData(prev => ({ ...prev, estadia: diffDays }))
    } else {
      setFormData(prev => ({ ...prev, estadia:"" }))
    }
  }, [formData.fecha_inicio, formData.fecha_fin])

  useEffect(() => {
    if (formData.apartamentos.length > 0 && formData.estadia) {
      let sumTarifas = 0
      formData.apartamentos.forEach(aptId => {
        const apt = apartamentosOptions.find(i => i.id === aptId)
        if (apt?.tarifa) sumTarifas += Number(apt.tarifa)
      })
      const newTotal = sumTarifas * Number(formData.estadia)
      setFormData(prev => ({
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
      setFormData(prev => ({ ...prev, total:"" }))
    }
  }, [formData.apartamentos, formData.estadia, apartamentosOptions])

  /* ── handleOpen — idéntico al original ── */
  const handleOpen = (hospedaje) => {
    if (hospedaje) {
      let apartamentosIds = []
      if (Array.isArray(hospedaje.apartamentos)) {
        apartamentosIds = hospedaje.apartamentos.map(apt => (typeof apt === "object" && apt._id) ? apt._id : apt)
      }
      setFormData({
        numeroReserva: hospedaje.numeroReserva || "",
        cliente: hospedaje.cliente || "",
        numeroIdentificacion: hospedaje.numeroIdentificacion || "",
        email: hospedaje.email || "",
        telefono: hospedaje.telefono || "",
        fecha_inicio: hospedaje.fecha_inicio ? hospedaje.fecha_inicio.substring(0,10) : "",
        fecha_fin: hospedaje.fecha_fin ? hospedaje.fecha_fin.substring(0,10) : "",
        apartamentos: apartamentosIds,
        estadia: hospedaje.estadia || "",
        total: hospedaje.total || "",
        estado: hospedaje.estado || "pendiente",
        acompanantes: hospedaje.acompanantes || [],
        descuento: hospedaje.descuento || { porcentaje:"", precioOriginal:"", precioConDescuento:"" },
      })
      setEditingId(hospedaje._id)
    } else {
      setFormData({ numeroReserva:"", cliente:"", numeroIdentificacion:"", email:"", telefono:"",
        fecha_inicio:"", fecha_fin:"", apartamentos:[], estadia:"", total:"",
        estado:"pendiente", acompanantes:[],
        descuento:{ porcentaje:"", precioOriginal:"", precioConDescuento:"" } })
      setEditingId(null)
    }
    setActiveStep(0)
    setOpen(true)
  }

  const handleClose = () => { setOpen(false); setActiveStep(0) }

  /* ── handleChange — idéntico al original ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    const toast = (text) => Swal.fire({ ...SW, icon:"warning", title:"Validación", text, toast:true, position:"top-end", showConfirmButton:false, timer:3000, timerProgressBar:true })
    if (name === "cliente") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value) || value === "") setFormData(prev => ({ ...prev, [name]:value }))
      else toast("El campo cliente solo acepta letras")
    } else if (name === "numeroIdentificacion") {
      if (/^[A-Za-z0-9]*$/.test(value) || value === "") setFormData(prev => ({ ...prev, [name]:value }))
      else toast("El número de identificación solo acepta letras y números")
    } else if (name === "telefono") {
      if (/^[0-9]*$/.test(value) || value === "") setFormData(prev => ({ ...prev, [name]:value }))
      else toast("El teléfono solo acepta números")
    } else if (name === "fecha_inicio") {
      const today = new Date().toISOString().split("T")[0]
      if (value < today) toast("La fecha de inicio no puede ser anterior a hoy")
      setFormData(prev => ({ ...prev, [name]:value }))
      if (formData.fecha_fin && formData.fecha_fin <= value) toast("La fecha fin debe ser posterior a la fecha inicio")
    } else if (name === "fecha_fin") {
      if (formData.fecha_inicio && value <= formData.fecha_inicio) toast("La fecha fin debe ser posterior a la fecha inicio")
      setFormData(prev => ({ ...prev, [name]:value }))
    } else {
      setFormData(prev => ({ ...prev, [name]:value }))
    }
  }

  const handleApartamentosChange = (e) => setFormData(prev => ({ ...prev, apartamentos: e.target.value }))

  /* ── acompañantes — idéntico al original ── */
  const agregarAcompanante = () => setFormData(prev => ({ ...prev, acompanantes:[...(prev.acompanantes||[]), { nombre:"", apellido:"", documento:"" }] }))

  const handleAcompananteChange = (index, e) => {
    const { name, value } = e.target
    const toast = (text) => Swal.fire({ ...SW, icon:"warning", title:"Validación", text, toast:true, position:"top-end", showConfirmButton:false, timer:3000, timerProgressBar:true })
    if (name === "nombre" || name === "apellido") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value) || value === "") {
        setFormData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
      } else toast(`El campo ${name} solo acepta letras`)
    } else if (name === "documento") {
      if (/^[A-Za-z0-9]*$/.test(value) || value === "") {
        setFormData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
      } else toast("El número de documento solo acepta letras y números")
    } else {
      setFormData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
    }
  }

  const handleDeleteAcompanante = (index) => setFormData(prev => { const n=[...prev.acompanantes]; n.splice(index,1); return {...prev,acompanantes:n} })

  const handleDescuentoChange = (e) => {
    const { name, value } = e.target
    if (name === "porcentaje") {
      const pct = Number(value), orig = Number(formData.total)
      setFormData(prev => ({ ...prev, descuento:{ ...prev.descuento, [name]:value, precioOriginal:orig, precioConDescuento:orig-(orig*pct/100) } }))
    } else {
      setFormData(prev => ({ ...prev, descuento:{ ...prev.descuento, [name]:value } }))
    }
  }

  /* ── handleSaveHospedaje — idéntico al original ── */
  const handleSaveHospedaje = async () => {
    try {
      if (editingId) {
        const res = await hospedajeService.updateHospedaje(editingId, formData)
        const upd = { ...res.hospedaje }
        setHospedajes(prev => prev.map(h => h._id === upd._id ? upd : h))
        handleClose()
        setTimeout(() => fetchHospedajes(), 500)
        Swal.fire({ ...SW, icon:"success", title:"¡Actualizado!", text:"El hospedaje se actualizó correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
      } else {
        const res = await hospedajeService.createHospedaje(formData)
        setHospedajes(prev => [...prev, res.hospedaje])
        handleClose()
        setTimeout(() => fetchHospedajes(), 500)
        Swal.fire({ ...SW, icon:"success", title:"¡Creado!", text:"El hospedaje se creó correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
      }
    } catch (error) {
      console.error("Error al guardar hospedaje", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al guardar el hospedaje." })
    }
  }

  const handleDetails = (hospedaje) => { setSelectedHospedaje(hospedaje); setDetailsOpen(true) }
  const handleCloseDetails = () => { setDetailsOpen(false); setSelectedHospedaje(null) }

  /* ── handleDelete — idéntico al original ── */
  const handleDelete = async (id, estado) => {
    if (estado === "confirmada") {
      Swal.fire({ ...SW, icon:"warning", title:"Acción no permitida", text:"No se puede eliminar un hospedaje confirmada." })
      return
    }
    const result = await Swal.fire({ ...SWD, title:"¿Estás seguro?", text:"Esta acción no se puede deshacer.", icon:"warning", showCancelButton:true, confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar" })
    if (result.isConfirmed) {
      try {
        await hospedajeService.deleteHospedaje(id)
        await Swal.fire({ ...SW, icon:"success", title:"¡Eliminado!", text:"El hospedaje se eliminó correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
        setHospedajes(prev => prev.filter(h => h._id !== id))
      } catch (error) {
        console.error("Error al eliminar hospedaje", error)
        Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al eliminar el hospedaje." })
      }
    }
  }

  /* ── handleToggleState — idéntico al original ── */
  const nextState = c => c === "pendiente" ? "confirmada" : c === "confirmada" ? "cancelada" : "pendiente"

  const handleToggleState = async (id, currentState) => {
    const newState = nextState(currentState)
    try {
      const res = await hospedajeService.updateHospedaje(id, { estado: newState })
      const upd = { ...res.hospedaje }
      setHospedajes(prev => prev.map(h => h._id === upd._id ? upd : h))
      setTimeout(() => fetchHospedajes(), 500)
      Swal.fire({ ...SW, icon:"success", title:"¡Actualizado!", text:"El estado del hospedaje se actualizó correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
    } catch (error) {
      console.error("Error al actualizar estado", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al actualizar el estado." })
    }
  }

  /* ── check-in — idéntico al original ── */
  const openCheckInModal = (hospedaje) => {
    setSelectedHospedaje(hospedaje)
    let horaEntrada = "", horaSalida = "", observaciones = ""
    const total = hospedaje.total || ""
    const acompanantes = hospedaje.acompanantes || []
    const checkInGeneral = (hospedaje.checkInData || []).find(d => d.servicio === "CheckInGeneral")
    if (checkInGeneral) {
      if (checkInGeneral.checkIn) horaEntrada = new Date(checkInGeneral.checkIn).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })
      if (checkInGeneral.checkOut) horaSalida = new Date(checkInGeneral.checkOut).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })
      observaciones = checkInGeneral.observaciones || ""
    }
    setCheckInData({ horaEntrada, horaSalida, total, observaciones, acompanantes })
    setEditMode(false)
    setCheckInModalOpen(true)
  }

  const closeCheckInModal = () => { setCheckInModalOpen(false); setSelectedHospedaje(null) }
  const toggleEdicionRapida = () => setEditMode(!editMode)

  const confirmCheckInCheckOut = async () => {
    if (!selectedHospedaje) return
    try {
      const today = new Date()
      const [eH, eM] = checkInData.horaEntrada.split(":")
      const [sH, sM] = checkInData.horaSalida.split(":")
      const checkInDate  = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(eH||0), parseInt(eM||0))
      const checkOutDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(sH||0), parseInt(sM||0))
      const serviciosToSend = [{ servicio:"CheckInGeneral", checkIn:checkInData.horaEntrada?checkInDate:null, checkOut:checkInData.horaSalida?checkOutDate:null, observaciones:checkInData.observaciones, estado:"Disponible" }]
      await hospedajeService.checkInCheckOut(selectedHospedaje._id, serviciosToSend)
      const updatedData = await hospedajeService.updateHospedaje(selectedHospedaje._id, { total:checkInData.total, acompanantes:checkInData.acompanantes })
      setHospedajes(prev => prev.map(h => h._id === updatedData.hospedaje._id ? updatedData.hospedaje : h))
      closeCheckInModal()
      setTimeout(() => fetchHospedajes(), 500)
      Swal.fire({ ...SW, icon:"success", title:"¡Check-in Realizado!", text:"Datos guardados correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
    } catch (error) {
      console.error("Error en check-in check-out", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al realizar check-in check-out." })
    }
  }

  const handleDeleteCheckIn = async () => {
    if (!selectedHospedaje) return
    closeCheckInModal()
    const result = await Swal.fire({ ...SWD, title:"¿Eliminar Check-in?", text:"Esta acción eliminará todos los datos de check-in/check-out. ¿Estás seguro?", icon:"warning", showCancelButton:true, confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar" })
    if (result.isConfirmed) {
      try {
        const serviciosToSend = [{ servicio:"CheckInGeneral", checkIn:null, checkOut:null, observaciones:"", estado:"Disponible" }]
        await hospedajeService.checkInCheckOut(selectedHospedaje._id, serviciosToSend)
        setCheckInData({ horaEntrada:"", horaSalida:"", total:selectedHospedaje.total||"", observaciones:"", acompanantes:selectedHospedaje.acompanantes||[] })
        setTimeout(() => fetchHospedajes(), 500)
        Swal.fire({ ...SW, icon:"success", title:"¡Check-in Eliminado!", text:"El check-in se ha eliminado correctamente.", timer:2000, showConfirmButton:false, timerProgressBar:true })
      } catch (error) {
        console.error("Error al eliminar check-in", error)
        Swal.fire({ ...SW, icon:"error", title:"Error", text:"Ocurrió un error al eliminar el check-in." })
      }
    }
  }

  const handleCheckInFieldChange = (field, value) => setCheckInData(prev => ({ ...prev, [field]:value }))

  const handleCheckInAcompananteChange = (index, e) => {
    const { name, value } = e.target
    const toast = (text) => Swal.fire({ ...SW, icon:"warning", title:"Validación", text, toast:true, position:"top-end", showConfirmButton:false, timer:3000, timerProgressBar:true })
    if (name === "nombre" || name === "apellido") {
      if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/.test(value)||value==="") {
        setCheckInData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
      } else toast(`El campo ${name} solo acepta letras`)
    } else if (name === "documento") {
      if (/^[A-Za-z0-9]*$/.test(value)||value==="") {
        setCheckInData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
      } else toast("El número de documento solo acepta letras y números")
    } else {
      setCheckInData(prev => { const n=[...prev.acompanantes]; n[index]={...n[index],[name]:value}; return {...prev,acompanantes:n} })
    }
  }

  const addCheckInAcompanante  = () => setCheckInData(prev => ({ ...prev, acompanantes:[...prev.acompanantes, { nombre:"", apellido:"", documento:"" }] }))
  const removeCheckInAcompanante = (index) => setCheckInData(prev => { const n=[...prev.acompanantes]; n.splice(index,1); return {...prev,acompanantes:n} })

  /* ── rooms — idéntico al original ── */
  const openRoomsModal = () => {
    const updatedRooms = rooms.map(room => {
      const upd = { ...room }
      hospedajes.forEach(h => {
        if (Array.isArray(h.apartamentos)) {
          h.apartamentos.forEach(apt => {
            if (apt && typeof apt === "object" && apt.NumeroApto && parseInt(apt.NumeroApto) === room.number) {
              upd.numeroReserva = h.numeroReserva
              upd.available = false
            }
          })
        }
      })
      return upd
    })
    setRooms(updatedRooms)
    setRoomsPage(0)
    setRoomsModalOpen(true)
  }

  const closeRoomsModal = () => setRoomsModalOpen(false)

  const handleSaveRooms = async () => {
    try {
      const response = await hospedajeService.saveHabitaciones(rooms)
      closeRoomsModal()
      Swal.fire({ ...SW, icon:"success", title:"¡Guardado!", text:response.msg, timer:2000, showConfirmButton:false, timerProgressBar:true })
    } catch (error) {
      console.error("Error al guardar habitaciones", error)
      Swal.fire({ ...SW, icon:"error", title:"Error", text:"No se pudieron guardar los cambios." })
    }
  }

  /* ── handleDownloadPDF — idéntico al original ── */
  const handleDownloadPDF = (hospedaje) => {
    const content = `Factura\nNúmero de Reserva: ${hospedaje.numeroReserva}\nCliente: ${hospedaje.cliente}\nFecha: ${hospedaje.fecha_inicio ? new Date(hospedaje.fecha_inicio).toLocaleDateString() : ""}\nTotal: ${hospedaje.total}\nEstado: ${hospedaje.estado}`
    const blob = new Blob([content], { type:"application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.setAttribute("download", `${hospedaje.numeroReserva}_factura.pdf`); document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
  }

  /* ── filter + paginate ── */
  const filteredHospedajes  = hospedajes.filter(h => (h.numeroReserva+"").toLowerCase().includes(searchTerm.toLowerCase()) || (h.cliente||"").toLowerCase().includes(searchTerm.toLowerCase()))
  const paginatedHospedajes = filteredHospedajes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages          = Math.max(1, Math.ceil(filteredHospedajes.length / rowsPerPage))
  const paginatedRooms      = rooms.slice(roomsPage * roomsPerPage, roomsPage * roomsPerPage + roomsPerPage)
  const totalRoomPages      = Math.max(1, Math.ceil(rooms.length / roomsPerPage))

  const handleChangePage    = (_, p) => setPage(p)
  const handleChangeRowsPerPage = e => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0) }
  const handleRoomsChangePage = (_, p) => setRoomsPage(p)
  const handleRoomsChangeRowsPerPage = e => { setRoomsPerPage(parseInt(e.target.value,10)); setRoomsPage(0) }

  /* ── wizard helpers — idéntico al original ── */
  const handleNext  = () => setActiveStep(p => p+1)
  const handleBack  = () => setActiveStep(p => p-1)
  const canAdvance  = () => {
    switch(activeStep) {
      case 0: return formData.cliente.trim()!==""&&formData.numeroIdentificacion.trim()!==""&&formData.email.trim()!==""&&formData.telefono.trim()!==""
      case 1: return formData.fecha_inicio!==""&&formData.fecha_fin!==""&&formData.apartamentos.length>0&&formData.estadia!==""&&formData.total!==""
      default: return true
    }
  }

  const hasCheckIn = h => h.checkInData && h.checkInData.find(d => d.servicio==="CheckInGeneral" && d.checkIn) !== undefined

  /* ── chip helpers ── */
  const estadoChipClass = e => e==="confirmada" ? classes.cConfirmada : e==="cancelada" ? classes.cCancelada : classes.cPendiente
  const estadoChipLabel = e => e.charAt(0).toUpperCase()+e.slice(1)

  /* stats */
  const totalConfirmadas = hospedajes.filter(h => h.estado==="confirmada").length
  const totalPendientes  = hospedajes.filter(h => h.estado==="pendiente").length
  const totalCanceladas  = hospedajes.filter(h => h.estado==="cancelada").length
  const totalCheckins    = hospedajes.filter(h => hasCheckIn(h)).length

  /* shared DlgHdr */
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

  /* helper field */
  const FmHlp = ({ msg }) => (
    <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", color:T.ink3, marginTop:4, marginLeft:14 }}>{msg}</Typography>
  )

  /* ── wizard step content — idéntico al original ── */
  const getStepContent = (step) => {
    switch(step) {
      case 0: return (
        <Box>
          <Typography className={classes.stepTitle}>Información del Cliente</Typography>
          <Typography className={classes.stepSubtitle}>Ingrese los datos personales del cliente para el hospedaje</Typography>
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}><User size={13} color={T.v1} strokeWidth={2.5}/></Box>
              Datos Personales
            </Box>
            {editingId && (
              <TextField className={classes.fmField} margin="dense" label="Número de Reserva" name="numeroReserva" value={formData.numeroReserva} fullWidth variant="outlined" disabled size="small"
                helperText={MI.IDENTIFICACION}
                InputProps={{ startAdornment:<InputAdornment position="start"><Hash size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
            )}
            <Box className={classes.fmRow}>
              <TextField className={classes.fmField} margin="dense" label="Cliente" name="cliente" value={formData.cliente} onChange={handleChange} fullWidth variant="outlined" required size="small"
                helperText={MI.CLIENTE}
                InputProps={{ startAdornment:<InputAdornment position="start"><User size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <TextField className={classes.fmField} margin="dense" label="Número de Identificación" name="numeroIdentificacion" value={formData.numeroIdentificacion} onChange={handleChange} fullWidth variant="outlined" required size="small"
                helperText={MI.IDENTIFICACION}
                InputProps={{ startAdornment:<InputAdornment position="start"><Hash size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
            </Box>
            <Box className={classes.fmRow}>
              <TextField className={classes.fmField} margin="dense" label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth variant="outlined" required size="small"
                helperText={MI.EMAIL}
                InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <TextField className={classes.fmField} margin="dense" label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth variant="outlined" required size="small"
                helperText={MI.TELEFONO}
                InputProps={{ startAdornment:<InputAdornment position="start"><Phone size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
            </Box>
          </Box>
        </Box>
      )
      case 1: return (
        <Box>
          <Typography className={classes.stepTitle}>Fechas y Apartamentos</Typography>
          <Typography className={classes.stepSubtitle}>Seleccione las fechas de hospedaje y los apartamentos</Typography>
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}><CalendarDays size={13} color={T.t1} strokeWidth={2.5}/></Box>
              Fechas de Hospedaje
            </Box>
            <Box className={classes.fmRow}>
              <TextField className={classes.fmField} margin="dense" label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} fullWidth InputLabelProps={{ shrink:true }} variant="outlined" required size="small"
                helperText={MI.FECHA_INICIO}
                InputProps={{ startAdornment:<InputAdornment position="start"><CalendarDays size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <TextField className={classes.fmField} margin="dense" label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} fullWidth InputLabelProps={{ shrink:true }} variant="outlined" required size="small"
                helperText={MI.FECHA_FIN}
                InputProps={{ startAdornment:<InputAdornment position="start"><CalendarDays size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
            </Box>
          </Box>
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(37,99,235,.12)" }}><Home size={13} color={T.b1} strokeWidth={2.5}/></Box>
              Apartamentos y Totales
            </Box>
            <FormControl fullWidth margin="dense" className={classes.fmField} size="small">
              <InputLabel id="apts-label" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3 }}>Apartamentos</InputLabel>
              <Select labelId="apts-label" multiple name="apartamentos" value={formData.apartamentos} onChange={handleApartamentosChange} label="Apartamentos"
                renderValue={(selected) => (
                  <Box style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {selected.map(value => {
                      const apt = apartamentosOptions.find(i => i.id === value)
                      return <Box key={value} className={classes.chip} component="span" style={{ background:"rgba(108,63,255,.10)", color:T.v1, border:`1px solid rgba(108,63,255,.20)` }}>{apt ? `Apartamento ${apt.numeroApto}` : `Apartamento ${value}`}</Box>
                    })}
                  </Box>
                )}
              >
                {apartamentosOptions.map(opt => <MenuItem key={opt.id} value={opt.id} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>{opt.label}</MenuItem>)}
              </Select>
              <FmHlp msg={MI.APARTAMENTOS}/>
            </FormControl>
            <Box className={classes.fmRow3}>
              <TextField className={classes.fmField} margin="dense" label="Estadía (días)" name="estadia" value={formData.estadia} fullWidth variant="outlined" disabled size="small"
                helperText={MI.ESTADIA}
                InputProps={{ startAdornment:<InputAdornment position="start"><CalendarDays size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <TextField className={classes.fmField} margin="dense" label="Total" name="total" type="number" value={formData.total} fullWidth variant="outlined" disabled size="small"
                helperText={MI.TOTAL}
                InputProps={{ startAdornment:<InputAdornment position="start"><DollarSign size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <FormControl fullWidth className={classes.fmField} margin="dense" size="small">
                <InputLabel id="estado-label" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3 }}>Estado</InputLabel>
                <Select labelId="estado-label" name="estado" value={formData.estado} onChange={handleChange} label="Estado">
                  <MenuItem value="pendiente"  style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>🕐 Pendiente</MenuItem>
                  <MenuItem value="confirmada" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>✅ Confirmada</MenuItem>
                  <MenuItem value="cancelada"  style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>❌ Cancelada</MenuItem>
                </Select>
                <FmHlp msg={MI.ESTADO}/>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )
      case 2: return (
        <Box>
          <Typography className={classes.stepTitle}>Descuentos</Typography>
          <Typography className={classes.stepSubtitle}>Aplique descuentos al hospedaje (opcional)</Typography>
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(255,123,44,.12)" }}><Tag size={13} color={T.a1} strokeWidth={2.5}/></Box>
              Descuento Aplicado
            </Box>
            <Box className={classes.fmRow3}>
              <FormControl fullWidth className={classes.fmField} margin="dense" size="small">
                <InputLabel id="pct-label" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3 }}>Porcentaje</InputLabel>
                <Select labelId="pct-label" name="porcentaje" value={formData.descuento.porcentaje} onChange={handleDescuentoChange} label="Porcentaje">
                  <MenuItem value="">Seleccionar</MenuItem>
                  {[5,10,15,20,25,30,35,40].map(v => <MenuItem key={v} value={String(v)} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem" }}>{v}%</MenuItem>)}
                </Select>
                <FmHlp msg={MI.DESCUENTO}/>
              </FormControl>
              <TextField className={classes.fmField} margin="dense" label="Precio Original" value={formData.descuento.precioOriginal} fullWidth variant="outlined" size="small" disabled
                InputProps={{ startAdornment:<InputAdornment position="start"><DollarSign size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              <TextField className={classes.fmField} margin="dense" label="Precio con Descuento" value={formData.descuento.precioConDescuento} fullWidth variant="outlined" size="small" disabled
                InputProps={{ startAdornment:<InputAdornment position="start"><DollarSign size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
            </Box>
          </Box>
        </Box>
      )
      case 3: return (
        <Box>
          <Typography className={classes.stepTitle}>Acompañantes</Typography>
          <Typography className={classes.stepSubtitle}>Agregue acompañantes al hospedaje (opcional)</Typography>
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background:"rgba(255,123,44,.12)" }}><Users size={13} color={T.a1} strokeWidth={2.5}/></Box>
              Lista de Acompañantes
            </Box>
            {formData.acompanantes?.map((acomp, index) => (
              <Box key={index} className={classes.acompCard}>
                <Box className={classes.acompCardHdr}>
                  <Typography className={classes.acompLbl}>Acompañante {index+1}</Typography>
                  <button className={classes.btnDelAcomp} onClick={() => handleDeleteAcompanante(index)}><X size={13} strokeWidth={2.5}/></button>
                </Box>
                <Box className={classes.fmRow}>
                  <TextField className={classes.fmField} label="Nombre" name="nombre" value={acomp.nombre} onChange={e => handleAcompananteChange(index,e)} variant="outlined" size="small" fullWidth
                    helperText={MI.ACOMP_NOMBRE}
                    InputProps={{ startAdornment:<InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                  <TextField className={classes.fmField} label="Apellido" name="apellido" value={acomp.apellido} onChange={e => handleAcompananteChange(index,e)} variant="outlined" size="small" fullWidth
                    helperText={MI.ACOMP_APELLIDO}
                    InputProps={{ startAdornment:<InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                </Box>
                <TextField className={classes.fmField} label="Documento" name="documento" value={acomp.documento} onChange={e => handleAcompananteChange(index,e)} variant="outlined" size="small" fullWidth
                  helperText={MI.ACOMP_DOC}
                  InputProps={{ startAdornment:<InputAdornment position="start"><Hash size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
              </Box>
            ))}
            <button className={classes.btnAgregarAcomp} onClick={agregarAcompanante}><PlusCircle size={14} strokeWidth={2.2}/>Agregar Acompañante</button>
          </Box>
        </Box>
      )
      case 4: return (
        <Box>
          <Typography className={classes.stepTitle}>Resumen del Hospedaje</Typography>
          <Typography className={classes.stepSubtitle}>Revise la información antes de finalizar</Typography>
          <Box className={classes.detGrid} style={{ marginTop:0 }}>
            <Box className={classes.summaryCard}>
              <Box className={classes.summaryTitle}><User size={14} color={T.v1} strokeWidth={2.2}/>Información del Cliente</Box>
              {[["Cliente", formData.cliente], ["Identificación", formData.numeroIdentificacion], ["Email", formData.email], ["Teléfono", formData.telefono]].map(([l,v]) => (
                <Box key={l} className={classes.summaryRow}><Typography className={classes.summaryLbl}>{l}</Typography><Typography className={classes.summaryVal}>{v}</Typography></Box>
              ))}
            </Box>
            <Box className={classes.summaryCard}>
              <Box className={classes.summaryTitle}><CalendarDays size={14} color={T.t1} strokeWidth={2.2}/>Fechas y Apartamentos</Box>
              {[
                ["Fecha Inicio", formData.fecha_inicio],
                ["Fecha Fin", formData.fecha_fin],
                ["Apartamentos", formData.apartamentos.map(id => { const apt=apartamentosOptions.find(i=>i.id===id); return apt?`Apto ${apt.numeroApto}`:id }).join(", ")],
                ["Estadía", `${formData.estadia} días`],
                ["Total", formatCOP(formData.total)],
                ["Estado", estadoChipLabel(formData.estado)],
              ].map(([l,v]) => (
                <Box key={l} className={classes.summaryRow}><Typography className={classes.summaryLbl}>{l}</Typography><Typography className={classes.summaryVal}>{v}</Typography></Box>
              ))}
            </Box>
            {formData.descuento?.porcentaje && (
              <Box className={classes.summaryCard}>
                <Box className={classes.summaryTitle}><Tag size={14} color={T.a1} strokeWidth={2.2}/>Descuento</Box>
                {[["Porcentaje", `${formData.descuento.porcentaje}%`], ["Precio Original", formatCOP(formData.descuento.precioOriginal)], ["Precio con Descuento", formatCOP(formData.descuento.precioConDescuento)]].map(([l,v]) => (
                  <Box key={l} className={classes.summaryRow}><Typography className={classes.summaryLbl}>{l}</Typography><Typography className={classes.summaryVal}>{v}</Typography></Box>
                ))}
              </Box>
            )}
            {formData.acompanantes?.length > 0 && (
              <Box className={classes.summaryCard}>
                <Box className={classes.summaryTitle}><Users size={14} color={T.a1} strokeWidth={2.2}/>Acompañantes ({formData.acompanantes.length})</Box>
                {formData.acompanantes.map((a, i) => (
                  <Box key={i} className={classes.summaryRow}>
                    <Typography className={classes.summaryLbl}>Acompañante {i+1}</Typography>
                    <Typography className={classes.summaryVal}>{a.nombre} {a.apellido} — {a.documento}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )
      default: return null
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <Box className={classes.root}>

      {/* HEADER */}
      <Box className={classes.hdr}>
        <Box className={classes.hdrLeft}>
          <Box className={classes.hdrIcon}><Hotel size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Hospedajes</Typography>
            <Typography className={classes.hdrSub}>Administra los hospedajes del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label:"Total",       val:hospedajes.length, sub:"registrados",   c:classes.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Confirmados", val:totalConfirmadas,  sub:"activos",       c:classes.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Pendientes",  val:totalPendientes,   sub:"por confirmar", c:classes.sp, orb:"#FF7B2C", col:"#c25a00", sc:"#c25a00" },
          { label:"Cancelados",  val:totalCanceladas,   sub:"inactivos",     c:classes.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
          { label:"Check-ins",   val:totalCheckins,     sub:"realizados",    c:classes.sc, orb:"#2563EB", col:"#1d4ed8", sc:"#1d4ed8" },
        ].map((s,i) => (
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
          <input className={classes.searchInput} placeholder="Buscar por reserva o cliente…" value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0) }}/>
          <span className={classes.kbd}>⌘K</span>
        </Box>
        <Box style={{ display:"flex", gap:10, alignItems:"center" }}>
          {/* Botón habitaciones */}
          <Tooltip title="Ver Habitaciones" placement="top">
            <button onClick={openRoomsModal}
              style={{ ...btnAddStyle, background:"linear-gradient(135deg,#2563EB,#7C3AED)", boxShadow:"0 5px 18px rgba(37,99,235,.40)", padding:"10px 18px" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 9px 26px rgba(37,99,235,.52)" }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 5px 18px rgba(37,99,235,.40)" }}>
              <Home size={16} strokeWidth={2.2}/>
              Habitaciones
            </button>
          </Tooltip>
          {/* Botón crear */}
          <button onClick={() => handleOpen(null)} style={btnAddStyle}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 9px 26px rgba(108,63,255,.52)" }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 5px 18px rgba(108,63,255,.40)" }}>
            <Hotel size={16} strokeWidth={2.2}/>
            Crear Hospedaje
          </button>
        </Box>
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table style={{ borderCollapse:"collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Cliente</HCell>
                <HCell>N° Reserva</HCell>
                <HCell>Fecha Inicio</HCell>
                <HCell>Fecha Fin</HCell>
                <HCell>Apartamentos</HCell>
                <HCell>Estadía</HCell>
                <HCell>Total</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHospedajes.length > 0 ? (
                paginatedHospedajes.map((h, i) => {
                  const checkedIn = hasCheckIn(h)
                  return (
                    <TableRow key={h._id} className={`${classes.tblRow} ${checkedIn ? classes.tblRowCheckedIn : ""}`}>
                      <NCell>
                        <Box className={classes.nameWrap} onClick={() => openCheckInModal(h)} title="Hacer Check-in / Check-out">
                          <Box className={`${classes.nameAv} ${checkedIn ? classes.nameAvCheckedIn : ""}`} style={{ background: checkedIn ? T.gt : avGrad(i) }}>
                            {getInitials(h.cliente)}
                          </Box>
                          <Box>
                            <Typography className={classes.nameText}>{h.cliente}</Typography>
                            {checkedIn
                              ? <Box className={classes.checkInBadge}><Check size={10} strokeWidth={2.5}/> Check-in realizado</Box>
                              : <Typography className={classes.nameId}>#{h.numeroReserva}</Typography>
                            }
                          </Box>
                        </Box>
                      </NCell>
                      <BCell>{h.numeroReserva}</BCell>
                      <BCell>{h.fecha_inicio?.substring(0,10)||""}</BCell>
                      <BCell>{h.fecha_fin?.substring(0,10)||""}</BCell>
                      <BCell>{formatApartamentosSimple(h.apartamentos)}</BCell>
                      <BCell>{h.estadia}</BCell>
                      <BCell>{formatCOP(h.total)}</BCell>
                      <BCell>
                        <Box className={`${classes.chip} ${estadoChipClass(h.estado)}`} component="span"
                          onClick={() => handleToggleState(h._id, h.estado)}
                          style={{ cursor:"pointer" }}>
                          {estadoChipLabel(h.estado)}
                        </Box>
                      </BCell>
                      <BCell>
                        <Box className={classes.actWrap}>
                          <Tooltip title="Ver detalles"  placement="top"><button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleDetails(h)}><Eye   size={14} strokeWidth={2.2}/></button></Tooltip>
                          <Tooltip title="Editar"         placement="top"><button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(h)}><Edit2  size={14} strokeWidth={2.2}/></button></Tooltip>
                          <Tooltip title="Eliminar"       placement="top"><button className={`${classes.actBtn} ${classes.bDel}`}  onClick={() => handleDelete(h._id, h.estado)}><Trash2 size={14} strokeWidth={2.2}/></button></Tooltip>
                        </Box>
                      </BCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow style={{ height:160 }}>
                  <TableCell colSpan={9} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron hospedajes que coincidan con la búsqueda." : "No hay hospedajes registrados."}
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
          Mostrando {filteredHospedajes.length===0?0:page*rowsPerPage+1}–{Math.min((page+1)*rowsPerPage,filteredHospedajes.length)} de {filteredHospedajes.length} hospedajes
        </Typography>
        <Box className={classes.pagBtns}>
          <button className={classes.pageBtn} onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{ opacity:page===0?.4:1 }}><ArrowLeft  size={12} strokeWidth={2.5}/></button>
          {Array.from({ length:totalPages },(_,i) => (
            <button key={i} className={`${classes.pageBtn} ${page===i?classes.pagBtnOn:""}`} onClick={() => setPage(i)}>{i+1}</button>
          ))}
          <button className={classes.pageBtn} onClick={() => setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ opacity:page>=totalPages-1?.4:1 }}><ArrowRight size={12} strokeWidth={2.5}/></button>
        </Box>
        <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Typography className={classes.pagInfo}>Filas:</Typography>
          <select value={rowsPerPage} onChange={handleChangeRowsPerPage}
            style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}>
            {[5,10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL WIZARD CREAR / EDITAR ━━━━━━━━ */}
      <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth classes={{ paper:classes.dlgPaperWizard }}
        disablePortal={false} container={typeof document!=="undefined"?document.body:undefined}>
        <DlgHdr
          icon={editingId ? <Edit2 size={20} color="#fff" strokeWidth={2.2}/> : <Hotel size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId ? "Editar Hospedaje" : "Crear Hospedaje"}
          sub={editingId ? "Modifica los datos del hospedaje seleccionado" : "Completa los pasos para registrar un nuevo hospedaje"}
          onClose={handleClose}
        />
        <Box className={classes.dlgBodyWizard}>
          {/* Progress bar */}
          <Box className={classes.progressBar}>
            <Box className={classes.progressFill} style={{ width:`${((activeStep+1)/steps.length)*100}%` }}/>
          </Box>
          {/* Stepper desktop */}
          <Box display={{ xs:"none", sm:"block" }}>
            <Stepper activeStep={activeStep} className={classes.stepperRoot}>
              {steps.map(s => <Step key={s.label}><StepLabel>{s.label}</StepLabel></Step>)}
            </Stepper>
          </Box>
          {/* Stepper mobile */}
          <Box display={{ xs:"block", sm:"none" }}>
            <MobileStepper variant="dots" steps={steps.length} position="static" activeStep={activeStep} className={classes.stepMobileStepper}
              nextButton={<Button size="small" onClick={handleNext} disabled={activeStep===steps.length-1||!canAdvance()} className={classes.btnSubmit} style={{ padding:"6px 14px", fontSize:".78rem" }}>Siguiente<KeyboardArrowRight/></Button>}
              backButton={<Button size="small" onClick={handleBack} disabled={activeStep===0} className={classes.btnCancel} style={{ padding:"6px 14px", fontSize:".78rem" }}><KeyboardArrowLeft/>Atrás</Button>}
            />
          </Box>
          {/* Step content */}
          <Box className={classes.stepContentWrapper}>{getStepContent(activeStep)}</Box>
        </Box>
        <Box className={classes.dlgFoot}>
          <Button onClick={handleBack} className={classes.btnCancel} disabled={activeStep===0}
            style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
            <ArrowLeft size={14} strokeWidth={2.2}/> Atrás
          </Button>
          <Box className={classes.dlgFootRight}>
            <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
            {activeStep===steps.length-1 ? (
              <Button onClick={handleSaveHospedaje} className={classes.btnFinish}>
                <Check size={15} strokeWidth={2.5}/> Finalizar
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canAdvance()} className={classes.btnSubmit}
                style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                Siguiente <ArrowRight size={14} strokeWidth={2.2}/>
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth={false} fullWidth classes={{ paper:classes.dlgPaperWizard }}
        disablePortal={false} container={typeof document!=="undefined"?document.body:undefined}>
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Hospedaje"
          sub="Información completa del hospedaje seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedHospedaje ? (
            <>
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>{getInitials(selectedHospedaje.cliente)}</Box>
                <Typography className={classes.detName}>{selectedHospedaje.cliente}</Typography>
                <Typography className={classes.detSub}>Reserva #{selectedHospedaje.numeroReserva}</Typography>
                <Box className={`${classes.chip} ${estadoChipClass(selectedHospedaje.estado)}`} component="span" style={{ marginTop:8 }}>
                  {estadoChipLabel(selectedHospedaje.estado)}
                </Box>
              </Box>
              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>
              <Box className={classes.detGrid}>
                {[
                  ["N° Identificación", selectedHospedaje.numeroIdentificacion, <Hash size={14} color={T.v1} strokeWidth={2.2}/>],
                  ["Email",             selectedHospedaje.email||"N/A",         <Mail size={14} color={T.t1} strokeWidth={2.2}/>],
                  ["Teléfono",          selectedHospedaje.telefono||"N/A",      <Phone size={14} color={T.b1} strokeWidth={2.2}/>],
                  ["Fecha Inicio",      selectedHospedaje.fecha_inicio?.substring(0,10)||"—", <CalendarDays size={14} color={T.v1} strokeWidth={2.2}/>],
                  ["Fecha Fin",         selectedHospedaje.fecha_fin?.substring(0,10)||"—",    <CalendarDays size={14} color={T.t1} strokeWidth={2.2}/>],
                  ["Estadía",           `${selectedHospedaje.estadia} días`,     <Clock size={14} color={T.a1} strokeWidth={2.2}/>],
                  ["Apartamentos",      formatApartamentosSimple(selectedHospedaje.apartamentos), <Home size={14} color={T.b1} strokeWidth={2.2}/>],
                  ["Total",             formatCOP(selectedHospedaje.total),      <DollarSign size={14} color={T.t1} strokeWidth={2.2}/>],
                ].map(([lbl, val, ico]) => (
                  <Box key={lbl} className={classes.detItem}>
                    <Typography className={classes.detLbl}>{lbl}</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}>{ico}<Typography className={classes.detVal}>{val}</Typography></Box>
                  </Box>
                ))}
                {selectedHospedaje.descuento?.porcentaje && (
                  <Box className={classes.detItem}>
                    <Typography className={classes.detLbl}>Descuento</Typography>
                    <Box style={{ display:"flex", alignItems:"center", gap:6 }}><Tag size={14} color={T.a1} strokeWidth={2.2}/><Typography className={classes.detVal}>{selectedHospedaje.descuento.porcentaje}% → {formatCOP(selectedHospedaje.descuento.precioConDescuento)}</Typography></Box>
                  </Box>
                )}
                {selectedHospedaje.acompanantes?.length > 0 && (
                  <Box className={classes.detItemFull}>
                    <Typography className={classes.detLbl}>Acompañantes</Typography>
                    <Box style={{ display:"flex", flexDirection:"column", gap:8, marginTop:6 }}>
                      {selectedHospedaje.acompanantes.map((ac, idx) => (
                        <Box key={idx} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10, background:"rgba(108,63,255,.05)", border:`1px solid ${T.bL}` }}>
                          <Box style={{ width:28, height:28, borderRadius:8, background:avGrad(idx), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <User size={13} color="#fff" strokeWidth={2.2}/>
                          </Box>
                          <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".86rem", fontWeight:600, color:T.ink }}>{ac.nombre} {ac.apellido}</Typography>
                          <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", color:T.ink3, marginLeft:"auto" }}>Doc: {ac.documento}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {selectedHospedaje.checkInData?.length > 0 && (
                  <Box className={classes.detItemFull}>
                    <Typography className={classes.detLbl}>Check-in / Check-out</Typography>
                    {selectedHospedaje.checkInData.map((item, idx) => (
                      <Box key={idx} style={{ marginTop:8, padding:"10px 12px", borderRadius:12, background:"rgba(0,212,170,.06)", border:"1px solid rgba(0,212,170,.20)" }}>
                        <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".80rem", fontWeight:700, color:"#00917a", marginBottom:6 }}>{item.servicio}</Typography>
                        <Box className={classes.fmRow}>
                          <Box>
                            <Typography className={classes.detLbl}>Check-in</Typography>
                            <Typography className={classes.detVal} style={{ fontSize:".84rem" }}>{item.checkIn ? new Date(item.checkIn).toLocaleString() : "N/A"}</Typography>
                          </Box>
                          <Box>
                            <Typography className={classes.detLbl}>Check-out</Typography>
                            <Typography className={classes.detVal} style={{ fontSize:".84rem" }}>{item.checkOut ? new Date(item.checkOut).toLocaleString() : "N/A"}</Typography>
                          </Box>
                        </Box>
                        {item.observaciones && <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".82rem", color:T.ink3, marginTop:6 }}>{item.observaciones}</Typography>}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Typography style={{ fontFamily:"'DM Sans',sans-serif", color:T.ink3, padding:"2rem", textAlign:"center" }}>Cargando detalles…</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Box/>
          <Box className={classes.dlgFootRight}>
            <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
            {selectedHospedaje && (
              <Button onClick={() => { handleCloseDetails(); handleOpen(selectedHospedaje) }} className={classes.btnSubmit}>
                <Edit2 size={14} strokeWidth={2.2}/> Editar
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL CHECK-IN / CHECK-OUT ━━━━━━━━ */}
      <Dialog open={checkInModalOpen} onClose={closeCheckInModal} maxWidth={false} fullWidth classes={{ paper:classes.dlgPaper }}
        disablePortal={false} container={typeof document!=="undefined"?document.body:undefined}>
        <DlgHdr
          icon={<KeyRound size={20} color="#fff" strokeWidth={2.2}/>}
          title="Check-in / Check-out"
          sub={selectedHospedaje ? `${selectedHospedaje.cliente} — Reserva #${selectedHospedaje.numeroReserva}` : ""}
          onClose={closeCheckInModal}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedHospedaje && (
            <>
              {/* check-in badge */}
              {hasCheckIn(selectedHospedaje) && (
                <Box className={classes.checkInCard}>
                  <Box className={classes.checkInCardText}><Check size={16} strokeWidth={2.5}/> Check-in realizado exitosamente</Box>
                  <button className={classes.btnDelAcomp} onClick={handleDeleteCheckIn} title="Eliminar Check-in">
                    <Trash2 size={13} strokeWidth={2.2}/>
                  </button>
                </Box>
              )}

              {/* Horarios */}
              <Box className={classes.fmSection}>
                <Box className={classes.fmSectionLbl}>
                  <Box className={classes.fmSectionIco} style={{ background:"rgba(0,212,170,.12)" }}><Clock size={13} color={T.t1} strokeWidth={2.5}/></Box>
                  Horarios
                </Box>
                <Box className={classes.fmRow}>
                  <TextField className={classes.fmField} label="Hora de Entrada" type="time" value={checkInData.horaEntrada}
                    onChange={e => handleCheckInFieldChange("horaEntrada", e.target.value)}
                    InputLabelProps={{ shrink:true }} inputProps={{ step:300 }} fullWidth disabled={!editMode} variant="outlined" size="small"
                    helperText={MI.HORA_ENTRADA}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Clock size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                  <TextField className={classes.fmField} label="Hora de Salida" type="time" value={checkInData.horaSalida}
                    onChange={e => handleCheckInFieldChange("horaSalida", e.target.value)}
                    InputLabelProps={{ shrink:true }} inputProps={{ step:300 }} fullWidth disabled={!editMode} variant="outlined" size="small"
                    helperText={MI.HORA_SALIDA}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Clock size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                </Box>
                <Box className={classes.fmRow}>
                  <TextField className={classes.fmField} label="Total" type="number" value={checkInData.total}
                    onChange={e => handleCheckInFieldChange("total", e.target.value)}
                    fullWidth disabled={!editMode} variant="outlined" size="small"
                    helperText="Monto total a cobrar."
                    InputProps={{ startAdornment:<InputAdornment position="start"><DollarSign size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                  <TextField className={classes.fmField} label="Observaciones" value={checkInData.observaciones}
                    onChange={e => handleCheckInFieldChange("observaciones", e.target.value)}
                    fullWidth disabled={!editMode} variant="outlined" multiline rows={2} size="small"
                    helperText={MI.OBSERVACIONES}
                    InputProps={{ startAdornment:<InputAdornment position="start" style={{ alignSelf:"flex-start", marginTop:8 }}><FileText size={15} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                </Box>
              </Box>

              {/* Acompañantes check-in */}
              <Box className={classes.fmSection}>
                <Box className={classes.fmSectionLbl}>
                  <Box className={classes.fmSectionIco} style={{ background:"rgba(255,123,44,.12)" }}><Users size={13} color={T.a1} strokeWidth={2.5}/></Box>
                  Acompañantes
                </Box>
                {checkInData.acompanantes?.map((acomp, index) => (
                  <Box key={index} className={classes.acompCard}>
                    <Box className={classes.acompCardHdr}>
                      <Typography className={classes.acompLbl}>Acompañante {index+1}</Typography>
                      {editMode && <button className={classes.btnDelAcomp} onClick={() => removeCheckInAcompanante(index)}><X size={13} strokeWidth={2.5}/></button>}
                    </Box>
                    <Box className={classes.fmRow}>
                      <TextField className={classes.fmField} label="Nombre" name="nombre" value={acomp.nombre}
                        onChange={e => handleCheckInAcompananteChange(index,e)} variant="outlined" size="small" fullWidth disabled={!editMode}
                        helperText={MI.ACOMP_NOMBRE}
                        InputProps={{ startAdornment:<InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                      <TextField className={classes.fmField} label="Apellido" name="apellido" value={acomp.apellido}
                        onChange={e => handleCheckInAcompananteChange(index,e)} variant="outlined" size="small" fullWidth disabled={!editMode}
                        helperText={MI.ACOMP_APELLIDO}
                        InputProps={{ startAdornment:<InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                    </Box>
                    <TextField className={classes.fmField} label="Documento" name="documento" value={acomp.documento}
                      onChange={e => handleCheckInAcompananteChange(index,e)} variant="outlined" size="small" fullWidth disabled={!editMode}
                      helperText={MI.ACOMP_DOC}
                      InputProps={{ startAdornment:<InputAdornment position="start"><Hash size={14} color={T.ink3} strokeWidth={2}/></InputAdornment> }}/>
                  </Box>
                ))}
                {editMode && <button className={classes.btnAgregarAcomp} onClick={addCheckInAcompanante}><PlusCircle size={14} strokeWidth={2.2}/>Agregar Acompañante</button>}
              </Box>
            </>
          )}
        </DialogContent>
        <Box className={classes.dlgFoot}>
          <Button onClick={toggleEdicionRapida} className={classes.btnCancel}
            style={{ color: editMode ? T.e1 : T.v1, borderColor: editMode ? T.e1 : "rgba(108,63,255,.16)" }}>
            {editMode ? "Desactivar Edición" : "Edición Rápida"}
          </Button>
          <Box className={classes.dlgFootRight}>
            <Button onClick={closeCheckInModal} className={classes.btnCancel}>Cancelar</Button>
            <Button onClick={confirmCheckInCheckOut} className={classes.btnSubmit}>
              <Check size={15} strokeWidth={2.5}/> Guardar
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ━━━━━━━━ MODAL HABITACIONES ━━━━━━━━ */}
      <Dialog open={roomsModalOpen} onClose={closeRoomsModal} maxWidth={false} fullWidth classes={{ paper:classes.dlgPaper }}
        disablePortal={false} container={typeof document!=="undefined"?document.body:undefined}>
        <DlgHdr
          icon={<Home size={20} color="#fff" strokeWidth={2.2}/>}
          title="Habitaciones Disponibles"
          sub="Consulta y gestiona la disponibilidad de habitaciones"
          onClose={closeRoomsModal}
        />
        <DialogContent className={classes.dlgBody}>
          <Box className={classes.roomsTableWrap}>
            <TableContainer component={Paper} elevation={0}>
              <Table style={{ borderCollapse:"collapse" }}>
                <TableHead>
                  <TableRow>
                    <HCell>Apartamento</HCell>
                    <HCell>N° Reserva</HCell>
                    <HCell>Disponibilidad</HCell>
                    <HCell>Observación</HCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRooms.map(room => (
                    <TableRow key={room.number} className={classes.tblRow}>
                      <BCell>{room.number}</BCell>
                      <BCell>
                        <TextField value={room.numeroReserva} variant="outlined" size="small" fullWidth
                          onChange={e => { const v=e.target.value; setRooms(prev => prev.map(r => r.number===room.number ? {...r,numeroReserva:v} : r)) }}
                          style={{ "& .MuiOutlinedInput-root":{ borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:".86rem", background:"rgba(244,241,255,.38)" } }}/>
                      </BCell>
                      <BCell>
                        <button
                          className={`${classes.roomAvailBtn} ${room.available ? classes.roomAvail : classes.roomUnavail}`}
                          onClick={() => setRooms(prev => prev.map(r => r.number===room.number ? {...r,available:!r.available} : r))}>
                          {room.available ? <><Check size={10} strokeWidth={2.5}/> Disponible</> : <><X size={10} strokeWidth={2.5}/> No disponible</>}
                        </button>
                      </BCell>
                      <BCell>
                        <TextField value={room.observation} variant="outlined" size="small" fullWidth
                          onChange={e => { const v=e.target.value; setRooms(prev => prev.map(r => r.number===room.number ? {...r,observation:v} : r)) }}/>
                      </BCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {/* Rooms pagination */}
          <Box className={classes.roomsPagWrap}>
            <Typography className={classes.pagInfo}>Mostrando {roomsPage*roomsPerPage+1}–{Math.min((roomsPage+1)*roomsPerPage,rooms.length)} de {rooms.length} habitaciones</Typography>
            <Box className={classes.pagBtns}>
              <button className={classes.pageBtn} onClick={() => setRoomsPage(p=>Math.max(0,p-1))} disabled={roomsPage===0} style={{ opacity:roomsPage===0?.4:1 }}><ArrowLeft size={12} strokeWidth={2.5}/></button>
              {Array.from({ length:totalRoomPages },(_,i) => (
                <button key={i} className={`${classes.pageBtn} ${roomsPage===i?classes.pagBtnOn:""}`} onClick={() => setRoomsPage(i)}>{i+1}</button>
              ))}
              <button className={classes.pageBtn} onClick={() => setRoomsPage(p=>Math.min(totalRoomPages-1,p+1))} disabled={roomsPage>=totalRoomPages-1} style={{ opacity:roomsPage>=totalRoomPages-1?.4:1 }}><ArrowRight size={12} strokeWidth={2.5}/></button>
            </Box>
            <Box style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Typography className={classes.pagInfo}>Por página:</Typography>
              <select value={roomsPerPage} onChange={handleRoomsChangeRowsPerPage}
                style={{ border:"1px solid rgba(108,63,255,.16)", borderRadius:9, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink3, background:"rgba(255,255,255,.80)", outline:"none", cursor:"pointer" }}>
                {[4,8,12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Box/>
          <Box className={classes.dlgFootRight}>
            <Button onClick={closeRoomsModal} className={classes.btnCancel}>Cerrar</Button>
            <Button onClick={handleSaveRooms} className={classes.btnSubmit}><Check size={15} strokeWidth={2.5}/> Guardar Cambios</Button>
          </Box>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default HospedajeList