-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 28, 2023 at 06:50 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_group_product`
--

CREATE TABLE `tb_group_product` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_group_product`
--

INSERT INTO `tb_group_product` (`id`, `name`) VALUES
(2, 'ເຄື່ອງດື່ມ'),
(3, 'ເຄື່ອງສຳອາງ'),
(5, 'ເສື້ອຜ້າຜູ້ຍິງ'),
(6, 'ເຄື່ອງປະດັບຜູ້ຍິງ'),
(7, 'ກາເຟ'),
(8, 'ຫູຟັງ');

-- --------------------------------------------------------

--
-- Table structure for table `tb_order`
--

CREATE TABLE `tb_order` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_date` datetime NOT NULL,
  `pay_date` datetime DEFAULT NULL,
  `pay_remark` varchar(50) DEFAULT NULL,
  `send_date` datetime DEFAULT NULL,
  `track_name` varchar(255) DEFAULT NULL,
  `track_code` varchar(30) DEFAULT NULL,
  `send_remark` varchar(1000) DEFAULT NULL,
  `pay_img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_order`
--

INSERT INTO `tb_order` (`id`, `name`, `address`, `phone`, `status`, `created_date`, `pay_date`, `pay_remark`, `send_date`, `track_name`, `track_code`, `send_remark`, `pay_img`) VALUES
(20, 'Souliya Pakse', 'Bangkok', '91876217', 'ຈັດສົ່ງແລ້ວ', '2023-09-11 16:01:33', '2023-09-10 00:00:00', '', '2023-09-11 00:00:00', 'HoungAloun', '1234', '', ''),
(24, 'jay', 'pakse', '96688643', 'ຈັດສົ່ງແລ້ວ', '2023-09-12 10:50:15', '2023-09-12 00:00:00', '', '2023-09-13 00:00:00', 'HoungAloun', 'PHA545265', '', ''),
(26, 'mina', 'nasiow', '77755430', 'ຈັດສົ່ງແລ້ວ', '2023-09-14 10:40:42', '2023-09-14 00:00:00', '', '2023-09-14 00:00:00', 'ອານຸສິດ', 'ANS123456', '', ''),
(27, 'ສຸກຈິນດາ', 'ໜອງທາ', '98489705', 'ຈັດສົ່ງແລ້ວ', '2023-09-14 10:53:18', '2023-09-14 00:00:00', '', '2023-09-14 00:00:00', 'ອານຸສິດ ສາຂາໜອງທາ', 'ANU45621', '', ''),
(34, 'ມິມີ່', 'ສີໄຄ', '98632140', 'ຈັດສົ່ງແລ້ວ', '2023-09-14 16:45:05', '2023-09-14 00:00:00', '', '2023-09-16 00:00:00', 'ຮຸ່ງອາລຸນ', 'TRK61385', '', 'WhatsApp Image 2023-08-17 at 15.08.16.jpeg'),
(39, 'ມາລາ', 'ຫ້ວຍຫົງ', '98745320', 'ຈັດສົ່ງແລ້ວ', '2023-09-15 13:07:58', '2023-09-15 00:00:00', '', '2023-09-16 00:00:00', 'ຮຸ່ງອາລຸນ', 'TRK54151', '', 'WhatsApp Image 2023-08-17 at 15.08.16.jpeg'),
(64, 'ສຸນີ', 'ສີໄຄ', '98562310', 'ຈັດສົ່ງແລ້ວ', '2023-09-15 14:54:57', '2023-09-15 00:00:00', '', '2023-09-16 00:00:00', 'ຮຸ່ງອາລຸນ', 'TRK54515', '', 'WhatsApp Image 2023-08-17 at 15.08.16.jpeg'),
(65, 'ນາງນ້ອຍ', 'ຮຸ່ງອາລຸນ ໂພນປ່າເປົ້າ', '97621234', 'ຈ່າຍແລ້ວ', '2023-09-16 15:12:19', '2023-09-16 00:00:00', '', NULL, NULL, NULL, NULL, 'WhatsApp Image 2023-08-17 at 15.08.16.jpeg'),
(66, 'jay', 'vt', '98745614', 'ຈັດສົ່ງແລ້ວ', '2023-09-22 15:56:33', '2023-09-22 00:00:00', '', '2023-09-22 00:00:00', 'HoungAloun', 'PHA545265', '', 'WhatsApp Image 2023-08-17 at 15.08.16.jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `tb_order_detail`
--

CREATE TABLE `tb_order_detail` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(5) NOT NULL,
  `price` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_order_detail`
