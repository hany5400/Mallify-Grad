-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 11:43 AM
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
  `store_id` int(11) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discount`
--

INSERT INTO `discount` (`discount_id`, `title`, `expiry_date`, `amount`, `store_id`, `published_at`) VALUES
(2, 'title', '2026-05-06', '30', 1, '2026-01-09 02:27:18'),
(3, 'title', '2026-05-07', '30', 1, '2026-01-20 19:04:03'),
(5, 'title', '2026-05-08', '11', 2, '2026-01-15 08:58:22'),
(8, 'last discount yuom 9', '2026-05-09', '20', 1, '2026-01-13 04:39:40'),
(10, 'discount yuom 10', '2026-05-10', '20', 1, '2026-05-08 22:02:11'),
(14, 'summer discount', '2026-05-18', '30', 1, '2026-05-17 03:58:57'),
(15, 'jeans discount', '2026-05-25', '20', 1, '2026-05-23 18:38:45');

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
(7, 2, 1, 4),
(8, 3, 2, 63),
(10, 5, 3, 72),
(13, 8, 1, 4),
(14, 10, 2, 21),
(19, 14, 1, NULL),
(20, 15, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `mall`
--

CREATE TABLE `mall` (
  `mall_id` int(11) NOT NULL,
  `mall_name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mall`
--

INSERT INTO `mall` (`mall_id`, `mall_name`, `image_url`, `user_id`, `entry_date`) VALUES
(1, 'cairo festival city', 'uploads/malls/mall-1779270600226.png', 5, '2026-01-11 20:35:53'),
(2, 'mall of egypt', 'uploads/malls/mall-1779270635524.png', 8, '2026-01-07 19:21:11'),
(3, 'mall of arabia', 'uploads/malls/mall-1779270690345.png', 10, '2026-01-02 03:58:16'),
(4, 'city center almaza', 'uploads/malls/mall-1779270731475.png', 12, '2026-01-16 02:47:46'),
(5, 'city stars', 'uploads/malls/mall-1779270769939.png', 13, '2026-05-08 22:02:11'),
(6, 'city center maadi', 'uploads/malls/mall-1779270806546.png', 14, '2026-05-08 22:02:11');

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
  `invite_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mall_admin_register`
--

INSERT INTO `mall_admin_register` (`mall_register_id`, `user_id`, `commercial_license`, `identification_document`, `status`, `created_at`, `invite_code`) VALUES
(8, 8, 'uploads/admin_requests/1776906860446-app logo.png', 'uploads/admin_requests/1776906860449-logo.png', 'approved', '2026-04-23 01:14:20', 'MA_2CZTPN'),
(9, 10, 'uploads/admin_requests/1776910959401-logo.png', 'uploads/admin_requests/1776910959403-app logo.png', 'approved', '2026-04-23 02:22:39', 'MA_ODNMLB'),
(13, 12, 'uploads/admin_requests/1777059215507-city centre almaza.jpeg', 'uploads/admin_requests/1777059215511-app logo.png', 'approved', '2026-04-24 19:33:35', 'MA_77XP32'),
(15, 13, 'uploads/admin_requests/1777060675176-city stars.jpeg', 'uploads/admin_requests/1777060675178-city stars.jpeg', 'approved', '2026-04-24 19:57:55', 'MA_GNL7LZ');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `subscription_id`, `payment_amount`, `payment_method`, `payment_status`, `payment_date`) VALUES
(1, 2, 249.50, 'InstaPay', 'completed', '2026-05-10 02:11:53'),
(2, 2, 249.50, 'InstaPay', 'completed', '2026-05-10 02:14:24'),
(3, 2, 249.50, 'InstaPay', 'completed', '2026-05-10 02:21:52'),
(4, 2, 499.00, 'Orange Cash', 'completed', '2026-05-10 02:31:18'),
(5, 3, 499.00, 'Orange Cash', 'completed', '2026-05-10 02:52:07'),
(6, 3, 499.00, 'Orange Cash', 'completed', '2026-05-10 03:00:41'),
(7, 8, 2500.00, 'Visa Card', 'completed', '2026-05-25 19:00:28'),
(8, 9, 250.00, 'Orange Cash', 'completed', '2026-05-25 19:59:43');

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
(1, 'Jeans', 1, 'uploads/products/slim_jeans.png'),
(2, 'T-Shirt', 1, 'uploads/products/fashion_category.png'),
(3, 'Dress', 2, 'uploads/products/slim_jeans.png'),
(4, 'Shirt', 2, 'uploads/products/fashion_category.png'),
(5, 'Dress', 3, 'uploads/products/fashion_category.png'),
(6, 'Blouse', 3, 'uploads/products/fashion_category.png'),
(7, 'Sneakers', 4, 'uploads/products/slim_jeans.png'),
(8, 'Hoodie', 5, 'uploads/products/fashion_category.png'),
(9, 'Skirt', 6, 'uploads/products/fashion_category.png'),
(10, 'Suit', 7, 'uploads/products/fashion_category.png'),
(11, 'Running Shoes', 8, 'uploads/products/designer_sneakers.png'),
(12, 'Sneakers', 9, 'uploads/products/designer_sneakers.png'),
(13, 'Training Set', 10, 'uploads/products/fashion_category.png'),
(14, 'Shoes', 11, 'uploads/products/designer_sneakers.png'),
(15, 'Bag', 12, 'uploads/products/fashion_category.png'),
(16, 'Bracelet', 13, 'uploads/products/fashion_category.png'),
(17, 'Necklace', 14, 'uploads/products/fashion_category.png'),
(18, 'Shirt', 15, 'uploads/products/slim_jeans.png'),
(19, 'T-Shirt', 15, 'uploads/products/fashion_category.png'),
(20, 'Dress', 16, 'uploads/products/fashion_category.png'),
(21, 'Shirt', 16, 'uploads/products/fashion_category.png'),
(22, 'Wallet', 17, 'uploads/products/slim_jeans.png'),
(23, 'Belt', 18, 'uploads/products/slim_jeans.png'),
(24, 'Hoodie', 19, 'uploads/products/fashion_category.png'),
(25, 'Shoes', 20, 'uploads/products/designer_sneakers.png'),
(26, 'Sneakers', 21, 'uploads/products/designer_sneakers.png'),
(27, 'Sport Set', 22, 'uploads/products/fashion_category.png'),
(28, 'Jacket', 23, 'uploads/products/fashion_category.png'),
(29, 'Shoes', 24, 'uploads/products/designer_sneakers.png'),
(30, 'Bag', 25, 'uploads/products/fashion_category.png'),
(31, 'Makeup', 26, 'uploads/products/fashion_category.png'),
(32, 'Running Shoes', 27, 'uploads/products/slim_jeans.png'),
(33, 'T-Shirt', 28, 'uploads/products/fashion_category.png'),
(34, 'Slides', 30, 'uploads/products/slim_jeans.png'),
(35, 'Hoodie', 31, 'uploads/products/fashion_category.png'),
(36, 'Shirt', 32, 'uploads/products/fashion_category.png'),
(37, 'Shoes', 33, 'uploads/products/designer_sneakers.png'),
(38, 'Sneakers', 34, 'uploads/products/designer_sneakers.png'),
(39, 'Cap', 35, 'uploads/products/fashion_category.png'),
(40, 'Bag', 36, 'uploads/products/fashion_category.png'),
(41, 'Perfume', 37, 'uploads/products/fashion_category.png'),
(42, 'Sunglasses', 38, 'uploads/products/fashion_category.png'),
(43, 'Ring', 39, 'uploads/products/slim_jeans.png'),
(44, 'T-Shirt', 40, 'uploads/products/fashion_category.png'),
(45, 'Dress', 41, 'uploads/products/fashion_category.png'),
(46, 'Hoodie', 42, 'uploads/products/fashion_category.png'),
(47, 'Jacket', 43, 'uploads/products/fashion_category.png'),
(48, 'Kids Clothes', 44, 'uploads/products/fashion_category.png'),
(49, 'Underwear', 45, 'uploads/products/fashion_category.png'),
(50, 'Shoes', 46, 'uploads/products/designer_sneakers.png'),
(51, 'Sneakers', 47, 'uploads/products/designer_sneakers.png'),
(52, 'Sport Set', 48, 'uploads/products/fashion_category.png'),
(53, 'Shoes', 49, 'uploads/products/designer_sneakers.png'),
(54, 'Bracelet', 50, 'uploads/products/fashion_category.png'),
(55, 'Necklace', 51, 'uploads/products/fashion_category.png'),
(56, 'Kids T-Shirt', 52, 'uploads/products/fashion_category.png'),
(57, 'Shirt', 53, 'uploads/products/slim_jeans.png'),
(58, 'Shirt', 54, 'uploads/products/fashion_category.png'),
(59, 'Dress', 55, 'uploads/products/fashion_category.png'),
(60, 'T-Shirt', 56, 'uploads/products/fashion_category.png'),
(61, 'Shoes', 57, 'uploads/products/designer_sneakers.png'),
(62, 'Sneakers', 58, 'uploads/products/designer_sneakers.png'),
(63, 'Sport Shoes', 59, 'uploads/products/designer_sneakers.png'),
(64, 'Bag', 60, 'uploads/products/fashion_category.png'),
(65, 'Watch', 61, 'uploads/products/luxury_watch.png'),
(66, 'Jewelry', 62, 'uploads/products/fashion_category.png'),
(67, 'T-Shirt', 63, 'uploads/products/fashion_category.png'),
(68, 'Suitcase', 64, 'uploads/products/slim_jeans.png'),
(69, 'Shoes', 65, 'uploads/products/designer_sneakers.png'),
(70, 'Sneakers', 66, 'uploads/products/designer_sneakers.png'),
(71, 'Cap', 67, 'uploads/products/fashion_category.png'),
(72, 'Shirt', 68, 'uploads/products/fashion_category.png'),
(73, 'Bag', 69, 'uploads/categories/fashion_category.png');

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
(4, 'Slim Fit Jeans', 1, 'Small', 749.99, 'uploads/categories/slim_jeans.png'),
(5, 'Slim Fit Jeans', 1, 'Medium', 799.99, 'uploads/categories/slim_jeans.png'),
(6, 'Slim Fit Jeans', 1, 'Large', 849.99, 'uploads/categories/slim_jeans.png'),
(7, 'Slim Fit Jeans', 1, 'X-Large', 899.99, 'uploads/categories/slim_jeans.png'),
(8, 'Skinny Jeans', 1, 'Small', 779.99, 'uploads/categories/slim_jeans.png'),
(9, 'Skinny Jeans', 1, 'Medium', 829.99, 'uploads/categories/slim_jeans.png'),
(10, 'Skinny Jeans', 1, 'Large', 879.99, 'uploads/categories/slim_jeans.png'),
(11, 'Skinny Jeans', 1, 'X-Large', 929.99, 'uploads/categories/slim_jeans.png'),
(12, 'Straight Jeans', 1, 'Small', 699.99, 'uploads/categories/slim_jeans.png'),
(13, 'Straight Jeans', 1, 'Medium', 749.99, 'uploads/categories/slim_jeans.png'),
(14, 'Straight Jeans', 1, 'Large', 799.99, 'uploads/categories/slim_jeans.png'),
(15, 'Straight Jeans', 1, 'X-Large', 849.99, 'uploads/categories/slim_jeans.png'),
(16, 'Oversized T-Shirt', 2, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(17, 'Oversized T-Shirt', 2, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(18, 'Oversized T-Shirt', 2, 'Large', 499.99, 'uploads/categories/fashion_category.png'),
(19, 'Oversized T-Shirt', 2, 'X-Large', 549.99, 'uploads/categories/fashion_category.png'),
(20, 'Regular T-Shirt', 2, 'Small', 349.99, 'uploads/categories/fashion_category.png'),
(21, 'Regular T-Shirt', 2, 'Medium', 399.99, 'uploads/categories/fashion_category.png'),
(22, 'Regular T-Shirt', 2, 'Large', 449.99, 'uploads/categories/fashion_category.png'),
(23, 'Regular T-Shirt', 2, 'X-Large', 499.99, 'uploads/categories/fashion_category.png'),
(24, 'Summer Dress', 3, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(25, 'Summer Dress', 3, 'Medium', 949.99, 'uploads/categories/fashion_category.png'),
(26, 'Summer Dress', 3, 'Large', 999.99, 'uploads/categories/fashion_category.png'),
(27, 'Summer Dress', 3, 'X-Large', 1049.99, 'uploads/categories/fashion_category.png'),
(28, 'Elegant Dress', 3, 'Small', 1099.99, 'uploads/categories/fashion_category.png'),
(29, 'Elegant Dress', 3, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(30, 'Elegant Dress', 3, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(31, 'Elegant Dress', 3, 'X-Large', 1399.99, 'uploads/categories/fashion_category.png'),
(32, 'Hoodie', 4, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(33, 'Hoodie', 4, 'Medium', 749.99, 'uploads/categories/fashion_category.png'),
(34, 'Hoodie', 4, 'Large', 799.99, 'uploads/categories/fashion_category.png'),
(35, 'Hoodie', 4, 'X-Large', 849.99, 'uploads/categories/fashion_category.png'),
(36, 'Zip Hoodie', 4, 'Small', 749.99, 'uploads/categories/fashion_category.png'),
(37, 'Zip Hoodie', 4, 'Medium', 799.99, 'uploads/categories/fashion_category.png'),
(38, 'Zip Hoodie', 4, 'Large', 849.99, 'uploads/categories/fashion_category.png'),
(39, 'Zip Hoodie', 4, 'X-Large', 899.99, 'uploads/categories/fashion_category.png'),
(40, 'Jacket', 5, 'Small', 1099.99, 'uploads/categories/fashion_category.png'),
(41, 'Jacket', 5, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(42, 'Jacket', 5, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(43, 'Jacket', 5, 'X-Large', 1399.99, 'uploads/categories/fashion_category.png'),
(44, 'Winter Jacket', 5, 'Small', 1299.99, 'uploads/categories/fashion_category.png'),
(45, 'Winter Jacket', 5, 'Medium', 1399.99, 'uploads/categories/fashion_category.png'),
(46, 'Winter Jacket', 5, 'Large', 1499.99, 'uploads/categories/fashion_category.png'),
(47, 'Winter Jacket', 5, 'X-Large', 1599.99, 'uploads/categories/fashion_category.png'),
(48, 'Slim Fit Jeans', 1, 'Small', 749.99, 'uploads/categories/slim_jeans.png'),
(49, 'Slim Fit Jeans', 1, 'Medium', 799.99, 'uploads/categories/slim_jeans.png'),
(50, 'Slim Fit Jeans', 1, 'Large', 849.99, 'uploads/categories/slim_jeans.png'),
(51, 'Slim Fit Jeans', 1, 'X-Large', 899.99, 'uploads/categories/slim_jeans.png'),
(52, 'Skinny Jeans', 1, 'Small', 779.99, 'uploads/categories/slim_jeans.png'),
(53, 'Skinny Jeans', 1, 'Medium', 829.99, 'uploads/categories/slim_jeans.png'),
(54, 'Skinny Jeans', 1, 'Large', 879.99, 'uploads/categories/slim_jeans.png'),
(55, 'Skinny Jeans', 1, 'X-Large', 929.99, 'uploads/categories/slim_jeans.png'),
(56, 'Straight Jeans', 1, 'Small', 699.99, 'uploads/categories/slim_jeans.png'),
(57, 'Straight Jeans', 1, 'Medium', 749.99, 'uploads/categories/slim_jeans.png'),
(58, 'Straight Jeans', 1, 'Large', 799.99, 'uploads/categories/slim_jeans.png'),
(59, 'Straight Jeans', 1, 'X-Large', 849.99, 'uploads/categories/slim_jeans.png'),
(60, 'Oversized T-Shirt', 2, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(61, 'Oversized T-Shirt', 2, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(62, 'Oversized T-Shirt', 2, 'Large', 499.99, 'uploads/categories/fashion_category.png'),
(63, 'Oversized T-Shirt', 2, 'X-Large', 549.99, 'uploads/categories/fashion_category.png'),
(64, 'Regular T-Shirt', 2, 'Small', 349.99, 'uploads/categories/fashion_category.png'),
(65, 'Regular T-Shirt', 2, 'Medium', 399.99, 'uploads/categories/fashion_category.png'),
(66, 'Regular T-Shirt', 2, 'Large', 449.99, 'uploads/categories/fashion_category.png'),
(67, 'Regular T-Shirt', 2, 'X-Large', 499.99, 'uploads/categories/fashion_category.png'),
(68, 'Summer Dress', 3, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(69, 'Summer Dress', 3, 'Medium', 949.99, 'uploads/categories/fashion_category.png'),
(70, 'Summer Dress', 3, 'Large', 999.99, 'uploads/categories/fashion_category.png'),
(71, 'Summer Dress', 3, 'X-Large', 1049.99, 'uploads/categories/fashion_category.png'),
(72, 'Elegant Dress', 3, 'Small', 1099.99, 'uploads/categories/fashion_category.png'),
(73, 'Elegant Dress', 3, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(74, 'Elegant Dress', 3, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(75, 'Elegant Dress', 3, 'X-Large', 1399.99, 'uploads/categories/fashion_category.png'),
(76, 'Hoodie', 4, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(77, 'Hoodie', 4, 'Medium', 749.99, 'uploads/categories/fashion_category.png'),
(78, 'Hoodie', 4, 'Large', 799.99, 'uploads/categories/fashion_category.png'),
(79, 'Hoodie', 4, 'X-Large', 849.99, 'uploads/categories/fashion_category.png'),
(80, 'Zip Hoodie', 4, 'Small', 749.99, 'uploads/categories/fashion_category.png'),
(81, 'Zip Hoodie', 4, 'Medium', 799.99, 'uploads/categories/fashion_category.png'),
(82, 'Zip Hoodie', 4, 'Large', 849.99, 'uploads/categories/fashion_category.png'),
(83, 'Zip Hoodie', 4, 'X-Large', 899.99, 'uploads/categories/fashion_category.png'),
(84, 'Jacket', 5, 'Small', 1099.99, 'uploads/categories/fashion_category.png'),
(85, 'Jacket', 5, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(86, 'Jacket', 5, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(87, 'Jacket', 5, 'X-Large', 1399.99, 'uploads/categories/fashion_category.png'),
(88, 'Winter Jacket', 5, 'Small', 1299.99, 'uploads/categories/fashion_category.png'),
(89, 'Winter Jacket', 5, 'Medium', 1399.99, 'uploads/categories/fashion_category.png'),
(90, 'Winter Jacket', 5, 'Large', 1499.99, 'uploads/categories/fashion_category.png'),
(91, 'Winter Jacket', 5, 'X-Large', 1599.99, 'uploads/categories/fashion_category.png'),
(92, 'Running Shoes', 6, 'Small', 1599.99, 'uploads/categories/designer_sneakers.png'),
(93, 'Running Shoes', 6, 'Medium', 1699.99, 'uploads/categories/designer_sneakers.png'),
(94, 'Running Shoes', 6, 'Large', 1799.99, 'uploads/categories/designer_sneakers.png'),
(95, 'Running Shoes', 6, 'X-Large', 1899.99, 'uploads/categories/designer_sneakers.png'),
(96, 'Training Shoes', 6, 'Small', 1499.99, 'uploads/categories/designer_sneakers.png'),
(97, 'Training Shoes', 6, 'Medium', 1599.99, 'uploads/categories/designer_sneakers.png'),
(98, 'Training Shoes', 6, 'Large', 1699.99, 'uploads/categories/designer_sneakers.png'),
(99, 'Training Shoes', 6, 'X-Large', 1799.99, 'uploads/categories/designer_sneakers.png'),
(100, 'Sneakers', 7, 'Small', 1399.99, 'uploads/categories/designer_sneakers.png'),
(101, 'Sneakers', 7, 'Medium', 1499.99, 'uploads/categories/designer_sneakers.png'),
(102, 'Sneakers', 7, 'Large', 1599.99, 'uploads/categories/designer_sneakers.png'),
(103, 'Sneakers', 7, 'X-Large', 1699.99, 'uploads/categories/designer_sneakers.png'),
(104, 'Street Sneakers', 7, 'Small', 1499.99, 'uploads/categories/designer_sneakers.png'),
(105, 'Street Sneakers', 7, 'Medium', 1599.99, 'uploads/categories/designer_sneakers.png'),
(106, 'Street Sneakers', 7, 'Large', 1699.99, 'uploads/categories/designer_sneakers.png'),
(107, 'Street Sneakers', 7, 'X-Large', 1799.99, 'uploads/categories/designer_sneakers.png'),
(108, 'Sport Set', 8, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(109, 'Sport Set', 8, 'Medium', 1099.99, 'uploads/categories/fashion_category.png'),
(110, 'Sport Set', 8, 'Large', 1199.99, 'uploads/categories/fashion_category.png'),
(111, 'Sport Set', 8, 'X-Large', 1299.99, 'uploads/categories/fashion_category.png'),
(112, 'Handbag', 9, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(113, 'Handbag', 9, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(114, 'Handbag', 9, 'Large', 1399.99, 'uploads/categories/fashion_category.png'),
(115, 'Premium Bag', 9, 'Medium', 1599.99, 'uploads/categories/fashion_category.png'),
(116, 'Premium Bag', 9, 'Large', 1799.99, 'uploads/categories/fashion_category.png'),
(117, 'Backpack', 10, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(118, 'Backpack', 10, 'Medium', 999.99, 'uploads/categories/fashion_category.png'),
(119, 'Backpack', 10, 'Large', 1099.99, 'uploads/categories/fashion_category.png'),
(120, 'Bracelet', 11, 'Small', 2499.99, 'uploads/categories/fashion_category.png'),
(121, 'Bracelet', 11, 'Medium', 2799.99, 'uploads/categories/fashion_category.png'),
(122, 'Bracelet', 11, 'Large', 3199.99, 'uploads/categories/fashion_category.png'),
(123, 'Necklace', 12, 'Medium', 2999.99, 'uploads/categories/fashion_category.png'),
(124, 'Necklace', 12, 'Large', 3499.99, 'uploads/categories/fashion_category.png'),
(125, 'Watch', 13, 'Medium', 1999.99, 'uploads/categories/luxury_watch.png'),
(126, 'Watch', 13, 'Large', 2499.99, 'uploads/categories/luxury_watch.png'),
(127, 'Perfume', 14, 'Medium', 1499.99, 'uploads/categories/fashion_category.png'),
(128, 'Perfume', 14, 'Large', 1799.99, 'uploads/categories/fashion_category.png'),
(129, 'Sunglasses', 15, 'Medium', 999.99, 'uploads/categories/fashion_category.png'),
(130, 'Sunglasses', 15, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(131, 'Kids T-Shirt', 16, 'Small', 299.99, 'uploads/categories/fashion_category.png'),
(132, 'Kids T-Shirt', 16, 'Medium', 349.99, 'uploads/categories/fashion_category.png'),
(133, 'Kids T-Shirt', 16, 'Large', 399.99, 'uploads/categories/fashion_category.png'),
(134, 'Cotton Shirt', 17, 'Small', 499.99, 'uploads/categories/fashion_category.png'),
(135, 'Cotton Shirt', 17, 'Medium', 549.99, 'uploads/categories/fashion_category.png'),
(136, 'Cotton Shirt', 17, 'Large', 599.99, 'uploads/categories/fashion_category.png'),
(137, 'Formal Shirt', 18, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(138, 'Formal Shirt', 18, 'Medium', 749.99, 'uploads/categories/fashion_category.png'),
(139, 'Formal Shirt', 18, 'Large', 799.99, 'uploads/categories/fashion_category.png'),
(140, 'Shorts', 19, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(141, 'Shorts', 19, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(142, 'Shorts', 19, 'Large', 499.99, 'uploads/categories/fashion_category.png'),
(143, 'Polo Shirt', 20, 'Small', 599.99, 'uploads/categories/fashion_category.png'),
(144, 'Polo Shirt', 20, 'Medium', 649.99, 'uploads/categories/fashion_category.png'),
(145, 'Polo Shirt', 20, 'Large', 699.99, 'uploads/categories/fashion_category.png'),
(146, 'Cap', 21, 'Small', 199.99, 'uploads/categories/fashion_category.png'),
(147, 'Cap', 21, 'Medium', 249.99, 'uploads/categories/fashion_category.png'),
(148, 'Wallet', 22, 'Small', 299.99, 'uploads/categories/fashion_category.png'),
(149, 'Wallet', 22, 'Medium', 349.99, 'uploads/categories/fashion_category.png'),
(150, 'Belt', 23, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(151, 'Belt', 23, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(152, 'Ring', 24, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(153, 'Ring', 24, 'Medium', 1299.99, 'uploads/categories/fashion_category.png'),
(154, 'Earrings', 25, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(155, 'Earrings', 25, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(156, 'Denim Shirt', 26, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(157, 'Denim Shirt', 26, 'Medium', 749.99, 'uploads/categories/fashion_category.png'),
(158, 'Denim Shirt', 26, 'Large', 799.99, 'uploads/categories/fashion_category.png'),
(159, 'Denim Shirt', 26, 'X-Large', 849.99, 'uploads/categories/fashion_category.png'),
(160, 'Casual Shirt', 27, 'Small', 499.99, 'uploads/categories/fashion_category.png'),
(161, 'Casual Shirt', 27, 'Medium', 549.99, 'uploads/categories/fashion_category.png'),
(162, 'Casual Shirt', 27, 'Large', 599.99, 'uploads/categories/fashion_category.png'),
(163, 'Casual Shirt', 27, 'X-Large', 649.99, 'uploads/categories/fashion_category.png'),
(164, 'Formal Shirt', 28, 'Small', 799.99, 'uploads/categories/fashion_category.png'),
(165, 'Formal Shirt', 28, 'Medium', 849.99, 'uploads/categories/fashion_category.png'),
(166, 'Formal Shirt', 28, 'Large', 899.99, 'uploads/categories/fashion_category.png'),
(167, 'Formal Shirt', 28, 'X-Large', 949.99, 'uploads/categories/fashion_category.png'),
(168, 'Cargo Pants', 29, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(169, 'Cargo Pants', 29, 'Medium', 949.99, 'uploads/categories/fashion_category.png'),
(170, 'Cargo Pants', 29, 'Large', 999.99, 'uploads/categories/fashion_category.png'),
(171, 'Cargo Pants', 29, 'X-Large', 1049.99, 'uploads/categories/fashion_category.png'),
(172, 'Chino Pants', 30, 'Small', 799.99, 'uploads/categories/fashion_category.png'),
(173, 'Chino Pants', 30, 'Medium', 849.99, 'uploads/categories/fashion_category.png'),
(174, 'Chino Pants', 30, 'Large', 899.99, 'uploads/categories/fashion_category.png'),
(175, 'Chino Pants', 30, 'X-Large', 949.99, 'uploads/categories/fashion_category.png'),
(176, 'Classic Sneakers', 31, 'Small', 1399.99, 'uploads/categories/designer_sneakers.png'),
(177, 'Classic Sneakers', 31, 'Medium', 1499.99, 'uploads/categories/designer_sneakers.png'),
(178, 'Classic Sneakers', 31, 'Large', 1599.99, 'uploads/categories/designer_sneakers.png'),
(179, 'Classic Sneakers', 31, 'X-Large', 1699.99, 'uploads/categories/designer_sneakers.png'),
(180, 'Sport Running Shoes', 32, 'Small', 1599.99, 'uploads/categories/designer_sneakers.png'),
(181, 'Sport Running Shoes', 32, 'Medium', 1699.99, 'uploads/categories/designer_sneakers.png'),
(182, 'Sport Running Shoes', 32, 'Large', 1799.99, 'uploads/categories/designer_sneakers.png'),
(183, 'Sport Running Shoes', 32, 'X-Large', 1899.99, 'uploads/categories/designer_sneakers.png'),
(184, 'Basketball Shoes', 33, 'Small', 1799.99, 'uploads/categories/designer_sneakers.png'),
(185, 'Basketball Shoes', 33, 'Medium', 1899.99, 'uploads/categories/designer_sneakers.png'),
(186, 'Basketball Shoes', 33, 'Large', 1999.99, 'uploads/categories/designer_sneakers.png'),
(187, 'Basketball Shoes', 33, 'X-Large', 2199.99, 'uploads/categories/designer_sneakers.png'),
(188, 'Slides', 34, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(189, 'Slides', 34, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(190, 'Slides', 34, 'Large', 499.99, 'uploads/categories/fashion_category.png'),
(191, 'Sandals', 35, 'Small', 499.99, 'uploads/categories/fashion_category.png'),
(192, 'Sandals', 35, 'Medium', 549.99, 'uploads/categories/fashion_category.png'),
(193, 'Sandals', 35, 'Large', 599.99, 'uploads/categories/fashion_category.png'),
(194, 'Leather Bag', 36, 'Small', 1299.99, 'uploads/categories/fashion_category.png'),
(195, 'Leather Bag', 36, 'Medium', 1499.99, 'uploads/categories/fashion_category.png'),
(196, 'Leather Bag', 36, 'Large', 1699.99, 'uploads/categories/fashion_category.png'),
(197, 'Mini Bag', 37, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(198, 'Mini Bag', 37, 'Medium', 999.99, 'uploads/categories/fashion_category.png'),
(199, 'Mini Bag', 37, 'Large', 1099.99, 'uploads/categories/fashion_category.png'),
(200, 'Travel Bag', 38, 'Small', 1499.99, 'uploads/categories/fashion_category.png'),
(201, 'Travel Bag', 38, 'Medium', 1699.99, 'uploads/categories/fashion_category.png'),
(202, 'Travel Bag', 38, 'Large', 1899.99, 'uploads/categories/fashion_category.png'),
(203, 'School Backpack', 39, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(204, 'School Backpack', 39, 'Medium', 799.99, 'uploads/categories/fashion_category.png'),
(205, 'School Backpack', 39, 'Large', 899.99, 'uploads/categories/fashion_category.png'),
(206, 'Laptop Bag', 40, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(207, 'Laptop Bag', 40, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(208, 'Laptop Bag', 40, 'Large', 1399.99, 'uploads/categories/fashion_category.png'),
(209, 'Luxury Bracelet', 41, 'Small', 2499.99, 'uploads/categories/fashion_category.png'),
(210, 'Luxury Bracelet', 41, 'Medium', 2799.99, 'uploads/categories/fashion_category.png'),
(211, 'Luxury Bracelet', 41, 'Large', 3199.99, 'uploads/categories/fashion_category.png'),
(212, 'Gold Necklace', 42, 'Small', 2999.99, 'uploads/categories/fashion_category.png'),
(213, 'Gold Necklace', 42, 'Medium', 3399.99, 'uploads/categories/fashion_category.png'),
(214, 'Gold Necklace', 42, 'Large', 3799.99, 'uploads/categories/fashion_category.png'),
(215, 'Silver Ring', 43, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(216, 'Silver Ring', 43, 'Medium', 1299.99, 'uploads/categories/fashion_category.png'),
(217, 'Silver Ring', 43, 'Large', 1599.99, 'uploads/categories/fashion_category.png'),
(218, 'Earrings Set', 44, 'Small', 899.99, 'uploads/categories/fashion_category.png'),
(219, 'Earrings Set', 44, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(220, 'Earrings Set', 44, 'Large', 1499.99, 'uploads/categories/fashion_category.png'),
(221, 'Luxury Watch', 45, 'Medium', 1999.99, 'uploads/categories/luxury_watch.png'),
(222, 'Luxury Watch', 45, 'Large', 2499.99, 'uploads/categories/luxury_watch.png'),
(223, 'Men Perfume', 46, 'Small', 1299.99, 'uploads/categories/fashion_category.png'),
(224, 'Men Perfume', 46, 'Medium', 1599.99, 'uploads/categories/fashion_category.png'),
(225, 'Men Perfume', 46, 'Large', 1899.99, 'uploads/categories/fashion_category.png'),
(226, 'Women Perfume', 47, 'Small', 1399.99, 'uploads/categories/fashion_category.png'),
(227, 'Women Perfume', 47, 'Medium', 1699.99, 'uploads/categories/fashion_category.png'),
(228, 'Women Perfume', 47, 'Large', 1999.99, 'uploads/categories/fashion_category.png'),
(229, 'Body Spray', 48, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(230, 'Body Spray', 48, 'Medium', 499.99, 'uploads/categories/fashion_category.png'),
(231, 'Body Spray', 48, 'Large', 599.99, 'uploads/categories/fashion_category.png'),
(232, 'Sunglasses Premium', 49, 'Medium', 999.99, 'uploads/categories/fashion_category.png'),
(233, 'Sunglasses Premium', 49, 'Large', 1299.99, 'uploads/categories/fashion_category.png'),
(234, 'Sports Cap', 50, 'Small', 199.99, 'uploads/categories/fashion_category.png'),
(235, 'Sports Cap', 50, 'Medium', 249.99, 'uploads/categories/fashion_category.png'),
(236, 'Sports Cap', 50, 'Large', 299.99, 'uploads/categories/fashion_category.png'),
(237, 'Sports Cap', 51, 'Small', 199.99, 'uploads/categories/fashion_category.png'),
(238, 'Sports Cap', 51, 'Medium', 249.99, 'uploads/categories/fashion_category.png'),
(239, 'Sports Cap', 51, 'Large', 299.99, 'uploads/categories/fashion_category.png'),
(240, 'Beanie Hat', 52, 'Small', 299.99, 'uploads/categories/fashion_category.png'),
(241, 'Beanie Hat', 52, 'Medium', 349.99, 'uploads/categories/fashion_category.png'),
(242, 'Beanie Hat', 52, 'Large', 399.99, 'uploads/categories/fashion_category.png'),
(243, 'Leather Belt', 53, 'Small', 399.99, 'uploads/categories/fashion_category.png'),
(244, 'Leather Belt', 53, 'Medium', 449.99, 'uploads/categories/fashion_category.png'),
(245, 'Leather Belt', 53, 'Large', 499.99, 'uploads/categories/fashion_category.png'),
(246, 'Wallet Classic', 54, 'Small', 299.99, 'uploads/categories/fashion_category.png'),
(247, 'Wallet Classic', 54, 'Medium', 349.99, 'uploads/categories/fashion_category.png'),
(248, 'Wallet Classic', 54, 'Large', 399.99, 'uploads/categories/fashion_category.png'),
(249, 'Card Holder', 55, 'Small', 199.99, 'uploads/categories/fashion_category.png'),
(250, 'Card Holder', 55, 'Medium', 249.99, 'uploads/categories/fashion_category.png'),
(251, 'Card Holder', 55, 'Large', 299.99, 'uploads/categories/fashion_category.png'),
(252, 'Graphic T-Shirt', 56, 'Small', 349.99, 'uploads/categories/fashion_category.png'),
(253, 'Graphic T-Shirt', 56, 'Medium', 399.99, 'uploads/categories/fashion_category.png'),
(254, 'Graphic T-Shirt', 56, 'Large', 449.99, 'uploads/categories/fashion_category.png'),
(255, 'Graphic T-Shirt', 56, 'X-Large', 499.99, 'uploads/categories/fashion_category.png'),
(256, 'Striped Shirt', 57, 'Small', 499.99, 'uploads/categories/fashion_category.png'),
(257, 'Striped Shirt', 57, 'Medium', 549.99, 'uploads/categories/fashion_category.png'),
(258, 'Striped Shirt', 57, 'Large', 599.99, 'uploads/categories/fashion_category.png'),
(259, 'Striped Shirt', 57, 'X-Large', 649.99, 'uploads/categories/fashion_category.png'),
(260, 'Linen Shirt', 58, 'Small', 699.99, 'uploads/categories/fashion_category.png'),
(261, 'Linen Shirt', 58, 'Medium', 749.99, 'uploads/categories/fashion_category.png'),
(262, 'Linen Shirt', 58, 'Large', 799.99, 'uploads/categories/fashion_category.png'),
(263, 'Linen Shirt', 58, 'X-Large', 849.99, 'uploads/categories/fashion_category.png'),
(264, 'Sweatpants', 59, 'Small', 599.99, 'uploads/categories/fashion_category.png'),
(265, 'Sweatpants', 59, 'Medium', 649.99, 'uploads/categories/fashion_category.png'),
(266, 'Sweatpants', 59, 'Large', 699.99, 'uploads/categories/fashion_category.png'),
(267, 'Sweatpants', 59, 'X-Large', 749.99, 'uploads/categories/fashion_category.png'),
(268, 'Jogger Pants', 60, 'Small', 649.99, 'uploads/categories/fashion_category.png'),
(269, 'Jogger Pants', 60, 'Medium', 699.99, 'uploads/categories/fashion_category.png'),
(270, 'Jogger Pants', 60, 'Large', 749.99, 'uploads/categories/fashion_category.png'),
(271, 'Jogger Pants', 60, 'X-Large', 799.99, 'uploads/categories/fashion_category.png'),
(272, 'Street Sneakers', 61, 'Small', 1499.99, 'uploads/categories/designer_sneakers.png'),
(273, 'Street Sneakers', 61, 'Medium', 1599.99, 'uploads/categories/designer_sneakers.png'),
(274, 'Street Sneakers', 61, 'Large', 1699.99, 'uploads/categories/designer_sneakers.png'),
(275, 'Street Sneakers', 61, 'X-Large', 1799.99, 'uploads/categories/designer_sneakers.png'),
(276, 'Premium Sneakers', 62, 'Small', 1799.99, 'uploads/categories/designer_sneakers.png'),
(277, 'Premium Sneakers', 62, 'Medium', 1899.99, 'uploads/categories/designer_sneakers.png'),
(278, 'Premium Sneakers', 62, 'Large', 1999.99, 'uploads/categories/designer_sneakers.png'),
(279, 'Premium Sneakers', 62, 'X-Large', 2199.99, 'uploads/categories/designer_sneakers.png'),
(280, 'Slip-on Shoes', 63, 'Small', 899.99, 'uploads/categories/designer_sneakers.png'),
(281, 'Slip-on Shoes', 63, 'Medium', 999.99, 'uploads/categories/designer_sneakers.png'),
(282, 'Slip-on Shoes', 63, 'Large', 1099.99, 'uploads/categories/designer_sneakers.png'),
(283, 'Formal Shoes', 64, 'Small', 1299.99, 'uploads/categories/designer_sneakers.png'),
(284, 'Formal Shoes', 64, 'Medium', 1399.99, 'uploads/categories/designer_sneakers.png'),
(285, 'Formal Shoes', 64, 'Large', 1499.99, 'uploads/categories/designer_sneakers.png'),
(286, 'Formal Shoes', 64, 'X-Large', 1599.99, 'uploads/categories/designer_sneakers.png'),
(287, 'Running Pro Shoes', 65, 'Small', 1899.99, 'uploads/categories/designer_sneakers.png'),
(288, 'Running Pro Shoes', 65, 'Medium', 1999.99, 'uploads/categories/designer_sneakers.png'),
(289, 'Running Pro Shoes', 65, 'Large', 2199.99, 'uploads/categories/designer_sneakers.png'),
(290, 'Running Pro Shoes', 65, 'X-Large', 2399.99, 'uploads/categories/designer_sneakers.png'),
(291, 'Mini Backpack', 66, 'Small', 799.99, 'uploads/categories/fashion_category.png'),
(292, 'Mini Backpack', 66, 'Medium', 899.99, 'uploads/categories/fashion_category.png'),
(293, 'Mini Backpack', 66, 'Large', 999.99, 'uploads/categories/fashion_category.png'),
(294, 'Leather Handbag', 67, 'Small', 1399.99, 'uploads/categories/fashion_category.png'),
(295, 'Leather Handbag', 67, 'Medium', 1599.99, 'uploads/categories/fashion_category.png'),
(296, 'Leather Handbag', 67, 'Large', 1799.99, 'uploads/categories/fashion_category.png'),
(297, 'Travel Suitcase', 68, 'Small', 1999.99, 'uploads/categories/fashion_category.png'),
(298, 'Travel Suitcase', 68, 'Medium', 2299.99, 'uploads/categories/fashion_category.png'),
(299, 'Travel Suitcase', 68, 'Large', 2599.99, 'uploads/categories/fashion_category.png'),
(300, 'Laptop Backpack Pro', 69, 'Small', 999.99, 'uploads/categories/fashion_category.png'),
(301, 'Laptop Backpack Pro', 69, 'Medium', 1199.99, 'uploads/categories/fashion_category.png'),
(302, 'Laptop Backpack Pro', 69, 'Large', 1399.99, 'uploads/categories/fashion_category.png'),
(303, 'Luxury Bracelet Gold', 70, 'Small', 2999.99, 'uploads/categories/fashion_category.png'),
(304, 'Luxury Bracelet Gold', 70, 'Medium', 3299.99, 'uploads/categories/fashion_category.png'),
(305, 'Luxury Bracelet Gold', 70, 'Large', 3599.99, 'uploads/categories/fashion_category.png'),
(306, 'Diamond Necklace', 71, 'Small', 3499.99, 'uploads/categories/fashion_category.png'),
(307, 'Diamond Necklace', 71, 'Medium', 3799.99, 'uploads/categories/fashion_category.png'),
(308, 'Diamond Necklace', 71, 'Large', 4199.99, 'uploads/categories/fashion_category.png'),
(309, 'Premium Watch Gold', 72, 'Medium', 2499.99, 'uploads/categories/luxury_watch.png'),
(310, 'Premium Watch Gold', 72, 'Large', 2999.99, 'uploads/categories/luxury_watch.png'),
(311, 'Exclusive Sunglasses', 73, 'Medium', 1299.99, 'uploads/categories/fashion_category.png'),
(312, 'Exclusive Sunglasses', 73, 'Large', 1599.99, 'uploads/categories/fashion_category.png');

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
(1, 1599.98, 1),
(2, 599.99, 2),
(3, 599.99, 3),
(4, 599.99, 4),
(5, 319.99, 5),
(6, 779.99, 6),
(7, 1049.98, 7),
(8, 559.99, 8),
(9, 1159.98, 9),
(10, 1159.98, 10),
(11, 1239.98, 11),
(12, 949.98, 12),
(13, 999.98, 13),
(14, 779.99, 14),
(15, 929.99, 15),
(16, 549.99, 16);

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
  `brand_tier` enum('local','high-end','mid-tier') NOT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`store_id`, `store_location`, `store_name`, `image_url`, `user_id`, `brand_tier`, `entry_date`) VALUES
(1, 'Level 2 (Second Floor)', 'Zara', 'uploads/stores/zara.png', 15, 'mid-tier', '2026-01-12 19:04:04'),
(2, 'Level 2 (Second Floor)', 'H&M', 'uploads/stores/hm.png', 16, 'mid-tier', '2026-01-14 07:57:03'),
(3, 'Level 2 (Second Floor)', 'Mango', 'uploads/stores/mango.png', 17, 'mid-tier', '2026-01-01 23:33:01'),
(4, 'Level 2 (Second Floor)', 'Bershka', 'uploads/stores/bershka.png', 18, 'mid-tier', '2026-01-25 14:53:59'),
(5, 'Level 2 (Second Floor)', 'Pull & Bear', 'uploads/stores/fashion1.png', 19, 'mid-tier', '2026-01-30 20:50:53'),
(6, 'Level 2 (Second Floor)', 'Stradivarius', 'uploads/stores/fashion2.png', 20, 'mid-tier', '2026-01-16 04:32:27'),
(7, 'Level 2 (Second Floor)', 'Massimo Dutti', 'uploads/stores/fashion3.png', 21, 'high-end', '2026-01-17 01:09:38'),
(8, 'Level 1 (First Floor)', 'Nike', 'uploads/stores/nike.png', 22, 'mid-tier', '2026-01-05 09:10:48'),
(9, 'Level 1 (First Floor)', 'Adidas', 'uploads/stores/adidas.png', 23, 'mid-tier', '2026-01-04 11:25:06'),
(10, 'Level 1 (First Floor)', 'Puma', 'uploads/stores/sports1.png', 24, 'mid-tier', '2026-01-04 22:33:09'),
(11, 'Level 2 (Second Floor)', 'Aldo', 'uploads/stores/aldo.png', 25, 'mid-tier', '2026-01-09 23:30:28'),
(12, 'Level 2 (Second Floor)', 'Charles & Keith', 'uploads/stores/shoes1.png', 26, 'mid-tier', '2026-01-03 18:52:54'),
(13, 'Level 2 (Second Floor)', 'Pandora', 'uploads/stores/pandora.png', 27, 'high-end', '2026-01-17 16:53:04'),
(14, 'Level 2 (Second Floor)', 'Swarovski', 'uploads/stores/jewelry1.png', 28, 'high-end', '2026-01-15 20:46:39'),
(15, 'Level 1 (First Floor)', 'Zara', 'uploads/stores/zara.png', 29, 'mid-tier', '2026-01-24 22:14:02'),
(16, 'Level 1 (First Floor)', 'H&M', 'uploads/stores/hm.png', 30, 'mid-tier', '2026-01-15 17:50:15'),
(17, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 31, 'local', '2026-01-02 15:29:10'),
(18, 'Level 1 (First Floor)', 'Bershka', 'uploads/stores/bershka.png', 32, 'mid-tier', '2026-01-24 16:55:06'),
(19, 'Level 1 (First Floor)', 'Pull & Bear', 'uploads/stores/fashion4.png', 33, 'mid-tier', '2026-01-24 07:07:58'),
(20, 'Ground Floor', 'Defacto', 'uploads/stores/fashion1.png', 34, 'local', '2026-01-16 01:54:34'),
(21, 'Level 1 (First Floor)', 'Nike', 'uploads/stores/nike.png', 35, 'mid-tier', '2026-01-06 05:08:57'),
(22, 'Level 1 (First Floor)', 'Adidas', 'uploads/stores/adidas.png', 36, 'mid-tier', '2026-01-11 13:01:02'),
(23, 'Level 1 (First Floor)', 'Under Armour', 'uploads/stores/sports1.png', 37, 'mid-tier', '2026-01-07 18:38:20'),
(24, 'Ground Floor', 'Skechers', 'uploads/stores/sports1.png', 38, 'mid-tier', '2026-01-02 23:08:34'),
(25, 'Level 1 (First Floor)', 'Aldo', 'uploads/stores/aldo.png', 39, 'mid-tier', '2026-01-20 04:47:50'),
(26, 'Ground Floor', 'Faces', 'uploads/stores/tech1.png', 40, 'high-end', '2026-01-30 19:33:28'),
(27, 'Ground Floor', 'Zara', 'uploads/stores/zara.png', 41, 'mid-tier', '2026-01-02 04:23:53'),
(28, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 42, 'mid-tier', '2026-01-07 04:19:00'),
(29, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 43, 'local', '2026-01-28 01:23:21'),
(30, 'Ground Floor', 'Bershka', 'uploads/stores/bershka.png', 44, 'mid-tier', '2026-01-27 10:59:44'),
(31, 'Ground Floor', 'Pull & Bear', 'uploads/stores/fashion2.png', 45, 'mid-tier', '2026-01-21 19:48:41'),
(32, 'Ground Floor', 'American Eagle', 'uploads/stores/fashion3.png', 46, 'mid-tier', '2026-01-25 11:04:12'),
(33, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 47, 'mid-tier', '2026-01-30 12:54:57'),
(34, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 48, 'mid-tier', '2026-01-15 00:22:11'),
(35, 'Ground Floor', 'Puma', 'uploads/stores/sports1.png', 49, 'mid-tier', '2026-01-12 04:06:03'),
(36, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 50, 'mid-tier', '2026-01-14 12:23:43'),
(37, 'Ground Floor', 'Pandora', 'uploads/stores/pandora.png', 51, 'high-end', '2026-01-04 18:40:28'),
(38, 'Ground Floor', 'Sunglass Hut', 'uploads/stores/jewelry1.png', 52, 'high-end', '2026-01-09 01:11:09'),
(39, 'Level 2 (Second Floor)', 'Zara', 'uploads/stores/zara.png', 53, 'mid-tier', '2026-01-29 14:54:24'),
(40, 'Level 2 (Second Floor)', 'H&M', 'uploads/stores/hm.png', 54, 'mid-tier', '2026-01-29 15:58:32'),
(41, 'Level 2 (Second Floor)', 'Mango', 'uploads/stores/mango.png', 55, 'mid-tier', '2026-01-28 04:09:31'),
(42, 'Level 2 (Second Floor)', 'Bershka', 'uploads/stores/bershka.png', 56, 'mid-tier', '2026-01-20 13:51:59'),
(43, 'Level 2 (Second Floor)', 'Pull & Bear', 'uploads/stores/fashion4.png', 57, 'mid-tier', '2026-01-17 01:51:23'),
(44, 'Level 1 (First Floor)', 'LC Waikiki', 'uploads/stores/waikiki.png', 58, 'local', '2026-01-22 08:40:58'),
(45, 'Level 1 (First Floor)', 'Cottonil', 'uploads/stores/fashion1.png', 59, 'local', '2026-01-29 06:50:42'),
(46, 'Level 2 (Second Floor)', 'Nike', 'uploads/stores/nike.png', 60, 'mid-tier', '2026-01-18 01:10:38'),
(47, 'Level 2 (Second Floor)', 'Adidas', 'uploads/stores/adidas.png', 61, 'mid-tier', '2026-01-31 02:21:04'),
(48, 'Level 2 (Second Floor)', 'Reebok', 'uploads/stores/sports1.png', 62, 'mid-tier', '2026-01-10 01:13:26'),
(49, 'Level 1 (First Floor)', 'Aldo', 'uploads/stores/aldo.png', 63, 'mid-tier', '2026-01-15 16:03:57'),
(50, 'Level 2 (Second Floor)', 'Pandora', 'uploads/stores/pandora.png', 64, 'high-end', '2026-01-16 21:39:27'),
(51, 'Level 2 (Second Floor)', 'Swarovski', 'uploads/stores/jewelry1.png', 65, 'high-end', '2026-01-06 05:05:25'),
(52, 'Level 1 (First Floor)', 'Claire’s', 'uploads/stores/jewelry1.png', 66, 'local', '2026-01-09 01:28:44'),
(53, 'Ground Floor', 'Zara', 'uploads/stores/zara.png', 67, 'mid-tier', '2026-01-25 09:07:25'),
(54, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 68, 'mid-tier', '2026-01-08 10:10:56'),
(55, 'First Floor', 'Mango', 'uploads/stores/mango.png', 69, 'mid-tier', '2026-01-24 16:32:23'),
(56, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 70, 'local', '2026-01-06 21:09:08'),
(57, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 71, 'mid-tier', '2026-01-19 01:08:32'),
(58, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 72, 'mid-tier', '2026-01-13 07:15:15'),
(59, 'Ground Floor', 'Skechers', 'uploads/stores/sports1.png', 73, 'mid-tier', '2026-01-08 01:50:39'),
(60, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 74, 'mid-tier', '2026-01-29 04:27:33'),
(61, 'Ground Floor', 'Charles & Keith', 'uploads/stores/shoes1.png', 75, 'mid-tier', '2026-01-30 09:45:46'),
(62, 'Ground Floor', 'Pandora', 'uploads/stores/pandora.png', 76, 'high-end', '2026-01-03 04:26:14'),
(63, 'Ground Floor', 'H&M', 'uploads/stores/hm.png', 77, 'mid-tier', '2026-01-13 09:53:51'),
(64, 'Ground Floor', 'LC Waikiki', 'uploads/stores/waikiki.png', 78, 'local', '2026-01-26 05:10:32'),
(65, 'Ground Floor', 'American Eagle', 'uploads/stores/fashion2.png', 79, 'mid-tier', '2026-01-29 13:11:09'),
(66, 'Ground Floor', 'Cottonil', 'uploads/stores/fashion3.png', 80, 'local', '2026-01-07 19:24:09'),
(67, 'Ground Floor', 'Nike', 'uploads/stores/nike.png', 81, 'mid-tier', '2026-05-08 22:02:11'),
(68, 'Ground Floor', 'Adidas', 'uploads/stores/adidas.png', 82, 'mid-tier', '2026-05-08 22:02:11'),
(69, 'Ground Floor', 'Aldo', 'uploads/stores/aldo.png', 83, 'mid-tier', '2026-05-08 22:02:11'),
(73, NULL, 'adidas cfc', NULL, 91, '', '2026-05-09 22:04:39');

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
  `invite_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_admin_register`
--

INSERT INTO `store_admin_register` (`store_register_id`, `user_id`, `commercial_license`, `identification_document`, `status`, `created_at`, `invite_code`) VALUES
(3, 91, 'uploads/admin_requests/1778364279288-H & M mall of egypt.png', 'uploads/admin_requests/1778364279296-H & M mall of egypt.png', 'approved', '2026-05-09 22:04:39', 'SA_NC6WYM');

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
(69, 6, 'approved'),
(73, 1, 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_type` enum('free','premium') DEFAULT 'free',
  `status` enum('active','expired') DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `search_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`subscription_id`, `user_id`, `plan_type`, `status`, `start_date`, `end_date`, `search_count`) VALUES
(2, 11, 'premium', 'active', '2026-05-10', '2026-06-10', 5),
(3, 84, 'free', 'active', '2026-05-10', '2026-06-10', 2),
(4, 94, 'free', 'active', '2026-05-24', NULL, 0),
(5, 95, 'free', 'active', '2026-05-24', NULL, 0),
(6, 96, 'free', 'active', '2026-05-24', NULL, 0),
(7, 97, 'free', 'active', '2026-05-24', NULL, 0),
(8, 98, 'premium', 'active', '2026-05-25', '2027-05-25', 3),
(9, 99, 'premium', 'active', '2026-05-25', '2026-06-25', 5);

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
(5, 'cairo festival city', '123456', '', NULL, 'hamza@gmail.com', 'ADM001', 0, NULL, 'mall_admin'),
(8, 'Mall of egypt', '123456', '', NULL, 'ttalm56923@minitts.net', 'ADM002', 0, NULL, 'mall_admin'),
(10, 'Mall of arabia', '123456', '', NULL, 'naehp32711@minitts.net', 'ADM003', 0, NULL, 'mall_admin'),
(11, 'gamila', '123456', 'female', '2006-01-12', 'gamila@gmail.com', 'GA341', 1014, NULL, 'user'),
(12, 'city center almaza', '123456', '', NULL, 'bgxqs56448@minitts.net', 'ADM004', 0, NULL, 'mall_admin'),
(13, 'City stars', '123456', '', NULL, 'kojlg55348@minitts.net', 'ADM005', 0, NULL, 'mall_admin'),
(14, 'City center maadi', '123456', NULL, NULL, 'mahmoud@gmail.com', 'ADM006', 0, NULL, 'mall_admin'),
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
(83, 'Aldo Maadi', '123456', NULL, NULL, 'aldo.maadi@mallify.com', 'SAD069', 0, NULL, 'store_admin'),
(84, 'ali', '123456', 'male', '2009-02-12', 'ali@gmail.com', 'AL377', 50, NULL, 'user'),
(91, 'adidas cfc', '123456', '', NULL, 'pekar65421@minitts.net', 'SA_NC6WYM', 0, NULL, 'user'),
(94, 'khaled', '123456', 'male', '2007-10-17', 'khaled@gmail.com', 'KH787', 0, NULL, 'user'),
(95, 'Ahmed hany', '8pRtvhMoYbM2cbH9JWUHEtMFGCf2', 'male', NULL, 'ahmedmohamedhany451@gmail.com', 'AH343', 0, NULL, 'user'),
(96, 'Omar Raslan', '1mC4GtGJIgcOx2D4cu36PMyh81a2', 'male', NULL, 'omarayman.oa999@gmail.com', 'OM793', 0, NULL, 'user'),
(97, 'Ahmed Hany', 'e8fmaUxKWrRQKRXbQ91nikMYtfI3', 'male', NULL, 'fb_e8fmauxkwrrqkrxbq91nikmytfi3@mallify.com', 'AH957', 0, NULL, 'user'),
(98, 'Omar Raslan', 'moQQZ3ozujSh6MYefrpMNxwvgbB3', 'male', NULL, 'omarraslan660@gmail.com', 'OM521', 46, NULL, 'user'),
(99, 'Mohanad Mostafa', '7VkrGDYSuPQ7TtSy0NF39yp26yW2', 'male', NULL, 'hondamostafa176@gmail.com', 'MO236', 27, 'uploads/avatars/avatar-1779739395260.jpg', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `user_request`
--

CREATE TABLE `user_request` (
  `request_id` int(11) NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_request`
