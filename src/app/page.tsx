'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
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
  Sun,
  Moon,
  Target,
  CalendarDays,
  BookTemplate,
  ImageIcon,
  AudioLines,
  Download,
  ChevronLeft,
  Plus,
  Trash2,
  Flame,
  MessageCircle,
  Megaphone,
  BookOpen,
  Camera,
  Trophy,
  GraduationCap,
  Heart,
  PenTool,
  Upload,
  FileUp,
  FileType,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface GeneratedPost {
  id: string;
  content: string;
  platform: string;
  copied: boolean;
  scheduled?: boolean;
  viralScore?: number;
  estimatedLikes?: number;
  estimatedComments?: number;
  estimatedShares?: number;
  generatedImage?: string;
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

interface CalendarPost {
  id: string;
  date: string;
  content: string;
  platform: string;
}

interface PostTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  topic: string;
  tone: string;
}

interface BrandVoice {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

/* ================================================================== */
/*  Data                                                               */
/* ================================================================== */

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#1DA1F2', desc: 'Short & punchy tweets' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', desc: 'Long pro posts' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', desc: 'Captions + hashtags' },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: '#000000', desc: 'Viral short hooks' },
  { id: 'youtube-long', name: 'YT Long', icon: Youtube, color: '#FF0000', desc: 'Full video description' },
  { id: 'youtube-shorts', name: 'YT Shorts', icon: Play, color: '#FF0000', desc: 'Short punchy hooks' },
] as const;

const TONES = [
  { id: 'professional', label: 'Serious', emoji: '💼' },
  { id: 'casual', label: 'Chill', emoji: '😎' },
  { id: 'humorous', label: 'Funny', emoji: '😂' },
  { id: 'inspirational', label: 'Motivation', emoji: '🚀' },
  { id: 'provocative', label: 'Bold', emoji: '🔥' },
  { id: 'educational', label: 'Teach', emoji: '📚' },
] as const;

