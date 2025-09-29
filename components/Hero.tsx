"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.7 } },
}

export function Hero() {
  return (
    <motion.section
      className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-4 pb-24 pt-32 text-center lg:px-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className="space-y-10" variants={itemVariants}>
        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur"
          variants={itemVariants}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          Crafted for engineering teams shipping with AI
        </motion.span>
        <motion.h1
          className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-tight"
          variants={itemVariants}
        >
          DevContext — AI Coding Guidelines &amp; Context Generator
        </motion.h1>
        <motion.p
          className="mx-auto max-w-3xl text-base text-muted-foreground md:text-xl"
          variants={itemVariants}
        >
          Generate AI config files like Copilot instructions, Cursor rules, and prompts — consistent, fast, and IDE-ready. Bring product context, architecture, and workflow nuance into every coding session.
        </motion.p>
        <motion.div
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          variants={itemVariants}
        >
          <Button asChild size="lg" className="text-base">
            <Link href="/new">
              New Project
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/existing">
              Existing Project
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
