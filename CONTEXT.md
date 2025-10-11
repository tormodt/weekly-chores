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
- **Inline oppretting** - opprett oppgaver direkte i kalenderen
- **Stjernesystem** - velg poengverdi (1-5 stjerner) visuelt
- **Dagstildeling** - oppgaver kan tildeles spesifikke dager
- **Poengtildeling** - sett poengverdi for hver oppgave

### 3. Oppgavefullføring Workflow
1. **Barn fullfører oppgave** - klikker "Simon" eller "Noah" på en oppgave
2. **Oppgave går til godkjenning** - vises i Godkjenninger-tab
3. **Foreldre godkjenner direkte** - klikk "Godkjenn" eller "Avvis"
4. **Poeng tildeles** - oppdateres i oversikten
5. **Feiring vises** - 5 sekunders celebration modal

### 4. Godkjenning System
- **Godkjenninger-tab** - viser oppgaver som venter på godkjenning
- **Badge-notifikasjon** - viser antall ventende godkjenninger
- **Direkte godkjenning** - foreldre kan godkjenne eller avvise oppgaver direkte
- **Visuell feedback** - tydelige knapper med emojis

### 5. Poengsystem og Tracking
- **Realtids poengvisning** - øverst på siden for begge barn
- **Synkronisert poengberegning** - scorecards viser kun poeng fra godkjente oppgaver
- **Ukesreset** - alle poeng og oppgaver resettes hver mandag kl 00:00
- **LocalStorage** - poeng lagres mellom sesjoner
- **Dataintegritet** - poeng beregnes på nytt ved oppstart for konsistens
- **Visuell feedback** - farger og animasjoner for motivasjon
- **Forbedret stjernkontrast** - stjerner har bedre synlighet mot gule bakgrunner

## Teknisk Struktur

### Frontend Arkitektur
- **Vue.js 3** - reaktiv frontend framework
- **Vanilla CSS** - custom styling med animasjoner
- **Responsive design** - mobile-first tilnærming
- **Modular struktur** - separerte komponenter for hver funksjonalitet

### Kjøring av Applikasjonen
- **Web Server Only**: Applikasjonen er designet for å kjøre kun på webserver
- **GitHub Pages**: Produksjonsdeploy med automatisk CI/CD og custom domain
- **GitHub Actions**: Automatisk TypeScript-kompilering og deployment ved hver push til main

### Filstruktur
```
weekly-chores/
├── index.html              # Hovedapplikasjon med Vue.js og Firebase service
├── app.js                  # Kompilert JavaScript fra TypeScript (generert automatisk)
├── firestore-service.js    # Kompilert Firebase service (generert automatisk)
├── firebase-config.js      # Kompilert Firebase config (generert automatisk)
├── firebase-types.js       # Kompilert type definitions (generert automatisk)
├── app.d.ts               # TypeScript deklarasjoner (generert automatisk)
├── firestore-service.d.ts # Firebase service deklarasjoner (generert automatisk)
├── firebase-config.d.ts    # Firebase config deklarasjoner (generert automatisk)
├── firebase-types.d.ts     # Type definitions deklarasjoner (generert automatisk)
├── styles.css             # CSS styling og animasjoner
├── src/
│   ├── app.ts             # TypeScript kildekode (HOVEDKILDE)
│   ├── firestore-service.ts # Firebase service TypeScript
│   ├── firebase-config.ts  # Firebase configuration TypeScript
│   └── firebase-types.ts   # TypeScript type definitions
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment workflow
├── .env                   # Environment variabler for web deployment
├── CNAME                  # Custom domain konfigurasjon (oppgaver.ttonnesen.no)
├── package.json           # NPM dependencies og scripts
├── tsconfig.json          # TypeScript konfigurasjon
└── CONTEXT.md             # Denne filen
```

**VIKTIG: Dette prosjektet bruker KUN TypeScript!**
- `src/` mappen inneholder alle TypeScript kildefiler som skal redigeres
- Alle `.js` filer genereres automatisk fra TypeScript og skal IKKE redigeres direkte
- All logikk og funksjonalitet skal implementeres i TypeScript
- GitHub Actions kompilerer automatisk TypeScript ved hver push til main

### Vue.js App Struktur

#### Data Properties
```javascript
// UI State
activeTab: "oversikt"           // Aktuell tab
showCelebration: false          // Celebration modal
creatingTaskForDay: null        // Inline task creation state
newTaskTitle: ""                // New task title input
newTaskStars: 1                 // New task star rating

// Task Management
tasks: []                       // Array av oppgaver
pendingApprovals: []            // Oppgaver som venter på godkjenning

// Points System
simonPoints: 0                  // Simon's poeng
noahPoints: 0                   // Noah's poeng
```

#### Computed Properties
- `updatedTabs()` - Oppdaterer tab badges basert på pending approvals

#### Methods
- `getDayTasks(dayName)` - Henter oppgaver for en spesifikk dag
- `getDayPoints(dayName)` - Beregner totalt poeng for en dag (kun godkjente oppgaver)
- `completeTask(task, childName)` - Fullfører oppgave for spesifikk barn
- `approveTask(taskId)` - Godkjenner oppgave og tildeler poeng
- `rejectTask(taskId)` - Avviser oppgave og tilbakestiller den
- `saveNewTask(dayName)` - Lagrer ny oppgave med inline form
- `cancelTaskCreation()` - Avbryter oppretting av oppgave
- `selectStars(stars)` - Velger antall stjerner for ny oppgave
- `displayCelebration(childName, points)` - Viser feiring modal
- `recalculatePoints()` - Beregner poeng på nytt fra godkjente oppgaver (dataintegritet)

