#!/usr/bin/env python3
"""PostPilot Product Report - PDF Generator"""
import os, sys, hashlib

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import subprocess

# ── Paths ──
OUTPUT_DIR = "/home/z/my-project/download"
os.makedirs(OUTPUT_DIR, exist_ok=True)
BODY_PDF = os.path.join(OUTPUT_DIR, "postpilot_body.pdf")
COVER_PDF = os.path.join(OUTPUT_DIR, "postpilot_cover.pdf")
FINAL_PDF = os.path.join(OUTPUT_DIR, "PostPilot_Product_Report.pdf")
COVER_HTML = "/home/z/my-project/scripts/postpilot-cover.html"
FONT_DIR = "/usr/share/fonts"

# ── Register Fonts ──
pdfmetrics.registerFont(TTFont('Inter', f'{FONT_DIR}/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Bold', f'{FONT_DIR}/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Italic', f'{FONT_DIR}/truetype/liberation/LiberationSans-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Inter-BoldItalic', f'{FONT_DIR}/truetype/liberation/LiberationSans-BoldItalic.ttf'))
registerFontFamily('Inter', normal='Inter', bold='Inter-Bold', italic='Inter-Italic', boldItalic='Inter-BoldItalic')

# ── Cascade Palette ──
PAGE_BG       = colors.HexColor('#f5f6f6')
SECTION_BG    = colors.HexColor('#e7e9ea')
CARD_BG       = colors.HexColor('#eaedef')
TABLE_STRIPE  = colors.HexColor('#eaeced')
HEADER_FILL   = colors.HexColor('#435d6b')
COVER_BLOCK   = colors.HexColor('#4b616b')
BORDER        = colors.HexColor('#abbcc4')
ICON          = colors.HexColor('#456a7c')
ACCENT        = colors.HexColor('#3286b0')
ACCENT_2      = colors.HexColor('#cc4e63')
TEXT_PRIMARY   = colors.HexColor('#232627')
TEXT_MUTED     = colors.HexColor('#82888c')
BRAND_ORANGE   = colors.HexColor('#f97316')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_M = 60 * mm
RIGHT_M = 55 * mm
TOP_M = 50 * mm
BOT_M = 50 * mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ── Styles ──
styles = getSampleStyleSheet()

style_h1 = ParagraphStyle('H1', parent=styles['Normal'],
    fontName='Inter-Bold', fontSize=22, leading=28, textColor=TEXT_PRIMARY,
    spaceAfter=8*mm, spaceBefore=4*mm)

style_h2 = ParagraphStyle('H2', parent=styles['Normal'],
    fontName='Inter-Bold', fontSize=15, leading=20, textColor=ACCENT,
    spaceAfter=5*mm, spaceBefore=8*mm)

style_body = ParagraphStyle('Body', parent=styles['Normal'],
    fontName='Inter', fontSize=10, leading=16, textColor=TEXT_PRIMARY,
    alignment=TA_JUSTIFY, spaceAfter=4*mm)

style_body_sm = ParagraphStyle('BodySm', parent=style_body,
    fontSize=9, leading=14, spaceAfter=3*mm)

style_bullet = ParagraphStyle('Bullet', parent=style_body,
    fontSize=10, leading=15, leftIndent=12, bulletIndent=0,
    spaceBefore=1*mm, spaceAfter=1.5*mm)

style_caption = ParagraphStyle('Caption', parent=styles['Normal'],
    fontName='Inter-Italic', fontSize=8, leading=12, textColor=TEXT_MUTED,
    alignment=TA_CENTER, spaceAfter=3*mm)

style_toc_entry = ParagraphStyle('TOC', parent=styles['Normal'],
    fontName='Inter', fontSize=11, leading=22, textColor=TEXT_PRIMARY,
    leftIndent=0)

style_toc_sub = ParagraphStyle('TOCSub', parent=style_toc_entry,
    fontSize=10, leading=20, leftIndent=15, textColor=TEXT_MUTED)

