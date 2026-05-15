/**
 * CaptchaIQ Browser Extension — Content Script
 * Challenge Detector
 *
 * ⚠️ EDUCATIONAL/RESEARCH USE ONLY
 * This script is designed for research analysis on authorized systems only.
 * Do not inject on systems you don't own or have explicit permission to test.
 */

(function () {
  "use strict";

  // ─── Configuration ─────────────────────────────────────────────────────────
  const CONFIG = {
    enabled: true,
    highlightChallenges: true,
    apiUrl: "http://localhost:8000",
    researchModeOnly: true, // Never auto-solve — research annotation only
  };

  // ─── CAPTCHA Detection Patterns ────────────────────────────────────────────
  const CAPTCHA_SELECTORS = [
    // reCAPTCHA v2
    'iframe[src*="recaptcha"]',
    ".g-recaptcha",
    "#recaptcha",
    // hCaptcha
    'iframe[src*="hcaptcha"]',
    ".h-captcha",
    // Cloudflare Turnstile
    'iframe[src*="challenges.cloudflare.com"]',
    ".cf-turnstile",
    // Generic
    '[class*="captcha"]',
    '[id*="captcha"]',
    '[data-captcha]',
  ];

  // ─── State ─────────────────────────────────────────────────────────────────
  let detectedChallenges = [];
  let observer = null;

  // ─── Detection Logic ───────────────────────────────────────────────────────
  function detectChallenges() {
    if (!CONFIG.enabled) return;

    const found = [];
    for (const selector of CAPTCHA_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (!el.dataset.captchaiqDetected) {
          el.dataset.captchaiqDetected = "true";
          const type = classifyChallengeType(el);
          found.push({ element: el, type, selector });
          if (CONFIG.highlightChallenges) {
            annotateElement(el, type);
          }
        }
      });
    }

    if (found.length > 0) {
      detectedChallenges = [...detectedChallenges, ...found];
      reportDetection(found);
    }
  }

  function classifyChallengeType(element) {
    const src = element.src || element.getAttribute("src") || "";
    const className = element.className || "";
    const id = element.id || "";

    if (src.includes("recaptcha") || className.includes("g-recaptcha")) return "recaptcha-v2";
    if (src.includes("hcaptcha") || className.includes("h-captcha")) return "hcaptcha";
    if (src.includes("cloudflare") || className.includes("cf-turnstile")) return "cloudflare-turnstile";
    return "unknown";
  }

  function annotateElement(element, type) {
    // Add a subtle research indicator badge — does NOT modify the challenge
    const badge = document.createElement("div");
    badge.style.cssText = `
      position: absolute;
      top: -20px;
      left: 0;
      background: rgba(0,212,255,0.9);
      color: #000;
      font-size: 10px;
      font-family: monospace;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
      z-index: 999999;
      pointer-events: none;
      white-space: nowrap;
    `;
    badge.textContent = `🔬 CaptchaIQ: ${type} detected`;

    const parent = element.parentElement;
    if (parent) {
      const originalPosition = window.getComputedStyle(parent).position;
      if (originalPosition === "static") {
        parent.style.position = "relative";
      }
      parent.appendChild(badge);
    }
  }

  function reportDetection(challenges) {
    // Report to extension background — for research dashboard only
    chrome.runtime.sendMessage({
      type: "CHALLENGE_DETECTED",
      payload: {
        url: window.location.hostname,
        count: challenges.length,
        types: challenges.map((c) => c.type),
        timestamp: Date.now(),
      },
    });
  }

  // ─── MutationObserver — watch for dynamically injected CAPTCHAs ────────────
  function startObserver() {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          detectChallenges();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Only run if research mode is enabled via extension storage
    chrome.storage.sync.get(["captchaiqEnabled"], (result) => {
      if (result.captchaiqEnabled === false) return;
      detectChallenges();
      startObserver();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
