import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import LoginForm from './components/login/login';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ForgetEmailForm from './components/login/forgetpassword';
import SetpasswordForm from './components/login/Setpassword';
import Navbar from './components/navbar/Navbar';
import RegistrationForm from './components/register/register';
import Scenario from './components/pages/Scenario';
import Terms from './components/Termscondition/term';
import PrivateRoute from './components/privateRoute';
import Authenticateotp from './components/register/authenticateotp';
import LandingPage from './Landingpage/Landing';
import Privicy from './components/privicy/Privicy';
import ForgetmobileForm from './components/login/ForgetpasswordMobile';
import Historysenariopage from './components/pages/Historysenariopage';
import Paymenthistory from './components/paymenthistory/paymenthistory';
import Refundpolicy from './components/privicy/Refund_policy';
import { AuthProvider} from './components/AuthContext';
import IdleTimeoutHandler from './components/IdleTimeoutHandler';
import Calscerification from './Landingpage/page/cals-cerification';
import Profile from './components/profile/profile';
import CaseListRedirect from './components/profile/CaseList';
import NotFound from './components/NotFound';
import PaymentSuccess from './components/subscribtion/success';
import Transactions from './components/subscribtion/Newpricepage';
import Prcing from './Landingpage/page/prcing';
import { ToastContainer } from 'react-toastify';
import Demofeature from './components/Demo/demo-feature';
import Index from './Landingpage/cource';
import Chaterone from './Landingpage/cource/chater/chaterone';
import Mycourse from './Landingpage/cource/chater/mycourse';
import Modulecourse from './Landingpage/cource/chater/modulecourse';
import Coursedetails from './Landingpage/cource/chater/coursedetails';
import Listing from './Landingpage/listing/listing';
import Listingview from './Landingpage/listing/listingview';
import ListingProfile from './components/profile/listingprofile';
import Template1 from './components/profile/template/template1';
import Template2 from './components/profile/template/template2';
import Template3 from './components/profile/template/template3';
import Template4 from './components/profile/template/template4';
import Template5 from './components/profile/template/template5';
import SEOHelmet from './components/SEOHelmet';
import { HelmetProvider } from 'react-helmet-async';
import Dpdpshield from './Landingpage/dpdp/index';
import Chathistory from './components/chathistory/chathistory';
import Legalreach from './Landingpage/page/feature/legalreach';
import Scenasirosolver from './Landingpage/page/feature/scenasiro'
import Legaldrafting from './Landingpage/page/feature/legaldrafting';
import Crossquestion from './Landingpage/page/feature/crossquestion';
import Judgmentfinder from './Landingpage/page/feature/judgmentfinder';
import DocumentIndex from './components/document/index';
import EcourtApp from './components/ecourt/EcourtApp';
import Marketplace from './components/marketplace/Marketplace';
import CitationsApp from './components/citations/CitationsApp';


const clearNonAuthData = async () => {
  const authCookieNames = ['token', 'auth', 'session', 'refresh', 'access', 'jwt', 'user'];

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim().toLowerCase();
    const isAuthCookie = authCookieNames.some((auth) => name.includes(auth));
    if (!isAuthCookie) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
  });

  // Cache clear pannunga
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
};

