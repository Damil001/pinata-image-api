# PDFThumbnail Component

A React component that generates thumbnails for PDF files using PDF.js in the browser.

## Features

- **Client-side PDF rendering**: Uses PDF.js to render PDF first page as thumbnail
- **Fallback handling**: Shows PDF icon if thumbnail generation fails
- **Responsive design**: Adapts to container dimensions
- **Click to open**: Clicking the thumbnail opens the PDF in a new tab
- **Loading states**: Shows loading animation while generating thumbnail
- **Error handling**: Graceful fallback with retry option

## Usage

```tsx
import PDFThumbnail from "@/components/atoms/PDFThumbnail";

<PDFThumbnail
  pdfUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  width={300}
  height={400}
  onLoad={() => console.log("Thumbnail loaded")}
  onError={() => console.log("Thumbnail failed")}
/>;
```

## Props

| Prop        | Type                | Required | Description                   |
| ----------- | ------------------- | -------- | ----------------------------- |
| `pdfUrl`    | string              | ✅       | URL to the PDF file           |
| `fileName`  | string              | ✅       | Name of the PDF file          |
| `className` | string              | ❌       | CSS class name                |
| `width`     | number              | ❌       | Thumbnail width               |
| `height`    | number              | ❌       | Thumbnail height              |
| `style`     | React.CSSProperties | ❌       | Inline styles                 |
| `onLoad`    | () => void          | ❌       | Callback when thumbnail loads |
| `onError`   | () => void          | ❌       | Callback when thumbnail fails |

## Dependencies

- `pdfjs-dist`: For PDF rendering
- React 18+

## Browser Support

- Modern browsers with Canvas support
- PDF.js compatibility
- ES6+ features

## Performance Notes

- Thumbnails are generated on-demand
- Canvas rendering is optimized for performance
- PDF.js worker is loaded from CDN
- Thumbnails are cached in component state
