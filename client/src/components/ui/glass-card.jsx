import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const GlassCard = React.forwardRef(({ className, children, animationProps, glow = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-2xl border text-card-foreground shadow-sm backdrop-blur-md overflow-hidden relative transition-all duration-300",
        glow ? "hover:box-glow border-primary/20 hover:border-primary/40" : "border-border/60 dark:border-white/10",
        "dark:bg-card/40 bg-white/70",
        className
      )}
      {...animationProps}
      {...props}
    >
      {/* Subtle background gradient noise or glow effect inside card */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-40" />
      )}
      <div className="relative z-10 p-5 md:p-8 h-full flex flex-col">
          {children}
      </div>
    </motion.div>
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
