import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,90,71,0.06)]">
      <div className="h-20 w-full px-margin-mobile md:px-gutter lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <a className="flex items-center gap-space-sm group" href="#">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">CareCircle</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline tracking-wider">Connected Care. Peace of Mind.</span>
            </div>
          </a>
        </div>
        <nav className="hidden xl:flex items-center gap-space-sm" data-active-classes="text-primary font-bold bg-surface-container-low rounded-lg">
          <NavLink to="#features" className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md">Features</NavLink>
          <NavLink to="#how-it-works" className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md">How It Works</NavLink>
          <NavLink to="#why-carecircle" className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md">Why CareCircle</NavLink>
          <NavLink to="#security-and-privacy" className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md">Security &amp; Privacy</NavLink>
          <NavLink to="#faq" className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md">FAQ</NavLink>
        </nav>
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <div className="relative inline-flex items-center">
            <button aria-label="Language selector" className="min-h-[48px] px-space-sm sm:px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-space-xs transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px] text-primary">language</span>
              <span className="font-label-md text-label-md hidden sm:inline">EN</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
            </button>
          </div>
          <NavLink to="/login" className="min-h-[48px] px-space-md py-space-xs rounded-lg text-primary hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center justify-center">Sign In</NavLink>
          <NavLink to="#demo" className="min-h-[48px] px-space-lg py-space-xs rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-[0_1px_3px_rgba(15,90,71,0.08)] active:scale-[0.98] hidden md:inline-flex items-center justify-center">Try Live Demo</NavLink>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
