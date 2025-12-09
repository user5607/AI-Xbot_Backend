const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接到数据库
const dbPath = path.resolve(__dirname, '../../数据库/users.db');
let db = null;

function connectDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('无法连接到数据库:', err.message);
        reject(err);
      } else {
        console.log('成功连接到SQLite数据库');
        resolve(db);
      }
    });
  });
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { connectDB, closeDB };