import { Home, Search, Globe } from 'lucide-react';

export default function StoreNotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Store Not Found | EvoLabs</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }
          .container {
            text-align: center;
            padding: 40px;
            max-width: 480px;
          }
          .icon {
            width: 80px;
            height: 80px;
            margin-bottom: 32px;
            color: #c9a84c;
          }
          h1 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          p {
            font-size: 16px;
            color: rgba(255,255,255,0.7);
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }
          a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #c9a84c;
            color: #1a1a2e;
          }
          .btn-primary:hover {
            background: #b8962e;
          }
          .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
          }
          .btn-secondary:hover {
            background: rgba(255,255,255,0.2);
          }
          .brand {
            margin-top: 48px;
            font-size: 12px;
            color: rgba(255,255,255,0.4);
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <Globe className="icon" />
          <h1>Store Not Found</h1>
          <p>
            The store you&apos;re looking for doesn&apos;t exist or has been removed.
            Please check the URL and try again.
          </p>
          <div className="actions">
            <a href="/" className="btn-primary">
              <Home size={18} />
              Go to Homepage
            </a>
            <a href="/catalogue" className="btn-secondary">
              <Search size={18} />
              Browse Products
            </a>
          </div>
          <div className="brand">Powered by EvoLabs</div>
        </div>
      </body>
    </html>
  );
}