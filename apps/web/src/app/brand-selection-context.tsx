import { createContext, useContext, useState, type ReactNode } from "react";
import { useTenantContext } from "./tenant-context.js";
import { brandSelectionStorageKey } from "./brand-selection-model.js";

interface BrandSelectionState {
  selectedBrandId: string | null;
  selectBrand: (brandId: string) => void;
  clearBrand: () => void;
}

const BrandSelectionContext = createContext<BrandSelectionState | null>(null);

export function BrandSelectionProvider({ children }: { children: ReactNode }) {
  const { selectedTenantId } = useTenantContext();
  const [selection, setSelection] = useState<{
    tenantId: string;
    brandId: string | null;
  } | null>(null);
  const selectedBrandId = selectedTenantId
    ? selection?.tenantId === selectedTenantId
      ? selection.brandId
      : localStorage.getItem(brandSelectionStorageKey(selectedTenantId))
    : null;

  function selectBrand(brandId: string) {
    if (!selectedTenantId) return;
    localStorage.setItem(brandSelectionStorageKey(selectedTenantId), brandId);
    setSelection({ tenantId: selectedTenantId, brandId });
  }

  function clearBrand() {
    if (selectedTenantId) {
      localStorage.removeItem(brandSelectionStorageKey(selectedTenantId));
    }
    if (selectedTenantId) {
      setSelection({ tenantId: selectedTenantId, brandId: null });
    } else {
      setSelection(null);
    }
  }

  return (
    <BrandSelectionContext.Provider
      value={{ selectedBrandId, selectBrand, clearBrand }}
    >
      {children}
    </BrandSelectionContext.Provider>
  );
}

export function useBrandSelection(): BrandSelectionState {
  const context = useContext(BrandSelectionContext);
  if (!context) {
    throw new Error(
      "useBrandSelection must be used within BrandSelectionProvider",
    );
  }
  return context;
}
