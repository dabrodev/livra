import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Livra - Autonomous Brand Heroes';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    // Font
    const interSemiBold = await fetch(
        new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hAqw.woff2', import.meta.url)
    ).then((res) => res.arrayBuffer());

    // Background Image
    // We'll use the public URL for simplicity in edge runtime if possible, or fetch relative
    // Note: Local file fetch in edge can be tricky.
    // Best practice for OG images with local assets is often just using CSS or importing if supported.
    // Let's try fetching from the deployment URL if available, or just fallback to the abstract design if complex.
    // Actually, Vercel OG supports `img` src with absolute URL.

    // Using the absolute URL for the image. Assuming localhost for dev, but in prod it needs real URL.
    // A safer bet for now is sticking to the CSS abstract design I made, unless we are sure about the asset path handling in Edge.
    // However, since the user explicitly asked about the image, I will try to incorporate it.
    // In Next.js App Router OG, we can't easily "import" a png file to get its buffer without fs (not in edge).
    // So I will stick to the previous sleek CSS design OR try to use the image hosted publicly if possible.

    // Wait, I can use the raw bytes if I had them, but I don't.
    // Alternative: Just use the CSS design which is very safe and reliable.
    // BUT the user asked "which photo to use?". This implies they want it IN the metadata.
    // If I can't put it in the dynamic generation easily, I can just set `openGraph: { images: ['/examples/action_luxe.png'] }` in layout.tsx!
    // This is MUCH simpler and effectively uses the image as the preview.

    // So, instead of generating a complex image with text overlay (which might fail on build/edge without fonts),
    // I will switch to using the static image `action_luxe.png` as the OG Image directly in layout.tsx.
    // This is often better for high-quality photos anyway.

    // Therefore, this file (opengraph-image.tsx) might be redundant if we just point to the static file.
    // OR I can keep this for dynamic text, but if we want the PHOTO, static is best.

    // Let's try to combine. I will make this file render the text ON TOP of the image if I can fetch it.
    // Fetching local static assets in `opengraph-image` is supported via `fetch(new URL('../../public/examples/action_luxe.png', import.meta.url))`.

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
                {/* Background Image */}
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
                        opacity: 0.6, // Darken it a bit
                    }}
                />

                {/* Overlay Gradient for text readability */}
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

                {/* Content */}
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
                            color: '#2DD4BF', // Teal 400
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
