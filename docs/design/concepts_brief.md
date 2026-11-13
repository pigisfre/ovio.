# ovio condiviso con gli amici (+ funzioni Pro)

* **Autore:** pigisfre
* **Data:** 2026-11-13
* **Stato:** brainstorm EGM, dopo la revisione dei 7 revisori indipendenti ("pesci rossi") e le decisioni dell'autore del 2026-11-13

## Panoramica

ovio diventa un'app che un piccolo gruppo di amici usa insieme per dividere le spese, soprattutto in viaggio.
Il motivo: l'interfaccia di Splitwise non piace e a ogni viaggio bisogna pagare Splitwise Premium.

Vincoli dati dal proprietario:

- quasi tutti hanno iPhone, pochissimi Android;
- per ora l'app si usa dal browser, aggiunta alla schermata Home;
- costo zero: niente server a pagamento, niente account Apple Developer, niente SMS;
- l'accesso deve essere gratuito e sicuro;
- chi vuole può usarla da solo, scrivendo i nomi degli amici (persone "segnaposto" senza account). Un amico può poi iscriversi e prendere il suo segnaposto;
- i gruppi si condividono con un link d'invito;
- deve funzionare senza rete e sincronizzarsi dopo;
- chiunque nel gruppo può modificare o cancellare qualsiasi spesa;
- ci sono tutte le funzioni di Splitwise Pro tranne la lettura degli scontrini;
- si riparte da zero: i dati di oggi non vengono portati nel nuovo sistema.

## Analisi

Hanno risposto tutti e 7 i revisori. Ogni revisore ha letto il concetto e il codice senza sapere nulla di questa conversazione.

| Revisore | Stato |
| --- | --- |
| egm-design (critico del design, costi e quote) | completato |
| egm-codebase-details (aderenza al codice, diagnosi dei problemi) | completato |
| egm-zoom-out (semplicità e perimetro) | completato |
| egm-comprehension (esperienza degli amici) | completato |
| egm-implementation-readiness (prontezza, migrazione, rilascio) | completato |
| egm-structural (struttura e manutenzione) | completato |
| egm-inventive-catalyst (contraddizioni e soluzioni) | completato |

Molte affermazioni sui servizi esterni (limiti di Firebase e Supabase, comportamento di iOS, accesso al file
dei cambi della BCE dal browser) **non sono state verificate**: i revisori non avevano rete. Vanno controllate
prima di decidere. Sono marcate *(da verificare)*.

### 🔴 Bloccanti: senza questi l'idea non funziona

1. **L'app non si apre senza rete.**
   - **Il problema:** la versione web di oggi non ha un *service worker*, il pezzo che salva l'app sul telefono, e nemmeno un *manifest*, il file che la rende installabile. Se un amico apre l'icona all'estero senza connessione, vede una pagina vuota. È proprio il caso d'uso principale.
   - **Cosa non basta:** il salvataggio offline dei dati, per esempio quello di Firebase, non aiuta: salva i dati, non l'app.
   - **Cosa serve:** manifest e service worker, più un test automatico che apre l'app con la rete spenta.
   - *(5 revisori su 7)*

2. **L'accesso dentro l'app installata su iPhone.**
   - **Il problema:** su iPhone l'app aggiunta alla Home ha una memoria separata da Safari *(da verificare, alta fiducia)*. Ne seguono tre difficoltà:
     - un link di accesso via email si apre in Safari, non nell'app installata: l'amico risulta collegato nel posto sbagliato;
     - un link d'invito aperto dentro WhatsApp usa il browser interno di WhatsApp, e lì Google blocca l'accesso;
     - l'accesso con Google di Firebase funziona bene solo se l'app è ospitata sullo stesso dominio di Firebase.
   - **La soluzione più robusta:** un codice di 6 cifre ricevuto via email e digitato dentro l'app.
   - **La difficoltà:** Supabase lo offre gratis; Firebase gratis offre solo il link, non il codice *(da verificare)*.
   - **Primo passo:** va provato su un iPhone vero prima di scegliere il servizio.
   - *(tutti e 7)*

