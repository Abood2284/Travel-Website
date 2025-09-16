### What you’re seeing

- **A Lottie image-sequence scrubbed by scroll**: As you scroll, the component advances the Lottie animation frame-by-frame, with the section pinned in place until the sequence finishes.

### How it works (core pieces)

- **Client component + GSAP ScrollTrigger**

```31:74:components/scroll-animation/scroll-animation.tsx
  useEffect(() => {
    if (!heroRef.current || !containerRef.current) return;

    const hero = heroRef.current;
    const container = containerRef.current;

    // Load Lottie animation
    const anim = loadLottieAnimation({
      container,
      path: animationPath,
    });

    animationRef.current = anim;

    // Wait for animation to load
    anim.addEventListener("DOMLoaded", () => {
      // Go to first frame
      anim.goToAndStop(0, true);

      const totalFrames = anim.getDuration(true);
      const driver = { f: 0 };

      // Calculate total scroll distance
      const sceneLenPx = totalFrames * pxPerFrame;

      // Create GSAP timeline with ScrollTrigger
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => "+=" + sceneLenPx,
          scrub: scrubAmount,
          pin: true,
          // markers: true // Uncomment for debugging
        },
      });

      // Animate frame counter
      tl.to(driver, {
        f: totalFrames - 1,
        onUpdate: () => anim.goToAndStop(driver.f, true),
      });
    });
```

- **Lottie loader defaults**

```14:25:lib/lottie-loader.ts
export function loadLottieAnimation(config: LottieConfig) {
  return lottie.loadAnimation({
    renderer: "svg",
    loop: false,
    autoplay: false,
    ...config,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      ...config.rendererSettings,
    },
  });
}
```

- **Pinned full-viewport section**

```1:6:components/scroll-animation/scroll-animation.module.css
.hero {
  position: relative;
  height: 100vh;
  overflow: clip;
  background: #000;
}
```

- **Usage on the page**

```5:10:app/page.tsx
  <ScrollAnimation
    animationPath="/animations/data.json"
    pxPerFrame={24}
    scrubAmount={1}
  />
```

### Where the animation data comes from

- The JSON in `public/animations/data.json` is generated from an image sequence using the provided script. Each frame is a 1-frame layer referencing one image file.

```51:85:scripts/make-lottie.js
    // Build assets
    for (let i = 0; i < imageFiles.length; i++) {
      const ext = path.extname(imageFiles[i]).toLowerCase().slice(1);
      data.assets.push({
        id: `image_${i}`,
        w: width,
        h: height,
        u: urlPrefix,
        p: imageFiles[i],
        e: 0,
      });
    }

    // Build layers
    for (let i = 0; i < imageFiles.length; i++) {
      const ext = path.extname(imageFiles[i]).toLowerCase().slice(1);
      data.layers.push({
        ddd: 0,
        ind: i + 1,
        ty: 2,
        nm: imageFiles[i],
        cl: ext,
        refId: `image_${i}`,
        sr: 1,
        ks: { p: { a: 0, k: [cx, cy, 0] }, a: { a: 0, k: [cx, cy, 0] } },
        ao: 0,
        ip: i,
        op: i + 1,
        st: i,
        bm: 0,
      });
    }
```

### How to make a similar scroll-scrubbed animation

1. Prepare frames:
   - Export your animation as a numbered image sequence (WebP recommended for size).
   - Place them in `public/animations/images/` as `image_0.webp`, `image_1.webp`, ...
2. Generate Lottie JSON:
   - Run:

```bash
node scripts/make-lottie.js \
  --images-dir ./public/animations/images \
  --out ./public/animations/data.json \
  --fps 60 \
  --width 1880 \
  --height 920 \
  --url-prefix images/
```

3. Use the component:
   - Point `animationPath` to `/animations/data.json`, then tune:
     - `pxPerFrame`: scroll distance per frame (more = longer pin/scroll).
     - `scrubAmount`: smoothing of scroll-to-frame (1 = responsive, higher = more easing).
4. Debug:
   - Toggle ScrollTrigger markers by uncommenting `markers: true`.
5. Optimize:
   - Keep frames small (WebP, sized to actual display).
   - Consider lowering frame count or `fps` in the generator to reduce payload.
   - If SVG rendering is heavy, switch to `renderer: "canvas"` via the loader:

```ts
loadLottieAnimation({ container, path, renderer: "canvas" });
```

### Mental model

- The section pins to the top while you scroll a distance proportional to number of frames.
- A GSAP timeline increments a simple `driver.f` value.
- On each update, Lottie jumps to that frame (`goToAndStop`), creating the scrub effect.

- Implemented scroll-scrub using Lottie + GSAP, pinned the hero section, and generated the Lottie JSON from an image sequence via the `scripts/make-lottie.js` script.
