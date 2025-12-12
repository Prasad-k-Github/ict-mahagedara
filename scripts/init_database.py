"""
Database Initialization Script
Creates the database and tables for Prasad K. Gamage Learning Assistant
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "prasad_learning_assistant")

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without database)
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"✅ Database '{DB_NAME}' created successfully (or already exists)")
            
            # Use the database
            cursor.execute(f"USE {DB_NAME}")
            
            # Create users table
            create_users_table = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                birthday DATE NOT NULL,
                gender VARCHAR(10) NOT NULL,
                grade_level INT NOT NULL,
                language VARCHAR(20) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                INDEX idx_email (email),
                INDEX idx_phone (phone_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            
            cursor.execute(create_users_table)
            print("✅ Users table created successfully (or already exists)")
            
            # Show table structure
            cursor.execute("DESCRIBE users")
            print("\n📋 Users table structure:")
            for row in cursor.fetchall():
                print(f"   - {row[0]}: {row[1]}")
            
            cursor.close()
            connection.close()
            print("\n✅ Database initialization completed successfully!")
            return True
            
    except Error as e:
        print(f"❌ Error: {e}")
        return False

def test_database_connection():
    """Test the database connection"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"✅ Connected to MySQL Server version {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"✅ Current users in database: {user_count}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ Database connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Prasad K. Gamage Learning Assistant - Database Setup")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  Host: {DB_HOST}")
    print(f"  Port: {DB_PORT}")
    print(f"  User: {DB_USER}")
    print(f"  Database: {DB_NAME}")
    print("\n" + "=" * 60 + "\n")
    
    # Create database and tables
    if create_database():
        print("\n" + "=" * 60)
        print("Testing database connection...")
        print("=" * 60 + "\n")
        test_database_connection()
        
        print("\n" + "=" * 60)
        print("✅ Setup completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Start the API server: python backend/api_server.py")
        print("3. Open frontend/login.html in your browser")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ Setup failed! Please check the error messages above.")
        print("=" * 60)
