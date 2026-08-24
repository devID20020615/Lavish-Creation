/**
 * Browser Bypass & In-App Webview Breakout Utility
 * Implements developer workarounds for bypassing Instagram's in-app browser
 * and opening links directly in standard browsers (Chrome, Safari, Opera).
 */

export interface InAppBrowserInfo {
  isInApp: boolean;
  isInstagram: boolean;
  isFacebook: boolean;
  isTikTok: boolean;
  isLine: boolean;
  isTwitter: boolean;
  browserName: string;
  isAndroid: boolean;
  isiOS: boolean;
}

/**
 * Detects if the current user is viewing inside an In-App browser (Instagram, FB, etc.)
 */
export function detectInAppBrowser(): InAppBrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isInApp: false,
      isInstagram: false,
      isFacebook: false,
      isTikTok: false,
      isLine: false,
      isTwitter: false,
      browserName: 'Unknown',
      isAndroid: false,
      isiOS: false,
    };
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isInstagram = /Instagram/i.test(ua);
  const isFacebook = /FBAN|FBAV|FB_IAB/i.test(ua);
  const isTikTok = /musical_ly|ByteLocale|ByteFullConfig|TikTok/i.test(ua);
  const isLine = /Line\//i.test(ua);
  const isTwitter = /Twitter/i.test(ua);
  const isMicroMessenger = /MicroMessenger/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);

  const isInApp = isInstagram || isFacebook || isTikTok || isLine || isTwitter || isMicroMessenger || isSnapchat;

  const isAndroid = /Android/i.test(ua);
  const isiOS = /iPhone|iPad|iPod/i.test(ua);

  let browserName = 'Standard Browser';
  if (isInstagram) browserName = 'Instagram In-App Browser';
  else if (isFacebook) browserName = 'Facebook In-App Browser';
  else if (isTikTok) browserName = 'TikTok In-App Browser';
  else if (isLine) browserName = 'Line In-App Browser';
  else if (isTwitter) browserName = 'Twitter/X In-App Browser';
  else if (isSnapchat) browserName = 'Snapchat In-App Browser';

  return {
    isInApp,
    isInstagram,
    isFacebook,
    isTikTok,
    isLine,
    isTwitter,
    browserName,
    isAndroid,
    isiOS,
  };
}

/**
 * Strips protocol (http:// or https://) for deep link schemes
 */
export function getUrlWithoutProtocol(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return target.replace(/^https?:\/\//i, '');
}

/**
 * 1. Direct Download Trigger URL (Backend Content-Disposition Workaround)
 */
export function getDirectDownloadBypassUrl(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '/');
  return `/api/open-external?url=${encodeURIComponent(target)}`;
}

/**
 * 2. Deep Linking Protocols
 */

// Google Chrome custom scheme (iOS & Android)
export function getChromeDeepLink(url?: string): string {
  const raw = getUrlWithoutProtocol(url);
  return `googlechromes://${raw}`;
}

// Android Chrome Intent URL (forces Android to open in Google Chrome app)
export function getAndroidChromeIntent(url?: string): string {
  const raw = getUrlWithoutProtocol(url);
  return `intent://${raw}#Intent;scheme=https;package=com.android.chrome;end`;
}

// Opera custom scheme
export function getOperaDeepLink(url?: string): string {
  const raw = getUrlWithoutProtocol(url);
  return `opera://${raw}`;
}

// Firefox custom scheme
export function getFirefoxDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `firefox://open-url?url=${encodeURIComponent(target)}`;
}

// Microsoft Edge custom scheme
export function getEdgeDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `microsoft-edge-${target}`;
}

/**
 * Automatically detects Android or iOS and triggers the most effective
 * breakout method to open in external browser with one click.
 */
export function openInDeviceBrowser(url?: string): void {
  if (typeof window === 'undefined') return;

  const targetUrl = url || window.location.href;
  const info = detectInAppBrowser();

  try {
    if (info.isAndroid) {
      // Android: First try Android Chrome Intent which directly opens Google Chrome
      const raw = getUrlWithoutProtocol(targetUrl);
      const chromeIntent = `intent://${raw}#Intent;scheme=https;package=com.android.chrome;end`;
      
      // Attempt intent navigation
      window.location.href = chromeIntent;

      // Fallback: If intent doesn't trigger within 1 sec, trigger download bypass
      setTimeout(() => {
        const downloadUrl = getDirectDownloadBypassUrl(targetUrl);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_system';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);
    } else if (info.isiOS) {
      // iOS (iPhone/iPad): Method 1 (Direct Download header) has the highest breakout rate on iOS Instagram
      // It forces Safari to intercept the download file and open externally.
      const downloadUrl = getDirectDownloadBypassUrl(targetUrl);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_system';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback to location href
      setTimeout(() => {
        window.location.href = downloadUrl;
      }, 300);
    } else {
      // Desktop / Other: Trigger direct download bypass or system target
      const downloadUrl = getDirectDownloadBypassUrl(targetUrl);
      window.location.href = downloadUrl;
    }
  } catch (err) {
    console.error('Error opening in device browser:', err);
    // Universal fallback
    window.location.href = getDirectDownloadBypassUrl(targetUrl);
  }
}

/**
 * Optional method-specific trigger for testing in Admin Hub
 */
export function triggerBrowserBreakout(options?: {
  url?: string;
  preferredBrowser?: 'chrome' | 'opera' | 'download_trigger' | 'system' | 'auto';
}): boolean {
  const targetUrl = options?.url || (typeof window !== 'undefined' ? window.location.href : '');
  const preferred = options?.preferredBrowser || 'auto';
  
  if (preferred === 'auto') {
    openInDeviceBrowser(targetUrl);
    return true;
  }
  
  if (preferred === 'download_trigger') {
    if (typeof window !== 'undefined') window.location.href = getDirectDownloadBypassUrl(targetUrl);
    return true;
  }
  
  if (preferred === 'chrome') {
    const info = detectInAppBrowser();
    if (typeof window !== 'undefined') {
      if (info.isAndroid) {
        window.location.href = getAndroidChromeIntent(targetUrl);
      } else {
        window.location.href = getChromeDeepLink(targetUrl);
      }
    }
    return true;
  }
  
  if (preferred === 'opera') {
    if (typeof window !== 'undefined') window.location.href = getOperaDeepLink(targetUrl);
    return true;
  }

  openInDeviceBrowser(targetUrl);
  return true;
}


