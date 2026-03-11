const express = require('express');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '.')));

app.get('/pairing', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.json({ error: "Nimewo manke" });
    
    phone = phone.replace(/[^0-9]/g, '');

    // Kreye yon folder sesyon inik pou chak tantativ
    const sessionPath = `./session_${Math.random().toString(36).substring(7)}`;

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        
        const client = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            // N ap itilize yon Browser ID ki pi resan pou WhatsApp pa bloke l
            browser: Browsers.macOS("Desktop")
        });

        client.ev.on('creds.update', saveCreds);

        // Tann yon ti moman anvan n mande kòd la
        await delay(5000); 

        if (!client.authState.creds.registered) {
            const code = await client.requestPairingCode(phone);
            if (!res.headersSent) {
                res.json({ code: code });
            }
        }

        // Netwaye folder a apre 2 minit pou pa ankonbre Render
        setTimeout(() => {
            try {
                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                }
            } catch (e) { console.error("Error cleaning session"); }
        }, 120000);

    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: "Eseye ankò" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server aktif sou port ${PORT}`);
});
