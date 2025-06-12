"use client"

import { useState, useEffect, useRef } from "react"
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Zoom,
  Slide,
  useMediaQuery,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import {
  LocationOn,
  Star,
  Menu as MenuIcon,
  Close,
  LocalHotel,
  Bathtub,
  Person,
  ChevronLeft,
  ChevronRight,
  Favorite,
  FavoriteBorder,
  Search,
  Visibility,
  Pool,
  Wifi,
  Spa,
  FitnessCenter,
  Restaurant,
  AcUnit,
  LocalBar,
  Security,
  Facebook,
  Instagram,
  Twitter,
  Room,
  ArrowForward,
  CheckCircle,
  Phone,
  Email,
  CloudUpload,
  Add,
  InfoOutlined,
  Description,
} from "@material-ui/icons"
import axios from "axios"
import { useHistory } from "react-router-dom"
import Swal from "sweetalert2"
import "./landing.styles.css" // Importar estilos CSS
import { Fade } from "@material-ui/core"

// ✅ Configuración de API con variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || ""

// ✅ Configurar las rutas específicas
const API_ENDPOINTS = {
  apartamentos: API_BASE_URL ? `${API_BASE_URL}/api/apartamentos` : "/api/apartamentos",
  apartamentosDestacados: API_BASE_URL
    ? `${API_BASE_URL}/api/landing/apartamentos-destacados`
    : "/api/landing/apartamentos-destacados",
  reservasPublica: API_BASE_URL ? `${API_BASE_URL}/api/reservas/publica` : "/api/reservas/publica",
  fechasReservadas: (apartamentoId) =>
    API_BASE_URL
      ? `${API_BASE_URL}/api/reservas/fechas-reservadas/${apartamentoId}`
      : `/api/reservas/fechas-reservadas/${apartamentoId}`,
}

console.log("🔧 API Configuration Landing:", {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
})

// ✅ Función para hacer llamadas a la API con manejo de errores
const apiCall = async (url, options = {}) => {
  try {
    console.log(`📡 API Call: ${url}`)
    const response = await axios.get(url, options)
    console.log(`✅ API Success: ${url}`, response.data)
    return response
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error.response?.data || error.message)
    throw error
  }
}

// Paleta de colores moderna y elegante
const theme = {
  primary: "#0A2463", // Azul oscuro
  secondary: "#3E92CC", // Azul claro
  accent: "#D8B08C", // Dorado/Beige
  light: "#FFFAFF", // Blanco hueso
  dark: "#1E1B18", // Negro suave
  gray: "#8D99AE", // Gris azulado
  success: "#2EC4B6", // Verde turquesa
  gradient: "linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)", // Gradiente azul
  accentGradient: "linear-gradient(135deg, #D8B08C 0%, #E6CCB2 100%)", // Gradiente dorado
}

