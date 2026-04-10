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
import {
  Edit2, Trash2, Eye, X, Search, Check,
  ArrowLeft, ArrowRight, CreditCard,
} from "lucide-react"
import Person from "@material-ui/icons/Person"
import AssignmentInd from "@material-ui/icons/AssignmentInd"
import CalendarToday from "@material-ui/icons/CalendarToday"
import VerifiedUser from "@material-ui/icons/VerifiedUser"
import AttachMoney from "@material-ui/icons/AttachMoney"
import Payment from "@material-ui/icons/Payment"
import Receipt from "@material-ui/icons/Receipt"
import EventNote from "@material-ui/icons/EventNote"
import Swal from "sweetalert2"
import pagoService from "./pago.service"
import { makeStyles, withStyles } from "@material-ui/core/styles"

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
const SW  = { customClass: { popup: "rs-pop", title: "rs-ttl", htmlContainer: "rs-bod", confirmButton: "rs-ok", cancelButton: "rs-cn" }, buttonsStyling: false }
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

  /* ── HEADER ── */
  hdr: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 26px 20px", flexWrap: "wrap", gap: 14, borderBottom: "1px solid rgba(108,63,255,0.08)" },
  hdrLeft: { display: "flex", alignItems: "center", gap: 14 },
  hdrIcon: {
    width: 54, height: 54, borderRadius: 18, background: T.gv, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 22px rgba(108,63,255,0.42)", position: "relative", overflow: "hidden",
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
  nameAv: { width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 12px rgba(108,63,255,.30)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: "#fff" },
  nameText: { fontWeight: 700, fontSize: ".90rem", color: T.ink },
  nameId: { fontSize: ".72rem", color: T.ink4, marginTop: 1 },

  /* ── CHIPS ── */
  chip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", fontWeight: 700, whiteSpace: "nowrap" },
  cPending: { background: "rgba(245,158,11,.14)", color: "#b45309" },
  cDone:    { background: "rgba(0,212,170,.12)",   color: "#00917a" },
  cFailed:  { background: "rgba(255,59,130,.10)",  color: "#cc2060" },
  cNulled:  { background: "rgba(107,94,135,.12)",  color: "#6B5E87" },

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

  /* ── FORM ── */
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
    "& .MuiFormHelperText-root": { fontFamily: "'DM Sans',sans-serif", fontSize: ".74rem", color: T.ink3 },
    "& .MuiFormHelperText-root.Mui-error": { color: "#EF4444" },
  },

  /* ── RESERVA INFO BOX (dentro del form) ── */
  reservaBox: {
    borderRadius: 16, padding: "16px 18px",
    background: "rgba(244,241,255,.50)",
    border: `1px solid ${T.bL}`,
    marginTop: -6, marginBottom: 14,
  },
  reservaBoxTitle: {
    display: "flex", alignItems: "center", gap: 6,
    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem",
    color: T.v1, marginBottom: 10,
    "& svg": { fontSize: 16 },
  },
  reservaBoxRow: {
    display: "flex", justifyContent: "space-between",
    borderBottom: `1px solid ${T.bL}`, padding: "5px 0",
    "&:last-child": { borderBottom: "none" },
  },
  reservaBoxLabel: { fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", color: T.ink3, fontWeight: 600 },
  reservaBoxVal:   { fontFamily: "'DM Sans',sans-serif", fontSize: ".78rem", color: T.ink,  fontWeight: 700 },

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
    "&.Mui-disabled": { opacity: "0.45 !important", cursor: "not-allowed !important" },
  },

  /* ── DETAILS ── */
  detHero: { display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0 18px" },
  detAv: { width: 76, height: 76, borderRadius: 22, background: T.gv, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 32px rgba(108,63,255,.40)", marginBottom: 12 },
  detName: { fontFamily: "'Syne',sans-serif !important", fontSize: "1.20rem !important", fontWeight: "800 !important", color: `${T.ink} !important`, marginBottom: 4, textAlign: "center" },
  detSub: { fontFamily: "'DM Sans',sans-serif", fontSize: ".84rem", color: T.ink3, textAlign: "center" },
  detGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 },
  detItem: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4 },
  detItemFull: { borderRadius: 14, padding: "12px 14px", background: "rgba(244,241,255,.45)", border: `1px solid ${T.bL}`, display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" },
  detLbl: { fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".9px", textTransform: "uppercase", color: T.ink3 },
  detVal: { fontFamily: "'DM Sans',sans-serif", fontSize: ".90rem", fontWeight: 600, color: T.ink },
  detValGreen: { fontFamily: "'DM Sans',sans-serif", fontSize: ".90rem", fontWeight: 700, color: "#00917a" },
  detIconRow: { display: "flex", alignItems: "center", gap: 6 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PagosList = () => {
  const classes = useStyles()

  /* ── STATE — 100% original ── */
  const [pagos,              setPagos]              = useState([])
  const [reservas,           setReservas]           = useState([])
  const [open,               setOpen]               = useState(false)
  const [detailsOpen,        setDetailsOpen]        = useState(false)
  const [selectedPago,       setSelectedPago]       = useState(null)
  const [editingId,          setEditingId]          = useState(null)
  const [formData,           setFormData]           = useState({ fecha: "", reserva: "", estado: "pendiente" })
  const [selectedReservaData,setSelectedReservaData]= useState(null)
  const [searchTerm,         setSearchTerm]         = useState("")
  const [page,               setPage]               = useState(0)
  const [rowsPerPage,        setRowsPerPage]        = useState(5)
  const [formErrors,         setFormErrors]         = useState({ fecha: "", reserva: "", estado: "" })
  const [isFormValid,        setIsFormValid]        = useState(false)
  const [shouldValidate,     setShouldValidate]     = useState(false)

  /* ── HELPERS — 100% original ── */
  const formatCOP = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(value)

  const fetchPagos = async () => {
    try {
      const data = await pagoService.getPagos()
      setPagos(data)
    } catch (error) {
      console.error("Error fetching pagos", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "No se pudieron cargar los pagos." })
    }
  }

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/reservas", { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()
      setReservas(data)
    } catch (error) {
      console.error("Error fetching reservas", error)
    }
  }

  useEffect(() => { fetchPagos(); fetchReservas() }, [])

  useEffect(() => {
    setPagos((prev) =>
      prev.map((pago) => {
        if (pago.reserva && typeof pago.reserva === "object") {
          const updatedReserva = reservas.find((r) => r._id.toString() === pago.reserva._id.toString())
          if (updatedReserva) return { ...pago, reserva: updatedReserva }
        }
        return pago
      }),
    )
  }, [reservas])

  useEffect(() => {
    if (editingId) {
      setPagos((prev) =>
        prev.map((pago) => (pago._id === editingId ? { ...pago, ...formData, reserva: selectedReservaData } : pago)),
      )
    }
  }, [formData, selectedReservaData, editingId])

  const handleOpen = (pago) => {
    setShouldValidate(true)
    setFormErrors({ fecha: "", reserva: "", estado: "" })
    if (pago) {
      setFormData({ fecha: pago.fecha ? new Date(pago.fecha).toISOString().split("T")[0] : "", reserva: pago.reserva ? pago.reserva._id || pago.reserva : "", estado: pago.estado || "pendiente" })
      setEditingId(pago._id)
      setSelectedReservaData(pago.reserva)
      setIsFormValid(true)
    } else {
      setFormData({ fecha: "", reserva: "", estado: "pendiente" })
      setEditingId(null)
      setSelectedReservaData(null)
      setIsFormValid(false)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setShouldValidate(false)
    Swal.close()
    setOpen(false)
    setTimeout(() => {
      setFormErrors({ fecha: "", reserva: "", estado: "" })
      setFormData({ fecha: "", reserva: "", estado: "pendiente" })
      setEditingId(null)
      setSelectedReservaData(null)
      setIsFormValid(false)
    }, 100)
  }

  const handleDetails = (pago) => { setSelectedPago(pago); setDetailsOpen(true) }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setTimeout(() => setSelectedPago(null), 100)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "reserva") {
      setFormData({ ...formData, reserva: value })
      const resData = reservas.find((r) => r._id === value)
      setSelectedReservaData(resData)
    } else {
      setFormData({ ...formData, [name]: value })
    }
    if (shouldValidate) validateField(name, value)
  }

  const validateField = (name, value) => {
    if (!shouldValidate) return true
    let errorMessage = ""
    switch (name) {
      case "fecha":   if (!value.trim()) errorMessage = "La fecha es obligatoria";    break
      case "reserva": if (!value.trim()) errorMessage = "La reserva es obligatoria";  break
      case "estado":  if (!value.trim()) errorMessage = "El estado es obligatorio";   break
      default: break
    }
    setFormErrors((prev) => ({ ...prev, [name]: errorMessage }))
    if (errorMessage && shouldValidate) {
      Swal.fire({ ...SW, icon: "warning", title: "Validación", text: errorMessage, toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true })
    }
    setTimeout(() => validateForm({ ...formData, [name]: value }), 0)
    return !errorMessage
  }

  const handleFieldBlur = (e) => {
    if (!shouldValidate) return
    const { name, value } = e.target
    validateField(name, value)
  }

  const handleKeyDown = (e) => {
    if (!shouldValidate) return
    if (e.key === "Tab") { const { name, value } = e.target; validateField(name, value) }
  }

  const validateForm = (data) => {
    if (!shouldValidate) return
    setIsFormValid(data.fecha.trim() !== "" && data.reserva.trim() !== "" && data.estado.trim() !== "")
  }

  const handleSubmit = async () => {
    setShouldValidate(true)
    const tempErrors = {}
    if (!formData.fecha.trim())   tempErrors.fecha   = "La fecha es obligatoria"
    if (!formData.reserva.trim()) tempErrors.reserva = "La reserva es obligatoria"
    if (!formData.estado.trim())  tempErrors.estado  = "El estado es obligatorio"
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors)
      Swal.fire({ ...SW, icon: "error", title: "Error de validación", text: Object.values(tempErrors)[0] })
      return
    }
    try {
      if (editingId) {
        const updatedPago = await pagoService.updatePago(editingId, formData)
        setPagos((prev) => prev.map((pago) => (pago._id === editingId ? { ...pago, ...formData, reserva: selectedReservaData } : pago)))
        Swal.fire({ ...SW, icon: "success", title: "Actualizado", text: "El pago se actualizó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      } else {
        const newPago = await pagoService.createPago(formData)
        newPago.reserva = selectedReservaData
        setPagos((prev) => [newPago, ...prev])
        Swal.fire({ ...SW, icon: "success", title: "Creado", text: "El pago se creó correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      }
      handleClose()
    } catch (error) {
      console.error("Error saving pago", error)
      Swal.fire({ ...SW, icon: "error", title: "Error", text: "Ocurrió un error al guardar el pago." })
    }
  }

  const handleAnular = async (id) => {
    const confirmAnular = await Swal.fire({
      ...SWD, title: "¿Anular pago?", text: "Esta acción cambiará el estado del pago a 'anulado'.",
      icon: "question", showCancelButton: true,
      confirmButtonText: "Sí, anular", cancelButtonText: "Cancelar",
    })
    if (confirmAnular.isConfirmed) {
      try {
        const updatedPago = await pagoService.updatePago(id, { estado: "anulado" })
        setPagos((prev) => prev.map((pago) => (pago._id === id ? updatedPago : pago)))
        Swal.fire({ ...SW, icon: "success", title: "Anulado", text: "El pago se anuló correctamente.", timer: 2200, timerProgressBar: true, showConfirmButton: false })
      } catch (error) {
        console.error("Error anulando el pago", error)
        Swal.fire({ ...SW, icon: "error", title: "Error", text: "Ocurrió un error al anular el pago." })
      }
    }
  }

  const filteredPagos = pagos.filter((pago) => pago.estado && pago.estado.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages    = Math.max(1, Math.ceil(filteredPagos.length / rowsPerPage))

  const calcularFaltante = (pago) => {
    if (pago.reserva && typeof pago.reserva === "object") {
      return (pago.reserva.total || 0) - (pago.pagoParcial || pago.monto || 0)
    }
    return 0
  }

  /* chip de estado */
  const estadoChip = (estado) => {
    const map = {
      pendiente: classes.cPending,
      realizado: classes.cDone,
      fallido:   classes.cFailed,
      anulado:   classes.cNulled,
    }
    const icons = {
      pendiente: "⏳",
      realizado: "✓",
      fallido:   "✗",
      anulado:   "—",
    }
    return (
      <Box className={`${classes.chip} ${map[estado] || classes.cNulled}`} component="span">
        {icons[estado] || "·"} {estado}
      </Box>
    )
  }

  /* ── DIALOG HEADER ── */
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
            <CreditCard size={26} color="#fff" strokeWidth={2} />
          </Box>
          <Box>
            <Typography className={classes.hdrTitle}>Gestión de Pagos</Typography>
            <Typography className={classes.hdrSub}>Administra los pagos del sistema</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── STATS ── */}
      <Box className={classes.statsRow}>
        {[
          { label: "Total",     val: pagos.length,                                            sub: "registrados",  c: classes.sv, orb: "#6C3FFF", col: "#6C3FFF", sc: "#5929d9" },
          { label: "Realizados",val: pagos.filter((p) => p.estado === "realizado").length,    sub: "completados",  c: classes.st, orb: "#00D4AA", col: "#007a62", sc: "#007a62" },
          { label: "Pendientes",val: pagos.filter((p) => p.estado === "pendiente").length,    sub: "por cobrar",   c: classes.sb, orb: "#2563EB", col: "#1d4ed8", sc: "#1d4ed8" },
          { label: "Fallidos",  val: pagos.filter((p) => p.estado === "fallido" || p.estado === "anulado").length, sub: "anulados/fallidos", c: classes.sr, orb: "#FF3B82", col: "#cc2060", sc: "#cc2060" },
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
            placeholder="Buscar por estado…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
          />
          <span className={classes.kbd}>⌘K</span>
        </Box>
        <button
          onClick={() => handleOpen(null)}
          style={btnAddStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 9px 26px rgba(108,63,255,.52)" }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 5px 18px rgba(108,63,255,.40)" }}
        >
          <CreditCard size={16} strokeWidth={2.2} />
          Nuevo Pago
        </button>
      </Box>

      {/* ── TABLE ── */}
      <Box className={classes.tblWrap}>
        <TableContainer component={Paper} elevation={0} style={{ borderRadius: 20 }}>
          <Table style={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                <HCell style={{ textAlign: "left" }}>Reserva / Titular</HCell>
                <HCell>Pago Parcial</HCell>
                <HCell>Total Reserva</HCell>
                <HCell>Faltante</HCell>
                <HCell>Fecha</HCell>
                <HCell>Estado</HCell>
                <HCell>Acciones</HCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPagos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pago, i) => (
                <TableRow key={pago._id} className={classes.tblRow}>
                  {/* Reserva + titular como nameWrap */}
                  <NCell>
                    <Box className={classes.nameWrap}>
                      <Box className={classes.nameAv} style={{ background: avGrad(i) }}>
                        {pago.reserva && typeof pago.reserva === "object"
                          ? pago.reserva.titular_reserva?.substring(0, 2).toUpperCase()
                          : "PG"}
                      </Box>
                      <Box>
                        <Typography className={classes.nameText}>
                          {pago.reserva && typeof pago.reserva === "object"
                            ? pago.reserva.titular_reserva
                            : pago.reserva || "N/A"}
                        </Typography>
                        <Typography className={classes.nameId}>
                          {pago.reserva && typeof pago.reserva === "object"
                            ? `#${pago.reserva.numero_reserva}`
                            : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </NCell>
                  <BCell>
                    <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".83rem", color: "#00917a", fontWeight: 700 }}>
                      {formatCOP(pago.pagoParcial || pago.monto || 0)}
                    </Typography>
                  </BCell>
                  <BCell>{pago.reserva && typeof pago.reserva === "object" ? formatCOP(pago.reserva.total || 0) : "N/A"}</BCell>
                  <BCell>
                    <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".83rem", color: "#cc2060", fontWeight: 700 }}>
                      {formatCOP(calcularFaltante(pago))}
                    </Typography>
                  </BCell>
                  <BCell>
                    <Typography style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".76rem", color: T.ink3 }}>
                      {new Date(pago.fecha).toLocaleDateString()}
                    </Typography>
                  </BCell>
                  <BCell>{estadoChip(pago.estado)}</BCell>
                  <BCell>
                    <Box className={classes.actWrap}>
                      <Tooltip title="Editar" placement="top">
                        <button className={`${classes.actBtn} ${classes.bEdit}`} onClick={() => handleOpen(pago)}>
                          <Edit2 size={14} strokeWidth={2.2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Ver detalles" placement="top">
                        <button className={`${classes.actBtn} ${classes.bView}`} onClick={() => handleDetails(pago)}>
                          <Eye size={14} strokeWidth={2.2} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Anular pago" placement="top">
                        <button className={`${classes.actBtn} ${classes.bDel}`} onClick={() => handleAnular(pago._id)}>
                          <Trash2 size={14} strokeWidth={2.2} />
                        </button>
                      </Tooltip>
                    </Box>
                  </BCell>
                </TableRow>
              ))}
              {filteredPagos.length === 0 && (
                <TableRow style={{ height: 160 }}>
                  <TableCell colSpan={7} className={classes.emptyCell}>
                    {searchTerm ? "No se encontraron pagos que coincidan con la búsqueda." : "No hay pagos registrados."}
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
          Mostrando {filteredPagos.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredPagos.length)} de {filteredPagos.length} pagos
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
            {[5, 10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Box>
      </Box>

      {/* ━━━━━━━━ MODAL CREAR / EDITAR ━━━━━━━━ */}
      {open && (
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
              ? <Edit2      size={20} color="#fff" strokeWidth={2.2} />
              : <CreditCard size={20} color="#fff" strokeWidth={2.2} />
            }
            title={editingId ? "Editar Pago" : "Nuevo Pago"}
            sub={editingId ? "Modifica los datos del pago seleccionado" : "Completa los campos para registrar un nuevo pago"}
            onClose={handleClose}
          />
          <DialogContent className={classes.dlgBody}>

            {/* ── Sección 1: Información del Pago ── */}
            <Box className={classes.fmSection}>
              <Box className={classes.fmSectionLbl}>
                <Box className={classes.fmSectionIco} style={{ background: "rgba(108,63,255,.12)" }}>
                  <Payment style={{ fontSize: 14, color: T.v1 }} />
                </Box>
                Información del Pago
              </Box>
              <TextField
                className={classes.fmField} margin="dense"
                label="Fecha" name="fecha"
                value={formData.fecha} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={handleKeyDown}
                fullWidth type="date"
                InputLabelProps={{ shrink: true }} variant="outlined" required
                error={!!formErrors.fecha}
                helperText={formErrors.fecha || "Ingrese la fecha en que se realizó o registra el pago."}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              />
            </Box>

            {/* ── Sección 2: Reserva ── */}
            <Box className={classes.fmSection}>
              <Box className={classes.fmSectionLbl}>
                <Box className={classes.fmSectionIco} style={{ background: "rgba(0,212,170,.12)" }}>
                  <EventNote style={{ fontSize: 14, color: T.t1 }} />
                </Box>
                Detalles de la Reserva
              </Box>
              <TextField
                className={classes.fmField} select margin="dense"
                label="Reserva" name="reserva"
                value={formData.reserva} onChange={handleChange}
                onBlur={handleFieldBlur} onKeyDown={handleKeyDown}
                fullWidth variant="outlined" required
                error={!!formErrors.reserva}
                helperText={formErrors.reserva || "Seleccione la reserva a la que corresponde este pago."}
                InputProps={{ startAdornment: <InputAdornment position="start"><Receipt style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              >
                {reservas.length > 0 ? (
                  reservas.map((reserva) => (
                    <MenuItem key={reserva._id} value={reserva._id}>
                      {reserva.numero_reserva} - {reserva.titular_reserva}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No hay reservas disponibles</MenuItem>
                )}
              </TextField>

              {/* Info card de la reserva seleccionada */}
              {selectedReservaData && (
                <Box className={classes.reservaBox}>
                  <Box className={classes.reservaBoxTitle}>
                    <Person style={{ fontSize: 14 }} />
                    Información de la Reserva
                  </Box>
                  {[
                    ["Titular",         selectedReservaData.titular_reserva],
                    ["N° Reserva",      selectedReservaData.numero_reserva],
                    ["Total",           formatCOP(selectedReservaData.total || 0)],
                    ["Pagos parciales", formatCOP(selectedReservaData.pagos_parciales || 0)],
                    ["Faltante",        formatCOP((selectedReservaData.total || 0) - (selectedReservaData.pagos_parciales || 0))],
                  ].map(([lbl, val]) => (
                    <Box key={lbl} className={classes.reservaBoxRow}>
                      <Typography className={classes.reservaBoxLabel}>{lbl}</Typography>
                      <Typography className={classes.reservaBoxVal}>{val}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* ── Sección 3: Estado del Pago ── */}
            <Box className={classes.fmSection}>
              <Box className={classes.fmSectionLbl}>
                <Box className={classes.fmSectionIco} style={{ background: "rgba(255,59,130,.10)" }}>
                  <AssignmentInd style={{ fontSize: 14, color: T.e1 }} />
                </Box>
                Estado del Pago
              </Box>
              <TextField
                className={classes.fmField} select margin="dense"
                label="Estado" name="estado"
                value={formData.estado} onChange={handleChange}
                onBlur={handleFieldBlur}
                fullWidth variant="outlined" required
                error={!!formErrors.estado}
                helperText={formErrors.estado || "Seleccione el estado actual del pago."}
                InputProps={{ startAdornment: <InputAdornment position="start"><VerifiedUser style={{ color: T.ink3, fontSize: 18 }} /></InputAdornment> }}
              >
                <MenuItem value="pendiente">⏳ Pendiente</MenuItem>
                <MenuItem value="realizado">✅ Realizado</MenuItem>
                <MenuItem value="fallido">❌ Fallido</MenuItem>
              </TextField>
            </Box>

          </DialogContent>
          <DialogActions className={classes.dlgFoot}>
            <Button onClick={handleClose} className={classes.btnCancel}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              className={classes.btnSubmit}
              disabled={shouldValidate && (!isFormValid || Object.values(formErrors).some((e) => e !== ""))}
            >
              <Check size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              {editingId ? "Actualizar Pago" : "Crear Pago"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ━━━━━━━━ MODAL DETALLES ━━━━━━━━ */}
      {detailsOpen && selectedPago && (
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
            title="Detalles del Pago"
            sub="Información completa del pago seleccionado"
            onClose={handleCloseDetails}
          />
          <DialogContent className={classes.dlgBody}>
            {/* Hero */}
            <Box className={classes.detHero}>
              <Box className={classes.detAv}>
                <CreditCard size={32} color="#fff" strokeWidth={2} />
              </Box>
              <Typography className={classes.detName}>
                {formatCOP(selectedPago.pagoParcial || selectedPago.monto || 0)}
              </Typography>
              <Typography className={classes.detSub}>
                Pago {selectedPago.estado} · {new Date(selectedPago.fecha).toLocaleDateString()}
              </Typography>
            </Box>

            <Box style={{ height: 1, background: T.bL, margin: "14px 0" }} />

            <Box className={classes.detGrid}>
              <Box className={classes.detItem}>
                <Typography className={classes.detLbl}>Pago Parcial</Typography>
                <Box className={classes.detIconRow}>
                  <Payment style={{ fontSize: 14, color: T.v1 }} />
                  <Typography className={classes.detValGreen}>
                    {formatCOP(selectedPago.pagoParcial || selectedPago.monto || 0)}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.detItem}>
                <Typography className={classes.detLbl}>Faltante</Typography>
                <Box className={classes.detIconRow}>
                  <AttachMoney style={{ fontSize: 14, color: T.e1 }} />
                  <Typography className={classes.detVal} style={{ color: "#cc2060" }}>
                    {formatCOP(calcularFaltante(selectedPago))}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.detItem}>
                <Typography className={classes.detLbl}>Fecha</Typography>
                <Box className={classes.detIconRow}>
                  <CalendarToday style={{ fontSize: 14, color: T.b1 }} />
                  <Typography className={classes.detVal}>{new Date(selectedPago.fecha).toLocaleDateString()}</Typography>
                </Box>
              </Box>
              <Box className={classes.detItem}>
                <Typography className={classes.detLbl}>Estado</Typography>
                {estadoChip(selectedPago.estado)}
              </Box>
              <Box className={classes.detItemFull}>
                <Typography className={classes.detLbl}>Reserva</Typography>
                <Box className={classes.detIconRow}>
                  <Receipt style={{ fontSize: 14, color: T.t1 }} />
                  <Typography className={classes.detVal}>
                    {selectedPago.reserva && typeof selectedPago.reserva === "object"
                      ? `${selectedPago.reserva.numero_reserva} · ${selectedPago.reserva.titular_reserva}`
                      : selectedPago.reserva || "N/A"}
                  </Typography>
                </Box>
              </Box>
              {selectedPago.reserva && typeof selectedPago.reserva === "object" && (
                <Box className={classes.detItemFull}>
                  <Typography className={classes.detLbl}>Total Reserva</Typography>
                  <Box className={classes.detIconRow}>
                    <AttachMoney style={{ fontSize: 14, color: T.a1 }} />
                    <Typography className={classes.detVal}>{formatCOP(selectedPago.reserva.total || 0)}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions className={classes.dlgFoot}>
            <Button onClick={handleCloseDetails} className={classes.btnCancel}>Cerrar</Button>
            <Button
              onClick={() => { handleCloseDetails(); handleOpen(selectedPago) }}
              className={classes.btnSubmit}
            >
              <Edit2 size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} /> Editar
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  )
}

export default PagosList