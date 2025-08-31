import React, { useEffect, useRef } from 'react';
import { Eye, BarChart2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context((self) => {
      gsap.registerPlugin(ScrollTrigger, TextPlugin);
      const q = self.selector;

      // Heading slide-in
      gsap.from(q('.hero-title'), {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: heroRef.current, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });

      // Word-reveal for subtext
      const sub = q('.hero-subtext.reveal-words')[0];
      if (sub && !sub.dataset.split) {
        const text = (sub.textContent || '').trim();
        sub.innerHTML = text
          .split(' ')
          .map((w) => `<span class="oh"><span class="word">${w}&nbsp;</span></span>`) 
          .join('');
        sub.dataset.split = '1';
      }
      if (sub) {
        const words = sub.querySelectorAll('.word');
        gsap.set(words, { y: '110%' });
        gsap.to(words, {
          y: '0%',
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: heroRef.current, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
        });
      }

      // CTA items + features + map
      gsap.from(q('.hero-ctas > *'), {
        y: 14,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: heroRef.current, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.hero-features > *'), {
        y: 12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: heroRef.current, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.hero-map'), {
        x: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: heroRef.current, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });

      // Typewriter for hero title (multi-line)
      const lines = q('.hero-title .tw-line');
      const initLines = () => {
        lines.forEach((el) => {
          const full = el.getAttribute('data-text') || '';
          el.textContent = '';
          el.classList.remove('typing');
          // store full text for reuse
          el.dataset.full = full;
        });
      };

      initLines();
      const tl = gsap.timeline();
      lines.forEach((el) => {
        tl.add(() => el.classList.add('typing'))
          .to(el, { duration: Math.max((el.dataset.full?.length || 1) * 0.04, 0.4), ease: 'none', text: { value: el.dataset.full || '' } })
          .add(() => el.classList.remove('typing'));
      });

      // Magnetic buttons
      const magnets = q('.magnet');
      const removeFns = [];
      magnets.forEach((el) => {
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const mx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const my = (e.clientY - (r.top + r.height / 2)) / r.height;
          gsap.to(el, { x: mx * 12, y: my * 10, duration: 0.25, ease: 'power3.out' });
        };
        const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: 'power3.out' });
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        removeFns.push(() => {
          el.removeEventListener('mousemove', move);
          el.removeEventListener('mouseleave', leave);
        });
      });
      // store cleanup on the context so revert will call it
      self.add(() => removeFns.forEach((fn) => fn()));
    }, heroRef);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={heroRef} className="bg-hero bg-noise py-20 px-6 md:px-20 text-center md:text-left">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2">
          <h1 className="hero-title text-4xl lg:text-6xl font-bold leading-tight">
            <span className="tw-line" data-text="Navigate the Green"></span>
            <br />
            <span className="tw-line" data-text="Hydrogen Economy"></span>
            <br />
            <span className="tw-line" data-text="with"></span>
            <br />
            <span className="tw-line caret-primary bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent" data-text="Precision"></span>
          </h1>
          <p className="hero-subtext reveal-words mt-4 text-lg text-gray-600">
            Real-time intelligence for hydrogen infrastructure planning, investment decisions, and market positioning.
          </p>
          <div className="hero-ctas mt-8 flex justify-center md:justify-start gap-3">
            <Link to="/preferences" className="btn-sweep btn-primary magnet inline-flex items-center font-semibold py-3 px-6 rounded-xl border">
              <span className="label">Preferences</span>
              <span className="arrow ml-2">→</span>
            </Link>
            <Link to="/predict" className="btn-sweep btn-ghost magnet inline-flex items-center font-semibold py-3 px-6 rounded-xl border">
              <span className="label">Predict solar/<br></br>wind plant</span>
              <span className="arrow ml-2">→</span>
            </Link>
            <Link to="/predictdata" className="btn-sweep btn-ghost magnet inline-flex items-center font-semibold py-3 px-6 rounded-xl border">
              <span className="label">Predict Your<br></br> Hydrogen Plant</span>
              <span className="arrow ml-2">→</span>
            </Link>
          </div>
          <div className="hero-features mt-8 flex flex-wrap justify-center md:justify-start text-sm text-gray-500 space-x-4">
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Real-time data</span>
            </span>
            <span className="flex items-center space-x-1">
              <BarChart2 className="h-4 w-4" />
              <span>Market intelligence</span>
            </span>
            <span className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>Global coverage</span>
            </span>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center">
          <div className="hero-map bg-white p-4 rounded-xl shadow-2xl w-full">
            <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden">
              <iframe
                title="India Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C6.0%2C98.0%2C38.0&layer=mapnik"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;