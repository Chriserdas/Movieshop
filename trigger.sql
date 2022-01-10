CREATE DEFINER=`root`@`localhost` TRIGGER `BLOCK_UPDATE` 
BEFORE UPDATE ON `customer` FOR EACH ROW BEGIN
IF(new.email != old.email) Then
 SIGNAL SQLSTATE '02000' SET MESSAGE_TEXT = 'Not allow to change your email';
 END IF;
<<<<<<< HEAD
END
=======
END

>>>>>>> parent of 2c92d34 (Revert "updates")
