// ============================================
// Hero image cinematic zoom-out on load
// ============================================
const heroImage = document.querySelector('.hero__image');
if (heroImage) {
    heroImage.style.transform = 'scale(1.08)';
    heroImage.style.transition = 'transform 6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    window.addEventListener('load', () => {
        setTimeout(() => { heroImage.style.transform = 'scale(1)'; }, 100);
    });
}

// ============================================
// Full-Page Smooth Scroller
// page-section elements: hero, intro, problems, quiz
// Product gallery is normal flow between problems & quiz
// ============================================
const sections = Array.from(document.querySelectorAll('.page-section'));
let currentIndex = 0;
let isScrolling = false;
const DURATION = 900;

const productGallery = document.getElementById('product-gallery');

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration) {
    if (isScrolling) return;
    isScrolling = true;

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            window.scrollTo(0, targetY);
            setTimeout(() => { isScrolling = false; }, 200);
        }
    }
    requestAnimationFrame(step);
}

function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    currentIndex = index;
    smoothScrollTo(sections[index].offsetTop, DURATION);
}

function findClosestSection() {
    const scrollY = window.scrollY;
    let closestIdx = 0;
    let closestDist = Infinity;
    sections.forEach((sec, i) => {
        const dist = Math.abs(sec.offsetTop - scrollY);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    return closestIdx;
}

// Check if user is currently viewing the product gallery (between problems and quiz)
function isInProductGallery() {
    if (!productGallery) return false;
    const scrollY = window.scrollY;
    const pgTop = productGallery.offsetTop;
    const pgBottom = pgTop + productGallery.offsetHeight;
    return scrollY >= pgTop - 100 && scrollY < pgBottom - 100;
}

function getProblemsIndex() {
    return sections.findIndex(s => s.id === 'problems');
}
function getQuizIndex() {
    return sections.findIndex(s => s.id === 'quiz');
}

// Full-page snap removed — normal scroll enabled

if (false && window.addEventListener('wheel', (e) => {
    if (isScrolling) { e.preventDefault(); return; }

    // If inside product gallery, allow free scrolling
    if (isInProductGallery()) {
        const pgBottom = productGallery.offsetTop + productGallery.offsetHeight;
        const quizIdx = getQuizIndex();
        const prbIdx = getProblemsIndex();

        // Scrolling down past product gallery → snap to quiz
        if (e.deltaY > 0 && window.scrollY + window.innerHeight >= pgBottom - 50) {
            e.preventDefault();
            if (quizIdx >= 0) scrollToSection(quizIdx);
            return;
        }

        // Scrolling up past product gallery top → snap to problems
        if (e.deltaY < 0 && window.scrollY <= productGallery.offsetTop + 50) {
            e.preventDefault();
            if (prbIdx >= 0) scrollToSection(prbIdx);
            return;
        }

        // Otherwise let native scroll happen
        return;
    }

    currentIndex = findClosestSection();

    if (e.deltaY > 0 && currentIndex < sections.length - 1) {
        e.preventDefault();
        // If on problems scrolling down → go to product gallery first
        const prbIdx = getProblemsIndex();
        if (currentIndex === prbIdx && productGallery) {
            smoothScrollTo(productGallery.offsetTop, DURATION);
            return;
        }
        scrollToSection(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
        e.preventDefault();
        // If on quiz scrolling up → go to product gallery bottom first
        const quizIdx = getQuizIndex();
        if (currentIndex === quizIdx && productGallery) {
            const pgTarget = productGallery.offsetTop + productGallery.offsetHeight - window.innerHeight;
            smoothScrollTo(Math.max(productGallery.offsetTop, pgTarget), DURATION);
            return;
        }
        scrollToSection(currentIndex - 1);
    }
})) { /* disabled */ }

// Touch snap disabled — normal touch scroll

// Keyboard snap disabled — normal keyboard scroll

// ============================================
// Fixed Navigation Bar - show/hide on scroll
// ============================================
const fixedNav = document.getElementById('fixed-nav');
const heroSection = document.getElementById('hero');

if (fixedNav && heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fixedNav.classList.remove('is-visible');
            } else {
                fixedNav.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    heroObserver.observe(heroSection);
}

// ============================================
// Scroll-down arrow click → scroll to intro
// ============================================
const scrollArrow = document.getElementById('hero-scroll-arrow');
if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
        const intro = document.getElementById('intro');
        if (intro) intro.scrollIntoView({ behavior: 'smooth' });
    });
}

// ============================================
// Mobile Menu Toggle
// ============================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-menu-close');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    });
    const closeMenu = () => {
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
    };
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
}