# ── Helper functions ──
def heading1(text):
    p = Paragraph(f'<b>{text}</b>', style_h1)
    return p

def heading2(text):
    p = Paragraph(f'<b>{text}</b>', style_h2)
    return p

def body(text):
    return Paragraph(text, style_body)

def body_sm(text):
    return Paragraph(text, style_body_sm)

def bullet(text):
    return Paragraph(f'<bullet>&bull;</bullet> {text}', style_bullet)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=4*mm, spaceBefore=2*mm)

def spacer(h=4):
    return Spacer(1, h*mm)

def make_table(headers, rows, col_widths=None):
    if col_widths is None:
        col_widths = [CONTENT_W / len(headers)] * len(headers)
    header_row = [Paragraph(f'<b>{h}</b>', ParagraphStyle('TH', fontName='Inter-Bold', fontSize=9, leading=12, textColor=colors.white)) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), ParagraphStyle('TD', fontName='Inter', fontSize=9, leading=13, textColor=TEXT_PRIMARY)) for c in row])
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_STRIPE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, TABLE_STRIPE]),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    return t

# ── Build Story ──
story = []

# ===== TABLE OF CONTENTS =====
story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle('TOCTitle', fontName='Inter-Bold', fontSize=20, leading=26, textColor=TEXT_PRIMARY, spaceAfter=8*mm)))
story.append(hr())

toc_items = [
    ("1.", "Executive Summary", ""),
    ("2.", "Problem Statement", ""),
    ("3.", "Product Overview", ""),
    ("", "3.1  Core Features", "sub"),
    ("", "3.2  AI-Powered Content Engine", "sub"),
    ("4.", "Technical Architecture", ""),
    ("", "4.1  Technology Stack", "sub"),
    ("", "4.2  System Architecture", "sub"),
    ("", "4.3  AI Integration", "sub"),
    ("5.", "Competitive Analysis", ""),
    ("6.", "Feature Deep Dive", ""),
    ("", "6.1  Multi-Platform Post Generation", "sub"),
    ("", "6.2  Hook Lab", "sub"),
    ("", "6.3  Hashtag Lab", "sub"),
    ("", "6.4  Thread Builder", "sub"),
    ("", "6.5  Content Calendar", "sub"),
    ("", "6.6  AI Image Generation", "sub"),
    ("7.", "Development Timeline", ""),
    ("8.", "Conclusion and Roadmap", ""),
]

for num, title, kind in toc_items:
    if kind == "sub":
        story.append(Paragraph(f'{num} {title}', style_toc_sub))
    else:
        story.append(Paragraph(f'<b>{num}</b>  {title}', style_toc_entry))

story.append(PageBreak())

# ===== SECTION 1: EXECUTIVE SUMMARY =====
story.append(heading1('1. Executive Summary'))
story.append(hr())
story.append(body(
    'PostPilot is an AI-powered social media content generation platform designed to help creators, marketers, and businesses '
    'produce high-quality, platform-optimized content at scale. The platform leverages cutting-edge large language models through '
    'Pollinations.ai, a free and publicly accessible AI API, to generate posts, viral hooks, hashtag strategies, content threads, '
    'and AI-generated images across six major social media platforms: Twitter/X, LinkedIn, Instagram, TikTok, YouTube Long-Form, '
    'and YouTube Shorts.'
))
story.append(body(
    'Built with a modern technology stack comprising Next.js 16, TypeScript, Tailwind CSS 4, and Prisma ORM with PostgreSQL, '
    'PostPilot delivers a responsive, dark-mode-enabled web application that runs entirely on free infrastructure. The platform '
    'eliminates the need for paid AI API keys by integrating with Pollinations.ai, which provides OpenAI-compatible endpoints at '
    'zero cost. This architectural decision makes PostPilot uniquely accessible to individual creators and small businesses who '
    'cannot justify expensive SaaS subscriptions or per-generation API fees.'
))
story.append(body(
    'The current production build includes eight core features: AI post generation with multi-platform support, a dedicated Hook Lab '
    'for crafting attention-grabbing opening lines, a Hashtag Lab with trending analysis, a Thread and Carousel Builder for long-form '
    'content, a visual Content Calendar with scheduling, a curated Template Library, AI Image Generation, and comprehensive Brand '
    'Voice customization. Each feature has been tested end-to-end and is fully functional. The project is open-source and actively '
    'maintained on GitHub.'
))

