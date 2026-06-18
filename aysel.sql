

CREATE DATABASE IF NOT EXISTS BD_TIENDA_AYSEL;
USE BD_TIENDA_AYSEL;

DESCRIBE Usuarios;
DESCRIBE Roles;

-- ==========================
-- TABLA ROLES
-- ==========================
CREATE TABLE Roles(
    IdRol INT AUTO_INCREMENT PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL
);

-- ==========================
-- TABLA USUARIOS
-- ==========================
CREATE TABLE Usuarios (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    IdRol INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Correo VARCHAR(150) UNIQUE NOT NULL,
    Usuario VARCHAR(50) UNIQUE NOT NULL,
    Clave VARCHAR(255) NOT NULL,
    Telefono VARCHAR(20),
    Estado BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (IdRol) REFERENCES Roles(IdRol)
);

-- ==========================
-- TABLA CLIENTES
-- ==========================
CREATE TABLE Clientes(
    IdCliente INT AUTO_INCREMENT PRIMARY KEY,
    DNI VARCHAR(8),
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100),
    Telefono VARCHAR(20),
    Direccion VARCHAR(200),
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado BOOLEAN DEFAULT TRUE
);

-- ==========================
-- TABLA CATEGORIAS
-- ==========================
CREATE TABLE Categorias(
    IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
    NombreCategoria VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(200)
);

-- ==========================
-- TABLA PRODUCTOS
-- ==========================
CREATE TABLE Productos(
    IdProducto INT AUTO_INCREMENT PRIMARY KEY,
    IdCategoria INT NOT NULL,
    Codigo VARCHAR(20) UNIQUE,
    NombreProducto VARCHAR(150) NOT NULL,
    Descripcion VARCHAR(300),
    PrecioCompra DECIMAL(10,2),
    PrecioVenta DECIMAL(10,2) NOT NULL,
    StockMinimo INT DEFAULT 5,
    Estado BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (IdCategoria) REFERENCES Categorias(IdCategoria)
);

-- ==========================
-- TABLA TALLAS
-- ==========================
CREATE TABLE Tallas(
    IdTalla INT AUTO_INCREMENT PRIMARY KEY,
    NombreTalla VARCHAR(20) NOT NULL
);

-- ==========================
-- TABLA COLORES
-- ==========================
CREATE TABLE Colores(
    IdColor INT AUTO_INCREMENT PRIMARY KEY,
    NombreColor VARCHAR(50) NOT NULL
    
);

-- ==========================
-- TABLA INVENTARIO
-- ==========================
CREATE TABLE Inventario(
    IdInventario INT AUTO_INCREMENT PRIMARY KEY,
    IdProducto INT NOT NULL,
    IdTalla INT NULL,
    IdColor INT NULL,
    StockActual INT NOT NULL,

    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    FOREIGN KEY (IdTalla) REFERENCES Tallas(IdTalla),
    FOREIGN KEY (IdColor) REFERENCES Colores(IdColor)
);

-- ==========================
-- TABLA FORMAS DE PAGO
-- ==========================
CREATE TABLE FormasPago(
    IdFormaPago INT AUTO_INCREMENT PRIMARY KEY,
    NombreFormaPago VARCHAR(50) NOT NULL
);

-- ==========================
-- TABLA VENTAS
-- ==========================
CREATE TABLE Ventas(
    IdVenta INT AUTO_INCREMENT PRIMARY KEY,
    NumeroBoleta VARCHAR(20) UNIQUE NOT NULL,
    IdCliente INT NULL,
    IdUsuario INT NOT NULL,
    IdFormaPago INT NOT NULL,
    FechaVenta DATETIME DEFAULT CURRENT_TIMESTAMP,
    SubTotal DECIMAL(10,2) NOT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0,
    Total DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'ACTIVA',

    FOREIGN KEY (IdCliente) REFERENCES Clientes(IdCliente),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdFormaPago) REFERENCES FormasPago(IdFormaPago)
);

-- ==========================
-- TABLA DETALLE VENTA
-- ==========================
CREATE TABLE DetalleVenta(
    IdDetalleVenta INT AUTO_INCREMENT PRIMARY KEY,
    IdVenta INT NOT NULL,
    IdInventario INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0,
    SubTotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (IdVenta) REFERENCES Ventas(IdVenta),
    FOREIGN KEY (IdInventario) REFERENCES Inventario(IdInventario)
);

