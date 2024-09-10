const express = require('express');
const mysql = require('mysql');
const path = require('path'); 

const app = express();
const port = 3000;

// Middleware para procesar formularios (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Middleware para procesar JSON (si es necesario)
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'formulario'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Servir el archivo de registro en la ruta /registro
app.get('/registro', (req, res) => {
  res.sendFile(__dirname + '/public/registro.html');
});

// Ruta para procesar el formulario
app.post('/guardar', (req, res) => {
  console.log('Datos recibidos del formulario:', req.body); // Verificar los datos recibidos

  const { nombre, telefono, email, ...respuestas } = req.body;

  if (!nombre || !telefono || !email) {
    return res.status(400).send('Faltan campos obligatorios.');
  }

  // Inserta el usuario en la base de datos
  const queryUsuario = 'INSERT INTO usuarios (nombre, telefono, email) VALUES (?, ?, ?)';
  db.query(queryUsuario, [nombre, telefono, email], (err, result) => {
    if (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      return res.status(500).send('Error en el servidor.');
    }

    const usuarioId = result.insertId;

    // Prepara las respuestas para la base de datos
    const respuestasArray = [
      { pregunta: '¿Cuál es la necesidad principal de tu producto?', respuesta: req.body.p1 },
      { pregunta: '¿Cuál es tu tipo de piel?', respuesta: req.body.p2 },
      { pregunta: 'Tipo de producto (Maquillaje o Cuidado de la piel)', respuesta: req.body.p3 },
      { pregunta: 'Consideraciones especiales:', respuesta: req.body.p4 },
      { pregunta: '¿Cuál es el rango de edad de tus clientes?', respuesta: req.body.p5 },
      { pregunta: '¿Quieres que tu producto sea sólido, líquido o semi-sólido?', respuesta: req.body.p6 },
      { pregunta: 'Líquido', respuesta: req.body.p7 },
      { pregunta: 'Semi-sólido', respuesta: req.body.p8 },
      { pregunta: '¿Es relevante para ti que el producto sea vegano?', respuesta: req.body.p9 },
      { pregunta: '¿Requieres alguna certificación?', respuesta: req.body.p10 },
      { pregunta: '¿Qué tipo de textura te gustaría que tuviera tu producto?', respuesta: req.body.p11 },
      { pregunta: '¿Qué viscosidad esperas del producto?', respuesta: req.body.p12 },
      { pregunta: '¿Es importante para ti que el producto tenga absorción rápida en la piel?', respuesta: req.body.p13 },
      { pregunta: '¿Quieres que tu producto tenga algún aroma?', respuesta: req.body.p14 },
      { pregunta: 'Opciones de aroma (si elige "Sí")', respuesta: req.body.p15 },
      { pregunta: '¿Tienes alguna preferencia en el color final de tu producto?', respuesta: req.body.p16 },
      { pregunta: '¿Cuál es el tiempo de vida que proyectas para el producto?', respuesta: req.body.p17 },
      { pregunta: 'Ingredientes que te gustaría evitar', respuesta: req.body.p18 }
    ];

    // Filtrar respuestas vacías o no definidas
    const valoresRespuestas = respuestasArray
      .filter(r => r.respuesta) // Asegurarse de que la respuesta no esté vacía
      .map(r => [usuarioId, r.pregunta, r.respuesta]);

    console.log('Valores para insertar en respuestas:', valoresRespuestas); // Verificar los valores que se van a insertar

    // Inserta las respuestas en la base de datos
    if (valoresRespuestas.length > 0) {
      db.query('INSERT INTO respuestas (usuario_id, pregunta, respuesta) VALUES ?', [valoresRespuestas], (err) => {
        if (err) {
          console.error('Error al insertar respuestas en la base de datos:', err);
          return res.status(500).send('Error en el servidor.');
        }
        
        // Redirige a la página de confirmación
        res.redirect('/confirmacion.html');
      });
    } else {
      res.redirect('/confirmacion.html');
    }
  });
});

app.get('/confirmacion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'confirmacion.html'));
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});



// Ruta para obtener todas las preguntas y respuestas
// Ruta para obtener todas las preguntas y respuestas
app.get('/obtener_todas_respuestas', (req, res) => {
  const query = `
      SELECT usuarios.nombre, usuarios.telefono, usuarios.email, respuestas.pregunta, respuestas.respuesta
      FROM usuarios
      JOIN respuestas ON usuarios.id = respuestas.usuario_id
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener todas las respuestas:', err);
          return res.status(500).send('Error en el servidor.');
      }
      
      // Enviar los resultados como JSON
      res.json(results);
  });
});


//ver respuesta en la hoja 
// Ruta para obtener las respuestas de un usuario por su nombre
app.get('/obtener_respuestas/:nombre', (req, res) => {
  const nombreUsuario = req.params.nombre;

  const query = `
    SELECT usuarios.nombre, usuarios.telefono, usuarios.email, respuestas.pregunta, respuestas.respuesta 
    FROM usuarios 
    JOIN respuestas ON usuarios.id = respuestas.usuario_id
    WHERE usuarios.nombre LIKE ?
  `;

  db.query(query, [`%${nombreUsuario}%`], (err, results) => {
    if (err) {
      console.error('Error al obtener respuestas:', err);
      return res.status(500).send('Error en el servidor.');
    }
    
    res.json(results); // Enviar los resultados como JSON
  });
});
