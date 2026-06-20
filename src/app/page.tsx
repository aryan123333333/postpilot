'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Zap,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Twitter,
  Linkedin,
  Instagram,
  Play,
  Youtube,
  ArrowRight,
  Star,
  RefreshCw,
  X,
  BarChart3,
  Globe,
  Palette,
  Loader2,
  MessageSquare,
  Hash,
  Clock,
  Send,
  CalendarClock,
  Wand2,
  FileText,
  Mic,
  Link2,
  ShieldCheck,
  Lightbulb,
  Layers,
  ChevronDown,
  Info,
  Shield,
  Activity,
  Users,
  Server,
  AlertTriangle,
  TrendingUp,
  Eye,
  MousePointerClick,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Mail,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GeneratedPost {
  id: string;
  content: string;
  platform: string;
  copied: boolean;
  scheduled?: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#1DA1F2', desc: 'Short & punchy tweets' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', desc: 'Long pro posts' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', desc: 'Captions + hashtags' },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: '#000000', desc: 'Viral short hooks' },
  { id: 'youtube-long', name: 'YT Long', icon: Youtube, color: '#FF0000', desc: 'Full video description' },
  { id: 'youtube-shorts', name: 'YT Shorts', icon: Play, color: '#FF0000', desc: 'Short punchy hooks' },
] as const;

const TONES = [
  { id: 'professional', label: 'Serious', emoji: '\ud83d\udcbc' },
  { id: 'casual', label: 'Chill', emoji: '\ud83d\ude0e' },
  { id: 'humorous', label: 'Funny', emoji: '\ud83d\ude02' },
  { id: 'inspirational', label: 'Motivation', emoji: '\ud83d\ude80' },
  { id: 'provocative', label: 'Bold', emoji: '\ud83d\udd25' },
  { id: 'educational', label: 'Teach', emoji: '\ud83d\udcda' },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Generate weeks of social media content in under 30 seconds. Our AI understands platform algorithms, engagement patterns, and trending formats to produce posts that actually perform.',
  },
  {
    icon: Palette,
    title: 'Brand Voice Training',
    description: 'Describe your brand personality or paste your past posts — PostPilot learns your unique voice and generates every post in your authentic style. Never sound robotic again.',
  },
  {
    icon: Globe,
    title: '6-Platform Mastery',
    description: 'One input, six platform options. PostPilot automatically reformats and optimizes your content for Twitter/X, LinkedIn, Instagram, TikTok, YouTube Long Videos, and YouTube Shorts with platform-native formatting.',
  },
  {
    icon: BarChart3,
    title: 'Engagement Optimized',
    description: 'Every post is engineered with proven engagement hooks — pattern interrupts, open loops, power questions, and emotional triggers that make people stop scrolling and start engaging.',
  },
  {
    icon: FileText,
    title: 'Content Repurposing',
    description: 'Paste a blog article, video transcript, or any long-form content — PostPilot instantly breaks it down and creates dozens of unique social media posts across all platforms. One piece of content, infinite reach.',
  },
  {
    icon: Send,
    title: 'Schedule & Publish',
    description: 'One-click schedule or direct publish to your connected platforms. Connect Twitter, LinkedIn, and more — PostPilot handles the posting so you can focus on creating.',
  },
  {
    icon: Wand2,
    title: 'Smart Prompt Enhancer',
    description: 'Not sure how to phrase your topic? Our AI enhancer transforms a simple idea like "marketing tips" into a detailed, context-rich prompt that generates 10x better content.',
  },
  {
    icon: Layers,
    title: 'Multi-Platform Blast',
    description: 'Select multiple platforms at once and generate tailored content for each one simultaneously. Same topic, platform-optimized versions — all in one click.',
  },
  {
    icon: ShieldCheck,
    title: 'Abuse-Protected & Fast',
    description: 'Enterprise-grade rate limiting, clean API architecture, and edge-optimized delivery. Your content generates fast, securely, and reliably — every single time.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Describe Your Topic',
    description: 'Enter a topic, paste an article URL, drop a transcript, or use our AI prompt enhancer. PostPilot understands context and creates platform-ready content automatically.',
  },
  {
    step: '02',
    title: 'Choose Platform, Tone & Voice',
    description: 'Select one or more platforms, pick your vibe, and optionally train the AI on your brand voice. PostPilot adapts to every platform culture and your personal style.',
  },
  {
    step: '03',
    title: 'Generate, Schedule & Publish',
    description: 'AI generates multiple unique posts instantly. Edit, copy, schedule for later, or publish directly to your connected platforms. Content creation on autopilot.',
  },
];

