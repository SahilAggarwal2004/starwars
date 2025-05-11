import { createContext, useContext, useState } from "react";

const Context = createContext();
export const useUtilityContext = () => useContext(Context);

const UtilityContext = ({ children }) => {
  const [modal, setModal] = useState({ active: false });

  return <Context.Provider value={{ modal, setModal }}>{children}</Context.Provider>;
};

export default UtilityContext;
