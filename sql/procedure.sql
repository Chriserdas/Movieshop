--STORE 3.1
DROP PROCEDURE IF EXISTS most_rent;
DELIMITER $
CREATE PROCEDURE `most_rent`(IN lt CHAR(1), IN number INT, IN imerominia1 DATE, IN imerominia2 DATE)
BEGIN
    IF(lt like 'm') THEN 

        SELECT film.title, film.film_id,film.release_year 
        FROM film 
        INNER JOIN film_rental ON film_rental.film_id = film.film_id
        WHERE film_rental.film_rental_date BETWEEN imerominia1 AND imerominia2
        GROUP BY film_id
        ORDER BY count(*) DESC 
        LIMIT number;

    ELSEIF(lt like 's') THEN 
        SELECT series.title, series.serie_id,series.release_year,count(*) 
        FROM series INNER JOIN seasons ON series.serie_id = seasons.serie_id
        INNER JOIN episodes ON episodes.season_id = seasons.season_id
        INNER JOIN episode_rental ON episode_rental.episode_id= episodes.episode_id
        WHERE episode_rental.episode_rental_date BETWEEN imerominia1 AND imerominia2
        GROUP BY series.serie_id
        ORDER BY count(*) DESC 
        LIMIT number;
        ELSE
        SELECT 'wrong input choice';

    END IF;
END$


--STORE 3.2
CREATE PROCEDURE `get_rental_of_customer`(IN email_c VARCHAR(50), IN imerominia DATE)
BEGIN
    DECLARE id SMALLINT;
    DECLARE film_rental_of_day INT;
    DECLARE serie_rental_of_day INT;
    DECLARE film_rental_day INT;
    DECLARE episode_rental_day INT;
    DECLARE c VARCHAR(10);
    SELECT choice INTO c FROM customer where email LIKE email_c;
    SELECT customer_id INTO id FROM customer WHERE email LIKE email_c;

    IF(c LIKE 'F') then
        SELECT customer.customer_id, count(*) AS film_rental_day FROM customer 
        INNER JOIN film_rental ON customer.customer_id = film_rental.customer_id
        WHERE film_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer.customer_id = id;

    ELSEIF(c like 'S') then
        SELECT customer.customer_id,count(*) AS episode_rental_day FROM customer
        INNER JOIN episode_rental ON customer.customer_id = episode_rental.customer_id
        WHERE episode_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer.customer_id = id;

    ELSEIF(c like 'FS') then 
        SELECT count(*) INTO film_rental_of_day FROM customer
        INNER JOIN film_rental ON customer.customer_id = film_rental.customer_id
        WHERE film_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer.customer_id = id;
        SELECT count(*) INTO serie_rental_of_day FROM customer
        INNER JOIN episode_rental ON customer.customer_id = episode_rental.customer_id
        WHERE episode_rental_date between  CONCAT(imerominia," 00:00:00") and CONCAT(imerominia," 23:59:59") AND customer.customer_id = id;
        SELECT 'customer has rent: ', film_rental_of_day+serie_rental_of_day AS FilmSerie_rental_day;

    ELSE 
        SELECT 'error, email doesnt exist' AS message;

    END IF;
END $

--Store 3.3
CREATE PROCEDURE `income`()
BEGIN
    SELECT t1.m month,
        COALESCE(t1.incomeFilm, 0) incomeFilm,
        COALESCE(t2.incomeSerie, 0) incomeSerie
    FROM
    (
        SELECT 
            MONTH(film_payment_date) m, 
            COALESCE(sum(film_amount),0) incomeFilm
        FROM film_payment
        GROUP BY MONTH(film_payment_date) 
        ORDER BY MONTH(film_payment_date) ASC
    ) t1
    LEFT JOIN
    (
        SELECT 
            MONTH(episode_payment_date) m, 
            COALESCE(sum(episode_amount),0) incomeSerie
        FROM episode_payment
        GROUP BY MONTH(episode_payment_date) 
        ORDER BY MONTH(episode_payment_date) ASC
    ) t2 ON t1.m = t2.m

    UNION 

    SELECT t2.m month,
        COALESCE(t1.incomeFilm, 0) incomeFilm,
        COALESCE(t2.incomeSerie, 0) incomeSerie
    FROM
    (
        SELECT  
            MONTH(film_payment_date) m, 
            COALESCE(sum(film_amount),0) incomeFilm
        FROM film_payment
        GROUP BY MONTH(film_payment_date) 
        ORDER BY MONTH(film_payment_date) ASC
    ) t1
    RIGHT JOIN

    (
        SELECT  
            MONTH(episode_payment_date) m, 
            COALESCE(sum(episode_amount),0) incomeSerie
        FROM episode_payment
        GROUP BY MONTH(episode_payment_date) 
        ORDER BY MONTH(episode_payment_date) ASC
    ) t2 ON  t1.m = t2.m;
END$


--STORE 3.4A

CREATE PROCEDURE `get_actors`(IN name1 VARCHAR(20), IN name2 VARCHAR(20))
BEGIN
    SELECT first_name, last_name FROM actor
    WHERE last_name BETWEEN name1 AND name2
    ORDER BY last_name;
END$

--STORE 3.4B
DROP PROCEDURE IF EXISTS get_actors1$

CREATE PROCEDURE `get_actors1`(IN eponumo VARCHAR(20))
BEGIN
    DECLARE plithos_same_actor INT;
    SELECT first_name,last_name FROM actor
    WHERE last_name LIKE eponumo;
    SELECT found_rows() INTO plithos_same_actor;
    IF(plithos_same_actor = 0) THEN
        SELECT 'NO SAME ACTOR WITH THIS LAST NAME';

    END IF;
END$


DROP PROCEDURE IF EXISTS set_amount;
delimiter$
CREATE PROCEDURE `set_amount`(IN idc INT,IN val ENUM('F','S'), OUT price DECIMAL(5,2))
BEGIN
    DECLARE c VARCHAR(10);
    SELECT choice INTO c FROM customer WHERE customer_id=idc;


    IF(c LIKE 'F' AND val LIKE 'F' ) then 
        /*SELECT film_amount INTO price FROM film_payment WHERE film_payment.customer_id=idc;*/
        SET price = 0.40;

    ELSEIF(c LIKE 'S' AND val= 'S') then
        SET price = 0.30;

    ELSEIF(c like 'FS' AND val='F') then
        SET price = 0.30;

    ELSEIF(c like 'FS' AND val='S') then
        SET price=0.10;

    END IF;
END$