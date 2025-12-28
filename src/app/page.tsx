import { Sparkles, Play, Zap, Brain, Camera, Video, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">daywith.me</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#technology" className="text-sm text-zinc-400 hover:text-white transition-colors">Technology</a>
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Log in
            </button>
            <button className="hidden sm:block btn-glow px-4 py-2 rounded-full text-sm font-medium text-white">
              Get Started
            </button>
            <button className="md:hidden p-2 text-zinc-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-24">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-zinc-300">AI-Powered Lifestyle Simulator</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Create Your
            <span className="gradient-text block">Digital Influencer</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Define the seed. Watch it bloom. <strong className="text-white">daywith.me</strong> creates
            autonomous AI influencers that live 24/7, generating stunning photos and videos
            that reflect their unique lifestyle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-glow px-8 py-4 rounded-full text-white font-semibold flex items-center justify-center gap-2">
              <Play className="w-5 h-5" fill="currentColor" />
              Start Creating
            </button>
            <button className="px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:bg-surface-hover transition-colors flex items-center justify-center gap-2">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Phone mockup preview */}
        <div className="relative mt-16 w-64 h-[500px] rounded-[3rem] bg-zinc-900 border-4 border-zinc-800 phone-glow animate-float overflow-hidden">
          {/* Screen content placeholder */}
          <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-b from-purple-900/50 to-pink-900/50 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-zinc-300">Live Feed</p>
              <p className="text-xs text-zinc-500 mt-1">Generating content...</p>
            </div>
          </div>
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Three simple steps to bring your digital influencer to life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold gradient-text">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Define the World</h3>
              <p className="text-zinc-400">
                Choose location, apartment style, and neighborhood. Set the stage for your influencer&apos;s life.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-8 hover:border-pink-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold gradient-text">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create the Persona</h3>
              <p className="text-zinc-400">
                Define personality vibe, style preferences, and physical appearance with reference images.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold gradient-text">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Set the Wealth</h3>
              <p className="text-zinc-400">
                Assign a starting budget that influences lifestyle choices, venues, and content quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="technology" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powered by <span className="gradient-text">AI</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              State-of-the-art generative models working 24/7
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-3 text-purple-400" />
              <h4 className="font-semibold mb-1">Life Director</h4>
              <p className="text-sm text-zinc-500">Advanced LLM</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <Camera className="w-8 h-8 mx-auto mb-3 text-pink-400" />
              <h4 className="font-semibold mb-1">Photo Generation</h4>
              <p className="text-sm text-zinc-500">AI Image Models</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <Video className="w-8 h-8 mx-auto mb-3 text-orange-400" />
              <h4 className="font-semibold mb-1">Video Generation</h4>
              <p className="text-sm text-zinc-500">AI Video Models</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
              <h4 className="font-semibold mb-1">24/7 Autonomy</h4>
              <p className="text-sm text-zinc-500">Durable Workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">daywith.me</span>
          </div>
          <p className="text-sm text-zinc-500">
            © 2025 daywith.me. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
