import "./App.css";

import {Route, BrowserRouter as Router, Routes,} from "react-router-dom";



import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import userUserRoutes from "./components/routes/userRoutes";
import userAdminRoutes from "./components/routes/adminRoutes";
import NotFound from "./components/layout/NotFound";
 




function App() {

  const userRoutes = userUserRoutes();
  const adminRoutes = userAdminRoutes();

  return (
    <Router> 
    <div className="App">
      <Toaster position="top-center" />
      <Header />

      

      <div className= "col-12 col-sm-6 col-md-12" >
      <div className="container"> 
      <Routes> 

        {userRoutes} {adminRoutes} <Route  path="*" element={<NotFound />} />  

        

      </Routes>
      
       
          </div>
       </div>
       
     
       
      

     
      

      <Footer />
      
    </div>
    </Router>
  );
};

export default App;
