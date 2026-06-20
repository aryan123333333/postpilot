#!/usr/bin/env python3
"""PostPilot Product Overview PDF — ReportLab Body (no cover, TOC included)."""

import os, sys, hashlib

# ---------------------------------------------------------------------------
# Font setup
# ---------------------------------------------------------------------------
import platform as _p
_IS_MAC = _p.system() == 'Darwin'
FONT_DIR = os.path.expanduser('~/.openclaw/workspace/fonts') if _IS_MAC else '/usr/share/fonts'

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')

# ---------------------------------------------------------------------------
# Palette
# ---------------------------------------------------------------------------
from reportlab.lib import colors

PAGE_BG       = colors.HexColor('#f6f7f7')
SECTION_BG    = colors.HexColor('#eaebec')
CARD_BG       = colors.HexColor('#ecedee')
TABLE_STRIPE  = colors.HexColor('#edeff0')
HEADER_FILL   = colors.HexColor('#506570')
COVER_BLOCK   = colors.HexColor('#516670')
BORDER        = colors.HexColor('#cad2d6')
ICON          = colors.HexColor('#447289')
ACCENT        = colors.HexColor('#3789b2')
ACCENT_2      = colors.HexColor('#c65366')
TEXT_PRIMARY   = colors.HexColor('#181a1b')
TEXT_MUTED     = colors.HexColor('#7d8387')
SEM_SUCCESS   = colors.HexColor('#397a4f')

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus import SimpleDocTemplate
from reportlab.pdfgen import canvas

# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------
W, H = A4

style_h1 = ParagraphStyle(
    name='H1', fontName='FreeSerif-Bold', fontSize=22, leading=28,
    textColor=HEADER_FILL, spaceAfter=12, spaceBefore=24,
)
style_h2 = ParagraphStyle(
    name='H2', fontName='FreeSerif-Bold', fontSize=15, leading=20,
    textColor=TEXT_PRIMARY, spaceAfter=8, spaceBefore=16,
)
style_body = ParagraphStyle(
    name='Body', fontName='FreeSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6,
)
style_body_left = ParagraphStyle(
    name='BodyLeft', fontName='FreeSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6,
)
style_bullet = ParagraphStyle(
    name='Bullet', fontName='FreeSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=18, bulletIndent=6,
)
style_toc_h1 = ParagraphStyle(
    name='TOCH1', fontName='FreeSerif-Bold', fontSize=12, leading=18,
    leftIndent=0,
)
style_toc_h2 = ParagraphStyle(
    name='TOCH2', fontName='FreeSerif', fontSize=10.5, leading=16,
    leftIndent=18,
)
style_meta = ParagraphStyle(
    name='Meta', fontName='FreeSerif-Italic', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_LEFT,
)
style_callout = ParagraphStyle(
    name='Callout', fontName='FreeSerif', fontSize=10.5, leading=17,
    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=6,
    leftIndent=12, borderPadding=6,
)

# Table styles
tbl_header_style = ParagraphStyle(name='TblH', fontName='FreeSerif-Bold', fontSize=9.5, leading=13, textColor=colors.white)
tbl_cell_style = ParagraphStyle(name='TblC', fontName='FreeSerif', fontSize=9.5, leading=13, textColor=TEXT_PRIMARY)
tbl_cell_center = ParagraphStyle(name='TblCC', fontName='FreeSerif', fontSize=9.5, leading=13, textColor=TEXT_PRIMARY, alignment=TA_CENTER)

# ---------------------------------------------------------------------------
# TocDocTemplate
# ---------------------------------------------------------------------------
class TocDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
        self.page_count = 0

    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

    def afterPage(self):
        self.page_count += 1

