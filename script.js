window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-WY6717KZSQ');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// タッチ端末ではホバー前提の演出（カードの傾き・カーソルのグロー）を出さない
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// スプラッシュの裏で演出が終わってしまわないよう、消え始めるまで待たせる
let splashDone = false;
const splashCallbacks = [];

function whenSplashDone(callback) {
    if (splashDone) {
        callback();
    } else {
        splashCallbacks.push(callback);
    }
}

function markSplashDone() {
    if (splashDone) {
        return;
    }
    splashDone = true;
    splashCallbacks.splice(0).forEach(callback => callback());
}

// カーソル位置は背景のニューラルネットワーク・3D の脳・グローで参照する
const pointer = { x: 0, y: 0, active: false };
window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
}, { passive: true });
window.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse') {
        pointer.active = false;
    }
});
window.addEventListener('pointercancel', () => {
    pointer.active = false;
});
document.documentElement.addEventListener('mouseleave', () => {
    pointer.active = false;
});

// 起動演出：脳との同期ログを流し、100% で中心へ吸い込まれるようにページを表示する。
// 毎回だと煩わしいので同じセッション内の 2 回目以降と、動きを減らす設定では出さない
const BOOT_LINES = [
    '> NEURAL INTERFACE :: boot',
    '> EEG 64ch calibration ............ OK',
    '> cortical signal decoder ......... OK',
    '> world model :: latent dynamics .. LOADED',
    '> quantum co-processor ............ ONLINE',
    '> sensory sync .................... 100%',
    '> LINK ESTABLISHED :: human <-> AI',
];

function runBootSequence() {
    const boot = document.getElementById('boot-screen');
    if (!boot) {
        markSplashDone();
        return;
    }

    let bootedBefore = false;
    try {
        bootedBefore = sessionStorage.getItem('neural-booted') === '1';
        sessionStorage.setItem('neural-booted', '1');
    } catch (error) {
        // ストレージが使えない環境では毎回演出を出す
    }
    if (bootedBefore || reduceMotion) {
        boot.remove();
        markSplashDone();
        return;
    }

    const log = document.getElementById('boot-log');
    const percent = document.getElementById('boot-percent');
    const duration = 2400;
    const start = performance.now();
    const timers = BOOT_LINES.map((line, index) => setTimeout(() => {
        log.textContent += `${line}\n`;
    }, (index * duration) / BOOT_LINES.length));
    let finished = false;

    function enterSite() {
        if (finished) {
            return;
        }
        finished = true;
        timers.forEach(clearTimeout);
        percent.textContent = '100';
        boot.classList.add('is-entering');
        document.body.classList.add('is-arriving');
        markSplashDone();
        setTimeout(() => {
            boot.remove();
            document.body.classList.remove('is-arriving');
        }, 900);
    }

    function tick(now) {
        if (finished) {
            return;
        }
        const progress = Math.min((now - start) / duration, 1);
        percent.textContent = String(Math.round(progress * 100));
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            enterSite();
        }
    }

    boot.addEventListener('click', enterSite);
    window.addEventListener('keydown', enterSite, { once: true });
    requestAnimationFrame(tick);
}

runBootSequence();

const profileImage = document.getElementById('profile-image');
if (profileImage) {
    // defer スクリプトなので DOMContentLoaded を待たず即座に購読する。
    // フラグで代替画像自身が失敗したときの無限リトライを防ぐ。
    let fallbackApplied = false;
    const applyProfileFallback = () => {
        if (fallbackApplied) {
            return;
        }
        fallbackApplied = true;
        profileImage.src = 'https://placehold.co/200x200/333333/a3e635?text=画像なし';
    };
    profileImage.addEventListener('error', applyProfileFallback);
    // 購読前に既に読み込みが失敗しているケースを取りこぼさない
    if (profileImage.complete && profileImage.naturalWidth === 0) {
        applyProfileFallback();
    }
}

// 見出しを暗号文のような文字列から本来のテキストへ復号していく演出
const SCRAMBLE_WIDE = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';
const SCRAMBLE_NARROW = '01<>/=+*#%$&ABCDEFGHJKXYZ';
const scrambleRuns = new WeakMap();

