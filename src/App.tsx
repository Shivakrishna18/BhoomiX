import React, { useState, useEffect, useCallback } from 'react';
import { Property, UserProfile, SavedProperty, Conversation, SiteVisit } from './types';
import { INITIAL_TELANGANA_PROPERTIES } from './data/telanganaDemoData';
import { authService } from './services/authService';
import { propertyService } from './services/propertyService';
import { savedPropertyService } from './services/savedPropertyService';
import { chatService } from './services/chatService';
import { siteVisitService } from './services/siteVisitService';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Modals
import { ChatModal } from './components/ChatModal';
import { SiteVisitModal } from './components/SiteVisitModal';
import { CompareModal } from './components/CompareModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CreateListingWizard } from './views/CreateListingWizard';
import { notificationService } from './services/notificationService';

// Main Views
import { LandingView } from './views/LandingView';
import { DiscoverView } from './views/DiscoverView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { AIMatchmakerView } from './views/AIMatchmakerView';
import { SellerStudioView } from './views/SellerStudioView';
import { BuyerDashboardView } from './views/BuyerDashboardView';
import { TrustAndDocumentsView } from './views/TrustAndDocumentsView';
import { HowItWorksView } from './views/HowItWorksView';

const DEMO_BUYER_PROFILE: UserProfile = {
  id: 'buyer_srikanth',
  displayName: 'Srikanth Rao (Buyer)',
  email: 'srikanth.rao@bhoomix.in',
  role: 'BUYER',
  phone: '+91 98490 12345',
  createdAt: new Date().toISOString(),
};

const DEMO_SELLER_PROFILE: UserProfile = {
  id: 'seller_venkat_reddy',
  displayName: 'Venkata Reddy (Pattadar)',
  email: 's16677481@gmail.com',
  role: 'SELLER',
  phone: '+91 98480 54321',
  createdAt: new Date().toISOString(),
};

