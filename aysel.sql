

```sql
-- ==========================================
-- BASE DE DATOS TIENDA AYSEL
-- SCRIPT COMPLETO CORREGIDO
-- ==========================================

DROP DATABASE IF EXISTS BD_TIENDA_AYSEL;
CREATE DATABASE BD_TIENDA_AYSEL;
USE BD_TIENDA_AYSEL;

-- ==========================
-- TABLA ROLES
-- ==========================
CREATE TABLE Roles(
    IdRol INT AUTO_INCREMENT PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL UNIQUE
);

-- ==========================
-- TABLA USUARIOS
-- ==========================
CREATE TABLE Usuarios (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    IdRol INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Correo VARCHAR(150) NOT NULL UNIQUE,
    Usuario VARCHAR(50) NOT NULL UNIQUE,
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
    NombreCategoria VARCHAR(100) NOT NULL UNIQUE,
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
    NombreTalla VARCHAR(20) NOT NULL UNIQUE
);

-- ==========================
-- TABLA COLORES
-- ==========================
CREATE TABLE Colores(
    IdColor INT AUTO_INCREMENT PRIMARY KEY,
    NombreColor VARCHAR(50) NOT NULL UNIQUE
);

-- ==========================
-- TABLA INVENTARIO
-- ==========================
CREATE TABLE Inventario(
    IdInventario INT AUTO_INCREMENT PRIMARY KEY,
    IdProducto INT NOT NULL,
    IdTalla INT NULL,
    IdColor INT NULL,
    StockActual INT NOT NULL DEFAULT 0,

    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    FOREIGN KEY (IdTalla) REFERENCES Tallas(IdTalla),
    FOREIGN KEY (IdColor) REFERENCES Colores(IdColor)
);

-- ==========================
-- TABLA FORMAS DE PAGO
-- ==========================
CREATE TABLE FormasPago(
    IdFormaPago INT AUTO_INCREMENT PRIMARY KEY,
    NombreFormaPago VARCHAR(50) NOT NULL UNIQUE
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
    Estado ENUM('ACTIVA','ANULADA','COMPLETADA') DEFAULT 'ACTIVA',

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

INSERT INTO Roles(NombreRol) VALUES
('Administrador'),
('Vendedor');

INSERT INTO Usuarios
(IdRol,Nombres,Apellidos,Correo,Usuario,Clave,Telefono,Estado)
VALUES
(
1,
'Admin',
'Sistema',
'admin@aysel.com',
'admin',
'$2b$10$QuAOelih5zgcdfOdrV083eV5OPN8rd4.s8vo0vUcZ35Ntwifx5L3q',
'999999999',
1
);

INSERT INTO FormasPago(NombreFormaPago) VALUES
('Efectivo'),
('Yape'),
('Transferencia');

INSERT INTO Categorias(NombreCategoria) VALUES
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

INSERT INTO Tallas(NombreTalla) VALUES
('2'),
('4'),
('6'),
('8'),
('10'),
('12'),
('S'),
('M'),
('L'),
('XL'),
('Único');

INSERT INTO Colores(NombreColor) VALUES
('Negro'),
('Blanco'),
('Rojo'),
('Azul'),
('Verde'),
('Amarillo'),
('Rosado'),
('Multicolor');

INSERT INTO Clientes
(DNI,Nombres,Apellidos,Telefono,Direccion)
VALUES
('12345678','Ana','García','987001001','Av. Lima 101'),
('23456789','Luis','Pérez','987001002','Jr. Cusco 202'),
('34567890','María','Torres','987001003','Calle Arequipa 3'),
('45678901','Carlos','Ríos','987001004','Av. Tacna 404'),
('56789012','Sofía','Mendoza','987001005','Jr. Puno 505');

INSERT INTO Productos
(IdCategoria,Codigo,NombreProducto,Descripcion,PrecioCompra,PrecioVenta,StockMinimo,Estado)
VALUES
(11,'P001','Arreglo Graduación','Arreglo floral de graduación',80.00,165.00,2,1),
(2,'P002','Pantalón Jean Adulto','Jean clásico adulto',60.00,120.00,3,1),
(6,'P003','Peluche Personalizado','Peluche con mensaje',40.00,105.00,2,1),
(10,'P004','Arreglo Floral Cumpleaños','Arreglo para cumpleaños',45.00,90.00,2,1),
(1,'P005','Blusa Dama Casual','Blusa casual para dama',35.00,70.00,3,1),
(10,'P006','Ramo Rosas Rojas','Ramo de 12 rosas',30.00,60.00,2,1);

INSERT INTO Inventario
(IdProducto,IdTalla,IdColor,StockActual)
VALUES
(1,11,8,15),
(2,8,4,20),
(3,11,8,10),
(4,11,3,12),
(5,7,2,8),
(6,11,3,5);

INSERT INTO Ventas
(NumeroBoleta,IdCliente,IdUsuario,IdFormaPago,SubTotal,Descuento,Total,Estado)
VALUES
('B001',1,1,1,165.00,0,165.00,'COMPLETADA'),
('B002',2,1,2,120.00,0,120.00,'COMPLETADA'),
('B003',3,1,1,105.00,0,105.00,'COMPLETADA'),
('B004',4,1,3,90.00,0,90.00,'COMPLETADA'),
('B005',5,1,1,70.00,0,70.00,'COMPLETADA');

INSERT INTO DetalleVenta
(IdVenta,IdInventario,Cantidad,PrecioUnitario,Descuento,SubTotal)
VALUES
(1,1,1,165.00,0,165.00),
(2,2,1,120.00,0,120.00),
(3,3,1,105.00,0,105.00),
(4,4,1,90.00,0,90.00),
(5,5,1,70.00,0,70.00);

-- ==========================
-- INDICES
-- ==========================

CREATE INDEX idx_producto_categoria
ON Productos(IdCategoria);

CREATE INDEX idx_venta_fecha
ON Ventas(FechaVenta);

CREATE INDEX idx_cliente_dni
ON Clientes(DNI);

CREATE INDEX idx_inventario_producto
ON Inventario(IdProducto);

-- ==========================
-- TRIGGER DESCUENTO STOCK
-- ==========================

DELIMITER $$

CREATE TRIGGER tr_descontar_stock
AFTER INSERT ON DetalleVenta
FOR EACH ROW
BEGIN
    UPDATE Inventario
    SET StockActual = StockActual - NEW.Cantidad
    WHERE IdInventario = NEW.IdInventario;
END$$

DELIMITER ;

-- ==========================
-- CONSULTAS DE PRUEBA
-- ==========================

SELECT * FROM Roles;
SELECT * FROM Usuarios;
SELECT * FROM Clientes;
SELECT * FROM Productos;
SELECT * FROM Inventario;
SELECT * FROM Ventas;
SELECT * FROM DetalleVenta;
```


