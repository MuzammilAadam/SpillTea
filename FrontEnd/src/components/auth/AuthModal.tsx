import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, Feather, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  WashiTapeStrip,
  PressedFlower,
  TeacupIcon,
  WaxSeal,
} from '../common/Botanicals';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        if (!pseudonym.trim()) {
          setError('Please choose a pen name (pseudonym).');
          setLoading(false);
          return;
        }
        await register(email.trim(), password, pseudonym.trim(), displayName.trim() || undefined);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-7 sm:p-9 shadow-2xl overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#e5dfd3 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Washi Tape Header */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none">
          <WashiTapeStrip color="#F7DDE1" width="w-28" rotation="-rotate-1" />
        </div>

        {/* Decorative corner flower */}
        <div className="absolute top-4 right-14 pointer-events-none opacity-60">
          <PressedFlower className="w-8 h-8 text-[#D8A0A5]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#666747] hover:text-[#44352F] hover:bg-[#F4EBE1] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-3 mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] mb-3 shadow-xs">
            <TeacupIcon className="w-6 h-6 text-[#B98289]" />
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#44352F]">
            {mode === 'login' ? 'Return to the Sanctuary' : 'Join Our Tea Circle'}
          </h2>
          <p className="font-serif italic text-xs text-[#666747] mt-1">
            {mode === 'login'
              ? 'Pencil your thoughts and revisit your keepsakes'
              : 'Choose an anonymous pen name to share freely and safely'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-[#F4EBE1] p-1 mb-6 border border-[#E9D9C9]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-serif font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#44352F] shadow-xs font-bold'
                : 'text-[#666747] hover:text-[#44352F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-serif font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#44352F] shadow-xs font-bold'
                : 'text-[#666747] hover:text-[#44352F]'
            }`}
          >
            Create Pen Name
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFF0F2] border border-[#F7DDE1] text-xs text-[#A84855] font-serif">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-serif font-medium text-[#44352F] mb-1">
                  Pen Name (Pseudonym) <span className="text-[#B98289]">*</span>
                </label>
                <div className="relative">
                  <Feather className="w-4 h-4 text-[#B98289] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder="e.g. LavenderWhispers"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F] placeholder:text-[#A89F91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-[#44352F] mb-1">
                  Display Greeting (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Quiet Reader"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F] placeholder:text-[#A89F91]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-serif font-medium text-[#44352F] mb-1">
              {mode === 'login' ? 'Email or Pen Name' : 'Email Address'} <span className="text-[#B98289]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B98289] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={mode === 'login' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'your@email.com or pen name' : 'your@email.com'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F] placeholder:text-[#A89F91]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-medium text-[#44352F] mb-1">
              Password <span className="text-[#B98289]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B98289] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F] placeholder:text-[#A89F91]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B98289] hover:bg-[#A66D74] text-white font-serif font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Pouring warm tea...</span>
            ) : mode === 'login' ? (
              <>
                <TeacupIcon className="w-4 h-4" />
                <span>Enter Tea Room</span>
              </>
            ) : (
              <>
                <Feather className="w-4 h-4" />
                <span>Seal My Pen Name</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] font-serif text-[#666747]">
            {mode === 'login' ? "Haven't chosen a pen name yet?" : 'Already have a journal here?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-[#B98289] underline hover:text-[#44352F] cursor-pointer ml-1"
            >
              {mode === 'login' ? 'Create one now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