# Page number footer
def page_footer(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont('FreeSerif', 8)
    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.drawRightString(W - 50, 28, f"Page {doc.page_count}")
    canvas_obj.drawString(50, 28, "PostPilot Product Overview")
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(50, 38, W - 50, 38)
    canvas_obj.restoreState()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def heading(text, style, level=0):
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def safe_keep(elements):
    total = sum(e.wrap(W - 2*inch, H)[1] for e in elements)
    max_h = H * 0.4
    if total <= max_h:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

# ---------------------------------------------------------------------------
# Build story
# ---------------------------------------------------------------------------
story = []

# TOC
toc = TableOfContents()
toc.levelStyles = [style_toc_h1, style_toc_h2]
story.append(toc)
story.append(PageBreak())

# === CHAPTER 1: Product Overview ===
story.append(heading('1. Product Overview', style_h1, 0))
story.append(Paragraph(
    'PostPilot is an AI-powered social media content engine designed to eliminate the most time-consuming '
    'aspect of digital marketing: writing platform-specific posts. It takes a single topic from the user and '
    'generates multiple ready-to-publish social media posts, each meticulously formatted to match the native style, '
    'character limits, hashtag conventions, and engagement patterns of the target platform. The entire process '
    'from input to finished content takes less than thirty seconds, making it possible for creators, marketers, '
    'and brand managers to produce weeks worth of social media content in a single session.',
    style_body
))
story.append(Paragraph(
    'The product is built on the premise that generic AI-generated content fails on social media because every '
    'platform has its own culture, algorithm preferences, and content format expectations. A tweet that performs '
    'well on Twitter will not work on LinkedIn, and an Instagram caption will fail entirely on TikTok. PostPilot '
    'solves this by giving each platform its own detailed content DNA profile, including specific structure rules, '
    'format examples, character limits, hashtag strategies, and forbidden patterns. The AI does not just reword '
    'the same post for different platforms; it fundamentally reimagines the content for each one.',
    style_body
))
story.append(Paragraph(
    'The user workflow is deliberately simple. A topic is entered into a text area, the user selects a target platform '
    'from six available options, chooses a tone that matches their brand voice, and sets the number of posts they '
    'want generated, between one and ten. A single click triggers the AI generation pipeline, and the results appear '
    'below the input form with one-click copy buttons for immediate use. There is no account creation required, no '
    'complex setup process, and no learning curve. The design philosophy is that content creation should be fast, '
    'frictionless, and immediately useful.',
    style_body
))

# === CHAPTER 2: Platform Support ===
story.append(Spacer(1, 18))
story.append(heading('2. Platform Support', style_h1, 0))
story.append(Paragraph(
    'PostPilot supports six distinct content platforms, each with its own AI-generated content profile. These profiles '
    'define every aspect of how the AI writes for that platform, from the maximum character count to the structural '
    'hooks, hashtag placement rules, and engagement optimization strategies. This section provides a detailed '
    'breakdown of each platform and what the AI generates for it.',
    style_body
))

# Platform table
platform_data = [
    [Paragraph('<b>Platform</b>', tbl_header_style),
     Paragraph('<b>Content Type</b>', tbl_header_style),
     Paragraph('<b>Char Limit</b>', tbl_header_style),
     Paragraph('<b>Key Features</b>', tbl_header_style)],
    [Paragraph('Twitter / X', tbl_cell_style),
     Paragraph('Standalone tweets', tbl_cell_style),
     Paragraph('280', tbl_cell_center),
     Paragraph('Bold hooks, 1-3 hashtags, engagement drivers', tbl_cell_style)],
    [Paragraph('LinkedIn', tbl_cell_style),
     Paragraph('Professional long-form', tbl_cell_style),
     Paragraph('3,000', tbl_cell_center),
     Paragraph('Storytelling, numbered lists, actionable takeaways', tbl_cell_style)],
    [Paragraph('Instagram', tbl_cell_style),
     Paragraph('Photo/video captions', tbl_cell_style),
     Paragraph('2,200', tbl_cell_center),
     Paragraph('Hook-story-CTA arc, 15-25 hashtags', tbl_cell_style)],
    [Paragraph('TikTok', tbl_cell_style),
     Paragraph('Viral short hooks', tbl_cell_style),
     Paragraph('150', tbl_cell_center),
     Paragraph('Pattern interrupts, emojis, trending hashtags', tbl_cell_style)],
    [Paragraph('YouTube Long', tbl_cell_style),
     Paragraph('Full video descriptions', tbl_cell_style),
     Paragraph('5,000', tbl_cell_center),
     Paragraph('Timestamps, SEO keywords, resource links', tbl_cell_style)],
    [Paragraph('YouTube Shorts', tbl_cell_style),
     Paragraph('Short punchy hooks', tbl_cell_style),
     Paragraph('150', tbl_cell_center),
     Paragraph('Pattern interrupts, emojis, short hooks', tbl_cell_style)],
]

avail_w = W - 2*inch
col_widths = [avail_w*0.17, avail_w*0.22, avail_w*0.10, avail_w*0.51]
platform_table = Table(platform_data, colWidths=col_widths, repeatRows=1)
platform_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_STRIPE),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_STRIPE),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_STRIPE),
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(platform_table)
story.append(Spacer(1, 12))

