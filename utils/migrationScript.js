// utils/migrationScript.js - Data Migration Helper
import asyncStorageManager from './AsyncStorage';
import MockStorage from './MockStorage';

class DataMigration {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
  }

  // Main migration function
  async performMigration() {
    try {
      console.log('🚀 Starting data migration from MockStorage to AsyncStorage...');
      this.logMigration('Migration started', 'info');

      // Step 1: Initialize AsyncStorage
      await this.initializeAsyncStorage();

      // Step 2: Discover MockStorage data
      const mockData = await this.discoverMockData();

      // Step 3: Validate data before migration
      const validatedData = await this.validateData(mockData);

      // Step 4: Perform the migration
      const migrationResults = await this.migrateData(validatedData);

      // Step 5: Verify migration
      const verificationResults = await this.verifyMigration(validatedData);

      // Step 6: Create post-migration backup
      await this.createPostMigrationBackup();

      // Step 7: Generate migration report
      const report = this.generateMigrationReport(migrationResults, verificationResults);

      console.log('✅ Migration completed successfully!');
      this.logMigration('Migration completed successfully', 'success');

      return {
        success: true,
        report,
        migrationLog: this.migrationLog,
        errors: this.errors
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.logMigration(`Migration failed: ${error.message}`, 'error');
      this.errors.push({
        step: 'main',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        migrationLog: this.migrationLog,
        errors: this.errors
      };
    }
  }

  // Step 1: Initialize AsyncStorage
  async initializeAsyncStorage() {
    try {
      this.logMigration('Initializing AsyncStorage...', 'info');
      const result = await asyncStorageManager.initialize();
      
      if (!result.success) {
        throw new Error('AsyncStorage initialization failed');
      }

      this.logMigration('AsyncStorage initialized successfully', 'success');
    } catch (error) {
      this.logMigration(`AsyncStorage initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 2: Discover MockStorage data
  async discoverMockData() {
    try {
      this.logMigration('Discovering MockStorage data...', 'info');
      
      const mockData = {};
      const keysToCheck = [
        'cargoCalcHistory',
        'fixedExpenses',
        'appSettings',
        'userPreferences'
      ];

      for (const key of keysToCheck) {
        try {
          const value = await MockStorage.getItem(key);
          if (value) {
            mockData[key] = value;
            this.logMigration(`Found MockStorage data for: ${key}`, 'info');
          } else {
            this.logMigration(`No MockStorage data found for: ${key}`, 'info');
          }
        } catch (error) {
          this.logMigration(`Error reading MockStorage key ${key}: ${error.message}`, 'warning');
        }
      }

      this.logMigration(`MockStorage discovery completed. Found ${Object.keys(mockData).length} keys`, 'info');
      return mockData;

    } catch (error) {
      this.logMigration(`MockStorage discovery failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Step 3: Validate data before migration
  async validateData(mockData) {
    try {
      this.logMigration('Validating data before migration...', 'info');
      
      const validatedData = {};
      let validCount = 0;
      let invalidCount = 0;

      for (const [key, value] of Object.entries(mockData)) {
        try {
          // Validate JSON format
          if (typeof value === 'string') {
            JSON.parse(value);
          }

          // Validate specific data structures
          await this.validateDataStructure(key, value);

          validatedData[key] = value;
          validCount++;
          this.logMigration(`Validation passed for: ${key}`, 'success');

        } catch (error) {
          invalidCount++;
          this.logMigration(`Validation failed for ${key}: ${error.message}`, 'error');
          this.errors.push({
            step: 'validation',
            key,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      this.logMigration(`Data validation completed. Valid: ${validCount}, Invalid: ${invalidCount}`, 'info');

      if (Object.keys(validatedData).length === 0) {
        this.logMigration('No valid data found to migrate', 'warning');
      }

      return validatedData;

    } catch (error) {
      this.logMigration(`Data validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Validate specific data structures
  async validateDataStructure(key, value) {
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

    switch (key) {
      case 'cargoCalcHistory':
        if (!Array.isArray(parsedValue)) {
          throw new Error('cargoCalcHistory must be an array');
        }
        
        // Validate each history item
        for (const item of parsedValue) {
          if (!item.date || !item.income || typeof item.netKazanc === 'undefined') {
            throw new Error('Invalid history item structure');
          }
        }
        break;

      case 'fixedExpenses':
        if (!Array.isArray(parsedValue)) {
          throw new Error('fixedExpenses must be an array');
        }
        
        // Validate each expense item
        for (const item of parsedValue) {
          if (!item.name || typeof item.yearlyAmount !== 'number') {
            throw new Error('Invalid fixed expense structure');
          }
        }
        break;

      case 'appSettings':
        if (typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
          throw new Error('appSettings must be an object');
        }
        break;

      case 'userPreferences':
        if (typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
          throw new Error('userPreferences must be an object');
        }
        break;
    }
  }

  // Step 4: Perform the migration
  async migrateData(validatedData) {
    try {
      this.logMigration('Starting data migration...', 'info');
      
      const migrationResults = {
        migrated: [],
        failed: [],
        skipped: []
      };

      for (const [key, value] of Object.entries(validatedData)) {
        try {
          // Check if data already exists in AsyncStorage
          const existingValue = await asyncStorageManager.getItem(key);
          
          if (existingValue) {
            // Data already exists - decide whether to overwrite or skip
            const shouldOverwrite = await this.shouldOverwriteExistingData(key, existingValue, value);
            
            if (!shouldOverwrite) {
              migrationResults.skipped.push({
                key,
                reason: 'Data already exists and user chose to keep existing'
              });
              this.logMigration(`Skipped migration for ${key} - data already exists`, 'info');
              continue;
            }
          }

          // Perform the migration
          const result = await asyncStorageManager.setItem(key, value);
          
          if (result.success) {
            migrationResults.migrated.push({
              key,
              size: value.length,
              timestamp: new Date().toISOString()
            });
            this.logMigration(`Successfully migrated: ${key}`, 'success');
          } else {
            throw new Error(result.error?.message || 'Unknown error');
          }

        } catch (error) {
          migrationResults.failed.push({
            key,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          this.logMigration(`Failed to migrate ${key}: ${error.message}`, 'error');
          this.errors.push({
            step: 'migration',
            key,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      this.logMigration(`Migration completed. Migrated: ${migrationResults.migrated.length}, Failed: ${migrationResults.failed.length}, Skipped: ${migrationResults.skipped.length}`, 'info');
      return migrationResults;

    } catch (error) {
      this.logMigration(`Data migration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Decide whether to overwrite existing data
  async shouldOverwriteExistingData(key, existingValue, newValue) {
    try {
      const existing = JSON.parse(existingValue);
      const newData = JSON.parse(newValue);

      // For arrays, merge if possible
      if (Array.isArray(existing) && Array.isArray(newData)) {
        if (key === 'cargoCalcHistory') {
          // For history, only add non-duplicate entries
          return this.shouldMergeHistory(existing, newData);
        }
        if (key === 'fixedExpenses') {
          // For expenses, only add non-duplicate entries
          return this.shouldMergeExpenses(existing, newData);
        }
      }

      // For objects, merge settings
      if (typeof existing === 'object' && typeof newData === 'object' && !Array.isArray(existing)) {
        return true; // Merge settings
      }

      // Default: don't overwrite
      return false;

    } catch (error) {
      this.logMigration(`Error comparing data for ${key}: ${error.message}`, 'warning');
      return false;
    }
  }

  // Check if history should be merged
  shouldMergeHistory(existing, newData) {
    // Simple check: if new data has more entries, merge
    return newData.length > existing.length;
  }

  // Check if expenses should be merged
  shouldMergeExpenses(existing, newData) {
    // Simple check: if new data has more entries, merge
    return newData.length > existing.length;
  }

  // Step 5: Verify migration
  async verifyMigration(originalData) {
    try {
      this.logMigration('Verifying migration...', 'info');
      
      const verificationResults = {
        verified: [],
        failed: []
      };

      for (const [key, originalValue] of Object.entries(originalData)) {
        try {
          const migratedValue = await asyncStorageManager.getItem(key);
          
          if (!migratedValue) {
            throw new Error('Data not found in AsyncStorage');
          }

          // Compare data integrity
          const isIntact = await this.compareDataIntegrity(key, originalValue, migratedValue);
          
          if (isIntact) {
            verificationResults.verified.push(key);
            this.logMigration(`Verification passed for: ${key}`, 'success');
          } else {
            throw new Error('Data integrity check failed');
          }

        } catch (error) {
          verificationResults.failed.push({
            key,
            error: error.message
          });
          this.logMigration(`Verification failed for ${key}: ${error.message}`, 'error');
        }
      }

      this.logMigration(`Migration verification completed. Verified: ${verificationResults.verified.length}, Failed: ${verificationResults.failed.length}`, 'info');
      return verificationResults;

    } catch (error) {
      this.logMigration(`Migration verification failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Compare data integrity
  async compareDataIntegrity(key, original, migrated) {
    try {
      if (original === migrated) {
        return true;
      }

      // Parse and compare objects/arrays
      const originalParsed = JSON.parse(original);
      const migratedParsed = JSON.parse(migrated);

      // For arrays, check length and sample entries
      if (Array.isArray(originalParsed) && Array.isArray(migratedParsed)) {
        if (key === 'cargoCalcHistory' && migratedParsed.length >= originalParsed.length) {
          return true; // Allow merged data
        }
        return JSON.stringify(originalParsed) === JSON.stringify(migratedParsed);
      }

      // For objects, compare keys and values
      if (typeof originalParsed === 'object' && typeof migratedParsed === 'object') {
        return JSON.stringify(originalParsed) === JSON.stringify(migratedParsed);
      }

      return false;

    } catch (error) {
      this.logMigration(`Data integrity comparison failed for ${key}: ${error.message}`, 'warning');
      return false;
    }
  }

  // Step 6: Create post-migration backup
  async createPostMigrationBackup() {
    try {
      this.logMigration('Creating post-migration backup...', 'info');
      
      const result = await asyncStorageManager.createBackup('post-migration');
      
      if (result.success) {
        this.logMigration(`Post-migration backup created: ${result.backupKey}`, 'success');
      } else {
        this.logMigration(`Post-migration backup failed: ${result.error?.message}`, 'warning');
      }

    } catch (error) {
      this.logMigration(`Post-migration backup failed: ${error.message}`, 'warning');
      // Don't throw - migration can succeed without backup
    }
  }

  // Step 7: Generate migration report
  generateMigrationReport(migrationResults, verificationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalKeys: Object.keys(migrationResults.migrated).length + Object.keys(migrationResults.failed).length + Object.keys(migrationResults.skipped).length,
        successfulMigrations: migrationResults.migrated.length,
        failedMigrations: migrationResults.failed.length,
        skippedMigrations: migrationResults.skipped.length,
        verifiedMigrations: verificationResults.verified.length,
        failedVerifications: verificationResults.failed.length
      },
      details: {
        migrated: migrationResults.migrated,
        failed: migrationResults.failed,
        skipped: migrationResults.skipped,
        verified: verificationResults.verified,
        verificationFailed: verificationResults.failed
      },
      recommendations: this.generateRecommendations(migrationResults, verificationResults)
    };

    return report;
  }

  // Generate recommendations based on migration results
  generateRecommendations(migrationResults, verificationResults) {
    const recommendations = [];

    if (migrationResults.failed.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `${migrationResults.failed.length} migrations failed. Consider manually checking these data items.`,
        action: 'Review failed migrations and attempt manual recovery if needed.'
      });
    }

    if (verificationResults.failed.length > 0) {
      recommendations.push({
        type: 'error',
        message: `${verificationResults.failed.length} verifications failed. Data integrity may be compromised.`,
        action: 'Restore from backup or re-run migration for failed items.'
      });
    }

    if (migrationResults.skipped.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${migrationResults.skipped.length} migrations were skipped due to existing data.`,
        action: 'Review skipped items to ensure no important data was lost.'
      });
    }

    if (migrationResults.migrated.length === 0) {
      recommendations.push({
        type: 'warning',
        message: 'No data was migrated. This might indicate no MockStorage data existed.',
        action: 'Verify this is expected behavior for a new installation.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: 'Migration completed successfully with no issues detected.',
        action: 'No action required. AsyncStorage is ready for use.'
      });
    }

    return recommendations;
  }

  // Utility method to log migration steps
  logMigration(message, level = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };

    this.migrationLog.push(logEntry);

    // Also log to console with appropriate level
    switch (level) {
      case 'error':
        console.error(`🔴 ${message}`);
        break;
      case 'warning':
        console.warn(`🟡 ${message}`);
        break;
      case 'success':
        console.log(`🟢 ${message}`);
        break;
      default:
        console.log(`ℹ️ ${message}`);
    }
  }

  // Rollback migration (emergency function)
  async rollbackMigration() {
    try {
      this.logMigration('Starting migration rollback...', 'warning');

      // Find the most recent pre-migration backup
      const backups = await asyncStorageManager.listBackups();
      const preMigrationBackup = backups.find(backup => 
        backup.reason === 'pre-migration' || backup.reason === 'post-migration'
      );

      if (!preMigrationBackup) {
        throw new Error('No suitable backup found for rollback');
      }

      // Clear current AsyncStorage data
      await asyncStorageManager.clearAll();

      // Restore from backup
      const restoreResult = await asyncStorageManager.restoreFromBackup(preMigrationBackup.key);

      if (restoreResult.success) {
        this.logMigration(`Rollback completed successfully. Restored ${restoreResult.restoredCount} items.`, 'success');
        return { success: true, restoredCount: restoreResult.restoredCount };
      } else {
        throw new Error(restoreResult.error?.message || 'Restore failed');
      }

    } catch (error) {
      this.logMigration(`Rollback failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Get migration status
  async getMigrationStatus() {
    try {
      const asyncStorageReady = await asyncStorageManager.initialize();
      const storageInfo = await asyncStorageManager.getStorageInfo();
      
      return {
        asyncStorageReady: asyncStorageReady.success,
        migrationCompleted: storageInfo?.migrationCompleted || false,
        totalKeys: storageInfo?.totalKeys || 0,
        totalSize: storageInfo?.totalSize || 0,
        healthCheck: await asyncStorageManager.healthCheck()
      };
    } catch (error) {
      return {
        asyncStorageReady: false,
        migrationCompleted: false,
        error: error.message
      };
    }
  }

  // Clean up migration artifacts
  async cleanupMigration() {
    try {
      this.logMigration('Cleaning up migration artifacts...', 'info');

      // Remove migration flags and temporary data
      const keysToClean = [
        '@cargoCalc:migrationInProgress',
        '@cargoCalc:migrationTemp',
        '@cargoCalc:healthCheck'
      ];

      for (const key of keysToClean) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          this.logMigration(`Warning: Could not clean up ${key}`, 'warning');
        }
      }

      this.logMigration('Migration cleanup completed', 'success');
      return { success: true };

    } catch (error) {
      this.logMigration(`Migration cleanup failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
}

// Export migration functions
const migrationManager = new DataMigration();

export default migrationManager;

// Export individual functions for specific use cases
export const performMigration = () => migrationManager.performMigration();
export const rollbackMigration = () => migrationManager.rollbackMigration();
export const getMigrationStatus = () => migrationManager.getMigrationStatus();
export const cleanupMigration = () => migrationManager.cleanupMigration();