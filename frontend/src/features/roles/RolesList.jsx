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
  InputAdornment,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Switch,
  Chip,
  Tooltip,
} from "@material-ui/core"
import {
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle,
  Settings,
  Shield,
  XCircle,
  User,
  Lock,
  PenTool,
  Key,
  ArrowLeft,
  ArrowRight,
  Users,
  Check,
} from "lucide-react"
import Swal from "sweetalert2"
import axios from "axios"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LÓGICA ORIGINAL — sin cambios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const availableModules = [
  "dashboard","usuarios","roles","clientes","apartamentos",
  "tipoApartamento","mobiliarios","reservas","pagos","descuentos","hospedaje",
]
const noDeleteModules = ["apartamentos","tipoApartamento","mobiliarios"]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS — idénticos a UsuariosList
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
   SWAL INJECT — mismo que UsuariosList
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
   TABLE CELLS — idénticos a UsuariosList
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
   BOTÓN NATIVO — igual que TipoApartamentoList
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
   STYLES — copiados 1:1 de UsuariosList
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
  cOn:  { background:"rgba(0,212,170,.12)", color:"#00917a" },
  cOff: { background:"rgba(255,59,130,.10)", color:"#cc2060" },
  cPerm:{ background:"rgba(108,63,255,.10)", color:"#5929d9", border:`1px solid rgba(108,63,255,.16)` },
  actWrap:{ display:"flex", justifyContent:"center", gap:5 },
  actBtn:{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", transition:"all .18s", "&:hover":{ transform:"scale(1.14)", boxShadow:"0 4px 14px rgba(0,0,0,.18)" } },
  bEdit:{ background:"linear-gradient(135deg,#00D4AA,#00A3E0)", color:"#fff" },
  bView:{ background:T.gv, color:"#fff" },
  bDel: { background:T.ge, color:"#fff" },
  bGhost:{ visibility:"hidden", background:"transparent" },
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
    border:`1px solid ${T.bM}`, width:680, maxWidth:"96vw",
    background:"rgba(255,255,255,0.98) !important", backdropFilter:"blur(24px)",
    overflow:"hidden", position:"relative",
    "&::before":{ content:'""', position:"absolute", top:0, left:0, right:0, height:3, background:T.gv, zIndex:10 },
  },
  dlgPaperWide:{
    borderRadius:"26px !important", boxShadow:"0 24px 64px rgba(108,63,255,0.24) !important",
    border:`1px solid ${T.bM}`, width:"90%", maxWidth:800,
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
  btnSubmit:{
    display:"flex !important", alignItems:"center !important", gap:"7px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    borderRadius:"50px !important", padding:"9px 26px !important",
    boxShadow:"0 4px 14px rgba(108,63,255,.38) !important", transition:"all .2s !important",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:"0 8px 22px rgba(108,63,255,.50) !important" },
    "&:disabled":{ background:"rgba(108,63,255,.30) !important", boxShadow:"none !important", transform:"none !important", cursor:"not-allowed !important" },
  },
  /* Form sections */
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
  /* Permissions */
  permCard:{
    borderRadius:16, padding:"16px 18px", marginBottom:14,
    background:"rgba(244,241,255,.40)",
    border:`1px solid ${T.bL}`,
    transition:"box-shadow .2s, transform .2s",
    "&:hover":{ boxShadow:"0 6px 20px rgba(108,63,255,.10)", transform:"translateY(-2px)" },
  },
  permHdr:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
  permTitle:{
    display:"flex", alignItems:"center", gap:8,
    fontFamily:"'Syne',sans-serif", fontSize:".90rem", fontWeight:700, color:T.ink,
  },
  permTitleIco:{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(108,63,255,.12)" },
  permBtns:{ display:"flex", gap:6 },
  permBtnSel:{
    display:"flex !important", alignItems:"center !important", gap:"5px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    fontSize:".72rem !important", padding:"4px 12px !important",
    borderRadius:"50px !important",
    boxShadow:"0 3px 10px rgba(108,63,255,.30) !important",
    transition:"all .18s !important", textTransform:"uppercase",
    "&:hover":{ transform:"translateY(-1px)", boxShadow:"0 5px 14px rgba(108,63,255,.42) !important" },
  },
  permBtnQuit:{
    display:"flex !important", alignItems:"center !important", gap:"5px !important",
    background:"rgba(255,59,130,.08) !important", color:"#cc2060 !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    fontSize:".72rem !important", padding:"4px 12px !important",
    borderRadius:"50px !important",
    border:"1px solid rgba(255,59,130,.18) !important",
    transition:"all .18s !important", textTransform:"uppercase",
    "&:hover":{ background:"rgba(255,59,130,.14) !important" },
  },
  switchRow:{
    display:"flex", alignItems:"center",
    padding:"9px 12px", borderRadius:12,
    background:"rgba(255,255,255,.72)",
    border:`1px solid ${T.bL}`,
    marginBottom:8, transition:"background .15s",
    "&:hover":{ background:"rgba(255,255,255,.95)" },
  },
  switchIco:{ color:T.v1, marginRight:10, flexShrink:0 },
  switchName:{ flex:1, fontFamily:"'DM Sans',sans-serif", fontSize:".88rem", fontWeight:600, color:T.ink2 },
  /* Tabs */
  tabsRoot:{
    marginBottom:16,
    "& .MuiTabs-indicator":{ background:T.gv, height:3, borderRadius:3 },
    borderBottom:`1.5px solid ${T.bL}`,
  },
  tabItem:{
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"600 !important",
    fontSize:".82rem !important", textTransform:"none !important",
    color:`${T.ink3} !important`, minWidth:"90px !important",
    transition:"color .2s !important",
    "&.Mui-selected":{ color:`${T.v1} !important` },
    "&:hover":{ background:"rgba(108,63,255,.05) !important" },
  },
  /* Global buttons row */
  globalBtns:{
    display:"flex", gap:10, marginBottom:16, flexWrap:"wrap",
  },
  btnAssignAll:{
    display:"flex !important", alignItems:"center !important", gap:"6px !important",
    background:`${T.gv} !important`, color:"#fff !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    fontSize:".78rem !important", padding:"7px 18px !important",
    borderRadius:"50px !important",
    boxShadow:"0 3px 12px rgba(108,63,255,.32) !important",
    transition:"all .18s !important", textTransform:"uppercase",
    "&:hover":{ transform:"translateY(-1px)", boxShadow:"0 6px 18px rgba(108,63,255,.46) !important" },
  },
  btnRemoveAll:{
    display:"flex !important", alignItems:"center !important", gap:"6px !important",
    background:"rgba(255,59,130,.08) !important", color:"#cc2060 !important",
    fontFamily:"'DM Sans',sans-serif !important", fontWeight:"700 !important",
    fontSize:".78rem !important", padding:"7px 18px !important",
    borderRadius:"50px !important",
    border:"1px solid rgba(255,59,130,.18) !important",
    transition:"all .18s !important", textTransform:"uppercase",
    "&:hover":{ background:"rgba(255,59,130,.14) !important" },
  },
  /* Details */
  detHero:{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0 20px" },
  detAv:{
    width:76, height:76, borderRadius:22, background:T.gv,
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 10px 32px rgba(108,63,255,.40)", marginBottom:12,
    fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#fff",
  },
  detName:{ fontFamily:"'Syne',sans-serif !important", fontSize:"1.20rem !important", fontWeight:"800 !important", color:`${T.ink} !important`, marginBottom:4, textAlign:"center" },
  detStatusChip:{ marginTop:4 },
  /* Chips detalles */
  detPermChip:{
    fontFamily:"'DM Sans',sans-serif", fontWeight:700,
    fontSize:".74rem", padding:"6px 14px", borderRadius:20,
    margin:"4px 4px",
  },
  detPermChipActive:{ background:"rgba(108,63,255,.12)", color:"#5929d9", border:`1px solid rgba(108,63,255,.18)` },
  detPermChipInactive:{ background:"rgba(176,165,200,.12)", color:T.ink3, border:`1px solid rgba(176,165,200,.20)` },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const RolesList = () => {
  const cls = useStyles()

  /* ── state — idéntico al original ── */
  const [roles,         setRoles]         = useState([])
  const [open,          setOpen]          = useState(false)
  const [editingId,     setEditingId]     = useState(null)
  const [selectedRole,  setSelectedRole]  = useState(null)
  const [formData,      setFormData]      = useState({ nombre:"", estado:true, permisos:[], nombrePersonalizado:"", isAdminRole:false })
  const [searchTerm,    setSearchTerm]    = useState("")
  const [page,          setPage]          = useState(0)
  const [rowsPerPage,   setRowsPerPage]   = useState(5)
  const [detailsOpen,   setDetailsOpen]   = useState(false)
  const [tabValue,      setTabValue]      = useState(0)
  const [formErrors,    setFormErrors]    = useState({ nombre:"", nombrePersonalizado:"", permisos:"" })
  const [isFormValid,   setIsFormValid]   = useState(false)

  /* ── lógica original — sin cambios ── */
  const getTokenHeader = () => ({ Authorization:`Bearer ${localStorage.getItem("token")}` })

  const fetchRoles = async () => {
    try { const r = await axios.get("http://localhost:5000/api/roles",{ headers:getTokenHeader() }); setRoles(r.data) }
    catch(e) { console.error(e); Swal.fire({...SW,icon:"error",title:"Error",text:"No se pudieron cargar los roles."}) }
  }
  useEffect(() => { fetchRoles() }, [])

  const checkRoleExists = (name, excludeId=null) =>
    roles.some(r => r.nombre.toLowerCase()===name.toLowerCase() && r._id!==excludeId)

  const initializePermissions = () =>
    availableModules.map(modulo => ({
      modulo,
      acciones:{ crear:false, leer:modulo==="dashboard"?true:false, actualizar:false, eliminar:false },
    }))

  const handleOpen = role => {
    setFormErrors({ nombre:"", nombrePersonalizado:"", permisos:"" })
    if (role) {
      let permisos = role.permisos||[]
      if (permisos.length>0 && typeof permisos[0]==="string")
        permisos = permisos.map(m=>({ modulo:m, acciones:{ crear:false,leer:true,actualizar:false,eliminar:false } }))
      const existing = permisos.map(p=>p.modulo)
      availableModules.filter(m=>!existing.includes(m)).forEach(m=>
        permisos.push({ modulo:m, acciones:{ crear:false,leer:false,actualizar:false,eliminar:false } })
      )
      const isAdmin = role.nombre.toLowerCase()==="administrador"
      setFormData({ nombre:role.nombre, estado:isAdmin?true:role.estado, permisos, nombrePersonalizado:"", isAdminRole:isAdmin })
      setEditingId(role._id); setIsFormValid(true)
    } else {
      setFormData({ nombre:"", estado:true, permisos:initializePermissions(), nombrePersonalizado:"", isAdminRole:false })
      setEditingId(null); setIsFormValid(false)
    }
    setOpen(true); setTabValue(0)
  }
  const handleClose = () => { setOpen(false); setFormErrors({ nombre:"", nombrePersonalizado:"", permisos:"" }) }

  const handleDetails = role => {
    let permisos = role.permisos||[]
    if (permisos.length>0 && typeof permisos[0]==="string")
      permisos = permisos.map(m=>({ modulo:m, acciones:{ crear:false,leer:true,actualizar:false,eliminar:false } }))
    setSelectedRole({...role,permisos}); setDetailsOpen(true)
  }
  const handleCloseDetails = () => setDetailsOpen(false)

  const handleChange = e => {
    const{name,value}=e.target
    setFormData({...formData,[name]:value})
    validateField(name,value)
  }
  const validateField = (name,value) => {
    let err=""
    if (name==="nombre"){ if(editingId) return true }
    else if (name==="nombrePersonalizado"){
      if(!editingId&&(!value||!value.trim())) err="El nombre del rol es obligatorio"
      else if(value&&value.length<6) err="El nombre debe tener al menos 6 caracteres"
      else if(value&&value.length>30) err="El nombre no puede exceder 30 caracteres"
      else if(value&&!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) err="El nombre solo puede contener letras y espacios"
      else if(value&&checkRoleExists(value.trim(),editingId)) err="Ya existe un rol con este nombre"
    }
    setFormErrors(p=>({...p,[name]:err}))
    setTimeout(()=>validateForm({...formData,[name]:value}),0)
    return !err
  }
  const validateForm = data => {
    const hasPerms = data.permisos.some(p=>p.acciones.crear||p.acciones.leer||p.acciones.actualizar||p.acciones.eliminar)
    if(!editingId){
      setIsFormValid(
        !!data.nombrePersonalizado&&data.nombrePersonalizado.trim()!==""&&
        data.nombrePersonalizado.length>=6&&data.nombrePersonalizado.length<=30&&
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.nombrePersonalizado)&&
        !checkRoleExists(data.nombrePersonalizado.trim(),editingId)&&hasPerms
      )
    } else { setIsFormValid(hasPerms) }
  }

  const handlePermissionChange = (idx,accion,checked) => {
    const up=[...formData.permisos]; up[idx].acciones[accion]=checked
    setFormData({...formData,permisos:up})
  }
  const handleSelectAllForModule = idx => {
    const up=[...formData.permisos]; const m=up[idx].modulo
    up[idx].acciones = m==="dashboard"
      ? {crear:false,leer:true,actualizar:false,eliminar:false}
      : {crear:true,leer:true,actualizar:true,eliminar:!noDeleteModules.includes(m)}
    setFormData({...formData,permisos:up})
  }
  const handleRemoveAllForModule = idx => {
    const up=[...formData.permisos]
    up[idx].acciones={crear:false,leer:false,actualizar:false,eliminar:false}
    setFormData({...formData,permisos:up})
  }
  const handleSelectAllPermissions = () => {
    setFormData({...formData,permisos:formData.permisos.map(p=>({
      ...p,
      acciones:p.modulo==="dashboard"
        ?{crear:false,leer:true,actualizar:false,eliminar:false}
        :{crear:true,leer:true,actualizar:true,eliminar:!noDeleteModules.includes(p.modulo)}
    }))})
  }
  const handleRemoveAllPermissions = () => {
    setFormData({...formData,permisos:formData.permisos.map(p=>({...p,acciones:{crear:false,leer:false,actualizar:false,eliminar:false}}))})
  }

  const prepareFormData = () => {
    const f={...formData}
    if(!editingId){ f.nombre=f.nombrePersonalizado||""; f.estado=true }
    if(f.nombre.toLowerCase()==="administrador") f.estado=true
    delete f.nombrePersonalizado; delete f.isAdminRole
    return f
  }

  const handleSubmit = async () => {
    const tempErrors={}
    if(!editingId){
      if(!formData.nombrePersonalizado||!formData.nombrePersonalizado.trim()) tempErrors.nombrePersonalizado="El nombre del rol es obligatorio"
      else if(checkRoleExists(formData.nombrePersonalizado.trim(),editingId)) tempErrors.nombrePersonalizado="Ya existe un rol con este nombre"
    }
    const hasPerms=formData.permisos.some(p=>p.acciones.crear||p.acciones.leer||p.acciones.actualizar||p.acciones.eliminar)
    if(!hasPerms) tempErrors.permisos="Debe seleccionar al menos un permiso"
    if(Object.keys(tempErrors).length>0){
      setFormErrors(tempErrors)
      let title="Error de validación", text=""
      if(tempErrors.nombrePersonalizado?.includes("Ya existe")) { title="Rol duplicado"; text=`Ya existe un rol con el nombre "${formData.nombrePersonalizado}".` }
      else if(tempErrors.permisos) { title="Permisos requeridos"; text="Debe seleccionar al menos un permiso para el rol." }
      else text=Object.values(tempErrors)[0]
      Swal.fire({...SW,icon:"error",title,text}); return
    }
    try {
      const d=prepareFormData()
      if(editingId){
        await axios.put(`http://localhost:5000/api/roles/${editingId}`,d,{headers:getTokenHeader()})
        Swal.fire({...SW,icon:"success",title:"Actualizado",text:"El rol se actualizó correctamente.",timer:2200,timerProgressBar:true,showConfirmButton:false})
      } else {
        await axios.post("http://localhost:5000/api/roles",d,{headers:getTokenHeader()})
        Swal.fire({...SW,icon:"success",title:"Creado",text:"El rol se creó correctamente.",timer:2200,timerProgressBar:true,showConfirmButton:false})
      }
      fetchRoles(); handleClose()
    } catch(e){
      console.error(e)
      let msg="Ocurrió un error al guardar el rol."
      if(e.response?.data?.msg){
        const s=e.response.data.msg
        if(s.includes("ya existe")||s.includes("duplicate")) msg=`No se puede crear el rol "${formData.nombrePersonalizado||formData.nombre}" porque ya existe.`
        else msg=s
      }
      Swal.fire({...SW,icon:"error",title:"Error",text:msg})
    }
  }

  const handleDelete = async id => {
    const role=roles.find(r=>r._id===id)
    if(role?.nombre.toLowerCase()==="administrador"){ Swal.fire({...SW,icon:"error",title:"Acción no permitida",text:"El rol de administrador no puede ser eliminado"}); return }
    const r=await Swal.fire({...SWD,title:"¿Eliminar rol?",text:"Esta acción no se puede deshacer",icon:"question",showCancelButton:true,confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"})
    if(r.isConfirmed){
      try { await axios.delete(`http://localhost:5000/api/roles/${id}`,{headers:getTokenHeader()}); Swal.fire({...SW,icon:"success",title:"Eliminado",text:"El rol se eliminó correctamente.",timer:2000,timerProgressBar:true,showConfirmButton:false}); fetchRoles() }
      catch(e){ Swal.fire({...SW,icon:"error",title:"Error",text:e.response?.data?.msg||"Ocurrió un error al eliminar el rol."}) }
    }
  }

  /* helpers */
  const getInitials = name => name.split(" ").map(w=>w[0]).join("").toUpperCase().substring(0,2)
  const formatPermissions = permisos => {
    if(!permisos||permisos.length===0) return "Sin permisos"
    if(typeof permisos[0]==="string") return permisos.join(", ")
    const mods = permisos.filter(p=>p.acciones.crear||p.acciones.leer||p.acciones.actualizar||p.acciones.eliminar).map(p=>p.modulo)
    return mods.length>0 ? mods.join(", ") : "Sin permisos"
  }
  const handleTabChange = (_,v) => setTabValue(v)
  const handleFieldBlur = e => { const{name,value}=e.target; validateField(name,value) }

  const getModuleIcon = m => {
    switch(m){
      case "dashboard":   return <Settings  size={15} color={T.v1}/>
      case "usuarios":    return <User      size={15} color={T.v1}/>
      case "roles":       return <Shield    size={15} color={T.v1}/>
      case "clientes":    return <User      size={15} color={T.v1}/>
      default:            return <Settings  size={15} color={T.v1}/>
    }
  }
  const getActionIcon = a => {
    switch(a){
      case "crear":     return <PenTool size={15} color={T.v1}/>
      case "leer":      return <Eye     size={15} color={T.v1}/>
      case "actualizar":return <Edit2   size={15} color={T.v1}/>
      case "eliminar":  return <Trash2  size={15} color={T.e1}/>
      default:          return <Settings size={15} color={T.v1}/>
    }
  }

  /* stats */
  const totalActive   = roles.filter(r=>r.estado).length
  const totalInactive = roles.filter(r=>!r.estado).length
  const filtered      = roles.filter(r=>r.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const paginated     = filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage)
  const totalPages    = Math.max(1, Math.ceil(filtered.length/rowsPerPage))

  /* shared dialog header */
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

  /* permission panel builder */
  const PermPanel = ({ moduleNames }) => (
    <Box style={{ paddingTop:8 }}>
      {formData.permisos.filter(p=>moduleNames.includes(p.modulo)).map(permiso => {
        const idx = formData.permisos.findIndex(p=>p.modulo===permiso.modulo)
        return (
          <Box key={permiso.modulo} className={cls.permCard}>
            <Box className={cls.permHdr}>
              <Box className={cls.permTitle}>
                <Box className={cls.permTitleIco}>{getModuleIcon(permiso.modulo)}</Box>
                {permiso.modulo.charAt(0).toUpperCase()+permiso.modulo.slice(1)}
              </Box>
              <Box className={cls.permBtns}>
                <Button size="small" className={cls.permBtnSel} onClick={()=>handleSelectAllForModule(idx)}>
                  <CheckCircle size={11} strokeWidth={2.5}/> Sel.
                </Button>
                <Button size="small" className={cls.permBtnQuit} onClick={()=>handleRemoveAllForModule(idx)}>
                  <XCircle size={11} strokeWidth={2.5}/> Quitar
                </Button>
              </Box>
            </Box>
            <Divider style={{ margin:"10px 0", background:T.bL }}/>
            <Box>
              {permiso.modulo==="dashboard" ? (
                <Box className={cls.switchRow}>
                  <Eye className={cls.switchIco} size={16}/>
                  <Typography className={cls.switchName}>Acceso</Typography>
                  <FormControlLabel control={<Switch checked={permiso.acciones.leer} onChange={e=>handlePermissionChange(idx,"leer",e.target.checked)} color="primary"/>} label=""/>
                </Box>
              ) : (
                <>
                  {[
                    { key:"crear",     label:"Crear",    icon:<PenTool size={15}/> },
                    { key:"leer",      label:"Ver",      icon:<Eye     size={15}/> },
                    { key:"actualizar",label:"Editar",   icon:<Edit2   size={15}/> },
                    ...(!noDeleteModules.includes(permiso.modulo) ? [{ key:"eliminar", label:"Eliminar", icon:<Trash2 size={15}/> }] : []),
                  ].map(a => (
                    <Box key={a.key} className={cls.switchRow}>
                      <Box className={cls.switchIco} style={{ color: a.key==="eliminar"?T.e1:T.v1 }}>{a.icon}</Box>
                      <Typography className={cls.switchName}>{a.label}</Typography>
                      <FormControlLabel control={<Switch checked={permiso.acciones[a.key]} onChange={e=>handlePermissionChange(idx,a.key,e.target.checked)} color="primary"/>} label=""/>
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )

  /* details permission panel */
  const DetPermPanel = ({ moduleNames }) => (
    <Box style={{ paddingTop:8 }}>
      {selectedRole?.permisos.filter(p=>moduleNames.includes(p.modulo)).map((permiso,i)=>(
        <Box key={i} className={cls.permCard}>
          <Box className={cls.permTitle} style={{ marginBottom:10 }}>
            <Box className={cls.permTitleIco}>{getModuleIcon(permiso.modulo)}</Box>
            {permiso.modulo.charAt(0).toUpperCase()+permiso.modulo.slice(1)}
          </Box>
          <Divider style={{ margin:"8px 0", background:T.bL }}/>
          <Box style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8 }}>
            {permiso.modulo==="dashboard" ? (
              <Box className={`${cls.detPermChip} ${permiso.acciones.leer?cls.detPermChipActive:cls.detPermChipInactive}`}
                style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                <Eye size={12} strokeWidth={2.5}/> Acceso
              </Box>
            ) : (
              [
                { key:"crear",     label:"Crear",    icon:<PenTool size={11}/> },
                { key:"leer",      label:"Ver",      icon:<Eye     size={11}/> },
                { key:"actualizar",label:"Editar",   icon:<Edit2   size={11}/> },
                ...(!noDeleteModules.includes(permiso.modulo)?[{ key:"eliminar",label:"Eliminar",icon:<Trash2 size={11}/> }]:[]),
              ].map(a=>(
                <Box key={a.key}
                  className={`${cls.detPermChip} ${permiso.acciones[a.key]?cls.detPermChipActive:cls.detPermChipInactive}`}
                  style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                  {a.icon} {a.label}
                </Box>
              ))
            )}
          </Box>
        </Box>
      ))}
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
          <Box className={cls.hdrIcon}><Shield size={26} color="#fff" strokeWidth={2}/></Box>
          <Box>
            <Typography className={cls.hdrTitle}>Gestión de Roles</Typography>
            <Typography className={cls.hdrSub}>Administra los roles y permisos del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={cls.statsRow}>
        {[
          { label:"Total",    val:roles.length,   sub:"registrados",  c:cls.sv, orb:"#6C3FFF", col:"#6C3FFF", sc:"#5929d9" },
          { label:"Activos",  val:totalActive,    sub:"habilitados",  c:cls.st, orb:"#00D4AA", col:"#007a62", sc:"#007a62" },
          { label:"Inactivos",val:totalInactive,  sub:"desactivados", c:cls.sr, orb:"#FF3B82", col:"#cc2060", sc:"#cc2060" },
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
          <input className={cls.searchInput} placeholder="Buscar rol…"
            value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setPage(0) }}/>
          <span className={cls.kbd}>⌘K</span>
        </Box>
        {/* Botón nativo — mismo patrón que UsuariosList/TipoApartamentoList */}
        <button
          onClick={() => handleOpen(null)}
          style={btnAddStyle}
          onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 9px 26px rgba(108,63,255,.52)" }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 5px 18px rgba(108,63,255,.40)" }}
        >
          <Shield size={16} strokeWidth={2.2}/>
          Nuevo Rol
        </button>
      </Box>

      {/* TABLE */}
      <Box className={cls.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius:20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign:"left" }}>Rol</HCell>
                <HCell>Permisos</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((role,i)=>(
                <TableRow key={role._id} className={cls.tblRow}>
                  <NCell>
                    <Box className={cls.nameWrap}>
                      <Box className={cls.nameAv} style={{ background:avGrad(i) }}>{getInitials(role.nombre)}</Box>
                      <Box>
                        <Typography className={cls.nameText}>{role.nombre}</Typography>
                        <Typography className={cls.nameId}>#{role._id?.slice(-6).toUpperCase()}</Typography>
                      </Box>
                    </Box>
                  </NCell>
                  <BCell>
                    <Tooltip title={formatPermissions(role.permisos)} placement="top">
                      <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:T.ink3, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {formatPermissions(role.permisos)}
                      </Typography>
                    </Tooltip>
                  </BCell>
                  <BCell>
                    <Box className={`${cls.chip} ${role.estado?cls.cOn:cls.cOff}`} component="span">
                      {role.estado
                        ? <><Check size={10} strokeWidth={2.5}/> Activo</>
                        : <><X     size={10} strokeWidth={2.5}/> Inactivo</>
                      }
                    </Box>
                  </BCell>
                  <BCell>
                    <Box className={cls.actWrap}>
                      <Tooltip title="Editar" placement="top">
                        <button className={`${cls.actBtn} ${cls.bEdit}`} onClick={()=>handleOpen(role)}>
                          <Edit2 size={14} strokeWidth={2.2}/>
                        </button>
                      </Tooltip>
                      <Tooltip title="Ver detalles" placement="top">
                        <button className={`${cls.actBtn} ${cls.bView}`} onClick={()=>handleDetails(role)}>
                          <Eye size={14} strokeWidth={2.2}/>
                        </button>
                      </Tooltip>
                      {role.nombre.toLowerCase()!=="administrador"
                        ? <Tooltip title="Eliminar" placement="top">
                            <button className={`${cls.actBtn} ${cls.bDel}`} onClick={()=>handleDelete(role._id)}>
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
                  <TableCell colSpan={4} className={cls.emptyCell}>No se encontraron roles que coincidan con la búsqueda.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PAGINATION */}
      <Box className={cls.pagWrap}>
        <Typography className={cls.pagInfo}>
          Mostrando {filtered.length===0?0:page*rowsPerPage+1}–{Math.min((page+1)*rowsPerPage,filtered.length)} de {filtered.length} roles
        </Typography>
        <Box className={cls.pagBtns}>
          <button className={cls.pageBtn} onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{ opacity:page===0?.4:1 }}><ArrowLeft size={12} strokeWidth={2.5}/></button>
          {Array.from({length:totalPages},(_,i)=>(
            <button key={i} className={`${cls.pageBtn} ${page===i?cls.pagBtnOn:""}`} onClick={()=>setPage(i)}>{i+1}</button>
          ))}
          <button className={cls.pageBtn} onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ opacity:page>=totalPages-1?.4:1 }}><ArrowRight size={12} strokeWidth={2.5}/></button>
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
      <Dialog open={open} onClose={(e,r)=>{ if(r!=="backdropClick"&&r!=="escapeKeyDown") handleClose() }}
        disableBackdropClick disableEscapeKeyDown fullWidth maxWidth="sm"
        classes={{ paper:cls.dlgPaperWide }}>

        <DlgHdr
          icon={editingId?<Edit2 size={20} color="#fff" strokeWidth={2.2}/>:<Shield size={20} color="#fff" strokeWidth={2.2}/>}
          title={editingId?"Editar Rol":"Nuevo Rol"}
          sub={editingId?"Modifica los datos del rol seleccionado":"Completa los campos para registrar un nuevo rol"}
          onClose={handleClose}
        />

        <DialogContent className={cls.dlgBody}>

          {/* Sección 1: Información */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                <User size={13} color={T.v1} strokeWidth={2.5}/>
              </Box>
              Información del Rol
            </Box>
            {editingId ? (
              <Box className={cls.fmRow}>
                <TextField margin="dense" label="Rol" value={formData.nombre}
                  fullWidth variant="outlined" className={cls.fmField}
                  InputProps={{ readOnly:true, startAdornment:<InputAdornment position="start"><Shield size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                />
                <TextField select margin="dense" label="Estado" name="estado"
                  value={formData.estado} onChange={handleChange}
                  fullWidth variant="outlined" className={cls.fmField}
                  disabled={formData.isAdminRole}
                  helperText={formData.isAdminRole?"El rol de administrador siempre debe estar activo":""}
                  InputProps={{ startAdornment:<InputAdornment position="start"><Key size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                >
                  <MenuItem value={true}>✅ Activo</MenuItem>
                  <MenuItem value={false}>❌ Inactivo</MenuItem>
                </TextField>
              </Box>
            ) : (
              <TextField margin="dense" label="Nombre del rol" name="nombrePersonalizado"
                value={formData.nombrePersonalizado||""} onChange={handleChange}
                onBlur={handleFieldBlur}
                onKeyPress={e=>{ if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.key)) e.preventDefault() }}
                fullWidth variant="outlined"
                error={!!formErrors.nombrePersonalizado}
                helperText={formErrors.nombrePersonalizado||"El rol se creará como activo por defecto"}
                required className={cls.fmField}
                inputProps={{ maxLength:30 }}
                InputProps={{ startAdornment:<InputAdornment position="start"><User size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
              />
            )}
          </Box>

          {/* Sección 2: Permisos */}
          <Box className={cls.fmSection}>
            <Box className={cls.fmSectionLbl}>
              <Box className={cls.fmSectionIco} style={{ background:"rgba(255,59,130,.10)" }}>
                <Lock size={13} color={T.e1} strokeWidth={2.5}/>
              </Box>
              Configuración de Permisos
            </Box>

            {/* Botones globales */}
            <Box className={cls.globalBtns}>
              <Button size="small" className={cls.btnAssignAll} onClick={handleSelectAllPermissions}>
                <CheckCircle size={13} strokeWidth={2.5}/> Asignar todos
              </Button>
              <Button size="small" className={cls.btnRemoveAll} onClick={handleRemoveAllPermissions}>
                <XCircle size={13} strokeWidth={2.5}/> Quitar todos
              </Button>
            </Box>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} className={cls.tabsRoot}>
              <Tab label="Administración" className={cls.tabItem} icon={<Settings size={15}/>}/>
              <Tab label="Gestión"        className={cls.tabItem} icon={<User     size={15}/>}/>
              <Tab label="Operaciones"    className={cls.tabItem} icon={<Shield   size={15}/>}/>
            </Tabs>

            {tabValue===0 && <PermPanel moduleNames={["dashboard","usuarios","roles"]}/>}
            {tabValue===1 && <PermPanel moduleNames={["clientes","apartamentos","tipoApartamento","mobiliarios"]}/>}
            {tabValue===2 && <PermPanel moduleNames={["reservas","pagos","descuentos","hospedaje"]}/>}
          </Box>
        </DialogContent>

        <DialogActions className={cls.dlgFoot}>
          <Button onClick={handleClose} className={cls.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={cls.btnSubmit} disabled={!isFormValid}>
            <Check size={15} strokeWidth={2.5} style={{ flexShrink:0 }}/>
            {editingId?"Actualizar Rol":"Crear Rol"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog open={detailsOpen} onClose={(e,r)=>{ if(r!=="backdropClick"&&r!=="escapeKeyDown") handleCloseDetails() }}
        disableBackdropClick disableEscapeKeyDown fullWidth maxWidth="sm"
        classes={{ paper:cls.dlgPaper }}>

        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2}/>}
          title="Detalles del Rol"
          sub="Información completa del rol seleccionado"
          onClose={handleCloseDetails}
        />

        <DialogContent className={cls.dlgBody}>
          {selectedRole ? (
            <>
              <Box className={cls.detHero}>
                <Box className={cls.detAv}>{getInitials(selectedRole.nombre)}</Box>
                <Typography className={cls.detName}>{selectedRole.nombre}</Typography>
                <Box className={`${cls.chip} ${selectedRole.estado?cls.cOn:cls.cOff}`}
                  component="span" style={{ marginTop:6 }}>
                  {selectedRole.estado
                    ? <><Check size={10} strokeWidth={2.5}/> Activo</>
                    : <><X     size={10} strokeWidth={2.5}/> Inactivo</>
                  }
                </Box>
              </Box>

              <Box style={{ height:1, background:T.bL, margin:"14px 0" }}/>

              {/* Sección permisos */}
              <Box className={cls.fmSectionLbl}>
                <Box className={cls.fmSectionIco} style={{ background:"rgba(108,63,255,.12)" }}>
                  <Shield size={13} color={T.v1} strokeWidth={2.5}/>
                </Box>
                Permisos por Módulo
              </Box>

              <Tabs value={tabValue} onChange={handleTabChange} className={cls.tabsRoot}>
                <Tab label="Administración" className={cls.tabItem} icon={<Settings size={15}/>}/>
                <Tab label="Gestión"        className={cls.tabItem} icon={<User     size={15}/>}/>
                <Tab label="Operaciones"    className={cls.tabItem} icon={<Shield   size={15}/>}/>
              </Tabs>

              {tabValue===0 && <DetPermPanel moduleNames={["dashboard","usuarios","roles"]}/>}
              {tabValue===1 && <DetPermPanel moduleNames={["clientes","apartamentos","tipoApartamento","mobiliarios"]}/>}
              {tabValue===2 && <DetPermPanel moduleNames={["reservas","pagos","descuentos","hospedaje"]}/>}
            </>
          ) : (
            <Typography style={{ fontFamily:"'DM Sans',sans-serif", color:T.ink3 }}>Cargando detalles...</Typography>
          )}
        </DialogContent>

        <DialogActions className={cls.dlgFoot}>
          <Button onClick={handleCloseDetails} className={cls.btnCancel}>Cerrar</Button>
          {selectedRole&&(
            <Button onClick={()=>{ handleCloseDetails(); handleOpen(selectedRole) }} className={cls.btnSubmit}>
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink:0 }}/> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default RolesList