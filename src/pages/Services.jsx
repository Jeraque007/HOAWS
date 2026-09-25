import { Check } from 'lucide-react'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import ContactBand from '../components/ContactBand'
import { services } from '../lib/site'
import './Services.css'

export default function Services() {
  return (
    <main>
      <SEO
        title="Services | HOAWS"
        description="Digital strategy, web experiences, social content, and business systems from HOAWS."
        path="/services"
      />

      <PageHero kicker="Services" title={<>Make the complex<br /><em>feel possible.</em></>} copy="The right digital partner can turn scattered ideas into a clear, compelling experience. That&apos;s the work we like doing." />
      <section className="section services-page">
        <div className="container service-detail-list">
          {services.map((service, index) => (
            <article className="service-detail" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <ul>
                  {service.tags.map(tag => <li key={tag}><Check size={15} />{tag}</li>)}
                </ul>
              </div>
              <span className="service-index">0{index + 1}</span>
            </article>
          ))}
        </div>
      </section>
      <ContactBand />
    </main>
  )
}
