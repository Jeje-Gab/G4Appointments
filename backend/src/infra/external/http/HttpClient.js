import axios from 'axios';

// Thin wrapper around axios so gateways depend on a small, swappable surface
// instead of axios directly. One instance per external base URL.
export class HttpClient {
  constructor({ baseURL, timeout = 5000 } = {}) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: { 'Content-Type': 'application/json' },
      // We handle non-2xx ourselves where it matters (e.g. 404 -> null).
      validateStatus: () => true,
    });
  }

  async get(path, config = {}) {
    return this.client.get(path, config);
  }

  async post(path, body = {}, config = {}) {
    return this.client.post(path, body, config);
  }
}
