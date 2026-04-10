import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import InputAdornment from "@material-ui/core/InputAdornment"
import TextField from "@material-ui/core/TextField"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  FileText, Key, ChevronLeft, LogIn, UserPlus, HelpCircle,
} from "lucide-react"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const API = process.env.REACT_APP_API_URL || ""
const EP = {
  login:    API ? `${API}/api/auth/login`           : "/api/auth/login",
  register: API ? `${API}/api/clientes`             : "/api/clientes",
  forgot:   API ? `${API}/api/auth/forgot-password` : "/api/auth/forgot-password",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
  ink:"#0C0A14", ink2:"#2D2640", ink3:"#6B5E87", ink4:"#B0A5C8",
  v1:"#6C3FFF", v2:"#C040FF",
  e1:"#FF3B82", t1:"#00D4AA", a1:"#FF7B2C",
  gv:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  ge:"linear-gradient(135deg,#FF3B82,#FF7B2C)",
  gt:"linear-gradient(135deg,#00D4AA,#00A3E0)",
  bL:"rgba(108,63,255,0.10)",
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FONTS + KEYFRAMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (typeof document !== "undefined" && !document.getElementById("ns-style")) {
  const s = document.createElement("style"); s.id = "ns-style"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes ns-orb    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(.95)} }
    @keyframes ns-slideL { from{opacity:0;transform:translateX(-44px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ns-slideR { from{opacity:0;transform:translateX(44px) rotateY(-8deg)} to{opacity:1;transform:translateX(0) rotateY(0)} }
    @keyframes ns-viewIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ns-cardF  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes ns-ring   { 0%,100%{opacity:.4;transform:translate(-50%,-50%) rotateX(70deg) scale(1)} 50%{opacity:.8;transform:translate(-50%,-50%) rotateX(70deg) scale(1.04)} }
    @keyframes ns-dot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }
    @keyframes ns-spin   { to{transform:rotate(360deg)} }
    @keyframes ns-sphere { to{transform:rotate(360deg)} }
    .ns-spin { animation: ns-spin .7s linear infinite }
    @media (max-width:820px){ .ns-left{display:none!important} .ns-div{display:none!important} }
  `
  document.head.appendChild(s)
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SWEETALERT2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (typeof document !== "undefined" && !document.getElementById("ns-swal")) {
  const s = document.createElement("style"); s.id = "ns-swal"
  s.textContent = `
    .ns-pop{font-family:'DM Sans',sans-serif!important;border-radius:26px!important;padding:32px 28px!important;
      background:rgba(12,10,20,.97)!important;border:1px solid rgba(108,63,255,.25)!important;
      box-shadow:0 24px 64px rgba(108,63,255,.30)!important;position:relative!important;overflow:hidden!important;}
    .ns-pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#6C3FFF,#C040FF);}
    .ns-ttl{font-family:'Syne',sans-serif!important;font-weight:800!important;font-size:1.18rem!important;color:#fff!important;}
    .ns-bod{font-size:.88rem!important;color:#B0A5C8!important;line-height:1.6!important;}
    .ns-ok{background:linear-gradient(135deg,#6C3FFF,#C040FF)!important;color:#fff!important;border:none!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:700!important;
      font-size:.82rem!important;padding:10px 28px!important;box-shadow:0 4px 16px rgba(108,63,255,.40)!important;cursor:pointer!important;}
    .ns-cn{background:rgba(108,63,255,.10)!important;color:#B0A5C8!important;border:1px solid rgba(108,63,255,.20)!important;
      border-radius:50px!important;font-family:'DM Sans',sans-serif!important;font-weight:600!important;
      font-size:.82rem!important;padding:10px 28px!important;cursor:pointer!important;}
    .swal2-icon.swal2-success{border-color:#00D4AA!important;color:#00D4AA!important;}
    .swal2-icon.swal2-success [class^=swal2-success-line]{background:#00D4AA!important;}
    .swal2-icon.swal2-error{border-color:#FF3B82!important;color:#FF3B82!important;}
    .swal2-icon.swal2-error [class^=swal2-x-mark-line]{background:#FF3B82!important;}
    .swal2-timer-progress-bar{background:linear-gradient(90deg,#6C3FFF,#C040FF)!important;}
  `
  document.head.appendChild(s)
}
const SW = {
  customClass:{ popup:"ns-pop", title:"ns-ttl", htmlContainer:"ns-bod", confirmButton:"ns-ok", cancelButton:"ns-cn" },
  buttonsStyling: false,
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAKESTYLES
   — sin helperText rojo MUI, todo oculto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const useStyles = makeStyles(() => ({
  field: {
    marginBottom: "4px !important",
    "& .MuiOutlinedInput-root": {
      borderRadius: "13px !important",
      fontFamily:   "'DM Sans',sans-serif !important",
      fontSize:     ".88rem",
      color:        "#fff !important",
      /* fondo base siempre oscuro */
      backgroundColor: "rgba(255,255,255,.05) !important",
      transition:   "background-color .2s",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,.07) !important",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(108,63,255,.55)" },
      "&.Mui-focused": {
        backgroundColor: "rgba(108,63,255,.10) !important",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.v1, borderWidth: 2 },
      "&.Mui-error .MuiOutlinedInput-notchedOutline":   { borderColor: "rgba(255,59,130,.50) !important" },
    },
    /* el fieldset nunca debe ser blanco */
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor:     "rgba(255,255,255,.10) !important",
      backgroundColor: "transparent !important",
    },
    /* el input en sí */
    "& .MuiInputBase-input": {
      color:           "#fff !important",
      backgroundColor: "transparent !important",
      /* autofill de Chrome — anula el fondo azul/blanco */
      "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus": {
        WebkitBoxShadow:    "0 0 0px 1000px rgba(20,14,40,1) inset !important",
        WebkitTextFillColor:"#fff !important",
        caretColor:         "#fff !important",
        borderRadius:       "13px !important",
        transition:         "background-color 99999s ease-in-out 0s",
      },
    },
    "& .MuiInputLabel-outlined":             { fontFamily:"'DM Sans',sans-serif", color:T.ink3, fontSize:".85rem" },
    "& .MuiInputLabel-outlined.Mui-focused": { color: T.v1 },
    "& .MuiInputLabel-outlined.Mui-error":   { color: "rgba(255,59,130,.65) !important" },
    /* ocultar helperText de MUI */
    "& .MuiFormHelperText-root":             { display: "none !important" },
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
}))

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VALIDACIONES (idénticas al original)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const vEmail = v => {
  if (!v) return "Correo obligatorio"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Formato inválido (ej: usuario@dominio.com)"
  return ""
}
const vPass = v => {
  if (!v) return "Contraseña obligatoria"
  if (v.length < 8) return "Mínimo 8 caracteres"
  if (!/[A-Z]/.test(v)) return "Incluye al menos una mayúscula"
  if (!/[a-z]/.test(v)) return "Incluye al menos una minúscula"
  if (!/[0-9]/.test(v)) return "Incluye al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) return "Incluye un carácter especial"
  return ""
}
const vNombre = v => {
  if (!v) return "Nombre obligatorio"
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return "Solo letras y espacios"
  if (v.trim().split(/\s+/).length < 2) return "Ingresa nombre y apellido"
  if (v.length < 6) return "Mínimo 6 caracteres"
  return ""
}
const vDoc = v => {
  if (!v) return "Documento obligatorio"
  if (!/^\d+$/.test(v)) return "Solo números"
  if (v.length < 6 || v.length > 15) return "Entre 6 y 15 dígitos"
  return ""
}
const vTel = v => {
  if (!v) return "Teléfono obligatorio"
  if (!/^\d+$/.test(v)) return "Solo números"
  if (v.length < 7 || v.length > 10) return "Entre 7 y 10 dígitos"
  return ""
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPINNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Spin = () => (
  <span className="ns-spin" style={{ width:17, height:17, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", flexShrink:0 }}/>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ERROR HINT — sutil, no rojo agresivo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ErrHint = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6, marginTop:2, paddingLeft:4 }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:"rgba(255,59,130,.7)", flexShrink:0, display:"inline-block" }}/>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:"rgba(255,255,255,.45)", lineHeight:1.3 }}>{msg}</span>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLOBAL ERROR BOX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GlobalErr = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,59,130,.08)", border:"1px solid rgba(255,59,130,.18)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'DM Sans',sans-serif", fontSize:".79rem", color:"rgba(255,255,255,.55)" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(255,59,130,.25)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ width:4, height:4, borderRadius:"50%", background:"#FF3B82", display:"inline-block" }}/>
      </span>
      {msg}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUCCESS BOX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SuccessBox = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,212,170,.08)", border:"1px solid rgba(0,212,170,.18)", borderRadius:10, padding:"9px 12px", marginBottom:12, fontFamily:"'DM Sans',sans-serif", fontSize:".79rem", color:"rgba(255,255,255,.55)" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(0,212,170,.25)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:T.t1, fontSize:10, fontWeight:700, lineHeight:1 }}>✓</span>
      </span>
      {msg}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PASSWORD STRENGTH BAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const pwStr = v => {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[!@#$%^&*]/.test(v)) s++
  return s
}
const PwBar = ({ val }) => {
  const s = pwStr(val)
  const c = ["#FF3B82","#FF7B2C","#e8c030","#00D4AA"]
  return (
    <div style={{ display:"flex", gap:4, marginTop:3, marginBottom:2 }}>
      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=s?c[s-1]:"rgba(255,255,255,.07)", transition:"background .3s" }}/>)}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SEC LABEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SecLabel = ({ icon, iconBg, children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Syne',sans-serif", fontSize:".68rem", fontWeight:700, color:"rgba(255,255,255,.45)", letterSpacing:".07em", textTransform:"uppercase", margin:"12px 0 6px", paddingBottom:7, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
    <span style={{ width:20, height:20, borderRadius:5, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</span>
    {children}
  </div>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CANVAS ESTRELLAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CanvasBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); let raf
    const P = ["#6C3FFF","#C040FF","#00D4AA","#FF3B82","#ffffff"]
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)
    const stars = Array.from({length:160}, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + .2, color: P[Math.floor(Math.random() * P.length)],
      alpha: Math.random() * .6 + .1, da: (Math.random()-.5)*.005, vy: (Math.random()-.5)*.055,
    }))
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.da; s.y += s.vy
        if (s.alpha<0||s.alpha>.8) s.da*=-1
        if (s.y<0) s.y=canvas.height; if(s.y>canvas.height) s.y=0
        ctx.save(); ctx.globalAlpha=s.alpha; ctx.fillStyle=s.color
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); ctx.restore()
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   VISTAS DEFINIDAS FUERA DEL COMPONENTE
   ← Aquí está la corrección del foco:
     al estar fuera del render principal,
     React no destruye/recrea los inputs
     en cada keystroke.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── VISTA LOGIN ── */
const LoginView = ({ cls, lf, le, ge, sp, setSp, onLChange, onLogin, setView, setFok, setFer, loading }) => (
  <form onSubmit={onLogin} style={{ animation:"ns-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>

    <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
      name="email" label="Correo electrónico" type="email" value={lf.email}
      onChange={onLChange} error={!!le.email} autoFocus
      inputProps={{ maxLength:60 }}
      InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
    />
    <ErrHint msg={le.email}/>

    <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
      name="password" label="Contraseña" type={sp?"text":"password"} value={lf.password}
      onChange={onLChange} error={!!le.password}
      inputProps={{ maxLength:50 }}
      InputProps={{
        startAdornment: <InputAdornment position="start"><Lock size={17} color={T.ink3} strokeWidth={2}/></InputAdornment>,
        endAdornment: (
          <InputAdornment position="end">
            <button type="button" onClick={() => setSp(p=>!p)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, borderRadius:8, color:T.ink3 }}>
              {sp ? <EyeOff size={17} strokeWidth={2}/> : <Eye size={17} strokeWidth={2}/>}
            </button>
          </InputAdornment>
        ),
      }}
    />
    <ErrHint msg={le.password}/>

    <GlobalErr msg={ge}/>

    <SubmitBtn loading={loading}><LogIn size={17} strokeWidth={2.2}/> Iniciar Sesión</SubmitBtn>

    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, flexWrap:"wrap", marginTop:16 }}>
      <TLink onClick={() => { setView("forgot"); setFok(""); setFer("") }}>
        <HelpCircle size={13} strokeWidth={2.2}/> ¿Olvidaste tu contraseña?
      </TLink>
      <span style={{ color:"rgba(255,255,255,.18)", fontSize:".7rem" }}>·</span>
      <TLink onClick={() => setView("register")}>
        <UserPlus size={13} strokeWidth={2.2}/> Crear cuenta
      </TLink>
    </div>
  </form>
)

/* ── VISTA REGISTRO ── */
const RegisterView = ({ cls, rf, re, srp, setSrp, onRChange, onRegister, loading }) => (
  <form onSubmit={onRegister} style={{ animation:"ns-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>

    <SecLabel icon={<User size={10} color={T.v1} strokeWidth={2.5}/>} iconBg="rgba(108,63,255,.15)">Información Personal</SecLabel>
    <Box className={cls.row2}>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="nombre" label="Nombre completo" value={rf.nombre} onChange={onRChange} error={!!re.nombre}
          inputProps={{ maxLength:30 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><User size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
        />
        <ErrHint msg={re.nombre}/>
      </div>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="documento" label="Documento" value={rf.documento} onChange={onRChange} error={!!re.documento}
          inputProps={{ maxLength:15 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><FileText size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
        />
        <ErrHint msg={re.documento}/>
      </div>
    </Box>

    <SecLabel icon={<Phone size={10} color={T.t1} strokeWidth={2.5}/>} iconBg="rgba(0,212,170,.12)">Contacto</SecLabel>
    <Box className={cls.row2}>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="telefono" label="Teléfono" value={rf.telefono} onChange={onRChange} error={!!re.telefono}
          inputProps={{ maxLength:10 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><Phone size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
        />
        <ErrHint msg={re.telefono}/>
      </div>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="email" label="Correo electrónico" type="email" value={rf.email} onChange={onRChange} error={!!re.email}
          inputProps={{ maxLength:60 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
        />
        <ErrHint msg={re.email}/>
      </div>
    </Box>

    <SecLabel icon={<Key size={10} color={T.e1} strokeWidth={2.5}/>} iconBg="rgba(255,59,130,.10)">Seguridad</SecLabel>
    <Box className={cls.row2}>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="password" label="Contraseña" type={srp?"text":"password"} value={rf.password} onChange={onRChange} error={!!re.password}
          inputProps={{ maxLength:15 }}
          InputProps={{
            startAdornment:<InputAdornment position="start"><Lock size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>,
            endAdornment:(
              <InputAdornment position="end">
                <button type="button" onClick={()=>setSrp(p=>!p)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, borderRadius:8, color:T.ink3 }}>
                  {srp ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
                </button>
              </InputAdornment>
            ),
          }}
        />
        <PwBar val={rf.password}/>
        <ErrHint msg={re.password}/>
      </div>
      <div>
        <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
          name="confirm" label="Confirmar" type={srp?"text":"password"} value={rf.confirm} onChange={onRChange} error={!!re.confirm}
          inputProps={{ maxLength:15 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><Lock size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
        />
        <ErrHint msg={re.confirm}/>
      </div>
    </Box>

    <SubmitBtn loading={loading}><UserPlus size={16} strokeWidth={2.2}/> Crear Cuenta</SubmitBtn>
  </form>
)

/* ── VISTA FORGOT ── */
const ForgotView = ({ cls, fe, setFe, fer, setFer, fok, onForgot, loading }) => (
  <form onSubmit={onForgot} style={{ animation:"ns-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>
    <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".85rem", color:"rgba(255,255,255,.4)", marginBottom:14, lineHeight:1.65 }}>
      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
    </Typography>

    <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
      name="forgotEmail" label="Correo electrónico" type="email" value={fe} autoFocus
      onChange={e => { setFe(e.target.value); setFer("") }} error={!!fer}
      inputProps={{ maxLength:60 }}
      InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={17} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
    />
    <ErrHint msg={fer}/>

    <SuccessBox msg={fok}/>

    <SubmitBtn loading={loading} bg={T.gt} shadow="0 8px 24px rgba(0,212,170,.35)">
      <Mail size={16} strokeWidth={2.2}/> Enviar enlace
    </SubmitBtn>
  </form>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOTÓN SUBMIT (fuera del componente)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SubmitBtn = ({ children, bg, shadow, loading }) => (
  <button type="submit" disabled={loading}
    style={{ width:"100%", padding:"13px 0", background:bg||T.gv, color:"#fff", border:"none", borderRadius:50, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".90rem", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:shadow||"0 8px 28px rgba(108,63,255,.45)", transition:"all .22s", opacity:loading?.65:1, marginTop:8 }}
    onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-2px)" }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)" }}>
    {loading ? <><Spin/> Procesando…</> : children}
  </button>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LINK BUTTON (fuera del componente)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TLink = ({ children, onClick }) => (
  <button type="button" onClick={onClick}
    style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".79rem", fontWeight:600, color:T.v1, padding:"3px 8px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:4, transition:"background .15s" }}
    onMouseEnter={e=>e.currentTarget.style.background=T.bL}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>
    {children}
  </button>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENTE PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Login() {
  const cls     = useStyles()
  const history = useHistory()
  const cardRef = useRef(null)
  const mountedRef = useRef(true)
  const [view,    setView]    = useState("login")
  const [loading, setLoading] = useState(false)

  useEffect(() => { return () => { mountedRef.current = false } }, [])

  /* ── 3D tilt ── */
  useEffect(() => {
    const card = cardRef.current; if (!card) return
    let mx=0, my=0, tX=0, tY=0, raf
    const onMove = e => {
      const r = card.getBoundingClientRect()
      tX = (e.clientY-r.top-r.height/2)/r.height*6
      tY = -(e.clientX-r.left-r.width/2)/r.width*6
    }
    const onLeave = () => { tX=0; tY=0 }
    const tick = () => { mx+=(tX-mx)*.08; my+=(tY-my)*.08; card.style.transform=`perspective(1000px) rotateX(${mx}deg) rotateY(${my}deg)`; raf=requestAnimationFrame(tick) }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    tick()
    return () => { cancelAnimationFrame(raf); document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseleave",onLeave) }
  }, [])

  /* ── Redirigir si ya tiene sesión ── */
  useEffect(() => { if (localStorage.getItem("token")) history.replace("/dashboard") }, [history])

  /* ── Bloquear botón Atrás ── */
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname)
    const handlePop = () => { if (localStorage.getItem("token")) window.history.pushState(null,"",window.location.pathname) }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [])

  /* ━━━ LOGIN ━━━ */
  const [lf, setLf] = useState({ email:"", password:"" })
  const [le, setLe] = useState({ email:"", password:"" })
  const [sp, setSp] = useState(false)
  const [ge, setGe] = useState("")

  const onLChange = e => {
    const { name, value } = e.target
    setLf(p=>({...p,[name]:value})); setGe("")
    setLe(p=>({...p,[name]: name==="email" ? vEmail(value) : (value?"":"Contraseña obligatoria") }))
  }
  const onLogin = async e => {
    e.preventDefault()
    const ee=vEmail(lf.email), ep=lf.password?"":"Contraseña obligatoria"
    setLe({email:ee,password:ep}); if(ee||ep) return
    setLoading(true); setGe("")
    try {
      const res = await axios.post(EP.login, { email:lf.email, password:lf.password })
      localStorage.setItem("token",   res.data.token)
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario))
      history.replace("/dashboard")
    } catch (err) {
      if (mountedRef.current) setGe(err.response?.data?.msg || err.response?.data?.message || "Credenciales incorrectas.")
    } finally { if (mountedRef.current) setLoading(false) }
  }

  /* ━━━ REGISTER ━━━ */
  const [rf,  setRf]  = useState({ nombre:"", documento:"", email:"", telefono:"", password:"", confirm:"" })
  const [re,  setRe]  = useState({})
  const [srp, setSrp] = useState(false)

  const onRChange = e => {
    const { name, value } = e.target
    if (name==="nombre" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) return
    if ((name==="documento"||name==="telefono") && !/^[0-9]*$/.test(value)) return
    setRf(p=>({...p,[name]:value}))
    const errMap = {
      nombre:vNombre, documento:vDoc, email:vEmail, telefono:vTel, password:vPass,
      confirm: v => v!==(name==="confirm"?rf.password:value)&&name!=="confirm" ? re.confirm : v!==rf.password ? "Las contraseñas no coinciden" : "",
    }
    if (errMap[name]) setRe(p=>({...p,[name]:errMap[name](value)}))
  }
  const onRegister = async e => {
    e.preventDefault()
    const errs = {
      nombre:vNombre(rf.nombre), documento:vDoc(rf.documento), email:vEmail(rf.email),
      telefono:vTel(rf.telefono), password:vPass(rf.password),
      confirm: rf.confirm!==rf.password ? "Las contraseñas no coinciden" : "",
    }
    setRe(errs); if(Object.values(errs).some(x=>x)) return
    setLoading(true)
    try {
      await axios.post(EP.register, { nombre:rf.nombre, documento:rf.documento, email:rf.email, telefono:rf.telefono, password:rf.password, estado:true })
      Swal.fire({...SW, icon:"success", title:"¡Cuenta creada!", text:"Ya puedes iniciar sesión.", timer:2200, timerProgressBar:true, showConfirmButton:false})
      setRf({nombre:"",documento:"",email:"",telefono:"",password:"",confirm:""})
      setView("login")
    } catch (err) {
      Swal.fire({...SW, icon:"error", title:"Error", text: err.response?.data?.msg||"Error al registrar."})
    } finally { setLoading(false) }
  }

  /* ━━━ FORGOT ━━━ */
  const [fe,  setFe]  = useState("")
  const [fer, setFer] = useState("")
  const [fok, setFok] = useState("")

  const onForgot = async e => {
    e.preventDefault()
    const err=vEmail(fe); setFer(err); if(err) return
    setLoading(true); setFok("")
    try {
      await axios.post(EP.forgot, { email:fe })
      setFok("Si el correo existe, recibirás un enlace para restablecer tu contraseña.")
      setFe("")
    } catch (err) {
      setFer(err.response?.data?.msg||"Error al procesar la solicitud.")
    } finally { setLoading(false) }
  }

  /* ━━━ HEADER META ━━━ */
  const META = {
    login:    { icon:<LogIn    size={23} color="#fff" strokeWidth={2.2}/>, title:"Iniciar Sesión",       sub:"Bienvenido de vuelta a Nido Sky",   hBg:T.gv },
    register: { icon:<UserPlus size={23} color="#fff" strokeWidth={2.2}/>, title:"Crear Cuenta",         sub:"Regístrate como nuevo huésped",     hBg:T.gv },
    forgot:   { icon:<Key      size={23} color="#fff" strokeWidth={2.2}/>, title:"Recuperar Contraseña", sub:"Te ayudamos a recuperar el acceso", hBg:T.gt },
  }
  const m = META[view]

  /* ━━━ RENDER ━━━ */
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080613", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", padding:"24px 16px" }}>

      <CanvasBg/>

      {/* Grid */}
      <div style={{ position:"fixed", inset:0, zIndex:1, backgroundImage:"linear-gradient(rgba(108,63,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(108,63,255,.05) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }}/>

      {/* Orbs */}
      {[
        {w:500,h:500,t:-150,l:-150,bg:"radial-gradient(circle,rgba(108,63,255,.35),transparent 70%)",d:"0s"},
        {w:400,h:400,b:-100,r:-100,bg:"radial-gradient(circle,rgba(192,64,255,.28),transparent 70%)",d:"-3s"},
        {w:280,h:280,t:"40%",l:"55%",bg:"radial-gradient(circle,rgba(0,212,170,.18),transparent 70%)",d:"-6s"},
      ].map((o,i)=>(
        <div key={i} style={{ position:"fixed", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", zIndex:1, animation:`ns-orb 8s ease-in-out ${o.d} infinite`, width:o.w, height:o.h, top:o.t, left:o.l, bottom:o.b, right:o.r, background:o.bg }}/>
      ))}

      {/* Scene */}
      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:980, display:"flex", gap:0, alignItems:"stretch" }}>

        {/* ── LEFT ── */}
        <div className="ns-left" style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 40px", animation:"ns-slideL .8s cubic-bezier(.22,1,.36,1) both" }}>

          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
            <div style={{ width:42, height:42, background:T.gv, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(108,63,255,.5)", position:"relative", overflow:"hidden", flexShrink:0 }}>
              <div style={{ position:"absolute", top:-8, left:-8, width:24, height:24, background:"rgba(255,255,255,.25)", borderRadius:"50%" }}/>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} style={{ position:"relative", zIndex:1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:"1.3rem", letterSpacing:"-.5px", background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1.1 }}>Nido Sky</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".62rem", color:"rgba(255,255,255,.32)", letterSpacing:".22em", textTransform:"uppercase", marginTop:2 }}>Hotel & Suites</div>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:"clamp(1.9rem,3.5vw,3rem)", lineHeight:1.05, letterSpacing:"-1.5px", marginBottom:20, color:"#fff" }}>
            Tu estadía<br/>
            <span style={{ background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>perfecta</span><br/>
            <span style={{ background:T.gt, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>te espera</span>
          </h1>

          <p style={{ fontSize:".88rem", color:"rgba(255,255,255,.4)", lineHeight:1.78, maxWidth:295, marginBottom:44 }}>
            Reserva, gestiona y disfruta tu experiencia en Nido Sky desde una sola plataforma.
          </p>

          {/* Stat cards */}
          <div style={{ position:"relative", height:225 }}>
            {[
              {bg:"rgba(108,63,255,.18)",w:220,t:0,  l:0,  d:"0s", dot:"#6C3FFF",label:"Huéspedes este mes",val:"1,248 reservas"},
              {bg:"rgba(0,212,170,.12)", w:190,t:65, l:130,d:"-2s",dot:"#00D4AA",label:"Disponibilidad",    val:"Habitaciones libres"},
              {bg:"rgba(255,59,130,.10)",w:168,t:142,l:22, d:"-4s",dot:"#FF3B82",label:"Check-in hoy",      val:"32 llegadas"},
            ].map((c,i)=>(
              <div key={i} style={{ position:"absolute", background:c.bg, width:c.w, top:c.t, left:c.l, backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.10)", boxShadow:"0 20px 60px rgba(0,0,0,.4)", borderRadius:16, padding:"14px 18px", animation:`ns-cardF 6s ${c.d} ease-in-out infinite` }}>
                <div style={{ fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.42)", marginBottom:6 }}>{c.label}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:c.dot, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:c.dot, display:"inline-block", animation:"ns-dot 2s ease-in-out infinite" }}/>
                  {c.val}
                </div>
              </div>
            ))}
            {/* Sphere */}
            <div style={{ position:"absolute", right:-22, bottom:-22, width:175, height:175, pointerEvents:"none" }}>
              <div style={{ position:"absolute", top:"50%", left:"50%", width:225, height:225, borderRadius:"50%", border:"1.5px solid rgba(192,64,255,.12)", animation:"ns-ring 4s ease-in-out -2s infinite", transform:"translate(-50%,-50%) rotateX(70deg)" }}/>
              <div style={{ position:"absolute", top:"50%", left:"50%", width:195, height:195, borderRadius:"50%", border:"1.5px solid rgba(108,63,255,.25)", animation:"ns-ring 4s ease-in-out infinite", transform:"translate(-50%,-50%) rotateX(70deg)" }}/>
              <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,rgba(108,63,255,.5),rgba(192,64,255,.2) 50%,transparent 70%)", border:"1px solid rgba(108,63,255,.2)", boxShadow:"inset -20px -20px 40px rgba(0,0,0,.3),inset 10px 10px 30px rgba(108,63,255,.2),0 0 60px rgba(108,63,255,.15)", animation:"ns-sphere 14s linear infinite" }}/>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ns-div" style={{ width:1, flexShrink:0, margin:"40px 0", background:"linear-gradient(to bottom,transparent,rgba(108,63,255,.3) 30%,rgba(192,64,255,.3) 70%,transparent)" }}/>

        {/* ── CARD ── */}
        <div ref={cardRef} style={{ width:432, flexShrink:0, background:"rgba(255,255,255,.04)", backdropFilter:"blur(32px) saturate(180%)", WebkitBackdropFilter:"blur(32px) saturate(180%)", border:"1px solid rgba(255,255,255,.09)", borderRadius:28, overflow:"hidden", animation:"ns-slideR .8s cubic-bezier(.22,1,.36,1) .1s both", boxShadow:"0 0 0 1px rgba(108,63,255,.15),0 40px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)", transformStyle:"preserve-3d" }}>

          {/* Header */}
          <div style={{ padding:"28px 30px 24px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:m.hBg }}/>
            <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, background:"rgba(255,255,255,.08)", borderRadius:"50%" }}/>
            <div style={{ position:"absolute", bottom:-40, left:-20, width:120, height:120, background:"rgba(255,255,255,.06)", borderRadius:"50%" }}/>
            <div style={{ position:"relative", zIndex:2 }}>
              {view!=="login" && (
                <button type="button" onClick={()=>setView("login")}
                  style={{ position:"absolute", top:-8, right:0, width:34, height:34, background:"rgba(255,255,255,.18)", border:"none", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.30)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}>
                  <ChevronLeft size={16} strokeWidth={2.5}/>
                </button>
              )}
              <div style={{ width:48, height:48, background:"rgba(255,255,255,.18)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:"0 8px 20px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.2)" }}>{m.icon}</div>
              <Typography style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.48rem", fontWeight:800, color:"#fff", letterSpacing:"-.4px", lineHeight:1.1 }}>{m.title}</Typography>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", color:"rgba(255,255,255,.68)", marginTop:4 }}>{m.sub}</Typography>
            </div>
          </div>

          {/* Body */}
          <Box style={{ padding:"22px 28px 26px" }}>
            {view==="login"    && <LoginView    cls={cls} lf={lf} le={le} ge={ge} sp={sp} setSp={setSp} onLChange={onLChange} onLogin={onLogin} setView={setView} setFok={setFok} setFer={setFer} loading={loading}/>}
            {view==="register" && <RegisterView cls={cls} rf={rf} re={re} srp={srp} setSrp={setSrp} onRChange={onRChange} onRegister={onRegister} loading={loading}/>}
            {view==="forgot"   && <ForgotView   cls={cls} fe={fe} setFe={setFe} fer={fer} setFer={setFer} fok={fok} onForgot={onForgot} loading={loading}/>}

            {/* Volver al inicio */}
            <Box style={{ display:"flex", justifyContent:"center", marginTop:18 }}>
              <button type="button" onClick={()=>history.push("/")}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".76rem", color:"rgba(255,255,255,.28)", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:8, transition:"color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.65)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.28)"}>
                <ChevronLeft size={12} strokeWidth={2.5}/> Volver al inicio
              </button>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  )
}