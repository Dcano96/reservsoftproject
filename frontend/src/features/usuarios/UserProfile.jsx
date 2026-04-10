"use client"

import { useState, useEffect } from "react"
import Typography from "@material-ui/core/Typography"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import Snackbar from "@material-ui/core/Snackbar"
import IconButton from "@material-ui/core/IconButton"
import Chip from "@material-ui/core/Chip"
import Divider from "@material-ui/core/Divider"
import Alert from "@material-ui/lab/Alert"
import Save from "@material-ui/icons/Save"
import Edit from "@material-ui/icons/Edit"
import Close from "@material-ui/icons/Close"
import Person from "@material-ui/icons/Person"
import Email from "@material-ui/icons/Email"
import Phone from "@material-ui/icons/Phone"
import Security from "@material-ui/icons/Security"
import AssignmentInd from "@material-ui/icons/AssignmentInd"
import CalendarToday from "@material-ui/icons/CalendarToday"
import VerifiedUser from "@material-ui/icons/VerifiedUser"
import Lock from "@material-ui/icons/Lock"
import Visibility from "@material-ui/icons/Visibility"
import CheckCircle from "@material-ui/icons/CheckCircle"
import AccessTime from "@material-ui/icons/AccessTime"
import Work from "@material-ui/icons/Work"
import VpnKey from "@material-ui/icons/VpnKey"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import axios from "axios"
import jwtDecode from "jwt-decode"
import Swal from "sweetalert2"
import {
  X, Check, User, Mail, Phone as PhoneIcon, Key, FileText,
  Shield, Calendar, Clock, Eye, EyeOff, Save as SaveIcon,
  Edit2, Users, Lock as LockIcon, Star,
} from "lucide-react"
import MisReservas from "../clientes/mis-reservas"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VALIDACIONES — lógica intacta
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

const validarDocumento = (doc) => {
  if (!doc) return "El documento es obligatorio"
  if (doc.trim() === "") return "El documento no puede estar vacío"
  if (!REGEX.SOLO_NUMEROS.test(doc)) return "El documento debe contener solo números"
  if (doc.length < 6) return "El documento debe tener al menos 6 dígitos"
  if (doc.length > 15) return "El documento no puede tener más de 15 dígitos"
  if (REGEX.CARACTERES_REPETIDOS.test(doc)) return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
  if (REGEX.SECUENCIAS_NUMERICAS.test(doc)) return "El documento no puede contener secuencias numéricas obvias"
  if (/^0+$/.test(doc)) return "El documento no puede contener solo ceros"
  if (Number.parseInt(doc) < 1000) return "El documento no parece válido (valor muy bajo)"
  return ""
}

const validarNombre = (nom) => {
  if (!nom) return "El nombre es obligatorio"
  if (nom.trim() === "") return "El nombre no puede estar vacío"
  if (nom.length < 6) return "El nombre debe tener al menos 6 caracteres"
  if (nom.length > 30) return "El nombre no puede tener más de 30 caracteres"
  if (!REGEX.SOLO_LETRAS_ESPACIOS.test(nom)) return "El nombre solo debe contener letras y espacios"
  if (/\s{2,}/.test(nom)) return "El nombre no puede contener espacios múltiples consecutivos"
  const palabras = nom.trim().split(/\s+/)
  if (palabras.length < 2) return "Debe ingresar al menos nombre y apellido"
  for (const palabra of palabras) {
    if (palabra.length < 2) return "Cada palabra del nombre debe tener al menos 2 caracteres"
  }
  const palabrasProhibidas = ["admin", "usuario", "test", "prueba", "administrador"]
  for (const prohibida of palabrasProhibidas) {
    if (nom.toLowerCase().includes(prohibida)) return "El nombre contiene palabras no permitidas"
  }
  return ""
}

const validarTelefono = (tel) => {
  if (!tel) return "El teléfono es obligatorio"
  if (tel.trim() === "") return "El teléfono no puede estar vacío"
  if (!REGEX.SOLO_NUMEROS.test(tel)) return "El teléfono debe contener solo números"
  if (tel.length < 7) return "El teléfono debe tener al menos 7 dígitos"
  if (tel.length > 10) return "El teléfono no puede tener más de 10 dígitos"
  if (REGEX.CARACTERES_REPETIDOS.test(tel)) return "El teléfono no puede contener más de 3 dígitos repetidos consecutivos"
  if (REGEX.SECUENCIAS_NUMERICAS.test(tel)) return "El teléfono no puede contener secuencias numéricas obvias"
  if (/^0+$/.test(tel)) return "El teléfono no puede contener solo ceros"
  const numerosEspeciales = ["123", "911", "112", "119"]
  if (numerosEspeciales.includes(tel)) return "No se permite el uso de números de emergencia"
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
  for (const dominio of dominiosNoRecomendados) {
    if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
  }
  return ""
}

