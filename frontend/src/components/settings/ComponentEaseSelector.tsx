import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { PathEditor } from "gsap/utils/PathEditor"

gsap.registerPlugin(CustomEase, PathEditor)

const INITIAL_EASE_STRING = "M0,0,C0.126,0.382,0.282,0.674,0.44,0.822,0.632,1.002,0.818,1.001,1,1"
const INITIAL_GRID_PATH = "M0,500 C63,309 153,248.5 232,174.5 328,84.5 408.5,43 500,43.5"

const GSAPReplicaVisualizer = () => {
  const [duration, setDuration] = useState(2.5)
  const [easeString, setEaseString] = useState(INITIAL_EASE_STRING)
  const [isInvalid, setIsInvalid] = useState(false)
  const [stats, setStats] = useState({ progress: "0.00", value: "0" })

  const mainPathRef = useRef<SVGPathElement>(null)
  const revealPathRef = useRef<SVGPathElement>(null)
  const jointRef = useRef<HTMLDivElement>(null)
  const horizontalFillRef = useRef<HTMLDivElement>(null)
  const previewTween = useRef<gsap.core.Tween | null>(null)
  const editor = useRef<any>(null)

  const updateEase = (newPath: string) => {
    let errorFound = false
    const onError = () => {
      errorFound = true
    }

    try {
      const normalized = editor.current.getNormalizedSVG(500, 500, true, onError)

      setIsInvalid(errorFound)
      setEaseString(normalized)

      if (!errorFound) {
        const ease = CustomEase.create("custom", normalized)
        if (previewTween.current) {
          previewTween.current.vars.ease = ease
          previewTween.current.invalidate().restart()
        }
      }
    } catch (e) {
      setIsInvalid(true)
    }
  }

  useEffect(() => {
    if (!mainPathRef.current) return

    previewTween.current = gsap.to(jointRef.current, {
      duration: duration,
      repeat: -1,
      y: -500,
      ease: CustomEase.create("custom", INITIAL_EASE_STRING),
      onUpdate: function () {
        const p = this.progress()
        const v = gsap.getProperty(jointRef.current, "y") as number
        setStats({ progress: p.toFixed(2), value: Math.round(Math.abs(v)).toString() })
        if (horizontalFillRef.current) {
          gsap.set(horizontalFillRef.current, { scaleX: p, transformOrigin: "left" })
        }
      },
    })

    editor.current = PathEditor.create(mainPathRef.current, {
      handleSize: 10,
      selected: true,
      draggable: false,

      minX: 0,
      maxX: 500,
      minY: -200,
      maxY: 700,
      onUpdate: (path: string) => {
        gsap.set(revealPathRef.current, { attr: { d: path } })
        updateEase(path)
      },
      onPress: () => previewTween.current?.pause(),
      onRelease: () => previewTween.current?.resume(),
    })

    return () => {
      editor.current?.kill()
      previewTween.current?.kill()
    }
  }, [duration])

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-10 bg-[#0e100f] min-h-screen text-[#bbbaa6] font-mono select-none">
      <div className="flex-1 relative aspect-square bg-black border border-[#42433d] p-12 overflow-visible">
        <div className="absolute inset-0 pointer-events-none text-[10px] uppercase tracking-widest text-[#7c7c6f]">
          <div className="absolute left-2 top-1/2 -rotate-90 origin-bottom-left whitespace-nowrap">
            value: <span className="text-[#0ae448]">{stats.value}</span>
          </div>
          <div className="absolute bottom-2 left-0 w-full text-center">
            progress: <span className="text-[#0ae448]">{stats.progress}</span>
          </div>
        </div>

        <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 500 500">
          <g className="opacity-10" stroke="#bbbaa6">
            {[...Array(11)].map((_, i) => (
              <React.Fragment key={i}>
                <line x1={i * 50} x2={i * 50} y1="0" y2="500" />
                <line x1="0" x2="500" y1={i * 50} y2={i * 50} />
              </React.Fragment>
            ))}
          </g>

          <path
            ref={mainPathRef}
            d={INITIAL_GRID_PATH}
            fill="none"
            stroke="transparent"
            strokeWidth="20"
            className="cursor-crosshair"
          />

          <path
            ref={revealPathRef}
            d={INITIAL_GRID_PATH}
            fill="none"
            stroke={isInvalid ? "#f10c00" : "#0ae448"}
            strokeWidth="3"
            className="pointer-events-none transition-colors duration-200"
          />
        </svg>

        <div className="absolute top-12 bottom-12 right-11.5 w-0.5 bg-[#222]">
          <div
            ref={jointRef}
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0ae448] rounded-full shadow-[0_0_15px_#0ae448] z-20"
            style={{ top: "100%", transform: "translate(-50%, -50%)" }}
          />
        </div>

        <div className="absolute bottom-11.5 left-12 right-12 h-0.5 bg-[#222]">
          <div
            ref={horizontalFillRef}
            className="h-full w-full bg-[#0ae448] scale-x-0 origin-left"
          />
        </div>
      </div>

      <div className="w-full lg:w-112.5 space-y-4">
        <div className="p-6 bg-black border border-[#42433d] rounded-lg text-[13px] text-white">
          {isInvalid && (
            <div className="text-[#f10c00] text-[10px] uppercase mb-2">
              Invalid Ease: Path must always move forward (X)
            </div>
          )}
          <p className="break-all leading-relaxed">
            <span className="text-[#0ae448]">CustomEase</span>.create(
            <span className="text-[#9d95ff]">"custom"</span>,{" "}
            <span className="text-[#fec5fb]">"</span>
            <span className={`transition-colors ${isInvalid ? "text-red-500" : "text-[#fec5fb]"}`}>
              {easeString}
            </span>
            <span className="text-[#fec5fb]">"</span>);
          </p>
        </div>
      </div>
    </div>
  )
}

export default GSAPReplicaVisualizer
