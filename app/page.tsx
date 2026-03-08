'use client';

import { useState, CSSProperties } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Feature Card Type Definition
 *
 * @interface Feature
 * @property {string} icon - Emoji icon for the feature
 * @property {string} title - Feature title
 * @property {string} desc - Feature description
 * @property {() => void} action - Click handler function
 * @property {string} cta - Call-to-action text
 * @property {string} color - Primary color for the feature (hex)
 * @property {string} bg - Background color for the feature (hex)
 */
interface Feature {
  icon: string;
  title: string;
  desc: string;
  action: () => void;
  cta: string;
  color: string;
  bg: string;
}

/**
 * FAQ Item Type Definition
 *
 * @interface FAQ
 * @property {string} q - Question text
 * @property {string} tag - Emoji tag for the question
 */
interface FAQ {
  q: string;
  tag: string;
}

/**
 * Global style constants for home page
 */
const HOME_STYLES = {
  pageContainer: {
    background: '#f9fafb',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as CSSProperties,

  heroSection: {
    background: 'white',
    borderBottom: '1px solid #f3f4f6',
    padding: '72px 24px',
  } as CSSProperties,

  sectionContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  } as CSSProperties,

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f0fdfa',
    border: '1px solid #99f6e4',
    borderRadius: '999px',
    padding: '4px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: '28px',
  } as CSSProperties,

  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  } as CSSProperties,

  heroTitle: {
    fontSize: '44px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.04em',
    lineHeight: '1.1',
    margin: '0 0 20px',
  } as CSSProperties,

  heroTitleHighlight: {
    color: '#0d9488',
  } as CSSProperties,

  heroDescription: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.7',
    margin: '0 0 36px',
  } as CSSProperties,

  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  } as CSSProperties,

  primaryButton: {
    background: '#0d9488',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  secondaryButton: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  featuresSection: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 24px',
  } as CSSProperties,

  sectionLabel: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin: '0 0 32px',
  } as CSSProperties,

  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  } as CSSProperties,

  featureCard: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as CSSProperties,

  featureCardHover: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
  } as CSSProperties,

  featureIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '16px',
  } as CSSProperties,

  featureTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  } as CSSProperties,

  featureDesc: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0 0 20px',
  } as CSSProperties,

  featureCTA: {
    fontSize: '13px',
    fontWeight: '600',
  } as CSSProperties,

  faqsSection: {
    background: 'white',
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
    padding: '60px 24px',
  } as CSSProperties,

  faqsContainer: {
    maxWidth: '680px',
    margin: '0 auto',
  } as CSSProperties,

  faqsTitle: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.03em',
    margin: '0 0 6px',
  } as CSSProperties,

  faqsSubtitle: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 32px',
  } as CSSProperties,

  faqsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  } as CSSProperties,

  faqButton: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  borderRadius: '10px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e5e7eb',

  background: '#f9fafb',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease',
  fontFamily: 'inherit',
  fontSize: '13px',
} as CSSProperties,

  faqButtonHover: {
    background: '#f0fdfa',
    borderColor: '#99f6e4',
  } as CSSProperties,

  faqTag: {
    fontSize: '18px',
    flexShrink: 0,
  } as CSSProperties,

  faqQuestion: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
    lineHeight: '1.4',
  } as CSSProperties,

  ctaSection: {
    padding: '72px 24px',
    textAlign: 'center',
  } as CSSProperties,

  ctaContainer: {
    maxWidth: '440px',
    margin: '0 auto',
  } as CSSProperties,

  ctaTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
  } as CSSProperties,

  ctaDescription: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 28px',
    lineHeight: '1.6',
  } as CSSProperties,

  ctaButton: {
    background: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '13px 32px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  footer: {
    borderTop: '1px solid #f3f4f6',
    padding: '24px',
    textAlign: 'center',
  } as CSSProperties,

  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  } as CSSProperties,
};

/**
 * Home Page Component
 *
 * Landing page that showcases:
 * - Hero section with call-to-action
 * - Feature cards (AI, Community, Emergency)
 * - Popular questions section
 * - Sign-up CTA (for non-authenticated users)
 *
 * Content adapts based on authentication state.
 *
 * @component
 * @returns {React.ReactNode} Home page UI
 *
 * @example
 * ```tsx
 * <HomePage />
 * ```
 */
