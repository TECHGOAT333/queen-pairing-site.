async function getCode() {
    const num = document.getElementById('number').value;
    const status = document.getElementById('status');
    const display = document.getElementById('codeDisplay');
    const btn = document.getElementById('btn');

    if (!num) return alert("Antre nimewo telefòn ou!");
    
    btn.disabled = true;
    status.innerText = "Jenere kòd... ⏳";
    display.innerText = "";

    try {
        const res = await fetch(`/api/get-pairing?number=${num}`);
        const data = await res.json();
        if (data.code) {
            display.innerText = data.code;
            status.innerText = "Antre kòd sa nan notifikasyon WhatsApp ou a!";
        } else {
            status.innerText = "Gen yon erè, eseye ankò.";
            btn.disabled = false;
        }
    } catch (e) {
        status.innerText = "Sèvè a gen yon pwoblèm.";
        btn.disabled = false;
    }
}
