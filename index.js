const express = require('express');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '.')));

app.get('/pairing', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.json({ error: "Nimewo manke" });
    
    phone = phone.replace(/[^0-9]/g, '');

    // Kreye yon folder sesyon inik pou evite konfli sou Render
    const sessionDir = `./session_${Date.now()}`;

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        
        const client = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.ubuntu("Chrome")
        });

        // Tann 5 segonn pou asire koneksyon an fèt
        await delay(5000);

        if (!client.authState.creds.registered) {
            const code = await client.requestPairingCode(phone);
            res.json({ code: code });
        }

        // Netwaye folder a apre yon ti tan
        setTimeout(() => {
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
        }, 30000);

    } catch (err) {
        console.error(err);
        res.json({ error: "Eseye ankò nan 1 minit" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server ap kouri sou ${PORT}`);
});