# ===== SECTION 2: PROBLEM STATEMENT =====
story.append(heading1('2. Problem Statement'))
story.append(hr())
story.append(body(
    'Social media has become the primary channel for brand communication, audience engagement, and business growth. However, creating '
    'consistent, high-quality content across multiple platforms remains one of the most significant challenges facing creators and '
    'marketing teams today. The average social media manager spends 3 to 5 hours daily on content creation, according to industry '
    'surveys, yet only a fraction of that content achieves meaningful engagement. The fundamental problem is not a lack of effort but '
    'rather the absence of intelligent tools that understand platform-specific algorithms, audience behavior patterns, and content '
    'formatting requirements.'
))
story.append(body(
    'Existing solutions in the market tend to fall into two categories: expensive enterprise tools like Hootsuite and Buffer that '
    'charge premium subscription fees for features many individual creators do not need, and free tools that offer limited AI '
    'capabilities with restrictive credit systems. Neither category adequately serves the growing population of solo creators, '
    'freelance marketers, and small business owners who need professional-grade AI content generation without the associated '
    'cost barriers. PostPilot was conceived to bridge this gap by providing a comprehensive, fully functional AI content platform '
    'that costs nothing to use.'
))
story.append(body(
    'Additionally, most existing tools treat content generation as a one-size-fits-all process, ignoring the fact that a tweet, a '
    'LinkedIn post, an Instagram caption, and a TikTok hook each require fundamentally different writing styles, character limits, '
    'and engagement strategies. PostPilot addresses this by maintaining detailed platform-specific profiles that guide the AI to '
    'produce content that feels native to each platform, complete with appropriate hashtag usage, tone calibration, and structural '
    'formatting that respects each platform\'s unique conventions.'
))

# ===== SECTION 3: PRODUCT OVERVIEW =====
story.append(heading1('3. Product Overview'))
story.append(hr())
story.append(body(
    'PostPilot is a single-page web application that presents users with an intuitive, tab-based interface. After a polished landing '
    'page with gradient branding and animated feature showcases, users enter the main dashboard which provides access to all content '
    'generation tools. The interface supports both authenticated sessions via Google OAuth and a trial mode that allows immediate '
    'access to all features without registration, lowering the barrier to entry for new users.'
))
story.append(body(
    'The application architecture follows a client-server model where the Next.js frontend communicates with server-side API routes '
    'that handle AI generation requests. Content generation calls are forwarded to Pollinations.ai\'s OpenAI-compatible chat completion '
    'endpoint, while image generation uses Pollinations.ai\'s image generation API. All user-generated content and scheduling data '
    'that does not require server-side persistence is stored in the browser\'s localStorage, enabling offline access to previously '
    'generated content and calendar entries.'
))

story.append(heading2('3.1 Core Features'))
story.append(body(
    'The platform offers seven primary feature modules accessible through the main navigation tabs. Each module is designed to address '
    'a specific content creation need, from initial post ideation to final scheduling. The following table summarizes each feature '
    'along with its primary function and the AI mode it invokes during content generation:'
))