-- ==========================
-- TABLA PROMOCIONES
-- ==========================
CREATE TABLE Promociones(
    IdPromocion INT AUTO_INCREMENT PRIMARY KEY,
    NombrePromocion VARCHAR(100) NOT NULL,
    Descuento DECIMAL(5,2) NOT NULL,
    FechaInicio DATE,
    FechaFin DATE,
    Estado BOOLEAN DEFAULT TRUE
);

-- ==========================
-- TABLA CLIENTES PROMOCIONES
-- ==========================
CREATE TABLE ClientesPromociones(
    IdCliente INT NOT NULL,
    IdPromocion INT NOT NULL,

    PRIMARY KEY(IdCliente, IdPromocion),

    FOREIGN KEY (IdCliente) REFERENCES Clientes(IdCliente),
    FOREIGN KEY (IdPromocion) REFERENCES Promociones(IdPromocion)
);

-- ==========================
-- TABLA MOVIMIENTOS INVENTARIO
-- ==========================
CREATE TABLE MovimientosInventario(
    IdMovimiento INT AUTO_INCREMENT PRIMARY KEY,
    IdInventario INT NOT NULL,
    TipoMovimiento VARCHAR(20) NOT NULL,
    Cantidad INT NOT NULL,
    FechaMovimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    Observacion VARCHAR(300),

    FOREIGN KEY (IdInventario) REFERENCES Inventario(IdInventario)
);

