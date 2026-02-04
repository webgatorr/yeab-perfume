'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const perfumes = [
    {
      id: 1,
      name: 'Essence Collection',
      subtitle: 'Floral & Woody',
      image: '/images/28m1.png',
      description: 'A harmonious blend of jasmine and sandalwood',
      notes: ['Jasmine', 'Sandalwood', 'Amber'],
    },
    {
      id: 2,
      name: 'Luxury Series',
      subtitle: 'Oriental & Spicy',
      image: '/images/28m2.png',
      description: 'Rich amber notes with hints of vanilla',
      notes: ['Amber', 'Vanilla', 'Oud'],
    },
    {
      id: 3,
      name: 'Premium Edition',
      subtitle: 'Fresh & Citrus',
      image: '/images/29m1.png',
      description: 'Bergamot and neroli with a touch of musk',
      notes: ['Bergamot', 'Neroli', 'Musk'],
    },
  ];

  return (
    <div className="bg-white text-slate-900">
      {/* Elegant Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="group flex items-center gap-3">
              <div className="text-2xl font-light tracking-[0.25em]">YEAB</div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Perfume</div>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              <a href="#collection" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Scent Profiles
              </a>
              <a href="#about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean & Spacious */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-light leading-tight">
                  Create Your
                  <span className="block font-serif italic text-amber-900 mt-2">Custom Scent</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Experience bespoke perfumery with our handcrafted, made-to-order fragrances tailored just for you.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#about"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all"
                >
                  Order Custom Perfume
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-900 rounded-full hover:border-slate-300 transition-all"
                >
                  Learn More
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-12 pt-8 border-t border-slate-100">
                <div>
                  <div className="text-3xl font-light mb-1">100%</div>
                  <div className="text-sm text-slate-500">Custom Made</div>
                </div>
                <div>
                  <div className="text-3xl font-light mb-1">24h</div>
                  <div className="text-sm text-slate-500">Long Lasting</div>
                </div>
                <div>
                  <div className="text-3xl font-light mb-1">100%</div>
                  <div className="text-sm text-slate-500">Natural</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-[700px]">
              {/* Soft background blend - no hard edges */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-amber-50/20 to-white blur-3xl scale-110 -z-10" />

              <Image
                src="/images/hero.png"
                alt="Featured Perfume"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Why Choose Yeab</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We're committed to creating exceptional fragrances that tell your unique story
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center mb-6 group-hover:border-slate-300 transition-colors">
                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Premium Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                Handcrafted with the finest ingredients sourced from around the world
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center mb-6 group-hover:border-slate-300 transition-colors">
                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Long-Lasting</h3>
              <p className="text-slate-600 leading-relaxed">
                Fragrances that stay with you throughout the day and into the night
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center mb-6 group-hover:border-slate-300 transition-colors">
                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Custom Blends</h3>
              <p className="text-slate-600 leading-relaxed">
                Every perfume is made to order, tailored to your unique preferences and style
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              Signature Fragrances
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore our most popular scent profiles - each can be customized to your preference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {perfumes.map((perfume, index) => (
              <div
                key={perfume.id}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image */}
                <div className="relative h-80 bg-gradient-to-br from-slate-50 to-amber-50/30 overflow-hidden">
                  <Image
                    src={perfume.image}
                    alt={perfume.name}
                    fill
                    className="object-contain p-12 group-hover:scale-110 transition-transform duration-700"
                  />
                  {hoveredIndex === index && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-slate-500">Notes</div>
                        <div className="flex gap-2 justify-center flex-wrap px-4">
                          {perfume.notes.map((note) => (
                            <span
                              key={note}
                              className="px-3 py-1 bg-white rounded-full text-xs border border-slate-200"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="text-xs text-amber-600 font-medium mb-2 uppercase tracking-wider">
                    {perfume.subtitle}
                  </div>
                  <h3 className="text-2xl font-light mb-3">{perfume.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {perfume.description}
                  </p>
                  <button className="w-full py-3 border-2 border-slate-900 text-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all font-medium">
                    Order Custom
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-amber-50">
              <Image
                src="/images/hero.png"
                alt="About Yeab Perfume"
                fill
                className="object-contain p-16"
              />
            </div>

            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-amber-50 rounded-full text-sm text-amber-900 font-medium">
                Our Story
              </div>
              <h2 className="text-4xl lg:text-5xl font-light leading-tight">
                Crafted with
                <span className="block font-serif italic text-amber-900 mt-2">Passion & Precision</span>
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  At Yeab Perfume, we believe that fragrance is deeply personal. That's why we don't sell pre-made perfumes—we create each bottle specifically for you.
                </p>
                <p>
                  Our master perfumers work with you to understand your preferences, personality, and desired scent profile. Using the finest ingredients from around the world, we craft a unique fragrance that's exclusively yours.
                </p>
              </div>
              <div className="pt-6">
                <a
                  href="tel:+1234567890"
                  className="inline-flex items-center gap-2 text-slate-900 font-medium hover:gap-4 transition-all"
                >
                  Contact Us to Order
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-light mb-6 leading-tight">
            Ready to Create Your Custom Scent?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Contact us to start your bespoke perfume journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-900 rounded-full hover:border-slate-300 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xl font-light tracking-[0.25em]">YEAB</div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Perfume</div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                Crafting luxury fragrances that transcend time and trends. Each bottle tells a story of elegance and sophistication.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-slate-900">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#collection" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Scent Profiles</a></li>
                <li><a href="#about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-slate-900">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Facebook</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Yeab Perfume. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
