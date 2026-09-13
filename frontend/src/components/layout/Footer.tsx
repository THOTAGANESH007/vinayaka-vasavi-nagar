import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-maroon-deep text-cream/90 mt-16">
      <div className="container-app py-10">
        <div className="flex flex-col items-center text-center gap-3">
          <img src="/favicon.svg" alt="" className="w-10 h-10" />
          <h2 className="font-display text-xl text-cream">Vinayaka Youth Vasavi Nagar</h2>
          <p className="text-cream/70 text-sm tracking-wide">Podalakur</p>
          <p className="text-cream/60 text-sm italic max-w-sm">
            Celebrating faith, devotion, unity, and happiness together.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors" aria-label="YouTube">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-5 text-center">
          <p className="text-cream/50 text-xs">© {new Date().getFullYear()} Vinayaka Youth Vasavi Nagar. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
