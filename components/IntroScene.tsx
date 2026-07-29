"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { matchboxes, matches, type MatchCategory, type MatchItem } from "@/data/resume";

type MatchPhase =
  | "idle"
  | "holding"
  | "striking"
  | "burning"
  | "extinguished";

type Point = { x: number; y: number };

const BURN_DURATION = 4300;
const ASSET_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function makeAudioController() {
  let context: AudioContext | null = null;

  const getContext = () => {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  };

  const tone = (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.04,
  ) => {
    const audio = getContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  };

  const noise = (duration: number, volume = 0.035) => {
    const audio = getContext();
    const sampleCount = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, sampleCount, audio.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 2800;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(audio.destination);
    source.start();
  };

  return {
    pickup: () => tone(180, 0.12, "triangle", 0.025),
    strike: () => noise(0.1, 0.025),
    ignite: () => {
      noise(0.24, 0.07);
      tone(110, 0.35, "sawtooth", 0.035);
    },
    extinguish: () => noise(0.38, 0.02),
  };
}

function Flame({ fading = false }: { fading?: boolean }) {
  return (
    <span className={`flame-cluster ${fading ? "is-fading" : ""}`} aria-hidden="true">
      <span className="flame-glow" />
      <span className="flame flame-outer" />
      <span className="flame flame-inner" />
      <span className="spark spark-a" />
      <span className="spark spark-b" />
      <span className="spark spark-c" />
      <span className="spark spark-d" />
    </span>
  );
}

function MatchStick({
  label,
  burning,
  burned,
  large = false,
}: {
  label?: string;
  burning?: boolean;
  burned?: boolean;
  large?: boolean;
}) {
  return (
    <span
      className={`match-stick ${large ? "is-large" : ""} ${burning ? "is-burning" : ""} ${
        burned ? "is-burned" : ""
      }`}
      aria-hidden="true"
    >
      <span className="match-head" />
      <span className="match-label">{label}</span>
      {burning ? <Flame /> : null}
      {burned ? <span className="smoke-puff" /> : null}
    </span>
  );
}

function ExperienceCard({
  item,
  onClose,
}: {
  item: MatchItem;
  onClose: () => void;
}) {
  return (
    <article className="reveal-card" style={{ "--card-accent": item.accent } as CSSProperties}>
      <button className="icon-button reveal-close" onClick={onClose} aria-label="关闭经历卡">
        ×
      </button>
      <div className="reveal-kicker">{item.subtitle}</div>
      <h2>{item.title}</h2>
      <p className="reveal-summary">{item.summary}</p>
      <div className="reveal-proof">
        {item.problem ? (
          <p>
            <span>问题</span>
            {item.problem}
          </p>
        ) : null}
        <p>
          <span>行动</span>
          {item.action}
        </p>
        <p>
          <span>结果</span>
          {item.result}
        </p>
      </div>
      <div className="reveal-metric">
        <strong>{item.metric}</strong>
        <span>{item.metricLabel}</span>
      </div>
      <a href={`#project-${item.id}`} className="text-link">
        查看完整证据 <span aria-hidden="true">↓</span>
      </a>
    </article>
  );
}

