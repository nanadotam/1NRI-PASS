import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert file to base64
export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

// Generate QR code SVG using a simple pattern
export const generateQRCodeSVG = (text: string, size: number = 170): string => {
  // Create a simple QR-like pattern for now
  // In production, you'd use a proper QR library like qrcode
  const pattern = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <rect x="10" y="10" width="150" height="150" fill="black"/>
      <rect x="20" y="20" width="130" height="130" fill="white"/>
      <rect x="30" y="30" width="110" height="110" fill="black"/>
      <rect x="40" y="40" width="90" height="90" fill="white"/>
      <rect x="50" y="50" width="70" height="70" fill="black"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8" fill="white">QR</text>
    </svg>
  `
  return pattern
}
