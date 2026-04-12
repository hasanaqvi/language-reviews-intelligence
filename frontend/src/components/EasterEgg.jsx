import { useEffect, useRef } from "react"

// Timing:
//   First ever visit  → 10 s  (no localStorage marker set)
//   Every repeat run  → 30–45 s random  (marker is set after first run)
const FIRST_DELAY_MS  = 10_000
const REPEAT_MIN_MS   = 30_000
const REPEAT_MAX_MS   = 45_000
const CHASE_DURATION  = "3.5s"
const LS_KEY          = "easter-egg-seen"

export default function EasterEgg() {
  const stageRef  = useRef(null)
  const owlRef    = useRef(null)
  const babbelRef = useRef(null)
  const timerRef  = useRef(null)

  useEffect(() => {
    const stage  = stageRef.current
    const owl    = owlRef.current
    const babbel = babbelRef.current
    if (!stage || !owl || !babbel) return

    function runChase() {
      stage.classList.add("eg-running")
      owl.classList.add("eg-bob")
      babbel.classList.add("eg-bob")

      function onEnd(e) {
        if (e.target !== stage) return
        stage.removeEventListener("animationend", onEnd)
        stage.classList.remove("eg-running")
        owl.classList.remove("eg-bob")
        babbel.classList.remove("eg-bob")

        // Mark as seen so subsequent runs use the longer delay
        localStorage.setItem(LS_KEY, "1")
        scheduleNext()
      }

      stage.addEventListener("animationend", onEnd)
    }

    function scheduleNext() {
      const seen  = localStorage.getItem(LS_KEY)
      const delay = seen
        ? REPEAT_MIN_MS + Math.random() * (REPEAT_MAX_MS - REPEAT_MIN_MS)
        : FIRST_DELAY_MS
      timerRef.current = setTimeout(runChase, delay)
    }

    scheduleNext()
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <>
      <style>{`
        .eg-stage {
          position: fixed;
          bottom: 14px;
          left: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          pointer-events: none;
          transform: translateX(-150px);
          will-change: transform;
        }
        .eg-stage img {
          display: block;
          height: auto;
        }
        .eg-owl    { width: 40px; }
        .eg-babbel { width: 45px; }

        @keyframes eg-chase {
          from { transform: translateX(-150px); }
          to   { transform: translateX(110vw);  }
        }
        @keyframes eg-bob {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-4px); }
        }

        .eg-stage.eg-running {
          animation: eg-chase ${CHASE_DURATION} linear forwards;
        }
        .eg-bob {
          animation: eg-bob 280ms ease-in-out infinite;
        }
        /* Offset babbel bob phase slightly so they don't sync */
        .eg-babbel.eg-bob {
          animation-delay: 70ms;
        }
      `}</style>

      <div ref={stageRef} className="eg-stage" aria-hidden="true">
        {/* Babbel on the left — the chaser */}
        <img ref={babbelRef} className="eg-babbel" src="/babbel-logo.png" alt="" />
        {/* Owl on the right — being chased, visually in front */}
        <img ref={owlRef}    className="eg-owl"    src="/duo-owl.png"     alt="" />
      </div>
    </>
  )
}