feature_table = make_table(
    ['Feature', 'Function', 'AI Mode'],
    [
        ['Generate', 'Create platform-specific posts with tone and brand voice control', 'generate / repurpose'],
        ['Hook Lab', 'Generate viral opening lines optimized for engagement', 'hook'],
        ['Hashtag Lab', 'Produce categorized hashtag sets with trending analysis', 'hashtags'],
        ['Thread Builder', 'Build connected Twitter threads and Instagram carousels', 'thread / carousel'],
        ['Calendar', 'Schedule and organize posts on a visual calendar grid', 'N/A (localStorage)'],
        ['Templates', 'Browse and apply pre-built content frameworks', 'generate (via template)'],
        ['AI Images', 'Generate social media images via AI', 'Pollinations Image API'],
    ],
    col_widths=[CONTENT_W*0.22, CONTENT_W*0.48, CONTENT_W*0.30]
)
story.append(feature_table)
story.append(spacer(2))

story.append(heading2('3.2 AI-Powered Content Engine'))
story.append(body(
    'At the heart of PostPilot lies its AI content engine, which is powered by Pollinations.ai\'s free text generation API. This API '
    'provides an OpenAI-compatible chat completions endpoint that accepts standard messages format with system prompts, user prompts, '
    'and temperature parameters. The system employs a carefully engineered system prompt that instructs the AI to act as a senior social '
    'media content strategist with 15 years of experience, understanding each platform\'s algorithm, culture, and content format at an '
    'expert level.'
))
story.append(body(
    'Each generation request includes platform-specific instructions that are dynamically injected into the prompt based on the selected '
    'platform. These instructions cover character limits, content structure rules, hashtag conventions, formatting examples, and forbidden '
    'patterns unique to each platform. For example, Twitter generation enforces a strict 280-character limit with single-tweet output, '
    'while LinkedIn generation permits long-form storytelling with numbered lists and professional tone. Instagram captions include '
    '15 to 25 hashtags optimized for discoverability, while TikTok hooks are constrained to 150 characters for maximum impact.'
))
story.append(body(
    'The content parsing system uses a multi-strategy approach to extract individual posts from the AI\'s raw response. It first '
    'attempts to split on the "---POST---" delimiter that the system prompt instructs the AI to use. If that fails, it falls back '
    'to splitting on double line breaks, then on hashtag clusters, and finally on "Post #N" labels. For posts that exceed the '
    'platform\'s character limit, an automatic splitting mechanism subdivides the content at natural break points. This robust '
    'parsing pipeline ensures that the system reliably extracts usable content regardless of how the AI structures its response.'
))

# ===== SECTION 4: TECHNICAL ARCHITECTURE =====
story.append(heading1('4. Technical Architecture'))
story.append(hr())

story.append(heading2('4.1 Technology Stack'))
story.append(body(
    'PostPilot is built on a modern full-stack technology stack that prioritizes developer experience, performance, and cost '
    'efficiency. The following table details each component of the technology stack along with its role in the application:'
))

tech_table = make_table(
    ['Layer', 'Technology', 'Purpose'],
    [
        ['Framework', 'Next.js 16.2.9', 'React-based full-stack framework with server-side API routes'],
        ['Language', 'TypeScript', 'Type-safe development with strict compilation checks'],
        ['Styling', 'Tailwind CSS 4', 'Utility-first CSS with responsive and dark mode support'],
        ['Animation', 'Framer Motion', 'Smooth page transitions and micro-interactions'],
        ['Database', 'PostgreSQL (Neon)', 'Serverless PostgreSQL for user data and generation logs'],
        ['ORM', 'Prisma', 'Type-safe database queries and schema management'],
        ['Authentication', 'NextAuth.js', 'Google OAuth with JWT session management'],
        ['AI (Text)', 'Pollinations.ai', 'Free OpenAI-compatible chat completions API'],
        ['AI (Image)', 'Pollinations.ai', 'Free image generation API with URL-based output'],
        ['UI Components', 'shadcn/ui', 'Pre-built accessible React component library'],
        ['Notifications', 'Sonner', 'Toast notification system for user feedback'],
    ],
    col_widths=[CONTENT_W*0.18, CONTENT_W*0.32, CONTENT_W*0.50]
)
story.append(tech_table)
story.append(spacer(2))

