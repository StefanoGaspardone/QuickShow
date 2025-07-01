import os from 'os';

const getLocalIP = () => {
    const interfaces = os.networkInterfaces();

    for(const name of Object.keys(interfaces)) {
        for(const iface of interfaces[name]) {
            if(iface.family === 'IPv4' && !iface.internal) return iface.address;
        }

        return 'localhost';
    }
}

export default getLocalIP;