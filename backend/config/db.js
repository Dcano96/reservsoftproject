const mongoose = require("mongoose")

// Desactivar la advertencia de depreciación
mongoose.set("strictQuery", true)

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB conectado")
  } catch (error) {
    console.error("Error conectando a MongoDB", error)
    process.exit(1)
  }
}

module.exports = connectDB
