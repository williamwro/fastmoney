
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add global declaration for window.exportBillsToPDF
declare global {
  interface Window {
    exportBillsToPDF: () => void;
  }
}
