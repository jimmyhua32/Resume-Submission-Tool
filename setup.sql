DROP DATABASE IF EXISTS resumes;

CREATE DATABASE resumes;
USE resumes;

DROP TABLE IF EXISTS People;
DROP TABLE IF EXISTS Experience;

CREATE TABLE People(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  PRIMARY KEY(id)
);

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

INSERT INTO People(id, first_name, last_name, email)
  VALUES (1, "Jimmy", "Hua", "jimhua32@uw.edu");
  
INSERT INTO Experience(pid, job_title, employer, date_start, date_end, descr)
  VALUES (1, "Marketing Manager", "Pacific CM, LLC", "2017-07", "2018-11", "Current job");