import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'src/App.tsx'
import 'src/styles/index.css'
import { BrowserRouter } from "react-router-dom";
import '@mantine/notifications/styles.css';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
  </React.StrictMode>,
)
