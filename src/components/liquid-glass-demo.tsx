import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LiquidGlassCard, LiquidGlassCardContent, LiquidGlassCardDescription, LiquidGlassCardHeader, LiquidGlassCardTitle } from '@/components/ui/liquid-glass-card'
import { Button } from '@/components/ui/button'
import LiquidGlass from 'liquid-glass-react'

export function LiquidGlassDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Liquid Glass Effect Demo</h1>
          <p className="text-white/80">Interactive accent panels with liquid glass effects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard Card for comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Regular card without liquid glass effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a standard card component for comparison.</p>
            </CardContent>
          </Card>

          {/* Card with liquid glass prop */}
          <Card 
            liquidGlass={true}
            glassProps={{
              displacementScale: 40,
              blurAmount: 0.08,
              saturation: 130,
              aberrationIntensity: 2,
              elasticity: 0.3
            }}
          >
            <CardHeader>
              <CardTitle>Enhanced Card</CardTitle>
              <CardDescription>Card with liquid glass effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the liquidGlass prop to enable the effect.</p>
            </CardContent>
          </Card>

          {/* Dedicated LiquidGlassCard component */}
          <LiquidGlassCard
            displacementScale={50}
            blurAmount={0.1}
            saturation={140}
            aberrationIntensity={2.5}
            elasticity={0.35}
          >
            <LiquidGlassCardHeader>
              <LiquidGlassCardTitle>Glass Card</LiquidGlassCardTitle>
              <LiquidGlassCardDescription>Dedicated liquid glass card component</LiquidGlassCardDescription>
            </LiquidGlassCardHeader>
            <LiquidGlassCardContent>
              <p>This uses the dedicated LiquidGlassCard component.</p>
            </LiquidGlassCardContent>
          </LiquidGlassCard>

          {/* Button with liquid glass */}
          <div className="flex items-center justify-center">
            <LiquidGlass
              displacementScale={60}
              blurAmount={0.12}
              saturation={150}
              aberrationIntensity={3}
              elasticity={0.4}
              cornerRadius={8}
              padding="12px 24px"
            >
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Glass Button
              </Button>
            </LiquidGlass>
          </div>

          {/* Accent panel */}
          <LiquidGlassCard
            className="bg-gradient-to-br from-pink-500/20 to-violet-500/20"
            displacementScale={45}
            blurAmount={0.06}
            saturation={125}
            aberrationIntensity={1.8}
            elasticity={0.28}
          >
            <LiquidGlassCardHeader>
              <LiquidGlassCardTitle className="text-pink-200">Accent Panel</LiquidGlassCardTitle>
              <LiquidGlassCardDescription className="text-pink-100/80">
                Colorful accent panel with glass effect
              </LiquidGlassCardDescription>
            </LiquidGlassCardHeader>
            <LiquidGlassCardContent>
              <div className="space-y-2">
                <div className="h-2 bg-pink-300/40 rounded"></div>
                <div className="h-2 bg-violet-300/40 rounded w-3/4"></div>
                <div className="h-2 bg-pink-300/40 rounded w-1/2"></div>
              </div>
            </LiquidGlassCardContent>
          </LiquidGlassCard>

          {/* Statistics panel */}
          <LiquidGlassCard
            className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
            displacementScale={35}
            blurAmount={0.04}
            saturation={115}
            aberrationIntensity={1.2}
            elasticity={0.22}
          >
            <LiquidGlassCardHeader>
              <LiquidGlassCardTitle className="text-emerald-200">Statistics</LiquidGlassCardTitle>
              <LiquidGlassCardDescription className="text-emerald-100/80">
                Data visualization panel
              </LiquidGlassCardDescription>
            </LiquidGlassCardHeader>
            <LiquidGlassCardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-200">42</div>
                  <div className="text-sm text-emerald-100/70">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-200">89%</div>
                  <div className="text-sm text-teal-100/70">Success Rate</div>
                </div>
              </div>
            </LiquidGlassCardContent>
          </LiquidGlassCard>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">
            Move your mouse over the cards to see the liquid glass effect in action
          </p>
        </div>
      </div>
    </div>
  )
}