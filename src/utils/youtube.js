// src/utils/youtube.js
export const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);

    // youtube.com/watch?v=XXX
    if (urlObj.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
    }

    // youtu.be/XXX
    if (urlObj.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${urlObj.pathname}`;
    }

    // youtube.com/shorts/XXX
    if (urlObj.pathname.startsWith('/shorts/')) {
      const videoId = urlObj.pathname.replace('/shorts/', '');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtube.com/embed/XXX (already embed)
    if (urlObj.pathname.startsWith('/embed/')) {
      return url;
    }

  } catch {
    return null;
  }
  return null;
};