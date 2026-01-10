const db = require('../config/database');

const pagosController = {
  // Obtener todos los pagos
  getAll: async (req, res) => {
    try {
      const { estado, concepto } = req.query;

      let query = `
        SELECT p.*, e.nombres, e.apellidos, e.numero_identificacion, e.nivel
        FROM pagos p
        INNER JOIN estudiantes e ON p.estudiante_id = e.id
        WHERE 1=1
      `;
      const params = [];

      if (estado) {
        query += ' AND p.estado = ?';
        params.push(estado);
      }

      if (concepto) {
        query += ' AND p.concepto = ?';
        params.push(concepto);
      }

      query += ' ORDER BY p.fecha_vencimiento DESC, e.apellidos, e.nombres';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener pagos' });
    }
  },

  // Obtener pago por ID
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT p.*, e.nombres, e.apellidos, e.numero_identificacion, e.nivel
        FROM pagos p
        INNER JOIN estudiantes e ON p.estudiante_id = e.id
        WHERE p.id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Obtener abonos si existen
      const [abonos] = await db.query(
        'SELECT * FROM abonos WHERE pago_id = ? ORDER BY fecha DESC',
        [req.params.id]
      );

      res.json({
        ...rows[0],
        abonos
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener pago' });
    }
  },

  // Obtener pagos por estudiante
  getByEstudiante: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM pagos WHERE estudiante_id = ? ORDER BY fecha_vencimiento DESC',
        [req.params.estudiante_id]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener pagos del estudiante' });
    }
  },

  // Crear pago
  create: async (req, res) => {
    try {
      const {
        id, estudiante_id, numero_recibo, concepto, descripcion_concepto, monto, 
        fecha_vencimiento, estado, metodo_pago, periodo, mes, año, observaciones,
        monto_pagado, saldo_pendiente, fecha_pago, numero_referencia
      } = req.body;

      // Validaciones
      if (!estudiante_id) {
        return res.status(400).json({ error: 'El estudiante_id es requerido' });
      }
      if (!numero_recibo) {
        return res.status(400).json({ error: 'El numero_recibo es requerido' });
      }
      if (!concepto) {
        return res.status(400).json({ error: 'El concepto es requerido' });
      }
      if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a cero' });
      }
      if (!fecha_vencimiento) {
        return res.status(400).json({ error: 'La fecha_vencimiento es requerida' });
      }
      if (!año) {
        return res.status(400).json({ error: 'El año es requerido' });
      }

      // Generar ID único si no se proporciona
      const pagoId = id || `pago${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calcular saldo_pendiente correctamente
      const montoPagado = monto_pagado || 0;
      const saldoPendienteCalculado = saldo_pendiente !== undefined 
        ? saldo_pendiente 
        : monto - montoPagado;

      console.log('Insertando pago con datos:', {
        pagoId,
        estudiante_id,
        numero_recibo,
        concepto,
        monto,
        fecha_vencimiento,
        estado: estado || 'pendiente',
        año
      });

      const [result] = await db.query(`
        INSERT INTO pagos (
          id, estudiante_id, numero_recibo, concepto, descripcion_concepto, monto,
          fecha_vencimiento, estado, metodo_pago, periodo, mes, año,
          monto_pagado, saldo_pendiente, fecha_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pagoId, estudiante_id, numero_recibo, concepto, descripcion_concepto || null, monto,
        fecha_vencimiento, estado || 'pendiente', metodo_pago || null, periodo || null, mes || null, año,
        montoPagado, saldoPendienteCalculado, fecha_pago || null
      ]);

      // Obtener el pago creado
      const [pagoCreado] = await db.query(
        'SELECT * FROM pagos WHERE id = ?',
        [pagoId]
      );

      if (!pagoCreado || pagoCreado.length === 0) {
        return res.status(500).json({ error: 'Error al recuperar el pago creado' });
      }

      res.status(201).json(pagoCreado[0]);
    } catch (error) {
      console.error('Error al crear pago:', error);
      // Devolver el mensaje de error específico de MySQL si está disponible
      const errorMessage = error.message || 'Error al crear pago';
      res.status(500).json({ 
        error: 'Error al crear pago',
        details: errorMessage 
      });
    }
  },

  // Actualizar pago
  update: async (req, res) => {
    try {
      const {
        numero_recibo, concepto, descripcion_concepto, monto, fecha_vencimiento, 
        estado, metodo_pago, periodo, mes, año
      } = req.body;

      await db.query(`
        UPDATE pagos SET
          numero_recibo = ?, concepto = ?, descripcion_concepto = ?, monto = ?,
          fecha_vencimiento = ?, estado = ?, metodo_pago = ?, periodo = ?,
          mes = ?, año = ?
        WHERE id = ?
      `, [
        numero_recibo, concepto, descripcion_concepto, monto, fecha_vencimiento,
        estado, metodo_pago, periodo, mes, año,
        req.params.id
      ]);

      res.json({ message: 'Pago actualizado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar pago' });
    }
  },

  // Registrar pago (cambiar estado a pagado)
  registrarPago: async (req, res) => {
    try {
      const {
        metodo_pago, fecha_pago
      } = req.body;

      // Obtener el pago
      const [pago] = await db.query('SELECT * FROM pagos WHERE id = ?', [req.params.id]);

      if (pago.length === 0) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      await db.query(`
        UPDATE pagos SET
          estado = 'pagado',
          metodo_pago = ?,
          fecha_pago = ?,
          monto_pagado = monto,
          saldo_pendiente = 0
        WHERE id = ?
      `, [metodo_pago, fecha_pago || new Date(), req.params.id]);

      res.json({ message: 'Pago registrado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar pago' });
    }
  },

  // Registrar abono
  registrarAbono: async (req, res) => {
    try {
      const { pago_id, monto, metodo_pago, recibo_numero, observaciones } = req.body;

      // Obtener el pago
      const [pago] = await db.query('SELECT * FROM pagos WHERE id = ?', [pago_id]);

      if (pago.length === 0) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Calcular total abonado
      const [totalAbonos] = await db.query(
        'SELECT COALESCE(SUM(monto), 0) as total FROM abonos WHERE pago_id = ?',
        [pago_id]
      );

      const nuevoTotal = parseFloat(totalAbonos[0].total) + parseFloat(monto);
      const montoPago = parseFloat(pago[0].monto);

      // Insertar abono
      await db.query(`
        INSERT INTO abonos (
          pago_id, monto, fecha, metodo_pago,
          recibo_numero, observaciones
        ) VALUES (?, ?, NOW(), ?, ?, ?)
      `, [pago_id, monto, metodo_pago, recibo_numero, observaciones]);

      // Actualizar estado del pago
      let nuevoEstado = 'parcial';
      let saldoPendiente = montoPago - nuevoTotal;
      
      if (nuevoTotal >= montoPago) {
        nuevoEstado = 'pagado';
        saldoPendiente = 0;
      }

      await db.query(`
        UPDATE pagos SET 
          estado = ?,
          monto_pagado = ?,
          saldo_pendiente = ?
        WHERE id = ?
      `, [nuevoEstado, nuevoTotal, saldoPendiente, pago_id]);

      res.status(201).json({
        message: 'Abono registrado exitosamente',
        total_abonado: nuevoTotal,
        saldo_pendiente: saldoPendiente,
        estado: nuevoEstado
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar abono' });
    }
  },

  // Eliminar pago
  delete: async (req, res) => {
    try {
      // Eliminar abonos asociados
      await db.query('DELETE FROM abonos WHERE pago_id = ?', [req.params.id]);

      // Eliminar pago
      await db.query('DELETE FROM pagos WHERE id = ?', [req.params.id]);

      res.json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar pago' });
    }
  },

  // Estadísticas de pagos
  getEstadisticas: async (req, res) => {
    try {
      const [stats] = await db.query(`
        SELECT
          COUNT(*) as total_pagos,
          SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as pagados,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as vencidos,
          SUM(CASE WHEN estado = 'parcial' THEN 1 ELSE 0 END) as parciales,
          SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END) as total_recaudado,
          SUM(CASE WHEN estado != 'pagado' THEN saldo_pendiente ELSE 0 END) as total_pendiente,
          SUM(monto) as total_general
        FROM pagos
      `);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Reporte de morosidad
  getReporteMorosidad: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT
          e.id,
          e.numero_identificacion,
          e.nombres,
          e.apellidos,
          e.nivel,
          COUNT(p.id) as total_pagos_pendientes,
          SUM(p.saldo_pendiente) as total_deuda,
          MIN(p.fecha_vencimiento) as fecha_mas_antigua
        FROM estudiantes e
        INNER JOIN pagos p ON e.id = p.estudiante_id
        WHERE p.estado IN ('pendiente', 'vencido', 'parcial')
          AND e.activo = TRUE
        GROUP BY e.id
        ORDER BY total_deuda DESC, fecha_mas_antigua ASC
      `);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener reporte de morosidad' });
    }
  }
};

module.exports = pagosController;