// ============================================
// Problems Carousel (Typography Cards)
// ============================================
const prbCards = document.querySelectorAll('.prb-card');
const prbPrev = document.getElementById('prb-prev');
const prbNext = document.getElementById('prb-next');
let prbIndex = 0;

function updatePrbCards() {
    prbCards.forEach((card, i) => {
        card.classList.remove('is-active', 'is-prev', 'is-next');
        if (i === prbIndex) card.classList.add('is-active');
        else if (i === prbIndex - 1 || (prbIndex === 0 && i === prbCards.length - 1)) card.classList.add('is-prev');
        else if (i === prbIndex + 1 || (prbIndex === prbCards.length - 1 && i === 0)) card.classList.add('is-next');
    });
}

if (prbPrev) prbPrev.addEventListener('click', () => {
    prbIndex = (prbIndex - 1 + prbCards.length) % prbCards.length;
    updatePrbCards();
});
if (prbNext) prbNext.addEventListener('click', () => {
    prbIndex = (prbIndex + 1) % prbCards.length;
    updatePrbCards();
});

prbCards.forEach(card => {
    card.addEventListener('click', () => {
        if (card.classList.contains('is-prev')) {
            prbIndex = (prbIndex - 1 + prbCards.length) % prbCards.length;
            updatePrbCards();
        } else if (card.classList.contains('is-next')) {
            prbIndex = (prbIndex + 1) % prbCards.length;
            updatePrbCards();
        }
    });
});

// ============================================
// Product Data (for Quiz Recommendations)
// ============================================
const PRODUCTS = {
    'water-hyssop-shampoo': {
        name: 'Water-Hyssop Reinforcing Shampoo',
        img: '5.png',
        benefit: 'Kiểm soát bã nhờn, giảm rụng tóc với Rau Má Nước & Copper Peptide.',
        link: 'https://savetheday.kr/product/water-hyssop-reinforcing-shampoo/20/category/1/display/2/',
        step: 'BƯỚC 1',
        compare: 'Khác với dầu gội thông thường, Water-Hyssop Shampoo chứa 10,000ppm chiết xuất Rau Má Nước giúp cân bằng da đầu từ sâu bên trong.',
    },
    'true-rose-shampoo': {
        name: 'True Rose Jericho Calming Shampoo',
        img: '6.png',
        benefit: 'Cấp ẩm sâu, làm dịu da đầu khô nhạy cảm với Hoa Hồng Jericho.',
        link: 'https://savetheday.kr/product/true-rose-jericho-calming-shampoo/22/category/1/display/2/',
        step: 'BƯỚC 1',
        compare: 'Glyceryl Glucoside từ Hoa Hồng Sa Mạc Jericho phục hồi độ ẩm da đầu hiệu quả gấp 3 lần so với glycerin thông thường.',
    },
    'water-hyssop-tonic': {
        name: 'Water-Hyssop Reinforcing Tonic',
        img: '10.png',
        benefit: 'Kích thích mọc tóc, loại bỏ bã nhờn với Rau Má Nước 282,750ppm.',
        link: 'https://savetheday.kr/product/water-hyssop-reinforcing-tonic/23/category/1/display/2/',
        step: 'BƯỚC 2',
        compare: 'Hàm lượng Rau Má Nước cao nhất thị trường (282,750ppm) kết hợp Copper Peptide & Salicylic Acid cho hiệu quả tối ưu.',
    }
};

// ============================================
// Quiz Logic
// ============================================
const quizIntro = document.getElementById('quiz-intro');
const quizStart = document.getElementById('quiz-start-btn');
const questionContainer = document.getElementById('quiz-question-container');
const questionsWrapper = document.getElementById('quiz-questions-wrapper');
const quizResult = document.getElementById('quiz-result');

const stepText = document.getElementById('quiz-step-text');
const stepPercent = document.getElementById('quiz-step-percent');
const progressFill = document.getElementById('quiz-progress-fill');
const btnBack = document.getElementById('quiz-btn-back');
const btnNext = document.getElementById('quiz-btn-next');

let quizStep = 1;
const totalSteps = 6;

