import styles from './CertificatePreview.module.css'

export default function CertificatePreview({ certificate }) {
  return (
    <div id="certificate-print-area" className={styles.paper}>
      <div className={styles.seal}>
        <span className={styles.sealStar}>★</span>
        <strong style={{ fontSize: 10 }}>OSTA</strong>
        <span style={{ fontSize: 6, letterSpacing: '0.1em' }}>OFFICIAL</span>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#64748b' }}>
        OROMIA SCIENCE AND TECHNOLOGY AUTHORITY
      </p>

      <div className={styles.goldDivider} />

      <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '0.04em', margin: 0 }}>
        Certificate of Completion
      </h1>

      <p style={{ fontStyle: 'italic', color: '#64748b', marginTop: 18, marginBottom: 4 }}>
        This certifies that
      </p>
      <p className={styles.recipientName}>{certificate.recipientName}</p>
      <p style={{ color: '#64748b', fontSize: 14 }}>has successfully completed</p>
      <p style={{ fontSize: 'clamp(16px, 2.4vw, 20px)', margin: '10px 0' }}>{certificate.courseName}</p>

      <p style={{ fontSize: 13, color: '#64748b', margin: '14px 0 4px' }}>
        Completed on {certificate.completionDate}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>
        Final Score: {certificate.score}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 32 }}>
        <div style={{ textAlign: 'center', fontFamily: '-apple-system, sans-serif' }}>
          <strong style={{ display: 'block', fontSize: 13, borderTop: '1px solid #cbd5e1', paddingTop: 6, marginTop: 24 }}>
            {certificate.instructorName}
          </strong>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{certificate.instructorTitle}</span>
        </div>
      </div>

      <div className={styles.certificateFooter}>
        <span>Certificate No. {certificate.certificateNumber}</span>
        <span>Verify at osta.gov.et/verify</span>
      </div>
    </div>
  )
}