import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('kagoma_contributions.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Contributors table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS contributors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            balance REAL DEFAULT 0,
            total_contributed REAL DEFAULT 0,
            total_owed REAL DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // Contributions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contributor_id INTEGER,
            amount REAL NOT NULL,
            source TEXT NOT NULL,
            sms_content TEXT,
            sms_sender TEXT,
            transaction_ref TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced_to_sheets INTEGER DEFAULT 0,
            notes TEXT,
            FOREIGN KEY (contributor_id) REFERENCES contributors(id)
          );`
        );

        // Expenses table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            sms_content TEXT,
            sms_sender TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            approved INTEGER DEFAULT 0,
            synced_to_sheets INTEGER DEFAULT 0,
            notes TEXT
          );`
        );

        // SMS messages table (for processing)
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sms_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            date DATETIME NOT NULL,
            type TEXT,
            processed INTEGER DEFAULT 0,
            matched_contributor_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (matched_contributor_id) REFERENCES contributors(id)
          );`
        );

        // Settings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
          );`
        );

        // Create indexes for better performance
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(date);`
        );
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);`
        );
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_sms_processed ON sms_messages(processed);`
        );
      },
      (error) => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

export const getDB = () => db;

// Contributor operations
export const addContributor = (name, phone, email) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO contributors (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getContributors = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM contributors WHERE active = 1 ORDER BY name',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateContributorBalance = (contributorId, amount) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE contributors 
         SET balance = balance + ?, 
             total_contributed = total_contributed + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [amount, amount, contributorId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Contribution operations
export const addContribution = (contributorId, amount, source, smsContent, smsSender, transactionRef, notes) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO contributions 
         (contributor_id, amount, source, sms_content, sms_sender, transaction_ref, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [contributorId, amount, source, smsContent, smsSender, transactionRef, notes],
        (_, result) => {
          // Update contributor balance
          updateContributorBalance(contributorId, amount)
            .then(() => resolve(result.insertId))
            .catch((error) => reject(error));
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getContributions = (limit = 50) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT c.*, contrib.name as contributor_name 
         FROM contributions c
         LEFT JOIN contributors contrib ON c.contributor_id = contrib.id
         ORDER BY c.date DESC
         LIMIT ?`,
        [limit],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

// Expense operations
export const addExpense = (amount, category, description, smsContent, smsSender, notes) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO expenses 
         (amount, category, description, sms_content, sms_sender, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [amount, category, description, smsContent, smsSender, notes],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getExpenses = (limit = 50) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM expenses 
         ORDER BY date DESC
         LIMIT ?`,
        [limit],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const approveExpense = (expenseId) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE expenses SET approved = 1 WHERE id = ?',
        [expenseId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// SMS operations
export const addSMSMessage = (sender, content, date, type) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO sms_messages (sender, content, date, type) VALUES (?, ?, ?, ?)',
        [sender, content, date, type],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnprocessedSMS = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM sms_messages WHERE processed = 0 ORDER BY date DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const markSMSAsProcessed = (smsId, contributorId = null) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE sms_messages SET processed = 1, matched_contributor_id = ? WHERE id = ?',
        [contributorId, smsId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Settings operations
export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT value FROM settings WHERE key = ?',
        [key],
        (_, { rows: { _array } }) => {
          resolve(_array.length > 0 ? _array[0].value : null);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const setSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Dashboard statistics
export const getDashboardStats = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      let stats = {};
      
      // Total contributions
      tx.executeSql(
        'SELECT COALESCE(SUM(amount), 0) as total FROM contributions',
        [],
        (_, { rows: { _array } }) => {
          stats.totalContributions = _array[0].total;
        }
      );
      
      // Total expenses
      tx.executeSql(
        'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE approved = 1',
        [],
        (_, { rows: { _array } }) => {
          stats.totalExpenses = _array[0].total;
        }
      );
      
      // Pending expenses
      tx.executeSql(
        'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE approved = 0',
        [],
        (_, { rows: { _array } }) => {
          stats.pendingExpenses = _array[0].total;
        }
      );
      
      // Active contributors
      tx.executeSql(
        'SELECT COUNT(*) as count FROM contributors WHERE active = 1',
        [],
        (_, { rows: { _array } }) => {
          stats.activeContributors = _array[0].count;
        }
      );
      
      // Current balance
      tx.executeSql(
        `SELECT 
          (SELECT COALESCE(SUM(amount), 0) FROM contributions) -
          (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE approved = 1)
         as balance`,
        [],
        (_, { rows: { _array } }) => {
          stats.currentBalance = _array[0].balance;
          resolve(stats);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export default db;

