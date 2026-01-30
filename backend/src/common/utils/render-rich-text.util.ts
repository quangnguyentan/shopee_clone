// import sanitizeHtml from 'sanitize-html';
// import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

// export function renderRichText(deltaJson: string): string {
//   if (!deltaJson) return '';

//   const delta = JSON.parse(deltaJson);
//   const html = new QuillDeltaToHtmlConverter(delta.ops).convert();

//   return sanitizeHtml(html, {
//     allowedTags: [
//       'h1',
//       'h2',
//       'h3',
//       'p',
//       'br',
//       'strong',
//       'em',
//       'u',
//       'ul',
//       'ol',
//       'li',
//       'blockquote',
//       'a',
//       'img',
//     ],
//     allowedAttributes: {
//       a: ['href', 'target', 'rel'],
//       img: ['src', 'alt'],
//     },
//     allowedSchemes: ['http', 'https'],
//     transformTags: {
//       a: sanitizeHtml.simpleTransform('a', {
//         rel: 'noopener noreferrer',
//         target: '_blank',
//       }),
//     },
//   });
// }

import sanitizeHtml from 'sanitize-html';

export function renderRichText(html?: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
  });
}
