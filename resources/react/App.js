import React, { Suspense, useEffect } from 'react'
import {  HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'


//testing
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels //ssss
);
//testing end

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Faq = React.lazy(() => import('./views/pages/help/faq'));
const TicketForm = React.lazy(() => import('./views/pages/help/TicketForm'));
const SendResetLink = React.lazy(() => import('./views/pages/Password/ResetLink'))
const Updatepassword = React.lazy(() => import('./views/pages/Password/updatePassword'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  
  useEffect(() => {
    // Set color mode
    setColorMode('light')

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-S86TN9FYMT';
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-S86TN9FYMT'); // Replace with your actual GA ID
    };

    // Cleanup function to remove script if component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />

          <Route exact path="/sendEmailForResetLink" name="Send Reset Link" element={<SendResetLink />} />
          <Route exact path="/updatepassword" name="Update password" element={<Updatepassword/>} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />

          {/* Help and Support Routes */}
          <Route exact path="/TicketForms" name="TicketForm" element={<TicketForm />} />
          <Route exact path="/faq" name="faq" element={<Faq />} />

        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App