"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  children: ReactNode
  isOpen: boolean
  snapPoint: "closed" | "half" | "full"
  onSnapPointChange: (point: "closed" | "half" | "full") => void
  onClose: () => void
  className?: string
}

// Custom spring animation hook
function useSpringAnimation(targetValue: number, config = { tension: 300, friction: 30 }) {
  const [currentValue, setCurrentValue] = useState(targetValue)
  const animationRef = useRef<number>()
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp

      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      const displacement = targetValue - currentValue
      const springForce = displacement * config.tension
      const dampingForce = velocityRef.current * config.friction
      const acceleration = springForce - dampingForce

      velocityRef.current += acceleration * deltaTime
      const newValue = currentValue + velocityRef.current * deltaTime

      setCurrentValue(newValue)

      // Continue animation if not settled
      if (Math.abs(displacement) > 0.1 || Math.abs(velocityRef.current) > 0.1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentValue(targetValue)
        velocityRef.current = 0
      }
    },
    [currentValue, targetValue, config.tension, config.friction],
  )

  useEffect(() => {
    lastTimeRef.current = 0
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return currentValue
}

export default function BottomSheet({
  children,
  isOpen,
  snapPoint,
  onSnapPointChange,
  onClose,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartTranslate, setDragStartTranslate] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)

  // Define snap point positions (as percentages of viewport height)
  const snapPoints = {
    closed: 100, // Fully hidden
    half: 50, // Half visible
    full: 10, // Almost fully visible (leaving some space at top)
  }

  // Get target position based on snap point
  const getTargetPosition = useCallback(() => {
    if (!isOpen) return snapPoints.closed
    return snapPoints[snapPoint]
  }, [isOpen, snapPoint])

  // Use spring animation for smooth transitions
  const animatedPosition = useSpringAnimation(isDragging ? currentTranslate : getTargetPosition(), {
    tension: 300,
    friction: 30,
  })

  // Handle drag start
  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true)
      setDragStartY(clientY)
      setDragStartTranslate(getTargetPosition())
    },
    [getTargetPosition],
  )

  // Handle drag move
  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return

      const deltaY = clientY - dragStartY
      const deltaPercent = (deltaY / window.innerHeight) * 100
      const newTranslate = Math.max(snapPoints.full, Math.min(snapPoints.closed, dragStartTranslate + deltaPercent))

      setCurrentTranslate(newTranslate)
    },
    [isDragging, dragStartY, dragStartTranslate],
  )

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)

    // Determine closest snap point
    const distances = Object.entries(snapPoints).map(([key, value]) => ({
      point: key as keyof typeof snapPoints,
      distance: Math.abs(currentTranslate - value),
    }))

    const closest = distances.reduce((prev, curr) => (curr.distance < prev.distance ? curr : prev))

    onSnapPointChange(closest.point)
  }, [isDragging, currentTranslate, onSnapPointChange])

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientY)
    },
    [handleDragStart],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientY)
    },
    [handleDragMove],
  )

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY)
    },
    [handleDragStart],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleDragMove(e.touches[0].clientY)
    },
    [handleDragMove],
  )

  const handleTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen && snapPoint === "full") {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, snapPoint])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300",
            snapPoint === "full" ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl",
          "transform transition-none will-change-transform",
          className,
        )}
        style={{
          transform: `translateY(${animatedPosition}%)`,
          height: "90vh",
          maxHeight: "90vh",
        }}
      >
        {/* Handle */}
        <div
          ref={handleRef}
          className="flex justify-center py-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full pb-20">{children}</div>
      </div>
    </>
  )
}
