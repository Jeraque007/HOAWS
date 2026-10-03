import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import SEO from './components/SEO'
import Home from './pages/Home'

// Route-level code splitting: only the landing page ships in the initial
// bundle. Every other route (and its dependencies, e.g. Supabase for the
// reviews pages) is fetched on demand when the visitor navigates there.
const Services = lazy(() => import('./pages/Services'))
const TesseraLumen = lazy(() => import('./pages/TesseraLumen'))
const Work = lazy(() => import('./pages/Work'))
const About = lazy(() => import('./pages/About'))
const Reviews = lazy(() => import('./pages/Reviews'))
const ReviewAdmin = lazy(() => import('./pages/ReviewAdmin'))
const PromoAdmin = lazy(() => import('./pages/PromoAdmin'))
const Card = lazy(() => import('./pages/Card'))

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <span />
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      {/* Baseline metadata for every route; individual pages render their own
          <SEO /> with route-specific title, description and canonical URL. */}
      <SEO />
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tessera-lumen" element={<TesseraLumen />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/admin" element={<ReviewAdmin />} />
          <Route path="/promos/admin" element={<PromoAdmin />} />
          <Route path="/digital-card" element={<Card />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default App
