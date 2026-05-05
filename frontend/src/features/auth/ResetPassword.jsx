"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useParams, useHistory } from "react-router-dom"
import InputAdornment from "@material-ui/core/InputAdornment"
import TextField from "@material-ui/core/TextField"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import { Lock, Eye, EyeOff, Key, ChevronLeft, LogIn, ShieldCheck } from "lucide-react"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
  ink:"#0C0A14", ink3:"#6B5E87",
  v1:"#6C3FFF", v2:"#C040FF",
  e1:"#FF3B82", t1:"#00D4AA",
  gv:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  gt:"linear-gradient(135deg,#00D4AA,#00A3E0)",
  bL:"rgba(108,63,255,0.10)",
}

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

const useStyles = makeStyles(() => ({
  field: {
    marginBottom: "4px !important",
    "& .MuiOutlinedInput-root": {
      borderRadius: "13px !important",
      fontFamily:   "'DM Sans',sans-serif !important",
      fontSize:     ".88rem",
      color:        "#fff !important",
      backgroundColor: "rgba(255,255,255,.05) !important",
      transition:   "background-color .2s",
      "&:hover": { backgroundColor: "rgba(255,255,255,.07) !important" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(108,63,255,.55)" },
      "&.Mui-focused": { backgroundColor: "rgba(108,63,255,.10) !important" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.v1, borderWidth: 2 },
      "&.Mui-error .MuiOutlinedInput-notchedOutline":   { borderColor: "rgba(255,59,130,.50) !important" },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor:     "rgba(255,255,255,.10) !important",
      backgroundColor: "transparent !important",
    },
    "& .MuiInputBase-input": {
      color:           "#fff !important",
      backgroundColor: "transparent !important",
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
    "& .MuiFormHelperText-root":             { display: "none !important" },
  },
}))

const Spin = () => (
  <span className="ns-spin" style={{ width:17, height:17, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", flexShrink:0 }}/>
)

const ErrHint = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6, marginTop:2, paddingLeft:4 }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:"rgba(255,59,130,.7)", flexShrink:0, display:"inline-block" }}/>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:"rgba(255,255,255,.45)", lineHeight:1.3 }}>{msg}</span>
    </div>
  )
}

const InfoHint = ({ msg }) => {
  if (!msg) return null
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6, marginTop:2, paddingLeft:4 }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:"rgba(108,63,255,.5)", flexShrink:0, display:"inline-block" }}/>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:"rgba(255,255,255,.35)", lineHeight:1.3 }}>{msg}</span>
    </div>
  )
}

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

const SubmitBtn = ({ children, bg, shadow, loading }) => (
  <button type="submit" disabled={loading}
    style={{ width:"100%", padding:"13px 0", background:bg||T.gv, color:"#fff", border:"none", borderRadius:50, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".90rem", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:shadow||"0 8px 28px rgba(108,63,255,.45)", transition:"all .22s", opacity:loading?.65:1, marginTop:8 }}
    onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-2px)" }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)" }}>
    {loading ? <><Spin/> Procesando…</> : children}
  </button>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REGEX & VALIDACIONES — IDÉNTICAS AL ORIGINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const REGEX = {
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
}

const validarPassword = (pass) => {
  if (!pass) return "La contraseña es obligatoria"
  if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (pass.length > 15) return "La contraseña no puede tener más de 15 caracteres"
  if (!/[a-z]/.test(pass)) return "La contraseña debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(pass)) return "La contraseña debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass))
    return "La contraseña debe contener al menos un carácter especial"
  if (REGEX.SECUENCIAS_COMUNES.test(pass))
    return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"
  if (REGEX.CARACTERES_REPETIDOS.test(pass))
    return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase()))
    return "La contraseña no puede contener secuencias de teclado"
  return ""
}

