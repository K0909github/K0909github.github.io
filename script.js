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
    let columns = Math.floor(canvas.width / fontSize);
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

    setInterval(drawMatrix, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        profileImage.addEventListener('error', () => {
            profileImage.src = 'https://placehold.co/200x200/333333/a3e635?text=画像なし';
        });
    }

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
        ja: {
            navHome: 'ホーム', navActivities: '活動', navProjects: '開発', navAchievements: '実績', navArticles: '記事',
            home: 'ホーム', activities: '所属・活動', projects: '開発物', achievements: '実績', qualifications: '資格', skills: 'スキル', materials: '発表資料', hobbies: '趣味',
            name: '吉川 和之', aliasLabel: '別名:', aliasValue: 'K / Kazuyuki', role: 'AI Engineer & Researcher',
            specialtyLine: '専門: 人工知能×脳神経科学', experienceLine: '主な研究開発経験: 人工知能、ロボティクス、ブレインマシンインターフェース、量子コンピュータ', interestLine: '興味: 人工意識',
            activitiesTitle: '所属・活動経験',
            affFastNeura: 'FastNeura', affMatsuoLlmatch: '東京大学松尾研究室 LLMATCH', affMatsuoComp2025: '東京大学松尾研究室LLMコンペ2025', affMatsuoDlhacks: '東京大学松尾研究室DLHacks', affBrainAcademy: '応用脳科学アカデミー (アラヤ)', affOsakaUniv: '大阪大学', affNaist: '奈良先端科学技術大学院大学', affHyogoDept: '兵庫県立大学工学部電気電子情報工学科', affHyogoGradLab: '兵庫県立大学大学院情報科学研究科生体情報解析研究室',
            roleFastNeura: 'Engineer & Researcher', worldModelResearcher: '世界モデル研究員 (一期, 二期)', llmCompWinnerDev: '優勝チーム開発者認定', dlhacksConsciousPresentation: '人工意識の実装発表', brainAcademyStudent: '受講生', quantumWorkshopGraduate: '量子ソフトウェア勉強会 修了生', compBehaviorNeuroSeminarGraduate: '計算行動神経科学スプリングセミナー 修了生', quantumResearch: '量子コンピュータ研究', eegResearch: '脳波解析研究',
            projectsTitle: '開発物の例',
            projectMegTitle: 'MEG脳波分類モデル', projectMegDesc: '被験者が見ている画像のクラスを脳波から分類。CLIPのファインチューニングにより実現。',
            projectSlackBotTitle: 'Slack質問集約Bot', projectSlackBotDesc: 'AWS (Bedrock, EventBridge) とSlack APIを利用し、多かった質問を24時間おきにメール通知。',
            projectFashionTitle: 'Fashion Item Classifier', projectFashionDesc: 'カメラ画像の服や靴の種類を判別するStreamlitアプリ。訓練済みモデルを利用して構築。',
            projectJapaneseLlmTitle: '日本語LLMファインチューニング', projectJapaneseLlmDesc: '`llm-jp-13b`モデルを`ichikara-instruction`データセットでファインチューニング。',
            projectVoiceRobotTitle: '音声認識AIによるロボット制御', projectVoiceRobotDesc: 'AIの音声認識モデル「Whisper」を使い、ROS2のロボットを声で動かすプロジェクト',
            projectPortfolioTitle: 'ポートフォリオサイト', projectPortfolioDesc: 'このウェブサイト自体も開発物の一つです。HTML, Tailwind CSS, JavaScriptで構築しています。',
            projectRagTitle: 'RAGによるドキュメント検索・QA', projectRagDesc: 'LLMとベクトルDBを組み合わせたRAG（Retrieval Augmented Generation）によるドキュメント検索・QAシステム。Dockerで簡単に構築可能。',
            skillMLTitle: '機械学習', skillDeepLearningTitle: '深層学習', skillEEGTitle: '脳波解析', skillRoboticsTitle: 'ロボティクス', skillBMIIntrusiveTitle: '侵襲型ブレインマシンインターフェース', skillWorldModelTitle: '世界モデル',
            viewOnGitHub: 'GitHubで見る', viewOnHuggingFace: 'Hugging Faceで見る', viewSite: 'サイトを見る',
            qualificationsTitle: '資格', basicInfoExam: '基本情報技術者', gTest: 'G検定', eQualification: 'E資格', statTest2: '統計検定2級', atcoderLabel: '競プロ (AtCoder 茶)', kaggleContributor: 'Kaggle Contributor',
            skillsTitle: 'スキル', skillPythonDesc: '研究開発、機械学習の主要言語', skillMLDesc: 'pandas, scikit-learn, matplotlibをライブラリとして扱う', skillDeepLearningDesc: 'PyTorchをライブラリとして扱う。事前学習済みモデルを用いたfinetuningやハイパーパラメータチューニング', skillEEGDesc: 'EEG、MEGを主なデータソースとして扱います。', skillLLMDesc: '大規模言語モデルのファインチューニングや松尾研チーム開発。モデルの量子化やLoRAを用いた効率的なファインチューニングの実装経験があります。', skillRoboticsDesc: 'ROS2、Dockerを用いたシミュレーション経験。VisionやOCRの開発経験も有します（カメラ入力の前処理・物体検出・文字認識など）。', skillBMIIntrusiveDesc: 'ECoGを用いたAIアルゴリズム開発（信号前処理、特徴抽出、分類/回帰モデルの実装および評価）。', skillWorldModelDesc: 'エージェントが環境を内的モデルとして学習・予測する世界モデルの研究開発。自律的な意思決定システムの構築を目指します。',
            achievementsTitle: '実績',
            achInterviewTitle: '東京大学 松尾研究室 修了生インタビュー', achInterviewOrg: '東京大学 松尾研究室', achInterviewDesc: '研究の背景や学び、経験についてのインタビュー記事。', readArticle: '記事を読む',
            achLlmCompTitle: '松尾研 LLM開発コンペ2025 優勝', achLlmCompOrg: '東京大学 松尾研究室', achLlmCompDesc: 'チーム開発によりLLMアプリケーションの設計・実装を行い、最終審査で優勝を獲得。', showCertificate: '証明書を表示',
            achWorldModelTitle: '世界モデル', achWorldModelOrg: '東京大学 松尾研究室', achWorldModelDesc: '自律エージェントが環境の動態を予測し、効率的な行動計画を立てるための世界モデルの構築。シミュレーション環境での強化学習タスクを通じて、その有効性を検証しました。',
            achLlmTitle: '大規模言語モデル', achLlmOrg: '東京大学 松尾研究室', achLlmDesc: 'LLMの基本原理（事前学習からRLHFまで）を学び、スケーリング則や安全対策などのコア技術を習得。APIを用いた実践的なアプリケーション開発を行いました。',
            achRLTitle: '深層強化学習', achRLOrg: '東京大学 松尾研究室', achRLDesc: '価値ベースの手法（DQN）から方策勾配法（REINFORCE, A2C）、さらにはPPOまで、主要な深層強化学習アルゴリズムを実装し、その理論的背景を学びました。',
            achGenModelTitle: '深層生成モデル', achGenModelOrg: '東京大学 松尾研究室', achGenModelDesc: 'VAE、GAN、Flow-basedモデル、拡散モデルなど、主要な深層生成モデルの理論を学び、高品質なデータ生成のための技術を実践的に習得しました。',
            achFinanceTitle: '金融市場取引と機械学習', achFinanceOrg: '東京大学 松尾研究室', achFinanceDesc: '金融データ特有の性質を理解し、時系列解析や機械学習モデルを応用した市場予測・取引戦略の構築手法について学びました。',
            achDLBasicTitle: '深層学習基礎', achDLBasicOrg: '東京大学 松尾研究室', achDLBasicDesc: 'ニューラルネットワークの数学的基礎から、CNNやRNNなどの基本的なモデル構造、最適化手法まで、深層学習の根幹をなす知識を体系的に学習しました。',
            achGciTitle: 'Global Consumer Intelligence', achGciOrg: '東京大学 松尾研究室', achGciDesc: '消費者行動データや市場データを分析し、ビジネス課題を解決するためのデータ駆動型インテリジェンスの獲得手法を学びました。',
            achAiEngTitle: 'AIエンジニアリング', achAiEngOrg: '東京大学 松尾研究室', achAiEngDesc: '機械学習システムの開発・運用（MLOps）に関する実践的知識を学習。Docker, Kubernetes, CI/CDパイプラインの構築など。',
            achPhysicalAiTitle: 'PhysicalAI', achPhysicalAiOrg: '東京大学 松尾研究室', achPhysicalAiDesc: 'ロボティクスとAIを融合し、物理世界でタスクを遂行するエージェントを開発。シミュレーションでの制御を学習。',
            achAiSemiconductorTitle: 'AIと半導体', achAiSemiconductorOrg: '東京大学 松尾研究室', achAiSemiconductorDesc: '深層ニューラルネットワークやLLMを支える半導体技術・CPU/GPUアーキテクチャ・回路設計・FPGA開発まで。',
            achQuantumStudyTitle: '量子ソフトウェア勉強会', achQuantumStudyOrg: '大阪大学', achQuantumStudyDesc: '量子コンピュータのプログラミングに必要な基礎知識と、主要な量子アルゴリズム（Shorのアルゴリズム, Groverのアルゴリズム等）について学びました。',
            achCompBehaviorSeminarTitle: '計算行動神経科学スプリングセミナー', achCompBehaviorSeminarOrg: '奈良先端科学技術大学院大学', achCompBehaviorSeminarDesc: '脳の計算論的モデルと、実際の神経活動データや行動データを結びつけるためのアプローチについて、講義と実践を通じて学びました。',
            materialsTitle: '発表資料',
            matPaperHacksTitle: 'Paper & Hacks', matPaperHacksDesc: '世界モデル、ロボット、マルチモーダル基盤モデルについてのサーベイまとめ',
            matAtrPlanTitle: 'ATR-BRI研究計画', matAtrPlanDesc: 'NAIST/ATR院用の研究計画書',
            matQuantumDiamondTitle: '量子ダイヤモンド研究', matQuantumDiamondDesc: 'ダイヤモンドを用いた量子コンピュータ研究',
            matEegPlanTitle: '脳波解析研究計画', matEegPlanDesc: '脳波(EEG)データを用いた感情解析の研究計画書',
            matDlhacksTitle: 'DLHacks', matDlhacksDesc: 'グラフニューラルネットワークとDocker環境構築に関する発表資料',
            matDlhacksConsciousTitle: 'DLHacks（意識理論×AI）', matDlhacksConsciousDesc: '意識理論×AI、人工意識の論文と実装に関する資料',
            matThousandBrainsTitle: 'ThousandBrains', matThousandBrainsDesc: 'Thousand Brains Theory に関する資料',
            matBrainInspiredTitle: 'Brain-Inspired-Intelligence', matBrainInspiredDesc: '脳に着想を得た知能アーキテクチャとAGIへの道筋に関する資料',
            hobbiesTitle: '趣味', hobbyResearch: '研究', hobbyDevelopment: '開発', hobbyProgramming: 'プログラミング', hobbyAnime: 'アニメ', hobbyGames: 'ゲーム'
        },
        en: {
            navHome: 'Home', navActivities: 'Activities', navProjects: 'Projects', navAchievements: 'Achievements', navArticles: 'Articles',
            home: 'Home', activities: 'Activities', projects: 'Projects', achievements: 'Achievements', qualifications: 'Qualifications', skills: 'Skills', materials: 'Materials', hobbies: 'Hobbies',
            name: 'Kazuyuki Yoshikawa', aliasLabel: 'Alias:', aliasValue: 'K / Kazuyuki', role: 'AI Engineer & Researcher',
            specialtyLine: 'Specialty: Artificial Intelligence × Neuroscience', experienceLine: 'Main R&D Experience: AI, Robotics, Brain-Machine Interface, Quantum Computing', interestLine: 'Interest: Artificial Consciousness',
            activitiesTitle: 'Affiliations & Activities',
            affFastNeura: 'FastNeura', affMatsuoLlmatch: 'Matsuo Lab (UTokyo) LLMATCH', affMatsuoComp2025: 'Matsuo Lab LLM Competition 2025', affMatsuoDlhacks: 'Matsuo Lab DLHacks', affBrainAcademy: 'Applied Neuroscience Academy (Araya)', affOsakaUniv: 'Osaka University', affNaist: 'NAIST', affHyogoDept: 'University of Hyogo Dept. EE & Info Engineering', affHyogoGradLab: 'University of Hyogo Graduate School Bio-Information Analysis Lab',
            roleFastNeura: 'Engineer & Researcher', worldModelResearcher: 'World Model Researcher (1st & 2nd Cohort)', llmCompWinnerDev: 'Winner Team Developer Certification', dlhacksConsciousPresentation: 'Presentation: Implementing Artificial Consciousness', brainAcademyStudent: 'Student', quantumWorkshopGraduate: 'Quantum Software Study Group Graduate', compBehaviorNeuroSeminarGraduate: 'Computational Behavioral Neuroscience Spring Seminar Graduate', quantumResearch: 'Quantum Computing Research', eegResearch: 'EEG Analysis Research',
            projectsTitle: 'Project Examples',
            projectMegTitle: 'MEG Brain Signal Classifier', projectMegDesc: 'Classifies the image class a subject is viewing from MEG signals using fine-tuned CLIP.',
            projectSlackBotTitle: 'Slack Question Aggregator Bot', projectSlackBotDesc: 'Uses AWS (Bedrock, EventBridge) and Slack API to email frequent questions every 24h.',
            projectFashionTitle: 'Fashion Item Classifier', projectFashionDesc: 'Streamlit app that identifies clothing and shoes from camera images using a pre-trained model.',
            projectJapaneseLlmTitle: 'Japanese LLM Fine-tuning', projectJapaneseLlmDesc: 'Fine-tuned `llm-jp-13b` model on the `ichikara-instruction` dataset.',
            projectVoiceRobotTitle: 'Voice-Controlled Robot via ASR', projectVoiceRobotDesc: 'Control a ROS2 robot by voice using the Whisper speech recognition model.',
            projectPortfolioTitle: 'Portfolio Website', projectPortfolioDesc: 'This website itself. Built with HTML, Tailwind CSS, and JavaScript.',
            projectRagTitle: 'RAG Document Search & QA', projectRagDesc: 'RAG system combining an LLM and vector DB for document retrieval and QA. Easily deployable via Docker.',
            skillMLTitle: 'Machine Learning', skillDeepLearningTitle: 'Deep Learning', skillEEGTitle: 'EEG Analysis', skillRoboticsTitle: 'Robotics', skillBMIIntrusiveTitle: 'Invasive Brain-Machine Interface', skillWorldModelTitle: 'World Models',
            viewOnGitHub: 'View on GitHub', viewOnHuggingFace: 'View on Hugging Face', viewSite: 'View Site',
            qualificationsTitle: 'Qualifications', basicInfoExam: 'Fundamental Information Tech Engineer', gTest: 'JDLA G-Certification', eQualification: 'JDLA E-Certification', statTest2: 'Statistics Test Grade 2', atcoderLabel: 'Competitive Programming (AtCoder Brown)', kaggleContributor: 'Kaggle Contributor',
            skillsTitle: 'Skills', skillPythonDesc: 'Primary language for research and machine learning.', skillMLDesc: 'Use pandas, scikit-learn, and matplotlib libraries.', skillDeepLearningDesc: 'Use PyTorch, perform fine-tuning and hyperparameter optimization of pretrained models.', skillEEGDesc: 'Work mainly with EEG and MEG data sources.', skillLLMDesc: 'Experience in fine-tuning large language models, quantization, and efficient LoRA-based adaptation.', skillRoboticsDesc: 'Simulation with ROS2 & Docker; Vision/OCR development (preprocessing, detection, recognition).', skillBMIIntrusiveDesc: 'AI algorithm development with ECoG (preprocessing, feature extraction, classification/regression).', skillWorldModelDesc: 'Research on world models enabling agents to learn internal environment dynamics for autonomous decisions.',
            achievementsTitle: 'Achievements',
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

    function applyLang(lang) {
        const chosen = dict[lang] ? lang : 'ja';
        document.documentElement.lang = chosen;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[chosen][key]) {
                el.textContent = dict[chosen][key];
            }
        });

        const jaBtns = [document.getElementById('lang-ja'), document.getElementById('m-lang-ja')];
        const enBtns = [document.getElementById('lang-en'), document.getElementById('m-lang-en')];
        jaBtns.forEach(btn => btn && btn.classList.toggle('bg-violet-800/30', chosen === 'ja'));
        enBtns.forEach(btn => btn && btn.classList.toggle('bg-violet-800/30', chosen === 'en'));
        jaBtns.forEach(btn => btn && btn.classList.toggle('text-violet-300', chosen === 'ja'));
        enBtns.forEach(btn => btn && btn.classList.toggle('text-violet-300', chosen === 'en'));
        localStorage.setItem('lang', chosen);
    }

    ['lang-ja', 'm-lang-ja'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => applyLang('ja'));
        }
    });

    ['lang-en', 'm-lang-en'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => applyLang('en'));
        }
    });

    applyLang(localStorage.getItem('lang') || 'ja');
});
