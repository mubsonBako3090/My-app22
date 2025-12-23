// app/support/dashboard/page.js (For Support Agents)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/SupportDashboard.module.css';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('open');

  return (
    <RoleBasedRoute allowedRoles={['supportAgent', 'admin', 'superAdmin']}>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>Support Dashboard</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'open' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open Tickets
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'assigned' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned to Me
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'resolved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved
          </button>
        </div>

        <div className={styles.ticketList}>
          {tickets.map(ticket => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div className={styles.ticketHeader}>
                <span className={styles.ticketId}>#{ticket.id}</span>
                <span className={`${styles.priority} ${styles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <h4>{ticket.subject}</h4>
              <p>{ticket.description.substring(0, 100)}...</p>
              <div className={styles.ticketFooter}>
                <span>Customer: {ticket.customerName}</span>
                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                <button className={styles.btnPrimary}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </RoleBasedRoute>
  );
}