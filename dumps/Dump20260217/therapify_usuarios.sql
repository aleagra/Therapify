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
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) NOT NULL,
  `availability` text,
  `company_name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `schedule` text,
  `user_type` enum('ADMIN','DOCTOR','PACIENTE') DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `enabled` bit(1) NOT NULL,
  `consultation_price` double DEFAULT NULL,
  `specialty` enum('NEUROPSICOLOGIA','PSICOLOGIA_CLINICA','PSICOLOGIA_INFANTIL','PSICOLOGIA_LABORAL','PSIQUIATRIA','SEXOLOGIA','TERAPIA_COGNITIVO_CONDUCTUAL','TERAPIA_DE_PAREJA','TERAPIA_FAMILIAR','TERAPIA_HUMANISTA') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1038 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1027,NULL,'Sistema',NULL,NULL,NULL,'admin@gmail.com',NULL,'Admin','$2a$10$7kjQjSv4tLOD9lwfcxgZXuWZNLqifXyUlM0I0HjebOcAB/OQw5GOi',NULL,'ADMIN',NULL,NULL,NULL,_binary '',NULL,NULL),(1028,'Juncal 3130','Rodriguez','{\"monday\":[\"19:00\",\"20:00\",\"21:00\"],\"tuesday\":[],\"wednesday\":[],\"thursday\":[],\"friday\":[]}',NULL,'Intervención terapéutica para fortalecer vínculos y dinámicas familiares.','nicolas.rodriguez@gmail.com','male','Nicolas','$2a$10$93P/E7JHRXLxJW0dpPmtDexXOuLj2k11WuEmV./1vuaz3LieY9jLC','{\"monday\":true,\"tuesday\":false,\"wednesday\":false,\"thursday\":false,\"friday\":false}','DOCTOR',NULL,-37.9936679,-57.590277,_binary '',60000,'TERAPIA_FAMILIAR'),(1029,'Olavarría 2502','Martinez','{\"monday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\",\"18:00\",\"19:00\",\"20:00\",\"21:00\"],\"tuesday\":[],\"wednesday\":[],\"thursday\":[],\"friday\":[]}',NULL,'Diagnóstico y tratamiento médico de trastornos mentales, con enfoque integral.','sofia.martinez@gmail.com','female','Sofia','$2a$10$JjadAFzATgFuCc5B8aVVNeTdtxwC8dJjWV5MsKrJxBa32D7TUVYdi','{\"monday\":true,\"tuesday\":false,\"wednesday\":false,\"thursday\":false,\"friday\":false}','DOCTOR',NULL,-38.012122,-57.54016,_binary '',200000,'PSIQUIATRIA'),(1030,'Rivadavia 3400','Perez','{\"monday\":[\"08:00\",\"09:00\",\"10:00\",\"11:00\",\"12:00\",\"13:00\"],\"tuesday\":[],\"wednesday\":[\"08:00\",\"09:00\",\"10:00\",\"11:00\",\"12:00\",\"13:00\"],\"thursday\":[],\"friday\":[\"08:00\",\"09:00\",\"10:00\",\"11:00\",\"12:00\",\"13:00\"]}',NULL,'Evaluación y tratamiento de trastornos emocionales y conductuales en adultos.','juan.perez@gmail.com','male','Juan','$2a$10$py0Jq.1tgttO1RWOyExI6u1dC0I972fytpym/5GS/x7TDbcKOUA2e','{\"monday\":true,\"tuesday\":false,\"wednesday\":true,\"thursday\":false,\"friday\":true}','DOCTOR',NULL,-37.996335,-57.555655,_binary '',25000,'TERAPIA_COGNITIVO_CONDUCTUAL'),(1031,'Av. Constitución 5200','Gonzales','{\"monday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\"],\"tuesday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\"],\"wednesday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\"],\"thursday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\"],\"friday\":[\"10:00\",\"11:00\",\"12:00\",\"13:00\",\"14:00\",\"15:00\",\"16:00\",\"17:00\"]}',NULL,'Orientación en estrés laboral, clima organizacional y desarrollo profesional.','maria.gonzalez@gmail.com','female','Maria','$2a$10$1himgQ8Sr2LEg35qZC0wX.gkItP3lQifL87DnG.0Mz0HZt6iG9Blu','{\"monday\":true,\"tuesday\":true,\"wednesday\":true,\"thursday\":true,\"friday\":true}','DOCTOR',NULL,-37.9647316,-57.5556141,_binary '',40000,'PSICOLOGIA_LABORAL'),(1032,'Güemes 2500','Fernandez','{\"monday\":[\"18:00\",\"19:00\",\"20:00\",\"21:00\"],\"tuesday\":[\"18:00\",\"19:00\",\"20:00\",\"21:00\"],\"wednesday\":[\"18:00\",\"19:00\",\"20:00\",\"21:00\"],\"thursday\":[],\"friday\":[]}',NULL,'Abordaje terapéutico de la sexualidad, vínculos y bienestar íntimo.','lucas.fernandez@gmail.com','male','Lucas ','$2a$10$1atR5dIqw8K5Jt0vMFbHquX5S6EGVKwfgu0xnay4bS1HZOqZ5Kkzq','{\"monday\":true,\"tuesday\":true,\"wednesday\":true,\"thursday\":false,\"friday\":false}','DOCTOR',NULL,-38.012423,-57.53893,_binary '',50000,'SEXOLOGIA'),(1033,NULL,'Lopez',NULL,NULL,NULL,'valentina.lopez@gmail.com','female','Valentina','$2a$10$EA30iVOCWpXihHJy1kUHCuqeRvO6WtAI9Gra9kgwZRbDogl2Gceuy',NULL,'PACIENTE',NULL,NULL,NULL,_binary '',NULL,NULL),(1034,NULL,'Sanchez',NULL,NULL,NULL,'martin.sanchez@gmail.com','male','Martin','$2a$10$EeQjPRzgiH04E.tlTC.1OeGK/ossSktkXYWGThagTmxsVKSm4hM42',NULL,'PACIENTE',NULL,NULL,NULL,_binary '',NULL,NULL),(1035,NULL,'Romero',NULL,NULL,NULL,'camila.romero@gmail.com','female','Camila','$2a$10$SjeoZxS8BSIYW3HBPTUnbuk7I12T3uk.wnrXowUGki9Vd11gI4l2K',NULL,'PACIENTE',NULL,NULL,NULL,_binary '',NULL,NULL),(1036,NULL,'Diaz',NULL,NULL,NULL,'tomas.diaz@gmail.com','male','Tomas','$2a$10$J6JMu46/6txGKmaKuJZqI.y5ax8I9ioo73JySCEzp5maPhu4ptySO',NULL,'PACIENTE',NULL,NULL,NULL,_binary '',NULL,NULL),(1037,'Rawson 2100','Herrera','{\"monday\":[],\"tuesday\":[],\"wednesday\":[],\"thursday\":[],\"friday\":[]}',NULL,'Acompañamiento centrado en el crecimiento personal y el autoconocimiento.','julieta.herrera@gmail.com','female','Julieta','$2a$10$.jBxMsXsDXfsSVEhGQtNRevb8NxWQC8QdfuX22U.WFTIj.DWSEkme','{\"monday\":false,\"tuesday\":false,\"wednesday\":false,\"thursday\":false,\"friday\":false}','DOCTOR',NULL,-38.010163,-57.548375,_binary '',35000,'TERAPIA_HUMANISTA');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
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
