const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/pairing', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.json({ error: "Tanpri bay yon nimewo" });

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
    }
});

app.listen(PORT, () => {
    console.log(`Server ap kouri sou port ${PORT}`);
});
