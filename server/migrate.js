import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const DB_NAME = process.env.DB_NAME || 'campus_market'

const SCHEMA = `
DROP DATABASE IF EXISTS \`${DB_NAME}\`;
CREATE DATABASE \`${DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`${DB_NAME}\`;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    VARCHAR(10)  NOT NULL UNIQUE,
  password_md5  VARCHAR(32)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  avatar        VARCHAR(500) DEFAULT '',
  school        VARCHAR(100) DEFAULT '',
  department    VARCHAR(100) DEFAULT '',
  grade         VARCHAR(20)  DEFAULT '',
  join_date     DATE         DEFAULT (CURRENT_DATE),
  contact       VARCHAR(200) DEFAULT '',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Trades
CREATE TABLE IF NOT EXISTS trades (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  category     VARCHAR(50)  DEFAULT '',
  price        DECIMAL(10,2) DEFAULT 0,
  \`condition\`  VARCHAR(50)  DEFAULT '',
  location     VARCHAR(200) DEFAULT '',
  publisher    VARCHAR(100) DEFAULT '',
  publish_time VARCHAR(50)  DEFAULT '',
  image        LONGTEXT,
  status       VARCHAR(20)  DEFAULT 'open',
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Lost & Founds
CREATE TABLE IF NOT EXISTS lost_founds (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  type        VARCHAR(10)  DEFAULT 'lost',
  item_name   VARCHAR(100) DEFAULT '',
  location    VARCHAR(200) DEFAULT '',
  event_time  VARCHAR(50)  DEFAULT '',
  contact     VARCHAR(200) DEFAULT '',
  status      VARCHAR(20)  DEFAULT 'open',
  image       LONGTEXT,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Group Buys
CREATE TABLE IF NOT EXISTS group_buys (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  type          VARCHAR(50)  DEFAULT '',
  target_count  INT DEFAULT 0,
  current_count INT DEFAULT 0,
  deadline      VARCHAR(50)  DEFAULT '',
  location      VARCHAR(200) DEFAULT '',
  publisher     VARCHAR(100) DEFAULT '',
  status        VARCHAR(20)  DEFAULT 'open',
  image         LONGTEXT,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Errands
CREATE TABLE IF NOT EXISTS errands (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  task_type     VARCHAR(50)  DEFAULT '',
  reward        DECIMAL(10,2) DEFAULT 0,
  from_location VARCHAR(200) DEFAULT '',
  to_location   VARCHAR(200) DEFAULT '',
  deadline      VARCHAR(50)  DEFAULT '',
  publisher     VARCHAR(100) DEFAULT '',
  status        VARCHAR(20)  DEFAULT 'open',
  image         LONGTEXT,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Messages (inbox)
CREATE TABLE IF NOT EXISTS messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  from_name  VARCHAR(100) DEFAULT '',
  content    TEXT,
  time       VARCHAR(50)  DEFAULT '',
  unread     TINYINT(1)   DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  contact_name VARCHAR(100) DEFAULT '',
  content      TEXT,
  time         VARCHAR(50)  DEFAULT '',
  direction    VARCHAR(10)  DEFAULT 'sent',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_user_contact (user_id, contact_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Dashboard (singleton)
CREATE TABLE IF NOT EXISTS dashboard (
  id            INT PRIMARY KEY DEFAULT 1,
  user_count    INT DEFAULT 0,
  product_count INT DEFAULT 0,
  order_count   INT DEFAULT 0,
  active_today  INT DEFAULT 0
) ENGINE=InnoDB;

-- 9. Dashboard Weekly Data
CREATE TABLE IF NOT EXISTS dashboard_weekly (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  dashboard_id INT DEFAULT 1,
  day          VARCHAR(10) DEFAULT '',
  count        INT DEFAULT 0,
  FOREIGN KEY (dashboard_id) REFERENCES dashboard(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Dashboard Categories
CREATE TABLE IF NOT EXISTS dashboard_categories (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  dashboard_id INT DEFAULT 1,
  name         VARCHAR(50)  DEFAULT '',
  count        INT DEFAULT 0,
  color        VARCHAR(20)  DEFAULT '',
  FOREIGN KEY (dashboard_id) REFERENCES dashboard(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`

async function migrate() {
  const { DB_HOST, DB_USER, DB_PASSWORD } = process.env
  // Connect without database first to create it
  const conn = await mysql.createConnection({
    host: DB_HOST || 'localhost',
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    multipleStatements: true,
  })
  console.log('Connected to MySQL')
  await conn.query(SCHEMA)
  console.log('Migration complete — all tables created')
  await conn.end()
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
