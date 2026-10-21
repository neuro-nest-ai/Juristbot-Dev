-- Marketplace Phase 1 schema (SQLite dev mirror)
-- Money is stored as INTEGER paise. Booleans/enums stored as TEXT.

CREATE TABLE IF NOT EXISTS marketplace_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'advocate', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_role ON marketplace_users (role);

CREATE TABLE IF NOT EXISTS marketplace_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES marketplace_users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  jurisdiction TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'bidding', 'awarded', 'in_progress', 'delivered', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_requests_client ON marketplace_requests (client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON marketplace_requests (status);

CREATE TABLE IF NOT EXISTS marketplace_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES marketplace_requests (id) ON DELETE CASCADE,
  advocate_id INTEGER NOT NULL REFERENCES marketplace_users (id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  timeline_days INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (request_id, advocate_id)
);
CREATE INDEX IF NOT EXISTS idx_bids_request ON marketplace_bids (request_id);
CREATE INDEX IF NOT EXISTS idx_bids_advocate ON marketplace_bids (advocate_id);

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  request_id INTEGER NOT NULL UNIQUE REFERENCES marketplace_requests (id) ON DELETE CASCADE,
  bid_id INTEGER NOT NULL REFERENCES marketplace_bids (id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES marketplace_users (id) ON DELETE CASCADE,
  advocate_id INTEGER NOT NULL REFERENCES marketplace_users (id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'delivered', 'completed', 'cancelled')),
  escrow_status TEXT NOT NULL DEFAULT 'none'
    CHECK (escrow_status IN ('none', 'initiated', 'held', 'released', 'refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_client ON marketplace_orders (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_advocate ON marketplace_orders (advocate_id);

CREATE TABLE IF NOT EXISTS marketplace_request_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES marketplace_requests (id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_request_files_request ON marketplace_request_files (request_id);

CREATE TABLE IF NOT EXISTS marketplace_order_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES marketplace_orders (id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'completed_draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_order_files_order ON marketplace_order_files (order_id);