story.append(heading2('4.2 System Architecture'))
story.append(body(
    'The application follows Next.js\'s App Router architecture, with all routes defined under the src/app directory. The main page '
    '(page.tsx) serves as both the landing page and the single-page application dashboard, switching between views based on the '
    'activeView state variable. API routes handle all server-side logic, including AI generation requests, image generation, '
    'user authentication, and admin statistics.'
))
story.append(body(
    'The frontend is a monolithic React component that manages all application state through React hooks. This includes content '
    'generation state, calendar scheduling data, custom brand voices, and user preferences. State that needs to persist across '
    'sessions is stored in localStorage, including calendar posts, custom templates, and saved brand voices. The application uses '
    'next-themes for dark mode support, with a carefully designed color palette that switches between light and dark backgrounds '
    'while maintaining brand consistency through the orange accent color.'
))
story.append(body(
    'The API layer consists of two primary routes. The /api/generate route handles all text generation requests, supporting seven '
    'distinct modes: generate, repurpose, hook, thread, carousel, hashtags, and enhance. Each mode constructs a tailored prompt '
    'that includes the base system prompt, platform-specific instructions, user-defined tone, and optional brand voice context. '
    'The /api/generate-image route provides direct access to Pollinations.ai\'s image generation endpoint, returning image URLs '
    'that are displayed inline in the frontend. Both routes include comprehensive error handling that returns meaningful error '
    'messages to the frontend for user-facing display.'
))

story.append(heading2('4.3 AI Integration'))
story.append(body(
    'PostPilot\'s AI integration strategy is centered around the principle of zero-cost operation. Instead of relying on paid '
    'APIs like OpenAI, Google Gemini, or Anthropic Claude, the platform uses Pollinations.ai, a completely free and publicly '
    'accessible AI service. Pollinations.ai provides an OpenAI-compatible chat completions endpoint at '
    'text.pollinations.ai, which accepts the standard messages format with model, temperature, and content parameters.'
))
story.append(body(
    'The text generation system constructs detailed prompts that include a base system prompt defining the AI persona as an expert '
    'social media strategist, platform-specific instructions from a comprehensive profile database covering all six supported '
    'platforms, user-selected tone preferences from six options (Serious, Chill, Funny, Motivation, Bold, and Teach), and optional '
    'brand voice instructions that modify the AI\'s writing style. The temperature parameter is set to 0.9 for content generation '
    'tasks, providing a balance between creativity and coherence. Each platform profile specifies maximum character counts, content '
    'type definitions, structural formatting rules, hashtag conventions with specific count requirements, detailed formatting examples, '
    'and a list of forbidden patterns to avoid.'
))
story.append(body(
    'The multi-platform generation feature uses JavaScript\'s Promise.allSettled to dispatch generation requests for all selected '
    'platforms simultaneously, rather than sequentially. This parallel execution strategy dramatically reduces wait times when '
    'generating content for multiple platforms. If any individual platform request fails, the system gracefully reports the failure '
    'while still delivering successful results from other platforms, ensuring that a single API timeout does not block the entire '
    'generation workflow. For image generation, the system constructs encoded URL strings that point to Pollinations.ai\'s image '
    'generation endpoint with parameters for image dimensions, prompt content, and random seeds to ensure unique outputs on each request.'
))

# ===== SECTION 5: COMPETITIVE ANALYSIS =====
story.append(heading1('5. Competitive Analysis'))
story.append(hr())
story.append(body(
    'The social media management and AI content generation market is highly competitive, with established players ranging from '
    'enterprise-focused platforms like Hootsuite and Sprout Social to AI-first tools like Jasper and Predis.ai. PostPilot '
    'differentiates itself through a combination of zero cost, comprehensive feature coverage, and intelligent platform-specific '
    'content generation. The following table compares PostPilot against key competitors across critical dimensions:'
))

