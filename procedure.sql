--STORE 3.1
CREATE DEFINER=`root`@`localhost` PROCEDURE `most_rent`(IN lt CHAR(1), IN number INT, IN imerominia1 DATE, IN imerominia2 DATE)
BEGIN
IF(lt like 'm') THEN 

SELECT film.title, film.film_id 
FROM film INNER JOIN film_inventory ON film_inventory.film_id = film.film_id
INNER JOIN film_rental ON film_rental.film_inventory_id = film_inventory.film_inventory_id
WHERE film_rental.film_rental_date BETWEEN imerominia1 AND imerominia2
GROUP BY film_id
ORDER BY count(*) DESC 
LIMIT number;
ELSEIF(lt like 's') THEN 
SELECT serie.title, serie.serie_id, count(*) 
FROM serie INNER JOIN seasons ON serie.serie_id = season.serie_id
INNER JOIN episodes ON episodes.season_id = season.season_id
INNER JOIN episode_inventory ON episodes.episode_id = episode_inventory.episode_id
INNER JOIN episode_rental ON episode_inventory.episode_inventory_id = episode_rental.episode_inventory_id
WHERE episode_rental.episode_rental_date BETWEEN imerominia1 AND imerominia2
GROUP BY serie.serie_id
ORDER BY count(*) DESC 
LIMIT number;
ELSE
SELECT 'wrong input choice';
END IF;
END


--STORE 3.2
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_rental_of_customer`(IN email_c VARCHAR(50), IN imerominia DATE)
BEGIN

DECLARE id SMALLINT;
DECLARE film_rental_of_day INT;
DECLARE serie_rental_of_day INT;
DECLARE c VARCHAR(10);
SELECT choice INTO c FROM customer where email LIKE email_c;
SELECT customer_id INTO id FROM customer WHERE email LIKE email_c;
IF(c like 'F') then
SELECT count(*) AS film_rental_day FROM film_rental
WHERE film_rental_date LIKE 'imerominia%' AND customer_id = id;
ELSEIF(c like 'S') then
SELECT count(*) AS serie_rental_day FROM episode_rental 
WHERE episode_rental_date LIKE 'imerominia%' AND customer_id = id;
ELSEIF(c like 'FS') then 
SELECT count(*) INTO film_rental_of_day FROM film_rental
WHERE film_rental_date LIKE 'imerominia%' AND customer_id = id;
SELECT count(*) INTO serie_rental_of_day FROM episode_rental
WHERE episode_rental_date LIKE 'imerominia%' AND customer_id = id;
SELECT film_rental_of_day+serie_rental_of_day AS FilmSerie_rental_day;
ELSE 
SELECT 'error, email doesnt exist' AS message;
END IF;
END

--Store 3.3
CREATE DEFINER=`root`@`localhost` PROCEDURE `income`()
BEGIN
DECLARE i INT;
DECLARE income1 FLOAT;
DECLARE income2 FLOAT;
SET i = 1; 

REPEAT

SELECT COALESCE(sum(film_amount),0) INTO income1 FROM film_payment WHERE MONTH(film_payment_date) = i;
SELECT COALESCE(sum(episode_amount),0) INTO income2 FROM episode_payment WHERE MONTH(episode_payment_date) = i;

SELECT i AS Month ,income1 AS income_from_film,income2 AS income_from_serie;

SET i = i+1;
UNTIL(i<=12)
END REPEAT;
END


--STORE 3.4A

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_actors`(IN name1 VARCHAR(20), IN name2 VARCHAR(20))
BEGIN
select first_name, last_name FROM actor
WHERE last_name BETWEEN name1 AND name2
ORDER BY last_name;
SELECT found_rows();
END

--STORE 3.4B
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_actor1`(IN eponumo VARCHAR(20))
BEGIN
DECLARE plithos_same_actor INT;
SELECT first_name,last_name FROM actor
WHERE last_name LIKE eponumo;
SELECT found_rows() INTO plithos_same_actor;
IF(plithos_same_actor > 0) THEN
SELECT plithos_same_actor;
ELSEIF(plithos_same_actor = 0) THEN
SELECT 'NO SAME ACTOR WITH THIS LAST NAME';
END IF;
END