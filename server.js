// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Habilitamos CORS para cualquier origen (puedes restringirlo si quieres)
app.use(cors());

// 2. Middleware para parsear JSON
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// 3. Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true
});

// 4. Definición del esquema y modelo
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

// 5. Rutas de autenticación (no tocamos)
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

// 6. Crear producto
app.post("/productos", async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Listar todos los productos
app.get("/productos", async (req, res) => {
  try {
    const lista = await Producto.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// **8. Obtener un producto por su _id** ← Esto faltaba
app.get("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Producto.findById(id);
    if (!prod) return res.status(404).json({ success: false, message: "No encontrado" });
    res.json(prod);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Borrar producto
app.delete("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
