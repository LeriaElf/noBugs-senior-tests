import http from 'node:http';

/**
 * Lightweight HTTP mock for the fraud-detection service.
 * Backend calls this instead of the real FraudService and gets a pre-configured JSON response.
 *
 * Usage:
 *   const mock = new FraudMockServer({ port: 8089, response: { status: 'SUCCESS', decision: 'APPROVED', ... } });
 *   await mock.start();
 *   // ... run test ...
 *   await mock.stop();
 */
export class FraudMockServer {
  constructor({ port = 8089, response = {} } = {}) {
    this.port = port;
    this.response = response;
    this.servers = [];
  }

  async start() {
    const ports = [this.port, 8080, 8089].filter((v, i, a) => a.indexOf(v) === i);

    for (const p of ports) {
      try {
        const srv = await this.#listen(p);
        this.servers.push(srv);
      } catch {
        // port already in use — skip silently
      }
    }

    if (this.servers.length === 0) {
      throw new Error(`FraudMockServer: could not bind to any port from [${ports}]`);
    }
  }

  async stop() {
    await Promise.all(this.servers.map(srv => new Promise(resolve => srv.close(resolve))));
    this.servers = [];
  }

  #listen(port) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(this.response);
      const srv = http.createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
      });
      srv.on('error', reject);
      srv.listen(port, '0.0.0.0', () => resolve(srv));
    });
  }
}
