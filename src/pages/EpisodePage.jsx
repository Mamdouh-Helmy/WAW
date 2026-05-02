import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import { getYoutubeEmbedUrl } from '../utils/youtube';

const EpisodePage = () => {
  const { id } = useParams();
  const { language, dir } = useLanguage();

  const { data: ep, loading, error } = useFetch(
    () => api.getPodcast(id, language),
    [id, language]
  );

  if (loading) return <LoadingSpinner />;
  if (error || !ep) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#898989]">
      <i className="fa-solid fa-circle-exclamation text-4xl mb-4 opacity-40" />
      <p>{dir === 'rtl' ? 'الحلقة غير موجودة' : 'Episode not found'}</p>
    </div>
  );

  const embedUrl = getYoutubeEmbedUrl(ep.youtubeUrl);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12" dir={dir}>

      {/* Back */}
      <Link
        to="/podcast"
        className="inline-flex items-center gap-2 text-[#898989] hover:text-[#FCF2ED] transition-colors text-sm mb-10 group"
      >
        <i className={`fa-solid fa-arrow-${dir === 'rtl' ? 'right' : 'left'} transition-transform group-hover:${dir === 'rtl' ? 'translate-x-1' : '-translate-x-1'}`} />
        {dir === 'rtl' ? 'العودة للبودكاست' : 'Back to Podcast'}
      </Link>

      {/* Episode badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-[#CCF47F] text-black text-xs font-black px-3 py-1 rounded-full tracking-wide">
          {dir === 'rtl' ? `الحلقة ${ep.episodeNum}` : `EP. ${ep.episodeNum}`}
        </span>
        <span className="text-[#898989] text-sm flex items-center gap-1.5">
          <i className="fa-regular fa-clock" />
          {ep.duration}
        </span>
      </div>

      {/* Title */}
      <h1
        className="text-4xl md:text-5xl font-bold text-[#FCF2ED] leading-tight mb-4"
        style={{ fontFamily: 'Lyon, serif' }}
      >
        {ep.title}
      </h1>

      {/* Host */}
      <div className="flex items-center gap-2 text-[#898989] mb-10">
        <i className="fa-solid fa-microphone text-[#CCF47F]" />
        <span className="text-sm">{ep.host}</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-10" />

      {/* YouTube Player or Thumbnail Fallback */}
      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden bg-[#1e1e1e] mb-10" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={embedUrl}
            title={ep.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : ep.thumbnail ? (
        <div
          className="rounded-2xl overflow-hidden mb-10 bg-cover bg-center"
          style={{ backgroundImage: `url('${ep.thumbnail}')`, aspectRatio: '16/9' }}
        >
          <div className="w-full h-full bg-black/40 flex items-center justify-center">
            <i className="fa-solid fa-headphones text-6xl text-[#CCF47F] opacity-80" />
          </div>
        </div>
      ) : null}

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: 'fa-microphone', label: dir === 'rtl' ? 'المضيف' : 'Host',     value: ep.host },
          { icon: 'fa-clock',      label: dir === 'rtl' ? 'المدة'   : 'Duration', value: ep.duration },
          { icon: 'fa-headphones', label: dir === 'rtl' ? 'رقم الحلقة' : 'Episode', value: `#${ep.episodeNum}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-[#898989] text-xs mb-1.5">
              <i className={`fa-solid ${icon} text-[#CCF47F]`} />
              {label}
            </div>
            <p className="text-[#FCF2ED] font-semibold text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Watch on YouTube */}
      {ep.youtubeUrl && (
        
         <a href={ep.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#CCF47F] text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-[#b8e05f] transition-colors"
        >
          <i className="fa-brands fa-youtube text-base" />
          {dir === 'rtl' ? 'شاهد على يوتيوب' : 'Watch on YouTube'}
        </a>
      )}
    </main>
  );
};

export default EpisodePage;