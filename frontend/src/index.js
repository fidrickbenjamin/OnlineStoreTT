import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { Provider } from "react-redux";
import { store } from './redux/store';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> 

               <PayPalScriptProvider
        options={{
          "client-id": "ARi7SuAhS8m8CEw6CU-YNXcehZBt83cyyE27RCwKvVdW_tykWQEqpsmbBdvepVGCa2itqafM3LKGEQbV",
          currency: "USD",
        }}
      > 
      <App />

      </PayPalScriptProvider>

    </Provider>
    
  </React.StrictMode>
);


