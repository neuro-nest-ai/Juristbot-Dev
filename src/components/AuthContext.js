import React, { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const decodedToken = jwtDecode(token);
    return {
      id: decodedToken.id,
      username: decodedToken.username,
      mobile_no: decodedToken.mobile_no,
      role: decodedToken.role,
      email: decodedToken.email,
      state: decodedToken.state || "None",
      town: decodedToken.town,
      sub_status: decodedToken.sub_status,
      sub_end: decodedToken.sub_end,
      sub_id: decodedToken.sub_id,
      short_url: decodedToken.short_url,
      plan_id: decodedToken.plan_id,
      features: decodedToken.features,
      rp_sub_id: decodedToken.rp_sub_id,
      trail: decodedToken.trial,
      activeplan:decodedToken.activeplan,
      oldchat:decodedToken.oldchat,
      free_tier:decodedToken.free_tier
    };
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("authToken"); 
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("authToken");
    return decodeToken(token);
  });

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setUser(decodeToken(token));
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};