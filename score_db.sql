/*
Navicat MySQL Data Transfer

Source Server         : 本地
Source Server Version : 80031
Source Host           : localhost:3306
Source Database       : score_db

Target Server Type    : MYSQL
Target Server Version : 80031
File Encoding         : 65001

Date: 2025-12-02 08:55:10
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for ranks
-- ----------------------------
DROP TABLE IF EXISTS `ranks`;
CREATE TABLE `ranks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_score` bigint DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ranks
-- ----------------------------
INSERT INTO `ranks` VALUES ('41', '学徒', '0', '#9CA3AF', '?', '1');
INSERT INTO `ranks` VALUES ('42', '青铜', '20', '#CD7F32', '?', '2');
INSERT INTO `ranks` VALUES ('43', '白银', '50', '#A8A9AD', '?', '3');
INSERT INTO `ranks` VALUES ('44', '黄金', '100', '#FFD700', '?', '4');
INSERT INTO `ranks` VALUES ('45', '铂金', '180', '#00CED1', '?', '5');
INSERT INTO `ranks` VALUES ('46', '钻石', '280', '#B9F2FF', '?', '6');
INSERT INTO `ranks` VALUES ('47', '大师', '400', '#9400D3', '?', '7');
INSERT INTO `ranks` VALUES ('48', '宗师', '550', '#FF6B6B', '⭐', '8');
INSERT INTO `ranks` VALUES ('49', '王者', '750', '#FF4500', '?', '9');
INSERT INTO `ranks` VALUES ('50', '传奇', '1000', '#FFD700', '?', '10');

-- ----------------------------
-- Table structure for score_records
-- ----------------------------
DROP TABLE IF EXISTS `score_records`;
CREATE TABLE `score_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint unsigned DEFAULT NULL,
  `value` bigint DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_score_records_student_id` (`student_id`),
  CONSTRAINT `fk_score_records_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of score_records
-- ----------------------------

-- ----------------------------
-- Table structure for score_templates
-- ----------------------------
DROP TABLE IF EXISTS `score_templates`;
CREATE TABLE `score_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `value` bigint DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of score_templates
-- ----------------------------
INSERT INTO `score_templates` VALUES ('1', '回答问题', '2', '课堂表现');
INSERT INTO `score_templates` VALUES ('2', '作业优秀', '3', '作业');
INSERT INTO `score_templates` VALUES ('3', '考试进步', '5', '考试');
INSERT INTO `score_templates` VALUES ('4', '帮助同学', '2', '品德');
INSERT INTO `score_templates` VALUES ('5', '迟到', '-1', '纪律');
INSERT INTO `score_templates` VALUES ('6', '未交作业', '-2', '作业');
INSERT INTO `score_templates` VALUES ('7', '课堂违纪', '-2', '纪律');

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(50) DEFAULT NULL,
  `value` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of settings
-- ----------------------------

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_no` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `score` bigint DEFAULT '0',
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_students_student_no` (`student_no`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of students
-- ----------------------------
INSERT INTO `students` VALUES ('1', '01', '黄和杰', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:59:03.898');
INSERT INTO `students` VALUES ('2', '02', '陈艳琳', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('3', '03', '黄嘉琪', '0', '2025-12-01 17:05:37.574', '2025-12-01 18:02:34.928');
INSERT INTO `students` VALUES ('4', '04', '曹欣怡', '0', '2025-12-01 17:05:37.574', '2025-12-01 18:02:13.241');
INSERT INTO `students` VALUES ('5', '05', '傅怡菲', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:57:50.041');
INSERT INTO `students` VALUES ('6', '06', '陈佳琳', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('7', '07', '陈标炎', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('8', '08', '钟志轩', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('9', '09', '邹荇锴', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('10', '10', '黄颖涵', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('11', '11', '谢金淋', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('12', '12', '丘梓琴', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('13', '13', '李俊辉', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('14', '14', '陈新才', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('15', '15', '刘培鑫', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('16', '16', '李凌微', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('17', '17', '卢丽珍', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('18', '18', '钟炳生', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('19', '19', '张政涵', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('20', '20', '廖静雯', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('21', '21', '黄美淇', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('22', '22', '陈开桢', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('23', '23', '林永涛', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('24', '24', '王炜豪', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('25', '25', '阙志翔', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('26', '26', '阙涵', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('27', '27', '黄若宸', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('28', '28', '廖晓珺', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('29', '29', '钟谨宇', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('30', '30', '傅美琦', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('31', '31', '林艳茹', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('32', '32', '梁诗瑶', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('33', '33', '林静', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('34', '34', '张先文', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('35', '35', '黄功耀', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('36', '36', '邱德鹏', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('37', '37', '黄富涛', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('38', '38', '张彦珍', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('39', '39', '钟玉媛', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('40', '40', '陈煜', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('41', '41', '阙靖淇', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('42', '42', '黄传锦', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('43', '43', '陈菲', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('44', '44', '邹靓萍', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('45', '45', '黄福诚', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('46', '46', '黄新涛', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('47', '47', '陈玲', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('48', '48', '陈福清', '0', '2025-12-01 17:05:37.574', '2025-12-01 17:05:37.574');
INSERT INTO `students` VALUES ('49', '49', '黄小珍', '0', '2025-12-01 17:05:37.574', '2025-12-01 18:02:24.100');
INSERT INTO `students` VALUES ('50', '50', '黄传钦', '0', '2025-12-01 17:05:37.574', '2025-12-01 18:02:28.408');
