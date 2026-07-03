export type Film = {
  id: string;
  title: string;
  creator: string;
  ratePerMin: string;
  duration: string;
  genre: string;
  year: number;
  rating: string;
  description: string;
  poster: string;
  backdrop: string;
  isStub?: boolean;
  featured?: boolean;
};

export const CATEGORIES = [
  { key: 'featured', label: 'Featured Films' },
  { key: 'trending', label: 'Trending Now' },
  { key: 'new-releases', label: 'New Releases' },
  { key: 'premium', label: 'Premium Libraries' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const FILM_CATALOG: Film[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    creator: 'Blender Foundation',
    ratePerMin: '0.002000',
    duration: '10 min',
    genre: 'Animation',
    year: 2008,
    rating: 'PG',
    description:
      'A giant rabbit teams up with three tiny rodents to outwit a bullying squirrel in this whimsical open-source animated short.',
    poster:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1720789980725-a6eaf9662df9?w=1600&h=900&fit=crop',
    featured: true,
  },
  {
    id: 'sintel',
    title: 'Sintel',
    creator: 'Durian Open Movie Project',
    ratePerMin: '0.002000',
    duration: '15 min',
    genre: 'Fantasy / Action',
    year: 2010,
    rating: 'PG-13',
    description:
      'A young girl embarks on a perilous journey through snow-covered mountains to reunite with her lost pet dragon.',
    poster:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop',
    featured: true,
  },
  {
    id: 'stub-cosmos',
    title: 'Beyond the Cosmos',
    creator: 'Arc Originals',
    ratePerMin: '0.002000',
    duration: '22 min',
    genre: 'Sci-Fi',
    year: 2025,
    rating: 'PG-13',
    description:
      'A deep space crew discovers an ancient civilization artifact that rewrites the laws of physics — and the clock is ticking.',
    poster:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&h=900&fit=crop',
    isStub: true,
    featured: true,
  },
  {
    id: 'stub-neon',
    title: 'Neon Dynasty',
    creator: 'Arc Originals',
    ratePerMin: '0.002000',
    duration: '18 min',
    genre: 'Thriller',
    year: 2025,
    rating: 'R',
    description:
      'In a rain-soaked cyberpunk metropolis, a hacker uncovers a conspiracy that threatens to collapse the digital underworld.',
    poster:
      'https://images.unsplash.com/photo-1559583109-3e7960136e99?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1559583109-3e7960136e99?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-coral',
    title: 'Coral Refuge',
    creator: 'Indie Ocean',
    ratePerMin: '0.002000',
    duration: '14 min',
    genre: 'Documentary',
    year: 2024,
    rating: 'G',
    description:
      'An underwater odyssey through the last pristine coral reefs on Earth, captured in stunning 8K HDR.',
    poster:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-mirage',
    title: 'Mirage Motel',
    creator: 'Noir Pictures',
    ratePerMin: '0.002000',
    duration: '20 min',
    genre: 'Drama',
    year: 2025,
    rating: 'R',
    description:
      'A stranded traveler checks into a desert motel where nothing is as it seems — and the past refuses to stay buried.',
    poster:
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe70?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe70?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-aurora',
    title: 'Aurora Rising',
    creator: 'Arc Originals',
    ratePerMin: '0.002000',
    duration: '16 min',
    genre: 'Fantasy',
    year: 2025,
    rating: 'PG',
    description:
      'A young mage must master the ancient light magic before an eclipse plunges the world into eternal darkness.',
    poster:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-steel',
    title: 'Steel Horizon',
    creator: 'Indie Ocean',
    ratePerMin: '0.002000',
    duration: '19 min',
    genre: 'Action',
    year: 2024,
    rating: 'PG-13',
    description:
      'When a rogue AI seizes control of a naval fleet, one disgraced captain must sail into the storm to stop it.',
    poster:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-velvet',
    title: 'Velvet Underground',
    creator: 'Noir Pictures',
    ratePerMin: '0.002000',
    duration: '12 min',
    genre: 'Music',
    year: 2025,
    rating: 'PG-13',
    description:
      'A visual album that follows a jazz singer through the neon-lit clubs of 1950s Paris in a single continuous shot.',
    poster:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-pixel',
    title: 'Pixel Dreams',
    creator: 'Indie Ocean',
    ratePerMin: '0.002000',
    duration: '8 min',
    genre: 'Animation',
    year: 2024,
    rating: 'G',
    description:
      'A hand-drawn animated short about a lonely pixel who journeys across a vintage video game world to find its creator.',
    poster:
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-fractal',
    title: 'Fractal',
    creator: 'Arc Originals',
    ratePerMin: '0.002000',
    duration: '13 min',
    genre: 'Sci-Fi',
    year: 2025,
    rating: 'PG',
    description:
      'A mathematician discovers that the universe can be reduced to a single repeating pattern — and someone is trying to erase it.',
    poster:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-wildfire',
    title: 'Wildfire',
    creator: 'Noir Pictures',
    ratePerMin: '0.002000',
    duration: '17 min',
    genre: 'Drama',
    year: 2024,
    rating: 'R',
    description:
      'Two estranged siblings must unite to save their family ranch as an uncontrolled wildfire races toward their valley.',
    poster:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-lume',
    title: 'Lumière',
    creator: 'Arc Originals',
    ratePerMin: '0.002000',
    duration: '11 min',
    genre: 'Animation',
    year: 2025,
    rating: 'G',
    description:
      'A wordless animated fable about a firefly searching for light in an abandoned city — told entirely through light and shadow.',
    poster:
      'https://images.unsplash.com/photo-1470071459604-7b8ec44ffd0e?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1470071459604-7b8ec44ffd0e?w=1600&h=900&fit=crop',
    isStub: true,
  },
  {
    id: 'stub-terminal',
    title: 'Terminal Velocity',
    creator: 'Indie Ocean',
    ratePerMin: '0.002000',
    duration: '21 min',
    genre: 'Action',
    year: 2025,
    rating: 'PG-13',
    description:
      'A skydiving champion is framed for a crime she did not commit and must use her aerial skills to clear her name.',
    poster:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=600&fit=crop&crop=center',
    backdrop:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1600&h=900&fit=crop',
    isStub: true,
  },
];

export const FILM_BY_ID = Object.fromEntries(FILM_CATALOG.map((f) => [f.id, f]));

export function getCategoryFilms(): Record<CategoryKey, Film[]> {
  return {
    featured: FILM_CATALOG.filter((f) => f.featured),
    trending: FILM_CATALOG.filter((f) => !f.featured && !f.isStub),
    'new-releases': FILM_CATALOG.filter((f) => f.isStub && f.year === 2025),
    premium: FILM_CATALOG.filter((f) => f.isStub && f.year === 2024),
  };
}
