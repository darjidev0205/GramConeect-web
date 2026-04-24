import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const GlassCard = React.forwardRef(({ className, children, animationProps, glow = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-card/50 text-card-foreground shadow-sm backdrop-blur-md overflow-hidden relative",
        glow ? "hover:box-glow transition-all duration-300 border-primary/20 hover:border-primary/50" : "border-white/10 dark:border-white/5",
        "dark:bg-black/40 bg-white/60",
        className
      )}
      {...animationProps}
      {...props}
    >
      {/* Subtle background gradient noise or glow effect inside card */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50" />
      )}
      <div className="relative z-10 p-6 h-full flex flex-col">
          {children}
      </div>
    </motion.div>
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
