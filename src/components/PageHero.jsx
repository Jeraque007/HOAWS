import './PageHero.css'

export default function PageHero({ kicker, title, copy }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="page-hero-copy">{copy}</p>
      </div>
    </section>
  )
}
