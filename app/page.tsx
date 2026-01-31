'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Zap, Code2, CheckCircle2, Languages } from 'lucide-react';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">LaunchOnce</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="outline" size="sm" className="text-sm">Sign in</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-sm">
              Get started
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 mb-6">
              <Zap className="w-3 h-3" />
              <span>Powered by Lingo.dev</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Share anything,<br />in any language
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create a page for your hackathon project, product launch, portfolio, event, or announcement. 
              Write once in your language—visitors see it in theirs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base group">
                Start building free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="h-12 px-8 text-base">
                See how it works
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">No credit card required • Live in 2 minutes</p>
          </motion.div>

          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 bg-white rounded-lg px-6 py-4 shadow-lg mb-6">
                    <Languages className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Auto-translated to</div>
                      <div className="text-xs text-gray-500">Spanish • French • German • Japanese • 50+ more</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">Your content, their language</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Languages supported', value: '50+' },
              { label: 'Setup time', value: '< 2 min' },
              { label: 'Code changes', value: '0' },
              { label: 'Translation files', value: '0' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm font-medium text-blue-600 mb-4">THE PROBLEM</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Great work deserves a global audience
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                You built a hackathon project, launched a side project, or created a portfolio. 
                But sharing it with a global audience means translation costs, technical complexity, 
                and ongoing maintenance. So most creators only reach English speakers.
              </p>
              <div className="space-y-3">
                {[
                  'Translation services cost hundreds to thousands per language',
                  'Building multi-language support requires technical expertise',
                  'Every content update means re-translating everything'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-gray-500 mb-2">Traditional approach</div>
                    <div className="font-mono text-sm text-gray-700">
                      Write content → Find translators → Pay per language → Deploy → Repeat forever
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-blue-600 mb-2">With LaunchOnce</div>
                    <div className="font-mono text-sm text-blue-900">
                      Write once → Deploy → Reach everyone
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm font-medium text-blue-600 mb-4">HOW IT WORKS</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From idea to global launch in minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple enough for a side project, powerful enough for production
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Choose what to share',
                description: 'Hackathon project, portfolio, product, event, news—anything you want the world to see.',
                icon: <Code2 className="w-6 h-6" />
              },
              {
                step: '02',
                title: 'Fill in the details',
                description: 'Add your title, description, and content. Write everything in your native language.',
                icon: <Zap className="w-6 h-6" />
              },
              {
                step: '03',
                title: 'Publish instantly',
                description: 'Get a custom URL immediately. Your page is live and ready to share globally.',
                icon: <Globe className="w-6 h-6" />
              },
              {
                step: '04',
                title: 'Visitors see their language',
                description: 'Automatic language detection and selection. Content translates in real-time via Lingo.dev.',
                icon: <CheckCircle2 className="w-6 h-6" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 h-full border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium text-blue-600 mb-2">Step {item.step}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm font-medium text-blue-600 mb-4">USE CASES</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Share anything with anyone, anywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Hackathon projects',
                description: 'Showcase your weekend hack to judges and users worldwide. Perfect for DevPost, demo days, and competitions.',
              },
              {
                title: 'Product launches',
                description: 'Launch your SaaS, app, or tool globally from day one. Reach international early adopters without translation costs.',
              },
              {
                title: 'Portfolio sites',
                description: 'Let your work speak to a global audience. Ideal for designers, developers, and creators seeking worldwide opportunities.',
              },
              {
                title: 'Event pages',
                description: 'Conferences, meetups, workshops—make your events accessible to international attendees instantly.',
              },
              {
                title: 'Announcements',
                description: 'Company news, feature releases, or important updates—communicate clearly across language barriers.',
              },
              {
                title: 'Side projects',
                description: 'That tool you built for fun? Share it globally. You never know who might find it useful.',
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="h-full p-6 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">
                Stop limiting your audience
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Your next visitor could be from Tokyo, Berlin, or São Paulo. Make sure they understand what you built.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 text-base">
                  Get started free
                </Button>
                <Button variant="outline" className="bg-stone-950 border-stone-950 text-white hover:text-white hover:bg-stone-800 h-12 px-8 text-base">
                  Schedule demo
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                Free to start • No credit card • Your first page is always free
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">LaunchOnce</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Docs</a>
              <a href="#" className="hover:text-gray-900">API</a>
              <a href="#" className="hover:text-gray-900">Support</a>
              <a href="#" className="hover:text-gray-900">GitHub</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 LaunchOnce. Powered by Lingo.dev
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}