// Estilos completamente renovados para un diseño moderno y distintivo
const useStyles = makeStyles((theme) => ({
  root: {
    overflowX: "hidden",
    position: "relative",
    backgroundColor: "#FFFAFF",
    fontFamily: "'Poppins', sans-serif",
    color: "#1E1B18",
  },
  // Navbar
  appBar: {
    backgroundColor: "transparent",
    boxShadow: "none",
    position: "absolute",
    zIndex: 1100,
    transition: "all 0.4s ease",
  },
  appBarScrolled: {
    backgroundColor: "rgba(10, 36, 99, 0.95)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2, 4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  logo: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "& img": {
      height: 80, // Aumentado de 50px a 80px
      objectFit: "contain",
      transition: "all 0.3s ease",
    },
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  navLink: {
    color: "#FFFAFF",
    marginLeft: theme.spacing(4),
    textTransform: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -5,
      left: 0,
      width: 0,
      height: 2,
      backgroundColor: "#D8B08C",
      transition: "all 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
    },
  },
  activeNavLink: {
    color: "#D8B08C",
    fontWeight: 600,
    "&::after": {
      width: "100%",
    },
  },
  menuButton: {
    display: "none",
    color: "#FFFAFF",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },
  loginButton: {
    marginLeft: theme.spacing(4),
    backgroundColor: "#D8B08C",
    color: "#0A2463",
    padding: "10px 30px",
    borderRadius: "4px",
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#E6CCB2",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(216, 176, 140, 0.3)",
    },
  },
  // Drawer
  drawer: {
    width: 280,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 3),
    background: "linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)",
    color: "#FFFAFF",
    height: 80,
  },
  drawerLogo: {
    display: "flex",
    alignItems: "center",
    "& img": {
      height: 60, // Aumentado de 40px a 60px
      marginRight: theme.spacing(1),
    },
  },
  drawerContent: {
    padding: theme.spacing(2, 0),
  },
  drawerItem: {
    padding: theme.spacing(1.5, 3),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(10, 36, 99, 0.05)",
    },
  },
  drawerItemText: {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#0A2463",
  },
  drawerDivider: {
    margin: theme.spacing(2, 0),
    backgroundColor: "rgba(10, 36, 99, 0.1)",
  },
  drawerLoginButton: {
    margin: theme.spacing(2, 3),
    backgroundColor: "#D8B08C",
    color: "#0A2463",
    padding: "10px 0",
    borderRadius: "4px",
    textTransform: "none",
    fontWeight: 600,
    width: "calc(100% - 48px)",
    "&:hover": {
      backgroundColor: "#E6CCB2",
    },
  },
  // Hero Section
  heroSection: {
    position: "relative",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 5s linear",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(10, 36, 99, 0.3)",
      backgroundImage:
        "linear-gradient(to bottom, rgba(10, 36, 99, 0.3) 0%, rgba(10, 36, 99, 0.3) 50%, rgba(10, 36, 99, 0.3) 100%)",
    },
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "#FFFAFF",
    maxWidth: 1200,
    padding: theme.spacing(0, 3),
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "5rem",
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    [theme.breakpoints.down("sm")]: {
      fontSize: "3rem",
    },
    "& span": {
      color: "#D8B08C",
    },
  },
  heroSubtitle: {
    fontSize: "1.5rem",
    maxWidth: 700,
    margin: "0 auto",
    marginBottom: theme.spacing(5),
    textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.2rem",
    },
  },
  heroLocation: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(5),
    "& svg": {
      color: "#D8B08C",
      marginRight: theme.spacing(1),
      fontSize: "1.5rem",
    },
    "& span": {
      fontSize: "1.2rem",
      fontWeight: 500,
      textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
    },
  },
  heroButtons: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },
  primaryButton: {
    backgroundColor: "#D8B08C",
    color: "#0A2463",
    padding: "12px 36px",
    borderRadius: "4px",
    textTransform: "none",
    fontSize: "1.1rem",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#E6CCB2",
      transform: "translateY(-3px)",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    },
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "#FFFAFF",
    padding: "12px 36px",
    borderRadius: "4px",
    textTransform: "none",
    fontSize: "1.1rem",
    fontWeight: 600,
    border: "2px solid #D8B08C",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-3px)",
      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    },
  },
  heroArrows: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(2),
    zIndex: 2,
  },
  heroArrow: {
    backgroundColor: "rgba(216, 176, 140, 0.3)",
    color: "#FFFAFF",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(216, 176, 140, 0.6)",
      transform: "scale(1.1)",
    },
  },
  // Booking Form
  bookingFormContainer: {
    position: "relative",
    marginTop: -70,
    zIndex: 10,
    [theme.breakpoints.down("sm")]: {
      marginTop: -40,
    },
  },
  bookingForm: {
    backgroundColor: "#FFFAFF",
    padding: theme.spacing(4),
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    maxWidth: 1200,
    margin: "0 auto",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
      margin: "0 16px",
    },
  },
  bookingFormTitle: {
    fontFamily: "'Playfair Display', serif",
    color: "#0A2463",
    marginBottom: theme.spacing(3),
    textAlign: "center",
    fontWeight: 700,
  },
  bookingFormInner: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  bookingInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
      backgroundColor: "#FFFAFF",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
      "&.Mui-focused": {
        boxShadow: "0 4px 12px rgba(10, 36, 99, 0.1)",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(10, 36, 99, 0.2)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0A2463",
    },
    "& .MuiInputLabel-root": {
      color: "#8D99AE",
    },
    "& .MuiInputBase-input": {
      color: "#1E1B18",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      color: "#0A2463",
    },
  },
  bookingButton: {
    height: 56,
    borderRadius: 4,
    padding: theme.spacing(0, 4),
    textTransform: "none",
    fontWeight: 600,
    fontSize: "1rem",
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    boxShadow: "0 4px 14px rgba(10, 36, 99, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#3E92CC",
      boxShadow: "0 6px 20px rgba(10, 36, 99, 0.3)",
      transform: "translateY(-2px)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  // Section Styles
  section: {
    padding: theme.spacing(10, 0),
    position: "relative",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0),
    },
  },
  sectionInner: {
    maxWidth: "100%", // Cambiado de 1200px a 100%
    margin: "0 auto",
    padding: "0 24px",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      padding: "0 16px",
    },
  },
  sectionTitle: {
    position: "relative",
    marginBottom: theme.spacing(5),
    textAlign: "center",
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
    color: "#0A2463",
    fontSize: "3.5rem", // Aumentado para mejor proporción con el ancho completo
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.5rem",
      marginBottom: theme.spacing(4),
    },
  },
  sectionTitleUnderline: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -15,
      left: "50%",
      transform: "translateX(-50%)",
      width: 80,
      height: 3,
      backgroundColor: "#D8B08C",
      borderRadius: 2,
    },
  },
  sectionTitleLeft: {
    textAlign: "left",
    "&::after": {
      left: 0,
      transform: "none",
    },
  },
  sectionTitleLight: {
    color: "#FFFAFF",
    "&::after": {
      backgroundColor: "#D8B08C",
    },
  },
  sectionSubtitle: {
    textAlign: "center",
    maxWidth: 800,
    margin: "0 auto",
    marginBottom: theme.spacing(6),
    color: "#8D99AE",
    fontSize: "1.1rem",
    lineHeight: 1.6,
  },
  sectionSubtitleLight: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Apartments Section
  apartmentSection: {
    backgroundColor: "#FFFAFF",
    position: "relative",
    overflow: "hidden",
    width: "100%", // Asegurar que ocupe todo el ancho
    padding: 0, // Eliminar padding
  },
  apartmentSectionBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.03,
    backgroundImage:
      "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/recepcion.png-XPx7tO9N6DKxWdsfId1Xajk9SrXgS8.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  },
  apartmentFilters: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(6),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  searchField: {
    maxWidth: 400,
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
      backgroundColor: "#FFFAFF",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
      "&.Mui-focused": {
        boxShadow: "0 4px 12px rgba(10, 36, 99, 0.15)",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(10, 36, 99, 0.2)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0A2463",
    },
  },
  apartmentCard: {
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: "all 0.4s ease",
    backgroundColor: "#FFFAFF",
    border: "1px solid rgba(0,0,0,0.05)",
    position: "relative",
    "&:hover": {
      transform: "translateY(-15px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      border: "1px solid rgba(10, 36, 99, 0.2)",
    },
    "&:hover $apartmentCardMedia": {
      transform: "scale(1.05)",
    },
  },
  apartmentCardMedia: {
    height: 450, // Aumentado de 350px a 450px
    position: "relative",
    backgroundColor: "#f0f0f0",
    transition: "transform 0.7s ease",
    transformOrigin: "center",
  },
  apartmentCardPrice: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "#D8B08C",
    color: "#0A2463",
    padding: theme.spacing(0.75, 2),
    borderRadius: 4,
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 1,
  },
  apartmentCardContent: {
    padding: theme.spacing(4),
    backgroundColor: "#FFFAFF",
  },
  apartmentCardTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    color: "#0A2463",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.8rem",
  },
  apartmentCardLocation: {
    display: "flex",
    alignItems: "center",
    color: "#8D99AE",
    marginBottom: theme.spacing(2),
    "& svg": {
      fontSize: 18,
      marginRight: theme.spacing(0.5),
      color: "#D8B08C",
    },
  },
  apartmentCardFeatures: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  apartmentCardFeature: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    color: "#8D99AE",
    "& svg": {
      fontSize: 18,
      marginRight: theme.spacing(0.5),
      color: "#0A2463",
    },
  },
  apartmentCardActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  apartmentCardButton: {
    borderRadius: 4,
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    padding: "8px 20px",
    boxShadow: "0 4px 14px rgba(10, 36, 99, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#3E92CC",
      boxShadow: "0 6px 20px rgba(10, 36, 99, 0.3)",
      transform: "translateY(-2px)",
    },
  },
  favoriteButton: {
    color: "#E63946",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  apartmentTag: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 4,
    fontWeight: 600,
    fontSize: "0.8rem",
    zIndex: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  luxuryTag: {
    backgroundColor: "#D8B08C",
    color: "#0A2463",
  },
  // About Section
  aboutSection: {
    backgroundColor: "#0A2463",
    position: "relative",
    overflow: "hidden",
    color: "#FFFAFF",
  },
  aboutPattern: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "50%",
    zIndex: 0,
  },
  aboutContent: {
    position: "relative",
    zIndex: 1,
  },
  aboutImage: {
    width: "100%",
    borderRadius: 8,
    boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
    transition: "all 0.5s ease",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  },
  aboutTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    color: "#FFFAFF",
    fontFamily: "'Playfair Display', serif",
    position: "relative",
    paddingBottom: theme.spacing(2),
    fontSize: "2.5rem",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 60,
      height: 3,
      backgroundColor: "#D8B08C",
      borderRadius: 2,
    },
  },
  aboutText: {
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: theme.spacing(3),
    lineHeight: 1.8,
    fontSize: "1.05rem",
  },
  aboutFeature: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  aboutFeatureIcon: {
    color: "#D8B08C",
    marginRight: theme.spacing(1.5),
    fontSize: 20,
  },
  aboutFeatureText: {
    color: "#FFFAFF",
    fontWeight: 500,
  },
  amenitiesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  amenityItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: theme.spacing(1, 2),
    borderRadius: 4,
    "& svg": {
      color: "#D8B08C",
      marginRight: theme.spacing(1),
      fontSize: 20,
    },
  },
  // Features Section
  featuresSection: {
    backgroundColor: "#FFFAFF",
    position: "relative",
    overflow: "hidden",
  },
  featuresBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "linear-gradient(135deg, rgba(10, 36, 99, 0.03) 0%, rgba(62, 146, 204, 0.03) 100%)",
    zIndex: 0,
  },
  featuresGrid: {
    position: "relative",
    zIndex: 1,
  },
  featureItem: {
    textAlign: "center",
    padding: theme.spacing(4),
    borderRadius: 8,
    transition: "all 0.4s ease",
    backgroundColor: "#FFFAFF",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
    height: "100%",
    border: "1px solid rgba(0,0,0,0.05)",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
      border: "1px solid rgba(10, 36, 99, 0.2)",
    },
    "&:hover $featureIcon": {
      transform: "scale(1.1) rotateY(180deg)",
      color: "#D8B08C",
    },
  },
  featureIcon: {
    fontSize: 60,
    color: "#0A2463",
    marginBottom: theme.spacing(2),
    transition: "all 0.5s ease",
  },
  featureTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1.5),
    color: "#0A2463",
    fontFamily: "'Playfair Display', serif",
  },
  featureText: {
    color: "#8D99AE",
    lineHeight: 1.6,
  },
  // Testimonial Section
  testimonialSection: {
    backgroundColor: "#3E92CC",
    color: "#FFFAFF",
    position: "relative",
    overflow: "hidden",
  },
  testimonialPattern: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "50%",
    zIndex: 0,
  },
  testimonialContainer: {
    position: "relative",
    zIndex: 1,
  },
  testimonialCard: {
    padding: theme.spacing(4),
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  },
  testimonialRating: {
    display: "flex",
    marginBottom: theme.spacing(2),
    "& svg": {
      color: "#D8B08C",
      fontSize: 20,
    },
  },
  testimonialText: {
    fontStyle: "italic",
    marginBottom: theme.spacing(3),
    flex: 1,
    lineHeight: 1.8,
    fontSize: "1.05rem",
    position: "relative",
    paddingLeft: theme.spacing(3),
    color: "rgba(255, 255, 255, 0.9)",
    "&::before": {
      content: '"\\201C"',
      position: "absolute",
      top: -20,
      left: 0,
      fontSize: "4rem",
      color: "rgba(216, 176, 140, 0.3)",
      fontFamily: "Georgia, serif",
    },
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
  },
  testimonialAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    marginRight: theme.spacing(2),
    objectFit: "cover",
    border: "3px solid #D8B08C",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  },
  testimonialName: {
    fontWeight: 600,
    fontSize: "1.1rem",
    marginBottom: theme.spacing(0.5),
    color: "#FFFAFF",
  },
  testimonialRole: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.9rem",
  },
  // CTA Section
  ctaSection: {
    background: "linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)",
    color: "#FFFAFF",
    textAlign: "center",
    padding: theme.spacing(10, 0),
    position: "relative",
    overflow: "hidden",
  },
  ctaPattern: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "50%",
    zIndex: 0,
  },
  ctaContent: {
    position: "relative",
    zIndex: 1,
  },
  ctaTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    fontFamily: "'Playfair Display', serif",
    fontSize: "3rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.5rem",
    },
  },
  ctaText: {
    maxWidth: 800,
    margin: "0 auto",
    marginBottom: theme.spacing(4),
    fontSize: "1.1rem",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.9)",
  },
  ctaButton: {
    backgroundColor: "#D8B08C",
    color: "#0A2463",
    padding: theme.spacing(1.5, 4),
    borderRadius: 4,
    fontWeight: 600,
    textTransform: "none",
    fontSize: "1.1rem",
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#E6CCB2",
      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
      transform: "translateY(-3px)",
    },
  },
  // Footer
  footer: {
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    padding: theme.spacing(8, 0, 4),
    position: "relative",
  },
  footerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    width: "100%",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    "& img": {
      height: 80,
      marginRight: theme.spacing(2),
    },
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: theme.spacing(3),
    lineHeight: 1.8,
  },
  footerSocial: {
    display: "flex",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  footerSocialIcon: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#FFFAFF",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#D8B08C",
      transform: "translateY(-3px)",
    },
  },
  footerTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    position: "relative",
    paddingBottom: theme.spacing(1.5),
    fontFamily: "'Playfair Display', serif",
    color: "#FFFAFF",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 40,
      height: 2,
      backgroundColor: "#D8B08C",
    },
  },
  footerLink: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#D8B08C",
      textDecoration: "none",
      transform: "translateX(5px)",
    },
    "& svg": {
      fontSize: 16,
      marginRight: theme.spacing(1),
      color: "#D8B08C",
    },
  },
  footerContact: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
    "& svg": {
      color: "#D8B08C",
      marginRight: theme.spacing(1.5),
      marginTop: 3,
      fontSize: 20,
    },
  },
  footerContactText: {
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: theme.spacing(3),
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(2),
    },
  },
  footerCopyright: {
    color: "rgba(255,255,255,0.7)",
  },
  footerBottomLinks: {
    display: "flex",
    gap: theme.spacing(2),
  },
  footerBottomLink: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.875rem",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#D8B08C",
    },
  },
  // Reservation Dialog
  reservationDialog: {
    "& .MuiDialog-paper": {
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      backgroundColor: "#FFFAFF",
      border: "1px solid rgba(10, 36, 99, 0.1)",
    },
  },
  reservationDialogTitle: {
    background: "linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)",
    color: "#FFFAFF",
    padding: theme.spacing(3),
    borderBottom: "1px solid rgba(10, 36, 99, 0.1)",
  },
  reservationDialogContent: {
    padding: theme.spacing(4),
    backgroundColor: "#FFFAFF",
    maxHeight: "70vh",
    overflowY: "auto",
  },
  reservationForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
  },
  reservationField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
      transition: "all 0.3s ease",
      backgroundColor: "#FFFAFF",
      "&:hover": {
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      },
      "&.Mui-focused": {
        boxShadow: "0 4px 10px rgba(10, 36, 99, 0.1)",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(10, 36, 99, 0.2)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0A2463",
    },
    "& .MuiInputLabel-root": {
      color: "#8D99AE",
    },
    "& .MuiInputBase-input": {
      color: "#1E1B18",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      color: "#0A2463",
    },
  },
  reservationTotal: {
    backgroundColor: "#F8F9FA",
    padding: theme.spacing(3),
    borderRadius: 4,
    marginTop: theme.spacing(2),
    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid rgba(10, 36, 99, 0.1)",
  },
  reservationTotalTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: "#0A2463",
  },
  reservationTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1, 0),
    borderBottom: "1px dashed rgba(0,0,0,0.1)",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  reservationTotalLabel: {
    color: "#8D99AE",
  },
  reservationTotalValue: {
    fontWeight: 500,
    color: "#1E1B18",
  },
  reservationTotalFinal: {
    fontWeight: 700,
    color: "#D8B08C",
    fontSize: "1.1rem",
  },
  reservationActions: {
    padding: theme.spacing(2, 3, 3),
    backgroundColor: "#FFFAFF",
  },
  reservationButton: {
    borderRadius: 4,
    padding: theme.spacing(1.2, 4),
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    boxShadow: "0 4px 14px rgba(10, 36, 99, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#3E92CC",
      boxShadow: "0 6px 20px rgba(10, 36, 99, 0.4)",
      transform: "translateY(-2px)",
    },
  },
  cancelButton: {
    color: "#8D99AE",
    "&:hover": {
      backgroundColor: "rgba(141, 153, 174, 0.1)",
      color: "#1E1B18",
    },
  },
  // Media elements
  videoButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(216, 176, 140, 0.8)",
    color: "#FFFAFF",
    width: 80,
    height: 80,
    borderRadius: "50%",
    zIndex: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#D8B08C",
      transform: "translate(-50%, -50%) scale(1.1)",
      boxShadow: "0 0 30px rgba(216, 176, 140, 0.5)",
    },
    "& svg": {
      fontSize: 40,
    },
  },
  viewButton: {
    position: "absolute",
    bottom: 15,
    left: 15,
    backgroundColor: "rgba(10, 36, 99, 0.8)",
    color: "#FFFAFF",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 4,
    fontSize: "0.8rem",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#0A2463",
    },
    "& svg": {
      fontSize: 16,
    },
  },
  chip: {
    margin: theme.spacing(0.5),
    backgroundColor: "rgba(10, 36, 99, 0.1)",
    color: "#0A2463",
    border: "1px solid rgba(10, 36, 99, 0.2)",
    "& .MuiChip-label": {
      fontWeight: 500,
    },
  },
  errorText: {
    color: "#f44336",
    fontSize: "0.75rem",
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(1.5),
  },
  // Nuevos estilos para acompañantes
  acompanantesSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: "rgba(10, 36, 99, 0.03)",
    borderRadius: 8,
    border: "1px solid rgba(10, 36, 99, 0.1)",
  },
  acompanantesTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: "#0A2463",
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
  acompananteItem: {
    padding: theme.spacing(2),
    backgroundColor: "#FFFAFF",
    borderRadius: 4,
    marginBottom: theme.spacing(2),
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    position: "relative",
  },
  removeAcompananteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: "auto",
    width: 30,
    height: 30,
    padding: 0,
  },
  addAcompananteButton: {
    marginTop: theme.spacing(1),
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    "&:hover": {
      backgroundColor: "#3E92CC",
    },
  },
  // Nuevos estilos para el comprobante de pago
  uploadSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: "rgba(10, 36, 99, 0.03)",
    borderRadius: 8,
    border: "1px solid rgba(10, 36, 99, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  uploadTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: "#0A2463",
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
  uploadButton: {
    marginTop: theme.spacing(2),
    backgroundColor: "#0A2463",
    color: "#FFFAFF",
    padding: theme.spacing(1, 3),
    "&:hover": {
      backgroundColor: "#3E92CC",
    },
  },
  fileInput: {
    display: "none",
  },
  filePreview: {
    width: "100%",
    maxHeight: 120,
    objectFit: "contain",
    marginTop: theme.spacing(2),
    borderRadius: 4,
    border: "1px solid rgba(10, 36, 99, 0.2)",
  },
  fileName: {
    marginTop: theme.spacing(1),
    color: "#8D99AE",
    fontSize: "0.875rem",
  },
  paymentInfo: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "rgba(216, 176, 140, 0.1)",
    borderRadius: 4,
    border: "1px solid rgba(216, 176, 140, 0.3)",
  },
  paymentInfoTitle: {
    fontWeight: 600,
    color: "#0A2463",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#D8B08C",
    },
  },
  paymentInfoText: {
    color: "#1E1B18",
    fontSize: "0.9rem",
    marginBottom: theme.spacing(1),
  },
}))

