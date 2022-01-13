
----trigger 4.3
CREATE DEFINER=`root`@`localhost` TRIGGER `BLOCK_UPDATE` 
BEFORE UPDATE ON `customer` FOR EACH ROW BEGIN
IF(new.email != old.email) Then
 SIGNAL SQLSTATE '02000' SET MESSAGE_TEXT = 'Not allow to change your email';
 END IF;
 END

-----trigger 4.2 for film_rental
CREATE DEFINER=`root`@`localhost` TRIGGER `film_amount` AFTER INSERT ON `film_rental` FOR EACH ROW BEGIN
DECLARE c VARCHAR(10);
	DECLARE countId INT;
	DECLARE c1 INT;
	DECLARE c2 INT;
	DECLARE emailc VARCHAR(40);
	DECLARE imerominia DATE;
	DECLARE price DECIMAL(5,2);
	SELECT email INTO emailc FROM customer WHERE customer_id = NEW.customer_id;
	SELECT choice INTO c FROM customer where email like emailc;
	SET imerominia = new.film_rental_date;
	call set_amount(NEW.customer_id,'F', @price);
	IF(c LIKE 'F') then
	SELECT count(*) INTO countId
	FROM film_rental
	WHERE film_rental_date between CONCAT(imerominia," 00:00:00") and  CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;

	ELSEIF(c like 'FS') then 
	SELECT count(*) INTO c1 FROM film_rental
	WHERE film_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;

	SELECT count(*) INTO c2 FROM episode_rental
	WHERE episode_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;
	SET countId = c1+c2;
	END IF;
    
    IF(MOD(countId,3) =0) then
		INSERT INTO film_payment VALUES
	(DEFAULT,NEW.customer_id,NEW.film_rental_id,@price/2,current_date());
	end if;
END

/* INSERT INTO film_rental VALUES
(16700,'2005-08-21', 667,33); */

----trigger 4.2 for episode_rental
CREATE DEFINER=`root`@`localhost` TRIGGER `episode_amount` AFTER INSERT ON `episode_rental` FOR EACH ROW BEGIN
    DECLARE c VARCHAR(10);
	DECLARE countId INT;
	DECLARE c1 INT;
	DECLARE c2 INT;
	DECLARE emailc VARCHAR(40);
	DECLARE imerominia DATE;
	DECLARE price DECIMAL(5,2);
	SELECT email INTO emailc FROM customer WHERE customer_id = NEW.customer_id;
	SELECT choice INTO c FROM customer where email like emailc;
	SET imerominia = new.episode_rental_date;
	call set_amount(NEW.customer_id,'S', @price);
	IF(c LIKE 'S') then
	SELECT count(*) INTO countId
	FROM episode_rental
	WHERE episode_rental_date between CONCAT(imerominia," 00:00:00") and  CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;

	ELSEIF(c like 'FS') then 
	SELECT count(*) INTO c1 FROM film_rental
	WHERE film_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;

	SELECT count(*) INTO c2 FROM episode_rental
	WHERE episode_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer_id = NEW.customer_id;
	SET countId = c1+c2;
	END IF;
    
    IF(MOD(countId,3) =0) then
		INSERT INTO episode_payment VALUES
	(DEFAULT,NEW.customer_id,NEW.episode_rental_id,@price/2,current_date());
	else
	 INSERT INTO episode_payment VALUES
     (DEFAULT,NEW.customer_id,NEW.episode_rental_id,@price,current_date());
    end if;
    
END

/*INSERT INTO episode_rental VALUES
(15500, '2003-02-13',455,16); */