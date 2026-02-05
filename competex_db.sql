-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2026 at 06:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `competex_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

create database competex_db;
use competex_db;

CREATE TABLE `announcements` (
  `id` char(36) NOT NULL,
  `event_id` char(36) DEFAULT NULL,
  `organizer_id` char(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` char(36) NOT NULL,
  `sender_id` char(36) DEFAULT NULL,
  `recipient_id` char(36) DEFAULT NULL,
  `team_id` char(36) DEFAULT NULL,
  `content` text NOT NULL,
  `channel` enum('Global','Team','Direct') DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` char(36) NOT NULL,
  `organizer_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('Hackathon','Coding','Debate','Robotics','Gaming','Design','Seminar','AI/ML') DEFAULT NULL,
  `mode` enum('Offline','Online') DEFAULT NULL,
  `status` enum('Upcoming','Live','Ended') DEFAULT NULL,
  `date_display` varchar(255) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `venue` text DEFAULT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `participants_count` int(11) DEFAULT 0,
  `image` text DEFAULT NULL,
  `prizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prizes`)),
  `rules` text DEFAULT NULL,
  `schedule` text DEFAULT NULL,
  `registration_deadline` datetime DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `registration_type` enum('individual','team') NOT NULL DEFAULT 'individual',
  `max_teams` int(11) DEFAULT 0,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `registration_fee` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `organizer_id`, `title`, `description`, `category`, `mode`, `status`, `date_display`, `start_date`, `venue`, `max_participants`, `participants_count`, `image`, `prizes`, `rules`, `schedule`, `registration_deadline`, `difficulty`, `tags`, `created_at`, `registration_type`, `max_teams`, `contact_email`, `contact_phone`) VALUES
