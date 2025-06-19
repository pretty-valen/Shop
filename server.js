// server.js

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app  = express();
const PORT = process.env.PORT || 3000;

/** ────────── 1. MIDDLEWARES ────────── **/

// Permitir CORS desde cualquier origen (ajusta origin si necesitas restringirlo)
app.use(cors());

// Parsear JSON y URL-encoded con límite de 100MB
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

/** ────────── 2. CONEXIÓN A MONGODB ────────── **/

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
  ssl:                true
})
.then(() => console.log('🔌 Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

/** ────────── 3. DEFINICIÓN DEL MODELO ────────── **/

const productoSchema = new mongoose.Schema({
  nombre:       { type: String,  required: true },
  categoria:    { type: String,  required: true },
  precio:       { type: Number,  required: true },
  descripcion:  { type: String },
  descuento:    { type: Number,  default: 0 },
  fotos:        { type: [String], default: [] },
  marcas:       { type: [String], default: [] },
  productos:    { type: [String], default: [] },
  isPack:       { type: Boolean, default: false },
  talla:        { type: String },
  genero:       { type: String }
}, { timestamps: true });

const Producto = mongoose.model('Producto', productoSchema);

/** ────────── 4. RUTAS ────────── **/

// --------- 4.1 Auth ---------
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

// --------- 4.2 Crear producto ---------
app.post('/productos', async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ success: true, producto: nuevo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------- 4.3 Listar todos los productos ---------
app.get('/productos', async (req, res) => {
  try {
    const lista = await Producto.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------- 4.4 Obtener un producto por su _id ---------
app.get('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Producto.findById(id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json(prod);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------- 4.5 Borrar un producto ---------
app.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** ────────── 5. INICIAR SERVIDOR ────────── **/

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
