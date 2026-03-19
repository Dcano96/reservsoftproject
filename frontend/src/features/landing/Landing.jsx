"use client"
import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import {
  Typography, Button, Grid, Card, CardContent, Box, Paper,
  TextField, AppBar, Toolbar, IconButton, Drawer, List,
  ListItem, ListItemText, Divider, Zoom, Slide, useMediaQuery,
  useTheme, Chip, Dialog, DialogTitle, DialogContent, Fade,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import {
  LocationOn, Star, Menu as MenuIcon, Close, LocalHotel, Bathtub,
  Person, ChevronLeft, ChevronRight, Favorite, FavoriteBorder,
  Search, PlayArrow, Visibility, Pool, Wifi, Spa, FitnessCenter,
  Restaurant, AcUnit, LocalBar, Security, Facebook, Instagram,
  Twitter, Room, ArrowForward, CheckCircle, Phone, Email,
  CloudUpload, Add, InfoOutlined, Description, ArrowUpward,
  FlashOn, TrendingUp, EmojiEvents, Explore,
} from "@material-ui/icons"
import axios from "axios"
import Swal from "sweetalert2"

/* ─── API CONFIG (unchanged) ─────────────────────────────────────────────── */
const API_BASE_URL = process.env.REACT_APP_API_URL || ""
const API_ENDPOINTS = {
  apartamentos: API_BASE_URL ? `${API_BASE_URL}/api/apartamentos` : "/api/apartamentos",
  apartamentosDestacados: API_BASE_URL
    ? `${API_BASE_URL}/api/landing/apartamentos-destacados`
    : "/api/landing/apartamentos-destacados",
  reservasPublica: API_BASE_URL ? `${API_BASE_URL}/api/reservas/publica` : "/api/reservas/publica",
  fechasReservadas: (id) =>
    API_BASE_URL ? `${API_BASE_URL}/api/reservas/fechas-reservadas/${id}` : `/api/reservas/fechas-reservadas/${id}`,
}
const apiCall = async (url, options = {}) => {
  const response = await axios.get(url, options)
  return response
}

/* ─── SAMPLE DATA (unchanged) ─────────────────────────────────────────────── */
const apartamentosEjemplo = [
  { id:1, nombre:"Apartamento Tipo 1", tipo:"Tipo 1", ubicacion:"El Poblado, Medellín", precio:250, capacidad:2, camas:1, banos:1, tamano:45, caracteristicas:["Balcón","Vista ciudad","Cocina equipada","WiFi"], imagen:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", disponible:true, tag:"Popular" },
  { id:2, nombre:"Apartamento Tipo 2", tipo:"Tipo 2", ubicacion:"El Poblado, Medellín", precio:350, capacidad:4, camas:2, banos:2, tamano:75, caracteristicas:["Sala de estar","Comedor","Terraza","Smart TV"], imagen:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", disponible:true, tag:"Familiar" },
  { id:3, nombre:"Penthouse Exclusivo", tipo:"Penthouse", ubicacion:"El Poblado, Medellín", precio:550, capacidad:6, camas:3, banos:3, tamano:120, caracteristicas:["Terraza panorámica","Jacuzzi","Bar privado","Concierge"], imagen:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", disponible:true, tag:"Lujo" },
  { id:4, nombre:"Suite Ejecutiva", tipo:"Suite", ubicacion:"El Poblado, Medellín", precio:400, capacidad:2, camas:1, banos:1, tamano:60, caracteristicas:["Escritorio","Cafetera","Minibar","Caja fuerte"], imagen:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", disponible:true, tag:"Ejecutivo" },
  { id:5, nombre:"Apartamento Familiar", tipo:"Tipo 2", ubicacion:"El Poblado, Medellín", precio:380, capacidad:5, camas:2, banos:2, tamano:85, caracteristicas:["Cocina completa","Área juegos","Lavadora","Secadora"], imagen:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", disponible:true, tag:"Familiar" },
  { id:6, nombre:"Loft Moderno", tipo:"Loft", ubicacion:"El Poblado, Medellín", precio:320, capacidad:2, camas:1, banos:1, tamano:55, caracteristicas:["Diseño abierto","LED","Smart TV","Sonido"], imagen:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", disponible:true, tag:"Moderno" },
]
const testimoniosEjemplo = [
  { id:1, nombre:"María Rodríguez", comentario:"Una experiencia increíble. Las vistas desde nuestra habitación eran espectaculares y el servicio fue impecable. Definitivamente volveremos a Nido Sky.", rating:5, avatar:"https://randomuser.me/api/portraits/women/44.jpg", rol:"Huésped frecuente" },
  { id:2, nombre:"Carlos Mendoza", comentario:"El mejor hotel en El Poblado. La atención al detalle es extraordinaria y las instalaciones son de primera clase. El penthouse es simplemente espectacular.", rating:5, avatar:"https://randomuser.me/api/portraits/men/32.jpg", rol:"Viajero de negocios" },
  { id:3, nombre:"Ana Gómez", comentario:"Nido Sky superó todas nuestras expectativas. El spa es increíble y la comida del restaurante es deliciosa. La ubicación en El Poblado es perfecta.", rating:5, avatar:"https://randomuser.me/api/portraits/women/68.jpg", rol:"Turista internacional" },
]
const heroImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=85",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=85",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=85",
]


/* ─── STYLES — Paleta clara inspirada en UsuarioList ────────────────────── */
/* Colores base:
   Fondo: #F4F1FF (lila muy claro) / #FFFFFF
   Texto: #0C0A14 (casi negro) / #2D2640 / #6B5E87
   Acento: #6C3FFF → #C040FF (violeta)
   Cards: rgba(255,255,255,0.82) con glassmorphism
*/
const useStyles = makeStyles((muiTheme) => ({
  root: {
    overflowX: "hidden",
    backgroundColor: "#F4F1FF",
    fontFamily: "'Outfit', sans-serif",
    color: "#0C0A14",
    position: "relative",
  },

  "@global": {
    "@import": "url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap')",
    "@keyframes floatY": {
      "0%,100%": { transform: "translateY(0px)" },
      "50%": { transform: "translateY(-18px)" },
    },
    "@keyframes pulse": {
      "0%,100%": { opacity: 1, transform: "scale(1)" },
      "50%": { opacity: 0.7, transform: "scale(1.08)" },
    },
    "@keyframes shimmer": {
      "0%": { backgroundPosition: "-200% center" },
      "100%": { backgroundPosition: "200% center" },
    },
    "@keyframes slideInUp": {
      "0%": { transform: "translateY(50px)", opacity: 0 },
      "100%": { transform: "translateY(0)", opacity: 1 },
    },
    "@keyframes cardFloat": {
      "0%,100%": { transform: "translateY(0) rotateX(0deg)" },
      "50%": { transform: "translateY(-6px) rotateX(2deg)" },
    },
    "*": { boxSizing: "border-box", scrollBehavior: "smooth" },
    "body,html": { margin: 0, padding: 0 },
    "::-webkit-scrollbar": { width: 6 },
    "::-webkit-scrollbar-track": { background: "#EDE9FF" },
    "::-webkit-scrollbar-thumb": { background: "linear-gradient(#6C3FFF,#C040FF)", borderRadius: 3 },
    /* Swal toasts must appear above MUI Dialog (z-index 1300) */
    ".swal2-container": { zIndex: "9999 !important" },
    ".swal2-toast": { fontFamily: "'Outfit',sans-serif !important", borderRadius: "14px !important", boxShadow: "0 8px 32px rgba(108,63,255,0.20) !important", border: "1px solid rgba(108,63,255,0.18) !important" },
    ".swal2-popup.swal2-toast .swal2-title": { fontSize: "0.88rem !important", fontWeight: "700 !important", color: "#0C0A14 !important" },
    ".swal2-popup.swal2-toast .swal2-html-container": { fontSize: "0.80rem !important", color: "#6B5E87 !important" },
  },

  /* ── PARTICLES CANVAS ── */
  particleCanvas: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.18,
  },

  /* ── NAVBAR ── */
  appBar: {
    backgroundColor: "transparent",
    boxShadow: "none",
    position: "fixed",
    zIndex: 1300,
    transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
  },
  appBarScrolled: {
    background: "rgba(12,10,20,0.96)",
    backdropFilter: "blur(20px) saturate(180%)",
    borderBottom: "1px solid rgba(108,63,255,0.35)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 56px",
    height: 76,
    [muiTheme.breakpoints.down("sm")]: { padding: "0 20px" },
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    "& img": {
      height: 46,
      filter: "drop-shadow(0 0 10px rgba(108,63,255,0.5))",
    },
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    [muiTheme.breakpoints.down("sm")]: { display: "none" },
  },
  navLink: {
    color: "rgba(255,255,255,0.88)",
    textTransform: "none",
    fontSize: "0.88rem",
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
    padding: "6px 16px",
    borderRadius: 8,
    transition: "all 0.3s",
    "&:hover": {
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.12)",
    },
  },
  navLinkScrolled: {
    color: "#fff !important",
    "&:hover": {
      color: "#C4B5FD !important",
      backgroundColor: "rgba(108,63,255,0.20) !important",
    },
  },
  activeNavLink: { color: "#C4B5FD !important" },
  loginButton: {
    marginLeft: 8,
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    color: "#fff",
    padding: "9px 28px",
    borderRadius: 50,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.88rem",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 5px 18px rgba(108,63,255,0.40)",
    transition: "all 0.35s",
    "&:hover": {
      transform: "translateY(-2px) scale(1.03)",
      boxShadow: "0 9px 26px rgba(108,63,255,0.55)",
    },
  },
  menuButton: {
    display: "none",
    color: "#6C3FFF",
    [muiTheme.breakpoints.down("sm")]: { display: "block" },
  },

  /* ── DRAWER ── */
  drawer: {
    width: 300,
    "& .MuiDrawer-paper": {
      background: "#fff",
      borderRight: "1px solid rgba(108,63,255,0.14)",
      boxShadow: "4px 0 32px rgba(108,63,255,0.10)",
    },
  },
  drawerHeader: {
    padding: "28px 24px 20px",
    borderBottom: "1px solid rgba(108,63,255,0.10)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerLogoText: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1.4rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  drawerItem: {
    padding: "12px 24px",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "rgba(108,63,255,0.07)",
      paddingLeft: 32,
    },
    "& span": {
      color: "#2D2640",
      fontFamily: "'Outfit', sans-serif",
      fontSize: "0.95rem",
    },
  },
  drawerLoginBtn: {
    margin: "16px 24px",
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    color: "#fff",
    borderRadius: 50,
    textTransform: "none",
    fontWeight: 700,
    width: "calc(100% - 48px)",
    padding: "12px 0",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 5px 18px rgba(108,63,255,0.38)",
  },

  /* ── HERO — mantiene fondo oscuro porque es sobre fotos ── */
  heroSection: {
    position: "relative",
    height: "100vh",
    minHeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.5s ease",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, rgba(12,10,20,0.72) 0%, rgba(108,63,255,0.38) 50%, rgba(12,10,20,0.78) 100%)",
    },
  },
  heroGlowOrb1: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,63,255,0.30) 0%, transparent 70%)",
    top: -100,
    right: -100,
    animation: "$floatY 8s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 1,
  },
  heroGlowOrb2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(192,64,255,0.22) 0%, transparent 70%)",
    bottom: -50,
    left: -50,
    animation: "$floatY 10s ease-in-out infinite reverse",
    pointerEvents: "none",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    maxWidth: 900,
    padding: "0 32px",
    animation: "$slideInUp 1s ease forwards",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.38)",
    borderRadius: 100,
    padding: "7px 20px",
    marginBottom: 24,
    backdropFilter: "blur(12px)",
    "& svg": { fontSize: 16, color: "#fff" },
    "& span": {
      fontSize: "0.78rem",
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#fff",
      fontFamily: "'Outfit', sans-serif",
    },
  },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 900,
    fontSize: "5.5rem",
    lineHeight: 1.02,
    color: "#fff",
    marginBottom: 20,
    [muiTheme.breakpoints.down("sm")]: { fontSize: "3rem" },
    "& em": {
      fontStyle: "normal",
      background: "linear-gradient(135deg, #C4B5FD 0%, #EC4899 50%, #F59E0B 100%)",
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "$shimmer 3s linear infinite",
    },
  },
  heroSub: {
    fontSize: "1.15rem",
    fontWeight: 300,
    color: "rgba(255,255,255,0.85)",
    maxWidth: 620,
    margin: "0 auto 44px",
    lineHeight: 1.75,
    fontFamily: "'Outfit', sans-serif",
  },
  heroButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  heroPrimBtn: {
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    backgroundSize: "200% auto",
    color: "#fff",
    padding: "14px 40px",
    borderRadius: 50,
    textTransform: "none",
    fontSize: "0.96rem",
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 8px 32px rgba(108,63,255,0.52)",
    transition: "all 0.4s",
    "&:hover": {
      backgroundPosition: "right center",
      transform: "translateY(-3px) scale(1.04)",
      boxShadow: "0 16px 48px rgba(108,63,255,0.68)",
    },
  },
  heroSecBtn: {
    backgroundColor: "transparent",
    color: "#fff",
    padding: "13px 40px",
    borderRadius: 50,
    textTransform: "none",
    fontSize: "0.96rem",
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
    border: "1.5px solid rgba(255,255,255,0.55)",
    transition: "all 0.3s",
    "&:hover": {
      borderColor: "#fff",
      backgroundColor: "rgba(255,255,255,0.15)",
      transform: "translateY(-2px)",
    },
  },
  heroNavBtns: {
    position: "absolute",
    bottom: 44,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: 12,
    zIndex: 3,
  },
  heroNavBtn: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.18)",
    border: "1.5px solid rgba(255,255,255,0.40)",
    color: "#fff",
    backdropFilter: "blur(8px)",
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.30)",
      transform: "scale(1.1)",
    },
  },
  heroDots: {
    position: "absolute",
    bottom: 108,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 10,
    zIndex: 3,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.40)",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
  },
  heroDotActive: {
    width: 28,
    backgroundColor: "#fff",
    boxShadow: "0 0 12px rgba(255,255,255,0.6)",
  },

  /* ── BOOKING BAR ── */
  bookingWrap: {
    position: "relative",
    zIndex: 20,
    marginTop: -64,
    padding: "0 72px",
    [muiTheme.breakpoints.down("sm")]: { padding: "0 16px", marginTop: 0 },
  },
  bookingBar: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid rgba(108,63,255,0.16)",
    borderRadius: 22,
    padding: "28px 36px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 20px 60px rgba(108,63,255,0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
    [muiTheme.breakpoints.down("sm")]: { flexDirection: "column", padding: "24px 20px", borderRadius: 18 },
  },
  bookingLabel: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "1.1rem",
    whiteSpace: "nowrap",
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  bookingInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 13,
      backgroundColor: "rgba(244,241,255,0.60)",
      fontFamily: "'Outfit', sans-serif",
      color: "#0C0A14",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF" },
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(108,63,255,0.20)" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF", borderWidth: 2 },
    "& .MuiInputLabel-root": { color: "#6B5E87", fontFamily: "'Outfit', sans-serif" },
    "& .MuiInputBase-input": { color: "#0C0A14", fontFamily: "'Outfit', sans-serif" },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { color: "#6C3FFF" },
  },
  bookingSubmit: {
    height: 56,
    minWidth: 180,
    borderRadius: 50,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.9rem",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: "0.04em",
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    color: "#fff",
    boxShadow: "0 6px 24px rgba(108,63,255,0.42)",
    transition: "all 0.35s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 36px rgba(108,63,255,0.58)",
    },
    [muiTheme.breakpoints.down("sm")]: { width: "100%" },
  },

  /* ── STATS STRIP ── */
  statsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 2,
    margin: "60px 72px 0",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(22px) saturate(180%)",
    border: "1px solid rgba(108,63,255,0.12)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 5px 22px rgba(108,63,255,0.10)",
    [muiTheme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      margin: "40px 16px 0",
    },
  },
  statItem: {
    padding: "32px 24px",
    textAlign: "center",
    position: "relative",
    transition: "all 0.35s",
    cursor: "default",
    "&:hover": { background: "rgba(108,63,255,0.07)" },
  },
  statNum: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 900,
    fontSize: "2.6rem",
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.78rem",
    color: "#6B5E87",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontFamily: "'Outfit', sans-serif",
    marginTop: 6,
    display: "block",
    fontWeight: 700,
  },

  /* ── SECTION COMMONS ── */
  sxWrap: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 72px",
    [muiTheme.breakpoints.down("sm")]: { padding: "0 20px" },
  },
  sxBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.22)",
    borderRadius: 100,
    padding: "5px 18px",
    marginBottom: 16,
    "& span": {
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#6C3FFF",
      fontFamily: "'Outfit', sans-serif",
    },
    "& div": { width: 6, height: 6, borderRadius: "50%", backgroundColor: "#6C3FFF", animation: "$pulse 2s infinite" },
  },
  sxTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 900,
    fontSize: "3rem",
    color: "#0C0A14",
    lineHeight: 1.1,
    marginBottom: 14,
    [muiTheme.breakpoints.down("sm")]: { fontSize: "2.1rem" },
  },
  sxSub: {
    fontSize: "1rem",
    fontWeight: 400,
    color: "#6B5E87",
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1.7,
    marginBottom: 56,
    maxWidth: 600,
  },

  /* ── APARTMENTS ── */
  aptSection: {
    background: "linear-gradient(180deg, #F4F1FF 0%, #EDE9FF 50%, #F4F1FF 100%)",
    padding: "100px 0",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(108,63,255,0.3), transparent)",
    },
  },
  aptGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 28,
    [muiTheme.breakpoints.down("md")]: { gridTemplateColumns: "repeat(2, 1fr)" },
    [muiTheme.breakpoints.down("sm")]: { gridTemplateColumns: "1fr" },
  },
  aptCard: {
    borderRadius: 22,
    overflow: "hidden",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(22px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.90)",
    transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
    cursor: "pointer",
    boxShadow: "0 5px 22px rgba(108,63,255,0.12)",
    "&:hover": {
      transform: "translateY(-12px)",
      border: "1px solid rgba(108,63,255,0.30)",
      boxShadow: "0 24px 64px rgba(108,63,255,0.22)",
    },
    "&:hover $aptImg": { transform: "scale(1.08)" },
    "&:hover $aptReserveBtn": {
      background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
      color: "#fff",
      boxShadow: "0 6px 20px rgba(108,63,255,0.42)",
    },
  },
  aptImgWrap: {
    position: "relative",
    height: 260,
    overflow: "hidden",
  },
  aptImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.7s cubic-bezier(.4,0,.2,1)",
  },
  aptImgOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(12,10,20,0.75) 0%, transparent 55%)",
  },
  aptTag: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    color: "#fff",
    padding: "5px 14px",
    borderRadius: 100,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 3px 10px rgba(108,63,255,0.40)",
  },
  aptTagLux: {
    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
    boxShadow: "0 3px 10px rgba(245,158,11,0.40)",
  },
  aptPrice: {
    position: "absolute",
    bottom: 16,
    right: 16,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(108,63,255,0.20)",
    color: "#0C0A14",
    padding: "6px 14px",
    borderRadius: 12,
    fontSize: "0.82rem",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    "& strong": { color: "#6C3FFF", fontSize: "1rem" },
  },
  aptBody: {
    padding: "22px 22px 20px",
    background: "#fff",
  },
  aptTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "1.2rem",
    color: "#0C0A14",
    marginBottom: 6,
  },
  aptLoc: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    color: "#6B5E87",
    fontSize: "0.8rem",
    marginBottom: 14,
    fontFamily: "'Outfit', sans-serif",
    "& svg": { fontSize: 14, color: "#6C3FFF" },
  },
  aptFeatures: {
    display: "flex",
    gap: 16,
    paddingTop: 14,
    borderTop: "1px solid rgba(108,63,255,0.08)",
    marginBottom: 14,
  },
  aptFeature: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: "0.78rem",
    color: "#6B5E87",
    fontFamily: "'Outfit', sans-serif",
    "& svg": { fontSize: 15, color: "#6C3FFF" },
  },
  aptChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 18,
  },
  aptChip: {
    height: 22,
    backgroundColor: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.18)",
    color: "#5929d9",
    borderRadius: 6,
    fontSize: "0.68rem",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    "& .MuiChip-label": { padding: "0 8px" },
  },
  aptActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTop: "1px solid rgba(108,63,255,0.08)",
  },
  aptReserveBtn: {
    borderRadius: 50,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.84rem",
    fontFamily: "'Outfit', sans-serif",
    background: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.25)",
    color: "#6C3FFF",
    padding: "8px 20px",
    transition: "all 0.35s",
    "&:hover": { color: "#fff" },
  },
  aptFavBtn: {
    color: "rgba(107,94,135,0.5)",
    transition: "all 0.3s",
    "&:hover": { color: "#EC4899", transform: "scale(1.2)" },
  },
  aptFavActive: { color: "#EC4899 !important" },
  videoBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(108,63,255,0.85)",
    backdropFilter: "blur(12px)",
    color: "#fff",
    transition: "all 0.3s",
    "&:hover": { transform: "translate(-50%,-50%) scale(1.15)", background: "#6C3FFF" },
    "& svg": { fontSize: 22 },
  },
  viewBtn: {
    position: "absolute",
    bottom: 16,
    left: 16,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(8px)",
    color: "#2D2640",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 8,
    padding: "4px 12px",
    fontSize: "0.7rem",
    fontFamily: "'Outfit', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 4,
    "&:hover": { borderColor: "#6C3FFF", color: "#6C3FFF" },
    "& svg": { fontSize: 13 },
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    flexWrap: "wrap",
    gap: 16,
  },
  searchInput: {
    maxWidth: 380,
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.88)",
      fontFamily: "'Outfit', sans-serif",
      color: "#0C0A14",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF" },
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(108,63,255,0.20)" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF" },
    "& .MuiInputBase-input": { color: "#0C0A14", fontFamily: "'Outfit', sans-serif" },
    "& .MuiInputBase-input::placeholder": { color: "#6B5E87" },
  },
  showAllBtn: {
    background: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.25)",
    color: "#6C3FFF",
    borderRadius: 50,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.85rem",
    fontFamily: "'Outfit', sans-serif",
    padding: "10px 24px",
    transition: "all 0.3s",
    "&:hover": {
      background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 5px 18px rgba(108,63,255,0.38)",
    },
  },

  /* ── ABOUT — oscura como el footer ── */
  aboutSection: {
    background: "linear-gradient(135deg, #0C0A14 0%, #1A0F3A 50%, #0C0A14 100%)",
    padding: "100px 72px",
    position: "relative",
    overflow: "hidden",
    [muiTheme.breakpoints.down("sm")]: { padding: "60px 20px" },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(108,63,255,0.5), transparent)",
    },
  },
  aboutImgWrap: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: -2,
      background: "linear-gradient(135deg, #6C3FFF, #EC4899, #F59E0B)",
      borderRadius: 26,
      zIndex: -1,
    },
    "& img": {
      width: "100%",
      borderRadius: 22,
      display: "block",
      position: "relative",
      zIndex: 1,
    },
  },
  aboutFloatCard: {
    position: "absolute",
    bottom: -20,
    right: -20,
    background: "rgba(12,10,20,0.92)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(108,63,255,0.40)",
    borderRadius: 18,
    padding: "16px 24px",
    animation: "$cardFloat 4s ease-in-out infinite",
    zIndex: 5,
    boxShadow: "0 10px 32px rgba(108,63,255,0.30)",
    "& span": { display: "block" },
    "& .big": {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 900,
      fontSize: "1.8rem",
      background: "linear-gradient(135deg, #C4B5FD, #C040FF)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    "& .small": {
      fontSize: "0.75rem",
      color: "rgba(255,255,255,0.55)",
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
  },
  aboutBody: {
    fontSize: "0.96rem",
    fontWeight: 400,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.8,
    marginBottom: 24,
    fontFamily: "'Outfit', sans-serif",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    "& svg": { color: "#C4B5FD", fontSize: 18 },
    "& span": {
      fontSize: "0.92rem",
      color: "rgba(255,255,255,0.88)",
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 500,
    },
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 28,
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(108,63,255,0.18)",
    border: "1px solid rgba(196,181,253,0.28)",
    borderRadius: 12,
    padding: "8px 16px",
    transition: "all 0.3s",
    "&:hover": { background: "rgba(108,63,255,0.30)", border: "1px solid rgba(196,181,253,0.50)", transform: "translateY(-2px)" },
    "& svg": { fontSize: 16, color: "#C4B5FD" },
    "& span": { fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
  },

  /* ── SERVICES — oscura ── */
  servicesSection: {
    background: "linear-gradient(180deg, #0C0A14 0%, #1A0F3A 100%)",
    padding: "100px 72px",
    position: "relative",
    [muiTheme.breakpoints.down("sm")]: { padding: "60px 20px" },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(192,64,255,0.4), transparent)",
    },
  },
  serviceCard: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(196,181,253,0.18)",
    borderRadius: 22,
    padding: "40px 28px 32px",
    textAlign: "center",
    height: "100%",
    transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 5px 22px rgba(0,0,0,0.20)",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 3,
      background: "linear-gradient(90deg, #6C3FFF, #C040FF)",
      transform: "scaleX(0)",
      transition: "transform 0.4s",
      transformOrigin: "left",
    },
    "&:hover": {
      transform: "translateY(-10px)",
      border: "1px solid rgba(196,181,253,0.40)",
      background: "rgba(108,63,255,0.12)",
      boxShadow: "0 24px 64px rgba(108,63,255,0.30)",
    },
    "&:hover::before": { transform: "scaleX(1)" },
    "&:hover $svcIconWrap": { transform: "rotateY(180deg)" },
  },
  svcIconWrap: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(108,63,255,0.30), rgba(192,64,255,0.20))",
    border: "1.5px solid rgba(196,181,253,0.30)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    transition: "transform 0.6s cubic-bezier(.4,0,.2,1)",
    transformStyle: "preserve-3d",
    "& svg": { fontSize: 30, color: "#C4B5FD" },
  },
  svcTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#fff",
    marginBottom: 10,
  },
  svcText: {
    fontSize: "0.84rem",
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.7,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 400,
  },

  /* ── TESTIMONIALS — lavanda medio ── */
  testimSection: {
    background: "linear-gradient(135deg, #EDE9FF 0%, #E4DEFF 50%, #EDE9FF 100%)",
    padding: "100px 72px",
    position: "relative",
    [muiTheme.breakpoints.down("sm")]: { padding: "60px 20px" },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(108,63,255,0.35), transparent)",
    },
  },
  testimCard: {
    background: "rgba(255,255,255,0.80)",
    backdropFilter: "blur(22px) saturate(180%)",
    border: "1px solid rgba(108,63,255,0.14)",
    borderRadius: 22,
    padding: "32px 28px",
    height: "100%",
    boxShadow: "0 5px 22px rgba(108,63,255,0.10)",
    transition: "all 0.4s",
    "&:hover": {
      transform: "translateY(-8px)",
      border: "1px solid rgba(108,63,255,0.30)",
      boxShadow: "0 24px 60px rgba(108,63,255,0.20)",
    },
  },
  testimQuoteMark: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "4rem",
    lineHeight: 0.7,
    color: "#6C3FFF",
    opacity: 0.45,
    marginBottom: 12,
  },
  testimStars: {
    display: "flex",
    gap: 2,
    marginBottom: 16,
    "& svg": { fontSize: 16, color: "#F59E0B" },
  },
  testimText: {
    fontSize: "0.93rem",
    fontWeight: 400,
    color: "#2D2640",
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1.8,
    fontStyle: "italic",
    marginBottom: 24,
  },
  testimAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    paddingTop: 20,
    borderTop: "1px solid rgba(108,63,255,0.12)",
  },
  testimAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2.5px solid rgba(108,63,255,0.30)",
    boxShadow: "0 4px 14px rgba(108,63,255,0.18)",
  },
  testimName: {
    fontWeight: 700,
    fontSize: "0.92rem",
    color: "#0C0A14",
    fontFamily: "'Outfit', sans-serif",
  },
  testimRole: {
    fontSize: "0.78rem",
    color: "#6B5E87",
    fontFamily: "'Outfit', sans-serif",
  },

  /* ── CTA — mantiene fondo oscuro/foto ── */
  ctaSection: {
    position: "relative",
    padding: "120px 72px",
    textAlign: "center",
    overflow: "hidden",
    [muiTheme.breakpoints.down("sm")]: { padding: "72px 24px" },
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.20,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, rgba(108,63,255,0.88) 0%, rgba(192,64,255,0.80) 100%)",
    },
  },
  ctaContent: {
    position: "relative",
    zIndex: 1,
  },
  ctaTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 900,
    fontSize: "3.5rem",
    color: "#fff",
    marginBottom: 20,
    [muiTheme.breakpoints.down("sm")]: { fontSize: "2.2rem" },
  },
  ctaText: {
    fontSize: "1rem",
    fontWeight: 300,
    color: "rgba(255,255,255,0.88)",
    fontFamily: "'Outfit', sans-serif",
    maxWidth: 560,
    margin: "0 auto 44px",
    lineHeight: 1.7,
  },
  ctaBtn: {
    background: "#fff",
    color: "#6C3FFF",
    padding: "16px 52px",
    borderRadius: 50,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 8px 36px rgba(0,0,0,0.25)",
    transition: "all 0.4s",
    "&:hover": {
      transform: "translateY(-3px) scale(1.04)",
      boxShadow: "0 16px 56px rgba(0,0,0,0.35)",
      background: "#f4f1ff",
    },
  },
  ctaGlow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 0,
    pointerEvents: "none",
  },

  /* ── FOOTER ── */
  footer: {
    background: "#0C0A14",
    padding: "72px 72px 40px",
    position: "relative",
    borderTop: "3px solid #6C3FFF",
    [muiTheme.breakpoints.down("sm")]: { padding: "48px 24px 32px" },
  },
  footerLogoText: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: "1.6rem",
    background: "linear-gradient(135deg, #C4B5FD, #EC4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    marginBottom: 16,
  },
  footerTagline: {
    fontSize: "0.85rem",
    fontWeight: 300,
    color: "rgba(255,255,255,0.50)",
    lineHeight: 1.7,
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 24,
  },
  footerSocials: { display: "flex", gap: 8 },
  footerSocBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(108,63,255,0.35)",
    color: "rgba(255,255,255,0.50)",
    transition: "all 0.3s",
    "&:hover": {
      borderColor: "#C4B5FD",
      color: "#C4B5FD",
      background: "rgba(108,63,255,0.18)",
      transform: "translateY(-2px)",
    },
  },
  footerHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "0.88rem",
    color: "#fff",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    paddingBottom: 12,
    borderBottom: "1px solid rgba(108,63,255,0.25)",
  },
  footerLink: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "rgba(255,255,255,0.50)",
    fontSize: "0.84rem",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 12,
    cursor: "pointer",
    transition: "all 0.25s",
    "&:hover": { color: "#C4B5FD", transform: "translateX(4px)" },
    "& svg": { fontSize: 10, color: "#6C3FFF" },
  },
  footerContact: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    "& svg": { fontSize: 16, color: "#C4B5FD", marginTop: 2 },
    "& span": { fontSize: "0.84rem", color: "rgba(255,255,255,0.50)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 },
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    marginTop: 48,
    paddingTop: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  footerCopy: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.32)",
    fontFamily: "'Outfit', sans-serif",
  },
  footerPolicyLinks: {
    display: "flex",
    gap: 20,
    "& span": {
      fontSize: "0.78rem",
      color: "rgba(255,255,255,0.32)",
      fontFamily: "'Outfit', sans-serif",
      cursor: "pointer",
      transition: "color 0.2s",
      "&:hover": { color: "#C4B5FD" },
    },
  },

  /* ── MODAL — paleta clara como UsuarioList ── */
  modalDialog: {
    "& .MuiDialog-paper": {
      borderRadius: 26,
      background: "rgba(255,255,255,0.98)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(108,63,255,0.18)",
      boxShadow: "0 24px 64px rgba(108,63,255,0.22)",
      overflow: "hidden",
      color: "#0C0A14",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 3,
        background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
        zIndex: 10,
      },
    },
    "& .MuiBackdrop-root": {
      backdropFilter: "blur(8px)",
      background: "rgba(12,10,20,0.55)",
    },
  },
  modalHeader: {
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    padding: "22px 28px",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: -50, right: -50,
      width: 180, height: 180,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.08)",
    },
  },
  modalHeaderTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: "1.25rem",
    color: "#fff",
    lineHeight: 1.2,
  },
  modalHeaderSub: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.78)",
    fontFamily: "'Outfit', sans-serif",
    marginTop: 3,
  },
  modalContent: {
    padding: "24px 28px",
    maxHeight: "66vh",
    overflowY: "auto",
    background: "#fff",
    "&::-webkit-scrollbar": { width: 4 },
    "&::-webkit-scrollbar-thumb": { background: "rgba(108,63,255,0.35)", borderRadius: 2 },
  },
  modalSection: { marginBottom: 24 },
  modalSectionLabel: {
    fontSize: "0.70rem",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#6C3FFF",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: "1.5px solid rgba(108,63,255,0.10)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& div": { width: 5, height: 5, borderRadius: "50%", background: "#6C3FFF" },
  },
  formField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 13,
      backgroundColor: "rgba(244,241,255,0.50)",
      fontFamily: "'Outfit', sans-serif",
      color: "#0C0A14",
      transition: "all 0.3s",
      "&:hover": { backgroundColor: "rgba(244,241,255,0.80)" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6C3FFF", borderWidth: 2 },
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(108,63,255,0.22)" },
    "& .MuiInputLabel-root": { color: "#6B5E87", fontFamily: "'Outfit', sans-serif" },
    "& .MuiInputBase-input": { color: "#0C0A14", fontFamily: "'Outfit', sans-serif" },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { color: "#6C3FFF" },
    "& .MuiFormHelperText-root": { color: "#6B5E87", fontFamily: "'Outfit', sans-serif", fontSize: "0.74rem" },
    "& .MuiFormHelperText-root.Mui-error": { color: "#EF4444" },
  },
  summaryBox: {
    background: "rgba(108,63,255,0.06)",
    border: "1px solid rgba(108,63,255,0.15)",
    borderRadius: 18,
    padding: "20px 22px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(108,63,255,0.07)",
    "&:last-child": { borderBottom: "none", paddingTop: 14 },
  },
  summaryLabel: { fontSize: "0.84rem", color: "#6B5E87", fontFamily: "'Outfit', sans-serif" },
  summaryValue: { fontSize: "0.84rem", color: "#0C0A14", fontWeight: 700, fontFamily: "'Outfit', sans-serif" },
  summaryTotal: {
    fontSize: "1rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontFamily: "'Outfit', sans-serif",
  },
  paymentBox: {
    background: "rgba(108,63,255,0.06)",
    border: "1px solid rgba(108,63,255,0.18)",
    borderRadius: 14,
    padding: "18px 20px",
    borderLeft: "3px solid #6C3FFF",
  },
  paymentBoxTitle: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#6C3FFF",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
    "& svg": { fontSize: 16 },
  },
  paymentBoxText: {
    fontSize: "0.84rem",
    color: "#2D2640",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 5,
    lineHeight: 1.6,
    fontWeight: 400,
  },
  uploadBtn: {
    background: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.25)",
    color: "#6C3FFF",
    borderRadius: 50,
    textTransform: "none",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.84rem",
    fontWeight: 700,
    padding: "10px 22px",
    transition: "all 0.3s",
    "&:hover": {
      background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 5px 18px rgba(108,63,255,0.38)",
    },
  },
  fileInput: { display: "none" },
  filePreview: {
    maxWidth: "100%",
    maxHeight: 100,
    borderRadius: 10,
    border: "1px solid rgba(108,63,255,0.22)",
    marginTop: 10,
  },
  fileName: {
    fontSize: "0.75rem",
    color: "#6B5E87",
    fontFamily: "'Outfit', sans-serif",
    marginTop: 6,
  },
  acompSection: {
    background: "rgba(244,241,255,0.50)",
    border: "1px solid rgba(108,63,255,0.14)",
    borderRadius: 16,
    padding: "20px",
  },
  acompSub: {
    fontSize: "0.80rem",
    color: "#6B5E87",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 16,
    fontWeight: 500,
  },
  acompCard: {
    background: "rgba(255,255,255,0.90)",
    border: "1px solid rgba(108,63,255,0.14)",
    borderRadius: 14,
    padding: "16px",
    marginBottom: 12,
    position: "relative",
    boxShadow: "0 2px 10px rgba(108,63,255,0.07)",
  },
  acompCardTitle: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color: "#6C3FFF",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 12,
  },
  addAcompBtn: {
    background: "rgba(108,63,255,0.10)",
    border: "1px solid rgba(108,63,255,0.22)",
    color: "#6C3FFF",
    borderRadius: 50,
    textTransform: "none",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.82rem",
    fontWeight: 700,
    padding: "8px 18px",
    transition: "all 0.3s",
    "&:hover": { background: "rgba(108,63,255,0.18)", transform: "translateY(-1px)" },
    "&:disabled": { opacity: 0.4 },
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    minWidth: "auto",
    width: 28,
    height: 28,
    padding: 0,
    color: "rgba(107,94,135,0.5)",
    "&:hover": { color: "#EF4444" },
  },
  modalActions: {
    padding: "14px 28px 22px",
    display: "flex",
    gap: 12,
    borderTop: "1px solid rgba(108,63,255,0.10)",
    background: "#fff",
  },
  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1.5px solid rgba(108,63,255,0.22)",
    color: "#6B5E87",
    borderRadius: 50,
    textTransform: "none",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    "&:hover": { borderColor: "#6C3FFF", color: "#6C3FFF", background: "rgba(108,63,255,0.06)" },
  },
  confirmBtn: {
    flex: 2,
    background: "linear-gradient(135deg, #6C3FFF, #C040FF)",
    color: "#fff",
    borderRadius: 50,
    textTransform: "none",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "0.90rem",
    letterSpacing: "0.04em",
    boxShadow: "0 5px 18px rgba(108,63,255,0.40)",
    transition: "all 0.35s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 9px 26px rgba(108,63,255,0.55)",
    },
    "&:disabled": { opacity: 0.4 },
  },
}))
/* ═══════════════════════════════════════════════════════════════════════════ */
function Landing() {
  const history = useHistory()
  const classes = useStyles()
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"))
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  /* ── STATE (unchanged) ── */
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const [apartamentos, setApartamentos] = useState([])
  const [filteredApartamentos, setFilteredApartamentos] = useState([])
  const [showAllApartments, setShowAllApartments] = useState(false)
  const [allApartamentos, setAllApartamentos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false)
  const [selectedApartamento, setSelectedApartamento] = useState(null)
  const [reservedDates, setReservedDates] = useState({})
  const [reservationForm, setReservationForm] = useState({
    documento: "", titular_reserva: "", email: "", telefono: "",
    fecha_inicio: "", fecha_fin: "", apartamentos: [],
    noches_estadia: 1, total: 0, monto_pago: 0, acompanantes: [],
  })
  const [formErrors, setFormErrors] = useState({
    titular_reserva: "", email: "", telefono: "",
    fecha_inicio: "", fecha_fin: "", monto_pago: "", documento: "",
  })
  const [comprobantePago, setComprobantePago] = useState(null)
  const [comprobantePreview, setComprobantePreview] = useState("")
  const [favorites, setFavorites] = useState([])
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const apartamentosRef = useRef(null)
  const aboutRef = useRef(null)
  const featuresRef = useRef(null)
  const contactRef = useRef(null)

  /* ── PARTICLE CANVAS (unchanged) ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -Math.random() * 0.8 - 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 270 : 310,
    }))

    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`
        ctx.fill()
        p.x += p.speedX
        p.y += p.speedY
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10 || p.x > canvas.width + 10) p.x = Math.random() * canvas.width
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener("resize", handleResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize) }
  }, [])

  /* ── ALL BUSINESS LOGIC UNCHANGED ── */
  const fetchReservedDates = async (aptId) => {
    try {
      const res = await apiCall(API_ENDPOINTS.fechasReservadas(aptId))
      if (res.data?.fechasReservadas) {
        setReservedDates((prev) => ({ ...prev, [aptId]: res.data.fechasReservadas }))
        return res.data.fechasReservadas
      }
      return []
    } catch { return [] }
  }

  const isDateReserved = (date) => {
    if (!selectedApartamento || !reservedDates[selectedApartamento.id]) return false
    const dateStr = typeof date === "string" ? date : date.toISOString().split("T")[0]
    return reservedDates[selectedApartamento.id].some((rd) => {
      if (rd.fecha_inicio && rd.fecha_fin) {
        return new Date(dateStr) >= new Date(rd.fecha_inicio) && new Date(dateStr) <= new Date(rd.fecha_fin)
      }
      return rd === dateStr
    })
  }

  useEffect(() => {
    const fetchApartamentos = async () => {
      try {
        try {
          const r = await apiCall(API_ENDPOINTS.apartamentosDestacados)
          if (r.data?.length > 0) {
            setAllApartamentos(r.data); const lim = r.data.slice(0, 6)
            setApartamentos(lim); setFilteredApartamentos(lim); return
          }
        } catch {}
        try {
          const r = await apiCall(API_ENDPOINTS.apartamentos)
          if (r.data?.length > 0) {
            const fmt = r.data.map((apt) => ({
              _id: apt._id, id: apt._id,
              nombre: `Apartamento ${apt.NumeroApto} - ${apt.Tipo}`,
              tipo: apt.Tipo, ubicacion: "El Poblado, Medellín", precio: apt.Tarifa,
              capacidad: 4, camas: 2, banos: 1, tamano: 75,
              caracteristicas: ["Balcón", "Vista ciudad", "Cocina equipada", "WiFi"],
              imagen: apt.Tipo === "Penthouse"
                ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                : apt.Tipo === "Tipo 2"
                ? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
                : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
              estado: apt.Estado ? "disponible" : "no disponible", disponible: apt.Estado,
              tag: apt.Tipo === "Penthouse" ? "Lujo" : apt.Tipo === "Tipo 2" ? "Familiar" : "Popular",
            }))
            setAllApartamentos(fmt); const lim = fmt.slice(0, 6)
            setApartamentos(lim); setFilteredApartamentos(lim); return
          }
        } catch {}
        setAllApartamentos(apartamentosEjemplo)
        setApartamentos(apartamentosEjemplo.slice(0, 6))
        setFilteredApartamentos(apartamentosEjemplo.slice(0, 6))
      } catch {
        setApartamentos(apartamentosEjemplo.slice(0, 6))
        setFilteredApartamentos(apartamentosEjemplo.slice(0, 6))
      }
    }
    fetchApartamentos()
    document.body.style.overflow = "auto"
    const img = new Image()
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
    img.onload = () => setLogoLoaded(true); img.onerror = () => setLogoLoaded(true)
    heroImages.forEach((src) => { const i = new Image(); i.src = src })
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    const interval = setInterval(() => setCurrentHeroSlide((p) => (p + 1) % heroImages.length), 5500)
    return () => { clearInterval(interval); window.removeEventListener("scroll", onScroll) }
  }, [])

  useEffect(() => {
    const base = [...apartamentos]
    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      setFilteredApartamentos(base.filter((a) =>
        a.nombre.toLowerCase().includes(t) || a.tipo.toLowerCase().includes(t) ||
        a.caracteristicas?.some((c) => c.toLowerCase().includes(t))
      ))
    } else setFilteredApartamentos(base)
  }, [searchTerm, apartamentos])

  const toggleShowAllApartments = () => {
    if (showAllApartments) {
      const lim = allApartamentos.slice(0, 6)
      setApartamentos(lim); setFilteredApartamentos(lim)
    } else {
      setApartamentos(allApartamentos); setFilteredApartamentos(allApartamentos)
    }
    setShowAllApartments(!showAllApartments)
  }

  const handleReservationOpen = async (apt) => {
    setSelectedApartamento(apt); setReservationDialogOpen(true)
    const today = new Date().toISOString().split("T")[0]
    setReservationForm({
      titular_reserva: "", email: "", telefono: "", fecha_inicio: today,
      fecha_fin: "", apartamentos: apt ? [apt.id] : [],
      noches_estadia: 1, total: apt ? apt.precio : 0,
      monto_pago: apt ? apt.precio * 0.5 : 0, acompanantes: [], documento: "",
    })
    setFormErrors({ titular_reserva: "", email: "", telefono: "", fecha_inicio: "", fecha_fin: "", monto_pago: "", documento: "" })
    setComprobantePago(null); setComprobantePreview("")
    if (apt?.id) await fetchReservedDates(apt.id)
  }

  const validateField = (name, value) => {
    let e = ""
    switch (name) {
      case "titular_reserva":
        if (!value || value.trim() === "") e = "El nombre es obligatorio"
        else if (value.length < 3) e = "Al menos 3 caracteres"
        else if (value.length > 50) e = "Máximo 50 caracteres"
        else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) e = "Solo letras y espacios"
        break
      case "email":
        if (!value) e = "El correo es obligatorio"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) e = "Correo inválido"
        break
      case "telefono":
        if (!value) e = "El teléfono es obligatorio"
        else if (!/^\+?[0-9]{8,15}$/.test(value)) e = "Número inválido (8-15 dígitos)"
        break
      case "fecha_inicio":
        const td = new Date(); td.setHours(0,0,0,0)
        if (!value) e = "Fecha de entrada obligatoria"
        else if (new Date(value) < td) e = "Debe ser hoy o posterior"
        break
      case "fecha_fin":
        if (!value) e = "Fecha de salida obligatoria"
        else if (reservationForm.fecha_inicio && new Date(value) <= new Date(reservationForm.fecha_inicio)) e = "Debe ser posterior a la entrada"
        break
      case "monto_pago":
        const total = calcularPrecioTotal()
        if (!value) e = "Monto obligatorio"
        else if (Number(value) < total * 0.5) e = `Mínimo 50%: $${(total*0.5).toFixed(0)}`
        else if (Number(value) > total) e = "No puede superar el total"
        break
      case "documento":
        if (!value) e = "El documento es obligatorio"
        else if (!/^\d{6,12}$/.test(value)) e = "6 a 12 dígitos"
        else if (value.startsWith("0")) e = "No puede empezar con 0"
        break
      default: break
    }
    return e
  }

  const handleReservationFormChange = (event) => {
    const { name, value } = event.target
    if ((name === "fecha_inicio" || name === "fecha_fin") && isDateReserved(value)) {
      Swal.fire({ title: "Fecha no disponible", text: "Esta fecha ya está reservada.", icon: "error", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 })
      return
    }
    setReservationForm((p) => ({ ...p, [name]: value }))
    const err = validateField(name, value)
    setFormErrors((p) => ({ ...p, [name]: err }))
    if (err && (name === "fecha_inicio" || name === "fecha_fin"))
      Swal.fire({ title: "Error", text: err, icon: "error", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 })
  }

  const handleLogin = () => history.push("/login")

  const handleReservationSubmit = async () => {
    const newErrors = Object.fromEntries(
      ["titular_reserva","email","telefono","fecha_inicio","fecha_fin","monto_pago","documento"]
        .map((k) => [k, validateField(k, reservationForm[k])])
    )
    setFormErrors(newErrors)
    if (Object.values(newErrors).some((e) => e !== "")) {
      Swal.fire({ title: "Formulario incompleto", text: "Corrija los errores antes de continuar", icon: "warning", toast: true, position: "top", showConfirmButton: false, timer: 3500, timerProgressBar: true, background: "#fff", color: "#0C0A14" }); return
    }
    if (!comprobantePago) {
      Swal.fire({ title: "Comprobante requerido", text: "Suba el comprobante de pago para continuar", icon: "warning", toast: true, position: "top", showConfirmButton: false, timer: 3500, timerProgressBar: true, background: "#fff", color: "#0C0A14" }); return
    }
    setLoading(true)
    try {
      const data = {
        titular_reserva: reservationForm.titular_reserva, email: reservationForm.email,
        telefono: reservationForm.telefono, fecha_inicio: reservationForm.fecha_inicio,
        fecha_fin: reservationForm.fecha_fin, apartamento_id: selectedApartamento.id,
        huespedes: reservationForm.acompanantes.length + 1, documento: reservationForm.documento,
        monto_pago: reservationForm.monto_pago,
        acompanantes: reservationForm.acompanantes.map((a) => ({ nombre: a.nombre, apellido: a.apellido, documento: a.documento_acompanante })),
      }
      const res = await axios.post(API_ENDPOINTS.reservasPublica, data)
      Swal.fire({
        title: res.data.clienteExistente ? "Cliente ya registrado" : "¡Reserva realizada!",
        text: res.data.clienteExistente ? "Hemos encontrado tus datos. Reserva registrada." : "Hemos recibido tu reserva. Te enviaremos un correo.",
        icon: res.data.clienteExistente ? "info" : "success",
        confirmButtonText: "¡Perfecto!",
        background: "#fff",
        color: "#0C0A14",
        confirmButtonColor: "#6C3FFF",
        customClass: { popup: "swal-landing-popup", confirmButton: "swal-landing-btn" },
        buttonsStyling: true,
      })
      setReservationDialogOpen(false)
      setReservationForm({ titular_reserva: "", email: "", telefono: "", fecha_inicio: "", fecha_fin: "", apartamentos: [], noches_estadia: 1, total: 0, monto_pago: 0, acompanantes: [], documento: "" })
      setComprobantePago(null); setComprobantePreview("")
    } catch (err) {
      let msg = "Error al procesar la reserva."
      if (err.response?.data?.msg || err.response?.data?.message) msg = err.response.data.msg || err.response.data.message
      Swal.fire({ title: "Error", text: msg, icon: "error", confirmButtonText: "Entendido", background: "#fff", color: "#0C0A14", confirmButtonColor: "#6C3FFF", buttonsStyling: true })
    } finally { setLoading(false) }
  }

  const calcularNochesEstadia = () => {
    if (!reservationForm.fecha_inicio || !reservationForm.fecha_fin) return 1
    const diff = Math.ceil(Math.abs(new Date(reservationForm.fecha_fin) - new Date(reservationForm.fecha_inicio)) / 86400000)
    return diff > 0 ? diff : 1
  }
  const calcularPrecioTotal = () => {
    if (!selectedApartamento || !reservationForm.fecha_inicio || !reservationForm.fecha_fin) return 0
    return selectedApartamento.precio * calcularNochesEstadia()
  }
  const handleFavoriteToggle = (id) =>
    setFavorites((p) => p.includes(id) ? p.filter((f) => f !== id) : [...p, id])
  const scrollToSection = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" })
  const renderStars = (n) => Array(5).fill(0).map((_, i) => <Star key={i} style={{ color: i < n ? "#F59E0B" : "rgba(255,255,255,0.2)", fontSize: 16 }} />)

  const handleComprobanteChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setComprobantePago(file)
      const reader = new FileReader()
      reader.onload = () => setComprobantePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAddAcompanante = () => {
    if (selectedApartamento && reservationForm.acompanantes.length >= selectedApartamento.capacidad - 1) {
      Swal.fire({ title: "Límite", text: `Capacidad máx: ${selectedApartamento.capacidad} personas.`, icon: "warning", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 }); return
    }
    setReservationForm((p) => ({ ...p, acompanantes: [...p.acompanantes, { nombre: "", apellido: "", documento_acompanante: "" }] }))
  }
  const handleRemoveAcompanante = (i) => {
    const a = [...reservationForm.acompanantes]; a.splice(i, 1)
    setReservationForm((p) => ({ ...p, acompanantes: a }))
  }
  const handleAcompananteChange = (i, field, value) => {
    const a = [...reservationForm.acompanantes]; a[i] = { ...a[i], [field]: value }
    setReservationForm((p) => ({ ...p, acompanantes: a }))
  }

  /* ═══════════════ RENDER ═══════════════════════════════════════════════ */
  return (
    <div className={classes.root}>
      <canvas ref={canvasRef} className={classes.particleCanvas} />

      {/* ── NAVBAR ── */}
      <AppBar position="fixed" className={`${classes.appBar} ${scrolled ? classes.appBarScrolled : ""}`}>
        <Toolbar className={classes.toolbar}>
          {/* ── LOGO: solo imagen, sin texto duplicado ── */}
          <div className={classes.logoWrap} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {logoLoaded && (
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
                alt="Nido Sky"
                style={{ height: 44, filter: "drop-shadow(0 0 10px rgba(196,181,253,0.8))" }}
              />
            )}
          </div>
          <div className={classes.navLinks}>
            {[
              { label: "Inicio", fn: () => window.scrollTo({ top: 0, behavior: "smooth" }), active: true },
              { label: "Apartamentos", fn: () => scrollToSection(apartamentosRef) },
              { label: "Nosotros", fn: () => scrollToSection(aboutRef) },
              { label: "Servicios", fn: () => scrollToSection(featuresRef) },
              { label: "Contacto", fn: () => scrollToSection(contactRef) },
            ].map((n) => (
              <Button key={n.label} className={`${classes.navLink} ${n.active ? classes.activeNavLink : ""}`} onClick={n.fn}>{n.label}</Button>
            ))}
            <Button className={classes.loginButton} onClick={handleLogin}>Iniciar Sesión</Button>
          </div>
          <IconButton className={classes.menuButton} onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
        </Toolbar>
      </AppBar>

      {/* ── DRAWER ── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} className={classes.drawer}>
        <div className={classes.drawerHeader}>
          <span className={classes.drawerLogoText}>Nido Sky</span>
          <IconButton style={{ color: "#C4B5FD" }} onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </div>
        <List>
          {[
            { label: "Inicio", fn: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
            { label: "Apartamentos", fn: () => scrollToSection(apartamentosRef) },
            { label: "Nosotros", fn: () => scrollToSection(aboutRef) },
            { label: "Servicios", fn: () => scrollToSection(featuresRef) },
            { label: "Contacto", fn: () => scrollToSection(contactRef) },
          ].map((item) => (
            <ListItem button key={item.label} className={classes.drawerItem} onClick={() => { item.fn(); setDrawerOpen(false) }}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Divider style={{ backgroundColor: "rgba(196,181,253,0.2)" }} />
        <Button className={classes.drawerLoginBtn} onClick={handleLogin}>Iniciar Sesión</Button>
      </Drawer>

      {/* ── HERO ── */}
      <section className={classes.heroSection}>
        {heroImages.map((img, i) => (
          <div key={i} className={classes.heroBg} style={{ backgroundImage: `url(${img})`, opacity: currentHeroSlide === i ? 1 : 0 }} />
        ))}
        <div className={classes.heroGlowOrb1} />
        <div className={classes.heroGlowOrb2} />

        <div className={classes.heroContent}>
          <div className={classes.heroBadge}>
            <LocationOn /><span>El Poblado · Medellín · Colombia</span>
          </div>
          <Typography className={classes.heroTitle}>
            Tu hogar en<br /><em>las alturas</em>
          </Typography>
          <Typography className={classes.heroSub}>
            Apartamentos de lujo con vistas privilegiadas en el corazón de El Poblado. Donde cada amanecer es una obra de arte.
          </Typography>
          <div className={classes.heroButtons}>
            <Button className={classes.heroPrimBtn} onClick={() => scrollToSection(apartamentosRef)}>
              Explorar apartamentos ✦
            </Button>
            <Button className={classes.heroSecBtn} onClick={() => scrollToSection(aboutRef)}>
              Conocer más
            </Button>
          </div>
        </div>

        <div className={classes.heroDots}>
          {heroImages.map((_, i) => (
            <div key={i} className={`${classes.heroDot} ${i === currentHeroSlide ? classes.heroDotActive : ""}`} onClick={() => setCurrentHeroSlide(i)} />
          ))}
        </div>
        <div className={classes.heroNavBtns}>
          <IconButton className={classes.heroNavBtn} onClick={() => setCurrentHeroSlide((p) => (p - 1 + heroImages.length) % heroImages.length)}><ChevronLeft /></IconButton>
          <IconButton className={classes.heroNavBtn} onClick={() => setCurrentHeroSlide((p) => (p + 1) % heroImages.length)}><ChevronRight /></IconButton>
        </div>
      </section>

      {/* ── BOOKING BAR ── */}
      <div className={classes.bookingWrap}>
        <div className={classes.bookingBar}>
          <Typography className={classes.bookingLabel}>Reservar</Typography>
          <TextField className={classes.bookingInput} label="Fecha entrada" type="date" variant="outlined" size="small"
            InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split("T")[0] }}
            value={reservationForm.fecha_inicio}
            onChange={(e) => {
              if (e.target.value < new Date().toISOString().split("T")[0]) {
                Swal.fire({ title: "Fecha inválida", text: "Debe ser hoy o posterior", icon: "warning", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 }); return
              }
              setReservationForm((p) => ({ ...p, fecha_inicio: e.target.value }))
            }} />
          <TextField className={classes.bookingInput} label="Fecha salida" type="date" variant="outlined" size="small"
            InputLabelProps={{ shrink: true }} inputProps={{ min: reservationForm.fecha_inicio || new Date().toISOString().split("T")[0] }}
            value={reservationForm.fecha_fin}
            onChange={(e) => {
              if (reservationForm.fecha_inicio && e.target.value <= reservationForm.fecha_inicio) {
                Swal.fire({ title: "Fecha inválida", text: "Debe ser posterior a la entrada", icon: "warning", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 }); return
              }
              setReservationForm((p) => ({ ...p, fecha_fin: e.target.value }))
            }} />
          <TextField className={classes.bookingInput} label="Huéspedes" type="number" variant="outlined" size="small"
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            value={reservationForm.acompanantes.length + 1}
            onChange={(e) => {
              const n = parseInt(e.target.value) - 1; if (n < 0) return
              let a = [...reservationForm.acompanantes]
              if (n < a.length) a = a.slice(0, n); else while (a.length < n) a.push({ nombre: "", apellido: "", documento: "" })
              setReservationForm((p) => ({ ...p, acompanantes: a }))
            }} />
          <Button className={classes.bookingSubmit} onClick={() => scrollToSection(apartamentosRef)}>
            <Search style={{ marginRight: 8, fontSize: 18 }} /> Buscar
          </Button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className={classes.statsWrap}>
        {[
          { num: "150+", label: "Apartamentos" },
          { num: "8K+", label: "Huéspedes satisfechos" },
          { num: "12", label: "Años de experiencia" },
          { num: "4.9★", label: "Calificación" },
        ].map((s) => (
          <div key={s.label} className={classes.statItem}>
            <span className={classes.statNum}>{s.num}</span>
            <span className={classes.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── APARTMENTS ── */}
      <section className={classes.aptSection} ref={apartamentosRef}>
        <div className={classes.sxWrap}>
          <div className={classes.sxBadge}><div /><span>Alojamiento exclusivo</span></div>
          <div className={classes.filterRow}>
            <div>
              <Typography className={classes.sxTitle}>Nuestros Apartamentos</Typography>
              <Typography className={classes.sxSub} style={{ marginBottom: 0 }}>
                Espacios diseñados para vivir experiencias únicas en Medellín.
              </Typography>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <TextField className={classes.searchInput} variant="outlined" size="small"
                placeholder="Buscar por tipo o característica..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search style={{ color: "rgba(196,181,253,0.7)", marginRight: 8, fontSize: 18 }} /> }} />
              <Button className={classes.showAllBtn} onClick={toggleShowAllApartments}>
                {showAllApartments ? "Ver menos" : "Ver todos"}
              </Button>
            </div>
          </div>

          <div className={classes.aptGrid}>
            {filteredApartamentos.length > 0 ? filteredApartamentos.map((apt) => (
              <Zoom in timeout={400} key={apt.id}>
                <div className={classes.aptCard}>
                  <div className={classes.aptImgWrap}>
                    <img className={classes.aptImg} src={apt.imagen || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                      alt={apt.nombre}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" }}
                      data-apartment-type={apt.tipo} data-apartment-tag={apt.tag} />
                    <div className={classes.aptImgOverlay} />
                    <div className={`${classes.aptTag} ${apt.tipo === "Penthouse" ? classes.aptTagLux : ""}`}>{apt.tag || apt.tipo}</div>
                    <div className={classes.aptPrice}><strong>${apt.precio}</strong> / noche</div>
                    <IconButton className={classes.videoBtn}><PlayArrow /></IconButton>
                    <Button className={classes.viewBtn} startIcon={<Visibility />}>Tour 360°</Button>
                  </div>
                  <div className={classes.aptBody}>
                    <Typography className={classes.aptTitle}>{apt.nombre}</Typography>
                    <div className={classes.aptLoc}><LocationOn /><span>{apt.ubicacion}</span></div>
                    <div className={classes.aptFeatures}>
                      <div className={classes.aptFeature}><Person /><span>{apt.capacidad} huésp.</span></div>
                      <div className={classes.aptFeature}><LocalHotel /><span>{apt.camas} cama{apt.camas > 1 ? "s" : ""}</span></div>
                      <div className={classes.aptFeature}><Bathtub /><span>{apt.banos} baño{apt.banos > 1 ? "s" : ""}</span></div>
                    </div>
                    <div className={classes.aptChips}>
                      {apt.caracteristicas?.slice(0, 3).map((c, i) => <Chip key={i} label={c} size="small" className={classes.aptChip} />)}
                    </div>
                    <div className={classes.aptActions}>
                      <Button className={classes.aptReserveBtn} onClick={() => handleReservationOpen(apt)}>
                        Reservar ahora
                      </Button>
                      <IconButton className={`${classes.aptFavBtn} ${favorites.includes(apt.id) ? classes.aptFavActive : ""}`}
                        onClick={() => handleFavoriteToggle(apt.id)}>
                        {favorites.includes(apt.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Zoom>
            )) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0" }}>
                <Typography style={{ color: "#6B5E87", fontFamily: "'Outfit', sans-serif", fontSize: "1rem" }}>
                  No se encontraron apartamentos con esos criterios.
                </Typography>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className={classes.aboutSection} ref={aboutRef}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={5}>
              <div className={classes.aboutImgWrap}>
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" alt="Nido Sky lobby"
                  style={{ width: "100%", borderRadius: 22, display: "block", filter: "brightness(0.92)" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" }} />
                <div className={classes.aboutFloatCard}>
                  <span className="big">12+</span>
                  <span className="small">Años de excelencia</span>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={7}>
              <div className={classes.sxBadge} style={{ backgroundColor:"rgba(196,181,253,0.15)", borderColor:"rgba(196,181,253,0.35)" }}>
                <div style={{ backgroundColor:"#C4B5FD" }}/><span style={{ color:"#C4B5FD" }}>Nuestra historia</span>
              </div>
              <Typography className={classes.sxTitle} style={{ color:"#fff" }}>
                El arte de vivir<br />en las alturas
              </Typography>
              <Typography className={classes.aboutBody}>
                Nido Sky nació con la visión de crear un espacio donde el lujo y la autenticidad colombiana coexisten en perfecta armonía. Ubicados en El Poblado, ofrecemos apartamentos de alto estándar con vistas privilegiadas y servicios de talla mundial.
              </Typography>
              <Typography className={classes.aboutBody}>
                Cada detalle ha sido cuidadosamente diseñado para convertir tu estadía en una experiencia sensorial única, donde el confort se convierte en arte y cada momento en un recuerdo imborrable.
              </Typography>
              {[
                "Ubicación privilegiada en El Poblado, Medellín",
                "Servicio personalizado disponible 24 horas",
                "Apartamentos modernos con acabados premium",
                "Gastronomía gourmet con ingredientes locales",
              ].map((t) => (
                <div key={t} className={classes.checkRow}>
                  <CheckCircle fontSize="small" />
                  <span>{t}</span>
                </div>
              ))}
              <div className={classes.pillRow}>
                {[
                  { icon: <Pool />, label: "Piscina" },
                  { icon: <Wifi />, label: "WiFi 1 Gbps" },
                  { icon: <Spa />, label: "Spa & Wellness" },
                  { icon: <FitnessCenter />, label: "Gimnasio" },
                  { icon: <Restaurant />, label: "Restaurante" },
                ].map((p) => (
                  <div key={p.label} className={classes.pill}>{p.icon}<span>{p.label}</span></div>
                ))}
              </div>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className={classes.servicesSection} ref={featuresRef}>
        <div className={classes.sxWrap}>
          <div style={{ textAlign: "center" }}>
            <div className={classes.sxBadge} style={{ justifyContent:"center", backgroundColor:"rgba(196,181,253,0.15)", borderColor:"rgba(196,181,253,0.35)" }}>
              <div style={{ backgroundColor:"#C4B5FD" }}/><span style={{ color:"#C4B5FD" }}>Lo que ofrecemos</span>
            </div>
            <Typography className={classes.sxTitle} style={{ textAlign: "center", color:"#fff" }}>Servicios & Comodidades</Typography>
            <Typography className={classes.sxSub} style={{ textAlign: "center", margin: "0 auto 56px", color:"rgba(255,255,255,0.62)" }}>
              Todo lo que necesitas para una estadía perfecta con los más altos estándares de calidad.
            </Typography>
          </div>
          <Grid container spacing={3}>
            {[
              { icon: <Pool />, title: "Piscina Infinity", text: "Piscina con vista panorámica a la ciudad de Medellín, disponible todo el año." },
              { icon: <Wifi />, title: "WiFi Ultra Rápido", text: "Fibra óptica de 1 Gbps en todas las áreas comunes y apartamentos." },
              { icon: <Restaurant />, title: "Restaurante Gourmet", text: "Propuestas gastronómicas de autor con ingredientes locales selectos." },
              { icon: <Spa />, title: "Spa & Bienestar", text: "Tratamientos exclusivos y terapias de relajación profunda." },
              { icon: <AcUnit />, title: "Clima Controlado", text: "Sistema de climatización de última generación en todos los espacios." },
              { icon: <FitnessCenter />, title: "Gimnasio Premium", text: "Equipamiento de alta gama para mantener tu rutina activa." },
              { icon: <LocalBar />, title: "Bar Sky Lounge", text: "Cócteles de autor con las mejores vistas de Medellín al atardecer." },
              { icon: <Security />, title: "Seguridad 24/7", text: "Vigilancia permanente y sistema biométrico para tu tranquilidad." },
            ].map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.title}>
                <div className={classes.serviceCard}>
                  <div className={classes.svcIconWrap}>{React.cloneElement(s.icon, { style: { fontSize: 30, color: "#C4B5FD" } })}</div>
                  <Typography className={classes.svcTitle}>{s.title}</Typography>
                  <Typography className={classes.svcText}>{s.text}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={classes.testimSection}>
        <div className={classes.sxWrap}>
          <div style={{ textAlign: "center" }}>
            <div className={classes.sxBadge} style={{ justifyContent: "center" }}><div /><span>Opiniones reales</span></div>
            <Typography className={classes.sxTitle} style={{ textAlign: "center" }}>Lo que dicen nuestros huéspedes</Typography>
            <Typography className={classes.sxSub} style={{ textAlign: "center", margin: "0 auto 56px" }}>
              Experiencias auténticas de quienes ya vivieron la magia de Nido Sky.
            </Typography>
          </div>
          <Grid container spacing={4}>
            {testimoniosEjemplo.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <div className={classes.testimCard}>
                  <div className={classes.testimQuoteMark}>"</div>
                  <div className={classes.testimStars}>{renderStars(t.rating)}</div>
                  <Typography className={classes.testimText}>{t.comentario}</Typography>
                  <div className={classes.testimAuthor}>
                    <img src={t.avatar} alt={t.nombre} className={classes.testimAvatar}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/52" }} />
                    <div>
                      <div className={classes.testimName}>{t.nombre}</div>
                      <div className={classes.testimRole}>{t.rol}</div>
                    </div>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={classes.ctaSection}>
        <div className={classes.ctaGlow} />
        <div className={classes.ctaContent}>
          <div className={classes.sxBadge} style={{ justifyContent: "center" }}><div /><span>Oferta especial · 10% descuento</span></div>
          <Typography className={classes.ctaTitle}>
            ¿Listo para vivir la<br />experiencia Nido Sky?
          </Typography>
          <Typography className={classes.ctaText}>
            Reserve ahora y disfrute de un 10% de descuento en su primera estadía. Disponibilidad limitada — no espere más.
          </Typography>
          <Button className={classes.ctaBtn} onClick={() => scrollToSection(apartamentosRef)}>
            Reservar ahora &nbsp; <ArrowForward style={{ fontSize: 20 }} />
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={classes.footer} ref={contactRef}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <span className={classes.footerLogoText}>Nido Sky</span>
              <Typography className={classes.footerTagline}>
                Apartamentos de lujo en El Poblado, Medellín. Donde el confort se convierte en arte y cada estadía es un recuerdo imborrable.
              </Typography>
              <div className={classes.footerSocials}>
                <IconButton className={classes.footerSocBtn} size="small"><Facebook fontSize="small" /></IconButton>
                <IconButton className={classes.footerSocBtn} size="small"><Instagram fontSize="small" /></IconButton>
                <IconButton className={classes.footerSocBtn} size="small"><Twitter fontSize="small" /></IconButton>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography className={classes.footerHeading}>Navegación</Typography>
              {[
                { label: "Inicio", fn: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                { label: "Apartamentos", fn: () => scrollToSection(apartamentosRef) },
                { label: "Nosotros", fn: () => scrollToSection(aboutRef) },
                { label: "Servicios", fn: () => scrollToSection(featuresRef) },
                { label: "Contacto", fn: () => scrollToSection(contactRef) },
              ].map((l) => (
                <div key={l.label} className={classes.footerLink} onClick={l.fn}><ArrowForward style={{ fontSize: 10 }} />{l.label}</div>
              ))}
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography className={classes.footerHeading}>Servicios</Typography>
              {["Reservas", "Concierge", "Spa & Wellness", "Restaurante", "Traslados"].map((s) => (
                <div key={s} className={classes.footerLink}><ArrowForward style={{ fontSize: 10 }} />{s}</div>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography className={classes.footerHeading}>Contacto</Typography>
              <div className={classes.footerContact}><Room /><span>Calle 10 #43E-25, El Poblado, Medellín</span></div>
              <div className={classes.footerContact}><Phone /><span>+57 (4) 444-5555</span></div>
              <div className={classes.footerContact}><Email /><span>info@nidosky.com</span></div>
            </Grid>
          </Grid>
          <div className={classes.footerBottom}>
            <Typography className={classes.footerCopy}>© 2024 Nido Sky · Todos los derechos reservados.</Typography>
            <div className={classes.footerPolicyLinks}>
              <span>Privacidad</span><span>Términos</span><span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── RESERVATION DIALOG ── */}
      <Dialog open={reservationDialogOpen} onClose={() => setReservationDialogOpen(false)}
        maxWidth="md" fullWidth className={classes.modalDialog} keepMounted disableEnforceFocus disableAutoFocus>
        <div className={classes.modalHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Typography className={classes.modalHeaderTitle}>{selectedApartamento?.nombre}</Typography>
              <Typography className={classes.modalHeaderSub}>Complete sus datos para confirmar la reserva</Typography>
            </div>
            <IconButton style={{ color: "rgba(255,255,255,0.7)", marginTop: -4 }} onClick={() => setReservationDialogOpen(false)}><Close /></IconButton>
          </div>
        </div>

        <div className={classes.modalContent}>
          {/* Datos titular */}
          <div className={classes.modalSection}>
            <div className={classes.modalSectionLabel}><div />Datos del titular</div>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Documento de identidad" name="documento" value={reservationForm.documento || ""}
                  onChange={handleReservationFormChange} className={classes.formField} variant="outlined" fullWidth required size="small"
                  inputProps={{ maxLength: 12, onInput: (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, "") } }}
                  helperText={formErrors.documento || "6-12 dígitos numéricos"} error={!!formErrors.documento} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre completo" name="titular_reserva" value={reservationForm.titular_reserva}
                  onChange={(e) => handleReservationFormChange({ target: { name: "titular_reserva", value: e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, "") } })}
                  className={classes.formField} variant="outlined" fullWidth required size="small"
                  inputProps={{ maxLength: 60 }} helperText={formErrors.titular_reserva || "Solo letras"} error={!!formErrors.titular_reserva} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Correo electrónico" name="email" type="email" value={reservationForm.email}
                  onChange={handleReservationFormChange} className={classes.formField} variant="outlined" fullWidth required size="small"
                  helperText={formErrors.email || "ejemplo@correo.com"} error={!!formErrors.email} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Teléfono" name="telefono" value={reservationForm.telefono}
                  onChange={(e) => handleReservationFormChange({ target: { name: "telefono", value: e.target.value.replace(/[^0-9+]/g, "") } })}
                  className={classes.formField} variant="outlined" fullWidth required size="small"
                  inputProps={{ maxLength: 15 }} helperText={formErrors.telefono || "8-15 dígitos"} error={!!formErrors.telefono} />
              </Grid>
            </Grid>
          </div>

          {/* Fechas y pago */}
          <div className={classes.modalSection}>
            <div className={classes.modalSectionLabel}><div />Datos de la reserva</div>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Fecha de entrada" name="fecha_inicio" type="date" value={reservationForm.fecha_inicio}
                  onChange={handleReservationFormChange} className={classes.formField} variant="outlined" fullWidth required size="small"
                  InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  helperText={formErrors.fecha_inicio} error={!!formErrors.fecha_inicio} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Fecha de salida" name="fecha_fin" type="date" value={reservationForm.fecha_fin}
                  onChange={handleReservationFormChange} className={classes.formField} variant="outlined" fullWidth required size="small"
                  InputLabelProps={{ shrink: true }} inputProps={{ min: reservationForm.fecha_inicio || new Date().toISOString().split("T")[0] }}
                  helperText={formErrors.fecha_fin} error={!!formErrors.fecha_fin} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Noches de estadía" type="number" value={calcularNochesEstadia()}
                  className={classes.formField} variant="outlined" fullWidth size="small" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Monto a pagar (mín. 50%)" type="number" name="monto_pago" value={reservationForm.monto_pago}
                  onChange={handleReservationFormChange} className={classes.formField} variant="outlined" fullWidth required size="small"
                  InputProps={{ inputProps: { min: calcularPrecioTotal() * 0.5, max: calcularPrecioTotal() }, startAdornment: <span style={{ color: "#6B5E87", marginRight: 4 }}>$</span> }}
                  helperText={formErrors.monto_pago || `Mín. $${(calcularPrecioTotal() * 0.5).toFixed(0)}`} error={!!formErrors.monto_pago} />
              </Grid>
            </Grid>
          </div>

          {/* Comprobante */}
          <div className={classes.modalSection}>
            <div className={classes.modalSectionLabel}><div />Comprobante de pago</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div className={classes.paymentBox} style={{ flex: 1, minWidth: 200 }}>
                <div className={classes.paymentBoxTitle}><InfoOutlined />Datos bancarios</div>
                {[["Banco","Bancolombia"],["Cuenta","123-456789-00"],["Titular","Nido Sky S.A.S."],["NIT","900.123.456-7"]].map(([k,v]) => (
                  <Typography key={k} className={classes.paymentBoxText}><strong style={{ color: "#0C0A14", fontWeight: 700 }}>{k}:</strong> {v}</Typography>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 170 }}>
                <input type="file" accept="image/*,.pdf" className={classes.fileInput} ref={fileInputRef} onChange={handleComprobanteChange} />
                <Button className={classes.uploadBtn} startIcon={<CloudUpload />} onClick={() => fileInputRef.current.click()}>
                  Subir comprobante
                </Button>
                {comprobantePago && (
                  <Box display="flex" flexDirection="column" alignItems="center">
                    {comprobantePreview && comprobantePago.type.includes("image")
                      ? <img src={comprobantePreview} alt="preview" className={classes.filePreview} />
                      : <Description style={{ fontSize: 44, color: "#C4B5FD" }} />}
                    <Typography className={classes.fileName}>{comprobantePago.name}</Typography>
                  </Box>
                )}
              </div>
            </div>
          </div>

          {/* Acompañantes */}
          <div className={classes.modalSection}>
            <div className={classes.modalSectionLabel}><div />Acompañantes</div>
            <div className={classes.acompSection}>
              <Typography className={classes.acompSub}>
                Capacidad: {selectedApartamento?.capacidad || 0} personas · Máx. {selectedApartamento ? selectedApartamento.capacidad - 1 : 0} acompañantes
              </Typography>
              {reservationForm.acompanantes.map((a, i) => (
                <div key={i} className={classes.acompCard}>
                  <Typography className={classes.acompCardTitle}>Acompañante {i + 1}</Typography>
                  <IconButton size="small" className={classes.removeBtn} onClick={() => handleRemoveAcompanante(i)}><Close fontSize="small" /></IconButton>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Nombre" value={a.nombre}
                        onChange={(e) => handleAcompananteChange(i, "nombre", e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, ""))}
                        className={classes.formField} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 60 }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Apellido" value={a.apellido}
                        onChange={(e) => handleAcompananteChange(i, "apellido", e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, ""))}
                        className={classes.formField} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 60 }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Documento" value={a.documento_acompanante || ""}
                        onChange={(e) => handleAcompananteChange(i, "documento_acompanante", e.target.value.replace(/[^0-9]/g, ""))}
                        className={classes.formField} variant="outlined" fullWidth size="small" inputProps={{ maxLength: 12 }} />
                    </Grid>
                  </Grid>
                </div>
              ))}
              <Button className={classes.addAcompBtn} startIcon={<Add />} onClick={handleAddAcompanante}
                disabled={selectedApartamento && reservationForm.acompanantes.length >= selectedApartamento.capacidad - 1}>
                Agregar acompañante
              </Button>
            </div>
          </div>

          {/* Resumen */}
          {selectedApartamento && reservationForm.fecha_inicio && reservationForm.fecha_fin && (
            <div className={classes.modalSection}>
              <div className={classes.modalSectionLabel}><div />Resumen de reserva</div>
              <div className={classes.summaryBox}>
                {[
                  ["Apartamento", selectedApartamento.nombre],
                  ["Precio por noche", `$${selectedApartamento.precio}`],
                  ["Noches", calcularNochesEstadia()],
                  ["Huéspedes", reservationForm.acompanantes.length + 1],
                ].map(([label, value]) => (
                  <div key={label} className={classes.summaryRow}>
                    <Typography className={classes.summaryLabel}>{label}</Typography>
                    <Typography className={classes.summaryValue}>{value}</Typography>
                  </div>
                ))}
                <div className={classes.summaryRow}>
                  <Typography className={classes.summaryLabel} style={{ fontWeight: 700, color: "#0C0A14" }}>Total</Typography>
                  <Typography className={classes.summaryTotal}>${calcularPrecioTotal()}</Typography>
                </div>
                <div className={classes.summaryRow}>
                  <Typography className={classes.summaryLabel}>Pago inicial (50%+)</Typography>
                  <Typography className={classes.summaryTotal}>${reservationForm.monto_pago}</Typography>
                </div>
                <div className={classes.summaryRow} style={{ borderBottom: "none" }}>
                  <Typography className={classes.summaryLabel}>Saldo pendiente</Typography>
                  <Typography className={classes.summaryValue}>${Math.max(0, calcularPrecioTotal() - reservationForm.monto_pago)}</Typography>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={classes.modalActions}>
          <Button className={classes.cancelBtn} onClick={() => setReservationDialogOpen(false)} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button className={classes.confirmBtn} onClick={handleReservationSubmit} disabled={loading} variant="contained">
            {loading ? "Procesando..." : "✦ Confirmar reserva"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default Landing