export default function App() {
  // Role & Perspective State: BUYER or SELLER
  const [activeRole, setActiveRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User & Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_BUYER_PROFILE);
  const [properties, setProperties] = useState<Property[]>(INITIAL_TELANGANA_PROPERTIES);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatProperty, setActiveChatProperty] = useState<Property | null>(null);
  const [activeChatSellerId, setActiveChatSellerId] = useState<string>('');
  const [activeChatSellerName, setActiveChatSellerName] = useState<string>('');
  const [siteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
  const [activeVisitProperty, setActiveVisitProperty] = useState<Property | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [createWizardOpen, setCreateWizardOpen] = useState(false);

  // Synchronize User profile when activeRole changes using IP Auto-Login
  useEffect(() => {
    authService.getOrInitIpSession(activeRole).then((ipUser) => {
      setCurrentUser(ipUser);
    });

    const handleAuthChange = (e: any) => {
      if (e?.detail?.user) {
        setCurrentUser(e.detail.user);
      }
    };
    window.addEventListener('bhoomix_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('bhoomix_auth_changed', handleAuthChange);
    };
  }, [activeRole]);

  // Fetch Core Properties Data
  const loadProperties = useCallback(async () => {
    try {
      const list = await propertyService.getPublishedProperties();
      setProperties(list);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Load User Data (Saved, Visits, Chats) when user changes
  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      setSavedProperties([]);
      setSavedPropertyIds(new Set());
      setConversations([]);
      setSiteVisits([]);
      return;
    }

    try {
      const [savedList, chatList, visitList, notifsList] = await Promise.all([
        savedPropertyService.getSavedProperties(currentUser.id),
        chatService.getUserConversations(currentUser.id),
        siteVisitService.getSiteVisitsForUser(currentUser.id),
        notificationService.getUserNotifications(currentUser.id),
      ]);

      setSavedProperties(savedList);
      setSavedPropertyIds(new Set(savedList.map((s) => s.propertyId)));
      setConversations(chatList);
      setSiteVisits(visitList);
      setUnreadNotifsCount(notifsList.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to load user records:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    // Run 30-day old chats pruning on startup
    chatService.cleanUpOldChats();

    loadUserData();

    const handleNewNotif = () => {
      setUnreadNotifsCount((prev) => prev + 1);
    };

    let debounceTimer: any = null;
    const handleChatUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadUserData();
      }, 500);
    };

    window.addEventListener('bhoomix_new_notification', handleNewNotif);
    window.addEventListener('bhoomix_conv_updated', handleChatUpdate);

    const handlePropertyChange = (e: any) => {
      loadProperties();
      if (e?.detail?.id && selectedProperty?.id === e.detail.id) {
        setSelectedProperty(null);
      }
    };

    window.addEventListener('bhoomix_property_created', handlePropertyChange);
    window.addEventListener('bhoomix_property_updated', handlePropertyChange);
    window.addEventListener('bhoomix_property_deleted', handlePropertyChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('bhoomix_new_notification', handleNewNotif);
      window.removeEventListener('bhoomix_conv_updated', handleChatUpdate);
      window.removeEventListener('bhoomix_property_created', handlePropertyChange);
      window.removeEventListener('bhoomix_property_updated', handlePropertyChange);
      window.removeEventListener('bhoomix_property_deleted', handlePropertyChange);
    };
  }, [loadUserData, loadProperties, selectedProperty?.id]);

  // Toggle Save Property
  const handleToggleSave = async (property: Property) => {
    const isAlreadySaved = savedPropertyIds.has(property.id);
    try {
      if (isAlreadySaved) {
        await savedPropertyService.unsaveProperty(currentUser.id, property.id);
      } else {
        await savedPropertyService.saveProperty(currentUser.id, property.id, property);
      }
      await loadUserData();
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  // Toggle Compare Property
  const handleToggleCompare = (property: Property) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 land parcels at once.');
        return prev;
      }
      return [...prev, property];
    });
  };

  // Initiate Chat
  const handleStartChat = (property: Property) => {
    setActiveChatProperty(property);
    setActiveChatSellerId(property.sellerId);
    setActiveChatSellerName(property.sellerName || 'Landowner');
    setChatModalOpen(true);
  };

  // Initiate Site Visit
  const handleScheduleVisit = (property: Property) => {
    setActiveVisitProperty(property);
    setSiteVisitModalOpen(true);
  };

  // Select Property & Open Detail
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Search from Landing
  const handleLandingSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedProperty(null);
    setActiveTab('discover');
  };

  // Filter properties belonging to the current seller
  const sellerProperties = properties.filter(
    (p) => p.sellerId === currentUser.id || p.sellerId === 'seller_venkat_reddy' || p.sellerName?.includes('Venkat')
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 antialiased selection:bg-indigo-200 selection:text-indigo-900">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onSelectRole={(role) => {
          setActiveRole(role);
          if (role === 'SELLER') {
            setActiveTab('seller');
          } else if (activeTab === 'seller') {
            setActiveTab('discover');
          }
        }}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setSelectedProperty(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateWizard={() => setCreateWizardOpen(true)}
        savedCount={savedProperties.length}
        compareCount={compareList.length}
        onOpenCompare={() => setCompareModalOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {selectedProperty ? (
          <PropertyDetailView
            property={selectedProperty}
            onBack={() => setSelectedProperty(null)}
            currentUser={currentUser}
            isSaved={savedPropertyIds.has(selectedProperty.id)}
            onToggleSave={() => handleToggleSave(selectedProperty)}
            isCompared={compareList.some((c) => c.id === selectedProperty.id)}
            onToggleCompare={() => handleToggleCompare(selectedProperty)}
            onStartChat={handleStartChat}
            onScheduleVisit={handleScheduleVisit}
          />
        ) : (
          <>
            {activeTab === 'landing' && (
              <LandingView
                onSearch={handleLandingSearch}
                onSelectProperty={handleSelectProperty}
                onNavigate={setActiveTab}
                featuredProperties={properties}
                savedPropertyIds={savedPropertyIds}
                onToggleSave={handleToggleSave}
                onOpenSellerStudio={() => {
                  setActiveRole('SELLER');
                  setActiveTab('seller');
                }}
              />
            )}

            {activeTab === 'discover' && (
              <DiscoverView
                properties={properties}
                onSelectProperty={handleSelectProperty}
                savedPropertyIds={savedPropertyIds}
                onToggleSave={handleToggleSave}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenCompareModal={() => setCompareModalOpen(true)}
                initialQuery={searchQuery}
              />
            )}

            {activeTab === 'recommendations' && (
              <AIMatchmakerView
                properties={properties}
                currentUser={currentUser}
                onSelectProperty={handleSelectProperty}
                savedPropertyIds={savedPropertyIds}
                onToggleSave={handleToggleSave}
              />
            )}

            {activeTab === 'seller' && (
              <SellerStudioView
                currentUser={currentUser}
                sellerProperties={sellerProperties}
                siteVisits={siteVisits}
                conversations={conversations}
                onOpenChat={(conv) => {
                  const foundProp = properties.find((p) => p.id === conv.propertyId);
                  setActiveChatProperty(foundProp || null);
                  setActiveChatSellerId(conv.sellerId);
                  setActiveChatSellerName(conv.sellerName || 'Landowner');
                  setChatModalOpen(true);
                }}
                onSelectProperty={handleSelectProperty}
                onRefreshData={() => {
                  loadProperties();
                  loadUserData();
                }}
                onOpenCreateWizard={() => setCreateWizardOpen(true)}
              />
            )}

            {activeTab === 'buyer' && (
              <BuyerDashboardView
                currentUser={currentUser}
                savedProperties={savedProperties}
                conversations={conversations}
                siteVisits={siteVisits}
                onSelectPropertyId={(id) => {
                  const found = properties.find((p) => p.id === id);
                  if (found) handleSelectProperty(found);
                }}
                onOpenChat={(conv) => {
                  const foundProp = properties.find((p) => p.id === conv.propertyId);
                  setActiveChatProperty(foundProp || null);
                  setActiveChatSellerId(conv.sellerId);
                  setActiveChatSellerName(conv.sellerName || 'Landowner');
                  setChatModalOpen(true);
                }}
                onNavigateTab={setActiveTab}
                onUnsaveProperty={async (propId) => {
                  await savedPropertyService.unsaveProperty(currentUser.id, propId);
                  loadUserData();
                }}
              />
            )}

            {activeTab === 'trust' && <TrustAndDocumentsView />}

            {activeTab === 'how-it-works' && (
              <HowItWorksView
                onNavigate={setActiveTab}
                onOpenSellerStudio={() => {
                  setActiveRole('SELLER');
                  setActiveTab('seller');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      {currentUser && (
        <>
          <ChatModal
            isOpen={chatModalOpen}
            onClose={() => setChatModalOpen(false)}
            currentUser={currentUser}
            property={activeChatProperty}
            sellerId={activeChatSellerId}
            sellerName={activeChatSellerName}
          />

          <SiteVisitModal
            isOpen={siteVisitModalOpen}
            onClose={() => setSiteVisitModalOpen(false)}
            currentUser={currentUser}
            property={activeVisitProperty}
            onSuccess={() => {
              loadUserData();
            }}
          />

          <NotificationsModal
            isOpen={notificationsModalOpen}
            currentUser={currentUser}
            onClose={() => {
              setNotificationsModalOpen(false);
              loadUserData();
            }}
            onOpenChatWithProperty={(propertyId) => {
              const found = properties.find((p) => p.id === propertyId);
              if (found) {
                handleStartChat(found);
              }
            }}
          />
        </>
      )}

      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        properties={compareList}
        onRemoveProperty={(id) => {
          setCompareList((prev) => prev.filter((p) => p.id !== id));
        }}
        onSelectProperty={(p) => {
          setCompareModalOpen(false);
          handleSelectProperty(p);
        }}
      />

      {currentUser && createWizardOpen && (
        <CreateListingWizard
          currentUser={currentUser}
          onClose={() => setCreateWizardOpen(false)}
          onSuccess={(newProp) => {
            loadProperties();
            loadUserData();
            handleSelectProperty(newProp);
          }}
        />
      )}

      {/* Global Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
