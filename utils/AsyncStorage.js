// utils/AsyncStorage.js - Clean version without migration logic
import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageManager {
  constructor() {
    this.isReady = false;
  }

  async initialize() {
    try {
      console.log('AsyncStorage initializing...');
      this.isReady = true;
      console.log('AsyncStorage ready!');
      return { success: true };
    } catch (error) {
      console.error('AsyncStorage initialization failed:', error);
      return { success: false, error };
    }
  }

  async setItem(key, value) {
    try {
      if (!this.isReady) await this.initialize();

      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }

      const prefixedKey = `@cargoCalc:${key}`;
      await AsyncStorage.setItem(prefixedKey, value);
      console.log(`AsyncStorage: Set ${key}`);
    } catch (error) {
      console.error(`AsyncStorage setItem failed for ${key}:`, error);
    }
  }

  async getItem(key) {
    try {
      if (!this.isReady) await this.initialize();

      const prefixedKey = `@cargoCalc:${key}`;
      const value = await AsyncStorage.getItem(prefixedKey);
      console.log(`AsyncStorage: Get ${key}`);
      return value;
    } catch (error) {
      console.error(`AsyncStorage getItem failed for ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      if (!this.isReady) await this.initialize();

      const prefixedKey = `@cargoCalc:${key}`;
      await AsyncStorage.removeItem(prefixedKey);
      console.log(`AsyncStorage: Removed ${key}`);
    } catch (error) {
      console.error(`AsyncStorage removeItem failed for ${key}:`, error);
    }
  }
}

// Tekil örnek export edilir
const asyncStorageManager = new AsyncStorageManager();
export default asyncStorageManager;