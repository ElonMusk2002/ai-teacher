export class Cache {
  private cache: Map<string, { value: any; expires: number }> = new Map();

  set(key: string, value: any, ttl: number) {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expires });
  }
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  archive(key: string) {
    const item = this.cache.get(key);
    if (item) {
      const archive = JSON.parse(localStorage.getItem("archive") || "[]");
      archive.push(item);
      localStorage.setItem("archive", JSON.stringify(archive));
      this.cache.delete(key);
    }
  }
}