-- ==========================
-- TABLA CAJA
-- ==========================
CREATE TABLE Caja(
    IdCaja INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    MontoInicial DECIMAL(10,2) DEFAULT 0,
    TotalEfectivo DECIMAL(10,2) DEFAULT 0,
    TotalYape DECIMAL(10,2) DEFAULT 0,
    TotalGeneral DECIMAL(10,2) DEFAULT 0,
    IdUsuario INT NOT NULL,

    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- ==========================
-- DATOS INICIALES
-- ==========================

INSERT INTO Roles(NombreRol)
VALUES
('Administrador'),
('Vendedor');

INSERT INTO FormasPago(NombreFormaPago)
VALUES
('Efectivo'),
('Yape');

INSERT INTO Categorias(NombreCategoria)
VALUES
('Ropa Dama'),
('Ropa Caballero'),
('Ropa Niño'),
('Ropa Niña'),
('Juguetes'),
('Detalles Personalizados'),
('Carteras'),
('Billeteras'),
('Perfumes'),
('Arreglos de Cumpleaños'),
('Arreglos de Graduación');

INSERT INTO Tallas(NombreTalla)
VALUES
('2'),
('4'),
('6'),
('8'),
('10'),
('12'),
('S'),
('M'),
('L'),
('XL');

INSERT INTO Colores(NombreColor)
VALUES
('Negro'),
('Blanco'),
('Rojo'),
('Azul'),
('Verde'),
('Amarillo'),
('Rosado');
INSERT INTO Roles (NombreRol) VALUES ('Administrador');
INSERT INTO Usuarios (IdRol, Nombres, Apellidos, Usuario, Clave, Telefono, Estado)
VALUES (
  1,
  'Admin',
  'Sistema',
  'admin',
  '$2b$10$QuAOelih5zgcdfOdrV083eV5OPN8rd4.s8vo0vUcZ35Ntwifx5L3q',
  '999999999',
  1
);


SELECT IdUsuario, Usuario, Clave, Estado FROM Usuarios;
SELECT * FROM Roles;
SELECT * FROM Usuarios;
ALTER TABLE Usuarios 
ADD COLUMN Correo VARCHAR(100) NULL AFTER Apellidos;

UPDATE Usuarios 
SET Correo = 'admin@aysel.com' 
WHERE IdUsuario = 1;

SELECT * FROM Usuarios;
SELECT IdUsuario, Usuario, Correo FROM Usuarios WHERE Usuario = 'admin';
SELECT IdUsuario, Usuario, CHAR_LENGTH(Correo) as longitud, Correo 
FROM Usuarios 
WHERE IdUsuario = 1;

UPDATE Usuarios 
SET Clave = '$2b$10$QuAOelih5zgcdfOdrV083eV5OPN8rd4.s8vo0vUcZ35Ntwifx5L3q'
WHERE Usuario = 'admin';

USE BD_TIENDA_AYSEL;

-- 1. Categorías
INSERT INTO categorias (NombreCategoria) VALUES 
('Detalles'), ('Prendas'), ('Peluches');

-- 2. Productos
INSERT INTO productos (IdCategoria, Codigo, NombreProducto, Descripcion, PrecioCompra, PrecioVenta, StockMinimo, Estado) VALUES
(1, 'P001', 'Arreglo Graduación',       'Arreglo floral de graduación', 80.00,  165.00, 2, 1),
(2, 'P002', 'Pantalón Jean Adulto',     'Jean clásico adulto',          60.00,  120.00, 3, 1),
(3, 'P003', 'Peluche Personalizado',    'Peluche con mensaje',          40.00,  105.00, 2, 1),
(1, 'P004', 'Arreglo Floral Cumpleaños','Arreglo para cumpleaños',      45.00,   90.00, 2, 1),
(2, 'P005', 'Blusa Dama Casual',        'Blusa casual para dama',       35.00,   70.00, 3, 1),
(1, 'P006', 'Ramo Rosas Rojas',         'Ramo de 12 rosas',             30.00,   60.00, 2, 1);

-- 3. Tallas y Colores (mínimo para inventario)
INSERT INTO tallas (NombreTalla) VALUES ('Único'), ('S'), ('M'), ('L');
INSERT INTO colores (NombreColor) VALUES ('Rojo'), ('Blanco'), ('Azul'), ('Multicolor');

-- 4. Inventario
INSERT INTO inventario (IdProducto, IdTalla, IdColor, StockActual) VALUES
(1, 1, 4, 15),
(2, 3, 3, 20),
(3, 1, 4, 10),
(4, 1, 1, 12),
(5, 2, 2,  8),
(6, 1, 1,  5);

-- 5. Formas de pago
INSERT INTO formaspago (NombreFormaPago) VALUES 
('Efectivo'), ('Tarjeta'), ('Transferencia');

-- 6. Roles y Usuarios (si no existen)
INSERT IGNORE INTO roles (NombreRol) VALUES ('Administrador'), ('Vendedor');

-- 7. Clientes
INSERT INTO clientes (DNI, Nombres, Apellidos, Telefono, Direccion, FechaRegistro, Estado) VALUES
('12345678', 'Ana',    'García',   '987001001', 'Av. Lima 101',    NOW(), 1),
('23456789', 'Luis',   'Pérez',    '987001002', 'Jr. Cusco 202',   NOW(), 1),
('34567890', 'María',  'Torres',   '987001003', 'Calle Arequipa 3',NOW(), 1),
('45678901', 'Carlos', 'Ríos',     '987001004', 'Av. Tacna 404',   NOW(), 1),
('56789012', 'Sofía',  'Mendoza',  '987001005', 'Jr. Puno 505',    NOW(), 1);

-- 8. Ventas
INSERT INTO ventas (NumeroBoleta, IdCliente, IdUsuario, IdFormaPago, FechaVenta, SubTotal, Descuento, Total, Estado) VALUES
('B001', 1, 1, 1, NOW(),           165.00, 0, 165.00, 'Completado'),
('B002', 2, 1, 2, NOW(),           120.00, 0, 120.00, 'Completado'),
('B003', 3, 1, 1, NOW(),           105.00, 0, 105.00, 'Completado'),
('B004', 4, 1, 3, NOW(),            90.00, 0,  90.00, 'Completado'),
('B005', 5, 1, 1, NOW(),            70.00, 0,  70.00, 'Completado');

-- 9. Detalle de ventas
INSERT INTO detalleventa (IdVenta, IdInventario, Cantidad, PrecioUnitario, Descuento, SubTotal) VALUES
(1, 1, 3, 165.00, 0, 165.00),
(2, 2, 2, 120.00, 0, 120.00),
(3, 3, 3, 105.00, 0, 105.00),
(4, 4, 2,  90.00, 0,  90.00),
(5, 5, 2,  70.00, 0,  70.00);


SELECT * FROM formaspago;
DELETE FROM formaspago WHERE IdFormaPago = 3;


