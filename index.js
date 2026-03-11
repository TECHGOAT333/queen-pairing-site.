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
    if (!phone) return res.json({ error: "Tanpri bay yon nimewo" });

    // Netwaye vye sesyon pou evite blokaj
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        const client = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.ubuntu("Chrome") // Sa ede WhatsApp rekonèt koneksyon an pi byen
        });

        if (!client.authState.creds.registered) {
            await delay(3000); // Bay server a 3 segonn pou l prepare
            let code = await client.requestPairingCode(phone);
            res.json({ code: code });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Erè nan jenerasyon kòd la" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server ap kouri sou port ${PORT}`);
});
