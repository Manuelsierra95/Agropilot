"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react"

interface SeamlessVideoProps {
  src: string
  className?: string
  fadeSeconds?: number
  visible?: boolean
  maxOpacity?: number
  appearDuration?: number
  bottomFade?: boolean
  bottomFadeClassName?: string
}

export function SeamlessVideo({
  src,
  className,
  fadeSeconds = 1,
  visible = true,
  maxOpacity = 1,
  appearDuration = 800,
  bottomFade = false,
  bottomFadeClassName = "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-background to-transparent",
}: SeamlessVideoProps) {
  const ref1 = useRef<HTMLVideoElement>(null)
  const ref2 = useRef<HTMLVideoElement>(null)

  const [ready, setReady] = useState(false)
  const [front, setFront] = useState(0)
  const [fadingTo, setFadingTo] = useState<number | null>(null)

  const frontRef = useRef(front)
  const fadingToRef = useRef<number | null>(fadingTo)
  const fadeSecondsRef = useRef(fadeSeconds)

  useEffect(() => {
    frontRef.current = front
  }, [front])

  useEffect(() => {
    fadingToRef.current = fadingTo
  }, [fadingTo])

  useEffect(() => {
    fadeSecondsRef.current = fadeSeconds
  }, [fadeSeconds])

  const mp4Src = useMemo(() => src.replace(/\.webm$/i, ".mp4"), [src])

  const handleLoadStart = useCallback(() => {
    setFront(0)
    setFadingTo(null)
    frontRef.current = 0
    fadingToRef.current = null
  }, [])

  const handleCanPlay = useCallback(() => {
    setReady(true)
  }, [])

  // Asegura que el vídeo aparezca cuando el navegador ya lo tiene cacheado o
  // los eventos dispararon antes de que React enganchara los listeners.
  useLayoutEffect(() => {
    const video = ref1.current
    if (!video) return

    const markReady = () => setReady(true)

    if (video.readyState >= 3) {
      markReady()
      return
    }

    video.addEventListener("canplay", markReady, { once: true })
    video.addEventListener("loadeddata", markReady, { once: true })
    const fallback = setTimeout(markReady, 3000)

    return () => {
      video.removeEventListener("canplay", markReady)
      video.removeEventListener("loadeddata", markReady)
      clearTimeout(fallback)
    }
  }, [src])

  // Inicia el crossfade justo antes de que termine el vídeo activo.
  useEffect(() => {
    const v1 = ref1.current
    const v2 = ref2.current
    if (!v1 || !v2) return

    const handleTimeUpdate = (event: Event) => {
      const target = event.target as HTMLVideoElement
      const index = target === v1 ? 0 : target === v2 ? 1 : -1
      if (
        index === -1 ||
        frontRef.current !== index ||
        fadingToRef.current !== null
      )
        return

      const duration = target.duration
      if (!Number.isFinite(duration)) return

      const remaining = duration - target.currentTime
      if (remaining > 0 && remaining <= fadeSecondsRef.current) {
        const next = 1 - index
        const nextVideo = next === 0 ? v1 : v2
        nextVideo.currentTime = 0
        nextVideo.play().catch(() => {
          // Ignora errores de autoplay bloqueado por el navegador.
        })
        fadingToRef.current = next
        setFadingTo(next)
      }
    }

    v1.addEventListener("timeupdate", handleTimeUpdate)
    v2.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      v1.removeEventListener("timeupdate", handleTimeUpdate)
      v2.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [src])

  // Pausa todo cuando no es visible y reanuda el activo al volver.
  useEffect(() => {
    const v1 = ref1.current
    const v2 = ref2.current
    if (!v1 || !v2) return

    const videos = [v1, v2]

    if (visible) {
      const active = frontRef.current === 0 ? v1 : v2
      active.play().catch(() => {})
    } else {
      videos.forEach((video) => video.pause())
    }
  }, [visible])

  const handleTransitionEnd = useCallback(() => {
    if (fadingToRef.current === null) return

    const previousFront = frontRef.current
    const nextFront = fadingToRef.current
    const previousVideo = previousFront === 0 ? ref1.current : ref2.current

    previousVideo?.pause()
    frontRef.current = nextFront
    fadingToRef.current = null
    setFront(nextFront)
    setFadingTo(null)
  }, [])

  const sharedVideoProps: VideoHTMLAttributes<HTMLVideoElement> = {
    muted: true,
    playsInline: true,
    preload: "auto",
    disablePictureInPicture: true,
    disableRemotePlayback: true,
    "aria-hidden": true,
    className:
      "absolute inset-0 h-full w-full object-cover transition-opacity ease-out",
    onLoadStart: handleLoadStart,
    onCanPlay: handleCanPlay,
    onLoadedData: handleCanPlay,
    onTransitionEnd: handleTransitionEnd,
  }

  const showVideo = ready && visible

  return (
    <div
      className={className}
      style={{
        opacity: showVideo ? maxOpacity : 0,
        transition: `opacity ${appearDuration}ms ease-out`,
      }}
    >
      <div className="relative h-full w-full">
        <video
          ref={ref1}
          {...sharedVideoProps}
          autoPlay
          style={{
            opacity: (fadingTo === null ? front === 0 : fadingTo === 0) ? 1 : 0,
            transitionDuration: `${fadeSeconds}s`,
          }}
        >
          <source src={src} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
        <video
          ref={ref2}
          {...sharedVideoProps}
          style={{
            opacity: (fadingTo === null ? front === 1 : fadingTo === 1) ? 1 : 0,
            transitionDuration: `${fadeSeconds}s`,
          }}
        >
          <source src={src} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
        {bottomFade && (
          <div aria-hidden="true" className={bottomFadeClassName} />
        )}
      </div>
    </div>
  )
}
