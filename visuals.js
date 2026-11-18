// 背景のニューラルネットワーク、ヒーローの 3D の脳、研究テーマのタイルを Canvas で描く。
// script.js の後に読み込まれ、reduceMotion / finePointer / pointer を共有する。

const VIOLET = '167, 139, 250';
const CYAN = '103, 232, 249';

function fitCanvas(canvas, ctx, width, height) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// 脳の形を毎回同じにするための、シード付きの乱数
function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// draw(dt, time) を fps 上限付きで呼ぶループ。背面タブや画面外では止めて電池を食わないようにする
function createLoop(draw, fps = 60) {
    const interval = 1000 / fps;
    let rafId = null;
    let last = 0;
    let started = false;
    let onScreen = true;

    function frame(now) {
        rafId = requestAnimationFrame(frame);
        if (last && now - last < interval - 2) {
            return;
        }
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / fps;
        last = now;
        draw(dt, now / 1000);
    }

    function sync() {
        const shouldRun = started && onScreen && !document.hidden;
        if (shouldRun && rafId === null) {
            last = 0;
            rafId = requestAnimationFrame(frame);
        } else if (!shouldRun && rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    document.addEventListener('visibilitychange', sync);
    return {
        start() {
            started = true;
            sync();
        },
        setOnScreen(value) {
            onScreen = value;
            sync();
        },
    };
}

function pauseWhenOffscreen(element, loop) {
    if (!('IntersectionObserver' in window)) {
        return;
    }
    const root = document.querySelector('.scroll-wrapper');
    new IntersectionObserver(entries => {
        entries.forEach(entry => loop.setOnScreen(entry.isIntersecting));
    }, { root, rootMargin: '80px' }).observe(element);
}

// --- 背景：漂うニューロンが信号を伝え合う。カーソルを電極に見立てて近くを発火させる ---
function setupNeuralField() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext('2d');
    const LINK = 140;
    const nodes = [];
    const pulses = [];
    let width = 0;
    let height = 0;

    function makeNode() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16,
            energy: 0,
            refractory: 0,
        };
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        fitCanvas(canvas, ctx, width, height);
        // 画面の広さに合わせてニューロン数を決める（スマホは少なめ）
        const target = Math.round(Math.min(Math.max((width * height) / 15000, 34), 110));
        while (nodes.length < target) {
            nodes.push(makeNode());
        }
        nodes.length = target;
        pulses.length = 0;
    }

    function fire(node, depth) {
        if (node.refractory > 0) {
            return;
        }
        node.energy = 1;
        node.refractory = 0.9;
        if (depth > 4 || pulses.length > 240) {
            return;
        }
        nodes.forEach(other => {
            if (other !== node && Math.hypot(other.x - node.x, other.y - node.y) < LINK && Math.random() < 0.6) {
                pulses.push({ from: node, to: other, t: 0, depth: depth + 1 });
            }
        });
    }

    function stimulate(x, y, radius) {
        nodes.forEach(node => {
            if (Math.hypot(node.x - x, node.y - y) < radius) {
                fire(node, 0);
            }
        });
    }

    function step(dt) {
        nodes.forEach(node => {
            node.x += node.vx * dt;
            node.y += node.vy * dt;
            if (node.x < -20) {
                node.x = width + 20;
            } else if (node.x > width + 20) {
                node.x = -20;
            }
            if (node.y < -20) {
                node.y = height + 20;
            } else if (node.y > height + 20) {
                node.y = -20;
            }
            node.energy = Math.max(0, node.energy - dt * 1.5);
            node.refractory = Math.max(0, node.refractory - dt);
        });

        for (let index = pulses.length - 1; index >= 0; index--) {
            const pulse = pulses[index];
            pulse.t += dt * 2.4;
            if (pulse.t >= 1) {
                pulses.splice(index, 1);
                if (Math.random() < 0.5) {
                    fire(pulse.to, pulse.depth);
                }
            }
        }

        if (Math.random() < dt * 0.7) {
            fire(nodes[Math.floor(Math.random() * nodes.length)], 0);
        }
        if (pointer.active && Math.random() < dt * 2.5) {
            stimulate(pointer.x, pointer.y, 80);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance >= LINK) {
                    continue;
                }
                const closeness = 1 - distance / LINK;
                const glow = Math.max(a.energy, b.energy);
                ctx.strokeStyle = `rgba(${VIOLET}, ${(closeness * (0.16 + glow * 0.5)).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        if (pointer.active && finePointer) {
            nodes.forEach(node => {
                const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
                if (distance < 170) {
                    ctx.strokeStyle = `rgba(${CYAN}, ${((1 - distance / 170) * 0.45).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.stroke();
                }
            });
        }

        ctx.fillStyle = `rgba(${CYAN}, 0.95)`;
        pulses.forEach(pulse => {
            ctx.beginPath();
            ctx.arc(pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.t, pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.t, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        nodes.forEach(node => {
            if (node.energy > 0.05) {
                ctx.fillStyle = `rgba(${CYAN}, ${(node.energy * 0.22).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 3 + node.energy * 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(236, 254, 255, ${(0.5 + node.energy * 0.5).toFixed(3)})`;
            } else {
                ctx.fillStyle = `rgba(${VIOLET}, 0.7)`;
            }
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1.5 + node.energy * 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    resize();
    window.addEventListener('resize', () => {
        resize();
        if (reduceMotion) {
            draw();
        }
    });
    // クリックした場所のニューロンをまとめて発火させる（キーボードによる click は座標がないので除く）
    window.addEventListener('click', event => {
        if (event.detail !== 0) {
            stimulate(event.clientX, event.clientY, 190);
        }
    });

    if (reduceMotion) {
        draw();
        return;
    }
    createLoop(dt => {
        step(dt);
        draw();
    }, 30).start();
}

// --- ヒーロー：点群で作った 3D の脳。ドラッグで回転し、触れた場所から信号が広がる ---

// 世界モデル（V: 知覚・M: 予測・C: 行動）を脳の部位になぞらえたラベル
const BRAIN_LABELS = [
    { anchor: [0.3, 0.14, -0.9], ja: ['視覚野 ≈ V', '知覚を潜在表現へ'], en: ['Visual cortex ≈ V', 'perception → latent'] },
    { anchor: [0.28, 0.34, 0.86], ja: ['前頭前野 ≈ M', '世界モデルで未来を予測'], en: ['Prefrontal ≈ M', 'predict the future'] },
    { anchor: [0.32, 0.6, 0], ja: ['運動野 ≈ C', '行動を選ぶ'], en: ['Motor cortex ≈ C', 'choose actions'] },
];

function randomUnitVector(random) {
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - u * u);
    return [ring * Math.cos(theta), u, ring * Math.sin(theta)];
}

// x: 左右, y: 上下, z: 前(+)後(-)。part は 0: 大脳, 1: 小脳, 2: 脳幹
function buildBrainPoints(random, density) {
    const points = [];
    const perHemisphere = Math.round(320 * density);
    [-1, 1].forEach(side => {
        let made = 0;
        while (made < perHemisphere) {
            const [nx, ny, nz] = randomUnitVector(random);
            // 反対側の半球に面する内側は間引き、左右の間の溝（大脳縦裂）に見せる
            if (nx * side < -0.6) {
                continue;
            }
            // 脳回のようなうねり
            const bump = 1 + 0.07 * Math.sin(nx * 11 + nz * 7) * Math.sin(ny * 9 + nz * 5);
            let y = ny * 0.66 * bump;
            // 底面は平らにする
            if (y < -0.3) {
                y = -0.3 + (y + 0.3) * 0.35;
            }
            points.push({ x: side * 0.44 + nx * 0.42 * bump, y, z: nz * bump, part: 0 });
            made++;
        }
    });

    // 小脳：後ろ下にある、横縞の入った塊
    for (let index = 0; index < Math.round(110 * density); index++) {
        const [nx, ny, nz] = randomUnitVector(random);
        points.push({ x: nx * 0.48, y: Math.round((-0.42 + ny * 0.2) * 28) / 28, z: -0.68 + nz * 0.28, part: 1 });
    }

    // 脳幹
    for (let index = 0; index < Math.round(40 * density); index++) {
        const t = random();
        const angle = random() * Math.PI * 2;
        points.push({ x: Math.cos(angle) * 0.1, y: -0.38 - t * 0.6, z: -0.3 - t * 0.12 + Math.sin(angle) * 0.1, part: 2 });
    }
    return points;
}

// 同じ部位の中で近い k 個の点どうしをつなぐ
function connectNearest(points, k) {
    const neighbors = points.map(() => []);
    const edges = [];
    const seen = new Set();
    points.forEach((p, i) => {
        const nearest = [];
        points.forEach((q, j) => {
            if (i === j || p.part !== q.part) {
                return;
            }
            const distance = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2;
            if (nearest.length < k || distance < nearest[nearest.length - 1][0]) {
                nearest.push([distance, j]);
                nearest.sort((a, b) => a[0] - b[0]);
                nearest.length = Math.min(nearest.length, k);
            }
        });
        nearest.forEach(([, j]) => {
            const key = i < j ? i * 100000 + j : j * 100000 + i;
            if (!seen.has(key)) {
                seen.add(key);
                edges.push([i, j]);
                neighbors[i].push(j);
                neighbors[j].push(i);
            }
        });
    });
    return { neighbors, edges };
}

function setupBrain() {
    const canvas = document.getElementById('brain-canvas');
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext('2d');
    const points = buildBrainPoints(seededRandom(7), window.innerWidth < 640 ? 0.6 : 1);
    const { neighbors, edges } = connectNearest(points, 3);
    const count = points.length;
    const sx = new Float32Array(count);
    const sy = new Float32Array(count);
    const sz = new Float32Array(count);
    const activation = new Float32Array(count);
    let queue = [];
    let size = 0;
    let rotY = -0.9;
    let spin = 0;
    let tilt = 0;
    let tiltTarget = 0;
    let elapsed = 0;
    let lastHoverFire = 0;
    let nextSpontaneous = 0.4;
    const drag = { active: false, x: 0, moved: 0 };
    const view = { cosY: 1, sinY: 0, cosX: 1, sinX: 0, cx: 0, cy: 0, scale: 1 };

    function resize() {
        const rect = canvas.getBoundingClientRect();
        size = Math.min(rect.width, rect.height);
        fitCanvas(canvas, ctx, rect.width, rect.height);
    }

    function updateView() {
        const pitch = 0.2 + tilt;
        view.cosY = Math.cos(rotY);
        view.sinY = Math.sin(rotY);
        view.cosX = Math.cos(pitch);
        view.sinX = Math.sin(pitch);
        view.cx = size / 2;
        view.cy = size * 0.53;
        view.scale = size * 0.34;
    }

    // y 軸まわりに回し、少し上から見下ろすように x 軸まわりに傾けてから透視投影する
    function projectPoint(x0, y0, z0) {
        const x = x0 * view.cosY + z0 * view.sinY;
        const z1 = -x0 * view.sinY + z0 * view.cosY;
        const y = y0 * view.cosX - z1 * view.sinX;
        const z = y0 * view.sinX + z1 * view.cosX;
        const perspective = 3.2 / (3.2 - z);
        return { x: view.cx + x * view.scale * perspective, y: view.cy - y * view.scale * perspective, z };
    }

    function projectAll() {
        updateView();
        for (let i = 0; i < count; i++) {
            const projected = projectPoint(points[i].x, points[i].y, points[i].z);
            sx[i] = projected.x;
            sy[i] = projected.y;
            sz[i] = projected.z;
        }
    }

    function trigger(index, generation, delay) {
        if (queue.length < 1200) {
            queue.push({ index, generation, at: elapsed + delay });
        }
    }

    // 発火した点から隣へ少し遅れて信号を伝え、世代が進むほど伝わりにくくする
    function propagate() {
        const due = [];
        const waiting = [];
        queue.forEach(item => (item.at <= elapsed ? due : waiting).push(item));
        queue = waiting;
        due.forEach(item => {
            if (activation[item.index] > 0.3) {
                return;
            }
            activation[item.index] = 1;
            if (item.generation >= 8) {
                return;
            }
            neighbors[item.index].forEach(next => {
                if (Math.random() < 0.82 - item.generation * 0.07) {
                    trigger(next, item.generation + 1, 0.05 + Math.random() * 0.06);
                }
            });
        });
    }

    function nearestPoint(x, y, maxDistance) {
        let best = -1;
        let bestDistance = maxDistance * maxDistance;
        for (let i = 0; i < count; i++) {
            // 奥側の点には触れられないようにする
            if (sz[i] < -0.2) {
                continue;
            }
            const distance = (sx[i] - x) ** 2 + (sy[i] - y) ** 2;
            if (distance < bestDistance) {
                bestDistance = distance;
                best = i;
            }
        }
        return best;
    }

    function step(dt) {
        elapsed += dt;
        if (!drag.active) {
            // 横顔（脳らしい形）が見える向きではゆっくり、それ以外は少し速く回す
            const profile = Math.abs(Math.sin(rotY));
            rotY += (0.32 - 0.2 * profile + spin) * dt;
            spin *= Math.pow(0.04, dt);
        }
        tilt += (tiltTarget - tilt) * Math.min(1, dt * 4);
        for (let i = 0; i < count; i++) {
            activation[i] = Math.max(0, activation[i] - dt * 1.3);
        }
        propagate();
        // ときどき自発的に発火させ、信号が脳の中を伝わっていく様子を見せる
        nextSpontaneous -= dt;
        if (nextSpontaneous <= 0) {
            trigger(Math.floor(Math.random() * count), 1, 0);
            nextSpontaneous = 0.6 + Math.random() * 0.8;
        }
    }

    function drawLabels(dot) {
        const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
        const titleSize = Math.max(10, Math.round(size / 40));
        BRAIN_LABELS.forEach(label => {
            const anchor = projectPoint(label.anchor[0], label.anchor[1], label.anchor[2]);
            // 手前を向いているときだけ表示し、裏へ回り込むにつれて薄くする
            const alpha = Math.max(0, Math.min(1, (anchor.z + 0.1) * 2.5));
            if (alpha <= 0.02) {
                return;
            }
            const [title, sub] = label[lang];
            ctx.font = `600 ${titleSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            const textWidth = Math.max(ctx.measureText(title).width, ctx.measureText(sub).width * 0.9);
            let direction = anchor.x >= size / 2 ? 1 : -1;
            const reach = size * 0.14 + 4 + textWidth;
            if (anchor.x + direction * reach > size - 4 || anchor.x + direction * reach < 4) {
                direction = -direction;
            }
            const elbowX = anchor.x + direction * size * 0.08;
            const elbowY = anchor.y - size * 0.07;
            const endX = elbowX + direction * size * 0.06;

            ctx.strokeStyle = `rgba(${CYAN}, ${(0.75 * alpha).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(anchor.x, anchor.y);
            ctx.lineTo(elbowX, elbowY);
            ctx.lineTo(endX, elbowY);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(anchor.x, anchor.y, dot * 2 + Math.sin(elapsed * 4) * dot * 0.8, 0, Math.PI * 2);
            ctx.stroke();

            ctx.textAlign = direction > 0 ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            const textX = endX + direction * 4;
            ctx.fillStyle = `rgba(236, 254, 255, ${alpha.toFixed(3)})`;
            ctx.fillText(title, textX, elbowY - titleSize * 0.55);
            ctx.font = `${Math.round(titleSize * 0.9)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.fillStyle = `rgba(196, 181, 253, ${(0.9 * alpha).toFixed(3)})`;
            ctx.fillText(sub, textX, elbowY + titleSize * 0.65);
        });
    }

    function draw() {
        ctx.clearRect(0, 0, size, size);
        const dot = Math.max(1.1, size / 320);

        // 辺は奥行きで 4 段階の濃さに分け、まとめて描いて負荷を抑える
        const bands = [[], [], [], []];
        const firing = [];
        edges.forEach(([a, b]) => {
            const glow = Math.min(activation[a], activation[b]);
            if (glow > 0.15) {
                firing.push([a, b, glow]);
                return;
            }
            const band = Math.max(0, Math.min(3, Math.floor(((sz[a] + sz[b]) / 2 + 1.1) / 0.6)));
            bands[band].push(a, b);
        });
        ctx.lineWidth = 0.7;
        bands.forEach((list, band) => {
            if (list.length === 0) {
                return;
            }
            ctx.strokeStyle = `rgba(${VIOLET}, ${0.05 + band * 0.07})`;
            ctx.beginPath();
            for (let i = 0; i < list.length; i += 2) {
                ctx.moveTo(sx[list[i]], sy[list[i]]);
                ctx.lineTo(sx[list[i + 1]], sy[list[i + 1]]);
            }
            ctx.stroke();
        });
        ctx.lineWidth = 1.3;
        firing.forEach(([a, b, glow]) => {
            ctx.strokeStyle = `rgba(${CYAN}, ${(glow * 0.9).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(sx[a], sy[a]);
            ctx.lineTo(sx[b], sy[b]);
            ctx.stroke();
        });

        for (let i = 0; i < count; i++) {
            const level = activation[i];
            if (level > 0.05) {
                ctx.fillStyle = `rgba(${CYAN}, ${(level * 0.25).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(sx[i], sy[i], dot * (2 + level * 4), 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(236, 254, 255, ${(0.4 + level * 0.6).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(sx[i], sy[i], dot * (1 + level), 0, Math.PI * 2);
                ctx.fill();
            } else {
                const depth = Math.max(0, Math.min(1, (sz[i] + 1.1) / 2.2));
                ctx.fillStyle = `rgba(${VIOLET}, ${(0.15 + depth * 0.65).toFixed(3)})`;
                ctx.fillRect(sx[i] - dot * 0.8, sy[i] - dot * 0.8, dot * 1.6, dot * 1.6);
            }
        }

        drawLabels(dot);
    }

    function render() {
        projectAll();
        draw();
    }

    resize();
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            resize();
            render();
        }).observe(canvas);
    }

    if (reduceMotion) {
        render();
        // 言語を切り替えたらラベルを描き直す
        new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        return;
    }

    canvas.addEventListener('pointerdown', event => {
        drag.active = true;
        drag.x = event.clientX;
        drag.moved = 0;
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add('is-dragging');
    });

    canvas.addEventListener('pointermove', event => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (drag.active) {
            const dx = event.clientX - drag.x;
            drag.x = event.clientX;
            drag.moved += Math.abs(dx);
            rotY += dx * 0.01;
            spin = dx * 0.08;
            return;
        }
        if (event.pointerType === 'mouse') {
            tiltTarget = (y / rect.height - 0.5) * 0.5;
            if (elapsed - lastHoverFire > 0.12) {
                const index = nearestPoint(x, y, 26);
                if (index >= 0) {
                    trigger(index, 0, 0);
                    lastHoverFire = elapsed;
                }
            }
        }
    });

    canvas.addEventListener('pointerup', event => {
        if (!drag.active) {
            return;
        }
        drag.active = false;
        canvas.classList.remove('is-dragging');
        // ほとんど動かさずに離したらクリックとみなし、その場所から強く信号を広げる
        if (drag.moved < 6) {
            const rect = canvas.getBoundingClientRect();
            const index = nearestPoint(event.clientX - rect.left, event.clientY - rect.top, 60);
            const origin = index >= 0 ? index : Math.floor(Math.random() * count);
            trigger(origin, 0, 0);
            neighbors[origin].forEach(next => trigger(next, 0, 0.03));
        }
    });

    canvas.addEventListener('pointercancel', () => {
        drag.active = false;
        canvas.classList.remove('is-dragging');
    });

    canvas.addEventListener('pointerleave', () => {
        tiltTarget = 0;
    });

    const loop = createLoop(dt => {
        step(dt);
        render();
    }, 60);
    pauseWhenOffscreen(canvas, loop);
    loop.start();
}

// --- 研究テーマのタイル：脳波・世界モデル・量子ビット・AI エージェント・フルダイブ ---

function paintEeg(ctx, w, h, s) {
    ctx.clearRect(0, 0, w, h);
    const channels = 6;
    const gap = (h * 0.8) / channels;
    ctx.lineWidth = 1.2;
    for (let channel = 0; channel < channels; channel++) {
        const base = h * 0.08 + gap * (channel + 0.5);
        const amplitude = gap * (0.28 + s.hover * 0.3);
        ctx.strokeStyle = channel % 2 ? `rgba(${VIOLET}, 0.8)` : `rgba(${CYAN}, 0.75)`;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
            const phase = x * 0.045 - s.t * 2.2;
            let value = Math.sin(phase * 1.7 + channel * 1.3) * 0.5 + Math.sin(phase * 4.3 + channel * 2.1) * 0.3 + Math.sin(phase * 9.7 + channel) * 0.15;
            // ホバー中は鋭いスパイクを混ぜ、刺激に反応しているように見せる
            if (s.hover > 0.01) {
                value += s.hover * Math.pow(Math.max(0, Math.sin(phase * 0.9 + channel * 0.7)), 18) * 2.2;
            }
            if (x === 0) {
                ctx.moveTo(x, base - value * amplitude);
            } else {
                ctx.lineTo(x, base - value * amplitude);
            }
        }
        ctx.stroke();
    }
}

function paintWorldModel(ctx, w, h, s) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(${VIOLET}, 0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 10; x < w; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    for (let y = 10; y < h; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    const path = t => ({ x: w * (0.5 + 0.36 * Math.sin(t * 0.9)), y: h * (0.4 + 0.24 * Math.sin(t * 1.4 + 1)) });
    const now = s.t * 0.8;

    // 実際にたどった軌跡
    ctx.strokeStyle = `rgba(${VIOLET}, 0.75)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 35; k++) {
        const point = path(now - 1.4 + k * 0.04);
        if (k === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.stroke();

    // 世界モデルが想像する未来。ホバーすると複数の可能性（ロールアウト）に枝分かれする
    const rollouts = 1 + Math.round(s.hover * 4);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (let r = 0; r < rollouts; r++) {
        ctx.strokeStyle = `rgba(${CYAN}, ${r === 0 ? 0.9 : 0.45})`;
        ctx.beginPath();
        for (let k = 0; k <= 30; k++) {
            const ahead = k * 0.04;
            const point = path(now + ahead);
            const drift = r === 0 ? 0 : ahead * ahead * 40;
            const x = point.x + Math.sin(r * 2.1 + ahead * 3) * drift;
            const y = point.y + Math.cos(r * 1.7 + ahead * 2) * drift;
            if (k === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // 先の予測ほど不確かになる
    for (let k = 1; k <= 3; k++) {
        const point = path(now + k * 0.4);
        ctx.strokeStyle = `rgba(${CYAN}, ${0.4 - k * 0.09})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 + k * 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    const agent = path(now);
    ctx.fillStyle = `rgba(${VIOLET}, 0.35)`;
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ede9fe';
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
}

function paintQubit(ctx, w, h, s) {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.4;
    const r = Math.min(w, h) * 0.28;

    ctx.strokeStyle = `rgba(${VIOLET}, 0.55)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.3, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(${CYAN}, 0.9)`;
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('|0⟩', cx, cy - r - 6);
    ctx.fillText('|1⟩', cx, cy + r + 14);

    // ホバーした瞬間に「観測」し、状態が |0⟩ か |1⟩ に収縮してから元の歳差運動に戻る
    if (s.hoverTarget > 0 && !s.wasHovered) {
        s.collapse = 1;
        s.outcome = Math.random() < 0.5 ? 0 : 1;
    }
    s.wasHovered = s.hoverTarget > 0;
    s.collapse = Math.max(0, (s.collapse || 0) - s.dt / 1.4);

    let theta = 1.2 + Math.sin(s.t * 0.7) * 0.6;
    const phi = s.t * 1.5;
    const snap = Math.min(1, s.collapse * 3);
    theta += ((s.outcome ? Math.PI : 0) - theta) * snap;

    const tipX = cx + r * Math.sin(theta) * Math.cos(phi);
    const tipY = cy - r * Math.cos(theta) + r * 0.3 * Math.sin(theta) * Math.sin(phi);
    ctx.strokeStyle = `rgba(${CYAN}, 0.95)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.fillStyle = `rgba(${CYAN}, 0.3)`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 8 + snap * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ecfeff';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
    ctx.fill();
}

// 中央の人と、周りを回る AI エージェントが双方向にメッセージをやり取りする（人と AI の協働）
function paintAgents(ctx, w, h, s) {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.4;
    const radiusX = Math.min(w * 0.36, h * 0.62);
    const radiusY = h * 0.26;
    const agentCount = 5;
    s.orbit = (s.orbit || 0) + s.dt * (0.3 + s.hover * 0.5);

    const agents = [];
    for (let index = 0; index < agentCount; index++) {
        const angle = s.orbit + (index / agentCount) * Math.PI * 2;
        agents.push({ x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY });
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${VIOLET}, 0.35)`;
    ctx.beginPath();
    agents.forEach(agent => {
        ctx.moveTo(cx, cy);
        ctx.lineTo(agent.x, agent.y);
    });
    ctx.stroke();

    // ホバー中はエージェントどうしもつながり、協調して動く
    if (s.hover > 0.05) {
        ctx.strokeStyle = `rgba(${CYAN}, ${(0.4 * s.hover).toFixed(3)})`;
        ctx.beginPath();
        agents.forEach((agent, index) => {
            const next = agents[(index + 1) % agentCount];
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(next.x, next.y);
        });
        ctx.stroke();
    }

    // 人 → AI（紫）と AI → 人（水色）のメッセージが行き交う
    const flow = s.t * (0.7 + s.hover * 0.9);
    agents.forEach((agent, index) => {
        const outbound = (flow + index * 0.37) % 1;
        const inbound = (flow + index * 0.37 + 0.5) % 1;
        ctx.fillStyle = `rgba(${VIOLET}, 0.95)`;
        ctx.beginPath();
        ctx.arc(cx + (agent.x - cx) * outbound, cy + (agent.y - cy) * outbound, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${CYAN}, 0.95)`;
        ctx.beginPath();
        ctx.arc(agent.x + (cx - agent.x) * inbound, agent.y + (cy - agent.y) * inbound, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // AI エージェントは四角いチップ、人は丸い頭と肩のシルエットで描き分ける
    agents.forEach(agent => {
        ctx.fillStyle = `rgba(${CYAN}, 0.18)`;
        ctx.fillRect(agent.x - 8, agent.y - 8, 16, 16);
        ctx.strokeStyle = `rgba(${CYAN}, 0.9)`;
        ctx.strokeRect(agent.x - 6, agent.y - 6, 12, 12);
        ctx.fillStyle = '#ecfeff';
        ctx.fillRect(agent.x - 1.5, agent.y - 1.5, 3, 3);
    });

    ctx.strokeStyle = `rgba(${VIOLET}, 0.6)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 13 + Math.sin(s.t * 2) * 1.5 + s.hover * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ede9fe';
    ctx.beginPath();
    ctx.arc(cx, cy - 3.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy + 6.5, 6, Math.PI, Math.PI * 2);
    ctx.fill();
}

// 地平線のポータルへ向かってグリッドの上を進んでいく（脳と仮想世界をつなぐフルダイブ）
function paintDive(ctx, w, h, s) {
    ctx.clearRect(0, 0, w, h);
    const horizon = h * 0.46;
    const vx = w / 2;
    s.travel = (s.travel || 0) + s.dt * (0.35 + s.hover * 1.4);

    for (let index = 0; index < 30; index++) {
        const x = (Math.sin(index * 91.7) * 0.5 + 0.5) * w;
        const y = (Math.sin(index * 37.3) * 0.5 + 0.5) * horizon * 0.9;
        ctx.fillStyle = `rgba(236, 254, 255, ${(0.25 + 0.3 * Math.sin(s.t * 2 + index)).toFixed(3)})`;
        ctx.fillRect(x, y, 1.3, 1.3);
    }

    // 地平線に開くポータル（脳と仮想世界をつなぐ入口）
    const radius = h * 0.2 * (1 + Math.sin(s.t * 2) * 0.06 + s.hover * 0.15);
    const glow = ctx.createRadialGradient(vx, horizon, 0, vx, horizon, radius * 1.6);
    glow.addColorStop(0, `rgba(${CYAN}, 0.45)`);
    glow.addColorStop(1, `rgba(${CYAN}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(${CYAN}, 0.85)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(vx, horizon, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 手前へ流れてくる床のグリッド
    ctx.strokeStyle = `rgba(${VIOLET}, 0.55)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let index = -8; index <= 8; index++) {
        ctx.moveTo(vx, horizon);
        ctx.lineTo(vx + index * w * 0.16, h);
    }
    const rows = 9;
    for (let index = 0; index < rows; index++) {
        const depth = (index + (s.travel % 1)) / rows;
        const y = horizon + (h - horizon) * depth * depth;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    // ホバー中はポータルへ吸い込まれるようなワープ線
    if (s.hover > 0.05) {
        ctx.strokeStyle = `rgba(${CYAN}, ${(0.55 * s.hover).toFixed(3)})`;
        ctx.beginPath();
        for (let index = 0; index < 24; index++) {
            const angle = (index / 24) * Math.PI * 2 + index;
            const near = ((s.t * 1.5 + index * 0.13) % 1) * w * 0.6;
            const far = near + w * 0.08 * s.hover;
            ctx.moveTo(vx + Math.cos(angle) * near, horizon + Math.sin(angle) * near * 0.7);
            ctx.lineTo(vx + Math.cos(angle) * far, horizon + Math.sin(angle) * far * 0.7);
        }
        ctx.stroke();
    }
}

const TILE_PAINTERS = {
    brain: paintEeg,
    world: paintWorldModel,
    quantum: paintQubit,
    agent: paintAgents,
    dive: paintDive,
};

function setupThemeTiles() {
    document.querySelectorAll('.theme-tile').forEach(tile => {
        const canvas = tile.querySelector('canvas');
        const paint = TILE_PAINTERS[tile.dataset.tile];
        if (!canvas || !paint) {
            return;
        }
        const ctx = canvas.getContext('2d');
        const state = { t: 0, dt: 0, hover: 0, hoverTarget: 0 };
        let width = 0;
        let height = 0;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            fitCanvas(canvas, ctx, width, height);
        }

        function render() {
            paint(ctx, width, height, state);
        }

        tile.addEventListener('pointerenter', () => {
            state.hoverTarget = 1;
        });
        tile.addEventListener('pointerleave', () => {
            state.hoverTarget = 0;
        });
        tile.addEventListener('focus', () => {
            state.hoverTarget = 1;
        });
        tile.addEventListener('blur', () => {
            state.hoverTarget = 0;
        });

        resize();
        if ('ResizeObserver' in window) {
            new ResizeObserver(() => {
                resize();
                render();
            }).observe(canvas);
        }

        if (reduceMotion) {
            render();
            return;
        }
        const loop = createLoop(dt => {
            state.dt = dt;
            state.hover += (state.hoverTarget - state.hover) * Math.min(1, dt * 6);
            state.t += dt;
            render();
        }, 30);
        pauseWhenOffscreen(tile, loop);
        loop.start();
    });
}

setupNeuralField();
setupBrain();
setupThemeTiles();
