const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// PALETTE COLORI
const BG_DARK = "#0f141c";
const TABLE_COLOR = "#185434";
const TABLE_BORDER = "#267349";
const CARD_SLOT = "#124128";
const WHITE = "#f0f5fa";
const BLACK = "#0a0f14";
const GOLD = "#ffc832";
const GOLD_GLOW = "rgba(255, 215, 0, 0.31)";
const BLUE_ACCENT = "#3278dc";
const RED_ACCENT = "#dc3c3c";
const TEXT_MUTED = "#a0afbe";

// REGOLE
const SEMI = ["Coppe", "Denari", "Bastoni", "Spade"];
const VALORI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const NOMI_VALORI = {
    1: "Asso", 2: "2", 3: "3", 4: "4", 5: "5",
    6: "6", 7: "7", 8: "Fante", 9: "Cavallo", 10: "Re"
};

const GERARCHIA = { 1: 10, 3: 9, 10: 8, 9: 7, 8: 6, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1 };
const PUNTI = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };

// VARIABILI LAYOUT DINAMICO
let isMobile = false;
let cardW = 115;
let cardH = 175;
let virtWidth = 1100;
let virtHeight = 750;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

// CARICAMENTO IMMAGINI
const imageBack = new Image();
imageBack.src = "carte/retro.jpg";
imageBack.onerror = () => {
    if (imageBack.src.includes("carte/")) {
        imageBack.src = "retro.jpg";
    }
};

const cardImagesCache = {};

function drawRoundedImage(ctx, img, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, width, height);
    ctx.restore();
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    isMobile = windowHeight > windowWidth;

    if (isMobile) {
        virtWidth = 600;
        virtHeight = 950;
        cardW = 130;
        cardH = 195;
    } else {
        virtWidth = 1100;
        virtHeight = 750;
        cardW = 115;
        cardH = 175;
    }

    const scaleX = windowWidth / virtWidth;
    const scaleY = windowHeight / virtHeight;
    scale = Math.min(scaleX, scaleY);

    canvas.width = windowWidth * dpr;
    canvas.height = windowHeight * dpr;

    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;

    offsetX = (windowWidth - virtWidth * scale) / 2;
    offsetY = (windowHeight - virtHeight * scale) / 2;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- CLASSE CARTA ---
class Carta {
    constructor(seme, valore) {
        this.seme = seme;
        this.valore = valore;
        this.forza = GERARCHIA[valore];
        this.punti = PUNTI[valore];
        this.nome = `${NOMI_VALORI[valore]} di ${seme}`;
        this.x = 0;
        this.y = 0;

        const path = `carte/${valore}_${seme.toLowerCase()}.jpg`;
        if (!cardImagesCache[path]) {
            const img = new Image();
            img.src = path;
            cardImagesCache[path] = img;
        }
        this.image = cardImagesCache[path];
    }

