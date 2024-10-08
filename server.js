const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');

dotenv.config();

const app = express(); // Asegúrate de que esta línea esté presente

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de la sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-aqui',
  resave: false,
  saveUninitialized: true,
}));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'formulario'
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para guardar datos
app.post('/guardar', [
  body('nombre').notEmpty().withMessage('Nombre es obligatorio'),
  body('celular').notEmpty().withMessage('Celular es obligatorio'),
  body('correo').isEmail().withMessage('Correo no válido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, celular, correo, ...respuestas } = req.body;

  const queryVerificarCorreo = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(queryVerificarCorreo, [correo], (err, results) => {
    if (err) return res.status(500).send('Error en el servidor.');

    if (results.length > 0) {
      return res.status(409).send('El correo electrónico ya está registrado.');
    }

    const queryUsuario = 'INSERT INTO usuarios (nombre, celular, correo) VALUES (?, ?, ?)';
    db.query(queryUsuario, [nombre, celular, correo], (err, result) => {
      if (err) return res.status(500).send('Error en el servidor.');

      const usuarioId = result.insertId;
      const queryRespuesta = `
        INSERT INTO respuesta (usuario_id, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const valoresRespuesta = [
        usuarioId,
        respuestas.p1 || null,
        respuestas.p2 || null,
        respuestas.p3 || null,
        respuestas.p4 || null,
        respuestas.p5 || null,
        respuestas.p6 || null,
        respuestas.p7 || null,
        respuestas.p8 || null,
        respuestas.p9 || null,
        respuestas.p10 || null,
        respuestas.p11 || null,
        respuestas.p12 || null,
        respuestas.p13 || null,
        respuestas.p14 || null,
        respuestas.p15 || null,
        respuestas.p16 || null,
        respuestas.p17 || null,
        respuestas.p18 || null
      ];

      db.query(queryRespuesta, valoresRespuesta, (err) => {
        if (err) {
          console.error('Error al insertar respuestas en la base de datos:', err);
          return res.status(500).send('Error en el servidor.');
        }
        res.redirect('/confirmacion.html'); // Redireccionar a la página de confirmación
      });
    });
  });
});

// Ruta para iniciar sesión
app.post('/login', [
  body('correo').isEmail().withMessage('Correo no válido'),
  body('contrasena').notEmpty().withMessage('Contraseña es obligatoria')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { correo, contrasena } = req.body;
  const query = 'SELECT * FROM administradores WHERE correo = ?';

  db.query(query, [correo], (err, results) => {
    if (err) return res.status(500).send('Error en el servidor.');

    if (results.length === 0) {
      console.log('Usuario no encontrado:', correo);
      return res.redirect('/inicio-session.html.');
    }

    const usuario = results[0];

    // Verificar la contraseña usando bcrypt
    bcrypt.compare(contrasena, usuario.contrasena, (err, isMatch) => {
      if (err) {
        console.error('Error al verificar la contraseña:', err);
        return res.status(500).send('Error en el servidor.');
      }

      if (!isMatch) {
        console.log('Contraseña incorrecta para el usuario:', correo);
        return res.redirect('/inicio-session.html.');
      }

      // Si las credenciales son correctas
      req.session.usuarioId = usuario.id;
      res.redirect('/admin.html'); // Redirigir a la página admin
    });
  });
});

// Ruta para obtener las respuestas
app.get('/respuestas', (req, res) => {
  const query = `
      SELECT r.id, u.nombre, u.correo, r.p1, r.p2, r.p3, r.p4, r.p5, r.p6, r.p7, r.p8, r.p9, r.p10, r.p11, r.p12, r.p13, r.p14, r.p15, r.p16, r.p17, r.p18
      FROM respuesta r
      JOIN usuarios u ON r.usuario_id = u.id
  `;
  
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener las respuestas:', err);
          return res.status(500).send('Error en el servidor.');
      }
      res.json(results);
  });
});


// Ruta para obtener respuestas por ID de usuario
app.get('/respuestas/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18 FROM respuesta WHERE usuario_id = ?';
  
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Error al obtener respuestas:', err);
          return res.status(500).send('Error en el servidor.');
      }
      res.json(results[0]); // Asumiendo que solo habrá una fila por usuario
  });
});


// Middleware para verificar la sesión
function verificarSesion(req, res, next) {
  if (req.session.usuarioId) {
      next(); // Si está autenticado, continuar
  } else {
      res.redirect('/'); // Si no, redirigir a la página de inicio
  }
}

// Aplica el middleware a la ruta de cierre de sesión
app.post('/logout', verificarSesion, (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error('Error al cerrar sesión:', err);
          return res.status(500).send('Error en el servidor.');
      }
      res.redirect('/'); // Redirigir a la página de inicio después de cerrar sesión
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