3. **Il modello dei dati va riprogettato, non solo collegato a un server.** Oggi ovio ragiona come se ci fosse un solo utente:
   - "io" (`isMe`) è salvato dentro i dati;
   - l'attività è salvata come frasi già scritte in prima persona ("Hai aggiunto…"): gli altri leggerebbero "Hai…" per cose che non hanno fatto;
   - gli amici sono una lista personale;
   - lo schema già preparato (`replica/schema.sql`) dà accesso solo al proprietario di ogni riga, quindi un gruppo non si può condividere.
   
   Serve un modello in cui l'unità è il **gruppo**:
   - ogni gruppo ha dei **membri**, persone vere o segnaposto;
   - ogni membro ha un identificativo che non cambia mai;
   - "prendere il proprio segnaposto" significa solo collegare l'account a quel membro, senza riscrivere nessuna spesa;
   - l'attività si salva come eventi (chi, cosa, quanto) e la frase si scrive al momento, per chi la legge;
   - le spese tra due amici fuori dai gruppi diventano un **gruppo nascosto di due persone**, così c'è una sola regola di accesso: "sei membro del gruppo".
   
   *(tutti e 7)*

4. **"Chiunque modifica tutto" più offline: modifiche perse e cancellazioni che tornano.**
   - **Il problema:** il piano attuale fa vincere l'ultima modifica, ordinata con l'ora del telefono. In viaggio però gli orologi dei telefoni non sono affidabili. Due amici che modificano la stessa spesa senza rete perdono una delle due modifiche senza saperlo. Una cancellazione e una modifica fatte offline possono far ricomparire la spesa o farla sparire.
   - **Cosa serve:**
     - una **cronologia di ogni spesa** obbligatoria, che si può solo aggiungere e mai modificare o cancellare, con chi, quando, cosa c'era prima e cosa dopo;
     - **cancellazioni "morbide"**: un segno di cancellato, sempre ripristinabile;
     - la spesa salvata **sempre per intero**: totale, valuta, pagatori e quote insieme, mai un pezzo alla volta. Altrimenti due modifiche possono mescolarsi e i conti non tornano più.
   - **Proposta del revisore inventivo:** salvare ogni cambiamento come un'operazione in un **registro che si può solo allungare**. Lo stato delle spese e i saldi si calcolano rileggendo il registro. In un colpo solo si ottengono sincronizzazione, cronologia, annulla, cancellazioni sicure e conflitti visibili ("ci sono due versioni, quale tieni?"). Funziona con qualsiasi servizio.
   - *(tutti e 7)*

### 🟡 Importanti

5. **Firebase o Supabase: il punto di scelta vero è l'accesso, non i dati.**

   | | Firebase (piano gratuito Spark) | Supabase (piano gratuito) |
   | --- | --- | --- |
   | Va in pausa se non usato | no | sì, dopo circa una settimana *(da verificare)*. Rimedio: un job gratuito di GitHub che lo "sveglia" ogni giorno |
   | Lavoro offline | già incluso nella versione web | da costruire (molto più semplice con il registro del punto 4) |
   | Codice di 6 cifre via email | non gratuito *(da verificare)* | incluso |
   | Invio email gratuito | limitato per giorno *(da verificare)* | molto limitato; serve un servizio email esterno gratuito, che spesso chiede un dominio proprio |
   | Controlli sui dati lato server | solo regole di accesso, nessun codice (le Cloud Functions sono a pagamento) | regole di database complete |
   | Funziona anche nell'app nativa | il salvataggio offline web non funziona in React Native *(da verificare)* | da costruire comunque |

   Cinque revisori preferiscono Firebase, il revisore inventivo preferisce Supabase con il registro.
   Tutti concordano su due punti:
   - isolare il servizio in **un solo modulo**, così si può cambiare dopo;
   - **provare l'accesso su iPhone prima** di decidere.

