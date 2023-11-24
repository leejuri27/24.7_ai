use Insa4_JSB_final_4;

DROP SEQUENCE user_code;
DROP SEQUENCE trainer_code;
DROP SEQUENCE connection_code;
DROP TABLE feedback_list_user;
DROP TABLE connection;
DROP TABLE trainer;
DROP TABLE user;

CREATE SEQUENCE user_code START WITH 10000001 INCREMENT BY 1 MAXVALUE 19999999;
CREATE SEQUENCE trainer_code START WITH 20000001 INCREMENT BY 1 MAXVALUE 29999999;
CREATE SEQUENCE connection_code START WITH 30000001 INCREMENT BY 1 MAXVALUE 49999999;

CREATE TABLE user(
    email VARCHAR(50) NOT NULL,
    pw VARCHAR(100) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    user_code INT NOT NULL DEFAULT NEXTVAL(user_code),
    join_date TIMESTAMP,
    PRIMARY KEY (user_code)
);

CREATE TABLE trainer(
    email VARCHAR(50) NOT NULL,
    pw VARCHAR(100) NOT NULL,
    trainer_name VARCHAR(20) NOT NULL,
    profile_pic VARCHAR(512),
    career VARCHAR(512),
    trainer_code INT NOT NULL DEFAULT NEXTVAL(trainer_code),
    join_date TIMESTAMP,
    PRIMARY KEY (trainer_code)
);

CREATE TABLE connection (
    user_code INT NOT NULL,
    trainer_code INT NOT NULL,
    connection_code INT NOT NULL PRIMARY KEY,
    exercise_category VARCHAR(20) NOT NULL,
    user_comment VARCHAR(1024),
    accuracy FLOAT,
    accuracy_list VARCHAR(512),
    user_video_url VARCHAR(512),
    split_video_base_url VARCHAR(512),
    connection_date TIMESTAMP,
    confirm_trainer BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT FK_user_connection FOREIGN KEY(user_code) REFERENCES user(user_code),
    CONSTRAINT FK_trainer_connection FOREIGN KEY(trainer_code) REFERENCES trainer(trainer_code)
);

CREATE TABLE feedback_list_user (
    connection_code INT NOT NULL,
    feedback_content VARCHAR(1024) NOT NULL,
    attachment VARCHAR(512),
    base_url VARCHAR(512),
    memo VARCHAR(100),
    feedback_date TIMESTAMP,
    confirm_user BOOLEAN DEFAULT false NOT NULL
    CONSTRAINT FK_connection_feedback_user FOREIGN KEY(connection_code) REFERENCES connection(connection_code)
);

# DROP TABLE reference_video;
CREATE TABLE reference_video(
    exercise_category VARCHAR(20),
    video_url VARCHAR(512)
);