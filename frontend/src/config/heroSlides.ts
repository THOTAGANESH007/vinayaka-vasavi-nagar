// Edit these 3 slides to control the homepage carousel.
// imageUrl: paste a direct link to an image (must end in .jpg/.png/.webp etc,
//           or be a link that serves an image directly — not a webpage).
//           Leave as an empty string '' to fall back to a designed gradient
//           background instead of a photo.
// eyebrow:  small label shown above the title
// title:    short heading only — keep it a few words, not a paragraph

export interface HeroSlideConfig {
  eyebrow: string
  title: string
  imageUrl: string
}

export const HERO_SLIDES: HeroSlideConfig[] = [
  {
    eyebrow: 'Podalakur',
    title: 'Vinayaka Youth Vasavi Nagar',
    imageUrl: '/assets/first.jpeg',
  },
  {
    eyebrow: 'Ganesh Chaturthi 2026',
    title: 'Faith. Devotion. Unity.',
    imageUrl: '/assets/second.jpeg',
  },
  {
    eyebrow: 'Our Community',
    title: 'Celebrating Together',
    imageUrl: '/assets/ganeshaaa.webp',
  },
]
