const { pool } = require('../config/db.js');

const paymentService = {
  async getPayments(userId, role) {
    let query = `
      SELECT 
        p.id, p.cliente_id, c.nombre as clientName, 
        p.concepto as concept, p.monto as amount, p.metodo_pago as method, p.estado as status, p.fecha_pago as paymentDate, p.referencia as transactionId
      FROM pagos p
      JOIN usuarios c ON p.cliente_id = c.id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE p.cliente_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY p.fecha_pago DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getPaymentById(id) {
    const [rows] = await pool.query(
      `SELECT 
        p.id, p.cliente_id, c.nombre as clientName, 
        p.concepto as concept, p.monto as amount, p.metodo_pago as method, p.estado as status, p.fecha_pago as paymentDate, p.referencia as transactionId
       FROM pagos p
       JOIN usuarios c ON p.cliente_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Pago no encontrado');
    }
    return rows[0];
  },

  async createPayment(cliente_id, concepto, monto, metodo, estado, referencia) {
    const estadoCorregido = estado ? estado.toLowerCase() : 'pendiente';
    const [result] = await pool.query(
      'INSERT INTO pagos (numero_pago, cliente_id, concepto, monto, metodo_pago, estado, referencia, fecha_pago) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [`PAY-${Date.now()}`, cliente_id, concepto, monto, metodo, estadoCorregido, referencia]
    );
    const [rows] = await pool.query('SELECT * FROM pagos WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async updatePayment(id, cliente_id, concepto, monto, metodo, estado, referencia) {
    const estadoCorregido = estado ? estado.toLowerCase() : 'pendiente';
    const [result] = await pool.query(
      'UPDATE pagos SET cliente_id = ?, concepto = ?, monto = ?, metodo_pago = ?, estado = ?, referencia = ? WHERE id = ?',
      [cliente_id, concepto, monto, metodo, estadoCorregido, referencia, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Pago no encontrado.');
    }
    const [rows] = await pool.query('SELECT * FROM pagos WHERE id = ?', [id]);
    return rows[0];
  },

  async deletePayment(id) {
    const [result] = await pool.query('DELETE FROM pagos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Pago no encontrado');
    }
    return { message: `Pago con id ${id} eliminado correctamente` };
  }
};

module.exports = { paymentService };
