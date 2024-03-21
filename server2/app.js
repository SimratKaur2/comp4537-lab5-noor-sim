const http = require("http");
const mysql = require("mysql");
const url = require("url");

// Database connection
const db = mysql.createConnection({
  host: "mysql-7d1q", // Internal hostname from Render's dashboard
  port: 3306, // Standard MySQL port
  user: process.env.MYSQL_USER, // MySQL username from environment variable
  password: process.env.MYSQL_PASSWORD, // MySQL password from environment variable
  database: process.env.MYSQL_DATABASE, // MySQL database name from environment variable
});

// Function to create the table if it doesn't exist
function createTableIfNeeded(callback) {
  const sql = `CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dateOfBirth DATETIME NOT NULL
  ) ENGINE=InnoDB;`;

  db.query(sql, callback);
}

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    process.exit(1);
  }
  console.log("Connected to the database");
  // The table will be created when the server starts
  createTableIfNeeded((err) => {
    if (err) throw err;
    console.log("Table created or already exists");
  });
});
//test
function ensurePatientsTableExists(callback) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      dateOfBirth DATETIME NOT NULL
    ) ENGINE=InnoDB;`;

  db.query(createTableSQL, (err) => {
    if (err) {
      console.error("Error ensuring patients table exists:", err);
      return callback(err);
    }
    console.log("Patients table checked or created");
    callback(null); // null error indicates success
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const { pathname, query } = url.parse(req.url, true);

  if (pathname === "/insert" && req.method === "POST") {
    createTableIfNeeded((err) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error while creating table");
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
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
    });
  } else if (pathname === "/select" && req.method === "GET") {
    createTableIfNeeded((err) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error while creating table");
        return;
      }

      // const sql = "SELECT * FROM patients";
      const sql =
        query.startsWithS === "true"
          ? "SELECT * FROM patients WHERE name LIKE 'S%'"
          : "SELECT * FROM patients";

      db.query(sql, (err, result) => {
        if (err) {
          res.writeHead(500);
          res.end("Server error");
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
