-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Dec 24, 2020 at 02:09 AM
-- Server version: 5.7.30
-- PHP Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `studysawa-login`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `id` int(11) NOT NULL,
  `class_name` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`id`, `class_name`, `author_name`, `text`, `date`) VALUES
(3, 'CMPS 200', 'Omarou Manaestrli', 'Hey guys! this is my first announcement', '2020-12-22 00:00:00'),
(7, 'CMPS 200', 'Omarou Manaestrli', 'Hey dudes', '2020-12-22 00:00:00'),
(8, 'CMPS 200', 'Omarou Manaestrli', 'Holla', '2020-12-22 00:00:00'),
(11, 'CMPS 200', 'Omarou Manaestrli', 'Assignment 2 due next Friday at 7:00 am', '2020-12-22 07:32:45'),
(13, 'CMPS 200', 'Omarou Manaestrli', 'This is another announ', '2020-12-22 08:13:15'),
(14, 'CMPS 200', 'Omarou Manaestrli', 'I have mistaken please consider the new announcement. Thank you!', '2020-12-22 08:13:46'),
(15, 'CMPS 200', 'Omarou Manaestrli', 'I have mistaken please consider the new announcement. Thank you!', '2020-12-22 08:14:35'),
(16, 'CMPS 200', 'Omarou Manaestrli', 'I have mistaken please consider the new announcement. Thank you!', '2020-12-22 08:14:51'),
(17, 'CMPS 251', 'Omarou Manaestrli', 'Hello guys, welcome to CMPS 251 . Please check out the syllabus found in resources', '2020-12-22 08:44:22');

-- --------------------------------------------------------

--
-- Table structure for table `comment_post`
--

CREATE TABLE `comment_post` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `commenter_name` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `date` datetime NOT NULL,
  `upvoted` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `instructor_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `instructor_id`, `instructor_name`) VALUES
(1, 'CMPS 200', 16, 'Omarou Manaestrli'),
(2, 'CMPS 212', 16, 'Omarou Manaestrli'),
(6, 'CMPS 299', 20, 'Haidar Safa'),
(7, 'CMPS 278', 20, 'Haidar Safa'),
(8, 'CMPS 255', 20, 'Haidar Safa'),
(9, 'CMPS 251', 16, 'Omarou Manaestrli'),
(10, 'CMPS 230', 16, 'Omarou Manaestrli'),
(11, 'CMPS 205', 16, 'Omarou Manaestrli');

-- --------------------------------------------------------

--
-- Table structure for table `course_chat`
--

CREATE TABLE `course_chat` (
  `course_name` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_id` int(11) NOT NULL,
  `date` varchar(25) NOT NULL,
  `text` mediumtext NOT NULL,
  `media` varchar(255) NOT NULL DEFAULT ' '
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `course_chat`
--

INSERT INTO `course_chat` (`course_name`, `author_name`, `author_id`, `date`, `text`, `media`) VALUES
('CMPS 200', 'Samer Absa', 11, '12/23-06:00', 'Hey bro', ' '),
('CMPS 200', 'Bassel Al-Mawla', 17, '12/23-06:01', 'Hey man', ' '),
('CMPS 200', 'Bassel Al-Mawla', 17, '12/23-06:01', 'wanna check my pic?', ' '),
('CMPS 200', 'Samer Absa', 11, '12/23-06:01', 'yeah sure!', ' '),
('CMPS 200', 'Omarou Manaestrli', 16, '12/23-05:31', 'Hi this is Omarou', ' ');

-- --------------------------------------------------------

--
-- Table structure for table `course_registrar`
--

