import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isHomeReady, setIsHomeReady] = useState(false);
    const [homeData, setHomeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      console.log("Context - isHomeReady changed to:", isHomeReady); // Log 8
    }, [isHomeReady]);
  
    return (
      <AppContext.Provider value={{ 
        isHomeReady, 
        setIsHomeReady,
        homeData,
        setHomeData,
        isLoading,
        setIsLoading
      }}>
        {children}
      </AppContext.Provider>
    );
  };

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};