export default function HomePage(): React.ReactNode {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredFAQ, setHoveredFAQ] = useState<number | null>(null);

  /**
   * Features configuration
   */
  const features: Feature[] = [
  {
    icon: '🩺',
    title: 'ตรวจอาการสัตว์เลี้ยง',
    desc: 'กรอกอาการของสัตว์เลี้ยงเพื่อ วิเคราะห์ระดับความเสี่ยงเบื้องต้น',
    action: () => router.push('/symptom-checker'),
    cta: 'เริ่มตรวจ',
    color: '#0d9488',
    bg: '#f0fdfa',
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    desc: 'ถามคำถามเกี่ยวกับสุขภาพสัตว์เลี้ยงและการดูแลทั่วไป',
    action: () => router.push('/chat'),
    cta: 'ถาม AI',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    icon: '📚',
    title: 'บทความสุขภาพสัตว์',
    desc: 'รวมบทความและคำแนะนำเกี่ยวกับการดูแลสัตว์เลี้ยง',
    action: () => router.push('/articles'),
    cta: 'อ่านบทความ',
    color: '#7c3aed',
    bg: '#faf5ff',
  },
];

  /**
   * FAQ questions configuration
   */
  const faqs: FAQ[] = [
  { q: 'สัตว์เลี้ยงอาเจียนควรทำอย่างไร?', tag: '🤢' },
  { q: 'สุนัขท้องเสียต้องพาไปหาหมอไหม?', tag: '💩' },
  { q: 'แมวซึมและไม่กินอาหาร', tag: '😿' },
  { q: 'สัตว์เลี้ยงมีไข้ควรทำอย่างไร?', tag: '🌡️' },
  { q: 'สัญญาณอันตรายที่ต้องพาไปหาหมอ', tag: '⚠️' },
  { q: 'สัตว์เลี้ยงหายใจเร็วผิดปกติ', tag: '😮‍💨' },
];

  /**
   * Handle feature card keyboard interaction
   */
  const handleFeatureKeyDown = (e: React.KeyboardEvent, action: () => void): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  /**
   * Navigate to chat with specific question
   */
  const handleFAQClick = (): void => {
    router.push('/chat');
  };

  return (
    <div style={HOME_STYLES.pageContainer}>
      {/* Hero Section */}
      <section style={HOME_STYLES.heroSection}>
        <div style={HOME_STYLES.sectionContainer}>
          {/* Status Badge */}
          <div style={HOME_STYLES.badge}>
            <span style={HOME_STYLES.badgeDot} />
            AI พร้อมตอบตลอด 24 ชั่วโมง
          </div>

          {/* Hero Title */}
          <h1 style={HOME_STYLES.heroTitle}>
  วิเคราะห์
  <br />
  <span style={HOME_STYLES.heroTitleHighlight}>อาการสัตว์เลี้ยงเบื้องต้น</span>
</h1>

          {/* Hero Description */}
          <p style={HOME_STYLES.heroDescription}>
  ระบบช่วยประเมินอาการสัตว์เลี้ยงเบื้องต้น
  เพื่อช่วยให้เจ้าของตัดสินใจได้เร็วขึ้น
</p>

          {/* CTA Buttons */}
          <div style={HOME_STYLES.buttonContainer}>
            <button
  onClick={() => router.push('/symptom-checker')}
  style={HOME_STYLES.primaryButton}
>
  เริ่มตรวจอาการ →
</button>


            {!user && (
              <button
                onClick={() => router.push('/login')}
                style={HOME_STYLES.secondaryButton}
                aria-label="Sign up for free"
              >
                สมัครสมาชิกฟรี
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={HOME_STYLES.featuresSection} aria-label="Main features">
        <p style={HOME_STYLES.sectionLabel}>ฟีเจอร์หลัก</p>

        <div style={HOME_STYLES.featuresGrid}>
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.action}
              onKeyDown={(e) => handleFeatureKeyDown(e, feature.action)}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                ...HOME_STYLES.featureCard,
                ...(hoveredFeature === index && HOME_STYLES.featureCardHover),
              }}
              aria-label={`${feature.title}: ${feature.desc}`}
            >
              <div
                style={{
                  ...HOME_STYLES.featureIcon,
                  background: feature.bg,
                }}
              >
                {feature.icon}
              </div>

              <h3 style={HOME_STYLES.featureTitle}>{feature.title}</h3>
              <p style={HOME_STYLES.featureDesc}>{feature.desc}</p>

              <span
                style={{
                  ...HOME_STYLES.featureCTA,
                  color: feature.color,
                }}
              >
                {feature.cta} →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section style={HOME_STYLES.faqsSection} aria-label="Popular questions">
        <div style={HOME_STYLES.faqsContainer}>
          <h2 style={HOME_STYLES.faqsTitle}>คำถามยอดนิยม</h2>
          <p style={HOME_STYLES.faqsSubtitle}>กดเพื่อถาม AI ได้ทันที</p>

          <div style={HOME_STYLES.faqsGrid}>
            {faqs.map((faq, index) => (
              <button
                key={index}
                onClick={handleFAQClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFAQClick();
                  }
                }}
                onMouseEnter={() => setHoveredFAQ(index)}
                onMouseLeave={() => setHoveredFAQ(null)}
                style={{
                  ...HOME_STYLES.faqButton,
                  ...(hoveredFAQ === index && HOME_STYLES.faqButtonHover),
                }}
                aria-label={`Ask: ${faq.q}`}
              >
                <span style={HOME_STYLES.faqTag}>{faq.tag}</span>
                <span style={HOME_STYLES.faqQuestion}>{faq.q}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only for non-authenticated users */}
      {!user && (
        <section style={HOME_STYLES.ctaSection} aria-label="Sign up call to action">
          <div style={HOME_STYLES.ctaContainer}>
            <h2 style={HOME_STYLES.ctaTitle}>เริ่มใช้งานฟรีเลย</h2>
            <p style={HOME_STYLES.ctaDescription}>
              สมัครฟรีเพื่อโพสต์ในชุมชนและบันทึกประวัติการสนทนากับ AI
            </p>
            <button
              onClick={() => router.push('/login')}
              style={HOME_STYLES.ctaButton}
              aria-label="Create free account"
            >
              สมัครสมาชิกฟรี
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={HOME_STYLES.footer}>
        <p style={HOME_STYLES.footerText}>
          © 2024 PetHealth — ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค ควรปรึกษาสัตวแพทย์เสมอ
        </p>
      </footer>
    </div>
  );
}
