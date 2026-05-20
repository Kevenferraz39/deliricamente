import { networkInterfaces } from 'os';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';

// Pega o IP local da rede Wi-Fi/Ethernet
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const url = `http://${ip}:3000`;

console.log('\n\x1b[36m================================\x1b[0m');
console.log('\x1b[32m  DELIRICAMENTE — MOBILE TEST\x1b[0m');
console.log('\x1b[36m================================\x1b[0m');
console.log(`\n  Acesse no celular: \x1b[33m${url}\x1b[0m`);
console.log('\n  Escaneie o QR Code:\n');

qrcode.generate(url, { small: true });

console.log('\n\x1b[90m  Certifique-se que o celular esta na mesma rede Wi-Fi.\x1b[0m\n');

// Inicia o vite em background
const vite = spawn('npx', ['vite', '--host'], { stdio: 'inherit', shell: true });

vite.on('close', (code) => process.exit(code));
