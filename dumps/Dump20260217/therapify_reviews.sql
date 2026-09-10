-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: therapify
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` varchar(500) NOT NULL,
  `date` datetime(6) NOT NULL,
  `value` int NOT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK76y1gipc4e5wefq6tbm0620cf` (`doctor_id`),
  KEY `FKsew6tdm746n9vin0ojabinwjw` (`patient_id`),
  CONSTRAINT `FK76y1gipc4e5wefq6tbm0620cf` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `FKsew6tdm746n9vin0ojabinwjw` FOREIGN KEY (`patient_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (13,'Muy profesional y empática','2026-02-02 12:10:00.000000',5,1031,1033),(14,'Me ayudó mucho en pocas sesiones','2026-02-06 13:20:00.000000',5,1031,1028),(15,'Excelente escucha y claridad','2026-02-11 11:00:00.000000',4,1030,1031),(16,'Muy recomendable','2026-02-02 12:40:00.000000',5,1031,1033),(17,'Explica todo con calma','2026-02-06 13:50:00.000000',4,1031,1028),(18,'Sesión muy productiva','2026-02-02 21:05:00.000000',5,1028,1034),(19,'Buen profesional','2026-02-09 21:15:00.000000',4,1028,1030),(20,'Me sentí muy cómodo','2026-02-02 21:40:00.000000',5,1028,1034),(21,'Recomiendo totalmente','2026-03-02 21:20:00.000000',5,1028,1033),(22,'Escucha activa y buen feedback','2026-02-09 21:35:00.000000',4,1028,1030),(23,'Muy claro en su enfoque','2026-02-04 09:15:00.000000',4,1030,1035),(24,'Buen seguimiento del caso','2026-02-11 10:20:00.000000',5,1030,1031),(25,'Me dio herramientas útiles','2026-02-04 09:45:00.000000',5,1030,1035),(26,'Profesional y puntual','2026-02-11 10:50:00.000000',4,1030,1031),(27,'Muy buena atención','2026-02-25 09:30:00.000000',5,1030,1028),(28,'Muy atento y respetuoso','2026-02-04 20:05:00.000000',5,1032,1036),(29,'Sesión intensa pero útil','2026-02-09 21:45:00.000000',4,1032,1030),(30,'Gran capacidad de análisis','2026-02-04 20:35:00.000000',5,1032,1036),(31,'Me sentí escuchado','2026-02-25 20:10:00.000000',5,1032,1029),(32,'Lo recomiendo mucho','2026-02-09 22:05:00.000000',4,1032,1030),(33,'Primera sesión muy buena','2026-02-09 12:10:00.000000',5,1029,1033),(34,'Profesional y amable','2026-02-23 13:15:00.000000',4,1029,1035),(35,'Explicaciones claras','2026-02-09 12:40:00.000000',5,1029,1033),(36,'Me dio confianza rápidamente','2026-02-23 13:45:00.000000',5,1029,1035),(37,'Buen enfoque terapéutico','2026-03-02 15:10:00.000000',4,1029,1034),(38,'Muy buena experiencia','2026-02-11 11:30:00.000000',5,1030,1031),(39,'Volvería a atenderme','2026-02-02 12:55:00.000000',4,1031,1033),(40,'Me ayudó a ordenar ideas','2026-02-06 14:10:00.000000',5,1031,1028),(41,'Excelente trato','2026-02-04 20:50:00.000000',5,1032,1036),(42,'Muy recomendable profesional','2026-02-09 12:55:00.000000',5,1029,1033);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-17 15:29:27