('28b4b577-ab64-4749-8d6a-a1c1667fc71a', 'dc62b55a-690b-4fda-b3c1-a682ede7775e', 'print hello world', 'can u print hello world', 'Coding', 'Offline', 'Upcoming', '', '0000-00-00 00:00:00', 'Dhaka, Bangladesh', 100, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"aaa\",\"bb\",\"c\"]', NULL, NULL, '0000-00-00 00:00:00', NULL, '[]', '2026-01-22 19:45:59', 'individual', 0, NULL, NULL),
('2e595664-1fcd-4248-a3d9-b7c6f7e941f3', '580d874b-423e-4be1-a78b-6e6dcf9bfd04', 'test hackathon 02', 'this is only for the test purpose', 'Hackathon', 'Offline', 'Upcoming', '', '0000-00-00 00:00:00', 'united international university', 100, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"\",\"\",\"\"]', NULL, NULL, '2026-01-23 12:27:00', NULL, '[]', '2026-01-22 06:28:00', 'individual', 0, NULL, NULL),
('5cf8e6b0-23ba-49c2-914b-c23308ab23b3', '07cdc915-05ff-45ac-a876-3f698acf7c5f', 'Himy Hote Chai Event', 'Will make you walk on the road without any shoes. Need to be Mohapusush  -_-', '', 'Offline', 'Upcoming', 'January 22, 2026', '0000-00-00 00:00:00', 'All the roads of dhaka city', 10000, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"Holud pocketless punjabi \",\"Holud pocketless punjabi\",\"Holud pocketless punjabi\"]', NULL, NULL, '0000-00-00 00:00:00', NULL, '[]', '2026-01-22 06:42:25', 'individual', 0, NULL, NULL),
('64e1ad07-23c9-482b-a040-b2ef008797a8', '07cdc915-05ff-45ac-a876-3f698acf7c5f', 'Valid ID Test Event 2', 'Test', 'Coding', 'Offline', 'Upcoming', '', NULL, NULL, 50, 0, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '2026-01-22 19:00:40', 'individual', 0, NULL, NULL),
('c90ddf47-1bcd-43df-9dfd-1342c3651919', 'dc62b55a-690b-4fda-b3c1-a682ede7775e', 'uiu hackday', 'nothing , u know ', 'Hackathon', 'Offline', 'Upcoming', '1st February, 2026', '0000-00-00 00:00:00', 'Dhaka', 100, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"a\",\"b\",\"c\"]', NULL, NULL, '0000-00-00 00:00:00', NULL, '[]', '2026-01-25 08:53:34', 'team', 3, 'redwan@gmail.com', '01723333334'),
('cbb67bb2-629e-4481-8f32-7ef40daa9025', '07cdc915-05ff-45ac-a876-3f698acf7c5f', 'Contact Columns Test', 'test', 'Hackathon', 'Online', 'Upcoming', 'Jan 25, 2026', '2026-01-25 18:00:00', 'Online', 100, 0, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '2026-01-25 08:48:28', 'individual', 0, 'org@example.com', '1234567890'),
('f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', '27e40ef9-e8c8-41c9-8663-c77d67e5c2d7', 'Coders Combat', 'hijibiji', 'Coding', 'Offline', 'Upcoming', 'February-11, 2026', '0000-00-00 00:00:00', 'Dhaka, ', 4, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"Book\",\"pen\",\"pencil\"]', NULL, NULL, '0000-00-00 00:00:00', NULL, '[]', '2026-01-24 10:29:12', 'individual', 0, NULL, NULL),
('fe2356cb-ed14-4e25-b03c-39ebd5569f73', '580d874b-423e-4be1-a78b-6e6dcf9bfd04', 'test competition 03', 'this is also for connection confirmation ', 'Coding', 'Offline', 'Upcoming', '', '0000-00-00 00:00:00', 'united international university', 1000, 0, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', '[\"\",\"\",\"\"]', NULL, NULL, '0000-00-00 00:00:00', NULL, '[]', '2026-01-22 06:31:56', 'individual', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` char(36) NOT NULL,
  `event_id` char(36) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `team_id` char(36) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','checked-in') DEFAULT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `event_registrations`
--
DELIMITER $$
CREATE TRIGGER `trg_check_registration_deadline` BEFORE INSERT ON `event_registrations` FOR EACH ROW BEGIN
    DECLARE deadline DATETIME;
    SELECT registration_deadline INTO deadline
    FROM events
    WHERE id = NEW.event_id;

    IF deadline IS NOT NULL AND NOW() > deadline THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registration deadline has passed';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_decrement_participants` AFTER DELETE ON `event_registrations` FOR EACH ROW BEGIN
    UPDATE events
    SET participants_count = participants_count - 1
    WHERE id = OLD.event_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_increment_participants` AFTER INSERT ON `event_registrations` FOR EACH ROW BEGIN
    UPDATE events
    SET participants_count = participants_count + 1
    WHERE id = NEW.event_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_prevent_duplicate_registration` BEFORE INSERT ON `event_registrations` FOR EACH ROW BEGIN
    IF EXISTS (
        SELECT 1 FROM event_registrations
        WHERE event_id = NEW.event_id AND user_id = NEW.user_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already registered for this event';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `event_reviews`
--

CREATE TABLE `event_reviews` (
  `id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_requests`
--

CREATE TABLE `event_requests` (
  `id` varchar(50) NOT NULL,
  `event_id` varchar(50) NOT NULL,
  `team_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registration_forms`
--

CREATE TABLE `event_registration_forms` (
  `id` char(36) NOT NULL,
  `request_id` varchar(50) NOT NULL,
  `event_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `team_id` char(36) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_request` (`request_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` varchar(50) NOT NULL,
  `event_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_event_user` (`event_id`,`user_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_participants`
--

INSERT INTO `event_participants` (`id`, `event_id`, `user_id`, `enrolled_at`) VALUES
('ep_demo_0001', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '6635c06e-22c9-4807-a99e-a3bf3d730a87', '2026-01-23 20:10:00'),
('ep_demo_0002', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', 'fe732f98-cb3b-40f3-b514-d143b0182644', '2026-01-23 20:11:00'),
('ep_demo_0003', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '583513df-5786-4f9f-806b-7905c496af53', '2026-01-23 20:12:00'),
('ep_demo_0004', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', 'fe732f98-cb3b-40f3-b514-d143b0182644', '2026-01-24 06:00:00'),
('ep_demo_0005', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', '9b363c1b-0055-4172-9715-192946c4ca86', '2026-01-24 06:01:00'),
('ep_demo_0006', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '2026-01-24 06:02:00');

--
-- Dumping data for table `event_requests`
--

INSERT INTO `event_requests` (`id`, `event_id`, `team_id`, `user_id`, `status`, `created_at`) VALUES
('req_6973cd2211b78', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '69730b08afbde', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'approved', '2026-01-23 14:33:54'),
('req_6974a130e25f6', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', NULL, '583513df-5786-4f9f-806b-7905c496af53', 'approved', '2026-01-24 05:38:40');

-- --------------------------------------------------------

--
-- Table structure for table `event_teams`
--

CREATE TABLE `event_teams` (
  `id` varchar(50) NOT NULL,
  `event_id` varchar(50) NOT NULL,
  `team_id` varchar(50) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_teams`
--

INSERT INTO `event_teams` (`id`, `event_id`, `team_id`, `enrolled_at`) VALUES
('enr_6973d4ea83fcc', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '69730b08afbde', '2026-01-23 20:07:06');

INSERT INTO `event_teams` (`id`, `event_id`, `team_id`, `enrolled_at`) VALUES
('enr_demo_0001', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', '9f1a1c2d-1111-4a1a-8111-111111111111', '2026-01-26 06:00:00'),
('enr_demo_0002', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', '9f1a1c2d-2222-4a1a-8222-222222222222', '2026-01-26 06:01:00'),
('enr_demo_0003', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', '9f1a1c2d-3333-4a1a-8333-333333333333', '2026-01-26 06:02:00');

-- --------------------------------------------------------

--
-- Table structure for table `leaderboards`
--

CREATE TABLE `leaderboards` (
  `id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `position` int(11) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_event_user` (`event_id`,`user_id`),
  UNIQUE KEY `uniq_event_position` (`event_id`,`position`),
  KEY `idx_event_position` (`event_id`,`position`),
  KEY `idx_event_points` (`event_id`,`points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leaderboards`
--

INSERT INTO `leaderboards` (`id`, `event_id`, `user_id`, `position`, `points`, `created_at`) VALUES
('7c4a7e0a-0001-4d91-9000-000000000001', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '6635c06e-22c9-4807-a99e-a3bf3d730a87', 1, 1800, '2026-01-26 04:10:00'),
('7c4a7e0a-0002-4d91-9000-000000000002', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', 'fe732f98-cb3b-40f3-b514-d143b0182644', 2, 1400, '2026-01-26 04:10:00'),
('7c4a7e0a-0003-4d91-9000-000000000003', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '583513df-5786-4f9f-806b-7905c496af53', 3, 900, '2026-01-26 04:10:00'),
('7c4a7e0a-0004-4d91-9000-000000000004', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', 'fe732f98-cb3b-40f3-b514-d143b0182644', 1, 1300, '2026-01-26 04:12:00'),
('7c4a7e0a-0005-4d91-9000-000000000005', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', '9b363c1b-0055-4172-9715-192946c4ca86', 2, 1000, '2026-01-26 04:12:00'),
('7c4a7e0a-0006-4d91-9000-000000000006', 'f7f57f68-a80f-4ddf-a8ce-b29fdf1fd6c9', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', 3, 800, '2026-01-26 04:12:00');

-- --------------------------------------------------------

--
-- Table structure for table `institutions`
--

CREATE TABLE `institutions` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo` text DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `total_points` int(11) DEFAULT 0,
  `location` text DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` char(36) NOT NULL,
  `recruiter_id` char(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `employment_type` varchar(50) DEFAULT 'Full-time',
  `deadline` datetime DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` char(36) NOT NULL,
  `job_id` char(36) NOT NULL,
  `applicant_id` char(36) NOT NULL,
  `status` enum('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `cv_path` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `media_id` char(36) NOT NULL,
  `owner_type` enum('User','Event') NOT NULL,
  `owner_id` char(36) NOT NULL,
  `media_type` enum('Profile','Poster','Gallery','Certificate') NOT NULL,
  `file_path` text NOT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentorship_requests`
--

CREATE TABLE `mentorship_requests` (
  `id` char(36) NOT NULL,
  `mentor_id` char(36) DEFAULT NULL,
  `mentee_id` char(36) DEFAULT NULL,
  `status` enum('pending','accepted','completed','rejected') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `message` text DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `proposed_slots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(proposed_slots))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentorship_sessions`
--

CREATE TABLE `mentorship_sessions` (
  `id` char(36) NOT NULL,
  `request_id` char(36) DEFAULT NULL,
  `mentor_id` char(36) DEFAULT NULL,
  `mentee_id` char(36) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `meet_link` text DEFAULT NULL,
  `status` enum('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentor_profiles`
--

CREATE TABLE `mentor_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `expertise` text DEFAULT NULL,
  `years_experience` int(11) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `linkedin` text DEFAULT NULL,
  `website` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mentor_profiles`
--

INSERT INTO `mentor_profiles` (`id`, `user_id`, `name`, `company_name`, `position`, `expertise`, `years_experience`, `bio`, `linkedin`, `website`, `created_at`) VALUES
('33d6c687-262e-4c21-ab0b-be74c34a7361', 'cd034ace-2581-4ccc-8d4c-4dd7ccd010a5', 'Akib Boss', '', '', '[]', 0, '', '', '', '2026-01-18 18:57:33'),
('3eb524f5-0d76-4020-8b67-ebdd3a54a3e5', 'a3d89910-8ac3-427d-8524-0830eb7c6643', 'mentor', 'United International University', 'Senior Dev.', '[\"Web Dev\",\"AI\\/ML\"]', 5, 'Good Mentor', 'https://www.robi.com.bd/en', 'https://www.robi.com.bd/en', '2026-01-26 03:49:39'),
('74f813c5-366c-4fc0-a7a5-483c83ceaa2e', '56b201ff-d9bb-431e-bf24-6690b52d8499', NULL, 'Google', 'Senior devloper', '[\"AI\"]', 5, 'A senior developer is an experienced software engineer who designs robust systems, writes high-quality code, and mentors junior developers.', 'https://github.com/fariya-nika-oshru', 'https://www.google.com/', '2026-01-18 18:53:36');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(50) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `recipient_id` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `created_at`, `is_read`) VALUES
('msg_6976f4e2b65ca', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '583513df-5786-4f9f-806b-7905c496af53', 'My  name is opu', '2026-01-26 05:00:18', 0),
('msg_6976f4ef67257', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '583513df-5786-4f9f-806b-7905c496af53', 'I love you', '2026-01-26 05:00:31', 0),
('msg_6976f5d2d08f8', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'Hello sir', '2026-01-26 05:04:18', 0),
('msg_6976f5eed070e', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', 'Purrfext', '2026-01-26 05:04:46', 0);

-- --------------------------------------------------------

--
-- Table structure for table `organizer_profiles`
--

CREATE TABLE `organizer_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `organization_name` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_institution` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizer_profiles`
--

INSERT INTO `organizer_profiles` (`id`, `user_id`, `organization_name`, `website`, `is_institution`, `created_at`) VALUES
('04c20ee6-f4fe-11f0-b767-54dc51031c83', '971fdf44-5156-4dd9-9d45-f1b2edae2c81', 'Tech Events Inc', 'https://techevents.com', 1, '2026-01-19 06:13:48'),
('0cd0f59f-f90b-11f0-aadf-7a1a172572cf', '27e40ef9-e8c8-41c9-8663-c77d67e5c2d7', 'Instuition', 'https://www.diu.com/', 1, '2026-01-24 09:57:10'),
('7eb3b7ee-fa68-11f0-97be-345a60e8f2d3', '949e8caa-2d0b-48e1-a136-2e2984543d18', 'United International University', 'https://www.uiu.ac.bd/', 1, '2026-01-26 03:38:35'),
('84494a94-f4ff-11f0-b767-54dc51031c83', 'dc62b55a-690b-4fda-b3c1-a682ede7775e', 'UIUUUU', 'https://www.uiu.ac.bd', 1, '2026-01-19 06:24:32'),
('a08d7130-f756-11f0-8dec-d45d64b04e77', '580d874b-423e-4be1-a78b-6e6dcf9bfd04', 'Boltu Pro', 'https://www.pinterest.com/', 0, '2026-01-22 05:53:08'),
('e7bf7b77-f75c-11f0-8dec-d45d64b04e77', '07cdc915-05ff-45ac-a876-3f698acf7c5f', 'Poketless punjabi', 'https://www.himu.com/', 0, '2026-01-22 06:38:04');

-- --------------------------------------------------------

--
-- Table structure for table `participant_profiles`
--

CREATE TABLE `participant_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `university` varchar(255) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `linkedin` text DEFAULT NULL,
  `portfolio` text DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `profile_visibility` enum('public','recruiters-only','private') DEFAULT 'public',
  `verified` tinyint(1) DEFAULT 0,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `participant_profiles`
--

INSERT INTO `participant_profiles` (`id`, `user_id`, `university`, `skills`, `github`, `created_at`, `bio`, `avatar`, `linkedin`, `portfolio`, `department`, `location`, `profile_visibility`, `verified`, `name`) VALUES
('0322db89-f5da-11f0-b423-b8fcc4e32408', '583513df-5786-4f9f-806b-7905c496af53', 'UIU', '[\"HTML\"]', 'https://github.com//kulsum', '2026-01-20 08:28:33', 'i love opu.', NULL, '', '', NULL, NULL, 'public', 0, 'Kulsum'),
('044308d1-f55d-11f0-8f26-06507f8b3e93', 'e7757cf0-83e3-43ee-94c2-6d80bdf89145', '', '', '', '2026-01-19 17:33:50', '', '', '', '', '', '', 'public', 0, 'Test Participant'),
('40a8107b-fa68-11f0-97be-345a60e8f2d3', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '', '[\"React\",\"Python\",\"C++\"]', 'https://github.com/suhashines', '2026-01-26 03:36:51', NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, 'participant'),
('696e74d9a67a4', '6635c06e-22c9-4807-a99e-a3bf3d730a87', 'United International University', '[\"Figma\",\"Python\",\"C++\",\"C#\",\"C\"]', 'https://github.com/partha666', '2026-01-19 18:15:53', 'Hello, My CGPA is 3.94.', '', 'https://www.linkedin.com/in/akib-mehedi-5689562b8/', 'partha.com', '', '', 'public', 0, 'Partha Podder');
INSERT INTO `participant_profiles` (`id`, `user_id`, `university`, `skills`, `github`, `created_at`, `bio`, `avatar`, `linkedin`, `portfolio`, `department`, `location`, `profile_visibility`, `verified`, `name`) VALUES
('696e74d9a804c', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'United International University', '[\"Python\",\"Figma\",\"HTML\",\"ML\",\"C\",\"C++\",\"C\"]', 'https://github.com/akibmehedi666', '2026-01-19 18:15:53', 'Hello', 'data:image/jpeg;base64,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', 'https://www.linkedin.com/in/akib-mehedi-5689562b8/', 'https://toufiq-7700.github.io/toufiq/', '', '', 'public', 0, 'Akib Mehedi');
INSERT INTO `participant_profiles` (`id`, `user_id`, `university`, `skills`, `github`, `created_at`, `bio`, `avatar`, `linkedin`, `portfolio`, `department`, `location`, `profile_visibility`, `verified`, `name`) VALUES
('696e74d9aadc7', 'fe732f98-cb3b-40f3-b514-d143b0182644', 'Dhaka International University', '[\"C\",\"Python\"]', 'https://github.com/salman123', '2026-01-19 18:15:53', 'Hello, I am Good boy.', '', '', '', '', '', 'public', 0, 'Salman'),
('870b0368-f8fc-11f0-aadf-7a1a172572cf', '831053c8-1143-4ef9-b43a-7d824500a660', 'UIU', '[\"Python\"]', 'https://github.com/tasfa', '2026-01-24 08:13:12', 'hello,,,', NULL, '', '', NULL, NULL, 'public', 0, 'Tasfa'),
('9d0ee458-f7be-11f0-8e05-03424283ce7d', '9b363c1b-0055-4172-9715-192946c4ca86', 'United International University', '[\"Python\"]', 'https://github.com/toufiq', '2026-01-22 18:17:29', 'hello,,,,', NULL, '', '', NULL, NULL, 'public', 0, 'Toufiq '),
('f2362c80-f563-11f0-8f26-06507f8b3e93', 'c92df122-7825-4fa7-9f8f-79f0cf99915f', 'Test University', '[\"PHP\",\"React\",\"SQL\"]', 'https://github.com/testuser', '2026-01-19 18:23:26', NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, 'Test Participant');

-- --------------------------------------------------------

--
-- Table structure for table `recruiter_profiles`
--

CREATE TABLE `recruiter_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `website` text DEFAULT NULL,
  `linkedin` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recruiter_profiles`
--

INSERT INTO `recruiter_profiles` (`id`, `user_id`, `company_name`, `position`, `department`, `website`, `linkedin`, `location`, `verified`, `created_at`) VALUES
('aee8cd4d-fa69-11f0-97be-345a60e8f2d3', '472acbbd-6e8f-4259-af61-f46e91bba36c', 'Robi Comp Inc.', 'CTO', NULL, 'https://www.robi.com.bd/en', 'https://www.robi.com.bd/en', NULL, 0, '2026-01-26 03:47:06'),
('be7a9951-f492-11f0-bc9e-631e6cc5969f', '188df8e4-a4e1-446e-9ae1-72a75fbf0c2b', 'Google', 'HR', 'Software Engineer', 'https://www.google.com/', 'https://opuazmi.linkedin.com', NULL, 0, '2026-01-18 17:25:51');

-- --------------------------------------------------------

--
-- Table structure for table `shortlists`
--

CREATE TABLE `shortlists` (
  `id` char(36) NOT NULL,
  `recruiter_id` char(36) DEFAULT NULL,
  `candidate_id` char(36) DEFAULT NULL,
  `job_id` char(36) DEFAULT NULL,
  `status` enum('interested','interviewing','hired','rejected') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsorship_applications`
--

CREATE TABLE `sponsorship_applications` (
  `id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `sponsor_id` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `contact_email` varchar(255) NOT NULL DEFAULT '',
  `contact_phone` varchar(30) NOT NULL DEFAULT '',
  `sponsorship_role_id` char(36) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsorship_requests` (Organizer -> Sponsor)
--

CREATE TABLE `sponsorship_requests` (
  `id` char(36) NOT NULL,
  `organizer_id` char(36) NOT NULL,
  `sponsor_id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `requested_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `message` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_org_sponsor_event` (`organizer_id`,`sponsor_id`,`event_id`),
  KEY `idx_sponsor_status` (`sponsor_id`,`status`),
  KEY `idx_organizer_created` (`organizer_id`,`created_at`),
  KEY `idx_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sponsorship_applications`
--

INSERT INTO `sponsorship_applications` (`id`, `event_id`, `sponsor_id`, `amount`, `contact_email`, `contact_phone`, `sponsorship_role_id`, `status`, `message`, `created_at`) VALUES
('97d8a9ca-e0c3-4053-bf6d-7f6cc666721b', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', '6d8fad0a-2a12-4e26-8cc5-08e6a244d29c', 1500.00, 'contact@google.com', '1234567890', NULL, 'accepted', 'We can sponsor with swag.', '2026-01-25 08:37:41'),
('a5891fc6-3b2d-49b3-921b-e72ec17a0310', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', '6d8fad0a-2a12-4e26-8cc5-08e6a244d29c', 5000.00, 'shishir666@gmail.com', '0123334553', NULL, 'pending', 'my wish', '2026-01-25 09:08:10');

-- --------------------------------------------------------

--
-- Table structure for table `sponsorship_opportunities`
--

CREATE TABLE `sponsorship_opportunities` (
  `id` char(36) NOT NULL,
  `event_id` char(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `budget_amount` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `min_reach` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsorship_roles`
--

CREATE TABLE `sponsorship_roles` (
  `id` char(36) NOT NULL,
  `sponsor_id` char(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `budget_min` int(11) DEFAULT NULL,
  `budget_max` int(11) DEFAULT NULL,
  `status` enum('Open','Closed') DEFAULT 'Open'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsor_profiles`
--

CREATE TABLE `sponsor_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` text DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `sponsorship_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sponsorship_categories`)),
  `location` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sponsor_profiles`
--

INSERT INTO `sponsor_profiles` (`id`, `user_id`, `company_name`, `industry`, `description`, `website`, `verified`, `sponsorship_categories`, `location`) VALUES
('62d328c7-fa69-11f0-97be-345a60e8f2d3', '6b3c2bd4-178c-4584-8a6d-339995908394', 'Grameenphone', NULL, 'nice comp\n', 'https://www.grameenphone.com/', 0, NULL, NULL),
('6d8fad0a-2a12-4e26-8cc5-08e6a244d29c', '4e96da59-900e-4f36-a9ab-3bfdc4c97cbb', 'Google', '', 'Google is a global technology company that organizes the world’s information and makes it universally accessible and useful.', 'https://www.google.com/', 0, '[]', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `leader_id` char(36) DEFAULT NULL,
  `competition_id` char(36) DEFAULT NULL,
  `max_members` int(11) DEFAULT 4,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `project_idea` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `required_skills` longtext DEFAULT NULL COMMENT '(DC2Type:json)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `leader_id`, `competition_id`, `max_members`, `created_at`, `description`, `project_idea`, `status`, `required_skills`) VALUES
('697309f297636', 'Backend Test Team 194', '6635c06e-22c9-4807-a99e-a3bf3d730a87', '64e1ad07-23c9-482b-a040-b2ef008797a8', 4, '2026-01-23 05:41:06', 'Testing via script', 'Automated Test', 'open', '[\"PHP\",\"Testing\"]'),
('69730b08afbde', 'Team Akib', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', '28b4b577-ab64-4749-8d6a-a1c1667fc71a', 4, '2026-01-23 05:45:44', 'I am Akib.', 'we want to print hello world', 'open', '[\"Python\",\"C\"]'),
('69731c29bfa62', 'General Team 519', '07cdc915-05ff-45ac-a876-3f698acf7c5f', NULL, 5, '2026-01-23 06:58:49', 'Team with no event attached.', 'General project', 'open', '[\"General\"]'),
('697359aa0389e', 'Team OPU', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', NULL, 5, '2026-01-23 11:21:14', 'Nothing to do , ', 'just fun', 'open', '[\"Python\"]'),
('6974807589523', 'Team KaraSuno', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', NULL, 10, '2026-01-24 08:19:01', 'huhuhuhuuhu', 'kichui na', 'open', '[\"nothing\"]'),
('9f1a1c2d-1111-4a1a-8111-111111111111', 'UIU Phoenix', '6635c06e-22c9-4807-a99e-a3bf3d730a87', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', 4, '2026-01-26 06:00:00', 'Demo team for recruitment scouting', 'Demo project', 'open', '[\"Python\",\"C++\"]'),
('9f1a1c2d-2222-4a1a-8222-222222222222', 'Dhaka Titans', 'fe732f98-cb3b-40f3-b514-d143b0182644', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', 4, '2026-01-26 06:01:00', 'Demo team for recruitment scouting', 'Demo project', 'open', '[\"React\",\"Node.js\"]'),
('9f1a1c2d-3333-4a1a-8333-333333333333', 'Code Storm', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', 'c90ddf47-1bcd-43df-9dfd-1342c3651919', 4, '2026-01-26 06:02:00', 'Demo team for recruitment scouting', 'Demo project', 'open', '[\"SQL\",\"DSA\"]');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `team_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_invitations`
--

CREATE TABLE `team_invitations` (
  `id` char(36) NOT NULL,
  `team_id` char(36) NOT NULL,
  `sender_id` char(36) NOT NULL,
  `receiver_id` char(36) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_receiver_status` (`receiver_id`,`status`),
  KEY `idx_team_receiver` (`team_id`,`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_reference` (`user_id`,`reference_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`team_id`, `user_id`, `joined_at`) VALUES
('697309f297636', '6635c06e-22c9-4807-a99e-a3bf3d730a87', '2026-01-23 05:41:06'),
('697309f297636', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', '2026-01-23 06:09:11'),
('69730b08afbde', '583513df-5786-4f9f-806b-7905c496af53', '2026-01-23 09:11:44'),
('69730b08afbde', '831053c8-1143-4ef9-b43a-7d824500a660', '2026-01-24 08:15:44'),
('69730b08afbde', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', '2026-01-23 05:45:44'),
('69731c29bfa62', '07cdc915-05ff-45ac-a876-3f698acf7c5f', '2026-01-23 06:58:49'),
('697359aa0389e', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', '2026-01-23 11:21:14'),
('697359aa0389e', 'fe732f98-cb3b-40f3-b514-d143b0182644', '2026-01-23 11:22:46'),
('6974807589523', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', '2026-01-24 08:19:01'),
('9f1a1c2d-1111-4a1a-8111-111111111111', '6635c06e-22c9-4807-a99e-a3bf3d730a87', '2026-01-26 06:00:00'),
('9f1a1c2d-1111-4a1a-8111-111111111111', '9b363c1b-0055-4172-9715-192946c4ca86', '2026-01-26 06:00:30'),
('9f1a1c2d-2222-4a1a-8222-222222222222', 'fe732f98-cb3b-40f3-b514-d143b0182644', '2026-01-26 06:01:00'),
('9f1a1c2d-2222-4a1a-8222-222222222222', '583513df-5786-4f9f-806b-7905c496af53', '2026-01-26 06:01:30'),
('9f1a1c2d-3333-4a1a-8333-333333333333', 'ac7ff2c1-e540-4f12-8ec8-f873868f684d', '2026-01-26 06:02:00'),
('9f1a1c2d-3333-4a1a-8333-333333333333', 'c92df122-7825-4fa7-9f8f-79f0cf99915f', '2026-01-26 06:02:20'),
('9f1a1c2d-3333-4a1a-8333-333333333333', 'e7757cf0-83e3-43ee-94c2-6d80bdf89145', '2026-01-26 06:02:40');

-- --------------------------------------------------------

--
-- Table structure for table `team_requests`
--

CREATE TABLE `team_requests` (
  `id` char(36) NOT NULL,
  `team_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_requests`
--

INSERT INTO `team_requests` (`id`, `team_id`, `user_id`, `status`, `created_at`) VALUES
('697310877d52f', '697309f297636', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'accepted', '2026-01-23 06:09:11'),
('697316e50346e', '69730b08afbde', 'fe732f98-cb3b-40f3-b514-d143b0182644', 'accepted', '2026-01-23 06:36:21'),
('69733afff30db', '69730b08afbde', '583513df-5786-4f9f-806b-7905c496af53', 'accepted', '2026-01-23 09:10:23'),
('697359d014a79', '697359aa0389e', 'fe732f98-cb3b-40f3-b514-d143b0182644', 'accepted', '2026-01-23 11:21:52'),
('69747d1baa532', '69731c29bfa62', '8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'pending', '2026-01-24 08:04:43'),
('69747f4944f3e', '69730b08afbde', '831053c8-1143-4ef9-b43a-7d824500a660', 'accepted', '2026-01-24 08:14:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Participant','Organizer','Sponsor','Recruiter','Mentor','Admin') NOT NULL,
  `university` varchar(255) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `avatar` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `github` text DEFAULT NULL,
  `linkedin` text DEFAULT NULL,
  `portfolio` text DEFAULT NULL,
  `profile_visibility` enum('public','recruiters-only','private') DEFAULT 'public',
  `verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `department` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `university`, `skills`, `avatar`, `bio`, `github`, `linkedin`, `portfolio`, `profile_visibility`, `verified`, `created_at`, `updated_at`, `department`, `location`) VALUES
('07cdc915-05ff-45ac-a876-3f698acf7c5f', 'himu', 'himu@gmail.com', '$2y$10$GcdSE.eldKRCXTXLJb94Pul.755.njKlNWoPUdtpskR087LFb9ClS', 'Organizer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-22 06:38:04', '2026-01-22 06:38:04', NULL, NULL),
('188df8e4-a4e1-446e-9ae1-72a75fbf0c2b', 'Opu Azmi', 'opu666@gmail.com', '$2y$10$mgBpg3eGDmrSKAbpeZCOrehKkeSmdtlsXHhLElVcSskLXc.mBeD4S', 'Recruiter', '', '[]', NULL, NULL, '', 'https://opuazmi.linkedin.com', NULL, 'public', 0, '2026-01-18 17:25:51', '2026-01-18 17:26:45', 'Software Engineer', 'Dhaka'),
('27e40ef9-e8c8-41c9-8663-c77d67e5c2d7', 'DIU', 'diu@gmail.com', '$2y$10$7GaHj4aoYnyjny80PnnKueUkX5d79k06EU9AjKiLyA.HL7525IXzq', 'Organizer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-24 09:57:10', '2026-01-24 09:57:10', NULL, NULL),
('472acbbd-6e8f-4259-af61-f46e91bba36c', 'recruiter', 'recruiter@gmail.com', '$2y$10$XOBcZrGtQyUc28QyWYe5gutvmWzk/rzG4ovOW11kw/bwiUxaTX2RG', 'Recruiter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-26 03:47:06', '2026-01-26 03:47:06', NULL, NULL),
('4e96da59-900e-4f36-a9ab-3bfdc4c97cbb', 'Julkar Naim', 'shishir666@gmail.com', '$2y$10$RuhKptmnrjg7ChdUE1NqqO/.6t89tIG.KyLECzhx4ew4g/lpVEium', 'Sponsor', 'Google', '[]', NULL, NULL, '', NULL, NULL, 'public', 0, '2026-01-18 15:39:27', '2026-01-18 15:40:52', NULL, 'Dhaka'),
('56b201ff-d9bb-431e-bf24-6690b52d8499', 'Fariya Nika Oshru', 'fariya666@gmail.com', '$2y$10$zL8HrJArfSCt0DAGyNNyBex7ahzX2AWwVa.PncaARu51ZjucKFv9m', 'Mentor', '', '[]', NULL, NULL, '', NULL, NULL, 'public', 0, '2026-01-18 18:53:36', '2026-01-18 18:53:36', NULL, NULL),
('580d874b-423e-4be1-a78b-6e6dcf9bfd04', 'boltuPro', 'boltupro123@gmail.com', '$2y$10$whEPJedClvBbfQrNasccFO1unjvFXfE8CxWMfYP/k1dtwyEDZHqw.', 'Organizer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-22 05:53:08', '2026-01-22 05:53:08', NULL, NULL),
('583513df-5786-4f9f-806b-7905c496af53', 'Kulsum', 'kulsum@gmail.com', '$2y$10$yJ6gM1lKXVgIG250aPQoYOi8b5lHkv8SQHTyirguqG9SIlsN0rLKC', 'Participant', 'UIU', '[\"HTML\"]', NULL, 'i love opu.', 'https://github.com//kulsum', '', '', 'public', 0, '2026-01-20 08:28:33', '2026-01-20 08:47:28', NULL, NULL),
('6635c06e-22c9-4807-a99e-a3bf3d730a87', 'Partha Podder', 'parhta666@gmail.com', '$2y$10$tQZ15DPH6RBad8OY2yLnJOMnk6UP15RpJI1/H/M/QuwWwh13S9TN.', 'Participant', 'United International University', '[\"Figma\",\"Python\",\"C++\",\"C#\",\"C\"]', NULL, 'Hello, My CGPA is 3.94.', 'https://github.com/partha666', 'https://www.linkedin.com/in/akib-mehedi-5689562b8/', 'partha.com', 'public', 0, '2026-01-18 10:46:43', '2026-01-18 13:53:27', NULL, NULL),
('6b3c2bd4-178c-4584-8a6d-339995908394', 'sponsor', 'sponsor@gmail.com', '$2y$10$wZb1KE0R54mCRgrsQHWC8e3Ry/jD35RpUT4aD4ItoqVfDOJMK6bYC', 'Sponsor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-26 03:44:58', '2026-01-26 03:44:58', NULL, NULL),
('831053c8-1143-4ef9-b43a-7d824500a660', 'Tasfa', 'tasfa@gmail.com', '$2y$10$m68feGBJJ6eUXoWeQnbCwOff1LWcoBT0.11SBMwdRrtSsMkQ8/1UW', 'Participant', 'UIU', '[\"Python\"]', NULL, 'hello,,,', 'https://github.com/tasfa', '', '', 'public', 0, '2026-01-24 08:13:12', '2026-01-25 09:01:46', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `university`, `skills`, `avatar`, `bio`, `github`, `linkedin`, `portfolio`, `profile_visibility`, `verified`, `created_at`, `updated_at`, `department`, `location`) VALUES
('8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 'Akib Mehedi', 'akibmehedi666@gmail.com', '$2y$10$QVFy77JQsPShlHnUM9Pg3.fIuBGEebH4./nS5Wu3HTLHDsefcV2xq', 'Participant', 'United International University', '[\"Python\",\"Figma\",\"HTML\",\"ML\",\"C\",\"C++\",\"C\"]', 'data:image/jpeg;base64,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', 'Hello', 'https://github.com/akibmehedi666', 'https://www.linkedin.com/in/akib-mehedi-5689562b8/', 'https://toufiq-7700.github.io/toufiq/', 'public', 0, '2026-01-18 10:19:41', '2026-01-26 04:06:34', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `university`, `skills`, `avatar`, `bio`, `github`, `linkedin`, `portfolio`, `profile_visibility`, `verified`, `created_at`, `updated_at`, `department`, `location`) VALUES
('949e8caa-2d0b-48e1-a136-2e2984543d18', 'organizer', 'organizer@gmail.com', '$2y$10$rZhg59UEn9fknmDZMmPsKOOTzvtVlZov4gJ.XEfNYs0w6e69r1Oaa', 'Organizer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-26 03:38:35', '2026-01-26 03:38:35', NULL, NULL),
('971fdf44-5156-4dd9-9d45-f1b2edae2c81', 'Organizer Test User', 'organizer_test_4392@example.com', '$2y$10$CShO0QZbw6A5CZm2vkroxOeo1zOwVPgfl3rnRZ4GZcASB3H2C5VrG', 'Organizer', '', '[]', NULL, NULL, '', NULL, NULL, 'public', 0, '2026-01-19 06:13:48', '2026-01-19 06:13:48', NULL, NULL),
('9b363c1b-0055-4172-9715-192946c4ca86', 'Toufiq ', 'toufiq@gmail.com', '$2y$10$eog/4RRchGRdPswaJN2GgOQ3iXaRWNZ4g01mw5NWwWqoZw76wYJYG', 'Participant', 'United International University', '[\"Python\"]', NULL, 'hello,,,,', 'https://github.com/toufiq', '', '', 'public', 0, '2026-01-22 18:17:29', '2026-01-22 18:18:26', NULL, NULL),
('a3d89910-8ac3-427d-8524-0830eb7c6643', 'mentor', 'mentor@gmail.com', '$2y$10$cvk4QGhuErcmbHbf9wGUUOhfas6xZiIYOvG09AbKK2gmLE4gvfZaO', 'Mentor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-26 03:49:39', '2026-01-26 03:49:39', NULL, NULL),
('ac7ff2c1-e540-4f12-8ec8-f873868f684d', 'participant', 'participant@gmail.com', '$2y$10$pgRkHHQ6nugTsrmIpGp4Q.I09QFMUyolh7Ei76sufSCtu99f0NO7u', 'Participant', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-26 03:36:51', '2026-01-26 03:36:51', NULL, NULL),
('c92df122-7825-4fa7-9f8f-79f0cf99915f', 'Test Participant', 'test_participant_3418@example.com', '$2y$10$vjxEEIslUhamVcRAMP.TP.E3vWv7QqXGk.UtW2ONUFG00Uv4VSQ9u', 'Participant', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-19 18:23:26', '2026-01-19 18:23:26', NULL, NULL),
('cd034ace-2581-4ccc-8d4c-4dd7ccd010a5', 'Akib Boss', 'aku@gmail.com', '$2y$10$kZKeMsO6rBGWMEd9K6zzsO2WhK8biZQ02G5uoM3QjDcjrtKZ63IuO', 'Mentor', '', '[]', NULL, NULL, '', NULL, NULL, 'public', 0, '2026-01-18 18:57:33', '2026-01-18 19:50:24', NULL, NULL),
('dc62b55a-690b-4fda-b3c1-a682ede7775e', 'UIU', 'uiu@gmail.com', '$2y$10$Z.BgsBDikFGFa7KjfVqWoeJMfb7ggs7ikPwJAoW9mtsU1KDXil3ou', 'Organizer', '', '[]', NULL, 'asjohdidahi', '', NULL, '', 'public', 0, '2026-01-19 06:24:32', '2026-01-20 03:15:53', '', ''),
('e7757cf0-83e3-43ee-94c2-6d80bdf89145', 'Test Participant', 'test_participant_8564@example.com', '$2y$10$ZzvvDCgiMDlEt0rYZj.Zr.hkemGQO.Q2m2T2sOsWPTKlk44s/d50O', 'Participant', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public', 0, '2026-01-19 17:33:50', '2026-01-19 17:33:50', NULL, NULL),
('fe732f98-cb3b-40f3-b514-d143b0182644', 'Salman', 'salman666@gmail.com', '$2y$10$GlZDJYOgnUjRWFTIe9TzfuHRDVoNWTl0Io6IzBNWk7D4/jM5Eh3Gq', 'Participant', 'Dhaka International University', '[\"C\",\"Python\"]', NULL, 'Hello, I am Good boy.', 'https://github.com/salman123', '', '', 'public', 0, '2026-01-19 17:27:13', '2026-01-24 08:32:20', NULL, NULL);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `trg_create_user_stats` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_stats`
--

CREATE TABLE `user_stats` (
  `user_id` char(36) NOT NULL,
  `rank` int(11) DEFAULT 0,
  `points` int(11) DEFAULT 0,
  `events_won` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_stats`
--

INSERT INTO `user_stats` (`user_id`, `rank`, `points`, `events_won`) VALUES
('07cdc915-05ff-45ac-a876-3f698acf7c5f', 0, 0, 0),
('188df8e4-a4e1-446e-9ae1-72a75fbf0c2b', 0, 0, 0),
('27e40ef9-e8c8-41c9-8663-c77d67e5c2d7', 0, 0, 0),
('472acbbd-6e8f-4259-af61-f46e91bba36c', 0, 0, 0),
('4e96da59-900e-4f36-a9ab-3bfdc4c97cbb', 0, 0, 0),
('56b201ff-d9bb-431e-bf24-6690b52d8499', 0, 0, 0),
('580d874b-423e-4be1-a78b-6e6dcf9bfd04', 0, 0, 0),
('583513df-5786-4f9f-806b-7905c496af53', 0, 0, 0),
('6635c06e-22c9-4807-a99e-a3bf3d730a87', 0, 0, 0),
('6b3c2bd4-178c-4584-8a6d-339995908394', 0, 0, 0),
('831053c8-1143-4ef9-b43a-7d824500a660', 0, 0, 0),
('8eaa9722-0b7c-4d1d-b8e4-4c27a40e3dfb', 0, 0, 0),
('949e8caa-2d0b-48e1-a136-2e2984543d18', 0, 0, 0),
('971fdf44-5156-4dd9-9d45-f1b2edae2c81', 0, 0, 0),
('9b363c1b-0055-4172-9715-192946c4ca86', 0, 0, 0),
('a3d89910-8ac3-427d-8524-0830eb7c6643', 0, 0, 0),
('ac7ff2c1-e540-4f12-8ec8-f873868f684d', 0, 0, 0),
('c92df122-7825-4fa7-9f8f-79f0cf99915f', 0, 0, 0),
('cd034ace-2581-4ccc-8d4c-4dd7ccd010a5', 0, 0, 0),
('dc62b55a-690b-4fda-b3c1-a682ede7775e', 0, 0, 0),
('e7757cf0-83e3-43ee-94c2-6d80bdf89145', 0, 0, 0),
('fe732f98-cb3b-40f3-b514-d143b0182644', 0, 0, 0);

--
-- Seed points for recruitment scouting (dummy leaderboard stats)
--
UPDATE `user_stats` SET `points` = 5200, `rank` = 8,  `events_won` = 7 WHERE `user_id` = '6635c06e-22c9-4807-a99e-a3bf3d730a87';
UPDATE `user_stats` SET `points` = 2100, `rank` = 45, `events_won` = 2 WHERE `user_id` = '9b363c1b-0055-4172-9715-192946c4ca86';
UPDATE `user_stats` SET `points` = 1500, `rank` = 60, `events_won` = 1 WHERE `user_id` = '583513df-5786-4f9f-806b-7905c496af53';
UPDATE `user_stats` SET `points` = 4800, `rank` = 12, `events_won` = 5 WHERE `user_id` = 'fe732f98-cb3b-40f3-b514-d143b0182644';
UPDATE `user_stats` SET `points` = 900,  `rank` = 120, `events_won` = 0 WHERE `user_id` = 'ac7ff2c1-e540-4f12-8ec8-f873868f684d';
UPDATE `user_stats` SET `points` = 700,  `rank` = 180, `events_won` = 0 WHERE `user_id` = 'c92df122-7825-4fa7-9f8f-79f0cf99915f';
UPDATE `user_stats` SET `points` = 600,  `rank` = 200, `events_won` = 0 WHERE `user_id` = 'e7757cf0-83e3-43ee-94c2-6d80bdf89145';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `organizer_id` (`organizer_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizer_id` (`organizer_id`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `event_reviews`
--
ALTER TABLE `event_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_event_user_review` (`event_id`,`user_id`),
  ADD KEY `idx_event_created_review` (`event_id`,`created_at`),
  ADD KEY `idx_event_rating_review` (`event_id`,`rating`);

--
-- Indexes for table `event_requests`
--
ALTER TABLE `event_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `event_requests_ibfk_2` (`team_id`);

--
-- Indexes for table `event_teams`
--
ALTER TABLE `event_teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`event_id`,`team_id`),
  ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `institutions`
--
ALTER TABLE `institutions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recruiter_id` (`recruiter_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_job_applicant` (`job_id`,`applicant_id`),
  ADD KEY `idx_job_status_created` (`job_id`,`status`,`created_at`),
  ADD KEY `idx_applicant_created` (`applicant_id`,`created_at`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`media_id`);

--
-- Indexes for table `mentorship_requests`
--
ALTER TABLE `mentorship_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mentor_id` (`mentor_id`),
  ADD KEY `mentee_id` (`mentee_id`);

--
-- Indexes for table `mentorship_sessions`
--
ALTER TABLE `mentorship_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_request` (`request_id`),
  ADD KEY `idx_mentor_status` (`mentor_id`,`status`),
  ADD KEY `idx_mentee_status` (`mentee_id`,`status`);

--
-- Indexes for table `mentor_profiles`
--
ALTER TABLE `mentor_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `participant_profiles`
--
ALTER TABLE `participant_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `recruiter_profiles`
--
ALTER TABLE `recruiter_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `shortlists`
--
ALTER TABLE `shortlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recruiter_id` (`recruiter_id`),
  ADD KEY `candidate_id` (`candidate_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `sponsorship_applications`
--
ALTER TABLE `sponsorship_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `sponsorship_role_id` (`sponsorship_role_id`),
  ADD KEY `sponsor_id` (`sponsor_id`);

--
-- Indexes for table `sponsorship_opportunities`
--
ALTER TABLE `sponsorship_opportunities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `sponsorship_roles`
--
ALTER TABLE `sponsorship_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sponsor_id` (`sponsor_id`);

--
-- Indexes for table `sponsor_profiles`
--
ALTER TABLE `sponsor_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leader_id` (`leader_id`),
  ADD KEY `competition_id` (`competition_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`team_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `team_requests`
--
ALTER TABLE `team_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_stats`
--
ALTER TABLE `user_stats`
  ADD PRIMARY KEY (`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `event_registrations_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `event_reviews`
--
ALTER TABLE `event_reviews`
  ADD CONSTRAINT `event_reviews_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_requests`
--
ALTER TABLE `event_requests`
  ADD CONSTRAINT `event_requests_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_requests_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_teams`
--
ALTER TABLE `event_teams`
  ADD CONSTRAINT `event_teams_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_teams_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leaderboards`
--
ALTER TABLE `leaderboards`
  ADD CONSTRAINT `leaderboards_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leaderboards_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD CONSTRAINT `job_postings_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mentorship_requests`
--
ALTER TABLE `mentorship_requests`
  ADD CONSTRAINT `mentorship_requests_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `mentor_profiles` (`id`),
  ADD CONSTRAINT `mentorship_requests_ibfk_2` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `mentorship_sessions`
--
ALTER TABLE `mentorship_sessions`
  ADD CONSTRAINT `mentorship_sessions_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `mentorship_requests` (`id`),
  ADD CONSTRAINT `mentorship_sessions_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `mentor_profiles` (`id`),
  ADD CONSTRAINT `mentorship_sessions_ibfk_3` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `mentor_profiles`
--
ALTER TABLE `mentor_profiles`
  ADD CONSTRAINT `mentor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `organizer_profiles`
--
ALTER TABLE `organizer_profiles`
  ADD CONSTRAINT `organizer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `participant_profiles`
--
ALTER TABLE `participant_profiles`
  ADD CONSTRAINT `participant_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recruiter_profiles`
--
ALTER TABLE `recruiter_profiles`
  ADD CONSTRAINT `recruiter_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shortlists`
--
ALTER TABLE `shortlists`
  ADD CONSTRAINT `shortlists_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shortlists_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shortlists_ibfk_3` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`);

--
-- Constraints for table `sponsorship_applications`
--
ALTER TABLE `sponsorship_applications`
  ADD CONSTRAINT `sponsorship_applications_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `sponsorship_applications_ibfk_2` FOREIGN KEY (`sponsorship_role_id`) REFERENCES `sponsorship_roles` (`id`),
  ADD CONSTRAINT `sponsorship_applications_ibfk_3` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsor_profiles` (`id`);

--
-- Constraints for table `sponsorship_opportunities`
--
ALTER TABLE `sponsorship_opportunities`
  ADD CONSTRAINT `sponsorship_opportunities_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

--
-- Constraints for table `sponsorship_roles`
--
ALTER TABLE `sponsorship_roles`
  ADD CONSTRAINT `sponsorship_roles_ibfk_1` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsor_profiles` (`id`);

--
-- Constraints for table `sponsor_profiles`
--
ALTER TABLE `sponsor_profiles`
  ADD CONSTRAINT `sponsor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`competition_id`) REFERENCES `events` (`id`);

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_requests`
--
ALTER TABLE `team_requests`
  ADD CONSTRAINT `team_requests_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- --------------------------------------------------------

--
-- Table structure for table `community_resources`
--

CREATE TABLE `community_resources` (
  `id` char(36) NOT NULL,
  `uploader_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `domain` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'Other',
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size_bytes` int(10) unsigned NOT NULL DEFAULT 0,
  `downloads` int(10) unsigned NOT NULL DEFAULT 0,
  `is_premium` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_domain_subject` (`domain`,`subject`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_uploader` (`uploader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for table `community_resources`
--
ALTER TABLE `community_resources`
  ADD CONSTRAINT `fk_community_resources_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_stats`
--
ALTER TABLE `user_stats`
  ADD CONSTRAINT `user_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
