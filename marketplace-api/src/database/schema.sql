-- Marketplace Phase 1 schema
-- Money is stored as INTEGER paise (1 rupee = 100 paise). Never floats.

CREATE TABLE IF NOT EXISTS marketplace_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  external_user_id VARCHAR(64) NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  mobile VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'advocate', 'admin') NOT NULL DEFAULT 'buyer',
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_external (external_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS marketplace_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  jurisdiction VARCHAR(150) NULL,
  budget_min INT UNSIGNED NULL,
  budget_max INT UNSIGNED NULL,
  deadline DATE NULL,
  status ENUM('open', 'bidding', 'awarded', 'in_progress', 'delivered', 'completed', 'cancelled')
    NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_requests_client (client_id),
  KEY idx_requests_status (status),
  KEY idx_requests_category (category),
  CONSTRAINT fk_requests_client FOREIGN KEY (client_id)
    REFERENCES marketplace_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS marketplace_bids (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  advocate_id INT UNSIGNED NOT NULL,
  amount INT UNSIGNED NOT NULL,
  timeline_days INT UNSIGNED NULL,
  message TEXT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bid_request_advocate (request_id, advocate_id),
  KEY idx_bids_request (request_id),
  KEY idx_bids_advocate (advocate_id),
  CONSTRAINT fk_bids_request FOREIGN KEY (request_id)
    REFERENCES marketplace_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_bids_advocate FOREIGN KEY (advocate_id)
    REFERENCES marketplace_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) NOT NULL,
  request_id INT UNSIGNED NOT NULL,
  bid_id INT UNSIGNED NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  advocate_id INT UNSIGNED NOT NULL,
  amount INT UNSIGNED NOT NULL,
  status ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled')
    NOT NULL DEFAULT 'pending',
  escrow_status ENUM('none', 'initiated', 'held', 'released', 'refunded')
    NOT NULL DEFAULT 'none',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  UNIQUE KEY uq_orders_request (request_id),
  KEY idx_orders_client (client_id),
  KEY idx_orders_advocate (advocate_id),
  CONSTRAINT fk_orders_request FOREIGN KEY (request_id)
    REFERENCES marketplace_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_bid FOREIGN KEY (bid_id)
    REFERENCES marketplace_bids (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_client FOREIGN KEY (client_id)
    REFERENCES marketplace_users (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_advocate FOREIGN KEY (advocate_id)
    REFERENCES marketplace_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS marketplace_request_files (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id INT UNSIGNED NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_request_files_request (request_id),
  CONSTRAINT fk_request_files_request FOREIGN KEY (request_id)
    REFERENCES marketplace_requests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS marketplace_order_files (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  file_type ENUM('completed_draft', 'revision') NOT NULL DEFAULT 'completed_draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_files_order (order_id),
  CONSTRAINT fk_order_files_order FOREIGN KEY (order_id)
    REFERENCES marketplace_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
