import React, { useEffect, useRef } from 'react';

interface AIBackgroundProps {
  theme?: 'dark' | 'light';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
  pulseSpeed: number;
  isHub?: boolean;
}

const AIBackground: React.FC<AIBackgroundProps> = ({ 
  theme = 'light', 
  intensity = 'medium', 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = theme === 'dark' 
      ? {
          primary: { r: 0, g: 229, b: 255 },      
          secondary: { r: 124, g: 58, b: 237 },   
          accent: { r: 168, g: 85, b: 247 },      
          glow: { r: 192, g: 132, b: 252 },       
          shimmer: { r: 233, g: 213, b: 255 },    
        }
      : {
          primary: { r: 99, g: 102, b: 241 },     
          secondary: { r: 236, g: 72, b: 153 },   
          accent: { r: 168, g: 85, b: 247 },      
          glow: { r: 192, g: 132, b: 252 },       
          shimmer: { r: 233, g: 213, b: 255 },    
        };

    const intensityMap = {
      low: { particles: 50, hubs: 3 },
      medium: { particles: 80, hubs: 5 },
      high: { particles: 110, hubs: 7 },
    };
    const config = intensityMap[intensity] || intensityMap.medium;

    const particles: Particle[] = Array.from({ length: config.particles }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    const hubs: Particle[] = Array.from({ length: config.hubs }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 3,
      pulse: 0,
      pulseSpeed: 0,
      isHub: true,
    }));

    const allParticles = [...particles, ...hubs];
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const gba = (c: { r: number; g: number; b: number }, a: number = 1) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

    let time = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const orbs = [
        { x: canvas.width * 0.25, y: canvas.height * 0.3, r: 250, color: COLORS.primary },
        { x: canvas.width * 0.75, y: canvas.height * 0.6, r: 220, color: COLORS.secondary },
        { x: canvas.width * 0.5, y: canvas.height * 0.45, r: 200, color: COLORS.accent },
      ];

      orbs.forEach((orb, i) => {
        const offsetX = Math.sin(time + i * 2) * 50;
        const offsetY = Math.cos(time + i * 2) * 40;
        const grad = ctx.createRadialGradient(
          orb.x + offsetX, orb.y + offsetY, 0,
          orb.x + offsetX, orb.y + offsetY, orb.r
        );
        grad.addColorStop(0, gba(orb.color, 0.45));
        grad.addColorStop(0.5, gba(orb.color, 0.15));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      allParticles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 150) {
          const force = p.isHub ? 0.02 : 0.04;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (!p.isHub) {
          p.pulse += p.pulseSpeed;
        }
      });

      const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);

      for (let i = 0; i < allParticles.length; i++) {
        for (let j = i + 1; j < allParticles.length; j++) {
          const d = dist(allParticles[i], allParticles[j]);
          const maxDist = allParticles[i].isHub || allParticles[j].isHub ? 180 : 130;
          
          if (d < maxDist) {
            const a = 1 - d / maxDist;
            const isHubConnection = allParticles[i].isHub || allParticles[j].isHub;
            const color = isHubConnection ? COLORS.secondary : COLORS.primary;
            const baseAlpha = theme === 'dark' ? 0.15 : 0.1;
            
            ctx.beginPath();
            ctx.strokeStyle = gba(color, baseAlpha * a);
            ctx.lineWidth = isHubConnection ? 1.2 : 0.7;
            ctx.moveTo(allParticles[i].x, allParticles[i].y);
            ctx.lineTo(allParticles[j].x, allParticles[j].y);
            ctx.stroke();

            if (isHubConnection && Math.random() < 0.03) {
              const flowPos = (time * 0.3) % 1;
              const fx = allParticles[i].x + (allParticles[j].x - allParticles[i].x) * flowPos;
              const fy = allParticles[i].y + (allParticles[j].y - allParticles[i].y) * flowPos;
              
              ctx.beginPath();
              ctx.arc(fx, fy, 2, 0, Math.PI * 2);
              ctx.fillStyle = gba(COLORS.secondary, 0.6);
              ctx.shadowBlur = 8;
              ctx.shadowColor = gba(COLORS.secondary, 1);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      allParticles.forEach((p) => {
        if (p.isHub) {
          const pulseScale = 1 + Math.sin(time * 2) * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = gba(COLORS.secondary, 0.8);
          ctx.shadowBlur = 12;
          ctx.shadowColor = gba(COLORS.secondary, 0.8);
          ctx.fill();
          ctx.shadowBlur = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
          grad.addColorStop(0, gba(COLORS.secondary, 0.4)); 
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          const pulseScale = 1 + Math.sin(p.pulse) * 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = gba(COLORS.primary, p.pulse * 0.4 + 0.3);
          ctx.shadowBlur = 6;
          ctx.shadowColor = gba(COLORS.primary, 0.8);
          ctx.fill();
          ctx.shadowBlur = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, gba(COLORS.primary, 0.3));
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [theme, intensity]);

  return <canvas ref={canvasRef} className="ai-background" />;
};

export default AIBackground;
