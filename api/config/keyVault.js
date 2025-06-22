const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

class KeyVaultConfig {
  constructor() {
    this.client = null;
    this.secrets = {};
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const keyVaultName = process.env.KEYVAULT_NAME;
      
      if (!keyVaultName) {
        console.log('🔧 No KEYVAULT_NAME found, using local environment variables');
        this.loadFromEnv();
        return;
      }

      const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(keyVaultUrl, credential);

      console.log('🔐 Connecting to Azure Key Vault...');
      await this.loadSecretsFromVault();
      console.log('✅ Key Vault secrets loaded successfully');
      
    } catch (error) {
      console.warn('⚠️  Key Vault connection failed, falling back to local env:', error.message);
      this.loadFromEnv();
    }
    
    this.isInitialized = true;
  }

  async loadSecretsFromVault() {
    const secretNames = [
      'scout-db-server',
      'scout-db-database', 
      'scout-db-username',
      'scout-db-password',
      'scout-jwt-secret'
    ];

    for (const secretName of secretNames) {
      try {
        const secret = await this.client.getSecret(secretName);
        this.secrets[secretName] = secret.value;
      } catch (error) {
        console.warn(`⚠️  Failed to load secret ${secretName}:`, error.message);
      }
    }
  }

  loadFromEnv() {
    console.log('🔧 Loading configuration from local environment variables');
    this.secrets = {
      'scout-db-server': process.env.AZURE_DB_SERVER || 'localhost',
      'scout-db-database': process.env.AZURE_DB_DATABASE || 'scout_analytics',
      'scout-db-username': process.env.AZURE_DB_USERNAME || 'scout_admin',
      'scout-db-password': process.env.AZURE_DB_PASSWORD || 'dev-password',
      'scout-jwt-secret': process.env.JWT_SECRET || 'dev-secret-key'
    };
  }

  getSecret(secretName) {
    if (!this.isInitialized) {
      throw new Error('KeyVault not initialized. Call initialize() first.');
    }
    return this.secrets[secretName];
  }

  getDatabaseConfig() {
    return {
      server: this.getSecret('scout-db-server'),
      database: this.getSecret('scout-db-database'),
      user: this.getSecret('scout-db-username'),
      password: this.getSecret('scout-db-password'),
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000
      }
    };
  }

  getJWTSecret() {
    return this.getSecret('scout-jwt-secret');
  }
}

// Singleton instance
const keyVaultConfig = new KeyVaultConfig();

module.exports = keyVaultConfig;
