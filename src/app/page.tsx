import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-800">
        <span className="text-white font-semibold text-lg">Blanche Bridal</span>
        <div className="flex items-center gap-4">
          <Link
            href="/collection"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Collection
          </Link>
          <Link
            href="/rental"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Rentals
          </Link>
          <Link
            href="/booking"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Book Appointment
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            About
          </Link>
          <Link
            href="/auth/login"
            className="text-sm bg-white text-gray-900 px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">
          Est. 2024 — Sri Lanka
        </p>
        <h1 className="text-5xl font-semibold text-white mb-4 leading-tight">
          Your Perfect Day
          <br />
          Starts Here
        </h1>
        <p className="text-gray-400 max-w-md mb-8">
          Discover our curated collection of bridal gowns, rental dresses, and
          personalized styling services.
        </p>
        <div className="flex gap-4">
          <Link
            href="/collection"
            className="bg-white text-gray-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            View Collection
          </Link>
          <Link
            href="/booking"
            className="border border-gray-700 text-gray-300 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-900 transition"
          >
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Dummy sections row */}
      <section className="px-8 py-10 border-t border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Collection",
              desc: "Browse our full bridal collection.",
              href: "/collection",
            },
            {
              label: "Rentals",
              desc: "Affordable rental options for every style.",
              href: "/rental",
            },
            {
              label: "Testimonials",
              desc: "See what our brides are saying.",
              href: "/testimonials",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition"
            >
              <h3 className="text-white font-medium mb-1">{item.label}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-gray-800 text-center text-xs text-gray-600">
        © 2026 Blanche Bridal. All rights reserved.
      </footer>
    </main>
  );
}
