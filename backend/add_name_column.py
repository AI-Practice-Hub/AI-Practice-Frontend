"""
Migration script to add 'name' and 'jira_api_url' columns to users table
Run this script to update the existing database schema
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'name' not in columns:
        print("Adding 'name' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
        conn.commit()
        print("✓ Successfully added 'name' column")
    else:
        print("'name' column already exists")
    
    if 'jira_api_url' not in columns:
        print("Adding 'jira_api_url' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN jira_api_url TEXT")
        conn.commit()
        print("✓ Successfully added 'jira_api_url' column")
    else:
        print("'jira_api_url' column already exists")
    
    conn.close()

if __name__ == "__main__":
    migrate()
