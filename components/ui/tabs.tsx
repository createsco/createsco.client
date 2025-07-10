import React, { ReactNode, useState } from "react";

interface TabsProps {
  /** Uncontrolled initial active value */
  defaultValue?: string;
  /** Controlled active value */
  value?: string;
  /** Controlled on change handler */
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

interface TabsListProps {
  className?: string;
  children: ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

interface TabsContextValue {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export const Tabs: React.FC<TabsProps> = ({ defaultValue = "", value, onValueChange, className, children }) => {
  const [internalActive, setInternalActive] = useState(defaultValue);

  const active = value !== undefined ? value : internalActive;
  const setActive = onValueChange ?? setInternalActive;

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ className = "", children }) => (
  <div className={`flex gap-2 border-b mb-4 ${className}`}>{children}</div>
);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const ctx = React.useContext(TabsContext)!;
  const isActive = ctx.active === value;
  return (
    <button
      className={`px-4 py-2 rounded-t-lg font-medium ${isActive ? "bg-gray-200 dark:bg-gray-700" : "bg-transparent"}`}
      onClick={() => ctx.setActive(value)}
      type="button"
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, className = "", children }) => {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.active !== value) return null;
  return <div className={className}>{children}</div>;
};
