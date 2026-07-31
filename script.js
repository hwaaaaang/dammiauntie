/* ======================================
   여기 날짜만 실제 예식 날짜로 바꾸세요.
   형식: YYYY-MM-DDTHH:MM:SS+09:00
====================================== */
const WEDDING_DATE = "2026-10-24T14:00:00+09:00";

/* 초대장 열기 */
const opening = document.querySelector("#opening");
const openButton = document.querySelector("#openInvitation");

document.body.style.overflow = "hidden";

openButton.addEventListener("click", () => {
  opening.classList.add("is-hidden");
  document.body.style.overflow = "";

  // 첫 화면 요소도 자연스럽게 나타나도록 실행
  document.querySelectorAll(".hero .reveal").forEach((element, index) => {
    window.setTimeout(() => element.classList.add("is-visible"), index * 120);
  });
});

/* 카운트다운 */
const countdownElements = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

function updateCountdown() {
  const weddingTime = new Date(WEDDING_DATE).getTime();
  const now = Date.now();
  const remaining = Math.max(weddingTime - now, 0);

  const day = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hour = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minute = Math.floor((remaining / (1000 * 60)) % 60);
  const second = Math.floor((remaining / 1000) % 60);

  countdownElements.days.textContent = day;
  countdownElements.hours.textContent = String(hour).padStart(2, "0");
  countdownElements.minutes.textContent = String(minute).padStart(2, "0");
  countdownElements.seconds.textContent = String(second).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

/* 스크롤 등장 효과 */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal:not(.hero .reveal)").forEach((element) => {
  revealObserver.observe(element);
});

/* 갤러리 확대 */
const galleryButtons = [...document.querySelectorAll(".gallery button")];
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightboxButton = document.querySelector(".lightbox__close");
const previousButton = document.querySelector(".lightbox__prev");
const nextButton = document.querySelector(".lightbox__next");

let currentImageIndex = 0;

function showGalleryImage(index) {
  currentImageIndex = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[currentImageIndex];

  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = button.querySelector("img").alt;
}

function openLightbox(index) {
  showGalleryImage(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index));
});

closeLightboxButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => showGalleryImage(currentImageIndex - 1));
nextButton.addEventListener("click", () => showGalleryImage(currentImageIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showGalleryImage(currentImageIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(currentImageIndex + 1);
});

/* 계좌번호 아코디언 */
document.querySelectorAll(".account-card__toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".account-card");
    const willOpen = !card.classList.contains("is-open");

    card.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });
});

/* 복사 기능 */
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message = "복사되었습니다.") {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast();
  } catch (error) {
    // 일부 오래된 브라우저용 대체 방식
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    const succeeded = document.execCommand("copy");
    textArea.remove();

    showToast(succeeded ? "복사되었습니다." : "복사하지 못했습니다.");
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy));
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.copyTarget);
    if (target) copyText(target.textContent.trim());
  });
});
