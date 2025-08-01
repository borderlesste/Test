const { pool, beginTransaction, commitTransaction, rollbackTransaction } = require('../config/db.js');

const orderService = {
  async getOrders(userId, role) {
    let query = `
      SELECT p.id, p.numero_pedido, p.cliente_id, c.nombre as cliente_nombre, p.descripcion, p.estado, p.prioridad, 
             p.subtotal, p.descuento, p.iva, p.total, p.anticipo, p.saldo_pendiente,
             p.fecha_inicio, p.fecha_entrega_estimada, p.fecha_entrega_real,
             p.notas_internas, p.created_by, p.assigned_to, p.created_at, p.updated_at
      FROM pedidos p
      JOIN usuarios c ON p.cliente_id = c.id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE p.cliente_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getOrderById(id) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.numero_pedido, p.cliente_id, c.nombre as cliente_nombre, p.descripcion, p.estado, p.prioridad,
              p.subtotal, p.descuento, p.iva, p.total, p.anticipo, p.saldo_pendiente,
              p.fecha_inicio, p.fecha_entrega_estimada, p.fecha_entrega_real,
              p.notas_internas, p.created_by, p.assigned_to, p.created_at, p.updated_at
       FROM pedidos p
       JOIN usuarios c ON p.cliente_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }
    return rows[0];
  },

  async updateOrderPartial(id, updateData) {
    const connection = await pool.getConnection();
    try {
      // Construir query dinámico basado en los campos a actualizar
      const fields = [];
      const values = [];
      
      if (updateData.descripcion !== undefined) {
        fields.push('descripcion = ?');
        values.push(updateData.descripcion);
      }
      if (updateData.estado !== undefined) {
        fields.push('estado = ?');
        values.push(updateData.estado);
      }
      if (updateData.prioridad !== undefined) {
        fields.push('prioridad = ?');
        values.push(updateData.prioridad);
      }
      if (updateData.total !== undefined) {
        fields.push('total = ?');
        values.push(updateData.total);
      }
      if (updateData.fecha_entrega_estimada !== undefined) {
        fields.push('fecha_entrega_estimada = ?');
        values.push(updateData.fecha_entrega_estimada);
      }
      
      // Siempre actualizar updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id); // Para el WHERE
      
      if (fields.length === 1) { // Solo updated_at
        throw new Error('No hay campos para actualizar');
      }
      
      const query = `UPDATE pedidos SET ${fields.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Pedido no encontrado');
      }
      
      // Devolver el pedido actualizado
      return await this.getOrderById(id);
      
    } finally {
      connection.release();
    }
  },

  async createOrder(cliente_id, servicio, descripcion) {
    const [result] = await pool.query(
      'INSERT INTO pedidos (cliente_id, servicio, descripcion) VALUES (?, ?, ?)',
      [cliente_id, servicio, descripcion]
    );
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async updateOrder(id, descripcion, estado, prioridad, total, fecha_entrega_estimada) {
    let connection;
    try {
      if (estado === 'Completado') {
        connection = await beginTransaction();

        // 1. Actualizar el pedido
        const [orderUpdateResult] = await connection.query(
          'UPDATE pedidos SET descripcion = ?, estado = ?, prioridad = ?, total = ?, fecha_entrega_estimada = ? WHERE id = ?',
          [descripcion, estado, prioridad, total, fecha_entrega_estimada, id]
        );
        if (orderUpdateResult.affectedRows === 0) {
          throw new Error('Pedido no encontrado.');
        }
        
        const [updatedOrderRows] = await connection.query('SELECT * FROM pedidos WHERE id = ?', [id]);
        const updatedOrder = updatedOrderRows[0];

        // 2. Buscar pagos asociados al pedido
        const [paymentsResult] = await connection.query(
          'SELECT * FROM pagos WHERE pedido_id = ?',
          [id]
        );

        // 3. Actualizar el estado de los pagos a 'Pendiente' si no están ya en un estado final
        for (const payment of paymentsResult) {
          if (!['Pagado', 'Vencido', 'Rechazado'].includes(payment.estado)) {
            await connection.query(
              "UPDATE pagos SET estado = 'Pendiente' WHERE id = ?",
              [payment.id]
            );
          }
        }

        await commitTransaction(connection);
        return updatedOrder;
      } else {
        // Lógica de actualización normal si el estado no es 'Completado'
        const [result] = await pool.query(
          'UPDATE pedidos SET descripcion = ?, estado = ?, prioridad = ?, total = ?, fecha_entrega_estimada = ? WHERE id = ?',
          [descripcion, estado, prioridad, total, fecha_entrega_estimada, id]
        );
        if (result.affectedRows === 0) {
          throw new Error('Pedido no encontrado.');
        }
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
        return rows[0];
      }
    } catch (err) {
      if (connection) {
        await rollbackTransaction(connection);
      }
      throw err;
    }
  },

  async deleteOrder(id) {
    const [result] = await pool.execute('DELETE FROM pedidos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Pedido no encontrado');
    }
    return { message: `Pedido con id ${id} eliminado correctamente` };
  },

  async cancelOrderClient(id, cliente_id) {
    const [orderResult] = await pool.query('SELECT * FROM pedidos WHERE id = ? AND cliente_id = ?', [id, cliente_id]);

    if (orderResult.length === 0) {
      throw new Error('Pedido no encontrado o no autorizado.');
    }

    await pool.query(
      "UPDATE pedidos SET estado = 'Cancelado' WHERE id = ?",
      [id]
    );
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    return rows[0];
  },

  async resumeOrderClient(id, cliente_id) {
    const [orderResult] = await pool.query('SELECT * FROM pedidos WHERE id = ? AND cliente_id = ?', [id, cliente_id]);

    if (orderResult.length === 0) {
      throw new Error('Pedido no encontrado o no autorizado.');
    }

    if (orderResult[0].estado !== 'Cancelado') {
      throw new Error('Solo se pueden reanudar pedidos cancelados.');
    }

    await pool.query(
      "UPDATE pedidos SET estado = 'Pendiente' WHERE id = ?",
      [id]
    );
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = { orderService };
