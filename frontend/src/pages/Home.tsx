import HeroCarousel from '../components/home/HeroCarousel'
import CountdownSection from '../components/home/CountdownSection'
import UpcomingEvents from '../components/home/UpcomingEvents'
import MediaPreview from '../components/home/MediaPreview'
import CoordinatorsSection from '../components/home/CoordinatorsSection'

export default function Home() {
  return (
    <div>
      <HeroCarousel />
      <CountdownSection />
      <UpcomingEvents />
      <MediaPreview />
      <CoordinatorsSection />
    </div>
  )
}
