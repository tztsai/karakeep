/**
 * Creates an HTML page with proper styling for displaying crawled content in WebView
 */
export function createHtmlPage(htmlContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 16px;
            margin: 0;
            background-color: #fff;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          pre {
            overflow-x: auto;
            background: #f5f5f5;
            padding: 12px;
            border-radius: 6px;
          }
          blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 16px;
            color: #666;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
          }
          p {
            margin-bottom: 16px;
          }
          a {
            color: #007AFF;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1a1a1a;
              color: #e4e4e7;
            }
            pre {
              background: #2a2a2a;
            }
            blockquote {
              border-left-color: #444;
              color: #a1a1aa;
            }
            a {
              color: #0A84FF;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;
}
