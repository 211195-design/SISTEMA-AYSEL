

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

INSERT INTO Roles (NombreRol) VALUES ('Administrador');
INSERT INTO Usuarios
(IdRol, Nombres, Apellidos, Correo, Usuario, Clave, Telefono, Estado)
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

SELECT * FROM Clientes;
SELECT * FROM Productos;
SELECT * FROM Inventario;
SELECT * FROM FormasPago;
SELECT * FROM Ventas;
SELECT * FROM DetalleVenta;
SELECT * FROM Promociones;
SELECT * FROM Caja;

INSERT INTO Promociones
(NombrePromocion, Descuento, FechaInicio, FechaFin, Estado)
VALUES

-- Promociones generales
('Oferta de Apertura',10.00,'2026-01-01','2026-01-15',1),
('Descuento Temporada Verano',20.00,'2026-01-20','2026-02-28',1),
('Liquidación de Temporada',30.00,'2026-03-01','2026-03-31',1),

-- Ropa varón
('Promoción Ropa Hombre',15.00,'2026-04-01','2026-04-30',1),
('2 Polos por Precio Especial',25.00,'2026-05-01','2026-05-15',1),

-- Ropa mujer
('Semana de la Mujer',20.00,'2026-03-01','2026-03-08',1),
('Vestidos de Fiesta',25.00,'2026-05-10','2026-05-31',1),

-- Niños
('Regreso a Clases Niños',15.00,'2026-02-01','2026-03-15',1),
('Moda Infantil',20.00,'2026-06-01','2026-06-30',1),

-- Fechas especiales
('Día de la Madre',25.00,'2026-05-01','2026-05-10',1),
('Día del Padre',20.00,'2026-06-10','2026-06-21',1),
('Fiestas Patrias',30.00,'2026-07-01','2026-07-31',1),
('Black Friday',40.00,'2026-11-20','2026-11-30',1),
('Cyber Monday',35.00,'2026-12-01','2026-12-05',1),

-- Eventos
('Graduaciones 2026',20.00,'2026-11-01','2026-12-20',1),
('Paquete Cumpleaños',15.00,'2026-01-01','2026-12-31',1),
('Promoción Bodas y Eventos',25.00,'2026-01-01','2026-12-31',1),
('Baby Shower Especial',20.00,'2026-01-01','2026-12-31',1),

-- Fin de año
('Navidad Aysel',35.00,'2026-12-01','2026-12-24',1),
('Año Nuevo',30.00,'2026-12-26','2026-12-31',1);

INSERT INTO Inventario
(IdProducto, IdTalla, IdColor, StockActual)
VALUES

-- ==========================
-- VARÓN
-- ==========================
(1,17,1,20),   -- Polo Hombre M Negro
(1,18,8,15),   -- Polo Hombre L Azul
(2,18,2,12),   -- Camisa Hombre L Blanco
(3,24,8,10),   -- Jean Hombre talla 32 Azul
(3,25,1,8),    -- Jean Hombre talla 34 Negro
(4,17,3,15),   -- Short Hombre M Gris
(5,18,1,6),    -- Casaca Hombre L Negro
(6,19,4,8),    -- Chompa Hombre XL Plomo
(7,18,8,10),   -- Polera Hombre L Azul
(8,19,1,5),    -- Buzo Hombre XL Negro
(9,17,1,30),   -- Boxer Hombre M Negro
(10,42,1,7),   -- Zapatilla Hombre talla 42 Negro

-- ==========================
-- MUJER
-- ==========================
(11,17,20,12), -- Blusa Mujer M Rosado
(12,16,2,20),  -- Polo Mujer S Blanco
(13,18,8,10),  -- Camisa Mujer L Azul
(14,24,1,8),   -- Jean Mujer talla 32 Negro
(15,17,23,6),  -- Falda M Lila
(16,18,5,5),   -- Vestido L Rojo
(17,17,8,12),  -- Short Mujer M Azul
(18,18,1,6),   -- Casaca Mujer L Negro
(19,17,4,8),   -- Chompa Mujer M Plomo
(20,38,31,5),  -- Tacones talla 38 Dorado

-- ==========================
-- NIÑOS
-- ==========================
(21,8,8,20),   -- Polo Niño talla 8 Azul
(22,10,2,15),  -- Camisa Niño talla 10 Blanco
(23,12,8,10),  -- Pantalón Niño talla 12 Azul
(24,8,1,15),   -- Short Niño talla 8 Negro
(25,10,5,8),   -- Casaca Niño talla 10 Rojo
(26,12,3,10),  -- Buzo Niño talla 12 Gris
(27,8,1,25),   -- Ropa interior Niño Negro
(28,30,8,8),   -- Zapatilla Niño talla 30 Azul

