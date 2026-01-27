"use client"

import { useRouter } from "next/navigation"
import { type HSKLevel, hskLevelInfo } from "@/lib/hanzi-data"

export default function Home() {
  const router = useRouter()

  const handleLevelSelect = (level: HSKLevel) => {
    router.push(`/game/${level}`)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-primary">H</span>
            <span className="text-yellow">a</span>
            <span className="text-accent">n</span>
            <span className="text-foreground">ziType</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Learning Mandarin made <span className="text-accent font-medium">Fun & Exciting!</span>
          </p>
        </div>

        {/* HSK Level Selection */}
        <div className="space-y-4">
          <h2 className="text-center text-foreground text-sm uppercase tracking-wider">
            Select HSK Level
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([1, 2, 3, 4] as HSKLevel[]).map((level) => {
              const info = hskLevelInfo[level]
              return (
                <button
                  key={level}
                  onClick={() => handleLevelSelect(level)}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold text-foreground group-hover:text-primary">
                      {info.name}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {info.wordCount}+ words
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2 pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Type the displayed hanzi using your Chinese IME
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Press Space or Enter to submit each character
          </p>
        </div>
      </div>
    </main>
  )
}
