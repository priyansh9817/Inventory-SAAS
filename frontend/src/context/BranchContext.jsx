import { createContext, useState, useEffect } from "react";

export const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [branchId, setBranchId] = useState(
    localStorage.getItem("branchId") || ""
  );

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (branchId) {
      localStorage.setItem("branchId", branchId);
    }
  }, [branchId]);

  return (
    <BranchContext.Provider
      value={{ branchId, setBranchId, branches, setBranches }}
    >
      {children}
    </BranchContext.Provider>
  );
};