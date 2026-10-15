import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Fingerprint,
  Globe,
  KeyRound,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
})

export function SignInComponent() {
  const [authMode, setAuthMode] = useState<'credentials' | 'sso'>('credentials')
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [ssoDomain, setSsoDomain] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Interactive sandbox state for the 4 bento feature cards
  const [tile1Angle, setTile1Angle] = useState(15)
  const [tile1X, setTile1X] = useState('50%')
  const [activeGesture, setActiveGesture] = useState<'hover' | 'press' | 'drag'>('hover')
  const [copiedKey, setCopiedKey] = useState(false)

  const handleCopyHash = () => {
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 1800)
  }

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-neutral-200 font-sans selection:bg-[#FFE500] selection:text-black flex flex-col justify-between overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION / STATUS BAR (MOTION REFERENCE STYLE)
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full bg-[#FFE500] text-black border-b border-[#08090C] px-4 md:px-8 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 group cursor-pointer">
            <div className="flex items-center space-x-0.5">
              <span className="w-1.5 h-4.5 bg-black inline-block transform -skew-x-12" />
              <span className="w-1.5 h-4.5 bg-black inline-block transform -skew-x-12" />
              <span className="w-1.5 h-4.5 bg-black inline-block transform -skew-x-12" />
            </div>
            <span className="font-extrabold text-lg tracking-tight uppercase">
              Kizen
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-black/20 text-xs font-mono font-medium tracking-wide">
            <span className="w-2 h-2 bg-black inline-block animate-pulse-subtle" />
            <span>SYSTEM_NODE: 01-EDGE</span>
            <span className="text-black/50">/</span>
            <span>AUTH_STATUS: ENFORCED</span>
          </div>
        </div>

        <nav className="flex items-center space-x-4 md:space-x-8 text-xs font-mono font-bold tracking-wider">
          <button
            type="button"
            className="hover:underline transition-all hidden sm:inline-block cursor-pointer"
          >
            DOCS
          </button>
          <button
            type="button"
            className="hover:underline transition-all hidden sm:inline-block cursor-pointer"
          >
            PROTOCOLS
          </button>
          <button
            type="button"
            className="hover:underline transition-all hidden md:inline-block cursor-pointer"
          >
            TELEMETRY
          </button>
          <button
            type="button"
            className="hover:underline transition-all hidden md:inline-block cursor-pointer"
          >
            STUDIO
          </button>

          <div className="flex items-center space-x-2 pl-2">
            <button
              type="button"
              className="p-1.5 hover:bg-black/10 transition-colors cursor-pointer"
              aria-label="Search documentation"
            >
              <Search className="w-4 h-4 text-black" />
            </button>
            <div className="bg-black text-[#FFE500] px-3 py-1 font-mono text-[11px] font-black uppercase tracking-widest border border-black hover:bg-neutral-900 transition-colors cursor-pointer">
              SYS.SECURE
            </div>
          </div>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. STRICT 5-COLUMN FEATURE / METRIC BAR (BORDERED MATRIX)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full border-b border-neutral-800 bg-[#0C0E12] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-left divide-y md:divide-y-0 md:divide-x divide-neutral-800">
        <div className="p-4 md:p-5 flex flex-col justify-between">
          <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider mb-1.5">
            01 ZERO TRUST
          </span>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Strict perimeter verification with ephemeral cryptographic keys.
          </p>
        </div>

        <div className="p-4 md:p-5 flex flex-col justify-between">
          <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider mb-1.5">
            02 FIDO2 / PASSKEY
          </span>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Hardware-backed biometric auth without credential transmission.
          </p>
        </div>

        <div className="p-4 md:p-5 flex flex-col justify-between">
          <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider mb-1.5">
            03 HYBRID SSO ENGINE
          </span>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            SAML 2.0, Okta, and OIDC federated across global tenant clusters.
          </p>
        </div>

        <div className="p-4 md:p-5 flex flex-col justify-between hidden md:flex">
          <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider mb-1.5">
            04 REALTIME AUDIT
          </span>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Tamper-evident hash telemetry emitted per challenge token.
          </p>
        </div>

        <div className="p-4 md:p-5 flex flex-col justify-between col-span-2 md:col-span-1 hidden lg:flex">
          <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider mb-1.5">
            05 ZERO OVERHEAD
          </span>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Sub-15ms edge resolution verified via local TLS 1.3 handshakes.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN HERO & AUTHENTICATION MATRIX (STRICT SPLIT GRID)
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col justify-center">
        {/* Editorial Section Header */}
        <div className="mb-8 lg:mb-12 border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2 font-mono text-xs text-neutral-400 uppercase tracking-widest">
              <span className="text-[#FFE500] font-bold">01</span>
              <span>AUTHENTICATION CONSOLE</span>
              <span className="text-neutral-700">{'//'}</span>
              <span className="text-neutral-500">GATEWAY.V2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              Access that moves.
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md font-sans leading-relaxed">
            Authenticate to your workspace nodes with cryptographic session precision,
            hardened access scopes, and multi-region failover.
          </p>
        </div>

        {/* Split Grid: Left Column = Form / Right Column = Interactive Reference Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-neutral-800 bg-[#0A0B0E]">
          {/* ─────────────────────────────────────────────────────────
              LEFT AREA: SIGN-IN CONSOLE FORM (COLS 1-6)
          ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between">
            <div>
              {/* Monospace System Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6 font-mono text-[11px] text-neutral-400">
                <span className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span className="text-neutral-200 font-bold uppercase">PROMPT://SIGNIN</span>
                </span>
                <span className="text-neutral-600">ID: SEC_8812</span>
              </div>

              {/* Mode Toggle Tabs (Strict Rectangles, Zero Radius) */}
              <div className="grid grid-cols-2 gap-0 border border-neutral-800 mb-6 bg-[#060709]">
                <button
                  type="button"
                  onClick={() => setAuthMode('credentials')}
                  className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    authMode === 'credentials'
                      ? 'bg-[#FFE500] text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>CREDENTIALS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('sso')}
                  className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-l border-neutral-800 transition-all cursor-pointer ${
                    authMode === 'sso'
                      ? 'bg-[#FFE500] text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>ENTERPRISE SSO</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                {authMode === 'credentials' ? (
                  <>
                    {/* Identifier Field */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider">
                        <label
                          htmlFor="identifier"
                          className="text-neutral-300 font-semibold flex items-center space-x-1.5"
                        >
                          <span className="text-[#FFE500]">01</span>
                          <span>IDENTIFIER</span>
                        </label>
                        <span className="text-neutral-500">[EMAIL_OR_USERNAME]</span>
                      </div>
                      <div className="relative">
                        <input
                          id="identifier"
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="operator@domain.network"
                          className="w-full bg-[#0E1015] border border-neutral-700/80 focus:border-[#FFE500] focus:ring-1 focus:ring-[#FFE500] text-white px-4 py-3 text-sm font-mono placeholder:text-neutral-600 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Secret Field */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider">
                        <label
                          htmlFor="secret"
                          className="text-neutral-300 font-semibold flex items-center space-x-1.5"
                        >
                          <span className="text-[#FFE500]">02</span>
                          <span>AUTHENTICATOR SECRET</span>
                        </label>
                        <button
                          type="button"
                          className="text-neutral-500 hover:text-[#FFE500] transition-colors cursor-pointer"
                        >
                          [RECOVER_KEY?]
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="secret"
                          type="password"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full bg-[#0E1015] border border-neutral-700/80 focus:border-[#FFE500] focus:ring-1 focus:ring-[#FFE500] text-white px-4 py-3 text-sm font-mono placeholder:text-neutral-600 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Enterprise Domain Field */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider">
                        <label
                          htmlFor="sso-domain"
                          className="text-neutral-300 font-semibold flex items-center space-x-1.5"
                        >
                          <span className="text-[#FFE500]">01</span>
                          <span>ORGANIZATION DOMAIN</span>
                        </label>
                        <span className="text-neutral-500">[SAML_ENDPOINT]</span>
                      </div>
                      <div className="relative">
                        <input
                          id="sso-domain"
                          type="text"
                          value={ssoDomain}
                          onChange={(e) => setSsoDomain(e.target.value)}
                          placeholder="org-corp.id.okta.com"
                          className="w-full bg-[#0E1015] border border-neutral-700/80 focus:border-[#FFE500] focus:ring-1 focus:ring-[#FFE500] text-white px-4 py-3 text-sm font-mono placeholder:text-neutral-600 outline-none transition-colors"
                        />
                      </div>
                      <p className="text-[11px] font-mono text-neutral-500 pt-1">
                        REDIRECTS TO VERIFIED SAML 2.0 / OIDC IDENTITY PROVIDER
                      </p>
                    </div>
                  </>
                )}

                {/* Session TTL Option */}
                <div className="flex items-center justify-between pt-1 font-mono text-xs text-neutral-400">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-[#0E1015] border border-neutral-700 text-[#FFE500] rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#FFE500]"
                    />
                    <span className="text-[11px] tracking-wide">MAINTAIN SESSION TOKEN (24H)</span>
                  </label>
                  <span className="text-[10px] text-neutral-600 font-mono">TLS_VERIFIED</span>
                </div>

                {/* Primary Action Button (Solid Yellow, Machine Button-in-Button) */}
                <button
                  type="submit"
                  className="w-full group bg-[#FFE500] text-black font-mono font-black text-xs uppercase tracking-widest py-3.5 px-5 flex items-center justify-between border border-[#FFE500] hover:bg-[#ffea33] active:bg-[#f0d800] transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>
                      {authMode === 'credentials'
                        ? 'AUTHENTICATE_IDENTITY'
                        : 'INITIATE_SAML_HANDSHAKE'}
                    </span>
                  </span>
                  <div className="w-7 h-7 bg-black text-[#FFE500] flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </form>

              {/* Hardware / Biometric Passkey Alternative Button */}
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-[#0F1116] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs flex items-center justify-center space-x-2.5 transition-colors group cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-[#FFE500] group-hover:scale-110 transition-transform" />
                  <span className="uppercase tracking-wider">
                    AUTHENTICATE VIA FIDO2 PASSKEY
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">[BIOMETRIC]</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-7 border-t border-neutral-800 flex items-center justify-center">
                <span className="bg-[#0A0B0E] px-3 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  FEDERATED_IDENTITIES
                </span>
              </div>

              {/* Federated Identity Provider Matrix */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-3 bg-[#0E1015] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-[#FFE500] font-bold">[GH]</span>
                    <span>GITHUB</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                </button>

                <button
                  type="button"
                  className="p-3 bg-[#0E1015] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-[#FFE500] font-bold">[G]</span>
                    <span>GOOGLE</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Terminal Diagnostic Footnote */}
            <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-between font-mono text-[10px] text-neutral-600">
              <span className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#FFE500] inline-block" />
                <span>SHA-256: e8f9...31c2</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="hover:text-neutral-400 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3 h-3 text-[#FFE500]" />
                    <span className="text-[#FFE500]">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPY_HASH</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              RIGHT AREA: INTERACTIVE 4-CARD BENTO MATRIX (REFERENCE REPLICA)
          ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800">
            {/* ──────── CARD 01: INDEPENDENT TRANSFORMS / TELEMETRY ──────── */}
            <div className="p-6 sm:p-8 border-b border-neutral-800 flex flex-col justify-between bg-[#0A0B0E] hover:bg-[#0D0F14] transition-colors group">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500 mb-6">
                  <span className="text-[#FFE500] font-bold">01</span>
                  <span>INDEPENDENT TRANSFORMS</span>
                </div>

                {/* Interactive Sandbox Canvas */}
                <div
                  role="region"
                  aria-label="Interactive transform sandbox"
                  className="h-44 w-full bg-[#060709] border border-neutral-800 relative flex items-center justify-center overflow-hidden cursor-crosshair"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100)
                    const angle = Math.round(((e.clientX - rect.left) / rect.width) * 45)
                    setTile1Angle(angle)
                    setTile1X(`${xPercent}%`)
                  }}
                  onMouseLeave={() => {
                    setTile1Angle(15)
                    setTile1X('50%')
                  }}
                >
                  {/* Subtle Grid Reticle */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1d24_1px,transparent_1px),linear-gradient(to_bottom,#1b1d24_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
                  <div className="absolute w-full h-[1px] bg-neutral-800" />
                  <div className="absolute h-full w-[1px] bg-neutral-800" />

                  {/* Transforming Yellow Node */}
                  <div
                    className="w-12 h-12 bg-[#FFE500] shadow-[0_0_15px_rgba(255,229,0,0.15)] transition-transform duration-150 ease-out flex items-center justify-center font-mono text-[9px] font-bold text-black"
                    style={{
                      transform: `rotate(${tile1Angle}deg)`,
                    }}
                  >
                    NODE
                  </div>

                  <span className="absolute bottom-2 left-2 font-mono text-[9px] text-neutral-600">
                    MOVE_CURSOR_TO_TEST
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base font-sans">
                      Independent transforms
                    </h3>
                    <span className="text-neutral-500 font-mono text-xs">→</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-sans leading-relaxed">
                    Animate x, y, rotate, scale on the same element, without wrappers.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <code className="text-[#FFE500] font-mono text-xs block">
                  {`{rotate:${tile1Angle}, x:"${tile1X}"}`}
                </code>
              </div>
            </div>

            {/* ──────── CARD 02: ORBITAL ROTATION / YELLOW INVERSION ──────── */}
            <div className="p-6 sm:p-8 border-b border-neutral-800 flex flex-col justify-between bg-[#FFE500] text-black">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-black/70 mb-6">
                  <span>02</span>
                  <span>CRYPTOGRAPHIC ORBIT</span>
                </div>

                {/* Inverted Orbital Animation Canvas */}
                <div className="h-44 w-full relative flex items-center justify-center">
                  {/* Outer Concentric Target Ring */}
                  <div className="w-28 h-28 border-2 border-black/20 rounded-full flex items-center justify-center">
                    {/* Rotating Dashed / Solid Orbital Loop */}
                    <div className="w-24 h-24 border border-black rounded-full relative animate-spin-slow">
                      {/* Orbital Satellite Node */}
                      <span className="w-3 h-3 bg-black rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2 shadow-sm" />
                    </div>
                  </div>
                  {/* Inner Solid Hub */}
                  <div className="absolute w-8 h-8 border border-black/40 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-black text-base font-sans uppercase">
                      Scroll animation
                    </h3>
                    <span className="text-black font-mono text-xs font-bold">→</span>
                  </div>
                  <p className="text-xs text-black/80 mt-1 font-sans leading-relaxed font-medium">
                    Hardware-accelerated continuous validation linked via ScrollTimeline.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-black/20">
                <code className="text-black font-mono text-xs font-bold block">
                  scroll()
                </code>
              </div>
            </div>

            {/* ──────── CARD 03: NATIVE GESTURES SANDBOX ──────── */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#0A0B0E] hover:bg-[#0D0F14] transition-colors group">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500 mb-6">
                  <span className="text-[#FFE500] font-bold">03</span>
                  <span>NATIVE GESTURES</span>
                </div>

                {/* Gesture Canvas Container */}
                <div className="h-44 w-full bg-[#060709] border border-neutral-800 p-4 relative flex items-center justify-between">
                  {/* Bounded Dashed Box with Active State Indicator */}
                  <div className="w-24 h-24 border border-dashed border-[#FFE500]/60 p-2 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 transition-all duration-200 flex items-center justify-center font-mono text-[9px] font-bold ${
                        activeGesture === 'hover'
                          ? 'bg-[#FFE500]/30 border border-[#FFE500] text-[#FFE500]'
                          : activeGesture === 'press'
                            ? 'bg-[#FFE500] text-black scale-90'
                            : 'bg-neutral-800 border border-neutral-600 text-white translate-x-2'
                      }`}
                    >
                      {activeGesture.toUpperCase()}
                    </div>
                  </div>

                  {/* Interactive Radio Selectors */}
                  <div className="space-y-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveGesture('hover')}
                      className={`flex items-center space-x-2 transition-colors cursor-pointer ${
                        activeGesture === 'hover' ? 'text-[#FFE500] font-bold' : 'text-neutral-500'
                      }`}
                    >
                      <span className="text-xs">•</span>
                      <span>hover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGesture('press')}
                      className={`flex items-center space-x-2 transition-colors cursor-pointer ${
                        activeGesture === 'press' ? 'text-[#FFE500] font-bold' : 'text-neutral-500'
                      }`}
                    >
                      <span className="text-xs">•</span>
                      <span>press</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGesture('drag')}
                      className={`flex items-center space-x-2 transition-colors cursor-pointer ${
                        activeGesture === 'drag' ? 'text-[#FFE500] font-bold' : 'text-neutral-500'
                      }`}
                    >
                      <span className="text-xs">•</span>
                      <span>drag</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base font-sans">
                      Native gestures
                    </h3>
                    <span className="text-neutral-500 font-mono text-xs">→</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-sans leading-relaxed">
                    hover, press, and drag that feel native, not bolted on.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <code className="text-[#FFE500] font-mono text-xs block">
                  drag = true
                </code>
              </div>
            </div>

            {/* ──────── CARD 04: LAYOUT ANIMATION ──────── */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#0A0B0E] hover:bg-[#0D0F14] transition-colors group">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500 mb-6">
                  <span className="text-[#FFE500] font-bold">04</span>
                  <span>LAYOUT MATRIX</span>
                </div>

                {/* Layout Canvas with 4 White Geometric Blocks */}
                <div className="h-44 w-full bg-[#060709] border border-neutral-800 relative flex items-center justify-center p-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="w-9 h-9 bg-white transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 duration-300" />
                    <div className="w-9 h-9 bg-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
                    <div className="w-9 h-9 bg-white transition-transform group-hover:-translate-x-1 group-hover:translate-y-1 duration-300" />
                    <div className="w-9 h-9 bg-[#FFE500] transition-transform group-hover:translate-x-1 group-hover:translate-y-1 duration-300" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base font-sans">
                      Layout animation
                    </h3>
                    <span className="text-neutral-500 font-mono text-xs">→</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-sans leading-relaxed">
                    Animate between any two layouts with a single layout prop.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <code className="text-[#FFE500] font-mono text-xs block">
                  layout = true
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. DIAGNOSTIC FOOTER (STRICT HAIRLINE AUDIT BAR)
      ───────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-neutral-800 bg-[#06070A] px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-3">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFE500] inline-block animate-pulse-subtle" />
            <span className="text-neutral-400">STATUS: ALL_SYSTEMS_OPERATIONAL</span>
          </span>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <span className="hidden sm:inline">SECURITY: AES-256-GCM</span>
          <span className="hidden md:inline text-neutral-700">|</span>
          <span className="hidden md:inline">REGION: GLOBAL-ANYCAST</span>
        </div>

        <div className="flex items-center space-x-6">
          <button
            type="button"
            className="hover:text-neutral-300 transition-colors cursor-pointer"
          >
            TERMS
          </button>
          <button
            type="button"
            className="hover:text-neutral-300 transition-colors cursor-pointer"
          >
            PRIVACY
          </button>
          <button
            type="button"
            className="hover:text-neutral-300 transition-colors cursor-pointer"
          >
            SOC2_REPORT
          </button>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-400 font-semibold">© KIZEN SYSTEMS</span>
        </div>
      </footer>
    </div>
  )
}