comp_table = make_table(
    ['Feature', 'PostPilot', 'Buffer / Hootsuite', 'Jasper / Predis'],
    [
        ['Price', 'Free', '$6-$99/mo', '$39-$99/mo'],
        ['AI Generation', 'Full (Pollinations.ai)', 'Basic / Limited', 'Advanced (OpenAI)'],
        ['Platforms', '6 native', '5-8', '3-5'],
        ['Brand Voice', 'Custom + Presets', 'Limited', 'Advanced'],
        ['Hook Generation', 'Dedicated Lab', 'Not available', 'Basic'],
        ['Thread Builder', 'Twitter + Carousel', 'Not available', 'Basic threads'],
        ['Hashtag Engine', 'Trending Analysis', 'Basic suggestions', 'Basic suggestions'],
        ['Content Calendar', 'Visual + Schedule', 'Advanced', 'Basic'],
        ['Image Generation', 'AI (Beta)', 'Integration', 'Template-based'],
        ['Dark Mode', 'Yes', 'Yes', 'No'],
        ['Open Source', 'Yes (GitHub)', 'No', 'No'],
    ],
    col_widths=[CONTENT_W*0.22, CONTENT_W*0.26, CONTENT_W*0.26, CONTENT_W*0.26]
)
story.append(comp_table)
story.append(spacer(2))
story.append(body(
    'PostPilot\'s primary competitive advantage is its ability to deliver a full-featured AI content generation experience at zero '
    'cost. While paid competitors offer more polished interfaces and deeper platform integrations (such as direct posting to social '
    'media accounts), PostPilot\'s AI generation quality is comparable because it uses the same underlying GPT-class model through '
    'Pollinations.ai. The platform\'s dedicated content creation tools (Hook Lab, Thread Builder, Hashtag Lab) are features typically '
    'only found in much more expensive tools, giving PostPilot a unique value proposition for budget-conscious creators.'
))

# ===== SECTION 6: FEATURE DEEP DIVE =====
story.append(heading1('6. Feature Deep Dive'))
story.append(hr())

story.append(heading2('6.1 Multi-Platform Post Generation'))
story.append(body(
    'The Generate tab is the central feature of PostPilot, providing AI-powered content creation across all six supported platforms. '
    'Users begin by entering a topic or pasting existing content to repurpose, selecting one or more target platforms, choosing a tone, '
    'and specifying the number of posts to generate. The system supports both topic-based generation, where the AI creates original '
    'content from scratch, and content repurposing, where existing text is transformed to fit a different platform\'s style and format.'
))
story.append(body(
    'The multi-platform selection system uses checkboxes with a "Select All" toggle, allowing users to generate content for all six '
    'platforms simultaneously. When multiple platforms are selected, the system dispatches parallel API requests using Promise.allSettled, '
    'ensuring that the generation process completes as quickly as possible. Each generated post is tagged with its target platform, '
    'displayed with a viral score prediction (calculated locally based on content characteristics), estimated engagement metrics (likes, '
    'comments, shares), and action buttons for copying, scheduling, and publishing. The generation results include the platform name '
    'as returned by the API, ensuring accurate platform attribution even when multiple platforms are selected.'
))

story.append(heading2('6.2 Hook Lab'))
story.append(body(
    'The Hook Lab is a specialized feature designed to solve one of the most critical challenges in social media content creation: '
    'crafting the opening line that stops users from scrolling. Research consistently shows that the first 1 to 3 seconds of a '
    'social media post determine whether a user engages or scrolls past, making the hook arguably the most important element of any '
    'piece of content. The Hook Lab generates five distinct hook variations based on the user\'s topic, platform, and tone selection.'
))
story.append(body(
    'Each hook is generated using a dedicated prompt template that instructs the AI to produce attention-grabbing opening lines using '
    'proven psychological frameworks including pattern interrupts, open loops, contrarian statements, power questions, bold claims, '
    'and curiosity gaps. The hooks are designed to be platform-appropriate, with Twitter hooks constrained to 280 characters, LinkedIn '
    'hooks using professional framing, and TikTok hooks optimized for ultra-short attention spans. Users can copy individual hooks '
    'with a single click, and the system tracks which hooks have been copied for easy reference.'
))

