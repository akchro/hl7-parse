import * as React from 'react'
import { cn } from '@/lib/utils'

interface CSSGlassCardProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
}

function CSSGlassCard({ className, children, ...props }: CSSGlassCardProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    setMousePosition({ x: 50, y: 50 })
  }, [])

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl transition-all duration-500 ease-out',
        'bg-gradient-to-br from-white/10 to-white/5',
        'backdrop-blur-md border border-white/20',
        'hover:shadow-xl hover:shadow-black/10',
        'before:absolute before:inset-0 before:rounded-xl',
        'before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent',
        'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--mouse-x': `${mousePosition.x}%`,
        '--mouse-y': `${mousePosition.y}%`,
      } as React.CSSProperties}
      {...props}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 rounded-xl opacity-30 transition-all duration-300 ease-out pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          transform: `translate3d(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px, 0)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border highlight */}
      <div 
        className="absolute inset-0 rounded-xl border border-white/40 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          maskImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, black 0%, transparent 50%)`,
        }}
      />
    </div>
  )
}

export { CSSGlassCard }