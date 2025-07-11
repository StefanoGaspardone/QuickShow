import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App.jsx';

import { AppProvider } from './contexts/AppContext.jsx';

import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if(!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ClerkProvider publishableKey = { PUBLISHABLE_KEY } afterSignOutUrl = '/'>
			<BrowserRouter>
				<AppProvider>
					<App/>
				</AppProvider>
			</BrowserRouter>
		</ClerkProvider>
	</StrictMode>,
);