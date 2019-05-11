CREATE TABLE product (
  sku varchar(255) COLLATE latin1_bin NOT NULL,
  name varchar(255) COLLATE latin1_bin NOT NULL,
  price decimal(10,2) NOT NULL,
  short_description varchar(255) COLLATE latin1_bin NOT NULL,
  long_description text COLLATE latin1_bin NOT NULL,
  active tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (sku)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla images
--

CREATE TABLE image (
  id int(11) NOT NULL AUTO_INCREMENT,
  url text COLLATE latin1_bin,
  productSku varchar(255) COLLATE latin1_bin NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (productSku) REFERENCES product(sku) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla categories
--

CREATE TABLE category (
  id int(11) NOT NULL,
  name varchar(255) COLLATE latin1_bin NOT NULL,
  categoryParent int(11) NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (categoryParent) REFERENCES category (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla product_categories
--

CREATE TABLE product_category (
  id int(11) NOT NULL AUTO_INCREMENT,
  productSku varchar(255) COLLATE latin1_bin NOT NULL,
  categoryId int(11) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (productSku) REFERENCES product(sku) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;

-- --------------------------------------------------------

--
-- Tabla para Reportes
--

CREATE TABLE historial (
  id int(11) NOT NULL AUTO_INCREMENT,
  periodo int(11) NOT NULL,
  tipo int(11) NOT NULL,
  PRIMARY KEY(id)
)ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;

-- --------------------------------------------------------

-- Insert de Datos
INSERT INTO `category`(`id`,`name`) VALUES (1, 'Electronicos');
INSERT INTO `category`(`id`,`name`, `categoryParent`) VALUES (2,'Dijital',1);
INSERT INTO `category`(`id`,`name`, `categoryParent`) VALUES (3,'Analogo',1);

INSERT INTO `category`(`id`,`name`) VALUES (4, 'Hogar');
INSERT INTO `category`(`id`,`name`, `categoryParent`) VALUES (5,'Amueblado',4);
INSERT INTO `category`(`id`,`name`, `categoryParent`) VALUES (6,'Dormitorio',4);
INSERT INTO `category`(`id`,`name`, `categoryParent`) VALUES (7,'Cocina',4);

INSERT INTO `product`(`sku`, `name`, `price`, `short_description`, `long_description`, `active`) 
VALUES ('ab-1','Camara',5.5,'Sirve para algo.','Esta cosa es muy util compralo papu',1);
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen1.com','ab-1');
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen2.com','ab-1');
INSERT INTO `product_category`(`productSku`, `categoryId`) VALUES ('ab-1', 2);

INSERT INTO `product`(`sku`, `name`, `price`, `short_description`, `long_description`, `active`) 
VALUES ('ab-2','Radio',100.0,'Sirve para algo.','Esta cosa es muy util compralo papu',1);
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen1.com','ab-2');
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen2.com','ab-2');
INSERT INTO `product_category`(`productSku`, `categoryId`) VALUES ('ab-2', 3);

INSERT INTO `product`(`sku`, `name`, `price`, `short_description`, `long_description`, `active`) 
VALUES ('ab-3','Sillon',5000.9,'Para que te sentes.','Es muy comodo, comparalo papu',1);
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen1.com','ab-3');
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen2.com','ab-3');
INSERT INTO `product_category`(`productSku`, `categoryId`) VALUES ('ab-3', 5);

INSERT INTO `product`(`sku`, `name`, `price`, `short_description`, `long_description`, `active`) 
VALUES ('ab-4','Cama',3500.99,'Para que durmas.','Es muy comodo, para que durmas super comodo.',1);
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen1.com','ab-4');
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen2.com','ab-4');
INSERT INTO `product_category`(`productSku`, `categoryId`) VALUES ('ab-4', 6);

INSERT INTO `product`(`sku`, `name`, `price`, `short_description`, `long_description`, `active`) 
VALUES ('ab-5','Estufa',2500.99,'Para que cosines.','Has comida de calidad.',1);
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen1.com','ab-5');
INSERT INTO `image`(`url`, `productSku`) VALUES ('http://imagen2.com','ab-5');
INSERT INTO `product_category`(`productSku`, `categoryId`) VALUES ('ab-5', 7);
