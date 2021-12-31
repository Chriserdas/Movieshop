------------FILMS/SERIES-----------------

  CREATE TABLE film (
    film_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    description TEXT DEFAULT NULL,
    release_year YEAR DEFAULT NULL,
    language_id TINYINT UNSIGNED NOT NULL,
    length SMALLINT UNSIGNED DEFAULT NULL,
    rating ENUM('G','PG','PG-13','R','NC-17') DEFAULT 'G',
    special_features SET('Trailers','Commentaries','Deleted Scenes','Behind the Scenes') DEFAULT NULL,
    PRIMARY KEY  (film_id),
    CONSTRAINT fk_film_language FOREIGN KEY (language_id) REFERENCES language (language_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE serie (
    serie_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    description TEXT DEFAULT NULL,
    release_year YEAR DEFAULT NULL,
    language_id TINYINT UNSIGNED DEFAULT NULL,
    rating ENUM('G','PG','PG-13','R','NC-17') DEFAULT 'G',
    special_features SET('Trailers','Commentaries','Deleted Scenes','Behind the Scenes') DEFAULT NULL,
    PRIMARY KEY  (serie_id),
    CONSTRAINT fk_serie_language FOREIGN KEY (language_id) REFERENCES language (language_id) ON DELETE cascade ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



---------------SERIE INFO--------------
CREATE TABLE seasons(
    season_id SMALLINT unsigned NOT NULL,
    serie_id SMALLINT UNSIGNED NOT NULL,
    season_number SMALLINT unsigned NOT NULL,
    release_date date,
    ending_date date,
    PRIMARY KEY(season_id),
    unique (serie_id),
    constraint fk_serie_id foreign key (serie_id) REFERENCES serie(serie_id) ON DELETE CASCADE on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    
 
CREATE TABLE episodes(
    episode_id SMALLINT UNSIGNED NOT NULL,
    season_id smallint unsigned NOT NULL,
    episode_number SMALLINT UNSIGNED NOT NULL,
    title VARCHAR(50) NOT NULL,
    description text,
    length SMALLINT UNSIGNED DEFAULT NULL,
    PRIMARY KEY(episode_id),
    constraint fk_season_id FOREIGN KEY (season_id) REFERENCES seasons(season_id) on delete cascade on update CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-------------ACTORS---------

CREATE TABLE actor (
    actor_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45) NOT NULL,
    PRIMARY KEY  (actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE film_actor (
    actor_id SMALLINT UNSIGNED NOT NULL,
    film_id SMALLINT UNSIGNED NOT NULL,
    CONSTRAINT fk_film_actor_actor FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE cascade ON UPDATE CASCADE,
    CONSTRAINT fk_film_actor_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE serie_actor (
    actor_id SMALLINT UNSIGNED NOT NULL,
    serie_id SMALLINT UNSIGNED NOT NULL,
    CONSTRAINT fk_serie_actor_actor FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE cascade ON UPDATE CASCADE,
    CONSTRAINT fk_serie_actor_serie FOREIGN KEY (serie_id) REFERENCES serie (serie_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



------------ACTOR/FILM INFOS-------------

CREATE TABLE country (
    country_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    country VARCHAR(50) NOT NULL,
    PRIMARY KEY  (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE city (
    city_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    city VARCHAR(50) NOT NULL,
    country_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY  (city_id),
    CONSTRAINT fk_city_country FOREIGN KEY (country_id) REFERENCES country (country_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE address (
    address_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    address VARCHAR(50) NOT NULL,
    district VARCHAR(20) DEFAULT NULL,
    city_id SMALLINT UNSIGNED NOT NULL,
    postal_code VARCHAR(10) DEFAULT NULL,
    phone VARCHAR(20) NOT NULL,
    PRIMARY KEY  (address_id),
    CONSTRAINT fk_address_city FOREIGN KEY (city_id) REFERENCES city (city_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE language (
    language_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    PRIMARY KEY (language_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



---------------CATEGORIES--------------

create table category(
    category_id smallint unsigned NOT NULL auto_increment,
    name varchar(25),
    primary key (category_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE film_category (
    film_id SMALLINT UNSIGNED NOT NULL,
    category_id smallint UNSIGNED NOT NULL,
    PRIMARY KEY (film_id,category_id),
    CONSTRAINT fk_film_id FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_film_category_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE serie_category (
    serie_id SMALLINT UNSIGNED NOT NULL,
    category_id smallint UNSIGNED NOT NULL,
    PRIMARY KEY (serie_id),
    CONSTRAINT fk_serie_category_film FOREIGN KEY (serie_id) REFERENCES serie (serie_id) ON DELETE cascade ON UPDATE CASCADE,
    CONSTRAINT fk_serie_category_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE cascade ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



--------------INVENTORIES-------------


create table film_inventory(
    film_inventory_id smallint unsigned not null AUTO_INCREMENT,
    film_id SMALLINT UNSIGNED NOT NULL,
    primary key (film_inventory_id),
    constraint fk_film_inv_id FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


create table episode_inventory(
    episode_inventory_id smallint unsigned not null AUTO_INCREMENT,
    episode_id smallint unsigned not null,
    PRIMARY KEY  (episode_inventory_id),
    constraint fk_episode_id FOREIGN KEY (episode_id) REFERENCES episodes (episode_id) on delete cascade on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



------------------USERS---------------

CREATE TABLE customer (
    customer_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45) NOT NULL,
    email VARCHAR(50) DEFAULT NULL,
    address_id SMALLINT UNSIGNED NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    create_date DATETIME NOT NULL,
    choice ENUM('F', 'S', 'FS'),
    PRIMARY KEY  (customer_id),
    CONSTRAINT fk_customer_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE cascade ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


create table employees( 
    employees_id smallint unsigned not null AUTO_INCREMENT, 
    first_name varchar(45) not null, 
    last_name varchar(45) not null, 
    email varchar(50) not null,
    PRIMARY KEY(employees_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


create table administrator(
    admin_id smallint unsigned not null AUTO_INCREMENT,
    first_name varchar(45) not null, 
    last_name varchar(45) not null, 
    email varchar(50) not null,
    PRIMARY KEY(admin_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-------------------RENTAL-------------

create table film_rental (
    film_rental_id smallint NOT NULL AUTO_INCREMENT,
    film_rental_date DATETIME,
    film_inventory_id smallint unsigned NOT NULL,
    customer_id smallint unsigned NOT NULL,
    primary key (film_rental_id),
    constraint fk_customer_id FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE on update cascade,
    constraint fk_film_inventory foreign key (film_inventory_id) REFERENCES film_inventory(film_inventory_id) ON DELETE CASCADE ON UPDATE cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



create table episode_rental(
    episode_rental_id SMALLINT UNSIGNED NOT NULL auto_increment,
    episode_rental_date DATETIME,
    episode_inventory_id SMALLINT UNSIGNED NOT NULL, 
    customer_id SMALLINT UNSIGNED NOT NULL,
    primary key (episode_rental_id),
    constraint fk_customer_ep_id FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE on update cascade,
    CONSTRAINT fk_inventory foreign key (episode_inventory_id) references episode_inventory(episode_inventory_id) on delete cascade on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------PAYMENT--------------


create table film_payment (
    film_payment_id smallint not null,
    customer_id smallint unsigned NOT NULL,
    film_rental_id smallint not null,
    film_amount decimal(5,2) not null,
    film_payment_date DATETIME,
    PRIMARY KEY  (film_payment_id),
    constraint fk_customer_fp_id FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE on update cascade,
    constraint fk_film_rental_id FOREIGN KEY (film_rental_id) REFERENCES film_rental(film_rental_id) on delete CASCADE on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


create table episode_payment(
    episode_payment_id smallint unsigned NOT NULL,
    customer_id smallint unsigned NOT NULL,
    episode_rental_id smallint unsigned NOT NULL,
    episode_amount decimal(5,2) NOT NULL,
    episode_payment_date DATETIME NOT NULL,
    PRIMARY KEY  (episode_payment_id),
    constraint fk_customer_epay_id FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE on update cascade,
    constraint fk_episode_rental_id FOREIGN KEY (episode_rental_id) REFERENCES episode_rental(episode_rental_id) on delete CASCADE on update cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


























