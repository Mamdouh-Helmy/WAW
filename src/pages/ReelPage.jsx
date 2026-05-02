import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getYoutubeId = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.pathname.startsWith("/shorts/")) return u.pathname.replace("/shorts/", "");
    if (u.pathname.startsWith("/embed/")) return u.pathname.replace("/embed/", "");
    return null;
  } catch {
    return null;
  }
};

const getEmbedUrl = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1` : null;
};

const getThumbnail = (url, quality = "maxresdefault") => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
};

const formatDate = (dateStr, lang) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

// ─── Styles ───────────────────────────────────────────────────────────────────

const PAGE_STYLES = `
  @keyframes rspin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .related-card {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
    display: flex;
    flex-direction: column;
    text-decoration: none;
  }
  .related-card:hover { border-color: rgba(247,227,40,0.25); transform: translateY(-3px); }

  .play-circle {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(247,227,40,0.9);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s, background 0.15s;
    cursor: pointer; border: none;
  }
  .play-circle:hover { transform: scale(1.08); background: #F7E328; }

  #related-slider::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    .reel-layout { flex-direction: column !important; }
    .reel-video-col { max-width: 100% !important; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{
      width: 32, height: 32,
      border: "2px solid rgba(247,227,40,0.2)",
      borderTopColor: "#F7E328",
      borderRadius: "50%",
      animation: "rspin 0.8s linear infinite",
    }} />
    <style>{`@keyframes rspin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const BackButton = ({ onClick, dir, label }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "8px 14px",
      color: "#898989", cursor: "pointer", fontSize: "0.85rem",
      fontFamily: "Lyon, serif", transition: "color 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#FCF2ED")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#898989")}
  >
    <i className={`fa-solid fa-chevron-${dir === "rtl" ? "right" : "left"}`} style={{ fontSize: "0.75rem" }} />
    {label}
  </button>
);

const VideoPlayer = ({ reel, playing, onPlay, lang }) => {
  const embedUrl = getEmbedUrl(reel.youtubeUrl);
  const thumb = reel.thumbnail || getThumbnail(reel.youtubeUrl);
  const dateStr = formatDate(reel.publishedAt, lang);

  return (
    <div style={{ flex: "0 0 360px", maxWidth: 360, width: "100%" }} className="reel-video-col">
      <div style={{
        width: "100%", aspectRatio: "9/16", borderRadius: 20, overflow: "hidden",
        background: "#0d0d0d", border: "1px solid rgba(247,227,40,0.2)",
        position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={reel.title}
          />
        ) : (
          <>
            {thumb && (
              <img src={thumb} alt={reel.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button className="play-circle" onClick={onPlay}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#161616">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
            </div>
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999,
              padding: "4px 10px", color: "#FCF2ED", fontSize: "0.7rem",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <i className="fa-brands fa-youtube" style={{ color: "#ff4040", fontSize: "0.75rem" }} />
              Shorts
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
        <span style={{ color: "#898989", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
          <i className="fa-regular fa-eye" style={{ fontSize: "0.75rem" }} />
          {reel.views?.toLocaleString(lang === "ar" ? "ar-EG" : "en-US") || "0"}
        </span>
        {dateStr && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#444", display: "inline-block" }} />
            <span style={{ color: "#898989", fontSize: "0.8rem" }}>{dateStr}</span>
          </>
        )}
      </div>
    </div>
  );
};

const ReelInfo = ({ reel, t }) => (
  <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(247,227,40,0.1)", border: "1px solid rgba(247,227,40,0.25)",
      borderRadius: 999, padding: "4px 12px", marginBottom: 14,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F7E328", display: "inline-block" }} />
      <span style={{ color: "#F7E328", fontSize: "0.75rem", fontWeight: 600 }}>{t.reels.shortClip}</span>
    </div>

    <h1 style={{
      color: "#FCF2ED", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)",
      lineHeight: 1.35, margin: "0 0 16px", fontFamily: "Lyon, serif",
    }}>
      {reel.title}
    </h1>

    <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />

    {reel.description ? (
      <p style={{ color: "#ccc", fontSize: "0.95rem", lineHeight: 1.8, margin: 0 }}>{reel.description}</p>
    ) : (
      <p style={{ color: "#555", fontSize: "0.875rem", fontStyle: "italic" }}>{t.reels.noDescription}</p>
    )}

    {reel.youtubeUrl && (
      <a
        href={reel.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28,
          background: "rgba(255,64,64,0.1)", border: "1px solid rgba(255,64,64,0.25)",
          borderRadius: 12, padding: "10px 18px", color: "#ff6b6b", fontSize: "0.85rem",
          fontWeight: 600, textDecoration: "none", fontFamily: "Lyon, serif", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,64,64,0.18)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,64,64,0.1)")}
      >
        <i className="fa-brands fa-youtube" style={{ fontSize: "1rem" }} />
        {t.reels.watchOnYoutube}
      </a>
    )}
  </div>
);

const RelatedCard = ({ reel, lang }) => {
  const thumb = reel.thumbnail || getThumbnail(reel.youtubeUrl, "hqdefault");

  return (
    <Link to={`/reel/${reel._id}`} className="related-card">
      <div style={{ aspectRatio: "9/16", maxHeight: 220, overflow: "hidden", position: "relative", background: "#111" }}>
        {thumb ? (
          <img src={thumb} alt={reel.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)", fontSize: "1.5rem" }}>
            ▶
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />
        <div style={{
          position: "absolute", bottom: 8, right: 8, left: 8,
          color: "#fff", fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {reel.title}
        </div>
        <div style={{
          position: "absolute", top: 8, left: 8,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          borderRadius: 999, padding: "3px 8px", color: "#FCF2ED", fontSize: "0.6rem",
          display: "flex", alignItems: "center", gap: 4,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <i className="fa-regular fa-eye" style={{ fontSize: "0.55rem" }} />
          {reel.views?.toLocaleString(lang === "ar" ? "ar-EG" : "en-US") || 0}
        </div>
      </div>
    </Link>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t, dir } = useLanguage();

  const [reel, setReel] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPlaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([
      api.getReel(id, lang),
      api.getReels(lang),
    ])
      .then(([reelData, reelsData]) => {
        setReel(reelData);
        setRelated((reelsData.reels || []).filter((r) => r._id !== id).slice(0, 6));
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, lang, navigate]);

  if (loading) return <Spinner />;
  if (!reel) return null;

  const scrollSlider = (direction) => {
    const el = document.getElementById("related-slider");
    if (!el) return;
    const amount = 200;
    const isRtl = dir === "rtl";
    el.scrollBy({ left: direction === "prev" ? (isRtl ? amount : -amount) : (isRtl ? -amount : amount), behavior: "smooth" });
  };

  return (
    <div dir={dir} style={{ fontFamily: "Lyon, serif", paddingBottom: 80 }}>
      <style>{PAGE_STYLES}</style>

      {/* Back button */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 0" }}>
        <BackButton onClick={() => navigate(-1)} dir={dir} label={t.reels.back} />
      </div>

      {/* Main layout */}
      <div
        className="reel-layout"
        style={{
          maxWidth: 1100, margin: "24px auto 0", padding: "0 20px",
          display: "flex", gap: 32, alignItems: "flex-start",
          animation: "fadeUp 0.4s ease both",
        }}
      >
        <VideoPlayer reel={reel} playing={playing} onPlay={() => setPlaying(true)} lang={lang} />
        <ReelInfo reel={reel} t={t} />
      </div>

      {/* Related reels slider */}
      {related.length > 0 && (
        <div style={{ maxWidth: 1100, margin: "56px auto 0", padding: "0 20px" }}>

          {/* Header + arrows */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ color: "#FCF2ED", fontWeight: 700, fontSize: "1.15rem", margin: 0, fontFamily: "Lyon, serif" }}>
                {t.reels.otherClips}
              </h2>
              <div style={{ height: 3, width: 40, background: "#F7E328", borderRadius: 2, marginTop: 6 }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {["prev", "next"].map((d) => (
                <button
                  key={d}
                  onClick={() => scrollSlider(d)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#FCF2ED", cursor: "pointer", fontSize: "0.8rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(247,227,40,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                >
                  <i className={`fa-solid fa-chevron-${d === "prev" ? "left" : "right"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Slider track */}
          <div
            id="related-slider"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingBottom: 12,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {related.map((r) => (
              <div key={r._id} style={{ flex: "0 0 180px", scrollSnapAlign: "start" }}>
                <RelatedCard reel={r} lang={lang} />
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default ReelPage;