story.append(Paragraph(
    'Each platform profile contains detailed structure rules that guide the AI on how to construct content. '
    'For Twitter, the AI must produce a single standalone tweet under 280 characters with a bold opening hook, '
    'one to three short lines, and an engagement driver at the end. For LinkedIn, the AI creates professional '
    'long-form posts with storytelling structure, contrarian hooks, blank lines for the "see more" bait, and '
    'numbered lists of key takeaways. Instagram captions follow a hook-to-story-to-CTA narrative arc followed by '
    'fifteen to twenty-five carefully researched hashtags. TikTok and YouTube Shorts focus on ultra-short viral hooks '
    'using pattern interrupts, while YouTube Long descriptions include full SEO-optimized text with timestamps, '
    'resource links, and subscribe calls-to-action.',
    style_body
))

# === CHAPTER 3: Tone & Voice System ===
story.append(Spacer(1, 18))
story.append(heading('3. Tone and Voice System', style_h1, 0))
story.append(Paragraph(
    'PostPilot offers six distinct tone presets that transform the voice and personality of every generated post. '
    'The tone system uses plain-language instructions that the AI interprets as style guidance, ensuring that '
    'every piece of content matches the intended brand personality. Users are not required to write complex style '
    'prompts or provide brand guidelines; they simply select a labeled tone and the AI handles the rest. The six '
    'available tones are described below.',
    style_body
))

tone_data = [
    [Paragraph('<b>Tone</b>', tbl_header_style),
     Paragraph('<b>Description</b>', tbl_header_style),
     Paragraph('<b>Best For</b>', tbl_header_style)],
    [Paragraph('Serious', tbl_cell_style),
     Paragraph('Professional and expert. Uses real numbers, facts, and clear insights. Sounds authoritative.', tbl_cell_style),
     Paragraph('LinkedIn, YouTube Long', tbl_cell_style)],
    [Paragraph('Chill', tbl_cell_style),
     Paragraph('Relaxed and conversational. Like explaining something to a friend over coffee.', tbl_cell_style),
     Paragraph('Twitter, Instagram', tbl_cell_style)],
    [Paragraph('Funny', tbl_cell_style),
     Paragraph('Entertaining and playful. Makes people laugh while still delivering genuine value.', tbl_cell_style),
     Paragraph('TikTok, YouTube Shorts', tbl_cell_style)],
    [Paragraph('Motivation', tbl_cell_style),
     Paragraph('Uplifting and hype-driven. Makes readers feel energized and ready to take action.', tbl_cell_style),
     Paragraph('Instagram, TikTok', tbl_cell_style)],
    [Paragraph('Bold', tbl_cell_style),
     Paragraph('Provocative and controversial. Says what others will not. Takes a strong, debate-worthy stand.', tbl_cell_style),
     Paragraph('Twitter, LinkedIn', tbl_cell_style)],
    [Paragraph('Teach', tbl_cell_style),
     Paragraph('Clear and helpful. Breaks complex topics into simple steps anyone can follow.', tbl_cell_style),
     Paragraph('YouTube Long, LinkedIn', tbl_cell_style)],
]

