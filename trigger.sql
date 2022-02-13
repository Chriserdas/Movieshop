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

select * from log; */



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