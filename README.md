# Portfolio Manage (India)

Production-oriented portfolio tracking and P/L management app for Indian market client portfolios.

> This project is **not** a live trading platform. No broker execution or order placement is implemented.

## 1) Project folder structure

```text
src/
  app/
    router.tsx
  components/
    dashboard/
      ClosedPositionsTable.tsx
      ManualPriceEditor.tsx
      OpenPositionsTable.tsx
      SummaryCards.tsx
      TradeEntryForm.tsx
      TradeHistoryTable.tsx
    layout/
      ProtectedRoute.tsx
    ui/
      SummaryCard.tsx
  domain/
    enums.ts
    types.ts
    pl/
      calculationEngine.ts
      calculationEngine.test.ts
  pages/
    LoginPage.tsx
    PortfolioDashboardPage.tsx
  repositories/
    firestoreRepository.ts
  services/
    authService.ts
    firebase.ts
    marketDataService.ts
    useAuth.ts
  store/
    appStore.ts
  utils/
    formatters.ts
    validation.ts
  mock/
    seedData.ts
  test/
    setupTests.ts
```

## 2) TypeScript domain types/interfaces
Defined in:
- `src/domain/enums.ts`
- `src/domain/types.ts`

Includes clients, portfolios, instruments, trades, snapshots, user roles, segment enums, price sources, and cost basis methods.

## 3) Firestore repository/service layer
- `src/repositories/firestoreRepository.ts`
- `src/services/firebase.ts`
- `src/services/authService.ts`

Provides CRUD for:
- users
- clients
- portfolios
- instruments
- trades
- snapshots

## 4) Validation utilities
- `src/utils/validation.ts`

Covers required rules:
- quantity/lots/lotSize > 0 (as applicable)
- price/fee >= 0
- required symbol/segment/tradeDate/instrument
- malformed numeric input rejection
- duplicate submission prevention signal
- derivative quantity derivation (`lots * lotSize`)

## 5) Market data service abstraction
- `src/services/marketDataService.ts`

Supports:
- provider abstraction for API-based fetch
- manual price updates
- in-memory price cache
- price source + timestamp tracking

## 6) Pure P/L calculation engine
- `src/domain/pl/calculationEngine.ts`

Supports:
- equity/futures/options
- long/short handling
- FIFO and AVERAGE_COST
- fee handling (buy fees in basis, sell fees reduce realized)
- missing-price fallback to cost/entry
- mixed-instrument portfolio computation

## 7) Zustand store
- `src/store/appStore.ts`

Orchestrates:
- Firestore data loading
- trade creation
- manual price update
- portfolio computation selector

## 8) React pages/components
Pages:
- Login (`/login`)
- Protected Portfolio Dashboard (`/`)

Dashboard includes:
- client and portfolio selectors
- trade entry form
- summary cards
- open positions table
- closed positions table
- trade history table
- manual price editor
- loading/error/empty states
- segment/date filters

## 9) Unit tests for calculation engine
- `src/domain/pl/calculationEngine.test.ts`

Covered scenarios:
- equity single/multiple buys
- partial/full sell
- FIFO lot consumption
- average cost calculation
- buy/sell fee effects
- futures long/short
- options long/short
- empty trade list
- zero holdings
- invalid sell beyond holdings
- missing current price fallback
- mixed portfolio

## 10) Optional component tests
Not added yet to keep change scope focused; unit test infrastructure is in place (Vitest + RTL).

## 11) Firestore security rules
- `firestore.rules`

Enforces:
- unauthenticated users denied
- admin full access
- advisor assigned-client scoped access
- client own-data read-only behavior by rule-level operation split

## 12) Firebase setup instructions
See:
- `docs/firebase-setup.md`
- `.env.example`

## 13) Local setup instructions

```bash
npm install
cp .env.example .env
# fill firebase variables
npm run dev
```

Validation commands:

```bash
npm run lint
npm run build
npm run test:run
npm run test:coverage
```

## 14) README draft
This file serves as the draft and current implementation guide.

## 15) Future TODOs
- Add Firestore emulator-based integration tests.
- Add persistent market data cache (Firestore) and background refresh strategy.
- Add portfolio snapshots scheduler.
- Add richer role/permission management UI.
- Add pagination/virtualization for 1000+ trade tables.
- Add chart widgets using Recharts for equity curve and segment exposure.
- Add optional expiry settlement logic for options and futures.
