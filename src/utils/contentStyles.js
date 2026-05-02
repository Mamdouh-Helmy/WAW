// utils/contentStyles.js

export const getContentStyles = (dir, className = 'article-body') => {
  const isRtl = dir === 'rtl';
  return `
  .${className} { font-family: 'Ko Sans', 'Cairo', sans-serif; }

  .${className} h1,
  .${className} h2,
  .${className} h3,
  .${className} h4,
  .${className} h5,
  .${className} h6 {
    font-family: 'Lyon', serif;
    color: #FCF2ED;
    line-height: 1.3;
    margin: 1.8em 0 0.6em;
  }
  .${className} h1 { font-size: 1.9em; font-weight: 800; }
  .${className} h2 { font-size: 1.45em; font-weight: 700; }
  .${className} h3 {
    font-size: 1.2em;
    font-weight: 700;
    border-${isRtl ? 'right' : 'left'}: 3px solid #CCF47F;
    padding-${isRtl ? 'right' : 'left'}: 12px;
  }
  .${className} h4 { font-size: 1.05em; font-weight: 700; color: rgba(252,242,237,0.9); }
  .${className} h5 { font-size: 0.95em; font-weight: 600; color: rgba(252,242,237,0.75); text-transform: uppercase; letter-spacing: 0.06em; }
  .${className} h6 { font-size: 0.85em; font-weight: 600; color: #898989; }

  .${className} p {
    color: rgba(252,242,237,0.85);
    font-size: 1.05rem;
    line-height: 1.9;
    margin: 0 0 1.2em;
  }

  .${className} section { margin-bottom: 2em; }

  .${className} strong, .${className} b { color: #FCF2ED; font-weight: 700; }
  .${className} em, .${className} i { color: rgba(252,242,237,0.75); font-style: italic; }
  .${className} u { text-underline-offset: 4px; text-decoration-color: rgba(204,244,127,0.5); }
  .${className} del { opacity: 0.5; }
  .${className} mark { background: rgba(204,244,127,0.18); color: #CCF47F; padding: 1px 5px; border-radius: 4px; }

  .${className} a {
    color: #CCF47F;
    text-decoration: none;
    border-bottom: 1px solid rgba(204,244,127,0.3);
    transition: border-color 0.2s, color 0.2s;
  }
  .${className} a:hover {
    color: #fff;
    border-color: rgba(204,244,127,0.8);
  }

  .${className} ul, .${className} ol {
    color: rgba(252,242,237,0.85);
    padding-${isRtl ? 'right' : 'left'}: 1.6em;
    margin: 0 0 1.2em;
    line-height: 1.9;
  }
  .${className} li { margin-bottom: 0.35em; }
  .${className} ul li::marker { color: #CCF47F; }
  .${className} ol li::marker { color: #CCF47F; font-weight: 700; }

  .${className} blockquote {
    border-${isRtl ? 'right' : 'left'}: 3px solid #CCF47F;
    margin: 1.8em 0;
    padding: 16px 20px;
    background: rgba(204,244,127,0.05);
    border-radius: ${isRtl ? '0 12px 12px 0' : '12px 0 0 12px'};
    color: rgba(252,242,237,0.75);
    font-style: italic;
    font-size: 1.05em;
    line-height: 1.8;
  }

  .${className} code {
    background: rgba(255,255,255,0.07);
    padding: 2px 8px;
    border-radius: 5px;
    font-family: 'Fira Code', monospace;
    color: #CCF47F;
    font-size: 0.88em;
  }

  .${className} pre {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 20px;
    overflow-x: auto;
    margin: 1.5em 0;
  }
  .${className} pre code {
    background: none;
    padding: 0;
    color: rgba(252,242,237,0.85);
    font-size: 0.9em;
    line-height: 1.7;
  }

  .${className} hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin: 2.5em 0;
  }

  .${className} img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 1.5em 0;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .${className} table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    font-size: 0.92em;
  }
  .${className} th {
    background: rgba(204,244,127,0.08);
    color: #CCF47F;
    font-weight: 700;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.07);
    text-align: inherit;
  }
  .${className} td {
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.06);
    color: rgba(252,242,237,0.82);
  }
  .${className} tr:hover td { background: rgba(255,255,255,0.02); }
`;
};