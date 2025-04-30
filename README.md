## QuoteBook project
This application uses openlibrary.org API to add books by isbn. You can add books and log your favourite quote to remember so that you can use it in conversations to sound smart. 

The books and quotes are stored in a postgresql database. All entries support CRUD operations.

To begin :
1. Put in your actual postgresql database details in the index.js file.
2. In your local database create tables using the queries in [`setup.sql`](https://github.com/ShinigamiPG/Quote-book/blob/master/setup.sql) 
3. Use `npm i` to install dependencies and `node index.js` to start application.

Use the address http://localhost:3000/ on your browser to use the app.  