6. **L'indirizzo del sito.**
   - **Sicurezza:** su GitHub Pages tutti i siti dello stesso utente GitHub condividono la stessa "origine". Un altro sito pubblicato dal tuo account potrebbe leggere i dati di accesso e la cache di ovio.
   - **Indirizzo definitivo:** l'indirizzo va scelto una volta per tutte prima del primo invito. Se cambia, le icone installate dagli amici smettono di funzionare e le modifiche non sincronizzate restano bloccate.
   - **Proposta:** Firebase Hosting (gratuito, con un indirizzo `*.web.app` tutto per ovio) o un'altra piattaforma gratuita con un indirizzo proprio.

7. **Valute: c'è già un errore oggi.**
   - **L'errore:** i saldi sommano importi in valute diverse come se fossero la stessa (`src/lib/balances.ts`). Nella pagina Amici, 10 USD e 10 EUR diventano "20".
   - **Cosa serve:**
     - salvare su ogni spesa importo e valuta originali, cambio usato, data del cambio e importo convertito. Il cambio resta **fisso** al momento dell'inserimento, così i saldi non cambiano da soli ogni giorno;
     - poter scrivere il cambio a mano, se si è offline o se la valuta non c'è: la BCE copre solo circa 30 valute, mancano per esempio dong, peso argentino e dirham.
   - **Da dove prendere i cambi:** il file della BCE probabilmente non si può leggere direttamente dal browser *(da verificare)*. Soluzione gratuita: un job di GitHub che ogni giorno lo copia come `rates.json` sul sito.

8. **Spese ricorrenti duplicate.**
   - **Il problema:** se vengono create "quando qualcuno apre l'app", due amici offline creano lo stesso affitto due volte.
   - **Cosa serve:** l'identificativo di ogni occorrenza deve essere fisso, per esempio "regola + data". I duplicati allora diventano una sola spesa.
   - **Da accettare:** se nessuno apre l'app per un mese, le spese compaiono tutte insieme e in ritardo.

9. **Il link d'invito è una chiave.**
   - **Il problema:** se finisce in mani sbagliate, chiunque entra e può cancellare tutto.
   - **Cosa serve:**
     - link revocabile e rinnovabile, con scadenza;
     - chi entra viene mostrato al gruppo;
     - un'anteprima prima di entrare ("Ti hanno invitato a 'Lisbona 2027', 6 membri");
     - la possibilità di invitare "come Marco", per prendere subito il segnaposto.
   - La cronologia del punto 4 è la vera rete di sicurezza.

10. **Prendere un segnaposto.**
    - **Il problema:** chiunque potrebbe prendere "Giulia" e con lei i suoi debiti. Inoltre lo stesso amico può esistere come segnaposti diversi in gruppi diversi.
    - **Cosa serve:**
      - si prende solo un segnaposto libero, con l'invito o con conferma di un membro;
      - l'operazione resta in cronologia e si può annullare;
      - un'unione manuale "sono la stessa persona".

11. **Si vede quando i dati non sono sincronizzati?** Oggi no. In viaggio la gente si paga guardando saldi magari vecchi. Serve:
    - lo stato in ogni gruppo: "N modifiche non ancora inviate", "aggiornato alle 14:32";
    - un avviso quando si è offline;
    - una schermata **Diagnostica** con versione dell'app, stato della sincronizzazione, ultimi errori, un "codice di controllo" dei saldi da confrontare tra amici e il pulsante "Copia rapporto" da incollare nella chat;
    - un messaggio diverso per ciascun caso: "nessuna rete", "servizio in pausa", "limite giornaliero raggiunto", "non sei collegato".

12. **Versioni diverse dell'app in giro.**
    - **Il problema:** con l'app salvata sul telefono, gli amici usano versioni vecchie per giorni. Una versione vecchia che riscrive una spesa può cancellare campi nuovi che non conosce, come più pagatori o il cambio.
    - **Cosa serve:**
      - un numero di versione su ogni documento;
      - le versioni vecchie non scrivono dati più nuovi di loro;
      - un "versione minima" sul server che fa ricaricare l'app.

13. **Conti che devono sempre tornare.**
    - **Il controllo:** pagato = dovuto = totale, al centesimo. Va fatto quando si salva e quando si legge. Se una spesa non torna, la si mostra come "da sistemare" invece di sommarla nei saldi.
    - **Arrotondamenti:** oggi il centesimo in più va al primo della lista. Le quote salvate vanno considerate quelle vere, e i partecipanti vanno ordinati in modo fisso quando si calcola.