// Modificar las rutas de imágenes en apartamentosEjemplo
const apartamentosEjemplo = [
  {
    id: 1,
    nombre: "Apartamento Tipo 1",
    tipo: "Tipo 1",
    ubicacion: "El Poblado, Medellín",
    precio: 250,
    capacidad: 2,
    camas: 1,
    banos: 1,
    tamano: 45,
    caracteristicas: ["Balcón", "Vista a la ciudad", "Cocina equipada", "WiFi de alta velocidad"],
    imagen: "/imagen-1.png",
    disponible: true,
    tag: "Popular",
  },
  {
    id: 2,
    nombre: "Apartamento Tipo 2",
    tipo: "Tipo 2",
    ubicacion: "El Poblado, Medellín",
    precio: 350,
    capacidad: 4,
    camas: 2,
    banos: 2,
    tamano: 75,
    caracteristicas: ["Sala de estar", "Comedor", "Terraza", "Smart TV"],
    imagen: "/imagen-2.png",
    disponible: true,
    tag: "Familiar",
  },
  {
    id: 3,
    nombre: "Penthouse Exclusivo",
    tipo: "Penthouse",
    ubicacion: "El Poblado, Medellín",
    precio: 550,
    capacidad: 6,
    camas: 3,
    banos: 3,
    tamano: 120,
    caracteristicas: ["Terraza panorámica", "Jacuzzi", "Bar privado", "Servicio de concierge"],
    imagen: "/imagen-3.png",
    disponible: true,
    tag: "Lujo",
  },
  {
    id: 4,
    nombre: "Suite Ejecutiva",
    tipo: "Suite",
    ubicacion: "El Poblado, Medellín",
    precio: 400,
    capacidad: 2,
    camas: 1,
    banos: 1,
    tamano: 60,
    caracteristicas: ["Escritorio de trabajo", "Cafetera", "Minibar", "Caja fuerte"],
    imagen: "/imagen-1.png",
    disponible: true,
    tag: "Ejecutivo",
  },
  {
    id: 5,
    nombre: "Apartamento Familiar",
    tipo: "Tipo 2",
    ubicacion: "El Poblado, Medellín",
    precio: 380,
    capacidad: 5,
    camas: 2,
    banos: 2,
    tamano: 85,
    caracteristicas: ["Cocina completa", "Área de juegos", "Lavadora", "Secadora"],
    imagen: "/imagen-2.png",
    disponible: true,
    tag: "Familiar",
  },
  {
    id: 6,
    nombre: "Loft Moderno",
    tipo: "Loft",
    ubicacion: "El Poblado, Medellín",
    precio: 320,
    capacidad: 2,
    camas: 1,
    banos: 1,
    tamano: 55,
    caracteristicas: ["Diseño abierto", "Iluminación LED", "Smart TV", "Sonido envolvente"],
    imagen: "/imagen-3.png",
    disponible: true,
    tag: "Moderno",
  },
]

// Datos de ejemplo para los testimonios
const testimoniosEjemplo = [
  {
    id: 1,
    nombre: "María Rodríguez",
    comentario:
      "Una experiencia increíble. Las vistas desde nuestra habitación eran espectaculares y el servicio fue impecable. Definitivamente volveremos a Nido Sky en nuestra próxima visita a Medellín.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rol: "Huésped frecuente",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    comentario:
      "El mejor hotel en el que nos hemos hospedado en El Poblado. La atención al detalle es extraordinaria y las instalaciones son de primera clase. El penthouse es simplemente espectacular.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rol: "Viajero de negocios",
  },
  {
    id: 3,
    nombre: "Ana Gómez",
    comentario:
      "Nido Sky superó todas nuestras expectativas. El spa es increíble y la comida del restaurante es deliciosa. La ubicación en El Poblado es perfecta para explorar lo mejor de Medellín.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rol: "Turista internacional",
  },
]

// Imágenes mejoradas para el hero
const heroImages = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/recepcion.png-XPx7tO9N6DKxWdsfId1Xajk9SrXgS8.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gimnasio.png-Gb7Jvfxujhu3Oi4fsmrTuPRoCaOf3u.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/piscina.png-NKUEeWXZRn7pXvG0Idk6FMgqlbWu7x.jpeg",
]

