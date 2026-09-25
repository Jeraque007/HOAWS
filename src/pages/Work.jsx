import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import ProjectCard from '../components/ProjectCard'
import ContactBand from '../components/ContactBand'
import { workItems } from '../lib/site'
import './Work.css'

export default function Work() {
  return (
    <main>
      <SEO
        title="Work | HOAWS"
        description="Explore selected digital brands, websites, products, and identities created by HOAWS."
        path="/work"
      />

      <PageHero kicker="Work" title={<>Digital places<br /><em>with purpose.</em></>} copy="We make brands easier to find, understand and choose. Explore a selection of our recent builds." />
      <section className="section work-page">
        <div className="container">
          <div className="project-grid project-grid-full">
            {workItems.slice(4).map(item => (
              <ProjectCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>
      <ContactBand />
    </main>
  )
}
