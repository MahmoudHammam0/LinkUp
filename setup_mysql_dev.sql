-- setup database and user for LinkUp project
-- how to use it: cat setup_mysql_dev.sql | mysql -hlocalhost -uroot -p
CREATE DATABASE IF NOT EXISTS linkup_db;
CREATE USER IF NOT EXISTS 'linkup_user'@'localhost' IDENTIFIED BY 'linkup_pwd';
GRANT ALL PRIVILEGES ON linkup_db.* TO 'linkup_user'@'localhost';
GRANT SELECT ON performance_schema.* TO 'linkup_user'@'localhost';