import './SectionIntro.css'

export default function SectionIntro({ kicker, title, copy, action }) {
  return (
    <div className="section-intro">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {copy && <div className="intro-aside"><p>{copy}</p>{action}</div>}
    </div>
  )
}
