import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Client, PaymentStatus, ProjectStatus } from '../types';

const LOCAL_STORAGE_CLIENTS_KEY = 'bb_decoration_clients_crm_records_v1';

// Initial sample clients for instant initial usage if storage is empty
const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'sample-client-1',
    name: 'Ananya & Rahul Dutta',
    companyName: 'Dutta Family Wedding',
    address: 'Guwahati, Assam',
    phone: '+91 98765 43210',
    email: 'ananya.dutta@example.com',
    projectName: 'Grand Mandap & Floral Decor',
    fullPayment: 150000,
    advancePayment: 50000,
    remainingPayment: 100000,
    paymentStatus: 'Partially Paid',
    projectStatus: 'Confirmed',
    notes: 'Traditional Assamese gamosa floral motifs with warm marigold lights.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-client-2',
    name: 'Barman Corporate Event',
    companyName: 'Barman Traders Pvt Ltd',
    address: 'Jorhat, Assam',
    phone: '+91 91234 56789',
    email: 'info@barmantraders.com',
    projectName: 'Annual Gala Stage & Entrance Arch',
    fullPayment: 80000,
    advancePayment: 80000,
    remainingPayment: 0,
    paymentStatus: 'Fully Paid',
    projectStatus: 'Completed',
    notes: 'Fully paid via bank transfer. Stage backdrop & sound system.',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getLocalClients(): Client[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(SAMPLE_CLIENTS));
      return SAMPLE_CLIENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_CLIENTS;
  } catch (err) {
    console.error('Failed to read local clients storage:', err);
    return SAMPLE_CLIENTS;
  }
}

export function saveLocalClients(clients: Client[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save to local clients storage:', err);
  }
}

export function calculatePaymentDetails(fullPaymentInput: number, advancePaymentInput: number): {
  fullPayment: number;
  advancePayment: number;
  remainingPayment: number;
  paymentStatus: PaymentStatus;
} {
  const fullPayment = Math.max(0, Number(fullPaymentInput) || 0);
  const advancePayment = Math.max(0, Number(advancePaymentInput) || 0);
  const remainingPayment = Math.max(0, fullPayment - advancePayment);

  let paymentStatus: PaymentStatus = 'Pending';
  if (advancePayment === 0) {
    paymentStatus = 'Pending';
  } else if (remainingPayment <= 0) {
    paymentStatus = 'Fully Paid';
  } else {
    paymentStatus = 'Partially Paid';
  }

  return {
    fullPayment,
    advancePayment,
    remainingPayment,
    paymentStatus
  };
}

// Event listeners for real-time local sync when Firestore is offline or permission-restricted
type ClientListener = (clients: Client[]) => void;
const activeListeners = new Set<ClientListener>();

function notifyListeners(clients: Client[]): void {
  activeListeners.forEach((listener) => {
    try {
      listener(clients);
    } catch (err) {
      console.error('Listener notification error:', err);
    }
  });
}

export function subscribeToClients(
  onData: (clients: Client[]) => void,
  onError?: (error: any) => void
) {
  let isFirestoreActive = true;
  activeListeners.add(onData);

  // Send current local clients immediately for instant UI render
  const initialLocal = getLocalClients();
  onData(initialLocal);

  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isFirestoreActive) return;
        const clientsList: Client[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const full = Number(data.fullPayment) || 0;
          const advance = Number(data.advancePayment) || 0;
          const { remainingPayment, paymentStatus } = calculatePaymentDetails(full, advance);

          return {
            id: docSnap.id,
            name: data.name || '',
            companyName: data.companyName || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            projectName: data.projectName || '',
            fullPayment: full,
            advancePayment: advance,
            remainingPayment: data.remainingPayment !== undefined ? Number(data.remainingPayment) : remainingPayment,
            paymentStatus: data.paymentStatus || paymentStatus,
            projectStatus: (data.projectStatus as ProjectStatus) || 'Inquiry',
            notes: data.notes || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
          };
        });

        saveLocalClients(clientsList);
        notifyListeners(clientsList);
      },
      (err) => {
        console.warn('Firestore fallback to local storage mode:', err?.message || err);
        isFirestoreActive = false;
        const local = getLocalClients();
        onData(local);
        if (onError) onError(err);
      }
    );

    return () => {
      isFirestoreActive = false;
      activeListeners.delete(onData);
      unsubscribe();
    };
  } catch (err) {
    console.warn('Firestore init failed, using local storage:', err);
    const local = getLocalClients();
    onData(local);
    return () => {
      activeListeners.delete(onData);
    };
  }
}