-- ==========================
-- NIÑAS
-- ==========================
(29,8,20,20),  -- Polo Niña talla 8 Rosado
(30,10,23,15), -- Blusa Niña talla 10 Lila
(31,12,5,8),   -- Vestido Niña talla 12 Rojo
(32,8,20,10),  -- Falda Niña talla 8 Rosado
(33,10,8,10),  -- Pantalón Niña talla 10 Azul
(34,8,1,12),   -- Short Niña talla 8 Negro
(35,12,20,6),  -- Casaca Niña talla 12 Rosado
(36,32,2,7),   -- Zapato Niña talla 32 Blanco

-- ==========================
-- EVENTOS Y REGALOS
-- ==========================
(37,56,NULL,20), -- Birrete talla única
(38,56,NULL,50), -- Globo
(39,56,NULL,15), -- Peluche
(40,56,1,20);    -- Mochila negra


INSERT INTO Productos
(IdCategoria, Codigo, NombreProducto, Descripcion, PrecioCompra, PrecioVenta, StockMinimo)
VALUES
(1,'PRD001','Polo Básico Hombre','Polo de algodón manga corta',25.00,40.00,10),
(2,'PRD002','Camisa Casual Hombre','Camisa manga larga',45.00,70.00,8),
(3,'PRD003','Jean Slim Hombre','Jean azul clásico',65.00,95.00,5),
(4,'PRD004','Short Deportivo Hombre','Short de algodón',22.00,38.00,8),
(5,'PRD005','Casaca Impermeable Hombre','Casaca para invierno',90.00,140.00,3),
(6,'PRD006','Chompa Tejida Hombre','Chompa de lana',55.00,85.00,5),
(7,'PRD007','Polera con Capucha Hombre','Polera deportiva',60.00,90.00,5),
(8,'PRD008','Buzo Deportivo Hombre','Conjunto deportivo',80.00,120.00,4),
(9,'PRD009','Boxer Algodón','Ropa interior masculina',12.00,20.00,15),
(10,'PRD010','Zapatillas Running Hombre','Calzado deportivo',120.00,180.00,3),

(11,'PRD011','Blusa Elegante Mujer','Blusa manga larga',35.00,55.00,8),
(12,'PRD012','Polo Mujer','Polo estampado',22.00,38.00,10),
(13,'PRD013','Camisa Mujer','Camisa casual',40.00,65.00,6),
(14,'PRD014','Jean Mujer','Jean skinny',65.00,98.00,5),
(15,'PRD015','Falda Casual','Falda de algodón',30.00,50.00,6),
(16,'PRD016','Vestido Elegante','Vestido para fiesta',85.00,140.00,3),
(17,'PRD017','Short Mujer','Short jean',25.00,42.00,8),
(18,'PRD018','Casaca Mujer','Casaca de cuero sintético',95.00,150.00,3),
(19,'PRD019','Chompa Mujer','Chompa tejida',50.00,80.00,5),
(20,'PRD020','Tacones Mujer','Zapatos de vestir',110.00,170.00,3),

(21,'PRD021','Polo Niño','Polo infantil',18.00,30.00,10),
(22,'PRD022','Camisa Niño','Camisa infantil',28.00,45.00,8),
(23,'PRD023','Pantalón Niño','Jean infantil',35.00,55.00,6),
(24,'PRD024','Short Niño','Short deportivo',18.00,30.00,8),
(25,'PRD025','Casaca Niño','Casaca infantil',50.00,80.00,4),
(26,'PRD026','Buzo Niño','Conjunto deportivo',45.00,70.00,5),
(27,'PRD027','Calzoncillo Niño','Ropa interior infantil',10.00,16.00,15),
(28,'PRD028','Zapatillas Niño','Calzado infantil',80.00,120.00,4),

(29,'PRD029','Polo Niña','Polo estampado',18.00,30.00,10),
(30,'PRD030','Blusa Niña','Blusa infantil',25.00,40.00,8),
(31,'PRD031','Vestido Niña','Vestido floral',40.00,65.00,5),
(32,'PRD032','Falda Niña','Falda plisada',22.00,38.00,6),
(33,'PRD033','Pantalón Niña','Jean infantil',35.00,55.00,6),
(34,'PRD034','Short Niña','Short jean',18.00,30.00,8),
(35,'PRD035','Casaca Niña','Casaca rosada',50.00,80.00,4),
(36,'PRD036','Zapatos Niña','Zapatos escolares',75.00,115.00,4),

(37,'PRD037','Birrete Graduación','Birrete universitario',30.00,50.00,10),
(38,'PRD038','Globo Metálico','Globo para cumpleaños',5.00,10.00,30),
(39,'PRD039','Peluche Mediano','Peluche de regalo',35.00,60.00,8),
(40,'PRD040','Mochila Escolar','Mochila unisex',60.00,95.00,5);