14. **Quote gratuite di Firebase.** Il limite indicativo è di 50.000 letture al giorno *(da verificare)*.
    - **La stima:** un viaggio con 25 persone che aprono l'app 10 volte al giorno, su 400 spese, può superarlo.
    - **Cosa serve:** scaricare solo le novità, caricare cronologia e commenti solo quando si apre una spesa, e mostrare "sincronizzazione in pausa" invece di errori.

15. **Backup.** I piani gratuiti non hanno backup automatici *(da verificare)*. Servono:
    - un'esportazione completa del gruppo in JSON oltre al CSV;
    - un job gratuito di GitHub che salva una copia ogni notte.

16. **L'ambito è troppo grande per una prima consegna.** Tutti i revisori consigliano di **dividere in fasi**: prima le fondamenta, poi le funzioni Pro.
    - Il revisore della semplicità propone di rimandare spese ricorrenti, grafici e commenti finché qualcuno non li chiede.
    - Questo è in contrasto con la tua richiesta "tutte le funzioni Pro": la decisione è tua.
    - **Già quasi pronto nel codice:**
      - più pagatori: il modello `Share` ha già "pagato" per persona; cambiano solo la funzione di calcolo e lo schermo;
      - divisione per voci: è la divisione esatta con un'altra interfaccia;
      - divisione predefinita del gruppo, ricerca, CSV e grafici: calcoli sul telefono, senza lavoro sul server.

17. **Uso da soli e uso condiviso con un solo percorso.**
    - **Proposta:** al primo avvio un account "anonimo" gratuito. Chi usa ovio da solo scrive comunque sul server come gli altri. Quando invita qualcuno, collega email o Google allo stesso account.
    - **Vantaggio:** un solo modo di salvare i dati, invece di due da mantenere.
    - **Rischio:** se si cancellano i dati del browser prima di collegare l'email, si perde l'account. Bisogna chiedere il collegamento presto.

### 🟢 Dettagli

- **Identificativi:** usare identificativi casuali standard (`crypto.randomUUID`) invece di quelli attuali basati sull'ora.
- **Date:** la data della spesa come giorno di calendario (`2026-11-13`) invece di un istante. Viaggiando tra fusi orari, oggi una spesa può cambiare giorno.
- **App nativa iOS/Android:** per ora solo web. Il salvataggio offline web di Firebase non funziona nell'app nativa *(da verificare)*.
- **Spese doppie:** due persone offline possono inserire la stessa cena. Dopo la sincronizzazione va segnalato "sembra un doppione".
- **Notifiche:** le notifiche push web sono gratuite su iPhone dalla versione 16.4 per le app aggiunte alla Home *(da verificare)*. In alternativa l'Attività con un segno "non letto".
- **Uscita dal gruppo e cancellazione dell'account:** la persona torna segnaposto e le spese restano. Serve anche una breve informativa privacy (GDPR).
- **Documenti da aggiornare:** `replica/architecture.md` e `replica/schema.sql` descrivono un altro prodotto. Vanno segnati come superati.
- **Test:** emulatore Firebase gratuito in CI e test di sincronizzazione con due browser, offline, orologi sfasati e modifiche in conflitto.

## Obiettivi e non-obiettivi

* **Obiettivi:**
  - gruppi condivisi con link d'invito;
  - accesso gratuito e sicuro;
  - segnaposto che si possono prendere;
  - funzionamento offline con sincronizzazione;
  - modifiche di tutti con cronologia;
  - tutte le funzioni di Splitwise Pro tranne la lettura degli scontrini: grafici, ricerca, conversione valute, categorie, divisione predefinita per gruppo, divisione per voci, spese ricorrenti, nessun limite di spese, esportazione CSV, più pagatori, commenti;
  - costo zero;
  - versione web per iPhone aggiunta alla Home.
* **Non-obiettivi:**
  - lettura automatica degli scontrini;
  - app negli store, per ora;
  - Accedi con Apple e SMS, a pagamento;
  - portare i dati di oggi;
  - pagamenti diretti tra amici;
  - guadagnarci, per ora.

