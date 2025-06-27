#!/bin/bash

# MySQL Docker Deployment Script for Cloud VM
# Run this on your Cloud VM (DigitalOcean, AWS EC2, etc.)

echo "🐳 Deploying MySQL for Gagambi on Cloud VM..."

# Create directory for MySQL data
mkdir -p ~/gagambi-mysql/data
cd ~/gagambi-mysql

# Create init.sql with schema
cat > init.sql << 'EOF'
-- Gagambi Database Schema
CREATE DATABASE IF NOT EXISTS gagambi_db;
USE gagambi_db;

-- Users table (created by SQLAlchemy, but we define it here too)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrichments table
CREATE TABLE IF NOT EXISTS enrichments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255),
    creative_url TEXT,
    predicted_score DECIMAL(3,1),
    judged_score DECIMAL(3,1),
    status ENUM('pending', 'auto-tagged', 'human-reviewed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand (brand_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Scraped posts table
CREATE TABLE IF NOT EXISTS scraped_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(255),
    platform ENUM('Facebook', 'Instagram', 'Twitter', 'LinkedIn') NOT NULL,
    content TEXT,
    url TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enriched BOOLEAN DEFAULT FALSE,
    INDEX idx_brand (brand),
    INDEX idx_platform (platform),
    INDEX idx_enriched (enriched)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Judge results table
CREATE TABLE IF NOT EXISTS judge_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_name VARCHAR(255),
    judge_name VARCHAR(255),
    llm_score DECIMAL(3,1),
    human_score DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_campaign (campaign_name),
    INDEX idx_judge (judge_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO enrichments (brand_name, creative_url, predicted_score, judged_score, status) VALUES
('Nike', 'https://example.com/nike-ad1', 8.5, 8.2, 'human-reviewed'),
('Adidas', 'https://example.com/adidas-ad1', 7.8, 8.0, 'auto-tagged'),
('Puma', 'https://example.com/puma-ad1', 6.9, 7.1, 'pending');

INSERT INTO scraped_posts (brand, platform, content, url) VALUES
('Nike', 'Instagram', 'Just Do It - New Collection 2024', 'https://instagram.com/p/abc123'),
('Adidas', 'Facebook', 'Impossible is Nothing Campaign', 'https://facebook.com/adidas/posts/123'),
('Puma', 'Twitter', 'Forever Faster - Limited Edition', 'https://twitter.com/puma/status/456');

INSERT INTO judge_results (campaign_name, judge_name, llm_score, human_score) VALUES
('Nike Summer 2024', 'Judge A', 8.5, 8.2),
('Adidas World Cup', 'Judge B', 7.8, 8.0),
('Puma Lifestyle', 'Judge A', 6.9, 7.1);
EOF

# Stop and remove existing container if any
docker stop mysql-gagambi 2>/dev/null
docker rm mysql-gagambi 2>/dev/null

# Run MySQL container with persistent storage
docker run -d \
  --name mysql-gagambi \
  --restart unless-stopped \
  -e MYSQL_ROOT_PASSWORD='R@nd0mPA$2025!' \
  -e MYSQL_DATABASE=gagambi_db \
  -e MYSQL_USER=TBWA \
  -e MYSQL_PASSWORD='R@nd0mPA$2025!' \
  -p 3308:3306 \
  -v ~/gagambi-mysql/data:/var/lib/mysql \
  -v ~/gagambi-mysql/init.sql:/docker-entrypoint-initdb.d/init.sql \
  mysql:8.0

echo "⏳ Waiting for MySQL to initialize..."
sleep 30

# Test connection
echo "🧪 Testing connection..."
docker exec mysql-gagambi mysql -u TBWA -p'R@nd0mPA$2025!' -e "SELECT 'MySQL is ready!' as Status;" gagambi_db

# Show container status
echo ""
echo "📊 Container status:"
docker ps | grep mysql-gagambi

# Firewall rules (uncomment based on your cloud provider)
echo ""
echo "🔥 Don't forget to open port 3308 in your firewall!"
echo ""
echo "For DigitalOcean:"
echo "  ufw allow 3308/tcp"
echo ""
echo "For AWS EC2:"
echo "  Add inbound rule for port 3308 in Security Group"
echo ""
echo "✅ MySQL is running on port 3308"
echo "   Host: $(curl -s ifconfig.me)"
echo "   Port: 3308"
echo "   User: TBWA"
echo "   Pass: R@nd0mPA\$2025!"