----trigger 4.1

/* for table film_rental*/

DROP TRIGGER IF EXISTS after_insert_log;
DELIMITER$
CREATE  TRIGGER `after_insert_film_log` AFTER INSERT ON `film_rental` 
FOR EACH ROW
BEGIN
    declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'film_rental', 'insert', date_time, 'yes');
END$
DELIMITER;

/*INSERT INTO film_rental VALUES
(17000, '2005-08-21 11:13:35', 23, 16);

select * from log; 

delete from film_rental where film_rental_id=17000;
delete from log where username= 'SANDRA.MARTIN@sakilacustomer.org';*/

DROP TRIGGER IF EXISTS after_update_film_log;
DELIMITER$
CREATE  TRIGGER `after_update_film_log` 
AFTER UPDATE ON `film_rental` FOR EACH ROW
BEGIN
    declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'film_rental', 'update', date_time, 'yes');
END$
DELIMITER;

/* UPDATE film_rental
SET film_rental_id= 2028
where film_rental_id = 2029;

select * from log; */


DROP TRIGGER IF EXISTS after_delete_film_log;
DELIMITER$
CREATE TRIGGER `after_delete_film_log` 
AFTER DELETE ON `film_rental` FOR EACH ROW
BEGIN
    declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=old.customer_id), 'film_rental', 'delete', date_time, 'yes');
END$
DELIMITER;

/*DELETE FROM film_rental where film_rental_id=5664;

select * from log; */



/* for table film_payment*/

DROP TRIGGER IF EXISTS after_insert_fpaym_log;
DELIMITER$
CREATE  TRIGGER `after_insert_fpaym_log` 
AFTER INSERT ON `film_payment` 
FOR EACH ROW BEGIN
    declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'film_payment', 'insert', date_time, 'yes');
END$

/*INSERT INTO film_payment VALUES
(16000,104,148,5.6,'2003-03-23');
select * from log;*/
DELIMITER;

DROP TRIGGER IF EXISTS after_update_fpaym_log;
DELIMITER$
CREATE TRIGGER `after_update_fpaym_log` 
AFTER UPDATE ON `film_payment` 
FOR EACH ROW BEGIN
    declare date_time datetime;

	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'film_payment', 'update', date_time, 'yes');
END$
DELIMITER;

DROP TRIGGER IF EXISTS after_delete_fpaym_log;
DELIMITER$
CREATE TRIGGER `after_delete_fpaym_log` 
AFTER DELETE ON `film_payment` 
FOR EACH ROW BEGIN
    declare date_time datetime;
   
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=old.customer_id), 'film_payment', 'delete', date_time, 'yes');
END$
DELIMITER;


/* for table episode_rental*/
DROP TRIGGER IF EXISTS after_insert_ep_log;
DELIMITER$
CREATE  TRIGGER `after_insert_ep_log` 
AFTER INSERT ON `episode_rental` FOR EACH ROW
BEGIN
declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'episode_rental', 'insert', date_time, 'yes');
END$
DELIMITER;


DROP TRIGGER IF EXISTS after_update_ep_log;
DELIMITER$
CREATE  TRIGGER `after_update_ep_log` 
AFTER UPDATE ON `episode_rental` FOR EACH ROW
BEGIN
declare date_time datetime;

	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'episode_rental', 'update', date_time, 'yes');
END$
DELIMITER;

DROP TRIGGER IF EXISTS after_delete_ep_log;
DELIMITER$
CREATE  TRIGGER `after_delete_ep_log` 
AFTER DELETE ON `episode_rental` FOR EACH ROW
BEGIN
declare date_time datetime;
	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=old.customer_id), 'episode_rental', 'delete', date_time, 'yes');
END$
DELIMITER;


/* for table episode_payment*/

DROP TRIGGER IF EXISTS after_insert_eppaym_log;
DELIMITER$
CREATE TRIGGER `after_insert_eppaym_log` 
AFTER INSERT ON `episode_payment` FOR EACH ROW
BEGIN
declare date_time datetime;

	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'episode_payment', 'insert', date_time, 'yes');
END$
DELIMITER;


DROP TRIGGER IF EXISTS after_update_eppaym_log;
DELIMITER$
CREATE  TRIGGER `after_update_eppaym_log` 
AFTER UPDATE ON `episode_payment` FOR EACH ROW
BEGIN
declare date_time datetime;

	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=new.customer_id), 'episode_payment', 'update', date_time, 'yes');
END$
DELIMITER;

DROP TRIGGER IF EXISTS after_update_eppaym_log;
DELIMITER$
CREATE  TRIGGER `after_delete_eppaym_log` 
AFTER DELETE ON `episode_payment` FOR EACH ROW
BEGIN
declare date_time datetime;

	set date_time=now();
    insert into log values
    ((select email from customer where customer_id=old.customer_id), 'episode_payment', 'delete', date_time, 'yes');
END$
DELIMITER;


----trigger 4.3
DROP TRIGGER IF EXISTS BLOCK_UPDATE;
DELIMITER$
CREATE DEFINER=`root`@`localhost` TRIGGER `BLOCK_UPDATE` 
BEFORE UPDATE ON `customer` FOR EACH ROW BEGIN
IF(new.email != old.email) Then
 SIGNAL SQLSTATE '02000' SET MESSAGE_TEXT = 'Not allow to change your email';
 END IF;
 END$
 DELIMITER;

 /*UPDATE customer
SET email = 'anna.WILLIAMS@sakilacustomer.org'
WHERE email = 'LINDA.WILLIAMS@sakilacustomer.org'; */

-----trigger 4.2 for film_rental
DROP TRIGGER IF EXISTS film_amount;
DELIMITER$
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
	(NULL,NEW.customer_id,NEW.film_rental_id,@price/2,current_date());
    else
	 INSERT INTO film_payment VALUES
     (NULL,NEW.customer_id,NEW.film_rental_id,@price,current_date());
	end if;
END$
DELIMITER;

/* INSERT INTO film_rental VALUES
(16700,'2005-08-21', 691,33); 

select * from film_payment;*/


----trigger 4.2 for episode_rental
DROP TRIGGER IF EXISTS episode_amount;
DELIMITER$
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
	(NULL,NEW.customer_id,NEW.episode_rental_id,@price/2,current_date());
	else
	 INSERT INTO episode_payment VALUES
     (NULL,NEW.customer_id,NEW.episode_rental_id,@price,current_date());
    end if;
    
END$
DELIMITER;

/*INSERT INTO episode_rental VALUES
(15500, '2003-02-13',40,16); gia na deiksw ekpwsh

INSERT INTO episode_rental VALUES
(15700, '2015-02-20',37,477); gia na deiksw oti mpainei kanonikh timh


select * from episode_payment; */