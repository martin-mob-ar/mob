"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, ShieldCheck, Calendar, FileText, PenTool } from "lucide-react";
import Image from "next/image";

const BLUE = "210 90% 55%";

const tags = [
  { icon: UserCheck, label: "Interesados calificados", top: "6%", left: "10%", right: "auto", delay: 0, centerX: false },
  { icon: ShieldCheck, label: "Garantía aprobada", top: "14%", left: "auto", right: "10%", delay: 0.1, centerX: false },
  { icon: Calendar, label: "Coordinación de visitas", top: "46%", left: "2%", right: "auto", delay: 0.2, centerX: false },
  { icon: FileText, label: "Contratos digitales", top: "62%", left: "auto", right: "6%", delay: 0.3, centerX: false },
  { icon: PenTool, label: "Firma electrónica", top: "86%", left: "50%", right: "auto", delay: 0.4, centerX: true },
];

const expoOut = [0.16, 1, 0.3, 1] as const;

const HeroFloatingCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const updateLine = useCallback((index: number) => {
    const container = containerRef.current;
    const card = cardRef.current;
    const tag = tagRefs.current[index];
    if (!container || !card || !tag) return;

    const cRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const tagRect = tag.getBoundingClientRect();

    setLineCoords({
      x1: tagRect.left + tagRect.width / 2 - cRect.left,
      y1: tagRect.top + tagRect.height / 2 - cRect.top,
      x2: cardRect.left + cardRect.width / 2 - cRect.left,
      y2: cardRect.top + cardRect.height / 2 - cRect.top,
    });
  }, []);

  const handleTagHover = useCallback((index: number) => {
    setHoveredIndex(index);
    updateLine(index);
  }, [updateLine]);

  const handleTagLeave = useCallback(() => {
    setHoveredIndex(null);
    setLineCoords(null);
  }, []);

  const handleTagClick = useCallback(() => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 400);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[480px] lg:min-h-[520px] flex items-center justify-center"
    >
      {/* Connector line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
        <AnimatePresence>
          {lineCoords && (
            <motion.line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
      </svg>

      {/* Property Card */}
      <motion.div
        ref={cardRef}
        className="relative z-0 w-[300px] rounded-2xl shadow-lg border border-border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--card) / 0.8)",
          backdropFilter: "blur(12px)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: pulsing ? [1, 1.03, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.5, ease: expoOut },
          scale: pulsing
            ? { duration: 0.35, ease: "easeOut" }
            : { duration: 0.5, ease: expoOut },
        }}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          <Image
            src="/assets/property-new-4.png"
            alt="Av Libertador al 3500"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-lg text-foreground">Av Libertador al 3500</h3>
          <p className="text-muted-foreground text-sm mt-0.5">Palermo</p>
          <p className="text-muted-foreground text-sm mt-2">2 dorm · 1 baño · 45 m²</p>
        </div>
      </motion.div>

      {/* Tags */}
      {tags.map((tag, i) => (
        <FloatingTag
          key={tag.label}
          ref={(el) => { tagRefs.current[i] = el; }}
          tag={tag}
          isHovered={hoveredIndex === i}
          onHover={() => handleTagHover(i)}
          onLeave={handleTagLeave}
          onClick={handleTagClick}
        />
      ))}
    </div>
  );
};

interface FloatingTagProps {
  tag: (typeof tags)[0];
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const FloatingTag = React.forwardRef<HTMLDivElement, FloatingTagProps>(
  ({ tag, isHovered, onHover, onLeave, onClick }, ref) => {
    const Icon = tag.icon;

    return (
      <motion.div
        ref={ref}
        className="absolute z-10"
        style={{
          top: tag.top,
          left: tag.centerX ? "50%" : tag.left !== "auto" ? tag.left : undefined,
          right: !tag.centerX && tag.right !== "auto" ? tag.right : undefined,
          x: tag.centerX ? "-50%" : 0,
        }}
        initial={{ opacity: 0, y: 18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.45,
          delay: 0.4 + tag.delay,
          ease: expoOut,
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        <motion.div
          className="flex items-center gap-2.5 rounded-full border px-4 py-2.5 cursor-pointer select-none whitespace-nowrap"
          style={{
            backgroundColor: isHovered
              ? `hsl(${BLUE} / 0.1)`
              : "hsl(var(--card) / 0.8)",
            backdropFilter: "blur(12px)",
            borderColor: isHovered
              ? `hsl(${BLUE} / 0.5)`
              : `hsl(${BLUE} / 0.25)`,
            boxShadow: isHovered
              ? `0 8px 24px -6px hsl(${BLUE} / 0.25), 0 0 0 1px hsl(${BLUE} / 0.2)`
              : `0 2px 8px -2px hsl(0 0% 0% / 0.06)`,
          }}
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: isHovered
                ? `hsl(${BLUE} / 0.2)`
                : `hsl(${BLUE} / 0.12)`,
            }}
          >
            <Icon
              className="h-3.5 w-3.5"
              style={{
                color: isHovered ? `hsl(${BLUE})` : `hsl(${BLUE} / 0.7)`,
              }}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">{tag.label}</span>
        </motion.div>
      </motion.div>
    );
  }
);

FloatingTag.displayName = "FloatingTag";

export default HeroFloatingCards;
