import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../engine/soundEffects';
import { RotateCw, Zap } from 'lucide-react';

export default function WheelSpinner({
  teams,
  onSpinComplete,
  isSpinning,
  setIsSpinning
}) {
  const canvasRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isTurbo, setIsTurbo] = useState(false);
  const animationRef = useRef(null);
  const lastTickSliceRef = useRef(-1);

  const numSlices = teams.length;
  const arcSize = (2 * Math.PI) / numSlices;

  // Render high-precision minimalist wheel
  const drawWheel = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 16;

    ctx.clearRect(0, 0, width, height);

    // Outer rim track
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#27272a';
    ctx.stroke();
    ctx.restore();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const sliceAngle = angle + i * arcSize;
      const team = teams[i];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sliceAngle, sliceAngle + arcSize);
      ctx.closePath();

      // Team color with balanced tone
      ctx.fillStyle = team.themeColor || '#27272a';
      ctx.fill();

      // Subtle shadow gradient overlay
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0,0,0,0.0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Clean divider line
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#09090b';
      ctx.stroke();

      // Slice label text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sliceAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = team.textColor || '#ffffff';
      ctx.font = 'bold 11px "Chakra Petch", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;

      const label = `${team.shortName} '${team.year.slice(2)}`;
      ctx.fillText(label, radius - 14, 4);
      ctx.restore();

      ctx.restore();
    }

    // Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#09090b';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3f3f46';
    ctx.stroke();

    ctx.fillStyle = '#fafafa';
    ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('16-0', cx, cy);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotationAngle);
  }, [rotationAngle, teams]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sound.init();

    const winningIndex = Math.floor(Math.random() * numSlices);
    const selectedTeam = teams[winningIndex];

    const pointerAngle = 1.5 * Math.PI; // Top (270 deg)
    const targetSliceCenter = winningIndex * arcSize + arcSize / 2;

    const fullSpins = isTurbo ? 3 : 5 + Math.floor(Math.random() * 3);
    const targetOffset = (pointerAngle - targetSliceCenter + 2 * Math.PI) % (2 * Math.PI);
    const totalRotation = fullSpins * 2 * Math.PI + targetOffset;

    const startAngle = rotationAngle % (2 * Math.PI);
    const duration = isTurbo ? 1000 : 3500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth Quartic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + totalRotation * easeOut;

      const currentSlice = Math.floor(((pointerAngle - (currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / arcSize);
      if (currentSlice !== lastTickSliceRef.current) {
        sound.playTick();
        lastTickSliceRef.current = currentSlice;
      }

      setRotationAngle(currentAngle);
      drawWheel(currentAngle);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        sound.playBoundaryHorn();
        onSpinComplete(selectedTeam);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full">
      {/* Canvas Wheel with Minimal Pointer */}
      <div className="relative">
        {/* Needle */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div
            className="w-5 h-6 bg-zinc-100 border border-zinc-950 shadow-md"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        </div>

        {/* Wheel Canvas */}
        <div className="rounded-full p-2 bg-zinc-950 border border-zinc-800 shadow-sm">
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] max-w-full"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-4 flex flex-col items-center gap-2.5 w-full max-w-xs">
        {/* Main Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`w-full py-3.5 rounded-xl font-sports text-base font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 active:scale-98 shadow-sm cursor-pointer'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin text-zinc-500' : 'text-zinc-950'}`} />
          <span>{isSpinning ? 'Drafting...' : 'Spin The Wheel'}</span>
        </button>

        {/* Turbo Mode */}
        <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span>Fast Spin (1s)</span>
          </div>

          <button
            onClick={() => setIsTurbo(!isTurbo)}
            disabled={isSpinning}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              isTurbo ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                isTurbo ? 'translate-x-4 bg-white' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 text-center">
          {numSlices} teams in pool • 1 Pick per spin
        </p>
      </div>
    </div>
  );
}
