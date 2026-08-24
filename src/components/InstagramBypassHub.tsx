import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ExternalLink,
  Download,
  Chrome,
  Globe,
  Code2,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Info,
  Layers,
  FileCode2,
  Link,
  Compass
} from 'lucide-react';
import {
  getDirectDownloadBypassUrl,
  getChromeDeepLink,
  getAndroidChromeIntent,
  getOperaDeepLink,
  triggerBrowserBreakout,
  detectInAppBrowser
} from '../utils/browserBypass';

export const InstagramBypassHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'methods' | 'mobile_code' | 'bio_generator'>('overview');
  const [testUrl, setTestUrl] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://bbdecoration.com';
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customBioUrl, setCustomBioUrl] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://bbdecoration.com';
  });

  const browserInfo = detectInAppBrowser();

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      });
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://bbdecoration.com';
  const generatedDirectLink = `${currentHost}/api/open-external?url=${encodeURIComponent(customBioUrl)}`;
  const generatedChromeLink = `${currentHost}/open-in-chrome?url=${encodeURIComponent(customBioUrl)}`;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#8C1D18] to-[#5A0F12] rounded-2xl p-6 text-white shadow-md border border-[#D4B16A]/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4B16A]/20 border border-[#D4B16A]/50 text-[#D4B16A] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instagram In-App Browser Bypass Suite</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Instagram Webview Breakout & External Browser System
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Proven developer workarounds implemented to bypass Instagram's restricted in-app browser and open links directly in standard browsers like Google Chrome, Safari, and Opera.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3.5 text-xs text-center min-w-[200px]">
              <span className="text-white/70 block mb-1 text-[11px]">Current Browser Status</span>
              <div className="font-bold text-[#D4B16A] flex items-center justify-center gap-1.5 text-sm">
                <Compass className="w-4 h-4" />
                <span>{browserInfo.browserName}</span>
              </div>
              <span className="text-[10px] text-white/60 mt-1 block">
                {browserInfo.isInApp ? '⚠️ In-App Webview Active' : '✅ Standard Full Browser'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub navigation pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EADBCE] pb-3">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-[#8C1D18] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Overview & Live Tester
        </button>
        <button
          onClick={() => setActiveSubTab('methods')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'methods'
              ? 'bg-[#8C1D18] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Website Workarounds (3 Methods)
        </button>
        <button
          onClick={() => setActiveSubTab('mobile_code')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'mobile_code'
              ? 'bg-[#8C1D18] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Mobile App Code (React Native / Flutter / Swift / Kotlin)
        </button>
        <button
          onClick={() => setActiveSubTab('bio_generator')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'bio_generator'
              ? 'bg-[#8C1D18] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Instagram Bio Link Generator
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE TESTER */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick interactive test panel */}
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#8C1D18] flex items-center gap-2">
                <Play className="w-4 h-4 text-[#D4B16A]" />
                <span>Interactive Live Breakout Tester</span>
              </h3>
              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Test how each workaround behaves on your device
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full flex-1 px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-[#8C1D18]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Method 1 Live Trigger */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-[#FAF8F5] flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#8C1D18]" />
                    <span>Method 1: Direct Download Trigger</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Forces application/octet-stream header; kicks Instagram into Safari / Chrome.
                  </p>
                </div>
                <a
                  href={getDirectDownloadBypassUrl(testUrl)}
                  target="_system"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#8C1D18] text-white text-xs font-semibold hover:bg-[#701612] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Execute Download Bypass</span>
                </a>
              </div>

              {/* Method 2 Live Trigger */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-[#FAF8F5] flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Chrome className="w-3.5 h-3.5 text-blue-600" />
                    <span>Method 2: Chrome / Opera Scheme</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Triggers custom URL scheme (googlechromes:// or intent://).
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerBrowserBreakout({ url: testUrl, preferredBrowser: 'chrome' })}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Chrome className="w-3.5 h-3.5" />
                    <span>Chrome</span>
                  </button>
                  <button
                    onClick={() => triggerBrowserBreakout({ url: testUrl, preferredBrowser: 'opera' })}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <span>Opera</span>
                  </button>
                </div>
              </div>

              {/* Method 3 Live Trigger */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-[#FAF8F5] flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Method 3: target="_system"</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Signals embedded webview containers to delegate URL to native system browser.
                  </p>
                </div>
                <a
                  href={testUrl}
                  target="_system"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open target="_system"</span>
                </a>
              </div>
            </div>
          </div>

          {/* Key comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-[#8C1D18] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-xs text-gray-900">Direct Download Header</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <strong>Best Success Rate:</strong> Instagram tries to view pages internally, but forced file downloads are forbidden inside webview and immediately handed off to the OS.
              </p>
              <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                Active on server: /api/open-external
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-xs text-gray-900">Custom Deep Links</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Bypasses standard <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">https://</code> routing by invoking <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">googlechromes://</code> or Android <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">intent://</code>.
              </p>
              <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-md">
                Direct Scheme Support
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-xs text-gray-900">Webview Target Override</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Applies <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">target="_system"</code> across all outgoing links, inquiry buttons, and booking CTAs.
              </p>
              <div className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded-md">
                Native Target Applied
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE WORKAROUNDS CODE */}
      {activeSubTab === 'methods' && (
        <div className="space-y-6">
          {/* Method 1 Code & Explanation */}
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C1D18] tracking-wider">Method 1 (Best Success Rate)</span>
                <h3 className="text-sm font-bold text-gray-900">1. The Direct Download Trigger (Backend Header Workaround)</h3>
              </div>
              <button
                onClick={() => handleCopy(`// Express / Node.js Backend Trigger
app.get('/api/open-external', (req, res) => {
  const targetUrl = req.query.url || 'https://yourwebsite.com';
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="open-in-browser.html"');
  res.send(\`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=\${targetUrl}"><script>window.location.replace("\${targetUrl}");</script></head><body>Redirecting...</body></html>\`);
});`, 'method1_code')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium transition-colors cursor-pointer"
              >
                {copiedKey === 'method1_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'method1_code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Instagram's in-app browser tries to view webpages internally, but it forces files to open in an external browser. By forcing your link to behave like a file download using headers, you kick the user out into Chrome or Safari.
            </p>

            {/* PHP Backend Example (from screenshot) */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-700 block">• The Backend Code (PHP example from guide):</span>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`// Put this at the very top of your landing page index.php
if (strpos($_SERVER['HTTP_USER_AGENT'], 'Instagram') !== false) {
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="redirect.html"');
}`}
              </pre>
            </div>

            {/* Node / Express implementation */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-gray-700 block">• Node.js / Express Implementation (active on this server):</span>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`app.get('/api/open-external', (req, res) => {
  const targetUrl = (req.query.url as string) || '/';
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="open-in-browser.html"');
  res.send(\`<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=\${targetUrl}">
  <script>window.location.replace(\${JSON.stringify(targetUrl)});</script>
</head>
<body>Redirecting to standard web browser...</body>
</html>\`);
});`}
              </pre>
            </div>
          </div>

          {/* Method 2 Code */}
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Method 2</span>
                <h3 className="text-sm font-bold text-gray-900">2. Deep Linking Protocols (Custom URL Schemes)</h3>
              </div>
              <button
                onClick={() => handleCopy(`<a href="googlechrome://yourwebsite.com">Open in Chrome</a>
<a href="googlechromes://yourwebsite.com">Open in Chrome (SSL)</a>
<a href="opera://yourwebsite.com">Open in Opera</a>`, 'method2_code')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium transition-colors cursor-pointer"
              >
                {copiedKey === 'method2_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'method2_code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              You can force links to open using specific custom URL schemes of major browsers instead of generic <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">https://</code>.
            </p>

            <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`<!-- Force Google Chrome: Replace https:// with googlechrome:// in your anchor tag -->
<a href="googlechrome://yourwebsite.com">Open in Chrome</a>

<!-- Force Google Chrome (HTTPS secure): -->
<a href="googlechromes://yourwebsite.com">Open in Chrome</a>

<!-- Android Chrome Intent Protocol (100% Chrome force on Android): -->
<a href="intent://yourwebsite.com#Intent;scheme=https;package=com.android.chrome;end">Open in Chrome</a>

<!-- Force Opera: -->
<a href="opera://yourwebsite.com">Open in Opera</a>`}
            </pre>
          </div>

          {/* Method 3 Code */}
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Method 3</span>
                <h3 className="text-sm font-bold text-gray-900">3. The _system Target Attribute</h3>
              </div>
              <button
                onClick={() => handleCopy(`<a href="https://yourwebsite.com" target="_system">Open in Default Browser</a>`, 'method3_code')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-medium transition-colors cursor-pointer"
              >
                {copiedKey === 'method3_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'method3_code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              If you are generating a link inside a web view or hybrid app wrapped by Instagram features, make sure your anchor tags strictly use the native system target:
            </p>

            <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`<a href="https://yourwebsite.com" target="_system">Open in Default Browser</a>`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: MOBILE APPS CODE (React Native / Flutter / Swift / Kotlin) */}
      {activeSubTab === 'mobile_code' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C1D18] tracking-wider">Mobile App Developers</span>
              <h3 className="text-sm font-bold text-gray-900">
                📱 Native App Controllers (React Native, Flutter, Swift, Kotlin)
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                If you are developing a mobile application and notice embedded webviews wrap shared links incorrectly, use native controllers to cleanly open the system browser.
              </p>
            </div>

            {/* React Native */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>React Native</span>
                </span>
                <button
                  onClick={() => handleCopy(`import { Linking } from 'react-native';

const openExternalLink = async (url) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    // This forces the OS to launch the default phone browser
    await Linking.openURL(url);
  }
};`, 'rn_code')}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'rn_code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`import { Linking } from 'react-native';

const openExternalLink = async (url) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    // This forces the OS to launch the default phone browser
    await Linking.openURL(url);
  }
};`}
              </pre>
            </div>

            {/* Flutter */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Flutter</span>
                </span>
                <button
                  onClick={() => handleCopy(`import 'package:url_launcher/url_launcher.dart';

Future<void> _launchInBrowser(Uri url) async {
  if (!await launchUrl(
    url,
    // Forces the OS to bypass in-app views
    mode: LaunchMode.externalApplication,
  )) {
    throw Exception('Could not launch \$url');
  }
}`, 'flutter_code')}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'flutter_code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`import 'package:url_launcher/url_launcher.dart';

Future<void> _launchInBrowser(Uri url) async {
  if (!await launchUrl(
    url,
    // Forces the OS to bypass in-app views
    mode: LaunchMode.externalApplication,
  )) {
    throw Exception('Could not launch \$url');
  }
}`}
              </pre>
            </div>

            {/* Swift iOS */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>iOS (Swift)</span>
                </span>
                <button
                  onClick={() => handleCopy(`if let url = URL(string: "https://bbdecoration.com") {
    UIApplication.shared.open(url, options: [:], completionHandler: nil)
}`, 'swift_code')}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'swift_code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`if let url = URL(string: "https://bbdecoration.com") {
    UIApplication.shared.open(url, options: [:], completionHandler: nil)
}`}
              </pre>
            </div>

            {/* Kotlin Android */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Android (Kotlin)</span>
                </span>
                <button
                  onClick={() => handleCopy(`val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://bbdecoration.com"))
context.startActivity(browserIntent)`, 'kotlin_code')}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'kotlin_code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
{`val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://bbdecoration.com"))
context.startActivity(browserIntent)`}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: INSTAGRAM BIO LINK GENERATOR */}
      {activeSubTab === 'bio_generator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-[#EADBCE] shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C1D18] tracking-wider">Instagram Growth Tool</span>
              <h3 className="text-sm font-bold text-gray-900">
                Instagram Bio & Story Link Generator with Auto-Breakout
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Paste your landing page URL below to generate optimized links for your Instagram Bio, Story swipe-ups, or DM automated messages that trigger the external browser workaround.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Target Website URL</label>
              <input
                type="text"
                value={customBioUrl}
                onChange={(e) => setCustomBioUrl(e.target.value)}
                placeholder="https://bbdecoration.com"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#8C1D18]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option A: Direct Download Header Link */}
              <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF8F5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#8C1D18]" />
                    <span>Option 1: Direct Download Bypass Link (Recommended)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Highest Success
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-[11px] font-mono break-all text-gray-700">
                  {generatedDirectLink}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(generatedDirectLink, 'bio_direct')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#8C1D18] text-white text-xs font-semibold hover:bg-[#701612] transition-colors cursor-pointer"
                  >
                    {copiedKey === 'bio_direct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bio_direct' ? 'Copied to Clipboard' : 'Copy Bio Link'}</span>
                  </button>
                  <a
                    href={generatedDirectLink}
                    target="_system"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Option B: Chrome Direct Link */}
              <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF8F5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Chrome className="w-3.5 h-3.5 text-blue-600" />
                    <span>Option 2: Direct Chrome Launch Link</span>
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Chrome Targeted
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-[11px] font-mono break-all text-gray-700">
                  {generatedChromeLink}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(generatedChromeLink, 'bio_chrome')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'bio_chrome' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bio_chrome' ? 'Copied to Clipboard' : 'Copy Chrome Link'}</span>
                  </button>
                  <a
                    href={generatedChromeLink}
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Pro-Tip for Instagram Bio & Stories:</strong> Use <strong>Option 1 (Direct Download Link)</strong> as your primary link in bio or Linktree alternative. When an Instagram user clicks it, the server immediately sends the file attachment header, causing iOS and Android to kick the user out of the in-app webview straight into Safari or Chrome with zero friction!
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
