/**
 * Triggers a direct native browser download for any Blob without third-party library dependencies.
 * Fully compatible with all modern desktop and mobile browsers, iframe sandboxes, and web apps.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Check for Microsoft IE/old Edge legacy method
  const nav = window.navigator as unknown as { msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean };
  if (nav && typeof nav.msSaveOrOpenBlob === 'function') {
    nav.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.style.position = 'fixed';
  link.style.left = '-9999px';
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  link.rel = 'noopener';

  document.body.appendChild(link);
  
  try {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  } catch {
    link.click();
  }

  window.setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }, 1500);
}
