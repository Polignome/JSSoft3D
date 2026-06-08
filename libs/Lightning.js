
class Light {
    constructor() {
        this.x = 0;
    }
}


function applyPointLight(
    light,

    width,
    height,

    zBuffer,

    posX,
    posY,
    posZ,

    normalX,
    normalY,
    normalZ,

    lightBuffer
) {

    const lx = light.x;
    const ly = light.y;
    const lz = light.z;

    const radius = light.radius;
    const intensity = light.intensity;

    const radiusSq = radius * radius;

    const pixelCount = width * height;

    for (let i = 0; i < pixelCount; i++) {

        // Kein Pixel gezeichnet?
        if (zBuffer[i] === Infinity)
            continue;

        //-----------------------------------------
        // Weltposition
        //-----------------------------------------

        const px = posX[i];
        const py = posY[i];
        const pz = posZ[i];

        //-----------------------------------------
        // Lichtvektor
        //-----------------------------------------

        let dx = lx - px;
        let dy = ly - py;
        let dz = lz - pz;

        const distSq = dx * dx + dy * dy + dz * dz;

        // Außerhalb Radius
        if (distSq > radiusSq)
            continue;

        const dist = Math.sqrt(distSq);

        //-----------------------------------------
        // Normalisieren
        //-----------------------------------------

        dx /= dist;
        dy /= dist;
        dz /= dist;

        //-----------------------------------------
        // Normale
        //-----------------------------------------

        const nx = normalX[i];
        const ny = normalY[i];
        const nz = normalZ[i];

        //-----------------------------------------
        // Lambert
        //-----------------------------------------

        let NdotL =
            nx * dx +
            ny * dy +
            nz * dz;

        if (NdotL < 0)
            NdotL = 0;

        //-----------------------------------------
        // Distanzabfall
        //-----------------------------------------

        const attenuation =
            1.0 - (distSq / radiusSq);

        //-----------------------------------------
        // Finale Intensität
        //-----------------------------------------

        const lighting =
            NdotL *
            attenuation *
            intensity;

        //-----------------------------------------
        // Akkumulieren
        //-----------------------------------------

        lightBuffer[i] += lighting;
    }
}