CREATE TABLE `course_registrar` (
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `course_name` varchar(100) NOT NULL,
  `student_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `course_registrar`
--

INSERT INTO `course_registrar` (`course_id`, `student_id`, `status`, `course_name`, `student_name`) VALUES
(2, 11, 1, 'CMPS 212', 'Samer Absa'),
(7, 18, 0, 'CMPS 278', 'Lisa Khuder'),
(1, 18, 1, 'CMPS 200', 'Lisa Khuder'),
(8, 18, 0, 'CMPS 255', 'Lisa Khuder'),
(1, 19, 0, 'CMPS 200', 'Mohamad Kazem'),
(2, 19, 1, 'CMPS 212', 'Mohamad Kazem'),
(7, 19, 0, 'CMPS 278', 'Mohamad Kazem'),
(6, 19, 0, 'CMPS 299', 'Mohamad Kazem'),
(8, 19, 0, 'CMPS 255', 'Mohamad Kazem'),
(1, 11, 1, 'CMPS 200', 'Samer Absa'),
(2, 17, 1, 'CMPS 212', 'Bassel Al-Mawla'),
(6, 17, 0, 'CMPS 299', 'Bassel Al-Mawla'),
(7, 17, 0, 'CMPS 278', 'Bassel Al-Mawla'),
(9, 11, 1, 'CMPS 251', 'Samer Absa'),
(11, 17, 1, 'CMPS 205', 'Bassel Al-Mawla'),
(1, 17, 1, 'CMPS 200', 'Bassel Al-Mawla');

-- --------------------------------------------------------

--
-- Table structure for table `question_post`
--

CREATE TABLE `question_post` (
  `id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `date` datetime NOT NULL,
  `upvoted` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `question_post`
--

INSERT INTO `question_post` (`id`, `course_name`, `author_name`, `text`, `date`, `upvoted`) VALUES
(1, 'CMPS 200', 'Omarou Manaestrli', 'Hi, I am new here. Can anyone help me with how should I start with?', '2020-12-22 10:00:37', 0),
(2, 'CMPS 200', 'Samer Absa', 'Can anyone tell me about the course in brief?', '2020-12-22 10:06:19', 0),
(3, 'CMPS 200', 'Samer Absa', 'Guys When the assignment will be?', '2020-12-22 10:11:19', 0),
(4, 'CMPS 212', 'Bassel Al-Mawla', 'Test ', '2020-12-22 12:28:18', 0),
(5, 'CMPS 212', 'Omarou Manaestrli', 'Hello', '2020-12-22 12:28:33', 0),
(6, 'CMPS 212', 'Bassel Al-Mawla', 'how are you', '2020-12-22 12:28:33', 0),
(7, 'CMPS 212', 'Bassel Al-Mawla', 'test', '2020-12-22 12:28:42', 0),
(8, 'CMPS 212', 'Omarou Manaestrli', 'Hello', '2020-12-22 12:28:50', 0),
(9, 'CMPS 212', 'Bassel Al-Mawla', 'test', '2020-12-22 12:28:55', 0),
(10, 'CMPS 212', 'Bassel Al-Mawla', 'hello21', '2020-12-22 12:37:38', 0);

-- --------------------------------------------------------

--
-- Table structure for table `upvoted_comment`
--

CREATE TABLE `upvoted_comment` (
  `upvoted_name` varchar(255) NOT NULL,
  `upvoted_comment_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `upvoted_questions`
--

CREATE TABLE `upvoted_questions` (
  `upvoted_name` varchar(255) NOT NULL,
  `upvoted_question_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gender` tinytext NOT NULL,
  `birthday` date NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `phone`, `gender`, `birthday`, `email`, `password`, `isAdmin`, `image`) VALUES
(11, 'Samer Absa', '9617897654', 'Male', '2000-01-01', 'samer@gmail.com', '$2a$08$VZBQSRoELXZfO6XLgrDvceUOxELIDi9PCZkTDHZHkyZMGKSgvyFUa', 0, ''),
(16, 'Omarou Manaestrli', '96170597818', 'Male', '1993-08-23', 'omm18@mail.aub.edu', '$2a$08$SRHZf0YiH9dLkKSmA/jT5OEBDahT829qcRK4Z.GzeeC/wAvcwqNxu', 1, 'personal-picture.png'),
(17, 'Bassel Al-Mawla', '96175347618', 'Male', '1993-07-24', 'bm05@mail.aub.edu', '$2a$08$P46zNUUDcxy9B7V1CKZFkOtnYCuWme8WzaQ9tWJuVlPYf.YnQCEs6', 0, 'Screen Shot 2020-12-11 at 8.37.41 AM.png'),
(18, 'Lisa Khuder', '96156234', 'Female', '1988-08-08', 'lisa@gmail.com', '$2a$08$9MGL2erxa6LOLBs.cVvwVuZnJNRftztuV2LLzaWu022yCjtgL7dw2', 0, ''),
(19, 'Mohamad Kazem', '961456789', 'Male', '1995-05-05', 'mk02@mail.aub.edu', '$2a$08$uwABHotwKGOlahr28hix7OGuZ69IPS8zuk1G7eM2oEPJB4gUkZsMK', 0, ''),
(20, 'Haidar Safa', '961987643', 'Male', '1976-07-08', 'sf04@mail.aub.edu', '$2a$08$OHNYpdjwWVc7GeTMvvMU/.GkUbzM.ghqpoFGEzbYkNhUybFyPQ72S', 1, '');

-- --------------------------------------------------------

--
-- Table structure for table `users_messaging`
--

CREATE TABLE `users_messaging` (
  `id` int(11) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `receiver_name` varchar(255) NOT NULL,
  `receiver_email` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `subject` varchar(255) NOT NULL,
  `text` mediumtext NOT NULL,
  `media` varchar(255) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users_messaging`
--

INSERT INTO `users_messaging` (`id`, `sender_name`, `sender_email`, `receiver_name`, `receiver_email`, `date`, `subject`, `text`, `media`, `isRead`) VALUES
(1, 'Omarou Manaestrli', 'omm18@mail.aub.edu', 'Bassel Al-Mawla', 'bm05@mail.aub.edu', '2020-12-20 00:00:00', 'Testing', 'Bro this is a testing email and I hope it really works!', 'neutrality-image.jpg', 0),
(2, 'Omarou Manaestrli', 'omm18@mail.aub.edu', 'Lisa Khuder', 'lisa@gmail.com', '2020-12-20 00:00:00', 'Confession', 'Hey lisa, I want to confess about my feelings toward you! I hope you are sexy as always ;)', 'CMPS272 - Final Exam Fall 2020-2021.pdf', 0),
(3, 'Omarou Manaestrli', 'omm18@mail.aub.edu', 'Lisa Khuder', 'lisa@gmail.com', '2020-12-20 00:00:00', 'Hello', 'Yo how are you? it has been a long time with no touch, are you sick?', 'neutrality-image.jpg', 0),
(4, 'Omarou Manaestrli', 'omm18@mail.aub.edu', 'Bassel Al-Mawla', 'bm05@mail.aub.edu', '2020-12-20 00:00:00', 'Testing # 2', 'Hey bro! I am testing the redirect issue and I hope it really works!!!', '', 0),
(5, 'Omarou Manaestrli', 'omm18@mail.aub.edu', 'Bassel Al-Mawla', 'bm05@mail.aub.edu', '2020-12-20 00:00:00', 'Test # 2', 'Bro the message I have sent earlier did not work as it should be since it had directed to index page and we did not want that to happen!', 'AR-201219402.jpg&MaxW=780&imageVersion=16by9&NCS_modified=20201214193122.jpg', 0),
(6, 'Lisa Khuder', 'lisa@gmail.com', 'Bassel Al-Mawla', 'bm05@mail.aub.edu', '2020-12-20 00:00:00', 'Hi mate!', 'Hello this is lisa a student as you are, and I just want to tell you hi :D', '', 0),
(7, 'Bassel Al-Mawla', 'bm05@mail.aub.edu', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'Yoo', 'This is Bassel, I am asking for the final demo', '', 0),
(8, 'Bassel Al-Mawla', 'bm05@mail.aub.edu', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'Again', 'Yoo I am bassel again, when do we have to submit the demo you think?', '', 0),
(9, 'Lisa Khuder', 'lisa@gmail.com', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'Class', 'Hey Dr, I was asking about our class, when do we have holiday?', '', 0),
(10, 'Lisa Khuder', 'lisa@gmail.com', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'Below', 'Hey Doctor, Again asking for the class', '', 0),
(11, 'Haidar Safa', 'sf04@mail.aub.edu', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'MAte', 'Hey mate I hope you are doing well,  am asking if you are willing to give assignments for this class?', '', 0),
(12, 'Bassel Al-Mawla', 'bm05@mail.aub.edu', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-20 00:00:00', 'Yoo', 'Again this is bassel asking for our final submission', '', 0),
(13, 'Bassel Al-Mawla', 'bm05@mail.aub.edu', 'Omarou Manaestrli', 'omm18@mail.aub.edu', '2020-12-22 10:50:18', 'Yooo', 'This is a test message sent by Omarou', 'Screen Shot 2020-12-14 at 6.44.57 PM.png', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comment_post`
--
ALTER TABLE `comment_post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `question_post`
--
ALTER TABLE `question_post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_messaging`
--
ALTER TABLE `users_messaging`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `comment_post`
--
ALTER TABLE `comment_post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `question_post`
--
ALTER TABLE `question_post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users_messaging`
--
ALTER TABLE `users_messaging`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
