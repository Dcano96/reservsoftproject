const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const pagoController = require("./pago.controller")

// ✅ NUEVO: Configuración de multer para subir comprobantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/comprobantes/"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, "comprobante-" + uniqueSuffix + extension)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de archivo no permitido. Use: JPG, PNG, GIF o WebP"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
})

// Rutas específicas primero (para evitar conflictos con parámetros)
router.get("/estadisticas", authMiddleware, roleMiddleware(), pagoController.getEstadisticas)
router.get("/historial/:reservaId", authMiddleware, roleMiddleware(), pagoController.getHistorialReserva)
router.post("/sincronizar", authMiddleware, roleMiddleware(), pagoController.sincronizarPagos)

// ✅ NUEVO: Endpoint para subir comprobantes
router.post("/subir-comprobante", authMiddleware, roleMiddleware(), upload.single("comprobante"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No se ha subido ningún archivo",
      })
    }

    const { pagoId } = req.body
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`
    const fileUrl = `${baseUrl}/uploads/comprobantes/${req.file.filename}`

    // Si se proporciona pagoId, actualizar el pago
    if (pagoId) {
      const Pago = require("./pago.model")
      const pago = await Pago.findByIdAndUpdate(
        pagoId,
        {
          comprobante: fileUrl,
          fecha_comprobante: new Date(),
        },
        { new: true },
      )

      if (!pago) {
        return res.status(404).json({
          success: false,
          msg: "Pago no encontrado",
        })
      }
    }

    res.json({
      success: true,
      msg: "Comprobante subido exitosamente",
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  } catch (error) {
    console.error("Error al subir comprobante:", error)

    // Eliminar archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      msg: "Error interno del servidor",
      error: error.message,
    })
  }
})

// Middleware para manejar errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        msg: "El archivo es demasiado grande. Máximo 5MB permitido",
      })
    }
  }

  if (error.message.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    })
  }

  next(error)
})

// Rutas generales después
router.post("/", authMiddleware, roleMiddleware(), pagoController.createPago)
router.get("/", authMiddleware, roleMiddleware(), pagoController.getPagos)
router.get("/:id", authMiddleware, roleMiddleware(), pagoController.getPagoById)
router.put("/:id", authMiddleware, roleMiddleware(), pagoController.updatePago)
router.delete("/:id", authMiddleware, roleMiddleware(), pagoController.anularPago)

module.exports = router
