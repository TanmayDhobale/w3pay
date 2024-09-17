export class Cache {
    private store: Map<string, { value: any; expiry: number }>;
  
    constructor() {
      this.store = new Map();
    }
  
    set(key: string, value: any, expiry: number) {
      this.store.set(key, { value, expiry });
    }
  
    get(key: string) {
      return this.store.get(key);
    } 

    delete(key: string) {
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }

    has(key: string) {
        return this.store.has(key);
    }

    size() {
        return this.store.size;
    }

    keys() {
        return this.store.keys();
    }

    values() {
        return this.store.values();
    }
    

  }