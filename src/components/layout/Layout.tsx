import React, { useState, ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [infoPanelContent, setInfoPanelContent] = useState<'chiaroscuro' | 'pigments' | 'mixing'>('chiaroscuro');
  
  // Function to update both the selected tab and appropriate info panel content
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    
    // Update info panel content based on selected tab
    if (tab === 'picker') {
      setInfoPanelContent('chiaroscuro');
    } else if (tab === 'mixer') {
      setInfoPanelContent('mixing');
    } else if (tab === 'canvas') {
      setInfoPanelContent('pigments');
    } else if (tab === 'analyze') {
      setInfoPanelContent('chiaroscuro'); // Use chiaroscuro info for analyze tab too
    }
  };
  
  return (
    <div className="h-screen w-full flex flex-col bg-canvas-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* App Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          selectedTab={activeTab} 
          setSelectedTab={handleTabChange}
          showInfoPanel={showInfoPanel}
          setShowInfoPanel={setShowInfoPanel}
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex">
          {children}
        </main>
        
        {/* Info Panel */}
        <InfoPanel 
          show={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
          content={infoPanelContent}
        />
      </div>
    </div>
  );
};

export default Layout;