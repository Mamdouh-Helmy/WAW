import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getYoutubeId = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.searchParams.get("v"))              return u.searchParams.get("v");
    if (u.hostname === "youtu.be")            return u.pathname.slice(1);
    if (u.pathname.startsWith("/shorts/"))    return u.pathname.replace("/shorts/", "");
    if (u.pathname.startsWith("/embed/"))     return u.pathname.replace("/embed/", "");
    return null;
  } catch { return null; }
};

const getEmbedUrl  = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1` : null;
};

const getThumbnail = (url, q = "maxresdefault") => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${q}.jpg` : null;
};

const formatDate = (d, lang) =>
  d ? new Date(d).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric", month: "long", year: "numeric",
  }) : "";

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes rspin  { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

  .rp-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 8px 14px;
    color: #898989; cursor: pointer; font-size: 0.85rem;
    font-family: Lyon, serif; transition: color 0.15s, border-color 0.15s;
  }
  .rp-back:hover { color: #FCF2ED; border-color: rgba(204,244,127,0.2); }

  .rp-play-btn {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(204,244,127,0.9);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: none;
    transition: transform 0.15s, background 0.15s;
    box-shadow: 0 0 30px rgba(204,244,127,0.3);
  }
  .rp-play-btn:hover { transform: scale(1.08); background: #CCF47F; }

  .rp-yt-link {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(204,244,127,0.08);
    border: 1px solid rgba(204,244,127,0.2);
    border-radius: 12px; padding: 10px 18px;
    color: #CCF47F; font-size: 0.85rem; font-weight: 600;
    text-decoration: none; font-family: Lyon, serif;
    transition: background 0.15s;
  }
  .rp-yt-link:hover { background: rgba(204,244,127,0.14); }

  .rp-related-card {
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; overflow: hidden;
    cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column;
    transition: border-color 0.2s, transform 0.2s;
  }
  .rp-related-card:hover {
    border-color: rgba(204,244,127,0.25);
    transform: translateY(-3px);
  }

  .rp-nav-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #FCF2ED; cursor: pointer; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }
  .rp-nav-btn:hover {
    background: rgba(204,244,127,0.12);
    border-color: rgba(204,244,127,0.3);
  }

  #rp-slider::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    .rp-layout { flex-direction: column !important; align-items: center !important; }
    .rp-video-col { max-width: 340px !important; width: 100% !important; flex: none !important; }
  }
`;

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <style>{`@keyframes rspin { to { transform: rotate(360deg); } }`}</style>
    <div style={{
      width: 30, height: 30,
      border: "2px solid rgba(204,244,127,0.15)",
      borderTopColor: "#CCF47F",
      borderRadius: "50%", animation: "rspin 0.8s linear infinite",
    }} />
  </div>
);

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

const VideoPlayer = ({ reel, playing, onPlay, lang }) => {
  const embedUrl = getEmbedUrl(reel.youtubeUrl);
  const thumb    = reel.thumbnail || getThumbnail(reel.youtubeUrl);
  const dateStr  = formatDate(reel.publishedAt, lang);

  return (
    <div className="rp-video-col" style={{ flex: "0 0 340px", maxWidth: 340, width: "100%" }}>

      {/* Video box */}
      <div style={{
        width: "100%", aspectRatio: "9/16",
        borderRadius: 20, overflow: "hidden",
        background: "#0d0d0d",
        border: "1px solid rgba(204,244,127,0.15)",
        position: "relative",
        boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
      }}>
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen title={reel.title}
          />
        ) : (
          <>
            {thumb && (
              <img src={thumb} alt={reel.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            {/* overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <button className="rp-play-btn" onClick={onPlay}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#121212">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
            </div>
            {/* shorts badge */}
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999,
              padding: "4px 10px", color: "#FCF2ED", fontSize: "0.68rem",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <i className="fa-brands fa-youtube" style={{ color: "#ff4040", fontSize: "0.72rem" }} />
              Shorts
            </div>
          </>
        )}
      </div>

      {/* Meta */}
      {(reel.views || dateStr) && (
        <div style={{
          marginTop: 12, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 12, flexWrap: "wrap",
        }}>
          {reel.views && (
            <span style={{ color: "#898989", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 5 }}>
              <i className="fa-regular fa-eye" style={{ fontSize: "0.72rem" }} />
              {reel.views.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
            </span>
          )}
          {reel.views && dateStr && (
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#444", display: "inline-block" }} />
          )}
          {dateStr && (
            <span style={{ color: "#898989", fontSize: "0.78rem" }}>{dateStr}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ReelInfo ─────────────────────────────────────────────────────────────────

const ReelInfo = ({ reel, t }) => (
  <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>

    {/* Badge */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(204,244,127,0.08)",
      border: "1px solid rgba(204,244,127,0.2)",
      borderRadius: 999, padding: "4px 12px", marginBottom: 14,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CCF47F", display: "inline-block" }} />
      <span style={{ color: "#CCF47F", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>
        {t.reels.shortClip}
      </span>
    </div>

    {/* Title */}
    <h1 style={{
      color: "#FCF2ED", fontWeight: 800,
      fontSize: "clamp(1.3rem, 3vw, 2rem)",
      lineHeight: 1.35, margin: "0 0 20px",
      fontFamily: "Lyon, serif",
    }}>
      {reel.title}
    </h1>

    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

    {/* Description */}
    {reel.description ? (
      <p style={{ color: "#bbb", fontSize: "0.92rem", lineHeight: 1.85, margin: 0 }}>
        {reel.description}
      </p>
    ) : (
      <p style={{ color: "#555", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>
        {t.reels.noDescription}
      </p>
    )}

    {/* YouTube link */}
    {reel.youtubeUrl && (
      <a href={reel.youtubeUrl} target="_blank" rel="noopener noreferrer"
        className="rp-yt-link" style={{ marginTop: 28 }}>
        <i className="fa-brands fa-youtube" style={{ fontSize: "1rem" }} />
        {t.reels.watchOnYoutube}
      </a>
    )}
  </div>
);

// ─── RelatedCard ──────────────────────────────────────────────────────────────

const RelatedCard = ({ reel, lang }) => {
  const thumb = reel.thumbnail || getThumbnail(reel.youtubeUrl, "hqdefault");
  return (
    <Link to={`/reel/${reel._id}`} className="rp-related-card">
      <div style={{ aspectRatio: "9/16", maxHeight: 220, overflow: "hidden", position: "relative", background: "#111" }}>
        {thumb ? (
          <img src={thumb} alt={reel.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)", fontSize: "1.5rem" }}>▶</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
        <div style={{
          position: "absolute", bottom: 8, right: 8, left: 8,
          color: "#fff", fontWeight: 700, fontSize: "0.75rem", lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {reel.title}
        </div>
        {reel.views && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            borderRadius: 999, padding: "3px 8px",
            color: "#FCF2ED", fontSize: "0.6rem",
            display: "flex", alignItems: "center", gap: 4,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <i className="fa-regular fa-eye" style={{ fontSize: "0.55rem" }} />
            {reel.views.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const ReelPage = () => {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { lang, t, dir }     = useLanguage();
  const [reel,    setReel]   = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPlaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([api.getReel(id, lang), api.getReels(lang)])
      .then(([reelData, reelsData]) => {
        setReel(reelData);
        setRelated((reelsData.reels || []).filter(r => r._id !== id).slice(0, 8));
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, lang, navigate]);

  if (loading) return <Spinner />;
  if (!reel)   return null;

  const scrollSlider = (d) => {
    const el = document.getElementById("rp-slider");
    if (!el) return;
    el.scrollBy({ left: d === "prev" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div dir={dir} style={{ fontFamily: "Lyon, serif", paddingBottom: 80 }}>
      <style>{STYLES}</style>

      {/* Back */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 0" }}>
        <button className="rp-back" onClick={() => navigate(-1)}>
          <i className={`fa-solid fa-chevron-${dir === "rtl" ? "right" : "left"}`} style={{ fontSize: "0.72rem" }} />
          {t.reels.back}
        </button>
      </div>

      {/* Main layout */}
      <div
        className="rp-layout"
        style={{
          maxWidth: 1100, margin: "24px auto 0", padding: "0 20px",
          display: "flex", gap: 36, alignItems: "flex-start",
          animation: "fadeUp 0.4s ease both",
        }}
      >
        <VideoPlayer reel={reel} playing={playing} onPlay={() => setPlaying(true)} lang={lang} />
        <ReelInfo reel={reel} t={t} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ maxWidth: 1100, margin: "56px auto 0", padding: "0 20px" }}>

          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ color: "#FCF2ED", fontWeight: 700, fontSize: "1.1rem", margin: 0, fontFamily: "Lyon, serif" }}>
                {t.reels.otherClips}
              </h2>
              <div style={{ height: 3, width: 36, background: "linear-gradient(#CCF47F)", borderRadius: 99, marginTop: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["prev", "next"].map(d => (
                <button key={d} className="rp-nav-btn" onClick={() => scrollSlider(d)}>
                  <i className={`fa-solid fa-chevron-${d === "prev" ? "left" : "right"}`} />
                </button>
              ))}
            </div>
          </div>

          <div id="rp-slider" style={{
            display: "flex", gap: 14,
            overflowX: "auto", scrollSnapType: "x mandatory",
            paddingBottom: 12, scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {related.map(r => (
              <div key={r._id} style={{ flex: "0 0 160px", scrollSnapAlign: "start" }}>
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