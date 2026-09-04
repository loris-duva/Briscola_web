const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- COSTANTI E CONFIGURAZIONE ---
const WIDTH = 1100;
const HEIGHT = 750;
const CARD_WIDTH = 115;
const CARD_HEIGHT = 175;

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

// CARICAMENTO IMMAGINE RETRO CON GESTIONE DEL PERCORSO 'carte/retro.png'
const imageBack = new Image();
imageBack.src = "carte/retro.jpg";
imageBack.onerror = () => {
    // Fallback: se carte/retro.png fallisce, prova retro.png nella cartella principale
    if (imageBack.src.includes("carte/")) {
        imageBack.src = "retro.jpg";
    }
};

// CACHE PER LE IMMAGINI DELLE CARTE
const cardImagesCache = {};

// RENDERIZZAZIONE CON ANGOLI ARROTONDATI
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
        const targetY = elevata ? y - 15 : y;
        this.x = x;
        this.y = targetY;

        // Ombra sotto la carta
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.roundRect(x + 2, targetY + 2, CARD_WIDTH, CARD_HEIGHT, 10);
        ctx.fill();

        // Bagliore dorato
        if (evidenziata) {
            ctx.fillStyle = GOLD_GLOW;
            ctx.beginPath();
            ctx.roundRect(x - 8, targetY - 8, CARD_WIDTH + 16, CARD_HEIGHT + 16, 14);
            ctx.fill();
        }

        if (coperta) {
            if (imageBack.complete && imageBack.naturalWidth !== 0) {
                drawRoundedImage(ctx, imageBack, x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
                ctx.strokeStyle = "#c8c8c8";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
                ctx.stroke();
            } else {
                // Fallback rettangolo blu se l'immagine non è trovata/caricata
                ctx.fillStyle = BLUE_ACCENT;
                ctx.beginPath();
                ctx.roundRect(x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
                ctx.fill();
                ctx.strokeStyle = WHITE;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "#14326e";
                ctx.beginPath();
                ctx.roundRect(x + 6, targetY + 6, CARD_WIDTH - 12, CARD_HEIGHT - 12, 6);
                ctx.fill();

                ctx.fillStyle = WHITE;
                ctx.font = "bold 15px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText("BRISCOLA", x + CARD_WIDTH / 2, targetY + CARD_HEIGHT / 2);
            }
        } else {
            if (this.image.complete && this.image.naturalWidth !== 0) {
                drawRoundedImage(ctx, this.image, x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
                ctx.strokeStyle = "#c8c8c8";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
                ctx.stroke();
            } else {
                // Fallback disegno vettoriale
                ctx.fillStyle = WHITE;
                ctx.beginPath();
                ctx.roundRect(x, targetY, CARD_WIDTH, CARD_HEIGHT, 10);
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
                ctx.fillText(NOMI_VALORI[this.valore], x + CARD_WIDTH / 2, targetY + 65);

                ctx.fillStyle = coloreSeme;
                ctx.font = "bold 20px 'Segoe UI'";
                ctx.fillText(this.seme, x + CARD_WIDTH / 2, targetY + 105);
            }
        }
    }

    isPointInside(px, py) {
        return px >= this.x && px <= this.x + CARD_WIDTH &&
            py >= this.y && py <= this.y + CARD_HEIGHT;
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
        // Shuffle (Fisher-Yates)
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
        // 1. SFONDO SCURO E TAVOLO DA GIOCO
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = TABLE_COLOR;
        ctx.beginPath();
        ctx.roundRect(40, 20, WIDTH - 80, HEIGHT - 40, 24);
        ctx.fill();
        ctx.strokeStyle = TABLE_BORDER;
        ctx.lineWidth = 4;
        ctx.stroke();

        // 2. UNICO SLOT CENTRALE PER ENTRAMBE LE CARTE
        const SLOT_HEIGHT = CARD_HEIGHT + 70;
        const SLOT_WIDTH = CARD_WIDTH + 30;
        const slotX = WIDTH / 2 - SLOT_WIDTH / 2;
        const slotY = HEIGHT / 2 - SLOT_HEIGHT / 2;

        ctx.fillStyle = CARD_SLOT;
        ctx.beginPath();
        ctx.roundRect(slotX, slotY, SLOT_WIDTH, SLOT_HEIGHT, 14);
        ctx.fill();
        ctx.strokeStyle = "#0e321e";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. MAZZO E BRISCOLA
        if (this.mazzo.length > 0) {
            const deckX = 80;
            const deckY = HEIGHT / 2 - CARD_HEIGHT / 2;

            if (this.mazzo.length > 1) {
                this.cartaBriscola.disegna(ctx, deckX + CARD_WIDTH / 2, deckY, { evidenziata: true });
                const deckCard = this.mazzo[this.mazzo.length - 1];
                deckCard.disegna(ctx, deckX, deckY, { coperta: true });
            } else {
                this.cartaBriscola.disegna(ctx, deckX, deckY, { evidenziata: true });
            }
        }

        // Info Mazzo e Briscola sul pannello sinistro
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = "bold 15px 'Segoe UI'";
        ctx.textAlign = "left";
        ctx.fillText(`CARTE NEL MAZZO: ${this.mazzo.length}`, 70, HEIGHT / 2 + CARD_HEIGHT / 2 + 35);

        ctx.fillStyle = GOLD;
        ctx.font = "bold 20px 'Segoe UI'";
        ctx.fillText(`BRISCOLA: ${this.cartaBriscola.nome.toUpperCase()}`, 70, HEIGHT / 2 + CARD_HEIGHT / 2 + 62);

        // 4. CARTE DEL BOT
        const startXBot = (WIDTH - (this.manoBot.length * (CARD_WIDTH + 18) - 18)) / 2;
        this.manoBot.forEach((c, i) => {
            const x = startXBot + i * (CARD_WIDTH + 18);
            c.disegna(ctx, x, 40, { coperta: true });
        });

        // 5. CARTE DEL GIOCATORE
        const startXG = (WIDTH - (this.manoGiocatore.length * (CARD_WIDTH + 18) - 18)) / 2;
        this.manoGiocatore.forEach((c, i) => {
            const x = startXG + i * (CARD_WIDTH + 18);
            const y = HEIGHT - CARD_HEIGHT - 40;

            const isHover = c.isPointInside(posMouse.x, posMouse.y) && this.stato === "IN_CORSO" && this.turnoAttuale === "Giocatore";
            c.disegna(ctx, x, y, { elevata: isHover });
        });

        // 6. CARTE NEL SINGOLO SLOT CENTRALE
        const posYBot = slotY + 15;
        const posYGiog = slotY + SLOT_HEIGHT - CARD_HEIGHT - 15;
        const posXCentro = WIDTH / 2 - CARD_WIDTH / 2;

        if (this.turnoIniziale === "Giocatore") {
            if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
            if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
        } else {
            if (this.tavolo["Bot"]) this.tavolo["Bot"].disegna(ctx, posXCentro, posYBot);
            if (this.tavolo["Giocatore"]) this.tavolo["Giocatore"].disegna(ctx, posXCentro, posYGiog);
        }

        // 7. BADGE DEL TURNO ATTUALE
        if (this.stato === "IN_CORSO") {
            ctx.fillStyle = "#0a1e14";
            ctx.beginPath();
            ctx.roundRect(WIDTH - 270, 40, 200, 36, 18);
            ctx.fill();

            ctx.fillStyle = this.turnoAttuale === "Giocatore" ? GOLD : TEXT_MUTED;
            ctx.font = "bold 15px 'Segoe UI'";
            ctx.textAlign = "center";
            ctx.fillText(`TURNO: ${this.turnoAttuale.toUpperCase()}`, WIDTH - 170, 63);
        }

        // 8. SCHERMATA FINALE MODERNA
        if (this.stato === "FINITA") {
            ctx.fillStyle = "rgba(10, 15, 25, 0.82)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            const boxX = WIDTH / 2 - 250;
            const boxY = HEIGHT / 2 - 140;

            ctx.fillStyle = "#192332";
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, 500, 280, 20);
            ctx.fill();

            const coloreEsito = this.puntiGiocatore > this.puntiBot ? GOLD : (this.puntiGiocatore < this.puntiBot ? RED_ACCENT : WHITE);
            ctx.strokeStyle = coloreEsito;
            ctx.lineWidth = 3;
            ctx.stroke();

            let esito = "PAREGGIO";
            if (this.puntiGiocatore > this.puntiBot) esito = "VITTORIA!";
            else if (this.puntiGiocatore < this.puntiBot) esito = "SCONFITTA";

            ctx.fillStyle = coloreEsito;
            ctx.font = "bold 42px 'Segoe UI'";
            ctx.textAlign = "center";
            ctx.fillText(esito, WIDTH / 2, HEIGHT / 2 - 40);

            ctx.fillStyle = WHITE;
            ctx.font = "bold 20px 'Segoe UI'";
            ctx.fillText(`Punteggio: Tu ${this.puntiGiocatore} - ${this.puntiBot} Bot`, WIDTH / 2, HEIGHT / 2 + 10);

            ctx.fillStyle = TEXT_MUTED;
            ctx.font = "bold 15px 'Segoe UI'";
            ctx.fillText("PREMI 'R' O CLICCA PER GIOCARE UN'ALTRA PARTITA", WIDTH / 2, HEIGHT / 2 + 80);
        }
    }
}

// --- SETUP GAME LOOP & EVENTI ---
const gioco = new GiocoBriscola();
let posMouse = { x: 0, y: 0 };

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousemove', (e) => {
    posMouse = getMousePos(e);
});

canvas.addEventListener('click', (e) => {
    const pos = getMousePos(e);

    if (gioco.stato === "FINITA") {
        gioco.resetPartita();
        return;
    }

    if (gioco.stato === "IN_CORSO" && gioco.turnoAttuale === "Giocatore") {
        for (let c of gioco.manoGiocatore) {
            if (c.isPointInside(pos.x, pos.y)) {
                gioco.giocaCarta("Giocatore", c);
                gioco.turnoAttuale = "Bot";
                break;
            }
        }
    }
});

window.addEventListener('keydown', (e) => {
    if ((e.key === 'r' || e.key === 'R') && gioco.stato === "FINITA") {
        gioco.resetPartita();
    }
});

// LOOP PRINCIPALE (60 FPS)
function gameLoop() {
    gioco.aggiornaFasi();
    gioco.disegna(posMouse);
    requestAnimationFrame(gameLoop);
}

gameLoop();