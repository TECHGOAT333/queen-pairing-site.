const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

const app = express();
app.use(express.static('public'));

app.get('/api/get-pairing', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Mete nimewo a!" });
    num = num.replace(/[^0-9]/g, '');

    const sessionId = `session_${num}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);

    try {
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        }

        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", async (s) => {
            if (s.connection === "open") {
                await delay(5000);
                const authFile = JSON.parse(fs.readFileSync(`./sessions/${sessionId}/creds.json`));
                const sessionID = Buffer.from(JSON.stringify(authFile)).toString('base64');
                
                await sock.sendMessage(sock.user.id, { text: `QUEEN-COLAMBIA;;;${sessionID}` });
                
                sock.logout();
                fs.rmSync(`./sessions/${sessionId}`, { recursive: true, force: true });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Erè sèvè" });
    }
});

app.listen(3000, () => console.log("Sèvè a limen!"));