function Landing() {
  const classes = useStyles()
  const theme = useTheme()
  const history = useHistory()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const fileInputRef = useRef(null)

  // Estados
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
  // Modificar el estado reservationForm para incluir el tipo de documento
  const [reservationForm, setReservationForm] = useState({
    documento: "",
    tipo_documento: "cedula", // Añadir tipo de documento con valor por defecto
    titular_reserva: "",
    email: "",
    telefono: "",
    fecha_inicio: "",
    fecha_fin: "",
    apartamentos: [],
    noches_estadia: 1,
    total: 0,
    monto_pago: 0,
    acompanantes: [],
  })
  // Añadir el campo documento a los errores del formulario
  const [formErrors, setFormErrors] = useState({
    titular_reserva: "",
    email: "",
    telefono: "",
    fecha_inicio: "",
    fecha_fin: "",
    monto_pago: "",
    documento: "", // Añadir el campo documento
  })
  const [comprobantePago, setComprobantePago] = useState(null)
  const [comprobantePreview, setComprobantePreview] = useState("")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState(
    "¡Cliente registrado con éxito! Te hemos enviado un correo con los detalles.",
  )
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [favorites, setFavorites] = useState([])
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Refs
  const apartamentosRef = useRef(null)
  const aboutRef = useRef(null)
  const featuresRef = useRef(null)
  const contactRef = useRef(null)

  // ✅ Actualizar fetchReservedDates con configuración de API
  const fetchReservedDates = async (apartamentoId) => {
    try {
      console.log("Obteniendo fechas reservadas para el apartamento:", apartamentoId)
      const response = await apiCall(API_ENDPOINTS.fechasReservadas(apartamentoId))

      if (response.data && response.data.fechasReservadas) {
        // Actualizar el estado con las fechas reservadas para este apartamento
        setReservedDates((prev) => ({
          ...prev,
          [apartamentoId]: response.data.fechasReservadas,
        }))
        return response.data.fechasReservadas
      }
      return []
    } catch (error) {
      console.error("Error al obtener fechas reservadas:", error)
      // Si hay un error, devolver un array vacío
      return []
    }
  }

  // Añadir esta función dentro del componente Landing
  const isDateReserved = (date) => {
    if (!selectedApartamento || !reservedDates[selectedApartamento.id]) {
      return false
    }

    const dateStr = typeof date === "string" ? date : date.toISOString().split("T")[0]

    // Verificar si la fecha está en el array de fechas reservadas
    return reservedDates[selectedApartamento.id].some((reservedDate) => {
      // Si la fecha reservada es un objeto con fecha_inicio y fecha_fin
      if (reservedDate.fecha_inicio && reservedDate.fecha_fin) {
        const inicio = new Date(reservedDate.fecha_inicio)
        const fin = new Date(reservedDate.fecha_fin)
        const checkDate = new Date(dateStr)

        // Verificar si la fecha está dentro del rango
        return checkDate >= inicio && checkDate <= fin
      }

      // Si es solo una fecha (string)
      return reservedDate === dateStr
    })
  }

  // Añadir esta función dentro del componente Landing
  const getDisabledDates = () => {
    if (!selectedApartamento || !reservedDates[selectedApartamento.id]) {
      return []
    }

    const disabledDates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Añadir todas las fechas anteriores a hoy
    const pastDates = []
    const tempDate = new Date(today)
    tempDate.setDate(tempDate.getDate() - 1)
    while (tempDate.getFullYear() >= today.getFullYear() - 1) {
      pastDates.push(tempDate.toISOString().split("T")[0])
      tempDate.setDate(tempDate.getDate() - 1)
    }

    // Añadir fechas reservadas
    reservedDates[selectedApartamento.id].forEach((reservedDate) => {
      if (reservedDate.fecha_inicio && reservedDate.fecha_fin) {
        // Si es un rango de fechas
        const inicio = new Date(reservedDate.fecha_inicio)
        const fin = new Date(reservedDate.fecha_fin)

        // Añadir todas las fechas en el rango
        const currentDate = new Date(inicio)
        while (currentDate <= fin) {
          disabledDates.push(currentDate.toISOString().split("T")[0])
          currentDate.setDate(currentDate.getDate() + 1)
        }
      } else {
        // Si es una fecha individual
        disabledDates.push(reservedDate)
      }
    })

    return [...pastDates, ...disabledDates]
  }

  // ✅ Actualizar useEffect con configuración de API
  useEffect(() => {
    // ✅ Actualizar fetchApartamentos con configuración de API
    const fetchApartamentos = async () => {
      try {
        console.log("Intentando cargar apartamentos desde la API...")

        // ✅ Usar la configuración de endpoints
        try {
          const response = await apiCall(API_ENDPOINTS.apartamentosDestacados)

          if (response.data && response.data.length > 0) {
            // Guardar todos los apartamentos
            setAllApartamentos(response.data)
            // Limitar a 6 apartamentos para la vista inicial
            const limitedApartamentos = response.data.slice(0, 6)
            setApartamentos(limitedApartamentos)
            setFilteredApartamentos(limitedApartamentos)
            return
          }
        } catch (error) {
          console.error("Error al cargar apartamentos destacados:", error)
          // Si falla, intentar con la API general de apartamentos
        }

        // ✅ Si no hay apartamentos destacados, intentar con todos los apartamentos
        try {
          const response = await apiCall(API_ENDPOINTS.apartamentos)
          console.log("Respuesta de la API general:", response.data)

          // Agregar logging adicional para debugging
          response.data.forEach((apt) => {
            console.log(
              `📸 Apartamento ${apt.NumeroApto} (${apt.Tipo}) -> Imagen asignada: ${apt.Tipo === "Penthouse" ? "/imagen-3.png" : apt.Tipo === "Tipo 2" ? "/imagen-2.png" : "/imagen-1.png"}`,
            )
          })

          if (response.data && response.data.length > 0) {
            // Transformar los datos para que coincidan con el formato esperado
            const apartamentosFormateados = response.data.map((apt) => {
              // Determinar la imagen basada en el tipo, asegurando que Penthouse siempre use imagen-3.png
              let imagenUrl = "/imagen-1.png"
              if (apt.Tipo === "Penthouse") {
                imagenUrl = "/imagen-3.png"
              } else if (apt.Tipo === "Tipo 2") {
                imagenUrl = "/imagen-2.png"
              }

              return {
                _id: apt._id, // Mantener el ObjectId original
                id: apt._id, // Duplicar para compatibilidad
                nombre: `Apartamento ${apt.NumeroApto} - ${apt.Tipo}`,
                tipo: apt.Tipo,
                descripcion: `Lujoso apartamento tipo ${apt.Tipo} ubicado en el piso ${apt.Piso} con todas las comodidades.`,
                ubicacion: "El Poblado, Medellín",
                precio: apt.Tarifa,
                capacidad: 4,
                camas: 2,
                banos: 1,
                tamano: 75,
                caracteristicas: ["Balcón", "Vista a la ciudad", "Cocina equipada", "WiFi de alta velocidad"],
                imagenes: ["/images/apartment-1.jpg", "/images/apartment-2.jpg", "/images/apartment-3.jpg"],
                imagen: imagenUrl, // Usar la imagen determinada
                estado: apt.Estado ? "disponible" : "no disponible",
                disponible: apt.Estado,
                tag: apt.Tipo === "Penthouse" ? "Lujo" : apt.Tipo === "Tipo 2" ? "Familiar" : "Popular",
              }
            })

            // Guardar todos los apartamentos
            setAllApartamentos(apartamentosFormateados)
            // Limitar a 6 apartamentos para la vista inicial
            const limitedApartamentos = apartamentosFormateados.slice(0, 6)
            setApartamentos(limitedApartamentos)
            setFilteredApartamentos(limitedApartamentos)
            return
          }
        } catch (error) {
          console.error("Error al cargar apartamentos desde la API general:", error)
          // Continuar con los datos de ejemplo
        }

        // ✅ Si llegamos aquí, usar datos de ejemplo
        console.log("Usando datos de ejemplo para apartamentos")
        setAllApartamentos(apartamentosEjemplo)
        setApartamentos(apartamentosEjemplo.slice(0, 6))
        setFilteredApartamentos(apartamentosEjemplo.slice(0, 6))
      } catch (error) {
        console.error("Error al cargar apartamentos:", error)
        console.log("Usando datos de ejemplo debido al error")
        // Si hay error, usar los datos de ejemplo
        setApartamentos(apartamentosEjemplo.slice(0, 6))
        setFilteredApartamentos(apartamentosEjemplo.slice(0, 6))
      }
    }

    fetchApartamentos()

    // Forzar un reflow para asegurar que el scroll funcione correctamente
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"

    // Precargar las imágenes para evitar saltos
    const preloadImages = () => {
      const logoImg = new Image()
      logoImg.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
      logoImg.onload = () => setLogoLoaded(true)

      heroImages.forEach((src) => {
        const img = new Image()
        img.src = src
      })

      apartamentosEjemplo.forEach((apt) => {
        const img = new Image()
        img.src = apt.imagen
      })
    }

    preloadImages()

    // Detectar scroll para cambiar el estilo del navbar
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Cambiar automáticamente las imágenes del hero
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Efecto para filtrar apartamentos cuando cambia el término de búsqueda
  useEffect(() => {
    // Usar allApartamentos o apartamentos según el estado de showAllApartments
    const baseApartamentos = [...apartamentos]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = baseApartamentos.filter(
        (apt) =>
          apt.nombre.toLowerCase().includes(term) ||
          apt.tipo.toLowerCase().includes(term) ||
          apt.caracteristicas?.some((c) => c.toLowerCase().includes(term)),
      )
      setFilteredApartamentos(filtered)
    } else {
      setFilteredApartamentos(baseApartamentos)
    }
  }, [searchTerm, apartamentos])

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleHeroSlideChange = (direction) => {
    if (direction === "next") {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length)
    } else {
      setCurrentHeroSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    }
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const toggleShowAllApartments = () => {
    if (showAllApartments) {
      // Si ya estamos mostrando todos, volver a mostrar solo 6
      const limitedApartamentos = allApartamentos.slice(0, 6)
      setApartamentos(limitedApartamentos)
      setFilteredApartamentos(
        searchTerm
          ? limitedApartamentos.filter(
              (apt) =>
                apt.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.caracteristicas?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())),
            )
          : limitedApartamentos,
      )
    } else {
      // Si estamos mostrando solo 6, mostrar todos
      setApartamentos(allApartamentos)
      setFilteredApartamentos(
        searchTerm
          ? allApartamentos.filter(
              (apt) =>
                apt.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.caracteristicas?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())),
            )
          : allApartamentos,
      )
    }
    setShowAllApartments(!showAllApartments)
  }

  const handleReservationOpen = async (apartamento) => {
    setSelectedApartamento(apartamento)
    setReservationDialogOpen(true)

    // Establecer fecha de entrada como hoy por defecto
    const today = new Date().toISOString().split("T")[0]

    // Inicializar el formulario con los valores por defecto
    setReservationForm({
      titular_reserva: "",
      email: "",
      telefono: "",
      fecha_inicio: today,
      fecha_fin: "",
      apartamentos: apartamento ? [apartamento.id] : [],
      noches_estadia: 1,
      total: apartamento ? apartamento.precio : 0,
      monto_pago: apartamento ? apartamento.precio * 0.5 : 0, // 50% del total
      acompanantes: [],
      documento: "",
      tipo_documento: "cedula", // Añadir tipo de documento con valor por defecto
    })

    // Resetear errores del formulario
    setFormErrors({
      titular_reserva: "",
      email: "",
      telefono: "",
      fecha_inicio: "",
      fecha_fin: "",
      monto_pago: "",
      documento: "",
    })

    // Resetear el comprobante de pago
    setComprobantePago(null)
    setComprobantePreview("")

    // Obtener fechas reservadas para este apartamento
    if (apartamento && apartamento.id) {
      await fetchReservedDates(apartamento.id)
    }
  }

  const handleReservationClose = () => {
    setReservationDialogOpen(false)
  }

  // Agregar/eliminar acompañantes
  const handleAddAcompanante = () => {
    // Verificar si ya se alcanzó el límite de capacidad
    if (selectedApartamento && reservationForm.acompanantes.length >= selectedApartamento.capacidad - 1) {
      Swal.fire({
        title: "Límite de capacidad",
        text: `Este apartamento tiene capacidad máxima para ${selectedApartamento.capacidad} personas (incluido el titular).`,
        icon: "warning",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      return
    }
    const newAcompanante = {
      nombre: "",
      apellido: "",
      documento_acompanante: "",
      tipo_documento_acompanante: "cedula", // Añadir tipo de documento con valor por defecto
    }
    setReservationForm({
      ...reservationForm,
      acompanantes: [...reservationForm.acompanantes, newAcompanante],
    })
  }

  const handleRemoveAcompanante = (index) => {
    const updatedAcompanantes = [...reservationForm.acompanantes]
    updatedAcompanantes.splice(index, 1)
    setReservationForm({
      ...reservationForm,
      acompanantes: updatedAcompanantes,
    })
  }

  const handleAcompananteChange = (index, field, value) => {
    const updatedAcompanantes = [...reservationForm.acompanantes]
    updatedAcompanantes[index] = {
      ...updatedAcompanantes[index],
      [field]: value,
    }
    setReservationForm({
      ...reservationForm,
      acompanantes: updatedAcompanantes,
    })
  }

  // Manejar la carga del comprobante de pago
  const handleComprobanteChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setComprobantePago(file)

      // Crear una URL para previsualizar la imagen
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setComprobantePreview(fileReader.result)
      }
      fileReader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  // Validación de campos en tiempo real
  const validateField = (name, value) => {
    let error = ""

    switch (name) {
      // Titular de reserva
      case "titular_reserva":
        if (!value) {
          //Nombre vació
          error = "El nombre es obligatorio"
        } else if (value.trim() === "") {
          //Nombre solo con espacios
          error = "El nombre No puede contener solo espacios"
        } else if (value.length < 3) {
          //Nombre muy corto
          error = "El nombre debe tener al menos 3 caracteres"
        } else if (value.length > 50) {
          //Nombre muy largo
          error = "El nombre no puede tener más de 50 caracteres"
        } else if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
          //Solo letras, tildes y espacios
          error = "El nombre solo puede contener letras y espacios"
        }
        break

      //Email
      case "email":
        if (!value) {
          //Email vació
          error = "El correo electrónico es obligatorio"
        } else if (value.includes(" ")) {
          //Email con espacios
          error = "El correo electrónico no puede contener espacios"
        } else if (!value.includes("@")) {
          //Email sin arroba
          error = "El correo electrónico debe contener un '@'"
        } else if ((value.match(/@/g) || []).length > 1) {
          // Multiple @
          error = "El correo electrónico no puede contener múltiples @"
        } else if (!/\.[a-z]{2,}$/i.test(value)) {
          // Sin extensión (.com)
          error = "El correo electrónico debe tener una extensión válida (.com, .net, etc.)"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          // Formato general inválido
          error = "Ingrese un correo electrónico válido"
        }
        break

      //Teléfono
      case "telefono":
        if (!value) {
          // Teléfono vacío
          error = "El teléfono es obligatorio"
        } else if (value.length < 8) {
          // Menos de 8 dígitos
          error = "El teléfono debe tener al menos 8 dígitos"
        } else if (value.length > 15) {
          // Más de 15 dígitos
          error = "El teléfono no puede exceder los 15 dígitos"
        } else if (!/^\+?[0-9]{8,15}$/.test(value)) {
          // Formato inválido (puede incluir + al inicio)
          error = "Ingrese un número de teléfono válido (solo números, puede incluir + al inicio)"
        }
        break

      case "fecha_inicio":
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const entryDate = new Date(value)

        if (!value) {
          error = "La fecha de entrada es obligatoria"
        } else if (entryDate < today) {
          error = "La fecha de entrada debe ser hoy o posterior"
        }
        break

      case "fecha_fin":
        if (!value) {
          error = "La fecha de salida es obligatoria"
        } else if (reservationForm.fecha_inicio && new Date(value) <= new Date(reservationForm.fecha_inicio)) {
          error = "La fecha de salida debe ser posterior a la fecha de entrada"
        }
        break

      case "monto_pago":
        const total = calcularPrecioTotal()
        const minPago = total * 0.5 // 50% del total

        if (!value) {
          // Monto vacío
          error = "El monto de pago es obligatorio"
        } else if (Number(value) < minPago) {
          // Valor menor al límite permitido (50%)
          error = `El pago mínimo debe ser del 50% (${minPago})`
        } else if (Number(value) > total) {
          // Valor mayor al límite permitido
          error = "El pago no puede superar el total de la reserva"
        }
        break

      // Documento
      case "documento":
        if (!value) {
          error = "El documento es obligatorio"
        } else if (value === "0") {
          error = "El documento no puede ser 0"
        } else if (!/^\d{6,12}$/.test(value)) {
          // Numérico de long 6 a 12
          error = "El documento debe tener entre 6 y 12 dígitos numéricos"
        } else if (value.startsWith("0")) {
          // No puede empezar con 0
          error = "El documento no puede empezar con 0"
        }
        break

      default:
        break
    }

    return error
  }

  const handleReservationFormChange = (event) => {
    const { name, value } = event.target

    // Verificar si la fecha seleccionada está reservada
    if ((name === "fecha_inicio" || name === "fecha_fin") && isDateReserved(value)) {
      Swal.fire({
        title: "Fecha no disponible",
        text: "Esta fecha ya está reservada. Por favor, seleccione otra fecha.",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      return // No actualizar el estado si la fecha está reservada
    }

    // Actualizar el valor del campo
    setReservationForm({
      ...reservationForm,
      [name]: value,
    })

    // Actualizar el total y el monto de pago si cambian las fechas
    if (name === "fecha_inicio" || name === "fecha_fin") {
      if (reservationForm.fecha_inicio && reservationForm.fecha_fin) {
        const noches = calcularNochesEstadia()
        const nuevoTotal = selectedApartamento ? selectedApartamento.precio * noches : 0
        const nuevoMontoPago = nuevoTotal * 0.5 // 50% del total

        setReservationForm((prev) => ({
          ...prev,
          noches_estadia: noches,
          total: nuevoTotal,
          monto_pago: nuevoMontoPago,
        }))
      }
    }

    // Validar el campo en tiempo real
    const error = validateField(name, value)

    // Actualizar errores
    setFormErrors({
      ...formErrors,
      [name]: error,
    })

    // Mostrar alerta SweetAlert2 solo para campos de fecha
    if (error && (name === "fecha_inicio" || name === "fecha_fin")) {
      Swal.fire({
        title: "Error de validación",
        text: error,
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
    }
  }

  const handleLogin = () => {
    console.log("Redirigiendo al login...")
    window.location.href = "/login"
  }

  // ✅ Actualizar handleReservationSubmit con configuración de API
  const handleReservationSubmit = async () => {
    // Validar el email ahora
    const emailError = validateField("email", reservationForm.email)
    if (emailError) {
      setFormErrors({
        ...formErrors,
        email: emailError,
      })

      Swal.fire({
        title: "Error de validación",
        text: emailError,
        icon: "error",
        confirmButtonText: "Entendido",
      })
      return
    }

    // Validar todos los campos antes de enviar
    const newErrors = {
      titular_reserva: validateField("titular_reserva", reservationForm.titular_reserva),
      email: emailError, // Ya validado
      telefono: validateField("telefono", reservationForm.telefono),
      fecha_inicio: validateField("fecha_inicio", reservationForm.fecha_inicio),
      fecha_fin: validateField("fecha_fin", reservationForm.fecha_fin),
      monto_pago: validateField("monto_pago", reservationForm.monto_pago),
      documento: !reservationForm.documento ? "El documento es obligatorio" : "",
    }

    setFormErrors(newErrors)

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some((error) => error !== "")

    if (hasErrors) {
      Swal.fire({
        title: "Formulario incompleto",
        text: "Por favor corrija los errores antes de continuar",
        icon: "warning",
        confirmButtonText: "Entendido",
      })
      return
    }

    // Verificar si se ha subido el comprobante de pago
    if (!comprobantePago) {
      Swal.fire({
        title: "Comprobante de pago requerido",
        text: "Por favor suba el comprobante de su pago",
        icon: "warning",
        confirmButtonText: "Entendido",
      })
      return
    }

    setLoading(true)

    try {
      console.log("Preparando datos para enviar al backend...")

      // Preparar datos para la API crearReservaPublica
      const reservaData = {
        titular_reserva: reservationForm.titular_reserva,
        email: reservationForm.email,
        telefono: reservationForm.telefono,
        fecha_inicio: reservationForm.fecha_inicio,
        fecha_fin: reservationForm.fecha_fin,
        apartamento_id: selectedApartamento.id, // Asegurarse de enviar el ID del apartamento
        huespedes: reservationForm.acompanantes.length + 1, // +1 por el titular
        documento: reservationForm.documento,
        tipo_documento: reservationForm.tipo_documento, // Añadir tipo de documento
        monto_pago: reservationForm.monto_pago, // Añadir el monto del pago parcial
        acompanantes: reservationForm.acompanantes.map((acompanante) => ({
          nombre: acompanante.nombre,
          apellido: acompanante.apellido,
          documento: acompanante.documento_acompanante,
          tipo_documento: acompanante.tipo_documento_acompanante, // Añadir tipo de documento
        })),
      }

      console.log("Datos a enviar:", reservaData)

      // ✅ Usar la configuración de endpoints
      const response = await axios.post(API_ENDPOINTS.reservasPublica, reservaData)

      console.log("Respuesta del servidor:", response.data)

      // Verificar si el cliente ya existía
      if (response.data.clienteExistente) {
        Swal.fire({
          title: "Cliente ya registrado",
          text: "Hemos encontrado tus datos en nuestro sistema. Tu reserva ha sido registrada correctamente.",
          icon: "info",
          confirmButtonText: "Entendido",
        })
      } else {
        // Manejar respuesta exitosa
        Swal.fire({
          title: "¡Reserva realizada!",
          text: "Hemos recibido tu reserva. Te enviaremos los detalles a tu correo electrónico.",
          icon: "success",
          confirmButtonText: "Excelente",
        })
      }

      setReservationDialogOpen(false)

      // Resetear formulario
      setReservationForm({
        titular_reserva: "",
        email: "",
        telefono: "",
        fecha_inicio: "",
        fecha_fin: "",
        apartamentos: [],
        noches_estadia: 1,
        total: 0,
        monto_pago: 0,
        acompanantes: [],
        documento: "",
        tipo_documento: "cedula",
      })
      setComprobantePago(null)
      setComprobantePreview("")
    } catch (error) {
      console.error("Error al registrar reserva:", error)

      // Mostrar mensaje de error más detallado
      let errorMessage = "Error al procesar la reserva. Por favor intenta nuevamente."

      if (error.response) {
        // El servidor respondió con un código de error
        console.error("Respuesta de error del servidor:", error.response.data)

        if (error.response.status === 401) {
          errorMessage = "No se pudo procesar la reserva. Por favor, inténtalo más tarde o contáctanos directamente."
        } else if (error.response.data?.msg || error.response.data?.message) {
          errorMessage = error.response.data.msg || error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Entendido",
      })
    } finally {
      setLoading(false)
    }
  }

  // Agregar esta función para calcular noches de estadía
  const calcularNochesEstadia = () => {
    if (!reservationForm.fecha_inicio || !reservationForm.fecha_fin) {
      return 1
    }

    const fechaEntrada = new Date(reservationForm.fecha_inicio)
    const fechaSalida = new Date(reservationForm.fecha_fin)
    const diffTime = Math.abs(fechaSalida - fechaEntrada)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 1
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleFavoriteToggle = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" })
  }

  // Calcular precio total de la reserva
  const calcularPrecioTotal = () => {
    if (!selectedApartamento || !reservationForm.fecha_inicio || !reservationForm.fecha_fin) {
      return 0
    }

    const fechaEntrada = new Date(reservationForm.fecha_inicio)
    const fechaSalida = new Date(reservationForm.fecha_fin)
    const diffTime = Math.abs(fechaSalida - fechaEntrada)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return selectedApartamento.precio * diffDays
  }

  // Renderizar estrellas para las valoraciones
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => <Star key={index} color={index < rating ? "inherit" : "disabled"} />)
  }

  // Función para manejar errores de carga de imágenes
  // Modificar la función handleImageError para dar prioridad a los penthouses
  const handleImageError = (e) => {
    e.target.onerror = null // Prevenir bucles infinitos
    console.error("❌ Error al cargar imagen:", e.target.src)

    // Obtener información del apartamento desde los data attributes
    const apartmentType = e.target.getAttribute("data-apartment-type") || ""
    const apartmentTag = e.target.getAttribute("data-apartment-tag") || ""

    // También buscar en el DOM como respaldo
    const apartmentElement = e.target.closest(".MuiCard-root")
    const apartmentTitle = apartmentElement?.querySelector(".MuiTypography-h5")?.textContent || ""
    const apartmentTagFromDOM = apartmentElement?.querySelector(".MuiChip-label")?.textContent || ""

    console.log("🔍 Debugging - Tipo:", apartmentType, "Tag:", apartmentTag, "Título:", apartmentTitle)

    // Determinar imagen de respaldo con prioridad a Penthouse
    if (
      apartmentType === "Penthouse" ||
      apartmentTag === "Lujo" ||
      apartmentTitle.includes("Penthouse") ||
      apartmentTagFromDOM.includes("Lujo")
    ) {
      console.log("🏢 Cargando imagen de respaldo para Penthouse")
      e.target.src = "/imagen-3.png"
    } else if (
      apartmentType === "Tipo 2" ||
      apartmentTag === "Familiar" ||
      apartmentTitle.includes("Tipo 2") ||
      apartmentTagFromDOM.includes("Familiar")
    ) {
      console.log("🏠 Cargando imagen de respaldo para Tipo 2")
      e.target.src = "/imagen-2.png"
    } else {
      console.log("🏡 Cargando imagen de respaldo por defecto")
      e.target.src = "/imagen-1.png"
    }
  }

  return (
    <div className={classes.root}>
      {/* AppBar */}
      <AppBar position="fixed" className={`${classes.appBar} ${scrolled ? classes.appBarScrolled : ""}`}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" className={classes.logo}>
            {logoLoaded ? (
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
                alt="Nido Sky"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://via.placeholder.com/50x50?text=Logo"
                }}
              />
            ) : (
              <div style={{ width: 50, height: 50 }}></div>
            )}
          </Typography>
          <div className={classes.navLinks}>
            <Button className={`${classes.navLink} ${classes.activeNavLink}`}>Inicio</Button>
            <Button className={classes.navLink} onClick={() => scrollToSection(apartamentosRef)}>
              Apartamentos
            </Button>
            <Button className={classes.navLink} onClick={() => scrollToSection(aboutRef)}>
              Nosotros
            </Button>
            <Button className={classes.navLink} onClick={() => scrollToSection(featuresRef)}>
              Servicios
            </Button>
            <Button className={classes.navLink} onClick={() => scrollToSection(contactRef)}>
              Contacto
            </Button>
            <Button variant="contained" className={classes.loginButton} onClick={handleLogin}>
              Iniciar Sesión
            </Button>
          </div>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer para móviles */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle} classes={{ paper: classes.drawer }}>
        <div className={classes.drawerHeader}>
          <div className={classes.drawerLogo}>
            {logoLoaded ? (
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
                alt="Nido Sky"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://via.placeholder.com/40x40?text=Logo"
                }}
              />
            ) : (
              <div style={{ width: 40, height: 40 }}></div>
            )}
          </div>
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <Close />
          </IconButton>
        </div>
        <div className={classes.drawerContent}>
          <List>
            <ListItem button onClick={handleDrawerToggle} className={classes.drawerItem}>
              <ListItemText primary="Inicio" className={classes.drawerItemText} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                scrollToSection(apartamentosRef)
                handleDrawerToggle()
              }}
              className={classes.drawerItem}
            >
              <ListItemText primary="Apartamentos" className={classes.drawerItemText} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                scrollToSection(aboutRef)
                handleDrawerToggle()
              }}
              className={classes.drawerItem}
            >
              <ListItemText primary="Nosotros" className={classes.drawerItemText} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                scrollToSection(featuresRef)
                handleDrawerToggle()
              }}
              className={classes.drawerItem}
            >
              <ListItemText primary="Servicios" className={classes.drawerItemText} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                scrollToSection(contactRef)
                handleDrawerToggle()
              }}
              className={classes.drawerItem}
            >
              <ListItemText primary="Contacto" className={classes.drawerItemText} />
            </ListItem>
          </List>
          <Divider className={classes.drawerDivider} />
          <Button variant="contained" className={classes.drawerLoginButton} onClick={handleLogin}>
            Iniciar Sesión
          </Button>
        </div>
      </Drawer>

      {/* Hero Section */}
      <section className={classes.heroSection}>
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={classes.heroBackground}
            style={{
              backgroundImage: `url(${image})`,
              opacity: currentHeroSlide === index ? 1 : 0,
            }}
          />
        ))}
        <div className={classes.heroContent}>
          <Slide direction="down" in={true} timeout={1000}>
            <div>
              <div className={classes.heroLocation}>
                <LocationOn />
                <span>El Poblado, Medellín</span>
              </div>
              <Typography variant="h1" className={classes.heroTitle}>
                Bienvenido a <span>Nido Sky</span>
              </Typography>
              <Typography variant="h5" className={classes.heroSubtitle}>
                Lujo y exclusividad en el corazón de El Poblado, la zona más prestigiosa de Medellín
              </Typography>
              <div className={classes.heroButtons}>
                <Button
                  variant="contained"
                  size="large"
                  className={classes.primaryButton}
                  onClick={() => scrollToSection(apartamentosRef)}
                >
                  Ver Apartamentos
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  className={classes.secondaryButton}
                  onClick={() => scrollToSection(aboutRef)}
                >
                  Conocer Más
                </Button>
              </div>
            </div>
          </Slide>
        </div>
        <div className={classes.heroArrows}>
          <IconButton className={classes.heroArrow} onClick={() => handleHeroSlideChange("prev")}>
            <ChevronLeft />
          </IconButton>
          <IconButton className={classes.heroArrow} onClick={() => handleHeroSlideChange("next")}>
            <ChevronRight />
          </IconButton>
        </div>
      </section>

      {/* Formulario de Reserva */}
      <div className={classes.bookingFormContainer}>
        <Paper className={classes.bookingForm} elevation={3}>
          <Typography variant="h5" className={classes.bookingFormTitle}>
            Reserva tu estancia
          </Typography>
          <div className={classes.bookingFormInner}>
            <TextField
              className={classes.bookingInput}
              label="Fecha de entrada"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split("T")[0] }}
              value={reservationForm.fecha_inicio}
              onChange={(e) => {
                const today = new Date().toISOString().split("T")[0]
                const selectedDate = e.target.value

                if (selectedDate < today) {
                  Swal.fire({
                    title: "Fecha inválida",
                    text: "La fecha de entrada debe ser hoy o posterior",
                    icon: "warning",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  })
                  return
                }

                setReservationForm({ ...reservationForm, fecha_inicio: e.target.value })
              }}
            />
            <TextField
              className={classes.bookingInput}
              label="Fecha de salida"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: reservationForm.fecha_inicio || new Date().toISOString().split("T")[0] }}
              value={reservationForm.fecha_fin}
              onChange={(e) => {
                const entryDate = reservationForm.fecha_inicio
                const selectedDate = e.target.value

                if (entryDate && selectedDate <= entryDate) {
                  Swal.fire({
                    title: "Fecha inválida",
                    text: "La fecha de salida debe ser posterior a la fecha de entrada",
                    icon: "warning",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  })
                  return
                }

                setReservationForm({ ...reservationForm, fecha_fin: e.target.value })
              }}
            />
            <TextField
              className={classes.bookingInput}
              label="Huéspedes"
              type="number"
              variant="outlined"
              InputProps={{ inputProps: { min: 1, max: 10 } }}
              value={reservationForm.acompanantes.length + 1} // +1 por el titular
              onChange={(e) => {
                const numHuespedes = Number.parseInt(e.target.value) - 1 // -1 porque el titular no es acompañante
                if (numHuespedes < 0) return

                // Verificar si excede la capacidad máxima
                if (selectedApartamento && numHuespedes > selectedApartamento.capacidad - 1) {
                  Swal.fire({
                    title: "Límite de capacidad",
                    text: `Este apartamento tiene capacidad máxima para ${selectedApartamento.capacidad} personas (incluido el titular).`,
                    icon: "warning",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  })
                  return
                }

                // Ajustar la lista de acompañantes según el número de huéspedes
                let nuevosAcompanantes = [...reservationForm.acompanantes]
                if (numHuespedes < nuevosAcompanantes.length) {
                  // Reducir la lista
                  nuevosAcompanantes = nuevosAcompanantes.slice(0, numHuespedes)
                } else if (numHuespedes > nuevosAcompanantes.length) {
                  // Aumentar la lista
                  const acompanantesAdicionales = Array(numHuespedes - nuevosAcompanantes.length)
                    .fill(0)
                    .map(() => ({ nombre: "", apellido: "", documento: "" }))
                  nuevosAcompanantes = [...nuevosAcompanantes, ...acompanantesAdicionales]
                }

                setReservationForm({ ...reservationForm, acompanantes: nuevosAcompanantes })
              }}
            />
            <Button
              variant="contained"
              className={classes.bookingButton}
              onClick={() => scrollToSection(apartamentosRef)}
            >
              Buscar Disponibilidad
            </Button>
          </div>
        </Paper>
      </div>

      {/* Sección de Apartamentos */}
      <section className={classes.apartmentSection} ref={apartamentosRef}>
        <div className={classes.apartmentSectionBg}></div>
        <div style={{ width: "100%", padding: "60px 40px" }}>
          <Typography variant="h3" className={`${classes.sectionTitle} ${classes.sectionTitleUnderline}`}>
            Nuestros Apartamentos
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Descubre nuestras exclusivas opciones de alojamiento en El Poblado, diseñadas para brindarte la máxima
            comodidad y una experiencia inolvidable en Medellín.
          </Typography>

          {/* Filtros y búsqueda */}
          <div className={classes.apartmentFilters}>
            <Typography variant="h6" style={{ color: "#0A2463", fontWeight: 600 }}>
              Apartamentos Disponibles
            </Typography>
            <TextField
              className={classes.searchField}
              variant="outlined"
              placeholder="Buscar apartamentos..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search style={{ color: "#0A2463", marginRight: 8 }} />,
              }}
            />
            <Button
              variant="contained"
              style={{
                backgroundColor: "#0A2463",
                color: "#FFFAFF",
                marginLeft: "10px",
              }}
              onClick={toggleShowAllApartments}
            >
              {showAllApartments ? "Mostrar 6 apartamentos" : "Ver todos los apartamentos"}
            </Button>
          </div>

          {/* Grid de apartamentos */}
          <Grid container spacing={6}>
            {filteredApartamentos.length > 0 ? (
              filteredApartamentos.map((apartamento) => (
                <Grid item key={apartamento.id} xs={12} sm={6} md={4} lg={4}>
                  <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                    <Card className={classes.apartmentCard}>
                      <div className={classes.apartmentCardMedia}>
                        <img
                          src={apartamento.imagen || "/imagen-1.png"}
                          alt={apartamento.nombre}
                          onError={handleImageError}
                          data-apartment-type={apartamento.tipo}
                          data-apartment-tag={apartamento.tag}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onLoad={() => console.log("✅ Imagen cargada:", apartamento.imagen)}
                        />
                        <div
                          className={`${classes.apartmentTag} ${apartamento.tipo === "Penthouse" ? classes.luxuryTag : ""}`}
                        >
                          {apartamento.tag || apartamento.tipo}
                        </div>
                        <div className={classes.apartmentCardPrice}>${apartamento.precio} / noche</div>

                        <Button className={classes.viewButton} startIcon={<Visibility />}>
                          Ver tour 360°
                        </Button>
                      </div>

                      <CardContent className={classes.apartmentCardContent}>
                        <Typography variant="h5" className={classes.apartmentCardTitle}>
                          {apartamento.nombre}
                        </Typography>
                        <div className={classes.apartmentCardLocation}>
                          <LocationOn />
                          <Typography variant="body2">{apartamento.ubicacion}</Typography>
                        </div>
                        <div className={classes.apartmentCardFeatures}>
                          <div className={classes.apartmentCardFeature}>
                            <Person />
                            <span>{apartamento.capacidad} Huéspedes</span>
                          </div>
                          <div className={classes.apartmentCardFeature}>
                            <LocalHotel />
                            <span>
                              {apartamento.camas} {apartamento.camas > 1 ? "Camas" : "Cama"}
                            </span>
                          </div>
                          <div className={classes.apartmentCardFeature}>
                            <Bathtub />
                            <span>
                              {apartamento.banos} {apartamento.banos > 1 ? "Baños" : "Baño"}
                            </span>
                          </div>
                        </div>
                        <Box display="flex" flexWrap="wrap" mb={1}>
                          {apartamento.caracteristicas?.map((caracteristica, index) => (
                            <Chip key={index} label={caracteristica} size="small" className={classes.chip} />
                          ))}
                        </Box>
                        <div className={classes.apartmentCardActions}>
                          <Button
                            variant="contained"
                            className={classes.apartmentCardButton}
                            onClick={() => handleReservationOpen(apartamento)}
                          >
                            Reservar Ahora
                          </Button>
                          <IconButton
                            className={classes.favoriteButton}
                            onClick={() => handleFavoriteToggle(apartamento.id)}
                          >
                            {favorites.includes(apartamento.id) ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        </div>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))
            ) : (
              <Box width="100%" textAlign="center" py={4}>
                <Typography variant="h6" style={{ color: "#8D99AE" }}>
                  No se encontraron apartamentos que coincidan con tu búsqueda.
                </Typography>
              </Box>
            )}
          </Grid>
        </div>
      </section>

      {/* Sección Sobre Nosotros */}
      <section className={classes.aboutSection} ref={aboutRef}>
        <div className={classes.aboutPattern}></div>
        <div className={classes.sectionInner}>
          <Grid container spacing={6} alignItems="center" className={classes.aboutContent}>
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <div>
                  <Typography variant="h3" className={classes.aboutTitle}>
                    Sobre Nido Sky
                  </Typography>
                  <Typography variant="body1" className={classes.aboutText}>
                    Nido Sky es un refugio de lujo ubicado en El Poblado, la zona más exclusiva de Medellín. Nuestro
                    hotel combina la elegancia moderna con la calidez colombiana, ofreciendo a nuestros huéspedes una
                    experiencia única de descanso y confort.
                  </Typography>
                  <Typography variant="body1" className={classes.aboutText}>
                    Con vistas panorámicas a la ciudad, servicios de primera clase y atención personalizada, nos
                    esforzamos por hacer de su estancia una experiencia inolvidable en el corazón de la ciudad de la
                    eterna primavera.
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <div className={classes.aboutFeature}>
                      <CheckCircle className={classes.aboutFeatureIcon} />
                      <Typography variant="body1" className={classes.aboutFeatureText}>
                        Ubicación privilegiada en El Poblado, Medellín
                      </Typography>
                    </div>
                    <div className={classes.aboutFeature}>
                      <CheckCircle className={classes.aboutFeatureIcon} />
                      <Typography variant="body1" className={classes.aboutFeatureText}>
                        Servicio personalizado de alta calidad
                      </Typography>
                    </div>
                    <div className={classes.aboutFeature}>
                      <CheckCircle className={classes.aboutFeatureIcon} />
                      <Typography variant="body1" className={classes.aboutFeatureText}>
                        Apartamentos modernos y confortables
                      </Typography>
                    </div>
                    <div className={classes.aboutFeature}>
                      <CheckCircle className={classes.aboutFeatureIcon} />
                      <Typography variant="body1" className={classes.aboutFeatureText}>
                        Experiencia gastronómica excepcional
                      </Typography>
                    </div>
                  </Box>
                  <div className={classes.amenitiesRow}>
                    <div className={classes.amenityItem}>
                      <Pool /> Piscina
                    </div>
                  </div>
                  <div className={classes.amenitiesRow}>
                    <div className={classes.amenityItem}>
                      <Pool /> Piscina
                    </div>
                    <div className={classes.amenityItem}>
                      <Wifi /> WiFi Gratis
                    </div>
                    <div className={classes.amenityItem}>
                      <Spa /> Spa
                    </div>
                    <div className={classes.amenityItem}>
                      <FitnessCenter /> Gimnasio
                    </div>
                    <div className={classes.amenityItem}>
                      <Restaurant /> Restaurante
                    </div>
                  </div>
                </div>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/recepcion.png-XPx7tO9N6DKxWdsfId1Xajk9SrXgS8.jpeg"
                alt="Nido Sky"
                className={classes.aboutImage}
                onError={handleImageError}
              />
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Sección de Características */}
      <section className={classes.featuresSection} ref={featuresRef}>
        <div className={classes.featuresBg}></div>
        <div className={classes.sectionInner}>
          <Typography variant="h3" className={`${classes.sectionTitle} ${classes.sectionTitleUnderline}`}>
            Nuestras Comodidades
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Disfruta de nuestras instalaciones y servicios diseñados para hacer de tu estancia en Medellín una
            experiencia inolvidable.
          </Typography>
          <Grid container spacing={4} className={classes.featuresGrid}>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <Pool className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Piscina Infinity
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Disfruta de nuestra piscina con vistas panorámicas a la ciudad de Medellín.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <Wifi className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  WiFi de Alta Velocidad
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Conexión de fibra óptica en todas las áreas del hotel.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <Restaurant className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Restaurante Gourmet
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Gastronomía de primera clase con ingredientes locales y sabores internacionales.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <Spa className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Spa & Wellness
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Relájate con nuestros tratamientos exclusivos y terapias rejuvenecedoras.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <AcUnit className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Clima Controlado
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Temperatura ideal en todos nuestros apartamentos para tu máximo confort.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <FitnessCenter className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Gimnasio Completo
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Equipamiento moderno para mantenerte en forma durante tu estancia.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <LocalBar className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Bar &amp; Lounge
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Disfruta de cócteles exclusivos con las mejores vistas de la ciudad.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.featureItem}>
                <Security className={classes.featureIcon} />
                <Typography variant="h6" className={classes.featureTitle}>
                  Seguridad 24/7
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Vigilancia permanente y sistema de seguridad avanzado para tu tranquilidad.
                </Typography>
              </div>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className={classes.testimonialSection}>
        <div className={classes.testimonialPattern}></div>
        <div className={classes.sectionInner}>
          <Typography
            variant="h3"
            className={`${classes.sectionTitle} ${classes.sectionTitleLight} ${classes.sectionTitleUnderline}`}
          >
            Lo Que Dicen Nuestros Huéspedes
          </Typography>
          <Typography variant="body1" className={`${classes.sectionSubtitle} ${classes.sectionSubtitleLight}`}>
            Descubre las experiencias de quienes ya han disfrutado de nuestro hotel en El Poblado.
          </Typography>
          <Grid container spacing={4} className={classes.testimonialContainer}>
            {testimoniosEjemplo.map((testimonio) => (
              <Grid item key={testimonio.id} xs={12} md={4}>
                <div className={classes.testimonialCard}>
                  <div className={classes.testimonialRating}>{renderStars(testimonio.rating)}</div>
                  <Typography variant="body1" className={classes.testimonialText}>
                    {testimonio.comentario}
                  </Typography>
                  <div className={classes.testimonialAuthor}>
                    <img
                      src={testimonio.avatar || "/placeholder.svg"}
                      alt={testimonio.nombre}
                      className={classes.testimonialAvatar}
                      onError={handleImageError}
                    />
                    <div>
                      <Typography variant="subtitle1" className={classes.testimonialName}>
                        {testimonio.nombre}
                      </Typography>
                      <Typography variant="body2" className={classes.testimonialRole}>
                        {testimonio.rol}
                      </Typography>
                    </div>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      {/* Sección CTA */}
      <section className={classes.ctaSection}>
        <div className={classes.ctaPattern}></div>
        <div className={classes.sectionInner}>
          <div className={classes.ctaContent}>
            <Typography variant="h3" className={classes.ctaTitle}>
              ¿Listo para una experiencia inolvidable en Medellín?
            </Typography>
            <Typography variant="body1" className={classes.ctaText}>
              Reserve ahora y obtenga un 10% de descuento en su primera estancia en Nido Sky. Oferta por tiempo
              limitado.
            </Typography>
            <Button
              variant="contained"
              size="large"
              className={classes.ctaButton}
              onClick={() => scrollToSection(apartamentosRef)}
            >
              Reservar Ahora <ArrowForward style={{ marginLeft: 8 }} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={classes.footer} ref={contactRef}>
        <div className={classes.footerContent}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <div className={classes.footerLogo}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png"
                  alt="Nido Sky"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/50x50?text=Logo"
                  }}
                />
              </div>
              <Typography variant="body2" className={classes.footerText}>
                Ofreciendo experiencias de lujo y confort en El Poblado, Medellín. Nuestro compromiso es hacer de su
                estancia una experiencia inolvidable en la ciudad de la eterna primavera.
              </Typography>
              <div className={classes.footerSocial}>
                <IconButton className={classes.footerSocialIcon} size="small">
                  <Facebook />
                </IconButton>
                <IconButton className={classes.footerSocialIcon} size="small">
                  <Instagram />
                </IconButton>
                <IconButton className={classes.footerSocialIcon} size="small">
                  <Twitter />
                </IconButton>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div className={classes.footerContact}>
                <Room />
                <Typography variant="body2" className={classes.footerContactText}>
                  Calle 10 #43E-25, El Poblado, Medellín
                </Typography>
              </div>
              <div className={classes.footerContact}>
                <Phone />
                <Typography variant="body2" className={classes.footerContactText}>
                  +57 (4) 444-5555
                </Typography>
              </div>
              <div className={classes.footerContact}>
                <Email />
                <Typography variant="body2" className={classes.footerContactText}>
                  info@nidosky.com
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" className={classes.footerTitle}>
                Enlaces
              </Typography>
              <div className={classes.footerLink} onClick={() => scrollToSection(apartamentosRef)}>
                <ArrowForward />
                Apartamentos
              </div>
              <div className={classes.footerLink} onClick={() => scrollToSection(aboutRef)}>
                <ArrowForward />
                Nosotros
              </div>
              <div className={classes.footerLink} onClick={() => scrollToSection(featuresRef)}>
                <ArrowForward />
                Servicios
              </div>
              <div className={classes.footerLink} onClick={() => scrollToSection(contactRef)}>
                <ArrowForward />
                Contacto
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" className={classes.footerTitle}>
                Servicios
              </Typography>
              <div className={classes.footerLink}>
                <ArrowForward />
                Reservas
              </div>
              <div className={classes.footerLink}>
                <ArrowForward />
                Concierge
              </div>
              <div className={classes.footerLink}>
                <ArrowForward />
                Spa & Wellness
              </div>
              <div className={classes.footerLink}>
                <ArrowForward />
                Restaurante
              </div>
            </Grid>
          </Grid>
          <div className={classes.footerBottom}>
            <Typography variant="body2" className={classes.footerCopyright}>
              © 2024 Nido Sky. Todos los derechos reservados.
            </Typography>
            <div className={classes.footerBottomLinks}>
              <Typography variant="body2" className={classes.footerBottomLink}>
                Política de Privacidad
              </Typography>
              <Typography variant="body2" className={classes.footerBottomLink}>
                Términos y Condiciones
              </Typography>
              <Typography variant="body2" className={classes.footerBottomLink}>
                Cookies
              </Typography>
            </div>
          </div>
        </div>
      </footer>

      {/* Diálogo de Reserva */}
      <Dialog
        open={reservationDialogOpen}
        onClose={handleReservationClose}
        maxWidth="md"
        fullWidth
        className={classes.reservationDialog}
        keepMounted
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle className={classes.reservationDialogTitle} disableTypography>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Reservar {selectedApartamento?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.reservationDialogContent}>
          <div className={classes.reservationForm}>
            {/* Datos del titular */}
            <Typography variant="h6" style={{ marginBottom: theme.spacing(2), color: "#0A2463" }}>
              Datos del titular
            </Typography>

            <TextField
              select
              label="Tipo de documento"
              name="tipo_documento"
              value={reservationForm.tipo_documento || "cedula"}
              onChange={handleReservationFormChange}
              className={classes.reservationField}
              variant="outlined"
              fullWidth
              required
              style={{ marginBottom: "16px" }}
            >
              <MenuItem value="cedula">Cédula de Ciudadanía</MenuItem>
              <MenuItem value="pasaporte">Pasaporte</MenuItem>
              <MenuItem value="tarjeta_identidad">Tarjeta de Identidad</MenuItem>
            </TextField>

            <TextField
              label="Documento de identidad"
              name="documento"
              value={reservationForm.documento || ""}
              onChange={handleReservationFormChange}
              className={classes.reservationField}
              variant="outlined"
              fullWidth
              required
              inputProps={{
                maxLength: 12,
                pattern: "[0-9]*",
                onInput: (e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "")
                },
              }}
              helperText={formErrors.documento || "Solo números, 6-12 dígitos"}
              error={!!formErrors.documento}
            />

            <TextField
              label="Nombre completo del titular"
              name="titular_reserva"
              value={reservationForm.titular_reserva}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, "")
                const event = {
                  target: {
                    name: "titular_reserva",
                    value: value,
                  },
                }
                handleReservationFormChange(event)
              }}
              className={classes.reservationField}
              variant="outlined"
              fullWidth
              required
              inputProps={{
                maxLength: 60,
              }}
              helperText={formErrors.titular_reserva || "Solo letras, máximo 60 caracteres"}
              error={!!formErrors.titular_reserva}
            />

            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              value={reservationForm.email}
              onChange={handleReservationFormChange}
              className={classes.reservationField}
              variant="outlined"
              fullWidth
              required
              helperText={formErrors.email || "Formato: ejemplo@dominio.com"}
              error={!!formErrors.email}
            />

            <TextField
              label="Teléfono"
              name="telefono"
              value={reservationForm.telefono}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9+]/g, "")
                const event = {
                  target: {
                    name: "telefono",
                    value: value,
                  },
                }
                handleReservationFormChange(event)
              }}
              className={classes.reservationField}
              variant="outlined"
              fullWidth
              required
              inputProps={{
                maxLength: 15,
              }}
              helperText={formErrors.telefono || "Solo números y +, 8-15 dígitos"}
              error={!!formErrors.telefono}
            />

            {/* Datos de la reserva */}
            <Typography
              variant="h6"
              style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(2), color: "#0A2463" }}
            >
              Datos de la reserva
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de inicio"
                  name="fecha_inicio"
                  type="date"
                  value={reservationForm.fecha_inicio}
                  onChange={handleReservationFormChange}
                  className={classes.reservationField}
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  helperText={formErrors.fecha_inicio || "Seleccione una fecha disponible"}
                  error={!!formErrors.fecha_inicio}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de fin"
                  name="fecha_fin"
                  type="date"
                  value={reservationForm.fecha_fin}
                  onChange={handleReservationFormChange}
                  className={classes.reservationField}
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: reservationForm.fecha_inicio || new Date().toISOString().split("T")[0] }}
                  helperText={formErrors.fecha_fin || "Seleccione una fecha de salida"}
                  error={!!formErrors.fecha_fin}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: theme.spacing(1) }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Noches de estadía"
                  type="number"
                  name="noches_estadia"
                  value={calcularNochesEstadia()}
                  className={classes.reservationField}
                  variant="outlined"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total a pagar"
                  type="number"
                  name="total"
                  value={calcularPrecioTotal()}
                  className={classes.reservationField}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    startAdornment: <span style={{ marginRight: theme.spacing(1) }}>$</span>,
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: theme.spacing(1) }}>
              <Grid item xs={12}>
                <TextField
                  label="Monto a pagar (50% mínimo)"
                  type="number"
                  name="monto_pago"
                  value={reservationForm.monto_pago}
                  onChange={handleReservationFormChange}
                  className={classes.reservationField}
                  variant="outlined"
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: calcularPrecioTotal() * 0.5, max: calcularPrecioTotal() },
                    startAdornment: <span style={{ marginRight: theme.spacing(1) }}>$</span>,
                  }}
                  helperText={formErrors.monto_pago || `Mínimo 50%: $${(calcularPrecioTotal() * 0.5).toFixed(2)}`}
                  error={!!formErrors.monto_pago}
                />
              </Grid>
            </Grid>

            {/* Sección para subir comprobante de pago */}
            <div className={classes.uploadSection}>
              <Typography variant="h6" className={classes.uploadTitle}>
                <CloudUpload style={{ marginRight: theme.spacing(1) }} /> Comprobante de Pago
              </Typography>

              {/* Contenedor flex horizontal para poner la info y el botón lado a lado */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: theme.spacing(2) }}>
                {/* Información de pago a la izquierda */}
                <div className={classes.paymentInfo} style={{ flex: 1 }}>
                  <Typography variant="subtitle1" className={classes.paymentInfoTitle}>
                    <InfoOutlined style={{ marginRight: theme.spacing(1) }} /> Información de Pago
                  </Typography>
                  <Typography variant="body2" className={classes.paymentInfoText}>
                    Para confirmar su reserva, debe realizar un pago del 50% del valor total.
                  </Typography>
                  <Typography variant="body2" className={classes.paymentInfoText}>
                    <strong>Banco:</strong> Bancolombia
                  </Typography>
                  <Typography variant="body2" className={classes.paymentInfoText}>
                    <strong>Cuenta:</strong> 123-456789-00
                  </Typography>
                  <Typography variant="body2" className={classes.paymentInfoText}>
                    <strong>Titular:</strong> Nido Sky S.A.S.
                  </Typography>
                  <Typography variant="body2" className={classes.paymentInfoText}>
                    <strong>NIT:</strong> 900.123.456-7
                  </Typography>
                </div>

                {/* Botón y vista previa a la derecha */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "200px" }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className={classes.fileInput}
                    ref={fileInputRef}
                    onChange={handleComprobanteChange}
                  />

                  <Button
                    variant="contained"
                    className={classes.uploadButton}
                    onClick={handleUploadClick}
                    startIcon={<CloudUpload />}
                  >
                    Subir Comprobante
                  </Button>

                  {comprobantePago && (
                    <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                      {comprobantePreview && comprobantePago.type.includes("image") ? (
                        <img
                          src={comprobantePreview || "/placeholder.svg"}
                          alt="Vista previa"
                          className={classes.filePreview}
                          style={{ maxHeight: 100, maxWidth: "100%" }}
                        />
                      ) : (
                        <Description style={{ fontSize: 40, color: "#0A2463" }} />
                      )}
                      <Typography
                        variant="body2"
                        className={classes.fileName}
                        style={{ textAlign: "center", wordBreak: "break-word" }}
                      >
                        {comprobantePago.name}
                      </Typography>
                    </Box>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de acompañantes */}
            <div className={classes.acompanantesSection}>
              <Typography variant="h6" className={classes.acompanantesTitle}>
                <Person style={{ marginRight: theme.spacing(1) }} /> Acompañantes
              </Typography>

              {/* Añadir mensaje informativo sobre capacidad */}
              <Typography variant="body2" style={{ marginBottom: theme.spacing(2), color: "#8D99AE" }}>
                Este apartamento tiene capacidad para {selectedApartamento?.capacidad || 0} personas en total (incluido
                el titular). Puede agregar hasta {selectedApartamento ? selectedApartamento.capacidad - 1 : 0}{" "}
                acompañantes.
              </Typography>

              {reservationForm.acompanantes.map((acompanante, index) => (
                <div key={index} className={classes.acompananteItem}>
                  <IconButton
                    size="small"
                    className={classes.removeAcompananteButton}
                    onClick={() => handleRemoveAcompanante(index)}
                  >
                    <Close />
                  </IconButton>

                  <Typography variant="subtitle2" style={{ marginBottom: theme.spacing(1.5) }}>
                    Acompañante {index + 1}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Tipo de documento"
                        value={acompanante.tipo_documento_acompanante || "cedula"}
                        onChange={(e) => handleAcompananteChange(index, "tipo_documento_acompanante", e.target.value)}
                        className={classes.reservationField}
                        variant="outlined"
                        fullWidth
                        required
                      >
                        <MenuItem value="cedula">Cédula de Ciudadanía</MenuItem>
                        <MenuItem value="pasaporte">Pasaporte</MenuItem>
                        <MenuItem value="tarjeta_identidad">Tarjeta de Identidad</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nombre"
                        value={acompanante.nombre}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, "")
                          handleAcompananteChange(index, "nombre", value)
                        }}
                        className={classes.reservationField}
                        variant="outlined"
                        fullWidth
                        required
                        inputProps={{
                          maxLength: 60,
                        }}
                        helperText="Solo letras, máximo 60 caracteres"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Apellido"
                        value={acompanante.apellido}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, "")
                          handleAcompananteChange(index, "apellido", value)
                        }}
                        className={classes.reservationField}
                        variant="outlined"
                        fullWidth
                        required
                        inputProps={{
                          maxLength: 60,
                        }}
                        helperText="Solo letras, máximo 60 caracteres"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Documento"
                        value={acompanante.documento_acompanante || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "")
                          handleAcompananteChange(index, "documento_acompanante", value)
                        }}
                        className={classes.reservationField}
                        variant="outlined"
                        fullWidth
                        required
                        inputProps={{
                          maxLength: 12,
                          pattern: "[0-9]*",
                        }}
                        helperText="Solo números, máximo 12 dígitos"
                      />
                    </Grid>
                  </Grid>
                </div>
              ))}

              <Button
                variant="contained"
                startIcon={<Add />}
                className={classes.addAcompananteButton}
                onClick={handleAddAcompanante}
                disabled={
                  selectedApartamento && reservationForm.acompanantes.length >= selectedApartamento.capacidad - 1
                }
              >
                Agregar acompañante
              </Button>
            </div>

            {/* Resumen de la reserva */}
            {selectedApartamento && reservationForm.fecha_inicio && reservationForm.fecha_fin && (
              <div className={classes.reservationTotal}>
                <Typography variant="h6" className={classes.reservationTotalTitle}>
                  Resumen de Reserva
                </Typography>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body2" className={classes.reservationTotalLabel}>
                    Apartamento:
                  </Typography>
                  <Typography variant="body2" className={classes.reservationTotalValue}>
                    {selectedApartamento.nombre}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body2" className={classes.reservationTotalLabel}>
                    Precio por noche:
                  </Typography>
                  <Typography variant="body2" className={classes.reservationTotalValue}>
                    ${selectedApartamento.precio}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body2" className={classes.reservationTotalLabel}>
                    Noches:
                  </Typography>
                  <Typography variant="body2" className={classes.reservationTotalValue}>
                    {calcularNochesEstadia()}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body2" className={classes.reservationTotalLabel}>
                    Huéspedes:
                  </Typography>
                  <Typography variant="body2" className={classes.reservationTotalValue}>
                    {reservationForm.acompanantes.length + 1} {/* +1 por el titular */}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body1" className={classes.reservationTotalLabel}>
                    Total:
                  </Typography>
                  <Typography variant="body1" className={classes.reservationTotalFinal}>
                    ${calcularPrecioTotal()}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body1" className={classes.reservationTotalLabel}>
                    Pago inicial (50%):
                  </Typography>
                  <Typography variant="body1" className={classes.reservationTotalFinal}>
                    ${reservationForm.monto_pago}
                  </Typography>
                </div>
                <div className={classes.reservationTotalRow}>
                  <Typography variant="body1" className={classes.reservationTotalLabel}>
                    Saldo pendiente:
                  </Typography>
                  <Typography variant="body1" className={classes.reservationTotalFinal}>
                    ${calcularPrecioTotal() - reservationForm.monto_pago}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <div className={classes.reservationActions}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="text"
                className={classes.cancelButton}
                onClick={handleReservationClose}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                className={classes.reservationButton}
                onClick={handleReservationSubmit}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar Reserva"}
              </Button>
            </Grid>
          </Grid>
        </div>
      </Dialog>
    </div>
  )
}

export default Landing
