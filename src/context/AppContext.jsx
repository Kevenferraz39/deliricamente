import React from 'react';
export const AppContext = React.createContext(null);
export const useApp = () => React.useContext(AppContext);
