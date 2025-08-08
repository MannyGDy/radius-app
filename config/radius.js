const radius = require('radius');
const dgram = require('dgram');

class RadiusClient {
    constructor(config) {
        this.secret = config.secret || 'testing123';
        this.server = config.server || '127.0.0.1';
        this.port = config.port || 1812;
        this.timeout = config.timeout || 3000;
    }

    // Authenticate user with RADIUS server
    async authenticate(username, password) {
        return new Promise((resolve, reject) => {
            const client = dgram.createSocket('udp4');
            const packet = {
                code: 'Access-Request',
                identifier: Math.floor(Math.random() * 256),
                attributes: [
                    ['User-Name', username],
                    ['User-Password', password],
                    ['NAS-IP-Address', '127.0.0.1'],
                    ['NAS-Identifier', 'radius-app']
                ]
            };

            const encoded = radius.encode(packet);
            
            const timer = setTimeout(() => {
                client.close();
                resolve({ success: false, error: 'RADIUS timeout' });
            }, this.timeout);

            client.on('message', (msg) => {
                clearTimeout(timer);
                client.close();
                
                try {
                    const response = radius.decode({ packet: msg, secret: this.secret });
                    
                    if (response.code === 'Access-Accept') {
                        resolve({ success: true, message: 'Authentication successful' });
                    } else {
                        resolve({ success: false, error: 'Authentication failed' });
                    }
                } catch (error) {
                    resolve({ success: false, error: 'Invalid RADIUS response' });
                }
            });

            client.on('error', (error) => {
                clearTimeout(timer);
                client.close();
                resolve({ success: false, error: 'RADIUS communication error' });
            });

            client.send(encoded, 0, encoded.length, this.port, this.server);
        });
    }

    // Test RADIUS server connectivity
    async testConnection() {
        try {
            const result = await this.authenticate('test', 'test');
            return { success: true, message: 'RADIUS server is reachable' };
        } catch (error) {
            return { success: false, error: 'RADIUS server not reachable' };
        }
    }
}

// Create default RADIUS client instance
const radiusClient = new RadiusClient({
    secret: process.env.RADIUS_SECRET || 'testing123',
    server: process.env.RADIUS_SERVER || '127.0.0.1',
    port: process.env.RADIUS_PORT || 1812
});

module.exports = radiusClient;
