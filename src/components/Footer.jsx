import { useState } from 'react'

const FAQS = [
  { q:'Is my resume stored or shared anywhere?', a:'Absolutely not. Your file is processed in memory and deleted immediately after analysis — even if an error occurs. Nothing is logged, stored, or transmitted.' },
  { q:'What is an ATS and why does my score matter?', a:'Applicant Tracking Systems (ATS) are used by 98% of Fortune 500 companies to filter resumes automatically before a human ever reads them. A low ATS score means automatic rejection.' },
  { q:'What file formats are supported?', a:'PDF (.pdf) and Word Document (.docx / .doc) files up to 5 MB. For best results use a text-based PDF — scanned image PDFs cannot be parsed.' },
  { q:'How is the ATS score calculated?', a:'Weighted average across 5 parameters: Keywords & Skills (35%), ATS Formatting (20%), Resume Sections (20%), Contact Information (15%), Quantified Achievements (10%).' },
  { q:'Is this tool completely free?', a:'Yes — no account, no credit card, no limits, no ads. Runs on Vercel\'s free serverless tier.' },
  { q:'Why does my resume score low on keywords?', a:'ATS systems look for specific tool and skill names. Vague language like "proficient in coding" won\'t match — you need to write "Python", "React", "AWS" explicitly.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid var(--border)', padding:'1rem 0' }}>
      <button onClick={()=>setOpen(!open)} style={{
        background:'none', border:'none', padding:0, width:'100%', textAlign:'left',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem',
        color:'var(--navy)', fontSize:'0.9rem', fontWeight:500, cursor:'pointer',
      }}>
        <span>{q}</span>
        <span style={{ color:'var(--dim)', fontSize:'1.25rem', flexShrink:0, transition:'transform 0.2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && (
        <p style={{ color:'var(--body)', fontSize:'0.85rem', lineHeight:1.75, marginTop:'0.75rem', animation:'fadeUp 0.2s ease both' }}>{a}</p>
      )}
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{ borderTop:'1px solid var(--border)', marginTop:'auto', position:'relative', zIndex:1, background:'var(--surface)' }}>
      <div id="faq" style={{ maxWidth:680, margin:'0 auto', padding:'3.5rem 1.5rem 2.5rem' }}>
        <p style={{ textAlign:'center', fontSize:'0.7rem', color:'var(--teal)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'0.5rem' }}>Got Questions?</p>
        <h2 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(1.4rem,3vw,1.85rem)', fontWeight:700, textAlign:'center', marginBottom:'2rem', color:'var(--navy)' }}>
          Frequently Asked Questions
        </h2>
        {FAQS.map((f,i)=><FAQItem key={i} {...f}/>)}
      </div>
      <div style={{ borderTop:'1px solid var(--border)', padding:'1.1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', maxWidth:940, margin:'0 auto' }}>
        <span style={{ color:'var(--dim)', fontSize:'0.78rem' }}>
          © {new Date().getFullYear()} <a href="https://atsresumecheck.vercel.app" style={{ color:'var(--teal)' }}>atsresumecheck.vercel.app</a>
        </span>
        <span style={{ color:'var(--dim)', fontSize:'0.78rem' }}>🔒 Privacy-first · No data stored · Free forever</span>
      </div>
    </footer>
  )
}
