import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LandingPageData } from '@/app/context/AppContext';

interface LandingPageViewProps {
  landingPage: LandingPageData;
  onBack: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ landingPage, onBack }) => {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </motion.button>
      </div>

      {/* Sections */}
      {landingPage.sections.map((section, idx) => {
        switch (section.type) {
          case 'hero':
            return (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="relative min-h-[600px] flex items-center justify-center mb-16 overflow-hidden"
              >
                {/* Background Image */}
                {section.images && section.images[0] && (
                  <div className="absolute inset-0">
                    <img
                      src={section.images[0]}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
                  </div>
                )}

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10 text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-7xl font-bold text-white mb-6"
                  >
                    {section.title}
                  </motion.h1>
                  {section.content && (
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl text-white/90 max-w-3xl mx-auto mb-8"
                    >
                      {section.content}
                    </motion.p>
                  )}
                  {section.buttonText && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-full shadow-lg shadow-amber-500/50 transition-all inline-flex items-center gap-2"
                    >
                      {section.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.section>
            );

          case 'content':
            return (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="container mx-auto px-4 mb-16"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-12 border border-white/10">
                    {section.title && (
                      <h2 className="text-4xl font-bold text-white mb-6">
                        {section.title}
                      </h2>
                    )}
                    {section.content && (
                      <p className="text-xl text-white/70 leading-relaxed">
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>
            );

          case 'gallery':
            return (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="container mx-auto px-4 mb-16"
              >
                {section.title && (
                  <h2 className="text-4xl font-bold text-white text-center mb-12">
                    {section.title}
                  </h2>
                )}
                {section.images && section.images.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.images.map((image, imgIdx) => (
                      <motion.div
                        key={imgIdx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2 + imgIdx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-2xl overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Gallery ${imgIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            );

          case 'cta':
            return (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="container mx-auto px-4 mb-16"
              >
                <div className="bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-amber-900/30 rounded-3xl p-16 text-center border border-amber-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_70%)]" />
                  
                  <div className="relative">
                    {section.title && (
                      <h2 className="text-5xl font-bold text-white mb-6">
                        {section.title}
                      </h2>
                    )}
                    {section.content && (
                      <p className="text-2xl text-white/80 max-w-3xl mx-auto mb-10">
                        {section.content}
                      </p>
                    )}
                    {section.buttonText && (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-16 py-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xl rounded-full shadow-lg shadow-amber-500/50 transition-all inline-flex items-center gap-3"
                      >
                        {section.buttonText}
                        <ArrowRight className="w-6 h-6" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
