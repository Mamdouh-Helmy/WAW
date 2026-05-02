import { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 left-6 w-12 h-12 rounded-full bg-[#CCF47F] text-[#161616] flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-[#BBE570] z-50 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
    >
      <i className="fa-solid fa-chevron-up text-lg"></i>
    </button>
  );
};

export default ScrollToTop;
