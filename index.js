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
    
    // Netwaye nimewo a (retire espas oswa plis)
    phone = phone.replace(/[^0-9]/g, '');

    // Netwaye vye sesyon anvan chak demand
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        const client = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            // N ap itilize Safari sou MacOS pou WhatsApp ka aksepte l pi fasil
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        client.ev.on('creds.update', saveCreds);

        // Si nou pa anrejistre, n ap mande kòd la
        if (!client.authState.creds.registered) {
            await delay(2000); 
            const code = await client.requestPairingCode(phone);
            
            if (!res.headersSent) {
                res.json({ code: code });
            }
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Eseye ankò nan yon ti moman" });
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server Queen Colambia kouri sou port ${PORT}`);
});
