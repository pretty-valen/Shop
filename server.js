// server.js
const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ——— 1) CORS ———
// Permitimos llamadas desde cualquier origen.
// Si quieres restringirlo solo a tu GH Pages, reemplaza `app.use(cors())` por:
//   app.use(cors({ origin: 'https://pretty-valen.github.io' }));
app.use(cors());

// ——— 2) Body parsing ———
app.use(express.json({    limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ——— 3) Conexión a MongoDB Atlas ———
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser:  true,
  useUnifiedTopology: true,
  ssl: true
});

// ——— 4) Modelo ———
const productoSchema = new mongoose.Schema({
  nombre:      String,
  categoria:   String,
  precio:      Number,
  descripcion: String,
  descuento:   Number,
  fotos:       [String],
  marcas:      [String],
  productos:   [String],
  isPack:      Boolean,
  talla:       String,
  genero:      String
});
const Producto = mongoose.model('Producto', productoSchema);

// ——— 5) RUTAS ———

// login
app.post('/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (
    usuario === process.env.ADMIN_USER &&
    clave   === process.env.ADMIN_PASS
  ) {
    return res.status(200).json({ success: true, token: 'admin_token' });
  }
  res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

// crear producto
app.post('/productos', async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// listar todos
app.get('/productos', async (req, res) => {
  try {
    const lista = await Producto.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ——— **nueva ruta** GET por ID ———
app.get('/productos/:id', async (req, res) => {
  try {
    const prod = await Producto.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json(prod);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// borrar por ID
app.delete('/productos/:id', async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor de productos corriendo en http://localhost:${PORT}`);
});
