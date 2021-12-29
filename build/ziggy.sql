CREATE DATABASE ziggy;

USE ziggy;

CREATE TABLE subjects
    (
        id INTEGER AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        extension VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE users
    (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE KEY,
        image_url VARCHAR(100),
        password VARCHAR(255) DEFAULT NULL,
        admin BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE entries
    (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(144) NOT NULL,
        user_id INTEGER NOT NULL,
        content VARCHAR(1500),
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE sessions
    (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        type VARCHAR(100) NOT NUlL DEFAULT "BASIC",
        authenticated BOOLEAN NOT NULL DEFAULT 0,
        admin BOOLEAN NOT NULL DEFAULT 0,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

INSERT INTO subjects(name,extension) 
	VALUES('JavaScript','js')
		,('PHP','php')
		,('TypeScript','ts')
		,('HTML','html')
		,('C++','cpp')
		,('Oh My Zsh','');

INSERT INTO users(username,image_url) VALUES('zdegeorge','images/profile-1.png');