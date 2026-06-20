'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Rocket,
  BarChart3,
  Globe,
  Palette,
  Loader2,
  MessageSquare,
  Hash,
  Clock,
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
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#1DA1F2', desc: '280-char punchy posts' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', desc: 'Professional long-form' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', desc: 'Visual captions + hashtags' },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: '#000000', desc: 'Viral short hooks' },
  { id: 'youtube-long', name: 'YouTube Long', icon: Youtube, color: '#FF0000', desc: 'Full video description' },
  { id: 'youtube-shorts', name: 'YouTube Shorts', icon: Play, color: '#FF0000', desc: 'Short punchy hooks' },
] as const;

const TONES = [
  { id: 'professional', label: 'Serious', emoji: '💼' },
  { id: 'casual', label: 'Chill', emoji: '😎' },
  { id: 'humorous', label: 'Funny', emoji: '😂' },
  { id: 'inspirational', label: 'Motivation', emoji: '🚀' },
  { id: 'provocative', label: 'Bold', emoji: '🔥' },
  { id: 'educational', label: 'Teach', emoji: '📚' },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Generate weeks of social media content in under 30 seconds. Our AI understands platform algorithms, engagement patterns, and trending formats to produce posts that actually perform.',
  },
  {
    icon: Palette,
    title: 'Brand Voice Matching',
    description: 'Train the AI on your unique brand voice. Whether you are witty and casual or authoritative and data-driven, every post sounds authentically like you — never robotic or generic.',
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
    icon: MessageSquare,
    title: 'Content Repurposing',
    description: 'Turn a single blog post, video transcript, or podcast episode into 20+ unique social media posts. Maximize your content ROI by repurposing everything across every platform.',
  },
  {
    icon: Hash,
    title: 'Smart Hashtags',
    description: 'AI-powered hashtag research that finds the perfect balance of reach and relevance. No more guessing — get trending, niche, and branded hashtags that actually boost discoverability.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Describe Your Topic',
    description: 'Enter a topic, paste an article, or upload a transcript. PostPilot understands context and extracts the core message automatically.',
  },
  {
    step: '02',
    title: 'Choose Platform & Tone',
    description: 'Select which platforms you need content for and pick your tone. Professional for LinkedIn, casual for Twitter, viral hooks for TikTok.',
  },
  {
    step: '03',
    title: 'Generate & Customize',
    description: 'AI generates multiple unique posts instantly. Edit, mix, and remix until each post is perfect. Copy to clipboard or export to your scheduler.',
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
      'Twitter & LinkedIn only',
      '3 tone presets',
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
      'All 6 platform options',
      'All tone presets',
      'Advanced hashtag engine',
      'Content repurposing',
      'Brand voice training',
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
    text: 'PostPilot cut my content creation time from 4 hours to 15 minutes. The quality is insane — my engagement rate jumped 3x in the first month.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Marketing Director, TechFlow',
    text: 'We replaced our entire social media freelancing budget with PostPilot. The ROI is ridiculous — better content at a fraction of the cost.',
    avatar: 'MJ',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Solopreneur & Coach',
    text: 'I was spending $2K/month on content. Now I spend $29 and get better results. The brand voice matching is spooky good.',
    avatar: 'ER',
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: unique ID                                                  */
/* ------------------------------------------------------------------ */

let idCounter = 0;
function uid() {
  return `post-${++idCounter}-${Date.now()}`;
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [activeView, setActiveView] = useState<'landing' | 'app'>('landing');
  const [topic, setTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter');
  const [selectedTone, setSelectedTone] = useState<string>('casual');
  const [postCount, setPostCount] = useState(3);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to results */
  useEffect(() => {
    if (generatedPosts.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPosts]);

  /* ---------------------------------------------------------------- */
  /*  Generate handler                                                 */
  /* ---------------------------------------------------------------- */

  async function handleGenerate() {
    if (!topic.trim() || topic.trim().length < 3) {
      toast.error('Please enter a topic (at least 3 characters)');
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          platform: selectedPlatform,
          tone: selectedTone,
          count: postCount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Generation failed. Please try again.');
        return;
      }

      const allPosts: GeneratedPost[] = data.posts.map((content: string) => ({
        id: uid(),
        content,
        platform: data.platform,
        copied: false,
      }));

      // Clamp to exactly the requested count — no more, no less
      const posts = allPosts.slice(0, postCount);

      setGeneratedPosts(posts);
      toast.success(`Generated ${posts.length} post${posts.length > 1 ? 's' : ''}!`);
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
  /*  Clear results                                                    */
  /* ---------------------------------------------------------------- */

  function handleClear() {
    setGeneratedPosts([]);
    setTopic('');
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
              <Rocket className="h-5 w-5 text-white" />
            </div>
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
            <Button
              onClick={() => setActiveView('app')}
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
                      in seconds. Stop spending hours writing — start posting content that actually converts.
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
                        onClick={() => setActiveView('app')}
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
                      PostPilot is not just another AI writer. It is a complete content engine built for creators who want results, not just output.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
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
                      From idea to posts in{' '}
                      <span className="gradient-text">30 seconds</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      Three simple steps. Zero learning curve. Start creating viral content immediately.
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
                      Start free. Upgrade when you are ready to scale your content machine.
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
                              onClick={() => setActiveView('app')}
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
                        onClick={() => setActiveView('app')}
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
                    Enter a topic and let AI craft viral posts for your chosen platform
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView('landing')}
                  className="cursor-pointer"
                >
                  Back to Home
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
                {/* LEFT: Controls */}
                <div className="space-y-6">
                  {/* Topic Input */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <label className="text-sm font-semibold mb-3 block">
                        <Sparkles className="h-4 w-4 inline mr-1.5 text-orange-500" />
                        What do you want to post about?
                      </label>
                      <Textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. 'How AI is changing remote work in 2026', '5 productivity hacks for entrepreneurs', 'Why every startup needs a content strategy'..."
                        className="min-h-[120px] resize-none rounded-xl text-sm leading-relaxed"
                      />
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{topic.length} characters</span>
                        <span className={topic.length >= 3 ? 'text-orange-500' : ''}>
                          {topic.length >= 3 ? 'Ready to generate' : 'Min 3 characters'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Selector */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <label className="text-sm font-semibold mb-3 block">
                        <Globe className="h-4 w-4 inline mr-1.5 text-orange-500" />
                        Target Platform
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p.id)}
                            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                              selectedPlatform === p.id
                                ? 'border-orange-400 bg-orange-50 text-orange-700'
                                : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <p.icon className="h-4 w-4" style={{ color: selectedPlatform === p.id ? undefined : p.color }} />
                            <div className="text-left">
                              <div className="text-xs font-semibold">{p.name}</div>
                              <div className="text-[10px] opacity-60">{p.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tone + Count */}
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

                      {/* Post Count */}
                      <div>
                        <label className="text-sm font-semibold mb-3 block">
                          Number of Posts
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
                      disabled={isGenerating || !topic.trim() || topic.trim().length < 3}
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
                          Enter a topic, choose your platform and tone, then hit generate. Your AI-crafted social media posts will appear here.
                        </p>
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
                          AI is crafting {postCount} unique posts for {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
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
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {platformIcon(selectedPlatform, 'h-3.5 w-3.5')}
                          {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                        </div>
                      </div>

                      {generatedPosts.map((post, i) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.08 }}
                        >
                          <Card className="rounded-2xl border-border/50 card-lift">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                    #{i + 1}
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(post.id, post.content)}
                                    className="cursor-pointer h-8 px-2.5"
                                  >
                                    {post.copied ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {platformIcon(post.platform, 'h-3.5 w-3.5')}
                                  <span className="capitalize">{TONES.find((t) => t.id === selectedTone)?.label}</span>
                                  <span>•</span>
                                  <span>{post.content.length} chars</span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                  AI Generated
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {/* Regenerate */}
                      <div className="pt-4">
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
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
        </AnimatePresence>
      </main>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                <Rocket className="h-4 w-4 text-white" />
              </div>
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
              <span className="text-orange-500 font-medium">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