function randomGlyphLike(char) {
    // 全角は全角、半角は半角で置き換えて、演出中の文字幅のガタつきを抑える
    const pool = char.charCodeAt(0) > 0xff ? SCRAMBLE_WIDE : SCRAMBLE_NARROW;
    return pool.charAt(Math.floor(Math.random() * pool.length));
}

function scrambleText(el, duration = 900) {
    if (!el || reduceMotion || scrambleRuns.has(el)) {
        return;
    }
    const finalText = el.textContent;
    const chars = Array.from(finalText);
    const run = { cancelled: false };
    scrambleRuns.set(el, run);
    // 演出中もスクリーンリーダーには正しい文字列を読ませる（aria-label を付けてよいのは見出しのみ）
    const labelable = /^H[1-6]$/.test(el.tagName);
    if (labelable) {
        el.setAttribute('aria-label', finalText);
    }
    const start = performance.now();
    let lastDraw = 0;

    function frame(now) {
        if (run.cancelled) {
            return;
        }
        const progress = Math.min((now - start) / duration, 1);
        if (progress < 1 && now - lastDraw < 40) {
            requestAnimationFrame(frame);
            return;
        }
        lastDraw = now;
        const revealed = Math.floor(progress * chars.length);
        el.textContent = chars.map((char, index) => (index < revealed || char.trim() === '' ? char : randomGlyphLike(char))).join('');
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            el.textContent = finalText;
            if (labelable) {
                el.removeAttribute('aria-label');
            }
            scrambleRuns.delete(el);
        }
    }
    requestAnimationFrame(frame);
}

// 言語切替で本文を書き換える前に呼び、演出が古い言語の文字列で上書きし返すのを防ぐ
function cancelScramble(el) {
    const run = scrambleRuns.get(el);
    if (run) {
        run.cancelled = true;
        el.removeAttribute('aria-label');
        scrambleRuns.delete(el);
    }
}

function setupHeadingHover() {
    if (!finePointer || reduceMotion) {
        return;
    }
    document.querySelectorAll('main section h2, header h1').forEach(title => {
        title.addEventListener('pointerenter', () => scrambleText(title, 600));
    });
}

// カードがカーソルの方向へ傾き、カーソル位置にスポットライトが当たる
function setupCardEffects() {
    if (!finePointer || reduceMotion) {
        return;
    }
    const cards = document.querySelectorAll('#projects .grid > div, #qualifications .grid > div, .skill-card, #achievements .space-y-4 > div, #materials .space-y-4 > a');
    cards.forEach(card => {
        card.classList.add('interactive-card');
        let frameId = null;

        card.addEventListener('pointermove', event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }
            frameId = requestAnimationFrame(() => {
                frameId = null;
                // 横長のカードは大きく傾けると不自然なので、幅に応じて角度を抑える
                const maxTilt = rect.width > 500 ? 2.5 : 7;
                const rotateY = (x / rect.width - 0.5) * maxTilt * 2;
                const rotateX = (0.5 - y / rect.height) * maxTilt * 2;
                card.style.setProperty('--card-x', `${x}px`);
                card.style.setProperty('--card-y', `${y}px`);
                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
        });

        card.addEventListener('pointerleave', () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            card.style.transform = '';
        });
    });
}

