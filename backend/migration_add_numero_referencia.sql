-- ========================================
-- Migración: Agregar columnas faltantes a tabla pagos
-- ========================================
-- Esta migración agrega las columnas que están definidas en el esquema
-- pero pueden no existir en la base de datos actual

USE gimnasio_huellas_saber;

-- Función auxiliar para verificar y agregar columnas
DELIMITER //

-- Agregar numero_referencia si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'numero_referencia'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN numero_referencia VARCHAR(100) AFTER metodo_pago',
  'SELECT "La columna numero_referencia ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar observaciones si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'observaciones'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN observaciones TEXT AFTER numero_referencia',
  'SELECT "La columna observaciones ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar descuento si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'descuento'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN descuento DECIMAL(12, 2) DEFAULT 0 AFTER observaciones',
  'SELECT "La columna descuento ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar motivo_descuento si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'motivo_descuento'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN motivo_descuento TEXT AFTER descuento',
  'SELECT "La columna motivo_descuento ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar generar_recibo si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'generar_recibo'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN generar_recibo BOOLEAN DEFAULT TRUE AFTER motivo_descuento',
  'SELECT "La columna generar_recibo ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar enviar_email si no existe
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'gimnasio_huellas_saber' 
    AND TABLE_NAME = 'pagos' 
    AND COLUMN_NAME = 'enviar_email'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pagos ADD COLUMN enviar_email BOOLEAN DEFAULT FALSE AFTER generar_recibo',
  'SELECT "La columna enviar_email ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DELIMITER ;

SELECT 'Migración completada. Verifica las columnas agregadas.' AS mensaje;
