const http = require("http");
const mysql = require("mysql");
const url = require("url");

// Local Database connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "mysql123",
//   database: "lab5",
// });

// Database connection
const db = mysql.createConnection({
  host: 'mysql-7d1q', // This is the internal hostname from your Render's dashboard
  port: 3306,        // This is the standard MySQL port
  user: process.env.MYSQL_USER,     // Your MySQL username from the environment variable
  password: process.env.MYSQL_PASSWORD, // Your MySQL user password from the environment variable
  database: process.env.MYSQL_DATABASE, // Your MySQL database name from the environment variable
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");

  const sql = `CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dateOfBirth DATETIME NOT NULL
  ) ENGINE=InnoDB;`;

  db.query(sql, (err) => {
    if (err) throw err;
    console.log("Table created or already exists");
  });
});

const server = http.createServer((req, res) => {
  //Adding CORS headers here
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
      "Access-Control-Allow-Headers": "X-Requested-With,content-type",
    });
    res.end();
    return;
  }

  const { pathname, query } = url.parse(req.url, true);

  if (pathname === "/insert" && req.method === "POST") {
    // Insert data logic
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const sql = `INSERT INTO patients (name, dateOfBirth) VALUES 
      ('Sara Brown', '1901-01-01'),
      ('John Smith', '1941-01-01'),
      ('Jack Ma', '1961-01-30'),
      ('Elon Musk', '1999-01-01')`;

      db.query(sql, (err, result) => {
        if (err) {
          res.writeHead(500);
          res.end("Server error");
          return;
        }
        res.writeHead(200);
        res.end("Data inserted");
      });
    });
  } else if (pathname === "/select" && req.method === "GET") {
    // Select data logic
    const sql = "SELECT * FROM patients";
    db.query(sql, (err, result) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