## Alternative considerate

- **Accedi con Apple:** scartato dall'autore perché richiede l'account Apple Developer da 99 €/anno.
- **Accesso con SMS:** scartato dall'autore perché costa.
- **Link d'accesso via email come metodo principale:** scartato dai revisori perché su iPhone si apre in Safari e non nell'app installata *(da verificare su iPhone)*.
- **"Vince l'ultima modifica" senza cronologia:** scartato dai revisori perché con modifiche di tutti e offline si perdono dati senza traccia.
- **Convertire le valute al cambio del giorno quando si mostrano:** scartato dai revisori perché i saldi cambierebbero da soli e sarebbero diversi tra i telefoni.
- **Riprendere `replica/schema.sql` così com'è:** scartato dai revisori perché permette l'accesso solo al proprietario e non può condividere i gruppi.
- **Restare su GitHub Pages:** sconsigliato dai revisori per l'origine condivisa con gli altri siti dello stesso utente e per i problemi con l'accesso Google di Firebase.

## Decisioni chiave e prossimi passi

**Decise dall'autore (2026-11-13):**

1. **Servizio: Supabase.** Motivo: il codice di 6 cifre via email funziona dentro l'app installata su iPhone.
   Conseguenze, da portare in `/egm:egm-draft`:
   - la **pausa** dopo circa una settimana senza uso *(da verificare)* si evita con un job programmato gratuito
     di GitHub Actions che ogni giorno fa una richiesta al progetto. Lo stesso job pubblica `rates.json` con i
     cambi BCE (punto 7). Il job va tenuto vivo: GitHub sospende i job programmati nei repository fermi da 60
     giorni *(da verificare)*;
   - la **sincronizzazione offline va costruita**. Proposta: il registro di operazioni che si può solo
     allungare (punto 4). Il telefono tiene una coda delle operazioni da inviare; quando torna la rete invia la
     coda e scarica le operazioni nuove degli altri. Sul server c'è una sola tabella in cui si può solo aggiungere;
   - le **regole di accesso** del database si scrivono sui membri del gruppo, non sul proprietario della riga
     (sostituiscono `replica/schema.sql`);
   - l'**invio delle email** con il servizio incluso è molto limitato *(da verificare)*: serve un servizio
     email esterno con piano gratuito, collegato a Supabase. Va verificato se chiede un dominio proprio (che costa);
   - l'**indirizzo del sito** resta da scegliere, prima del primo invito. Firebase Hosting non serve più: le
     alternative gratuite con un indirizzo tutto per ovio sono per esempio Cloudflare Pages o Vercel
     *(da verificare)*. GitHub Pages resta sconsigliato (origine condivisa).
2. **Funzioni Pro a fasi**, dopo le fondamenta. Tutte entrano, una alla volta.

**Ancora aperte:**

- indirizzo definitivo del sito;
- servizio email gratuito per i codici;
- registro di operazioni oppure spesa intera con cronologia a parte. La proposta per Supabase è il registro.

Prove da fare prima di scrivere il documento definitivo, su un iPhone vero:

- **A.** Accesso dall'icona sulla Home: codice digitato, link email, Google.
- **B.** Offline: modalità aereo, chiusura e riapertura dell'app, spese aggiunte, ritorno della rete. Le modifiche non inviate sopravvivono? L'app si apre senza rete?
- **C.** Verificare i punti *(da verificare)* sui siti ufficiali: limiti di Firebase e Supabase, pausa di Supabase, file dei cambi BCE.

Ordine di lavoro proposto, comune a più revisori:

1. l'app si apre offline (manifest e service worker) e si installa sulla Home;
2. prove di accesso su iPhone con il codice email di Supabase;
3. nuovo modello dei dati e regole di accesso, con test;
4. sincronizzazione dietro un solo modulo, riusando i calcoli puri già esistenti in `src/lib`;
5. accesso, segnaposto e inviti;
6. prova con te e 2–3 amici su un viaggio vero;
7. funzioni Pro una alla volta.