    disegna(ctx, x, y, options = {}) {
        const { coperta = false, elevata = false, evidenziata = false } = options;
        const targetY = elevata ? y - 20 : y;
        this.x = x;
        this.y = targetY;

        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.roundRect(x + 2, targetY + 2, cardW, cardH, 10);
        ctx.fill();

        if (evidenziata) {
            ctx.fillStyle = GOLD_GLOW;
            ctx.beginPath();
            ctx.roundRect(x - 8, targetY - 8, cardW + 16, cardH + 16, 14);
            ctx.fill();
        }

        if (coperta) {
            if (imageBack.complete && imageBack.naturalWidth !== 0) {
                drawRoundedImage(ctx, imageBack, x, targetY, cardW, cardH, 10);
                ctx.strokeStyle = "#c8c8c8";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x, targetY, cardW, cardH, 10);
                ctx.stroke();
            } else {
                ctx.fillStyle = BLUE_ACCENT;
                ctx.beginPath();
                ctx.roundRect(x, targetY, cardW, cardH, 10);
                ctx.fill();
                ctx.strokeStyle = WHITE;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "#14326e";
                ctx.beginPath();
                ctx.roundRect(x + 6, targetY + 6, cardW - 12, cardH - 12, 6);
                ctx.fill();

                ctx.fillStyle = WHITE;
                ctx.font = "bold 15px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText("BRISCOLA", x + cardW / 2, targetY + cardH / 2);
            }
        } else {
            if (this.image.complete && this.image.naturalWidth !== 0) {
                drawRoundedImage(ctx, this.image, x, targetY, cardW, cardH, 10);
                ctx.strokeStyle = "#c8c8c8";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x, targetY, cardW, cardH, 10);
                ctx.stroke();
            } else {
                ctx.fillStyle = WHITE;
                ctx.beginPath();
                ctx.roundRect(x, targetY, cardW, cardH, 10);
                ctx.fill();
                ctx.strokeStyle = BLACK;
                ctx.lineWidth = 2;
                ctx.stroke();

                const coloreSeme = (this.seme === "Coppe" || this.seme === "Denari") ? RED_ACCENT : BLACK;
                ctx.fillStyle = coloreSeme;
                ctx.font = "bold 20px 'Segoe UI'";
                ctx.textAlign = "left";
                ctx.fillText(this.valore, x + 10, targetY + 25);

                ctx.fillStyle = BLACK;
                ctx.font = "bold 15px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText(NOMI_VALORI[this.valore], x + cardW / 2, targetY + 65);

                ctx.fillStyle = coloreSeme;
                ctx.font = "bold 20px 'Segoe UI'";
                ctx.fillText(this.seme, x + cardW / 2, targetY + 105);
            }
        }
    }

    isPointInside(px, py) {
        return px >= this.x && px <= this.x + cardW &&
            py >= this.y && py <= this.y + cardH;
    }
}

// --- CLASSE GIOCO ---
class GiocoBriscola {
    constructor() {
        this.resetPartita();
    }

    resetPartita() {
        this.mazzo = [];
        for (let s of SEMI) {
            for (let v of VALORI) {
                this.mazzo.push(new Carta(s, v));
            }
        }
        for (let i = this.mazzo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mazzo[i], this.mazzo[j]] = [this.mazzo[j], this.mazzo[i]];
        }

        this.manoGiocatore = [];
        this.manoBot = [];

        for (let i = 0; i < 3; i++) {
            this.manoGiocatore.push(this.mazzo.pop());
            this.manoBot.push(this.mazzo.pop());
        }

        this.cartaBriscola = this.mazzo.pop();
        this.semeBriscola = this.cartaBriscola.seme;
        this.mazzo.unshift(this.cartaBriscola);

        this.tavolo = {};
        this.turnoIniziale = "Giocatore";
        this.turnoAttuale = this.turnoIniziale;

