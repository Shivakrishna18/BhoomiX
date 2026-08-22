import React, { useState, useEffect, useCallback } from 'react';
import { Property, UserProfile, SavedProperty, Conversation, SiteVisit } from './types';
import { INITIAL_TELANGANA_PROPERTIES } from './data/telanganaDemoData';
import { authService } from './services/authService';
import { propertyService } from './services/propertyService';
import { savedPropertyService } from './services/savedPropertyService';
import { chatService } from './services/chatService';
import { siteVisitService } from './services/siteVisitService';
import { notificationService } from './services/notificationService';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Modals
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ChatModal } from './components/ChatModal';
import { SiteVisitModal } from './components/SiteVisitModal';
import { CompareModal } from './components/CompareModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CreateListingWizard } from './views/CreateListingWizard';

// Main Views
import { LandingView } from './views/LandingView';
import { DiscoverView } from './views/DiscoverView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { AIMatchmakerView } from './views/AIMatchmakerView';
import { SellerStudioView } from './views/SellerStudioView';
import { BuyerDashboardView } from './views/BuyerDashboardView';
import { TrustAndDocumentsView } from './views/TrustAndDocumentsView';
import { HowItWorksView } from './views/HowItWorksView';

export default function App() {
  // Role & Perspective State: BUYER or SELLER
  const [activeRole, setActiveRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User & Data State - defaults to null unless authenticated
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    authService.getCurrentStoredProfile()
  );
  const [properties, setProperties] = useState<Property[]>(INITIAL_TELANGANA_PROPERTIES);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
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

  // Synchronize User profile across Firebase Auth and test personas
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        if (user.role === 'SELLER' || user.role === 'BUYER') {
          setActiveRole(user.role);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch and Subscribe to Core Properties in Real-time from Firestore
  useEffect(() => {
    setLoading(true);

    const unsubscribe = propertyService.subscribeToPublishedProperties(
      (list) => {
        setProperties(list);
        setLoading(false);

        // Keep selected property updated if its data changes
        setSelectedProperty((curr) => {
          if (!curr) return null;
          const fresh = list.find((p) => p.id === curr.id);
          return fresh || curr;
        });
      },
      (error) => {
        console.warn('Real-time properties subscription notice:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Hydrate selected property from URL parameter on initial load or popstate
  useEffect(() => {
    const syncFromUrl = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const propId = params.get('propertyId') || params.get('id');
        if (propId) {
          const prop = await propertyService.getPropertyById(propId);
          if (prop) {
            setSelectedProperty(prop);
          }
        }
      } catch (err) {
        console.warn('URL property sync notice:', err);
      }
    };
    syncFromUrl();

    const handlePopState = () => {
      syncFromUrl();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Load User Data (Saved, Visits, Chats) when user changes
  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      setSavedProperties([]);
      setSavedPropertyIds(new Set());
      setConversations([]);
      setSiteVisits([]);
      setUnreadNotifsCount(0);
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
    loadUserData();

    if (!currentUser) return;

    // Real-time listener for user conversations
    const unsubConvs = chatService.subscribeToUserConversations(currentUser.id, (list) => {
      setConversations(list);
    });

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

    return () => {
      unsubConvs();
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('bhoomix_new_notification', handleNewNotif);
      window.removeEventListener('bhoomix_conv_updated', handleChatUpdate);
    };
  }, [currentUser, loadUserData]);

  useEffect(() => {
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
      window.removeEventListener('bhoomix_property_created', handlePropertyChange);
      window.removeEventListener('bhoomix_property_updated', handlePropertyChange);
      window.removeEventListener('bhoomix_property_deleted', handlePropertyChange);
    };
  }, [loadProperties, selectedProperty?.id]);

  // Complete Sign Out Handler
  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setActiveTab('landing');
    handleClearSelectedProperty();
    setSavedProperties([]);
    setSavedPropertyIds(new Set());
    setConversations([]);
    setSiteVisits([]);
    setUnreadNotifsCount(0);
    setChatModalOpen(false);
    setSiteVisitModalOpen(false);
    setCreateWizardOpen(false);
  };

  // Toggle Save Property
  const handleToggleSave = async (property: Property) => {
    if (!currentUser) {
      setAuthModalInitialRole('BUYER');
      setAuthModalOpen(true);
      return;
    }

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
    if (!currentUser) {
      setAuthModalInitialRole('BUYER');
      setAuthModalOpen(true);
      return;
    }
    setActiveChatProperty(property);
    setActiveChatSellerId(property.sellerId || property.sellerUserId || 'seller_venkat_reddy');
    setActiveChatSellerName(property.sellerName || 'Landowner');
    setChatModalOpen(true);
  };

  // Initiate Site Visit
  const handleScheduleVisit = (property: Property) => {
    if (!currentUser) {
      setAuthModalInitialRole('BUYER');
      setAuthModalOpen(true);
      return;
    }
    setActiveVisitProperty(property);
    setSiteVisitModalOpen(true);
  };

  // Select Property & Open Detail
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('propertyId', property.id);
      window.history.pushState({}, '', url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear Selected Property
  const handleClearSelectedProperty = () => {
    setSelectedProperty(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('propertyId');
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Handle Search from Landing
  const handleLandingSearch = (query: string) => {
    setSearchQuery(query);
    handleClearSelectedProperty();
    setActiveTab('discover');
  };

  // Filter properties belonging to the current seller
  const sellerProperties = currentUser
    ? properties.filter(
        (p) =>
          p.sellerId === currentUser.id ||
          p.sellerUserId === currentUser.id ||
          (currentUser.role === 'SELLER' && (p.sellerEmail === currentUser.email || p.sellerName === currentUser.displayName))
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 antialiased selection:bg-indigo-200 selection:text-indigo-900">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onSelectRole={async (role) => {
          await authService.switchRole(role);
          setActiveRole(role);
          if (role === 'SELLER') {
            setActiveTab('seller');
          } else if (activeTab === 'seller') {
            setActiveTab('discover');
          }
        }}
        activeTab={activeTab}
        onNavigate={(tab) => {
          handleClearSelectedProperty();
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateWizard={() => {
          if (!currentUser) {
            setAuthModalInitialRole('SELLER');
            setAuthModalOpen(true);
          } else {
            setCreateWizardOpen(true);
          }
        }}
        onOpenAuth={(role) => {
          setAuthModalInitialRole(role || 'BUYER');
          setAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onSignOut={handleSignOut}
        savedCount={savedProperties.length}
        compareCount={compareList.length}
        onOpenCompare={() => setCompareModalOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => {
          if (!currentUser) {
            setAuthModalInitialRole('BUYER');
            setAuthModalOpen(true);
          } else {
            setNotificationsModalOpen(true);
          }
        }}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {selectedProperty ? (
          <PropertyDetailView
            property={selectedProperty}
            onBack={handleClearSelectedProperty}
            currentUser={currentUser || undefined}
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
                  if (!currentUser) {
                    setAuthModalInitialRole('SELLER');
                    setAuthModalOpen(true);
                  } else {
                    setActiveRole('SELLER');
                    setActiveTab('seller');
                  }
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
                currentUser={currentUser || undefined}
                onSelectProperty={handleSelectProperty}
                savedPropertyIds={savedPropertyIds}
                onToggleSave={handleToggleSave}
              />
            )}

            {activeTab === 'seller' && (
              currentUser ? (
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
                  onOpenProfileModal={() => setProfileModalOpen(true)}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sign in to Access Seller Studio</h3>
                  <p className="text-xs text-slate-500">
                    Direct pattadar landowners can manage listings, chat with prospective buyers, and coordinate visits.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalInitialRole('SELLER');
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In or Create Seller Account
                  </button>
                </div>
              )
            )}

            {activeTab === 'buyer' && (
              currentUser ? (
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
                  onOpenProfileModal={() => setProfileModalOpen(true)}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sign in to Access Buyer Hub</h3>
                  <p className="text-xs text-slate-500">
                    Keep track of your saved land parcels, direct owner conversations, and confirmed site visit bookings.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalInitialRole('BUYER');
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In or Create Buyer Account
                  </button>
                </div>
              )
            )}

            {activeTab === 'trust' && <TrustAndDocumentsView />}

            {activeTab === 'how-it-works' && (
              <HowItWorksView
                onNavigate={setActiveTab}
                onOpenSellerStudio={() => {
                  if (!currentUser) {
                    setAuthModalInitialRole('SELLER');
                    setAuthModalOpen(true);
                  } else {
                    setActiveRole('SELLER');
                    setActiveTab('seller');
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalInitialRole}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          setAuthModalOpen(false);
          loadUserData();
        }}
      />

      {/* Global Modals for Authenticated Users */}
      {currentUser && (
        <>
          <UserProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            currentUser={currentUser}
            onProfileUpdated={(updated) => {
              setCurrentUser(updated);
              loadUserData();
            }}
          />

          <ChatModal
            isOpen={chatModalOpen}
            onClose={() => setChatModalOpen(false)}
            currentUser={currentUser}
            property={activeChatProperty}
            sellerId={activeChatSellerId}
            sellerName={activeChatSellerName}
            onUpdateCurrentUserProfile={(updated) => {
              setCurrentUser(updated);
              loadUserData();
            }}
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