const ResetPassword = () => {
  const { token } = useParams()
  const history = useHistory()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errores, setErrores] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const newPasswordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const cls = useStyles()
  const cardRef = useRef(null)

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

  const handleNewPasswordChange = (e) => {
    const valor = e.target.value
    if (valor.length > 15) {
      setErrores({ ...errores, newPassword: "Has alcanzado el límite máximo de 15 caracteres" })
      return
    }
    setNewPassword(valor)
    setErrores({ ...errores, newPassword: validarPassword(valor) })
  }

  const handleConfirmPasswordChange = (e) => {
    const valor = e.target.value
    if (valor.length > 15) {
      setErrores({ ...errores, confirmPassword: "Has alcanzado el límite máximo de 15 caracteres" })
      return
    }
    setConfirmPassword(valor)
    let error = ""
    if (valor !== newPassword) {
      error = "Las contraseñas no coinciden"
    }
    setErrores({ ...errores, confirmPassword: error })
  }

  const handleNewPasswordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarPassword(newPassword)
      setErrores({ ...errores, newPassword: error })
      if (!error) {
        confirmPasswordRef.current.focus()
      }
    }
  }

  const handleConfirmPasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      let error = ""
      if (confirmPassword !== newPassword) {
        error = "Las contraseñas no coinciden"
      }
      setErrores({ ...errores, confirmPassword: error })
      if (!error && !errores.newPassword) {
        handleSubmit(e)
      }
    }
  }

  const validarFormulario = () => {
    const errNewPassword = validarPassword(newPassword)
    let errConfirmPassword = ""
    if (confirmPassword !== newPassword) {
      errConfirmPassword = "Las contraseñas no coinciden"
    }
    setErrores({
      newPassword: errNewPassword,
      confirmPassword: errConfirmPassword,
    })
    return !errNewPassword && !errConfirmPassword
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) {
      setMessage("Por favor, corrige los errores en el formulario antes de continuar.")
      setIsSuccess(false)
      if (errores.newPassword) newPasswordRef.current.focus()
      else if (errores.confirmPassword) confirmPasswordRef.current.focus()
      return
    }

    setLoading(true)

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword })
      setMessage(res.data.msg)
      setIsSuccess(true)
      setTimeout(() => {
        history.push("/login")
      }, 2000)
    } catch (error) {
      setMessage(error.response?.data?.msg || "Error al restablecer la contraseña")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080613", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", padding:"24px 16px" }}>

      <CanvasBg/>

      <div style={{ position:"fixed", inset:0, zIndex:1, backgroundImage:"linear-gradient(rgba(108,63,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(108,63,255,.05) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }}/>

      {[
        {w:500,h:500,t:-150,l:-150,bg:"radial-gradient(circle,rgba(108,63,255,.35),transparent 70%)",d:"0s"},
        {w:400,h:400,b:-100,r:-100,bg:"radial-gradient(circle,rgba(192,64,255,.28),transparent 70%)",d:"-3s"},
        {w:280,h:280,t:"40%",l:"55%",bg:"radial-gradient(circle,rgba(0,212,170,.18),transparent 70%)",d:"-6s"},
      ].map((o,i)=>(
        <div key={i} style={{ position:"fixed", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", zIndex:1, animation:`ns-orb 8s ease-in-out ${o.d} infinite`, width:o.w, height:o.h, top:o.t, left:o.l, bottom:o.b, right:o.r, background:o.bg }}/>
      ))}

      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:980, display:"flex", gap:0, alignItems:"stretch" }}>

        {/* ── LEFT ── */}
        <div className="ns-left" style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 40px", animation:"ns-slideL .8s cubic-bezier(.22,1,.36,1) both" }}>

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
            Una nueva<br/>
            <span style={{ background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>contraseña</span><br/>
            <span style={{ background:T.gt, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>más segura</span>
          </h1>

          <p style={{ fontSize:".88rem", color:"rgba(255,255,255,.4)", lineHeight:1.78, maxWidth:295, marginBottom:44 }}>
            Define una contraseña robusta y vuelve al control de tu cuenta en segundos.
          </p>

          <div style={{ position:"relative", height:225 }}>
            {[
              {bg:"rgba(108,63,255,.18)",w:220,t:0,  l:0,  d:"0s", dot:"#6C3FFF",label:"Cifrado",val:"AES-256"},
              {bg:"rgba(0,212,170,.12)", w:190,t:65, l:130,d:"-2s",dot:"#00D4AA",label:"Cumple", val:"Política fuerte"},
              {bg:"rgba(255,59,130,.10)",w:168,t:142,l:22, d:"-4s",dot:"#FF3B82",label:"Validación", val:"En tiempo real"},
            ].map((c,i)=>(
              <div key={i} style={{ position:"absolute", background:c.bg, width:c.w, top:c.t, left:c.l, backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.10)", boxShadow:"0 20px 60px rgba(0,0,0,.4)", borderRadius:16, padding:"14px 18px", animation:`ns-cardF 6s ${c.d} ease-in-out infinite` }}>
                <div style={{ fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.42)", marginBottom:6 }}>{c.label}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:c.dot, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:c.dot, display:"inline-block", animation:"ns-dot 2s ease-in-out infinite" }}/>
                  {c.val}
                </div>
              </div>
            ))}
            <div style={{ position:"absolute", right:-22, bottom:-22, width:175, height:175, pointerEvents:"none" }}>
              <div style={{ position:"absolute", top:"50%", left:"50%", width:225, height:225, borderRadius:"50%", border:"1.5px solid rgba(192,64,255,.12)", animation:"ns-ring 4s ease-in-out -2s infinite", transform:"translate(-50%,-50%) rotateX(70deg)" }}/>
              <div style={{ position:"absolute", top:"50%", left:"50%", width:195, height:195, borderRadius:"50%", border:"1.5px solid rgba(108,63,255,.25)", animation:"ns-ring 4s ease-in-out infinite", transform:"translate(-50%,-50%) rotateX(70deg)" }}/>
              <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,rgba(108,63,255,.5),rgba(192,64,255,.2) 50%,transparent 70%)", border:"1px solid rgba(108,63,255,.2)", boxShadow:"inset -20px -20px 40px rgba(0,0,0,.3),inset 10px 10px 30px rgba(108,63,255,.2),0 0 60px rgba(108,63,255,.15)", animation:"ns-sphere 14s linear infinite" }}/>
            </div>
          </div>
        </div>

        <div className="ns-div" style={{ width:1, flexShrink:0, margin:"40px 0", background:"linear-gradient(to bottom,transparent,rgba(108,63,255,.3) 30%,rgba(192,64,255,.3) 70%,transparent)" }}/>

        {/* ── CARD ── */}
        <div ref={cardRef} style={{ width:432, flexShrink:0, background:"rgba(255,255,255,.04)", backdropFilter:"blur(32px) saturate(180%)", WebkitBackdropFilter:"blur(32px) saturate(180%)", border:"1px solid rgba(255,255,255,.09)", borderRadius:28, overflow:"hidden", animation:"ns-slideR .8s cubic-bezier(.22,1,.36,1) .1s both", boxShadow:"0 0 0 1px rgba(108,63,255,.15),0 40px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)", transformStyle:"preserve-3d" }}>

          <div style={{ padding:"28px 30px 24px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:T.gv }}/>
            <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, background:"rgba(255,255,255,.08)", borderRadius:"50%" }}/>
            <div style={{ position:"absolute", bottom:-40, left:-20, width:120, height:120, background:"rgba(255,255,255,.06)", borderRadius:"50%" }}/>
            <div style={{ position:"relative", zIndex:2 }}>
              <button type="button" onClick={()=>history.push("/login")}
                style={{ position:"absolute", top:-8, right:0, width:34, height:34, background:"rgba(255,255,255,.18)", border:"none", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"all .2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.30)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}>
                <ChevronLeft size={16} strokeWidth={2.5}/>
              </button>
              <div style={{ width:48, height:48, background:"rgba(255,255,255,.18)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:"0 8px 20px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.2)" }}>
                <ShieldCheck size={23} color="#fff" strokeWidth={2.2}/>
              </div>
              <Typography style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.48rem", fontWeight:800, color:"#fff", letterSpacing:"-.4px", lineHeight:1.1 }}>Restablecer Contraseña</Typography>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", color:"rgba(255,255,255,.68)", marginTop:4 }}>Define tu nueva clave de acceso</Typography>
            </div>
          </div>

          <Box style={{ padding:"22px 28px 26px" }}>
            <form onSubmit={handleSubmit} style={{ animation:"ns-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>

              {message && (isSuccess ? <SuccessBox msg={message}/> : <GlobalErr msg={message}/>)}

              <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                label="Nueva Contraseña" type={showPassword?"text":"password"} value={newPassword}
                onChange={handleNewPasswordChange} onKeyDown={handleNewPasswordKeyDown}
                error={!!errores.newPassword} inputRef={newPasswordRef}
                inputProps={{ maxLength:15 }}
                InputProps={{
                  startAdornment:<InputAdornment position="start"><Lock size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>,
                  endAdornment:(
                    <InputAdornment position="end">
                      <button type="button" onClick={handleTogglePassword} aria-label={showPassword?"Ocultar contraseña":"Mostrar contraseña"} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, borderRadius:8, color:T.ink3 }}>
                        {showPassword ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
                      </button>
                    </InputAdornment>
                  ),
                }}
              />
              <PwBar val={newPassword}/>
              {!errores.newPassword
                ? <InfoHint msg="8-15 caracteres, incluye mayúsculas, minúsculas, números y caracteres especiales."/>
                : <ErrHint msg={errores.newPassword}/>
              }

              <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                label="Confirmar Contraseña" type={showConfirmPassword?"text":"password"} value={confirmPassword}
                onChange={handleConfirmPasswordChange} onKeyDown={handleConfirmPasswordKeyDown}
                error={!!errores.confirmPassword} inputRef={confirmPasswordRef}
                inputProps={{ maxLength:15 }}
                InputProps={{
                  startAdornment:<InputAdornment position="start"><Lock size={16} color={T.ink3} strokeWidth={2}/></InputAdornment>,
                  endAdornment:(
                    <InputAdornment position="end">
                      <button type="button" onClick={handleToggleConfirmPassword} aria-label={showConfirmPassword?"Ocultar contraseña":"Mostrar contraseña"} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, borderRadius:8, color:T.ink3 }}>
                        {showConfirmPassword ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
                      </button>
                    </InputAdornment>
                  ),
                }}
              />
              <ErrHint msg={errores.confirmPassword}/>

              <SubmitBtn loading={loading}><Key size={16} strokeWidth={2.2}/> Restablecer Contraseña</SubmitBtn>
            </form>

            <Box style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:16, fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", color:"rgba(255,255,255,.4)" }}>
              ¿Recordaste tu contraseña?
              <button type="button" onClick={(e)=>{ e.preventDefault(); history.push("/login") }}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", fontWeight:700, color:T.v1, padding:"3px 8px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:4, transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.bL}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <LogIn size={13} strokeWidth={2.2}/> Iniciar sesión
              </button>
            </Box>

            <Box style={{ display:"flex", justifyContent:"center", marginTop:14 }}>
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

export default ResetPassword
