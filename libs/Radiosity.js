class Patch {
    constructor(poly) {
        this.poly = poly;

        // Geometrie
        this.p0 = new Vector3();
        this.p1 = new Vector3();
        this.p2 = new Vector3();
        this.p3 = new Vector3();

        this.center = poly.center;
        this.normal = poly.plane.normal;
        this.area = 0;
        this.coverage = 1.0;

        this.id = -1;

        // Radiosity Daten

        // Materialfarbe / Reflektion
        this.reflectivity = new Vector3(1, 1, 1);

        // Licht, das dieser Patch selbst aussendet
        this.emission = new Vector3(0, 0, 0);

        // gesamte gespeicherte Lichtenergie
        this.energy = new Vector3(0, 0, 0);

        // Energie, die noch verteilt werden muss
        this.unshotEnergy = new Vector3(0, 0, 0);

        // empfangenes Licht
        this.receivedEnergy = new Vector3(0, 0, 0);

        // Lightmap Position
        this.lightmapX = 0;
        this.lightmapY = 0;

        this.lightmapWidth = 0;
        this.lightmapHeight = 0;
    }

    ApplyToLightmap() {
        let poly = this.poly;
        let tex = poly._ltexture;

        for (let y = 0; y < this.lightmapHeight; y++) {
            for (let x = 0; x < this.lightmapWidth; x++) {
                let lx = poly._light_map_posx + this.lightmapX + x;
                let ly = poly._light_map_posy + this.lightmapY + y;

                let old = tex.GetPixel(lx, ly);

                let r = RGBToRed(old);
                let g = RGBToGreen(old);
                let b = RGBToBlue(old);

                r = Math.min(255, r + this.energy.x);
                g = Math.min(255, g + this.energy.y);
                b = Math.min(255, b + this.energy.z);

                tex.PutPixel(lx, ly, RGB(r, g, b));
            }
        }
        // tex.BlurRegion(poly._light_map_posx, poly._light_map_posy, poly._light_map_width, poly._light_map_height)
    }
}

class PatchGenerator {
    constructor(patchSize = 8) {
        this.patchSize = patchSize;
        this.patches = [];
    }

    Generate(polygons) {
        this.patches.length = 0;

        for (let poly of polygons) {
            this.ProcessPolygon(poly);
        }
        return this.patches;
    }

    ProcessPolygon(poly) {
        const width = poly._light_map_width;
        const height = poly._light_map_height;

        if (width <= 0 || height <= 0)
            return;

        const nx = Math.ceil(width / this.patchSize);
        const ny = Math.ceil(height / this.patchSize);

        for (let y = 0; y < ny; y++) {
            for (let x = 0; x < nx; x++) {

                let patch = new Patch(poly);

                patch.lightmapX = x * this.patchSize;
                patch.lightmapY = y * this.patchSize;

                patch.lightmapWidth = Math.min(
                    this.patchSize,
                    width - patch.lightmapX
                );

                patch.lightmapHeight = Math.min(
                    this.patchSize,
                    height - patch.lightmapY
                );

                this.CreatePatchGeometry(patch);

                // Patches, die außerhalb der eigentlichen Polygonfläche liegen
                // (coverage == 0), werden nicht mit in die Berechnung aufgenommen.
                // Sie würden sonst mit voller "area" Energie verteilen/empfangen,
                // obwohl sie visuell gar nicht zur Fläche gehören.
                if (patch.coverage <= 0)
                    continue;

                patch.id = this.patches.length;
                this.patches.push(patch);
            }
        }
    }

