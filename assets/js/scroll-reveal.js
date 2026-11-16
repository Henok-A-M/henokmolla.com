
/* SCROLL-REVEAL CONTROLLER
   Uses IntersectionObserver to reveal elements as they enter view.
   The animation is skipped for visitors who prefer reduced motion.
   The project-folder click handler also restarts the README transition.
*/
/* Reveal sections progressively; don't hide content when JS or observers are unavailable. */
(()=>{const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
const targets=[...document.querySelectorAll('.section')].flatMap(section=>[...section.querySelectorAll('.kicker,h2,.aboutgrid>*,.skillsgrid>.skillcard,.foldergrid>.folder,.featurebox')].filter(el=>!el.closest('.filewindow')));
targets.forEach((el,i)=>{el.setAttribute('data-reveal','');const siblings=[...el.parentElement.children].filter(x=>x.matches('.skillcard,.folder,.featurebox'));const order=siblings.indexOf(el);if(order>=0)el.style.setProperty('--reveal-delay',Math.min(order*90,270)+'ms')});
if(!('IntersectionObserver'in window))return;
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
document.body.classList.add('motion-ready');targets.forEach(el=>observer.observe(el));
// Project panels animate independently when selected; leave hidden panels untouched.
})();
