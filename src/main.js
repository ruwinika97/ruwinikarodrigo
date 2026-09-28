import './style.css';

const sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
const moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/></svg>';
const themeButton = document.querySelector('.theme-toggle');
let savedTheme;
try { savedTheme = localStorage.getItem('rr-theme'); } catch {}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.innerHTML = theme === 'light' ? moon : sun;
  themeButton.setAttribute('aria-label', 'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' theme');
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f3f5ef' : '#101b18';
}
setTheme(savedTheme === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  try { localStorage.setItem('rr-theme', next); } catch {}
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => {
  el.classList.add('reveal-ready');
  observer.observe(el);
});

const progress = document.querySelector('.scroll-progress');
let ticking = false;
function updateScroll() {
  const available = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = 'scaleX(' + (available > 0 ? scrollY / available : 0) + ')';
  document.querySelector('.header').classList.toggle('scrolled', scrollY > 24);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; }
}, { passive: true });
updateScroll();

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.desktop-nav a').forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('nav-active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }
  });
}, { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter);
    if (!card.hidden) card.classList.add('visible');
  });
}));

const projects = {
  olympic: {
    category: 'PROFESSIONAL PROJECT · PROGRAMUS',
    title: 'Paris 2024 Booking App',
    subtitle: 'Bringing event booking interfaces to life.',
    summary: 'My CV includes the Paris Olympic 2024 Booking App among the projects I worked on as a UI/UX Engineer at Programus Pvt Ltd.',
    role: 'UI/UX Engineer', period: 'During Jan 2022 – Jun 2023',
    focus: 'At Programus, my responsibilities included Angular UI development, prototyping in Figma and Adobe XD, UI bug fixes, and accessibility-focused interface development.',
    context: 'Event booking connects discovery, venue information, and choosing an experience. The visual on this portfolio is a new illustrative interface study, rather than a screenshot of the delivered application.',
    tags: ['Angular', 'UI development', 'Prototyping', 'Accessibility'],
    note: 'The project is listed in my CV. Detailed deliverables and outcomes are not published here.'
  },
  music: {
    category: 'BSC FINAL-YEAR RESEARCH PROJECT',
    title: 'Emotion-Based Music Streaming',
    subtitle: 'What if your next song understood how you feel?',
    summary: 'An emotion-based online music streaming application consisting of both a mobile application and a web application, developed as my BSc undergraduate final-year research project.',
    role: 'Undergraduate research project', period: 'BSc final year',
    focus: 'The project explored emotion-informed music streaming through a mobile and web experience, using Android Studio, Java, Angular, TensorFlow, and Firebase.',
    context: 'This research connects my interest in music with software engineering. It explores how a listening experience can respond to a user’s emotional context.',
    tags: ['Android Studio', 'Java', 'Angular', 'TensorFlow', 'Firebase'],
    note: 'The portfolio preview is an illustrative concept. It does not represent a production screenshot or published performance results.'
  },
  performance: {
    category: 'MASTER’S FINAL-YEAR PROJECT · ONGOING',
    title: 'Employee Growth Platform',
    subtitle: 'A more connected path from performance to progress.',
    summary: 'Employee Performance Evaluations and Career Progression System: a web-based application to automate employee performance evaluation and provide appropriate training based on performance.',
    role: 'Master’s final-year project', period: 'Ongoing',
    focus: 'Developing a web-based system using Blazor, .NET, and SharePoint, connecting employee performance evaluation with training needs and career progression.',
    context: 'The project brings together enterprise application development and the design of useful workflows for people at work.',
    tags: ['Blazor', '.NET', 'SharePoint', 'Performance evaluation'],
    note: 'This is an ongoing academic project. The dashboard is illustrative; chart values are decorative and are not measured project outcomes.'
  },
  leave: {
    category: 'SECOND-YEAR GROUP PROJECT · 2019',
    title: 'Campus Leave Management',
    subtitle: 'Taking an everyday university process online.',
    summary: 'A web-based, fully automated leave management system for day scholars at the Southern Campus of General Sir John Kotelawala Defence University.',
    role: 'Group leader', period: '2019',
    focus: 'Led the second-year group project to develop an online leave management system using PHP, MySQL, HTML, and JavaScript.',
    context: 'A practical application of web development to an existing campus workflow, combining a student-facing process with an online management system.',
    tags: ['PHP', 'MySQL', 'HTML', 'JavaScript', 'Team leadership'],
    note: 'The preview is a new illustrative interface study. Original screenshots and detailed project outcomes are not included.'
  }
};
Object.assign(projects, {"sharepoint": {"category": "SHAREPOINT · INTRANET DESIGN", "title": "SharePoint Intranet Designs", "subtitle": "A more connected place to work.", "summary": "SharePoint intranet design work, bringing interface design into internal digital workplaces.", "role": "UI/UX design", "period": "Selected professional work", "focus": "Designing SharePoint intranet experiences with attention to visual hierarchy, navigation, and how employees find information.", "context": "The illustrative study explores a central home for company news, resources, and quick links. Actual intranet structures vary by project.", "tags": ["SharePoint", "Intranet design", "UI/UX"], "note": "This is an illustrative interface study. Client identities, original screens, and measured outcomes are not published here."}, "procurement": {"category": "ENTERPRISE APPLICATION · FRONTEND ENGINEERING", "title": "Procurement Management System", "subtitle": "Clarity for complex procurement workflows.", "summary": "Frontend engineering for a procurement management system using Fluent UI and Blazor.", "role": "Frontend engineering", "period": "Selected professional work", "focus": "Building procurement interfaces with Fluent UI components and Blazor, with a focus on consistent forms, readable information, and clear interactions.", "context": "The visual study explores request overviews and statuses as a way to make a complex business workflow easier to navigate. It does not describe an exhaustive list of delivered features.", "tags": ["Fluent UI", "Blazor", "Frontend engineering"], "note": "The preview is illustrative. Sample requests and statuses are demonstration content, not client data."}, "copilot": {"category": "AI · CUSTOM AGENT DEVELOPMENT", "title": "Custom Copilot Agent Development", "subtitle": "Useful conversations, built around real work.", "summary": "Development of custom Copilot agents for tailored conversational experiences.", "role": "Custom agent development", "period": "Selected professional work", "focus": "Creating custom Copilot agent experiences around a defined purpose and the tasks people need help with.", "context": "The concept preview illustrates a conversation entry point and suggested prompts. It is a visual study, not a live agent, and does not imply particular deployed integrations.", "tags": ["Microsoft Copilot", "Custom agents", "Conversational experiences"], "note": "The conversation preview is illustrative. Agent configurations and client-specific details are not published here."}, "capex": {"category": "POWER APPS · BUSINESS AUTOMATION", "title": "CAPEX Automation", "subtitle": "Bringing structure to capital expenditure requests.", "summary": "Capital expenditure automation using Microsoft Power Apps.", "role": "Power Apps development", "period": "Selected professional work", "focus": "Developing a Power Apps solution for CAPEX automation, connecting business process requirements with an application interface.", "context": "The illustrative study explores how a capital request can move through visible stages. Approval stages and form fields shown here are concept content, not a specification of the delivered solution.", "tags": ["Power Apps", "CAPEX", "Business automation"], "note": "The preview is illustrative. Request values, approval stages, and client details are not presented as actual project data."}, "documents": {"category": "POWER APPS · DOCUMENT WORKFLOWS", "title": "Document Approval Automations", "subtitle": "A clearer path from draft to decision.", "summary": "Document approval automation using Microsoft Power Apps.", "role": "Power Apps development", "period": "Selected professional work", "focus": "Developing Power Apps experiences for document approval processes, with a focus on clear submission and decision workflows.", "context": "The concept preview uses a document and review steps to illustrate the workflow. Actual routing rules and integrations depend on the project.", "tags": ["Power Apps", "Document approvals", "Workflow automation"], "note": "The preview is illustrative. Document contents and workflow statuses are demonstration content, not client records."}});
const dialog = document.querySelector('#project-dialog');
const dialogContent = document.querySelector('#dialog-content');
let lastProjectButton;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  lastProjectButton = button;
  dialogContent.innerHTML = '<div class="eyebrow">' + project.category + '</div><h2 id="dialog-title">' + project.title + '</h2><p class="dialog-subtitle">' + project.subtitle + '</p><div class="dialog-metadata"><div><small>ROLE / CONTEXT</small><strong>' + project.role + '</strong></div><div><small>TIMELINE</small><strong>' + project.period + '</strong></div></div><h3>Overview</h3><p>' + project.summary + '</p><h3>My contribution & focus</h3><p>' + project.focus + '</p><h3>The thinking behind it</h3><p>' + project.context + '</p><div class="skill-chips">' + project.tags.map(tag => '<span>' + tag + '</span>').join('') + '</div><p class="dialog-note">' + project.note + '</p><a class="button primary" href="mailto:truwinikarodrigo@gmail.com">Let’s talk about this project ↗</a>';
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  const box = dialog.getBoundingClientRect();
  if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  lastProjectButton?.focus({ preventScroll: true });
});

