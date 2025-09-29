"use client"

import { motion } from "framer-motion"

const particles = [
  { left: "8%", top: "18%", size: "h-1.5 w-1.5", delay: 0 },
  { left: "20%", top: "70%", size: "h-2 w-2", delay: 0.6 },
  { left: "32%", top: "40%", size: "h-1 w-1", delay: 0.3 },
  { left: "48%", top: "14%", size: "h-2 w-2", delay: 0.9 },
  { left: "60%", top: "78%", size: "h-1.5 w-1.5", delay: 0.2 },
  { left: "76%", top: "32%", size: "h-1 w-1", delay: 0.75 },
  { left: "88%", top: "58%", size: "h-2 w-2", delay: 0.4 },
  { left: "15%", top: "88%", size: "h-1.5 w-1.5", delay: 1.1 },
  { left: "68%", top: "12%", size: "h-1.5 w-1.5", delay: 1.3 },
  { left: "84%", top: "24%", size: "h-1 w-1", delay: 1.6 },
]

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"
        animate={{ opacity: [0.5, 0.85, 0.65], rotate: [0, 2, -1, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[-20%] left-[10%] h-[46rem] w-[46rem] rounded-full bg-primary/30 blur-3xl"
        initial={{ x: "0%", y: "0%", scale: 1 }}
        animate={{ scale: [1, 1.1, 1], x: ["0%", "-6%", "0%"], y: ["0%", "-4%", "0%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-25%] left-[15%] h-[32rem] w-[32rem] rounded-full bg-secondary/25 blur-3xl"
        animate={{ scale: [1.05, 0.95, 1.05], rotate: [5, -3, 5] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[-10%] top-1/4 h-[40rem] w-[40rem] rounded-full bg-accent/20 blur-3xl"
        animate={{ scale: [0.9, 1.05, 0.95], rotate: [-4, 4, -4] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {particles.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}-${index}`}
          className={`absolute rounded-full bg-primary/60 blur-[2px] ${particle.size} dark:bg-primary/40`}
          style={{ left: particle.left, top: particle.top }}
          animate={{ opacity: [0.2, 0.7, 0.2], y: ["0%", "-15%", "0%"] }}
          transition={{ duration: 9 + index * 0.6, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
    </div>
  )
}
