import { ExternalLink } from 'lucide-react'
import './ProjectCard.css'

export default function ProjectCard({ item }) {
  return (
    <a className="project-card cyan" href={item.url} target="_blank" rel="noreferrer">
      <div className="project-art"><img src={item.image} alt={item.title} /></div>
      <div className="project-details">
        <div>
          <p className="project-type">{item.type}</p>
          <h3>{item.title}</h3>
        </div>
        <ExternalLink size={17} />
      </div>
    </a>
  )
}
