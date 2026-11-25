
-- Use the database created by Docker Compose
USE libraryborrowing_db;

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  book_code   VARCHAR(20) NOT NULL UNIQUE,
  title       VARCHAR(255) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'Available',
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample library books
INSERT IGNORE INTO books
(book_code, title, category, author, status, description)
VALUES
('B001', 'Introduction to Programming', 'Computing & Technology', 'John Smith', 'Available', 'A beginner guide to programming'),
('B002', 'Database Systems', 'Computing & Technology', 'Thomas Connolly', 'Available', 'An introduction to database systems'),
('B003', 'Cloud Computing Basics', 'Computing & Technology', 'Rajkumar Buyya', 'Borrowed', 'Learn the basics of cloud computing'),
('B004', 'Basic Mathematics', 'General Knowledge', 'David Rayner', 'Available', 'Basic mathematics study guide'),
('B005', 'English Communication', 'General Knowledge', 'Mark Ellis', 'Available', 'Improve English communication skills'),
('B006', 'Study Skills Guide', 'General Knowledge', 'Stella Cottrell', 'Borrowed', 'A guide to effective study skills');

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- BORROWINGS TABLE
CREATE TABLE IF NOT EXISTS borrowings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  book_id     INT NOT NULL,
  borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date    DATE,
  return_date DATE,
  status      ENUM('pending', 'borrowed', 'returned', 'overdue', 'cancelled')
              DEFAULT 'pending',
  notes       TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,

  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_status (status)
);