--

INSERT INTO `tb_order_detail` (`id`, `order_id`, `product_id`, `qty`, `price`) VALUES
(1, 16, 9, 1, 80000),
(2, 16, 8, 1, 900000),
(3, 17, 7, 3, 45000),
(4, 17, 6, 2, 80000),
(8, 20, 7, 1, 45000),
(14, 24, 9, 5, 80000),
(15, 24, 8, 1, 900000),
(16, 25, 9, 1, 80000),
(17, 26, 9, 1, 80000),
(18, 27, 7, 1, 45000),
(19, 34, 6, 1, 80000),
(24, 39, 8, 1, 900000),
(48, 64, 6, 1, 80000),
(49, 65, 11, 1, 850000),
(50, 66, 13, 2, 90000),
(51, 66, 6, 1, 80000);

-- --------------------------------------------------------

--
-- Table structure for table `tb_post`
--

CREATE TABLE `tb_post` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(30) NOT NULL,
  `address` text DEFAULT NULL,
  `contact` varchar(50) NOT NULL,
  `detail` text DEFAULT NULL,
  `img` varchar(255) NOT NULL,
  `post_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_post`
--

INSERT INTO `tb_post` (`id`, `name`, `price`, `address`, `contact`, `detail`, `img`, `post_by`) VALUES
(4, 'ໂມງ Patek Philip', 750000000, 'ສີດຳດວນ ນະຄອນຫຼວງ', '98456123', 'ປ່ອຍອອກຍ້ອນບໍ່ໄດ້ໃຊ້ມີຫຼາຍອັນແລ້ວນະຈ່ະະະ', 'patek-5970r-02.jpg', 1),
(5, 'ແຫວນມໍລະດົກ', 40000000, 'ນາສຽວ ນະຄອນຫຼວງ', '91562013', 'ແຫວນມໍລະດົກຕົກທອດຈາກແມ່ ຂາຍກິນຍ້ອນບໍ່ມີເງີນ', 'IMG_9199.JPG', 2),
(7, 'cafe', 545, 'oihoi', '651651', 'iuguij', '3135fba692ae1f0ebbd9881faf42afa2.jpg', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tb_product`
--

CREATE TABLE `tb_product` (
  `id` int(11) NOT NULL,
  `group_product_id` int(11) NOT NULL,
  `barcode` varchar(30) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(15) NOT NULL,
  `cost` int(15) NOT NULL,
  `img` varchar(255) NOT NULL,
  `stock_qty` int(5) DEFAULT NULL,
  `detail` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_product`
--

INSERT INTO `tb_product` (`id`, `group_product_id`, `barcode`, `name`, `price`, `cost`, `img`, `stock_qty`, `detail`) VALUES
(6, 5, '1111111', 'ກະໂປງສັ້ນ ສີດຳ', 80000, 70000, '3d1e4c6b-ea2f-4fe9-9a65-6d7b47a7d429.jpg', 67, NULL),
(7, 6, '22222222', 'ສາຍຄໍ', 45000, 40000, 'copy_2.jpg', 22, NULL),
(8, 3, '22222222', 'ຄີມກັນແດດ Biore', 900000, 800000, '2e6a5a2c-7493-4494-b0ab-074461d1eb57.jpg', 15, 'Biore UV Aqua Rich Watery Essence SPF50+/PA++++ 15g ครีมกันแดดสำหรับผิวหน้าสุดฮิต ยอดขายอันดับ 1 ทั้งไทยและญี่ปุ่น ปกป้องผิวจากแสงแดดรังสียูวีได้อย่างมีประสิทธิภาพสูงสุด ในรูปแบรุ่นใหม่ ที่มาพร้อมเทคโนโลยี Micro Defense เอสเซนส์เนื้อบางเบา เกลี่ยง่าย ไม่เป็นคราบ ซึมซาบไว ไม่เหนอะหนะ ไม่ทำให้เมคอัพเปลี่ยนสี ช่วยกันน้ำ กันเหงื่อ ทำให้ติดทนยาวนานและลึกถึงชั้นไมโคร สามารถทาทับเมคอัพระหว่างวันได้โดยที่เมคอัพไม่ลบเลือน'),
(9, 5, '6516511', 'ເສື້ອຍືດຜູ້ຍິງ ສີນ້ຳຕານ', 80000, 65000, '0ae2d047-36dd-4403-b038-6de4cd20425f(1).jpg', 60, NULL),
(10, 5, '51651', 'ເສື້ອຍືດ ສີທະເລ', 80000, 65000, '1f66720f-fddd-48a1-a905-2cd4958a3fef.jpg', 70, NULL),
(11, 3, '15616516511', 'SKINTIFIC สเปรย์กันแดด', 850000, 700000, 'th-11134207-7qul7-ljwhrget1h6xe9.jpg', 19, 'สเปรย์กันแดด ที่มีละอองละเอียด 0.01 นาโนเมตร พกพาสะดวก ไม่ทำลายเมคอัพหลังใช้ เนื้อสัมผัสบางเบา ไม่หนักหน้า ให้ความรู้สึกสดชื่น ปกป้องผิวได้อย่างมีประสิทธิภาพด้วย SPF 50+ PA++++ ช่วยป้องกันรังสี UVB ที่เป็นสาเหตุของผิวไหม้ และ ป้องกันรังสี UVA ที่เป็นสาเหตุของริ้วรอยก่อนวัย ได้ถึง 16 เท่า มีไมโครแคปซูล เทคโนโลยี ขนาด 0.04 นาโนเมตร ที่ช่วยปกป้องชั้นผิว ซึ่งอุดมด้วยส่วนประกอบที่ทรงประสิทธิภาพถึง 5 เท่า ได้แก่ UV Pearls, Ceramide และ Centella เพื่อปกป้องรังสี UV ผิวแก่ก่อนวัย และผิวไหม้จากแดด'),
(12, 7, 'CFA452553565', 'TARE แร่ธาตุสำหรับปรุงน้ำชงกาแฟ', 80000, 65000, 'dbb278060097f9128373aed3305c5613.jpg', 65, 'TARE คือ แร่ธาตุเข้มข้นที่มีส่วนประกอบหลักประกอบไปด้วยธาตุแมกนีเซียม ซึ่งจะช่วยดึงกลิ่นหอมของเมล็ดกาแฟออกมาได้ดียิ่งขึ้น และมีคาร์บอเนต ช่วยปรับสมดุลรสชาติไม่ให้เปรี้ยวแหลมจนเกินไป ทำให้ได้รสชาติของกาแฟที่กลมกล่อมยิ่งขึ้น โดยได้รับการทดสอบ และเก็บรวมข้อมูลมากกว่าสองปีเพื่อพัฒนาคุณภาพและการใช้งานสินค้าให้ถูกใจผู้บริโภคคนไทยมากที่สุด'),
(13, 8, 'BKU64465', '[Best seller]QKZ AK2 หูฟังชนิดใส่ในหูพร้อมไมโครโฟน ชุดหูฟังแฟชั่นแบบพกพา เบสหนักสเตอริโอ 9D หูฟังเพลงไฮไฟ', 90000, 75000, '729802eb52a7bf2c2f00224e25be5afe.jpg', 118, 'QKZ AK2 หูฟังชนิดใส่ในหูพร้อมไมโครโฟน ชุดหูฟังแฟชั่นแบบพกพา เบสหนักสเตอริโอ 9D หูฟังเพลงไฮไฟ หูฟังแบบมีสายควบคุม หูฟังแบบสปอร์ตพร้อมไมค์ ซับวูฟเฟอร์เบสหูฟัง In-ear Earphone with Microphone Fashion Portable Headset 9D Stereo Heavy Bass Hi-Fi Music Earphones Wired-control Earbuds Sports Earpiece with Mic Subwoofer Bass Headphone'),
(14, 8, 'HU5456135', 'JWMOVE หูฟัง E3 หูฟังเบสหนัก หูฟังมีไมค์ สายหูฟัง หูฟังพร้อมไมค์ หูฟังเบสหนัก หูฟังหูฟังอินเอียร์ หูฟังโทรศัพท์ หูฟัง', 60000, 55000, '54c5c68481a0c789befd080fece700ad.jpg', 150, 'JWMOVE พลังเสียงสุดเยี่ยมโดนใจ JWMOVE หูฟัง In Ears รุ่น E3 ที่มาพร้อมแม่เหล็ก Neodymium ให้พลังเสียงหนักแน่น ทุ้ม มีพลัง เสียงสูง สดใส ชัดเจนทุกรายละเอียด ความถี่ตอบสนองอยู่ที่ 20 - 20,000 Hz สายยาว 1.2 เมตร ให้คุณเพลิดเพลินไปกับเสียงเพลงที่ชื่นชอบได้ทุกที่ทุกเวลา '),
(15, 8, 'HU6465464', 'ชุดหูฟังสเตอริโอ Hifi 6D Type C แบบมีสาย 3.5 มม. เสียงเบสหนักแน่น สําหรับเล่นเกม', 50000, 45000, 'sg-11134201-22100-0ml5jksnoviv96.jpg', 60, 'ชุดหูฟังอินเทอร์เฟซ TYPE C: เข้ากันได้กับ Samsung, Xiaomi, OPPO, VIVO, Huawei และโทรศัพท์มือถือส่วนใหญ่ที่มีอินเทอร์เฟซ TYPE-C'),
(16, 7, '44857172920618942329', 'Bluekoff A5 เมล็ดกาแฟ ไทย อราบิก้า 100% Premium เกรด A คั่วสด ระดับเข้ม (Dark Roast) บรรจุ 250 กรัม', 80000, 75000, '3135fba692ae1f0ebbd9881faf42afa2.jpg', 120, 'Bluekoff A5 เมล็ดกาแฟ ไทย อราบิก้า100% Premium เกรด A คั่วสด ระดับเข้ม (Dark Roast)  เมล็ดกาแฟคั่วคุณภาพ ได้รับรางวัล Coffee Review การันตีคุณภาพมาตรฐานสากลระดับโลกด้วยระดับคะแนน 93, 92, 91 คะแนน  จากการรีวิวของผู้เชี่ยวชาญผลการประเมินรสชาติกาแฟเอสเพรสโซ่ ซึ่งเป็นกาแฟสัญชาติไทย 100%  พื้นที่ปลูก: ดอยช้าง อ.แม่สรวย จ.เชียงราย Altitude: 1,200 - 1,500 MASL. Process: Washed  Tasting Notes: -  มีกลิ่นหอมกาแฟคั่วสด -  เข้มข้นเต็มคำ เนื้อสัมผัสมาก -  หวานคาราเมล ช็อกโกแลต และโทนถั่ว');

-- --------------------------------------------------------

--
-- Table structure for table `tb_seller`
--

CREATE TABLE `tb_seller` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `tel` varchar(50) NOT NULL,
  `usr` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_seller`
--

INSERT INTO `tb_seller` (`id`, `name`, `surname`, `tel`, `usr`, `pass`) VALUES
(1, 'ພູ', 'ວົງປະສິດ', '97532150', 'phuthone', '123'),
(2, 'ມີນາ', 'ພົມມະຈັນ', '75548962', 'na', '111');

-- --------------------------------------------------------

--
-- Table structure for table `tb_user`
--

CREATE TABLE `tb_user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `usr` varchar(255) NOT NULL,
  `pwd` varchar(255) NOT NULL,
  `level` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_user`
--

INSERT INTO `tb_user` (`id`, `name`, `usr`, `pwd`, `level`) VALUES
(1, 'souliya', 'jay', '1234', 'admin'),
(2, 'mina', 'admin', '123', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tb_group_product`
--
ALTER TABLE `tb_group_product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_order`
--
ALTER TABLE `tb_order`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_order_detail`
--
ALTER TABLE `tb_order_detail`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_post`
--
ALTER TABLE `tb_post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_product`
--
ALTER TABLE `tb_product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_seller`
--
ALTER TABLE `tb_seller`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_user`
--
ALTER TABLE `tb_user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tb_group_product`
--
ALTER TABLE `tb_group_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tb_order`
--
ALTER TABLE `tb_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `tb_order_detail`
--
ALTER TABLE `tb_order_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `tb_post`
--
ALTER TABLE `tb_post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tb_product`
--
ALTER TABLE `tb_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tb_seller`
--
ALTER TABLE `tb_seller`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tb_user`
--
ALTER TABLE `tb_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
