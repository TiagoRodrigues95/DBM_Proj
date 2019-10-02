
CREATE TABLE IF NOT EXISTS tag(
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT
    ,tagname TEXT 
    );
CREATE TABLE IF NOT EXISTS movie(
    movie_id INTEGER PRIMARY KEY AUTOINCREMENT
    ,name TEXT 
        ,stars INTEGER CHECK(stars>=0 AND stars<=5)
        ,date TEXT 
    );
CREATE TABLE IF NOT EXISTS actor(
    actor_id INTEGER PRIMARY KEY AUTOINCREMENT
    ,name TEXT 
        ,gender TEXT 
        ,age INTEGER 
    );
CREATE TABLE IF NOT EXISTS director(
    director_id INTEGER PRIMARY KEY AUTOINCREMENT
    ,name TEXT 
        ,gender TEXT 
        ,age INTEGER 
    );