INSERT INTO Clientes (DNI, Nombres, Apellidos, Telefono, Direccion) VALUES
('70123456','Juan','Pérez Huamán','987654321','Abancay'),
('70123457','María','Quispe Condori','987654322','Cusco'),
('70123458','Carlos','Mamani Flores','987654323','Andahuaylas'),
('70123459','Ana','Torres Rojas','987654324','Tamburco'),
('70123460','Luis','Huamán Paredes','987654325','Challhuahuacho'),
('70123461','Rosa','Soto Quispe','987654326','Abancay'),
('70123462','Pedro','Ccallo Ramos','987654327','Cusco'),
('70123463','Lucía','Gutiérrez Díaz','987654328','Tambobamba'),
('70123464','José','Vargas Núñez','987654329','Cotabambas'),
('70123465','Carmen','Flores Cáceres','987654330','Lima'),
('70123466','Miguel','Chávez Poma','987654331','Arequipa'),
('70123467','Patricia','Mendoza Silva','987654332','Puno'),
('70123468','Diego','Rojas Quispe','987654333','Juliaca'),
('70123469','Daniela','Luna Huamán','987654334','Ayacucho'),
('70123470','Fernando','Paredes Soto','987654335','Nazca'),
('70123471','Katherine','Mamani Quispe','987654336','Abancay'),
('70123472','Jorge','Valencia Flores','987654337','Cusco'),
('70123473','Milagros','Rivera Ramos','987654338','Lima'),
('70123474','Ricardo','Cáceres Huamán','987654339','Apurímac'),
('70123475','Andrea','Condori Poma','987654340','Tamburco'),
('70123476','Kevin','Sánchez Díaz','987654341','Andahuaylas'),
('70123477','Nicole','Rojas Flores','987654342','Cusco'),
('70123478','Cristian','Palomino Quispe','987654343','Abancay'),
('70123479','Valeria','García Soto','987654344','Lima'),
('70123480','Brayan','Mendoza Huamán','987654345','Puno'),
('70123481','Camila','Torres Condori','987654346','Ayacucho'),
('70123482','Alex','Quispe Paredes','987654347','Cusco'),
('70123483','Diana','Flores Ramos','987654348','Tambobamba'),
('70123484','Renzo','Huamán Chávez','987654349','Abancay'),
('70123485','Sofía','López Quispe','987654350','Lima'),
('70123486','Álvaro','Poma Vargas','987654351','Cusco'),
('70123487','Paola','Ccallo Flores','987654352','Andahuaylas'),
('70123488','Eduardo','Silva Huamán','987654353','Arequipa'),
('70123489','Gabriela','Núñez Soto','987654354','Abancay'),
('70123490','Héctor','Ramos Quispe','987654355','Cotabambas'),
('70123491','Yessenia','Pérez Flores','987654356','Challhuahuacho'),
('70123492','Iván','Condori Huamán','987654357','Cusco'),
('70123493','Melissa','Vargas Quispe','987654358','Lima'),
('70123494','Oscar','Mamani Soto','987654359','Puno'),
('70123495','Noelia','Huamán Flores','987654360','Abancay');


INSERT INTO FormasPago (NombreFormaPago) VALUES
('Efectivo'),
('Yape'),
('Plin'),
('Transferencia Bancaria');

INSERT INTO Tallas (NombreTalla) VALUES
('0-3 Meses'),
('3-6 Meses'),
('6-9 Meses'),
('9-12 Meses'),
('12-18 Meses'),
('18-24 Meses'),
('2'),
('4'),
('6'),
('8'),
('10'),
('12'),
('14'),
('16'),
('XS'),
('S'),
('M'),
('L'),
('XL'),
('XXL'),
('XXXL'),
('15'),
('16'),
('17'),
('18'),
('19'),
('20'),
('21'),
('22'),
('23'),
('24'),
('25'),
('26'),
('27'),
('28'),
('29'),
('30'),
('31'),
('32'),
('33'),
('34'),
('35'),
('36'),
('37'),
('38'),
('39'),
('40'),
('41'),
('42'),
('43'),
('44'),
('45'),
('46'),
('47'),
('48'),
('Única');

INSERT INTO Colores (NombreColor) VALUES
('Negro'),
('Blanco'),
('Gris'),
('Plomo'),
('Rojo'),
('Rojo Vino'),
('Bordó'),
('Azul'),
('Azul Marino'),
('Celeste'),
('Turquesa'),
('Verde'),
('Verde Militar'),
('Verde Olivo'),
('Verde Limón'),
('Amarillo'),
('Mostaza'),
('Naranja'),
('Coral'),
('Rosado'),
('Fucsia'),
('Morado'),
('Lila'),
('Violeta'),
('Marrón'),
('Café'),
('Beige'),
('Crema'),
('Caqui'),
('Camel'),
('Dorado'),
('Plateado'),
('Bronce'),
('Chocolate'),
('Perla'),
('Marfil'),
('Transparente'),
('Multicolor'),
('Estampado'),
('Rayado'),
('Floreado'),
('Animal Print'),
('Camuflado'),
('Denim');

