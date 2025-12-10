
import * as React from "react";
import { createContext, useCallback, useContext } from "react";

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // console.log('WidgetProvider initialized');

  const refreshWidget = useCallback(() => {
    // console.log('Widget refresh requested');
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    // console.log('useWidget called outside of WidgetProvider, returning default');
    return { refreshWidget: () => {} };
  }
  return context;
};