col_widths_t = [avail_w*0.15, avail_w*0.55, avail_w*0.30]
tone_table = Table(tone_data, colWidths=col_widths_t, repeatRows=1)
tone_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 1 else TABLE_STRIPE) for i in range(1, 7)],
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(tone_table)
story.append(Spacer(1, 12))

story.append(Paragraph(
    'The tone system is designed to be intuitive and immediately accessible. Rather than asking users to define '
    'their brand voice through a complex setup wizard, PostPilot uses simple, emotionally descriptive labels that '
    'anyone can understand at a glance. The underlying AI instructions translate these labels into specific writing '
    'guidelines that control sentence structure, word choice, emotional tone, and engagement strategy. This means '
    'a "Serious" LinkedIn post will read like it came from an industry analyst, while a "Funny" TikTok hook will '
    'feel native to the platform fast-paced, humor-driven culture.',
    style_body
))

# === CHAPTER 4: Core Technical Features ===
story.append(Spacer(1, 18))
story.append(heading('4. Core Technical Features', style_h1, 0))

story.append(heading('4.1 Platform-Native AI Generation', style_h2, 1))
story.append(Paragraph(
    'The heart of PostPilot is its platform-specific AI generation engine. Unlike generic AI writers that produce '
    'one-size-fits-all content, PostPilot constructs a unique, detailed prompt for every combination of platform, '
    'tone, and topic. Each platform profile includes a maximum character limit, content type definition, structure '
    'rules that specify exactly how to organize the content, hashtag placement guidelines, a complete format example '
    'showing what perfect output looks like, and a list of forbidden patterns that must be avoided. This system '
    'ensures that every generated post feels like it was written by a native creator who deeply understands the '
    'target platform.',
    style_body
))

story.append(heading('4.2 Multi-Strategy Post Parser', style_h2, 1))
story.append(Paragraph(
    'Raw AI output is inherently unpredictable. The model might return posts separated by delimiters, numbered lists, '
    'double newlines, or hashtag clusters depending on how it interprets the prompt. PostPilot solves this with a '
    'four-layer parsing system that tries each strategy in sequence until a valid result is found. The primary '
    'strategy splits on a custom delimiter marker. If that fails, it tries numbered list detection. For short-form '
    'platforms like Twitter and TikTok, it falls back to hashtag boundary splitting. Finally, a smart splitter '
    'handles the common case where the AI merges multiple posts into one block by detecting when a single output '
    'exceeds the platform character limit and splitting it at logical boundaries.',
    style_body
))

story.append(heading('4.3 Accurate Post Count Control', style_h2, 1))
story.append(Paragraph(
    'Users set a post count between one and ten using a slider. The system enforces this count at two levels: '
    'the backend clamps the requested count to a maximum of ten and minimum of one, and the frontend uses a strict '
    'slice operation that takes exactly the requested number of posts from the parsed array. If the AI returns more '
    'posts than requested, the excess is silently discarded. If fewer are returned, the user gets what is available. '
    'This dual-layer enforcement ensures that asking for two posts always yields exactly two posts, never six or zero.',
    style_body
))

story.append(heading('4.4 One-Click Copy and Clipboard Integration', style_h2, 1))
story.append(Paragraph(
    'Every generated post includes a one-click copy button that writes the content directly to the user clipboard '
    'using the native browser Clipboard API. The button provides immediate visual feedback, switching from a copy icon '
    'to a checkmark for two seconds, accompanied by a toast notification confirming the copy. This eliminates the '
    'tedious process of manually selecting text, right-clicking, and copying. The entire interaction takes a single '
    'click and provides clear confirmation that the content has been captured.',
    style_body
))

