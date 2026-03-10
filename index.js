const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/get-pairing', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Mete nimewo a!" });
    
    // Netwaye nimewo a
    num = num.replace(/[^0-9]/g, '');

    // ID sesyon inik pou evite blokaj
    const sessionId = `session_${num}_${Math.floor(Math.random() * 1000)}`;
    const sessionPath = `./sessions/${sessionId}`;
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    try {
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            // Chanjman isit la: WhatsApp voye notifikasyon pi vit sou "Chrome"
            browser: ["Ubuntu", "Chrome", "110.0.5481.178"]
        });

        if (!sock.authState.creds.registered) {
            await delay(2000); // Yon ti delè pou sèvè a prepare
            const code = await sock.requestPairingCode(num);
            if (!res.headersSent) {
                res.json({ code: code });
            }
        }

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (s) => {
            const { connection } = s;
            if (connection === "open") {
                await delay(5000);
                
                // Jwenn kle sesyon an
                const credsPath = `${sessionPath}/creds.json`;
                if (fs.existsSync(credsPath)) {
                    const authFile = JSON.parse(fs.readFileSync(credsPath));
                    const sessionID = Buffer.from(JSON.stringify(authFile)).toString('base64');
                    
                    // Voye Session ID a bay mèt nimewo a
                    await sock.sendMessage(sock.user.id, { 
                        text: `✅ *QUEEN COLAMBIA SESSION ID*\n\nQUEEN-COLAMBIA;;;${sessionID}` 
                    });
                }

                // Dekonekte epi netwaye folder a
                setTimeout(() => {
                    sock.logout();
                    if (fs.existsSync(sessionPath)) {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                    }
                }, 10000);
            }
        });

    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Erè sèvè" });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Sèvè limen sou pòt ${PORT}`));
