"use client"

import { useState, useEffect, useRef } from "react"
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
import Grid from "@material-ui/core/Grid"
import Avatar from "@material-ui/core/Avatar"
import Divider from "@material-ui/core/Divider"
import {
  Edit2, Trash2, Eye, X, Search, Check,
  ArrowLeft, ArrowRight, Tag, FileText, DollarSign,
  Percent, Calendar, ToggleLeft, Info,
} from "lucide-react"
import LocalOffer from "@material-ui/icons/LocalOffer"
import Description from "@material-ui/icons/Description"
import AttachMoney from "@material-ui/icons/AttachMoney"
import CalendarToday from "@material-ui/icons/CalendarToday"
import VerifiedUser from "@material-ui/icons/VerifiedUser"
import Apartment from "@material-ui/icons/Apartment"
import ShowChart from "@material-ui/icons/ShowChart"
import MoneyOff from "@material-ui/icons/MoneyOff"
import EventAvailable from "@material-ui/icons/EventAvailable"
import EventBusy from "@material-ui/icons/EventBusy"
import Swal from "sweetalert2"
import descuentoService from "./descuentos.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LÓGICA ORIGINAL — 100% sin cambios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const VALIDACION = {
  DESCRIPCION: { MIN_LENGTH: 5, MAX_LENGTH: 50 },
  PRECIO:      { MIN_LENGTH: 5, MAX_LENGTH: 7  },
}

const MENSAJES_INSTRUCTIVOS = {
  DESCRIPCION: "Ingrese una descripción entre 5 y 50 caracteres, solo letras y espacios.",
  PRECIO: `Ingrese un precio entre ${VALIDACION.PRECIO.MIN_LENGTH} y ${VALIDACION.PRECIO.MAX_LENGTH} dígitos.`,
}

const REGEX = {
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
}

