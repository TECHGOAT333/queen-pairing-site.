const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

// Liy sa a ap ranje erè "Cannot GET /" la
app.use(express.static(path.join(__dirname, '.')));

app.get('/pairing', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.json({ error: "Tanpri bay yon nimewo" });

    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        const client = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" })
        });

        if (!client.authState.creds.registered) {
            await delay(1500);
            let code = await client.requestPairingCode(phone);
            res.json({ code: code });
        } else {
            res.json({ error: "Client deja anrejistre" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Erè nan jenerasyon kòd la" });
    }
});

// Sa a ap voye index.html lè ou louvri sit la
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server ap kouri sou port ${PORT}`);
});
