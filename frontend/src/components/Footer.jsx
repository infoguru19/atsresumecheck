import { useState } from 'react'

const faqs = [
  {
    q: 'Is my resume stored anywhere?',
    a: 'No. Your resume is processed entirely in server memory and deleted immediately after analysis. We never store, log, or share your file.',
  },
  {
    q: 'What is an ATS score?',
    a: 'ATS (Applicant Tracking System) is software that companies use to filter resumes automatically. A higher ATS score means your resume is more likely to pass the automated filter and reach a human recruiter.',
  },
  {
    q: 'What file formats are supported?',
    a: 'PDF (.pdf) and Word Document (.docx / .doc) files up to 5MB are supported.',
  },
  {
    q: 'Is this tool free?',
    a: 'Yes, completely free. No sign-up, no credit card, no hidden fees.',
  },
  {
    q: 'How is the ATS score calculated?',
    a: 'The score is calculated across 5 weighted parameters: Keywords & Skills (35%), ATS Formatting (20%), Resume Sections (20%), Contact Information (15%), and Quantified Achievements (10%).',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', color: '#f0f0f8',
          fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', padding: 0,
        }}
      >
        {q}
        <span style={{ color: '#8888aa', fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </button>
      {open && (
        <p style={{ color: '#8888aa', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.7, animation: 'fadeUp 0.2s ease' }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 'auto',
    }}>
      {/* FAQ Section */}
      <div id="faq" style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '1.25rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
        maxWidth: 900, margin: '0 auto',
      }}>
        <span style={{ color: '#555577', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} atsresumecheck.vercel.app — Free ATS Resume Checker
        </span>
        <span style={{ color: '#555577', fontSize: '0.8rem' }}>
          🔒 Privacy-first · No data stored
        </span>
      </div>
    </footer>
  )
}
