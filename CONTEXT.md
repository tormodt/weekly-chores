# Simon & Noah's Oppgavejakt! 🏆

## Formål
En motivasjonstjeneste for barn (9-12 år) som bruker gamification for å oppmuntre til å gjøre hjemmeoppgaver. Systemet er designet for to barn (Simon og Noah) og deres foreldre, med et poengsystem og godkjenning workflow.

## Hovedfunksjoner

### 1. Kalendervisning med Oppgaver
- **Ukeskalender** med oppgaver fordelt på dager (Mandag-Søndag)
- **Poengsystem** - hver oppgave har en poengverdi (1-50 poeng)
- **Visuell feedback** - farger, animasjoner og emojis for engasjement
- **Responsivt design** - optimalisert for tablet (liggende format)

### 2. Oppgaveadministrasjon
- **CRUD-operasjoner** - legg til, rediger, slett oppgaver
- **PIN-beskyttelse** - alle administrative funksjoner krever PIN-kode (5300)
- **Dagstildeling** - oppgaver kan tildeles spesifikke dager
- **Poengtildeling** - sett poengverdi for hver oppgave

### 3. Oppgavefullføring Workflow
1. **Barn fullfører oppgave** - klikker "Ferdig!" på en oppgave
2. **Velger hvem som gjorde den** - Simon eller Noah
3. **Oppgave går til godkjenning** - vises i Godkjenninger-tab
4. **Foreldre godkjenner med PIN** - 5300
5. **Poeng tildeles** - oppdateres i oversikten
6. **Feiring vises** - 5 sekunders celebration modal

### 4. Godkjenning System
- **Godkjenninger-tab** - viser oppgaver som venter på godkjenning
- **Badge-notifikasjon** - viser antall ventende godkjenninger
- **PIN-beskyttelse** - godkjenning krever PIN-kode
- **Godkjenn/Avvis** - foreldre kan godkjenne eller avvise oppgaver

### 5. Poengsystem og Tracking
- **Realtids poengvisning** - øverst på siden for begge barn
- **Ukesreset** - alle poeng og oppgaver resettes hver mandag kl 00:00
- **LocalStorage** - poeng lagres mellom sesjoner
- **Visuell feedback** - farger og animasjoner for motivasjon

## Teknisk Struktur

### Frontend Arkitektur
- **Vue.js 3** - reaktiv frontend framework
- **Vanilla CSS** - custom styling med animasjoner
- **Responsive design** - mobile-first tilnærming
- **Modular struktur** - separerte komponenter for hver funksjonalitet

### Filstruktur
```
weekly-chores/
├── index.html          # Hovedapplikasjon med Vue.js
├── app.js             # Vue.js app logikk og state management
├── styles.css         # CSS styling og animasjoner
├── package.json       # NPM dependencies
└── CONTEXT.md         # Denne filen
```

### Vue.js App Struktur

#### Data Properties
```javascript
// UI State
activeTab: "oversikt"           // Aktuell tab
showChildModal: false           // Child selection modal
showPinCodeModal: false         // PIN input modal
showAddTaskModal: false         // Add task modal
showEditTaskModal: false        // Edit task modal
showCelebration: false          // Celebration modal

// Task Management
tasks: []                       // Array av oppgaver
pendingApprovals: []            // Oppgaver som venter på godkjenning
taskForm: {}                    // Form data for add/edit

// Points System
simonPoints: 0                  // Simon's poeng
noahPoints: 0                   // Noah's poeng
PIN_CODE: "5300"                // Global PIN-kode
```

#### Computed Properties
- `updatedTabs()` - Oppdaterer tab badges basert på pending approvals

#### Methods
- `getDayTasks(dayName)` - Henter oppgaver for en spesifikk dag
- `getDayPoints(dayName)` - Beregner totalt poeng for en dag
- `completeTask(task)` - Starter oppgavefullføring workflow
- `selectChild(childName)` - Velger hvem som gjorde oppgaven
- `approveTask(taskId)` - Godkjenner oppgave og tildeler poeng
- `rejectTask(taskId)` - Avviser oppgave og tilbakestiller den
- `showPinModal(action, id)` - Viser PIN input modal
- `verifyPin()` - Verifiserer PIN-kode
- `showCelebration(childName, points)` - Viser feiring modal

### CSS Struktur

#### Design System
- **Fargepalett** - Lekne farger for barn (gradienter, pastell)
- **Typografi** - Comic Sans MS for barnslig følelse
- **Animasjoner** - Bounce, pulse, fade, scale effekter
- **Responsive breakpoints** - Tablet landscape, tablet portrait, mobile

#### Komponenter
- `.calendar` - Ukeskalender layout
- `.task-card` - Individuelle oppgavekort
- `.modal-overlay` - Modal bakgrunn
- `.celebration` - Feiring modal
- `.points-card` - Poengvisning for barn

### State Management

#### LocalStorage
- `simonPoints` - Simon's poeng
- `noahPoints` - Noah's poeng
- `lastReset` - Siste ukesreset dato

#### Reactive Data
- Alle modal states er reactive
- Task arrays oppdateres automatisk
- Poeng oppdateres i sanntid
- Tab badges oppdateres dynamisk

### Security
- **PIN-kode beskyttelse** - 5300 for alle administrative funksjoner
- **Client-side validering** - form validering og input sjekking
- **No server-side** - ren frontend applikasjon

### Performance
- **Lazy loading** - modaler lastes kun når nødvendig
- **Efficient updates** - Vue.js reactivity system
- **CSS animations** - hardware-accelerated transforms
- **Minimal dependencies** - kun Vue.js og http-server

## Brukeropplevelse

### For Barn (Simon & Noah)
- **Engasjerende design** - farger, animasjoner, emojis
- **Enkel interaksjon** - store knapper, tydelige elementer
- **Umiddelbar feedback** - feiring når oppgaver godkjennes
- **Konkurranse** - poengvisning for motivasjon

### For Foreldre
- **Administrativ kontroll** - PIN-beskyttede funksjoner
- **Godkjenning workflow** - kontroll over oppgavegodkjenning
- **Oversikt** - kalendervisning av alle oppgaver
- **Poengtracking** - følge barnas fremgang

## Utviklingsnotater

### Design Prinsipper
- **Tablet-first** - optimalisert for liggende tablet
- **Touch-friendly** - store knapper og touch targets
- **Accessibility** - høy kontrast og lesbarhet
- **Gamification** - poeng, badges, feiring

### Tekniske Valg
- **Vue.js 3** - moderne reaktivitet og performance
- **Vanilla CSS** - full kontroll over styling
- **No build process** - enkel utvikling og deploy
- **LocalStorage** - persistent state uten backend

### Fremtidige Forbedringer
- **Backend integrasjon** - persistent lagring
- **Multi-user support** - flere familier
- **Advanced analytics** - detaljert rapportering
- **Mobile app** - native applikasjon
