'use client'

import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="absolute left-0 right-0 bottom-0 top-[80px] -z-10 overflow-hidden bg-white">
      <div className="absolute inset-0 h-full w-full bg-white">
        <svg
          className="absolute h-full w-full text-neutral-200"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 40V.5H40" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white"></div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-white rounded-full blur-[100px] pointer-events-none"
      />
    </div>
  )
}
