const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.js');

const JWT_SECRET = process.env.JWT_SECRET || 'Wop39Jd!lf0d$w9v1qXL4#dOl1wP';

const authService = {
  async registerUser({ nombre, direccion, telefono, email, password, empresa, rfc }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userCountResult] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    const userCount = userCountResult[0].count;
    const rol = userCount === 0 ? 'admin' : 'cliente';

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, direccion, telefono, email, password, empresa, rfc, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, direccion, telefono, email, hashedPassword, empresa || null, rfc || null, rol, 'activo']
    );
    const userId = result.insertId;

    const [userRows] = await pool.query('SELECT id, nombre, direccion, telefono, email, empresa, rfc, rol FROM usuarios WHERE id = ?', [userId]);
    const user = userRows[0];

    delete user.password;
    return { user };
  },

  async loginUser({ email, password }) {
    const [result] = await pool.query(
      'SELECT id, nombre, direccion, telefono, email, password, empresa, rfc, rol FROM usuarios WHERE email = ? AND estado = ?',
      [email, 'activo']
    );
    if (result.length === 0) {
      throw new Error('Credenciales inválidas.');
    }
    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas.');
    }

    delete user.password;
    return { user };
  },

  async changeUserPassword({ userId, oldPassword, newPassword }) {
    const [result] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const user = result[0];

    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Contraseña actual incorrecta.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
  },

  async getUserProfile(userId) {
    const [result] = await pool.query('SELECT id, nombre, direccion, telefono, email, empresa, rfc, rol FROM usuarios WHERE id = ?', [userId]);
    const user = result[0];

    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    return user;
  },

  async updateUserProfile({ userId, nombre, direccion, telefono, email, empresa, rfc }) {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, direccion = ?, telefono = ?, email = ?, empresa = ?, rfc = ? WHERE id = ?',
      [nombre, direccion, telefono, email, empresa || null, rfc || null, userId]
    );
    
    const [userRows] = await pool.query('SELECT id, nombre, direccion, telefono, email, empresa, rfc, rol FROM usuarios WHERE id = ?', [userId]);
    const user = userRows[0];

    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    return user;
  },

  async getAllUsers() {
    const [result] = await pool.query('SELECT id, nombre, email, empresa, rol FROM usuarios WHERE estado = ?', ['activo']);
    return result;
  }
};

module.exports = { authService };
