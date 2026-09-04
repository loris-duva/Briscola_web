# Briscola Web

Un'applicazione web interattiva e responsive sviluppata in HTML5 Canvas e JavaScript vanilla che ricrea il classico gioco di carte della **Briscola Italiana**. L'applicazione integra un'intelligenza artificiale per il gioco in singolo contro un Bot, una gestione dinamica del layout (Desktop e Mobile Portrait) e grafiche custom con supporto al Pixel Ratio dei dispositivi moderni.

---

## 📋 Indice
1. [Regole del Gioco e Punteggi](#-regole-del-gioco-e-punteggi)
2. [Architettura Tecnica](#-architettura-tecnica)
3. [Funzionalità Principali](#-funzionalità-principali)
4. [Struttura del Progetto](#-struttura-del-progetto)

---

## 🃏 Regole del Gioco e Punteggi

Il gioco segue le classiche regole della Briscola a 2 giocatori con mazzo da 40 carte tradizionali.

### Gerarchia delle Carte e Valore in Punti
| Valore Carta | Nome Carta | Forza di Presa | Punti |
| :--- | :--- | :--- | :--- |
| **1** | Asso | 10 (Massima) | **11** |
| **3** | Tre | 9 | **10** |
| **10** | Re | 8 | **4** |
| **9** | Cavallo | 7 | **3** |
| **8** | Fante | 6 | **2** |
| **7, 6, 5, 4, 2**| Lisci | 5 → 1 (Decrescente) | **0** |

* **Totale punti nel mazzo:** 120
* **Punteggio per la vittoria:** 61 punti (con 60 punti la partita termina in pareggio).

### Meccanica di Presa
1. **Seme d'uscita:** La prima carta giocata stabilisce il seme di mano.
2. **Vincitore di presa:**
    * Se viene giocata una o più carte del **seme di Briscola**, vince la Briscola con il valore di presa più alto.
    * Se non vengono giocate Briscole, vince la carta con il valore di presa più alto del **seme d'uscita**.
    * Le carte di altri semi che non siano il seme d'uscita o la Briscola non possono aggiudicarsi la presa.

---

## 🛠️ Architettura Tecnica

L'applicazione è progettata orientata agli oggetti (OOP) e non utilizza librerie esterne.

### Modulo Principale (`script.js`)

#### 1. Classe `Carta`
Gestisce lo stato individualizzato di ogni carta:
* **Attributi:** Seme, valore reale, forza di presa, punti assegnati e coordinate $X, Y$ correnti.
* **Asset Caching:** Inizializza e memorizza in cache l'istanza `Image` associata per evitare ricaricamenti asincroni durante il rendering.
* **Rendering Custom:** Implementa metodi di disegno vettoriale su Canvas (`drawRoundedImage`, ombreggiature, bordi ad arco e stati di highlighting per la carta di Briscola).
* **Hit Detection:** Integra il metodo `isPointInside(px, py)` per identificare l'interazione del cursore/touch dell'utente.

#### 2. Classe `GiocoBriscola`
Contiene l'intero motore di gioco e la macchina a stati:
* **Inizializzazione:** Generazione del mazzo, mescolamento tramite algoritmo di *Fisher-Yates*, distribuzione carte e determinazione del seme di Briscola.
* **AI Bot:** Algoritmo euristico per le decisioni di gioco del Bot:
    * *Giocatore di risposta:* Calcola la carta vincente a minor costo di punti, altrimenti scarta la carta di minor valore teorico.
    * *Giocatore d'uscita:* Valuta il rischio tenendo conto delle briscole rimaste in mano.
* **State Machine:** Gestisce il passaggio fluido tra le fasi (`IN_CORSO`, `PAUSA_PRESA` con ritardo di lettura, e `FINITA`).

#### 3. Layout Dinamico e Scalabilità (`resizeCanvas`)
* **Responsive Canvas:** Sistema di calcolo proporzionale tramite **Virtual Resolution** (1100x750 per Landscape, 600x950 per Mobile Portrait).
* **Retina Display Support:** Adattamento automatico della risoluzione tramite `window.devicePixelRatio` per garantire nitidezza grafica su schermi HiDPI.

---

## ✨ Funzionalità Principali

* **Multi-Touch & Mouse Input:** Supporto completo sia per eventi mouse (`click`, `mousemove`) sia per interfacce touch mobile (`touchstart`, `touchmove`).
* **Visual Hover Effect:** Ingrandimento ed elevazione dinamica della carta al passaggio del cursore o al tocco.
* **Layout Responsive Avanzato:**
    * **Desktop (Landscape):** Disposizione orizzontale classica con slot centrale e mazzo laterale.
    * **Mobile (Portrait):** Tappeto di gioco riorganizzato in verticale con zone d'interazione compattate per l'utilizzo a una mano.
* **Overlay di Fine Partita:** Schermata riassuntiva con conteggio punti e supporto al riavvio rapido (tocco su schermi touch o tasto `R` su tastiera).

---

## 📂 Struttura del Progetto

```text
Briscola_web/
├── carte/                  # Directory contenente le immagini delle carte (.jpg)
│   ├── 1_coppe.jpg
│   ├── ...
│   └── retro.png          # Asset del retro della carta
├── index.html              # Struttura HTML e Viewport
├── style.css               # Reset CSS e gestione full-screen
├── script.js             # Game Loop, Logica di gioco e Renderer Canvas
└── package.json            # Configurazione progetto npm