--

INSERT INTO `user_request` (`request_id`, `budget`, `user_id`, `published_at`) VALUES
(1, 2000.00, 11, '2026-05-08 22:02:11'),
(2, 1000.00, 11, '2026-05-08 22:02:11'),
(3, 650.00, 11, '2026-05-08 22:02:11'),
(4, 650.00, 11, '2026-05-08 22:02:11'),
(5, 1000.00, 11, '2026-05-08 22:30:58'),
(6, 1000.00, 11, '2026-05-10 04:04:39'),
(7, 6500.00, 11, '2026-05-17 03:57:43'),
(8, 600.00, 11, '2026-05-23 18:41:46'),
(9, 5000.00, 11, '2026-05-23 18:43:39'),
(10, 4790.00, 11, '2026-05-23 18:44:27'),
(11, 3000.00, 11, '2026-05-23 19:17:18'),
(12, 1000.00, 11, '2026-05-23 19:44:45'),
(13, 2000.00, 84, '2026-05-23 20:23:46'),
(14, 1000.00, 11, '2026-05-25 15:53:48'),
(15, 25000000.00, 98, '2026-05-25 18:58:01'),
(16, 6000.00, 99, '2026-05-25 20:02:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_request_storage`
--

CREATE TABLE `user_request_storage` (
  `storage_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `product_category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_request_storage`
--

INSERT INTO `user_request_storage` (`storage_id`, `request_id`, `product_id`, `store_id`, `product_category_id`) VALUES
(1, 1, 1, 1, 56),
(2, 1, 3, 2, 24),
(3, 2, 20, 16, 143),
(4, 3, 1, 1, 4),
(5, 4, 1, 1, 4),
(6, 5, 2, 1, 21),
(7, 6, 1, 1, 8),
(8, 7, 1, 1, 56),
(9, 7, 16, 13, 132),
(10, 8, 1, 1, 56),
(11, 9, 1, 1, 56),
(12, 10, 1, 1, 56),
(13, 11, 1, 1, 12),
(14, 11, 1, 1, 6),
(15, 12, 1, 1, 48),
(16, 12, 2, 1, 20),
(17, 13, 2, 1, 16),
(18, 13, 1, 1, 4),
(19, 14, 1, 1, 8),
(20, 15, 1, 1, 11),
(21, 16, 2, 1, 19);

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
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `subscription_id` (`subscription_id`);

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
  ADD PRIMARY KEY (`storage_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `product_category_id` (`product_category_id`),
  ADD KEY `idx_request_id` (`request_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `discount`
--
ALTER TABLE `discount`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `discount_target`
--
ALTER TABLE `discount_target`
  MODIFY `discount_target_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `mall`
--
ALTER TABLE `mall`
  MODIFY `mall_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mall_admin_register`
--
ALTER TABLE `mall_admin_register`
  MODIFY `mall_register_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `product_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=315;

--
-- AUTO_INCREMENT for table `result`
--
ALTER TABLE `result`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `store_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `store_admin_register`
--
ALTER TABLE `store_admin_register`
  MODIFY `store_register_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `user_request`
--
ALTER TABLE `user_request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_request_storage`
--
ALTER TABLE `user_request_storage`
  MODIFY `storage_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`subscription_id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_urs_category` FOREIGN KEY (`product_category_id`) REFERENCES `product_category` (`product_category_id`) ON DELETE SET NULL,
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
