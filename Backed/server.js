
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const ADMIN_USER = "Valentina diez";
const ADMIN_PASS = "Valen.1020";

app.post('/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (usuario === ADMIN_USER && clave === ADMIN_PASS) {
    return res.status(200).json({ success: true, token: "admin_token" });
  }
  res.status(401).json({ success: false, message: "Credenciales incorrectas" });
});

app.listen(PORT, () => {
  console.log(`Servidor autenticación corriendo en http://localhost:${PORT}`);
});
