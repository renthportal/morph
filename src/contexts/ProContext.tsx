import React, { createContext, useContext, useState } from 'react';

interface ProContextType {
  isPro: boolean;
  setPro: (value: boolean) => void;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  setPro: () => {},
});

export const usePro = () => useContext(ProContext);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setPro] = useState(false);

  return (
    <ProContext.Provider value={{ isPro, setPro }}>
      {children}
    </ProContext.Provider>
  );
}
