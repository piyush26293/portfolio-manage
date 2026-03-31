import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { Client, Instrument, Portfolio, Snapshot, Trade } from '../domain/types'
import { seedClients, seedInstruments, seedPortfolios, seedTrades } from '../mock/seedData'
import { db } from '../services/firebase'

interface FirestoreRepository {
  getUserProfile(userId: string): Promise<Record<string, unknown> | null>
  listClients(): Promise<Client[]>
  upsertClient(client: Client): Promise<void>
  listPortfolios(clientId: string): Promise<Portfolio[]>
  upsertPortfolio(clientId: string, portfolio: Portfolio): Promise<void>
  listInstruments(clientId: string, portfolioId: string): Promise<Instrument[]>
  upsertInstrument(clientId: string, portfolioId: string, instrument: Instrument): Promise<void>
  listTrades(clientId: string, portfolioId: string): Promise<Trade[]>
  createTrade(clientId: string, portfolioId: string, trade: Omit<Trade, 'id'>): Promise<string>
  updateTrade(clientId: string, portfolioId: string, tradeId: string, trade: Partial<Trade>): Promise<void>
  deleteTrade(clientId: string, portfolioId: string, tradeId: string): Promise<void>
  listSnapshots(clientId: string, portfolioId: string): Promise<Snapshot[]>
  createSnapshot(clientId: string, portfolioId: string, snapshot: Omit<Snapshot, 'id'>): Promise<string>
}

const createMemoryRepository = (): FirestoreRepository => {
  const upsertById = <T extends { id: string }>(list: T[], value: T): T[] => {
    const idx = list.findIndex((item) => item.id === value.id)
    if (idx >= 0) {
      const next = [...list]
      next[idx] = value
      return next
    }
    return [...list, value]
  }

  const inMemoryState = {
    clients: [...seedClients],
    portfolios: [...seedPortfolios],
    instruments: [...seedInstruments],
    trades: [...seedTrades],
    snapshots: [] as Snapshot[],
    users: new Map<string, Record<string, unknown>>(),
  }

  return {
    async getUserProfile(userId: string) {
      return inMemoryState.users.get(userId) ?? null
    },

    async listClients(): Promise<Client[]> {
      return [...inMemoryState.clients]
    },

    async upsertClient(client: Client): Promise<void> {
      inMemoryState.clients = upsertById(inMemoryState.clients, client)
    },

    async listPortfolios(clientId: string): Promise<Portfolio[]> {
      return inMemoryState.portfolios.filter((item) => item.clientId === clientId)
    },

    async upsertPortfolio(clientId: string, portfolio: Portfolio): Promise<void> {
      inMemoryState.portfolios = upsertById(inMemoryState.portfolios, { ...portfolio, clientId })
    },

    async listInstruments(clientId: string, portfolioId: string): Promise<Instrument[]> {
      return inMemoryState.instruments.filter(
        (item) => item.clientId === clientId && item.portfolioId === portfolioId,
      )
    },

    async upsertInstrument(clientId: string, portfolioId: string, instrument: Instrument): Promise<void> {
      inMemoryState.instruments = upsertById(inMemoryState.instruments, {
        ...instrument,
        clientId,
        portfolioId,
      })
    },

    async listTrades(clientId: string, portfolioId: string): Promise<Trade[]> {
      return inMemoryState.trades.filter(
        (item) => item.clientId === clientId && item.portfolioId === portfolioId,
      )
    },

    async createTrade(clientId: string, portfolioId: string, trade: Omit<Trade, 'id'>): Promise<string> {
      const id = `trade-${Date.now()}`
      inMemoryState.trades.push({ ...trade, id, clientId, portfolioId })
      return id
    },

    async updateTrade(
      clientId: string,
      portfolioId: string,
      tradeId: string,
      trade: Partial<Trade>,
    ): Promise<void> {
      const idx = inMemoryState.trades.findIndex((item) => item.id === tradeId)
      if (idx >= 0) {
        inMemoryState.trades[idx] = {
          ...inMemoryState.trades[idx],
          ...trade,
          clientId,
          portfolioId,
        }
      }
    },

    async deleteTrade(_clientId: string, _portfolioId: string, tradeId: string): Promise<void> {
      inMemoryState.trades = inMemoryState.trades.filter((item) => item.id !== tradeId)
    },

    async listSnapshots(clientId: string, portfolioId: string): Promise<Snapshot[]> {
      return inMemoryState.snapshots.filter(
        (item) => item.clientId === clientId && item.portfolioId === portfolioId,
      )
    },

    async createSnapshot(clientId: string, portfolioId: string, snapshot: Omit<Snapshot, 'id'>): Promise<string> {
      const id = `snapshot-${Date.now()}`
      inMemoryState.snapshots.push({ ...snapshot, id, clientId, portfolioId })
      return id
    },
  }
}

