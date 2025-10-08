import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import './css/components/animations.css';
import './css/responsive.css';
import reportWebVitals from './reportWebVitals';
import LandingHeader from './landing/header';
import PanelHeader from './panel/header';
import Main from './main';
import Footer from './footer';
import { ToastProvider } from './components/ToastProvider';
import SplashScreen from './components/SplashScreen';
import PageTransition from './components/PageTransition';

// Import all components
import BodyTypeTest from './components/bodyTypeTest';
import HealthStatusTracking from './components/healthStatusTracking';
import HealthStatusRecord from './components/healthStatusRecord';
import DietaryTracking from './components/DietaryTracking';
import DietaryRecord from './components/DietaryRecord';
import FoodDB from './components/foodDB';
import FAQ from './components/faq';
import SignIn from './components/signin';
import SignUp from './components/signup';
import Logout from './components/logout';
import Profile from './components/profile';
import PolicyPage from './components/policy';
import UserAPI from './services/userAPI';

function AppWithRouting() {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State for current route/page
  const [currentRoute, setCurrentRoute] = useState('home');
  
  // State for user authentication
  const [user, setUser] = useState(null);

  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  
  // Route transition state
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  // Handle URL changes and initialize routing
  useEffect(() => {
    // Get initial route from URL hash or default to 'home'
    const initialHash = window.location.hash.slice(1) || 'home';
    const initialRoute = initialHash.split('?')[0]; // Extract base route, ignore parameters
    setCurrentRoute(initialRoute);

    // Listen for URL hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      const route = hash.split('?')[0]; // Extract base route, ignore parameters
      setCurrentRoute(route);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup event listener
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check for stored user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Navigation function with transition animation
  const navigate = (route) => {
    const baseRoute = route.split('?')[0]; // Extract base route
    if (baseRoute !== currentRoute) {
      setIsRouteChanging(true);
      
      setTimeout(() => {
        setCurrentRoute(baseRoute);
        window.location.hash = route; // Keep full route with parameters in URL
        setIsRouteChanging(false);
      }, 150);
    } else {
      // If same route but different parameters, just update the URL
      window.location.hash = route;
    }
  };

  // Login function
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('home');
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    navigate('home');
  };

  // Render current page content based on route
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return <Main isLoggedIn={isLoggedIn} currentUser={user} />;
      case 'signin':
        return <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'signup':
        return <SignUp navigate={navigate} />;
      case 'logout':
        return <Logout onLogout={handleLogout} />;
      case 'profile':
        return isLoggedIn ? <Profile user={user} navigate={navigate} /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'body-type-test':
        return isLoggedIn ? <BodyTypeTest 
          onTestComplete={(constitution) => {
            // Handle test completion - maybe navigate somewhere or show a message
            console.log('Body type test completed:', constitution);
          }}
          onNavigateToFoodDb={() => {
            // Navigate to food database
            navigate('food-database');
          }}
          user={user}
          onUpdateUserConstitution={async (constitutionData) => {
            try {
              // Update user constitution in the state (handle null constitution)
              const updatedUser = {
                ...user,
                constitution: constitutionData.constitution, // Can be null
                bodyType: constitutionData.bodyType,
                bodyTypeName: constitutionData.bodyTypeName,
                bodyTypeRecordID: constitutionData.bodyType,
                bodyTypeRecordDate: constitutionData.testResult.timestamp,
                testResult: constitutionData.testResult
              };
              
              setUser(updatedUser);
              
              // Update localStorage
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              // Update backend (always save, even if constitution is null)
              await UserAPI.updateUser(user.userID, {
                constitution: constitutionData.constitution,
                bodyType: constitutionData.bodyType,
                bodyTypeName: constitutionData.bodyTypeName,
                bodyTypeRecordID: constitutionData.bodyType,
                bodyTypeRecordDate: constitutionData.testResult.timestamp,
                testResult: constitutionData.testResult
              });
              
              console.log('User constitution updated successfully!', constitutionData);
            } catch (error) {
              console.error('Error updating user constitution:', error);
              throw error; // Re-throw so the bodyTypeTest component can handle it
            }
          }}
        /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'health-status-tracking':
        return isLoggedIn ? <HealthStatusTracking navigate={navigate} user={user} /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'health-status-record':
        return isLoggedIn ? <HealthStatusRecord user={user} navigate={navigate} /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'dietary-tracking':
        return isLoggedIn ? <DietaryTracking navigate={navigate} user={user} /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'dietary-record':
        return isLoggedIn ? <DietaryRecord navigate={navigate} user={user} /> : <SignIn onLogin={handleLogin} navigate={navigate} />;
      case 'food-db':
        return <FoodDB isLoggedIn={isLoggedIn} currentUser={user} />;
      case 'faq':
        return <FAQ />;
      case 'policy':
        return <PolicyPage />;
      default:
        return <Main isLoggedIn={isLoggedIn} currentUser={user} />;
    }
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Main App Content */}
      {!showSplash && (
        <>
          {/* Conditionally render header based on login status */}
          <div className="header-transition">
            {isLoggedIn ? (
              <PanelHeader 
                navigate={navigate} 
                onLogout={handleLogout} 
                user={user} 
              />
            ) : (
              <LandingHeader navigate={navigate} />
            )}
          </div>
          
          {/* Page content with transitions */}
          <div className="page-container">
            <PageTransition 
              currentRoute={currentRoute}
              transitionKey={currentRoute}
              animationType="fade"
            >
              {isRouteChanging ? (
                <div className="route-loading">
                  <div className="route-loading-spinner"></div>
                </div>
              ) : (
                renderCurrentPage()
              )}
            </PageTransition>
          </div>

          <Footer navigate={navigate} />
        </>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AppWithRouting />
    </ToastProvider>
  </React.StrictMode>
);

reportWebVitals();