const APP_TABS = [
  { id: 'generate', label: 'Generate', icon: Sparkles },
  { id: 'repurpose', label: 'Repurpose', icon: FileUp },
  { id: 'hooks', label: 'Hook Lab', icon: Target },
  { id: 'hashtags', label: 'Hashtag Lab', icon: Hash },
  { id: 'thread', label: 'Thread Builder', icon: MessageSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'templates', label: 'Templates', icon: BookTemplate },
  { id: 'images', label: 'AI Images', icon: ImageIcon },
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
      '20 credits on sign-up',
      '1 credit per generation',
      'All 6 platforms',
      'All 6 tone presets',
      'Smart prompt enhancer (free)',
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
      '500 credits per month',
      '1 credit per generation',
      'All 6 platforms + multi-platform blast',
      'Brand voice training',
      'Content repurposing',
      'Schedule & publish',
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
      'Unlimited credits',
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

const DEFAULT_TEMPLATES: PostTemplate[] = [
  { id: 'tpl-1', name: 'Product Launch', icon: '🚀', description: 'Announce a new product with maximum impact', topic: 'Launch of our new AI-powered productivity tool that automates 80% of repetitive tasks', tone: 'provocative' },
  { id: 'tpl-2', name: 'Motivational Quote', icon: '💎', description: 'Inspire your audience with powerful words', topic: 'Why consistency beats talent every time and how small daily habits create extraordinary results', tone: 'inspirational' },
  { id: 'tpl-3', name: 'How-To Guide', icon: '📖', description: 'Share step-by-step knowledge', topic: '5-step guide to doubling your productivity using time-blocking and the Pomodoro technique', tone: 'educational' },
  { id: 'tpl-4', name: 'Behind the Scenes', icon: '🎬', description: 'Show the human side of your brand', topic: 'A day in the life of our startup team building features users actually love', tone: 'casual' },
  { id: 'tpl-5', name: 'Testimonial', icon: '⭐', description: 'Share social proof from happy customers', topic: 'How our customer grew their revenue by 300% using our platform in just 6 months', tone: 'professional' },
  { id: 'tpl-6', name: 'Poll/Question', icon: '📊', description: 'Drive engagement with questions', topic: 'What is the one skill that helped your career the most — hard skills or soft skills?', tone: 'casual' },
  { id: 'tpl-7', name: 'News/Journal', icon: '📰', description: 'Share industry news with your take', topic: 'Breaking: AI content tools are changing how brands approach social media marketing in 2026', tone: 'professional' },
  { id: 'tpl-8', name: 'Storytelling', icon: '✍️', description: 'Tell compelling stories that resonate', topic: 'The unexpected lesson I learned from failing my first business and how it led to my biggest success', tone: 'inspirational' },
];

const DEFAULT_BRAND_VOICES: BrandVoice[] = [
  { id: 'bv-1', name: 'Startup Tech', description: 'Bold, fast-paced, innovation-focused. Think Silicon Valley energy.', systemPrompt: 'Write like a tech startup founder who is excited about innovation. Use industry jargon sparingly but effectively. Be bold about claims, reference data points, and maintain a forward-thinking energy. Short sentences. High impact.' },
  { id: 'bv-2', name: 'Luxury Brand', description: 'Sophisticated, exclusive, aspirational. Think high-end fashion house.', systemPrompt: 'Write with the elegance and exclusivity of a luxury brand. Use refined language, subtle sophistication, and aspirational messaging. Avoid slang and casual phrasing. Create a sense of exclusivity and desirability. Understated but powerful.' },
  { id: 'bv-3', name: 'Casual Creator', description: 'Friendly, relatable, conversational. Think YouTuber energy.', systemPrompt: 'Write like a popular creator talking directly to their community. Use casual language, conversational tone, and relatable examples. Include personal touches and "I" statements. Feel like a text from a smart friend.' },
  { id: 'bv-4', name: 'Corporate', description: 'Professional, polished, trustworthy. Think Fortune 500.', systemPrompt: 'Write in a polished corporate style that is professional without being stiff. Use clear business language, reference industry standards and best practices. Maintain authority and credibility while being approachable.' },
  { id: 'bv-5', name: 'Edgy/Gen Z', description: 'Raw, authentic, unfiltered. Think TikTok creator.', systemPrompt: 'Write like a Gen Z creator who is unapologetically authentic. Use current internet slang and cultural references. Be direct, slightly provocative, and emotionally honest. Break the fourth wall. No corporate speak.' },
  { id: 'bv-6', name: 'Motivational Coach', description: 'Uplifting, empowering, action-oriented. Think Tony Robbins energy.', systemPrompt: 'Write like a motivational coach who genuinely cares about people\'s growth. Use empowering language, action-oriented statements, and emotional triggers. Inspire people to take immediate action. Use "you" statements frequently.' },
];

/* ================================================================== */
/*  Logo Component                                                     */
/* ================================================================== */

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

/* ================================================================== */
/*  Helper: unique ID                                                  */
/* ================================================================== */

let idCounter = 0;
function uid() {
  return `post-${++idCounter}-${Date.now()}`;
}

/* ================================================================== */
/*  Viral Score Calculator                                             */
/* ================================================================== */

function calculateViralScore(content: string): { score: number; likes: number; comments: number; shares: number } {
  let score = 40;
  const lower = content.toLowerCase();

  // Pattern interrupts
  if (/nobody talks about|stop scrolling|pov:|the #\d+ reason|what if i told you/i.test(lower)) score += 12;
  // Questions drive engagement
  if (/\?$/.test(lower.trim()) || /what do you think|agree\?|your thoughts/i.test(lower)) score += 8;
  // Emotional words
  if (/incredible|amazing|unbelievable|insane|mind-blowing|shocking/i.test(lower)) score += 7;
  // CTA
  if (/follow|subscribe|save this|share|retweet|comment/i.test(lower)) score += 6;
  // Numbers/stats
  if (/\d+%|\$[\d,]+|\d+x|\d+k|\d+\s*(million|thousand)/i.test(lower)) score += 8;
  // Short and punchy (good for Twitter/TikTok)
  if (content.length < 200) score += 5;
  // Lines (good structure)
  if (content.split('\n').length > 3) score += 4;
  // Emoji usage
  if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(lower)) score += 3;

  score = Math.min(98, Math.max(15, score));

  const followers = 10000;
  return {
    score,
    likes: Math.round((score / 100) * followers * (0.02 + Math.random() * 0.08)),
    comments: Math.round((score / 100) * followers * (0.003 + Math.random() * 0.01)),
    shares: Math.round((score / 100) * followers * (0.005 + Math.random() * 0.015)),
  };
}

function ViralScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Good' : 'Average';
  return (
    <span className={`inline-flex items-center gap-1 ${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
      <Flame className="h-2.5 w-2.5" />
      {score}/100 · {label}
    </span>
  );
}

/* ================================================================== */
/*  Admin Stats Types                                                  */
/* ================================================================== */

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

/* ================================================================== */
/*  Platform Character Limits                                           */
/* ================================================================== */

const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  tiktok: 150,
  'youtube-long': 5000,
  'youtube-shorts': 150,
};

/* ================================================================== */
/*  localStorage + Server-side hybrid helpers                            */
/* ================================================================== */

function getCalendarPosts(): CalendarPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('postpilot-calendar');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCalendarPosts(posts: CalendarPost[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('postpilot-calendar', JSON.stringify(posts));
}
function getCustomTemplates(): PostTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('postpilot-templates');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCustomTemplates(t: PostTemplate[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('postpilot-templates', JSON.stringify(t));
}
function getCustomVoices(): BrandVoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('postpilot-voices');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCustomVoices(v: BrandVoice[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('postpilot-voices', JSON.stringify(v));
}

/* ================================================================== */
/*  PDF Carousel Generator (Client-side)                                 */
/* ================================================================== */

function generateCarouselPDF(slides: string[], title: string) {
  // Create a printable HTML document with slide layout
  const slideHTML = slides.map((text, i) => `
    <div class="slide" style="
      page-break-after: always;
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      background: linear-gradient(135deg, #F97316 0%, #F59E0B 100%);
      color: white;
    ">
      <div style="position: absolute; top: 30px; left: 40px; font-size: 12px; opacity: 0.7;">${title}</div>
      <div style="position: absolute; top: 30px; right: 40px; font-size: 14px; font-weight: bold;">${i + 1} / ${slides.length}</div>
      <div style="max-width: 600px; font-size: 22px; line-height: 1.6; text-align: center; font-weight: 500;">${text.replace(/\n/g, '<br>')}</div>
      <div style="position: absolute; bottom: 30px; font-size: 11px; opacity: 0.6;">Generated by PostPilot</div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html><html><head><title>${title} - Carousel</title></head><body style="margin:0;padding:0;">${slideHTML}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    setTimeout(() => { win.print(); }, 500);
  }
  URL.revokeObjectURL(url);
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [activeView, setActiveView] = useState<'landing' | 'app' | 'admin'>('landing');
  const [activeTab, setActiveTab] = useState('generate');

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
  const [credits, setCredits] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  /* Hook Lab state */
  const [hookTopic, setHookTopic] = useState('');
  const [hookTone, setHookTone] = useState('casual');
  const [hooks, setHooks] = useState<string[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  /* Hashtag Lab state */
  const [hashtagTopic, setHashtagTopic] = useState('');
  const [hashtagPlatform, setHashtagPlatform] = useState('instagram');
  const [hashtags, setHashtags] = useState<{ trending: string[]; niche: string[]; broad: string[] } | null>(null);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  /* Thread Builder state */
  const [threadTopic, setThreadTopic] = useState('');
  const [threadTone, setThreadTone] = useState('casual');
  const [threadTweets, setThreadTweets] = useState<string[]>([]);
  const [threadType, setThreadType] = useState<'thread' | 'carousel'>('thread');
  const [isGeneratingThread, setIsGeneratingThread] = useState(false);

  /* Calendar state */
  const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [showCalendarAddPost, setShowCalendarAddPost] = useState(false);
  const [calendarNewPostContent, setCalendarNewPostContent] = useState('');
  const [calendarNewPostPlatform, setCalendarNewPostPlatform] = useState('twitter');

  /* Templates state */
  const [customTemplates, setCustomTemplates] = useState<PostTemplate[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplTopic, setNewTplTopic] = useState('');
  const [newTplTone, setNewTplTone] = useState('casual');
  const [newTplDesc, setNewTplDesc] = useState('');

  /* Brand Voices state */
  const [customVoices, setCustomVoices] = useState<BrandVoice[]>([]);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const [showNewVoice, setShowNewVoice] = useState(false);
  const [newVoiceName, setNewVoiceName] = useState('');
  const [newVoiceDesc, setNewVoiceDesc] = useState('');
  const [newVoicePrompt, setNewVoicePrompt] = useState('');

  /* AI Images state */
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<{ id: string; prompt: string; image: string }[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  /* Content Repurposing Studio state */
  const [repurposeInput, setRepurposeInput] = useState('');
  const [repurposeFile, setRepurposeFile] = useState<string | null>(null);
  const [repurposeFileName, setRepurposeFileName] = useState('');
  const [repurposeResults, setRepurposeResults] = useState<{
    tweets: string[];
    linkedinPosts: string[];
    hooks: string[];
    instagramCaptions: string[];
    tiktokCaptions: string[];
    shortsScripts: string[];
  } | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Server-side sync state */
  const [dataSynced, setDataSynced] = useState(false);

  /* Admin state */
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  /* Load from localStorage */
  useEffect(() => {
    setCalendarPosts(getCalendarPosts());
    setCustomTemplates(getCustomTemplates());
    setCustomVoices(getCustomVoices());
  }, []);

  /* Server-side sync for authenticated users */
  useEffect(() => {
    if (status !== 'authenticated' || dataSynced || !session?.user) return;
    const userId = (session.user as any).id;

    async function syncToServer() {
      try {
        // Sync calendar posts
        const localCal = getCalendarPosts();
        for (const post of localCal) {
          await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date: post.date, content: post.content, platform: post.platform }),
          });
        }
        // Sync templates
        const localTpl = getCustomTemplates();
        for (const tpl of localTpl) {
          await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name: tpl.name, icon: tpl.icon, description: tpl.description, topic: tpl.topic, tone: tpl.tone }),
          });
        }
        // Sync voices
        const localVoices = getCustomVoices();
        for (const voice of localVoices) {
          await fetch('/api/voices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name: voice.name, description: voice.description, systemPrompt: voice.systemPrompt }),
          });
        }
        setDataSynced(true);
      } catch (err) {
        console.warn('Server sync failed (data kept locally):', err);
      }
    }
    syncToServer();
  }, [status, session, dataSynced]);

  /* Require sign-in before accessing the app */
  const goToApp = () => {
    if (status === 'authenticated') {
      setActiveView('app');
    } else {
      signIn('google');
    }
  };

  /* Auto-scroll to results */
  useEffect(() => {
    if (generatedPosts.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPosts]);

  /* Fetch user credits when authenticated */
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userId = (session.user as any).id;
      const email = (session.user as any).email;
      fetch('/api/generate?userId=' + userId + '&email=' + encodeURIComponent(email))
        .then((r) => r.json())
        .then((data) => {
          setCredits(data.credits);
          setUserPlan(data.plan);
        })
        .catch(() => {});
    }
  }, [status, session]);

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
      const activeVoiceObj = [...DEFAULT_BRAND_VOICES, ...customVoices].find(v => v.id === activeVoice);

      // Generate for ALL platforms in parallel using Promise.allSettled
      const platformResults = await Promise.allSettled(
        selectedPlatforms.map(async (platform) => {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: mainTopic,
              platform,
              tone: selectedTone,
              count: postCount,
              mode: inputMode === 'repurpose' ? 'repurpose' : 'generate',
              brandVoice: activeVoiceObj ? activeVoiceObj.systemPrompt : (brandVoice.trim() || undefined),
              userId: status === 'authenticated' ? (session?.user as any)?.id : undefined,
            }),
          });

          const data = await res.json();

          if (res.status === 403) {
            throw new Error(data.error || 'No credits remaining');
          }

          if (!res.ok || !data.success) {
            throw new Error(data.error || `Generation failed for ${platform}`);
          }

          return { platform, data };
        })
      );

      // Collect results from all successful platform requests
      const allResults: GeneratedPost[] = [];
      const failedPlatforms: string[] = [];

      for (let i = 0; i < platformResults.length; i++) {
        const result = platformResults[i];
        const platformName = PLATFORMS.find((p) => p.id === selectedPlatforms[i])?.name || selectedPlatforms[i];

        if (result.status === 'fulfilled') {
          const { data } = result.value;

          if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
          if (data.plan) setUserPlan(data.plan);

          const posts: GeneratedPost[] = data.posts.map((content: string) => {
            const viral = calculateViralScore(content);
            return {
              id: uid(),
              content,
              platform: data.platform || selectedPlatforms[i],
              copied: false,
              viralScore: viral.score,
              estimatedLikes: viral.likes,
              estimatedComments: viral.comments,
              estimatedShares: viral.shares,
            };
          });

          allResults.push(...posts.slice(0, postCount));
        } else {
          failedPlatforms.push(platformName);
        }
      }

      setGeneratedPosts(allResults);
      setGenerationsUsed((prev) => prev + 1);

      const platformNames = selectedPlatforms.map((id) => PLATFORMS.find((p) => p.id === id)?.name).filter(Boolean).join(', ');
      if (allResults.length > 0) {
        toast.success(`Generated ${allResults.length} posts across ${platformNames}!`);
      }
      if (failedPlatforms.length > 0) {
        toast.error(`Failed for: ${failedPlatforms.join(', ')}. These platforms may be slower — try them individually.`);
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Hook Generator handler                                            */
  /* ---------------------------------------------------------------- */

  async function handleGenerateHooks() {
    if (!hookTopic.trim() || hookTopic.trim().length < 3) {
      toast.error('Enter a topic for hook generation');
      return;
    }
    setIsGeneratingHooks(true);
    setHooks([]);
    try {
      const activeVoiceObj = [...DEFAULT_BRAND_VOICES, ...customVoices].find(v => v.id === activeVoice);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: hookTopic.trim(),
          platform: 'twitter',
          tone: hookTone,
          count: 5,
          mode: 'hook',
          brandVoice: activeVoiceObj ? activeVoiceObj.systemPrompt : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.hooks) {
        setHooks(data.hooks);
        toast.success(`Generated ${data.hooks.length} viral hooks!`);
      } else {
        toast.error(data.error || 'Failed to generate hooks');
      }
    } catch {
      toast.error('Network error - check console for details');
    } finally {
      setIsGeneratingHooks(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Hashtag Generator handler                                         */
  /* ---------------------------------------------------------------- */

  async function handleGenerateHashtags() {
    if (!hashtagTopic.trim() || hashtagTopic.trim().length < 3) {
      toast.error('Enter a topic for hashtag generation');
      return;
    }
    setIsGeneratingHashtags(true);
    setHashtags(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: hashtagTopic.trim(),
          platform: hashtagPlatform,
          tone: 'casual',
          count: 15,
          mode: 'hashtags',
        }),
      });
      const data = await res.json();
      if (data.success && data.rawHashtags) {
        // Parse the hashtags
        const raw = data.rawHashtags;
        const trendingMatch = raw.match(/(?:TRENDING:)\s*([\s\S]*?)(?:\n\s*\n|\nNICHE:)/i);
        const nicheMatch = raw.match(/(?:NICHE:)\s*([\s\S]*?)(?:\n\s*\n|\nBROAD:)/i);
        const broadMatch = raw.match(/(?:BROAD:)\s*([\s\S]*?)$/i);
        const parseH = (s: string) => (s.match(/#[\w]+/g) || []);
        setHashtags({
          trending: parseH(trendingMatch?.[1] || ''),
          niche: parseH(nicheMatch?.[1] || ''),
          broad: parseH(broadMatch?.[1] || ''),
        });
        toast.success('Hashtags generated!');
      } else {
        toast.error('Failed to generate hashtags');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsGeneratingHashtags(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Thread Builder handler                                            */
  /* ---------------------------------------------------------------- */

  async function handleGenerateThread() {
    if (!threadTopic.trim() || threadTopic.trim().length < 3) {
      toast.error('Enter a topic for thread/carousel generation');
      return;
    }
    setIsGeneratingThread(true);
    setThreadTweets([]);
    try {
      const activeVoiceObj = [...DEFAULT_BRAND_VOICES, ...customVoices].find(v => v.id === activeVoice);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: threadTopic.trim(),
          tone: threadTone,
          count: 7,
          mode: threadType === 'thread' ? 'thread' : 'carousel',
          brandVoice: activeVoiceObj ? activeVoiceObj.systemPrompt : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setThreadTweets(threadType === 'thread' ? (data.tweets || []) : (data.slides || []));
        toast.success(`${threadType === 'thread' ? 'Thread' : 'Carousel'} generated!`);
      } else {
        toast.error('Failed to generate');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsGeneratingThread(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  AI Image handler                                                 */
  /* ---------------------------------------------------------------- */

  async function handleGenerateImage(prompt?: string) {
    const imgPrompt = prompt || imagePrompt.trim();
    if (!imgPrompt || imgPrompt.length < 3) {
      toast.error('Enter a prompt for image generation');
      return;
    }
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt }),
      });
      const data = await res.json();
      if (data.success && data.image) {
        setGeneratedImages(prev => [{ id: uid(), prompt: imgPrompt, image: data.image }, ...prev]);
        toast.success('Image generated!');
      } else {
        toast.error(data.error || 'Failed to generate image');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsGeneratingImage(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  File Upload Handler (Content Repurposing)                        */
  /* ---------------------------------------------------------------- */

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRepurposeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRepurposeFile(text);
      setRepurposeInput(text.slice(0, 5000)); // Limit to first 5000 chars
      toast.success(`Loaded "${file.name}" (${text.length} characters)`);
    };
    reader.readAsText(file);
  }

  /* ---------------------------------------------------------------- */
  /*  Content Repurposing Studio handler                               */
  /* ---------------------------------------------------------------- */

  async function handleRepurpose() {
    const content = repurposeInput.trim();
    if (!content || content.length < 20) {
      toast.error('Paste or upload content first (at least 20 characters)');
      return;
    }
    setIsRepurposing(true);
    setRepurposeResults(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: content,
          platform: 'multi',
          tone: selectedTone,
          count: 5,
          mode: 'repurpose',
          userId: status === 'authenticated' ? (session?.user as any)?.id : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRepurposeResults({
          tweets: data.tweets || [],
          linkedinPosts: data.linkedinPosts || [],
          hooks: data.hooks || [],
          instagramCaptions: data.instagramCaptions || [],
          tiktokCaptions: data.tiktokCaptions || [],
          shortsScripts: data.shortsScripts || [],
        });
        toast.success('Content repurposed into multiple formats!');
      } else {
        toast.error(data.error || 'Failed to repurpose content');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsRepurposing(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Copy handlers                                                     */
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

  function handleCopyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
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

  /* ---------------------------------------------------------------- */
  /*  Apply template to main generator                                 */
  /* ---------------------------------------------------------------- */

  function applyTemplate(tpl: PostTemplate) {
    setTopic(tpl.topic);
    setSelectedTone(tpl.tone);
    setActiveTab('generate');
    toast.success(`Template "${tpl.name}" applied! Click Generate to create posts.`);
  }

  /* ---------------------------------------------------------------- */
  /*  Add post to calendar                                             */
  /* ---------------------------------------------------------------- */

  function addPostToCalendar(post: GeneratedPost) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const newPost: CalendarPost = { id: uid(), date: dateStr, content: post.content.slice(0, 100), platform: post.platform };
    const updated = [...calendarPosts, newPost];
    setCalendarPosts(updated);
    saveCalendarPosts(updated);
    toast.success('Post added to calendar!');
  }

  function addManualCalendarPost(day: number) {
    if (!calendarNewPostContent.trim()) {
      toast.error('Enter post content first');
      return;
    }
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newPost: CalendarPost = { id: uid(), date: dateStr, content: calendarNewPostContent.trim().slice(0, 100), platform: calendarNewPostPlatform };
    const updated = [...calendarPosts, newPost];
    setCalendarPosts(updated);
    saveCalendarPosts(updated);
    setCalendarNewPostContent('');
    setShowCalendarAddPost(false);
    toast.success(`Post scheduled for ${calendarMonthName} ${day}!`);
  }

  /* ---------------------------------------------------------------- */
  /*  Calendar helpers                                                */
  /* ---------------------------------------------------------------- */

  const calendarDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarMonthName = new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  const getPostsForDay = (day: number) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarPosts.filter(p => p.date === dateStr);
  };

  function prevMonth() {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  }
  function nextMonth() {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  }

  /* ---------------------------------------------------------------- */
  /*  Save custom voice/template                                      */
  /* ---------------------------------------------------------------- */

  function saveNewVoice() {
    if (!newVoiceName.trim() || !newVoicePrompt.trim()) return;
    const voice: BrandVoice = { id: uid(), name: newVoiceName, description: newVoiceDesc, systemPrompt: newVoicePrompt };
    const updated = [...customVoices, voice];
    setCustomVoices(updated);
    saveCustomVoices(updated);
    setNewVoiceName(''); setNewVoiceDesc(''); setNewVoicePrompt('');
    setShowNewVoice(false);
    toast.success('Brand voice saved!');
  }

  function saveNewTemplate() {
    if (!newTplName.trim() || !newTplTopic.trim()) return;
    const tpl: PostTemplate = { id: uid(), name: newTplName, icon: '📝', description: newTplDesc, topic: newTplTopic, tone: newTplTone };
    const updated = [...customTemplates, tpl];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    setNewTplName(''); setNewTplTopic(''); setNewTplDesc(''); setNewTplTone('casual');
    setShowNewTemplate(false);
    toast.success('Template saved!');
  }

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
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            {credits !== null && (
              <Badge variant="secondary" className="hidden sm:flex text-xs gap-1.5">
                <Zap className="h-3 w-3 text-orange-500" />
                {credits > 0 ? `${credits} credits` : 'Upgrade'}
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
                onClick={() => signIn('google')}
                className="cursor-pointer text-xs gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button
              onClick={() => setActiveView('app')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-1.5" />
              Trial
            </Button>
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
                {credits !== null && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-orange-500 inline mr-1" />
                    {credits > 0 ? `${credits} credits remaining` : 'Upgrade for more credits'}
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
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-orange-200/40 via-amber-100/30 to-transparent blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-orange-100/20 to-transparent blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
                  <div className="text-center max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                        Trusted by 12,000+ creators & brands
                      </Badge>
                    </motion.div>

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

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                      PostPilot is the AI content engine that generates platform-optimized social media posts
                      in seconds. Repurpose articles, train your brand voice, and schedule posts — all in one dashboard.
                    </motion.p>

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
                      Start free with 20 credits. Each generation costs 1 credit. Upgrade to Pro for 500 credits and unlock enterprise features.
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
          {/*  APP VIEW — Content Generator with Tabs                     */}
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Content Studio
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    AI-powered social media content creation suite
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs gap-1.5">
                    <Zap className="h-3 w-3 text-orange-500" />
                    {credits !== null ? (credits > 0 ? `${credits} credits left` : 'No credits') : '—'}
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

              {/* Tab Navigation */}
              <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex items-center gap-1 min-w-max">
                  {APP_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* ====================================================== */}
                {/*  TAB: Generate (existing generator)                       */}
                {/* ====================================================== */}
                {activeTab === 'generate' && (
                  <motion.div key="generate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {/* Active Brand Voice indicator */}
                    {activeVoice && (
                      <div className="mb-4 flex items-center gap-2">
                        <AudioLines className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Voice:</span>
                        <Badge variant="secondary" className="text-xs">
                          {[...DEFAULT_BRAND_VOICES, ...customVoices].find(v => v.id === activeVoice)?.name || 'Custom'}
                        </Badge>
                        <button onClick={() => setActiveVoice(null)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer ml-1">✕ Clear</button>
                      </div>
                    )}

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
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${inputMode === 'topic' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                  <Lightbulb className="h-3 w-3 inline mr-1" />Topic
                                </button>
                                <button
                                  onClick={() => setInputMode('repurpose')}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${inputMode === 'repurpose' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                  <FileText className="h-3 w-3 inline mr-1" />Repurpose
                                </button>
                              </div>
                            </div>

                            {inputMode === 'topic' ? (
                              <div>
                                <Textarea
                                  value={topic}
                                  onChange={(e) => setTopic(e.target.value)}
                                  placeholder="e.g. 'How AI is changing remote work in 2026', '5 productivity hacks for entrepreneurs'..."
                                  className="min-h-[100px] resize-none rounded-xl text-sm leading-relaxed"
                                />
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{topic.length} characters</span>
                                    <span className={topic.length >= 3 ? 'text-orange-500' : ''}>{topic.length >= 3 ? 'Ready' : 'Min 3 chars'}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={handleEnhance} disabled={isEnhancing || topic.trim().length < 3} className="text-xs cursor-pointer text-orange-500 hover:text-orange-600 h-7 px-2">
                                    {isEnhancing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}
                                    Enhance Prompt
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Textarea
                                  value={repurposeText}
                                  onChange={(e) => setRepurposeText(e.target.value)}
                                  placeholder="Paste a blog article, video transcript, newsletter, or any long-form content..."
                                  className="min-h-[140px] resize-none rounded-xl text-sm leading-relaxed"
                                />
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Link2 className="h-3 w-3" />
                                    <span>{repurposeText.length} characters</span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={handleEnhance} disabled={isEnhancing || repurposeText.trim().length < 3} className="text-xs cursor-pointer text-orange-500 hover:text-orange-600 h-7 px-2">
                                    {isEnhancing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}
                                    Enhance
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Platform Selector */}
                        <Card className="rounded-2xl border-border/50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-semibold">
                                <Globe className="h-4 w-4 inline mr-1.5 text-orange-500" />
                                Target Platform{selectedPlatforms.length > 1 ? 's' : ''}
                              </label>
                              <div className="flex items-center gap-2">
                                {selectedPlatforms.length > 1 && <Badge variant="secondary" className="text-[10px]">{selectedPlatforms.length} selected</Badge>}
                                <button onClick={() => setSelectedPlatforms(selectedPlatforms.length === PLATFORMS.length ? ['twitter'] : PLATFORMS.map(p => p.id))} className="text-[10px] text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
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
                                    selectedPlatforms.includes(p.id) ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <p.icon className="h-4 w-4" style={{ color: selectedPlatforms.includes(p.id) ? undefined : p.color }} />
                                  <div className="text-left">
                                    <div className="text-xs font-semibold">{p.name}</div>
                                    <div className="text-[10px] opacity-60">{p.desc}</div>
                                  </div>
                                  {selectedPlatforms.includes(p.id) && <Check className="h-3 w-3 ml-auto text-orange-500" />}
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tone + Brand Voice */}
                        <Card className="rounded-2xl border-border/50">
                          <CardContent className="p-6 space-y-5">
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
                                      selectedTone === t.id ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    {t.emoji} {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-border/50 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-orange-500" />
                                  Post Count
                                </label>
                                <span className="text-xs text-muted-foreground">{postCount} posts</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {[1, 2, 3, 5, 8, 10].map((n) => (
                                  <button
                                    key={n}
                                    onClick={() => setPostCount(n)}
                                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                      postCount === n ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'border-border bg-background hover:bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => setShowBrandVoice(!showBrandVoice)}
                              className="flex items-center gap-2 text-sm font-semibold cursor-pointer hover:text-orange-500 transition-colors"
                            >
                              <Mic className="h-4 w-4 text-orange-500" />
                              Custom Brand Voice
                              <ChevronDown className={`h-4 w-4 transition-transform ${showBrandVoice ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {showBrandVoice && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="mt-2">
                                    <Textarea
                                      value={brandVoice}
                                      onChange={(e) => setBrandVoice(e.target.value)}
                                      placeholder="Describe your brand voice or paste examples of your past posts..."
                                      className="min-h-[80px] resize-none rounded-xl text-sm leading-relaxed"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2">Pro Tip: Toggle custom brand voice above or create your own in the settings.</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>

                        {/* Generate Button */}
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="w-full gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-6 text-base font-semibold"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5 mr-2" />
                              Generate {postCount} Post{postCount !== 1 ? 's' : ''}
                              {selectedPlatforms.length > 1 && ` across ${selectedPlatforms.length} platforms`}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* RIGHT: Results */}
                      <div ref={resultsRef}>
                        {generatedPosts.length === 0 ? (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <Sparkles className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">Your generated posts will appear here</h3>
                              <p className="text-sm text-muted-foreground max-w-sm">
                                Enter a topic, choose your platform and tone, then hit Generate. Each post comes with a viral score and engagement predictions.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-orange-500" />
                                Generated Posts ({generatedPosts.length})
                              </h3>
                              <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs cursor-pointer text-muted-foreground">
                                Clear All
                              </Button>
                            </div>

                            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                              {generatedPosts.map((post, i) => (
                                <motion.div
                                  key={post.id}
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                  <Card className="rounded-2xl border-border/50 overflow-hidden">
                                    <CardContent className="p-5">
                                      {/* Post header */}
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          {platformIcon(post.platform)}
                                          <span className="text-xs font-medium text-muted-foreground">
                                            {PLATFORMS.find((p) => p.id === post.platform)?.name || post.platform}
                                          </span>
                                          {post.viralScore !== undefined && <ViralScoreBadge score={post.viralScore} />}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => addPostToCalendar(post)}
                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                            title="Add to Calendar"
                                          >
                                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              const postContent = post.content;
                                              // Call image gen with two-stage: post content + basic prompt
                                              fetch('/api/generate-image', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ prompt: postContent.slice(0, 80), postContent }),
                                              }).then(r => r.json()).then(data => {
                                                if (data.success && data.image) {
                                                  setGeneratedImages(prev => [{ id: uid(), prompt: data.prompt || postContent.slice(0, 80), image: data.image }, ...prev]);
                                                  setGeneratedPosts(prev => prev.map(p => p.id === post.id ? { ...p, generatedImage: data.image } : p));
                                                  toast.success('Image generated with AI-optimized prompt!');
                                                } else {
                                                  toast.error(data.error || 'Failed to generate image');
                                                }
                                              }).catch(() => toast.error('Network error'));
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                            title="Generate Image (AI-optimized)"
                                          >
                                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Post content with character count */}
                                      <div className="relative mb-4">
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</div>
                                        {PLATFORM_CHAR_LIMITS[post.platform] && (
                                          <div className={`mt-2 flex items-center justify-between text-[10px] ${post.content.length > PLATFORM_CHAR_LIMITS[post.platform] ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                            <span>{post.content.length} / {PLATFORM_CHAR_LIMITS[post.platform]} chars</span>
                                            {post.content.length > PLATFORM_CHAR_LIMITS[post.platform] && (
                                              <span className="flex items-center gap-0.5"><AlertCircle className="h-2.5 w-2.5" />Over limit by {post.content.length - PLATFORM_CHAR_LIMITS[post.platform]}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Content strength estimate */}
                                      {post.viralScore !== undefined && (
                                        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                                          <span className="text-[10px] flex items-center gap-1 opacity-60">
                                            <Info className="h-2.5 w-2.5" />Content strength estimate
                                          </span>
                                          <div className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" />~{post.estimatedLikes?.toLocaleString()}</div>
                                          <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-blue-400" />~{post.estimatedComments?.toLocaleString()}</div>
                                          <div className="flex items-center gap-1"><RefreshCw className="h-3 w-3 text-green-400" />~{post.estimatedShares?.toLocaleString()}</div>
                                        </div>
                                      )}

                                      {/* Generated image */}
                                      {post.generatedImage && (
                                        <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
                                          <img src={post.generatedImage} alt="Generated" className="w-full h-auto" />
                                        </div>
                                      )}

                                      {/* Actions */}
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant={post.copied ? 'secondary' : 'outline'}
                                          onClick={() => handleCopy(post.id, post.content)}
                                          className="cursor-pointer text-xs rounded-lg"
                                        >
                                          {post.copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                          {post.copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setShowScheduleModal(post.id)}
                                          className="cursor-pointer text-xs rounded-lg"
                                        >
                                          <Clock className="h-3 w-3 mr-1" />
                                          Schedule
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handlePublishNow(post.id)}
                                          className="cursor-pointer text-xs rounded-lg"
                                        >
                                          <Send className="h-3 w-3 mr-1" />
                                          Publish
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Schedule Modal */}
                    <AnimatePresence>
                      {showScheduleModal && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                          onClick={() => setShowScheduleModal(null)}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm mx-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Card className="rounded-2xl shadow-2xl">
                              <CardContent className="p-6">
                                <h3 className="text-sm font-semibold mb-4">Schedule Post</h3>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                                    <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" onClick={() => setShowScheduleModal(null)} className="flex-1 cursor-pointer rounded-lg">Cancel</Button>
                                    <Button size="sm" onClick={() => handleSchedule(showScheduleModal)} className="flex-1 cursor-pointer rounded-lg gradient-brand text-white border-0">Schedule</Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Hook Lab                                           */}
                {/* ====================================================== */}
                {activeTab === 'hooks' && (
                  <motion.div key="hooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <Card className="rounded-2xl border-border/50">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                              <Target className="h-5 w-5 text-orange-500" />
                              Hook Generator
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">Generate 5 viral scroll-stopping hooks for any topic</p>
                            <Textarea
                              value={hookTopic}
                              onChange={(e) => setHookTopic(e.target.value)}
                              placeholder="Enter your topic — e.g. 'Remote work productivity', 'AI in healthcare', 'Personal branding for developers'..."
                              className="min-h-[100px] resize-none rounded-xl text-sm leading-relaxed mb-4"
                            />
                            <div className="mb-4">
                              <label className="text-xs font-medium text-muted-foreground mb-2 block">Tone</label>
                              <div className="flex flex-wrap gap-2">
                                {TONES.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => setHookTone(t.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                      hookTone === t.id ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'border-border bg-background hover:bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {t.emoji} {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={handleGenerateHooks}
                              disabled={isGeneratingHooks}
                              className="w-full gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-5"
                            >
                              {isGeneratingHooks ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Generate 5 Viral Hooks
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        {hooks.length === 0 ? (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                              <Flame className="h-8 w-8 text-muted-foreground mb-3" />
                              <h3 className="text-sm font-semibold mb-1">Viral hooks will appear here</h3>
                              <p className="text-xs text-muted-foreground">Enter a topic and generate hooks that stop the scroll</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              Generated Hooks ({hooks.length})
                            </h3>
                            {hooks.map((hook, i) => {
                              const viral = calculateViralScore(hook);
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: i * 0.08 }}
                                >
                                  <Card className="rounded-xl border-border/50 hover:border-orange-300/50 transition-colors">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary" className="text-[10px]">Hook #{i + 1}</Badge>
                                        <ViralScoreBadge score={viral.score} />
                                      </div>
                                      <p className="text-sm leading-relaxed mb-3">{hook}</p>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          <span>{viral.likes.toLocaleString()} potential likes</span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleCopyText(hook, 'Hook')}
                                          className="cursor-pointer text-xs h-7 px-2"
                                        >
                                          <Copy className="h-3 w-3 mr-1" /> Copy
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Hashtag Lab                                        */}
                {/* ====================================================== */}
                {activeTab === 'hashtags' && (
                  <motion.div key="hashtags" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <Card className="rounded-2xl border-border/50 mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          <Hash className="h-5 w-5 text-orange-500" />
                          Hashtag Lab
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Generate AI-powered hashtag sets organized by category</p>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                          <Textarea
                            value={hashtagTopic}
                            onChange={(e) => setHashtagTopic(e.target.value)}
                            placeholder="Enter your topic — e.g. 'Sustainable fashion', 'Digital marketing trends', 'Fitness coaching'..."
                            className="min-h-[80px] resize-none rounded-xl text-sm leading-relaxed"
                          />
                          <div className="flex flex-col gap-2">
                            <select
                              value={hashtagPlatform}
                              onChange={(e) => setHashtagPlatform(e.target.value)}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                              {PLATFORMS.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <Button
                              onClick={handleGenerateHashtags}
                              disabled={isGeneratingHashtags}
                              className="gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-3"
                            >
                              {isGeneratingHashtags ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                              Generate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {hashtags && (
                      <div className="space-y-4">
                        {[
                          { label: 'Trending', icon: TrendingUp, color: 'text-red-500', data: hashtags.trending },
                          { label: 'Niche', icon: Target, color: 'text-blue-500', data: hashtags.niche },
                          { label: 'Broad', icon: Globe, color: 'text-green-500', data: hashtags.broad },
                        ].map((cat) => (
                          cat.data.length > 0 && (
                            <Card key={cat.label} className="rounded-2xl border-border/50">
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                    {cat.label}
                                    <Badge variant="secondary" className="text-[10px]">{cat.data.length}</Badge>
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {cat.data.map((tag, i) => (
                                    <motion.button
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.03 }}
                                      onClick={() => handleCopyText(tag, 'Hashtag')}
                                      className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-all cursor-pointer border border-transparent hover:border-orange-200"
                                    >
                                      {tag}
                                    </motion.button>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        ))}

                        <Button
                          onClick={() => handleCopyText(
                            [...hashtags.trending, ...hashtags.niche, ...hashtags.broad].join(' '),
                            'All hashtags'
                          )}
                          className="w-full gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-5"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All Hashtags ({[...hashtags.trending, ...hashtags.niche, ...hashtags.broad].length} total)
                        </Button>
                      </div>
                    )}

                    {!hashtags && !isGeneratingHashtags && (
                      <Card className="rounded-2xl border-border/50">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                          <Hash className="h-8 w-8 text-muted-foreground mb-3" />
                          <h3 className="text-sm font-semibold mb-1">Hashtag suggestions will appear here</h3>
                          <p className="text-xs text-muted-foreground">Enter a topic to get trending, niche, and broad hashtags</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Content Repurposing Studio                         */}
                {/* ====================================================== */}
                {activeTab === 'repurpose' && (
                  <motion.div key="repurpose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <Card className="rounded-2xl border-border/50 mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          <FileUp className="h-5 w-5 text-orange-500" />
                          Content Repurposing Studio
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Upload a blog, article, transcript, or paste content — get 50+ assets across all platforms</p>

                        {/* File upload area */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${repurposeFile ? 'border-green-300 bg-green-50/50 dark:bg-green-500/10' : 'border-border/50 hover:border-orange-300 hover:bg-muted/30'}`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.csv,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {repurposeFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <span className="text-sm font-medium">{repurposeFileName}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setRepurposeFile(null); setRepurposeFileName(''); setRepurposeInput(''); }}
                                className="p-1 rounded hover:bg-muted cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm font-medium">Drop a file or click to upload</p>
                              <p className="text-xs text-muted-foreground mt-1">.txt, .md, .csv, .json — up to 5000 characters</p>
                            </>
                          )}
                        </div>

                        {/* Text input */}
                        <Textarea
                          value={repurposeInput}
                          onChange={(e) => setRepurposeInput(e.target.value)}
                          placeholder="Or paste your content here — blog article, YouTube transcript, podcast notes, newsletter..."
                          className="min-h-[150px] resize-none rounded-xl text-sm leading-relaxed mb-4"
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tone</label>
                            <select
                              value={selectedTone}
                              onChange={(e) => setSelectedTone(e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                              {TONES.map((t) => (
                                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                              ))}
                            </select>
                          </div>
                          <Button
                            onClick={handleRepurpose}
                            disabled={isRepurposing || repurposeInput.trim().length < 20}
                            className="gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-3 px-6"
                          >
                            {isRepurposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                            Repurpose Content
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Results */}
                    {repurposeResults && (
                      <div className="space-y-6">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Repurposed into {Object.values(repurposeResults).flat().length} assets across 6 formats
                        </h3>

                        {/* Tweets */}
                        {repurposeResults.tweets.length > 0 && (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Twitter className="h-4 w-4" style={{ color: '#1DA1F2' }} />
                                  Tweets ({repurposeResults.tweets.length})
                                </h4>
                                <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.tweets.join('\n\n'), 'All tweets')} className="cursor-pointer text-xs h-7 px-2">
                                  <Copy className="h-3 w-3 mr-1" />Copy All
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {repurposeResults.tweets.map((t, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed flex items-start justify-between gap-2">
                                    <span className="flex-1 whitespace-pre-wrap">{t}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className={`text-[10px] ${t.length > 280 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{t.length}/280</span>
                                      <button onClick={() => handleCopyText(t, `Tweet ${i + 1}`)} className="p-1 rounded hover:bg-muted cursor-pointer">
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* LinkedIn Posts */}
                        {repurposeResults.linkedinPosts.length > 0 && (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Linkedin className="h-4 w-4" style={{ color: '#0A66C2' }} />
                                  LinkedIn Posts ({repurposeResults.linkedinPosts.length})
                                </h4>
                                <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.linkedinPosts.join('\n\n---\n\n'), 'All LinkedIn')} className="cursor-pointer text-xs h-7 px-2">
                                  <Copy className="h-3 w-3 mr-1" />Copy All
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {repurposeResults.linkedinPosts.map((t, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap">{t}</div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Hooks */}
                        {repurposeResults.hooks.length > 0 && (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Target className="h-4 w-4 text-orange-500" />
                                  Hooks ({repurposeResults.hooks.length})
                                </h4>
                                <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.hooks.join('\n'), 'All hooks')} className="cursor-pointer text-xs h-7 px-2">
                                  <Copy className="h-3 w-3 mr-1" />Copy All
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {repurposeResults.hooks.map((h, i) => (
                                  <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors" onClick={() => handleCopyText(h, `Hook ${i + 1}`)}>{h}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Instagram Captions */}
                        {repurposeResults.instagramCaptions.length > 0 && (
                          <Card className="rounded-2xl border-border/50">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Instagram className="h-4 w-4" style={{ color: '#E4405F' }} />
                                  Instagram Captions ({repurposeResults.instagramCaptions.length})
                                </h4>
                                <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.instagramCaptions.join('\n\n'), 'All captions')} className="cursor-pointer text-xs h-7 px-2">
                                  <Copy className="h-3 w-3 mr-1" />Copy All
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {repurposeResults.instagramCaptions.map((c, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap">{c}</div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* TikTok + Shorts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {repurposeResults.tiktokCaptions.length > 0 && (
                            <Card className="rounded-2xl border-border/50">
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Play className="h-4 w-4" style={{ color: '#000' }} />
                                    TikTok ({repurposeResults.tiktokCaptions.length})
                                  </h4>
                                  <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.tiktokCaptions.join('\n'), 'All TikTok')} className="cursor-pointer text-xs h-7 px-2">
                                    <Copy className="h-3 w-3 mr-1" />Copy All
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {repurposeResults.tiktokCaptions.map((c, i) => (
                                    <div key={i} className="p-2 rounded-lg bg-muted/50 text-xs leading-relaxed flex items-start justify-between gap-1">
                                      <span className="whitespace-pre-wrap">{c}</span>
                                      <span className={`flex-shrink-0 text-[9px] ${c.length > 150 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{c.length}/150</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          {repurposeResults.shortsScripts.length > 0 && (
                            <Card className="rounded-2xl border-border/50">
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Youtube className="h-4 w-4" style={{ color: '#FF0000' }} />
                                    YT Shorts ({repurposeResults.shortsScripts.length})
                                  </h4>
                                  <Button size="sm" variant="ghost" onClick={() => handleCopyText(repurposeResults.shortsScripts.join('\n'), 'All Shorts')} className="cursor-pointer text-xs h-7 px-2">
                                    <Copy className="h-3 w-3 mr-1" />Copy All
                                </Button>
                                </div>
                                <div className="space-y-2">
                                  {repurposeResults.shortsScripts.map((s, i) => (
                                    <div key={i} className="p-2 rounded-lg bg-muted/50 text-xs leading-relaxed whitespace-pre-wrap">{s}</div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {(!repurposeResults || Object.values(repurposeResults).every(arr => arr.length === 0)) && !isRepurposing && (
                      <Card className="rounded-2xl border-border/50">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                          <FileUp className="h-8 w-8 text-muted-foreground mb-3" />
                          <h3 className="text-sm font-semibold mb-1">Turn one piece of content into 50+ assets</h3>
                          <p className="text-xs text-muted-foreground">Upload a blog, transcript, or article — get tweets, LinkedIn posts, hooks, captions, and scripts</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Thread Builder                                     */}
                {/* ====================================================== */}
                {activeTab === 'thread' && (
                  <motion.div key="thread" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <Card className="rounded-2xl border-border/50 mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-orange-500" />
                          Thread & Carousel Builder
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Generate connected Twitter threads or Instagram carousels</p>
                        <Textarea
                          value={threadTopic}
                          onChange={(e) => setThreadTopic(e.target.value)}
                          placeholder="Enter your thread/carousel topic — e.g. 'How I built a 6-figure SaaS from scratch', '10 mistakes first-time founders make'..."
                          className="min-h-[100px] resize-none rounded-xl text-sm leading-relaxed mb-4"
                        />
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Type</label>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                              <button
                                onClick={() => setThreadType('thread')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${threadType === 'thread' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                              >
                                <Twitter className="h-3 w-3 inline mr-1" />Thread
                              </button>
                              <button
                                onClick={() => setThreadType('carousel')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${threadType === 'carousel' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                              >
                                <Instagram className="h-3 w-3 inline mr-1" />Carousel
                              </button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tone</label>
                            <select
                              value={threadTone}
                              onChange={(e) => setThreadTone(e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                              {TONES.map((t) => (
                                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                              ))}
                            </select>
                          </div>
                          <Button
                            onClick={handleGenerateThread}
                            disabled={isGeneratingThread}
                            className="gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-3 px-6"
                          >
                            {isGeneratingThread ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                            Generate {threadType === 'thread' ? 'Thread' : 'Carousel'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {threadTweets.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">
                            {threadType === 'thread' ? 'Twitter Thread' : 'Instagram Carousel'} ({threadTweets.length} parts)
                          </h3>
                          <div className="flex items-center gap-2">
                            {threadType === 'carousel' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateCarouselPDF(threadTweets, threadTopic.slice(0, 60))}
                                className="cursor-pointer text-xs rounded-lg"
                              >
                                <Download className="h-3 w-3 mr-1" /> Export PDF
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyText(
                                threadTweets.map((t, i) => `${threadType === 'thread' ? `${i + 1}/${threadTweets.length}` : `Slide ${i + 1}`}:\n${t}`).join('\n\n'),
                                threadType === 'thread' ? 'Entire thread' : 'Entire carousel'
                              )}
                              className="cursor-pointer text-xs rounded-lg"
                            >
                              <Copy className="h-3 w-3 mr-1" /> Copy Entire {threadType === 'thread' ? 'Thread' : 'Carousel'}
                            </Button>
                          </div>
                        </div>

                        {threadTweets.map((tweet, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.06 }}
                          >
                            <Card className="rounded-xl border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {threadType === 'thread' ? (
                                      <Badge variant="secondary" className="text-[10px] font-mono">{i + 1}/{threadTweets.length}</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-[10px]">Slide {i + 1}</Badge>
                                    )}
                                    {i === 0 && <span className="text-[10px] text-orange-500 font-medium">HOOK</span>}
                                    {i === threadTweets.length - 1 && <span className="text-[10px] text-green-500 font-medium">CTA</span>}
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => handleCopyText(tweet, `Part ${i + 1}`)} className="cursor-pointer text-xs h-7 px-2">
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{tweet}</div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {threadTweets.length === 0 && !isGeneratingThread && (
                      <Card className="rounded-2xl border-border/50">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mb-3" />
                          <h3 className="text-sm font-semibold mb-1">Your {threadType === 'thread' ? 'thread' : 'carousel'} will appear here</h3>
                          <p className="text-xs text-muted-foreground">Enter a topic and generate connected, engaging content</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Calendar                                           */}
                {/* ====================================================== */}
                {activeTab === 'calendar' && (
                  <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-orange-500" />
                            Content Calendar
                          </h3>
                          <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium min-w-[160px] text-center">{calendarMonthName}</span>
                            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {[...Array(calendarFirstDay)].map((_, i) => (
                            <div key={`empty-${i}`} className="h-12 sm:h-16" />
                          ))}
                          {[...Array(calendarDaysInMonth)].map((_, i) => {
                            const day = i + 1;
                            const dayPosts = getPostsForDay(day);
                            const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                            const isSelected = selectedCalendarDay === day;
                            return (
                              <button
                                key={day}
                                onClick={() => { setSelectedCalendarDay(isSelected ? null : day); setShowCalendarAddPost(false); }}
                                className={`h-12 sm:h-16 rounded-lg text-xs font-medium transition-all cursor-pointer relative flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-300' :
                                  isToday ? 'bg-primary text-primary-foreground' :
                                  dayPosts.length > 0 ? 'hover:bg-muted border border-orange-200' :
                                  'hover:bg-muted border border-transparent'
                                }`}
                              >
                                <span>{day}</span>
                                {dayPosts.length > 0 && (
                                  <div className="flex gap-0.5">
                                    {dayPosts.slice(0, 3).map((_, j) => (
                                      <div key={j} className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Day Panel */}
                        {selectedCalendarDay && (
                          <div className="mt-6 border-t border-border/50 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold">
                                Posts for {calendarMonthName} {selectedCalendarDay}
                                {getPostsForDay(selectedCalendarDay).length === 0 && !showCalendarAddPost && ' — No posts scheduled'}
                              </h4>
                              {!showCalendarAddPost && (
                                <Button size="sm" variant="outline" onClick={() => setShowCalendarAddPost(true)} className="cursor-pointer text-xs rounded-lg">
                                  <Plus className="h-3 w-3 mr-1" /> Schedule Post
                                </Button>
                              )}
                            </div>

                            {/* Add Post Form */}
                            {showCalendarAddPost && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-500/5 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Schedule a new post for {calendarMonthName} {selectedCalendarDay}</span>
                                  <button onClick={() => setShowCalendarAddPost(false)} className="p-1 rounded hover:bg-muted cursor-pointer"><X className="h-3 w-3" /></button>
                                </div>
                                <div className="flex gap-2">
                                  <select
                                    value={calendarNewPostPlatform}
                                    onChange={(e) => setCalendarNewPostPlatform(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                  >
                                    {PLATFORMS.map((p) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <Textarea
                                  value={calendarNewPostContent}
                                  onChange={(e) => setCalendarNewPostContent(e.target.value)}
                                  placeholder="Write your post content here..."
                                  className="min-h-[60px] resize-none rounded-xl text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => { setShowCalendarAddPost(false); setCalendarNewPostContent(''); }} className="cursor-pointer text-xs rounded-lg">Cancel</Button>
                                  <Button size="sm" onClick={() => addManualCalendarPost(selectedCalendarDay)} disabled={!calendarNewPostContent.trim()} className="cursor-pointer text-xs rounded-lg gradient-brand text-white border-0">
                                    <CalendarClock className="h-3 w-3 mr-1" /> Schedule
                                  </Button>
                                </div>
                              </motion.div>
                            )}

                            {/* Existing Posts for Day */}
                            {getPostsForDay(selectedCalendarDay).length > 0 && (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {getPostsForDay(selectedCalendarDay).map((post) => (
                                  <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                                    {platformIcon(post.platform, 'h-4 w-4')}
                                    <span className="flex-1 truncate text-muted-foreground">{post.content}</span>
                                    <button
                                      onClick={() => {
                                        const updated = calendarPosts.filter(p => p.id !== post.id);
                                        setCalendarPosts(updated);
                                        saveCalendarPosts(updated);
                                        toast.success('Post removed from calendar');
                                      }}
                                      className="p-1 rounded hover:bg-destructive/10 cursor-pointer text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* No day selected hint */}
                        {!selectedCalendarDay && (
                          <div className="mt-6 border-t border-border/50 pt-4 text-center">
                            <p className="text-xs text-muted-foreground">Click any date to view or schedule posts. You can also add posts from the Generate tab using the calendar icon.</p>
                          </div>
                        )}

                        {/* Calendar stats */}
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-orange-500" />{calendarPosts.length} posts scheduled</span>
                          <span>Stored in your browser (localStorage)</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: Templates                                         */}
                {/* ====================================================== */}
                {activeTab === 'templates' && (
                  <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BookTemplate className="h-5 w-5 text-orange-500" />
                        Post Templates
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => setShowNewTemplate(true)} className="cursor-pointer text-xs rounded-lg">
                        <Plus className="h-3 w-3 mr-1" /> Create Custom
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {DEFAULT_TEMPLATES.map((tpl, i) => (
                        <motion.div
                          key={tpl.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card
                            className="rounded-xl border-border/50 cursor-pointer hover:border-orange-300/50 transition-all card-lift h-full"
                            onClick={() => applyTemplate(tpl)}
                          >
                            <CardContent className="p-5">
                              <div className="text-2xl mb-3">{tpl.icon}</div>
                              <h4 className="text-sm font-semibold mb-1">{tpl.name}</h4>
                              <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">{TONES.find(t => t.id === tpl.tone)?.label || tpl.tone}</Badge>
                                <span className="text-[10px] text-orange-500 font-medium ml-auto">Click to apply →</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Custom Templates */}
                    {customTemplates.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <PenTool className="h-4 w-4 text-orange-500" />
                          Your Custom Templates ({customTemplates.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {customTemplates.map((tpl) => (
                            <Card
                              key={tpl.id}
                              className="rounded-xl border-border/50 cursor-pointer hover:border-orange-300/50 transition-all"
                              onClick={() => applyTemplate(tpl)}
                            >
                              <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-semibold">{tpl.name}</h4>
                                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = customTemplates.filter(t => t.id !== tpl.id);
                                      setCustomTemplates(updated);
                                      saveCustomTemplates(updated);
                                      toast.success('Template deleted');
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-destructive/10 cursor-pointer text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}

                    {/* New Template Modal */}
                    <AnimatePresence>
                      {showNewTemplate && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                          onClick={() => setShowNewTemplate(false)}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Card className="rounded-2xl shadow-2xl">
                              <CardContent className="p-6 space-y-4">
                                <h3 className="text-sm font-semibold">Create Custom Template</h3>
                                <input type="text" value={newTplName} onChange={(e) => setNewTplName(e.target.value)} placeholder="Template name" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                                <input type="text" value={newTplDesc} onChange={(e) => setNewTplDesc(e.target.value)} placeholder="Short description" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                                <Textarea value={newTplTopic} onChange={(e) => setNewTplTopic(e.target.value)} placeholder="Default topic/prompt for this template" className="min-h-[80px] resize-none rounded-xl text-sm" />
                                <select value={newTplTone} onChange={(e) => setNewTplTone(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                  {TONES.map((t) => (<option key={t.id} value={t.id}>{t.emoji} {t.label}</option>))}
                                </select>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setShowNewTemplate(false)} className="flex-1 cursor-pointer rounded-lg">Cancel</Button>
                                  <Button size="sm" onClick={saveNewTemplate} className="flex-1 cursor-pointer rounded-lg gradient-brand text-white border-0">Save Template</Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ====================================================== */}
                {/*  TAB: AI Images                                          */}
                {/* ====================================================== */}
                {activeTab === 'images' && (
                  <motion.div key="images" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto">
                    <Card className="rounded-2xl border-border/50 mb-6">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-orange-500" />
                          AI Image Generator
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-full">BETA</span>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Generate images for your social media posts using free AI. <span className="text-yellow-600 dark:text-yellow-400 font-medium">Beta version — for testing purposes only. Results may vary.</span></p>
                        <div className="flex gap-3">
                          <Textarea
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Describe your image — e.g. 'Minimalist workspace setup with laptop and coffee', 'Abstract gradient background with tech vibe'..."
                            className="flex-1 min-h-[60px] resize-none rounded-xl text-sm"
                          />
                          <Button
                            onClick={() => handleGenerateImage()}
                            disabled={isGeneratingImage || imagePrompt.trim().length < 3}
                            className="gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl self-end"
                          >
                            {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {generatedImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {generatedImages.map((img) => (
                          <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Card className="rounded-xl border-border/50 overflow-hidden">
                              <div className="relative">
                                <img src={img.image} alt={img.prompt} className="w-full h-auto" />
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <a
                                    href={img.image}
                                    download={`postpilot-${Date.now()}.png`}
                                    className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background cursor-pointer transition-colors"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              </div>
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {generatedImages.length === 0 && !isGeneratingImage && (
                      <Card className="rounded-2xl border-border/50">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-3" />
                          <h3 className="text-sm font-semibold mb-1">Generated images will appear here</h3>
                          <p className="text-xs text-muted-foreground">Describe what you want and AI will create it</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {/* -------------------------------------------------------- */}
          {/*  ADMIN VIEW                                                 */}
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                  <p className="text-muted-foreground mt-1">System health, usage stats, and generation history</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setActiveView('app')} className="cursor-pointer">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to App
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveView('landing')} className="cursor-pointer">Home</Button>
                </div>
              </div>

              {adminLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : adminStats ? (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Generations', value: adminStats.totalGenerations, icon: Activity, color: 'text-orange-500' },
                      { label: 'Posts Generated', value: adminStats.totalPostsGenerated, icon: FileText, color: 'text-blue-500' },
                      { label: 'Rate Limits Hit', value: adminStats.rateLimitedRequests, icon: Shield, color: 'text-red-500' },
                      { label: 'Uptime (hrs)', value: adminStats.uptime, icon: Server, color: 'text-green-500' },
                    ].map((stat) => (
                      <Card key={stat.label} className="rounded-2xl border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                          </div>
                          <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* By Platform */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-500" />
                        Generations by Platform
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(adminStats.generationsByPlatform).length > 0 ? (
                          Object.entries(adminStats.generationsByPlatform)
                            .sort(([, a], [, b]) => b - a)
                            .map(([platform, count]) => {
                              const pct = Math.round((count / adminStats.totalGenerations) * 100);
                              return (
                                <div key={platform} className="flex items-center gap-3">
                                  <span className="text-xs w-24 text-muted-foreground capitalize">{platform}</span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-mono w-8 text-right">{count}</span>
                                  <span className="text-muted-foreground">{count} gen{count !== 1 ? 's' : ''}</span>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-8">No generations yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Generations */}
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Recent Generations
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
                                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Topic</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminStats.recentGenerations.map((gen) => (
                                <tr key={gen.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{new Date(gen.timestamp).toLocaleTimeString()}</td>
                                  <td className="py-2.5 px-3 capitalize flex items-center gap-1.5">
                                    {(() => {
                                      const pInfo = PLATFORMS.find((p) => p.id === gen.platform);
                                      return pInfo ? (
                                        <>
                                          <pInfo.icon className="h-3 w-3" style={{ color: pInfo.color }} />
                                          <span className="hidden sm:inline">{pInfo.name}</span>
                                          <span className="sm:hidden">{gen.platform}</span>
                                        </>
                                      ) : <span>{gen.platform}</span>;
                                    })()}
                                  </td>
                                  <td className="py-2.5 px-3 capitalize">{TONES.find((t) => t.id === gen.tone)?.label || gen.tone}</td>
                                  <td className="py-2.5 px-3"><Badge variant="secondary" className="text-[10px]">{gen.mode}</Badge></td>
                                  <td className="py-2.5 px-3 max-w-[200px] truncate text-muted-foreground" title={gen.topic}>{gen.topic}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
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
                    <p className="text-sm text-muted-foreground mt-2">Could not connect to the admin API.</p>
                    <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => {
                      setAdminLoading(true);
                      fetch('/api/admin').then((r) => r.json()).then((data) => setAdminStats(data)).catch(() => setAdminStats(null)).finally(() => setAdminLoading(false));
                    }}>Retry</Button>
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
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">Pricing</button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">Features</button>
              <span className="text-orange-500 font-medium">v4.0</span>
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
                      <div className="flex justify-end mb-2">
                        <button onClick={() => setShowAuthModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {session.user.image ? (
                        <img src={session.user.image} alt="" className="h-16 w-16 rounded-full border-2 border-orange-300 mx-auto mb-4" />
                      ) : (
                        <div className="h-16 w-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                          {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}

                      <h2 className="text-lg font-bold">{session.user.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{session.user.email}</p>

                      <div className="mt-4 flex items-center justify-center gap-3">
                        <Badge className={
                          (session.user as Record<string, unknown>).plan === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' :
                          (session.user as Record<string, unknown>).plan === 'pro' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0' :
                          'bg-muted text-foreground'
                        }>
                          {(session.user as Record<string, unknown>).role === 'admin' ? '👑 ' : ''}{((session.user as Record<string, unknown>).plan as string || 'free').charAt(0).toUpperCase() + ((session.user as Record<string, unknown>).plan as string || 'free').slice(1)} Plan
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3 text-orange-500" />
                          {credits !== null ? String(credits) : String((session.user as Record<string, unknown>).credits || 20)} credits
                        </Badge>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button onClick={() => { setShowAuthModal(false); setActiveView('app'); }} className="w-full gradient-brand text-white border-0 hover:opacity-90 cursor-pointer rounded-xl py-5">
                          <Sparkles className="h-4 w-4 mr-2" />Open Generator
                        </Button>
                        <div className="pt-3 border-t border-border/50">
                          <Button variant="ghost" className="w-full cursor-pointer text-muted-foreground hover:text-red-500" onClick={() => { signOut({ callbackUrl: '/' }); setShowAuthModal(false); }}>
                            <LogOut className="h-4 w-4 mr-2" />Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ---- Login/Signup View ---- */
                    <div>
                      <div className="flex justify-end mb-2">
                        <button onClick={() => setShowAuthModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-center mb-6">
                        <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
                          <PostPilotLogo className="h-8 w-8" />
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-center">Welcome to PostPilot</h2>
                      <p className="text-sm text-muted-foreground text-center mt-1.5">Create viral social media content in seconds</p>

                      <div className="mt-6">
                        <Button onClick={() => signIn('google')} className="w-full h-12 rounded-xl cursor-pointer border border-border bg-background hover:bg-muted text-foreground font-medium text-sm gap-3" variant="outline">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 mt-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="mt-6">
                        <Button onClick={() => { setShowAuthModal(false); setActiveView('app'); toast.success('Welcome! You are using PostPilot as a guest.'); }} className="w-full h-12 rounded-xl cursor-pointer border-0 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm gap-3">
                          <User className="h-5 w-5" />Continue as Guest
                        </Button>
                      </div>

                      <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
                        By continuing, you agree to our{' '}
                        <span className="underline cursor-pointer">Terms of Service</span> and{' '}
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

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
