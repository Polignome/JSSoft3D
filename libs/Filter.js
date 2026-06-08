// ============================================================
// 1-Bit Monochrome Floyd-Steinberg Dither
// ============================================================

// ============================================================
// Diffusion helper
// ============================================================

function diffuseMono(
    buffer,
    width,
    height,
    x,
    y,
    error,
    factor
) {
    if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height
    ) {
        return;
    }

    buffer[y * width + x] +=
        error * factor;
}

function ditherMonochrome(
    graphicBuffer,
    width,
    height,
    options = {}
) {
    const enableNoise =
        options.enableNoise ?? false;

    const noiseAmount =
        options.noiseAmount ?? 0;

    // --------------------------------------------------------
    // grayscale float buffer
    // --------------------------------------------------------

    const lum = new Float32Array(width * height);

    // --------------------------------------------------------
    // RGB -> luminance
    // --------------------------------------------------------

    for (let i = 0; i < graphicBuffer.length; i++) {
        const c = graphicBuffer[i];

        const r = RGBToRed(c);
        const g = RGBToGreen(c);
        const b = RGBToBlue(c);

        // perceptual luminance
        lum[i] =
            r * 0.299 +
            g * 0.587 +
            b * 0.114;
    }

    // --------------------------------------------------------
    // dithering
    // --------------------------------------------------------

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            let oldPixel = lum[idx];

            // ------------------------------------------------
            // optional noise
            // ------------------------------------------------

            if (enableNoise) {
                oldPixel +=
                    (Math.random() - 0.5) *
                    noiseAmount;
            }

            // ------------------------------------------------
            // quantize to black or white
            // ------------------------------------------------

            const newPixel =
                oldPixel < 128 ? 0 : 255;

            // ------------------------------------------------
            // write back
            // ------------------------------------------------

            graphicBuffer[idx] =
                newPixel === 0
                    ? RGB(0, 0, 0)
                    : RGB(255, 255, 255);

            // ------------------------------------------------
            // error
            // ------------------------------------------------

            const error =
                oldPixel - newPixel;

            // ------------------------------------------------
            // diffuse error
            // Floyd-Steinberg
            // ------------------------------------------------

            diffuseMono(
                lum,
                width,
                height,
                x + 1,
                y,
                error,
                7 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x - 1,
                y + 1,
                error,
                3 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x,
                y + 1,
                error,
                5 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x + 1,
                y + 1,
                error,
                1 / 16
            );
        }
    }
}


function ditherMonochromeZ(
    graphicBuffer,
    zBuffer,
    width,
    height,
    options = {}
) {
    const enableNoise =
        options.enableNoise ?? false;

    const noiseAmount =
        options.noiseAmount ?? 0;

    // --------------------------------------------------------
    // grayscale float buffer
    // --------------------------------------------------------

    const lum = new Float32Array(width * height);

    // --------------------------------------------------------
    // RGB -> luminance
    // --------------------------------------------------------

    for (let i = 0; i < graphicBuffer.length; i++) {
        const c = graphicBuffer[i];

        const r = RGBToRed(c);
        const g = RGBToGreen(c);
        const b = RGBToBlue(c);

        // perceptual luminance
        lum[i] =
            r * 0.299 +
            g * 0.587 +
            b * 0.114;
    }

    // --------------------------------------------------------
    // dithering
    // --------------------------------------------------------

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            let oldPixel = lum[idx];

            // ------------------------------------------------
            // optional noise
            // ------------------------------------------------

            if (enableNoise) {
                oldPixel +=
                    (zBuffer[idx]) *
                    noiseAmount;
                oldPixel = Math.min(oldPixel, 255);

            }

            // ------------------------------------------------
            // quantize to black or white
            // ------------------------------------------------

            const newPixel =
                oldPixel < 128 ? 0 : 255;

            // ------------------------------------------------
            // write back
            // ------------------------------------------------

            graphicBuffer[idx] =
                newPixel === 0
                    ? RGB(0, 0, 0)
                    : RGB(255, 255, 255);

            // ------------------------------------------------
            // error
            // ------------------------------------------------

            const error =
                oldPixel - newPixel;

            // ------------------------------------------------
            // diffuse error
            // Floyd-Steinberg
            // ------------------------------------------------

            diffuseMono(
                lum,
                width,
                height,
                x + 1,
                y,
                error,
                7 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x - 1,
                y + 1,
                error,
                3 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x,
                y + 1,
                error,
                5 / 16
            );

            diffuseMono(
                lum,
                width,
                height,
                x + 1,
                y + 1,
                error,
                1 / 16
            );
        }
    }
}



// ============================================================
// Depth Based Pixelation
// with configurable depth range
// ============================================================

function depthPixelate(
    colorBuffer,
    zBuffer,
    width,
    height,
    options = {}
) {
    const nearBlock =
        options.nearBlock ?? 1;

    const farBlock =
        options.farBlock ?? 8;

    // --------------------------------------------
    // NEW
    // --------------------------------------------

    const startDepth =
        options.startDepth ?? 0.0001;

    const endDepth =
        options.endDepth ?? 1.0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            const z = zBuffer[idx];

            // ------------------------------------
            // before scaling range
            // ------------------------------------

            if (z < startDepth) {
                continue;
            }

            // ------------------------------------
            // normalize depth range
            // ------------------------------------

            let t =
                (z - startDepth) /
                (endDepth - startDepth);
            t = Math.pow(t, 0.05);
            // clamp
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            // ------------------------------------
            // compute block size
            // ------------------------------------

            const blockSize =
                Math.max(
                    1,
                    Math.floor(
                        nearBlock +
                        (farBlock - nearBlock) * t
                    )
                );

            // ------------------------------------
            // process only block origins
            // ------------------------------------

            if (
                x % blockSize !== 0 ||
                y % blockSize !== 0
            ) {
                continue;
            }

            const color = colorBuffer[idx];

            // ------------------------------------
            // fill block
            // ------------------------------------

            for (let by = 0; by < blockSize; by++) {
                const py = y + by;

                if (py >= height)
                    continue;

                for (let bx = 0; bx < blockSize; bx++) {
                    const px = x + bx;

                    if (px >= width)
                        continue;

                    colorBuffer[
                        py * width + px
                    ] = color;
                }
            }
        }
    }
}