story.append(heading('4.5 Intelligent Prompt Engineering', style_h2, 1))
story.append(Paragraph(
    'The prompt builder constructs a comprehensive instruction set for the AI model every time a generation request '
    'is made. It combines the platform profile, tone instructions, topic, and post count into a single prompt that '
    'includes explicit generation rules requiring unique angles for each post, human-like writing quality, and strict '
    'adherence to the output format delimiter. The AI is instructed with a system persona that positions it as an '
    'expert social media strategist with fifteen years of experience across all major platforms, ensuring the output '
    'quality consistently meets professional standards.',
    style_body
))

# === CHAPTER 5: User Interface ===
story.append(Spacer(1, 18))
story.append(heading('5. User Interface and Experience', style_h1, 0))

story.append(heading('5.1 Landing Page', style_h2, 1))
story.append(Paragraph(
    'The landing page serves as both a marketing front door and the entry point to the content generator. It features '
    'a hero section with the headline "Turn one idea into viral content for every platform," a social proof badge '
    'showing twelve thousand plus creators, a star rating of 4.9 out of 5 from over twenty-four hundred reviews, and '
    'two calls to action. Below the hero, a features grid presents six core capabilities with icon cards, a '
    'three-step "How It Works" section demonstrates the simple workflow, a pricing comparison shows three tiers, '
    'testimonials from three users provide social proof, and a final call-to-action section closes the page.',
    style_body
))

story.append(heading('5.2 App Interface', style_h2, 1))
story.append(Paragraph(
    'The app interface is accessed via the "Try Free" button and replaces the landing page content with a clean, '
    'focused content generation workspace. It consists of a topic input textarea, a platform selector grid showing '
    'six platform cards with icons and descriptions, a tone picker with six labeled options, a post count slider '
    'ranging from one to ten, and a generate button. Results appear below the input form as individual post cards '
    'with the platform icon, post content, copy button, and a clear button to reset. The interface uses smooth '
    'Framer Motion transitions between the landing and app views, with the entire interaction feeling responsive and '
    'modern.',
    style_body
))

story.append(heading('5.3 Navigation and Responsive Design', style_h2, 1))
story.append(Paragraph(
    'The top navigation bar is sticky with a backdrop blur glassmorphism effect, featuring the PostPilot logo on '
    'the left, navigation links to Features, How It Works, and Pricing in the center, and a Try Free call-to-action '
    'button on the right. On mobile devices, a hamburger menu replaces the navigation links with a smooth animated '
    'dropdown. The entire layout is fully responsive, adapting gracefully from desktop to tablet to mobile viewport '
    'sizes. Custom animations include fade-in-up effects on scroll for feature cards, gradient text effects for '
    'emphasis, card hover lift animations, and a custom scrollbar design.',
    style_body
))

# === CHAPTER 6: Tech Stack & Brand ===
story.append(Spacer(1, 18))
story.append(heading('6. Technology Stack and Brand Identity', style_h1, 0))

story.append(heading('6.1 Technology Stack', style_h2, 1))
story.append(Paragraph(
    'PostPilot is built on a modern web technology stack optimized for performance, developer experience, and '
    'scalability. The frontend is implemented in Next.js 16 with TypeScript, using server-side rendering and '
    'static generation where appropriate. The UI layer uses Tailwind CSS 4 for utility-first styling, shadcn/ui '
    'for accessible component primitives, and Framer Motion for smooth animations and view transitions. The AI '
    'generation layer uses the z-ai-web-dev-sdk to interface with the language model, handling prompt construction, '
    'response parsing, and error management entirely server-side through a Next.js API route.',
    style_body
))

