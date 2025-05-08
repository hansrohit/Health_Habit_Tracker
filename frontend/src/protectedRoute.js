import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
const ProtectedRoute = ({ children }) => {
  const { userToken } = useSelector((state) => state.auth);

  if (!userToken) {
    return React.createElement(Navigate, { to: "/login" });
  }

  return children;
};

export default ProtectedRoute;
