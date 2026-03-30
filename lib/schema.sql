CREATE DATABASE IF NOT EXISTS exam_scheduler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exam_scheduler;

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('automne','printemps') NOT NULL
);

CREATE TABLE IF NOT EXISTS filieres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  nom VARCHAR(150) NOT NULL,
  semestre VARCHAR(5) NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filiere_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  nom VARCHAR(200) NOT NULL,
  session_type ENUM('automne','printemps') NOT NULL,
  FOREIGN KEY (filiere_id) REFERENCES filieres(id),
  UNIQUE KEY (code)
);

CREATE TABLE IF NOT EXISTS planning (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  session_id INT NOT NULL,
  jour DATE NOT NULL,
  periode ENUM('matin','apres-midi') NOT NULL,
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

INSERT IGNORE INTO sessions (nom, type) VALUES
('Automne 2025-2026', 'automne'),
('Printemps 2025-2026', 'printemps');

INSERT IGNORE INTO filieres (code, nom, semestre) VALUES
('SLCHT1', '1ere Année : Chimie', 'S1'),
('SLIAT1', '1ere année Info Appliquée', 'S1'),
('SLBGT1', '1ere Année : Biologie', 'S1'),
('SLMIT1', '1ère année Informatique', 'S1'),
('SLPCH2', '2eme anée Physique', 'S3'),
('SLIAT2', '2eme année Info Appliquee', 'S3'),
('SLMII2', '2eme annee Informatique', 'S3'),
('SLBI3',  '2eme année Biologie', 'S3'),
('SLCH3',  '2eme année Chimie', 'S3'),
('SLGE3',  '2eme année Géologie', 'S3'),
('SLMA3',  '2eme année Mathématique', 'S3'),
('SLBGB3', '3eme année biologie', 'S5'),
('SLMIM3', '3eme année Mathématiques', 'S5'),
('SLPH5',  '3eme année Physique Moderne', 'S5'),
('SLGE5',  '3eme année géologie', 'S5'),
('SLIN5',  '3eme année Informatique', 'S5'),
('SLCP5',  '3eme année Chimie Physique', 'S5'),
('SLIA5',  '3eme année Info Appliquée', 'S5'),
('SFV35',  '3ème année BV', 'S5'),
('SFC35',  '3ème année chimie', 'S5'),
('SFP35',  '3ème année SMP', 'S5'),
('SFA35',  '3eme année maths appliquées', 'S5'),
('MFBAV2', 'Master BAVIA', 'S3'),
('MGM11',  '1ere année Master Génie Maritime', 'S1'),
('SBE23',  '2eme année Master SBENV', 'S3'),
('SLGE5E', '3eme année Génie Eléctrique et Energie Renouvelables', 'S5');

INSERT IGNORE INTO modules (filiere_id, code, nom, session_type)
  SELECT f.id, 'SLPC1105', 'algebre1', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1205', 'analyse 1', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1305', 'atomistique', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1405', 'thermochimie', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1505', 'thermodynamique', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1605', 'mécanique du point', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLPC1705', 'MTU', 'automne' FROM filieres f WHERE f.code = 'SLCHT1'
UNION ALL
  SELECT f.id, 'SLIA1105', 'Analyse 1', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1205', 'Algebre 1', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1305', 'Electronique numérique', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1405', 'Algorithmique et Programmation', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1505', 'Programmation Python 1', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1605', 'Architecture', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLIA1705', 'MTU', 'automne' FROM filieres f WHERE f.code = 'SLIAT1'
UNION ALL
  SELECT f.id, 'SLBG1105', 'Biologie cellulaire', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1205', 'Histologie et notions d\'embryologie', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1305', 'Géologie générale', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1405', 'Atomistique et laison chimique', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1505', 'Thermodynamique/mécanique', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1605', 'Mathématiques', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLBG1705', 'MTU', 'automne' FROM filieres f WHERE f.code = 'SLBGT1'
UNION ALL
  SELECT f.id, 'SLMI1105', 'Algébre1', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1205', 'Algébre2', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1305', 'Analyse1', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1405', 'Thérmodynamique', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1505', 'Mécanique du point', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1605', 'Informatique', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLMI1705', 'MTU', 'automne' FROM filieres f WHERE f.code = 'SLMIT1'
UNION ALL
  SELECT f.id, 'SLPH3105', 'Mecanique du solide', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3205', 'Circuit électriques', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3305', 'Electromagnétisme', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3405', 'Chimie organique générale', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3505', 'Thermodynamique 2', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3605', 'Mathematique physique', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLPH3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLPCH2'
UNION ALL
  SELECT f.id, 'SLIA3105', 'Programmation Web 2', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3205', 'Recherche opérationnelle', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3305', 'Systéme d\'exploitation 1', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3405', 'Structure de données en c', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3505', 'Modélisation objet-UML', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3605', 'Probabilités et statistiques', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIA3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLIAT2'
UNION ALL
  SELECT f.id, 'SLIN3105', 'Program Objet UML', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3205', 'Programmation Web 1', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3305', 'Programmation en Lang c', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3405', 'Systéme d\'exploitation 1', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3505', 'architecture des ordinateurs', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3605', 'Probabilités et statistiques', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLIN3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLMII2'
UNION ALL
  SELECT f.id, 'SLBI3105', 'Biochimie structurale', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3205', 'Microbiologie générale', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3305', 'Ecologie générale', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3404', 'Techniques d\'analyse', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3504', 'Biostatistiques', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3605', 'Informatique pour la biologie', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLBI3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLBI3'
UNION ALL
  SELECT f.id, 'SLCH3105', 'Chimie descriptive I', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3205', 'Chimie organique générale', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3305', 'Chimie des électrolytes', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3405', 'Mathématiques-Chimie', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3505', 'Electromagnétisme', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3605', 'Algorithmique & programmation python', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLCH3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLCH3'
UNION ALL
  SELECT f.id, 'SLGE3105', 'Tectonique Analytique', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3205', 'Tectonique globale', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3305', 'Pétrologie magmatique', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3405', 'Pétrologie métamorphique', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3505', 'Pétrographie sédimentaire', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3605', 'Hydrogéologie et hydrologie', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLGE3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLGE3'
UNION ALL
  SELECT f.id, 'SLMA3105', 'Analyse4', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3205', 'analyse5', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3305', 'Algebre4', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3405', 'Probabilités et statistiques', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3505', 'Informatique 3', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3605', 'Mécanique du solide', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLMA3705', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLMA3'
UNION ALL
  SELECT f.id, 'SLBI5105', 'Biocologie des écosystèmes et écotoxicologie', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5205', 'Biophysique et techniques d\'analyses biomédicales', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5305', 'Physiologie humaine', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5405', 'Génétique II et biologie moléculaire', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5505', 'Les bases fondamentales de l\'immunologie', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5605', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLBI5705', 'Compétences numérique II: Excel avancé', 'automne' FROM filieres f WHERE f.code = 'SLBGB3'
UNION ALL
  SELECT f.id, 'SLMA5105', 'Analyse complexe', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5205', 'Topologie', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5305', 'Mesure et Integration', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5405', 'Calcul differentiel', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5505', 'Analyse Numerique 2', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5605', 'Langues', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLMA5705', 'Systeme de gestion de contenu', 'automne' FROM filieres f WHERE f.code = 'SLMIM3'
UNION ALL
  SELECT f.id, 'SLPH5105', 'Mécanique analytique & vibration', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5205', 'Electronique', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5305', 'Physique des matériaux', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5405', 'Physique statistique', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5505', 'Physique nucléaire', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5605', 'Module transversal', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLPH5705', 'Langue étrangère 2', 'automne' FROM filieres f WHERE f.code = 'SLPH5'
UNION ALL
  SELECT f.id, 'SLGE5105', 'Géologie et Géoressources marines et littorales', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5205', 'Ecole de terrain', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5305', 'Introduction à la géotechnique', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5405', 'Cartographie thématique et topographie', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5505', 'Géophysique', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5605', 'Langues étrangères', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLGE5705', 'Power skills', 'automne' FROM filieres f WHERE f.code = 'SLGE5'
UNION ALL
  SELECT f.id, 'SLIN5105', 'Algorithmique et Programmation en python', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5205', 'Recherche operationnelle', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5305', 'Bases de données avancée', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5405', 'Langage de modélisation unifié UML', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5505', 'Programmation OB JAVA', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5605', 'Réseaux', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLIN5705', 'Langues (Anglais)', 'automne' FROM filieres f WHERE f.code = 'SLIN5'
UNION ALL
  SELECT f.id, 'SLCP5105', 'Techniques Spectroscopiques d\'analyse', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5205', 'Chimie organique fonctionnelle', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5305', 'Radiocristallographie et cristallochimie II', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5405', 'Electrochimie', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5505', 'Cinétique et réacteurs chimiques', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5605', 'Anglais', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLCP5705', 'Digital Skills II : Excel avancé', 'automne' FROM filieres f WHERE f.code = 'SLCP5'
UNION ALL
  SELECT f.id, 'SLIA5105', 'Algorithmique et programmation en python', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5205', 'Technologies et ingénierie avancée du web', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5305', 'Analyse et visualisation des données', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5405', 'Programmation orientée objet-java', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5505', 'Analyse des données', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5605', 'Bases de données avancée', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SLIA5705', 'Langues : Anglais', 'automne' FROM filieres f WHERE f.code = 'SLIA5'
UNION ALL
  SELECT f.id, 'SFV35104', 'Physiologie des grandes fonctions', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFV35204', 'Croissance et developpement des plantes', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFV35304', 'Ecologie générale II', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFV35404', 'Immunologie', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFV35504', 'Génétique', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFV35604', 'Biologie moléculaire', 'automne' FROM filieres f WHERE f.code = 'SFV35'
UNION ALL
  SELECT f.id, 'SFC35104', 'Chimie organique fonctionnelle', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFC35204', 'Radiocristallographie et cristallochimie II', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFC35304', 'Cinétique et catalyse', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFC35404', 'Chimie théorique', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFC35504', 'Electrochimie', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFC35604', 'Techniques spectroscopiques d\'analyse', 'automne' FROM filieres f WHERE f.code = 'SFC35'
UNION ALL
  SELECT f.id, 'SFP35104', 'Electronique analogique', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFP35204', 'Mécanique analytique et vibrations', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFP35304', 'Physique nucléaire', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFP35404', 'Physique des matériaux', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFP35504', 'Physique quantique', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFP35604', 'Physique statistique', 'automne' FROM filieres f WHERE f.code = 'SFP35'
UNION ALL
  SELECT f.id, 'SFA35104', 'Topologie', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'SFA35204', 'Intégration', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'SFA35304', 'Calcul différentiel', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'SFA35404', 'Programmation Mathématique', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'SFA35504', 'Analyse numérique 2', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'SFA35604', 'Informatique 5 : Programmation orientée objet', 'automne' FROM filieres f WHERE f.code = 'SFA35'
UNION ALL
  SELECT f.id, 'MB23105', 'Biochimie Alimentaire', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23205', 'Hygiène et Sécurité des Aliments', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23305', 'Management et Normes de la Qualité en Agroalimentaire', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23405', 'Stage d\'initiation', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23505', 'Technologie Alimentaire', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23605', 'Microbiologie Industrielle', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MB23705', 'Nutrition et Alimentation', 'automne' FROM filieres f WHERE f.code = 'MFBAV2'
UNION ALL
  SELECT f.id, 'MGM11104', 'Géologie et Géomorphologie côtières et marines', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'MGM11204', 'Sédimentologie et géotechnique côtières et marines', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'MGM11304', 'Océanographie biologique', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'MGM11404', 'Risques côtiers et changements climatiques', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'MGM11504', 'SIG et Télédétection spatiale', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'MGM11604', 'Langues Communication & Soft Skills', 'automne' FROM filieres f WHERE f.code = 'MGM11'
UNION ALL
  SELECT f.id, 'SBE23104', 'Gestion de la Biodiversité', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23204', 'Génétique / Epidémiologie', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23304', 'Substances Naturelles : Phytochimie & applications', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23404', 'Génomique fonctionnelle', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23504', 'Propriété intellectuelle et rédaction des brevets', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23604', 'Ecologie et gestion', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SBE23704', 'Ressources halieutiques au Maroc : Gestion et conservation', 'automne' FROM filieres f WHERE f.code = 'SBE23'
UNION ALL
  SELECT f.id, 'SLPH5405', 'Physique statistique', 'automne' FROM filieres f WHERE f.code = 'SLGE5E';
