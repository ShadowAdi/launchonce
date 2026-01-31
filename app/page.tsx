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
  Menu,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Globe className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold tracking-tight">LaunchOnce</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium hover:text-foreground/80 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-foreground/80 transition-colors">
                How it works
              </Link>
              <div className="h-4 w-px bg-border"></div>
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link href="/document">
                        <Button variant="ghost" size="sm">
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={logout}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost" size="sm">
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                          Get started
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="#features" 
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </Link>
              <div className="border-t border-border/40 pt-3 space-y-2">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <>
                        <Link href="/document" className="block">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="block">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Sign in
                          </Button>
                        </Link>
                        <Link href="/register" className="block">
                          <Button size="sm" className="w-full bg-foreground text-background hover:bg-foreground/90">
                            Get started
                          </Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden"
      >
        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          style={{ y }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground/5 border border-border/50 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Create once, share everywhere</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="block mb-2">Document & Share</span>
            <span className="block">Globally.</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Create documents, build forms, and share your content with a global audience—all in one place, automatically translated.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href={isAuthenticated ? "/create" : "/register"}>
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-base group">
                Start creating free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            No credit card required • Live in minutes
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.5,
            delay: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border/40">
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
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Documents Feature */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 bg-foreground/5 border border-border/50 rounded-full mb-6">
                <span className="text-xs uppercase tracking-wider font-medium">
                  Documents
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Create rich, beautiful documents
              </h2>

              <p className="text-lg md:text-xl leading-relaxed mb-8 text-muted-foreground">
                Write your product announcements, project showcases, portfolios,
                or any content with our intuitive editor.
              </p>

              <div className="space-y-3">
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
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-foreground/5 border border-border/50 rounded-2xl">
                <FileText className="w-12 h-12 mb-6 opacity-80" />
                <div className="space-y-4">
                  <div className="h-3 bg-foreground/10 rounded w-3/4"></div>
                  <div className="h-3 bg-foreground/10 rounded w-full"></div>
                  <div className="h-3 bg-foreground/10 rounded w-5/6"></div>
                  <div className="h-16 bg-foreground/10 rounded mt-6"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-foreground/20 rounded w-20"></div>
                    <div className="h-8 bg-foreground/10 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Global Share Feature */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="p-8 bg-foreground/5 border border-border/50 rounded-2xl">
                <Globe className="w-12 h-12 mb-6 opacity-80" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-background border border-border/50 rounded-lg">
                    <Languages className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">English</div>
                      <div className="text-xs text-muted-foreground">Original</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {["Español", "Français", "日本語", "Deutsch"].map((lang, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="p-3 bg-background border border-border/50 rounded-lg text-center text-sm"
                      >
                        {lang}
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    + 46 more languages
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block px-3 py-1 bg-foreground/5 border border-border/50 rounded-full mb-6">
                <span className="text-xs uppercase tracking-wider font-medium">
                  Global reach
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Share with the whole world
              </h2>

              <p className="text-lg md:text-xl leading-relaxed mb-8 text-muted-foreground">
                Your visitors automatically see content in their preferred
                language. No translation files, no setup complexity.
              </p>

              <div className="space-y-3">
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
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-foreground/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 bg-background border border-border/50 rounded-full mb-6"
            >
              <span className="text-xs uppercase tracking-wider font-medium">
                Forms & Feedback
              </span>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Collect responses, any language
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Create forms for feedback, surveys, registrations. Users respond in their language.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ClipboardList className="w-8 h-8" />,
                title: "Document Forms",
                description: "Add forms directly to your documents for instant feedback",
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Public Forms",
                description: "Create standalone forms—surveys, registrations, contact forms",
              },
              {
                icon: <Languages className="w-8 h-8" />,
                title: "Multi-language Support",
                description: "Forms automatically adapt to visitor language",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className="h-full p-6 bg-background border border-border/50 rounded-xl hover:border-foreground/20 transition-colors">
                  <div className="mb-4 opacity-80">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-3 py-1 bg-foreground/5 border border-border/50 rounded-full mb-6">
              <span className="text-xs uppercase tracking-wider font-medium">
                Simple process
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How it works
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
              From idea to global reach in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: "01",
                title: "Create",
                description: "Write your document or build your form with our intuitive editor",
              },
              {
                step: "02",
                title: "Publish",
                description: "Get your unique URL instantly—no deployment, no configuration",
              },
              {
                step: "03",
                title: "Share",
                description: "Your content automatically translates for every visitor",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="text-7xl font-bold opacity-5 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center p-6 bg-foreground/5 border border-border/50 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm mb-2 text-muted-foreground">
              Translation powered by
            </p>
            <a
              href="https://lingo.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-2"
            >
              Lingo.dev
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Ready to go global?
            </h2>

            <p className="text-lg md:text-xl mb-10 text-muted-foreground">
              Start sharing your work with the world today.
              <br className="hidden sm:block" />
              No credit card required.
            </p>

            <Link href={isAuthenticated ? "/create" : "/register"}>
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-lg group">
                Create your first document
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-semibold">LaunchOnce</span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Share your documents and forms globally with automatic translation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <Link href="/document" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div>© 2026 LaunchOnce. All rights reserved.</div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                <span>Special thanks to</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://lingo.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-foreground transition-colors"
                  >
                    Lingo.dev
                  </a>
                  <span>•</span>
                  <a
                    href="https://kombai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-foreground transition-colors"
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
