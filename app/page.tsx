'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const features = [
    {
      icon: '✍️',
      title: 'Write Once',
      description: 'Create content in one language. No duplication, no hassle.'
    },
    {
      icon: '🚀',
      title: 'Deploy Instantly',
      description: 'Publish your page immediately with a single click.'
    },
    {
      icon: '🌍',
      title: 'Global Access',
      description: 'Visitors see content in their preferred language automatically.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description: 'Create your account and get started in seconds.'
    },
    {
      number: '02',
      title: 'Create Page',
      description: 'Fill in your product, event, or announcement details in one language.'
    },
    {
      number: '03',
      title: 'Deploy',
      description: 'Publish instantly at your custom URL—no configuration needed.'
    },
    {
      number: '04',
      title: 'Go Global',
      description: 'Visitors select their language. UI updates automatically via Lingo.dev.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-transparent opacity-60" />
        
        <motion.div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="text-center" variants={itemVariants}>
            <motion.div
              className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-blue-700 font-medium text-sm">Powered by Lingo.dev</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Launch<span className="text-blue-600">Once</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Write content once. Deploy instantly. Reach the world.
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Create product launches, events, or announcements in a single language—
              and make them accessible globally without rewriting code or managing translations.
            </p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full"
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-24"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-blue-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              The Localization Problem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most teams launch products in one language only. Why?
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💸', title: 'Expensive', description: 'Professional translation services and developer time add up quickly.' },
              { icon: '⏰', title: 'Slow', description: 'Coordinating translations delays your launch and iterations.' },
              { icon: '🔧', title: 'Hard to Maintain', description: 'Every update requires re-translation and redeployment across all languages.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              The LaunchOnce Solution
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Powered by Lingo.dev, LaunchOnce eliminates the complexity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                {[
                  { icon: '✅', text: 'One-language content creation' },
                  { icon: '✅', text: 'Automatic UI localization' },
                  { icon: '✅', text: 'Easy language expansion' },
                  { icon: '✅', text: 'GitHub-based translation workflows' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">💥</span>
                  <span className="text-2xl font-bold">No code rewrite</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">💥</span>
                  <span className="text-2xl font-bold">No manual translation files</span>
                </div>
                <p className="text-blue-100 mt-6 text-lg">
                  Visitors choose their language, and the UI updates automatically.
                  You maintain content once, deploy everywhere.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Flow Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to global reach
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 transform -translate-y-1/2" />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-blue-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Ready to Go Global?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join the future of multi-language content deployment. 
            No complexity, no delays—just write once and launch everywhere.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Start Building Now
            </Button>
          </motion.div>
          <p className="text-sm text-gray-500 mt-6">
            Free to start • No credit card required • Launch in minutes
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white">
                Launch<span className="text-blue-400">Once</span>
              </span>
              <p className="text-sm mt-2">Powered by Lingo.dev</p>
            </div>
            <div className="text-sm">
              © 2026 LaunchOnce. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
