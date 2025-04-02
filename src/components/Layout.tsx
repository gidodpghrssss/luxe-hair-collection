import React from 'react';
import Header from './Header';
import Footer from './Footer';
import EnhancedChatbot from './EnhancedChatbot';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <EnhancedChatbot />}
    </div>
  );
};

export default Layout;
