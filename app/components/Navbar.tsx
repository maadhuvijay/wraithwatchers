import Link from 'next/link';

interface NavbarProps {
  activePage?: 'sightings' | 'post';
}

export default function Navbar({ activePage = 'sightings' }: NavbarProps) {
  return (
    <nav className="bg-[#305669] text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👻</span>
        <span className="text-xl font-bold">WraithWatchers</span>
      </div>
      <div className="flex gap-4">
        <Link
          href="/"
          className={`px-4 py-2 rounded transition-colors ${
            activePage === 'sightings'
              ? 'bg-[#FFB36A] text-black font-semibold'
              : 'hover:bg-gray-800'
          }`}
        >
          Sightings Map
        </Link>
        <Link
          href="/post"
          className={`px-4 py-2 rounded transition-colors ${
            activePage === 'post'
              ? 'bg-[#FFB36A] text-black font-semibold'
              : 'hover:bg-gray-800'
          }`}
        >
          Post a Sighting
        </Link>
      </div>
    </nav>
  );
}

