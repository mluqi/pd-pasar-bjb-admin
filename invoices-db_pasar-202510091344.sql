-- MySQL dump 10.13  Distrib 9.3.0, for macos15.4 (arm64)
--
-- Host: 127.0.0.1    Database: db_pasar
-- ------------------------------------------------------
-- Server version	8.4.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Invoices`
--

DROP TABLE IF EXISTS `Invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Invoices` (
  `invoice_code` varchar(255) NOT NULL,
  `invoice_pedagang` varchar(255) NOT NULL,
  `invoice_nominal` bigint DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `invoice_tempo` date DEFAULT NULL,
  `invoice_type` enum('siptu','heregistrasi') DEFAULT NULL,
  `invoice_pasar` varchar(255) NOT NULL,
  `invoice_lapak` text,
  `invoice_status` enum('pending','paid','waiting') DEFAULT NULL,
  `invoice_file` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`invoice_code`),
  KEY `invoice_pedagang` (`invoice_pedagang`),
  KEY `invoice_pasar` (`invoice_pasar`),
  CONSTRAINT `Invoices_ibfk_1` FOREIGN KEY (`invoice_pedagang`) REFERENCES `DB_PEDAGANG` (`CUST_CODE`),
  CONSTRAINT `Invoices_ibfk_3` FOREIGN KEY (`invoice_pasar`) REFERENCES `data_pasars` (`pasar_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoices`
--

LOCK TABLES `Invoices` WRITE;
/*!40000 ALTER TABLE `Invoices` DISABLE KEYS */;
INSERT INTO `Invoices` VALUES ('INV2510090001','CUST00008',160000,'2025-10-09','2025-10-23','heregistrasi','PSR0001','[\"PSR0001LAP001\",\"PSR0001LAP004\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090002','CUST00012',200000,'2025-10-09','2025-10-23','heregistrasi','PSR0001','[\"PSR0001LAP002\",\"PSR0002LAP002\",\"PSR0004LAP002\"]','paid','uploads/lapak_bukti/1759984569997-bukti_foto.jpg','2025-10-09 03:25:00','2025-10-09 04:36:21'),('INV2510090003','CUST00007',80000,'2025-10-09','2025-10-23','heregistrasi','PSR0001','[\"PSR0001LAP003\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090004','CUST00009',80000,'2025-10-09','2025-10-23','heregistrasi','PSR0001','[\"PSR0001LAP005\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090005','CUST00011',60000,'2025-10-09','2025-11-26','heregistrasi','PSR0002','[\"PSR0002LAP001\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090006','CUST00004',10000,'2025-10-09','2025-11-26','heregistrasi','PSR0002','[\"PSR0002LAP003\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090007','CUST00005',10000,'2025-10-09','2025-11-26','heregistrasi','PSR0002','[\"PSR0002LAP004\"]','pending',NULL,'2025-10-09 03:25:00','2025-10-09 03:25:00'),('INV2510090008','CUST00014',60000,'2025-10-09','2025-12-23','heregistrasi','PSR0004','[\"PSR0004LAP001\"]','waiting','uploads/lapak_bukti/1759984751952-bukti_foto.jpg','2025-10-09 03:25:00','2025-10-09 04:39:11');
/*!40000 ALTER TABLE `Invoices` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 13:44:45