INSERT INTO Categorias (NombreCategoria, Descripcion) VALUES

-- ==========================
-- VARONES
-- ==========================
('Varón - Polos', 'Polos para hombre'),
('Varón - Camisas', 'Camisas para hombre'),
('Varón - Pantalones', 'Jeans y pantalones para hombre'),
('Varón - Shorts', 'Shorts y bermudas para hombre'),
('Varón - Casacas', 'Casacas para hombre'),
('Varón - Chompas', 'Chompas para hombre'),
('Varón - Poleras', 'Poleras para hombre'),
('Varón - Buzos', 'Conjuntos deportivos para hombre'),
('Varón - Ropa Interior', 'Ropa interior para hombre'),
('Varón - Calzado', 'Zapatos, zapatillas y botas para hombre'),
('Varón - Accesorios', 'Gorras, cinturones, billeteras, etc.'),

-- ==========================
-- MUJERES
-- ==========================
('Mujer - Blusas', 'Blusas para mujer'),
('Mujer - Polos', 'Polos para mujer'),
('Mujer - Camisas', 'Camisas para mujer'),
('Mujer - Pantalones', 'Jeans y pantalones para mujer'),
('Mujer - Faldas', 'Faldas'),
('Mujer - Vestidos', 'Vestidos casuales y elegantes'),
('Mujer - Shorts', 'Shorts para mujer'),
('Mujer - Casacas', 'Casacas para mujer'),
('Mujer - Chompas', 'Chompas para mujer'),
('Mujer - Poleras', 'Poleras para mujer'),
('Mujer - Ropa Interior', 'Lencería y ropa interior'),
('Mujer - Calzado', 'Tacones, zapatillas, botas y sandalias'),
('Mujer - Carteras', 'Carteras y bolsos'),
('Mujer - Accesorios', 'Aretes, collares, pulseras y cinturones'),

-- ==========================
-- NIÑOS
-- ==========================
('Niño - Polos', 'Polos para niños'),
('Niño - Camisas', 'Camisas para niños'),
('Niño - Pantalones', 'Pantalones para niños'),
('Niño - Shorts', 'Shorts para niños'),
('Niño - Casacas', 'Casacas para niños'),
('Niño - Buzos', 'Buzos para niños'),
('Niño - Ropa Interior', 'Ropa interior para niños'),
('Niño - Calzado', 'Calzado para niños'),

-- ==========================
-- NIÑAS
-- ==========================
('Niña - Polos', 'Polos para niñas'),
('Niña - Blusas', 'Blusas para niñas'),
('Niña - Vestidos', 'Vestidos para niñas'),
('Niña - Faldas', 'Faldas para niñas'),
('Niña - Pantalones', 'Pantalones para niñas'),
('Niña - Shorts', 'Shorts para niñas'),
('Niña - Casacas', 'Casacas para niñas'),
('Niña - Buzos', 'Buzos para niñas'),
('Niña - Ropa Interior', 'Ropa interior para niñas'),
('Niña - Calzado', 'Calzado para niñas'),

-- ==========================
-- EVENTOS
-- ==========================
('Graduación', 'Artículos para graduación'),
('Cumpleaños', 'Decoración y accesorios para cumpleaños'),
('Bodas', 'Artículos para bodas'),
('Aniversarios', 'Decoración y regalos para aniversarios'),
('Baby Shower', 'Artículos para baby shower'),
('Bautizos', 'Artículos para bautizos'),
('Primera Comunión', 'Artículos para primera comunión'),
('Confirmación', 'Artículos para confirmación'),
('San Valentín', 'Regalos y peluches'),
('Navidad', 'Decoración y regalos navideños'),
('Año Nuevo', 'Artículos para año nuevo'),
('Halloween', 'Disfraces y decoración'),
('Fiestas Patrias', 'Artículos patrióticos'),

-- ==========================
-- REGALOS Y ACCESORIOS
-- ==========================
('Peluches', 'Peluches de diferentes tamaños'),
('Juguetes', 'Juguetes para niños'),
('Globos', 'Globos metálicos y de látex'),
('Envolturas', 'Papel, bolsas y cajas de regalo'),
('Bisutería', 'Collares, pulseras, aretes y anillos'),
('Cosméticos', 'Maquillaje y cuidado personal'),
('Mochilas', 'Mochilas escolares y urbanas'),
('Útiles Escolares', 'Cuadernos, lapiceros y accesorios escolares');