export function IntroScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const strikeZoneRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);
  const audioRef = useRef<ReturnType<typeof makeAudioController> | null>(null);
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });
  const strikeTravelRef = useRef(0);
  const [activeBox, setActiveBox] = useState<MatchCategory>("experience");
  const [phase, setPhase] = useState<MatchPhase>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [light, setLight] = useState<Point>({ x: 330, y: 300 });
  const [ambientLight, setAmbientLight] = useState<Point>({ x: 760, y: 350 });
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sparkPulse, setSparkPulse] = useState(false);

  const selected = useMemo(
    () => matches.find((item) => item.id === selectedId) ?? null,
    [selectedId],
  );
  const activeCard = useMemo(
    () => matches.find((item) => item.id === activeCardId) ?? null,
    [activeCardId],
  );
  const unlockedItems = useMemo(
    () => matches.filter((item) => unlocked.includes(item.id)),
    [unlocked],
  );
  const finalReveal = unlocked.length >= 4;

  const play = useCallback(
    (name: "pickup" | "strike" | "ignite" | "extinguish") => {
      if (!soundEnabled) return;
      audioRef.current ??= makeAudioController();
      audioRef.current[name]();
    },
    [soundEnabled],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const ignite = useCallback(() => {
    if (!selectedId || phase === "burning") return;
    setPhase("burning");
    setSparkPulse(true);
    play("ignite");
    setUnlocked((current) =>
      current.includes(selectedId) ? current : [...current, selectedId],
    );
    setActiveCardId(selectedId);

    timersRef.current.push(
      window.setTimeout(() => setSparkPulse(false), 650),
      window.setTimeout(() => {
        setPhase("extinguished");
        play("extinguish");
      }, BURN_DURATION),
      window.setTimeout(() => {
        setPhase("idle");
        setSelectedId(null);
      }, BURN_DURATION + 900),
    );
  }, [phase, play, selectedId]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!selectedId || (phase !== "holding" && phase !== "striking" && phase !== "burning")) {
        return;
      }

      setPosition({ x: event.clientX, y: event.clientY });
      const sceneRect = sceneRef.current?.getBoundingClientRect();
      if (sceneRect) {
        setAmbientLight({
          x: Math.max(0, Math.min(sceneRect.width, event.clientX - sceneRect.left)),
          y: Math.max(0, Math.min(sceneRect.height, event.clientY - sceneRect.top)),
        });
      }
      const characterRect = characterRef.current?.getBoundingClientRect();
      if (characterRect) {
        setLight({
          x: Math.max(0, Math.min(characterRect.width, event.clientX - characterRect.left)),
          y: Math.max(0, Math.min(characterRect.height, event.clientY - characterRect.top)),
        });
      }

      if (phase === "burning") return;
      const now = performance.now();
      const previous = lastMoveRef.current;
      const deltaX = event.clientX - previous.x;
      const deltaTime = Math.max(1, now - previous.time);
      const speed = Math.abs(deltaX) / deltaTime;
      const zone = strikeZoneRef.current?.getBoundingClientRect();
      const isInsideZone =
        zone &&
        event.clientX >= zone.left &&
        event.clientX <= zone.right &&
        event.clientY >= zone.top - 18 &&
        event.clientY <= zone.bottom + 18;

      if (isInsideZone && Math.abs(deltaX) > 3) {
        strikeTravelRef.current += Math.abs(deltaX);
        setPhase("striking");
        if (Math.abs(deltaX) > 10) {
          play("strike");
          setSparkPulse(true);
          window.setTimeout(() => setSparkPulse(false), 180);
        }
        if (strikeTravelRef.current > 52 && speed > 0.26) ignite();
      } else if (event.pointerType === "touch" && speed > 0.62 && Math.abs(deltaX) > 28) {
        ignite();
      }
      lastMoveRef.current = { x: event.clientX, y: event.clientY, time: now };
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [ignite, phase, play, selectedId]);

  const beginHold = (item: MatchItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase === "burning") return;
    clearTimers();
    event.preventDefault();
    setSelectedId(item.id);
    setActiveCardId(null);
    setPhase("holding");
    const point = { x: event.clientX, y: event.clientY };
    setPosition(point);
    lastMoveRef.current = { ...point, time: performance.now() };
    strikeTravelRef.current = 0;
    play("pickup");
  };

  const selectByKeyboard = (item: MatchItem) => {
    if (phase === "burning") return;
    clearTimers();
    const scene = sceneRef.current?.getBoundingClientRect();
    const point = {
      x: scene ? scene.left + scene.width * 0.38 : 320,
      y: scene ? scene.top + scene.height * 0.72 : 540,
    };
    setSelectedId(item.id);
    setPhase("holding");
    setPosition(point);
    setAmbientLight({
      x: scene ? scene.width * 0.38 : 320,
      y: scene ? scene.height * 0.72 : 540,
    });
    play("pickup");
  };

  const reset = () => {
    clearTimers();
    setUnlocked([]);
    setSelectedId(null);
    setActiveCardId(null);
    setPhase("idle");
    setActiveBox("experience");
  };

  const lightStyle = {
    "--scene-light-x": `${ambientLight.x}px`,
    "--scene-light-y": `${ambientLight.y}px`,
    "--ambient-strength": finalReveal ? "1" : String(Math.min(0.54, unlocked.length * 0.12)),
  } as CSSProperties;
  const characterLightStyle = {
    "--light-x": `${light.x}px`,
    "--light-y": `${light.y}px`,
  } as CSSProperties;

  return (
    <section
      className={`intro-scene phase-${phase} ${finalReveal ? "is-final" : ""}`}
      ref={sceneRef}
      style={lightStyle}
      aria-label="点燃火柴探索杨泽存的个人经历"
    >
      <div className="scene-grain" aria-hidden="true" />
      <div className="scene-ambient" aria-hidden="true" />

      <header className="scene-nav">
        <a href="#top" className="scene-brand" aria-label="请点燃我，返回顶部">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            请点燃我
            <small>STRIKE A MATCH</small>
          </span>
        </a>
        <div className="scene-actions">
          <button
            className="icon-button"
            onClick={() => setSoundEnabled((current) => !current)}
            aria-label={soundEnabled ? "关闭声音" : "打开声音"}
            title={soundEnabled ? "关闭声音" : "打开声音"}
          >
            {soundEnabled ? "◖" : "×"}
          </button>
          {unlocked.length > 0 ? (
            <button className="quiet-button reset-button" onClick={reset}>
              重新体验
            </button>
          ) : null}
          <a className="quiet-button" href="#portfolio">
            跳过动画
          </a>
        </div>
      </header>

      <div className="scene-copy">
        <div className="scene-eyebrow">YANG ZECUN · AGENT PRODUCT MANAGER</div>
        <h1>
          点燃一根火柴，
          <br />
          认识一个 <span>Agent PM</span>
        </h1>
        <p>
          拿起、划燃、移动火光。
          <br />
          用一分钟，看见我做过什么，以及我为什么不同。
        </p>
        <div className="scene-status" aria-live="polite">
          <span className={`status-dot status-${phase}`} />
          {phase === "idle" && "选择下方任意一根火柴"}
          {phase === "holding" && "把火柴拖过发亮的磷面"}
          {phase === "striking" && "再快一点"}
          {phase === "burning" && "移动火柴，让光靠近人物"}
          {phase === "extinguished" && "火焰熄灭了，但经历留了下来"}
        </div>
      </div>

      <div
        className="character-stage"
        ref={characterRef}
        style={characterLightStyle}
        aria-hidden="true"
      >
        <div className="character-halo" />
        <div className="puppet-rig">
          <img
            className="character-image character-dark"
            src={`${ASSET_BASE_PATH}/character-intro3d.png`}
            alt=""
          />
          <img
            className="character-image character-lit"
            src={`${ASSET_BASE_PATH}/character-intro3d.png`}
            alt=""
          />
        </div>
        <div className="character-shadow" />
        <div className="eye-glint eye-glint-left" />
        <div className="eye-glint eye-glint-right" />
        <div className="sticker-field">
          {unlockedItems.map((item, index) => (
            <button
              key={item.id}
              className={`character-sticker sticker-${index % 6}`}
              style={{ "--sticker-color": item.accent } as CSSProperties}
              onClick={() => setActiveCardId(item.id)}
              aria-label={`重新查看 ${item.title}`}
            >
              {item.sticker}
            </button>
          ))}
        </div>
      </div>

      {finalReveal ? (
        <div className="final-reveal-banner">
          <span>点亮进度 {unlocked.length}/12</span>
          <strong>兼具技术理解与产品思维的 Agent 产品经理</strong>
          <p>理解 Agent，构建 Agent，也让它变得可评测、可治理、可持续迭代。</p>
          <a href="#portfolio">查看完整经历 ↓</a>
        </div>
      ) : null}

      <div className="matchbox-deck" aria-label="四盒经历火柴">
        {matchboxes.map((box) => {
          const isActive = activeBox === box.id;
          const boxMatches = matches.filter((item) => item.category === box.id);
          return (
            <article
              className={`matchbox-card ${isActive ? "is-active" : ""}`}
              key={box.id}
              style={{ "--box-accent": box.accent } as CSSProperties}
            >
              <button
                className="matchbox-cover"
                onClick={() => setActiveBox(box.id)}
                aria-expanded={isActive}
              >
                <span className="box-index">{box.index}</span>
                <span className="box-flame-mark" aria-hidden="true" />
                <span className="box-english">{box.english}</span>
                <strong>{box.title}</strong>
                <small>{box.note}</small>
              </button>
              <div className="matchbox-drawer" aria-hidden={!isActive}>
                <div className="drawer-matches">
                  {boxMatches.map((item) => (
                    <button
                      className={`drawer-match ${unlocked.includes(item.id) ? "is-used" : ""}`}
                      key={item.id}
                      disabled={!isActive || phase === "burning"}
                      onPointerDown={(event) => beginHold(item, event)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectByKeyboard(item);
                        }
                      }}
                      aria-label={`拿起 ${item.title} 火柴`}
                    >
                      <MatchStick
                        label={item.shortTitle}
                        burned={unlocked.includes(item.id)}
                      />
                    </button>
                  ))}
                </div>
                <button
                  className={`strike-strip ${sparkPulse ? "is-sparking" : ""}`}
                  ref={isActive ? strikeZoneRef : undefined}
                  disabled={!isActive || !selectedId || phase === "burning"}
                  onClick={ignite}
                  aria-label="沿磷面划动火柴，键盘用户可按回车点燃"
                >
                  <span>STRIKE</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="progress-rail" aria-label={`已点亮 ${unlocked.length} 根火柴，共 12 根`}>
        <span>LIGHTS</span>
        <div>
          {matches.map((item) => (
            <button
              key={item.id}
              className={unlocked.includes(item.id) ? "is-unlocked" : ""}
              style={{ "--progress-color": item.accent } as CSSProperties}
              onClick={() => unlocked.includes(item.id) && setActiveCardId(item.id)}
              disabled={!unlocked.includes(item.id)}
              aria-label={
                unlocked.includes(item.id) ? `重新查看 ${item.title}` : `${item.title} 尚未点亮`
              }
            />
          ))}
        </div>
        <strong>{String(unlocked.length).padStart(2, "0")}/12</strong>
      </div>

      {selected && phase !== "idle" ? (
        <div
          className={`held-match held-${phase}`}
          style={{ left: position.x, top: position.y } as CSSProperties}
          aria-hidden="true"
        >
          <MatchStick
            label={selected.shortTitle}
            burning={phase === "burning"}
            burned={phase === "extinguished"}
            large
          />
        </div>
      ) : null}

      {activeCard ? (
        <div className="reveal-card-wrap">
          <ExperienceCard item={activeCard} onClose={() => setActiveCardId(null)} />
        </div>
      ) : null}

      <div className="scroll-cue" aria-hidden="true">
        <span />
        完整作品集
      </div>
    </section>
  );
}