stack_data = [
    [Paragraph('<b>Layer</b>', tbl_header_style),
     Paragraph('<b>Technology</b>', tbl_header_style),
     Paragraph('<b>Purpose</b>', tbl_header_style)],
    [Paragraph('Framework', tbl_cell_style),
     Paragraph('Next.js 16', tbl_cell_style),
     Paragraph('Server-side rendering, API routes, routing', tbl_cell_style)],
    [Paragraph('Language', tbl_cell_style),
     Paragraph('TypeScript', tbl_cell_style),
     Paragraph('Type safety, developer experience', tbl_cell_style)],
    [Paragraph('Styling', tbl_cell_style),
     Paragraph('Tailwind CSS 4', tbl_cell_style),
     Paragraph('Utility-first CSS framework', tbl_cell_style)],
    [Paragraph('Components', tbl_cell_style),
     Paragraph('shadcn/ui', tbl_cell_style),
     Paragraph('Accessible UI primitives', tbl_cell_style)],
    [Paragraph('Animation', tbl_cell_style),
     Paragraph('Framer Motion', tbl_cell_style),
     Paragraph('View transitions, scroll animations', tbl_cell_style)],
    [Paragraph('AI', tbl_cell_style),
     Paragraph('z-ai-web-dev-sdk', tbl_cell_style),
     Paragraph('LLM integration, prompt management', tbl_cell_style)],
    [Paragraph('Notifications', tbl_cell_style),
     Paragraph('Sonner', tbl_cell_style),
     Paragraph('Toast notifications', tbl_cell_style)],
    [Paragraph('Fonts', tbl_cell_style),
     Paragraph('Geist + Geist Mono', tbl_cell_style),
     Paragraph('Primary typeface, code font', tbl_cell_style)],
]

col_widths_s = [avail_w*0.18, avail_w*0.25, avail_w*0.57]
stack_table = Table(stack_data, colWidths=col_widths_s, repeatRows=1)
stack_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 1 else TABLE_STRIPE) for i in range(1, 9)],
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(stack_table)
story.append(Spacer(1, 12))

story.append(heading('6.2 Brand Identity', style_h2, 1))
story.append(Paragraph(
    'The PostPilot brand is built around a warm, energetic color palette that conveys speed, creativity, and '
    'approachability. The primary brand colors are a warm orange to amber gradient, specifically #F97316 (orange) '
    'to #F59E0B (amber), with a secondary red accent at #EF4444 for emphasis. The logo is a custom SVG mark '
    'depicting a stylized rocket or compass shape with gradient-filled wings and a flame trail, rendered in the '
    'brand gradient colors. The overall visual language is clean and modern with warm undertones, avoiding both '
    'corporate coldness and playful chaos.',
    style_body
))

story.append(heading('6.3 Pricing Tiers', style_h2, 1))
story.append(Paragraph(
    'The product follows a three-tier freemium pricing model. The Starter tier is free forever and includes ten '
    'generations per month, access to Twitter and LinkedIn only, three tone presets, and basic hashtag suggestions. '
    'The Pro tier at twenty-nine dollars per month unlocks unlimited generations, all six platform options, all tone '
    'presets, an advanced hashtag engine, content repurposing, brand voice training, and priority support. The Agency '
    'tier at ninety-nine dollars per month adds ten brand voice profiles, team collaboration, API access, an analytics '
    'dashboard, white-label exports, and a dedicated account manager. This tiered approach ensures accessibility for '
    'individual creators while providing scalability for teams and agencies.',
    style_body
))

# === Build ===
OUTPUT_PATH = '/home/z/my-project/scripts/postpilot_body.pdf'
doc = TocDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=inch,
    rightMargin=inch,
    topMargin=inch,
    bottomMargin=inch,
    title='PostPilot - Product Overview',
    author='PostPilot',
    subject='AI Social Media Content Engine',
    creator='Z.ai',
)

doc.multiBuild(story, onLaterPages=page_footer, onFirstPage=page_footer)
print(f"Body PDF generated: {OUTPUT_PATH}")
