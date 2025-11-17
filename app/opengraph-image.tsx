import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              marginRight: '40px',
            }}
          >
            <div
              style={{
                fontSize: '140px',
                fontWeight: '700',
                color: 'white',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              P
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: '700',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Paydly
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: '400',
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Automate invoice reminders and get paid faster
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

