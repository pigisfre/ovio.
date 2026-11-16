# ovio condiviso con gli amici

*   **Autore:** pigisfre
*   **Stato:** Draft
*   **Data:** 2026-11-13
*   **Contesto di partenza:** [concepts_brief.md](./concepts_brief.md)

--------------------------------------------------------------------------------

## Panoramica

ovio è un'app per dividere le spese, oggi usata da una sola persona su un solo dispositivo: tutti i dati
stanno nel telefono o nel browser di chi la usa. Questo progetto la trasforma in un'app che un piccolo gruppo
di amici usa insieme. Ognuno vede gli stessi gruppi e gli stessi saldi, anche senza rete durante un viaggio,
e i dati si allineano quando la rete torna.

I dati condivisi stanno su **Supabase**, piano gratuito. Gli amici aprono ovio da un link e la aggiungono
alla schermata Home dell'iPhone, ed entrano con un codice di 6 cifre ricevuto via email. Le funzioni di
Splitwise Pro arrivano dopo, una alla volta, sopra queste fondamenta.

## Il problema

Oggi gli amici dividono le spese di viaggio con Splitwise, e questo crea due problemi:

1. **Costo ricorrente.** A ogni viaggio qualcuno paga Splitwise Premium per avere le funzioni che servono in
   viaggio, per esempio la conversione delle valute.
2. **Interfaccia.** L'interfaccia di Splitwise non piace al gruppo.

ovio risolve già il secondo punto per chi la usa da solo, ma non il primo: gli amici non possono vederla né
usarla. Un'app per dividere le spese ha valore solo se tutto il gruppo vede gli stessi numeri.

Ci sono anche problemi già presenti nel codice di oggi, che la condivisione renderebbe visibili a tutti:

- **L'app non si apre senza rete.** Manca il pezzo che la salva sul telefono (service worker e manifest),
  quindi all'estero, senza connessione, l'icona sulla Home mostra una pagina vuota.
- **Le valute si sommano tra loro.** I saldi sommano importi in valute diverse come se fossero la stessa:
  10 USD e 10 EUR diventano "20".
- **I dati presuppongono un utente solo.** "Io" è salvato dentro i dati e l'attività è salvata come frasi in
  prima persona ("Hai aggiunto…"). In un gruppo condiviso ognuno leggerebbe "Hai…" per cose fatte da altri.

## Obiettivi

Obiettivi della **fase 1, le fondamenta**. Ognuno ha un criterio per dire che è raggiunto.

*   **G1. Si apre senza rete.** Dopo la prima apertura con rete, l'app installata sulla Home di un iPhone si
    apre e mostra gruppi e saldi anche in modalità aereo.
    *Criterio:* un test automatico apre il sito buildato con la rete spenta e trova la schermata dei gruppi.
*   **G2. Si entra dall'app installata.** Un amico entra digitando nell'app installata un codice di 6 cifre
    ricevuto via email, senza password e senza passare da Safari.
    *Criterio:* provato su un iPhone vero, dall'icona sulla Home.
*   **G3. Si condivide un gruppo.** Chi crea un gruppo genera un link d'invito. Chi lo apre e accede entra
    nel gruppo e vede le stesse spese e gli stessi saldi.
    *Criterio:* due browser con due account diversi mostrano gli stessi saldi, al centesimo.
