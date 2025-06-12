import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { auth } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MainLayout = ({ children }) => {
  // Start with sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Auto-open on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Adjust the main content area based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden pt-16 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          {children}
        </main>
        
        <Footer />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
