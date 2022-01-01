--STORE 3.1

DELIMITER $
CREATE PROCEDURE most_rent(IN choice CHAR(1), IN number INT, IN imerominia1 DATE, IN imerominia2 DATE)
BEGIN

IF(choice like 'm') THEN 

SELECT title, film_id 
FROM film INNER JOIN film_inventory ON film_inventory.film_id = film.film_id
INNER JOIN film_rental ON film_rental.film_inventory_id = film_inventory.film_inventory_id
WHERE film_rental.film_rental_date BETWEEN imerominia1 AND imerominia2
GROUP BY film_id
ORDER BY count(*) DESC 
LIMIT number;

ELSE IF(choice like 's') THEN 
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
END$

DELIMITER;

--STORE 3.2

CREATE Procedure get_rental_of_customer(IN email_c VARCHAR(50), IN imerominia DATE)
BEGIN
DECLARE id SMALLINT;
DECLARE film_rental_of_day INT;
DECLARE serie_rental_of_day INT;

SELECT choice FROM customer where email like email_c;
SELECT customer_id INTO id FROM customer where email like email_c;

IF(choice like 'F') then
SELECT count(*) AS film_rental_day FROM film_rental
WHERE film_rental_date BETWEEN CONCAT(imerominia, "00:00:00") AND CONCAT(imerominia, "23:59:59") AND customer_id = id;

ELSEIF(choice like 'S') then
SELECT count(*) AS serie_rental_day FROM episode_rental 
WHERE episode_rental_date BETWEEN CONCAT(imerominia, "00:00:00") AND CONCAT(imerominia, "23:59:59") AND customer_id = id;

ELSEIF(choice like 'FS') then 
SELECT count(*) INTO film_rental_of_day FROM film_rental
WHERE film_rental_date BETWEEN CONCAT(imerominia, "00:00:00") AND CONCAT(imerominia, "23:59:59") AND customer_id = id;

SELECT count(*) INTO serie_rental_of_day FROM episode_rental
WHERE episode_rental_date BETWEEN CONCAT(imerominia, "00:00:00") AND CONCAT(imerominia, "23:59:59") AND customer_id = id;

SELECT film_rental_of_day+serie_rental_of_day AS FilmSerie_rental_day;

ELSE SELECT 'error, email doesnt exist';

END IF;

--Store 3.3
CREATE PROCEDURE income()
BEGIN
DECLARE counter INT;
DECLARE income1 FLOAT;
DECLARE income2 FLOAT;
SET counter = 1; --January

WHILE (counter <= 12) DO --until December for each month

SELECT sum(film_amount) INTO income1 FROM film_payment WHERE MONTH(film_payment_date) = counter;
SELECT sum(episode_amount) INTO income2 FROM episode_payment WHERE MONTH(episode_payment_date) = counter;

SELECT income1 + income2 AS esoda_toy_mhna;

SET counter = counter+1;
END WHILE;
END