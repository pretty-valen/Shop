require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true
});



// Middleware con límite de carga aumentado
app.use(cors({
  origin: "https://pretty-valen.github.io"
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Modelo de producto
const productoSchema = new mongoose.Schema({
  nombre: String,
  categoria: String,
  precio: Number,
  descripcion: String,
  descuento: Number,
  fotos: [String],
  marcas: [String],
  productos: [String],
  isPack: Boolean,
  talla: String,
  genero: String
});
const Producto = mongoose.model("Producto", productoSchema);

// Ruta de login con variables de entorno
app.post('/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (
    usuario === process.env.ADMIN_USER &&
    clave === process.env.ADMIN_PASS
  ) {
    return res.status(200).json({ success: true, token: "admin_token" });
  }
  res.status(401).json({ success: false, message: "Credenciales incorrectas" });
});

// Guardar producto
app.post("/productos", async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener productos
app.get("/productos", async (req, res) => {
  const lista = await Producto.find();
  res.json(lista);
});

app.listen(PORT, () => {
  console.log(`Servidor autenticación corriendo en http://localhost:${PORT}`);
});
