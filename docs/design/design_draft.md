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
    vede i calcoli, come oggi.
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

*   **Indirizzo definitivo del sito.** Va scelto prima del primo invito, perché cambiarlo dopo rompe le icone
    installate e blocca le modifiche non sincronizzate. GitHub Pages è sconsigliato: tutti i siti dello
    stesso utente condividono l'origine.
*   **Servizio email per i codici.** Il servizio incluso in Supabase invia poche email *(da verificare)*. Va
    scelto un servizio gratuito esterno, verificando che non richieda un dominio a pagamento.
*   **Modello di sincronizzazione.** Registro di operazioni che si può solo allungare, oppure spesa salvata
    per intero con una cronologia separata.
*   **Pausa di Supabase.** Va verificato dopo quanti giorni senza uso il progetto gratuito va in pausa, e se
    una richiesta automatica giornaliera basta a evitarla.
*   **Comportamento di iPhone.** Va verificato che la memoria dell'app installata sopravviva a chiusura e
    riavvio, e che non venga cancellata dopo giorni senza uso.
*   **Fonte dei cambi.** Va verificato se il file della BCE si può leggere dal browser, o se va copiato ogni
    giorno da un job di GitHub.
*   **Spese tra due amici fuori dai gruppi.** La proposta è trasformarle in un gruppo nascosto di due persone,
    così ci sono una sola regola di accesso e un solo modo di sincronizzare.

--------------------------------------------------------------------------------

*Drafted with EGM*
