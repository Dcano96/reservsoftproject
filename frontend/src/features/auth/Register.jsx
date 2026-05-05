"use client"

import { useState, useEffect, useRef } from "react"
import authService from "./auth.service"
import { useHistory } from "react-router-dom"
import InputAdornment from "@material-ui/core/InputAdornment"
import TextField from "@material-ui/core/TextField"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  FileText, Key, ChevronLeft, UserPlus,
} from "lucide-react"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
  ink:"#0C0A14", ink2:"#2D2640", ink3:"#6B5E87", ink4:"#B0A5C8",
  v1:"#6C3FFF", v2:"#C040FF",
  e1:"#FF3B82", t1:"#00D4AA", a1:"#FF7B2C",
  gv:"linear-gradient(135deg,#6C3FFF,#C040FF)",
  ge:"linear-gradient(135deg,#FF3B82,#FF7B2C)",
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
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
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

const SecLabel = ({ icon, iconBg, children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Syne',sans-serif", fontSize:".68rem", fontWeight:700, color:"rgba(255,255,255,.45)", letterSpacing:".07em", textTransform:"uppercase", margin:"12px 0 6px", paddingBottom:7, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
    <span style={{ width:20, height:20, borderRadius:5, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</span>
    {children}
  </div>
)

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
  SOLO_NUMEROS: /^\d+$/,
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
}

const Register = () => {
  const documentoRef = useRef(null)
  const nombreRef = useRef(null)
  const telefonoRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const [nombre, setNombre] = useState("")
  const [documento, setDocumento] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errores, setErrores] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    password: "",
  })
  const [isMounted, setIsMounted] = useState(true)
  const history = useHistory()
  const cls = useStyles()
  const cardRef = useRef(null)

  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

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

  const validarDocumento = (doc) => {
    if (!doc) return "El documento es obligatorio"
    if (doc.trim() === "") return "El documento no puede estar vacío"
    if (!REGEX.SOLO_NUMEROS.test(doc)) return "El documento debe contener solo números"
    if (doc.length < 6) return "El documento debe tener al menos 6 dígitos"
    if (doc.length > 15) return "El documento no puede tener más de 15 dígitos"
    if (REGEX.CARACTERES_REPETIDOS.test(doc))
      return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
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
    if (REGEX.CARACTERES_REPETIDOS.test(tel))
      return "El teléfono no puede contener más de 3 dígitos repetidos consecutivos"
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
    if (!domainPart || !domainPart.includes("."))
      return "El dominio del correo debe incluir una extensión (ej: .com, .net)"
    const domainParts = domainPart.split(".")
    for (let i = 0; i < domainParts.length; i++) {
      const part = domainParts[i]
      if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
        return "El dominio del correo contiene partes inválidas"
      }
    }
    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) {
      return "La extensión del dominio no es válida o contiene caracteres no permitidos"
    }
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
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass))
      return "La contraseña debe contener al menos un carácter especial"
    if (REGEX.SECUENCIAS_COMUNES.test(pass))
      return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"
    if (REGEX.CARACTERES_REPETIDOS.test(pass))
      return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"
    if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase()))
      return "La contraseña no puede contener secuencias de teclado"
    if (nombre) {
      const nombreParts = nombre.toLowerCase().split(/\s+/)
      for (const part of nombreParts) {
        if (part.length > 2 && pass.toLowerCase().includes(part))
          return "La contraseña no puede contener partes de tu nombre"
      }
    }
    if (documento && pass.includes(documento)) return "La contraseña no puede contener tu número de documento"
    if (telefono && pass.includes(telefono)) return "La contraseña no puede contener tu número de teléfono"
    if (email) {
      const emailPart = email.split("@")[0].toLowerCase()
      if (emailPart.length > 2 && pass.toLowerCase().includes(emailPart))
        return "La contraseña no puede contener partes de tu correo electrónico"
    }
    return ""
  }

  const handleNombreChange = (e) => {
    const valor = e.target.value
    if (valor && !REGEX.SOLO_LETRAS_ESPACIOS.test(valor.slice(-1))) {
      return
    }
    setNombre(valor)
    setErrores({ ...errores, nombre: validarNombre(valor) })
  }

  const handleDocumentoChange = (e) => {
    const valor = e.target.value
    if (valor && !REGEX.SOLO_NUMEROS.test(valor)) {
      return
    }
    setDocumento(valor)
    setErrores({ ...errores, documento: validarDocumento(valor) })
  }

  const handleTelefonoChange = (e) => {
    const valor = e.target.value
    if (valor && !REGEX.SOLO_NUMEROS.test(valor)) {
      return
    }
    setTelefono(valor)
    setErrores({ ...errores, telefono: validarTelefono(valor) })
  }

  const handleEmailChange = (e) => {
    const valor = e.target.value
    const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/
    if (!emailRegex.test(valor)) {
      return
    }
    if (valor.includes("@@") || valor.includes("..") || valor.includes(".@") || valor.includes("@.")) {
      return
    }
    const atCount = (valor.match(/@/g) || []).length
    if (atCount > 1) {
      return
    }
    if (email.includes("@") && email.includes(".")) {
      const currentParts = email.split("@")
      const newParts = valor.split("@")
      if (currentParts.length > 1 && newParts.length > 1) {
        const currentDomain = currentParts[1]
        const newDomain = newParts[1]
        const completeTLDs = [".com", ".net", ".org", ".edu", ".gov", ".mil", ".int"]
        const hasTLDComplete = completeTLDs.some((tld) => currentDomain.endsWith(tld))
        if (hasTLDComplete && newDomain.length > currentDomain.length) {
          return
        }
      }
    }
    setEmail(valor)
    setErrores({ ...errores, email: validarEmail(valor) })
  }

  const handlePasswordChange = (e) => {
    const valor = e.target.value
    setPassword(valor)
    setErrores({ ...errores, password: validarPassword(valor) })
  }

  const handleDocumentoKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarDocumento(documento)
      setErrores({ ...errores, documento: error })
      if (!error) {
        nombreRef.current.focus()
      }
    }
  }

  const handleNombreKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarNombre(nombre)
      setErrores({ ...errores, nombre: error })
      if (!error) {
        telefonoRef.current.focus()
      }
    }
  }

  const handleTelefonoKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarTelefono(telefono)
      setErrores({ ...errores, telefono: error })
      if (!error) {
        emailRef.current.focus()
      }
    }
  }

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const error = validarEmail(email)
      setErrores({ ...errores, email: error })
      if (!error) {
        passwordRef.current.focus()
      }
    }
  }

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const error = validarPassword(password)
      setErrores({ ...errores, password: error })
      if (!error) {
        handleRegister(e)
      }
    }
  }

  const validarFormulario = () => {
    const errNombre = validarNombre(nombre)
    const errDocumento = validarDocumento(documento)
    const errTelefono = validarTelefono(telefono)
    const errEmail = validarEmail(email)
    const errPassword = validarPassword(password)
    setErrores({
      nombre: errNombre,
      documento: errDocumento,
      telefono: errTelefono,
      email: errEmail,
      password: errPassword,
    })
    return !errNombre && !errDocumento && !errTelefono && !errEmail && !errPassword
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      if (errores.documento) documentoRef.current.focus()
      else if (errores.nombre) nombreRef.current.focus()
      else if (errores.telefono) telefonoRef.current.focus()
      else if (errores.email) emailRef.current.focus()
      else if (errores.password) passwordRef.current.focus()
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await authService.register({
        nombre,
        documento,
        telefono,
        email,
        password,
        rol: "cliente",
      })
      console.log(response.msg)
      history.push("/login")
    } catch (error) {
      console.error("Error en el registro", error)
      if (isMounted) {
        const errorMsg =
          error.response && error.response.data && error.response.data.msg
            ? error.response.data.msg
            : "Error al registrarse. Por favor, inténtelo de nuevo."
        setError(errorMsg)
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
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
            Únete a la<br/>
            <span style={{ background:T.gv, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>experiencia</span><br/>
            <span style={{ background:T.gt, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Nido Sky</span>
          </h1>

          <p style={{ fontSize:".88rem", color:"rgba(255,255,255,.4)", lineHeight:1.78, maxWidth:295, marginBottom:44 }}>
            Crea tu cuenta y descubre un mundo de comodidad, beneficios exclusivos y experiencias únicas.
          </p>

          <div style={{ position:"relative", height:225 }}>
            {[
              {bg:"rgba(108,63,255,.18)",w:220,t:0,  l:0,  d:"0s", dot:"#6C3FFF",label:"Beneficios miembro",val:"Hasta 25% off"},
              {bg:"rgba(0,212,170,.12)", w:190,t:65, l:130,d:"-2s",dot:"#00D4AA",label:"Reserva en", val:"3 pasos"},
              {bg:"rgba(255,59,130,.10)",w:168,t:142,l:22, d:"-4s",dot:"#FF3B82",label:"Soporte 24/7", val:"Atención total"},
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
                <UserPlus size={23} color="#fff" strokeWidth={2.2}/>
              </div>
              <Typography style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.48rem", fontWeight:800, color:"#fff", letterSpacing:"-.4px", lineHeight:1.1 }}>Crear Cuenta</Typography>
              <Typography style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", color:"rgba(255,255,255,.68)", marginTop:4 }}>Regístrate como nuevo huésped</Typography>
            </div>
          </div>

          <Box style={{ padding:"22px 28px 26px" }}>
            <form onSubmit={handleRegister} style={{ animation:"ns-viewIn .4s cubic-bezier(.22,1,.36,1)" }} noValidate>

              <SecLabel icon={<User size={10} color={T.v1} strokeWidth={2.5}/>} iconBg="rgba(108,63,255,.15)">Información Personal</SecLabel>
              <Box className={cls.row2}>
                <div>
                  <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                    label="Documento" value={documento} onChange={handleDocumentoChange} onKeyDown={handleDocumentoKeyDown}
                    error={!!errores.documento} inputRef={documentoRef}
                    inputProps={{ maxLength:15 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><FileText size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                  />
                  <ErrHint msg={errores.documento}/>
                </div>
                <div>
                  <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                    label="Nombre completo" value={nombre} onChange={handleNombreChange} onKeyDown={handleNombreKeyDown}
                    error={!!errores.nombre} inputRef={nombreRef}
                    inputProps={{ maxLength:30 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><User size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                  />
                  <ErrHint msg={errores.nombre}/>
                </div>
              </Box>

              <SecLabel icon={<Phone size={10} color={T.t1} strokeWidth={2.5}/>} iconBg="rgba(0,212,170,.12)">Contacto</SecLabel>
              <Box className={cls.row2}>
                <div>
                  <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                    label="Teléfono" type="tel" value={telefono} onChange={handleTelefonoChange} onKeyDown={handleTelefonoKeyDown}
                    error={!!errores.telefono} inputRef={telefonoRef}
                    inputProps={{ maxLength:10 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Phone size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                  />
                  <ErrHint msg={errores.telefono}/>
                </div>
                <div>
                  <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                    label="Correo electrónico" type="email" value={email} onChange={handleEmailChange} onKeyDown={handleEmailKeyDown}
                    error={!!errores.email} inputRef={emailRef}
                    inputProps={{ maxLength:30 }}
                    InputProps={{ startAdornment:<InputAdornment position="start"><Mail size={16} color={T.ink3} strokeWidth={2}/></InputAdornment> }}
                  />
                  <ErrHint msg={errores.email}/>
                </div>
              </Box>

              <SecLabel icon={<Key size={10} color={T.e1} strokeWidth={2.5}/>} iconBg="rgba(255,59,130,.10)">Seguridad</SecLabel>
              <TextField className={cls.field} fullWidth variant="outlined" margin="dense"
                label="Contraseña" type={showPassword?"text":"password"} value={password}
                onChange={handlePasswordChange} onKeyDown={handlePasswordKeyDown}
                error={!!errores.password} inputRef={passwordRef}
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
              <PwBar val={password}/>
              <ErrHint msg={errores.password}/>

              <GlobalErr msg={error}/>

              <SubmitBtn loading={loading}><UserPlus size={16} strokeWidth={2.2}/> Crear Cuenta</SubmitBtn>
            </form>

            <Box style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:16, fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", color:"rgba(255,255,255,.4)" }}>
              ¿Ya tienes una cuenta?
              <button type="button" onClick={(e)=>{ e.preventDefault(); history.push("/login") }}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", fontWeight:700, color:T.v1, padding:"3px 8px", borderRadius:8, transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.bL}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                Iniciar sesión
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

export default Register