let toastTimer;
function toast(message) {
  const element = document.querySelector('.toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 3500);
}
document.querySelector('.copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('truwinikarodrigo@gmail.com'); toast('Email copied. Let’s make something great.'); }
  catch { toast('Please select the email address to copy it, or click it to send a message.'); }
});
document.querySelector('#year').textContent = new Date().getFullYear();
function updateTime() {
  document.querySelector('.location-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()) + ' LKT';
}
updateTime();
setInterval(updateTime, 60000);

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const visual = document.querySelector('.hero-visual');
  visual.addEventListener('pointermove', e => {
    if (reducedMotion.matches) return;
    const bounds = visual.getBoundingClientRect();
    visual.style.setProperty('--pointer-x', ((e.clientX - bounds.left) / bounds.width - .5) * 14 + 'deg');
    visual.style.setProperty('--pointer-y', -((e.clientY - bounds.top) / bounds.height - .5) * 12 + 'deg');
  });
  visual.addEventListener('pointerleave', () => {
    visual.style.setProperty('--pointer-x', '0deg');
    visual.style.setProperty('--pointer-y', '0deg');
  });
}


const contactForm = document.querySelector('#contact-form');
const messageField = document.querySelector('#contact-message');
const contactDraft = document.querySelector('#contact-draft');
const contactSend = document.querySelector('#contact-send');
let preparedMessage = '';
contactForm.addEventListener('input', () => {
  document.querySelector('#message-count').textContent = messageField.value.length + ' / 2000';
  contactDraft.hidden = true;
  contactSend.removeAttribute('href');
  preparedMessage = '';
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = contactForm.elements.name;
  name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
  messageField.setCustomValidity(messageField.value.trim().length >= 10 ? '' : 'Please include at least 10 characters in your message.');
  if (!contactForm.reportValidity()) return;
  const data = new FormData(contactForm);
  const subject = 'Portfolio enquiry: ' + data.get('interest');
  preparedMessage = 'Hi Ruwinika,\n\n' + data.get('message').trim() + '\n\n' + data.get('name').trim() + '\nReply to: ' + data.get('email').trim() + '\nInterested in: ' + data.get('interest');
  contactSend.href = 'mailto:truwinikarodrigo@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(preparedMessage);
  contactDraft.hidden = false;
  document.querySelector('#contact-status').textContent = 'Your draft is ready. Open your email app to review and send, or copy the message.';
  contactSend.focus({ preventScroll: true });
});
contactForm.querySelectorAll('input, textarea').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
document.querySelector('#copy-message').addEventListener('click', async () => {
  if (!preparedMessage) return;
  try { await navigator.clipboard.writeText(preparedMessage); toast('Message copied. Paste it into your email app to send.'); }
  catch { document.querySelector('#contact-status').textContent = 'Copy is unavailable. Use “Open email app” to review and send your message.'; }
});

dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')];
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
