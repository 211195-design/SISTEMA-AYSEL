CREATE DATABASE IF NOT EXISTS BD_TIENDA_AYSEL;
USE BD_TIENDA_AYSEL;

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
CREATE TABLE Usuarios(
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    IdRol INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
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

INSERT INTO Colores(NombreColor)
VALUES
('Morado'),
('Naranja'),
('Celeste');