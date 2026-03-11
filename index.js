<!DOCTYPE html>
<html lang="ht">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QUEEN COLAMBIA PAIRING</title>
    <style>
        body { background-color: #050505; color: #00ff00; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { border: 2px solid #00ff00; padding: 30px; box-shadow: 0 0 20px #00ff00; border-radius: 10px; text-align: center; background: rgba(0, 0, 0, 0.8); width: 90%; max-width: 400px; }
        h1 { text-shadow: 0 0 10px #00ff00; font-size: 1.5rem; }
        input { background: #111; border: 1px solid #00ff00; color: #00ff00; padding: 12px; width: 80%; margin-bottom: 20px; outline: none; text-align: center; font-size: 1.1rem; }
        button { background: #00ff00; color: #000; border: none; padding: 12px 25px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 85%; }
        button:hover { box-shadow: 0 0 15px #00ff00; transform: scale(1.02); }
        #display-code { margin-top: 30px; min-height: 50px; }
        .code-box { background: #00ff00; color: #000; padding: 15px; font-size: 1.5rem; font-weight: bold; letter-spacing: 5px; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>QUEEN COLAMBIA PAIRING</h1>
        <p>Mete nimewo WhatsApp ou ak kòd peyi a</p>
        
        <input type="number" id="number" placeholder="Eg: 50948247470">
        <br>
        <button id="btn" onclick="getPairingCode()">JENERE KÒD</button>

        <div id="display-code"></div>
    </div>

    <script>
        async function getPairingCode() {
            const number = document.getElementById('number').value;
            const display = document.getElementById('display-code');
            const btn = document.getElementById('btn');
            
            if (!number || number.length < 8) {
                display.innerHTML = "<span style='color: red;'>Nimewo sa pa kòrèk!</span>";
                return;
            }

            btn.disabled = true;
            btn.innerHTML = "AP PWOSESE...";
            display.innerHTML = "<p style='color: yellow;'>Veye WhatsApp ou, kòd la ap parèt la...</p>";

            try {
                // Sèvi ak URL relatif la pou asire l jwenn menm server Render la
                const response = await fetch(`${window.location.origin}/pairing?number=${number}`);
                const data = await response.json();

                if (data.code) {
                    display.innerHTML = `
                        <p style="color: #fff;">KÒD PAIRING OU:</p>
                        <div class="code-box">${data.code}</div>
                        <p style="font-size: 0.8rem; color: #aaa; margin-top: 10px;">Antre kòd sa nan WhatsApp nan seksyon "Link with phone number".</p>
                    `;
                } else {
                    display.innerHTML = "<span style='color: red;'>Erè: " + (data.error || "Server okipe") + "</span>";
                }
            } catch (err) {
                display.innerHTML = "<span style='color: red;'>Server a poko pare. Tann 30 segonn epi refresh paj la.</span>";
            } finally {
                btn.disabled = false;
                btn.innerHTML = "JENERE KÒD";
            }
        }
    </script>
</body>
</html>
