import Link from 'next/link';
import { MessageCircle, Sparkles, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-jade-50 dark:from-warm-950 dark:via-warm-900 dark:to-jade-950">
      {/* Header */}
      <header className="border-b border-warm-200 dark:border-warm-800 bg-white/50 dark:bg-warm-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-2xl font-semibold text-warm-900 dark:text-warm-50">Her</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="btn btn-ghost text-warm-700 dark:text-warm-300"
              >
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-jade-100 px-4 py-2 text-sm font-medium text-jade-700 dark:bg-jade-900/50 dark:text-jade-300 slide-up">
            <Sparkles className="h-4 w-4" />
            <span>Experience conversations that feel natural</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-50 sm:text-6xl slide-up">
            Meet Her
          </h1>

          <p className="mb-8 text-xl text-warm-600 dark:text-warm-400 slide-up">
            Your warm, intelligent AI companion. Experience conversations that feel like chatting with a
            wise, understanding friend.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center slide-up">
            <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
              Start Chatting
            </Link>
            <Link
              href="/about"
              className="btn btn-secondary text-lg px-8 py-4"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-jade-500" />}
            title="Natural Conversations"
            description="Experience flowing dialogues that feel warm, understanding, and genuinely helpful."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-jade-500" />}
            title="Lightning Fast"
            description="Real-time streaming responses for instant feedback and smooth interactions."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-jade-500" />}
            title="Secure & Private"
            description="Your conversations are encrypted and stored securely. Your privacy matters."
          />
        </div>

        {/* Design Philosophy */}
        <div className="mt-32 rounded-3xl bg-gradient-to-br from-jade-50 to-warm-50 p-12 dark:from-jade-950/50 dark:to-warm-900/50">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-warm-900 dark:text-warm-50">
              温润如玉
            </h2>
            <p className="text-lg text-warm-600 dark:text-warm-400">
              Her embodies the ancient Chinese philosophy of being &ldquo;warm and smooth like jade&rdquo; —
              gentle, elegant, and radiating quiet confidence. Every interaction is designed to feel
              natural, comforting, and beautifully human.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-200 dark:border-warm-800 bg-white/50 dark:bg-warm-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-warm-500 dark:text-warm-400">
            <p>© 2024 Her. Made with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 transition-all duration-300 hover:shadow-jade hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-warm-900 dark:text-warm-50">{title}</h3>
      <p className="text-warm-600 dark:text-warm-400">{description}</p>
    </div>
  );
}