function updateQuizUI() {
    if (stepText) stepText.textContent = `Câu ${quizStep} / ${totalSteps}`;
    const pct = Math.round(((quizStep - 1) / totalSteps) * 100);
    if (stepPercent) stepPercent.textContent = `${pct}%`;
    if (progressFill) progressFill.style.width = `${pct}%`;

    const allQs = questionsWrapper.querySelectorAll('.quiz__q');
    allQs.forEach(q => q.classList.remove('quiz__q--active'));
    const activeQ = questionsWrapper.querySelector(`.quiz__q[data-step="${quizStep}"]`);
    if (activeQ) activeQ.classList.add('quiz__q--active');

    if (btnBack) btnBack.style.visibility = quizStep === 1 ? 'hidden' : 'visible';

    const selected = activeQ ? activeQ.querySelector('input[type="radio"]:checked') : null;
    if (btnNext) {
        btnNext.disabled = !selected;
        btnNext.textContent = quizStep === totalSteps ? 'Xem kết quả' : 'Tiếp theo';
    }
}

if (quizStart) {
    quizStart.addEventListener('click', () => {
        quizIntro.classList.remove('active');
        questionContainer.classList.add('active');
        quizStep = 1;
        updateQuizUI();
    });
}

if (questionsWrapper) {
    questionsWrapper.addEventListener('change', () => {
        if (btnNext) btnNext.disabled = false;
    });
}

if (btnBack) {
    btnBack.addEventListener('click', () => {
        if (quizStep > 1) { quizStep--; updateQuizUI(); }
    });
}

if (btnNext) {
    btnNext.addEventListener('click', () => {
        if (quizStep < totalSteps) {
            quizStep++;
            updateQuizUI();
        } else {
            showResult();
        }
    });
}

// ============================================
// Scoring & Recommendation
// ============================================
function calculateScores() {
    const answers = {};
    for (let i = 1; i <= totalSteps; i++) {
        const radio = document.querySelector(`input[name="q${i}"]:checked`);
        answers[`q${i}`] = radio ? radio.value : null;
    }

    let oilyScore = 0, dryScore = 0, hairLossScore = 0;

    if (answers.q1 === '6h') oilyScore += 3;
    else if (answers.q1 === '12h') oilyScore += 2;
    else if (answers.q1 === '24h') dryScore += 1;
    else if (answers.q1 === 'more') dryScore += 2;

    if (answers.q2 === 'medium') hairLossScore += 2;
    else if (answers.q2 === 'severe') hairLossScore += 3;

    if (answers.q3 === 'little') { oilyScore += 1; dryScore += 1; }
    else if (answers.q3 === 'lot') oilyScore += 2;

    if (answers.q4 === 'dry') dryScore += 2;
    else if (answers.q4 === 'oily') oilyScore += 2;
    else if (answers.q4 === 'sensitive') dryScore += 2;

    if (answers.q5 === 'hot') oilyScore += 1;
    else if (answers.q5 === 'helmet') { oilyScore += 2; hairLossScore += 1; }
    else if (answers.q5 === 'pollution') hairLossScore += 2;

    if (answers.q6 === 'oil-control') oilyScore += 2;
    else if (answers.q6 === 'moisture') dryScore += 2;
    else if (answers.q6 === 'hair-loss') hairLossScore += 2;
    else if (answers.q6 === 'deep-clean') { oilyScore += 1; hairLossScore += 1; }

    return { oilyScore, dryScore, hairLossScore };
}

function getRecommendation(scores) {
    const { oilyScore, dryScore, hairLossScore } = scores;
    const max = Math.max(oilyScore, dryScore, hairLossScore);

    if (max === hairLossScore && hairLossScore > 0) {
        return {
            type: 'hairloss',
            title: 'Da Đầu Yếu & Rụng Tóc',
            desc: 'Chân tóc của bạn đang suy yếu do tác động từ môi trường và thiếu dưỡng chất. Da đầu cần được kích thích tuần hoàn máu và cung cấp peptide để phục hồi nang tóc.',
            warning: 'Nếu không can thiệp sớm, nang tóc có thể bị teo nhỏ vĩnh viễn, dẫn đến rụng tóc không hồi phục và hói đầu sớm.',
            product: PRODUCTS['water-hyssop-tonic']
        };
    } else if (max === dryScore) {
        return {
            type: 'dry',
            title: 'Da Đầu Khô & Nhạy Cảm',
            desc: 'Da đầu bạn đang thiếu ẩm nghiêm trọng, hàng rào bảo vệ tự nhiên bị suy yếu. Điều này gây ra tình trạng bong tróc, ngứa rát và dễ kích ứng với các sản phẩm chăm sóc thông thường.',
            warning: 'Da đầu khô kéo dài sẽ làm tóc giòn, dễ gãy rụng và tăng nguy cơ viêm da đầu mãn tính — đặc biệt trong điều kiện khí hậu nóng ẩm.',
            product: PRODUCTS['true-rose-shampoo']
        };
    } else {
        return {
            type: 'oily',
            title: 'Da Đầu Dầu & Tổn Thương',
            desc: 'Tuyến bã nhờn của bạn hoạt động quá mức, kết hợp với khí hậu nóng ẩm khiến da đầu luôn trong tình trạng bết dính, bí bách. Lỗ chân lông bị tắc nghẽn bởi dầu thừa và bụi bẩn.',
            warning: 'Bã nhờn tích tụ lâu ngày sẽ gây viêm nang lông, làm yếu chân tóc và dẫn đến rụng tóc lan rộng nếu không được làm sạch đúng cách.',
            product: PRODUCTS['water-hyssop-shampoo']
        };
    }
}

