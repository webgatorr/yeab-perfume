'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Star, MapPin, Mail, Instagram, Check } from 'lucide-react';
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
      name: 'Fresh & Clean',
      subtitle: 'Citrus & Light',
      image: '/images/28m1.png',
      description: 'Light, airy scents perfect for everyday confidence',
      notes: ['Bergamot', 'Green Tea', 'White Musk'],
      color: 'bg-sky-50'
    },
    {
      id: 2,
      name: 'Bold Signature',
      subtitle: 'Deep & Intense',
      image: '/images/29m1.png',
      description: 'Rich, powerful fragrances that command attention',
      notes: ['Oud', 'Amber', 'Leather'],
      color: 'bg-amber-50'
    },
    {
      id: 3,
      name: 'Elegant Essence',
      subtitle: 'Floral & Refined',
      image: '/images/28m2.png',
      description: 'Sophisticated blends for special moments',
      notes: ['Rose', 'Jasmine', 'Sandalwood'],
      color: 'bg-rose-50'
    },
  ];

  const visionPoints = [
    { title: 'Identity over trends', description: 'Your scent should reflect who you are, not what\'s popular' },
    { title: 'Quality over quantity', description: 'We focus on exceptional craftsmanship, not mass production' },
    { title: 'Presence over noise', description: 'Subtle confidence that speaks louder than words' }
  ];

  const qualityFeatures = [
    'High-quality fragrance oils',
    'Long-lasting formulations',
    'Balanced, modern scent profiles',
    'Elegant and minimal packaging'
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
                Collection
              </a>
              <a href="#about" className="text-sm tracking-wide text-slate-600 hover:text-slate-900 transition-colors uppercase font-light">
                About
              </a>
              <a href="#vision" className="text-sm tracking-wide text-slate-600 hover:text-slate-900 transition-colors uppercase font-light">
                Vision
              </a>
              <a href="#contact" className="text-sm tracking-wide text-slate-600 hover:text-slate-900 transition-colors uppercase font-light">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
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
                <motion.p
                  variants={fadeInUp}
                  className="text-sm tracking-[0.3em] text-amber-900/70 uppercase font-medium"
                >
                  Modern Luxury Fragrance
                </motion.p>
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] md:leading-[1.1]"
                >
                  Luxury is not loud. <br className="hidden lg:block" />
                  <span className="italic text-amber-900/90 relative inline-block">
                    It is remembered.
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
                  Yeab Perfume is a modern luxury fragrance brand crafted for those who value presence, depth, and individuality.
                </motion.p>
                <motion.p
                  variants={fadeInUp}
                  className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light"
                >
                  Each scent is designed to elevate your identity and leave a lasting impression.
                  <span className="block mt-2 text-amber-900/80 font-medium">Experience refined fragrance — from Dubai to the world.</span>
                </motion.p>
              </div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#collection"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="tracking-wide">Explore the Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-200 text-slate-900 rounded-full hover:bg-slate-50 transition-all hover:-translate-y-1"
                >
                  <span className="tracking-wide">Shop Yeab Perfume</span>
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4 lg:flex lg:gap-12 pt-8 border-t border-slate-100">
                {[
                  { value: 'Dubai', label: 'Crafted In' },
                  { value: '24h+', label: 'Long Lasting' },
                  { value: 'Global', label: 'Presence' }
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
                  alt="Yeab Perfume - Modern Luxury Fragrance"
                  fill
                  className="object-contain drop-shadow-2xl scale-110 lg:scale-100"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 lg:px-12 bg-gradient-to-b from-white to-slate-50 relative">
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
                About Us
              </div>
              <h2 className="text-4xl lg:text-6xl font-serif leading-none text-slate-900">
                Built on <br />
                <span className="italic text-amber-900/80">Precision & Purpose</span>
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed font-light text-lg">
                <p>
                  Yeab Perfume is built on precision, quality, and purpose. Our fragrances are carefully developed using premium-grade oils and expertly balanced compositions to deliver long-lasting, elegant scents.
                </p>
                <p>
                  Inspired by modern lifestyles and global standards, Yeab Perfume blends luxury with authenticity — creating fragrances that feel personal, confident, and timeless.
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xl font-serif text-slate-800 italic">
                    "This is not mass production. This is intentional creation."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 px-6 lg:px-12 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp} className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs tracking-widest text-amber-200 font-bold uppercase mb-6">
              Our Vision
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 text-white">
              We believe true luxury is <br />
              <span className="italic text-amber-200">subtle, confident, and meaningful.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-300 max-w-2xl mx-auto font-light text-lg">
              At Yeab Perfume, our vision is to redefine modern fragrance by focusing on what truly matters.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {visionPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center"
              >
                <div className="w-16 h-16 mx-auto border border-amber-200/30 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-200/60 group-hover:bg-amber-200/10 transition-colors">
                  <Star className="w-8 h-8 text-amber-200" />
                </div>
                <h3 className="text-2xl font-serif mb-3 text-white">{point.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-xl text-amber-200/80 font-serif italic mt-16"
          >
            Every bottle reflects refinement, discipline, and self-assurance.
          </motion.p>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-xs tracking-widest text-amber-900 font-bold uppercase mb-6 shadow-sm">
              Craftsmanship & Quality
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">
              Crafted with <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-amber-700">Attention to Detail</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 max-w-2xl mx-auto font-light text-lg">
              Our perfumes are crafted with attention to every detail — from the first spray to the final note.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 group border border-slate-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  </div>
                  {/* Decorative Corner Element */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-amber-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Feature Text */}
                <h3 className="relative text-lg font-semibold text-slate-900 mb-2 group-hover:text-amber-900 transition-colors duration-300">
                  {feature}
                </h3>

                {/* Subtle Description */}
                <p className="relative text-sm text-slate-500 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {idx === 0 && "Premium ingredients sourced globally"}
                  {idx === 1 && "Engineered for all-day wear"}
                  {idx === 2 && "Expertly balanced compositions"}
                  {idx === 3 && "Sophisticated minimalist design"}
                </p>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16 space-y-4"
          >
            <p className="text-xl text-slate-600 font-light">
              Yeab Perfume is designed to <span className="font-semibold text-amber-900">perform</span>.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-300" />
              <span className="uppercase tracking-widest">From the first spray to the final note</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-300" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-24 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-white rounded-full text-xs tracking-widest text-amber-900 font-bold uppercase mb-6 shadow-sm">
              The Collection
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
              Discover Modern Fragrances
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-light text-lg">
              A curated range of modern fragrances for men and women. From fresh and clean expressions to deep, bold signatures — each scent is created to complement different moments, moods, and identities.
            </p>
            <p className="text-amber-900/80 font-medium mt-4 text-lg italic">
              Choose a fragrance that speaks without words.
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

      {/* Special Edition Campaign */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

        {/* Floating Particles/Sparkles */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-amber-200 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content - Typography */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 font-bold uppercase text-xs tracking-[0.2em] mb-4">

                Special Edition Campaign
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1]">
                1 Purchase. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 italic">
                  1 Opportunity.
                </span>
              </h2>

              <div className="space-y-4">
                <p className="text-xl text-slate-300 font-light max-w-lg mx-auto lg:mx-0">
                  With every Yeab Perfume purchase, you unlock the chance to transform your future.
                </p>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-amber-400/80 uppercase tracking-widest font-semibold">Grand Prize</span>
                  <span className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                    1,000,000 <span className="text-3xl lg:text-4xl">Birr</span>
                  </span>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <p className="text-xs text-slate-500 self-center uppercase tracking-widest">
                  Limited Time Event
                </p>
              </div>
            </motion.div>

            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative w-full max-w-md aspect-[3/4] lg:aspect-square">
                <Image
                  src="/images/ticket.png"
                  alt="Golden Ticket Giveaway"
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-in-out cursor-pointer"
                />
                {/* Floating 'Ticket' Label or Badge */}
                <div className="absolute -bottom-10 -right-4 lg:right-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <p className="text-amber-200 text-xs uppercase tracking-widest font-bold mb-1">Entry Status</p>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Open for Entries
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-2 bg-slate-100 rounded-full text-xs tracking-widest text-slate-700 font-bold uppercase">
                Global Presence
              </div>
              <h2 className="text-4xl lg:text-6xl font-serif leading-tight text-slate-900">
                Rooted locally. <br />
                <span className="italic text-amber-900/80">Presented globally.</span>
              </h2>
              <p className="text-slate-600 leading-relaxed font-light text-lg">
                Yeab Perfume operates between Dubai and Ethiopia, combining international quality standards with authentic identity.
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-amber-900" />
                  <div>
                    <div className="font-medium text-slate-900">Dubai</div>
                    <div className="text-sm text-slate-500">Crafted Excellence</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-amber-900" />
                  <div>
                    <div className="font-medium text-slate-900">Ethiopia</div>
                    <div className="text-sm text-slate-500">Authentic Roots</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden bg-slate-100 shadow-2xl group"
            >
              <Image
                src="/images/global_presence.png"
                alt="From Dubai to Ethiopia - A Global Journey"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-10 left-10 right-10 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-3xl font-serif italic tracking-wide mb-3">From Dubai to the World</p>
                <div className="h-0.5 w-12 bg-amber-400 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                <p className="text-sm font-light text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  Bridging distances with the art of perfumery.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 lg:px-12 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs tracking-widest text-amber-200 font-bold uppercase mb-6"
          >
            Contact & Connect
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 text-white"
          >
            Join the <span className="italic text-amber-200">Yeab Experience</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <a href="mailto:info@yeabperfume.com" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-lg">info@yeabperfume.com</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center mb-12"
          >
            <a href="https://instagram.com/YeabPerfume" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              <Instagram className="w-5 h-5" />
              <span>@YeabPerfume</span>
            </a>
            <a href="https://tiktok.com/@YeabPerfume" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
              <span>@YeabPerfume</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 text-slate-400"
          >
            <MapPin className="w-5 h-5" />
            <span>Dubai | Ethiopia</span>
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
              <p className="text-slate-500 text-sm leading-relaxed max-w-md font-light mb-4">
                Modern luxury. Lasting presence.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md font-light">
                Crafting refined fragrances that elevate your identity and leave a lasting impression — from Dubai to the world.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-slate-900 tracking-wide">Explore</h4>
              <ul className="space-y-3">
                <li><a href="#collection" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Collection</a></li>
                <li><a href="#about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#vision" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Vision</a></li>
                <li><a href="#contact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-slate-900 tracking-wide">Connect</h4>
              <ul className="space-y-3">
                <li><a href="https://instagram.com/YeabPerfume" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Instagram</a></li>
                <li><a href="https://tiktok.com/@YeabPerfume" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">TikTok</a></li>
                <li><a href="mailto:info@yeabperfume.com" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Email</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 font-light">
              © {new Date().getFullYear()} Yeab Perfume. All rights reserved.
            </p>
            <p className="text-sm text-slate-500 font-light italic">
              Modern luxury. Lasting presence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
