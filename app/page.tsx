'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  const perfumes = [
    {
      id: 1,
      name: 'Essence Collection',
      subtitle: 'Floral & Woody',
      image: '/images/28m1.png',
      description: 'A harmonious blend of jasmine and sandalwood',
      notes: ['Jasmine', 'Sandalwood', 'Amber'],
      color: 'bg-rose-50'
    },
    {
      id: 2,
      name: 'Premium Edition',
      subtitle: 'Fresh & Citrus',
      image: '/images/29m1.png',
      description: 'Bergamot and neroli with a touch of musk',
      notes: ['Bergamot', 'Neroli', 'Musk'],
      color: 'bg-emerald-50'
    },
    {
      id: 3,
      name: 'Luxury Series',
      subtitle: 'Oriental & Spicy',
      image: '/images/28m2.png',
      description: 'Rich amber notes with hints of vanilla',
      notes: ['Amber', 'Vanilla', 'Oud'],
      color: 'bg-amber-50'
    },

  ];

  return (
    <div className="bg-white text-slate-900 overflow-hidden">
      {/* Elegant Minimal Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="group flex items-center gap-3">
              <div className="text-2xl font-serif tracking-widest text-slate-900">YEAB</div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-xs tracking-[0.2em] text-slate-500 uppercase font-light">Perfume</div>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              <a href="#collection" className="text-sm tracking-wide text-slate-600 hover:text-slate-900 transition-colors uppercase font-light">
                Scent Profiles
              </a>
              <a href="#about" className="text-sm tracking-wide text-slate-600 hover:text-slate-900 transition-colors uppercase font-light">
                About
              </a>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Clean & Spacious */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 min-h-screen flex items-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-amber-50/40 via-transparent to-transparent -z-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-10 w-96 h-96 bg-purple-50 rounded-full blur-3xl -z-10 opacity-30"
        />

        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8 lg:space-y-10 w-full text-center lg:text-left"
            >
              <div className="space-y-4 lg:space-y-6">
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[1.1] md:leading-[1.1]"
                >
                  Create Your <br className="hidden lg:block" />
                  <span className="italic text-amber-900/90 relative inline-block">
                    Custom Scent
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                      viewBox="0 0 300 12"
                      className="absolute -bottom-2 left-0 w-full text-amber-300"
                    >
                      <path d="M2 10C50 2 150 2 298 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </motion.svg>
                  </span>
                </motion.h1>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light"
                >
                  Experience bespoke perfumery with our handcrafted, made-to-order fragrances tailored just for you.
                </motion.p>
              </div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#about"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="tracking-wide">Order Custom Perfume</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-200 text-slate-900 rounded-full hover:bg-slate-50 transition-all hover:-translate-y-1"
                >
                  <span className="tracking-wide">Learn More</span>
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4 lg:flex lg:gap-12 pt-8 border-t border-slate-100">
                {[
                  { value: '100%', label: 'Custom Made' },
                  { value: '24h', label: 'Long Lasting' },
                  { value: '100%', label: 'Natural' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl lg:text-3xl font-serif mb-1">{stat.value}</div>
                    <div className="text-[10px] lg:text-sm text-slate-500 tracking-wider uppercase">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <div className="relative h-[400px] lg:h-[800px] w-full mb-8 lg:mb-0 lg:mt-0">
              <motion.div
                style={{ y: y2 }}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="relative h-full w-full"
              >
                {/* Soft background blend */}
                <div className="absolute inset-x-10 inset-y-20 bg-gradient-to-br from-amber-100/50 via-white/50 to-slate-100/30 blur-3xl -z-10 rounded-full" />

                <Image
                  src="/images/hero.png"
                  alt="Featured Perfume"
                  fill
                  className="object-contain drop-shadow-2xl scale-110 lg:scale-100"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">Why Choose Yeab</motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 max-w-2xl mx-auto font-light text-lg">
              We're committed to creating exceptional fragrances that tell your unique story
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Premium Quality',
                description: 'Handcrafted with the finest ingredients sourced from around the world.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                )
              },
              {
                title: 'Long-Lasting',
                description: 'Fragrances that stay with you throughout the day and into the night.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              },
              {
                title: 'Custom Blends',
                description: 'Every perfume is made to order, tailored to your unique preferences and style.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                )
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-900/20 group-hover:bg-amber-50 group-hover:text-amber-900 transition-colors">
                  <svg className="w-8 h-8 text-slate-700 group-hover:text-amber-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-serif mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
              Signature Fragrances
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-light text-lg">
              Explore our most popular scent profiles - each can be customized to your preference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {perfumes.map((perfume, index) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image */}
                <div className={`relative h-[500px] ${perfume.color} overflow-hidden transition-colors duration-500`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="relative w-full h-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src={perfume.image}
                        alt={perfume.name}
                        fill
                        className="object-contain scale-90 group-hover:scale-100 transition-transform duration-700"
                      />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 bg-white/60 flex items-center justify-center z-10"
                      >
                        <div className="text-center space-y-3 px-6">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-sm font-medium text-slate-800 tracking-widest uppercase"
                          >
                            Scent Notes
                          </motion.div>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {perfume.notes.map((note, i) => (
                              <motion.span
                                key={note}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-4 py-2 bg-white rounded-full text-xs font-medium border border-slate-200 shadow-sm"
                              >
                                {note}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="text-xs text-amber-900/60 font-bold mb-3 uppercase tracking-widest">
                    {perfume.subtitle}
                  </div>
                  <h3 className="text-3xl font-serif mb-3 font-medium text-slate-800">{perfume.name}</h3>
                  <p className="text-slate-600 text-sm mb-8 leading-relaxed font-light">
                    {perfume.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 lg:px-12 bg-gradient-to-b from-amber-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] lg:h-[600px] rounded-[2rem] overflow-hidden bg-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-amber-50/50" />
              <Image
                src="/images/hero2.png"
                alt="About Yeab Perfume"
                fill
                className="object-contain p-12 hover:scale-105 transition-transform duration-1000"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-2 bg-amber-50 rounded-full text-xs tracking-widest text-amber-900 font-bold uppercase">
                Our Story
              </div>
              <h2 className="text-4xl lg:text-6xl font-serif leading-none text-slate-900">
                Crafted with <br />
                <span className="italic text-amber-900/80">Passion & Precision</span>
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed font-light text-lg">
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
                  className="group inline-flex items-center gap-3 text-slate-900 font-medium hover:text-amber-900 transition-colors"
                >
                  <span className="border-b border-slate-900 group-hover:border-amber-900 pb-0.5">Contact Us to Order</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-6xl font-serif mb-8 text-white"
          >
            Ready to Create Your <br /> <span className="italic text-amber-200">Custom Scent?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 mb-12 font-light"
          >
            Contact us to start your bespoke perfume journey today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-all hover:scale-105 font-medium tracking-wide"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 border border-white/20 text-white rounded-full hover:bg-white/10 transition-all hover:scale-105 font-medium tracking-wide"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="text-xl font-serif tracking-widest">YEAB</div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Perfume</div>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md font-light">
                Crafting luxury fragrances that transcend time and trends. Each bottle tells a story of elegance and sophistication.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-slate-900 tracking-wide">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#collection" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Scent Profiles</a></li>
                <li><a href="#about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-slate-900 tracking-wide">Socials</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Facebook</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 font-light">
              © {new Date().getFullYear()} Yeab Perfume. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
