import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Menu,
  X,
  Code2,
  FileText,
  Check,
  ChevronDown,
  Github,
  Twitter,
  ArrowRight,
  Zap,
  Package,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const GridPattern = () => (
  <svg
    className="absolute inset-0 h-full w-full stroke-brand-500 opacity-[0.08]"
    aria-hidden="true"
  >
    <defs>
      <pattern
        id="grid-pattern"
        width="200"
        height="200"
        x="0"
        y="0"
        patternUnits="userSpaceOnUse"
      >
        <path d="M 200 0 L 0 0 0 200" fill="none" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
  </svg>
);

const LandingNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`sticky top-5 z-50 mx-auto w-[90%] md:w-[70%] lg:max-w-screen-xl rounded-2xl border border-white/10 p-2 transition-all duration-300 ${scrolled ? "bg-dark-900/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-dark-900/60 backdrop-blur-sm"}`}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer px-4 group"
          onClick={() => navigate("/")}
        >
          <img src="/logo.svg" alt="AutoDoc AI" className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" />
          <span className="font-bold text-xl text-white transition-colors duration-200 group-hover:text-brand-400">AutoDoc AI</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-gray-400 hover:text-brand-400 transition-colors duration-200 py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-3 px-4">
          <a
            href="/login"
            className="text-sm font-medium text-gray-400 hover:text-brand-400 transition-colors duration-200"
          >
            Log In
          </a>
          <a
            href="/login"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-500 hover:scale-105 hover:shadow-lg hover:shadow-brand-600/25 active:scale-95 transition-all duration-200"
          >
            Get Started
          </a>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-6 h-6 text-gray-400" />
          ) : (
            <Menu className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
        <div className="pb-2 border-t border-white/10">
          <div className="flex flex-col space-y-1 pt-3 px-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-gray-400 hover:text-brand-400 hover:bg-white/5 py-2.5 px-3 rounded-lg transition-all duration-200"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col space-y-1 pt-2 border-t border-white/10">
              <a
                href="/login"
                className="text-sm font-medium text-gray-400 hover:text-brand-400 hover:bg-white/5 py-2.5 px-3 rounded-lg transition-all duration-200"
              >
                Log In
              </a>
              <a
                href="/login"
                className="bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium text-center hover:bg-brand-500 active:scale-95 transition-all duration-200"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current, { y: 30, opacity: 0, duration: 0.6 })
        .from(headingRef.current, { y: 40, opacity: 0, duration: 0.7 }, "-=0.3")
        .from(
          subtitleRef.current,
          { y: 30, opacity: 0, duration: 0.6 },
          "-=0.4",
        )
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(noteRef.current, { y: 15, opacity: 0, duration: 0.4 }, "-=0.2");

      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.5,
        });

        gsap.to(cards[0], {
          y: -15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
        gsap.to(cards[1], {
          y: -25,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2,
          },
        });
        gsap.to(cards[2], {
          y: -10,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(cards[3], {
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2.5,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-dark-950 pt-14 pb-16 px-6"
    >
      <div className="absolute inset-0">
        <GridPattern />
      </div>
      <div
        className="absolute inset-0"
        style={{
          maskImage: "radial-gradient(50% 50% at 50% 50%, white, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <span
              ref={badgeRef}
              className="inline-block bg-brand-500/10 text-brand-400 border border-brand-500/20 px-4 py-1 rounded-full text-sm font-semibold mb-5"
            >
              Introducing AutoDoc AI
            </span>
            <h1
              ref={headingRef}
              className="text-4xl md:text-5xl font-bold mb-5 text-white leading-tight"
            >
              Generate{" "}
              <span className="text-brand-400">API Docs Instantly</span> with AI
            </h1>
            <p
              ref={subtitleRef}
              className="text-lg mb-7 text-gray-400 leading-relaxed"
            >
              Connect your GitHub repo. We scan your codebase with AST parsing
              and Gemini AI to produce beautiful API documentation in seconds.
            </p>
            <a
              ref={ctaRef}
              href="/login"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </a>
            <p ref={noteRef} className="text-sm text-gray-500 mt-3">
              No backend required. Runs entirely in your browser.
            </p>
          </div>

          <div
            ref={cardsRef}
            className="w-full md:w-1/2 h-[380px] relative hidden md:block"
          >
            <div className="absolute top-0 right-8 w-60 bg-dark-900 border border-white/10 rounded-xl shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="bg-dark-950 rounded-lg p-3 font-mono text-xs border border-white/5">
                <span className="text-green-400">GET</span>{" "}
                <span className="text-brand-300">/api/users/:id</span>
                <br />
                <span className="text-green-400">POST</span>{" "}
                <span className="text-brand-300">/api/auth/login</span>
                <br />
                <span className="text-green-400">PUT</span>{" "}
                <span className="text-brand-300">/api/users/:id</span>
              </div>
            </div>

            <div className="absolute top-16 right-44 w-52 bg-dark-900 border border-white/10 rounded-xl shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-gray-300">
                  API Documentation
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/5 rounded w-full" />
                <div className="h-2 bg-white/5 rounded w-4/5" />
                <div className="h-2 bg-brand-500/20 rounded w-3/5" />
              </div>
            </div>

            <div className="absolute bottom-6 right-12 w-56 bg-dark-900 border border-white/10 rounded-xl shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Github className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-300">
                  my-api-project
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                TypeScript
                <span className="ml-auto">⭐ 128</span>
              </div>
            </div>

            <div className="absolute bottom-16 right-48 w-48 bg-dark-900 border border-white/10 rounded-xl shadow-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-gray-300">
                  Export
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">
                  Markdown
                </span>
                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">
                  HTML
                </span>
                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">
                  JSON
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(stepsRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      icon: <Github className="w-6 h-6 text-brand-400" />,
      title: "Connect GitHub",
      desc: "Paste your PAT and select a repository to scan.",
    },
    {
      icon: <Code2 className="w-6 h-6 text-brand-400" />,
      title: "Scan & Analyze",
      desc: "AST parsing detects routes, parameters, and structure.",
    },
    {
      icon: <FileText className="w-6 h-6 text-brand-400" />,
      title: "Generate Docs",
      desc: "Gemini AI produces comprehensive API documentation.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 px-6 bg-dark-900 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[150px] bg-brand-500/5 blur-3xl rounded-full" />
      <div className="max-w-7xl mx-auto relative">
        <div ref={headingRef} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white">
            How It Works
          </h2>
          <p className="text-gray-400">
            From Code to Documentation in Three Steps
          </p>
        </div>

        <div
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%]  bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

          {steps.map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4 z-10">
                {s.icon}
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-white">
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(gridRef.current?.children || [], {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: "🔍",
      title: "AST Code Analysis",
      desc: "Deep code analysis using @babel/parser to detect routes, parameters, and functions.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Docs",
      desc: "Gemini generates human-readable, comprehensive API documentation from raw code.",
    },
    {
      icon: "🔌",
      title: "GitHub Integration",
      desc: "Connect to any repo via Personal Access Token. Public or private.",
    },
    {
      icon: "📦",
      title: "Batch Processing",
      desc: "Scan multiple files with intelligent discovery. Supports Express, Fastify, and more.",
    },
    {
      icon: "📄",
      title: "Multiple Exports",
      desc: "Export as Markdown, HTML reports, or JSON for any documentation workflow.",
    },
    {
      icon: "🌐",
      title: "100% Client-Side",
      desc: "Everything runs in your browser. No data stored on external servers.",
    },
  ];

  return (
    <section ref={sectionRef} className="py-14 px-6 bg-dark-950" id="features">
      <div className="max-w-7xl mx-auto">
        <div ref={headingRef} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white">
            Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to generate and maintain API documentation.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-dark-900 border border-white/5 rounded-xl p-6 hover:border-brand-500/30 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-semibold mb-1.5 text-white">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(gridRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const tiers = [
    {
      name: "Community",
      price: "$0",
      subtitle: "Free forever",
      featured: false,
      cta: "Get Started",
      features: [
        "Unlimited repo scans",
        "AST-powered analysis",
        "AI doc generation",
        "Markdown & HTML export",
        "Client-side only",
      ],
    },
    {
      name: "Pro",
      price: "$0",
      subtitle: "Coming Soon",
      featured: true,
      badge: "Best Value",
      cta: "Join Waitlist",
      features: [
        "Everything in Community",
        "GitHub Action integration",
        "Auto-regen on push",
        "Custom templates",
        "Team collaboration",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      subtitle: "Tailored for you",
      featured: false,
      cta: "Contact Sales",
      features: [
        "Self-hosted deployment",
        "Custom AI models",
        "SSO & team mgmt",
        "SLA guarantee",
        "Dedicated support",
      ],
    },
  ];

  return (
    <section ref={sectionRef} className="py-14 px-6 bg-dark-900" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div ref={headingRef}>
          <div className="bg-brand-600/10 border border-brand-500/20 text-brand-300 py-2.5 px-4 mb-8 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Free &amp; Open Source — Start generating docs today</span>
          </div>

          <h2 className="text-3xl font-bold text-center mb-1 text-white">
            Pricing
          </h2>
          <p className="text-center text-gray-400 mb-10 text-sm">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`bg-dark-950 rounded-xl p-6 relative border ${t.featured ? "border-2 border-brand-500 shadow-xl shadow-brand-500/10" : "border-white/5"}`}
            >
              {t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                  {t.badge}
                </div>
              )}
              <h3 className="text-lg font-semibold mb-1 text-white">
                {t.name}
              </h3>
              <div className="mb-1">
                <span className="text-3xl font-bold text-white">{t.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-5">{t.subtitle}</p>
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors mb-5 ${t.featured ? "bg-brand-600 text-white hover:bg-brand-500" : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"}`}
              >
                {t.cta}
              </button>
              <ul className="space-y-2.5">
                {t.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center text-gray-400 text-sm"
                  >
                    <Check className="w-4 h-4 mr-2 text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqs = [
  {
    q: "What languages and frameworks are supported?",
    a: "Currently supports JavaScript/TypeScript projects using Express, Fastify, Hapi, and similar route-based frameworks. The AST parser detects .get(), .post(), .put(), .delete() calls and extracts route parameters automatically.",
  },
  {
    q: "Is my code sent to any servers?",
    a: "Your code is parsed entirely in your browser using @babel/parser. Only the relevant code snippets are sent to Google's Gemini API for documentation generation. No code is stored on any server.",
  },
  {
    q: "Do I need a backend?",
    a: "No! AutoDoc AI runs entirely client-side in your browser. You just need a GitHub Personal Access Token to access your repositories.",
  },
  {
    q: "What export formats are supported?",
    a: "AutoDoc AI supports Markdown, styled HTML reports, and JSON export. Each format integrates seamlessly with popular documentation platforms.",
  },
];

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(listRef.current?.children || [], {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 px-6 bg-dark-950" id="faq">
      <div className="max-w-3xl mx-auto">
        <div ref={headingRef} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white">
            FAQ
          </h2>
          <p className="text-gray-400 text-sm">
            Have more questions? Open an issue on{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>

        <div ref={listRef} className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex justify-between items-center w-full text-left p-5 bg-dark-900 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
              >
                <span className="font-semibold text-white text-sm pr-4">
                  {f.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-brand-400 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 pt-2 text-gray-400 text-sm animate-fade-in leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="py-12 px-6 bg-dark-900">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-1 text-white">Stay Updated</h2>
        <p className="text-gray-400 text-sm mb-5">
          Get notified about new features and improvements.
        </p>
        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-brand-400 font-semibold text-sm animate-fade-in">
            <Check className="w-4 h-4" /> Thanks for subscribing!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-dark-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder:text-gray-600"
            />
            <button
              type="submit"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-500 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-dark-950 border-t border-white/5 py-10"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a
                  href="#features"
                  className="hover:text-brand-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-brand-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-brand-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <span className="cursor-default">About Us</span>
              </li>
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-semibold mb-3 text-white">
              Contact Us
            </h4>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              />
              <textarea
                placeholder="Your message"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 resize-none"
              />
              <button className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-500 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} AutoDoc AI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-brand-400 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-brand-400 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <LandingNavbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};