        this.puntiGiocatore = 0;
        this.puntiBot = 0;
        this.stato = "IN_CORSO";
        this.timerFase = 0;
        this.botPensa = false;
    }

    calcolaVincitorePresa() {
        const primo = this.turnoIniziale;
        const secondo = primo === "Giocatore" ? "Bot" : "Giocatore";

        const cPrimo = this.tavolo[primo];
        const cSecondo = this.tavolo[secondo];

        let vincitore = primo;

        if (cSecondo.seme === cPrimo.seme) {
            if (cSecondo.forza > cPrimo.forza) {
                vincitore = secondo;
            }
        } else if (cSecondo.seme === this.semeBriscola) {
            vincitore = secondo;
        }

        return vincitore;
    }

    giocaCarta(chi, carta) {
        this.tavolo[chi] = carta;
        if (chi === "Giocatore") {
            this.manoGiocatore = this.manoGiocatore.filter(c => c !== carta);
        } else {
            this.manoBot = this.manoBot.filter(c => c !== carta);
        }
    }

    mossaBot() {
        let scelta;
        if (this.tavolo["Giocatore"]) {
            const cGiog = this.tavolo["Giocatore"];
            const vincenti = this.manoBot.filter(c =>
                (c.seme === cGiog.seme && c.forza > cGiog.forza) ||
                (c.seme === this.semeBriscola && cGiog.seme !== this.semeBriscola)
            );

            if (vincenti.length > 0) {
                vincenti.sort((a, b) => a.punti - b.punti || a.forza - b.forza);
                scelta = vincenti[0];
            } else {
                this.manoBot.sort((a, b) => (a.seme === this.semeBriscola) - (b.seme === this.semeBriscola) || a.punti - b.punti || a.forza - b.forza);
                scelta = this.manoBot[0];
            }
        } else {
            this.manoBot.sort((a, b) => (a.seme === this.semeBriscola) - (b.seme === this.semeBriscola) || a.punti - b.punti || a.forza - b.forza);
            scelta = this.manoBot[0];
        }

        this.giocaCarta("Bot", scelta);
    }

    aggiornaFasi() {
        const now = Date.now();

        if (Object.keys(this.tavolo).length === 2 && this.stato === "IN_CORSO") {
            this.stato = "PAUSA_PRESA";
            this.timerFase = now;
        } else if (this.stato === "PAUSA_PRESA") {
            if (now - this.timerFase > 1500) {
                const vincitore = this.calcolaVincitorePresa();
                const puntiPresa = Object.values(this.tavolo).reduce((acc, c) => acc + c.punti, 0);

                if (vincitore === "Giocatore") {
                    this.puntiGiocatore += puntiPresa;
                } else {
                    this.puntiBot += puntiPresa;
                }

                if (this.mazzo.length > 0) {
                    if (vincitore === "Giocatore") {
                        this.manoGiocatore.push(this.mazzo.pop());
                        this.manoBot.push(this.mazzo.pop());
                    } else {
                        this.manoBot.push(this.mazzo.pop());
                        this.manoGiocatore.push(this.mazzo.pop());
                    }
                }

                this.tavolo = {};
                this.turnoIniziale = vincitore;
                this.turnoAttuale = vincitore;
                this.stato = "IN_CORSO";

                if (this.manoGiocatore.length === 0 && this.manoBot.length === 0) {
                    this.stato = "FINITA";
                }
            }
        } else if (this.stato === "IN_CORSO" && this.turnoAttuale === "Bot" && !this.botPensa) {
            this.botPensa = true;
            setTimeout(() => {
                this.mossaBot();
                this.turnoAttuale = "Giocatore";
                this.botPensa = false;
            }, 350);
        }
    }

    disegna(posMouse) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.scale(dpr, dpr);
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // 1. TAVOLO
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(-offsetX / scale, -offsetY / scale, window.innerWidth / scale, window.innerHeight / scale);

        ctx.fillStyle = TABLE_COLOR;
        ctx.beginPath();
        ctx.roundRect(20, 20, virtWidth - 40, virtHeight - 40, 24);
        ctx.fill();
        ctx.strokeStyle = TABLE_BORDER;
        ctx.lineWidth = 4;
        ctx.stroke();

        if (isMobile) {
            // --- LAYOUT MOBILE (PORTRAIT REVISIONATO) ---

            // BADGE TURNO (IN ALTO AL CENTRO)
            if (this.stato === "IN_CORSO") {
                ctx.fillStyle = "#0a1e14";
                ctx.beginPath();
                ctx.roundRect(virtWidth / 2 - 120, 35, 240, 42, 21);
                ctx.fill();

                ctx.fillStyle = this.turnoAttuale === "Giocatore" ? GOLD : TEXT_MUTED;
                ctx.font = "bold 18px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText(`TURNO: ${this.turnoAttuale.toUpperCase()}`, virtWidth / 2, 62);
            }

            // CARTE BOT
            const gapBot = 15;
            const startXBot = (virtWidth - (this.manoBot.length * (cardW + gapBot) - gapBot)) / 2;
            this.manoBot.forEach((c, i) => {
                c.disegna(ctx, startXBot + i * (cardW + gapBot), 95, { coperta: true });
            });

            // CENTRO TAVOLO: SLOT COMPATTO ED ELEGANTE
            const slotW = cardW + 20;
            const slotH = cardH + 50;
            const slotX = virtWidth - slotW - 50;
            const slotY = virtHeight / 2 - slotH / 2;

            ctx.fillStyle = CARD_SLOT;
            ctx.beginPath();
            ctx.roundRect(slotX, slotY, slotW, slotH, 14);
            ctx.fill();
            ctx.strokeStyle = "#0e321e";
            ctx.lineWidth = 2;
            ctx.stroke();

            // MAZZO E BRISCOLA (A SINISTRA)
            const deckX = 50;
            const deckY = virtHeight / 2 - cardH / 2;
            if (this.mazzo.length > 0) {
                if (this.mazzo.length > 1) {
                    this.cartaBriscola.disegna(ctx, deckX + cardW / 3, deckY, { evidenziata: true });
                    const deckCard = this.mazzo[this.mazzo.length - 1];
                    deckCard.disegna(ctx, deckX, deckY, { coperta: true });
                } else {
                    this.cartaBriscola.disegna(ctx, deckX, deckY, { evidenziata: true });
                }
            }

            ctx.fillStyle = TEXT_MUTED;
            ctx.font = "bold 16px 'Segoe UI'";
            ctx.textAlign = "left";
            ctx.fillText(`MAZZO: ${this.mazzo.length}`, deckX, deckY + cardH + 30);

            // CARTE GIOCATE NEL CENTRO (SOVRAPPOSIZIONE STILE PC)
            const posYBot = slotY + 15;
            const posYGiog = slotY + slotH - cardH - 15;
            const posXCentro = slotX + (slotW - cardW) / 2;

            if (this.turnoIniziale === "Giocatore") {
                if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
                if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
            } else {
                if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
                if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
            }

            // CARTE GIOCATE (SEZIONE MOBILE)
            const startXG = (virtWidth - (this.manoGiocatore.length * (cardW + 20) - 20)) / 2;
            this.manoGiocatore.forEach((c, i) => {
                const x = startXG + i * (cardW + 20);
                const y = virtHeight - cardH - 45;
                const isHover = c.isPointInside(posMouse.x, posMouse.y) && this.stato === "IN_CORSO" && this.turnoAttuale === "Giocatore";
                c.disegna(ctx, x, y, { elevata: isHover });
            });

        } else {
            // --- LAYOUT DESKTOP / TABLET (LANDSCAPE) ---
            const slotH = cardH + 70;
            const slotW = cardW + 30;
            const slotX = virtWidth / 2 - slotW / 2;
            const slotY = virtHeight / 2 - slotH / 2;

            ctx.fillStyle = CARD_SLOT;
            ctx.beginPath();
            ctx.roundRect(slotX, slotY, slotW, slotH, 14);
            ctx.fill();

            if (this.mazzo.length > 0) {
                const deckX = 80;
                const deckY = virtHeight / 2 - cardH / 2;
                if (this.mazzo.length > 1) {
                    this.cartaBriscola.disegna(ctx, deckX + cardW / 2, deckY, { evidenziata: true });
                    const deckCard = this.mazzo[this.mazzo.length - 1];
                    deckCard.disegna(ctx, deckX, deckY, { coperta: true });
                } else {
                    this.cartaBriscola.disegna(ctx, deckX, deckY, { evidenziata: true });
                }
            }

            ctx.fillStyle = TEXT_MUTED;
            ctx.font = "bold 15px 'Segoe UI'";
            ctx.textAlign = "left";
            ctx.fillText(`CARTE NEL MAZZO: ${this.mazzo.length}`, 70, virtHeight / 2 + cardH / 2 + 35);

            ctx.fillStyle = GOLD;
            ctx.font = "bold 20px 'Segoe UI'";
            ctx.fillText(`BRISCOLA: ${this.cartaBriscola.nome.toUpperCase()}`, 70, virtHeight / 2 + cardH / 2 + 62);

            const startXBot = (virtWidth - (this.manoBot.length * (cardW + 18) - 18)) / 2;
            this.manoBot.forEach((c, i) => {
                c.disegna(ctx, startXBot + i * (cardW + 18), 40, { coperta: true });
            });

            const startXG = (virtWidth - (this.manoGiocatore.length * (cardW + 18) - 18)) / 2;
            this.manoGiocatore.forEach((c, i) => {
                const x = startXG + i * (cardW + 18);
                const y = virtHeight - cardH - 40;
                const isHover = c.isPointInside(posMouse.x, posMouse.y) && this.stato === "IN_CORSO" && this.turnoAttuale === "Giocatore";
                c.disegna(ctx, x, y, { elevata: isHover });
            });

            const posYBot = slotY + 15;
            const posYGiog = slotY + slotH - cardH - 15;
            const posXCentro = virtWidth / 2 - cardW / 2;

            if (this.turnoIniziale === "Giocatore") {
                if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
                if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
            } else {
                if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
                if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
            }

            if (this.stato === "IN_CORSO") {
                ctx.fillStyle = "#0a1e14";
                ctx.beginPath();
                ctx.roundRect(virtWidth - 270, 40, 200, 36, 18);
                ctx.fill();

                ctx.fillStyle = this.turnoAttuale === "Giocatore" ? GOLD : TEXT_MUTED;
                ctx.font = "bold 15px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText(`TURNO: ${this.turnoAttuale.toUpperCase()}`, virtWidth - 170, 63);
            }
        }

        // SCHERMATA FINALE
        if (this.stato === "FINITA") {
            ctx.fillStyle = "rgba(10, 15, 25, 0.85)";
            ctx.fillRect(-offsetX / scale, -offsetY / scale, window.innerWidth / scale, window.innerHeight / scale);

            const boxW = Math.min(500, virtWidth - 60);
            const boxX = virtWidth / 2 - boxW / 2;
            const boxY = virtHeight / 2 - 140;

            ctx.fillStyle = "#192332";
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, 280, 20);
            ctx.fill();

            const coloreEsito = this.puntiGiocatore > this.puntiBot ? GOLD : (this.puntiGiocatore < this.puntiBot ? RED_ACCENT : WHITE);
            ctx.strokeStyle = coloreEsito;
            ctx.lineWidth = 3;
            ctx.stroke();

            let esito = "PAREGGIO";
            if (this.puntiGiocatore > this.puntiBot) esito = "VITTORIA!";
            else if (this.puntiGiocatore < this.puntiBot) esito = "SCONFITTA";

            ctx.fillStyle = coloreEsito;
            ctx.font = "bold 40px 'Segoe UI'";
            ctx.textAlign = "center";
            ctx.fillText(esito, virtWidth / 2, virtHeight / 2 - 40);

            ctx.fillStyle = WHITE;
            ctx.font = "bold 20px 'Segoe UI'";
            ctx.fillText(`Punteggio: Tu ${this.puntiGiocatore} - ${this.puntiBot} Bot`, virtWidth / 2, virtHeight / 2 + 10);

            ctx.fillStyle = TEXT_MUTED;
            ctx.font = "bold 15px 'Segoe UI'";
            ctx.fillText(isMobile ? "TOCCA PER NUOVA PARTITA" : "PREMI 'R' O CLICCA PER RINIZIARE", virtWidth / 2, virtHeight / 2 + 80);
        }

        ctx.restore();
    }
}