*   **G4. Si usa anche da soli.** Chi non vuole condividere usa ovio con i nomi degli amici (segnaposto) e
    vede i calcoli, come oggi. Serve comunque un account con codice email (decisione dell'autore).
    *Criterio:* un gruppo con un solo account e tre segnaposto funziona dall'inizio alla fine.
*   **G5. Si prende il proprio segnaposto.** Un amico che entra con un invito può collegare il suo account al
    segnaposto con il suo nome. Le spese già inserite restano sue, senza che nessuna venga riscritta.
*   **G6. Funziona offline e si sincronizza.** Le spese aggiunte, modificate o cancellate senza rete restano
    sul telefono e arrivano agli altri appena torna la rete.
    *Criterio:* un test automatico con due browser, uno offline, termina con gli stessi saldi su entrambi.
*   **G7. Nessuna modifica si perde senza traccia.** Chiunque nel gruppo può modificare o cancellare
    qualsiasi spesa. Ogni cambiamento resta in una cronologia che non si può cancellare, e dalla cronologia si
    può ripristinare qualsiasi versione, anche una spesa cancellata.
*   **G8. Si vede se i dati sono aggiornati.** Ogni gruppo mostra quante modifiche non sono ancora state
    inviate e quando è stato aggiornato l'ultima volta.
*   **G9. I conti tornano.** In ogni spesa la somma pagata, la somma dovuta e il totale coincidono al
    centesimo, e i saldi non sommano mai valute diverse. Una spesa che non rispetta la regola viene mostrata
    come "da sistemare" e non entra nei saldi.
*   **G10. Costo zero.** Nessun servizio a pagamento, nessuna carta di credito registrata.

Obiettivi delle **fasi successive**, una funzione alla volta:

*   **G11. Funzioni Pro.** Più pagatori, conversione valute con il cambio fissato sulla spesa, categorie,
    divisione predefinita per gruppo, divisione per voci, ricerca, esportazione CSV, grafici, spese
    ricorrenti senza duplicati, commenti, nessun limite di spese.

## Non-obiettivi

*   **Lettura automatica degli scontrini.** Esclusa dall'autore.
*   **App negli store** (App Store, Play Store). Per ora solo la versione web aggiunta alla Home.
*   **Accedi con Apple e accesso con SMS.** Richiedono servizi a pagamento.
*   **Portare i dati di oggi.** Si riparte da zero; i dati salvati nel browser con la versione attuale non
    vengono importati.
*   **Pagamenti tra amici** dentro l'app (PayPal, bonifici). ovio registra i pagamenti, non li esegue.
*   **Guadagnare.** Nessun abbonamento, nessuna pubblicità, nessun limite artificiale.
*   **Notifiche push** nella fase 1. L'Attività con un segno "non letto" è il modo per scoprire le novità.
*   **Funzionamento offline dell'app nativa** iOS/Android. La fase 1 riguarda solo la versione web.

## Domande aperte

*   **Indirizzo definitivo del sito.** Per ora GitHub Pages su un'organizzazione dedicata (D2, provvisorio).
    Un indirizzo definitivo va deciso più avanti; il trasloco è descritto nel piano tecnico.
*   **Servizio email per i codici (rimandata dall'autore, da chiudere prima di ogni prova con gli amici).**
    Opzioni presentate: servizio incluso in Supabase, il Gmail dell'autore come mittente, un servizio gratuito
    come Brevo. Con l'account obbligatorio (D3) è indispensabile: se i codici non arrivano, nessuno usa ovio,
    nemmeno da solo.
*   **Pausa di Supabase.** Va verificato dopo quanti giorni senza uso il progetto gratuito va in pausa, e se
    una richiesta automatica giornaliera basta a evitarla.
*   **Comportamento di iPhone.** Va verificato che la memoria dell'app installata sopravviva a chiusura e
    riavvio, e che non venga cancellata dopo giorni senza uso.
*   **Fonte dei cambi.** Va verificato se il file della BCE si può leggere dal browser, o se va copiato ogni
    giorno da un job di GitHub.

## Decisioni prese

| # | Decisione | Scelta dell'autore |
| --- | --- | --- |
| D1 | Come si sincronizzano i dati | **Registro di operazioni** che si può solo allungare ("per ora": dietro un solo modulo, sostituibile) |
| D2 | Dove ospitare il sito | **GitHub Pages su un'organizzazione GitHub dedicata**, per esempio `ovio-app.github.io` (provvisorio, con trasloco previsto) |
| D3 | Uso da soli | **Account con codice email sempre obbligatorio**, anche per chi usa ovio da solo |
| D4 | Servizio | **Supabase**, piano gratuito |
| D5 | Funzioni Pro | **A fasi**, dopo le fondamenta |

## Percorsi critici degli utenti (CUJ)

### CUJ 1: Primo accesso dall'iPhone

*   **Dato che** Marco ha ricevuto il link di ovio su WhatsApp e ha un iPhone.
*   **Quando** apre il link:
    *   se si è aperto dentro WhatsApp, ovio mostra "Apri in Safari";
    *   in Safari, ovio mostra come aggiungerla alla schermata Home ("Condividi → Aggiungi alla schermata Home");
    *   Marco apre l'icona, scrive la sua email e digita il codice di 6 cifre ricevuto.
*   **Allora** Marco è dentro l'app installata e vede i suoi gruppi (nessuno, la prima volta). Chiudendo e
    riaprendo l'icona resta collegato.

### CUJ 2: Invito e segnaposto

*   **Dato che** Luca ha creato il gruppo "Lisbona" con i segnaposto Marco e Giulia e ha già inserito tre spese.
*   **Quando** Luca condivide il link d'invito "come Marco", e Marco lo apre, accede e conferma
    "Sono Marco".
*   **Allora** Marco vede le tre spese già inserite e il suo saldo. Il segnaposto Marco ora è collegato al suo
    account, nessuna spesa è stata riscritta, e l'Attività del gruppo mostra "Marco si è unito".

### CUJ 3: Spesa offline all'estero

*   **Dato che** Giulia è a Lisbona in modalità aereo e ha aperto ovio almeno una volta con la rete.
*   **Quando** apre l'icona, aggiunge "Cena 84 €" e chiude l'app. Il giorno dopo la riapre con la rete.
*   **Allora**:
    *   senza rete ovio si apre, mostra il saldo aggiornato con la sua spesa e "1 modifica non ancora inviata";
    *   con la rete la spesa arriva agli altri e lo stato diventa "aggiornato alle …".

### CUJ 4: Due modifiche alla stessa spesa

*   **Dato che** Marco e Luca sono entrambi offline.
*   **Quando** Marco cambia l'importo della cena da 84 € a 90 € e Luca la ridivide in quote. Poi entrambi
    tornano online.
*   **Allora**:
    *   tutti vedono la stessa versione: quella arrivata per ultima al server;
    *   la spesa mostra "Modificata anche da Marco mentre era offline";
    *   dalla cronologia si vede e si ripristina la versione di Marco con un tocco;
    *   i saldi sono uguali su tutti i telefoni.

### CUJ 5: Cancellazione e ripristino

*   **Dato che** qualcuno ha cancellato per errore "Hotel 600 €".
*   **Quando** un altro membro apre la cronologia del gruppo e tocca "Ripristina".
*   **Allora** la spesa torna, i saldi tornano come prima, e la cronologia mostra chi l'ha cancellata e chi
    l'ha ripristinata.

## Piano tecnico (architettura)

### Visione d'insieme

```text
iPhone (app web aggiunta alla Home)
┌──────────────────────────────────────────────────────────────┐
│ Service worker: salva l'app (HTML, JS, icone) per l'offline    │
│                                                                │
│ Schermate (src/app)  ──usano──▶  API di dominio (src/data)     │
│                                    │                           │
│                    ┌───────────────┴───────────────┐           │
│                    ▼                               ▼           │
│        Calcolo dello stato (src/sync/reducer)   Coda e         │
│        operazioni ──▶ gruppi, membri, spese,    sincronizzazione│
│        cronologia, conflitti                    (src/sync/engine)│
│                    │                               │           │
│        Saldi e conti (src/lib, già esistente)      │           │
│                                                    │           │
│        Memoria locale (IndexedDB): operazioni ricevute,        │
│        operazioni da inviare, stato della sincronizzazione     │
└────────────────────────────────────────────────────┼───────────┘
                                                     │ HTTPS
                                                     ▼
Supabase (piano gratuito)
┌──────────────────────────────────────────────────────────────┐
│ Accesso: codice di 6 cifre via email (servizio email: aperto)  │
│ Database Postgres:                                             │
│   group_members  chi (account) è membro di quale gruppo        │
│   invites        link d'invito, revocabili, con scadenza       │
│   ops            il registro: si può solo aggiungere           │
│   app_config     versione minima dell'app                      │
│ Regole di accesso (RLS): "sei membro del gruppo"               │
│ Funzioni di database: entra con invito, crea gruppo            │
└──────────────────────────────────────────────────────────────┘
                                                     ▲
GitHub (organizzazione dedicata, es. ovio-app)       │
┌────────────────────────────────────────────────────┴─────────┐
│ CI: test → build web → test end-to-end → pubblica su Pages     │
│ Job giornaliero: tiene sveglio Supabase, copia i cambi BCE      │
│ in rates.json (fase Pro), salva una copia di backup del registro│
└──────────────────────────────────────────────────────────────┘
```

### 1. Il registro di operazioni (D1)

Ogni cambiamento è un'**operazione**: una riga nuova nella tabella `ops`, che non si modifica né si
cancella mai. Le regole di accesso di Supabase permettono a un membro solo di **aggiungere** righe al
proprio gruppo e di **leggerle**. Non esistono permessi di modifica o cancellazione.

Ogni operazione contiene:

| Campo | Significato |
| --- | --- |
| `id` | identificativo casuale (UUID) creato sul telefono. Se il telefono invia due volte la stessa operazione, il server la scarta: l'invio si può ripetere senza duplicati |
| `group_id` | gruppo a cui appartiene |
| `seq` | numero progressivo assegnato dal **server** all'arrivo. Dà l'ordine di lettura, uguale per tutti e indipendente dagli orologi dei telefoni |
| `author_id` | account che l'ha creata; il server lo impone uguale all'utente collegato |
| `device_id` | telefono che l'ha creata (per la diagnostica) |
| `type` | tipo di operazione (sotto) |
| `payload` | contenuto (JSON) |
| `base_op_id` | per le modifiche: l'operazione da cui partiva chi ha modificato (serve a riconoscere i conflitti) |
| `schema_version` | versione del formato dell'operazione |
| `client_at` / `server_at` | ora sul telefono e ora di arrivo al server |

Tipi di operazione della fase 1:

| Tipo | Cosa fa |
| --- | --- |
| `group_created`, `group_updated`, `group_archived` | crea, rinomina o cambia valuta, archivia un gruppo (mai cancellazione definitiva) |
| `member_added`, `member_updated`, `member_deactivated` | aggiunge un membro (segnaposto o account), lo rinomina, lo disattiva (mai rimosso: le sue spese restano) |
| `member_claimed` | collega un account a un segnaposto |
| `expense_saved` | crea o modifica una spesa; contiene **sempre la spesa intera** (totale, valuta, pagatori, quote, dati di divisione, categoria, data, note). I pagamenti di "Salda" sono spese con `isPayment` |
| `expense_deleted`, `expense_restored` | segna cancellata o ripristina una spesa |

**Stato del gruppo = rilettura del registro.**
- Una funzione pura, `reduce(ops) → GroupState`, rilegge le operazioni in ordine di `seq` e produce membri,
  spese, spese cancellate, cronologia di ogni spesa e conflitti. Le operazioni non ancora inviate vengono
  rilette per ultime, nell'ordine in cui sono state create.
- Quando arrivano operazioni nuove dal server, lo stato si ricalcola da capo.
- Alla scala prevista (qualche migliaio di operazioni per gruppo) si rilegge tutto a ogni aggiornamento. Le
  "fotografie" periodiche dello stato restano un miglioramento futuro, da fare solo se si misura lentezza.

**Regole della rilettura**, scritte una volta e coperte da test:

*   **Spese:** vince l'ultima `expense_saved` o `expense_deleted` in ordine di `seq`.
*   **Conflitto:** se una `expense_saved` ha un `base_op_id` diverso dall'ultima operazione su quella spesa,
    è una modifica partita da una versione vecchia. Vince comunque per ordine, ma la spesa viene segnata
    "modificata in contemporanea". La versione sostituita resta in cronologia e si ripristina con
    `expense_saved`.
*   **Segnaposto:** vale solo la prima `member_claimed` per membro e solo se l'account non è già collegato a
    un altro membro dello stesso gruppo. Le altre restano in cronologia come "rifiutate".
*   **Formati sconosciuti:** un'operazione con `schema_version` più alta di quella che l'app conosce non viene
    applicata. L'app mostra "Aggiorna ovio" invece di calcolare saldi sbagliati.
*   **Spese invalide:** una spesa i cui conti non tornano (somma pagata, somma dovuta e totale diversi, o
    centesimi non interi) viene segnata "da sistemare" ed esclusa dai saldi (G9).

**Cronologia.**
- La cronologia di una spesa è l'elenco delle sue operazioni, con chi le ha fatte e quando. "Ripristina" crea
  una nuova `expense_saved` con il contenuto di una versione precedente.
- L'Attività del gruppo è il registro stesso, trasformato in frasi al momento per chi le legge ("Tu hai
  aggiunto…" oppure "Luca ha aggiunto…"). Non si salvano più frasi già scritte.

### 2. Sincronizzazione

Il modulo `src/sync/engine` è l'unico che parla con Supabase. Funziona così:

1.  Il telefono salva ogni nuova operazione nella **coda locale** (IndexedDB) e aggiorna subito lo stato
    calcolato: l'utente vede la modifica anche senza rete.
2.  Quando c'è rete, la sincronizzazione parte:
    *   all'apertura dell'app;
    *   al ritorno in primo piano;
    *   al ritorno della rete;
    *   ogni 30 secondi mentre l'app è aperta.
3.  Ogni giro di sincronizzazione:
    1.  **invia la coda** in ordine. Un "già presente" dal server vale come inviato, perché l'`id` era stato
        creato sul telefono;
    2.  **scarica le operazioni nuove** di ogni gruppo con `seq` maggiore dell'ultimo ricevuto, a pagine;
    3.  ricalcola lo stato.
4.  Mentre l'app è aperta, l'ascolto in tempo reale di Supabase porta subito le operazioni degli altri. È
    solo un acceleratore: la correttezza dipende dal punto 3.
5.  Lo stato della sincronizzazione è sempre visibile (G8):
    *   operazioni in coda;
    *   ora dell'ultimo aggiornamento;
    *   ultimo errore, con un messaggio diverso per ogni causa: "nessuna rete", "servizio in pausa", "limite
        raggiunto", "non sei collegato", "aggiorna l'app".

Ogni telefono tiene un **codice di controllo** dei saldi di ogni gruppo: un'impronta calcolata sui saldi
netti. La schermata Diagnostica lo mostra, così due amici possono confrontarlo e capire in un attimo se i
loro telefoni sono allineati.

### 3. Accesso e account (D3)

*   L'accesso usa il **codice di 6 cifre via email** di Supabase, digitato dentro l'app installata. Niente
    password, niente link da aprire.
*   L'account è obbligatorio per tutti (D3). La prima schermata chiede l'email, e chi apre ovio dentro
    WhatsApp o da Safari senza averla installata vede le istruzioni per aggiungerla alla Home.
*   La sessione resta salvata nella memoria dell'app installata e funziona offline: si possono aggiungere
    spese senza rete anche giorni dopo l'ultimo accesso. Supabase rinnova la sessione appena torna la rete.
*   Il **servizio email** che invia il codice è ancora da scegliere. Si configura in Supabase e non tocca il
    codice dell'app.
*   All'avvio l'app chiede al browser di non cancellare la sua memoria (`navigator.storage.persist()`).

### 4. Gruppi, membri, segnaposto e inviti

*   **Il gruppo è l'unità di accesso.** Le regole di Supabase lasciano leggere e scrivere le operazioni di un
    gruppo solo a chi è in `group_members`.
*   **I membri vivono dentro il registro**, come operazioni `member_added`. Ogni membro ha un identificativo
    fisso; le spese puntano sempre a quello. Un segnaposto è un membro senza account. "Prendere" il
    segnaposto (`member_claimed`) collega l'account al membro, e nessuna spesa viene riscritta (G5).
*   **"Io"** si calcola: è il membro collegato all'account con cui si è entrati. Non si salva più nei dati.
*   **Spese tra due amici fuori dai gruppi:** diventano un gruppo nascosto di due persone. Così c'è una sola
    regola di accesso e un solo modo di sincronizzare. La scheda Amici somma, per ogni amico con account, i
    saldi dei gruppi in comune, divisi per valuta.
*   **Inviti:** un link contiene un codice casuale salvato in `invites`, con scadenza (14 giorni) e la
    possibilità di revocarlo e rigenerarlo. Può indicare un segnaposto ("invita come Marco").
*   **Entrare con un invito:** una funzione del database controlla il codice, aggiunge l'utente a
    `group_members` e scrive le operazioni `member_added` o `member_claimed`. Chi apre il link vede prima
    un'anteprima: nome del gruppo e numero di membri.

### 5. Conti e valute nella fase 1

*   Si mantengono i calcoli puri esistenti in `src/lib` (centesimi interi, divisioni, saldi, semplificazione
    dei debiti).
*   **Valute (correzione dell'errore attuale):**
    *   in fase 1 ogni spesa ha la valuta del suo gruppo;
    *   tutti i saldi si calcolano **separatamente per valuta**: nessuna somma tra valute diverse, nemmeno
        nella scheda Amici;
    *   il formato della spesa prevede già i campi della conversione (importo e valuta originali, cambio, data
        e fonte del cambio), che resteranno vuoti fino alla fase Pro.
*   **Arrotondamenti:** le quote salvate nella spesa sono quelle vere e non si ricalcolano quando si legge.
    Quando si calcolano, i partecipanti vengono ordinati per identificativo, così il centesimo in più va
    sempre alla stessa persona su tutti i telefoni.
*   **Date:** la data della spesa è un giorno di calendario (`2026-11-16`), non un istante. Così non cambia
    giorno viaggiando tra fusi orari.

### 6. App che si apre senza rete (G1)

*   Un **manifest** rende ovio installabile: nome, icone, colori, apertura a schermo intero, indirizzo di
    partenza.
*   Un **service worker** salva tutti i file dell'app alla prima visita e li usa quando non c'è rete. Viene
    generato in automatico durante la build web (`npm run build:web`) dall'elenco dei file prodotti.
*   **Aggiornamenti:** quando esce una versione nuova, l'app la scarica in background e mostra "Nuova
    versione disponibile, tocca per aggiornare". Se la versione installata è più vecchia della versione minima
    scritta in `app_config`, l'aggiornamento è obbligatorio prima di sincronizzare.

### 7. Indirizzo provvisorio e trasloco (D2)

*   Il sito si pubblica su **GitHub Pages di un'organizzazione GitHub dedicata**, con un'origine tutta sua.
    Il workflow di oggi pubblica lì invece che sul tuo account personale.
*   **Trasloco futuro**, se l'indirizzo cambierà:
    1.  la nuova versione viene pubblicata sul nuovo indirizzo;
    2.  la versione sul vecchio indirizzo viene sostituita da una versione "di trasloco", che si apre,
        **invia tutte le operazioni ancora in coda** e poi mostra "ovio si è spostato: aggiungi alla Home il
        nuovo indirizzo" con il link;
    3.  il vecchio indirizzo resta attivo almeno 60 giorni.
    
    Le operazioni già inviate sono su Supabase, quindi non si perde niente. Agli amici resta solo da
    reinstallare l'icona e rientrare con il codice.

### 8. Diagnostica

Una schermata **Diagnostica**, in Account, mostra:
- versione dell'app e build;
- account e identificativo del telefono;
- per ogni gruppo: operazioni in coda, ultimo aggiornamento, codice di controllo dei saldi;
- gli ultimi 50 errori.

Il pulsante **"Copia rapporto"** copia tutto per incollarlo nella chat del gruppo. Nessun dato viene inviato
a servizi esterni.

### 9. Servizi esterni gratuiti

*   **Supabase:** accesso, database, tempo reale.
*   **Job giornaliero di GitHub Actions:**
    *   fa una richiesta a Supabase per evitare la pausa;
    *   salva una copia del registro in un artefatto privato, come backup;
    *   nella fase Pro, copia i cambi BCE in `rates.json`.
    
    Il job usa una chiave di servizio di Supabase salvata nei segreti di GitHub, mai nel codice.
*   **GitHub Pages:** il sito.

### 10. Cosa cambia nell'app di oggi

*   Lo store Zustand non salva più i dati condivisi. Diventa la vista dello stato calcolato più lo stato
    dell'interfaccia (bozze, annulla, preferenze come l'aspetto).
*   Le schermate non chiamano più direttamente lo store per salvare: usano l'API di dominio (`src/data`), che
    crea le operazioni. Solo `src/sync` conosce Supabase.
*   I dati salvati nel browser dalla versione di oggi (`ovio-v1`) vengono ignorati: si riparte da zero
    (non-obiettivo).
*   Per ora solo la versione web. Le build native restano possibili, ma la fase 1 non le copre.

--------------------------------------------------------------------------------

*Drafted with EGM*
