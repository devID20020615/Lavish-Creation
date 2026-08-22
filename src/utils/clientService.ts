import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Client, PaymentStatus, ProjectStatus } from '../types';

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

export function subscribeToClients(
  onData: (clients: Client[]) => void,
  onError?: (error: any) => void
) {
  const clientsRef = collection(db, 'clients');
  const q = query(clientsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
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
      onData(clientsList);
    },
    (err) => {
      console.error('Error fetching clients from Firestore:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, 'clients');
    }
  );
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
  try {
    const { fullPayment, advancePayment, remainingPayment, paymentStatus } = calculatePaymentDetails(
      clientData.fullPayment,
      clientData.advancePayment
    );

    const docRef = await addDoc(collection(db, 'clients'), {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'clients');
    throw error;
  }
}

export async function updateClientRecord(
  clientId: string,
  clientData: Partial<Client>
): Promise<void> {
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
    handleFirestoreError(error, OperationType.UPDATE, `clients/${clientId}`);
    throw error;
  }
}

export async function deleteClientRecord(clientId: string): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', clientId);
    await deleteDoc(clientDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
    throw error;
  }
}