// --- EVENTI ---
const gioco = new GiocoBriscola();
let posMouse = { x: -100, y: -100 };

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    return {
        x: (mouseX - offsetX) / scale,
        y: (mouseY - offsetY) / scale
    };
}

canvas.addEventListener('mousemove', (e) => {
    posMouse = getCanvasCoordinates(e);
});

canvas.addEventListener('click', (e) => {
    gestisciInput(getCanvasCoordinates(e));
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getCanvasCoordinates(e);
    posMouse = pos;
    gestisciInput(pos);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    posMouse = getCanvasCoordinates(e);
}, { passive: false });

function gestisciInput(pos) {
    if (gioco.stato === "FINITA") {
        gioco.resetPartita();
        return;
    }

    if (gioco.stato === "IN_CORSO" && gioco.turnoAttuale === "Giocatore") {
        for (let c of gioco.manoGiocatore) {
            if (c.isPointInside(pos.x, pos.y)) {
                gioco.giocaCarta("Giocatore", c);
                gioco.turnoAttuale = "Bot";
                posMouse = { x: -100, y: -100 };
                break;
            }
        }
    }
}

window.addEventListener('keydown', (e) => {
    if ((e.key === 'r' || e.key === 'R') && gioco.stato === "FINITA") {
        gioco.resetPartita();
    }
});

function gameLoop() {
    gioco.aggiornaFasi();
    gioco.disegna(posMouse);
    requestAnimationFrame(gameLoop);
}

gameLoop();