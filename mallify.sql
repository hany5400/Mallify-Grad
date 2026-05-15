-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2026 at 04:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mallify`
--

-- --------------------------------------------------------

--
-- Table structure for table `discount`
--

CREATE TABLE `discount` (
  `discount_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `amount` varchar(255) DEFAULT NULL,
  `store_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discount`
--

INSERT INTO `discount` (`discount_id`, `title`, `expiry_date`, `amount`, `store_id`) VALUES
(1, 'title', '2026-05-16', '20', 1),
(2, 'title', '2026-05-06', '30', 1),
(3, 'title', '2026-05-07', '30', 1),
(4, 'title', '2026-05-08', '30', 1);

-- --------------------------------------------------------

--
-- Table structure for table `discount_target`
--

CREATE TABLE `discount_target` (
  `discount_target_id` int(11) NOT NULL,
  `discount_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discount_target`
--

INSERT INTO `discount_target` (`discount_target_id`, `discount_id`, `product_id`, `product_category_id`) VALUES
(6, 1, 1, 4),
(7, 2, 1, 4),
(8, 3, 2, 63),
(9, 4, 2, 20);

-- --------------------------------------------------------

--
-- Table structure for table `mall`
--

CREATE TABLE `mall` (
  `mall_id` int(11) NOT NULL,
  `mall_name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mall`
--

INSERT INTO `mall` (`mall_id`, `mall_name`, `image_url`, `user_id`) VALUES
(1, 'cairo festival city', 'uploads/malls/mall-1778169329503.png', 5),
(2, 'mall of egypt', 'uploads/malls/mall-1778169392503.jpeg', 8),
(3, 'mall of arabia', 'uploads/malls/mall-1778169455280.png', 10),
(4, 'city center almaza', 'uploads/malls/mall-1778169495624.jpeg', 12),
(5, 'city stars', 'uploads/malls/mall-1778169535029.png', 13),
(6, 'city center maadi', 'uploads/malls/mall-1778169572535.png', 14);

-- --------------------------------------------------------

--
-- Table structure for table `mall_admin_register`
--

CREATE TABLE `mall_admin_register` (
  `mall_register_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `commercial_license` varchar(255) DEFAULT NULL,
  `identification_document` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `invite_code` varchar(20) DEFAULT NULL,
  `mall_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mall_admin_register`
--

INSERT INTO `mall_admin_register` (`mall_register_id`, `user_id`, `commercial_license`, `identification_document`, `status`, `created_at`, `invite_code`, `mall_name`) VALUES
(8, 8, 'uploads/admin_requests/1776906860446-app logo.png', 'uploads/admin_requests/1776906860449-logo.png', 'approved', '2026-04-23 01:14:20', 'MA_2CZTPN', 'city stars'),
(9, 10, 'uploads/admin_requests/1776910959401-logo.png', 'uploads/admin_requests/1776910959403-app logo.png', 'approved', '2026-04-23 02:22:39', 'MA_ODNMLB', 'city stars'),
(13, 12, 'uploads/admin_requests/1777059215507-city centre almaza.jpeg', 'uploads/admin_requests/1777059215511-app logo.png', 'approved', '2026-04-24 19:33:35', 'MA_77XP32', 'city centre almaza'),
(15, 13, 'uploads/admin_requests/1777060675176-city stars.jpeg', 'uploads/admin_requests/1777060675178-city stars.jpeg', 'approved', '2026-04-24 19:57:55', 'MA_GNL7LZ', 'city stars');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) DEFAULT NULL,
  `store_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `product_name`, `store_id`, `image_url`) VALUES
(1, 'Jeans', 1, NULL),
(2, 'T-Shirt', 1, NULL),
(3, 'Jeans', 2, NULL),
(4, 'Shirt', 2, NULL),
(5, 'Dress', 3, NULL),
(6, 'Blouse', 3, NULL),
(7, 'Jeans', 4, NULL),
(8, 'Hoodie', 5, NULL),
(9, 'Skirt', 6, NULL),
(10, 'Suit', 7, NULL),
(11, 'Running Shoes', 8, NULL),
(12, 'Sneakers', 9, NULL),
(13, 'Training Set', 10, NULL),
(14, 'Shoes', 11, NULL),
(15, 'Bag', 12, NULL),
(16, 'Bracelet', 13, NULL),
(17, 'Necklace', 14, NULL),
(18, 'Jeans', 15, NULL),
(19, 'T-Shirt', 15, NULL),
(20, 'Dress', 16, NULL),
(21, 'Shirt', 16, NULL),
(22, 'Jeans', 17, NULL),
(23, 'Jeans', 18, NULL),
(24, 'Hoodie', 19, NULL),
(25, 'Shoes', 20, NULL),
(26, 'Sneakers', 21, NULL),
(27, 'Sport Set', 22, NULL),
(28, 'Jacket', 23, NULL),
(29, 'Shoes', 24, NULL),
(30, 'Bag', 25, NULL),
(31, 'Makeup', 26, NULL),
(32, 'Jeans', 27, NULL),
(33, 'T-Shirt', 28, NULL),
(34, 'Jeans', 30, NULL),
(35, 'Hoodie', 31, NULL),
(36, 'Shirt', 32, NULL),
(37, 'Shoes', 33, NULL),
(38, 'Sneakers', 34, NULL),
(39, 'Cap', 35, NULL),
(40, 'Bag', 36, NULL),
(41, 'Perfume', 37, NULL),
(42, 'Sunglasses', 38, NULL),
(43, 'Jeans', 39, NULL),
(44, 'T-Shirt', 40, NULL),
(45, 'Dress', 41, NULL),
(46, 'Hoodie', 42, NULL),
(47, 'Jacket', 43, NULL),
(48, 'Kids Clothes', 44, NULL),
(49, 'Underwear', 45, NULL),
(50, 'Shoes', 46, NULL),
(51, 'Sneakers', 47, NULL),
(52, 'Sport Set', 48, NULL),
(53, 'Shoes', 49, NULL),
(54, 'Bracelet', 50, NULL),
(55, 'Necklace', 51, NULL),
(56, 'Kids T-Shirt', 52, NULL),
(57, 'Jeans', 53, NULL),
(58, 'Shirt', 54, NULL),
(59, 'Dress', 55, NULL),
(60, 'T-Shirt', 56, NULL),
(61, 'Shoes', 57, NULL),
(62, 'Sneakers', 58, NULL),
(63, 'Sport Shoes', 59, NULL),
(64, 'Bag', 60, NULL),
(65, 'Watch', 61, NULL),
(66, 'Jewelry', 62, NULL),
(67, 'T-Shirt', 63, NULL),
(68, 'Jeans', 64, NULL),
(69, 'Shoes', 65, NULL),
(70, 'Sneakers', 66, NULL),
(71, 'Cap', 67, NULL),
(72, 'Shirt', 68, NULL),
(73, 'Bag', 69, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE `product_category` (
  `product_category_id` int(11) NOT NULL,
  `product_category_name` varchar(100) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `size` enum('Small','Medium','Large','X-Large') NOT NULL DEFAULT 'Small',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_category`
--

INSERT INTO `product_category` (`product_category_id`, `product_category_name`, `product_id`, `size`, `price`, `image_url`) VALUES
(4, 'Slim Fit Jeans', 1, 'Small', 749.99, NULL),
(5, 'Slim Fit Jeans', 1, 'Medium', 799.99, NULL),
(6, 'Slim Fit Jeans', 1, 'Large', 849.99, NULL),
(7, 'Slim Fit Jeans', 1, 'X-Large', 899.99, NULL),
(8, 'Skinny Jeans', 1, 'Small', 779.99, NULL),
(9, 'Skinny Jeans', 1, 'Medium', 829.99, NULL),
(10, 'Skinny Jeans', 1, 'Large', 879.99, NULL),
(11, 'Skinny Jeans', 1, 'X-Large', 929.99, NULL),
(12, 'Straight Jeans', 1, 'Small', 699.99, NULL),
(13, 'Straight Jeans', 1, 'Medium', 749.99, NULL),
(14, 'Straight Jeans', 1, 'Large', 799.99, NULL),
(15, 'Straight Jeans', 1, 'X-Large', 849.99, NULL),
(16, 'Oversized T-Shirt', 2, 'Small', 399.99, NULL),
(17, 'Oversized T-Shirt', 2, 'Medium', 449.99, NULL),
(18, 'Oversized T-Shirt', 2, 'Large', 499.99, NULL),
(19, 'Oversized T-Shirt', 2, 'X-Large', 549.99, NULL),
(20, 'Regular T-Shirt', 2, 'Small', 349.99, NULL),
(21, 'Regular T-Shirt', 2, 'Medium', 399.99, NULL),
(22, 'Regular T-Shirt', 2, 'Large', 449.99, NULL),
(23, 'Regular T-Shirt', 2, 'X-Large', 499.99, NULL),
(24, 'Summer Dress', 3, 'Small', 899.99, NULL),
(25, 'Summer Dress', 3, 'Medium', 949.99, NULL),
(26, 'Summer Dress', 3, 'Large', 999.99, NULL),
(27, 'Summer Dress', 3, 'X-Large', 1049.99, NULL),
(28, 'Elegant Dress', 3, 'Small', 1099.99, NULL),
(29, 'Elegant Dress', 3, 'Medium', 1199.99, NULL),
(30, 'Elegant Dress', 3, 'Large', 1299.99, NULL),
(31, 'Elegant Dress', 3, 'X-Large', 1399.99, NULL),
(32, 'Hoodie', 4, 'Small', 699.99, NULL),
(33, 'Hoodie', 4, 'Medium', 749.99, NULL),
(34, 'Hoodie', 4, 'Large', 799.99, NULL),
(35, 'Hoodie', 4, 'X-Large', 849.99, NULL),
(36, 'Zip Hoodie', 4, 'Small', 749.99, NULL),
(37, 'Zip Hoodie', 4, 'Medium', 799.99, NULL),
(38, 'Zip Hoodie', 4, 'Large', 849.99, NULL),
(39, 'Zip Hoodie', 4, 'X-Large', 899.99, NULL),
(40, 'Jacket', 5, 'Small', 1099.99, NULL),
(41, 'Jacket', 5, 'Medium', 1199.99, NULL),
(42, 'Jacket', 5, 'Large', 1299.99, NULL),
(43, 'Jacket', 5, 'X-Large', 1399.99, NULL),
(44, 'Winter Jacket', 5, 'Small', 1299.99, NULL),
(45, 'Winter Jacket', 5, 'Medium', 1399.99, NULL),
(46, 'Winter Jacket', 5, 'Large', 1499.99, NULL),
(47, 'Winter Jacket', 5, 'X-Large', 1599.99, NULL),
(48, 'Slim Fit Jeans', 1, 'Small', 749.99, NULL),
(49, 'Slim Fit Jeans', 1, 'Medium', 799.99, NULL),
(50, 'Slim Fit Jeans', 1, 'Large', 849.99, NULL),
(51, 'Slim Fit Jeans', 1, 'X-Large', 899.99, NULL),
(52, 'Skinny Jeans', 1, 'Small', 779.99, NULL),
(53, 'Skinny Jeans', 1, 'Medium', 829.99, NULL),
(54, 'Skinny Jeans', 1, 'Large', 879.99, NULL),
(55, 'Skinny Jeans', 1, 'X-Large', 929.99, NULL),
(56, 'Straight Jeans', 1, 'Small', 699.99, NULL),
(57, 'Straight Jeans', 1, 'Medium', 749.99, NULL),
(58, 'Straight Jeans', 1, 'Large', 799.99, NULL),
(59, 'Straight Jeans', 1, 'X-Large', 849.99, NULL),
(60, 'Oversized T-Shirt', 2, 'Small', 399.99, NULL),
(61, 'Oversized T-Shirt', 2, 'Medium', 449.99, NULL),
(62, 'Oversized T-Shirt', 2, 'Large', 499.99, NULL),
(63, 'Oversized T-Shirt', 2, 'X-Large', 549.99, NULL),
(64, 'Regular T-Shirt', 2, 'Small', 349.99, NULL),
(65, 'Regular T-Shirt', 2, 'Medium', 399.99, NULL),
(66, 'Regular T-Shirt', 2, 'Large', 449.99, NULL),
(67, 'Regular T-Shirt', 2, 'X-Large', 499.99, NULL),
(68, 'Summer Dress', 3, 'Small', 899.99, NULL),
(69, 'Summer Dress', 3, 'Medium', 949.99, NULL),
(70, 'Summer Dress', 3, 'Large', 999.99, NULL),
(71, 'Summer Dress', 3, 'X-Large', 1049.99, NULL),
(72, 'Elegant Dress', 3, 'Small', 1099.99, NULL),
(73, 'Elegant Dress', 3, 'Medium', 1199.99, NULL),
(74, 'Elegant Dress', 3, 'Large', 1299.99, NULL),
(75, 'Elegant Dress', 3, 'X-Large', 1399.99, NULL),
(76, 'Hoodie', 4, 'Small', 699.99, NULL),
(77, 'Hoodie', 4, 'Medium', 749.99, NULL),
(78, 'Hoodie', 4, 'Large', 799.99, NULL),
(79, 'Hoodie', 4, 'X-Large', 849.99, NULL),
(80, 'Zip Hoodie', 4, 'Small', 749.99, NULL),
(81, 'Zip Hoodie', 4, 'Medium', 799.99, NULL),
(82, 'Zip Hoodie', 4, 'Large', 849.99, NULL),
(83, 'Zip Hoodie', 4, 'X-Large', 899.99, NULL),
(84, 'Jacket', 5, 'Small', 1099.99, NULL),
(85, 'Jacket', 5, 'Medium', 1199.99, NULL),
(86, 'Jacket', 5, 'Large', 1299.99, NULL),
(87, 'Jacket', 5, 'X-Large', 1399.99, NULL),
(88, 'Winter Jacket', 5, 'Small', 1299.99, NULL),
(89, 'Winter Jacket', 5, 'Medium', 1399.99, NULL),
(90, 'Winter Jacket', 5, 'Large', 1499.99, NULL),
(91, 'Winter Jacket', 5, 'X-Large', 1599.99, NULL),
(92, 'Running Shoes', 6, 'Small', 1599.99, NULL),
(93, 'Running Shoes', 6, 'Medium', 1699.99, NULL),
(94, 'Running Shoes', 6, 'Large', 1799.99, NULL),
(95, 'Running Shoes', 6, 'X-Large', 1899.99, NULL),
(96, 'Training Shoes', 6, 'Small', 1499.99, NULL),
(97, 'Training Shoes', 6, 'Medium', 1599.99, NULL),
(98, 'Training Shoes', 6, 'Large', 1699.99, NULL),
(99, 'Training Shoes', 6, 'X-Large', 1799.99, NULL),
(100, 'Sneakers', 7, 'Small', 1399.99, NULL),
(101, 'Sneakers', 7, 'Medium', 1499.99, NULL),
(102, 'Sneakers', 7, 'Large', 1599.99, NULL),
(103, 'Sneakers', 7, 'X-Large', 1699.99, NULL),
(104, 'Street Sneakers', 7, 'Small', 1499.99, NULL),
(105, 'Street Sneakers', 7, 'Medium', 1599.99, NULL),
(106, 'Street Sneakers', 7, 'Large', 1699.99, NULL),
(107, 'Street Sneakers', 7, 'X-Large', 1799.99, NULL),
(108, 'Sport Set', 8, 'Small', 999.99, NULL),
(109, 'Sport Set', 8, 'Medium', 1099.99, NULL),
(110, 'Sport Set', 8, 'Large', 1199.99, NULL),
(111, 'Sport Set', 8, 'X-Large', 1299.99, NULL),
(112, 'Handbag', 9, 'Small', 999.99, NULL),
(113, 'Handbag', 9, 'Medium', 1199.99, NULL),
(114, 'Handbag', 9, 'Large', 1399.99, NULL),
(115, 'Premium Bag', 9, 'Medium', 1599.99, NULL),
(116, 'Premium Bag', 9, 'Large', 1799.99, NULL),
(117, 'Backpack', 10, 'Small', 899.99, NULL),
(118, 'Backpack', 10, 'Medium', 999.99, NULL),
(119, 'Backpack', 10, 'Large', 1099.99, NULL),
(120, 'Bracelet', 11, 'Small', 2499.99, NULL),
(121, 'Bracelet', 11, 'Medium', 2799.99, NULL),
(122, 'Bracelet', 11, 'Large', 3199.99, NULL),
(123, 'Necklace', 12, 'Medium', 2999.99, NULL),
(124, 'Necklace', 12, 'Large', 3499.99, NULL),
(125, 'Watch', 13, 'Medium', 1999.99, NULL),
(126, 'Watch', 13, 'Large', 2499.99, NULL),
(127, 'Perfume', 14, 'Medium', 1499.99, NULL),
(128, 'Perfume', 14, 'Large', 1799.99, NULL),
(129, 'Sunglasses', 15, 'Medium', 999.99, NULL),
(130, 'Sunglasses', 15, 'Large', 1299.99, NULL),
(131, 'Kids T-Shirt', 16, 'Small', 299.99, NULL),
(132, 'Kids T-Shirt', 16, 'Medium', 349.99, NULL),
(133, 'Kids T-Shirt', 16, 'Large', 399.99, NULL),
(134, 'Cotton Shirt', 17, 'Small', 499.99, NULL),
(135, 'Cotton Shirt', 17, 'Medium', 549.99, NULL),
(136, 'Cotton Shirt', 17, 'Large', 599.99, NULL),
(137, 'Formal Shirt', 18, 'Small', 699.99, NULL),
(138, 'Formal Shirt', 18, 'Medium', 749.99, NULL),
(139, 'Formal Shirt', 18, 'Large', 799.99, NULL),
(140, 'Shorts', 19, 'Small', 399.99, NULL),
(141, 'Shorts', 19, 'Medium', 449.99, NULL),
(142, 'Shorts', 19, 'Large', 499.99, NULL),
(143, 'Polo Shirt', 20, 'Small', 599.99, NULL),
(144, 'Polo Shirt', 20, 'Medium', 649.99, NULL),
(145, 'Polo Shirt', 20, 'Large', 699.99, NULL),
(146, 'Cap', 21, 'Small', 199.99, NULL),
(147, 'Cap', 21, 'Medium', 249.99, NULL),
(148, 'Wallet', 22, 'Small', 299.99, NULL),
(149, 'Wallet', 22, 'Medium', 349.99, NULL),
(150, 'Belt', 23, 'Small', 399.99, NULL),
(151, 'Belt', 23, 'Medium', 449.99, NULL),
(152, 'Ring', 24, 'Small', 999.99, NULL),
(153, 'Ring', 24, 'Medium', 1299.99, NULL),
(154, 'Earrings', 25, 'Small', 899.99, NULL),
(155, 'Earrings', 25, 'Medium', 1199.99, NULL),
(156, 'Denim Shirt', 26, 'Small', 699.99, NULL),
(157, 'Denim Shirt', 26, 'Medium', 749.99, NULL),
(158, 'Denim Shirt', 26, 'Large', 799.99, NULL),
(159, 'Denim Shirt', 26, 'X-Large', 849.99, NULL),
(160, 'Casual Shirt', 27, 'Small', 499.99, NULL),
(161, 'Casual Shirt', 27, 'Medium', 549.99, NULL),
(162, 'Casual Shirt', 27, 'Large', 599.99, NULL),
(163, 'Casual Shirt', 27, 'X-Large', 649.99, NULL),
(164, 'Formal Shirt', 28, 'Small', 799.99, NULL),
(165, 'Formal Shirt', 28, 'Medium', 849.99, NULL),
(166, 'Formal Shirt', 28, 'Large', 899.99, NULL),
(167, 'Formal Shirt', 28, 'X-Large', 949.99, NULL),
(168, 'Cargo Pants', 29, 'Small', 899.99, NULL),
(169, 'Cargo Pants', 29, 'Medium', 949.99, NULL),
(170, 'Cargo Pants', 29, 'Large', 999.99, NULL),
(171, 'Cargo Pants', 29, 'X-Large', 1049.99, NULL),
(172, 'Chino Pants', 30, 'Small', 799.99, NULL),
(173, 'Chino Pants', 30, 'Medium', 849.99, NULL),
(174, 'Chino Pants', 30, 'Large', 899.99, NULL),
(175, 'Chino Pants', 30, 'X-Large', 949.99, NULL),
(176, 'Classic Sneakers', 31, 'Small', 1399.99, NULL),
(177, 'Classic Sneakers', 31, 'Medium', 1499.99, NULL),
(178, 'Classic Sneakers', 31, 'Large', 1599.99, NULL),
(179, 'Classic Sneakers', 31, 'X-Large', 1699.99, NULL),
(180, 'Sport Running Shoes', 32, 'Small', 1599.99, NULL),
(181, 'Sport Running Shoes', 32, 'Medium', 1699.99, NULL),
(182, 'Sport Running Shoes', 32, 'Large', 1799.99, NULL),
(183, 'Sport Running Shoes', 32, 'X-Large', 1899.99, NULL),
(184, 'Basketball Shoes', 33, 'Small', 1799.99, NULL),
(185, 'Basketball Shoes', 33, 'Medium', 1899.99, NULL),
(186, 'Basketball Shoes', 33, 'Large', 1999.99, NULL),
(187, 'Basketball Shoes', 33, 'X-Large', 2199.99, NULL),
(188, 'Slides', 34, 'Small', 399.99, NULL),
(189, 'Slides', 34, 'Medium', 449.99, NULL),
(190, 'Slides', 34, 'Large', 499.99, NULL),
(191, 'Sandals', 35, 'Small', 499.99, NULL),
(192, 'Sandals', 35, 'Medium', 549.99, NULL),
(193, 'Sandals', 35, 'Large', 599.99, NULL),
(194, 'Leather Bag', 36, 'Small', 1299.99, NULL),
(195, 'Leather Bag', 36, 'Medium', 1499.99, NULL),
(196, 'Leather Bag', 36, 'Large', 1699.99, NULL),
(197, 'Mini Bag', 37, 'Small', 899.99, NULL),
(198, 'Mini Bag', 37, 'Medium', 999.99, NULL),
(199, 'Mini Bag', 37, 'Large', 1099.99, NULL),
(200, 'Travel Bag', 38, 'Small', 1499.99, NULL),
(201, 'Travel Bag', 38, 'Medium', 1699.99, NULL),
(202, 'Travel Bag', 38, 'Large', 1899.99, NULL),
(203, 'School Backpack', 39, 'Small', 699.99, NULL),
(204, 'School Backpack', 39, 'Medium', 799.99, NULL),
(205, 'School Backpack', 39, 'Large', 899.99, NULL),
(206, 'Laptop Bag', 40, 'Small', 999.99, NULL),
(207, 'Laptop Bag', 40, 'Medium', 1199.99, NULL),
(208, 'Laptop Bag', 40, 'Large', 1399.99, NULL),
(209, 'Luxury Bracelet', 41, 'Small', 2499.99, NULL),
(210, 'Luxury Bracelet', 41, 'Medium', 2799.99, NULL),
(211, 'Luxury Bracelet', 41, 'Large', 3199.99, NULL),
(212, 'Gold Necklace', 42, 'Small', 2999.99, NULL),
(213, 'Gold Necklace', 42, 'Medium', 3399.99, NULL),
(214, 'Gold Necklace', 42, 'Large', 3799.99, NULL),
(215, 'Silver Ring', 43, 'Small', 999.99, NULL),
(216, 'Silver Ring', 43, 'Medium', 1299.99, NULL),
(217, 'Silver Ring', 43, 'Large', 1599.99, NULL),
(218, 'Earrings Set', 44, 'Small', 899.99, NULL),
(219, 'Earrings Set', 44, 'Medium', 1199.99, NULL),
(220, 'Earrings Set', 44, 'Large', 1499.99, NULL),
(221, 'Luxury Watch', 45, 'Medium', 1999.99, NULL),
(222, 'Luxury Watch', 45, 'Large', 2499.99, NULL),
(223, 'Men Perfume', 46, 'Small', 1299.99, NULL),
(224, 'Men Perfume', 46, 'Medium', 1599.99, NULL),
(225, 'Men Perfume', 46, 'Large', 1899.99, NULL),
(226, 'Women Perfume', 47, 'Small', 1399.99, NULL),
(227, 'Women Perfume', 47, 'Medium', 1699.99, NULL),
(228, 'Women Perfume', 47, 'Large', 1999.99, NULL),
(229, 'Body Spray', 48, 'Small', 399.99, NULL),
(230, 'Body Spray', 48, 'Medium', 499.99, NULL),
(231, 'Body Spray', 48, 'Large', 599.99, NULL),
(232, 'Sunglasses Premium', 49, 'Medium', 999.99, NULL),
(233, 'Sunglasses Premium', 49, 'Large', 1299.99, NULL),
(234, 'Sports Cap', 50, 'Small', 199.99, NULL),
(235, 'Sports Cap', 50, 'Medium', 249.99, NULL),
(236, 'Sports Cap', 50, 'Large', 299.99, NULL),
(237, 'Sports Cap', 51, 'Small', 199.99, NULL),
(238, 'Sports Cap', 51, 'Medium', 249.99, NULL),
(239, 'Sports Cap', 51, 'Large', 299.99, NULL),
(240, 'Beanie Hat', 52, 'Small', 299.99, NULL),
(241, 'Beanie Hat', 52, 'Medium', 349.99, NULL),
(242, 'Beanie Hat', 52, 'Large', 399.99, NULL),
(243, 'Leather Belt', 53, 'Small', 399.99, NULL),
(244, 'Leather Belt', 53, 'Medium', 449.99, NULL),
(245, 'Leather Belt', 53, 'Large', 499.99, NULL),
(246, 'Wallet Classic', 54, 'Small', 299.99, NULL),
(247, 'Wallet Classic', 54, 'Medium', 349.99, NULL),
(248, 'Wallet Classic', 54, 'Large', 399.99, NULL),
(249, 'Card Holder', 55, 'Small', 199.99, NULL),
(250, 'Card Holder', 55, 'Medium', 249.99, NULL),
(251, 'Card Holder', 55, 'Large', 299.99, NULL),
(252, 'Graphic T-Shirt', 56, 'Small', 349.99, NULL),
(253, 'Graphic T-Shirt', 56, 'Medium', 399.99, NULL),
(254, 'Graphic T-Shirt', 56, 'Large', 449.99, NULL),
(255, 'Graphic T-Shirt', 56, 'X-Large', 499.99, NULL),
(256, 'Striped Shirt', 57, 'Small', 499.99, NULL),
(257, 'Striped Shirt', 57, 'Medium', 549.99, NULL),
(258, 'Striped Shirt', 57, 'Large', 599.99, NULL),
(259, 'Striped Shirt', 57, 'X-Large', 649.99, NULL),
(260, 'Linen Shirt', 58, 'Small', 699.99, NULL),
(261, 'Linen Shirt', 58, 'Medium', 749.99, NULL),
(262, 'Linen Shirt', 58, 'Large', 799.99, NULL),
(263, 'Linen Shirt', 58, 'X-Large', 849.99, NULL),
(264, 'Sweatpants', 59, 'Small', 599.99, NULL),
(265, 'Sweatpants', 59, 'Medium', 649.99, NULL),
(266, 'Sweatpants', 59, 'Large', 699.99, NULL),
(267, 'Sweatpants', 59, 'X-Large', 749.99, NULL),
(268, 'Jogger Pants', 60, 'Small', 649.99, NULL),
(269, 'Jogger Pants', 60, 'Medium', 699.99, NULL),
(270, 'Jogger Pants', 60, 'Large', 749.99, NULL),
(271, 'Jogger Pants', 60, 'X-Large', 799.99, NULL),
(272, 'Street Sneakers', 61, 'Small', 1499.99, NULL),
(273, 'Street Sneakers', 61, 'Medium', 1599.99, NULL),
(274, 'Street Sneakers', 61, 'Large', 1699.99, NULL),
(275, 'Street Sneakers', 61, 'X-Large', 1799.99, NULL),
(276, 'Premium Sneakers', 62, 'Small', 1799.99, NULL),
(277, 'Premium Sneakers', 62, 'Medium', 1899.99, NULL),
(278, 'Premium Sneakers', 62, 'Large', 1999.99, NULL),
(279, 'Premium Sneakers', 62, 'X-Large', 2199.99, NULL),
(280, 'Slip-on Shoes', 63, 'Small', 899.99, NULL),
(281, 'Slip-on Shoes', 63, 'Medium', 999.99, NULL),
(282, 'Slip-on Shoes', 63, 'Large', 1099.99, NULL),
(283, 'Formal Shoes', 64, 'Small', 1299.99, NULL),
(284, 'Formal Shoes', 64, 'Medium', 1399.99, NULL),
(285, 'Formal Shoes', 64, 'Large', 1499.99, NULL),
(286, 'Formal Shoes', 64, 'X-Large', 1599.99, NULL),
(287, 'Running Pro Shoes', 65, 'Small', 1899.99, NULL),
(288, 'Running Pro Shoes', 65, 'Medium', 1999.99, NULL),
(289, 'Running Pro Shoes', 65, 'Large', 2199.99, NULL),
(290, 'Running Pro Shoes', 65, 'X-Large', 2399.99, NULL),
(291, 'Mini Backpack', 66, 'Small', 799.99, NULL),
(292, 'Mini Backpack', 66, 'Medium', 899.99, NULL),
(293, 'Mini Backpack', 66, 'Large', 999.99, NULL),
(294, 'Leather Handbag', 67, 'Small', 1399.99, NULL),
(295, 'Leather Handbag', 67, 'Medium', 1599.99, NULL),
(296, 'Leather Handbag', 67, 'Large', 1799.99, NULL),
(297, 'Travel Suitcase', 68, 'Small', 1999.99, NULL),
(298, 'Travel Suitcase', 68, 'Medium', 2299.99, NULL),
(299, 'Travel Suitcase', 68, 'Large', 2599.99, NULL),
(300, 'Laptop Backpack Pro', 69, 'Small', 999.99, NULL),
(301, 'Laptop Backpack Pro', 69, 'Medium', 1199.99, NULL),
(302, 'Laptop Backpack Pro', 69, 'Large', 1399.99, NULL),
(303, 'Luxury Bracelet Gold', 70, 'Small', 2999.99, NULL),
(304, 'Luxury Bracelet Gold', 70, 'Medium', 3299.99, NULL),
(305, 'Luxury Bracelet Gold', 70, 'Large', 3599.99, NULL),
(306, 'Diamond Necklace', 71, 'Small', 3499.99, NULL),
(307, 'Diamond Necklace', 71, 'Medium', 3799.99, NULL),
(308, 'Diamond Necklace', 71, 'Large', 4199.99, NULL),
(309, 'Premium Watch Gold', 72, 'Medium', 2499.99, NULL),
(310, 'Premium Watch Gold', 72, 'Large', 2999.99, NULL),
(311, 'Exclusive Sunglasses', 73, 'Medium', 1299.99, NULL),
(312, 'Exclusive Sunglasses', 73, 'Large', 1599.99, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `result`
--

CREATE TABLE `result` (
  `result_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `request_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `result`
--

INSERT INTO `result` (`result_id`, `total_price`, `request_id`) VALUES
(1, 849.99, 1),
(2, 649.98, 2),
(3, 1899.98, 3),
(4, 799.99, 4);

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

CREATE TABLE `store` (
  `store_id` int(11) NOT NULL,
  `store_location` varchar(100) DEFAULT NULL,
  `store_name` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `brand_tier` enum('local','high-end','mid-tier') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`store_id`, `store_location`, `store_name`, `image_url`, `user_id`, `brand_tier`) VALUES
(1, 'Level 2 (Second Floor)', 'Zara', 'uploads/stores/zara.png', 15, 'mid-tier'),
(2, 'Level 2 (Second Floor)', 'H&M', 'uploads/stores/hm.png', 16, 'mid-tier'),
(3, 'Level 2 (Second Floor)', 'Mango', 'uploads/stores/mango.png', 17, 'mid-tier'),
(4, 'Level 2 (Second Floor)', 'Bershka', 'uploads/stores/bershka.png', 18, 'mid-tier'),
(5, 'Level 2 (Second Floor)', 'Pull & Bear', 'uploads/stores/fashion1.png', 19, 'mid-tier'),
(6, 'Level 2 (Second Floor)', 'Stradivarius', 'uploads/stores/fashion2.png', 20, 'mid-tier'),
(7, 'Level 2 (Second Floor)', 'Massimo Dutti', 'uploads/stores/fashion3.png', 21, 'high-end'),
(8, 'Level 1 (First Floor)', 'Nike', 'uploads/stores/nike.png', 22, 'mid-tier'),
(9, 'Level 1 (First Floor)', 'Adidas', 'uploads/stores/adidas.png', 23, 'mid-tier'),
(10, 'Level 1 (First Floor)', 'Puma', 'uploads/stores/sports1.png', 24, 'mid-tier'),
(11, 'Level 2 (Second Floor)', 'Aldo', 'uploads/stores/aldo.png', 25, 'mid-tier'),
(12, 'Level 2 (Second Floor)', 'Charles & Keith', 'uploads/stores/shoes1.png', 26, 'mid-tier'),
(13, 'Level 2 (Second Floor)', 'Pandora', 'uploads/stores/pandora.png', 27, 'high-end'),
(14, 'Level 2 (Second Floor)', 'Swarovski', 'uploads/stores/jewelry1.png', 28, 'high-end'),
(15, 'Level 1 (First Floor)', 'Zara', 'uploads/stores/zara.png', 29, 'mid-tier'),
(16, 'Level 1 (First Floor)', 'H&M', 'uploads/stores/hm.png', 30, 'mid-tier'),
(17, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 31, 'local'),
(18, 'Level 1 (First Floor)', 'Bershka', 'uploads/stores/bershka.png', 32, 'mid-tier'),
(19, 'Level 1 (First Floor)', 'Pull & Bear', 'uploads/stores/fashion4.png', 33, 'mid-tier'),
(20, 'Ground Floor', 'Defacto', 'uploads/stores/fashion1.png', 34, 'local'),
(21, 'Level 1 (First Floor)', 'Nike', 'uploads/stores/nike.png', 35, 'mid-tier'),
(22, 'Level 1 (First Floor)', 'Adidas', 'uploads/stores/adidas.png', 36, 'mid-tier'),
(23, 'Level 1 (First Floor)', 'Under Armour', 'uploads/stores/sports1.png', 37, 'mid-tier'),
(24, 'Ground Floor', 'Skechers', 'uploads/stores/sports1.png', 38, 'mid-tier'),
(25, 'Level 1 (First Floor)', 'Aldo', 'uploads/stores/aldo.png', 39, 'mid-tier'),
(26, 'Ground Floor', 'Faces', 'uploads/stores/tech1.png', 40, 'high-end'),
(27, 'Ground Floor', 'Zara', 'uploads/stores/zara.png', 41, 'mid-tier'),
(28, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 42, 'mid-tier'),
(29, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 43, 'local'),
(30, 'Ground Floor', 'Bershka', 'uploads/stores/bershka.png', 44, 'mid-tier'),
(31, 'Ground Floor', 'Pull & Bear', 'uploads/stores/fashion2.png', 45, 'mid-tier'),
(32, 'Ground Floor', 'American Eagle', 'uploads/stores/fashion3.png', 46, 'mid-tier'),
(33, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 47, 'mid-tier'),
(34, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 48, 'mid-tier'),
(35, 'Ground Floor', 'Puma', 'uploads/stores/sports1.png', 49, 'mid-tier'),
(36, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 50, 'mid-tier'),
(37, 'Ground Floor', 'Pandora', 'uploads/stores/pandora.png', 51, 'high-end'),
(38, 'Ground Floor', 'Sunglass Hut', 'uploads/stores/jewelry1.png', 52, 'high-end'),
(39, 'Level 2 (Second Floor)', 'Zara', 'uploads/stores/zara.png', 53, 'mid-tier'),
(40, 'Level 2 (Second Floor)', 'H&M', 'uploads/stores/hm.png', 54, 'mid-tier'),
(41, 'Level 2 (Second Floor)', 'Mango', 'uploads/stores/mango.png', 55, 'mid-tier'),
(42, 'Level 2 (Second Floor)', 'Bershka', 'uploads/stores/bershka.png', 56, 'mid-tier'),
(43, 'Level 2 (Second Floor)', 'Pull & Bear', 'uploads/stores/fashion4.png', 57, 'mid-tier'),
(44, 'Level 1 (First Floor)', 'LC Waikiki', 'uploads/stores/waikiki.png', 58, 'local'),
(45, 'Level 1 (First Floor)', 'Cottonil', 'uploads/stores/fashion1.png', 59, 'local'),
(46, 'Level 2 (Second Floor)', 'Nike', 'uploads/stores/nike.png', 60, 'mid-tier'),
(47, 'Level 2 (Second Floor)', 'Adidas', 'uploads/stores/adidas.png', 61, 'mid-tier'),
(48, 'Level 2 (Second Floor)', 'Reebok', 'uploads/stores/sports1.png', 62, 'mid-tier'),
(49, 'Level 1 (First Floor)', 'Aldo', 'uploads/stores/aldo.png', 63, 'mid-tier'),
(50, 'Level 2 (Second Floor)', 'Pandora', 'uploads/stores/pandora.png', 64, 'high-end'),
(51, 'Level 2 (Second Floor)', 'Swarovski', 'uploads/stores/jewelry1.png', 65, 'high-end'),
(52, 'Level 1 (First Floor)', 'Claire’s', 'uploads/stores/jewelry1.png', 66, 'local'),
(53, 'Ground Floor', 'Zara', 'uploads/stores/zara.png', 67, 'mid-tier'),
(54, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 68, 'mid-tier'),
(55, 'First Floor', 'Mango', 'uploads/stores/mango.png', 69, 'mid-tier'),
(56, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 70, 'local'),
(57, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 71, 'mid-tier'),
(58, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 72, 'mid-tier'),
(59, 'Ground Floor', 'Skechers', 'uploads/stores/sports1.png', 73, 'mid-tier'),
(60, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 74, 'mid-tier'),
(61, 'Ground Floor', 'Charles & Keith', 'uploads/stores/shoes1.png', 75, 'mid-tier'),
(62, 'Ground Floor', 'Pandora', 'uploads/stores/pandora.png', 76, 'high-end'),
(63, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 77, 'mid-tier'),
(64, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 78, 'local'),
(65, 'Ground Floor', 'American Eagle', 'uploads/stores/fashion2.png', 79, 'mid-tier'),
(66, 'Ground Floor', 'Cottonil', 'uploads/stores/fashion3.png', 80, 'local'),
(67, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 81, 'mid-tier'),
(68, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 82, 'mid-tier'),
(69, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 83, 'mid-tier');

-- --------------------------------------------------------

--
-- Table structure for table `store_admin_register`
--

CREATE TABLE `store_admin_register` (
  `store_register_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `commercial_license` varchar(255) DEFAULT NULL,
  `identification_document` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `invite_code` varchar(20) DEFAULT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `mall_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_mall`
--

CREATE TABLE `store_mall` (
  `store_id` int(11) NOT NULL,
  `mall_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_mall`
--

INSERT INTO `store_mall` (`store_id`, `mall_id`, `status`) VALUES
(1, 1, 'approved'),
(2, 1, 'approved'),
(3, 1, 'approved'),
(4, 1, 'approved'),
(5, 1, 'approved'),
(6, 1, 'approved'),
(7, 1, 'approved'),
(8, 1, 'approved'),
(9, 1, 'approved'),
(10, 1, 'approved'),
(11, 1, 'approved'),
(12, 1, 'approved'),
(13, 1, 'approved'),
(14, 1, 'approved'),
(15, 2, 'approved'),
(16, 2, 'approved'),
(17, 2, 'approved'),
(18, 2, 'approved'),
(19, 2, 'approved'),
(20, 2, 'approved'),
(21, 2, 'approved'),
(22, 2, 'approved'),
(23, 2, 'approved'),
(24, 2, 'approved'),
(25, 2, 'approved'),
(26, 2, 'approved'),
(27, 3, 'approved'),
(28, 3, 'approved'),
(29, 3, 'approved'),
(30, 3, 'approved'),
(31, 3, 'approved'),
(32, 3, 'approved'),
(33, 3, 'approved'),
(34, 3, 'approved'),
(35, 3, 'approved'),
(36, 3, 'approved'),
(37, 3, 'approved'),
(38, 3, 'approved'),
(39, 4, 'approved'),
(40, 4, 'approved'),
(41, 4, 'approved'),
(42, 4, 'approved'),
(43, 4, 'approved'),
(44, 4, 'approved'),
(45, 4, 'approved'),
(46, 4, 'approved'),
(47, 4, 'approved'),
(48, 4, 'approved'),
(49, 4, 'approved'),
(50, 4, 'approved'),
(51, 4, 'approved'),
(52, 4, 'approved'),
(53, 5, 'approved'),
(54, 5, 'approved'),
(55, 5, 'approved'),
(56, 5, 'approved'),
(57, 5, 'approved'),
(58, 5, 'approved'),
(59, 5, 'approved'),
(60, 5, 'approved'),
(61, 5, 'approved'),
(62, 5, 'approved'),
(63, 6, 'approved'),
(64, 6, 'approved'),
(65, 6, 'approved'),
(66, 6, 'approved'),
(67, 6, 'approved'),
(68, 6, 'approved'),
(69, 6, 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_type` enum('free','premium') DEFAULT 'free',
  `status` enum('active','expired','pending') DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`subscription_id`, `user_id`, `plan_type`, `status`, `start_date`, `end_date`) VALUES
(2, 11, 'free', 'active', '2026-04-24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `user_code` varchar(10) DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('user','store_admin','mall_admin','system_admin') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `password`, `gender`, `DOB`, `email`, `user_code`, `points`, `avatar`, `role`) VALUES
(1, 'hany', '123456', 'male', '2005-02-07', 'ahmedmohamedhany1234567@gmail.com', 'SA001', 0, NULL, 'system_admin'),
(2, 'mahmoud', '123456', NULL, NULL, 'Mahmoudalielzafrany@gmail.com', 'SA002', 0, NULL, 'system_admin'),
(3, 'mohanned', '123456', NULL, NULL, 'mohanedmostafa176@gmail.com', 'SA003', 0, NULL, 'system_admin'),
(4, 'yussuf', '123456', NULL, NULL, 'yussufmohamedd57@gmail.com', 'SA004', 0, NULL, 'system_admin'),
(5, 'hamza', '123456', '', NULL, 'hamza@gmail.com', 'ADM001', 0, NULL, 'mall_admin'),
(8, 'hady', '123456', '', NULL, 'ttalm56923@minitts.net', 'ADM002', 0, NULL, 'mall_admin'),
(10, 'john', '123456', '', NULL, 'naehp32711@minitts.net', 'ADM003', 0, NULL, 'mall_admin'),
(11, 'gamila', '123456', 'female', '2006-01-12', 'gamila@gmail.com', 'GA341', 358, NULL, 'user'),
(12, 'ali', '123456', '', NULL, 'bgxqs56448@minitts.net', 'ADM004', 0, NULL, 'mall_admin'),
(13, 'ali', '123456', '', NULL, 'kojlg55348@minitts.net', 'ADM005', 0, NULL, 'mall_admin'),
(14, 'mahmoud', '123456', '', NULL, 'mahmoud@gmail.com', 'ADM006', 0, NULL, 'mall_admin'),
(15, 'Zara CFC', '123456', NULL, NULL, 'zara.cfc@mallify.com', 'SAD001', 0, NULL, 'store_admin'),
(16, 'H&M CFC', '123456', NULL, NULL, 'hm.cfc@mallify.com', 'SAD002', 0, NULL, 'store_admin'),
(17, 'Mango CFC', '123456', NULL, NULL, 'mango.cfc@mallify.com', 'SAD003', 0, NULL, 'store_admin'),
(18, 'Bershka CFC', '123456', NULL, NULL, 'bershka.cfc@mallify.com', 'SAD004', 0, NULL, 'store_admin'),
(19, 'Pull & Bear CFC', '123456', NULL, NULL, 'pullbear.cfc@mallify.com', 'SAD005', 0, NULL, 'store_admin'),
(20, 'Stradivarius CFC', '123456', NULL, NULL, 'stradivarius.cfc@mallify.com', 'SAD006', 0, NULL, 'store_admin'),
(21, 'Massimo Dutti CFC', '123456', NULL, NULL, 'massimo.cfc@mallify.com', 'SAD007', 0, NULL, 'store_admin'),
(22, 'Nike CFC', '123456', NULL, NULL, 'nike.cfc@mallify.com', 'SAD008', 0, NULL, 'store_admin'),
(23, 'Adidas CFC', '123456', NULL, NULL, 'adidas.cfc@mallify.com', 'SAD009', 0, NULL, 'store_admin'),
(24, 'Puma CFC', '123456', NULL, NULL, 'puma.cfc@mallify.com', 'SAD010', 0, NULL, 'store_admin'),
(25, 'Aldo CFC', '123456', NULL, NULL, 'aldo.cfc@mallify.com', 'SAD011', 0, NULL, 'store_admin'),
(26, 'Charles Keith CFC', '123456', NULL, NULL, 'ck.cfc@mallify.com', 'SAD012', 0, NULL, 'store_admin'),
(27, 'Pandora CFC', '123456', NULL, NULL, 'pandora.cfc@mallify.com', 'SAD013', 0, NULL, 'store_admin'),
(28, 'Swarovski CFC', '123456', NULL, NULL, 'swarovski.cfc@mallify.com', 'SAD014', 0, NULL, 'store_admin'),
(29, 'Zara MOE', '123456', NULL, NULL, 'zara.moe@mallify.com', 'SAD015', 0, NULL, 'store_admin'),
(30, 'H&M MOE', '123456', NULL, NULL, 'hm.moe@mallify.com', 'SAD016', 0, NULL, 'store_admin'),
(31, 'LC Waikiki MOE', '123456', NULL, NULL, 'lc.moe@mallify.com', 'SAD017', 0, NULL, 'store_admin'),
(32, 'Bershka MOE', '123456', NULL, NULL, 'bershka.moe@mallify.com', 'SAD018', 0, NULL, 'store_admin'),
(33, 'Pull & Bear MOE', '123456', NULL, NULL, 'pullbear.moe@mallify.com', 'SAD019', 0, NULL, 'store_admin'),
(34, 'Defacto MOE', '123456', NULL, NULL, 'defacto.moe@mallify.com', 'SAD020', 0, NULL, 'store_admin'),
(35, 'Nike MOE', '123456', NULL, NULL, 'nike.moe@mallify.com', 'SAD021', 0, NULL, 'store_admin'),
(36, 'Adidas MOE', '123456', NULL, NULL, 'adidas.moe@mallify.com', 'SAD022', 0, NULL, 'store_admin'),
(37, 'Under Armour MOE', '123456', NULL, NULL, 'ua.moe@mallify.com', 'SAD023', 0, NULL, 'store_admin'),
(38, 'Skechers MOE', '123456', NULL, NULL, 'skechers.moe@mallify.com', 'SAD024', 0, NULL, 'store_admin'),
(39, 'Aldo MOE', '123456', NULL, NULL, 'aldo.moe@mallify.com', 'SAD025', 0, NULL, 'store_admin'),
(40, 'Faces MOE', '123456', NULL, NULL, 'faces.moe@mallify.com', 'SAD026', 0, NULL, 'store_admin'),
(41, 'Zara Arabia', '123456', NULL, NULL, 'zara.arabia@mallify.com', 'SAD027', 0, NULL, 'store_admin'),
(42, 'H&M Arabia', '123456', NULL, NULL, 'hm.arabia@mallify.com', 'SAD028', 0, NULL, 'store_admin'),
(43, 'LC Waikiki Arabia', '123456', NULL, NULL, 'lc.arabia@mallify.com', 'SAD029', 0, NULL, 'store_admin'),
(44, 'Bershka Arabia', '123456', NULL, NULL, 'bershka.arabia@mallify.com', 'SAD030', 0, NULL, 'store_admin'),
(45, 'Pull & Bear Arabia', '123456', NULL, NULL, 'pullbear.arabia@mallify.com', 'SAD031', 0, NULL, 'store_admin'),
(46, 'American Eagle Arabia', '123456', NULL, NULL, 'ae.arabia@mallify.com', 'SAD032', 0, NULL, 'store_admin'),
(47, 'Nike Arabia', '123456', NULL, NULL, 'nike.arabia@mallify.com', 'SAD033', 0, NULL, 'store_admin'),
(48, 'Adidas Arabia', '123456', NULL, NULL, 'adidas.arabia@mallify.com', 'SAD034', 0, NULL, 'store_admin'),
(49, 'Puma Arabia', '123456', NULL, NULL, 'puma.arabia@mallify.com', 'SAD035', 0, NULL, 'store_admin'),
(50, 'Aldo Arabia', '123456', NULL, NULL, 'aldo.arabia@mallify.com', 'SAD036', 0, NULL, 'store_admin'),
(51, 'Pandora Arabia', '123456', NULL, NULL, 'pandora.arabia@mallify.com', 'SAD037', 0, NULL, 'store_admin'),
(52, 'Sunglass Hut Arabia', '123456', NULL, NULL, 'sgh.arabia@mallify.com', 'SAD038', 0, NULL, 'store_admin'),
(53, 'Zara Citystars', '123456', NULL, NULL, 'zara.city@mallify.com', 'SAD039', 0, NULL, 'store_admin'),
(54, 'H&M Citystars', '123456', NULL, NULL, 'hm.city@mallify.com', 'SAD040', 0, NULL, 'store_admin'),
(55, 'Mango Citystars', '123456', NULL, NULL, 'mango.city@mallify.com', 'SAD041', 0, NULL, 'store_admin'),
(56, 'Bershka Citystars', '123456', NULL, NULL, 'bershka.city@mallify.com', 'SAD042', 0, NULL, 'store_admin'),
(57, 'Pull & Bear Citystars', '123456', NULL, NULL, 'pullbear.city@mallify.com', 'SAD043', 0, NULL, 'store_admin'),
(58, 'LC Waikiki Citystars', '123456', NULL, NULL, 'lc.city@mallify.com', 'SAD044', 0, NULL, 'store_admin'),
(59, 'Cottonil Citystars', '123456', NULL, NULL, 'cottonil.city@mallify.com', 'SAD045', 0, NULL, 'store_admin'),
(60, 'Nike Citystars', '123456', NULL, NULL, 'nike.city@mallify.com', 'SAD046', 0, NULL, 'store_admin'),
(61, 'Adidas Citystars', '123456', NULL, NULL, 'adidas.city@mallify.com', 'SAD047', 0, NULL, 'store_admin'),
(62, 'Reebok Citystars', '123456', NULL, NULL, 'reebok.city@mallify.com', 'SAD048', 0, NULL, 'store_admin'),
(63, 'Aldo Citystars', '123456', NULL, NULL, 'aldo.city@mallify.com', 'SAD049', 0, NULL, 'store_admin'),
(64, 'Pandora Citystars', '123456', NULL, NULL, 'pandora.city@mallify.com', 'SAD050', 0, NULL, 'store_admin'),
(65, 'Swarovski Citystars', '123456', NULL, NULL, 'swarovski.city@mallify.com', 'SAD051', 0, NULL, 'store_admin'),
(66, 'Claire Citystars', '123456', NULL, NULL, 'claire.city@mallify.com', 'SAD052', 0, NULL, 'store_admin'),
(67, 'Zara Almaza', '123456', NULL, NULL, 'zara.almaza@mallify.com', 'SAD053', 0, NULL, 'store_admin'),
(68, 'H&M Almaza', '123456', NULL, NULL, 'hm.almaza@mallify.com', 'SAD054', 0, NULL, 'store_admin'),
(69, 'Mango Almaza', '123456', NULL, NULL, 'mango.almaza@mallify.com', 'SAD055', 0, NULL, 'store_admin'),
(70, 'LC Waikiki Almaza', '123456', NULL, NULL, 'lc.almaza@mallify.com', 'SAD056', 0, NULL, 'store_admin'),
(71, 'Nike Almaza', '123456', NULL, NULL, 'nike.almaza@mallify.com', 'SAD057', 0, NULL, 'store_admin'),
(72, 'Adidas Almaza', '123456', NULL, NULL, 'adidas.almaza@mallify.com', 'SAD058', 0, NULL, 'store_admin'),
(73, 'Skechers Almaza', '123456', NULL, NULL, 'skechers.almaza@mallify.com', 'SAD059', 0, NULL, 'store_admin'),
(74, 'Aldo Almaza', '123456', NULL, NULL, 'aldo.almaza@mallify.com', 'SAD060', 0, NULL, 'store_admin'),
(75, 'Charles Keith Almaza', '123456', NULL, NULL, 'ck.almaza@mallify.com', 'SAD061', 0, NULL, 'store_admin'),
(76, 'Pandora Almaza', '123456', NULL, NULL, 'pandora.almaza@mallify.com', 'SAD062', 0, NULL, 'store_admin'),
(77, 'H&M Maadi', '123456', NULL, NULL, 'hm.maadi@mallify.com', 'SAD063', 0, NULL, 'store_admin'),
(78, 'LC Waikiki Maadi', '123456', NULL, NULL, 'lc.maadi@mallify.com', 'SAD064', 0, NULL, 'store_admin'),
(79, 'American Eagle Maadi', '123456', NULL, NULL, 'ae.maadi@mallify.com', 'SAD065', 0, NULL, 'store_admin'),
(80, 'Cottonil Maadi', '123456', NULL, NULL, 'cottonil.maadi@mallify.com', 'SAD066', 0, NULL, 'store_admin'),
(81, 'Nike Maadi', '123456', NULL, NULL, 'nike.maadi@mallify.com', 'SAD067', 0, NULL, 'store_admin'),
(82, 'Adidas Maadi', '123456', NULL, NULL, 'adidas.maadi@mallify.com', 'SAD068', 0, NULL, 'store_admin'),
(83, 'Aldo Maadi', '123456', NULL, NULL, 'aldo.maadi@mallify.com', 'SAD069', 0, NULL, 'store_admin');

-- --------------------------------------------------------

--
-- Table structure for table `user_request`
--

CREATE TABLE `user_request` (
  `request_id` int(11) NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_request`
--

INSERT INTO `user_request` (`request_id`, `budget`, `user_id`) VALUES
(1, 5000.00, 11),
(2, 1000.00, 11),
(3, 2000.00, 11),
(4, 850.00, 11);

-- --------------------------------------------------------

--
-- Table structure for table `user_request_storage`
--

CREATE TABLE `user_request_storage` (
  `request_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `product_category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_request_storage`
--

INSERT INTO `user_request_storage` (`request_id`, `product_id`, `store_id`, `product_category_id`) VALUES
(1, 1, 1, 50),
(2, 16, 13, 132),
(2, 22, 17, 148),
(3, 3, 2, 26),
(3, 4, 2, 39),
(4, 28, 23, 164);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `discount`
--
ALTER TABLE `discount`
  ADD PRIMARY KEY (`discount_id`),
  ADD KEY `store_id` (`store_id`);

--
-- Indexes for table `discount_target`
--
ALTER TABLE `discount_target`
  ADD PRIMARY KEY (`discount_target_id`),
  ADD KEY `discount_id` (`discount_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `product_category_id` (`product_category_id`);

--
-- Indexes for table `mall`
--
ALTER TABLE `mall`
  ADD PRIMARY KEY (`mall_id`),
  ADD KEY `fk_mall_user` (`user_id`);

--
-- Indexes for table `mall_admin_register`
--
ALTER TABLE `mall_admin_register`
  ADD PRIMARY KEY (`mall_register_id`),
  ADD KEY `fk_mall_admin_user` (`user_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `store_id` (`store_id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`product_category_id`),
  ADD KEY `fk_product_category` (`product_id`);

--
-- Indexes for table `result`
--
ALTER TABLE `result`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `fk_result_request` (`request_id`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`store_id`),
  ADD KEY `fk_store_user` (`user_id`);

--
-- Indexes for table `store_admin_register`
--
ALTER TABLE `store_admin_register`
  ADD PRIMARY KEY (`store_register_id`),
  ADD UNIQUE KEY `invite_code` (`invite_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `store_mall`
--
ALTER TABLE `store_mall`
  ADD PRIMARY KEY (`store_id`,`mall_id`),
  ADD KEY `mall_id` (`mall_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `user_code` (`user_code`);

--
-- Indexes for table `user_request`
--
ALTER TABLE `user_request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_request_storage`
--
ALTER TABLE `user_request_storage`
  ADD PRIMARY KEY (`request_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `product_category_id` (`product_category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `discount`
--
ALTER TABLE `discount`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `discount_target`
--
ALTER TABLE `discount_target`
  MODIFY `discount_target_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `mall`
--
ALTER TABLE `mall`
  MODIFY `mall_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `mall_admin_register`
--
ALTER TABLE `mall_admin_register`
  MODIFY `mall_register_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `product_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT for table `result`
--
ALTER TABLE `result`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `store_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `store_admin_register`
--
ALTER TABLE `store_admin_register`
  MODIFY `store_register_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `user_request`
--
ALTER TABLE `user_request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `discount`
--
ALTER TABLE `discount`
  ADD CONSTRAINT `fk_discount_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discount_target`
--
ALTER TABLE `discount_target`
  ADD CONSTRAINT `discount_target_ibfk_1` FOREIGN KEY (`discount_id`) REFERENCES `discount` (`discount_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discount_target_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `discount_target_ibfk_3` FOREIGN KEY (`product_category_id`) REFERENCES `product_category` (`product_category_id`) ON DELETE SET NULL;

--
-- Constraints for table `mall`
--
ALTER TABLE `mall`
  ADD CONSTRAINT `fk_mall_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mall_admin_register`
--
ALTER TABLE `mall_admin_register`
  ADD CONSTRAINT `fk_mall_admin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_ibfk_1_cascade` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_category`
--
ALTER TABLE `product_category`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_category_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `result`
--
ALTER TABLE `result`
  ADD CONSTRAINT `fk_result_request` FOREIGN KEY (`request_id`) REFERENCES `user_request` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store`
--
ALTER TABLE `store`
  ADD CONSTRAINT `fk_store_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_admin_register`
--
ALTER TABLE `store_admin_register`
  ADD CONSTRAINT `fk_store_admin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_mall`
--
ALTER TABLE `store_mall`
  ADD CONSTRAINT `fk_storeMall_mall` FOREIGN KEY (`mall_id`) REFERENCES `mall` (`mall_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_storeMall_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_store_mall_mall` FOREIGN KEY (`mall_id`) REFERENCES `mall` (`mall_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_store_mall_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_mall_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`),
  ADD CONSTRAINT `store_mall_ibfk_2` FOREIGN KEY (`mall_id`) REFERENCES `mall` (`mall_id`);

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_request`
--
ALTER TABLE `user_request`
  ADD CONSTRAINT `fk_request_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_request_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_request_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `user_request_storage`
--
ALTER TABLE `user_request_storage`
  ADD CONSTRAINT `fk_urs_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_urs_request` FOREIGN KEY (`request_id`) REFERENCES `user_request` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_urs_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_request_storage_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `user_request` (`request_id`),
  ADD CONSTRAINT `user_request_storage_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `user_request_storage_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
