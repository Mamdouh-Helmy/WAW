import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

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

const useReelSizes = () => {
  const [sizes, setSizes] = useState({ card: { w: 180, h: 320 }, hero: { w: 202, h: 360 } });
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      if (vw < 380)       setSizes({ card: { w: 90,  h: 160 }, hero: { w: 108, h: 192 } });
      else if (vw < 480)  setSizes({ card: { w: 108, h: 192 }, hero: { w: 135, h: 240 } });
      else if (vw < 640)  setSizes({ card: { w: 126, h: 224 }, hero: { w: 157, h: 280 } });
      else if (vw < 768)  setSizes({ card: { w: 144, h: 256 }, hero: { w: 180, h: 320 } });
      else if (vw < 1024) setSizes({ card: { w: 162, h: 288 }, hero: { w: 202, h: 360 } });
      else if (vw < 1280) setSizes({ card: { w: 180, h: 320 }, hero: { w: 225, h: 400 } });
      else                setSizes({ card: { w: 202, h: 360 }, hero: { w: 252, h: 448 } });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return sizes;
};

const STYLES = `
  @keyframes reel-spin { to { transform: rotate(360deg); } }
  @keyframes reel-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(204,244,127,0.2); }
    50%       { box-shadow: 0 0 40px rgba(204,244,127,0.45); }
  }

  .reel-track {
    display: flex;
    align-items: center;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 4px;
  }
  .reel-track::-webkit-scrollbar { display: none; }

  .reel-snap-item {
    scroll-snap-align: center;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reel-card {
    transition: transform 0.45s cubic-bezier(.4,0,.2,1),
                opacity   0.45s ease,
                filter    0.45s ease;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    border-radius: 16px;
    overflow: hidden;
  }
  .reel-card:focus-visible { outline: 2px solid #CCF47F; outline-offset: 3px; }

  .reel-card img {
    width: 100%; height: 100%; object-fit: cover;
    display: block; user-select: none; -webkit-user-drag: none;
  }

  .reel-overlay {
    position: absolute; inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.88) 0%,
      rgba(0,0,0,0.25) 50%,
      transparent 75%
    );
  }

  .reel-title {
    position: absolute; bottom: 0; right: 0; left: 0;
    padding: 12px 12px 16px;
    color: #fff; font-weight: 700;
    line-height: 1.4; text-shadow: 0 1px 8px rgba(0,0,0,0.6);
    display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
  }

  .reel-placeholder {
    width: 100%; height: 100%; display: flex;
    align-items: center; justify-content: center;
    background: #1a1a1a; color: rgba(255,255,255,0.1);
  }

  .reel-play-badge {
    position: absolute;
    top: 10px; left: 10px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: 1.5px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
    transition: background 0.2s, border-color 0.2s;
  }
  .reel-card-hero .reel-play-badge {
    background: rgba(204,244,127,0.15);
    border-color: rgba(204,244,127,0.5);
  }
  .reel-card:hover .reel-play-badge {
    background: #CCF47F;
    border-color: #CCF47F;
  }
  .reel-card:hover .reel-play-badge svg { fill: #121212; }

  .reel-dot {
    height: 3px; border-radius: 99px;
    flex-shrink: 0; cursor: pointer; border: none; padding: 0;
    transition: width 0.3s ease, background 0.3s ease, opacity 0.3s ease;
  }
`;

const PlayIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ReelCard = ({ reel, diff, onClick, onKeyDown, sizes }) => {
  const isHero = diff === 0;
  const isNear = Math.abs(diff) === 1;
  const thumb  = reel.thumbnail || getYoutubeThumbnail(reel.youtubeUrl);
  const w = isHero ? sizes.hero.w : sizes.card.w;
  const h = isHero ? sizes.hero.h : sizes.card.h;

  const style = {
    width:     w,
    height:    h,
    transform: `scale(${isHero ? 1 : isNear ? 0.87 : 0.74})`,
    opacity:   isHero ? 1 : isNear ? 0.7 : 0.4,
    filter:    isHero ? "none" : `brightness(${isNear ? 0.65 : 0.45})`,
    zIndex:    isHero ? 10 : isNear ? 5 : 2,
    border:    isHero ? "1.5px solid rgba(204,244,127,0.3)" : "1.5px solid transparent",
    animation: isHero ? "reel-glow 3s ease-in-out infinite" : "none",
    boxShadow: isHero ? "0 20px 50px rgba(0,0,0,0.6)" : "none",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={reel.title}
      className={`reel-card${isHero ? " reel-card-hero" : ""}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={style}
    >
      {thumb ? (
        <img src={thumb} alt={reel.title} draggable={false} />
      ) : (
        <div className="reel-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.1)">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}

      <div className="reel-overlay" />
      <div className="reel-play-badge">
        <PlayIcon size={isHero ? 13 : 11} />
      </div>

      {isHero && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "#CCF47F", borderRadius: 99,
          padding: "2px 8px",
          fontSize: "0.6rem", fontWeight: 700,
          color: "#121212", letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          {reel.duration || "SHORT"}
        </div>
      )}

      {(isHero || isNear) && (
        <div
          className="reel-title"
          style={{
            fontSize: isHero ? "0.82rem" : "0.68rem",
            WebkitLineClamp: isHero ? 3 : 2,
          }}
        >
          {reel.title}
        </div>
      )}
    </div>
  );
};

const Spinner = () => (
  <section style={{ padding: "40px 0", textAlign: "center" }}>
    <div style={{
      width: 26, height: 26, margin: "0 auto",
      border: "2px solid rgba(204,244,127,0.15)",
      borderTopColor: "#CCF47F",
      borderRadius: "50%",
      animation: "reel-spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes reel-spin { to { transform: rotate(360deg); } }`}</style>
  </section>
);

// ─── Inner (remounts on lang/category change via key) ─────────────────────────

const ReelsSectionInner = ({ lang, t, dir, category }) => {
  const navigate = useNavigate();
  const sizes    = useReelSizes();

  const [reels,   setReels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(0);

  const trackRef = useRef(null);
  const itemRefs = useRef([]);

  // ✅ بيبعت category للـ API لو موجود، لو لأ يجيب الكل
  useEffect(() => {
    setLoading(true);
    api.getReels(lang, 1, category || "")
      .then((res) => {
        const data = res.reels || [];
        setReels(data);
        setActive(Math.floor(data.length / 2));
      })
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, [lang, category]);

  const scrollToActive = useCallback((idx) => {
    const track = trackRef.current;
    const item  = itemRefs.current[idx];
    if (!track || !item) return;
    const trackRect = track.getBoundingClientRect();
    const itemRect  = item.getBoundingClientRect();
    const offset =
      item.offsetLeft -
      track.offsetLeft -
      (trackRect.width / 2) +
      (itemRect.width / 2);
    track.scrollTo({ left: offset, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToActive(active); }, [active, scrollToActive]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0, minDist = Infinity;
        itemRefs.current.forEach((el, idx) => {
          if (!el) return;
          const elCenter = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(trackCenter - elCenter);
          if (dist < minDist) { minDist = dist; closest = idx; }
        });
        setActive(closest);
      }, 80);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { track.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [reels]);

  const prev = useCallback(() => setActive(a => Math.max(0, a - 1)), []);
  const next = useCallback(() => setActive(a => Math.min(reels.length - 1, a + 1)), [reels.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  dir === "rtl" ? next() : prev();
      if (e.key === "ArrowRight") dir === "rtl" ? prev() : next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, dir]);

  if (loading) return <Spinner />;
  if (!reels.length) return null;

  const gap     = Math.max(8, Math.round(sizes.card.w * 0.07));
  const sidePad = `calc(50% - ${sizes.hero.w / 2}px)`;

  return (
    <>
      <div
        ref={trackRef}
        className="reel-track"
        style={{
          gap,
          paddingLeft:   sidePad,
          paddingRight:  sidePad,
          paddingTop:    "clamp(12px, 2vw, 20px)",
          paddingBottom: "clamp(16px, 2.5vw, 24px)",
        }}
      >
        {reels.map((reel, idx) => {
          const diff = idx - active;
          return (
            <div
              key={reel._id}
              ref={el => itemRefs.current[idx] = el}
              className="reel-snap-item"
              style={{
                width:  idx === active ? sizes.hero.w : sizes.card.w,
                height: idx === active ? sizes.hero.h : sizes.card.h,
              }}
            >
              <ReelCard
                reel={reel}
                diff={diff}
                sizes={sizes}
                onClick={() => diff === 0 ? navigate(`/reel/${reel._id}`) : setActive(idx)}
                onKeyDown={e => e.key === "Enter" && (diff === 0 ? navigate(`/reel/${reel._id}`) : setActive(idx))}
              />
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex", justifyContent: "center",
        alignItems: "center", gap: 4,
        marginTop: "clamp(12px, 2vw, 18px)", flexWrap: "wrap",
      }}>
        {reels.map((_, idx) => {
          const isAct = idx === active;
          const dist  = Math.abs(idx - active);
          return (
            <button
              key={idx}
              className="reel-dot"
              onClick={() => setActive(idx)}
              aria-label={`${t.reels.shortClip} ${idx + 1}`}
              style={{
                width:      isAct ? 20 : dist === 1 ? 6 : 4,
                background: isAct ? "#CCF47F" : dist === 1 ? "rgba(204,244,127,0.35)" : "rgba(255,255,255,0.15)",
                opacity:    dist > 4 ? 0 : 1,
              }}
            />
          );
        })}
      </div>
    </>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

// category prop اختياري:
//   بدونه  → يجيب كل الريلز (الصفحة الرئيسية)
//   'technology' → ريلز تكنولوجي  (TechPage)
//   'social'     → ريلز اجتماعي   (SocialPage)
//   'cultural'   → ريلز ثقافي     (HorizonsPage)

const ReelsSection = ({ category }) => {
  const { lang, t, dir } = useLanguage();

  return (
    <section
      dir={dir}
      style={{ padding: "clamp(24px, 4vw, 40px) 0 clamp(28px, 5vw, 48px)", position: "relative" }}
    >
      <style>{STYLES}</style>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "clamp(16px, 3vw, 28px)", padding: "0 2px",
      }}>
        <div>
          <h2 style={{
            color: "#FCF2ED", fontWeight: 800,
            fontSize: "clamp(1.1rem, 3vw, 1.65rem)",
            margin: 0, fontFamily: "Lyon, serif",
          }}>
            {t.reels.title}
          </h2>
          <div style={{
            height: 3, width: 36,
            background: "#CCF47F",
            borderRadius: 99, marginTop: 6,
          }} />
        </div>
      </div>

      {/* key يشمل category كمان عشان يعمل remount لما يتغير */}
      <ReelsSectionInner
        key={`${lang}-${category || "all"}`}
        lang={lang}
        t={t}
        dir={dir}
        category={category}
      />
    </section>
  );
};

export default ReelsSection;