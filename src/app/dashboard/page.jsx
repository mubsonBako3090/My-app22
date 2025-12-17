'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import PaymentForm from '@/components/PaymentForm';
import BillList from '@/components/BillList';
import styles from '@/styles/Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => { if (isAuthenticated) fetchDashboardData(); }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    const mockData = {
      user: { name: "John Doe", accountNumber: "AC1234", customerType: "residential" },
      currentBill: { id: "677cc25dde0d1f289e540ef1", billNumber: "INV-001", amountDue: 125, dueDate: "2024-01-15", status: "pending" },
      usageHistory: [
        { month: "Jan", usage: 220 },
        { month: "Feb", usage: 180 },
        { month: "Mar", usage: 240 },
        { month: "Apr", usage: 200 }
      ]
    };
    setDashboardData(mockData);
  };

  const handleLogout = async () => { const result = await logout(); if (!result.success) alert('Logout failed'); };
  const openPaymentForm = () => { if (dashboardData?.currentBill) { setCurrentBill(dashboardData.currentBill); setShowPaymentForm(true); } else alert("No bill available."); };
  const closePaymentForm = () => setShowPaymentForm(false);
  const handlePay = (payment) => { setPayments((prev) => [...prev, payment]); setShowPaymentForm(false); };

  if (loading) return <><Header /><div className={styles.loadingContainer}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div><Footer /></>;
  if (!isAuthenticated) return <><Header /><div className={styles.unauthorized}><div className="container text-center"><i className="bi bi-shield-exclamation"></i><h2>Access Denied</h2><p>Please log in to access your dashboard.</p></div></div><Footer /></>;

  return (
    <>
      <Header />
      <div className={styles.dashboard}>

        {/* Welcome */}
        <section className={styles.welcomeSection}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>Welcome back, {user?.firstName}!</h1>
                <p className={styles.welcomeSubtitle}>
                  Account: {user?.accountNumber} • {user?.customerType?.charAt(0).toUpperCase() + user?.customerType?.slice(1)} Customer
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <span className={styles.statusBadge}><i className="bi bi-check-circle-fill me-1"></i> Active</span>
                <button className="btn btn-danger mt-3" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        {dashboardData && <section className="section-padding">
          <div className="container">
            <div className="row">
              {/* Current Bill */}
              <div className="col-md-3 mb-4" onClick={() => router.push('/bills')} style={{ cursor: 'pointer' }}>
                <div className={styles.statCard}><div className={styles.statIcon}><i className="bi bi-receipt"></i></div><div className={styles.statContent}><h3>₦{dashboardData.currentBill.amountDue}</h3><p>Current Bill</p><small>Due {new Date(dashboardData.currentBill.dueDate).toLocaleDateString()}</small></div></div>
              </div>
              {/* Last Month Usage */}
              <div className="col-md-3 mb-4" onClick={() => router.push('/usage')} style={{ cursor: 'pointer' }}>
                <div className={styles.statCard}><div className={styles.statIcon}><i className="bi bi-lightning"></i></div><div className={styles.statContent}><h3>{dashboardData.usageHistory.at(-1).usage} kWh</h3><p>Last Month Usage</p><small>Usage Trend Available</small></div></div>
              </div>
              {/* Outages */}
              <div className="col-md-3 mb-4" onClick={() => router.push('/outagemap')} style={{ cursor: 'pointer' }}>
                <div className={styles.statCard}><div className={styles.statIcon}><i className="bi bi-geo-alt-fill"></i></div><div className={styles.statContent}><h3>Outages</h3><p>View Map</p><small>Current service interruptions</small></div></div>
              </div>
              {/* Programs & Rebates */}
              <div className="col-md-3 mb-4" onClick={() => router.push('/programs')} style={{ cursor: 'pointer' }}>
                <div className={styles.statCard}><div className={styles.statIcon}><i className="bi bi-gift"></i></div><div className={styles.statContent}><h3>Programs</h3><p>Energy Rebates</p><small>Save on your bill</small></div></div>
              </div>
            </div>
          </div>
        </section>}

        {/* Payment Section */}
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title mb-4">Make a Payment</h2>
            <button className="btn btn-primary mb-3" onClick={openPaymentForm}><i className="bi bi-credit-card me-2"></i> Pay Now</button>
            {showPaymentForm && currentBill && <PaymentForm bill={currentBill} onClose={closePaymentForm} onSubmit={handlePay} />}
            <BillList bills={payments} />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
