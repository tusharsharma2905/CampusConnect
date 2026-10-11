'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Sparkles, Users, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-8 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>The New Era of Campus Events</span>
          </div>

          <h1 className="max-w-4xl mx-auto text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Connect, Discover, and <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Experience Campus Life
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-12">
            The all-in-one platform for students to find events and for organizers to manage them seamlessly. Elevate your university experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1" asChild>
              <Link href="/events">
                Explore Events <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-muted transition-all duration-300" asChild>
              <Link href="/auth/register">
                Join Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-lg text-muted-foreground">Powerful tools designed for the modern campus.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl bg-background border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Showcase Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Trusted by thousands of students</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl glassmorphism">
              <span className="text-4xl md:text-5xl font-extrabold text-primary mb-2">50k+</span>
              <span className="font-medium text-muted-foreground">Active Students</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl glassmorphism">
              <span className="text-4xl md:text-5xl font-extrabold text-primary mb-2">2k+</span>
              <span className="font-medium text-muted-foreground">Events Hosted</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl glassmorphism">
              <span className="text-4xl md:text-5xl font-extrabold text-primary mb-2">150+</span>
              <span className="font-medium text-muted-foreground">Clubs & Societies</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl glassmorphism">
              <span className="text-4xl md:text-5xl font-extrabold text-primary mb-2">4.9</span>
              <span className="font-medium text-muted-foreground">App Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-10 md:p-16 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your campus experience?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto relative z-10">
              Join the community today and never miss out on another amazing event.
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full shadow-lg hover:scale-105 transition-transform duration-300 relative z-10" asChild>
              <Link href="/auth/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Discover Events",
    description: "Browse a curated feed of events happening around your campus tailored to your interests."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Manage Attendees",
    description: "Organizers get powerful tools for ticketing, QR check-ins, and audience analytics."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Updates",
    description: "Get instant notifications about schedule changes, new announcements, and more."
  }
];
