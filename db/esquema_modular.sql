-- =============================================================================
-- ESQUEMA MODULAR UNIVERSAL PARA COMPETENCIAS Y EVALUACIONES
-- Base de Datos: MySQL 8.0+ / MariaDB 10.4+
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- CREACIÓN Y SELECCIÓN DE LA BASE DE DATOS
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `huapango_db`
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `huapango_db`;

-- -----------------------------------------------------------------------------
-- 1. TABLA DE USUARIOS (Compatible con roles y login del sistema existente)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_usuarios (
    nUsuarioID INT AUTO_INCREMENT PRIMARY KEY,
    cNombreUsuario VARCHAR(80) NOT NULL UNIQUE,
    cContrasena VARCHAR(255) NOT NULL,
    cNombreCompleto VARCHAR(150) NULL,
    rol ENUM('admin', 'user', 'juez') NOT NULL DEFAULT 'juez',
    bActivo BOOLEAN DEFAULT TRUE,
    dFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLA DE EVENTOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_eventos (
    nEventoID INT AUTO_INCREMENT PRIMARY KEY,
    cNombre VARCHAR(180) NOT NULL,
    cDescripcion TEXT NULL,
    cTipoEvento VARCHAR(80) NOT NULL COMMENT 'Ej: danza, gastronomia, combate, arte, academico',
    cFormato ENUM('Presencial', 'Virtual', 'Hibrido') DEFAULT 'Presencial',
    dFechaInicio DATETIME NOT NULL,
    dFechaFin DATETIME NULL,
    cEstado ENUM('borrador', 'activo', 'finalizado', 'cancelado') DEFAULT 'activo',
    dFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLA DE CATEGORÍAS (Configuración modular por competencia)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_categorias (
    nCategoriaID INT AUTO_INCREMENT PRIMARY KEY,
    nEventoID INT NOT NULL,
    cNombre VARCHAR(150) NOT NULL,
    cDescripcion TEXT NULL,
    cModalidad ENUM('individual', 'pareja', 'equipo') DEFAULT 'pareja',
    nMinJuecesRequeridos INT UNSIGNED DEFAULT 3,
    jReglas JSON NULL COMMENT 'Reglas, penalizaciones, tiempos de ejecución y vestimenta',
    cEstado ENUM('activa', 'cerrada', 'en_evaluacion', 'finalizada') DEFAULT 'activa',
    dFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categoria_evento FOREIGN KEY (nEventoID) 
        REFERENCES t_eventos(nEventoID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLA DE CRITERIOS DE CALIFICACIÓN (Rúbricas dinámicas por categoría)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_criterios_calificacion (
    nCriterioID INT AUTO_INCREMENT PRIMARY KEY,
    nCategoriaID INT NOT NULL,
    cNombre VARCHAR(120) NOT NULL,
    cDescripcion VARCHAR(255) NULL,
    cTipoControl ENUM('range', 'number', 'select', 'stars', 'boolean') DEFAULT 'range',
    nPuntajeMinimo DECIMAL(6,2) DEFAULT 0.00,
    nPuntajeMaximo DECIMAL(6,2) DEFAULT 10.00,
    nPaso DECIMAL(4,2) DEFAULT 0.50,
    nPesoPorcentaje DECIMAL(5,2) DEFAULT 25.00 COMMENT 'Porcentaje de ponderación (Suma 100%)',
    nOrden INT DEFAULT 1,
    jOpcionesEscala JSON NULL,
    bEsObligatorio BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_criterio_categoria FOREIGN KEY (nCategoriaID) 
        REFERENCES t_categorias(nCategoriaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLA DE PARTICIPANTES (Abstrae parejas, atletas, recetas, grupos)
-- NOTA: nParticipanteID y cIdentificador se autogeneran al registrar
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_participantes (
    nParticipanteID INT AUTO_INCREMENT PRIMARY KEY,
    nCategoriaID INT NOT NULL,
    cIdentificador VARCHAR(50) NOT NULL COMMENT 'Dorsal o folio generado automáticamente (ej: FOLIO-101)',
    cNombreRepresentativo VARCHAR(180) NOT NULL COMMENT 'Nombre o título principal de la inscripción',
    jMetadatos JSON NULL COMMENT 'Datos desglosados (integrantes, edad, estado, club, etc.)',
    cFotoUrl VARCHAR(255) NULL,
    cEstado ENUM('registrado', 'presente', 'descalificado', 'evaluado') DEFAULT 'registrado',
    dFechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participante_categoria FOREIGN KEY (nCategoriaID) 
        REFERENCES t_categorias(nCategoriaID) ON DELETE CASCADE,
    UNIQUE KEY uq_categoria_identificador (nCategoriaID, cIdentificador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. ASIGNACIÓN DE JUECES A CATEGORÍAS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_jueces_categoria (
    nAsignacionID INT AUTO_INCREMENT PRIMARY KEY,
    nCategoriaID INT NOT NULL,
    nUsuarioID INT NOT NULL,
    bActivo BOOLEAN DEFAULT TRUE,
    dFechaAsignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asig_categoria FOREIGN KEY (nCategoriaID) 
        REFERENCES t_categorias(nCategoriaID) ON DELETE CASCADE,
    CONSTRAINT fk_asig_usuario FOREIGN KEY (nUsuarioID) 
        REFERENCES t_usuarios(nUsuarioID) ON DELETE CASCADE,
    UNIQUE KEY uq_juez_categoria (nCategoriaID, nUsuarioID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. SESIÓN DE EVALUACIÓN (Cabecera por Juez y Participante)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_evaluaciones (
    nEvaluacionID INT AUTO_INCREMENT PRIMARY KEY,
    nCategoriaID INT NOT NULL,
    nParticipanteID INT NOT NULL,
    nJuezID INT NOT NULL,
    nPuntajeTotalCalculado DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    cObservaciones TEXT NULL,
    dFechaEvaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_categoria FOREIGN KEY (nCategoriaID) 
        REFERENCES t_categorias(nCategoriaID) ON DELETE CASCADE,
    CONSTRAINT fk_eval_participante FOREIGN KEY (nParticipanteID) 
        REFERENCES t_participantes(nParticipanteID) ON DELETE CASCADE,
    CONSTRAINT fk_eval_juez FOREIGN KEY (nJuezID) 
        REFERENCES t_usuarios(nUsuarioID) ON DELETE RESTRICT,
    UNIQUE KEY uq_juez_evaluacion_unica (nCategoriaID, nParticipanteID, nJuezID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. DETALLE DE CALIFICACIÓN POR CRITERIO INDIVIDUAL
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_evaluacion_detalles (
    nDetalleID INT AUTO_INCREMENT PRIMARY KEY,
    nEvaluacionID INT NOT NULL,
    nCriterioID INT NOT NULL,
    nPuntajeOtorgado DECIMAL(6,2) NOT NULL,
    cNotaCriterio VARCHAR(255) NULL,
    CONSTRAINT fk_det_evaluacion FOREIGN KEY (nEvaluacionID) 
        REFERENCES t_evaluaciones(nEvaluacionID) ON DELETE CASCADE,
    CONSTRAINT fk_det_criterio FOREIGN KEY (nCriterioID) 
        REFERENCES t_criterios_calificacion(nCriterioID) ON DELETE RESTRICT,
    UNIQUE KEY uq_eval_criterio (nEvaluacionID, nCriterioID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- DATOS DE EJEMPLO REALISTAS Y CON SENTIDO
-- =============================================================================

-- 1. Usuarios con roles
INSERT INTO t_usuarios (nUsuarioID, cNombreUsuario, cContrasena, cNombreCompleto, rol) VALUES
(1, 'admin', 'admin123', 'Administrador Principal', 'admin'),
(2, 'juez_roberto', 'juez123', 'Mtro. Roberto Morales (Juez Huapango)', 'juez'),
(3, 'juez_laura', 'juez123', 'Profra. Laura Escamilla (Jueza Ritmo)', 'juez'),
(4, 'juez_carlos', 'juez123', 'Chef Carlos Mendoza (Juez Gastronomía)', 'juez')
ON DUPLICATE KEY UPDATE cNombreCompleto = VALUES(cNombreCompleto);

-- 2. Eventos configurados
INSERT INTO t_eventos (nEventoID, cNombre, cDescripcion, cTipoEvento, cFormato, dFechaInicio, dFechaFin, cEstado) VALUES
(1, 'L Concurso Nacional de Baile de Huapango Huasteco', 'Certamen nacional con estilos Hidalguense, Potosino, Queretano, Veracruzano, Tamaulipeco y Poblano.', 'danza', 'Presencial', '2026-11-15 09:00:00', '2026-11-17 22:00:00', 'activo'),
(2, 'Certamen y Muestra Gastronómica Tradicional 2026', 'Competencia culinaria de recetas ancestrales, balance y sazón regional.', 'gastronomia', 'Presencial', '2026-12-05 10:00:00', '2026-12-06 18:00:00', 'activo')
ON DUPLICATE KEY UPDATE cNombre = VALUES(cNombre);

-- 3. Categorías con reglas modulares
INSERT INTO t_categorias (nCategoriaID, nEventoID, cNombre, cDescripcion, cModalidad, nMinJuecesRequeridos, jReglas, cEstado) VALUES
(1, 1, 'Adultos - Huapango Tradicional', 'Parejas de 18 a 49 años ejecutando sones tradicionales huastecos.', 'pareja', 3, 
    '{"duracionSonSegundos": 240, "indumentariaObligatoria": true, "descalificacionPorCaidaAccesorios": true, "descripcion": "Evaluación estricta de compás, técnica de taconeo y proyección escénica."}', 
    'activa'),
(2, 1, 'Juvenil - Huapango Tradicional', 'Parejas de 12 a 17 años en eliminatoria directa.', 'pareja', 3, 
    '{"duracionSonSegundos": 180, "indumentariaObligatoria": true, "descripcion": "Foco en ritmo, coordinación y apego al estilo tradicional."}', 
    'activa'),
(3, 2, 'Platillos Tradicionales y Salsas', 'Preparación en vivo y presentación de platillo típico con salsa en molcajete.', 'individual', 3, 
    '{"tiempoPreparacionMinutos": 45, "higieneObligatoria": true, "temperaturaServicio": "Caliente", "descripcion": "Degustación ciega y evaluación técnica de texturas y cocción."}', 
    'activa')
ON DUPLICATE KEY UPDATE cNombre = VALUES(cNombre);

-- 4. Rúbricas y Criterios con Ponderación exacta (100% por categoría)
-- Criterios Categoría 1 (Huapango Adultos):
INSERT INTO t_criterios_calificacion (nCriterioID, nCategoriaID, cNombre, cDescripcion, cTipoControl, nPuntajeMinimo, nPuntajeMaximo, nPaso, nPesoPorcentaje, nOrden) VALUES
(1, 1, 'Ritmo y Compás', 'Apego estricto al compás del violín y la jarana; entrada y remates precisos.', 'range', 0.00, 10.00, 0.50, 25.00, 1),
(2, 1, 'Coreografía y Estilo', 'Variedad de pasos de taconeo, desplazamientos elegantes y apego al estilo regional.', 'range', 0.00, 10.00, 0.50, 25.00, 2),
(3, 1, 'Técnica y Precisión', 'Postura corporal limpia, firmeza en el zapateado y coordinación en pareja.', 'range', 0.00, 10.00, 0.50, 25.00, 3),
(4, 1, 'Vestuario y Proyección', 'Porte tradicional auténtico, complementos típicos y presencia escénica.', 'range', 0.00, 10.00, 0.50, 25.00, 4)
ON DUPLICATE KEY UPDATE cNombre = VALUES(cNombre);

-- Criterios Categoría 3 (Gastronomía):
INSERT INTO t_criterios_calificacion (nCriterioID, nCategoriaID, cNombre, cDescripcion, cTipoControl, nPuntajeMinimo, nPuntajeMaximo, nPaso, nPesoPorcentaje, nOrden) VALUES
(5, 3, 'Sabor y Balance', 'Armonía de especias, punto de sal y profundidad de sabor.', 'range', 0.00, 10.00, 0.50, 40.00, 1),
(6, 3, 'Textura y Punto de Cocción', 'Consistencia óptima de la proteína y homogeneidad en salsas.', 'range', 0.00, 10.00, 0.50, 30.00, 2),
(7, 3, 'Presentación y Emplatado', 'Estética, higiene, respeto a la vajilla tradicional y temperatura.', 'range', 0.00, 10.00, 0.50, 30.00, 3)
ON DUPLICATE KEY UPDATE cNombre = VALUES(cNombre);

-- 5. Asignación de Jueces
INSERT INTO t_jueces_categoria (nCategoriaID, nUsuarioID) VALUES
(1, 2), -- Juez Roberto en Huapango Adultos
(1, 3), -- Jueza Laura en Huapango Adultos
(3, 4)  -- Juez Carlos en Gastronomía
ON DUPLICATE KEY UPDATE bActivo = 1;

-- 6. Participantes de ejemplo con folios preasignados
-- (En el registro nuevo desde la UI, el folio se generará automáticamente)
INSERT INTO t_participantes (nParticipanteID, nCategoriaID, cIdentificador, cNombreRepresentativo, jMetadatos, cFotoUrl, cEstado) VALUES
(1, 1, 'FOLIO-101', 'Pareja 101: Roberto Gómez y Elena Silva', 
    '{"bailarin1": "Roberto Gómez (26 años)", "bailarin2": "Elena Silva (24 años)", "estadoOrigen": "Querétaro", "estilo": "Queretano", "telefono": "4421234567"}', 
    NULL, 'evaluado'),
(2, 1, 'FOLIO-102', 'Pareja 102: Daniel Morales y Sofía Hernández', 
    '{"bailarin1": "Daniel Morales (28 años)", "bailarin2": "Sofía Hernández (27 años)", "estadoOrigen": "San Luis Potosí", "estilo": "Potosino", "telefono": "4449876543"}', 
    NULL, 'presente'),
(3, 1, 'FOLIO-103', 'Pareja 103: Alejandro Ruiz y Mariana Castro', 
    '{"bailarin1": "Alejandro Ruiz (22 años)", "bailarin2": "Mariana Castro (21 años)", "estadoOrigen": "Hidalgo", "estilo": "Hidalguense", "telefono": "7715551234"}', 
    NULL, 'registrado'),
(4, 3, 'FOLIO-G01', 'Chef Patricia Ramos - Mole de Olla con Salsa Martajada', 
    '{"participante": "Patricia Ramos", "restaurante": "Rincón Huasteco", "municipio": "Tamazunchale", "tiempoElaboracion": "40 min"}', 
    NULL, 'registrado')
ON DUPLICATE KEY UPDATE cNombreRepresentativo = VALUES(cNombreRepresentativo);

-- 7. Evaluaciones de ejemplo ya calificadas (para poblar Leaderboard y auditoría)
-- Juez 2 evalúa a Pareja 101:
-- Ritmo: 9.0 (peso 25% = 2.25)
-- Coreografía: 9.5 (peso 25% = 2.375)
-- Técnica: 9.0 (peso 25% = 2.25)
-- Vestuario: 10.0 (peso 25% = 2.50)
-- Total = 9.375 -> 9.38
INSERT INTO t_evaluaciones (nEvaluacionID, nCategoriaID, nParticipanteID, nJuezID, nPuntajeTotalCalculado, cObservaciones) VALUES
(1, 1, 1, 2, 9.38, 'Excelente coordinación en las entradas de son y vestimenta tradicional impecable.')
ON DUPLICATE KEY UPDATE nPuntajeTotalCalculado = VALUES(nPuntajeTotalCalculado);

INSERT INTO t_evaluacion_detalles (nEvaluacionID, nCriterioID, nPuntajeOtorgado, cNotaCriterio) VALUES
(1, 1, 9.00, 'Remates precisos'),
(1, 2, 9.50, 'Hermosos desplazamientos'),
(1, 3, 9.00, 'Taconeo firme'),
(1, 4, 10.00, 'Indumentaria queretana auténtica')
ON DUPLICATE KEY UPDATE nPuntajeOtorgado = VALUES(nPuntajeOtorgado);

-- Juez 3 evalúa a Pareja 101:
-- Total = 9.13
INSERT INTO t_evaluaciones (nEvaluacionID, nCategoriaID, nParticipanteID, nJuezID, nPuntajeTotalCalculado, cObservaciones) VALUES
(2, 1, 1, 3, 9.13, 'Gran proyección y energía en el tablado.')
ON DUPLICATE KEY UPDATE nPuntajeTotalCalculado = VALUES(nPuntajeTotalCalculado);

INSERT INTO t_evaluacion_detalles (nEvaluacionID, nCriterioID, nPuntajeOtorgado, cNotaCriterio) VALUES
(2, 1, 9.00, 'Buen compás'),
(2, 2, 9.00, 'Coreografía limpia'),
(2, 3, 9.00, 'Buen zapateado'),
(2, 4, 9.50, 'Muy buena proyección')
ON DUPLICATE KEY UPDATE nPuntajeOtorgado = VALUES(nPuntajeOtorgado);
