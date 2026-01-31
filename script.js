(function () {
    'use strict';

    /* --- Theme Manager --- */
    const ThemeManager = {
        init() {
            const toggle = document.getElementById('themeToggle');
            const saved = localStorage.getItem('theme') || 'light';
            this.setTheme(saved);
            toggle?.addEventListener('click', () => this.toggleTheme());
        },
        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        },
        setTheme(theme) {
            const icon = document.querySelector('#themeToggle .icon');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (icon) icon.textContent = '☀️';
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (icon) icon.textContent = '🌙';
            }
        }
    };

    /* --- Syntax Highlighter --- */
    const SyntaxHighlighter = {
        init() {
            // Target both old .code-block code and new .code-content code
            document.querySelectorAll('.code-block code, .code-content code').forEach(block => {
                this.highlight(block);
            });
        },
        highlight(block) {
            let html = block.innerHTML;

            // Simple tokenization to protect strings and comments
            const strings = [];
            const comments = [];

            // Hide strings "..." or '...'
            html = html.replace(/(['"])(.*?)\1/g, (match) => {
                strings.push(match);
                return `___STR${strings.length - 1}___`;
            });

            // Hide comments # ...
            html = html.replace(/(#.*)/g, (match) => {
                comments.push(match);
                return `___COM${comments.length - 1}___`;
            });

            // Highlight Keywords
            const keywords = ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'print', 'True', 'False', 'in', 'and', 'or', 'not', 'as', 'None', 'break', 'continue', 'pass', 'lambda', 'with'];
            html = html.replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="token keyword">$1</span>');

            // Highlight Functions (word followed by opening paren)
            html = html.replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="token function">$1</span>');

            // Highlight Numbers
            html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

            // Restore Comments (and wrap them)
            html = html.replace(/___COM(\d+)___/g, (match, i) => {
                return `<span class="token comment">${comments[i]}</span>`;
            });

            // Restore Strings (and wrap them)
            html = html.replace(/___STR(\d+)___/g, (match, i) => {
                return `<span class="token string">${strings[i]}</span>`;
            });

            block.innerHTML = html;
        }
    };

    /* --- Tab System --- */
    const TabSystem = {
        init() {
            const tabs = document.querySelectorAll('.tab-btn[data-tab]');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });
        },
        switchTab(tabId) {
            // Update Buttons
            document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            // Update Content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');
        }
    };

    /* --- Quiz System --- */
    const QuizSystem = {
        currentQuestions: [],
        currentIndex: 0,
        score: 0,

        // DATA BANK
        db: {
            python: [
                { q: "ما هو ناتج: print(10 // 3)؟", options: ["3.33", "3", "3.0", "Error"], correct: 1, info: "// هي قسمة الأعداد الصحيحة (بدون باقي)." },
                { q: "أي مما يلي يُستخدم لتعريف دالة؟", options: ["func", "define", "def", "function"], correct: 2, info: "نستخدم def لتعريف الدوال في بايثون." },
                { q: "ما نوع البيانات لـ: [1, 2, 3]؟", options: ["Tuple", "List", "Set", "Dictionary"], correct: 1, info: "الأقواس المربعة [] تدل على List." },
                { q: "كيف نضيف عنصراً لقائمة؟", options: [".push()", ".add()", ".append()", ".insert()"], correct: 2, info: "append() تضيف العنصر لنهاية القائمة." },
                { q: "ما ناتج: print('A' * 3)؟", options: ["AAA", "A3", "Error", "A A A"], correct: 0, info: "يمكن تكرار النصوص بضربها في رقم." },
                { q: "أي مما يلي اسم متغير صحيح؟", options: ["1name", "my-name", "my_name", "class"], correct: 2, info: "المتغير لا يبدأ برقم ولا يحوي - ولا يكون كلمة محجوزة." },
                { q: "ما ناتج: bool(0)؟", options: ["True", "False", "Error", "None"], correct: 1, info: "الصفر يعتبر False دائماً." },
                { q: "كيف نوقف حلقة التكرار؟", options: ["stop", "exit", "break", "continue"], correct: 2, info: "break تكسر الحلقة وتوقفها." },
                { q: "ماذا تفعل range(5)؟", options: ["تولد أرقام من 1 لـ 5", "تولد أرقام من 0 لـ 5", "تولد أرقام من 0 لـ 4", "خطأ"], correct: 2, info: "range تبدأ من 0 وتنتهي قبل الرقم المحدد بواحد." },
                { q: "ما ناتج: 2 ** 3؟", options: ["6", "5", "8", "9"], correct: 2, info: "** تعني الأس (2 أس 3 = 8)." },
                { q: "أي مكتبة نستخدمها للعمليات الرياضية المعقدة؟", options: ["math", "sys", "os", "random"], correct: 0, info: "مكتبة math تحوي الجذر واللوغاريتم وغيرها." },
                { q: "كيف نحول نص '5' إلى رقم؟", options: ["to_int('5')", "int('5')", "num('5')", "str('5')"], correct: 1, info: "int() هي دالة التحويل لعدد صحيح." },
                { q: "ماذا يعني الرمز != ؟", options: ["يساوي", "لا يساوي", "أكبر من", "إسناد"], correct: 1, info: "!= تعني لا يساوي." },
                { q: "ما هو الـ Index للحرف 'o' في 'Hello'؟", options: ["3", "4", "5", "2"], correct: 1, info: "H=0, e=1, l=2, l=3, o=4." },
                { q: "كيف نستقبل مدخلات من المستخدم؟", options: ["get()", "scan()", "input()", "read()"], correct: 2, info: "input() توقف البرنامج وتنتظر كتابة المستخدم." },
                { q: "ما ناتج: len('Hi')؟", options: ["1", "2", "3", "0"], correct: 1, info: "len() تعيد عدد العناصر أو الحروف." },
                { q: "كيف نكتب تعليقاً (Comment)؟", options: ["// تعليق", "/* تعليق */", "# تعليق", "-- تعليق"], correct: 2, info: "الهاش # يستخدم للتعليقات." },
                { q: "ما نتيجة: type(5.5)؟", options: ["int", "float", "str", "double"], correct: 1, info: "الأعداد العشرية هي float." },
                { q: "أي أمر يطبع نصاً على الشاشة؟", options: ["echo", "console.log", "print", "printf"], correct: 2, info: "print هي دالة الطباعة في بايثون." },
                { q: "ماذا يحدث عند القسمة على صفر؟", options: ["0", "Infinity", "ZeroDivisionError", "NaN"], correct: 2, info: "يحدث خطأ ZeroDivisionError." },
            ],
            ml: [
                { q: "ما هي أول خطوة في مشروع ML؟", options: ["التدريب", "جمع البيانات", "التوقع", "التقييم"], correct: 1, info: "البيانات هي الوقود، يجب جمعها وتنظيفها أولاً." },
                { q: "أي مكتبة نستخدمها للتعامل مع الجداول؟", options: ["NumPy", "Pandas", "Matplotlib", "Sklearn"], correct: 1, info: "Pandas هي الأفضل للـ DataFrames." },
                { q: "ما وظيفة df.head()؟", options: ["رسم البيانات", "حذف البيانات", "عرض أول 5 صفوف", "تدريب النموذج"], correct: 2, info: "تستخدم لاستكشاف شكل البيانات." },
                { q: "ماذا تعني Supervised Learning؟", options: ["تعلم بدون معلم", "بيانات مع إجابات (Labels)", "تعلم ذاتي", "لا شيء مما سبق"], correct: 1, info: "يعني أننا نعلم النموذج الأجوبة الصحيحة مسبقاً." },
                { q: "أي خوارزمية تستخدم للتصنيف (Classification)؟", options: ["Linear Regression", "Logistic Regression", "K-Means", "PCA"], correct: 1, info: "رقم اسمها، Logistic Regression تستخدم للتصنيف." },
                { q: "ما وظيفة machine.fit(X, y)؟", options: ["اختبار النموذج", "تدريب النموذج", "رسم النموذج", "حفظ النموذج"], correct: 1, info: "fit هي الأمر الذي يبدأ عملية التعلم." },
                { q: "كيف نتأكد من عدم وجود بيانات مفقودة؟", options: ["df.isnull().sum()", "df.info()", "df.describe()", "الكل صحيح"], correct: 3, info: "كل هذه الدوال تساعد في كشف الفراغات." },
                { q: "ما هو الـ Target؟", options: ["المتغير المستقل", "العمود الذي نريد توقعه", "البيانات المدخلة", "الضوضاء"], correct: 1, info: "الـ Target (أو y) هو الهدف." },
                { q: "في K-Means، ماذا يمثل K؟", options: ["عدد البيانات", "عدد المجموعات (Clusters)", "عدد المحاولات", "معدل الخطأ"], correct: 1, info: "K هو عدد العناقيد التي نريد تقسيم البيانات لها." },
                { q: "لماذا نستخدم train_test_split؟", options: ["لزيادة البيانات", "لتقييم النموذج على بيانات جديدة", "لتسريع التدريب", "للتلوين"], correct: 1, info: "لنختبر النموذج على بيانات لم يرها من قبل." },
                { q: "ما هي الـ Features؟", options: ["المخرجات", "المدخلات (الأعمدة)", "الأخطاء", "الدوال"], correct: 1, info: "الـ Features (X) هي المعلومات التي نستخدمها للتوقع." },
                { q: "أي مقياس يستخدم لتقييم التصنيف؟", options: ["Accuracy", "Mean Absolute Error", "R2 Score", "Distance"], correct: 0, info: "الدقة (Accuracy) هي أشهر مقياس للتصنيف." },
                { q: "ماذا تفعل df.dropna()؟", options: ["تحذف الصفوف الفارغة", "تملأ الفراغات", "تحذف العمود", "تكرر البيانات"], correct: 0, info: "drop تعني حذف، na تعني مفقود." },
                { q: "ما هو الـ Regression؟", options: ["توقع فئة (نعم/لا)", "توقع قيمة رقمية مستمرة", "تجميع الصور", "تحليل نصوص"], correct: 1, info: "الانحدار يستخدم للأرقام (مثل السعر، العمر)." },
                { q: "لماذا نحول النصوص لأرقام قبل التدريب؟", options: ["لتقليل المساحة", "لأن الكمبيوتر يفهم الأرقام فقط", "للتشفير", "لا يلزم ذلك"], correct: 1, info: "النماذج الرياضية لا تعمل مع النصوص مباشرة." },
                { q: "ما هو Overfitting؟", options: ["أداء ممتاز تدريب واختبار", "حفظ البيانات بدل فهمها (أداء سيء في الاختبار)", "أداء سيء في الاثنين", "سرعة عالية"], correct: 1, info: "يعني أن النموذج 'بصم' الأسئلة ولم يفهم الدرس." },
                { q: "ما وظيفة Matplotlib؟", options: ["التعلم الآلي", "الرسم البياني وتصور البيانات", "التعامل مع الويب", "قواعد البيانات"], correct: 1, info: "مكتبة للـ Plotting." },
                { q: "ماذا تعني df.shape = (150, 5)؟", options: ["150 عمود و 5 صفوف", "150 صف و 5 أعمدة", "حجم الملف 150kb", "غير معروف"], correct: 1, info: "الأول للصفوف والثاني للأعمدة." },
                { q: "كيف نحذف التكرار؟", options: ["df.clean()", "df.unique()", "df.drop_duplicates()", "df.remove()"], correct: 2, info: "drop_duplicates هي الدالة الصحيحة." },
                { q: "ما هي مكتبة Scikit-Learn؟", options: ["مكتبة ألعاب", "مكتبة واجهات", "أشهر مكتبة خوارزميات ML", "مكتبة صوتيات"], correct: 2, info: "هي السلاح الأساسي لمهندس الـ ML." },
            ]
        },

        // Shuffle array (Fischer-Yates)
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        start(type) {
            let qList = [];
            if (type === 'mix') {
                // Get 10 random from Python and 10 random from ML
                const py = this.shuffle([...this.db.python]).slice(0, 10);
                const ml = this.shuffle([...this.db.ml]).slice(0, 10);
                qList = [...py, ...ml];
            } else {
                // Get 20 random from selected
                qList = this.shuffle([...this.db[type]]).slice(0, 20);
            }

            // Shuffle final list
            this.currentQuestions = this.shuffle(qList);
            this.currentIndex = 0;
            this.score = 0;

            document.getElementById('quiz-intro').style.display = 'none';
            document.getElementById('quiz-active').style.display = 'block';
            document.getElementById('quiz-result').style.display = 'none';
            this.renderQuestion();
        },

        renderQuestion() {
            const q = this.currentQuestions[this.currentIndex];
            document.getElementById('quiz-progress').textContent = `سؤال ${this.currentIndex + 1} / ${this.currentQuestions.length}`;
            document.getElementById('question-text').textContent = q.q;
            document.getElementById('feedback-area').style.display = 'none';
            document.getElementById('next-q-btn').style.display = 'none';

            const optionsContainer = document.getElementById('quiz-options');
            optionsContainer.innerHTML = '';

            q.options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = opt;
                btn.onclick = () => this.checkAnswer(index, btn);
                optionsContainer.appendChild(btn);
            });
        },

        checkAnswer(selectedIndex, btnElement) {
            if (document.getElementById('next-q-btn').style.display === 'flex') return;

            const q = this.currentQuestions[this.currentIndex];
            const buttons = document.querySelectorAll('.option-btn');
            const feedback = document.getElementById('feedback-area');

            if (selectedIndex === q.correct) {
                btnElement.classList.add('correct');
                this.score++;
                feedback.innerHTML = `<strong>عظيم! إجابة صحيحة ✅</strong><br>${q.info}`;
            } else {
                btnElement.classList.add('incorrect');
                buttons[q.correct].classList.add('correct');
                feedback.innerHTML = `<strong>للأسف خطأ ❌</strong><br>الإجابة الصحيحة هي: ${q.options[q.correct]}<br><em>${q.info}</em>`;
            }

            document.getElementById('quiz-score').textContent = `النتيجة: ${this.score}`;
            feedback.style.display = 'block';

            const nextBtn = document.getElementById('next-q-btn');
            nextBtn.style.display = 'flex';
            nextBtn.onclick = () => this.nextQuestion();
        },

        nextQuestion() {
            this.currentIndex++;
            if (this.currentIndex < this.currentQuestions.length) {
                this.renderQuestion();
            } else {
                this.showResult();
            }
        },

        showResult() {
            document.getElementById('quiz-active').style.display = 'none';
            const resultCard = document.getElementById('quiz-result');
            resultCard.style.display = 'block';

            const percent = Math.round((this.score / this.currentQuestions.length) * 100);
            document.getElementById('final-score').textContent = `${percent}%`;

            let msg = "";
            if (percent === 100) msg = "مذهل! أنت عبقري 🏆";
            else if (percent >= 85) msg = "ممتاز جداً! 🌟";
            else if (percent >= 70) msg = "جيد جداً، استمر! 👍";
            else if (percent >= 50) msg = "جيد، ولكن تحتاج للمراجعة 📚";
            else msg = "لا بأس، حاول مرة أخرى! 💪";

            document.getElementById('final-msg').textContent = msg;

            // Save best
            const best = localStorage.getItem('bestScore') || 0;
            if (percent > best) localStorage.setItem('bestScore', percent);
        },

        reset() {
            document.getElementById('quiz-intro').style.display = 'block';
            document.getElementById('quiz-active').style.display = 'none';
            document.getElementById('quiz-result').style.display = 'none';
        }
    };

    window.startQuiz = function (type) {
        QuizSystem.start(type);
    };
    window.resetQuiz = function () {
        QuizSystem.reset();
    };

    /* --- Utilities (Lightbox, Copy, etc) --- */
    const Utils = {
        init() {
            // Lightbox
            const lightbox = document.getElementById('lightbox');
            document.querySelectorAll('.step-image img').forEach(img => {
                img.addEventListener('click', () => {
                    document.getElementById('lightboxImage').src = img.src;
                    document.getElementById('lightboxCaption').textContent = img.alt;
                    lightbox.classList.add('active');
                });
            });
            document.getElementById('lightboxClose')?.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });

            // Copy Code
            document.querySelectorAll('.code-block').forEach(block => {
                block.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(block.innerText);
                        // Optional visual feedback
                    } catch (e) { }
                });
            });
        }
    };

    /* --- Animations --- */
    const Animations = {
        init() {
            const cards = document.querySelectorAll('.step-card');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });

            cards.forEach(card => {
                // Set initial state for valid animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease-out';
                observer.observe(card);
            });
        }
    };

    /* --- Sidebar Manager (Mobile) --- */
    const SidebarManager = {
        init() {
            // Toggle Buttons
            document.querySelectorAll('.mobile-course-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetId = btn.getAttribute('data-target');
                    const sidebar = document.querySelector(targetId);
                    const overlay = document.getElementById('sidebarOverlay');

                    if (sidebar && overlay) {
                        sidebar.classList.add('active');
                        overlay.classList.add('active');
                    }
                    e.stopPropagation();
                });
            });

            // Overlay Click to Close
            const overlay = document.getElementById('sidebarOverlay');
            overlay?.addEventListener('click', () => this.closeAll());

            // Close on Link Click (Mobile UX)
            document.querySelectorAll('.course-nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) this.closeAll();
                });
            });
        },
        closeAll() {
            document.querySelectorAll('.course-sidebar.active').forEach(s => s.classList.remove('active'));
            document.getElementById('sidebarOverlay')?.classList.remove('active');
        }
    };

    // Init All
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        TabSystem.init();
        SidebarManager.init(); // Added
        Utils.init();
        Animations.init();
    });

})();
