import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

const theme = createTheme({
  primaryColor: 'orange',
  fontFamily: 'Outfit, sans-serif',
  headings: {
    fontFamily: 'Outfit, sans-serif',
  },
  defaultRadius: 'md',
})

const getDynamicBasename = () => {
  const pathname = window.location.pathname;
  const index = pathname.indexOf('/react');
  if (index !== -1) {
    return pathname.substring(0, index + 6);
  }
  return '';
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getDynamicBasename()}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" zIndex={1000} />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
)