const validarPassword = (pass) => {
  if (!pass) return "La contraseña es obligatoria"
  if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (pass.length > 15) return "La contraseña no puede tener más de 15 caracteres"
  if (!/[a-z]/.test(pass)) return "La contraseña debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(pass)) return "La contraseña debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) return "La contraseña debe contener al menos un carácter especial"
  if (REGEX.SECUENCIAS_COMUNES.test(pass)) return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"
  if (REGEX.CARACTERES_REPETIDOS.test(pass)) return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase())) return "La contraseña no puede contener secuencias de teclado"
  return ""
}

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
    .rs-pop.rs-danger::before{background:linear-gradient(135deg,#FF3B82,#FF7B2C);}
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
    .swal2-icon.swal2-success{border-color:#00D4AA!important;color:#00D4AA!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#00D4AA!important;}
    .swal2-icon.swal2-success .swal2-success-ring{border-color:rgba(0,212,170,.30)!important;}
    .swal2-icon.swal2-error{border-color:#FF3B82!important;color:#FF3B82!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#FF3B82!important;}
    .swal2-icon.swal2-info{border-color:#6C3FFF!important;color:#6C3FFF!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#6C3FFF,#C040FF)!important;}
  `
  document.head.appendChild(s)
}
const SW  = { customClass:{ popup:"rs-pop", title:"rs-ttl", htmlContainer:"rs-bod", confirmButton:"rs-ok", cancelButton:"rs-cn" }, buttonsStyling:false }
const SWD = { ...SW, customClass:{ ...SW.customClass, popup:"rs-pop rs-danger" } }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES — idénticos al componente clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(() => ({
  /* ── Wrapper general ── */
  page:{ fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:0 },

  /* ── Header hero ── */
  hero:{
    borderRadius:26, overflow:"hidden", position:"relative",
    background:T.gv, marginBottom:0,
    boxShadow:"0 8px 32px rgba(108,63,255,0.32)",
    "&::before":{ content:'""', position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" },
    "&::after":{ content:'""', position:"absolute", bottom:-40, left:-40, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" },
  },
  heroInner:{ display:"flex", alignItems:"center", gap:22, padding:"28px 30px", position:"relative", zIndex:1 },
  heroAv:{
    width:76, height:76, borderRadius:22, flexShrink:0,
    background:"rgba(255,255,255,0.22)", border:"3px solid rgba(255,255,255,0.40)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#fff",
    boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
  },
  heroName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.55rem !important", fontWeight:"800 !important", color:"#fff !important", letterSpacing:"-0.5px", lineHeight:1.1 },
  heroEmail:{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:"rgba(255,255,255,.72)", marginTop:3 },
  heroMeta:{ display:"flex", alignItems:"center", gap:10, marginTop:10, flexWrap:"wrap" },
  heroChip:{
    display:"inline-flex", alignItems:"center", gap:5,
    background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.30)",
    borderRadius:20, padding:"4px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, color:"#fff",
  },
  heroTime:{ fontFamily:"'DM Sans',sans-serif", fontSize:".76rem", color:"rgba(255,255,255,.65)", display:"flex", alignItems:"center", gap:5 },

  /* ── Tabs ── */
  tabs:{
    display:"flex", background:"rgba(255,255,255,0.74)",
    backdropFilter:"blur(22px) saturate(180%)",
    borderBottom:`1px solid ${T.bL}`,
    padding:"0 26px",
  },
  tab:{
    display:"flex", alignItems:"center", gap:7,
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    fontSize:".84rem !important", color:`${T.ink3} !important`,
    padding:"14px 20px !important", borderRadius:"0 !important",
    borderBottom:"3px solid transparent",
    transition:"all .18s !important", textTransform:"none !important",
    "&:hover":{ color:`${T.v1} !important`, background:"rgba(108,63,255,.04) !important" },
  },
  tabActive:{
    color:`${T.v1} !important`,
    borderBottom:`3px solid ${T.v1}`,
    background:"rgba(108,63,255,.05) !important",
  },

  /* ── Panel root ── */
  panel:{
    fontFamily:"'DM Sans',sans-serif",
    borderRadius:"0 0 26px 26px", overflow:"hidden",
    background:"rgba(255,255,255,0.74)",
    backdropFilter:"blur(22px) saturate(180%)",
    WebkitBackdropFilter:"blur(22px) saturate(180%)",
    border:"1px solid rgba(255,255,255,0.85)",
    borderTop:"none",
    boxShadow:"0 4px 32px rgba(108,63,255,0.10)",
  },

  /* ── Panel header ── */
  panelHdr:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 26px 18px", borderBottom:`1px solid ${T.bL}`, flexWrap:"wrap", gap:12 },
  panelHdrLeft:{ display:"flex", alignItems:"center", gap:12 },
  panelHdrIcon:{ width:42, height:42, borderRadius:13, background:T.gv, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(108,63,255,0.38)" },
  panelHdrTitle:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.18rem !important", fontWeight:"800 !important", background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.3px" },
  panelHdrSub:{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", color:T.ink3, marginTop:2 },

  /* ── Botones ── */
  btnEdit:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 22px !important",
    boxShadow:"0 4px 14px rgba(108,63,255,.38) !important", transition:"all .2s !important",
    textTransform:"none !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(108,63,255,.50) !important" },
  },
  btnCancel:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    color:`${T.ink3} !important`, borderRadius:"50px !important",
    padding:"9px 22px !important", border:`1.5px solid rgba(108,63,255,.16) !important`,
    transition:"all .18s !important", textTransform:"none !important",
    "&:hover":{ background:"rgba(108,63,255,.06) !important", color:`${T.v1} !important` },
  },
  btnSave:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.gt} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"10px 26px !important",
    boxShadow:"0 4px 14px rgba(0,212,170,.38) !important", transition:"all .2s !important",
    textTransform:"none !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(0,212,170,.50) !important" },
  },
  btnPassword:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"10px 26px !important",
    boxShadow:"0 4px 14px rgba(108,63,255,.38) !important", transition:"all .2s !important",
    textTransform:"none !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(108,63,255,.50) !important" },
  },

  /* ── Info grid ── */
  infoBody:{ padding:"22px 26px" },
  infoGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  infoItem:{ borderRadius:14, padding:"14px 16px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", flexDirection:"column", gap:6 },
  infoLbl:{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:700, letterSpacing:".9px", textTransform:"uppercase", color:T.ink3, display:"flex", alignItems:"center", gap:6 },
  infoVal:{ fontFamily:"'DM Sans',sans-serif", fontSize:".92rem", fontWeight:600, color:T.ink },
  infoActions:{ display:"flex", justifyContent:"flex-end", padding:"12px 26px 22px", borderTop:`1px solid ${T.bL}`, marginTop:4 },

  /* ── TextField override ── */
  field:{
    "& .MuiOutlinedInput-root":{
      borderRadius:"13px !important", fontFamily:"'DM Sans',sans-serif !important",
      fontSize:".90rem", background:"rgba(244,241,255,.38)",
      "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:T.v1 },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:T.v1, borderWidth:2 },
    },
    "& .MuiInputLabel-outlined":{ fontFamily:"'DM Sans',sans-serif", color:T.ink3, fontSize:".88rem" },
    "& .MuiInputLabel-outlined.Mui-focused":{ color:T.v1 },
    "& .MuiFormHelperText-root":{ fontFamily:"'DM Sans',sans-serif", fontSize:".74rem" },
    marginBottom:"14px !important",
  },

  /* ── Sección ── */
  section:{ marginBottom:22 },
  sectionLbl:{
    display:"flex", alignItems:"center", gap:8,
    fontFamily:"'Syne',sans-serif", fontSize:".83rem", fontWeight:700,
    color:T.ink, marginBottom:14, paddingBottom:8,
    borderBottom:`1.5px solid rgba(108,63,255,.09)`, letterSpacing:"-.1px",
  },
  sectionIco:{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },

  /* ── Password form box ── */
  passBox:{
    borderRadius:18, padding:"20px", border:`1px solid ${T.bL}`,
    background:"rgba(244,241,255,.30)",
    borderLeft:`4px solid ${T.v1}`,
  },

  /* ── Permisos ── */
  permGrid:{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 },
  permChip:{
    display:"inline-flex", alignItems:"center", gap:5,
    background:T.bL, border:`1px solid ${T.bM}`,
    borderRadius:20, padding:"5px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:700, color:T.v1,
  },
  permModule:{ borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, marginBottom:8 },
  permModuleName:{ fontFamily:"'DM Sans',sans-serif", fontSize:".80rem", fontWeight:700, color:T.ink, marginBottom:6, display:"flex", alignItems:"center", gap:6 },
  permActions:{ display:"flex", flexWrap:"wrap", gap:6 },
  permActionChip:{ background:"rgba(108,63,255,.08)", borderRadius:8, padding:"3px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:600, color:T.v1 },

  /* ── Security info ── */
  secInfo:{ display:"flex", gap:12, flexWrap:"wrap", marginTop:16 },
  secItem:{ flex:"1 1 160px", borderRadius:14, padding:"12px 14px", background:"rgba(244,241,255,.45)", border:`1px solid ${T.bL}`, display:"flex", alignItems:"center", gap:10 },
  secItemText:{ fontFamily:"'DM Sans',sans-serif" },
  secItemLbl:{ fontSize:".70rem", fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", color:T.ink3 },
  secItemVal:{ fontSize:".84rem", fontWeight:600, color:T.ink, marginTop:2 },

  /* ── Role chip ── */
  roleChipLarge:{
    display:"inline-flex", alignItems:"center", gap:6,
    background:T.bL, border:`1.5px solid ${T.bM}`,
    borderRadius:20, padding:"6px 14px",
    fontFamily:"'DM Sans',sans-serif", fontSize:".80rem", fontWeight:700, color:T.v1,
  },

  /* ── Loading / Error ── */
  centered:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 26px", gap:14, background:"rgba(255,255,255,0.74)", borderRadius:26 },
  emptyIco:{ width:64, height:64, borderRadius:20, background:"rgba(108,63,255,.08)", display:"flex", alignItems:"center", justifyContent:"center" },
  emptyTitle:{ fontFamily:"'Syne',sans-serif", fontSize:"1.15rem", fontWeight:800, color:T.ink, textAlign:"center" },
  emptyText:{ fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", color:T.ink3, textAlign:"center" },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const UserProfile = () => {
  const classes = useStyles()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ nombre:"", email:"", telefono:"", documento:"" })
  const [passwordData, setPasswordData] = useState({ passwordActual:"", nuevoPassword:"", confirmarPassword:"" })
  const [passwordErrors, setPasswordErrors] = useState({ passwordActual:"", nuevoPassword:"", confirmarPassword:"" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswordActual, setShowPasswordActual] = useState(false)
  const [showNuevoPassword, setShowNuevoPassword] = useState(false)
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
  const [roleDetails, setRoleDetails] = useState(null)
  const [notification, setNotification] = useState({ open:false, message:"", severity:"success" })
  const [activeTab, setActiveTab] = useState("personal")
  const [errores, setErrores] = useState({ nombre:"", email:"", telefono:"", documento:"", passwordActual:"", nuevoPassword:"", confirmarPassword:"" })

  /* ── Fetch ── */
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const signal = controller.signal

    const fetchUserProfile = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No hay token de autenticación")

        const decoded = jwtDecode(token)
        const userId = decoded?.usuario?._id || decoded?.usuario?.id || decoded?.uid
        const userData = decoded?.usuario || {}
        if (!userId) throw new Error("No se pudo obtener el ID del usuario")

        try {
          const response = await axios.get(`http://localhost:5000/api/usuarios/${userId}`, { headers:{ Authorization:`Bearer ${token}` }, signal })
          if (!isMounted) return
          const apiUserData = response.data
          setProfile(apiUserData)
          setFormData({ nombre:apiUserData.nombre||"", email:apiUserData.email||"", telefono:apiUserData.telefono||"", documento:apiUserData.documento||"" })
          if (apiUserData.rol) {
            try {
              const roleName = typeof apiUserData.rol === "object" ? apiUserData.rol.nombre : apiUserData.rol
              const roleResponse = await axios.get(`http://localhost:5000/api/roles/byName/${roleName}`, { headers:{ Authorization:`Bearer ${token}` }, signal })
              if (!isMounted) return
              setRoleDetails(roleResponse.data)
            } catch (roleError) { console.warn("No se pudieron obtener detalles del rol:", roleError) }
          }
        } catch (apiError) {
          console.warn("Usando datos del token JWT como alternativa")
          setProfile({ _id:userId, nombre:userData.nombre||"Usuario", email:userData.email||"", telefono:userData.telefono||"", documento:userData.documento||"", rol:userData.rol||"Usuario", fechaCreacion:userData.fechaCreacion||new Date().toISOString(), ultimoAcceso:userData.ultimoAcceso||new Date().toISOString(), permisos:userData.permisos||[] })
          setFormData({ nombre:userData.nombre||"", email:userData.email||"", telefono:userData.telefono||"", documento:userData.documento||"" })
        }
        if (!isMounted) return
        setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error("Error al obtener el perfil del usuario:", error)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)
        if (isMounted) Swal.fire({ ...SW, title:"Error", text:"No se pudo cargar la información del perfil", icon:"error" })
      }
    }
    fetchUserProfile()
    return () => { isMounted = false; controller.abort() }
  }, [])

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "nombre") {
      if (value.length > 30) return
      if (value && !REGEX.SOLO_LETRAS_ESPACIOS.test(value.slice(-1))) return
      if (/\s{2,}/.test(value)) return
      setFormData(prev => ({ ...prev, [name]:value }))
      setErrores(prev => ({ ...prev, [name]:validarNombre(value) }))
    } else if (name === "documento") {
      if (value.length > 15) return
      if (value && !REGEX.SOLO_NUMEROS.test(value)) return
      setFormData(prev => ({ ...prev, [name]:value }))
      setErrores(prev => ({ ...prev, [name]:validarDocumento(value) }))
    } else if (name === "telefono") {
      if (value.length > 10) return
      if (value && !REGEX.SOLO_NUMEROS.test(value)) return
      setFormData(prev => ({ ...prev, [name]:value }))
      setErrores(prev => ({ ...prev, [name]:validarTelefono(value) }))
    } else if (name === "email") {
      if (value.length > 50) return
      const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
      if (!emailRegex.test(value)) return
      if (value.includes("@@") || value.includes("..") || value.includes(".@") || value.includes("@.")) return
      const atCount = (value.match(/@/g) || []).length
      if (atCount > 1) return
      const completeTLDs = [".com",".net",".org",".edu",".gov",".co",".io",".info",".biz",".app"]
      if (formData.email.includes("@") && formData.email.includes(".")) {
        const currentParts = formData.email.split("@"); const newParts = value.split("@")
        if (currentParts.length > 1 && newParts.length > 1) {
          const currentDomain = currentParts[1]; const newDomain = newParts[1]
          const hasTLDComplete = completeTLDs.some(tld => {
            if (currentDomain.endsWith(tld)) {
              const tldIndex = currentDomain.lastIndexOf(tld)
              const currentDomainWithoutTLD = currentDomain.substring(0, tldIndex)
              if (newDomain.length > currentDomainWithoutTLD.length + tld.length) return true
            }
            return false
          })
          if (hasTLDComplete) return
        }
      }
      setFormData(prev => ({ ...prev, [name]:value }))
      setErrores(prev => ({ ...prev, [name]:validarEmail(value) }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    if (value.length > 15) return
    if (name === "passwordActual") {
      setPasswordData(prev => ({ ...prev, [name]:value }))
      setPasswordErrors(prev => ({ ...prev, passwordActual:value ? "" : "La contraseña actual es obligatoria" }))
    } else if (name === "nuevoPassword") {
      if (value.length > 0) {
        if (!/[a-z]/.test(value)) { setPasswordErrors(prev => ({ ...prev, nuevoPassword:"La contraseña debe contener al menos una letra minúscula" })); setPasswordData(prev => ({ ...prev, [name]:value })); return }
        if (!/[A-Z]/.test(value)) { setPasswordErrors(prev => ({ ...prev, nuevoPassword:"La contraseña debe contener al menos una letra mayúscula" })); setPasswordData(prev => ({ ...prev, [name]:value })); return }
        if (!/[0-9]/.test(value)) { setPasswordErrors(prev => ({ ...prev, nuevoPassword:"La contraseña debe contener al menos un número" })); setPasswordData(prev => ({ ...prev, [name]:value })); return }
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) { setPasswordErrors(prev => ({ ...prev, nuevoPassword:"La contraseña debe contener al menos un carácter especial" })); setPasswordData(prev => ({ ...prev, [name]:value })); return }
      }
      setPasswordData(prev => ({ ...prev, [name]:value }))
      const error = validarPassword(value)
      setPasswordErrors(prev => ({ ...prev, nuevoPassword:error, confirmarPassword:passwordData.confirmarPassword && value !== passwordData.confirmarPassword ? "Las contraseñas no coinciden" : "" }))
    } else if (name === "confirmarPassword") {
      setPasswordData(prev => ({ ...prev, [name]:value }))
      setPasswordErrors(prev => ({ ...prev, confirmarPassword:value !== passwordData.nuevoPassword ? "Las contraseñas no coinciden" : "" }))
    }
  }

  const handleTogglePasswordActual   = () => setShowPasswordActual(!showPasswordActual)
  const handleToggleNuevoPassword    = () => setShowNuevoPassword(!showNuevoPassword)
  const handleToggleConfirmarPassword = () => setShowConfirmarPassword(!showConfirmarPassword)

  const handlePasswordActualKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      if (!passwordData.passwordActual) { setPasswordErrors(prev => ({ ...prev, passwordActual:"La contraseña actual es obligatoria" })); return }
      document.getElementById("nuevoPassword").focus()
    }
  }
  const handleNuevoPasswordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarPassword(passwordData.nuevoPassword)
      setPasswordErrors(prev => ({ ...prev, nuevoPassword:error }))
      if (!error) document.getElementById("confirmarPassword").focus()
    }
  }
  const handleConfirmarPasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (passwordData.confirmarPassword !== passwordData.nuevoPassword) { setPasswordErrors(prev => ({ ...prev, confirmarPassword:"Las contraseñas no coinciden" })); return }
      handlePasswordSubmit(e)
    }
  }

  const handleSubmit = async () => {
    try {
      const errNombre = validarNombre(formData.nombre)
      const errDocumento = validarDocumento(formData.documento)
      const errTelefono = validarTelefono(formData.telefono)
      const errEmail = validarEmail(formData.email)
      setErrores({ ...errores, nombre:errNombre, documento:errDocumento, telefono:errTelefono, email:errEmail })
      if (errNombre || errDocumento || errTelefono || errEmail || !formData.nombre || !formData.documento || !formData.telefono || !formData.email) {
        setNotification({ open:true, message:"Por favor, corrige los errores en el formulario antes de continuar.", severity:"error" }); return
      }
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!profile || !profile._id) throw new Error("No se pudo identificar al usuario")
      const updateData = { nombre:formData.nombre, email:formData.email, telefono:formData.telefono, documento:formData.documento }
      try {
        await axios.put(`http://localhost:5000/api/usuarios/${profile._id}`, updateData, { headers:{ Authorization:`Bearer ${token}` } })
        setProfile(prev => ({ ...prev, ...updateData }))
        setEditing(false); setLoading(false)
        setNotification({ open:true, message:"Perfil actualizado correctamente", severity:"success" })
      } catch (apiError) {
        console.warn("No se pudo actualizar el perfil en la API:", apiError)
        setProfile(prev => ({ ...prev, ...updateData }))
        setEditing(false); setLoading(false)
        setNotification({ open:true, message:"Perfil actualizado localmente (los cambios no se guardaron en el servidor)", severity:"warning" })
        Swal.fire({ ...SW, title:"Actualización local", text:"Tu perfil se ha actualizado solo en esta sesión.", icon:"info" })
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      setLoading(false)
      setNotification({ open:true, message:"Error al actualizar el perfil: "+(error.response?.data?.message||error.message), severity:"error" })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordData.passwordActual) { setPasswordErrors(prev => ({ ...prev, passwordActual:"La contraseña actual es obligatoria" })); return }
    const passwordError = validarPassword(passwordData.nuevoPassword)
    const confirmError = passwordData.nuevoPassword !== passwordData.confirmarPassword ? "Las contraseñas no coinciden" : ""
    setPasswordErrors({ passwordActual:passwordData.passwordActual ? "" : "La contraseña actual es obligatoria", nuevoPassword:passwordError, confirmarPassword:confirmError })
    if (!passwordData.passwordActual || passwordError || confirmError) {
      setNotification({ open:true, message:"Por favor, corrige los errores en el formulario antes de continuar.", severity:"error" }); return
    }
    if (passwordData.nuevoPassword.length < 8) {
      setPasswordErrors(prev => ({ ...prev, nuevoPassword:"La contraseña debe tener al menos 8 caracteres" }))
      setNotification({ open:true, message:"La contraseña debe tener al menos 8 caracteres", severity:"error" }); return
    }
    try {
      setPasswordLoading(true)
      const token = localStorage.getItem("token")
      const decoded = jwtDecode(token)
      const userId = profile?._id || decoded?.uid || decoded?.usuario?._id || decoded?.usuario?.id
      const passwordPayload = { passwordActual:passwordData.passwordActual, nuevoPassword:passwordData.nuevoPassword }
      const axiosConfig = { headers:{ Authorization:`Bearer ${token}` } }
      try {
        await axios.post("http://localhost:5000/api/usuarios/cambiar-password", passwordPayload, axiosConfig)
        handlePasswordSuccess(); return
      } catch (error1) {
        if (userId) {
          try {
            await axios.post(`http://localhost:5000/api/usuarios/${userId}/cambiar-password`, passwordPayload, axiosConfig)
            handlePasswordSuccess(); return
          } catch (error2) {
            try {
              await axios.post("http://localhost:5000/api/clientes/cambiar-password", passwordPayload, axiosConfig)
              handlePasswordSuccess(); return
            } catch (error3) { throw error3 }
          }
        } else { throw error1 }
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      setPasswordLoading(false)
      const errorMessage = error.response?.data?.msg || "Error al cambiar la contraseña"
      setNotification({ open:true, message:errorMessage, severity:"error" })
      Swal.fire({ ...SWD, title:"Error", text:errorMessage, icon:"error" })
    }
  }

  const handlePasswordSuccess = () => {
    setPasswordLoading(false)
    setPasswordData({ passwordActual:"", nuevoPassword:"", confirmarPassword:"" })
    setNotification({ open:true, message:"Contraseña actualizada correctamente", severity:"success" })
    Swal.fire({ ...SW, title:"¡Éxito!", text:"Tu contraseña ha sido actualizada correctamente", icon:"success" })
  }

  const handleCloseNotification = () => setNotification(prev => ({ ...prev, open:false }))

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    try {
      return new Date(dateString).toLocaleDateString("es-ES", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })
    } catch (e) { return "Fecha inválida" }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
  }

  const getRoleColor = (role) => {
    if (!role) return "#2563eb"
    const roleLower = typeof role === "object" ? role.nombre.toLowerCase() : role.toLowerCase()
    if (roleLower.includes("admin")) return "#2563eb"
    if (roleLower.includes("gerente")) return "#3b82f6"
    if (roleLower.includes("supervisor")) return "#60a5fa"
    return "#2563eb"
  }

  /* ── Loading ── */
  if (loading && !profile) {
    return (
      <div className={classes.centered}>
        <CircularProgress style={{ color:T.v1 }} size={44}/>
        <Typography className={classes.emptyText}>Cargando información del perfil…</Typography>
      </div>
    )
  }

  /* ── Error ── */
  if (error && !profile) {
    return (
      <div className={classes.centered}>
        <div className={classes.emptyIco}><X size={28} color={T.e1} strokeWidth={2}/></div>
        <Typography className={classes.emptyTitle}>Error al cargar el perfil</Typography>
        <Typography className={classes.emptyText}>{error}</Typography>
        <button onClick={() => window.location.reload()} style={{ background:T.gv, color:"#fff", border:"none", borderRadius:50, padding:"10px 26px", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".82rem", cursor:"pointer", boxShadow:"0 4px 14px rgba(108,63,255,.38)" }}>
          Reintentar
        </button>
      </div>
    )
  }

  const roleName  = typeof profile?.rol === "object" ? profile?.rol?.nombre : profile?.rol || "Usuario"

  return (
    <div className={classes.page}>

      {/* ── HERO ── */}
      <div className={classes.hero}>
        <div className={classes.heroInner}>
          <div className={classes.heroAv}>{getInitials(profile?.nombre)}</div>
          <div>
            <Typography className={classes.heroName}>{profile?.nombre || "Usuario"}</Typography>
            <Typography className={classes.heroEmail}>{profile?.email || "correo@ejemplo.com"}</Typography>
            <div className={classes.heroMeta}>
              <span className={classes.heroChip}>
                <Check size={10} strokeWidth={2.5}/> Cuenta Activa
              </span>
              <span className={classes.heroChip} style={{ background:"rgba(255,255,255,0.12)" }}>
                {roleName}
              </span>
              <span className={classes.heroTime}>
                <Clock size={12} strokeWidth={2}/> Último acceso: {formatDate(profile?.ultimoAcceso)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className={classes.tabs}>
        {[
          { key:"personal", label:"Información Personal", icon:<User size={14} strokeWidth={2}/> },
          { key:"security", label:"Seguridad y Permisos", icon:<Shield size={14} strokeWidth={2}/> },
          { key:"reservas", label:"Mis Reservas",         icon:<Calendar size={14} strokeWidth={2}/> },
        ].map(tab => (
          <Button
            key={tab.key}
            className={`${classes.tab} ${activeTab === tab.key ? classes.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </Button>
        ))}
      </div>

      {/* ── PANEL ── */}
      <div className={classes.panel}>

        {/* ════════ INFORMACIÓN PERSONAL ════════ */}
        {activeTab === "personal" && (
          <>
            <div className={classes.panelHdr}>
              <div className={classes.panelHdrLeft}>
                <div className={classes.panelHdrIcon}><User size={20} color="#fff" strokeWidth={2}/></div>
                <div>
                  <Typography className={classes.panelHdrTitle}>Información Personal</Typography>
                  <Typography className={classes.panelHdrSub}>Datos de tu cuenta registrados en el sistema</Typography>
                </div>
              </div>
              <Button
                className={editing ? classes.btnCancel : classes.btnEdit}
                onClick={() => setEditing(!editing)}
              >
                {editing ? <><X size={14} strokeWidth={2.5}/> Cancelar</> : <><Edit2 size={14} strokeWidth={2.2}/> Editar Información</>}
              </Button>
            </div>

            <div className={classes.infoBody}>
              {editing ? (
                /* Modo edición */
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <TextField fullWidth name="nombre" label="Nombre Completo" variant="outlined" value={formData.nombre} onChange={handleChange} error={!!errores.nombre} helperText={errores.nombre || "Solo letras y espacios (6-30 caracteres)"} className={classes.field} inputProps={{ maxLength:30 }}/>
                    <TextField fullWidth name="documento" label="Documento" variant="outlined" value={formData.documento} onChange={handleChange} error={!!errores.documento} helperText={errores.documento || "Solo números (6-15 dígitos)"} className={classes.field} inputProps={{ maxLength:15 }}/>
                    <TextField fullWidth name="email" label="Correo Electrónico" type="email" variant="outlined" value={formData.email} onChange={handleChange} error={!!errores.email} helperText={errores.email || "formato: usuario@dominio.com"} className={classes.field} inputProps={{ maxLength:50 }}/>
                    <TextField fullWidth name="telefono" label="Teléfono" variant="outlined" value={formData.telefono} onChange={handleChange} error={!!errores.telefono} helperText={errores.telefono || "Solo números (7-10 dígitos)"} className={classes.field} inputProps={{ maxLength:10 }}/>
                  </div>
                  <div className={classes.infoActions}>
                    <Button className={classes.btnSave} onClick={handleSubmit} disabled={loading}>
                      <Check size={15} strokeWidth={2.5}/>{loading ? "Guardando…" : "Guardar Cambios"}
                    </Button>
                  </div>
                </>
              ) : (
                /* Modo vista */
                <div className={classes.infoGrid}>
                  {[
                    { lbl:"Nombre Completo",    val:profile?.nombre,     ico:<User size={13} color={T.v1} strokeWidth={2}/> },
                    { lbl:"Documento",          val:profile?.documento,  ico:<FileText size={13} color={T.v1} strokeWidth={2}/> },
                    { lbl:"Correo Electrónico", val:profile?.email,      ico:<Mail size={13} color={T.t1} strokeWidth={2}/> },
                    { lbl:"Teléfono",           val:profile?.telefono,   ico:<PhoneIcon size={13} color={T.a1} strokeWidth={2}/> },
                    { lbl:"Fecha de Registro",  val:formatDate(profile?.fechaCreacion), ico:<Calendar size={13} color={T.b1} strokeWidth={2}/> },
                  ].map((item, i) => (
                    <div key={i} className={classes.infoItem} style={i === 4 ? { gridColumn:"1 / -1" } : {}}>
                      <span className={classes.infoLbl}>{item.ico} {item.lbl}</span>
                      <span className={classes.infoVal}>{item.val || "No disponible"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════ SEGURIDAD Y PERMISOS ════════ */}
        {activeTab === "security" && (
          <>
            <div className={classes.panelHdr}>
              <div className={classes.panelHdrLeft}>
                <div className={classes.panelHdrIcon} style={{ background:T.ge }}><Shield size={20} color="#fff" strokeWidth={2}/></div>
                <div>
                  <Typography className={classes.panelHdrTitle}>Seguridad y Permisos</Typography>
                  <Typography className={classes.panelHdrSub}>Gestiona tu contraseña y revisa tus permisos</Typography>
                </div>
              </div>
              <span className={classes.roleChipLarge}><Star size={12} strokeWidth={2}/> {roleName}</span>
            </div>

            <div className={classes.infoBody}>

              {/* Cambiar contraseña */}
              <div className={classes.section}>
                <div className={classes.sectionLbl}>
                  <div className={classes.sectionIco} style={{ background:"rgba(255,59,130,.10)" }}><Key size={13} color={T.e1} strokeWidth={2.5}/></div>
                  Cambiar Contraseña
                </div>
                <div className={classes.passBox}>
                  <TextField fullWidth id="passwordActual" name="passwordActual" label="Contraseña Actual" type={showPasswordActual ? "text" : "password"} value={passwordData.passwordActual} onChange={handlePasswordChange} onKeyDown={handlePasswordActualKeyDown} variant="outlined" required error={!!passwordErrors.passwordActual} helperText={passwordErrors.passwordActual} className={classes.field} inputProps={{ maxLength:15 }}
                    InputProps={{ endAdornment:<button type="button" onClick={handleTogglePasswordActual} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:T.ink3 }}>{showPasswordActual ? <EyeOff size={16}/> : <Eye size={16}/>}</button> }}
                  />
                  <TextField fullWidth id="nuevoPassword" name="nuevoPassword" label="Nueva Contraseña" type={showNuevoPassword ? "text" : "password"} value={passwordData.nuevoPassword} onChange={handlePasswordChange} onKeyDown={handleNuevoPasswordKeyDown} variant="outlined" required error={!!passwordErrors.nuevoPassword} helperText={passwordErrors.nuevoPassword || "Entre 8-15 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales."} className={classes.field} inputProps={{ minLength:8, maxLength:15 }}
                    InputProps={{ endAdornment:<button type="button" onClick={handleToggleNuevoPassword} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:T.ink3 }}>{showNuevoPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button> }}
                  />
                  <TextField fullWidth id="confirmarPassword" name="confirmarPassword" label="Confirmar Nueva Contraseña" type={showConfirmarPassword ? "text" : "password"} value={passwordData.confirmarPassword} onChange={handlePasswordChange} onKeyDown={handleConfirmarPasswordKeyDown} variant="outlined" required error={!!passwordErrors.confirmarPassword} helperText={passwordErrors.confirmarPassword} className={classes.field} inputProps={{ minLength:8, maxLength:15 }}
                    InputProps={{ endAdornment:<button type="button" onClick={handleToggleConfirmarPassword} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:T.ink3 }}>{showConfirmarPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button> }}
                  />
                  <Button className={classes.btnPassword} onClick={handlePasswordSubmit} disabled={passwordLoading}>
                    {passwordLoading ? <CircularProgress size={18} style={{ color:"#fff" }}/> : <><Key size={14} strokeWidth={2.2}/> Actualizar Contraseña</>}
                  </Button>
                </div>
              </div>

              <div style={{ height:1, background:T.bL, margin:"22px 0" }}/>

              {/* Descripción del rol */}
              {roleDetails && (
                <div className={classes.section}>
                  <div className={classes.sectionLbl}>
                    <div className={classes.sectionIco} style={{ background:"rgba(108,63,255,.12)" }}><Star size={13} color={T.v1} strokeWidth={2.5}/></div>
                    Rol Asignado
                  </div>
                  <div className={classes.infoItem}>
                    <span className={classes.infoLbl}>Descripción</span>
                    <span className={classes.infoVal}>{roleDetails.descripcion || "Sin descripción"}</span>
                  </div>
                </div>
              )}

              {/* Permisos */}
              <div className={classes.section}>
                <div className={classes.sectionLbl}>
                  <div className={classes.sectionIco} style={{ background:"rgba(37,99,235,.10)" }}><LockIcon size={13} color={T.b1} strokeWidth={2.5}/></div>
                  Permisos Asignados
                </div>
                {(roleDetails?.permisos || profile?.permisos || []).length > 0 ? (
                  typeof (roleDetails?.permisos || profile?.permisos || [])[0] === "string" ? (
                    <div className={classes.permGrid}>
                      {(roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                        <span key={index} className={classes.permChip}><Eye size={10} strokeWidth={2}/> {permiso}</span>
                      ))}
                    </div>
                  ) : (
                    (roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                      <div key={index} className={classes.permModule}>
                        <div className={classes.permModuleName}><Star size={12} color={T.v1} strokeWidth={2}/> {permiso.modulo}</div>
                        <div className={classes.permActions}>
                          {permiso.acciones && Object.entries(permiso.acciones).filter(([_, v]) => v).map(([key, _], idx) => (
                            <span key={idx} className={classes.permActionChip}>{key}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className={classes.infoItem}>
                    <span className={classes.infoVal} style={{ color:T.ink3, fontWeight:400 }}>No hay permisos asignados para este usuario.</span>
                  </div>
                )}
              </div>

              {/* Info de seguridad */}
              <div className={classes.secInfo}>
                <div className={classes.secItem}>
                  <Clock size={18} color={T.v1} strokeWidth={2}/>
                  <div className={classes.secItemText}>
                    <div className={classes.secItemLbl}>Último Acceso</div>
                    <div className={classes.secItemVal}>{formatDate(profile?.ultimoAcceso)}</div>
                  </div>
                </div>
                <div className={classes.secItem}>
                  <Calendar size={18} color={T.t1} strokeWidth={2}/>
                  <div className={classes.secItemText}>
                    <div className={classes.secItemLbl}>Cuenta Creada</div>
                    <div className={classes.secItemVal}>{formatDate(profile?.fechaCreacion)}</div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* ════════ MIS RESERVAS ════════ */}
        {activeTab === "reservas" && <MisReservas />}

      </div>

      {/* ── SNACKBAR ── */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical:"bottom", horizontal:"right" }}>
        <Alert severity={notification.severity} action={<IconButton size="small" color="inherit" onClick={handleCloseNotification}><Close fontSize="small"/></IconButton>}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UserProfile