    CreatePatchGeometry(patch) {
        const poly = patch.poly;

        const lmWidth = poly._light_map_width;
        const lmHeight = poly._light_map_height;

        if (lmWidth <= 0 || lmHeight <= 0)
            return false;

        // Lightmap Pixel -> UV 0..1
        const u0 = patch.lightmapX / lmWidth;
        const v0 = patch.lightmapY / lmHeight;

        const u1 = (patch.lightmapX + patch.lightmapWidth) / lmWidth;
        const v1 = (patch.lightmapY + patch.lightmapHeight) / lmHeight;

        // Vier Eckpunkte im Raum erzeugen
        patch.p0 = poly.uvvector
            .add(poly.edge1.mul(u0))
            .add(poly.edge2.mul(v0));

        patch.p1 = poly.uvvector
            .add(poly.edge1.mul(u1))
            .add(poly.edge2.mul(v0));

        patch.p2 = poly.uvvector
            .add(poly.edge1.mul(u1))
            .add(poly.edge2.mul(v1));

        patch.p3 = poly.uvvector
            .add(poly.edge1.mul(u0))
            .add(poly.edge2.mul(v1));

        // Mittelpunkt
        patch.center = patch.p0
            .add(patch.p1)
            .add(patch.p2)
            .add(patch.p3)
            .mul(0.25);

        // Normale übernehmen
        patch.normal = new Vector3(poly.plane.normal);

        // Fläche berechnen
        patch.area =
            this.TriangleArea(patch.p0, patch.p1, patch.p2) +
            this.TriangleArea(patch.p0, patch.p2, patch.p3);

        patch.coverage = this.CalculateCoverage(patch);
        return true;
    }

    TriangleArea(a, b, c) {
        let ab = b.sub(a);
        let ac = c.sub(a);

        return ab.cross(ac).length() * 0.5;
    }

    CalculateCoverage(patch) {
        const samples = 4;

        let inside = 0;
        let total = samples * samples;

        for (let y = 0; y < samples; y++) {
            for (let x = 0; x < samples; x++) {

                let u = (x + 0.5) / samples;
                let v = (y + 0.5) / samples;

                // Bilineare Interpolation
                let a = patch.p0.mul(1 - u).add(patch.p1.mul(u));
                let b = patch.p3.mul(1 - u).add(patch.p2.mul(u));

                let pos = a.mul(1 - v).add(b.mul(v));

                if (patch.poly.PointInPolygon(pos)) {
                    inside++;
                }
            }
        }

        patch.coverage = inside / total;

        patch.energy = new Vector3(patch.emission);
        patch.unshotEnergy = new Vector3(patch.emission);

        return patch.coverage;
    }
}

class Radiosity {
    constructor(patches, polygons) {
        this.patches = patches;
        this.polygons = polygons;

        // Cache für Sichtbarkeit zwischen Patch-Paaren (statische Geometrie
        // vorausgesetzt). Vermeidet, dass CanSeePatch bei jedem TransferEnergy-
        // Aufruf erneut über alle Polygone iteriert.
        this.visibility = null;
    }

    // Muss aufgerufen werden, bevor Solve() läuft (oder Solve ruft es selbst
    // beim ersten Mal auf). Kostet einmalig O(n^2 * Polygone), spart danach
    // aber jede weitere Iteration diese Arbeit komplett ein.
    PrecomputeVisibility() {
        const n = this.patches.length;
        this.visibility = new Uint8Array(n * n);

        for (let i = 0; i < n; i++) {
            let a = this.patches[i];

            for (let j = i + 1; j < n; j++) {
                let b = this.patches[j];

                let visible =
                    a.poly !== b.poly &&
                    this.CanSeePatch(a, b, this.polygons);

                this.visibility[i * n + j] = visible ? 1 : 0;
                this.visibility[j * n + i] = visible ? 1 : 0;
            }
        }
    }

    IsVisible(a, b) {
        const n = this.patches.length;
        return this.visibility[a.id * n + b.id] === 1;
    }

    ComputeFormFactor(a, b) {
        let dir = b.center.sub(a.center);

        let distance = dir.length();

        if (distance < 0.0001)
            return 0;

        dir = dir.mul(1.0 / distance);

        let cosA = a.normal.dot(dir);
        let cosB = b.normal.dot(dir.mul(-1));

        // Rückseiten ignorieren
        if (cosA <= 0 || cosB <= 0)
            return 0;

        if (this.visibility) {
            if (!this.IsVisible(a, b))
                return 0;
        } else if (!this.CanSeePatch(a, b, this.polygons)) {
            return 0;
        }

        let F =
            (cosA * cosB * b.area) /
            (Math.PI * distance * distance);

        return Math.max(0, F);
    }

