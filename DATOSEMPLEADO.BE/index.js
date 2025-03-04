require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const { check, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de conexión a MySQL usando variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME    
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    process.exit(1);
  }
  console.log('Conexión a MySQL exitosa');
});

app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Permitir solicitudes desde ambos puertos
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Usa el middleware cors con las opciones configuradas



/* --------------------------------------------------------------------------
   ENDPOINTS REST
-------------------------------------------------------------------------- */

// GET /colaborador: Retorna todos los colaboradores en formato JSON.
app.get('/colaborador', (req, res) => {
  connection.query('SELECT * FROM COLABORADOR', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los datos' });
    }
    res.json(results);
  });
});

// POST /colaborador: Agrega un nuevo colaborador con validación de datos.
app.post('/colaborador', [
  check('NOMBRE').notEmpty().withMessage('El campo NOMBRE es obligatorio'),
  check('APELLIDO').notEmpty().withMessage('El campo APELLIDO es obligatorio'),
  check('EDAD').isInt({ gt: 0 }).withMessage('El campo EDAD debe ser un número mayor a 0')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { NOMBRE, APELLIDO, DIRECCION, EDAD, PROFESION, ESTADOCIVIL } = req.body;
  const sql = `INSERT INTO COLABORADOR (NOMBRE, APELLIDO, DIRECCION, EDAD, PROFESION, ESTADOCIVIL)
               VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [NOMBRE, APELLIDO, DIRECCION, EDAD, PROFESION, ESTADOCIVIL], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al insertar el colaborador' });
    }
    res.status(201).json({ message: 'Colaborador agregado', id: result.insertId });
  });
});

// PUT /colaborador/:id: Actualiza los datos de un colaborador existente.
app.put('/colaborador/:id', [
  // Validaciones opcionales: si se envía el campo, debe cumplir la validación
  check('NOMBRE').optional().notEmpty().withMessage('El campo NOMBRE no puede estar vacío'),
  check('APELLIDO').optional().notEmpty().withMessage('El campo APELLIDO no puede estar vacío'),
  check('EDAD').optional().isInt({ gt: 0 }).withMessage('El campo EDAD debe ser un número mayor a 0')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { NOMBRE, APELLIDO, DIRECCION, EDAD, PROFESION, ESTADOCIVIL } = req.body;

  // Construir dinámicamente la consulta de actualización según los campos enviados
  let fields = [];
  let values = [];
  if (NOMBRE) { fields.push('NOMBRE = ?'); values.push(NOMBRE); }
  if (APELLIDO) { fields.push('APELLIDO = ?'); values.push(APELLIDO); }
  if (DIRECCION) { fields.push('DIRECCION = ?'); values.push(DIRECCION); }
  if (EDAD) { fields.push('EDAD = ?'); values.push(EDAD); }
  if (PROFESION) { fields.push('PROFESION = ?'); values.push(PROFESION); }
  if (ESTADOCIVIL) { fields.push('ESTADOCIVIL = ?'); values.push(ESTADOCIVIL); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  values.push(id);
  const sql = `UPDATE COLABORADOR SET ${fields.join(', ')} WHERE IDCOLABORADOR = ?`;
  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el colaborador' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json({ message: 'Colaborador actualizado' });
  });
});

// DELETE /colaborador/:id: Elimina un colaborador por su ID.
app.delete('/colaborador/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM COLABORADOR WHERE IDCOLABORADOR = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el colaborador' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json({ message: 'Colaborador eliminado' });
  });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});