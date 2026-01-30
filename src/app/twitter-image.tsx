import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Livra - Autonomous Brand Heroes';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    const interSemiBold = await fetch(
        new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hAqw.woff2', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const imageData = await fetch(
        new URL('../../public/examples/action_luxe.png', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Inter"',
                }}
            >
                {/* @ts-ignore */}
                <img
                    src={imageData as unknown as string}
                    alt="Background"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.6,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, marginTop: '200px' }}>
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 900,
                            color: 'white',
                            letterSpacing: '-2px',
                            lineHeight: 1,
                            textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            marginBottom: '10px',
                        }}
                    >
                        Livra
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 600,
                            color: '#2DD4BF',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Where AI Comes Alive
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'Inter',
                    data: interSemiBold,
                    style: 'normal',
                    weight: 600,
                },
            ],
        }
    );
}