function App() {
 
  const [navVisible, setNavVisible] = useState(false);
  const location = useLocation();

 useEffect(() => {
    clearNonAuthData();
  }, []); 

  const pathsWithNavbar = useMemo(
    () => [
      '/chat',
      '/C/:session_id',
      '/ecourt',
      '/ecourt/:page',
      '/marketplace',
      '/citations',
      '/citations/:page',
    ],
    []
  );

  const shouldShowNavbar = useMemo(() => {
    return pathsWithNavbar.some((path) => {
      return path.includes(':')
        ? location.pathname.startsWith(path.split(':')[0])
        : path === location.pathname;
    });
  }, [location.pathname, pathsWithNavbar]);
  const PRIVATE_PATHS = useMemo(() => ([
    '/chat',
    '/C/:session_id',
    "/Subscription",
    "/Terms",
    "/payment-history",
    "/help&FAQ",
    "/caselist",
    "/profile",
    "/listingprofile",
    "/AI-Legal-Assistance",
    "/payment-success",
    "/Pricing",
    "/demo-feature",
    "/mycourse",
    "/mycourse/module/:id",
    "/mycourse/module/course",
    "/ecourt",
    "/ecourt/:page",
    "/marketplace",
    "/citations",
    "/citations/:page"

  ]), []);

  const isPrivateRoute = useMemo(() => {
    return PRIVATE_PATHS.some((routePath) => {
      if (routePath.includes(':')) {
        const base = routePath.split(':')[0];
        return location.pathname.startsWith(base);
      }
      return location.pathname === routePath;
    });
  }, [location.pathname, PRIVATE_PATHS]);

  useEffect(() => {

    if (isPrivateRoute) {
      // Remove script if it exists
      const scriptTagToRemove = document.getElementById('chatbox-script');
      const modalToRemove = document.getElementById('chatModal');
      const avatarToRemove = document.getElementsByClassName("avatar-logo-wb");
      if (modalToRemove && avatarToRemove.length) {
        modalToRemove.remove();
        avatarToRemove[0].remove();
      }
      if (scriptTagToRemove) {

        scriptTagToRemove.remove()
      }
    } else {
      const headTag = document.getElementsByTagName('head')[0];
      const scriptTag = document.createElement('script');
      // scriptTag.src = 'https://api.diginestai.org/chatbox.js/692a741f732d615de4df2860';
      scriptTag.src = 'https://api.diginestai.com/chatbox.js/68ecf3923eeb3e0237c19b1e';
      scriptTag.id = 'chatbox-script';
      scriptTag.async = true;
      scriptTag.crossOrigin = undefined;
      scriptTag.onload = () => {

        const domContentLoadedEvent = new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(domContentLoadedEvent);

      }
      headTag.appendChild(scriptTag);

    }
  }, [isPrivateRoute]);

  return (
    <>
    <SEOHelmet />
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      {shouldShowNavbar && <Navbar visible={navVisible}   show={setNavVisible} />}

      <Routes>
        
        <Route path="/" element={<LandingPage />} />
        <Route path="/ai-legal-research-software-chatbot-assistant-juristbot-ai" element={<Legalreach />} />
        <Route path="/ai-legal-scenario-solver-and-legal-case-analysis-juristbot-ai" element={<Scenasirosolver />} />
        <Route path="/ai-legal-drafting-software-chatbot-juristbot-ai" element={<Legaldrafting />} />
        <Route path="/ai-legal-cross-examination-chabot-juristbot-ai" element={<Crossquestion />} />
        <Route path="/ai-legal-judgment-finder-for-indian-case-law-juristbot-ai" element={<Judgmentfinder />} />
        <Route path="/template1/:userid" element={<Template1 />} />
        <Route path="/template2/:userid" element={<Template2 />} />
        <Route path="/template3/:userid" element={<Template3 />} />
        <Route path="/template4/:userid" element={<Template4 />} />
        <Route path="/template5/:userid" element={<Template5 />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/Subscription" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/price" element={<Prcing />} />
        <Route path="/Refundpolicy" element={<Refundpolicy />} />
        <Route path="/payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
        <Route path="/payment-history" element={<PrivateRoute><Paymenthistory navVisible={navVisible} show={setNavVisible} /></PrivateRoute>} />
        <Route path="/verifyotp" element={<Authenticateotp />} />
        <Route path="/forgetpassEmail" element={<ForgetEmailForm />} />
        <Route path="/forgetpassmobileOtp" element={<ForgetmobileForm />} />
        <Route path="/setpassword" element={<SetpasswordForm />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><DocumentIndex /></PrivateRoute>} />
        <Route path="/chathistory" element={<PrivateRoute><Chathistory /></PrivateRoute>} />
        <Route path="/listingProfile" element={<PrivateRoute><ListingProfile /></PrivateRoute>} />
        <Route path="/caselist" element={<PrivateRoute><CaseListRedirect /></PrivateRoute>} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/cals-certification-lawyers" element={<Calscerification />} />
        <Route path="/Privacy_Policy" element={<Privicy />} />
        <Route path="/demo-feature" element={<Demofeature />} />
        <Route path="/course" element={<Index />} />
        <Route path="/course/ai-Powered-drafting" element={<Chaterone />} />
        <Route path="/list-lawyers" element={<Listing />} />
        <Route path="/listingview/:id" element={<Listingview />} />
         <Route path="/dpdpshield" element={<Dpdpshield />} />
        <Route path="/mycourse" element={<PrivateRoute><Mycourse /></PrivateRoute>} />
        <Route path="/mycourse/module/:id" element={<PrivateRoute> <Modulecourse/></PrivateRoute>} />
         <Route path="/mycourse/module/course" element={<PrivateRoute><Coursedetails/></PrivateRoute>} />
        {/* Private Routes */}
        <Route path="/chat" element={<PrivateRoute><Scenario navVisible={navVisible} show={setNavVisible} /></PrivateRoute>} />

        {/* eCourts pages (sidebar → eCourts tab) */}
        <Route path="/ecourt/*" element={<PrivateRoute><EcourtApp /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/citations/*" element={<PrivateRoute><CitationsApp /></PrivateRoute>} />

        {/* History pages (also private) */}
        <Route path="/C/:session_id" element={<PrivateRoute><Historysenariopage navVisible={navVisible} show={setNavVisible} /> </PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function MainApp() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <IdleTimeoutHandler timeout={60 * 60 * 1000} />
        <App />
      </BrowserRouter>
    </AuthProvider>
   </HelmetProvider>
  );
}

export default MainApp;
