const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '.')));

app.get('/pairing', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.json({ error: "Nimewo manke" });
    
    phone = phone.replace(/[^0-9]/g, '');

    // Nou kreye yon non folder sesyon ki baze sou nimewo a pou evite konfli
    const sessionPath = `./session_${phone}`;

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        
        const client = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            // Sa a se kle a: Force yon browser ki pa sispèk
            browser: ["Chrome (Linux)", "Chrome", "110.0.5481.177"]
        });

        client.ev.on('creds.update', saveCreds);

        // Nou mande kòd la imedyatman
        setTimeout(async () => {
            try {
                const code = await client.requestPairingCode(phone);
                if (!res.headersSent) {
                    res.json({ code: code });
                }
            } catch (error) {
                console.error("Erè kòd:", error);
                if (!res.headersSent) res.status(500).json({ error: "WhatsApp refize demand lan" });
            }
        }, 3000);

        // Sekirite: Apre 1 minit, nou fèmen koneksyon sa si l pa itilize
        setTimeout(() => { client.end(); }, 60000);

    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: "Server Error" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Bot Queen Colambia aktif sou port ${PORT}`);
});
