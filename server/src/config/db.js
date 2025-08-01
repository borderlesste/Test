// server/src/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool(`${process.env.DATABASE_URL}?multipleStatements=true`);

const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

const commitTransaction = async (connection) => {
  await connection.commit();
  connection.release();
};

const rollbackTransaction = async (connection) => {
  await connection.rollback();
  connection.release();
};

module.exports = {
  pool,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
};
