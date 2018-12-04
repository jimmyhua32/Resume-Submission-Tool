/*
  Name: Jimmy Hua
  Date: November 26, 2018
  Section: CSE 154 AC
  
  This is the setup.sql file to initialize the database for the resume submission tool.
  It stores a person's contact info and their work history.
*/

-- If the database already exists, it will be replaced with a new one.
DROP DATABASE IF EXISTS resumes;

-- Creates the database and sets it to the active one.
CREATE DATABASE resumes;
USE resumes;

-- If these tables already exist, then they will be replaced with a new one.
DROP TABLE IF EXISTS People;
DROP TABLE IF EXISTS Experience;

-- Creates a table for each person submitted. It saves their first and last name, email, and
-- a unique id.
CREATE TABLE People(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  PRIMARY KEY(id)
);

-- Creates a table for the work experience which corresponds to some person in the People table
-- designated by a shared id. This table holds a unique id, a shared id, job title, employer, start
-- date, end date, and job description.
CREATE TABLE Experience(
  id INT NOT NULL AUTO_INCREMENT,
  pid INT,
  job_title VARCHAR(255),
  employer VARCHAR(255),
  date_start VARCHAR(255),
  date_end VARCHAR(255),
  descr TEXT,
  PRIMARY KEY(id)
);

-- Initializes the table with a single entry.
INSERT INTO People(id, first_name, last_name, email)
  VALUES (1, "Jimmy", "Hua", "jimhua32@uw.edu");
  
-- Initializes the table with a single entry.
INSERT INTO Experience(pid, job_title, employer, date_start, date_end, descr)
  VALUES (1, "Marketing Manager", "Pacific CM, LLC", "2017-07", "2018-11", "Current job");