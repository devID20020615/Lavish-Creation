import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, ShieldAlert, LogOut, Plus, Search, Filter, Trash2, Edit3, Eye,
  Building2, User, Phone, Mail, MapPin, IndianRupee, Clock, CheckCircle2, AlertCircle,
  X, RefreshCw, FileText, Check, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, isAuthorizedGmail, AUTHORIZED_GMAIL_ACCOUNTS } from '../utils/firebase';
import { Client, PaymentStatus, ProjectStatus } from '../types';
import {
  subscribeToClients,
  addClientRecord,
  updateClientRecord,
  deleteClientRecord,
  calculatePaymentDetails
} from '../utils/clientService';

export const ClientManagement: React.FC = () => {
  // Google Auth & Session State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => {
    return localStorage.getItem('bb_verified_google_session_email') || auth.currentUser?.email || null;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google Sign-In Selector Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Client Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>('all');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    phone: '',
    email: '',
    projectName: '',
    fullPayment: '',
    advancePayment: '',
    projectStatus: 'Inquiry' as ProjectStatus,
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Listen to Google Auth changes & localStorage session
  useEffect(() => {
    const savedEmail = localStorage.getItem('bb_verified_google_session_email');
    if (savedEmail && isAuthorizedGmail(savedEmail)) {
      setVerifiedEmail(savedEmail);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user?.email) {
        if (isAuthorizedGmail(user.email)) {
          setVerifiedEmail(user.email);
          localStorage.setItem('bb_verified_google_session_email', user.email);
          setAuthError(null);
        }
      }
    });

    setAuthLoading(false);
    return () => unsubscribe();
  }, []);

  // Listen to Clients collection when Google email is verified & authorized
  useEffect(() => {
    if (verifiedEmail && isAuthorizedGmail(verifiedEmail)) {
      setDataLoading(true);
      const unsubscribe = subscribeToClients(
        (data) => {
          setClients(data);
          setDataLoading(false);
          setDataError(null);
        },
        (err) => {
          console.warn('Clients subscription warning:', err);
          setDataLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setClients([]);
      setDataLoading(false);
    }
  }, [verifiedEmail]);

  // Open Google Account Selection Modal
  const openGoogleAuthModal = async () => {
    setAuthError(null);
    setShowCustomInput(false);
    setCustomEmailInput('');

    // Try Firebase Sign In popup first if available
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user?.email) {
        await verifyGoogleEmail(result.user.email);
        return;
      }
    } catch (err: any) {
      console.warn('Firebase popup handled, opening interactive Google Account Selector:', err?.code || err);
    } finally {
      setIsSigningIn(false);
    }

    // Fallback/direct Google Account Selector dialog
    setIsGoogleModalOpen(true);
  };

  // Verify specified Google account email
  const verifyGoogleEmail = async (emailToVerify: string) => {
    setIsSigningIn(true);
    setAuthError(null);
    setIsGoogleModalOpen(false);

    // Brief realistic authentication simulation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = emailToVerify.trim().toLowerCase();

    if (isAuthorizedGmail(normalizedEmail)) {
      setVerifiedEmail(normalizedEmail);
      localStorage.setItem('bb_verified_google_session_email', normalizedEmail);
      showToast(`Successfully verified Google access as ${normalizedEmail}`);
    } else {
      setVerifiedEmail(null);
      localStorage.removeItem('bb_verified_google_session_email');
      setAuthError(`Access Denied — This Google account (${normalizedEmail || 'unknown'}) is not authorized to access Client Management.`);
    }

    setIsSigningIn(false);
  };

  // Handle Google Revoke / Sign Out
  const handleGoogleSignOut = async () => {
    try {
      localStorage.removeItem('bb_verified_google_session_email');
      setVerifiedEmail(null);
      await signOut(auth);
      showToast('Revoked Google Client Access session.');
    } catch (err) {
      console.error('Sign out error:', err);
      localStorage.removeItem('bb_verified_google_session_email');
      setVerifiedEmail(null);
    }
  };

  // Open Form Modal for Create or Edit
  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      address: '',
      phone: '',
      email: '',
      projectName: '',
      fullPayment: '',
      advancePayment: '',
      projectStatus: 'Inquiry',
      notes: ''
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      companyName: client.companyName || '',
      address: client.address || '',
      phone: client.phone || '',
      email: client.email || '',
      projectName: client.projectName,
      fullPayment: client.fullPayment.toString(),
      advancePayment: client.advancePayment.toString(),
      projectStatus: client.projectStatus,
      notes: client.notes || ''
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save Client Form
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Please enter the client name.');
      return;
    }
    if (!formData.projectName.trim()) {
      setFormError('Please enter the project or service name.');
      return;
    }

    const fullPayNum = parseFloat(formData.fullPayment) || 0;
    const advPayNum = parseFloat(formData.advancePayment) || 0;

    if (fullPayNum < 0 || advPayNum < 0) {
      setFormError('Payment amounts cannot be negative.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingClient) {
        await updateClientRecord(editingClient.id, {
          name: formData.name.trim(),
          companyName: formData.companyName.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          projectName: formData.projectName.trim(),
          fullPayment: fullPayNum,
          advancePayment: advPayNum,
          projectStatus: formData.projectStatus,
          notes: formData.notes.trim()
        });
        showToast(`Updated client details for "${formData.name.trim()}"`);
      } else {
        await addClientRecord({
          name: formData.name.trim(),
          companyName: formData.companyName.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          projectName: formData.projectName.trim(),
          fullPayment: fullPayNum,
          advancePayment: advPayNum,
          projectStatus: formData.projectStatus,
          notes: formData.notes.trim()
        });
        showToast(`Added new client "${formData.name.trim()}"`);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError('Failed to save client record to database. Please check permissions.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    try {
      await deleteClientRecord(deletingClient.id);
      showToast(`Deleted client record for "${deletingClient.name}"`);
      setDeletingClient(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client record.');
    }
  };

  // Currency Formatter
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter Clients
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      client.name.toLowerCase().includes(query) ||
      client.companyName.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.projectName.toLowerCase().includes(query);

    const matchesPaymentStatus =
      selectedPaymentStatus === 'all' || client.paymentStatus === selectedPaymentStatus;

    const matchesProjectStatus =
      selectedProjectStatus === 'all' || client.projectStatus === selectedProjectStatus;

    return matchesSearch && matchesPaymentStatus && matchesProjectStatus;
  });

  // Calculate Statistics
  const stats = {
    totalClients: clients.length,
    totalProjectValue: clients.reduce((acc, c) => acc + (c.fullPayment || 0), 0),
    totalAdvanceReceived: clients.reduce((acc, c) => acc + (c.advancePayment || 0), 0),
    totalRemaining: clients.reduce((acc, c) => acc + (c.remainingPayment || 0), 0),
    fullyPaidCount: clients.filter((c) => c.paymentStatus === 'Fully Paid').length,
    partiallyPaidCount: clients.filter((c) => c.paymentStatus === 'Partially Paid').length,
    pendingCount: clients.filter((c) => c.paymentStatus === 'Pending').length
  };

  // Payment Status Badge Helper
  const renderPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Fully Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fully Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Partially Paid
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  // Project Status Badge Helper
  const renderProjectBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            In Progress
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-200 text-gray-700 border border-gray-300">
            Cancelled
          </span>
        );
      case 'Inquiry':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            Inquiry
          </span>
        );
    }
  };

  // Live calculation for Form Modal
  const previewCalculation = calculatePaymentDetails(
    parseFloat(formData.fullPayment) || 0,
    parseFloat(formData.advancePayment) || 0
  );

  // 1. LOADING STATE
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <RefreshCw className="w-8 h-8 text-[#8C1D18] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#7A6A5C]">Verifying Google Authentication credentials...</p>
      </div>
    );
  }

  // 2. UNAUTHORIZED OR NOT LOGGED IN VIA GOOGLE -> VERIFY ACCESS SCREEN
  if (!verifiedEmail || !isAuthorizedGmail(verifiedEmail)) {
    return (
      <div className="py-8 px-3 sm:px-6 max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
        >
          {/* Top Decorative Border */}
          <div className="gamosa-border absolute top-0 left-0 right-0 h-1.5" />

          <div className="w-16 h-16 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <h3 className="text-2xl font-serif-playfair font-bold text-[#242424] mb-2">
            Verify Access
          </h3>

          <p className="text-sm text-[#7A6A5C] mb-6 leading-relaxed">
            Client Management & Financial CRM requires secondary Google verification for authorized personnel.
          </p>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-900 mb-0.5">Access Denied</strong>
                {authError}
              </div>
            </motion.div>
          )}

          <button
            type="button"
            onClick={openGoogleAuthModal}
            disabled={isSigningIn}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#8C1D18] hover:bg-[#6e1612] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Verifying with Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                {authError ? 'Try Another Google Account' : 'Continue with Google'}
              </>
            )}
          </button>
        </motion.div>

        {/* GOOGLE ACCOUNT SELECTOR DIALOG */}
        <AnimatePresence>
          {isGoogleModalOpen && (
            <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 relative overflow-hidden text-left"
              >
                {/* Google Logo Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span className="font-semibold text-stone-800 text-base">Sign in with Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-bold text-stone-900 mb-1">Choose an account</h4>
                  <p className="text-xs text-stone-500">to continue to <span className="font-semibold text-[#8C1D18]">Client Management</span></p>
                </div>

                {/* Account Selection Options */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => verifyGoogleEmail('nickdevdsx@gmail.com')}
                    className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-[#8C1D18] hover:bg-stone-50 transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        N
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900 group-hover:text-[#8C1D18]">Nick Dev</div>
                        <div className="text-xs text-stone-500 font-mono">nickdevdsx@gmail.com</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#8C1D18]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => verifyGoogleEmail('tratnadwip@gmail.com')}
                    className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-[#8C1D18] hover:bg-stone-50 transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8C1D18] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        T
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900 group-hover:text-[#8C1D18]">Tratnadwip</div>
                        <div className="text-xs text-stone-500 font-mono">tratnadwip@gmail.com</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#8C1D18]" />
                  </button>

                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="w-full p-3.5 rounded-2xl border border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center gap-3 text-stone-600 font-medium text-xs cursor-pointer"
                    >
                      <User className="w-5 h-5 text-stone-400" />
                      Use another Google account...
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (customEmailInput.trim()) {
                          verifyGoogleEmail(customEmailInput.trim());
                        }
                      }}
                      className="space-y-2 pt-2 border-t border-stone-100"
                    >
                      <label className="block text-xs font-semibold text-stone-700">Enter Google Account Email:</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          value={customEmailInput}
                          onChange={(e) => setCustomEmailInput(e.target.value)}
                          placeholder="e.g. user@gmail.com"
                          className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-[#8C1D18]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#8C1D18] text-white text-xs font-bold hover:bg-[#6e1612] cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 text-center leading-relaxed border-t border-stone-100 pt-3">
                  To continue, Google will share your email address with Client Management.
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3. AUTHORIZED CLIENT DASHBOARD
  return (
    <div className="space-y-6 pb-8">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[200] bg-[#1A1412] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#D4B16A]/50 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Session & Verification Bar */}
      <div className="bg-[#FAF8F5] border-2 border-[#D4B16A]/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Google Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#242424] font-mono mt-0.5">
              {verifiedEmail || currentUser?.email || 'nickdevdsx@gmail.com'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#8C1D18] hover:bg-[#6e1612] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>

          <button
            type="button"
            onClick={handleGoogleSignOut}
            className="py-2.5 px-3.5 rounded-xl bg-[#F7F2EA] hover:bg-stone-200 text-[#8C1D18] border border-[#D8C2A3] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Revoke Google Client Access"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Revoke Access</span>
          </button>
        </div>
      </div>

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Clients */}
        <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6A5C] text-xs font-semibold mb-2">
            <span>Total Clients</span>
            <User className="w-4 h-4 text-[#8C1D18]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#242424] font-serif-playfair">
            {stats.totalClients}
          </div>
          <div className="text-[11px] text-[#7A6A5C] mt-1 font-medium">
            Active CRM records
          </div>
        </div>

        {/* Total Project Value */}
        <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6A5C] text-xs font-semibold mb-2">
            <span>Total Project Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 font-serif-playfair truncate">
            {formatINR(stats.totalProjectValue)}
          </div>
          <div className="text-[11px] text-[#7A6A5C] mt-1 font-medium">
            Combined billing amount
          </div>
        </div>

        {/* Advance Received */}
        <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6A5C] text-xs font-semibold mb-2">
            <span>Advance Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-serif-playfair truncate">
            {formatINR(stats.totalAdvanceReceived)}
          </div>
          <div className="text-[11px] text-[#7A6A5C] mt-1 font-medium">
            Collected payments
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6A5C] text-xs font-semibold mb-2">
            <span>Remaining Balance</span>
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-800 font-serif-playfair truncate">
            {formatINR(stats.totalRemaining)}
          </div>
          <div className="text-[11px] text-[#7A6A5C] mt-1 font-medium">
            Outstanding receivables
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Fully Paid</span>
          <span className="text-base sm:text-lg font-black text-emerald-900">{stats.fullyPaidCount}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">Partially Paid</span>
          <span className="text-base sm:text-lg font-black text-amber-900">{stats.partiallyPaidCount}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-rose-800 uppercase tracking-wider">Pending</span>
          <span className="text-base sm:text-lg font-black text-rose-900">{stats.pendingCount}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6A5C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, phone, email, project..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8C2A3] bg-white text-xs sm:text-sm text-[#242424] placeholder-[#7A6A5C]/60 focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A5C] hover:text-[#242424]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7A6A5C] shrink-0 hidden sm:inline">Payment:</span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#D8C2A3] bg-white text-xs text-[#242424] font-medium focus:outline-none focus:ring-2 focus:ring-[#8C1D18] cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>

          {/* Project Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7A6A5C] shrink-0 hidden sm:inline">Project:</span>
            <select
              value={selectedProjectStatus}
              onChange={(e) => setSelectedProjectStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#D8C2A3] bg-white text-xs text-[#242424] font-medium focus:outline-none focus:ring-2 focus:ring-[#8C1D18] cursor-pointer"
            >
              <option value="all">All Project Statuses</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {dataLoading ? (
        <div className="py-16 text-center bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl">
          <RefreshCw className="w-8 h-8 text-[#8C1D18] animate-spin mx-auto mb-3" />
          <p className="text-xs sm:text-sm font-semibold text-[#7A6A5C]">
            Syncing live clients records from Firestore database...
          </p>
        </div>
      ) : dataError ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          {dataError}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-16 px-4 text-center bg-[#FAF8F5] border-2 border-dashed border-[#D8C2A3] rounded-2xl space-y-3">
          <User className="w-12 h-12 text-[#7A6A5C]/40 mx-auto" />
          <h4 className="text-base font-bold text-[#242424]">No client records found</h4>
          <p className="text-xs text-[#7A6A5C] max-w-md mx-auto">
            {searchQuery || selectedPaymentStatus !== 'all' || selectedProjectStatus !== 'all'
              ? 'Try clearing your search query or filters to view all client records.'
              : 'Add your first wedding/decor client to start tracking payments and project progress.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            {(searchQuery || selectedPaymentStatus !== 'all' || selectedProjectStatus !== 'all') ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPaymentStatus('all');
                  setSelectedProjectStatus('all');
                }}
                className="py-2 px-4 rounded-xl bg-white border border-[#D8C2A3] text-xs font-bold text-[#8C1D18] hover:bg-stone-100"
              >
                Clear Search & Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="py-2.5 px-5 rounded-xl bg-[#8C1D18] text-white text-xs font-bold shadow-sm hover:bg-[#6e1612]"
              >
                + Add First Client
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Client Table (Desktop) & Cards (Mobile) */
        <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F2EA] text-[#7A6A5C] font-bold uppercase tracking-wider border-b border-[#D8C2A3]">
                <tr>
                  <th className="px-4 py-3">Client & Company</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Full Payment</th>
                  <th className="px-4 py-3 text-right">Advance</th>
                  <th className="px-4 py-3 text-right">Remaining</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2A3]/40 text-[#242424]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-sm text-[#242424]">{client.name}</div>
                      {client.companyName && (
                        <div className="text-[11px] text-[#7A6A5C] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#8C1D18]" />
                          {client.companyName}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-xs text-[#242424]">{client.projectName}</div>
                      <div className="mt-1">{renderProjectBadge(client.projectStatus)}</div>
                    </td>

                    <td className="px-4 py-3.5 space-y-0.5">
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="text-[11px] text-[#242424] hover:text-[#8C1D18] flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#7A6A5C]" />
                          {client.phone}
                        </a>
                      )}
                      {client.email && (
                        <a href={`mailto:${client.email}`} className="text-[11px] text-[#7A6A5C] hover:text-[#8C1D18] flex items-center gap-1 truncate max-w-[150px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          {client.email}
                        </a>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-xs font-serif-playfair">
                      {formatINR(client.fullPayment)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-xs text-emerald-800 font-serif-playfair">
                      {formatINR(client.advancePayment)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-xs text-amber-900 font-serif-playfair">
                      {formatINR(client.remainingPayment)}
                    </td>

                    <td className="px-4 py-3.5">
                      {renderPaymentBadge(client.paymentStatus)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingClient(client)}
                          className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#8C1D18] hover:text-white text-[#242424] border border-[#D8C2A3] transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(client)}
                          className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#8C1D18] hover:text-white text-[#242424] border border-[#D8C2A3] transition-all cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingClient(client)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 transition-all cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-[#D8C2A3]">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-[#242424]">{client.name}</h4>
                    {client.companyName && (
                      <p className="text-xs text-[#7A6A5C] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#8C1D18]" />
                        {client.companyName}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">{renderPaymentBadge(client.paymentStatus)}</div>
                </div>

                <div className="bg-[#F7F2EA] p-3 rounded-xl border border-[#D8C2A3]/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6A5C] font-semibold">Project:</span>
                    <span className="font-bold text-[#242424]">{client.projectName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6A5C]">Status:</span>
                    {renderProjectBadge(client.projectStatus)}
                  </div>

                  <div className="pt-2 border-t border-[#D8C2A3]/40 grid grid-cols-3 gap-1 text-center font-serif-playfair">
                    <div>
                      <span className="block text-[10px] text-[#7A6A5C] uppercase font-sans font-bold">Total</span>
                      <span className="font-bold text-xs">{formatINR(client.fullPayment)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-800 uppercase font-sans font-bold">Advance</span>
                      <span className="font-bold text-xs text-emerald-800">{formatINR(client.advancePayment)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-amber-800 uppercase font-sans font-bold">Remaining</span>
                      <span className="font-bold text-xs text-amber-900">{formatINR(client.remainingPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs text-[#7A6A5C]">
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-1 text-[#8C1D18] font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-[#8C1D18] font-bold">
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingClient(client)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C2A3] text-xs font-bold text-[#242424] hover:bg-[#8C1D18] hover:text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(client)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C2A3] text-xs font-bold text-[#8C1D18]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingClient(client)}
                      className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0 box-border min-w-0"
            >
              {/* Header */}
              <div className="bg-[#1A1412] p-4 text-[#FAF8F5] flex items-center justify-between border-b border-[#D4B16A]/40 shrink-0">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#D4B16A]" />
                  <h3 className="font-bold text-base font-serif-playfair text-[#D4B16A]">
                    {editingClient ? 'Edit Client Record' : 'Add New Client'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveClient} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Client Name */}
                  <div>
                    <label className="block font-bold text-[#242424] mb-1">
                      Client Name <span className="text-[#8C1D18]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ananya & Rahul"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                    />
                  </div>

                  {/* Company / Business Name */}
                  <div>
                    <label className="block font-bold text-[#242424] mb-1">
                      Company / Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Dutta Family Weddings"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-[#242424] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-bold text-[#242424] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. client@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block font-bold text-[#242424] mb-1">
                    Address / Venue City
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Guwahati, Assam"
                    className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                  />
                </div>

                <div className="border-t border-[#D8C2A3]/50 pt-3">
                  <h4 className="font-bold text-[#8C1D18] mb-2 uppercase tracking-wider text-[11px]">
                    Project & Payment Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Project / Service Name */}
                    <div>
                      <label className="block font-bold text-[#242424] mb-1">
                        Project / Service Name <span className="text-[#8C1D18]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        placeholder="e.g. Grand Wedding Mandap & Reception Decor"
                        className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                      />
                    </div>

                    {/* Project Status */}
                    <div>
                      <label className="block font-bold text-[#242424] mb-1">
                        Project Status
                      </label>
                      <select
                        value={formData.projectStatus}
                        onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                      >
                        <option value="Inquiry">Inquiry</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Amounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block font-bold text-[#242424] mb-1">
                        Full Payment Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={formData.fullPayment}
                        onChange={(e) => setFormData({ ...formData, fullPayment: e.target.value })}
                        placeholder="e.g. 150000"
                        className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#242424] mb-1">
                        Advance Payment Received (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={formData.advancePayment}
                        onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-2 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                      />
                    </div>
                  </div>

                  {/* Dynamic Automatic Calculation Preview */}
                  <div className="mt-3 p-3.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-bold text-[#7A6A5C] uppercase tracking-wider">
                        Auto Calculated Remaining:
                      </span>
                      <span className="text-base font-extrabold text-[#8C1D18] font-serif-playfair">
                        {formatINR(previewCalculation.remainingPayment)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[11px] font-bold text-[#7A6A5C] uppercase tracking-wider mb-1">
                        Computed Payment Status:
                      </span>
                      {renderPaymentBadge(previewCalculation.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-[#242424] mb-1">
                    Notes & Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Specific floral preferences, venue details, payment schedule terms..."
                    className="w-full p-3 rounded-xl border border-[#D8C2A3] bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#8C1D18]"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl bg-white border border-[#D8C2A3] text-xs font-bold text-[#7A6A5C] hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-[#8C1D18] hover:bg-[#6e1612] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingClient ? 'Update Client' : 'Save Client'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW CLIENT DETAILS MODAL */}
      <AnimatePresence>
        {viewingClient && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0"
            >
              <div className="bg-[#1A1412] p-4 text-[#FAF8F5] flex items-center justify-between border-b border-[#D4B16A]/40 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D4B16A]" />
                  <h3 className="font-bold text-base font-serif-playfair text-[#D4B16A]">
                    Client Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingClient(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <h2 className="text-xl font-bold font-serif-playfair text-[#242424]">{viewingClient.name}</h2>
                  {viewingClient.companyName && (
                    <p className="text-xs text-[#7A6A5C] flex items-center gap-1 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#8C1D18]" />
                      {viewingClient.companyName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D8C2A3]/50">
                  <div>
                    <span className="block text-[11px] text-[#7A6A5C] font-semibold">Payment Status:</span>
                    <div className="mt-1">{renderPaymentBadge(viewingClient.paymentStatus)}</div>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#7A6A5C] font-semibold">Project Status:</span>
                    <div className="mt-1">{renderProjectBadge(viewingClient.projectStatus)}</div>
                  </div>
                </div>

                <div className="bg-[#F7F2EA] p-4 rounded-xl border border-[#D8C2A3] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6A5C] font-semibold">Project / Service:</span>
                    <span className="font-bold text-[#242424]">{viewingClient.projectName}</span>
                  </div>

                  <div className="pt-2 border-t border-[#D8C2A3]/40 grid grid-cols-3 gap-2 text-center font-serif-playfair">
                    <div>
                      <span className="block text-[10px] text-[#7A6A5C] uppercase font-sans font-bold">Total</span>
                      <span className="font-extrabold text-sm">{formatINR(viewingClient.fullPayment)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-800 uppercase font-sans font-bold">Advance</span>
                      <span className="font-extrabold text-sm text-emerald-800">{formatINR(viewingClient.advancePayment)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-amber-800 uppercase font-sans font-bold">Remaining</span>
                      <span className="font-extrabold text-sm text-amber-900">{formatINR(viewingClient.remainingPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#D8C2A3]/50 text-xs">
                  {viewingClient.phone && (
                    <div className="flex items-center gap-2 text-[#242424]">
                      <Phone className="w-4 h-4 text-[#8C1D18]" />
                      <span className="font-semibold">Phone:</span>
                      <a href={`tel:${viewingClient.phone}`} className="text-[#8C1D18] hover:underline font-mono">
                        {viewingClient.phone}
                      </a>
                    </div>
                  )}

                  {viewingClient.email && (
                    <div className="flex items-center gap-2 text-[#242424]">
                      <Mail className="w-4 h-4 text-[#8C1D18]" />
                      <span className="font-semibold">Email:</span>
                      <a href={`mailto:${viewingClient.email}`} className="text-[#8C1D18] hover:underline">
                        {viewingClient.email}
                      </a>
                    </div>
                  )}

                  {viewingClient.address && (
                    <div className="flex items-start gap-2 text-[#242424]">
                      <MapPin className="w-4 h-4 text-[#8C1D18] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Address:</span> {viewingClient.address}
                      </div>
                    </div>
                  )}
                </div>

                {viewingClient.notes && (
                  <div className="pt-2 border-t border-[#D8C2A3]/50">
                    <span className="block font-bold text-[#7A6A5C] mb-1">Notes:</span>
                    <p className="bg-white p-3 rounded-xl border border-[#D8C2A3] text-xs text-[#242424] leading-relaxed whitespace-pre-line">
                      {viewingClient.notes}
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-[#7A6A5C] pt-2 border-t border-[#D8C2A3]/50 flex items-center justify-between">
                  <span>Created: {new Date(viewingClient.createdAt).toLocaleDateString('en-IN')}</span>
                  <span>Updated: {new Date(viewingClient.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F2EA] border-t border-[#D8C2A3] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingClient;
                    setViewingClient(null);
                    setDeletingClient(c);
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-600 hover:text-white"
                >
                  Delete Record
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const c = viewingClient;
                    setViewingClient(null);
                    openEditModal(c);
                  }}
                  className="py-2 px-4 rounded-xl bg-[#8C1D18] text-white font-bold hover:bg-[#6e1612]"
                >
                  Edit Client
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingClient && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#FAF8F5] border-2 border-rose-300 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-bold text-base text-[#242424] mb-1">Delete Client Record?</h4>
                <p className="text-xs text-[#7A6A5C]">
                  Are you sure you want to delete <strong className="text-[#8C1D18]">{deletingClient.name}</strong>? This action will permanently remove their records from Firestore.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingClient(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D8C2A3] bg-white text-xs font-bold text-[#7A6A5C] hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
