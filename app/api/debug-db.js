// pages/api/debug-db.js
import mysql from 'mysql2/promise';
import { promisify } from 'util';
import dns from 'dns';

const debug = async () => {
  const results = {};
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  // 1. Environment Variables Check
  results.envVariables = {
    DB_HOST: !!process.env.DB_HOST,
    DB_USER: !!process.env.DB_USER,
    DB_PASSWORD: !!process.env.DB_PASSWORD,
    DB_NAME: !!process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || '3306 (default)',
    DB_SSL: process.env.DB_SSL || 'not set'
  };

  // 2. DNS Resolution Check
  try {
    const lookup = promisify(dns.lookup);
    const resolved = await lookup(process.env.DB_HOST);
    results.dnsResolution = {
      success: true,
      ip: resolved.address
    };
  } catch (error) {
    results.dnsResolution = {
      success: false,
      error: error.message
    };
  }

  // 3. Port Accessibility Check
  try {
    const net = await import('net');
    const socket = new net.Socket();
    const timeout = 3000;
    
    await new Promise((resolve, reject) => {
      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error(`Timeout after ${timeout}ms`));
      });
      socket.on('error', (error) => {
        socket.destroy();
        reject(error);
      });
      socket.connect(config.port, config.host);
    });
    
    results.portAccessible = { success: true };
  } catch (error) {
    results.portAccessible = {
      success: false,
      error: error.message
    };
  }

  // 4. MySQL Connection Test
  try {
    const connection = await mysql.createConnection(config);
    results.connectionTest = { success: true };
    await connection.end();
  } catch (error) {
    results.connectionTest = {
      success: false,
      error: error.message,
      code: error.code
    };
  }

  // 5. Table Accessibility Test
  try {
    const connection = await mysql.createConnection(config);
    const [users] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users'`, 
      [config.database]
    );
    
    results.tableCheck = {
      usersTableExists: users.length > 0
    };
    
    if (users.length > 0) {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'users'`, 
        [config.database]
      );
      results.tableCheck.columns = columns;
    }
    
    await connection.end();
  } catch (error) {
    results.tableCheck = {
      error: error.message
    };
  }

  // 6. Write Test (if read works)
  if (results.connectionTest.success) {
    try {
      const connection = await mysql.createConnection(config);
      const testEmail = `test_${Date.now()}@debug.com`;
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS debug_signup_test (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255)`
      );
      
      await connection.execute(
        'INSERT INTO debug_signup_test (email) VALUES (?)',
        [testEmail]
      );
      
      const [rows] = await connection.execute(
        'SELECT * FROM debug_signup_test WHERE email = ?',
        [testEmail]
      );
      
      await connection.execute('DROP TABLE IF EXISTS debug_signup_test');
      await connection.end();
      
      results.writeTest = {
        success: rows.length === 1,
        testRecord: rows[0]
      };
    } catch (error) {
      results.writeTest = {
        success: false,
        error: error.message,
        sqlState: error.sqlState,
        errno: error.errno
      };
    }
  }

  // 7. Vercel Environment Info
  results.vercel = {
    region: process.env.VERCEL_REGION,
    environment: process.env.VERCEL_ENV,
    url: process.env.VERCEL_URL
  };

  return results;
};

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'development' && req.headers.authorization !== `Bearer ${process.env.DEBUG_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await debug();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}