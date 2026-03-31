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
import { db } from '../services/firebase'

const usersCollection = collection(db, 'users')
const clientsCollection = collection(db, 'clients')

const portfoliosCollection = (clientId: string) =>
  collection(db, 'clients', clientId, 'portfolios')
const instrumentsCollection = (clientId: string, portfolioId: string) =>
  collection(db, 'clients', clientId, 'portfolios', portfolioId, 'instruments')
const tradesCollection = (clientId: string, portfolioId: string) =>
  collection(db, 'clients', clientId, 'portfolios', portfolioId, 'trades')
const snapshotsCollection = (clientId: string, portfolioId: string) =>
  collection(db, 'clients', clientId, 'portfolios', portfolioId, 'snapshots')

export const firestoreRepository = {
  async getUserProfile(userId: string) {
    const userDoc = await getDoc(doc(usersCollection, userId))
    return userDoc.exists() ? userDoc.data() : null
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

  async updateTrade(clientId: string, portfolioId: string, tradeId: string, trade: Partial<Trade>): Promise<void> {
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
