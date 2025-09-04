# PDF Viewer Components

This directory contains React components for displaying PDFs in a user-friendly way without relying on problematic iframes.

## Components

### SimplePDFDisplay ⭐ **Recommended**

A simple, reliable PDF display component that shows a PDF icon, filename, and provides easy access to open or download the PDF.

**Features:**

- **No iframe issues** - Works reliably across all browsers
- **Clean UI** - Professional PDF icon and filename display
- **Multiple actions** - Click to open in new tab or download directly
- **Responsive design** - Works perfectly on mobile and desktop
- **Hover effects** - Smooth animations and visual feedback

**Props:**

- `pdfUrl: string` - The URL of the PDF to display
- `fileName: string` - The name of the PDF file
- `className?: string` - Optional CSS class
- `style?: React.CSSProperties` - Optional inline styles
- `height?: string | number` - Height of the container (default: "100%")
- `width?: string | number` - Width of the container (default: "100%")

**Usage:**

```tsx
import SimplePDFDisplay from "@/components/atoms/PDFViewer/SimplePDFDisplay";

<SimplePDFDisplay
  pdfUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  height="100%"
  width="100%"
/>;
```

## How It Works

1. **PDF Icon Display** - Shows a large PDF icon (📄) with red color
2. **Filename Display** - Shows the PDF filename clearly
3. **Click to Open** - Clicking anywhere opens the PDF in a new browser tab
4. **Download Option** - Separate download button for direct file download
5. **Hover Effects** - Smooth scaling and color changes on hover

## Benefits Over Iframes

1. **No Browser Blocking** - Works in all browsers without security restrictions
2. **Better Performance** - No heavy iframe loading
3. **Consistent Experience** - Same behavior across all devices and browsers
4. **User-Friendly** - Clear instructions and multiple access options
5. **Mobile Optimized** - Touch-friendly and responsive design
6. **Accessibility** - Proper ARIA labels and keyboard navigation

## Implementation Notes

- Uses CSS modules for clean, maintainable styling
- No external dependencies required
- Includes proper TypeScript types
- Follows React best practices
- Mobile-responsive design included

## Files

```
frontend/src/components/atoms/PDFViewer/
├── SimplePDFDisplay.tsx              # Main component
├── SimplePDFDisplay.module.css       # Styling
└── README.md                         # This documentation
```

## User Experience

When users encounter a PDF in your application:

- They see a clear PDF icon and filename
- They can click to open the PDF in a new tab (most common action)
- They can download the PDF directly if needed
- No more "This page has been blocked by Chrome" errors
- Works consistently across all browsers and devices