### CSS Struktur

#### Design System
- **Fargepalett** - Lekne farger for barn (gradienter, pastell)
- **Typografi** - Comic Sans MS for barnslig følelse
- **Animasjoner** - Bounce, pulse, fade, scale effekter
- **Responsive breakpoints** - Tablet landscape, tablet portrait, mobile

#### Komponenter
- `.calendar` - Ukeskalender layout
- `.task-card` - Individuelle oppgavekort
- `.celebration` - Feiring modal
- `.points-card` - Poengvisning for barn
- `.star` - Stjernesymboler med forbedret kontrast
- `.task-creation-form` - Inline oppretting av oppgaver

### State Management

#### Firebase Integration
- **Real-time sync** - Alle data synkroniseres med Firebase Firestore
- **Hierarchical structure** - Data organisert som `years/{year}/weeks/{week}/tasks/{taskId}`
- **Pending approvals** - Separate collection for oppgaver som venter på godkjenning
- **Points tracking** - Synkronisert poengberegning på tvers av enheter

#### Reactive Data
- Alle modal states er reactive
- Task arrays oppdateres automatisk via Firebase listeners
- Poeng oppdateres i sanntid fra godkjente oppgaver
- Tab badges oppdateres dynamisk basert på pending approvals

### Security
- **Direkte godkjenning** - ingen PIN-kode påkrevd for godkjenning
- **Client-side validering** - form validering og input sjekking
- **No server-side** - ren frontend applikasjon

### Performance
- **Lazy loading** - modaler lastes kun når nødvendig
- **Efficient updates** - Vue.js reactivity system
- **CSS animations** - hardware-accelerated transforms
- **Minimal dependencies** - kun Vue.js og http-server

### Touch Optimalisering
- **Touch targets** - alle knapper minst 44x44px (Apple/Google standard)
- **Touch-action** - manipulation for bedre responsivitet
- **Tap-highlight** - deaktivert for ren touch-opplevelse
- **User-select** - deaktivert for å unngå utilsiktet tekstvalg
- **Touch-callout** - deaktivert for bedre touch-interaksjon
- **Responsive knapper** - større padding og font-size på touch-enheter

## Brukeropplevelse

### For Barn (Simon & Noah)
- **Engasjerende design** - farger, animasjoner, emojis
- **Touch-optimalisert** - store knapper (44px+), enkle touch-gestures
- **Enkel interaksjon** - store knapper, tydelige elementer
- **Umiddelbar feedback** - feiring når oppgaver godkjennes
- **Konkurranse** - poengvisning for motivasjon

### For Foreldre
- **Administrativ kontroll** - inline oppretting og redigering av oppgaver
- **Godkjenning workflow** - direkte godkjenning/avvisning av oppgaver
- **Oversikt** - kalendervisning av alle oppgaver med korrekte poeng
- **Poengtracking** - følge barnas fremgang med synkroniserte scorecards

## Utviklingsnotater

### Design Prinsipper
- **Tablet-first** - optimalisert for liggende tablet
- **Touch-optimalisert** - alle knapper minst 44px, touch-action: manipulation
- **Touch-friendly** - store knapper og touch targets, ingen tap-highlight
- **Accessibility** - høy kontrast og lesbarhet, forbedret stjernkontrast
- **Gamification** - poeng, badges, feiring
- **Data integrity** - synkroniserte poengberegninger

### Tekniske Valg
- **Vue.js 3** - moderne reaktivitet og performance
- **Vanilla CSS** - full kontroll over styling
- **Firebase Firestore** - real-time database med offline support
- **GitHub Pages** - enkel deploy med custom domain
- **TypeScript ONLY** - type safety og bedre utvikleropplevelse
- **Web server deployment** - designet for webserver-kjøring kun

### TypeScript Utviklingsworkflow
1. **Rediger kun filer i `src/`** - dette er de eneste kildefilene
2. **Test lokalt:** `npm run dev` for watch mode eller `npm start` for lokal server
3. **Deploy til produksjon:** `git push origin main` - GitHub Actions håndterer resten
4. **Automatisk kompilering:** TypeScript kompileres automatisk ved hver push til main

**ALDRIG rediger `.js` filer direkte** - de overskrives ved hver TypeScript-kompilering!

### Nylige Forbedringer
- **Firebase integrasjon** - real-time sync og persistent lagring
- **GitHub Actions CI/CD** - automatisk TypeScript-kompilering og deployment
- **TypeScript support** - type safety og bedre utvikleropplevelse
- **Environment variables** - sikker konfigurasjon for web deployment
- **Web server only** - optimalisert for webserver-kjøring
- **Stjernkontrast** - forbedret synlighet av stjerner mot gule bakgrunner
- **Poengsynkronisering** - scorecards viser kun poeng fra godkjente oppgaver
- **Dataintegritet** - automatisk reberegning av poeng ved oppstart
- **Direkte godkjenning** - forenklet godkjenning uten PIN-kode
- **Inline oppretting** - opprett oppgaver direkte i kalenderen
- **Automatisk deployment** - ingen manuell deploy nødvendig

### Fremtidige Forbedringer
- **Multi-user support** - flere familier
- **Advanced analytics** - detaljert rapportering
- **Mobile app** - native applikasjon
- **Offline support** - arbeid uten internettforbindelse
- **Push notifications** - påminnelser om oppgaver
