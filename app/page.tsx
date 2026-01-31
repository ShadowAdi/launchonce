"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Globe,
  Languages,
  ClipboardList,
  Share2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-(--color-dark) text-foreground">
      <nav className="fixed top-0 w-full bg-(--color-dark)/80 backdrop-blur-xl z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-(--color-orange) blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-(--color-orange) rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6" style={{ color: "#0A0A0A" }} />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight">
              LaunchOnce
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="text-foreground hover:text-(--color-orange)"
            >
              Sign in
            </Button>
            <Button className="bg-(--color-orange) hover:bg-(--color-orange-dark) text-(--color-dark) font-semibold">
              Get started
            </Button>
          </motion.div>
        </div>
      </nav>

      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-(--color-orange) rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-(--color-pink) rounded-full blur-3xl opacity-10"></div>
        </div>

        <motion.div
          className="relative max-w-7xl mx-auto text-center"
          style={{ opacity, scale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--color-dark-card) border border-(--border) rounded-full mb-8"
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "var(--color-orange)" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--color-gray-text)" }}
            >
              Create once, share everywhere
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="block">
              Document{" "}
              <span style={{ color: "var(--color-orange)" }}>
                Share
              </span>
            </span>
            <span className="block">Globally.</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--color-gray-text)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Create documents, build forms, and share your content with a global
            audience—
            <span style={{ color: "var(--color-orange)" }}>
              {" "}
              all in one place
            </span>
            ,
            <span style={{ color: "var(--color-pink)" }}>
              {" "}
              automatically translated
            </span>
            .
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button className="bg-(--color-orange) hover:bg-(--color-orange-dark) text-(--color-dark) h-14 px-10 text-lg font-semibold group">
              Start creating free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="h-14 px-10 text-lg border-2 border-border hover:border-(--color-orange)"
            >
              Watch demo
            </Button>
          </motion.div>

          <motion.div
            className="mt-16 text-sm"
            style={{ color: "var(--color-gray-text)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            No credit card required • Live in minutes
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-(--color-orange) rounded-full"></div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-6 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50+", label: "Languages" },
              { value: "< 2min", label: "Setup time" },
              { value: "∞", label: "Documents" },
              { value: "100%", label: "Free to start" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-5xl md:text-6xl font-bold mb-2"
                  style={{ color: "var(--color-orange)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--color-gray-text)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border border-border rounded-2xl rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-border rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-1 bg-(--color-dark-card) border border-border rounded-full mb-6">
                <span
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--color-orange)" }}
                >
                  Documents
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Create rich,
                <br />
                <span style={{ color: "var(--color-orange)" }}>
                  beautiful documents
                </span>
              </h2>

              <p
                className="text-xl leading-relaxed mb-8"
                style={{ color: "var(--color-gray-text)" }}
              >
                Write your product announcements, project showcases, portfolios,
                or any content with our intuitive editor. Add formatting,
                images, code blocks—everything you need to tell your story.
              </p>

              <div className="space-y-4">
                {[
                  "Rich text editor with full formatting",
                  "Code syntax highlighting",
                  "Embed images and media",
                  "Clean, readable layouts",
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-(--color-orange)/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: "var(--color-orange)" }}
                      />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative p-8 bg-(--color-dark-card) border border-(--border) rounded-2xl">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-(--color-orange) rounded-full blur-3xl opacity-20"></div>
                <FileText
                  className="w-16 h-16 mb-6"
                  style={{ color: "var(--color-orange)" }}
                />
                <div className="space-y-4">
                  <div className="h-4 bg-(--color-dark-lighter) rounded w-3/4"></div>
                  <div className="h-4 bg-(--color-dark-lighter) rounded w-full"></div>
                  <div className="h-4 bg-(--color-dark-lighter) rounded w-5/6"></div>
                  <div className="h-20 bg-(--color-dark-lighter) rounded mt-6"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-(--color-orange) rounded w-20"></div>
                    <div className="h-8 bg-(--color-dark-lighter) rounded w-20"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Share Globally Section */}
      <section className="py-32 px-6 bg-(--color-dark-card) relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative p-8 bg-(--color-dark) border border-(--border) rounded-2xl overflow-hidden">
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-(--color-pink) rounded-full blur-3xl opacity-20"></div>
                <Globe
                  className="w-16 h-16 mb-6"
                  style={{ color: "var(--color-pink)" }}
                />

                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-(--color-dark-lighter) rounded-lg border border-(--border)">
                    <Languages
                      className="w-6 h-6"
                      style={{ color: "var(--color-orange)" }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">English</div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-gray-text)" }}
                      >
                        Original
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {["Español", "Français", "日本語", "Deutsch"].map(
                      (lang, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-(--color-dark-lighter) rounded-lg border border-(--border) text-center text-sm"
                        >
                          {lang}
                        </motion.div>
                      ),
                    )}
                  </div>

                  <div
                    className="text-center text-sm"
                    style={{ color: "var(--color-gray-text)" }}
                  >
                    + 46 more languages
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block px-4 py-1 bg-(--color-dark) border border-(--border) rounded-full mb-6">
                <span
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--color-pink)" }}
                >
                  Global reach
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Share with the
                <br />
                <span style={{ color: "var(--color-pink)" }}>whole world</span>
              </h2>

              <p
                className="text-xl leading-relaxed mb-8"
                style={{ color: "var(--color-gray-text)" }}
              >
                Your visitors automatically see content in their preferred
                language. No translation files, no setup complexity—just instant
                global reach for your documents.
              </p>

              <div className="space-y-4">
                {[
                  "50+ languages supported",
                  "Automatic language detection",
                  "Real-time translation",
                  "Zero maintenance",
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-(--color-pink)/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: "var(--color-pink)" }}
                      />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-(--color-dark-card) border border-(--border) rounded-full mb-6"
            >
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--color-orange)" }}
              >
                Forms & Feedback
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Collect responses,
              <br />
              <span style={{ color: "var(--color-orange)" }}>any language</span>
            </motion.h2>

            <motion.p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: "var(--color-gray-text)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Create forms for feedback, surveys, registrations—attached to your
              documents or standalone. Users respond in their language, you
              receive everything organized.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <ClipboardList
                    className="w-8 h-8"
                    style={{ color: "var(--color-orange)" }}
                  />
                ),
                title: "Document Forms",
                description:
                  "Add forms directly to your documents for instant feedback and engagement",
              },
              {
                icon: (
                  <Share2
                    className="w-8 h-8"
                    style={{ color: "var(--color-pink)" }}
                  />
                ),
                title: "Public Forms",
                description:
                  "Create standalone forms that work anywhere—surveys, registrations, contact forms",
              },
              {
                icon: (
                  <Languages
                    className="w-8 h-8"
                    style={{ color: "var(--color-orange)" }}
                  />
                ),
                title: "Multi-language Support",
                description:
                  "Forms automatically adapt to visitor language, responses stay organized",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="h-full p-8 bg-(--color-dark-card) border border-(--border) rounded-2xl hover:border-(--color-orange) transition-colors">
                  <div className="mb-6">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--color-gray-text)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 bg-(--color-dark-card)">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1 bg-(--color-dark) border border-(--border) rounded-full mb-6">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--color-orange)" }}
              >
                Simple process
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              How it works
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: "var(--color-gray-text)" }}
            >
              From idea to global reach in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "Create",
                description:
                  "Write your document or build your form with our intuitive editor",
              },
              {
                step: "02",
                title: "Publish",
                description:
                  "Get your unique URL instantly—no deployment, no configuration",
              },
              {
                step: "03",
                title: "Share",
                description:
                  "Your content automatically translates for every visitor",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div
                  className="text-8xl font-bold opacity-10 mb-4"
                  style={{ color: "var(--color-orange)" }}
                >
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "var(--color-gray-text)" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center p-8 bg-(--color-dark) border border-(--border) rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="text-sm mb-2"
              style={{ color: "var(--color-gray-text)" }}
            >
              Translation powered by
            </p>
            <a
              href="https://lingo.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-2"
              style={{ color: "var(--color-orange)" }}
            >
              Lingo.dev
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-(--color-orange) rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
              Ready to go
              <br />
              <span style={{ color: "var(--color-orange)" }}>global?</span>
            </h2>

            <p
              className="text-2xl mb-12"
              style={{ color: "var(--color-gray-text)" }}
            >
              Start sharing your work with the world today.
              <br />
              No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-(--color-orange) hover:bg-(--color-orange-dark) text-(--color-dark) h-16 px-12 text-xl font-semibold group">
                Create your first document
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-(--border) py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-(--color-orange) blur-lg opacity-50"></div>
                  <div className="relative w-10 h-10 bg-(--color-orange) rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6" style={{ color: "#0A0A0A" }} />
                  </div>
                </div>
                <span className="text-2xl font-bold">LaunchOnce</span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-gray-text)" }}
              >
                Share your documents and forms globally with automatic
                translation.
              </p>
            </div>

            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--color-orange)" }}
              >
                Product
              </h3>
              <ul
                className="space-y-2 text-sm"
                style={{ color: "var(--color-gray-text)" }}
              >
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--color-orange)" }}
              >
                Company
              </h3>
              <ul
                className="space-y-2 text-sm"
                style={{ color: "var(--color-gray-text)" }}
              >
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-(--foreground) transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-(--border)">
            <div
              className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
              style={{ color: "var(--color-gray-text)" }}
            >
              <div>© 2026 LaunchOnce. All rights reserved.</div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                <span>Special thanks to</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://lingo.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "var(--color-orange)" }}
                  >
                    Lingo.dev
                  </a>
                  <span>•</span>
                  <a
                    href="https://kombai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "var(--color-pink)" }}
                  >
                    Kombai
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
