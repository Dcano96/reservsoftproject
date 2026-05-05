const multer = require("multer")
const path = require("path")
const fs = require("fs")

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "comprobantes")

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40)
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `comprobante-${unique}-${safeBase}${ext}`)
  },
})

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
  cb(new Error("Formato de comprobante no permitido. Use JPG, PNG, WEBP, GIF o PDF."))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

module.exports = {
  uploadComprobante: upload.single("comprobante"),
  UPLOAD_DIR,
}