story.append(heading2('6.3 Hashtag Lab'))
story.append(body(
    'The Hashtag Lab provides intelligent hashtag generation with categorization that goes beyond simple keyword-based suggestions. '
    'When users enter a topic, the system generates a comprehensive set of hashtags organized into three strategic categories: '
    'Trending Now hashtags that capitalize on current social media trends, Niche-Specific hashtags targeting the user\'s particular '
    'industry or community, and Evergreen hashtags that provide consistent discoverability over time. This categorization approach '
    'reflects best practices in social media marketing, where a balanced hashtag strategy combines trending content for immediate '
    'reach with niche and evergreen tags for sustained visibility.'
))

story.append(heading2('6.4 Thread Builder'))
story.append(body(
    'The Thread Builder enables users to create connected multi-post content for Twitter threads and Instagram carousels. This '
    'feature addresses the growing demand for long-form content on platforms that traditionally favor short-form posts. Users '
    'select between thread mode (for Twitter/X) and carousel mode (for Instagram), enter a topic, and the AI generates a '
    'coherent sequence of connected posts that tell a complete story or deliver a comprehensive argument across 5 to 10 individual '
    'posts. Each post in the sequence is numbered and designed to stand on its own while contributing to the overall narrative, '
    'reflecting the style of top-performing social media threads.'
))

story.append(heading2('6.5 Content Calendar'))
story.append(body(
    'The Content Calendar provides a visual monthly calendar grid where users can organize and schedule their content. Posts generated '
    'in the Generate tab can be added directly to the calendar with a single click, and users can also manually add posts to any '
    'date by clicking on a calendar day and entering content with platform selection. The calendar supports month navigation, '
    'highlights days with scheduled posts using orange indicator dots, and displays detailed post previews when a day is selected. '
    'All calendar data is stored in localStorage, ensuring that content schedules persist across browser sessions without requiring '
    'a server-side database for scheduling. Posts can be individually removed from the calendar, and the system displays a total '
    'count of scheduled posts for quick reference.'
))

story.append(heading2('6.6 AI Image Generation'))
story.append(body(
    'The AI Image Generation feature allows users to create social media images by describing them in natural language. The system '
    'uses Pollinations.ai\'s image generation endpoint, which accepts a text prompt and returns a 1024 by 1024 pixel image. '
    'Each request includes a random seed parameter to ensure unique output on every generation, preventing the system from '
    'returning identical images for the same prompt. The generated images are displayed in a responsive grid gallery with download '
    'buttons, and users can also trigger image generation directly from generated posts by clicking the image icon on any post card.'
))
story.append(body(
    'This feature is currently labeled as a Beta release, acknowledging that while the underlying AI produces reasonable results, '
    'the quality and consistency may vary compared to paid image generation services. The Beta designation manages user expectations '
    'while still providing a valuable creative tool at zero cost. The system automatically enhances user prompts with additional '
    'context about social media image requirements, including specifications for vibrant colors, modern design, and professional quality, '
    'to guide the AI toward outputs that are more suitable for social media use.'
))