// スクロール進捗バーと、ナビで現在地のセクションを示すインジケーター
function setupScrollEffects(scrollWrapper) {
    const nav = document.querySelector('nav');
    if (!scrollWrapper || !nav) {
        return;
    }

    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    nav.appendChild(progressBar);

    const indicator = document.createElement('span');
    indicator.id = 'nav-indicator';
    nav.appendChild(indicator);

    const navLinks = Array.from(document.querySelectorAll('#nav-links .nav-link, #mobile-menu a[href^="#"]'));
    const sections = Array.from(new Set(navLinks.map(link => link.getAttribute('href'))))
        .map(href => document.querySelector(href))
        .filter(Boolean)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    let activeId = null;

    function moveIndicator() {
        // 同じ行き先のリンクが複数ある（実績・記事）ので先頭のリンクに合わせる
        const link = activeId ? document.querySelector(`#nav-links .nav-link[href="#${activeId}"]`) : null;
        const rect = link ? link.getBoundingClientRect() : null;
        if (!rect || rect.width === 0) {
            indicator.style.opacity = '0';
            return;
        }
        const navRect = nav.getBoundingClientRect();
        // 非表示から出すときは左上から滑ってこないよう、位置だけ瞬時に合わせる
        const wasHidden = indicator.style.opacity !== '1';
        if (wasHidden) {
            indicator.style.transition = 'none';
        }
        indicator.style.width = `${rect.width}px`;
        indicator.style.transform = `translate(${rect.left - navRect.left}px, ${rect.bottom - navRect.top + 6}px)`;
        if (wasHidden) {
            indicator.getBoundingClientRect();
            indicator.style.transition = '';
        }
        indicator.style.opacity = '1';
    }

    function update() {
        const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
        const progress = maxScroll > 0 ? scrollWrapper.scrollTop / maxScroll : 0;
        progressBar.style.transform = `scaleX(${progress})`;

        // 画面上端から 40% のラインを越えた最後のセクションを現在地とし、末尾の短いセクションは最下部到達で拾う
        const line = window.innerHeight * 0.4;
        let current = null;
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= line) {
                current = section.id;
            }
        });
        if (sections.length > 0 && maxScroll > 0 && scrollWrapper.scrollTop >= maxScroll - 2) {
            current = sections[sections.length - 1].id;
        }
        if (current !== activeId) {
            activeId = current;
            navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`));
            moveIndicator();
        }
    }

    let ticking = false;
    scrollWrapper.addEventListener('scroll', () => {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    }, { passive: true });

    // 言語切替でリンク幅が変わるので、ナビの大きさが変わったときも位置を合わせ直す
    const navList = document.getElementById('nav-links');
    if (navList && 'ResizeObserver' in window) {
        new ResizeObserver(moveIndicator).observe(navList);
    }
    window.addEventListener('resize', moveIndicator);
    update();
}

function setupCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || !finePointer || reduceMotion) {
        return;
    }
    let ticking = false;
    window.addEventListener('pointermove', () => {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            glow.style.setProperty('--glow-x', `${pointer.x}px`);
            glow.style.setProperty('--glow-y', `${pointer.y}px`);
            glow.classList.add('is-active');
        });
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => {
        glow.classList.remove('is-active');
    });
}

// クリックした位置から 0 と 1 が弾ける
function setupClickBurst() {
    if (reduceMotion) {
        return;
    }
    const bitCount = 10;
    window.addEventListener('click', event => {
        // キーボード操作による click（座標を持たない）では出さない
        if (event.detail === 0) {
            return;
        }
        for (let index = 0; index < bitCount; index++) {
            const bit = document.createElement('span');
            bit.className = 'burst-bit';
            bit.setAttribute('aria-hidden', 'true');
            bit.textContent = Math.random() < 0.5 ? '0' : '1';
            const angle = (Math.PI * 2 * index) / bitCount + Math.random() * 0.5;
            const distance = 30 + Math.random() * 40;
            bit.style.setProperty('--sx', `${event.clientX}px`);
            bit.style.setProperty('--sy', `${event.clientY}px`);
            bit.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            bit.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            bit.addEventListener('animationend', () => bit.remove());
            document.body.appendChild(bit);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.fade-in-up');
    const scrollWrapper = document.querySelector('.scroll-wrapper');

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                const title = entry.target.querySelector('h2');
                if (title) {
                    whenSplashDone(() => scrambleText(title));
                }
                observerInstance.unobserve(entry.target);
            }
        });
    }, { root: scrollWrapper, rootMargin: '0px', threshold: 0.1 });

    targets.forEach(target => {
        observer.observe(target);
    });

    whenSplashDone(() => {
        scrambleText(document.querySelector('header h1'), 1200);
        setTimeout(() => scrambleText(document.querySelector('header [data-i18n="role"]')), 300);
    });

    setupHeadingHover();
    setupCardEffects();
    setupScrollEffects(scrollWrapper);
    setupCursorGlow();
    setupClickBurst();

    const modal = document.getElementById('certificate-modal');
    const modalImg = document.getElementById('certificate-image');
    const btnPrev = document.getElementById('cert-prev');
    const btnNext = document.getElementById('cert-next');
    const certificateBtns = document.querySelectorAll('.certificate-btn');

    let gallery = [];
    let currentIndex = 0;

    function openModalWith(srcs) {
        gallery = srcs;
        currentIndex = 0;
        modalImg.src = gallery[currentIndex];

        const showNav = gallery.length > 1;
        btnPrev.classList.toggle('hidden', !showNav);
        btnNext.classList.toggle('hidden', !showNav);
        modal.style.display = 'flex';
    }

    certificateBtns.forEach(btn => {
        btn.addEventListener('click', event => {
            event.stopPropagation();
            const multi = btn.dataset.srcs;

            if (multi) {
                try {
                    const arr = JSON.parse(multi);
                    if (Array.isArray(arr) && arr.length > 0) {
                        openModalWith(arr);
                        return;
                    }
                } catch (error) {
                    console.warn('data-srcs のJSONパースに失敗しました', error);
                }
            }

            const single = btn.dataset.src;
            if (single) {
                openModalWith([single]);
            } else {
                console.log('証明書のURLが設定されていません。');
            }
        });
    });

    btnPrev.addEventListener('click', event => {
        event.stopPropagation();
        if (gallery.length > 1) {
            currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
            modalImg.src = gallery[currentIndex];
        }
    });

    btnNext.addEventListener('click', event => {
        event.stopPropagation();
        if (gallery.length > 1) {
            currentIndex = (currentIndex + 1) % gallery.length;
            modalImg.src = gallery[currentIndex];
        }
    });

    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modalImg.addEventListener('click', event => {
        event.stopPropagation();
    });

    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const dict = {
        en: {
            navHome: 'Home', navVision: 'Vision', navActivities: 'Activities', navProjects: 'Projects', navAchievements: 'Achievements', navArticles: 'Articles',
            home: 'Home', activities: 'Activities', projects: 'Projects', achievements: 'Achievements', qualifications: 'Qualifications', skills: 'Skills', materials: 'Materials', hobbies: 'Hobbies',
            name: 'Kazuyuki Yoshikawa', role: 'AI Engineer & Researcher',
            specialtyLine: 'Specialty: Artificial Intelligence × Neuroscience', heroTagline: 'From research on the brain and AI, building a society where humans and AI coexist.',brainHint: 'Drag to rotate / click to stimulate',experienceLine: 'Main R&D Experience: AI, Physical AI, Brain-Machine Interface, Quantum Computing', interestLine: 'Interest: Artificial Consciousness',
            activitiesTitle: 'Affiliations & Activities',
            affFastNeura: 'FastNeura', affUnseed: 'Unseed', affEpicAi: 'EpicAI',affRakutenMobile: 'Rakuten Mobile', affNttEast: 'NTT East', affDocomo: 'NTT Docomo', affM3: 'M3, Inc.', affMatsuoLlmatch: 'Matsuo Lab (UTokyo) LLMATCH', affMatsuoComp2025: 'Matsuo Lab LLM Competition 2025', affOsakaUniv: 'Osaka University', affNaist: 'NAIST', affHyogoDept: 'University of Hyogo Dept. EE & Info Engineering', affHyogoGradLab: 'University of Hyogo Graduate School Bio-Information Analysis Lab',
            roleFastNeura: 'AI Engineer & Researcher (Contract)', roleUnseed: 'Engineer (Contract)', roleEpicAi: 'AI Engineer (Contract)',roleRakutenIntern: 'Applied AI Research Engineer Intern', roleNttEastIntern: 'AI Engineer Intern', roleDocomoIntern: 'Hackathon Intern (Best Technology Award)', roleM3Intern: 'Data Scientist Intern', worldModelResearcher: 'World Model Researcher (1st & 2nd Cohort)', llmCompWinnerDev: 'Winner Team Developer Certification', quantumWorkshopGraduate: 'Quantum Software Study Group Graduate', compBehaviorNeuroSeminarGraduate: 'Computational Behavioral Neuroscience Spring Seminar Graduate', quantumResearch: 'Quantum Computing Research', eegResearch: 'EEG Analysis Research',
            expGroupWork: 'Experience', expGroupEducation: 'Education', expGroupActivities: 'Activities & Programs',
            affMatsuoLectures: 'Matsuo-Iwasawa Lab (UTokyo) Lecture Programs', roleMatsuoLectures: 'Completed with certificates (World Models, LLMs, Deep RL, and more)',
            periodUnseed: 'Nov 2026 – Present', periodEpicAi: 'Nov 2026 – Present', periodRakuten: 'Sep 2026 (1 month)', periodDocomo: 'Sep 2026 (5 days)',periodNttEast: 'Aug 2026 (10 days)', periodM3: 'Aug 2026 (2 days)', periodFastNeura: 'Jun 2025 – Present', periodLlmatch: 'Oct 2024 – Jul 2025',
            periodHyogoGrad: 'Apr 2026 – Mar 2028 (expected)', periodHyogoDept: 'Apr 2022 – Mar 2026', periodLlmComp: '2025', periodOsakaQuantum: 'Oct 2024', periodNaist: 'Jun 2024 (2 days)', periodMatsuoLectures: 'Apr 2024 –',
            tileBrainTitle: 'Brain', tileBrainDesc: 'Decoding brain signals to inform AI development', tileWorldTitle: 'World Models', tileWorldDesc: 'Applying them to BMI, and asking what intelligence is',
            tileQuantumTitle: 'Quantum Computing', tileQuantumDesc: 'Quantum computation and the quantum-brain perspective', tileAgentTitle: 'AI Agents', tileAgentDesc: 'Building AI that works alongside people with LLMs', tileDiveTitle: 'Full-Dive', tileDiveDesc: 'Connecting the brain directly to virtual worlds',
            visionTitle: 'Know the brain. Question intelligence. Toward human–AI coexistence.', visionLead: 'The goal: a society where humans and AI coexist.',
            visionStep1Title: 'Know the brain', visionStep1Desc: 'Decode neural signals with EEG and BMI. Bring insights from the brain into AI development, and in the far future, toward full-dive technology.',
            visionStep2Title: 'Question intelligence', visionStep2Desc: 'Apply world models to BMI, while studying world models, LLMs, and AI agents to ask what intelligence is and build true AI.',
            visionStep3Title: 'Live together', visionStep3Desc: 'Connect our understanding of the brain and AI to build a society where humans and AI coexist.',
            visionFoundationTitle: 'Quantum Computing', visionFoundationDesc: 'As the next computing foundation, and from the perspective of quantum brain theory, which views the brain and consciousness through quantum physics.',
            projectsTitle: 'Project Examples',
            projectMegTitle: 'MEG Brain Signal Classifier', projectMegDesc: 'Classifies the image class a subject is viewing from MEG signals using fine-tuned CLIP.',
            projectSlackBotTitle: 'Slack Question Aggregator Bot', projectSlackBotDesc: 'Uses AWS (Bedrock, EventBridge) and Slack API to email frequent questions every 24h.',
            projectFashionTitle: 'Fashion Item Classifier', projectFashionDesc: 'Streamlit app that identifies clothing and shoes from camera images using a pre-trained model.',
            projectJapaneseLlmTitle: 'Japanese LLM Fine-tuning', projectJapaneseLlmDesc: 'Fine-tuned `llm-jp-13b` model on the `ichikara-instruction` dataset.',
            projectVoiceRobotTitle: 'Voice-Controlled Robot via ASR', projectVoiceRobotDesc: 'Control a ROS2 robot by voice using the Whisper speech recognition model.',
            projectPortfolioTitle: 'Portfolio Website', projectPortfolioDesc: 'This website itself. Built with HTML, Tailwind CSS, and JavaScript.',
            projectRagTitle: 'RAG Document Search & QA', projectRagDesc: 'RAG system combining an LLM and vector DB for document retrieval and QA. Easily deployable via Docker.',
            skillMLTitle: 'Machine Learning', skillDeepLearningTitle: 'Deep Learning', skillEEGTitle: 'EEG Analysis', skillPhysicalAiTitle: 'Physical AI', skillBMIIntrusiveTitle: 'Invasive Brain-Machine Interface', skillWorldModelTitle: 'World Models', skillVibeCodingTitle: 'Vibe Coding (AI-Driven Development)',
            viewOnGitHub: 'View on GitHub', viewOnHuggingFace: 'View on Hugging Face', viewSite: 'View Site',
            qualificationsTitle: 'Qualifications', basicInfoExam: 'Fundamental Information Tech Engineer', gTest: 'JDLA G-Certification', eQualification: 'JDLA E-Certification', statTest2: 'Statistics Test Grade 2', atcoderLabel: 'Competitive Programming (AtCoder Brown)', kaggleContributor: 'Kaggle Contributor',
            skillsTitle: 'Skills', skillPythonDesc: 'Primary language for research and machine learning.', skillMLDesc: 'Use pandas, scikit-learn, and matplotlib libraries.', skillDeepLearningDesc: 'Use PyTorch, perform fine-tuning and hyperparameter optimization of pretrained models.', skillEEGDesc: 'Work mainly with EEG and MEG data, with signal processing experience in MATLAB.', skillLLMDesc: 'Experience in fine-tuning large language models, quantization, and efficient LoRA-based adaptation.', skillAIAgentTitle: 'AI Agents', skillAIAgentDesc: 'Team development of AI agents using Microsoft Foundry. Continuously studying LLMs and AI agents.', skillPhysicalAiDesc: 'Simulation with ROS2 & Docker. Built a physical robot from assembly through running a VLM on the real hardware, and presented the research. Also Vision/OCR development (preprocessing, detection, recognition).', skillBMIIntrusiveDesc: 'AI algorithm development with ECoG (preprocessing, feature extraction, classification/regression).', skillWorldModelDesc: 'Research on world models enabling agents to learn internal environment dynamics for autonomous decisions.', skillVibeCodingDesc: 'Agentic development with Claude Code, Codex, and GitHub Copilot —pairing with AI across design, implementation, and refactoring to shorten the development cycle.',
            achievementsTitle: 'Achievements',
            achJsai2026Title: 'Long-Horizon PPG-to-ECG Generation with Physiological Constraints', achJsai2026Org: 'JSAI2026 (40th Annual Conference of JSAI) / FastNeura', achJsai2026Desc: 'Conference presentation on a deep learning model that generates ECG from pulse waves, extended to long-duration signals and constrained by physiological priors.', viewPresentation: 'View Presentation',
            achBlaArticleTitle: 'From VLA to "BLA": EEG Foundation Models Spanning Robot Control to Sensory Augmentation', achBlaArticleOrg: 'FastNeura Official note', achBlaArticleDesc: 'Authored article surveying EEG foundation models and proposing a Biosignal-Language-Action (BLA) framework unifying perception, planning, and action.',
            achInterviewTitle: 'Graduate Interview (Matsuo Lab, UTokyo)', achInterviewOrg: 'Matsuo Laboratory, The University of Tokyo', achInterviewDesc: 'Interview article covering research background, learning, and experience.', readArticle: 'Read Article',
            achLlmCompTitle: 'Matsuo Lab LLM Dev Competition 2025 Winner', achLlmCompOrg: 'Matsuo Laboratory, The University of Tokyo', achLlmCompDesc: 'Designed and implemented LLM applications in a team; won the final review.', showCertificate: 'Show Certificate',
            achWorldModelTitle: 'World Models', achWorldModelOrg: 'Matsuo Laboratory, The University of Tokyo', achWorldModelDesc: 'Built world models for agents to predict environment dynamics and plan efficient actions; validated via RL tasks.',
            achLlmTitle: 'Large Language Models', achLlmOrg: 'Matsuo Laboratory, The University of Tokyo', achLlmDesc: 'Studied fundamentals from pretraining to RLHF, scaling laws, safety, and built practical applications via APIs.',
            achRLTitle: 'Deep Reinforcement Learning', achRLOrg: 'Matsuo Laboratory, The University of Tokyo', achRLDesc: 'Implemented algorithms from DQN and policy gradients (REINFORCE, A2C) to PPO and learned their theory.',
            achGenModelTitle: 'Deep Generative Models', achGenModelOrg: 'Matsuo Laboratory, The University of Tokyo', achGenModelDesc: 'Studied VAE, GAN, flow-based, and diffusion models to master high-quality data generation techniques.',
            achFinanceTitle: 'Financial Markets & ML', achFinanceOrg: 'Matsuo Laboratory, The University of Tokyo', achFinanceDesc: 'Learned time-series analysis and ML-based market prediction & trading strategy design.',
            achDLBasicTitle: 'Deep Learning Fundamentals', achDLBasicOrg: 'Matsuo Laboratory, The University of Tokyo', achDLBasicDesc: 'Systematically studied mathematical foundations, core architectures (CNN/RNN), and optimization methods.',
            achGciTitle: 'Global Consumer Intelligence', achGciOrg: 'Matsuo Laboratory, The University of Tokyo', achGciDesc: 'Analyzed consumer behavior & market data to derive data-driven intelligence for business problems.',
            achAiEngTitle: 'AI Engineering', achAiEngOrg: 'Matsuo Laboratory, The University of Tokyo', achAiEngDesc: 'Practical MLOps: Docker, Kubernetes, CI/CD pipeline construction for ML systems.',
            achPhysicalAiTitle: 'PhysicalAI', achPhysicalAiOrg: 'Matsuo Laboratory, The University of Tokyo', achPhysicalAiDesc: 'Developed agents that perform tasks in the physical world by integrating robotics and AI.',
            achAiSemiconductorTitle: 'AI and Semiconductors', achAiSemiconductorOrg: 'Matsuo Laboratory, The University of Tokyo', achAiSemiconductorDesc: 'From semiconductor tech underlying deep nets & LLMs to CPU/GPU architectures, circuit design, and FPGA dev.',
            achQuantumStudyTitle: 'Quantum Software Study Group', achQuantumStudyOrg: 'Osaka University', achQuantumStudyDesc: 'Studied fundamentals for quantum programming and key algorithms (Shor, Grover).',
            achCompBehaviorSeminarTitle: 'Computational Behavioral Neuroscience Spring Seminar', achCompBehaviorSeminarOrg: 'Nara Institute of Science and Technology', achCompBehaviorSeminarDesc: 'Lectures & practice on linking computational brain models with neural & behavioral data.',
            materialsTitle: 'Presentation Materials',
            matPaperHacksTitle: 'Paper & Hacks', matPaperHacksDesc: 'Survey notes on world models, robotics, and multimodal foundation models.',
            matAtrPlanTitle: 'ATR-BRI Research Plan', matAtrPlanDesc: 'Graduate research plan for NAIST/ATR.',
            matQuantumDiamondTitle: 'Quantum Diamond Research', matQuantumDiamondDesc: 'Quantum computing research using diamond.',
            matEegPlanTitle: 'EEG Analysis Research Plan', matEegPlanDesc: 'Research plan for emotion analysis using EEG data.',
            matDlhacksTitle: 'DLHacks', matDlhacksDesc: 'Presentation on GNNs and Docker environment setup.',
            matDlhacksConsciousTitle: 'DLHacks (Consciousness Theory × AI)', matDlhacksConsciousDesc: 'Materials on consciousness theory × AI and artificial consciousness implementations.',
            matThousandBrainsTitle: 'ThousandBrains', matThousandBrainsDesc: 'Materials on the Thousand Brains Theory.',
            matBrainInspiredTitle: 'Brain-Inspired-Intelligence', matBrainInspiredDesc: 'Brain-inspired intelligence architectures and pathways toward AGI.',
            hobbiesTitle: 'Hobbies', hobbyResearch: 'Research', hobbyDevelopment: 'Development', hobbyProgramming: 'Programming', hobbyAnime: 'Anime', hobbyGames: 'Games'
        }
    };

    const langButtonIds = { ja: ['lang-ja', 'm-lang-ja'], en: ['lang-en', 'm-lang-en'] };

    // 日本語は HTML の初期テキストを正とし、英語だけ dict.en で上書きする。
    // 初期テキストをキャッシュして ja の情報源にすることで、辞書側の ja 重複を排除する。
    const originalText = new Map();
    document.querySelectorAll('[data-i18n]').forEach(el => originalText.set(el, el.textContent));

    let appliedLang = 'ja';

    function applyLang(lang) {
        const chosen = lang === 'en' ? 'en' : 'ja';
        document.documentElement.lang = chosen;

        // 適用済み言語と同じなら DOM 書き換えは不要（初期 ja ロードの無駄な再描画を回避）
        if (chosen !== appliedLang) {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const value = chosen === 'en' ? dict.en[key] : originalText.get(el);
                if (value != null) {
                    cancelScramble(el);
                    el.textContent = value;
                }
            });
            appliedLang = chosen;
        }

        Object.entries(langButtonIds).forEach(([btnLang, ids]) => {
            const active = chosen === btnLang;
            ids.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.classList.toggle('bg-violet-800/30', active);
                    btn.classList.toggle('text-violet-300', active);
                }
            });
        });
        localStorage.setItem('lang', chosen);
    }

    Object.entries(langButtonIds).forEach(([lang, ids]) => {
        ids.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => applyLang(lang));
            }
        });
    });

    applyLang(localStorage.getItem('lang') || 'ja');
});
