import React from 'react';
 import ReactDOM from 'react-dom/client'; 
 import {Provider} from 'react-redux'; 
 import {store} from './app/store'; 
 import AppRoutes from './routes/AppRoutes'; 
 import './index.css'; 

 // 1. Import your favicon file from the assets folder
import customFavicon from './assets/favicon.ico'; 


// 2. Cast the querySelector as an HTMLLinkElement
let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;

if (!link) {
  // 3. Cast the newly created element as an HTMLLinkElement
  link = document.createElement('link') as HTMLLinkElement;
  link.rel = 'icon';
  document.head.appendChild(link);
}

// 4. TypeScript now knows 'href' is perfectly safe to use here
link.href = customFavicon;


ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>
    <Provider store={store}>
        <AppRoutes/>
    </Provider>
</React.StrictMode>);
