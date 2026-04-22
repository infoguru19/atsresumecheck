import { useState } from 'react'

const FAQS = [
  {
    q: 'Is my resume stored or shared anywhere?',
    a: 'Absolutely not. Your file is written to a temporary OS path, parsed, then deleted immediately in a finally block — even if an error occurs. Nothing is logged, stored, or transmitted beyond the scoring logic.',
  },
  {
    q: 'What is an ATS and why does my score matter?',
    a: 'An Applicant Tracking System (ATS) is software used by 98% of Fortune 500 companies to automatically filter resumes before a human recruiter ever reads them. A low ATS score means your resume may be rejected automatically, even if you are well-qualified.',
  },
  {
    q: 'Which file formats are supported?',
    a: 'PDF (.pdf) and Microsoft Word (.docx / .doc) files up to 5 MB. For best results, use a text-based PDF — scanned image-only PDFs cannot be parsed.',
  },
  {
    q: 'How is the ATS score calculated?',
    a: 'Your score is a weighted average across 5 parameters: Keywords & Skills (35%), ATS Formatting (20%), Resume Sections (20%), Contact Information (15%), and Quantified Achievements (10%). Each parameter is scored 0–100 and combined into a final percentage.',
  },
  {
    q: 'Is this tool completely free?',
    a: 'Yes — no account, no credit card, no usage limits, no ads. The tool runs on Vercel\'s free serverless tier and costs nothing to use.',
  },
  {
    q: 'Why does my resume score low on keywords?',
    a: 'ATS systems match your resume against a list of expected industry keywords. If your resume uses vague language or omits tools/technologies by name, the scanner may not recognize your skills. Add a dedicated Skills section listing specific tools, languages, and frameworks.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: '1rem 0' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', padding: 0,
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        color: '#e8e8f0', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
      }}>
        <span>{q}</span>
        <span style={{
          color: '#4a4a70', fontSize: '1.4rem', flexShrink: 0,
          transition: 'transform 0.25s, color 0.2s',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      {open && (
        <p style={{
          color: '#7070a0', fontSize: '0.85rem', lineHeight: 1.75,
          marginTop: '0.75rem', animation: 'fadeUp 0.2s ease both',
        }}>{a}</p>
      )}
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: 'auto', position: 'relative', zIndex: 1 }}>

      {/* FAQ */}
      <div id="faq" style={{ maxWidth: 680, margin: '0 auto', padding: '3.5rem 1.5rem 2.5rem' }}>
        <p style={{
          textAlign: 'center', fontSize: '0.7rem', color: '#f5a623',
          letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
          marginBottom: '0.5rem',
        }}>Got Questions?</p>
        <h2 style={{
          fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.4rem,3vw,1.85rem)',
          fontWeight: 700, textAlign: 'center', marginBottom: '2rem', color: '#e8e8f0',
        }}>Frequently Asked Questions</h2>
        {FAQS.map((f, i) => <FAQItem key={i} {...f} />)}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '1.1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
        maxWidth: 940, margin: '0 auto',
      }}>
        <span style={{ color: '#2a2a45', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} <a href="https://atsresumecheck.vercel.app" style={{ textDecoration: 'none', color: '#3a3a60' }}>atsresumecheck.vercel.app</a>
        </span>
        <span style={{ color: '#2a2a45', fontSize: '0.78rem' }}>🔒 Privacy-first · No data stored · Free forever</span>
      </div>
    </footer>
  )
}
