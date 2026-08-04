import React from "react";
import {useSelector} from "react-redux";
import {Navigate} from "react-router-dom";
import Loader from "../layout/Loader";

const ProtectedRoute = ({ admin, children }) => {

    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase?.();
    
    
    if(loading) return <Loader />;


                if(!isAuthenticated) {
                    return <Navigate to="/login" replace />;
                }

    if(admin && userRole !== "admin") {
        return <Navigate to="/" replace />;
    }            

    return children;
    
};

export default ProtectedRoute;