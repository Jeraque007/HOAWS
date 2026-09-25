import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import SEO from './components/SEO'
import Home from './pages/Home'
import Services from './pages/Services'
import TesseraLumen from './pages/TesseraLumen'
import Work from './pages/Work'
import About from './pages/About'
import Reviews from './pages/Reviews'
import ReviewAdmin from './pages/ReviewAdmin'
import Card from './pages/Card'

function App() {
  return (
    <>
      <ScrollToTop />
      {/* Baseline metadata for every route; individual pages render their own
          <SEO /> with route-specific title, description and canonical URL. */}
      <SEO />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tessera-lumen" element={<TesseraLumen />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/admin" element={<ReviewAdmin />} />
        <Route path="/digital-card" element={<Card />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