    CanSeePatch(a, b, polygons) {
        let start = a.center;
        let toTarget = b.center.sub(start);
        let dist = toTarget.length();

        if (dist < 0.0001)
            return true;

        // Gleicher Ansatz wie im bewährten BigLightMap.ProcessPoly:
        // Ray + Epsilon-Toleranz statt SegmentPolygonDistance.
        //
        // Grund: a.center und b.center liegen EXAKT auf der Oberfläche
        // ihrer jeweiligen Polygone. Ohne Epsilon führt das ständig zu
        // Selbstverdeckung durch numerisch "streifende" Treffer direkt am
        // Start- oder Zielpunkt (z.B. bei coplanaren/angrenzenden Flächen),
        // wodurch Patch-Paare fälschlich als unsichtbar füreinander gelten.
        let ray = new Ray(start, toTarget);
        const EPS = 1e-3;

        for (let poly of polygons) {
            // eigene Flächen ignorieren
            if (poly === a.poly || poly === b.poly)
                continue;

            let r = poly.RayPolygonDistance2(ray);

            if (r === -1)
                continue;

            if (r < EPS)
                continue;           // Treffer direkt am Ursprung ignorieren

            if (r < dist - EPS) {
                return false;        // echter Blocker vor dem Ziel
            }
        }

        return true;
    }

    TransferEnergy(source, target) {
        let F = this.ComputeFormFactor(source, target);

        if (F <= 0)
            return;

        // Reflektivität wird nur EINMAL angewendet (vorher wurde sie
        // versehentlich quadriert, weil sie zweimal multipliziert wurde).
        let amount = source.unshotEnergy
            .mul(F)
            .mul(target.reflectivity);

        target.receivedEnergy = target.receivedEnergy.add(amount);
        target.energy = target.energy.add(amount);
    }

    // Progressive-Refinement Radiosity.
    //
    // WICHTIG: Vorher wurde pro Iteration nur der EINE Patch mit der
    // meisten unshotEnergy als Quelle benutzt. Bei iterations=1 (Default)
    // hat das bedeutet, dass nur ein einziger Patch überhaupt jemals Licht
    // ausgesendet hat – alle anderen Lichtquellen/Patches wurden ignoriert.
    //
    // Jetzt: in jedem Schritt schießen ALLE Patches, deren unshotEnergy
    // über dem threshold liegt. Das ist sowohl korrekter (alle Lichter
    // tragen bei) als auch schneller (weniger Schritte bis zur Konvergenz).
    Solve(iterations = 200, threshold = 0.01) {

        if (!this.visibility) {
            this.PrecomputeVisibility();
        }

        for (let step = 0; step < iterations; step++) {

            let sources = [];
            for (let p of this.patches) {
                let e =
                    p.unshotEnergy.x +
                    p.unshotEnergy.y +
                    p.unshotEnergy.z;

                if (e > threshold) {
                    sources.push(p);
                }
            }

            if (sources.length === 0)
                break; // konvergiert, nichts mehr zu verteilen

            for (let source of sources) {
                for (let target of this.patches) {
                    if (target === source)
                        continue;

                    this.TransferEnergy(source, target);
                }

                // Quelle verbraucht
                source.unshotEnergy = new Vector3(0, 0, 0);
            }

            // empfangene Energie wird neue unshotEnergy für den nächsten Bounce
            for (let p of this.patches) {
                p.unshotEnergy = p.unshotEnergy.add(p.receivedEnergy);
                p.receivedEnergy = new Vector3(0, 0, 0);
            }
        }
    }

    ApplyToLightmap() {
        for (let patch of this.patches) {
            patch.ApplyToLightmap();
        }
    }

    InitializeLights(lights) {
        for (let light of lights) {
            let bestPatch = null;
            let bestDist = Infinity;

            for (let patch of this.patches) {
                let dist = patch.center.sub(light.pos).length();

                if (dist < bestDist) {
                    bestDist = dist;
                    bestPatch = patch;
                }
            }

            if (bestPatch) {
                let intensity = light.color.w;

                bestPatch.emission = bestPatch.emission.add(
                    new Vector3(
                        light.color.x * intensity,
                        light.color.y * intensity,
                        light.color.z * intensity
                    )
                );

                bestPatch.energy = bestPatch.emission;
                bestPatch.unshotEnergy = bestPatch.emission;
            }
        }
    }
}