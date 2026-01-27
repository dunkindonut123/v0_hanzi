"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { generateWordSet, hskLevelInfo, type HanziWord, type HSKLevel } from "@/lib/hanzi-data"
import { RotateCcw, Home } from "lucide-react"
import Link from "next/link"

type WordStatus = "pending" | "current" | "correct" | "incorrect"

interface WordState {
  word: HanziWord
  status: WordStatus
  userInput: string
}

const GAME_DURATION = 60 // 1 minute in seconds

interface TypingGameProps {
  level: HSKLevel
}

export function TypingGame({ level }: TypingGameProps) {
  const [words, setWords] = useState<WordState[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState("")
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [stats, setStats] = useState({
    correctWords: 0,
    incorrectWords: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const initializeGame = useCallback(() => {
    const newWords = generateWordSet(level, 100).map((word, index) => ({
      word,
      status: index === 0 ? "current" : "pending" as WordStatus,
      userInput: "",
    }))
    setWords(newWords)
    setCurrentIndex(0)
    setInput("")
    setGameState("idle")
    setTimeLeft(GAME_DURATION)
    setStats({
      correctWords: 0,
      incorrectWords: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
    })
  }, [level])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("finished")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState, timeLeft])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (gameState === "idle") {
      setGameState("playing")
    }

    if (gameState === "finished") return

    setInput(value)
    setStats((prev) => ({
      ...prev,
      totalKeystrokes: prev.totalKeystrokes + 1,
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      
      if (gameState === "finished" || !input.trim()) return

      const currentWord = words[currentIndex]
      const isCorrect = input.trim() === currentWord.word.hanzi

      setWords((prev) => {
        const newWords = [...prev]
        newWords[currentIndex] = {
          ...newWords[currentIndex],
          status: isCorrect ? "correct" : "incorrect",
          userInput: input.trim(),
        }
        if (currentIndex + 1 < newWords.length) {
          newWords[currentIndex + 1] = {
            ...newWords[currentIndex + 1],
            status: "current",
          }
        }
        return newWords
      })

      setStats((prev) => ({
        ...prev,
        correctWords: isCorrect ? prev.correctWords + 1 : prev.correctWords,
        incorrectWords: isCorrect ? prev.incorrectWords : prev.incorrectWords + 1,
        correctKeystrokes: isCorrect
          ? prev.correctKeystrokes + input.trim().length
          : prev.correctKeystrokes,
      }))

      setCurrentIndex((prev) => prev + 1)
      setInput("")
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const calculateWPM = () => {
    const timeElapsed = (GAME_DURATION - timeLeft) / 60 // Convert to minutes
    if (timeElapsed === 0) return 0
    return Math.round(stats.correctWords / timeElapsed)
  }

  const calculateAccuracy = () => {
    const totalAttempted = stats.correctWords + stats.incorrectWords
    if (totalAttempted === 0) return 100
    return Math.round((stats.correctWords / totalAttempted) * 100)
  }

  const calculateScore = () => {
    const wpm = calculateWPM()
    const accuracy = calculateAccuracy()
    return Math.round(wpm * (accuracy / 100))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <h2 className="text-3xl font-bold text-foreground">Results</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1 p-4 bg-card rounded-xl border border-border">
              <div className="text-5xl font-bold text-primary">{calculateWPM()}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">WPM</div>
            </div>
            <div className="space-y-1 p-4 bg-card rounded-xl border border-border">
              <div className="text-5xl font-bold text-primary">{calculateAccuracy()}%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Accuracy</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between text-foreground">
              <span>HSK Level</span>
              <span className="text-primary">{hskLevelInfo[level].name}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Correct Words</span>
              <span className="text-correct">{stats.correctWords}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Incorrect Words</span>
              <span className="text-incorrect">{stats.incorrectWords}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Total Characters</span>
              <span>{stats.totalKeystrokes}</span>
            </div>
            <div className="flex justify-between text-foreground font-semibold pt-2 border-t border-border">
              <span>Final Score</span>
              <span className="text-primary">{calculateScore()}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <button
              onClick={initializeGame}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 cursor-text"
      onClick={handleContainerClick}
      ref={containerRef}
    >
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>{hskLevelInfo[level].name}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="text-4xl font-bold text-primary tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Words Display */}
        <div className="relative overflow-hidden" style={{ height: "180px" }}>
          <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center text-2xl leading-relaxed font-sans">
            {words.slice(0, 35).map((wordState, index) => (
              <span
                key={index}
                className={`text-3xl transition-colors ${
                  wordState.status === "current"
                    ? "text-current"
                    : wordState.status === "correct"
                    ? "text-correct"
                    : wordState.status === "incorrect"
                    ? "text-incorrect"
                    : "text-foreground"
                }`}
              >
                {wordState.word.hanzi}
              </span>
            ))}
          </div>
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Instructions */}
        {gameState === "idle" && (
          <p className="text-center text-muted-foreground text-sm animate-pulse">
            Start typing to begin...
          </p>
        )}

        {/* Live Stats */}
        {gameState === "playing" && (
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span>WPM: <span className="text-primary">{calculateWPM()}</span></span>
            <span>Accuracy: <span className="text-primary">{calculateAccuracy()}%</span></span>
          </div>
        )}

        {/* Restart Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              initializeGame()
            }}
            className="text-muted-foreground hover:text-primary transition-colors p-2"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