const createFirebaseRepository = (): FirestoreRepository => {
  const firestore = db
  if (!firestore) {
    return createMemoryRepository()
  }

  const usersCollection = collection(firestore, 'users')
  const clientsCollection = collection(firestore, 'clients')

  const portfoliosCollection = (clientId: string) =>
    collection(firestore, 'clients', clientId, 'portfolios')
  const instrumentsCollection = (clientId: string, portfolioId: string) =>
    collection(firestore, 'clients', clientId, 'portfolios', portfolioId, 'instruments')
  const tradesCollection = (clientId: string, portfolioId: string) =>
    collection(firestore, 'clients', clientId, 'portfolios', portfolioId, 'trades')
  const snapshotsCollection = (clientId: string, portfolioId: string) =>
    collection(firestore, 'clients', clientId, 'portfolios', portfolioId, 'snapshots')

  return {
    async getUserProfile(userId: string) {
      const userDoc = await getDoc(doc(usersCollection, userId))
      return userDoc.exists() ? (userDoc.data() as Record<string, unknown>) : null
    },

    async listClients(): Promise<Client[]> {
      const snap = await getDocs(clientsCollection)
      return snap.docs.map((docRef) => ({ id: docRef.id, ...(docRef.data() as Omit<Client, 'id'>) }))
    },

    async upsertClient(client: Client): Promise<void> {
      await setDoc(doc(clientsCollection, client.id), client)
    },

    async listPortfolios(clientId: string): Promise<Portfolio[]> {
      const snap = await getDocs(portfoliosCollection(clientId))
      return snap.docs.map((docRef) => ({
        id: docRef.id,
        ...(docRef.data() as Omit<Portfolio, 'id'>),
      }))
    },

    async upsertPortfolio(clientId: string, portfolio: Portfolio): Promise<void> {
      await setDoc(doc(portfoliosCollection(clientId), portfolio.id), portfolio)
    },

    async listInstruments(clientId: string, portfolioId: string): Promise<Instrument[]> {
      const snap = await getDocs(instrumentsCollection(clientId, portfolioId))
      return snap.docs.map((docRef) => ({
        id: docRef.id,
        ...(docRef.data() as Omit<Instrument, 'id'>),
      }))
    },

    async upsertInstrument(clientId: string, portfolioId: string, instrument: Instrument): Promise<void> {
      await setDoc(doc(instrumentsCollection(clientId, portfolioId), instrument.id), instrument)
    },

    async listTrades(clientId: string, portfolioId: string): Promise<Trade[]> {
      const snap = await getDocs(tradesCollection(clientId, portfolioId))
      return snap.docs.map((docRef) => ({ id: docRef.id, ...(docRef.data() as Omit<Trade, 'id'>) }))
    },

    async createTrade(clientId: string, portfolioId: string, trade: Omit<Trade, 'id'>): Promise<string> {
      const created = await addDoc(tradesCollection(clientId, portfolioId), trade)
      return created.id
    },

    async updateTrade(
      clientId: string,
      portfolioId: string,
      tradeId: string,
      trade: Partial<Trade>,
    ): Promise<void> {
      await updateDoc(doc(tradesCollection(clientId, portfolioId), tradeId), trade)
    },

    async deleteTrade(clientId: string, portfolioId: string, tradeId: string): Promise<void> {
      await deleteDoc(doc(tradesCollection(clientId, portfolioId), tradeId))
    },

    async listSnapshots(clientId: string, portfolioId: string): Promise<Snapshot[]> {
      const snap = await getDocs(snapshotsCollection(clientId, portfolioId))
      return snap.docs.map((docRef) => ({
        id: docRef.id,
        ...(docRef.data() as Omit<Snapshot, 'id'>),
      }))
    },

    async createSnapshot(clientId: string, portfolioId: string, snapshot: Omit<Snapshot, 'id'>): Promise<string> {
      const created = await addDoc(snapshotsCollection(clientId, portfolioId), snapshot)
      return created.id
    },
  }
}

export const firestoreRepository: FirestoreRepository = db
  ? createFirebaseRepository()
  : createMemoryRepository()
