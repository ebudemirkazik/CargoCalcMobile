// utils/MockStorage.js - Shared Mock Storage for React Native
class MockStorageClass {
  constructor() {
    this.data = {};
  }

  async getItem(key) {
    console.log(`MockStorage.getItem(${key}):`, this.data[key]);
    return this.data[key] || null;
  }

  async setItem(key, value) {
    console.log(`MockStorage.setItem(${key}):`, value);
    this.data[key] = value;
    return Promise.resolve();
  }

  async removeItem(key) {
    console.log(`MockStorage.removeItem(${key})`);
    delete this.data[key];
    return Promise.resolve();
  }

  // Debug için - tüm datayı göster
  getAllData() {
    console.log('MockStorage - Tüm data:', this.data);
    return this.data;
  }
}

// Singleton instance - tüm componentlerde aynısını kullan
const MockStorage = new MockStorageClass();

export default MockStorage;