import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.hostname === "youtu.be") id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.replace("/shorts/", "");
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.replace("/embed/", "");
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
};

// ─── Responsive sizes hook ────────────────────────────────────────────────────

const useReelSizes = () => {
  const [sizes, setSizes] = useState({ card: { w: 180, h: 320 }, hero: { w: 202, h: 360 } });

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      // نحسب نسبة 9:16 (1080x1920) — hero يبقى ~11% من عرض الشاشة كحد أدنى
      if (vw < 380) {
        setSizes({ card: { w: 90, h: 160 }, hero: { w: 108, h: 192 } });
      } else if (vw < 480) {
        setSizes({ card: { w: 108, h: 192 }, hero: { w: 135, h: 240 } });
      } else if (vw < 640) {
        setSizes({ card: { w: 126, h: 224 }, hero: { w: 157, h: 280 } });
      } else if (vw < 768) {
        setSizes({ card: { w: 144, h: 256 }, hero: { w: 180, h: 320 } });
      } else if (vw < 1024) {
        setSizes({ card: { w: 162, h: 288 }, hero: { w: 202, h: 360 } });
      } else if (vw < 1280) {
        setSizes({ card: { w: 180, h: 320 }, hero: { w: 225, h: 400 } });
      } else {
        setSizes({ card: { w: 202, h: 360 }, hero: { w: 252, h: 448 } });
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return sizes;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_STYLES = `
  @keyframes reel-spin { to { transform: rotate(360deg); } }

  .reel-card {
    transition: transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.4s ease, filter 0.4s ease;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    border-radius: clamp(12px, 2vw, 18px);
    overflow: hidden;
  }
  .reel-card:focus-visible { outline: 2px solid #F7E328; outline-offset: 3px; }

  .reel-card img {
    width: 100%; height: 100%; object-fit: cover;
    display: block; user-select: none; -webkit-user-drag: none;
  }

  .reel-overlay {
    position: absolute; inset: 0;
    border-radius: inherit;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 70%);
  }

  .reel-title {
    position: absolute; bottom: 0; right: 0; left: 0;
    padding: clamp(10px, 2vw, 16px) clamp(8px, 1.5vw, 14px) clamp(12px, 2vw, 18px);
    color: #fff; font-weight: 700;
    line-height: 1.35; text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
  }

  .reel-placeholder {
    width: 100%; height: 100%; display: flex;
    align-items: center; justify-content: center;
    background: #1a1a1a; font-size: 2rem; color: rgba(255,255,255,0.15);
  }

  .reel-play-badge {
    position: absolute; top: clamp(8px, 1.5vw, 12px); left: clamp(8px, 1.5vw, 12px);
    width: clamp(26px, 3.5vw, 34px); height: clamp(26px, 3.5vw, 34px);
    border-radius: 50%;
    background: rgba(0,0,0,0.55); border: 1.5px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px); transition: background 0.15s;
  }
  .reel-card:hover .reel-play-badge { background: rgba(247,227,40,0.85); border-color: #F7E328; }
  .reel-card:hover .reel-play-badge svg { fill: #161616; }

  .reel-nav-btn {
    width: clamp(32px, 4.5vw, 42px);
    height: clamp(32px, 4.5vw, 42px);
    border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s, transform 0.1s; flex-shrink: 0;
    background: rgba(255,255,255,0.08); color: #FCF2ED;
  }
  .reel-nav-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }
  .reel-nav-btn:disabled { opacity: 0.25; cursor: default; transform: none; }

  .reel-dot {
    width: clamp(5px, 1vw, 6px);
    height: clamp(5px, 1vw, 6px);
    border-radius: 50%; flex-shrink: 0;
    transition: background 0.2s, transform 0.2s; cursor: pointer; border: none;
    padding: 0;
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const PlayIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ReelCard = ({ reel, diff, onClick, onKeyDown, sizes }) => {
  const isHero = diff === 0;
  const isNear = Math.abs(diff) === 1;

  const thumb = reel.thumbnail || getYoutubeThumbnail(reel.youtubeUrl);
  const w = isHero ? sizes.hero.w : sizes.card.w;
  const h = isHero ? sizes.hero.h : sizes.card.h;

  // نسبة العرض/الارتفاع دايمًا 9:16
  const style = {
    width: w,
    height: h,   // 9:16 ratio
    transform: `scale(${isHero ? 1 : isNear ? 0.88 : 0.76})`,
    opacity: isHero ? 1 : isNear ? 0.75 : 0.45,
    filter: isHero ? "none" : `brightness(${isNear ? 0.7 : 0.5})`,
    zIndex: isHero ? 10 : isNear ? 5 : 2,
    boxShadow: isHero ? "0 24px 60px rgba(0,0,0,0.55)" : "none",
    border: isHero ? "2px solid rgba(247,227,40,0.35)" : "none",
  };

  const iconSize = isHero
    ? Math.max(12, Math.round(sizes.hero.w * 0.065))
    : Math.max(10, Math.round(sizes.card.w * 0.06));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={reel.title}
      className="reel-card"
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={style}
    >
      {thumb ? (
        <img src={thumb} alt={reel.title} draggable={false} />
      ) : (
        <div className="reel-placeholder">▶</div>
      )}

      <div className="reel-overlay" />

      <div className="reel-play-badge">
        <PlayIcon size={iconSize} />
      </div>

      {(isHero || isNear) && (
        <div
          className="reel-title"
          style={{
            fontSize: isHero
              ? `clamp(0.75rem, ${sizes.hero.w * 0.045}px, 1rem)`
              : `clamp(0.65rem, ${sizes.card.w * 0.042}px, 0.8rem)`,
            WebkitLineClamp: isHero ? 3 : 2,
          }}
        >
          {reel.title}
        </div>
      )}

      {isHero && (
        <div
          style={{
            position: "absolute", inset: -3,
            borderRadius: "calc(clamp(12px, 2vw, 18px) + 3px)",
            border: "2px solid rgba(247,227,40,0.5)",
            pointerEvents: "none",
            boxShadow: "0 0 32px rgba(247,227,40,0.18)",
          }}
        />
      )}
    </div>
  );
};

const NavButtons = ({ active, total, dir, onPrev, onNext, labels }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button className="reel-nav-btn" onClick={onPrev} disabled={active === 0} aria-label={labels.previous}>
      <i className={`fa-solid fa-chevron-${dir === "rtl" ? "right" : "left"}`} style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)" }} />
    </button>
    <button className="reel-nav-btn" onClick={onNext} disabled={active === total - 1} aria-label={labels.next}>
      <i className={`fa-solid fa-chevron-${dir === "rtl" ? "left" : "right"}`} style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)" }} />
    </button>
  </div>
);

const DotIndicators = ({ count, active, onSelect, label }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: "clamp(4px, 1vw, 6px)", marginTop: "clamp(14px, 2.5vw, 20px)", flexWrap: "wrap" }}>
    {Array.from({ length: count }, (_, idx) => (
      <button
        key={idx}
        className="reel-dot"
        onClick={() => onSelect(idx)}
        aria-label={`${label} ${idx + 1}`}
        style={{
          background: idx === active ? "#F7E328" : "rgba(255,255,255,0.2)",
          transform: idx === active ? "scale(1.4)" : "scale(1)",
        }}
      />
    ))}
  </div>
);

const Spinner = () => (
  <section style={{ padding: "40px 0", textAlign: "center" }}>
    <div style={{
      width: 28, height: 28, margin: "0 auto",
      border: "2px solid rgba(247,227,40,0.2)",
      borderTopColor: "#F7E328",
      borderRadius: "50%",
      animation: "reel-spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes reel-spin { to { transform: rotate(360deg); } }`}</style>
  </section>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ReelsSection = () => {
  const { lang, t, dir } = useLanguage();
  const navigate = useNavigate();
  const sizes = useReelSizes();

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);

  useEffect(() => {
    setLoading(true);
    api
      .getReels(lang)
      .then((res) => {
        const data = res.reels || [];
        setReels(data);
        setActive(Math.floor(data.length / 2));
      })
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, [lang]);

  const prev = useCallback(() => setActive((a) => Math.max(0, a - 1)), []);
  const next = useCallback(() => setActive((a) => Math.min(reels.length - 1, a + 1)), [reels.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const handleDragStart = (e) => {
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    setDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!dragging) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const diff = dragStartX.current - endX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setDragging(false);
  };

  // الـ gap متجاوب
  const gap = Math.max(8, Math.round(sizes.card.w * 0.075));

  if (loading) return <Spinner />;
  if (!reels.length) return null;

  return (
    <section
      dir={dir}
      style={{
        padding: "clamp(24px, 4vw, 40px) 0 clamp(28px, 5vw, 48px)",
        fontFamily: "Lyon, serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{CARD_STYLES}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "clamp(16px, 3vw, 28px)", padding: "0 4px",
      }}>
        <div>
          <h2 style={{
            color: "#FCF2ED", fontWeight: 800,
            fontSize: "clamp(1.1rem, 3vw, 1.75rem)",
            margin: 0, fontFamily: "Lyon, serif",
          }}>
            {t.reels.title}
          </h2>
          <div style={{ height: 3, width: 48, background: "#F7E328", borderRadius: 2, marginTop: 6 }} />
        </div>

        <NavButtons
          active={active}
          total={reels.length}
          dir={dir}
          onPrev={prev}
          onNext={next}
          labels={{ previous: t.reels.previous, next: t.reels.next }}
        />
      </div>

      {/* Track */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap,
          padding: "clamp(12px, 2vw, 20px) 0 clamp(16px, 2.5vw, 24px)",
          userSelect: "none",
          touchAction: "pan-y",
          // نخلي الـ overflow مخفي علشان الكروت اللي برا ما تظهرش
          overflow: "hidden",
          width: "100%",
        }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {reels.map((reel, idx) => {
          const diff = idx - active;
          if (Math.abs(diff) > 3) return null;

          return (
            <ReelCard
              key={reel._id}
              reel={reel}
              diff={diff}
              sizes={sizes}
              onClick={() => (diff === 0 ? navigate(`/reel/${reel._id}`) : setActive(idx))}
              onKeyDown={(e) => e.key === "Enter" && (diff === 0 ? navigate(`/reel/${reel._id}`) : setActive(idx))}
            />
          );
        })}
      </div>

      {/* Dots */}
      <DotIndicators
        count={reels.length}
        active={active}
        onSelect={setActive}
        label={t.reels.shortClip}
      />
    </section>
  );
};

export default ReelsSection;