const formatPrice = (value) => {
  if (isNaN(value) || value === "") return ""
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(Number(value))
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DESIGN TOKENS — mismo sistema que ClienteList
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

const AV_GRADS = [
  T.gv, T.ge, T.gt, T.gb,
  "linear-gradient(135deg,#FF7B2C,#F5C518)",
  "linear-gradient(135deg,#AA00FF,#651FFF)",
]
const avGrad = (i) => AV_GRADS[i % AV_GRADS.length]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SWAL INJECT — idéntico al de ClienteList
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
const SW  = { customClass: { popup: "rs-pop", title: "rs-ttl", htmlContainer: "rs-bod", confirmButton: "rs-ok", cancelButton: "rs-cn" }, buttonsStyling: false }
const SWD = { ...SW, customClass: { ...SW.customClass, popup: "rs-pop rs-danger" } }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE CELLS — idénticas al de ClienteList
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
   BOTÓN NATIVO — mismo estilo que ClienteList
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const btnAddStyle = {
  display: "flex", alignItems: "center", gap: 8,
  background: "linear-gradient(135deg,#6C3FFF,#C040FF)",
  color: "#fff",
  fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
  fontSize: ".80rem", letterSpacing: ".7px",
  padding: "10px 22px", borderRadius: 50,
  border: "none", cursor: "pointer",
  boxShadow: "0 5px 18px rgba(108,63,255,.40)",
  textTransform: "uppercase",
  transition: "all .22s",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES — espejo exacto del ClienteList
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles((theme) => ({
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

  /* ── STATS ── */
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
  sb: { background: "linear-gradient(145deg,rgba(37,99,235,.10),rgba(124,58,237,.07))", boxShadow: "0 5px 22px rgba(37,99,235,.11)", "&::before": { background: T.gb } },
  statOrb: { position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", filter: "blur(22px)", opacity: .4, pointerEvents: "none" },
  statLabel: { fontFamily: "'DM Sans',sans-serif", fontSize: ".70rem", fontWeight: 700, letterSpacing: "1.1px", textTransform: "uppercase", marginBottom: 5 },
  statVal: { fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, lineHeight: 1 },
  statSub: { fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", marginTop: 4, fontWeight: 500 },

  /* ── TOOLBAR ── */
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 26px", gap: 12, flexWrap: "wrap" },
  searchPill: {
    display: "flex", alignItems: "center", gap: 9,
    background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(108,63,255,0.12)",
    borderRadius: 50, padding: "9px 18px", minWidth: 260,
    boxShadow: "0 2px 10px rgba(108,63,255,0.07)", transition: "all .2s",
    "&:focus-within": { borderColor: "rgba(108,63,255,.35)", boxShadow: "0 0 0 3px rgba(108,63,255,.10)", background: T.white },
  },
  searchInput: { border: "none", outline: "none", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.ink, width: "100%", "&::placeholder": { color: T.ink4 } },
  kbd: { fontSize: 10, color: T.ink4, background: "rgba(108,63,255,0.07)", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" },

  /* ── TABLE ── */
  tblWrap: { margin: "0 26px 16px", borderRadius: 20, overflow: "hidden", border: `1px solid rgba(108,63,255,.10)`, boxShadow: "0 4px 20px rgba(108,63,255,.07)" },
  tblRow: { transition: "background .15s", "&:nth-of-type(odd)": { background: "rgba(244,241,255,.30)" }, "&:hover": { background: "rgba(108,63,255,.055)" } },

  /* ── NAME CELL ── */
  nameWrap: { display: "flex", alignItems: "center", gap: 10 },
  nameAv: { width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 12px rgba(108,63,255,.30)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" },
  nameText: { fontWeight: 700, fontSize: ".90rem", color: T.ink },
  nameId: { fontSize: ".72rem", color: T.ink4, marginTop: 1 },

  /* ── CHIPS ── */
  chip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", fontWeight: 700, whiteSpace: "nowrap" },
  cOn:  { background: "rgba(0,212,170,.12)", color: "#00917a" },
  cOff: { background: "rgba(255,59,130,.10)", color: "#cc2060" },

  /* ── ACTION BUTTONS ── */
  actWrap: { display: "flex", justifyContent: "center", gap: 5 },
  actBtn: { width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all .18s", "&:hover": { transform: "scale(1.14)", boxShadow: "0 4px 14px rgba(0,0,0,.18)" } },
  bEdit: { background: "linear-gradient(135deg,#00D4AA,#00A3E0)", color: "#fff" },
  bView: { background: T.gv, color: "#fff" },
  bDel:  { background: T.ge, color: "#fff" },

  /* ── PAGINATION ── */
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

  /* ── DIALOG ── */
  dlgPaper: {
    borderRadius: "26px !important", boxShadow: "0 24px 64px rgba(108,63,255,0.24) !important",
    border: `1px solid ${T.bM}`, width: 640, maxWidth: "96vw",
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

  /* ── FORM SECTIONS ── */
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
  fmRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  /* ── DIALOG FOOTER ── */
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
  },

  /* ── DETAILS DIALOG ── */
  detHero: { display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0 18px" },
  detAv: { width: 76, height: 76, borderRadius: 22, background: T.gv, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 32px rgba(108,63,255,.40)", marginBottom: 12, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: "#fff" },
  detName: { fontFamily: "'Syne',sans-serif !important", fontSize: "1.20rem !important", fontWeight: "800 !important", color: `${T.ink} !important`, marginBottom: 4, textAlign: "center" },
  detSub: { fontFamily: "'DM Sans',sans-serif", fontSize: ".84rem", color: T.ink3, textAlign: "center" },
  detGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 },
  detItem: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4 },
  detItemFull: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" },
  detLbl: { fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".9px", textTransform: "uppercase", color: T.ink3 },
  detVal: { fontFamily: "'DM Sans',sans-serif", fontSize: ".90rem", fontWeight: 600, color: T.ink },
  detValMono: { fontFamily: "monospace", fontSize: ".76rem", color: T.ink3, fontWeight: 500 },
  detIconRow: { display: "flex", alignItems: "center", gap: 6 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const DescuentosList = ({ canCreate, canUpdate, canDelete }) => {
  const classes = useStyles()

  /* ── STATE — 100% original ── */
  const [descuentos,        setDescuentos]        = useState([])
  const [open,              setOpen]              = useState(false)
  const [detailsOpen,       setDetailsOpen]       = useState(false)
  const [editingId,         setEditingId]         = useState(null)
  const [selectedDescuento, setSelectedDescuento] = useState(null)
  const [formData,          setFormData]          = useState({
    tipoApartamento: "", descripcion: "", porcentaje: "",
    precio: "", precio_con_descuento: "",
    fecha_inicio: "", fecha_fin: "", estado: true,
  })
  const [formErrors,      setFormErrors]      = useState({ tipoApartamento: "", descripcion: "", porcentaje: "", precio: "", fecha_inicio: "", fecha_fin: "" })
  const [fieldValidation, setFieldValidation] = useState({ tipoApartamento: false, descripcion: false, porcentaje: false, precio: false, fecha_inicio: false, fecha_fin: false })
  const [touched,         setTouched]         = useState({ tipoApartamento: false, descripcion: false, porcentaje: false, precio: false, fecha_inicio: false, fecha_fin: false })
  const [searchTerm,      setSearchTerm]      = useState("")
  const [page,            setPage]            = useState(0)
  const [rowsPerPage,     setRowsPerPage]     = useState(5)

  const tipoApartamentoRef = useRef(null)
  const descripcionRef     = useRef(null)
  const porcentajeRef      = useRef(null)
  const precioRef          = useRef(null)
  const fechaInicioRef     = useRef(null)
  const fechaFinRef        = useRef(null)
  const estadoRef          = useRef(null)

  const getTodayDate = () => new Date().toISOString().split("T")[0]

  /* ── LÓGICA ORIGINAL — 100% sin cambios ── */
  const fetchDescuentos = async () => {
    try {
      const data = await descuentoService.getDescuentos()
      setDescuentos(data)
    } catch (error) {
      console.error("Error fetching descuentos", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar los descuentos." })
    }
  }

  useEffect(() => { fetchDescuentos() }, [])

  useEffect(() => {
    const precio     = Number.parseFloat(formData.precio)
    const porcentaje = Number.parseFloat(formData.porcentaje)
    if (!isNaN(precio) && !isNaN(porcentaje)) {
      const calculo = precio * (1 - porcentaje / 100)
      setFormData((prev) => ({ ...prev, precio_con_descuento: calculo.toFixed(2) }))
    } else {
      setFormData((prev) => ({ ...prev, precio_con_descuento: "" }))
    }
  }, [formData.precio, formData.porcentaje])

  const handleToggleState = async (id, currentState) => {
    try {
      await descuentoService.updateDescuento(id, { estado: !currentState })
      Swal.fire({ ...SW, icon: "success", title: "Actualizado", text: "El estado del descuento se actualizó correctamente." })
      fetchDescuentos()
    } catch (error) {
      console.error("Error toggling state", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "Ocurrió un error al actualizar el estado." })
    }
  }

  const handleOpen = (descuento) => {
    setFormErrors({ tipoApartamento: "", descripcion: "", porcentaje: "", precio: "", fecha_inicio: "", fecha_fin: "" })
    setFieldValidation({ tipoApartamento: false, descripcion: false, porcentaje: false, precio: false, fecha_inicio: false, fecha_fin: false })
    setTouched({ tipoApartamento: false, descripcion: false, porcentaje: false, precio: false, fecha_inicio: false, fecha_fin: false })
    if (descuento) {
      setFormData({
        tipoApartamento:     descuento.tipoApartamento || "",
        descripcion:         descuento.descripcion || "",
        porcentaje:          descuento.porcentaje || "",
        precio:              descuento.precio || "",
        precio_con_descuento:descuento.precio_con_descuento || "",
        fecha_inicio:        descuento.fecha_inicio ? descuento.fecha_inicio.substring(0, 10) : "",
        fecha_fin:           descuento.fecha_fin    ? descuento.fecha_fin.substring(0, 10)    : "",
        estado:              descuento.estado ?? true,
      })
      setEditingId(descuento._id)
      setFieldValidation({ tipoApartamento: true, descripcion: true, porcentaje: true, precio: true, fecha_inicio: true, fecha_fin: true })
    } else {
      setFormData({ tipoApartamento: "", descripcion: "", porcentaje: "", precio: "", precio_con_descuento: "", fecha_inicio: "", fecha_fin: "", estado: true })
      setEditingId(null)
    }
    setOpen(true)
    setTimeout(() => { if (tipoApartamentoRef.current) tipoApartamentoRef.current.focus() }, 100)
  }

  const handleClose = (e, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return
    if (typeof document !== "undefined" && document.activeElement) document.activeElement.blur()
    setOpen(false)
    setFormErrors({ tipoApartamento: "", descripcion: "", porcentaje: "", precio: "", fecha_inicio: "", fecha_fin: "" })
  }

  const handleDetails = (descuento) => { setSelectedDescuento(descuento); setDetailsOpen(true) }

  const handleCloseDetails = (e, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return
    if (typeof document !== "undefined" && document.activeElement) document.activeElement.blur()
    setDetailsOpen(false)
  }

  const validarTipoApartamento = (value) => (!value ? "El tipo de apartamento es obligatorio" : "")

  const validarDescripcion = (value) => {
    if (!value) return "La descripción es obligatoria"
    if (value.trim() === "") return "La descripción no puede estar vacía"
    if (!REGEX.SOLO_LETRAS_ESPACIOS.test(value)) return "La descripción solo debe contener letras y espacios"
    if (value.length < VALIDACION.DESCRIPCION.MIN_LENGTH) return `La descripción debe tener al menos ${VALIDACION.DESCRIPCION.MIN_LENGTH} caracteres`
    if (value.length > VALIDACION.DESCRIPCION.MAX_LENGTH) return `La descripción no puede tener más de ${VALIDACION.DESCRIPCION.MAX_LENGTH} caracteres`
    return ""
  }

  const validarPorcentaje = (value) => (!value ? "El porcentaje es obligatorio" : "")

  const validarPrecio = (value) => {
    if (!value) return "El precio es obligatorio"
    if (isNaN(value) || Number(value) <= 0) return "El precio debe ser un número mayor que cero"
    if (value.length < VALIDACION.PRECIO.MIN_LENGTH) return `El precio debe tener al menos ${VALIDACION.PRECIO.MIN_LENGTH} dígitos`
    if (value.length > VALIDACION.PRECIO.MAX_LENGTH) return `El precio no puede tener más de ${VALIDACION.PRECIO.MAX_LENGTH} dígitos`
    return ""
  }

  const validarFechaInicio = (value) => {
    if (!value) return "La fecha de inicio es obligatoria"
    if (value < getTodayDate()) return "La fecha de inicio no puede ser anterior a la fecha actual"
    return ""
  }

  const validarFechaFin = (value, fechaInicio) => {
    if (!value) return "La fecha de fin es obligatoria"
    if (fechaInicio && value < fechaInicio) return "La fecha final no puede ser anterior a la fecha de inicio"
    return ""
  }

  const validateField = (name, value) => {
    let error = ""
    switch (name) {
      case "tipoApartamento": error = validarTipoApartamento(value); break
      case "descripcion":     error = validarDescripcion(value);     break
      case "porcentaje":      error = validarPorcentaje(value);      break
      case "precio":          error = validarPrecio(value);          break
      case "fecha_inicio":    error = validarFechaInicio(value);     break
      case "fecha_fin":       error = validarFechaFin(value, formData.fecha_inicio); break
      default: break
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }))
    setFieldValidation((prev) => ({ ...prev, [name]: !error }))
    return !error
  }

  const handleFieldBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleKeyDown = (e, nextFieldName) => {
    const { name, value } = e.target
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const isValid = validateField(name, value)
      if (isValid && nextFieldName) {
        const map = { descripcion: descripcionRef, precio: precioRef, porcentaje: porcentajeRef, fecha_inicio: fechaInicioRef, fecha_fin: fechaFinRef, estado: estadoRef }
        map[nextFieldName]?.current?.focus()
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    let updatedValue = value
    if (name === "descripcion") {
      if (!REGEX.SOLO_LETRAS_ESPACIOS.test(value) && value !== "") return
      if (value.length > VALIDACION.DESCRIPCION.MAX_LENGTH) updatedValue = value.substring(0, VALIDACION.DESCRIPCION.MAX_LENGTH)
    }
    if (name === "precio") {
      if (!/^\d*$/.test(value)) return
      if (value.length > VALIDACION.PRECIO.MAX_LENGTH) updatedValue = value.substring(0, VALIDACION.PRECIO.MAX_LENGTH)
    }
    setFormData((prev) => ({ ...prev, [name]: updatedValue }))
    validateField(name, updatedValue)
  }

  const validateForm = () => {
    setTouched({ tipoApartamento: true, descripcion: true, porcentaje: true, precio: true, fecha_inicio: true, fecha_fin: true })
    const tAE = validarTipoApartamento(formData.tipoApartamento)
    const dE  = validarDescripcion(formData.descripcion)
    const pE  = validarPorcentaje(formData.porcentaje)
    const prE = validarPrecio(formData.precio)
    const fiE = validarFechaInicio(formData.fecha_inicio)
    const ffE = validarFechaFin(formData.fecha_fin, formData.fecha_inicio)
    setFormErrors({ tipoApartamento: tAE, descripcion: dE, porcentaje: pE, precio: prE, fecha_inicio: fiE, fecha_fin: ffE })
    setFieldValidation({ tipoApartamento: !tAE, descripcion: !dE, porcentaje: !pE, precio: !prE, fecha_inicio: !fiE, fecha_fin: !ffE })
    return !tAE && !dE && !pE && !prE && !fiE && !ffE
  }

  const handleSubmit = async () => {
    const isValid = validateForm()
    if (!isValid) {
      if (!fieldValidation.tipoApartamento)     tipoApartamentoRef.current?.focus()
      else if (!fieldValidation.descripcion)    descripcionRef.current?.focus()
      else if (!fieldValidation.porcentaje)     porcentajeRef.current?.focus()
      else if (!fieldValidation.precio)         precioRef.current?.focus()
      else if (!fieldValidation.fecha_inicio)   fechaInicioRef.current?.focus()
      else if (!fieldValidation.fecha_fin)      fechaFinRef.current?.focus()
      return
    }
    try {
      if (editingId) {
        await descuentoService.updateDescuento(editingId, formData)
        Swal.fire({ ...SW, icon: "success", title: "Actualizado", text: "El descuento se actualizó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      } else {
        await descuentoService.createDescuento(formData)
        Swal.fire({ ...SW, icon: "success", title: "Creado", text: "El descuento se creó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }
      fetchDescuentos()
      handleClose()
    } catch (error) {
      console.error("Error saving descuento", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "Ocurrió un error al guardar el descuento." })
    }
  }

  const handleDelete = async (id, estado) => {
    if (estado === true) {
      Swal.fire({ ...SW, icon: "warning", title: "Acción no permitida", text: "No se puede eliminar un descuento activo." })
      return
    }
    const result = await Swal.fire({
      ...SWD, title: "¿Eliminar descuento?", text: "Esta acción no se puede deshacer.",
      icon: "question", showCancelButton: true,
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    })
    if (result.isConfirmed) {
      try {
        await descuentoService.deleteDescuento(id)
        Swal.fire({ ...SW, icon: "success", title: "Eliminado", text: "El descuento se eliminó correctamente.", timer: 2000, timerProgressBar: true, showConfirmButton: false })
        fetchDescuentos()
      } catch (error) {
        console.error("Error deleting descuento", error)
        Swal.fire({ ...SW, icon: "error", title: "Error", text: "Ocurrió un error al eliminar el descuento." })
      }
    }
  }

  const filteredDescuentos  = descuentos.filter((d) =>
    d.tipoApartamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const paginatedDescuentos = filteredDescuentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages          = Math.max(1, Math.ceil(filteredDescuentos.length / rowsPerPage))

  const totalActive   = descuentos.filter((d) => d.estado).length
  const totalInactive = descuentos.filter((d) => !d.estado).length

  /* ── DIALOG HEADER — mismo patrón que ClienteList ── */
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
        <X size={15} strokeWidth={2.5} />
      </button>
    </Box>
  )

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <Box className={classes.root}>

      {/* ── HEADER ── */}
      <Box className={classes.hdr}>
        <Box className={classes.hdrLeft}>
          <Box className={classes.hdrIcon}>
            <Tag size={26} color="#fff" strokeWidth={2} />
          </Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Descuentos</Typography>
            <Typography className={classes.hdrSub}>Administra los descuentos del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── STATS ── */}
      <Box className={classes.statsRow}>
        {[
          { label: "Total",     val: descuentos.length, sub: "registrados",  c: classes.sv, orb: "#6C3FFF", col: "#6C3FFF", sc: "#5929d9" },
          { label: "Activos",   val: totalActive,       sub: "habilitados",  c: classes.st, orb: "#00D4AA", col: "#007a62", sc: "#007a62" },
          { label: "Inactivos", val: totalInactive,     sub: "desactivados", c: classes.sr, orb: "#FF3B82", col: "#cc2060", sc: "#cc2060" },
        ].map((s, i) => (
          <Box key={i} className={`${classes.stat} ${s.c}`}>
            <Box className={classes.statOrb} style={{ background: s.orb }} />
            <Typography className={classes.statLabel} style={{ color: s.col }}>{s.label}</Typography>
            <Typography className={classes.statVal}>{s.val}</Typography>
            <Typography className={classes.statSub} style={{ color: s.sc }}>{s.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── TOOLBAR ── */}
      <Box className={classes.toolbar}>
        <Box className={classes.searchPill}>
          <Search size={14} color={T.ink4} strokeWidth={2.5} />
          <input
            className={classes.searchInput}
            placeholder="Buscar por tipo o descripción…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
          />
          <span className={classes.kbd}>⌘K</span>
        </Box>
        {canCreate && (
          <button
            onClick={() => handleOpen(null)}
            style={btnAddStyle}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 9px 26px rgba(108,63,255,.52)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 5px 18px rgba(108,63,255,.40)" }}
          >
            <Percent size={17} strokeWidth={2.5} />
            Nuevo Descuento
          </button>
        )}
      </Box>

      {/* ── TABLE ── */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius: 20 }}>
          <Table style={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign: "left" }}>Tipo / Descripción</HCell>
                <HCell>Porcentaje</HCell>
                <HCell>Precio Original</HCell>
                <HCell>Precio c/Desc.</HCell>
                <HCell>Vigencia</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDescuentos.length > 0 ? (
                paginatedDescuentos.map((d, i) => (
                  <TableRow key={d._id} className={classes.tblRow}>
                    {/* Tipo + Descripción como nameWrap */}
                    <NCell>
                      <Box className={classes.nameWrap}>
                        <Box className={classes.nameAv} style={{ background: avGrad(i) }}>
                          {d.tipoApartamento?.substring(0, 2).toUpperCase() || "DC"}
                        </Box>
                        <Box>
                          <Typography className={classes.nameText}>{d.tipoApartamento}</Typography>
                          <Typography className={classes.nameId}>{d.descripcion}</Typography>
                        </Box>
                      </Box>
                    </NCell>
                    <BCell>
                      <Box className={classes.chip} component="span" style={{ background: "rgba(108,63,255,.10)", color: "#5929d9" }}>
                        <Percent size={10} strokeWidth={2.5} /> {d.porcentaje}%
                      </Box>
                    </BCell>
                    <BCell>{formatPrice(d.precio)}</BCell>
                    <BCell>
                      <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".83rem", color: "#00917a", fontWeight: 700 }}>
                        {formatPrice(d.precio_con_descuento)}
                      </Typography>
                    </BCell>
                    <BCell>
                      <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".76rem", color: T.ink3, lineHeight: 1.5 }}>
                        {d.fecha_inicio ? d.fecha_inicio.substring(0, 10) : "—"}<br />
                        <span style={{ color: T.ink4 }}>→ {d.fecha_fin ? d.fecha_fin.substring(0, 10) : "—"}</span>
                      </Typography>
                    </BCell>
                    <BCell>
                      <Box className={`${classes.chip} ${d.estado ? classes.cOn : classes.cOff}`} component="span">
                        {d.estado
                          ? <><Check size={10} strokeWidth={2.5} /> Activo</>
                          : <><X     size={10} strokeWidth={2.5} /> Inactivo</>
                        }
                      </Box>
                    </BCell>
                    <BCell>
                      <Box className={classes.actWrap}>
                        {canUpdate && (
                          <Tooltip title="Editar" placement="top">
                            <button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(d)}>
                              <Edit2 size={14} strokeWidth={2.2} />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver detalles" placement="top">
                          <button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleDetails(d)}>
                            <Eye size={14} strokeWidth={2.2} />
                          </button>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip title="Eliminar" placement="top">
                            <button className={`${classes.actBtn} ${classes.bDel}`} onClick={() => handleDelete(d._id, d.estado)}>
                              <Trash2 size={14} strokeWidth={2.2} />
                            </button>
                          </Tooltip>
                        )}
                      </Box>
                    </BCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height: 160 }}>
                  <TableCell colSpan={7} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron descuentos que coincidan con la búsqueda." : "No hay descuentos registrados."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── PAGINATION ── */}
      <Box className={classes.pagWrap}>
        <Typography className={classes.pagInfo}>
          Mostrando {filteredDescuentos.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredDescuentos.length)} de {filteredDescuentos.length} descuentos
        </Typography>
        <Box className={classes.pagBtns}>
          <button className={classes.pageBtn} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? .4 : 1 }}>
            <ArrowLeft size={12} strokeWidth={2.5} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`${classes.pageBtn} ${page === i ? classes.pagBtnOn : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className={classes.pageBtn} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? .4 : 1 }}>
            <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </Box>
        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography className={classes.pagInfo}>Filas:</Typography>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
            style={{ border: "1px solid rgba(108,63,255,.16)", borderRadius: 9, padding: "4px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.ink3, background: "rgba(255,255,255,.80)", outline: "none", cursor: "pointer" }}
          >
            {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm" fullWidth
        classes={{ paper: classes.dlgPaper }}
        disableEnforceFocus
        disableEscapeKeyDown
      >
        <DlgHdr
          icon={editingId
            ? <Edit2    size={20} color="#fff" strokeWidth={2.2} />
            : <Percent size={20} color="#fff" strokeWidth={2.2} />
          }
          title={editingId ? "Editar Descuento" : "Nuevo Descuento"}
          sub={editingId ? "Modifica los datos del descuento seleccionado" : "Completa los campos para registrar un nuevo descuento"}
          onClose={handleClose}
        />
        <DialogContent className={classes.dlgBody}>

          {/* ── Sección 1: Información del Descuento ── */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(108,63,255,.12)" }}>
                <Tag size={13} color={T.v1} strokeWidth={2.5} />
              </Box>
              Información del Descuento
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField} select margin="dense"
                label="Tipo de Apartamento" name="tipoApartamento"
                value={formData.tipoApartamento} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "descripcion")}
                fullWidth variant="outlined" required
                error={touched.tipoApartamento && !!formErrors.tipoApartamento}
                helperText={(touched.tipoApartamento && formErrors.tipoApartamento) || "Seleccione el tipo de apartamento al que aplica."}
                inputRef={tipoApartamentoRef}
                InputProps={{ startAdornment: <InputAdornment position="start"><Apartment style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              >
                <MenuItem value="Apartamento Tipo1">Apartamento Tipo 1</MenuItem>
                <MenuItem value="Apartamento Tipo2">Apartamento Tipo 2</MenuItem>
                <MenuItem value="Penthouse">Penthouse</MenuItem>
              </TextField>
              <TextField
                className={classes.fmField} margin="dense"
                label="Descripción" name="descripcion"
                value={formData.descripcion} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "precio")}
                fullWidth variant="outlined" required
                error={touched.descripcion && !!formErrors.descripcion}
                helperText={(touched.descripcion && formErrors.descripcion) || MENSAJES_INSTRUCTIVOS.DESCRIPCION}
                inputRef={descripcionRef}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Description style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment>,
                  inputProps: { maxLength: VALIDACION.DESCRIPCION.MAX_LENGTH },
                }}
              />
            </Box>
          </Box>

          {/* ── Sección 2: Precios y Descuentos ── */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(0,212,170,.12)" }}>
                <DollarSign size={13} color={T.t1} strokeWidth={2.5} />
              </Box>
              Precios y Descuentos
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField} margin="dense"
                label="Precio Original" name="precio"
                value={formData.precio} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "porcentaje")}
                fullWidth type="text" variant="outlined" required
                error={touched.precio && !!formErrors.precio}
                helperText={(touched.precio && formErrors.precio) || MENSAJES_INSTRUCTIVOS.PRECIO}
                inputRef={precioRef}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              />
              <TextField
                className={classes.fmField} select margin="dense"
                label="Porcentaje" name="porcentaje"
                value={formData.porcentaje} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "fecha_inicio")}
                fullWidth variant="outlined" required
                error={touched.porcentaje && !!formErrors.porcentaje}
                helperText={(touched.porcentaje && formErrors.porcentaje) || "Seleccione el porcentaje de descuento a aplicar."}
                inputRef={porcentajeRef}
                InputProps={{ startAdornment: <InputAdornment position="start"><ShowChart style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              >
                {[5, 10, 15, 20, 25].map((p) => (
                  <MenuItem key={p} value={p}>{p}%</MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              className={classes.fmField} margin="dense"
              label="Precio con Descuento (calculado automáticamente)"
              name="precio_con_descuento"
              value={formatPrice(formData.precio_con_descuento)}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: <InputAdornment position="start"><MoneyOff style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment>,
              }}
              variant="outlined"
              helperText="Se calcula automáticamente según el precio y el porcentaje."
            />
          </Box>

          {/* ── Sección 3: Vigencia y Estado ── */}
          <Box className={classes.fmSection}>
            <Box className={classes.fmSectionLbl}>
              <Box className={classes.fmSectionIco} style={{ background: "rgba(255,59,130,.10)" }}>
                <Calendar size={13} color={T.e1} strokeWidth={2.5} />
              </Box>
              Vigencia y Estado
            </Box>
            <Box className={classes.fmRow}>
              <TextField
                className={classes.fmField} margin="dense"
                label="Fecha Inicio" name="fecha_inicio" type="date"
                value={formData.fecha_inicio} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "fecha_fin")}
                fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: getTodayDate() }}
                variant="outlined" required
                error={touched.fecha_inicio && !!formErrors.fecha_inicio}
                helperText={(touched.fecha_inicio && formErrors.fecha_inicio) || "Fecha desde la que aplica el descuento (no puede ser anterior a hoy)."}
                inputRef={fechaInicioRef}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventAvailable style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              />
              <TextField
                className={classes.fmField} margin="dense"
                label="Fecha Fin" name="fecha_fin" type="date"
                value={formData.fecha_fin} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={(e) => handleKeyDown(e, "estado")}
                fullWidth InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.fecha_inicio || getTodayDate() }}
                variant="outlined" required
                error={touched.fecha_fin && !!formErrors.fecha_fin}
                helperText={(touched.fecha_fin && formErrors.fecha_fin) || "Fecha hasta la que estará vigente el descuento."}
                inputRef={fechaFinRef}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventBusy style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              />
            </Box>
            <TextField
              className={classes.fmField} select margin="dense"
              label="Estado" name="estado"
              value={formData.estado ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value === "true" })}
              fullWidth variant="outlined"
              inputRef={estadoRef}
              InputProps={{ startAdornment: <InputAdornment position="start"><VerifiedUser style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              helperText="Indica si el descuento está activo o inactivo en el sistema."
            >
              <MenuItem value="true">✅ Activo</MenuItem>
              <MenuItem value="false">❌ Inactivo</MenuItem>
            </TextField>
          </Box>

        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
          <Button onClick={handleSubmit} className={classes.btnSubmit}>
            <Check size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            {editingId ? "Actualizar Descuento" : "Crear Descuento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm" fullWidth
        classes={{ paper: classes.dlgPaper }}
        disableEnforceFocus
        disableEscapeKeyDown
      >
        <DlgHdr
          icon={<Eye size={20} color="#fff" strokeWidth={2.2} />}
          title="Detalles del Descuento"
          sub="Información completa del descuento seleccionado"
          onClose={handleCloseDetails}
        />
        <DialogContent className={classes.dlgBody}>
          {selectedDescuento && (
            <>
              {/* Hero con avatar igual al de ClienteList */}
              <Box className={classes.detHero}>
                <Box className={classes.detAv}>
                  <Tag size={32} color="#fff" strokeWidth={2} />
                </Box>
                <Typography className={classes.detName}>{selectedDescuento.descripcion}</Typography>
                <Typography className={classes.detSub}>
                  Descuento del {selectedDescuento.porcentaje}% · {selectedDescuento.tipoApartamento}
                </Typography>
              </Box>

              <Box style={{ height: 1, background: T.bL, margin: "14px 0" }} />

              <Box className={classes.detGrid}>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Tipo de Apartamento</Typography>
                  <Box className={classes.detIconRow}>
                    <Apartment style={{ fontSize: 14, color: T.v1 }} />
                    <Typography className={classes.detVal}>{selectedDescuento.tipoApartamento}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Porcentaje</Typography>
                  <Box className={classes.detIconRow}>
                    <ShowChart style={{ fontSize: 14, color: T.a1 }} />
                    <Typography className={classes.detVal}>{selectedDescuento.porcentaje}%</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Precio Original</Typography>
                  <Box className={classes.detIconRow}>
                    <AttachMoney style={{ fontSize: 14, color: T.b1 }} />
                    <Typography className={classes.detVal}>{formatPrice(selectedDescuento.precio)}</Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Precio con Descuento</Typography>
                  <Box className={classes.detIconRow}>
                    <MoneyOff style={{ fontSize: 14, color: T.t1 }} />
                    <Typography className={classes.detVal} style={{ color: "#00917a" }}>
                      {formatPrice(selectedDescuento.precio_con_descuento)}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Fecha Inicio</Typography>
                  <Box className={classes.detIconRow}>
                    <EventAvailable style={{ fontSize: 14, color: T.v1 }} />
                    <Typography className={classes.detVal}>
                      {selectedDescuento.fecha_inicio ? selectedDescuento.fecha_inicio.substring(0, 10) : "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Fecha Fin</Typography>
                  <Box className={classes.detIconRow}>
                    <EventBusy style={{ fontSize: 14, color: T.e1 }} />
                    <Typography className={classes.detVal}>
                      {selectedDescuento.fecha_fin ? selectedDescuento.fecha_fin.substring(0, 10) : "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>Estado</Typography>
                  <Box
                    className={`${classes.chip} ${selectedDescuento.estado ? classes.cOn : classes.cOff}`}
                    component="span" style={{ marginTop: 2 }}
                  >
                    {selectedDescuento.estado
                      ? <><Check size={11} strokeWidth={2.5} /> Activo</>
                      : <><X     size={11} strokeWidth={2.5} /> Inactivo</>
                    }
                  </Box>
                </Box>
                <Box className={classes.detItem}>
                  <Typography className={classes.detLbl}>ID</Typography>
                  <Typography className={classes.detValMono}>{selectedDescuento._id}</Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className={classes.dlgFoot}>
          <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
          {canUpdate && selectedDescuento && (
            <Button
              onClick={() => { handleCloseDetails(); handleOpen(selectedDescuento) }}
              className={classes.btnSubmit}
            >
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} /> Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default DescuentosList