export async function addClientRecord(clientData: {
  name: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  projectName: string;
  fullPayment: number;
  advancePayment: number;
  projectStatus: ProjectStatus;
  notes?: string;
}): Promise<string> {
  const { fullPayment, advancePayment, remainingPayment, paymentStatus } = calculatePaymentDetails(
    clientData.fullPayment,
    clientData.advancePayment
  );

  const nowIso = new Date().toISOString();
  let createdId = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  const payload = {
    name: clientData.name.trim(),
    companyName: (clientData.companyName || '').trim(),
    address: (clientData.address || '').trim(),
    phone: (clientData.phone || '').trim(),
    email: (clientData.email || '').trim(),
    projectName: clientData.projectName.trim(),
    fullPayment,
    advancePayment,
    remainingPayment,
    paymentStatus,
    projectStatus: clientData.projectStatus || 'Inquiry',
    notes: (clientData.notes || '').trim(),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  // Try Firestore first
  try {
    const docRef = await addDoc(collection(db, 'clients'), payload);
    if (docRef?.id) {
      createdId = docRef.id;
    }
  } catch (error) {
    console.warn('Firestore create failed, stored locally:', error);
  }

  const newClientRecord: Client = {
    id: createdId,
    ...payload
  };

  // Save to local storage and broadcast to listeners
  const localList = getLocalClients();
  const filtered = localList.filter((c) => c.id !== createdId);
  const updatedList = [newClientRecord, ...filtered];
  saveLocalClients(updatedList);
  notifyListeners(updatedList);

  return createdId;
}

export async function updateClientRecord(
  clientId: string,
  clientData: Partial<Client>
): Promise<void> {
  const localList = getLocalClients();
  const index = localList.findIndex((c) => c.id === clientId);

  let updatedList = [...localList];
  if (index !== -1) {
    const existing = localList[index];
    const full = clientData.fullPayment !== undefined ? clientData.fullPayment : existing.fullPayment;
    const advance = clientData.advancePayment !== undefined ? clientData.advancePayment : existing.advancePayment;
    const { fullPayment, advancePayment, remainingPayment, paymentStatus } = calculatePaymentDetails(full, advance);

    const updatedRecord: Client = {
      ...existing,
      ...clientData,
      fullPayment,
      advancePayment,
      remainingPayment,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };

    updatedList[index] = updatedRecord;
    saveLocalClients(updatedList);
    notifyListeners(updatedList);
  }

  try {
    const updatePayload: Record<string, any> = { ...clientData };
    delete updatePayload.id;

    if (clientData.fullPayment !== undefined || clientData.advancePayment !== undefined) {
      const full = clientData.fullPayment !== undefined ? clientData.fullPayment : 0;
      const advance = clientData.advancePayment !== undefined ? clientData.advancePayment : 0;
      const { fullPayment, advancePayment, remainingPayment, paymentStatus } = calculatePaymentDetails(full, advance);
      updatePayload.fullPayment = fullPayment;
      updatePayload.advancePayment = advancePayment;
      updatePayload.remainingPayment = remainingPayment;
      updatePayload.paymentStatus = paymentStatus;
    }

    updatePayload.updatedAt = new Date().toISOString();

    const clientDocRef = doc(db, 'clients', clientId);
    await updateDoc(clientDocRef, updatePayload);
  } catch (error) {
    console.warn('Firestore update failed, updated locally:', error);
  }
}

export async function deleteClientRecord(clientId: string): Promise<Client[]> {
  const localList = getLocalClients();
  const updatedList = localList.filter((c) => c.id !== clientId);
  saveLocalClients(updatedList);
  notifyListeners(updatedList);

  try {
    const clientDocRef = doc(db, 'clients', clientId);
    await deleteDoc(clientDocRef);
  } catch (error) {
    console.warn('Firestore delete failed, deleted locally:', error);
  }

  return updatedList;
}
