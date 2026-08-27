import Link from 'next/link';
import { Home, Search, Diamond } from 'lucide-react';

export default function StoreErrorPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>Store Not Found | EvoLabs</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'DM Sans', sans-serif;
            background-color: #FAF9F6;
            color: #1C1C1C;
            line-height: 1.6;
            min-height: 100vh;
          }

          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            text-align: center;
            position: relative;
          }

          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 24px 40px;
            position: relative;
          }

          .diamond-icon {
            color: #A88A3B;
            margin-bottom: 32px;
            animation: float 4s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .number {
            font-family: 'Playfair Display', serif;
            font-size: clamp(120px, 25vw, 200px);
            font-weight: 400;
            color: transparent;
            -webkit-text-stroke: 1px #A88A3B;
            opacity: 0.15;
            pointer-events: none;
            user-select: none;
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1;
          }

          .content {
            position: relative;
            z-index: 1;
          }

          .overline {
            font-family: 'DM Sans', sans-serif;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #A88A3B;
            margin-bottom: 16px;
          }

          h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(28px, 5vw, 40px);
            font-weight: 400;
            margin-bottom: 16px;
            color: #1C1C1C;
          }

          .divider {
            width: 40px;
            height: 1px;
            background: #A88A3B;
            margin: 24px auto;
          }

          .description {
            font-size: 15px;
            color: #7A7A78;
            max-width: 380px;
            margin: 0 auto 40px;
            line-height: 1.7;
          }

          .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 32px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-decoration: none;
            border-radius: 2px;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: #1C1C1C;
            color: #FAF9F6;
            border: 1px solid #1C1C1C;
          }

          .btn-primary:hover {
            background: #A88A3B;
            border-color: #A88A3B;
          }

          .btn-secondary {
            background: transparent;
            color: #1C1C1C;
            border: 1px solid #1C1C1C;
          }

          .btn-secondary:hover {
            background: #1C1C1C;
            color: #FAF9F6;
          }

          .footer {
            width: 100%;
            padding: 24px;
            text-align: center;
          }

          .powered-by {
            font-family: 'Cormorant Garamond', serif;
            font-size: 13px;
            font-style: italic;
            color: #7A7A78;
            letter-spacing: 0.02em;
          }

          .powered-by a {
            color: #A88A3B;
            text-decoration: none;
            transition: color 0.2s;
          }

          .powered-by a:hover {
            color: #8E6D27;
          }

          .floating-element {
            position: absolute;
            opacity: 0.08;
            color: #A88A3B;
            pointer-events: none;
          }

          .elem-1 { top: 15%; left: 10%; transform: rotate(15deg); }
          .elem-2 { top: 20%; right: 15%; transform: rotate(-10deg); }
          .elem-3 { bottom: 25%; left: 15%; transform: rotate(25deg); }
          .elem-4 { bottom: 15%; right: 10%; transform: rotate(-5deg); }

          @media (max-width: 600px) {
            .number {
              font-size: 150px;
            }
            .actions {
              flex-direction: column;
              width: 100%;
            }
            .btn {
              justify-content: center;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="main-content">
            <Diamond className="diamond-icon" size={48} strokeWidth={1} />

            <div className="number">404</div>

            <div className="content">
              <p className="overline">Page Not Found</p>
              <h1>This Store Doesn't Exist</h1>
              <div className="divider" />
              <p className="description">
                The store you're looking for may have moved, or the URL might be incorrect.
                Please check the address or explore our collections below.
              </p>
              <div className="actions">
                <Link href="/" className="btn btn-primary">
                  <Home size={16} />
                  Return Home
                </Link>
                <Link href="/catalogue" className="btn btn-secondary">
                  <Search size={16} />
                  Browse Collection
                </Link>
              </div>
            </div>
          </div>

          <div className="footer">
            <p className="powered-by">
              Website powered by <a href="https://evoclabs.com" target="_blank" rel="noopener noreferrer">Evoclabs.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
