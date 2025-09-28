import * as React from 'react'
import LiquidGlass from 'liquid-glass-react'
import { cn } from '@/lib/utils'

interface LiquidGlassCardProps extends React.ComponentProps<'div'> {
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  elasticity?: number
  cornerRadius?: number
  padding?: string
  children: React.ReactNode
}

function LiquidGlassCard({
  className,
  displacementScale = 32,
  blurAmount = 0.05,
  saturation = 120,
  aberrationIntensity = 1.5,
  elasticity = 0.25,
  cornerRadius = 12,
  padding = '0px',
  children,
  ...props
}: LiquidGlassCardProps) {
  return (
    <LiquidGlass
      displacementScale={displacementScale}
      blurAmount={blurAmount}
      saturation={saturation}
      aberrationIntensity={aberrationIntensity}
      elasticity={elasticity}
      cornerRadius={cornerRadius}
      padding={padding}
      {...props}
    >
      <div
        data-slot='liquid-glass-card'
        className={cn(
          'bg-card/80 text-card-foreground backdrop-blur-sm flex flex-col gap-6 rounded-xl border border-white/20 py-6 shadow-lg',
          className
        )}
      >
        {children}
      </div>
    </LiquidGlass>
  )
}

function LiquidGlassCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  )
}

function LiquidGlassCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-title'
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function LiquidGlassCardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function LiquidGlassCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  )
}

function LiquidGlassCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-content'
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function LiquidGlassCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='liquid-glass-card-footer'
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  LiquidGlassCard,
  LiquidGlassCardHeader,
  LiquidGlassCardFooter,
  LiquidGlassCardTitle,
  LiquidGlassCardAction,
  LiquidGlassCardDescription,
  LiquidGlassCardContent,
}