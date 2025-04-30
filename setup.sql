CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    isbn BIGINT,
    title TEXT,
    published DATE,
    author TEXT[]
);

CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    isbn BIGINT REFERENCES books(isbn) ON DELETE CASCADE,
    quotes TEXT,
    added DATE
);