// ============================================
// Show Result
// ============================================
function showResult() {
    const scores = calculateScores();
    const rec = getRecommendation(scores);

    questionContainer.classList.remove('active');
    quizResult.classList.add('quiz__step--active');

    const resTitle = document.getElementById('res-title');
    const resDesc = document.getElementById('res-desc');
    const resWarning = document.getElementById('res-warning');
    const resultProduct = document.getElementById('result-product');

    if (resTitle) resTitle.textContent = rec.title;
    if (resDesc) resDesc.textContent = rec.desc;
    if (resWarning) resWarning.textContent = rec.warning;

    if (resultProduct && rec.product) {
        const p = rec.product;
        resultProduct.innerHTML = `
            <a href="${p.link}" target="_blank" class="prod-card" style="text-decoration:none;color:inherit;">
                <div class="prod-card__img-wrap">
                    <span class="prod-card__step">${p.step}</span>
                    <img src="${p.img}" alt="${p.name}" class="prod-card__img">
                </div>
                <div class="prod-card__info">
                    <h4 class="prod-card__name">${p.name}</h4>
                    <p class="prod-card__benefit">${p.benefit}</p>
                    <p class="prod-card__compare">${p.compare}</p>
                </div>
            </a>
        `;
    }

    window.__quizRec = rec;
}

// ============================================
// Form Page (Zoom Overlay)
// ============================================
const btnBuildRoutine = document.getElementById('btn-build-routine');
const formPage = document.getElementById('form-page');
const formPageClose = document.getElementById('form-page-close');
const formPageProduct = document.getElementById('form-page-product');

if (btnBuildRoutine) {
    btnBuildRoutine.addEventListener('click', () => {
        if (formPage) {
            formPage.classList.add('is-active');
            document.body.style.overflow = 'hidden';

            if (formPageProduct && window.__quizRec && window.__quizRec.product) {
                const p = window.__quizRec.product;
                formPageProduct.innerHTML = `
                    <div class="fp-prod">
                        <div class="fp-prod__img"><img src="${p.img}" alt="${p.name}"></div>
                        <div>
                            <p class="fp-prod__name">${p.name}</p>
                            <p class="fp-prod__desc">${p.benefit}</p>
                        </div>
                    </div>
                `;
            }
        }
    });
}

if (formPageClose) {
    formPageClose.addEventListener('click', () => {
        formPage.classList.remove('is-active');
        document.body.style.overflow = '';
    });
}

// ============================================
// Form Submission
// ============================================
const leadSubmit = document.getElementById('lead-submit');
if (leadSubmit) {
    leadSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('lead-name')?.value.trim();
        const email = document.getElementById('lead-email')?.value.trim();
        const phone = document.getElementById('lead-phone')?.value.trim();
        const consent = document.getElementById('lead-consent')?.checked;

        if (!name || !email) {
            alert('Vui lòng nhập họ tên và email.');
            return;
        }
        if (!consent) {
            alert('Vui lòng đồng ý với điều khoản để tiếp tục.');
            return;
        }

        const formData = {
            ho_va_ten: name,
            email: email,
            so_dien_thoai: phone,
            san_pham_de_xuat: window.__quizRec?.product?.name || ''
        };

        leadSubmit.disabled = true;
        leadSubmit.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;animation:spin 0.8s linear infinite"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4"/></svg>
            Đang gửi...
        `;

        fetch('https://hook.eu1.make.com/9skus9mu37nmozblh1v1oidtcmprkp5b', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (!res.ok) throw new Error('Webhook error');
            leadSubmit.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Đã gửi thành công!
            `;
            setTimeout(() => {
                formPage.classList.remove('is-active');
                document.body.style.overflow = '';
            }, 2500);
        })
        .catch(err => {
            console.error('Webhook failed:', err);
            leadSubmit.disabled = false;
            leadSubmit.innerHTML = `Gửi thất bại — Thử lại`;
        });
    });
}

// ============================================
// Anchor Scroll (Navbar & Footer links)
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        target.scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('is-open')) {
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    });
});
