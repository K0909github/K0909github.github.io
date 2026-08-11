window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-WY6717KZSQ');

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (!splash) {
        return;
    }

    setTimeout(() => {
        splash.classList.add('fade-out');
    }, 4500);

    splash.addEventListener('transitionend', () => {
        splash.style.display = 'none';
    });
});

const canvas = document.getElementById('matrix-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];

    for (let index = 0; index < columns; index++) {
        drops[index] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#8b5cf6';
        ctx.font = `${fontSize}px monospace`;

        for (let index = 0; index < drops.length; index++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, index * fontSize, drops[index] * fontSize);
            drops[index]++;

            if (drops[index] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[index] = 0;
            }
        }
    }

    // requestAnimationFrame は背面タブで自動停止し、33ms スロットルで従来の描画間隔を保つ
    const frameInterval = 33;
    let lastFrame = 0;
    let rafId = null;

    function renderMatrix(timestamp) {
        rafId = requestAnimationFrame(renderMatrix);
        if (timestamp - lastFrame < frameInterval) {
            return;
        }
        lastFrame = timestamp;
        drawMatrix();
    }

    function startMatrix() {
        if (rafId === null) {
            rafId = requestAnimationFrame(renderMatrix);
        }
    }

    function stopMatrix() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopMatrix();
        } else {
            startMatrix();
        }
    });

    startMatrix();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // canvas 幅に合わせて drops を再構成（広げた分は 1 で埋め、縮めた分は切り捨て）
        const nextColumns = Math.floor(canvas.width / fontSize);
        for (let index = drops.length; index < nextColumns; index++) {
            drops[index] = 1;
        }
        drops.length = nextColumns;
    });
}

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

document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.fade-in-up');
    const scrollWrapper = document.querySelector('.scroll-wrapper');

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observerInstance.unobserve(entry.target);
            }
        });
    }, { root: scrollWrapper, rootMargin: '0px', threshold: 0.1 });

    targets.forEach(target => {
        observer.observe(target);
    });

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
            navHome: 'Home', navActivities: 'Activities', navProjects: 'Projects', navAchievements: 'Achievements', navArticles: 'Articles',
            home: 'Home', activities: 'Activities', projects: 'Projects', achievements: 'Achievements', qualifications: 'Qualifications', skills: 'Skills', materials: 'Materials', hobbies: 'Hobbies',
            name: 'Kazuyuki Yoshikawa', aliasLabel: 'Alias:', aliasValue: 'K / Kazuyuki', role: 'AI Engineer & Researcher',
            specialtyLine: 'Specialty: Artificial Intelligence × Neuroscience', experienceLine: 'Main R&D Experience: AI, Robotics, Brain-Machine Interface, Quantum Computing', interestLine: 'Interest: Artificial Consciousness',
            activitiesTitle: 'Affiliations & Activities',
            affFastNeura: 'FastNeura', affRakutenMobile: 'Rakuten Mobile', affNttEast: 'NTT East', affDocomo: 'NTT Docomo', affM3: 'M3, Inc.', affMatsuoLlmatch: 'Matsuo Lab (UTokyo) LLMATCH', affMatsuoComp2025: 'Matsuo Lab LLM Competition 2025', affMatsuoDlhacks: 'Matsuo Lab DLHacks', affBrainAcademy: 'Applied Neuroscience Academy (Araya)', affOsakaUniv: 'Osaka University', affNaist: 'NAIST', affHyogoDept: 'University of Hyogo Dept. EE & Info Engineering', affHyogoGradLab: 'University of Hyogo Graduate School Bio-Information Analysis Lab',
            roleFastNeura: 'Engineer & Researcher', roleRakutenIntern: 'Applied AI Research Engineer Intern', roleNttEastIntern: 'AI Engineer Intern', roleDocomoIntern: 'Engineer Intern', roleM3Intern: 'Data Scientist Intern', worldModelResearcher: 'World Model Researcher (1st & 2nd Cohort)', llmCompWinnerDev: 'Winner Team Developer Certification', dlhacksConsciousPresentation: 'Presentation: Implementing Artificial Consciousness', brainAcademyStudent: 'Student', quantumWorkshopGraduate: 'Quantum Software Study Group Graduate', compBehaviorNeuroSeminarGraduate: 'Computational Behavioral Neuroscience Spring Seminar Graduate', quantumResearch: 'Quantum Computing Research', eegResearch: 'EEG Analysis Research',
            projectsTitle: 'Project Examples',
            projectMegTitle: 'MEG Brain Signal Classifier', projectMegDesc: 'Classifies the image class a subject is viewing from MEG signals using fine-tuned CLIP.',
            projectSlackBotTitle: 'Slack Question Aggregator Bot', projectSlackBotDesc: 'Uses AWS (Bedrock, EventBridge) and Slack API to email frequent questions every 24h.',
            projectFashionTitle: 'Fashion Item Classifier', projectFashionDesc: 'Streamlit app that identifies clothing and shoes from camera images using a pre-trained model.',
            projectJapaneseLlmTitle: 'Japanese LLM Fine-tuning', projectJapaneseLlmDesc: 'Fine-tuned `llm-jp-13b` model on the `ichikara-instruction` dataset.',
            projectVoiceRobotTitle: 'Voice-Controlled Robot via ASR', projectVoiceRobotDesc: 'Control a ROS2 robot by voice using the Whisper speech recognition model.',
            projectPortfolioTitle: 'Portfolio Website', projectPortfolioDesc: 'This website itself. Built with HTML, Tailwind CSS, and JavaScript.',
            projectRagTitle: 'RAG Document Search & QA', projectRagDesc: 'RAG system combining an LLM and vector DB for document retrieval and QA. Easily deployable via Docker.',
            skillMLTitle: 'Machine Learning', skillDeepLearningTitle: 'Deep Learning', skillEEGTitle: 'EEG Analysis', skillRoboticsTitle: 'Robotics', skillBMIIntrusiveTitle: 'Invasive Brain-Machine Interface', skillWorldModelTitle: 'World Models', skillVibeCodingTitle: 'Vibe Coding (AI-Driven Development)',
            viewOnGitHub: 'View on GitHub', viewOnHuggingFace: 'View on Hugging Face', viewSite: 'View Site',
            qualificationsTitle: 'Qualifications', basicInfoExam: 'Fundamental Information Tech Engineer', gTest: 'JDLA G-Certification', eQualification: 'JDLA E-Certification', statTest2: 'Statistics Test Grade 2', atcoderLabel: 'Competitive Programming (AtCoder Brown)', kaggleContributor: 'Kaggle Contributor',
            skillsTitle: 'Skills', skillPythonDesc: 'Primary language for research and machine learning.', skillMLDesc: 'Use pandas, scikit-learn, and matplotlib libraries.', skillDeepLearningDesc: 'Use PyTorch, perform fine-tuning and hyperparameter optimization of pretrained models.', skillEEGDesc: 'Work mainly with EEG and MEG data sources.', skillLLMDesc: 'Experience in fine-tuning large language models, quantization, and efficient LoRA-based adaptation.', skillRoboticsDesc: 'Simulation with ROS2 & Docker; Vision/OCR development (preprocessing, detection, recognition).', skillBMIIntrusiveDesc: 'AI algorithm development with ECoG (preprocessing, feature extraction, classification/regression).', skillWorldModelDesc: 'Research on world models enabling agents to learn internal environment dynamics for autonomous decisions.', skillVibeCodingDesc: 'Agentic development with Claude Code and GitHub Copilot — pairing with AI across design, implementation, and refactoring to shorten the development cycle.',
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