const PRICING: PricingPlan[] = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for testing the waters',
    features: [
      '10 generations per month',
      'All 6 platforms',
      'All 6 tone presets',
      'Smart prompt enhancer',
      'Basic hashtag suggestions',
      'Community support',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For creators & solopreneurs',
    features: [
      'Unlimited generations',
      'All 6 platforms + multi-platform blast',
      'All tone presets + brand voice training',
      'Advanced hashtag engine',
      'Content repurposing (URLs & articles)',
      'Schedule & publish to platforms',
      'Priority support',
    ],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/month',
    description: 'For teams & agencies',
    features: [
      'Everything in Pro',
      '10 brand voice profiles',
      'Team collaboration',
      'API access',
      'Analytics dashboard',
      'White-label exports',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator, 250K followers',
    text: 'PostPilot cut my content creation time from 4 hours to 15 minutes. The brand voice training is insane — my audience can\'t tell the difference between my posts and AI-generated ones.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Marketing Director, TechFlow',
    text: 'We replaced our entire social media freelancing budget with PostPilot. The content repurposing feature alone saves us 20 hours a week. Better content at a fraction of the cost.',
    avatar: 'MJ',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Solopreneur & Coach',
    text: 'I was spending $2K/month on content. Now I spend $29, schedule everything in one dashboard, and get better engagement. The multi-platform blast is a game-changer.',
    avatar: 'ER',
  },
];

/* ------------------------------------------------------------------ */
/*  Logo Component                                                     */
/* ------------------------------------------------------------------ */

function PostPilotLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className || 'h-8 w-8'} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3C16 3 10 9 10 18C10 22 12.5 26 16 28C19.5 26 22 22 22 18C22 9 16 3 16 3Z" fill="url(#pg)" />
      <circle cx="16" cy="15" r="3" fill="white" opacity="0.9" />
      <path d="M10 18L7 23L10 21V18Z" fill="#F97316" />
      <path d="M22 18L25 23L22 21V18Z" fill="#F97316" />
      <path d="M14 26C14 26 16 30 16 30C16 30 18 26 18 26" fill="url(#fg)" />
      <defs>
        <linearGradient id="pg" x1="10" y1="3" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="fg" x1="14" y1="26" x2="18" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: unique ID                                                  */
/* ------------------------------------------------------------------ */

let idCounter = 0;
function uid() {
  return `post-${++idCounter}-${Date.now()}`;
}

/* ------------------------------------------------------------------ */
/*  Admin Stats Types                                                  */
/* ------------------------------------------------------------------ */

interface AdminStats {
  totalGenerations: number;
  totalPostsGenerated: number;
  generationsByPlatform: Record<string, number>;
  generationsByTone: Record<string, number>;
  generationsByMode: Record<string, number>;
  rateLimitedRequests: number;
  recentGenerations: {
    id: string;
    topic: string;
    platform: string;
    tone: string;
    count: number;
    postsGenerated: number;
    mode: string;
    timestamp: string;
    ip: string;
  }[];
  uptime: number;
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<'landing' | 'app' | 'admin'>('landing');

  /* After sign-in, redirect to app view if callbackUrl had view=app */
  useEffect(() => {
    if (status === 'authenticated' && searchParams.get('view') === 'app') {
      setActiveView('app');
    }
  }, [status, searchParams]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [selectedTone, setSelectedTone] = useState<string>('casual');
  const [postCount, setPostCount] = useState(3);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [inputMode, setInputMode] = useState<'topic' | 'repurpose'>('topic');
  const [repurposeText, setRepurposeText] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [showBrandVoice, setShowBrandVoice] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  /* Require sign-in before accessing the app */
  const goToApp = () => {
    if (status === 'authenticated') {
      setActiveView('app');
    } else {
      signIn('google', { callbackUrl: '/?view=app' });
    }
  };

  /* Auto-scroll to results */
  useEffect(() => {
    if (generatedPosts.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPosts]);

  /* Fetch admin stats when admin view is active */
  useEffect(() => {
    if (activeView !== 'admin') return;
    setAdminLoading(true);
    fetch('/api/admin')
      .then((r) => r.json())
      .then((data) => setAdminStats(data))
      .catch(() => setAdminStats(null))
      .finally(() => setAdminLoading(false));
  }, [activeView]);

  /* ---------------------------------------------------------------- */
  /*  Platform toggle (multi-select)                                   */
  /* ---------------------------------------------------------------- */

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Enhance Prompt handler                                           */
  /* ---------------------------------------------------------------- */

  async function handleEnhance() {
    const text = inputMode === 'topic' ? topic.trim() : repurposeText.trim();
    if (!text || text.length < 3) {
      toast.error('Enter something first so the AI can enhance it');
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: text,
          platform: 'linkedin',
          tone: 'educational',
          count: 1,
          mode: 'enhance',
        }),
      });
      const data = await res.json();
      if (data.success && data.enhanced) {
        if (inputMode === 'topic') {
          setTopic(data.enhanced);
        } else {
          setRepurposeText(data.enhanced);
        }
        toast.success('Prompt enhanced! Your topic is now more detailed and specific.');
      } else {
        toast.error('Could not enhance. Try again.');
      }
    } catch {
      toast.error('Network error while enhancing.');
    } finally {
      setIsEnhancing(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Generate handler                                                 */
  /* ---------------------------------------------------------------- */

  async function handleGenerate() {
    const mainTopic = inputMode === 'topic' ? topic.trim() : repurposeText.trim();
    if (!mainTopic || mainTopic.length < 3) {
      toast.error('Please enter a topic or content to repurpose (at least 3 characters)');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);

    try {
      // If multi-platform, generate for each selected platform
      const allResults: GeneratedPost[] = [];
      
      for (const platform of selectedPlatforms) {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: mainTopic,
            platform,
            tone: selectedTone,
            count: postCount,
            mode: inputMode === 'repurpose' ? 'repurpose' : 'generate',
            brandVoice: brandVoice.trim() || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error(data.error || `Generation failed for ${platform}`);
          continue;
        }

        const posts: GeneratedPost[] = data.posts.map((content: string) => ({
          id: uid(),
          content,
          platform: data.platform,
          copied: false,
        }));

        allResults.push(...posts.slice(0, postCount));
      }

      setGeneratedPosts(allResults);
      setGenerationsUsed((prev) => prev + 1);
      
      const platformNames = selectedPlatforms.map((id) => PLATFORMS.find((p) => p.id === id)?.name).filter(Boolean).join(', ');
      toast.success(`Generated ${allResults.length} posts across ${platformNames}!`);
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Copy handler                                                     */
  /* ---------------------------------------------------------------- */

  function handleCopy(postId: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setGeneratedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, copied: true } : p)));
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setGeneratedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, copied: false } : p)));
      }, 2000);
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Schedule handler                                                 */
  /* ---------------------------------------------------------------- */

  function handleSchedule(postId: string) {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Pick a date and time first');
      return;
    }
    const scheduledFor = `${scheduleDate} at ${scheduleTime}`;
    setGeneratedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, scheduled: true } : p)));
    setShowScheduleModal(null);
    toast.success(`Scheduled for ${scheduledFor}!`);
    setScheduleDate('');
    setScheduleTime('');
  }

  function handlePublishNow(postId: string) {
    const post = generatedPosts.find((p) => p.id === postId);
    const platformName = PLATFORMS.find((p) => p.id === post?.platform)?.name || 'platform';
    toast.success(`Published to ${platformName}! (Connect your account in Settings)`);
  }

  /* ---------------------------------------------------------------- */
  /*  Clear results                                                    */
  /* ---------------------------------------------------------------- */

  function handleClear() {
    setGeneratedPosts([]);
    setTopic('');
    setRepurposeText('');
  }

  /* ---------------------------------------------------------------- */
  /*  Platform icon component                                          */
  /* ---------------------------------------------------------------- */

  const platformIcon = (platformId: string, className?: string) => {
    const p = PLATFORMS.find((x) => x.id === platformId);
    if (!p) return null;
    const Icon = p.icon;
    return <Icon className={className || 'h-5 w-5'} style={{ color: p.color }} />;
  };

  /* ================================================================= */
  /*  RENDER                                                           */
  /* ================================================================= */

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============================================================ */}
      {/*  NAVBAR                                                       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button onClick={() => setActiveView('landing')} className="flex items-center gap-2.5 cursor-pointer group">
            <PostPilotLogo className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">PostPilot</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const id = item.toLowerCase().replace(/\s+/g, '-');
                  const el = document.getElementById(id);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all cursor-pointer"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {generationsUsed > 0 && (
              <Badge variant="secondary" className="hidden sm:flex text-xs gap-1.5">
                <Zap className="h-3 w-3 text-orange-500" />
                {10 - generationsUsed > 0 ? `${10 - generationsUsed} free left` : 'Upgrade for more'}
              </Badge>
            )}

            {/* Auth: User avatar or Login button */}
            {status === 'authenticated' && session?.user ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setShowAuthModal(true)}
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full border border-border" />
                  ) : (
                    <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                    {session.user.name?.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signIn('google', { callbackUrl: '/?view=app' })}
                className="cursor-pointer text-xs gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button
              onClick={goToApp}
              className="gradient-brand text-white border-0 hover:opacity-90 cursor-pointer"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Try Free
            </Button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/50 bg-background overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {['Features', 'How It Works', 'Pricing'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMobileMenu(false);
                      const id = item.toLowerCase().replace(/\s+/g, '-');
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
                {generationsUsed > 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-orange-500 inline mr-1" />
                    {10 - generationsUsed > 0 ? `${10 - generationsUsed} free generations left` : 'Upgrade for unlimited'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                  */}
      {/* ============================================================ */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* -------------------------------------------------------- */}
          {/*  LANDING PAGE                                              */}
          {/* -------------------------------------------------------- */}
          {activeView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* HERO */}
              <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-orange-200/40 via-amber-100/30 to-transparent blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-orange-100/20 to-transparent blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
                  <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                        Trusted by 12,000+ creators & brands
                      </Badge>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                    >
                      Turn{' '}
                      <span className="gradient-text">one idea</span>
                      <br className="hidden sm:block" />
                      {' '}into viral content
                      <br className="hidden sm:block" />
                      {' '}for{' '}
                      <span className="gradient-text">every platform</span>
                    </motion.h1>

                    {/* Subhead */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                      PostPilot is the AI content engine that generates platform-optimized social media posts
                      in seconds. Repurpose articles, train your brand voice, and schedule posts — all in one dashboard.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                      <Button
                        size="lg"
                        onClick={goToApp}
                        className="gradient-brand text-white border-0 hover:opacity-90 px-8 py-6 text-base font-semibold cursor-pointer rounded-xl"
                      >
                        Start Generating — Free
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-xl px-8 py-6 text-base font-medium cursor-pointer"
                      >
                        See How It Works
                      </Button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span>4.9/5 from 2,400+ reviews</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">No credit card required</span>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* FEATURES */}
              <section id="features" className="py-20 lg:py-28 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="secondary" className="mb-4">Features</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      Everything you need to{' '}
                      <span className="gradient-text">dominate social</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      PostPilot is not just another AI writer. It is a complete content engine with brand voice training, content repurposing, scheduling, and platform-native formatting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.06 }}
                      >
                        <Card className="h-full border-border/50 card-lift rounded-2xl">
                          <CardContent className="p-6">
                            <div className="h-12 w-12 rounded-xl bg-brand-muted flex items-center justify-center mb-4">
                              <feature.icon className="h-6 w-6 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* HOW IT WORKS */}
              <section id="how-it-works" className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="secondary" className="mb-4">How It Works</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      From idea to published in{' '}
                      <span className="gradient-text">30 seconds</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      Three simple steps. Zero learning curve. Start creating and publishing viral content immediately.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STEPS.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                        className="relative"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {step.step}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* PRICING */}
              <section id="pricing" className="py-20 lg:py-28 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="secondary" className="mb-4">Pricing</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      Simple pricing,{' '}
                      <span className="gradient-text">serious results</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      Start free with 10 generations. Upgrade when you are ready to unlock brand voice, scheduling, and unlimited content.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING.map((plan, i) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={plan.popular ? 'md:-mt-4 md:mb-0' : ''}
                      >
                        <Card className={`h-full rounded-2xl relative ${plan.popular ? 'border-2 border-orange-400 shadow-lg soft-glow' : 'border-border/50'}`}>
                          {plan.popular && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                              <Badge className="gradient-brand text-white border-0 px-4 py-1">Most Popular</Badge>
                            </div>
                          )}
                          <CardContent className="p-6 pt-8">
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-sm text-muted-foreground">{plan.period}</span>
                            </div>
                            <ul className="mt-6 space-y-3">
                              {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm">
                                  <Check className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{f}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`mt-8 w-full cursor-pointer rounded-xl ${plan.popular ? 'gradient-brand text-white border-0 hover:opacity-90' : ''}`}
                              variant={plan.popular ? 'default' : 'outline'}
                              onClick={goToApp}
                            >
                              {plan.cta}
                              {plan.popular && <ArrowRight className="h-4 w-4 ml-1.5" />}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* TESTIMONIALS */}
              <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="secondary" className="mb-4">Testimonials</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      Loved by creators{' '}
                      <span className="gradient-text">worldwide</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {TESTIMONIALS.map((t, i) => (
                      <motion.div
                        key={t.name}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="h-full rounded-2xl border-border/50 card-lift">
                          <CardContent className="p-6">
                            <div className="flex gap-0.5 mb-4">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                              &ldquo;{t.text}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                                {t.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{t.name}</div>
                                <div className="text-xs text-muted-foreground">{t.role}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FINAL CTA */}
              <section className="py-20 lg:py-28 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      Ready to{' '}
                      <span className="gradient-text">10x your content output?</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      Join 12,000+ creators who stopped writing posts manually and started scaling with AI.
                    </p>
                    <div className="mt-10">
                      <Button
                        size="lg"
                        onClick={goToApp}
                        className="gradient-brand text-white border-0 hover:opacity-90 px-8 py-6 text-base font-semibold cursor-pointer rounded-xl"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Launch PostPilot — Free
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Takes less than 30 seconds to generate your first batch
                    </p>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {/* -------------------------------------------------------- */}
          {/*  APP VIEW — Content Generator                              */}
          {/* -------------------------------------------------------- */}
          {activeView === 'app' && (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
            >
              {/* App Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Content Generator
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Enter a topic or repurpose content — AI crafts viral posts for your platforms
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs gap-1.5">
                    <Zap className="h-3 w-3 text-orange-500" />
                    {10 - generationsUsed > 0 ? `${10 - generationsUsed} free left` : 'Upgrade'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('landing')}
                    className="cursor-pointer"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
                {/* LEFT: Controls */}
                <div className="space-y-6">

                  {/* Input Mode Toggle */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold">
                          <Sparkles className="h-4 w-4 inline mr-1.5 text-orange-500" />
                          Content Source
                        </label>
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                          <button
                            onClick={() => setInputMode('topic')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                              inputMode === 'topic'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Lightbulb className="h-3 w-3 inline mr-1" />
                            Topic
                          </button>
                          <button
                            onClick={() => setInputMode('repurpose')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                              inputMode === 'repurpose'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <FileText className="h-3 w-3 inline mr-1" />
                            Repurpose
                          </button>
                        </div>
                      </div>

                      {inputMode === 'topic' ? (
                        <div>
                          <Textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. 'How AI is changing remote work in 2026', '5 productivity hacks for entrepreneurs', 'Why every startup needs a content strategy'..."
                            className="min-h-[100px] resize-none rounded-xl text-sm leading-relaxed"
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{topic.length} characters</span>
                              <span className={topic.length >= 3 ? 'text-orange-500' : ''}>
                                {topic.length >= 3 ? 'Ready' : 'Min 3 chars'}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEnhance}
                              disabled={isEnhancing || topic.trim().length < 3}
                              className="text-xs cursor-pointer text-orange-500 hover:text-orange-600 h-7 px-2"
                            >
                              {isEnhancing ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Wand2 className="h-3 w-3 mr-1" />
                              )}
                              Enhance Prompt
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Textarea
                            value={repurposeText}
                            onChange={(e) => setRepurposeText(e.target.value)}
                            placeholder="Paste a blog article, video transcript, newsletter, or any long-form content. PostPilot will break it down and generate unique social media posts from it..."
                            className="min-h-[140px] resize-none rounded-xl text-sm leading-relaxed"
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Link2 className="h-3 w-3" />
                              <span>{repurposeText.length} characters</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEnhance}
                              disabled={isEnhancing || repurposeText.trim().length < 3}
                              className="text-xs cursor-pointer text-orange-500 hover:text-orange-600 h-7 px-2"
                            >
                              {isEnhancing ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Wand2 className="h-3 w-3 mr-1" />
                              )}
                              Enhance
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Platform Selector — Multi-select */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold">
                          <Globe className="h-4 w-4 inline mr-1.5 text-orange-500" />
                          Target Platform{selectedPlatforms.length > 1 ? 's' : ''}
                        </label>
                        <div className="flex items-center gap-2">
                          {selectedPlatforms.length > 1 && (
                            <Badge variant="secondary" className="text-[10px]">
                              {selectedPlatforms.length} selected
                            </Badge>
                          )}
                          <button
                            onClick={() => {
                              if (selectedPlatforms.length === PLATFORMS.length) {
                                setSelectedPlatforms(['twitter']);
                              } else {
                                setSelectedPlatforms(PLATFORMS.map((p) => p.id));
                              }
                            }}
                            className="text-[10px] text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                          >
                            {selectedPlatforms.length === PLATFORMS.length ? 'Clear all' : 'Select all'}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => togglePlatform(p.id)}
                            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                              selectedPlatforms.includes(p.id)
                                ? 'border-orange-400 bg-orange-50 text-orange-700'
                                : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <p.icon className="h-4 w-4" style={{ color: selectedPlatforms.includes(p.id) ? undefined : p.color }} />
                            <div className="text-left">
                              <div className="text-xs font-semibold">{p.name}</div>
                              <div className="text-[10px] opacity-60">{p.desc}</div>
                            </div>
                            {selectedPlatforms.includes(p.id) && (
                              <Check className="h-3 w-3 ml-auto text-orange-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tone + Brand Voice */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6 space-y-5">
                      {/* Tone */}
                      <div>
                        <label className="text-sm font-semibold mb-3 block">
                          <Palette className="h-4 w-4 inline mr-1.5 text-orange-500" />
                          Tone & Style
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TONES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTone(t.id)}
                              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                                selectedTone === t.id
                                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                                  : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {t.emoji} {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Brand Voice Toggle */}
                      <div>
                        <button
                          onClick={() => setShowBrandVoice(!showBrandVoice)}
                          className="flex items-center gap-2 text-sm font-semibold cursor-pointer hover:text-orange-500 transition-colors"
                        >
                          <Mic className="h-4 w-4 text-orange-500" />
                          Brand Voice Training
                          <ChevronDown className={`h-4 w-4 transition-transform ${showBrandVoice ? 'rotate-180' : ''}`} />
                          <Badge variant="secondary" className="text-[10px] ml-1">Pro</Badge>
                        </button>
                        <AnimatePresence>
                          {showBrandVoice && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3">
                                <Textarea
                                  value={brandVoice}
                                  onChange={(e) => setBrandVoice(e.target.value)}
                                  placeholder="Describe your brand voice or paste examples of your past posts. E.g., 'I write in a casual, witty tone with lots of analogies. I avoid corporate jargon and use short sentences. My audience is startup founders aged 25-40.'"
                                  className="min-h-[100px] resize-none rounded-xl text-sm leading-relaxed"
                                />
                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Info className="h-3 w-3" />
                                  <span>AI will match this voice in every generated post</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Post Count */}
                      <div>
                        <label className="text-sm font-semibold mb-3 block">
                          Number of Posts (per platform)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={postCount}
                            onChange={(e) => setPostCount(Number(e.target.value))}
                            className="flex-1 accent-orange-500"
                          />
                          <span className="text-sm font-mono font-semibold bg-muted px-3 py-1.5 rounded-lg min-w-[48px] text-center">
                            {postCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || generationsUsed >= 10}
                      className="flex-1 gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-6 text-base font-semibold"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate {postCount} Post{postCount > 1 ? 's' : ''}
                          {selectedPlatforms.length > 1 ? ` x${selectedPlatforms.length} platforms` : ''}
                        </>
                      )}
                    </Button>
                    {generatedPosts.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleClear}
                        className="rounded-xl px-4 cursor-pointer"
                        size="lg"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {generationsUsed >= 10 && (
                    <Card className="rounded-2xl border-orange-300 bg-orange-50/50">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-orange-700">Free limit reached</p>
                          <p className="text-xs text-orange-600/70">Upgrade to Pro for unlimited generations</p>
                        </div>
                        <Button size="sm" className="ml-auto gradient-brand text-white border-0 cursor-pointer text-xs">
                          Upgrade
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* RIGHT: Results */}
                <div ref={resultsRef}>
                  {generatedPosts.length === 0 && !isGenerating ? (
                    <Card className="rounded-2xl border-dashed border-2 border-border/50">
                      <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                          <Sparkles className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Enter a topic or paste content to repurpose, choose your platforms and tone, then hit generate. Your AI-crafted posts will appear here with schedule and publish options.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">6 platforms</Badge>
                          <Badge variant="secondary" className="text-[10px]">6 tones</Badge>
                          <Badge variant="secondary" className="text-[10px]">Brand voice</Badge>
                          <Badge variant="secondary" className="text-[10px]">Schedule</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ) : isGenerating ? (
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center animate-pulse">
                            <Zap className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute inset-0 rounded-2xl gradient-brand animate-ping opacity-20" />
                        </div>
                        <h3 className="mt-6 text-lg font-semibold">Creating your posts...</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Generating {postCount} post{postCount > 1 ? 's' : ''} for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
                        </p>
                        <div className="mt-6 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full gradient-brand rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Generated Posts
                          <Badge variant="secondary" className="ml-2">{generatedPosts.length}</Badge>
                        </h3>
                        <div className="flex items-center gap-2">
                          {selectedPlatforms.length === 1 && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {platformIcon(selectedPlatforms[0], 'h-3.5 w-3.5')}
                              {PLATFORMS.find((p) => p.id === selectedPlatforms[0])?.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {generatedPosts.map((post, i) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.06 }}
                        >
                          <Card className="rounded-2xl border-border/50 card-lift">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                    #{i + 1}
                                  </span>
                                  {platformIcon(post.platform, 'h-3.5 w-3.5')}
                                  <span className="text-[10px] text-muted-foreground">
                                    {PLATFORMS.find((p) => p.id === post.platform)?.name}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(post.id, post.content)}
                                    className="cursor-pointer h-8 px-2.5"
                                    title="Copy to clipboard"
                                  >
                                    {post.copied ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePublishNow(post.id)}
                                    className="cursor-pointer h-8 px-2.5"
                                    title="Publish now"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowScheduleModal(post.id)}
                                    className="cursor-pointer h-8 px-2.5"
                                    title="Schedule for later"
                                  >
                                    <CalendarClock className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="capitalize">{TONES.find((t) => t.id === selectedTone)?.label}</span>
                                  <span>•</span>
                                  <span>{post.content.length} chars</span>
                                  {brandVoice.trim() && (
                                    <>
                                      <span>•</span>
                                      <Mic className="h-3 w-3 text-orange-500" />
                                      <span className="text-orange-500">Brand Voice</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {post.scheduled && (
                                    <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 border-0">
                                      <Check className="h-3 w-3 mr-0.5" /> Scheduled
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                    AI Generated
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {/* Schedule Modal */}
                      <AnimatePresence>
                        {showScheduleModal && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <Card className="rounded-2xl border-orange-300 soft-glow">
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-orange-500" />
                                    Schedule Post
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowScheduleModal(null)}
                                    className="cursor-pointer h-7 w-7 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                                    <input
                                      type="date"
                                      value={scheduleDate}
                                      onChange={(e) => setScheduleDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                                    <input
                                      type="time"
                                      value={scheduleTime}
                                      onChange={(e) => setScheduleTime(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleSchedule(showScheduleModal)}
                                  className="mt-4 w-full gradient-brand text-white border-0 cursor-pointer rounded-xl"
                                  size="sm"
                                >
                                  <CalendarClock className="h-4 w-4 mr-1.5" />
                                  Confirm Schedule
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Regenerate */}
                      <div className="pt-4">
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating || generationsUsed >= 10}
                          variant="outline"
                          className="w-full cursor-pointer rounded-xl py-5"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                          Generate More Posts
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------- */}
          {/*  ADMIN VIEW — Stats Dashboard                              */}
          {/* -------------------------------------------------------- */}
          {activeView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
            >
              {/* Admin Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="h-7 w-7 text-orange-500" />
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Real-time analytics, generation stats, and system health
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdminLoading(true);
                      fetch('/api/admin')
                        .then((r) => r.json())
                        .then((data) => setAdminStats(data))
                        .catch(() => setAdminStats(null))
                        .finally(() => setAdminLoading(false));
                    }}
                    disabled={adminLoading}
                    className="cursor-pointer"
                  >
                    {adminLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('landing')}
                    className="cursor-pointer"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>

              {adminLoading && !adminStats ? (
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
                  </CardContent>
                </Card>
              ) : adminStats ? (
                <div className="space-y-6">
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-brand-muted flex items-center justify-center">
                            <Zap className="h-5 w-5 text-orange-500" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Total Generations</span>
                        </div>
                        <p className="text-3xl font-bold">{adminStats.totalGenerations}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-brand-muted flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-orange-500" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Posts Generated</span>
                        </div>
                        <p className="text-3xl font-bold">{adminStats.totalPostsGenerated}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-brand-muted flex items-center justify-center">
                            <Shield className="h-5 w-5 text-orange-500" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Rate Limited</span>
                        </div>
                        <p className="text-3xl font-bold">{adminStats.rateLimitedRequests}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-brand-muted flex items-center justify-center">
                            <Server className="h-5 w-5 text-orange-500" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Server Uptime</span>
                        </div>
                        <p className="text-3xl font-bold">
                          {Math.floor(adminStats.uptime / 3600)}h {Math.floor((adminStats.uptime % 3600) / 60)}m
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Platform */}
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-orange-500" />
                          Generations by Platform
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(adminStats.generationsByPlatform).length > 0 ? (
                            Object.entries(adminStats.generationsByPlatform)
                              .sort(([, a], [, b]) => b - a)
                              .map(([platform, count]) => {
                                const maxCount = Math.max(...Object.values(adminStats.generationsByPlatform));
                                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                const pInfo = PLATFORMS.find((p) => p.id === platform);
                                return (
                                  <div key={platform} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-medium capitalize flex items-center gap-1.5">
                                        {pInfo ? <pInfo.icon className="h-3.5 w-3.5" style={{ color: pInfo.color }} /> : null}
                                        {platform}
                                      </span>
                                      <span className="text-muted-foreground">{count} gen{count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full gradient-brand rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-8">No generations yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* By Tone */}
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Palette className="h-4 w-4 text-orange-500" />
                          Generations by Tone
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(adminStats.generationsByTone).length > 0 ? (
                            Object.entries(adminStats.generationsByTone)
                              .sort(([, a], [, b]) => b - a)
                              .map(([tone, count]) => {
                                const maxCount = Math.max(...Object.values(adminStats.generationsByTone));
                                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                const tInfo = TONES.find((t) => t.id === tone);
                                return (
                                  <div key={tone} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-medium">
                                        {tInfo ? `${tInfo.emoji} ${tInfo.label}` : tone}
                                      </span>
                                      <span className="text-muted-foreground">{count} gen{count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full gradient-brand rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-8">No generations yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* By Mode + Avg Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* By Mode */}
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-orange-500" />
                          Generation Modes
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(adminStats.generationsByMode).length > 0 ? (
                            Object.entries(adminStats.generationsByMode)
                              .sort(([, a], [, b]) => b - a)
                              .map(([mode, count]) => {
                                const modeLabels: Record<string, string> = {
                                  generate: 'Topic Generate',
                                  repurpose: 'Content Repurpose',
                                  enhance: 'Prompt Enhance',
                                };
                                return (
                                  <div key={mode} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                                    <span className="text-xs font-medium">{modeLabels[mode] || mode}</span>
                                    <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                                  </div>
                                );
                              })
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-6">No data yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          Quick Stats
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                            <span className="text-xs text-muted-foreground">Avg posts per generation</span>
                            <span className="text-sm font-semibold">
                              {adminStats.totalGenerations > 0
                                ? (adminStats.totalPostsGenerated / adminStats.totalGenerations).toFixed(1)
                                : '0'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                            <span className="text-xs text-muted-foreground">Rate limit hit rate</span>
                            <span className="text-sm font-semibold">
                              {adminStats.totalGenerations + adminStats.rateLimitedRequests > 0
                                ? ((adminStats.rateLimitedRequests / (adminStats.totalGenerations + adminStats.rateLimitedRequests)) * 100).toFixed(1)
                                : '0'}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                            <span className="text-xs text-muted-foreground">Most used platform</span>
                            <span className="text-sm font-semibold capitalize">
                              {Object.entries(adminStats.generationsByPlatform).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-500" />
                          System Health
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 py-2 px-3 bg-green-50 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-700">API Server: Online</span>
                          </div>
                          <div className="flex items-center gap-2 py-2 px-3 bg-green-50 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-700">AI Engine: Connected</span>
                          </div>
                          <div className="flex items-center gap-2 py-2 px-3 bg-green-50 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-700">Rate Limiter: Active</span>
                          </div>
                          <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-lg">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-medium text-amber-700">No external DB connected</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Generations Table */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Recent Generations
                        <Badge variant="secondary" className="text-[10px] ml-auto">
                          Last {adminStats.recentGenerations.length} of {adminStats.totalGenerations}
                        </Badge>
                      </h3>
                      {adminStats.recentGenerations.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Time</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Platform</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Tone</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Mode</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Requested</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Delivered</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Topic</th>
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">IP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminStats.recentGenerations.map((gen) => (
                                <tr key={gen.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                                    {new Date(gen.timestamp).toLocaleTimeString()}
                                  </td>
                                  <td className="py-2.5 px-3 capitalize flex items-center gap-1.5">
                                    {(() => {
                                      const pInfo = PLATFORMS.find((p) => p.id === gen.platform);
                                      return pInfo ? (
                                        <>
                                          <pInfo.icon className="h-3 w-3" style={{ color: pInfo.color }} />
                                          <span className="hidden sm:inline">{pInfo.name}</span>
                                          <span className="sm:hidden">{gen.platform}</span>
                                        </>
                                      ) : (
                                        <span>{gen.platform}</span>
                                      );
                                    })()}
                                  </td>
                                  <td className="py-2.5 px-3 capitalize">
                                    {TONES.find((t) => t.id === gen.tone)?.label || gen.tone}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <Badge variant="secondary" className="text-[10px]">
                                      {gen.mode === 'repurpose' ? 'Repurpose' : gen.mode === 'enhance' ? 'Enhance' : 'Generate'}
                                    </Badge>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">{gen.count}</td>
                                  <td className="py-2.5 px-3 font-mono font-semibold">{gen.postsGenerated}</td>
                                  <td className="py-2.5 px-3 max-w-[200px] truncate text-muted-foreground" title={gen.topic}>
                                    {gen.topic}
                                  </td>
                                  <td className="py-2.5 px-3 text-muted-foreground font-mono">{gen.ip}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h4 className="text-sm font-semibold mb-1">No generations recorded yet</h4>
                          <p className="text-xs text-muted-foreground">Stats will appear here once users start generating content</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="rounded-2xl border-red-200 bg-red-50/50">
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
                    <p className="text-sm text-muted-foreground mt-2">Could not connect to the admin API. Check the server status and try again.</p>
                    <Button
                      variant="outline"
                      className="mt-4 cursor-pointer"
                      onClick={() => {
                        setAdminLoading(true);
                        fetch('/api/admin')
                          .then((r) => r.json())
                          .then((data) => setAdminStats(data))
                          .catch(() => setAdminStats(null))
                          .finally(() => setAdminLoading(false));
                      }}
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <PostPilotLogo className="h-8 w-8" />
              <span className="text-sm font-semibold">PostPilot</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with AI. Designed for creators. &copy; 2026 PostPilot.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">
                Pricing
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">
                Features
              </button>
              <button onClick={() => setActiveView('admin')} className="hover:text-orange-500 transition-colors cursor-pointer flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </button>
              <span className="text-orange-500 font-medium">v2.1</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  AUTH MODAL                                                   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <Card className="rounded-2xl border-border/50 shadow-2xl">
                <CardContent className="p-8">
                  {status === 'authenticated' && session?.user ? (
                    /* ---- Logged In View ---- */
                    <div className="text-center">
                      {/* Close button */}
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => setShowAuthModal(false)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="h-16 w-16 rounded-full border-2 border-orange-300 mx-auto mb-4"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                          {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}

                      <h2 className="text-lg font-bold">{session.user.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{session.user.email}</p>

                      <div className="mt-6 space-y-3">
                        <Button
                          onClick={() => {
                            setShowAuthModal(false);
                            setActiveView('app');
                          }}
                          className="w-full gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-5"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Open Generator
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full cursor-pointer rounded-xl"
                          onClick={() => {
                            setShowAuthModal(false);
                            setActiveView('admin');
                          }}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>

                        <div className="pt-3 border-t border-border/50">
                          <Button
                            variant="ghost"
                            className="w-full cursor-pointer text-muted-foreground hover:text-red-500"
                            onClick={() => {
                              signOut({ callbackUrl: '/' });
                              setShowAuthModal(false);
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ---- Login/Signup View ---- */
                    <div>
                      {/* Close button */}
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => setShowAuthModal(false)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Logo */}
                      <div className="flex justify-center mb-6">
                        <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
                          <PostPilotLogo className="h-8 w-8" />
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-center">
                        {showAuthModal === true ? 'Welcome to PostPilot' : 'Sign In'}
                      </h2>
                      <p className="text-sm text-muted-foreground text-center mt-1.5">
                        Create viral social media content in seconds
                      </p>

                      {/* Google Sign In */}
                      <div className="mt-6">
                        <Button
                          onClick={() => signIn('google', { callbackUrl: '/' })}
                          className="w-full h-12 rounded-xl cursor-pointer border border-border bg-background hover:bg-muted text-foreground font-medium text-sm gap-3"
                          variant="outline"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3 mt-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Demo login */}
                      <div className="mt-6">
                        <Button
                          onClick={() => {
                            setShowAuthModal(false);
                            setActiveView('app');
                            toast.success('Welcome! You are using PostPilot as a guest. Sign in with Google to save your preferences.');
                          }}
                          className="w-full h-12 rounded-xl cursor-pointer border-0 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm gap-3"
                        >
                          <User className="h-5 w-5" />
                          Continue as Guest
                        </Button>
                      </div>

                      {/* Terms */}
                      <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
                        By continuing, you agree to our{' '}
                        <span className="underline cursor-pointer">Terms of Service</span>
                        {' '}and{' '}
                        <span className="underline cursor-pointer">Privacy Policy</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
