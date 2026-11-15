import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-surface py-space-xl">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[540px] h-[540px] bg-secondary-fixed/30 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 left-10 w-[420px] h-[420px] bg-surface-container-high/40 rounded-full blur-2xl -z-10" />
      <div className="w-full max-w-[1360px] mx-auto px-margin-mobile md:px-gutter lg:px-margin">
        {/* Top announcement pill */}
        <div className="flex items-center justify-center md:justify-start mb-space-md">
          <Link to="#how-it-works" className="group inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-all shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-label-sm text-primary">✨ Introducing CareCircle 2.0</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm hidden sm:inline">• Bridging Generations with Smart Medication Care</span>
            <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>
        {/* Main headline + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end mb-space-xl">
          <div className="lg:col-span-8 flex flex-col gap-space-sm">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-[1.08] max-w-4xl">
              Better Care Starts With Staying <span className="text-primary underline decoration-secondary-container decoration-4 underline-offset-8">Connected</span>.
            </h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-2xl mt-space-xs">
              Manage medications, coordinate doctor visits, and keep the family members who matter informed — all from one intelligent, accessible care ecosystem.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-space-sm lg:items-start">
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <button className="min-h-[52px] px-space-xl rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.98] w-full sm:w-auto" id="hero-demo-btn">
                <span>Try Live Demo</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <Link to="#why-carecircle" className="min-h-[52px] px-space-lg rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg flex items-center justify-center w-full sm:w-auto">
                Explore CareCircle
              </Link>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm mt-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
              <span>No credit card required • Passcode-protected care circles</span>
            </div>
          </div>
        </div>
        {/* Hero Bento Grid – we'll render sub‑cards via separate components */}
        {/* Placeholder for now */}
      </div>
    </section>
  );
};

export default HeroSection;
