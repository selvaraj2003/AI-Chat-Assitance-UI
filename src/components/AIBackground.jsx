import { useEffect, useRef } from "react";

/**
 * AIBackground - AI-themed neural network with particles and connections
 * Enhanced with beautiful colors, glows, and premium styling
 */
export default function AIBackground({ theme = 'dark', intensity = 'medium', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Enhanced color palette
    const COLORS = theme === 'dark' 
      ? {
          primary: { r: 0, g: 229, b: 255 },      // Cyan
          secondary: { r: 124, g: 58, b: 237 },   // Violet
          accent: { r: 168, g: 85, b: 247 },      // Purple
          glow: { r: 192, g: 132, b: 252 },       // Light purple
          shimmer: { r: 233, g: 213, b: 255 },    // Pearl
        }
      : {
          primary: { r: 99, g: 102, b: 241 },     // Indigo
          secondary: { r: 236, g: 72, b: 153 },   // Pink
          accent: { r: 168, g: 85, b: 247 },      // Purple
          glow: { r: 192, g: 132, b: 252 },       // Light purple
          shimmer: { r: 233, g: 213, b: 255 },    // Pearl
        };

    // Intensity-based settings
    const intensityMap = {
      low: { particles: 50, hubs: 3 },
      medium: { particles: 80, hubs: 5 },
      high: { particles: 110, hubs: 7 },
    };
    const config = intensityMap[intensity] || intensityMap.medium;

    // Neural network particles
    const particles = Array.from({ length: config.particles }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Hub nodes
    const hubs = Array.from({ length: config.hubs }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 3,
      isHub: true,
    }));

    const allParticles = [...particles, ...hubs];

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    let time = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // ═══════════════════════════════════
      // 1. ENHANCED FLOATING GRADIENT ORBS
      // ═══════════════════════════════════
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
        grad.addColorStop(0, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},${theme === 'dark' ? 0.08 : 0.05})`);
        grad.addColorStop(0.5, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},${theme === 'dark' ? 0.03 : 0.02})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // ═══════════════════════════════════
      // 2. NEURAL NETWORK PARTICLES
      // ═══════════════════════════════════
      
      // Move particles
      allParticles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.hypot(dx, dy);
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
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (!p.isHub) {
          p.pulse += p.pulseSpeed;
        }
      });

      // Draw connections
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
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${a * baseAlpha})`;
            ctx.lineWidth = isHubConnection ? 1.2 : 0.7;
            ctx.moveTo(allParticles[i].x, allParticles[i].y);
            ctx.lineTo(allParticles[j].x, allParticles[j].y);
            ctx.stroke();

            // Enhanced data flow particles
            if (isHubConnection && Math.random() < 0.03) {
              const flowPos = (time * 0.3) % 1;
              const fx = allParticles[i].x + (allParticles[j].x - allParticles[i].x) * flowPos;
              const fy = allParticles[i].y + (allParticles[j].y - allParticles[i].y) * flowPos;
              
              ctx.beginPath();
              ctx.arc(fx, fy, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${a * 0.8})`;
              ctx.shadowBlur = 8;
              ctx.shadowColor = `rgba(${color.r},${color.g},${color.b},1)`;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw particles
      allParticles.forEach((p) => {
        if (p.isHub) {
          const pulseScale = 1 + Math.sin(time * 2) * 0.15;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLORS.secondary.r},${COLORS.secondary.g},${COLORS.secondary.b},0.8)`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${COLORS.glow.r},${COLORS.glow.g},${COLORS.glow.b},0.8)`;
          ctx.fill();
          ctx.shadowBlur = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
          grad.addColorStop(0, `rgba(${COLORS.secondary.r},${COLORS.secondary.g},${COLORS.secondary.b},${theme === 'dark' ? 0.3 : 0.2})`);
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          const pulseScale = 1 + Math.sin(p.pulse) * 0.2;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLORS.primary.r},${COLORS.primary.g},${COLORS.primary.b},${theme === 'dark' ? 0.6 : 0.7})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${COLORS.primary.r},${COLORS.primary.g},${COLORS.primary.b},0.8)`;
          ctx.fill();
          ctx.shadowBlur = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, `rgba(${COLORS.primary.r},${COLORS.primary.g},${COLORS.primary.b},${theme === 'dark' ? 0.12 : 0.1})`);
          grad.addColorStop(1, "transparent");
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [theme, intensity]);

  return <canvas ref={canvasRef} className={`ai-background ${className}`} />;
}