# ===== SECTION 7: DEVELOPMENT TIMELINE =====
story.append(heading1('7. Development Timeline'))
story.append(hr())
story.append(body(
    'PostPilot was developed through an iterative process that progressed from initial concept to a fully functional production '
    'application. The development journey began with competitive analysis, where over 20 competing products were researched to '
    'identify feature gaps and market opportunities. This research phase directly informed the feature set and design decisions, '
    'ensuring that PostPilot addressed real user needs rather than hypothetical requirements.'
))
story.append(body(
    'The initial build phase produced the core platform with the landing page, authentication system, and basic post generation. '
    'Following the initial deployment attempt on Netlify and subsequent hosting challenges (Cloudflare Pages and Render were both '
    'attempted but proved impractical for the application\'s server-side API routes), the decision was made to optimize for local '
    'development and self-hosting. The v3 update represented a major feature expansion, adding the Hook Lab, Thread Builder, '
    'Hashtag Lab, Content Calendar, Template Library, AI Image Generation, Dark Mode, and Brand Voice profiles in a single build '
    'cycle. The most recent development phase focused on comprehensive testing and bug fixing, which included switching from the '
    'internal z-ai-web-dev-sdk to Pollinations.ai for AI generation, fixing multi-platform parallel generation, adding calendar '
    'scheduling functionality, and removing the Brand Voices tab in favor of the inline brand voice toggle in the Generate tab.'
))

# ===== SECTION 8: CONCLUSION AND ROADMAP =====
story.append(heading1('8. Conclusion and Roadmap'))
story.append(hr())
story.append(body(
    'PostPilot represents a fully functional, zero-cost AI-powered social media content generation platform that delivers '
    'professional-grade features previously available only through expensive SaaS subscriptions. The platform successfully '
    'demonstrates that free AI APIs, when combined with thoughtful prompt engineering and platform-specific content intelligence, '
    'can produce content that rivals the output of premium tools. The open-source nature of the project ensures transparency '
    'and community-driven improvement, while the modular architecture supports rapid feature addition and customization.'
))
story.append(body(
    'Looking ahead, the development roadmap includes several key enhancements. First, direct social media platform integration '
    'through each platform\'s official API would enable true one-click publishing, transforming PostPilot from a content creation '
    'tool into a complete social media management solution. Second, analytics integration would provide users with insights into '
    'how their generated content performs, enabling data-driven refinement of generation strategies. Third, collaboration features '
    'would allow teams to share generation settings, brand voices, and content calendars within an organization. Fourth, a mobile '
    'application would extend the platform\'s accessibility to on-the-go content creation. Finally, an API for third-party '
    'integrations would allow developers to incorporate PostPilot\'s generation capabilities into their own tools and workflows.'
))
story.append(body(
    'The project is actively maintained on GitHub and welcomes community contributions. The codebase is well-structured with clear '
    'separation between frontend components, API routes, and utility functions, making it an excellent starting point for developers '
    'interested in building AI-powered applications with Next.js and free API services.'
))


# ── Build PDF ──
doc = SimpleDocTemplate(
    BODY_PDF,
    pagesize=A4,
    leftMargin=LEFT_M,
    rightMargin=RIGHT_M,
    topMargin=TOP_M,
    bottomMargin=BOT_M,
    title="PostPilot - AI Social Media Content Generator",
    author="PostPilot Team",
    subject="Product Overview Report",
)

doc.build(story)
print(f"Body PDF created: {BODY_PDF}")

# ── Render Cover ──
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
result = subprocess.run(
    ["node", f"{PDF_SKILL_DIR}/scripts/html2poster.js", COVER_HTML, "--output", COVER_PDF, "--width", "794px"],
    capture_output=True, text=True, timeout=60
)
print(f"Cover render stdout: {result.stdout}")
if result.stderr:
    print(f"Cover render stderr: {result.stderr}")

# ── Merge Cover + Body ──
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()

# Add cover
if os.path.exists(COVER_PDF):
    reader = PdfReader(COVER_PDF)
    writer.add_page(reader.pages[0])
    print(f"Cover page added ({len(reader.pages)} page(s))")

# Add body
reader = PdfReader(BODY_PDF)
for page in reader.pages:
    writer.add_page(page)
print(f"Body pages added ({len(reader.pages)} page(s))")

with open(FINAL_PDF, "wb") as f:
    writer.write(f)

print(f"\nFinal PDF: {FINAL_PDF}")
print(f"File size: {os.path.getsize(FINAL_PDF) / 1024:.1f} KB")
