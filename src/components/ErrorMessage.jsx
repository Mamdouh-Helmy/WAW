import { useLanguage } from '../context/LanguageContext';

const ErrorMessage = ({ message }) => {
  const { dir } = useLanguage();
  const defaultMsg = dir === 'rtl' ? 'حدث خطأ في التحميل' : 'Failed to load content';

  return (
    <div className="flex flex-col items-center justify-center py-20 text-[#898989]">
      <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 opacity-30" />
      <p className="text-lg">{message || defaultMsg}</p>
    </div>
  );
};

export default ErrorMessage;