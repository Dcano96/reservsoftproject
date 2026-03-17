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
  CalendarDays,
  DollarSign,
  Home,
  Users,
  User,
  BookOpen,
  PlusCircle,
  Hash,
  CreditCard,
} from "lucide-react"
import Swal from "sweetalert2"
import { getReservas, createReserva, updateReserva, deleteReserva, getReservaById } from "./reservas.service"
import apartamentoService from "../apartamentos/apartamento.service"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENSAJES INSTRUCTIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MENSAJES_INSTRUCTIVOS = {
  TITULAR: "Ingrese el nombre completo del cliente titular de la reserva. Solo letras.",
  FECHA_INICIO: "Seleccione la fecha de inicio. Debe ser al menos 2 días después de hoy.",
  FECHA_FIN: "Seleccione la fecha de fin. Debe ser posterior a la fecha de inicio.",
  APARTAMENTOS: "Seleccione uno o más apartamentos para la reserva.",
  NOCHES: "Se calcula automáticamente según las fechas seleccionadas.",
  PAGOS_PARCIALES: "Ingrese el monto de pagos parciales realizados. Ej: 150000.",
  TOTAL: "Se calcula automáticamente según los apartamentos y noches.",
  ESTADO: "Seleccione el estado actual de la reserva.",
  ACOMP_NOMBRE: "Ingrese el nombre del acompañante. Solo letras.",
  ACOMP_APELLIDO: "Ingrese el apellido del acompañante. Solo letras.",
  ACOMP_DOC: "Ingrese el número de documento. Solo números, máximo 10 dígitos.",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
  ink: "#0C0A14", ink2: "#2D2640", ink3: "#6B5E87", ink4: "#B0A5C8",
  white: "#FFFFFF",
  v1: "#6C3FFF", e1: "#FF3B82", t1: "#00D4AA", b1: "#2563EB", a1: "#FF7B2C",
  gv: "linear-gradient(135deg,#6C3FFF,#C040FF)",
  ge: "linear-gradient(135deg,#FF3B82,#FF7B2C)",
  gt: "linear-gradient(135deg,#00D4AA,#00A3E0)",
  gb: "linear-gradient(135deg,#2563EB,#7C3AED)",
  bL: "rgba(108,63,255,0.10)", bM: "rgba(108,63,255,0.18)",
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
    .swal-overlay-z-index{z-index:13000!important;}
    .swal-popup-z-index{z-index:13001!important;}
    .swal2-container{z-index:13000!important;}
    .swal2-backdrop-show{z-index:13000!important;}
  `
  document.head.appendChild(s)
}
const SW = { customClass: { popup: "rs-pop", title: "rs-ttl", htmlContainer: "rs-bod", confirmButton: "rs-ok", cancelButton: "rs-cn" }, buttonsStyling: false }
const SWD = { ...SW, customClass: { ...SW.customClass, popup: "rs-pop rs-danger" } }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE CELLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const HCell = withStyles(() => ({
  head: {
    background: "linear-gradient(135deg,#6C3FFF,#C040FF)",
    color: "#fff", fontFamily: "'DM Sans',sans-serif",
    fontWeight: 700, fontSize: ".71rem",
    textTransform: "uppercase", letterSpacing: "1.1px",
    padding: "13px 16px", borderBottom: "none", whiteSpace: "nowrap",
  },
}))(TableCell)

const BCell = withStyles(() => ({
  body: {
    fontFamily: "'DM Sans',sans-serif", fontSize: ".86rem",
    padding: "11px 16px", color: T.ink2,
    borderBottom: `1px solid ${T.bL}`,
    textAlign: "center", verticalAlign: "middle",
  },
}))(TableCell)

const NCell = withStyles(() => ({
  body: {
    fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem",
    padding: "11px 16px", color: T.ink,
    borderBottom: `1px solid ${T.bL}`,
    verticalAlign: "middle",
  },
}))(TableCell)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOTÓN NATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const btnAddStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: "linear-gradient(135deg,#6C3FFF,#C040FF)",
  color: "#fff",
  fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
  fontSize: ".80rem", letterSpacing: ".7px",
  padding: "10px 22px", borderRadius: 50,
  border: "none", cursor: "pointer",
  boxShadow: "0 5px 18px rgba(108,63,255,.40)",
  textTransform: "uppercase",
  transition: "all .22s",
  lineHeight: 1,
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(() => ({
  root: {
    fontFamily: "'DM Sans',sans-serif",
    borderRadius: 26, overflow: "hidden",
    background: "rgba(255,255,255,0.74)",
    backdropFilter: "blur(22px) saturate(180%)",
    WebkitBackdropFilter: "blur(22px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.85)",
    boxShadow: "0 4px 32px rgba(108,63,255,0.10)",
    position: "relative",
    "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, background: T.gv, zIndex: 2 },
  },
  hdr: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 26px 20px", flexWrap: "wrap", gap: 14, borderBottom: "1px solid rgba(108,63,255,0.08)" },
  hdrLeft: { display: "flex", alignItems: "center", gap: 14 },
  hdrIcon: {
    width: 54, height: 54, borderRadius: 18, background: T.gv, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 22px rgba(108,63,255,0.42)",
    position: "relative", overflow: "hidden",
    "&::after": { content: '""', position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.20)" },
  },
  hdrTitle: {
    fontFamily: "'Syne',sans-serif !important",
    fontSize: "1.55rem !important", fontWeight: "800 !important",
    background: T.gv, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px", lineHeight: 1.1,
  },
  hdrSub: { fontSize: ".82rem", color: T.ink3, marginTop: 3 },
  statsRow: { display: "flex", gap: 12, padding: "18px 26px 0", flexWrap: "wrap" },
  stat: {
    flex: "1 1 110px", borderRadius: 18, padding: "16px 18px",
    position: "relative", overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.80)",
    transition: "transform .2s, box-shadow .2s",
    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 30px rgba(108,63,255,0.16)" },
    "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "18px 18px 0 0" },
  },
  sv: { background: "linear-gradient(145deg,rgba(108,63,255,.11),rgba(192,64,255,.07))", boxShadow: "0 5px 22px rgba(108,63,255,.13)", "&::before": { background: T.gv } },
  st: { background: "linear-gradient(145deg,rgba(0,212,170,.11),rgba(0,163,224,.07))", boxShadow: "0 5px 22px rgba(0,212,170,.12)", "&::before": { background: T.gt } },
  sr: { background: "linear-gradient(145deg,rgba(255,59,130,.10),rgba(255,123,44,.07))", boxShadow: "0 5px 22px rgba(255,59,130,.11)", "&::before": { background: T.ge } },
  sp: { background: "linear-gradient(145deg,rgba(255,123,44,.10),rgba(245,197,24,.07))", boxShadow: "0 5px 22px rgba(255,123,44,.11)", "&::before": { background: "linear-gradient(135deg,#FF7B2C,#F5C518)" } },
  statOrb: { position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", filter: "blur(22px)", opacity: .4, pointerEvents: "none" },
  statLabel: { fontFamily: "'DM Sans',sans-serif", fontSize: ".70rem", fontWeight: 700, letterSpacing: "1.1px", textTransform: "uppercase", marginBottom: 5 },
  statVal: { fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, lineHeight: 1 },
  statSub: { fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", marginTop: 4, fontWeight: 500 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 26px", gap: 12, flexWrap: "wrap" },
  searchPill: {
    display: "flex", alignItems: "center", gap: 9,
    background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(108,63,255,0.12)",
    borderRadius: 50, padding: "9px 18px", minWidth: 260,
    boxShadow: "0 2px 10px rgba(108,63,255,0.07)", transition: "all .2s",
    "&:focus-within": { borderColor: "rgba(108,63,255,.35)", boxShadow: "0 0 0 3px rgba(108,63,255,.10)", background: T.white },
  },
  searchInput: { border: "none", outline: "none", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.ink, width: "100%" },
  kbd: { fontSize: 10, color: T.ink4, background: "rgba(108,63,255,0.07)", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" },
  tblWrap: { margin: "0 26px 16px", borderRadius: 20, overflow: "hidden", border: `1px solid rgba(108,63,255,.10)`, boxShadow: "0 4px 20px rgba(108,63,255,.07)" },
  tblRow: { transition: "background .15s", "&:nth-of-type(odd)": { background: "rgba(244,241,255,.30)" }, "&:hover": { background: "rgba(108,63,255,.055)" } },
  nameWrap: { display: "flex", alignItems: "center", gap: 10 },
  nameAv: { width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 12px rgba(108,63,255,.30)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" },
  nameText: { fontWeight: 700, fontSize: ".90rem", color: T.ink },
  nameId: { fontSize: ".72rem", color: T.ink4, marginTop: 1 },
  chip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", fontWeight: 700, whiteSpace: "nowrap" },
  cConfirmada: { background: "rgba(0,212,170,.12)", color: "#00917a" },
  cPendiente: { background: "rgba(255,123,44,.12)", color: "#c25a00" },
  cCancelada: { background: "rgba(255,59,130,.10)", color: "#cc2060" },
  actWrap: { display: "flex", justifyContent: "center", gap: 5 },
  actBtn: { width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all .18s", "&:hover": { transform: "scale(1.14)", boxShadow: "0 4px 14px rgba(0,0,0,.18)" } },
  bEdit: { background: "linear-gradient(135deg,#00D4AA,#00A3E0)", color: "#fff" },
  bView: { background: T.gv, color: "#fff" },
  bDel: { background: T.ge, color: "#fff" },
  pagWrap: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 26px 22px", flexWrap: "wrap", gap: 10 },
  pagInfo: { fontFamily: "'DM Sans',sans-serif", fontSize: ".80rem", color: T.ink3 },
  pagBtns: { display: "flex", gap: 6 },
  pageBtn: {
    width: 30, height: 30, borderRadius: 9, border: `1px solid rgba(108,63,255,.14)`,
    background: "rgba(255,255,255,.80)", color: T.ink3,
    fontFamily: "'DM Sans',sans-serif", fontSize: ".80rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all .15s",
    "&:hover": { background: T.gv, color: "#fff", borderColor: "transparent", boxShadow: "0 3px 10px rgba(108,63,255,.35)" },
  },
  pagBtnOn: { background: `${T.gv} !important`, color: "#fff !important", borderColor: "transparent !important", boxShadow: "0 3px 10px rgba(108,63,255,.38) !important" },
  emptyCell: { textAlign: "center", padding: 40, fontFamily: "'DM Sans',sans-serif", fontSize: ".94rem", color: T.ink3 },
  dlgPaper: {
    borderRadius: "26px !important", boxShadow: "0 24px 64px rgba(108,63,255,0.24) !important",
    border: `1px solid ${T.bM}`, width: 660, maxWidth: "96vw",
    background: "rgba(255,255,255,0.98) !important", backdropFilter: "blur(24px)",
    overflow: "hidden", position: "relative",
    "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, background: T.gv, zIndex: 10 },
  },
  dlgPaperLarge: {
    borderRadius: "26px !important", boxShadow: "0 24px 64px rgba(108,63,255,0.24) !important",
    border: `1px solid ${T.bM}`, width: 780, maxWidth: "95vw", maxHeight: "85vh",
    background: "rgba(255,255,255,0.98) !important", backdropFilter: "blur(24px)",
    overflow: "hidden", position: "relative",
    "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, background: T.gv, zIndex: 10 },
  },
  dlgHdr: { background: "linear-gradient(135deg,#6C3FFF,#C040FF)", padding: "20px 22px", display: "flex", alignItems: "center", gap: 12, position: "relative" },
  dlgHdrIco: { width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dlgHdrTitle: { fontFamily: "'Syne',sans-serif !important", fontWeight: "800 !important", fontSize: "1.08rem !important", color: "#fff !important", letterSpacing: "-.2px", lineHeight: 1.15 },
  dlgHdrSub: { fontSize: ".75rem", color: "rgba(255,255,255,.76)", marginTop: 2, fontFamily: "'DM Sans',sans-serif" },
  dlgCloseBtn: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.18)",
    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", transition: "all .18s",
    "&:hover": { background: "rgba(255,255,255,.32)", transform: "translateY(-50%) scale(1.08)" },
  },
  dlgBody: { padding: "22px 24px 10px !important", background: "#fff" },
  fmSection: { marginBottom: 16 },
  fmSectionLbl: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'Syne',sans-serif", fontSize: ".83rem", fontWeight: 700,
    color: T.ink, marginBottom: 12, paddingBottom: 8,
    borderBottom: "1.5px solid rgba(108,63,255,.09)", letterSpacing: "-.1px",
  },
  fmSectionIco: { width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  fmField: {
    marginBottom: "14px !important",
    "& .MuiOutlinedInput-root": {
      borderRadius: "13px !important", fontFamily: "'DM Sans',sans-serif !important",
      fontSize: ".90rem", background: "rgba(244,241,255,.38)",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.v1 },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.v1, borderWidth: 2 },
    },
    "& .MuiInputLabel-outlined": { fontFamily: "'DM Sans',sans-serif", color: T.ink3, fontSize: ".88rem" },
    "& .MuiInputLabel-outlined.Mui-focused": { color: T.v1 },
    "& .MuiFormHelperText-root": { fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem" },
  },
  fmFieldError: {
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ef4444 !important", borderWidth: "2px !important" },
  },
  fmRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  dlgFoot: { padding: "12px 24px 20px !important", background: "#fff", borderTop: "1px solid rgba(108,63,255,.08)", display: "flex", justifyContent: "flex-end", gap: 10 },
  btnCancel: {
    fontFamily: "'DM Sans',sans-serif !important", fontWeight: "600 !important",
    color: `${T.ink3} !important`, borderRadius: "50px !important",
    padding: "9px 22px !important", border: "1.5px solid rgba(108,63,255,.16) !important",
    transition: "all .18s !important",
    "&:hover": { background: "rgba(108,63,255,.06) !important", color: `${T.v1} !important` },
  },
  btnSubmit: {
    display: "flex !important", alignItems: "center !important", gap: "7px !important",
    background: `${T.gv} !important`, color: "#fff !important",
    fontFamily: "'DM Sans',sans-serif !important", fontWeight: "700 !important",
    borderRadius: "50px !important", padding: "9px 26px !important",
    boxShadow: "0 4px 14px rgba(108,63,255,.38) !important", transition: "all .2s !important",
    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 22px rgba(108,63,255,.50) !important" },
    "&:disabled": { opacity: .5, transform: "none !important", boxShadow: "none !important" },
  },
  btnAgregarAcomp: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: ".78rem",
    color: T.v1, border: `1.5px solid rgba(108,63,255,.28)`,
    borderRadius: 50, padding: "7px 18px", background: "rgba(108,63,255,.06)",
    cursor: "pointer", transition: "all .18s", letterSpacing: ".4px",
    "&:hover": { background: "rgba(108,63,255,.12)", boxShadow: "0 3px 10px rgba(108,63,255,.18)" },
  },
  btnDelAcomp: {
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: T.ge, color: "#fff", border: "none", cursor: "pointer",
    transition: "all .18s", alignSelf: "flex-start", marginTop: 8,
    "&:hover": { transform: "scale(1.10)", boxShadow: "0 4px 14px rgba(255,59,130,.35)" },
  },
  acompCard: {
    borderRadius: 14, padding: "14px 14px 10px",
    background: "rgba(244,241,255,.35)", border: `1px solid ${T.bL}`,
    marginBottom: 12,
  },
  acompCardHdr: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  acompLbl: {
    fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", fontWeight: 700,
    color: T.ink3, letterSpacing: ".6px", textTransform: "uppercase",
  },
  detHero: { display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0 18px" },
  detAv: { width: 76, height: 76, borderRadius: 22, background: T.gv, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 32px rgba(108,63,255,.40)", marginBottom: 12, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: "#fff" },
  detName: { fontFamily: "'Syne',sans-serif !important", fontSize: "1.20rem !important", fontWeight: "800 !important", color: `${T.ink} !important`, marginBottom: 4, textAlign: "center" },
  detSub: { fontFamily: "'DM Sans',sans-serif", fontSize: ".84rem", color: T.ink3, textAlign: "center" },
  detGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 },
  detItem: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4 },
  detItemFull: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" },
  detLbl: { fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".9px", textTransform: "uppercase", color: T.ink3 },
  detVal: { fontFamily: "'DM Sans',sans-serif", fontSize: ".90rem", fontWeight: 600, color: T.ink },
  statusSelectWrap: {
    "& .MuiSelect-root": { padding: "6px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem" },
    "& .MuiSelect-icon": { display: "none" },
  },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const getTokenHeader = () => {
  const token = localStorage.getItem("token")
  return { Authorization: `Bearer ${token}` }
}

const getInitials = (name) =>
  name?.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2) || "R"

const formatCOP = (val) =>
  Number(val).toLocaleString("es-CO", { style: "currency", currency: "COP" })

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INITIAL FORM STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const INITIAL_FORM = {
  titular_reserva: "", fecha_inicio: "", fecha_fin: "",
  apartamentos: [], noches_estadia: 1, total: 0,
  pagos_parciales: 0, estado: "pendiente", acompanantes: [],
}

const INITIAL_ERRORS = {
  titular_reserva: "", fecha_inicio: "", fecha_fin: "", apartamentos: "", acompanantes: {},
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ReservasList = () => {
  const classes = useStyles()

  const [reservas, setReservas] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState(INITIAL_ERRORS)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [apartamentos, setApartamentos] = useState([])
  const [mappedApartamentosOptions, setMappedApartamentosOptions] = useState([])

  useEffect(() => { fetchReservas() }, [])
  useEffect(() => { fetchApartamentos() }, [])

  const fetchReservas = async () => {
    try {
      const data = await getReservas(getTokenHeader())
      setReservas(data)
    } catch (error) {
      console.error("Error fetching reservas", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar las reservas.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
    }
  }

  const fetchApartamentos = async () => {
    try {
      const data = await apartamentoService.getApartamentos()
      setApartamentos(data)
    } catch (error) {
      console.error("Error fetching apartments", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar los apartamentos.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
    }
  }

  useEffect(() => {
    const options = apartamentos.map((apt) => ({
      id: apt._id,
      label: `Apartamento ${apt.NumeroApto} - Piso ${apt.Piso} (Tarifa: COP ${apt.Tarifa})`,
      price: apt.Tarifa,
    }))
    setMappedApartamentosOptions(options)
  }, [apartamentos])

  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      const start = new Date(formData.fecha_inicio)
      const end = new Date(formData.fecha_fin)
      const diffDays = end - start > 0 ? Math.floor((end - start) / (1000 * 60 * 60 * 24)) : 0
      if (diffDays !== formData.noches_estadia)
        setFormData((prev) => ({ ...prev, noches_estadia: diffDays }))
    }
  }, [formData.fecha_inicio, formData.fecha_fin])

  useEffect(() => {
    if (mappedApartamentosOptions.length === 0 || formData.apartamentos.length === 0) return
    const selected = formData.apartamentos.map(id => mappedApartamentosOptions.find(i => i.id === id)).filter(Boolean)
    const sumPrices = selected.reduce((acc, a) => acc + a.price, 0)
    const newTotal = sumPrices * Number(formData.noches_estadia)
    if (newTotal !== formData.total)
      setFormData((prev) => ({ ...prev, total: newTotal }))
  }, [formData.apartamentos, formData.noches_estadia, mappedApartamentosOptions])

  /* ── exportToExcel ── */
  const exportToExcel = async () => {
    if (reservas.length === 0) {
      Swal.fire({ ...SW, icon: "info", title: "Sin datos", text: "No hay reservas para exportar.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
      return
    }
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Reservas")
    worksheet.columns = [
      { header: "Número de Reserva", key: "numero_reserva", width: 20 },
      { header: "Cliente", key: "titular_reserva", width: 30 },
      { header: "Fecha Inicio", key: "fecha_inicio", width: 15 },
      { header: "Fecha Fin", key: "fecha_fin", width: 15 },
      { header: "Apartamentos", key: "apartamentos", width: 30 },
      { header: "Estadía", key: "noches_estadia", width: 10 },
      { header: "Total", key: "total", width: 20 },
      { header: "Estado", key: "estado", width: 15 },
    ]
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6C3FFF" } }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
    })
    reservas.forEach((reserva) => {
      const aptInfo = reserva.apartamentos?.length > 0
        ? reserva.apartamentos.map(apt => apt.NumeroApto || apt).join(", ") : ""
      worksheet.addRow({
        numero_reserva: reserva.numero_reserva,
        titular_reserva: reserva.titular_reserva,
        fecha_inicio: reserva.fecha_inicio?.substring(0, 10) || "",
        fecha_fin: reserva.fecha_fin?.substring(0, 10) || "",
        apartamentos: aptInfo,
        noches_estadia: reserva.noches_estadia,
        total: formatCOP(reserva.total),
        estado: reserva.estado,
      })
    })
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        row.eachCell((cell) => {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
          cell.alignment = { horizontal: "center", vertical: "middle" }
        })
      }
    })
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a"); link.href = url; link.download = "reservas.xlsx"; link.click()
    window.URL.revokeObjectURL(url)
  }

  /* ── filter + paginate ── */
  const filteredReservas = reservas.filter(r =>
    r.titular_reserva.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginatedReservas = filteredReservas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filteredReservas.length / rowsPerPage))
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(Number.parseInt(e.target.value, 10)); setPage(0) }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX 1 — handleOpenEdit: normalizar documento en acompañantes
     El campo puede llegar como `documento` o `documento_acompanante` desde la BD.
     Se unifican ambos para que el form siempre tenga `documento` disponible.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleOpenEdit = async (reserva) => {
    setDetailsOpen(false)
    setFormErrors(INITIAL_ERRORS)

    if (reserva) {
      try {
        const updatedReserva = await getReservaById(reserva._id)

        const apartamentosIds = updatedReserva.apartamentos
          ? updatedReserva.apartamentos.map(apt => typeof apt === "object" ? apt._id : apt)
          : []

        // FIX 1: normalizar siempre documento y documento_acompanante
        const formattedAcompanantes = (updatedReserva.acompanantes || []).map(a => {
          const docValue = a.documento || a.documento_acompanante || ""
          return {
            _id: a._id,
            nombre: a.nombre || "",
            apellido: a.apellido || "",
            documento: docValue,
            documento_acompanante: docValue,
          }
        })

        setFormData({
          ...updatedReserva,
          apartamentos: apartamentosIds,
          fecha_inicio: updatedReserva.fecha_inicio?.substring(0, 10) || "",
          fecha_fin: updatedReserva.fecha_fin?.substring(0, 10) || "",
          acompanantes: formattedAcompanantes,
        })
        setEditingId(updatedReserva._id)
      } catch (error) {
        console.error("Error al obtener los detalles de la reserva", error)
        Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar los detalles de la reserva.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
        return
      }
    } else {
      setFormData(INITIAL_FORM)
      setEditingId(null)
    }
    setOpen(true)
  }

  const handleCloseEdit = () => { setOpen(false); setEditingId(null) }

  const handleOpenDetails = async (reserva) => {
    setOpen(false)
    try {
      const detailedReserva = await getReservaById(reserva._id)
      setSelectedReserva(detailedReserva)
      setDetailsOpen(true)
    } catch (error) {
      console.error("Error al obtener los detalles de la reserva", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar los detalles de la reserva.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
    }
  }

  const handleCloseDetails = () => setDetailsOpen(false)

  /* ── validateField ── */
  const validateField = (name, value, index = null) => {
    let error = ""
    if (index !== null) {
      const acompananteErrors = { ...formErrors.acompanantes }
      if (!acompananteErrors[index]) acompananteErrors[index] = {}
      switch (name) {
        case "nombre":
          if (!value.trim()) error = "El nombre es obligatorio"
          else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) error = "El nombre solo debe contener letras"
          acompananteErrors[index].nombre = error; break
        case "apellido":
          if (!value.trim()) error = "El apellido es obligatorio"
          else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) error = "El apellido solo debe contener letras"
          acompananteErrors[index].apellido = error; break
        case "documento":
        case "documento_acompanante":
          if (!value.trim()) error = "El documento es obligatorio"
          else if (!/^\d+$/.test(value)) error = "El documento solo debe contener números"
          else if (value.length > 10) error = "El documento no debe exceder 10 dígitos"
          // guardar bajo la clave "documento" siempre
          acompananteErrors[index].documento = error; break
        default: break
      }
      setFormErrors(prev => ({ ...prev, acompanantes: acompananteErrors }))
      // FIX: errors shown in helperText, no Swal toast inside Dialog
      return error === ""
    }

    switch (name) {
      case "titular_reserva":
        if (!value.trim()) error = "El nombre del cliente es obligatorio"
        else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) error = "El nombre del cliente solo debe contener letras"
        break
      case "fecha_inicio":
        if (!value) { error = "La fecha de inicio es obligatoria" }
        else {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          const minDate = new Date(today); minDate.setDate(today.getDate() + 2)
          const sel = new Date(value); sel.setHours(0, 0, 0, 0)
          if (sel < minDate) error = "La fecha de inicio debe ser al menos 2 días después de hoy"
        }
        break
      case "fecha_fin":
        if (!value) { error = "La fecha de fin es obligatoria" }
        else if (formData.fecha_inicio) {
          if (new Date(value) <= new Date(formData.fecha_inicio)) error = "La fecha de fin debe ser posterior a la fecha de inicio"
        }
        break
      case "apartamentos":
        if (!value || value.length === 0) error = "Debe seleccionar al menos un apartamento"
        break
      default: break
    }
    setFormErrors(prev => ({ ...prev, [name]: error }))
    // FIX: errors shown in helperText, no Swal toast inside Dialog
    return error === ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleApartamentosChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({ ...prev, apartamentos: value }))
    validateField("apartamentos", value)
  }

  const agregarAcompanante = () => {
    setFormData(prev => ({
      ...prev,
      acompanantes: [
        ...(prev.acompanantes || []),
        { nombre: "", apellido: "", documento: "", documento_acompanante: "" },
      ],
    }))
  }

  // FIX: eliminación directa sin Swal confirm — el popup de confirmación sobre el Dialog
  // de MUI bloquea la interacción. El botón X ya es suficientemente explícito como acción destructiva.
  const handleDeleteAcompanante = (index) => {
    setFormData(prev => {
      const n = [...prev.acompanantes]; n.splice(index, 1); return { ...prev, acompanantes: n }
    })
    setFormErrors(prev => {
      const n = { ...prev.acompanantes }; delete n[index]; return { ...prev, acompanantes: n }
    })
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX 2 — handleAcompananteChange: sincronizar siempre
     ambos campos (documento y documento_acompanante)
     sin importar cuál venga en el event.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleAcompananteChange = (index, e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const n = [...prev.acompanantes]
      if (name === "documento" || name === "documento_acompanante") {
        // FIX 2: mantener ambos campos en sync para evitar undefined en validación
        n[index] = { ...n[index], documento: value, documento_acompanante: value }
      } else {
        n[index] = { ...n[index], [name]: value }
      }
      return { ...prev, acompanantes: n }
    })
    validateField(name, value, index)
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX 3 — getFormErrors: lógica de validación
     extraída a función pura que devuelve el objeto
     errors sin depender del estado (evita stale closure).
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const getFormErrors = () => {
    const errors = { titular_reserva: "", fecha_inicio: "", fecha_fin: "", apartamentos: "", acompanantes: {} }
    let isValid = true

    if (!formData.titular_reserva.trim()) {
      errors.titular_reserva = "El nombre del cliente es obligatorio"; isValid = false
    } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(formData.titular_reserva)) {
      errors.titular_reserva = "El nombre del cliente solo debe contener letras"; isValid = false
    }

    if (!formData.fecha_inicio) {
      errors.fecha_inicio = "La fecha de inicio es obligatoria"; isValid = false
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const minDate = new Date(today); minDate.setDate(today.getDate() + 2)
      const sel = new Date(formData.fecha_inicio); sel.setHours(0, 0, 0, 0)
      if (sel < minDate) { errors.fecha_inicio = "La fecha de inicio debe ser al menos 2 días después de hoy"; isValid = false }
    }

    if (!formData.fecha_fin) {
      errors.fecha_fin = "La fecha de fin es obligatoria"; isValid = false
    } else if (formData.fecha_inicio && new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
      errors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio"; isValid = false
    }

    if (!formData.apartamentos || formData.apartamentos.length === 0) {
      errors.apartamentos = "Debe seleccionar al menos un apartamento"; isValid = false
    }

    if (formData.acompanantes?.length > 0) {
      formData.acompanantes.forEach((acomp, index) => {
        if (!errors.acompanantes[index]) errors.acompanantes[index] = {}
        // FIX 3: usar ?? "" para evitar llamar .trim() sobre undefined
        const nombre = acomp.nombre ?? ""
        const apellido = acomp.apellido ?? ""
        const documento = acomp.documento ?? acomp.documento_acompanante ?? ""

        if (!nombre.trim()) { errors.acompanantes[index].nombre = "El nombre es obligatorio"; isValid = false }
        else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(nombre)) { errors.acompanantes[index].nombre = "El nombre solo debe contener letras"; isValid = false }

        if (!apellido.trim()) { errors.acompanantes[index].apellido = "El apellido es obligatorio"; isValid = false }
        else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(apellido)) { errors.acompanantes[index].apellido = "El apellido solo debe contener letras"; isValid = false }

        if (!documento.trim()) { errors.acompanantes[index].documento = "El documento es obligatorio"; isValid = false }
        else if (!/^\d+$/.test(documento)) { errors.acompanantes[index].documento = "El documento solo debe contener números"; isValid = false }
        else if (documento.length > 10) { errors.acompanantes[index].documento = "El documento no debe exceder 10 dígitos"; isValid = false }
      })
    }

    return { errors, isValid }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIX 3 cont. — handleSubmit: usa errors local
     (no formErrors del estado que puede estar stale)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleSubmit = async () => {
    const { errors, isValid } = getFormErrors()
    setFormErrors(errors)

    if (!isValid) {
      const errorMessages = []
      if (errors.titular_reserva) errorMessages.push(errors.titular_reserva)
      if (errors.fecha_inicio) errorMessages.push(errors.fecha_inicio)
      if (errors.fecha_fin) errorMessages.push(errors.fecha_fin)
      if (errors.apartamentos) errorMessages.push(errors.apartamentos)
      // FIX 3: iterar sobre errors local, no sobre formErrors stale
      Object.keys(errors.acompanantes).forEach(index => {
        const ae = errors.acompanantes[index]
        if (ae.nombre) errorMessages.push(`Acompañante ${Number(index) + 1}: ${ae.nombre}`)
        if (ae.apellido) errorMessages.push(`Acompañante ${Number(index) + 1}: ${ae.apellido}`)
        if (ae.documento) errorMessages.push(`Acompañante ${Number(index) + 1}: ${ae.documento}`)
      })
      return Swal.fire({
        ...SWD, icon: "error", title: "Error de validación",
        html: errorMessages.map(e => `• ${e}`).join("<br>"),
        customClass: { container: "swal-overlay-z-index", popup: "rs-pop rs-danger" }
      })
    }

    try {
      const dataToSend = {
        ...formData,
        pagos_parciales: Number(formData.pagos_parciales),
        noches_estadia: Number(formData.noches_estadia),
        total: Number(formData.total),
        acompanantes: formData.acompanantes.map(a => ({
          _id: a._id,
          nombre: a.nombre,
          apellido: a.apellido,
          // FIX 3: garantizar que documento nunca sea undefined al enviar
          documento: a.documento || a.documento_acompanante || "",
        })),
      }

      if (editingId) {
        await updateReserva(editingId, dataToSend, getTokenHeader())
        Swal.fire({ ...SW, icon: "success", title: "Actualizado", text: "La reserva se actualizó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      } else {
        await createReserva(dataToSend, getTokenHeader())
        Swal.fire({ ...SW, icon: "success", title: "Creado", text: "La reserva se creó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }
      fetchReservas(); handleCloseEdit(); setDetailsOpen(false)
    } catch (error) {
      console.error("Error al guardar la reserva:", error)
      Swal.fire({
        ...SWD, icon: "error", title: "Error al guardar", text: error.message || "Ocurrió un error al guardar la reserva.",
        customClass: { container: "swal-overlay-z-index", popup: "rs-pop rs-danger" }
      })
    }
  }

  const handleDelete = async (id) => {
    const r = reservas.find(x => x._id === id)
    if (r?.estado === "confirmada") {
      return Swal.fire({ ...SW, icon: "error", title: "No se puede eliminar", text: "Una reserva confirmada no puede ser eliminada.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop" } })
    }
    const result = await Swal.fire({
      ...SWD, title: "¿Estás seguro?", text: "Esta acción no se puede deshacer.",
      icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
      customClass: { container: "swal-overlay-z-index", popup: "rs-pop rs-danger" }
    })
    if (result.isConfirmed) {
      try {
        await deleteReserva(id, getTokenHeader())
        Swal.fire({ ...SW, icon: "success", title: "Eliminado", text: "La reserva se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        fetchReservas()
      } catch (error) {
        console.error("Error al eliminar la reserva:", error)
        Swal.fire({ ...SWD, icon: "error", title: "Error al eliminar", text: error.message || "Ocurrió un error al eliminar la reserva.", customClass: { container: "swal-overlay-z-index", popup: "rs-pop rs-danger" } })
      }
    }
  }

  const renderApartamentosInfo = (reserva) => {
    if (!reserva.apartamentos) return "-"
    if (reserva.apartamentos.length > 0 && typeof reserva.apartamentos[0] === "object")
      return reserva.apartamentos.map(apt => apt.NumeroApto || "N/A").join(", ")
    return reserva.apartamentos.map(aptId => {
      const apt = mappedApartamentosOptions.find(o => o.id === aptId)
      return apt ? apt.label.split(" - ")[0] : aptId
    }).join(", ")
  }

  const estadoChipClass = (estado) => {
    if (estado === "confirmada") return classes.cConfirmada
    if (estado === "cancelada") return classes.cCancelada
    return classes.cPendiente
  }
  const estadoChipLabel = (estado) => estado.charAt(0).toUpperCase() + estado.slice(1)

  const totalConfirmadas = reservas.filter(r => r.estado === "confirmada").length
  const totalCanceladas = reservas.filter(r => r.estado === "cancelada").length
  const totalPendientes = reservas.filter(r => r.estado === "pendiente").length

  const DlgHdr = ({ icon, title, sub, onClose }) => (
    <Box className={classes.dlgHdr}>
      <Box className={classes.dlgHdrIco}>{icon}</Box>
      <Box>
        <Typography className={classes.dlgHdrTitle}>{title}</Typography>
        <Typography className={classes.dlgHdrSub}>{sub}</Typography>
      </Box>
      <button className={classes.dlgCloseBtn} onClick={onClose}><X size={15} strokeWidth={2.5} /></button>
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
          <Box className={classes.hdrIcon}><BookOpen size={26} color="#fff" strokeWidth={2} /></Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Reservas</Typography>
            <Typography className={classes.hdrSub}>Administra las reservas del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* STATS */}
      <Box className={classes.statsRow}>
        {[
          { label: "Total", val: reservas.length, sub: "registradas", c: classes.sv, orb: "#6C3FFF", col: "#6C3FFF", sc: "#5929d9" },
          { label: "Confirmadas", val: totalConfirmadas, sub: "activas", c: classes.st, orb: "#00D4AA", col: "#007a62", sc: "#007a62" },
          { label: "Pendientes", val: totalPendientes, sub: "por confirmar", c: classes.sp, orb: "#FF7B2C", col: "#c25a00", sc: "#c25a00" },
          { label: "Canceladas", val: totalCanceladas, sub: "desactivadas", c: classes.sr, orb: "#FF3B82", col: "#cc2060", sc: "#cc2060" },
        ].map((s, i) => (
          <Box key={i} className={`${classes.stat} ${s.c}`}>
            <Box className={classes.statOrb} style={{ background: s.orb }} />
            <Typography className={classes.statLabel} style={{ color: s.col }}>{s.label}</Typography>
            <Typography className={classes.statVal}>{s.val}</Typography>
            <Typography className={classes.statSub} style={{ color: s.sc }}>{s.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* TOOLBAR */}
      <Box className={classes.toolbar}>
        <Box className={classes.searchPill}>
          <Search size={14} color={T.ink4} strokeWidth={2.5} />
          <input
            className={classes.searchInput}
            placeholder="Buscar por cliente…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
          />
          <span className={classes.kbd}>⌘K</span>
        </Box>
        <button
          onClick={() => handleOpenEdit(null)}
          style={btnAddStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 9px 26px rgba(108,63,255,.52)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 5px 18px rgba(108,63,255,.40)" }}
        >
          <BookOpen size={16} strokeWidth={2.2} />
          Nueva Reserva
        </button>
      </Box>

      {/* TABLE */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius: 20 }}>
          <Table style={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign: "left" }}>Cliente / N°</HCell>
                <HCell>Fecha Inicio</HCell>
                <HCell>Fecha Fin</HCell>
                <HCell>Apartamentos</HCell>
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
                        <Box className={classes.nameAv} style={{ background: avGrad(i) }}>
                          {getInitials(reserva.titular_reserva)}
                        </Box>
                        <Box>
                          <Typography className={classes.nameText}>{reserva.titular_reserva}</Typography>
                          <Typography className={classes.nameId}>#{reserva.numero_reserva}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>{reserva.fecha_inicio?.substring(0, 10) || ""}</BCell>
                    <BCell>{reserva.fecha_fin?.substring(0, 10) || ""}</BCell>
                    <BCell>{renderApartamentosInfo(reserva)}</BCell>
                    <BCell>{reserva.noches_estadia}</BCell>
                    <BCell>{formatCOP(reserva.total)}</BCell>
                    <BCell>
                      <Select
                        variant="standard"
                        disableUnderline
                        IconComponent={() => null}
                        value={reserva.estado}
                        className={classes.statusSelectWrap}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          updateReserva(reserva._id, { estado: newStatus }, getTokenHeader())
                            .then(() => {
                              Swal.fire({ ...SW, icon: "success", title: "Estado actualizado", timer: 1800, timerProgressBar: true, showConfirmButton: false })
                              fetchReservas()
                            })
                            .catch(() => Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudo actualizar el estado." }))
                        }}
                        renderValue={(value) => (
                          <Box className={`${classes.chip} ${estadoChipClass(value)}`} component="span">
                            {value === "confirmada" && <><Check size={10} strokeWidth={2.5} /> {estadoChipLabel(value)}</>}
                            {value === "cancelada" && <><X size={10} strokeWidth={2.5} /> {estadoChipLabel(value)}</>}
                            {value === "pendiente" && <><CalendarDays size={10} strokeWidth={2.5} /> {estadoChipLabel(value)}</>}
                          </Box>
                        )}
                      >
                        <MenuItem value="pendiente" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>Pendiente</MenuItem>
                        <MenuItem value="cancelada" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>Cancelada</MenuItem>
                        <MenuItem value="confirmada" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>Confirmada</MenuItem>
                      </Select>
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        <Tooltip title="Editar" placement="top">
                          <button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpenEdit(reserva)}>
                            <Edit2 size={14} strokeWidth={2.2} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Ver detalles" placement="top">
                          <button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleOpenDetails(reserva)}>
                            <Eye size={14} strokeWidth={2.2} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Eliminar" placement="top">
                          <button className={`${classes.actBtn} ${classes.bDel}`} onClick={() => handleDelete(reserva._id)}>
                            <Trash2 size={14} strokeWidth={2.2} />
                          </button>
                        </Tooltip>
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height: 160 }}>
                  <TableCell colSpan={8} className={classes.emptyCell}>
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
          <button className={classes.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? .4 : 1 }}>
            <ArrowLeft size={12} strokeWidth={2.5} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`${classes.pageBtn} ${page === i ? classes.pagBtnOn : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className={classes.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? .4 : 1 }}>
            <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </Box>
        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography className={classes.pagInfo}>Filas:</Typography>
          <select value={rowsPerPage} onChange={handleChangeRowsPerPage}
            style={{ border: "1px solid rgba(108,63,255,.16)", borderRadius: 9, padding: "4px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.ink3, background: "rgba(255,255,255,.80)", outline: "none", cursor: "pointer" }}>
            {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      <Dialog
        open={open} onClose={handleCloseEdit} maxWidth="sm" fullWidth
        classes={{ paper: classes.dlgPaper }}
        disablePortal={false}
        style={{ zIndex: 1200 }}
        container={typeof document !== "undefined" ? document.body : undefined}
      >
        <DlgHdr
          icon={editingId ? <Edit2 size={20} color="#fff" strokeWidth={2.2} /> : <BookOpen size={20} color="#fff" strokeWidth={2.2} />}
          title={editingId ? "Editar Reserva" : "Nueva Reserva"}
          sub={editingId ? "Modifica los datos de la reserva seleccionada" : "Completa los campos para registrar una nueva reserva"}
          onClose={handleCloseEdit}
        />
        <DialogContent className={classes.dlgBody}>

          {/* Sección 1: Información del Cliente */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(108,63,255,.12)" }}>
                <User size={13} color={T.v1} strokeWidth={2.5} />
              </Box>
              Información del Cliente
            </Box>
            <TextField
              className={`${classes.fmField} ${formErrors.titular_reserva ? classes.fmFieldError : ""}`}
              margin="dense" label="Cliente" name="titular_reserva"
              value={formData.titular_reserva} onChange={handleChange}
              fullWidth variant="outlined" required
              error={!!formErrors.titular_reserva}
              helperText={formErrors.titular_reserva || MENSAJES_INSTRUCTIVOS.TITULAR}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
            />
          </Box>

          {/* Sección 2: Fechas */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(0,212,170,.12)" }}>
                <CalendarDays size={13} color={T.t1} strokeWidth={2.5} />
              </Box>
              Fechas de Reserva
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={`${classes.fmField} ${formErrors.fecha_inicio ? classes.fmFieldError : ""}`}
                margin="dense" label="Fecha de Inicio" name="fecha_inicio" type="date"
                value={formData.fecha_inicio} onChange={handleChange}
                fullWidth InputLabelProps={{ shrink: true }} variant="outlined" required
                error={!!formErrors.fecha_inicio}
                helperText={formErrors.fecha_inicio || MENSAJES_INSTRUCTIVOS.FECHA_INICIO}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarDays size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
              <TextField
                className={`${classes.fmField} ${formErrors.fecha_fin ? classes.fmFieldError : ""}`}
                margin="dense" label="Fecha de Fin" name="fecha_fin" type="date"
                value={formData.fecha_fin} onChange={handleChange}
                fullWidth InputLabelProps={{ shrink: true }} variant="outlined" required
                error={!!formErrors.fecha_fin}
                helperText={formErrors.fecha_fin || MENSAJES_INSTRUCTIVOS.FECHA_FIN}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarDays size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
            </Box>
          </Box>

          {/* Sección 3: Apartamentos */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(37,99,235,.12)" }}>
                <Home size={13} color={T.b1} strokeWidth={2.5} />
              </Box>
              Apartamentos
            </Box>
            <FormControl fullWidth margin="dense" variant="outlined" className={classes.fmField} error={!!formErrors.apartamentos}>
              <InputLabel id="apartamentos-label" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", color: T.ink3 }}>Apartamentos</InputLabel>
              <Select
                labelId="apartamentos-label"
                multiple name="apartamentos"
                value={formData.apartamentos || []}
                onChange={handleApartamentosChange}
                label="Apartamentos"
                renderValue={(selected) => (
                  <Box style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selected.map((value) => {
                      const apt = mappedApartamentosOptions.find(i => i.id === value)
                      return (
                        <Box key={value} className={classes.chip} component="span"
                          style={{ background: "rgba(108,63,255,.10)", color: T.v1, border: `1px solid rgba(108,63,255,.20)` }}>
                          {apt ? apt.label.split(" - ")[0] : value}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              >
                {mappedApartamentosOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", color: formErrors.apartamentos ? "#ef4444" : T.ink3, marginTop: 4, marginLeft: 14 }}>
                {formErrors.apartamentos || MENSAJES_INSTRUCTIVOS.APARTAMENTOS}
              </Typography>
            </FormControl>
          </Box>

          {/* Sección 4: Detalles Financieros */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(0,212,170,.12)" }}>
                <DollarSign size={13} color={T.t1} strokeWidth={2.5} />
              </Box>
              Detalles Financieros
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField} margin="dense" label="Estadía (Noches)"
                name="noches_estadia" type="number" value={formData.noches_estadia}
                fullWidth disabled variant="outlined"
                helperText={MENSAJES_INSTRUCTIVOS.NOCHES}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarDays size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
              <TextField
                className={classes.fmField} margin="dense" label="Pagos Parciales"
                name="pagos_parciales" type="number" value={formData.pagos_parciales}
                onChange={handleChange} fullWidth variant="outlined"
                helperText={MENSAJES_INSTRUCTIVOS.PAGOS_PARCIALES}
                InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField} margin="dense" label="Total"
                name="total" type="text"
                value={formatCOP(formData.total)}
                fullWidth disabled variant="outlined"
                helperText={MENSAJES_INSTRUCTIVOS.TOTAL}
                InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
              <TextField
                className={classes.fmField} margin="dense" label="50% del Total"
                name="half_total" type="text"
                value={formatCOP(formData.total / 2)}
                fullWidth disabled variant="outlined"
                helperText="Monto mínimo de anticipo requerido."
                InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
              />
            </Box>
            <FormControl fullWidth variant="outlined" className={classes.fmField}>
              <InputLabel id="estado-reserva-label" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", color: T.ink3 }}>Estado</InputLabel>
              <Select
                labelId="estado-reserva-label"
                name="estado" value={formData.estado}
                onChange={handleChange} label="Estado" fullWidth
              >
                <MenuItem value="pendiente" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>🕐 Pendiente</MenuItem>
                <MenuItem value="cancelada" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>❌ Cancelada</MenuItem>
                <MenuItem value="confirmada" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem" }}>✅ Confirmada</MenuItem>
              </Select>
              <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", color: T.ink3, marginTop: 4, marginLeft: 14 }}>
                {MENSAJES_INSTRUCTIVOS.ESTADO}
              </Typography>
            </FormControl>
          </Box>

          {/* Sección 5: Acompañantes */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(255,123,44,.12)" }}>
                <Users size={13} color={T.a1} strokeWidth={2.5} />
              </Box>
              Acompañantes
            </Box>

            {formData.acompanantes?.map((acomp, index) => (
              <Box key={index} className={classes.acompCard}>
                <Box className={classes.acompCardHdr}>
                  <Typography className={classes.acompLbl}>Acompañante {index + 1}</Typography>
                  <button className={classes.btnDelAcomp} onClick={() => handleDeleteAcompanante(index)}>
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </Box>
                <Box className={classes.fmRow}>
                  <TextField
                    className={`${classes.fmField} ${formErrors.acompanantes[index]?.nombre ? classes.fmFieldError : ""}`}
                    label="Nombre" name="nombre" value={acomp.nombre || ""}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    variant="outlined" size="small" fullWidth
                    error={!!formErrors.acompanantes[index]?.nombre}
                    helperText={formErrors.acompanantes[index]?.nombre || MENSAJES_INSTRUCTIVOS.ACOMP_NOMBRE}
                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
                  />
                  <TextField
                    className={`${classes.fmField} ${formErrors.acompanantes[index]?.apellido ? classes.fmFieldError : ""}`}
                    label="Apellido" name="apellido" value={acomp.apellido || ""}
                    onChange={(e) => handleAcompananteChange(index, e)}
                    variant="outlined" size="small" fullWidth
                    error={!!formErrors.acompanantes[index]?.apellido}
                    helperText={formErrors.acompanantes[index]?.apellido || MENSAJES_INSTRUCTIVOS.ACOMP_APELLIDO}
                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={14} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
                  />
                </Box>
                {/* FIX: usar siempre acomp.documento (ya normalizado en handleOpenEdit) */}
                <TextField
                  className={`${classes.fmField} ${formErrors.acompanantes[index]?.documento ? classes.fmFieldError : ""}`}
                  label="Documento" name="documento"
                  value={acomp.documento || ""}
                  onChange={(e) => handleAcompananteChange(index, e)}
                  variant="outlined" size="small" fullWidth
                  error={!!formErrors.acompanantes[index]?.documento}
                  helperText={formErrors.acompanantes[index]?.documento || MENSAJES_INSTRUCTIVOS.ACOMP_DOC}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Hash size={14} color={T.ink3} strokeWidth={2} /></InputAdornment> }}
                />
              </Box>
            ))}

            <button className={classes.btnAgregarAcomp} onClick={agregarAcompanante}>
              <PlusCircle size={14} strokeWidth={2.2} />
              Agregar Acompañante
            </button>
          </Box>

        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseEdit} className={classes.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={classes.btnSubmit}>
            <Check size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            {editingId ? "Actualizar Reserva" : "Crear Reserva"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog
        open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth
        classes={{ paper: classes.dlgPaperLarge }}
        disablePortal={false}
        style={{ zIndex: 1200 }}
        container={typeof document !== "undefined" ? document.body : undefined}
      >
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2} />}
          title="Detalles de la Reserva"
          sub="Información completa de la reserva seleccionada"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedReserva ? (
            <>
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>{getInitials(selectedReserva.titular_reserva)}</Box>
                <Typography className={classes.detName}>{selectedReserva.titular_reserva}</Typography>
                <Typography className={classes.detSub}>Reserva #{selectedReserva.numero_reserva}</Typography>
                <Box className={`${classes.chip} ${estadoChipClass(selectedReserva.estado)}`} component="span" style={{ marginTop: 8 }}>
                  {selectedReserva.estado === "confirmada" && <><Check size={11} strokeWidth={2.5} /> Confirmada</>}
                  {selectedReserva.estado === "cancelada" && <><X size={11} strokeWidth={2.5} /> Cancelada</>}
                  {selectedReserva.estado === "pendiente" && <><CalendarDays size={11} strokeWidth={2.5} /> Pendiente</>}
                </Box>
              </Box>

              <Box style={{ height: 1, background: T.bL, margin: "14px 0" }} />

              <Box className={classes.detGrid}>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Fecha de Inicio</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarDays size={14} color={T.v1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{selectedReserva.fecha_inicio?.substring(0, 10) || "—"}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Fecha de Fin</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarDays size={14} color={T.t1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{selectedReserva.fecha_fin?.substring(0, 10) || "—"}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Apartamentos</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Home size={14} color={T.b1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{renderApartamentosInfo(selectedReserva)}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Estadía</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarDays size={14} color={T.a1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{selectedReserva.noches_estadia} noches</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Total</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <DollarSign size={14} color={T.t1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{formatCOP(selectedReserva.total)}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>50% del Total</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <DollarSign size={14} color={T.v1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{formatCOP(selectedReserva.total / 2)}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Pagos Parciales</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CreditCard size={14} color={T.ink3} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{formatCOP(selectedReserva.pagos_parciales)}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>N° Acompañantes</Typography>
                  <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={14} color={T.a1} strokeWidth={2.2} />
                    <Typography className={classes.detVal}>{selectedReserva.acompanantes?.length || 0}</Typography>
                  </Box>
                </Box>

                {selectedReserva.acompanantes?.length > 0 && (
                  <Box className={classes.detItemFull}>
                    <Typography className={classes.detLbl}>Acompañantes</Typography>
                    <Box style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                      {selectedReserva.acompanantes.map((acomp, idx) => (
                        <Box key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(108,63,255,.05)", border: `1px solid ${T.bL}` }}>
                          <Box style={{ width: 28, height: 28, borderRadius: 8, background: avGrad(idx), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={13} color="#fff" strokeWidth={2.2} />
                          </Box>
                          <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".86rem", fontWeight: 600, color: T.ink }}>
                            {acomp.nombre} {acomp.apellido}
                          </Typography>
                          <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", color: T.ink3, marginLeft: "auto" }}>
                            {/* FIX: normalizar también en la vista de detalles */}
                            Doc: {acomp.documento || acomp.documento_acompanante || acomp.numero_documento || "N/A"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Typography style={{ fontFamily: "'DM Sans',sans-serif", color: T.ink3, padding: "2rem", textAlign: "center" }}>
              Cargando detalles…
            </Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
          {selectedReserva && (
            <Button onClick={() => { handleCloseDetails(); handleOpenEdit(selectedReserva) }} className={classes.btnSubmit}>
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} /> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default ReservasList