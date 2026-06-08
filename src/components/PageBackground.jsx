import { useState, useEffect } from 'react';
import './PageBackground.css';

const LOGOS = [
  { src: '/images/python.svg', top: '6%', left: '4%', size: 52, rotate: -14, speed: 0.07 },
  { src: '/images/javascript.svg', top: '12%', right: '6%', size: 44, rotate: 10, speed: -0.05 },
  { src: '/images/react.svg', top: '28%', left: '2%', size: 40, rotate: 8, speed: 0.11 },
  { src: '/images/html.svg', top: '22%', right: '3%', size: 48, rotate: -6, speed: -0.08 },
  { src: '/images/git.svg', top: '42%', left: '7%', size: 38, rotate: -18, speed: 0.06 },
  { src: '/images/docker.svg', top: '38%', right: '8%', size: 42, rotate: 12, speed: 0.13 },
  { src: '/images/django.svg', top: '55%', left: '3%', size: 46, rotate: 6, speed: -0.09 },
  { src: '/images/typescript.svg', top: '52%', right: '4%', size: 40, rotate: -10, speed: 0.1 },
  { src: '/images/java.svg', top: '68%', left: '9%', size: 44, rotate: -8, speed: -0.06 },
  { src: '/images/sql.svg', top: '64%', right: '7%', size: 36, rotate: 14, speed: 0.08 },
  { src: '/images/csharp.svg', top: '78%', left: '5%', size: 42, rotate: 10, speed: 0.12 },
  { src: '/images/flutter.svg', top: '82%', right: '5%', size: 40, rotate: -12, speed: -0.07 },
  { src: '/images/api.svg', top: '18%', left: '14%', size: 34, rotate: -4, speed: 0.05 },
  { src: '/images/data.svg', top: '48%', right: '14%', size: 36, rotate: 4, speed: -0.11 },
];

const ICONS = [
  { id: 'book', top: '8%', left: '48%', size: 46, rotate: -8, speed: 0.09 },
  { id: 'code', top: '32%', left: '88%', size: 50, rotate: 6, speed: -0.1 },
  { id: 'terminal', top: '58%', left: '78%', size: 44, rotate: -5, speed: 0.07 },
  { id: 'braces', top: '72%', left: '42%', size: 56, rotate: 3, speed: -0.08 },
  { id: 'book', top: '88%', left: '68%', size: 40, rotate: -11, speed: 0.11 },
  { id: 'code', top: '46%', left: '22%', size: 38, rotate: 12, speed: -0.06 },
];

function DecorIcon({ id }) {
  if (id === 'book') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    );
  }
  if (id === 'code') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
      </svg>
    );
  }
  if (id === 'terminal') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m6 10 3 3-3 3" />
        <path d="M12 16h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M8 4H6a2 2 0 0 0-2 2v2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function parallaxTransform(scrollY, item) {
  const y = scrollY * item.speed;
  const x = scrollY * item.speed * 0.25;
  return `translate3d(${x}px, ${y}px, 0) rotate(${item.rotate}deg)`;
}

export default function PageBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionOk(!mq.matches);

    const onMotionChange = (e) => setMotionOk(!e.matches);
    mq.addEventListener('change', onMotionChange);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener('change', onMotionChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const offset = motionOk ? scrollY : 0;

  return (
    <div className="page-bg-decor" aria-hidden>
      {LOGOS.map((item) => (
        <img
          key={item.src + item.top}
          className="page-bg-decor-item page-bg-decor-logo"
          src={item.src}
          alt=""
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            width: item.size,
            height: item.size,
            transform: parallaxTransform(offset, item),
          }}
        />
      ))}
      {ICONS.map((item, i) => (
        <span
          key={`${item.id}-${i}`}
          className="page-bg-decor-item page-bg-decor-icon"
          style={{
            top: item.top,
            left: item.left,
            width: item.size,
            height: item.size,
            transform: parallaxTransform(offset, item),
          }}
        >
          <DecorIcon id={item.id} />
        </span>
      ))}
    </div>
  );
}
