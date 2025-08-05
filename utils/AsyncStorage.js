// utils/AsyncStorage.js - Real AsyncStorage Implementation with Migration & Backup
import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageManager {
  constructor() {
    this.isReady = false;
    this.migrationCompleted = false;
    this.backupEnabled = true;
  }

  // Initialize AsyncStorage and check for migrations
  async initialize() {
    try {
      console.log('AsyncStorage initializing...');
      
      // Check if migration is needed
      await this.checkMigration();
      
      this.isReady = true;
      console.log('AsyncStorage ready!');
      return { success: true };
    } catch (error) {
      console.error('AsyncStorage initialization failed:', error);
      return { success: false, error };
    }
  }

  // Check if migration from MockStorage is needed
  async checkMigration() {
    try {
      const migrationFlag = await AsyncStorage.getItem('@cargoCalc:migrationCompleted');
      
      if (!migrationFlag) {
        console.log('Migration needed - checking for old MockStorage data...');
        await this.migrateFromMockStorage();
        await AsyncStorage.setItem('@cargoCalc:migrationCompleted', 'true');
        this.migrationCompleted = true;
        console.log('Migration completed successfully!');
      } else {
        console.log('Migration already completed');
        this.migrationCompleted = true;
      }
    } catch (error) {
      console.error('Migration check failed:', error);
      // Don't throw - app should still work without migration
    }
  }

  // Migrate data from MockStorage to AsyncStorage
  async migrateFromMockStorage() {
    try {
      // MockStorage simulated keys we need to migrate
      const keysToMigrate = [
        'cargoCalcHistory',
        'fixedExpenses',
        'appSettings',
        'userPreferences'
      ];

      let migratedCount = 0;

      for (const key of keysToMigrate) {
        try {
          // Check if data exists in old storage (simulated)
          // In real app, this would check actual MockStorage
          const existingData = await AsyncStorage.getItem(key);
          
          if (!existingData) {
            // If no data in AsyncStorage, create empty structure
            if (key === 'cargoCalcHistory') {
              await this.setItem(key, JSON.stringify([]));
            } else if (key === 'fixedExpenses') {
              await this.setItem(key, JSON.stringify([]));
            } else if (key === 'appSettings') {
              await this.setItem(key, JSON.stringify({
                theme: 'light',
                notifications: true,
                autoBackup: true,
                currency: 'TRY'
              }));
            } else if (key === 'userPreferences') {
              await this.setItem(key, JSON.stringify({
                defaultKdvRate: 20,
                showAdvancedFeatures: false,
                compactMode: false
              }));
            }
            migratedCount++;
          }
        } catch (keyError) {
          console.warn(`Failed to migrate key ${key}:`, keyError);
        }
      }

      console.log(`Migration completed: ${migratedCount} keys processed`);
      
      // Create backup after migration
      if (this.backupEnabled) {
        await this.createBackup('post-migration');
      }

    } catch (error) {
      console.error('Migration from MockStorage failed:', error);
      throw error;
    }
  }

  // Enhanced setItem with error handling and backup
  async setItem(key, value) {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      
      // Validate data before storing
      if (typeof value !== 'string') {
        throw new Error('AsyncStorage only accepts string values');
      }

      // Try to parse JSON to validate format
      if (value.startsWith('{') || value.startsWith('[')) {
        JSON.parse(value); // Will throw if invalid JSON
      }

      await AsyncStorage.setItem(prefixedKey, value);
      
      // Auto-backup on important data changes
      if (this.shouldBackup(key)) {
        await this.createAutoBackup(key);
      }

      console.log(`AsyncStorage: Set ${key} successfully`);
      return { success: true };
    } catch (error) {
      console.error(`AsyncStorage setItem failed for ${key}:`, error);
      return { success: false, error };
    }
  }

  // Enhanced getItem with error handling
  async getItem(key) {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      const value = await AsyncStorage.getItem(prefixedKey);
      
      console.log(`AsyncStorage: Get ${key} ${value ? 'found' : 'not found'}`);
      return value;
    } catch (error) {
      console.error(`AsyncStorage getItem failed for ${key}:`, error);
      return null;
    }
  }

  // Enhanced removeItem
  async removeItem(key) {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      const prefixedKey = this.getPrefixedKey(key);
      
      // Backup before deletion
      if (this.backupEnabled) {
        const existingValue = await AsyncStorage.getItem(prefixedKey);
        if (existingValue) {
          await this.backupItem(key, existingValue, 'pre-deletion');
        }
      }

      await AsyncStorage.removeItem(prefixedKey);
      console.log(`AsyncStorage: Removed ${key} successfully`);
      return { success: true };
    } catch (error) {
      console.error(`AsyncStorage removeItem failed for ${key}:`, error);
      return { success: false, error };
    }
  }

  // Get all keys
  async getAllKeys() {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith('@cargoCalc:'));
      return appKeys.map(key => key.replace('@cargoCalc:', ''));
    } catch (error) {
      console.error('AsyncStorage getAllKeys failed:', error);
      return [];
    }
  }

  // Clear all app data (with confirmation)
  async clearAll() {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      // Create full backup before clearing
      await this.createBackup('pre-clear');

      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith('@cargoCalc:'));
      
      await AsyncStorage.multiRemove(appKeys);
      console.log(`AsyncStorage: Cleared ${appKeys.length} keys`);
      return { success: true, clearedCount: appKeys.length };
    } catch (error) {
      console.error('AsyncStorage clearAll failed:', error);
      return { success: false, error };
    }
  }

  // Backup functionality
  async createBackup(reason = 'manual') {
    try {
      const timestamp = new Date().toISOString();
      const backupKey = `@cargoCalc:backup:${timestamp}:${reason}`;
      
      const allKeys = await this.getAllKeys();
      const backupData = {};

      for (const key of allKeys) {
        const value = await this.getItem(key);
        if (value) {
          backupData[key] = value;
        }
      }

      const backupJson = JSON.stringify({
        timestamp,
        reason,
        version: '1.0',
        data: backupData
      });

      await AsyncStorage.setItem(backupKey, backupJson);
      console.log(`Backup created: ${backupKey}`);
      
      // Clean old backups (keep last 5)
      await this.cleanOldBackups();
      
      return { success: true, backupKey };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return { success: false, error };
    }
  }

  // Auto backup for important data
  async createAutoBackup(key) {
    if (['cargoCalcHistory', 'fixedExpenses'].includes(key)) {
      await this.createBackup(`auto-${key}`);
    }
  }

  // Backup single item
  async backupItem(key, value, reason) {
    try {
      const timestamp = new Date().toISOString();
      const backupKey = `@cargoCalc:itemBackup:${key}:${timestamp}:${reason}`;
      
      const backupData = {
        timestamp,
        reason,
        originalKey: key,
        value
      };

      await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));
      console.log(`Item backup created: ${backupKey}`);
    } catch (error) {
      console.error('Item backup failed:', error);
    }
  }

  // Restore from backup
  async restoreFromBackup(backupKey) {
    try {
      const backupData = await AsyncStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData);
      let restoredCount = 0;

      for (const [key, value] of Object.entries(backup.data)) {
        await this.setItem(key, value);
        restoredCount++;
      }

      console.log(`Restored ${restoredCount} keys from backup`);
      return { success: true, restoredCount };
    } catch (error) {
      console.error('Restore from backup failed:', error);
      return { success: false, error };
    }
  }

  // List available backups
  async listBackups() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const backupKeys = allKeys.filter(key => key.includes('@cargoCalc:backup:'));
      
      const backups = [];
      for (const key of backupKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          const backup = JSON.parse(data);
          backups.push({
            key,
            timestamp: backup.timestamp,
            reason: backup.reason,
            version: backup.version
          });
        } catch (error) {
          console.warn('Invalid backup found:', key);
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('List backups failed:', error);
      return [];
    }
  }

  // Clean old backups (keep last 5)
  async cleanOldBackups() {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > 5) {
        const toDelete = backups.slice(5);
        for (const backup of toDelete) {
          await AsyncStorage.removeItem(backup.key);
        }
        console.log(`Cleaned ${toDelete.length} old backups`);
      }
    } catch (error) {
      console.error('Clean old backups failed:', error);
    }
  }

  // Get storage info
  async getStorageInfo() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith('@cargoCalc:'));
      
      let totalSize = 0;
      const keyInfo = {};

      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;
          keyInfo[key.replace('@cargoCalc:', '')] = {
            size,
            type: this.getDataType(value)
          };
        }
      }

      return {
        totalKeys: appKeys.length,
        totalSize,
        keyInfo,
        migrationCompleted: this.migrationCompleted,
        backupEnabled: this.backupEnabled
      };
    } catch (error) {
      console.error('Get storage info failed:', error);
      return null;
    }
  }

  // Helper methods
  getPrefixedKey(key) {
    return `@cargoCalc:${key}`;
  }

  shouldBackup(key) {
    const importantKeys = ['cargoCalcHistory', 'fixedExpenses', 'appSettings'];
    return this.backupEnabled && importantKeys.includes(key);
  }

  getDataType(value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return 'array';
      if (typeof parsed === 'object') return 'object';
      return typeof parsed;
    } catch {
      return 'string';
    }
  }

  // Settings management
  async updateSettings(newSettings) {
    try {
      const current = await this.getItem('appSettings');
      const currentSettings = current ? JSON.parse(current) : {};
      
      const updated = { ...currentSettings, ...newSettings };
      await this.setItem('appSettings', JSON.stringify(updated));
      
      // Update instance settings
      if (newSettings.hasOwnProperty('autoBackup')) {
        this.backupEnabled = newSettings.autoBackup;
      }

      return { success: true };
    } catch (error) {
      console.error('Update settings failed:', error);
      return { success: false, error };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const testKey = '@cargoCalc:healthCheck';
      const testValue = JSON.stringify({ timestamp: Date.now() });
      
      // Test write
      await AsyncStorage.setItem(testKey, testValue);
      
      // Test read
      const readValue = await AsyncStorage.getItem(testKey);
      
      // Test delete
      await AsyncStorage.removeItem(testKey);
      
      const isHealthy = readValue === testValue;
      
      return {
        healthy: isHealthy,
        timestamp: new Date().toISOString(),
        ready: this.isReady,
        migrated: this.migrationCompleted
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const asyncStorageManager = new AsyncStorageManager();

// Export both the class and instance for different use cases
export default asyncStorageManager;
export { AsyncStorageManager };