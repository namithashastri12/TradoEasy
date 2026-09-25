import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Key,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Server,
  RefreshCw,
  Power
} from 'lucide-react';
import { AppMode } from '../types/market';

interface FyersAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppMode;
  onModeChange?: (newMode: AppMode) => void;
}

interface AuthStatusData {
  authenticated: boolean;
  mode: string;
  user?: string;
  fy_id?: string;
  message?: string;
}

export const FyersAuthModal: React.FC<FyersAuthModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'token' | 'oauth' | 'server'>('token');
  const [tokenInput, setTokenInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [redirectUri, setRedirectUri] = useState('https://trade.fyers.in/api-login/redirect-uri/index.html');
  const [authCode, setAuthCode] = useState('');
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('tradoeasy_backend_url') || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://unstopped-anthem-bullfrog.ngrok-free.dev' : '');
  });

  const [authStatus, setAuthStatus] = useState<AuthStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch status on modal open
  const checkStatus = async () => {
    try {
      setLoading(true);
      const baseUrl = serverUrl.trim() || '';
      const res = await fetch(`${baseUrl}/api/auth/status`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
      } else {
        setAuthStatus({
          authenticated: false,
          mode: currentMode,
          message: 'Backend not reachable or not configured',
        });
      }
    } catch {
      setAuthStatus({
        authenticated: false,
        mode: currentMode,
        message: 'Could not connect to backend API',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle direct token submission
  const handleSetDirectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid FYERS access token.' });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const baseUrl = serverUrl.trim() || '';
      const res = await fetch(`${baseUrl}/api/auth/direct-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'FYERS Token saved successfully! Live mode activated.' });
        setTokenInput('');
        await checkStatus();
        if (onModeChange) onModeChange('LIVE');
      } else {
        setFeedback({ type: 'error', message: data.detail || data.message || 'Failed to update token.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error connecting to backend.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth code exchange
  const handleExchangeAuthCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode.trim()) {
      setFeedback({ type: 'error', message: 'Please paste the authorization code from FYERS.' });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const baseUrl = serverUrl.trim() || '';
      const res = await fetch(`${baseUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ auth_code: authCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'FYERS authenticated successfully!' });
        setAuthCode('');
        await checkStatus();
        if (onModeChange) onModeChange('LIVE');
      } else {
        setFeedback({ type: 'error', message: data.detail || data.message || 'Token exchange failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening OAuth login page
  const handleOpenLoginUrl = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const baseUrl = serverUrl.trim() || '';

      // Save credentials first if provided
      if (clientId.trim() || secretKey.trim()) {
        await fetch(`${baseUrl}/api/auth/credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            client_id: clientId.trim(),
            secret_key: secretKey.trim(),
            redirect_uri: redirectUri.trim() || 'https://trade.fyers.in/api-login/redirect-uri/index.html'
          }),
        });
      }

      const res = await fetch(`${baseUrl}/api/auth/url`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (res.ok && data.auth_url) {
        window.open(data.auth_url, '_blank');
        setFeedback({
          type: 'success',
          message: 'FYERS login opened in new tab. After approving, paste the received auth code below.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.detail || 'Make sure Client ID and Secret Key are configured.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error generating FYERS login URL.' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Mode (LIVE vs DEMO)
  const handleToggleMode = async (targetMode: 'LIVE' | 'DEMO') => {
    try {
      setLoading(true);
      setFeedback(null);
      const baseUrl = serverUrl.trim() || '';
      const res = await fetch(`${baseUrl}/api/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `Switched system mode to ${targetMode} successfully!` });
        await checkStatus();
        if (onModeChange) onModeChange(targetMode);
      } else {
        setFeedback({
          type: 'error',
          message: data.detail || `Cannot switch to ${targetMode}. Ensure FYERS credentials are valid.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to switch mode.' });
    } finally {
      setLoading(false);
    }
  };

  // Save backend URL
  const handleSaveServerUrl = () => {
    const clean = serverUrl.trim().replace(/\/+$/, '');
    if (clean) {
      localStorage.setItem('tradoeasy_backend_url', clean);
    } else {
      localStorage.removeItem('tradoeasy_backend_url');
    }
    setFeedback({ type: 'success', message: 'Backend URL updated! Re-checking connection...' });
    checkStatus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0E131F] border border-[#232C42] rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232C42] flex items-center justify-between bg-[#121826]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                FYERS Real-Time Trading Feed
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-300 font-mono">
                  API V3
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Stream real-time Indian NSE market ticks directly to TradoEasy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E263C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-6 py-3 bg-[#161C2D]/60 border-b border-[#232C42] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Status:</span>
            {authStatus?.authenticated ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/80 text-emerald-300 text-xs font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AUTHENTICATED ({authStatus.user || authStatus.fy_id || 'FYERS'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/80 text-amber-300 text-xs font-mono font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                SIMULATION / DEMO MODE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleMode(currentMode === 'LIVE' ? 'DEMO' : 'LIVE')}
              disabled={loading}
              title="Toggle Live / Demo"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                currentMode === 'LIVE'
                  ? 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-600/60 text-amber-300'
                  : 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-600/60 text-emerald-300'
              }`}
            >
              <Power className="w-3 h-3" />
              {currentMode === 'LIVE' ? 'Switch to Demo' : 'Switch to Live'}
            </button>
            <button
              onClick={checkStatus}
              disabled={loading}
              title="Refresh status"
              className="p-1 rounded bg-[#161C2D] border border-[#232C42] text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                : 'bg-red-950/60 border-red-700/80 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#232C42]">
          <button
            onClick={() => setActiveTab('token')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'token'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Direct Access Token
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'oauth'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            OAuth 2.0 Login
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'server'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Backend API URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* TAB 1: Direct Token */}
          {activeTab === 'token' && (
            <form onSubmit={handleSetDirectToken} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  FYERS API V3 Access Token:
                </label>
                <textarea
                  rows={3}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste your daily FYERS Access Token here (from developer dashboard or API script)..."
                  className="w-full bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 In Indian markets, daily FYERS tokens expire after market closing. Pasting a valid token immediately connects the real-time WebSocket for all 200 NSE stocks.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Validating Token...' : 'Connect Live Market Data'}
              </button>
            </form>
          )}

          {/* TAB 2: OAuth 2.0 Flow */}
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    FYERS App ID (Client ID):
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. XC12345-100"
                    className="w-full bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Secret Key:
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="FYERS App Secret"
                    className="w-full bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Redirect URL (Must match FYERS dashboard):
                </label>
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  placeholder="https://trade.fyers.in/api-login/redirect-uri/index.html"
                  className="w-full bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOpenLoginUrl}
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  1. Launch FYERS Login
                </button>
              </div>

              <form onSubmit={handleExchangeAuthCode} className="space-y-3 pt-2 border-t border-[#232C42]">
                <label className="block text-xs font-mono text-slate-300">
                  2. Paste Received Authorization Code (auth_code):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Paste auth_code from redirect URL..."
                    className="flex-1 bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !authCode.trim()}
                    className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Backend Server URL */}
          {activeTab === 'server' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Backend API & WebSocket Server Endpoint:
                </label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="e.g. http://localhost:8000 (leave blank to use current origin)"
                  className="w-full bg-[#161C2D] border border-[#232C42] focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  When viewing the Vercel-hosted frontend, you can point this to your local running Python backend (<code className="text-blue-300">http://localhost:8000</code>) or your cloud backend to get live FYERS WebSocket streaming!
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium transition-colors"
                >
                  Save Endpoint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServerUrl('');
                    localStorage.removeItem('tradoeasy_backend_url');
                    checkStatus();
                  }}
                  className="py-2 px-3 rounded-lg bg-[#1E263C] hover:bg-[#2A3450] text-slate-300 text-xs font-mono transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#232C42] bg-[#121826] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>TradoEasy 200-Stock Live Engine</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#161C2D] hover:bg-[#1E263C] text-slate-200 border border-[#232C42]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
