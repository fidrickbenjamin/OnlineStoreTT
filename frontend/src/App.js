import React from "react";
import SeasonalStorefront from "./components/seasonal/SeasonalStorefront";
import Loader from "./components/layout/Loader";
import "./App.css";

import {Route, BrowserRouter as Router, Routes,} from "react-router-dom";



import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import userUserRoutes from "./components/routes/userRoutes";
import userAdminRoutes from "./components/routes/adminRoutes";
import NotFound from "./components/layout/NotFound";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';


 




function App() {

  const userRoutes = userUserRoutes();
  const adminRoutes = userAdminRoutes();

  return (
    <Router> 
    <div className="App">
      <Toaster position="top-center" />
      <SeasonalStorefront header={<Header />} footer={<Footer />}>

      

      <div className= "col-12" >
      <div className="container"> 
      <React.Suspense fallback={<Loader />}><Routes> 

        {userRoutes} {adminRoutes} <Route  path="*" element={<NotFound />} />  

        

      </Routes></React.Suspense>
      
       
          </div>
       </div>
       
     
       
      

     
      

      </SeasonalStorefront>
      
    </div>
    </Router>
  );
};

export default App;
