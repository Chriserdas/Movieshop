create table employees( 
    employees_id smallint unsigned not null AUTO_INCREMENT, 
    first_name varchar(45) not null, last_name varchar(45) not null, 
    email varchar(50) not null 
);

create table administrator(
    admin_id smallint unsigned not null AUTO_INCREMENT,
    first_name varchar(45) not null, 
    last_name varchar(45) not null, 
    email varchar(50) not null
);

create table serie(
    series_id smallint unsigned not null AUTO_INCREMENT,
    title varchar(128) not null,
    description text default null,
    release_year year default null,
    language_id tinyint unsigned not null,
    original_language_id TINYINT UNSIGNED DEFAULT NULL,
    length SMALLINT UNSIGNED DEFAULT NULL,
    rating ENUM('G','PG','PG-13','R','NC-17') DEFAULT 'G',
    special_features SET('Trailers','Commentaries','Deleted Scenes','Behind the Scenes') DEFAULT NULL,
    PRIMARY KEY  (series_id),
    CONSTRAINT fk_serie_language FOREIGN KEY (language_id) REFERENCES language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_serie_language_original FOREIGN KEY (original_language_id) REFERENCES language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

