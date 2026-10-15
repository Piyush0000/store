'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { festivalColor, festivalVisual, type FestivalTheme } from '@/lib/festival-theme';
import './FestivalCultureScene.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ART_DIRECTION: Record<string, { className: string; defaults: [string, string, string, string]; title: string; foot: string }> = {
  'raksha-bandhan': { className: 'rakhi', defaults: ['#4c235e', '#e6bd72', '#fff8ed', '#fffaf5'], title: 'Threads that bring us closer', foot: 'A bond woven with love' },
  'ganesh-chaturthi': { className: 'ganesh', defaults: ['#783b25', '#e6a849', '#fff4df', '#fffaf2'], title: 'A season for new beginnings', foot: 'Celebrate with warmth and joy' },
  navratri: { className: 'navratri', defaults: ['#54234e', '#e8ae52', '#fff5e8', '#fffaf5'], title: 'Nine nights, one joyful rhythm', foot: 'Move to the rhythm of celebration' },
  'durga-puja': { className: 'durga', defaults: ['#7b283b', '#e5b96c', '#fff6ea', '#fffaf4'], title: 'A city dressed for celebration', foot: 'Tradition, artistry, togetherness' },
  dussehra: { className: 'dussehra', defaults: ['#291b3a', '#f2b64f', '#fff4e2', '#fff9ef'], title: 'A night when good shines through', foot: 'The joy of Vijayadashami' },
  pongal: { className: 'pongal', defaults: ['#5b482d', '#e3ba65', '#fff4dc', '#fffaf1'], title: 'Gather for a season of plenty', foot: 'Celebrate the joy of the harvest' },
  lohri: { className: 'lohri', defaults: ['#492a2c', '#efad55', '#fff1d8', '#fff9ed'], title: 'Warm moments, shared together', foot: 'A winter evening in celebration' },
  onam: { className: 'onam', defaults: ['#25463c', '#e3c16d', '#f6f1d7', '#fffbed'], title: 'Welcome a season in bloom', foot: 'A celebration of Kerala traditions' },
  baisakhi: { className: 'baisakhi', defaults: ['#55412a', '#e6bb55', '#fff2d6', '#fff9ea'], title: 'Celebrate the golden harvest', foot: 'A season of gratitude and joy' },
  bihu: { className: 'bihu', defaults: ['#3c3430', '#d9a94c', '#f8eed9', '#fff9ed'], title: 'A new season, a joyful rhythm', foot: 'Celebrate Assam in spring' },
  dhanteras: { className: 'dhanteras', defaults: ['#402b35', '#e5bd6b', '#fff7e8', '#fffaf3'], title: 'Make room for something precious', foot: 'A gift for the year ahead' },
  janmashtami: { className: 'janmashtami', defaults: ['#203a55', '#e6c277', '#f4f1e5', '#fffaf2'], title: 'A night filled with wonder', foot: 'Celebrate stories, music, and joy' },
  'ugadi-gudi-padwa': { className: 'ugadi', defaults: ['#4b633d', '#e9c16a', '#f5efd9', '#fff9ed'], title: 'Welcome a fresh beginning', foot: 'A new year, a new story' },
  'eid-al-fitr': { className: 'eid-fitr', defaults: ['#173b43', '#d9bd78', '#eff5e9', '#fffaf0'], title: 'Gather in the joy of Eid', foot: 'A time for gratitude and generosity' },
  'eid-al-adha': { className: 'eid-adha', defaults: ['#293b48', '#d8b66e', '#f3f0e6', '#fffaf3'], title: 'Share what matters most', foot: 'A celebration of care and community' },
  ramadan: { className: 'ramadan', defaults: ['#182d47', '#e5c87e', '#f3f0e2', '#fffaf2'], title: 'A season of reflection and light', foot: 'Moments of peace, shared at dusk' },
  'valentines-day': { className: 'valentine', defaults: ['#56263d', '#e7a9a4', '#fff0ed', '#fff9f6'], title: 'Make room for a little more love', foot: 'Thoughtful moments, beautifully shared' },
  'new-year': { className: 'new-year', defaults: ['#1b293c', '#e9c66f', '#f2f1ec', '#fffaf4'], title: 'Here is to what comes next', foot: 'A bright beginning awaits' },
  'mothers-day': { className: 'mothers', defaults: ['#604050', '#edb79f', '#fff4eb', '#fffaf5'], title: 'For all the love she gives', foot: 'Celebrate her, in your own way' },
  'fathers-day': { className: 'fathers', defaults: ['#334452', '#c9b27a', '#edf0ef', '#fffaf3'], title: 'For the steady hand beside you', foot: 'A thoughtful day for dad' },
  'friendship-day': { className: 'friendship', defaults: ['#344961', '#e7bc70', '#f1f4ed', '#fffaf2'], title: 'Good things are better together', foot: 'Celebrate the people who get you' },
  'childrens-day': { className: 'children', defaults: ['#36576a', '#edbd69', '#fff4de', '#fffaf2'], title: 'A little wonder goes a long way', foot: 'Make today a day to play' },
  'independence-day': { className: 'independence', defaults: ['#24454a', '#e8bd70', '#f2f1e8', '#fffaf4'], title: 'Celebrate freedom and possibility', foot: 'A spirit of unity and hope' },
  'republic-day': { className: 'republic', defaults: ['#2c4652', '#dfb763', '#f1f2e8', '#fffaf4'], title: 'Together in many voices', foot: 'Celebrate the promise of our republic' },
  easter: { className: 'easter', defaults: ['#4f4966', '#e8b3a8', '#f7f0ec', '#fffaf7'], title: 'A season of fresh beginnings', foot: 'Welcome the light of spring' },
};

const MOTION: Record<string, { target: string; values: gsap.TweenVars; duration: number }> = {
  'raksha-bandhan': { target: '.culture-art__threads svg', values: { x: 7, rotation: 1.5, transformOrigin: '50% 50%' }, duration: 5.5 },
  'ganesh-chaturthi': { target: '.culture-art__modak svg', values: { y: -12, scale: 1.025, transformOrigin: '50% 70%' }, duration: 3.8 },
  navratri: { target: '.culture-art__mandala svg', values: { rotation: 8, transformOrigin: '50% 50%' }, duration: 17 },
  'durga-puja': { target: '.culture-art__arch svg', values: { yPercent: -2, scale: 1.012, transformOrigin: '50% 100%' }, duration: 5.2 },
  dussehra: { target: '.dussehra__firelight', values: { opacity: .62, scale: 1.12, transformOrigin: '50% 50%' }, duration: 2.4 },
  pongal: { target: '.culture-art__pongal svg', values: { y: -9, rotation: .8, transformOrigin: '50% 80%' }, duration: 4.2 },
  lohri: { target: '.culture-art__lohri svg path:nth-of-type(2)', values: { scale: 1.08, opacity: .82, transformOrigin: '50% 75%' }, duration: .9 },
  onam: { target: '.culture-art__onam svg', values: { rotation: -7, transformOrigin: '50% 53%' }, duration: 18 },
  baisakhi: { target: '.culture-art__baisakhi svg g', values: { rotation: 4, transformOrigin: '50% 100%' }, duration: 3.5 },
  bihu: { target: '.culture-art__bihu svg', values: { x: 8, rotation: .8, transformOrigin: '50% 50%' }, duration: 4.8 },
  dhanteras: { target: '.culture-art__dhanteras svg', values: { rotation: 3, transformOrigin: '50% 50%' }, duration: 14 },
  janmashtami: { target: '.culture-art__janmashtami svg circle', values: { opacity: .45, scale: .72, transformOrigin: '50% 50%' }, duration: 1.8 },
  'ugadi-gudi-padwa': { target: '.culture-art__ugadi svg path:nth-of-type(2)', values: { rotation: 3, transformOrigin: '50% 0%' }, duration: 3.7 },
  'eid-al-fitr': { target: '.culture-art__eid-fitr svg path:nth-of-type(1)', values: { opacity: .7 }, duration: 3.4 },
  'eid-al-adha': { target: '.culture-art__eid-adha svg', values: { rotation: 2.5, transformOrigin: '50% 50%' }, duration: 16 },
  ramadan: { target: '.culture-art__ramadan svg path:first-child, .culture-art__ramadan svg path:nth-child(2)', values: { rotation: 2.5, transformOrigin: '50% 0%' }, duration: 3.2 },
  'valentines-day': { target: '.culture-art__valentine svg path:nth-of-type(2)', values: { scale: 1.025, transformOrigin: '50% 48%' }, duration: 3.3 },
  'new-year': { target: '.culture-art__new-year svg path:nth-of-type(1)', values: { rotation: 12, transformOrigin: '50% 50%' }, duration: 7 },
  'mothers-day': { target: '.culture-art__mothers svg path:nth-of-type(2)', values: { rotation: 3, transformOrigin: '50% 100%' }, duration: 4.1 },
  'fathers-day': { target: '.culture-art__fathers svg path:nth-of-type(3)', values: { rotation: 2, transformOrigin: '50% 20%' }, duration: 3.5 },
  'friendship-day': { target: '.culture-art__friendship svg path:nth-of-type(1), .culture-art__friendship svg path:nth-of-type(2)', values: { rotation: 1.5, transformOrigin: '50% 50%' }, duration: 5.5 },
  'childrens-day': { target: '.culture-art__children svg path:first-child', values: { rotation: 4, x: 5, transformOrigin: '50% 50%' }, duration: 3.4 },
  'independence-day': { target: '.culture-art__national--independence .national__chakra', values: { rotation: 360, transformOrigin: '50% 50%' }, duration: 12 },
  'republic-day': { target: '.culture-art__national--republic .national__chakra', values: { rotation: 360, transformOrigin: '50% 50%' }, duration: 12 },
  easter: { target: '.culture-art__easter svg ellipse', values: { y: -7, rotation: 3, transformOrigin: '50% 50%' }, duration: 2.5 },
};

function SceneArt({ id }: { id: string }) {
  if (id === 'dussehra') return <div className="culture-art__dussehra" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none">
    <defs>
      <linearGradient id="dussehra-arch" x1="310" y1="78" x2="310" y2="478" gradientUnits="userSpaceOnUse"><stop stopColor="#f6ce82"/><stop offset="1" stopColor="#d96f50"/></linearGradient>
      <linearGradient id="dussehra-robe" x1="430" y1="243" x2="430" y2="505" gradientUnits="userSpaceOnUse"><stop stopColor="#c45c42"/><stop offset="1" stopColor="#642743"/></linearGradient>
      <radialGradient id="dussehra-glow"><stop stopColor="#ffd77a" stopOpacity=".72"/><stop offset="1" stopColor="#f27b45" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="430" cy="340" rx="178" ry="225" fill="url(#dussehra-glow)" className="dussehra__firelight"/>
    <circle cx="157" cy="153" r="74" fill="#f2ae54" fillOpacity=".16"/><circle cx="157" cy="153" r="53" stroke="#ffd995" strokeOpacity=".42" strokeWidth="2"/>
    <path d="M61 490V270C61 157 141 75 246 75c106 0 186 82 186 195v70" stroke="url(#dussehra-arch)" strokeWidth="8"/>
    <path d="M89 490V279c0-97 67-164 157-164s157 67 157 164v66" stroke="#f7d795" strokeOpacity=".45" strokeWidth="2"/>
    <path d="M119 489V292c0-77 52-130 127-130s127 53 127 130v62" stroke="#e98560" strokeOpacity=".62" strokeWidth="5"/>
    <path d="M49 214c83 49 162 49 237 0s154-49 237 0" stroke="#f5c46d" strokeWidth="3"/>
    <path d="M63 218v43m56-18v41m56-26v46m56-47v49m56-67v54m56-33v51m56-84v52m56-65v43" stroke="#f5c46d" strokeWidth="2"/>
    <g fill="#ffdf91"><circle cx="63" cy="263" r="5"/><circle cx="119" cy="284" r="5"/><circle cx="175" cy="304" r="5"/><circle cx="231" cy="306" r="5"/><circle cx="287" cy="275" r="5"/><circle cx="343" cy="273" r="5"/><circle cx="399" cy="266" r="5"/><circle cx="455" cy="249" r="5"/></g>
    <path d="M359 501h157l-18-174c-4-34-29-59-61-59h-1c-32 0-57 25-61 59l-16 174Z" fill="url(#dussehra-robe)" stroke="#f0be67" strokeWidth="4"/>
    <path d="m359 501 77-66 77 66m-125-182 48 35 48-35m-91 60 43 33 43-33" stroke="#f7d48a" strokeOpacity=".84" strokeWidth="3"/>
    <path d="M348 509c-12-16 7-27 1-45 18 12 21 23 14 34 12-7 15-17 12-26 17 17 16 32 3 42-10 8-23 6-30-5Zm174 0c12-16-7-27-1-45-18 12-21 23-14 34-12-7-15-17-12-26-17 17-16 32-3 42 10 8 23 6 30-5Z" fill="#f38a4e" stroke="#ffd176" strokeWidth="2"/>
    <path d="M358 507c-5-10 5-16 3-25 9 8 10 14 5 21m147 4c5-10-5-16-3-25-9 8-10 14-5 21" stroke="#fff0a7" strokeWidth="3" strokeLinecap="round"/>
    <path d="M436 267v-28m-56 54 17-27m95 27-17-27" stroke="#f0be67" strokeWidth="4"/>
    <g stroke="#f7d48a" strokeWidth="2.5">
      <circle cx="341" cy="205" r="18" fill="#7b3545"/><path d="m324 195 17-20 17 20m-26 1h18" fill="#d27455"/>
      <circle cx="379" cy="177" r="19" fill="#7b3545"/><path d="m361 167 18-22 18 22m-27 1h18" fill="#d27455"/>
      <circle cx="417" cy="160" r="20" fill="#7b3545"/><path d="m398 150 19-23 19 23m-28 1h18" fill="#d27455"/>
      <circle cx="455" cy="160" r="20" fill="#7b3545"/><path d="m436 150 19-23 19 23m-28 1h18" fill="#d27455"/>
      <circle cx="493" cy="177" r="19" fill="#7b3545"/><path d="m475 167 18-22 18 22m-27 1h18" fill="#d27455"/>
      <circle cx="531" cy="205" r="18" fill="#7b3545"/><path d="m514 195 17-20 17 20m-26 1h18" fill="#d27455"/>
      <circle cx="360" cy="151" r="16" fill="#7b3545"/><path d="m345 143 15-18 15 18m-23 1h16" fill="#d27455"/>
      <circle cx="398" cy="126" r="17" fill="#7b3545"/><path d="m382 117 16-20 16 20m-24 1h16" fill="#d27455"/>
      <circle cx="474" cy="126" r="17" fill="#7b3545"/><path d="m458 117 16-20 16 20m-24 1h16" fill="#d27455"/>
      <circle cx="512" cy="151" r="16" fill="#7b3545"/><path d="m497 143 15-18 15 18m-23 1h16" fill="#d27455"/>
    </g>
    <path d="M560 273 441 329" stroke="#fff0c5" strokeWidth="3"/><path d="m454 317-13 12 18 2" stroke="#fff0c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M65 512c64-25 124-32 181-20 48 10 86 11 113 0m-302 23h507" stroke="#f1bd68" strokeOpacity=".72" strokeWidth="3"/>
    <path d="M80 513v48m58-43v43m58-39v39m58-35v35m58-36v36m58-42v42m58-49v49m58-57v57m58-60v60" stroke="#e68a5a" strokeOpacity=".45" strokeWidth="2"/>
    <path d="M44 562c59-22 117-22 174 0m194-1c55-26 109-26 164 0" stroke="#d66f4e" strokeOpacity=".65" strokeWidth="5"/>
    <g fill="#ffd77a"><circle cx="85" cy="115" r="4"/><circle cx="270" cy="104" r="4"/><circle cx="563" cy="91" r="5"/><circle cx="583" cy="244" r="3"/><circle cx="298" cy="190" r="3"/></g>
    <path d="m95 348 8 19 20 1-16 12 6 19-18-11-17 11 6-19-16-12 20-1 7-19Zm493-93 6 14 15 1-12 9 5 15-14-9-13 9 5-15-12-9 15-1 5-14Z" fill="#ffd77a"/>
  </svg></div>;
  if (id === 'valentines-day') return <div className="culture-art__valentine" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M310 496S112 382 112 246c0-78 96-114 156-54 19 19 31 39 42 56 11-17 23-37 42-56 60-60 156-24 156 54 0 136-198 250-198 250Z" stroke="#edb1a8" strokeWidth="5"/><path d="M310 435S163 344 163 250c0-48 59-70 97-33 24 24 37 55 50 76 13-21 26-52 50-76 38-37 97-15 97 33 0 94-147 185-147 185Z" fill="#d77d83" fillOpacity=".22" stroke="#f8d5c8" strokeWidth="2"/><path d="M310 202c-22 25-22 52 0 78 22-26 22-53 0-78Z" fill="#f5c97d"/><circle cx="178" cy="183" r="5" fill="#f5c97d"/><circle cx="445" cy="185" r="5" fill="#f5c97d"/></svg></div>;
  if (id === 'new-year') return <div className="culture-art__new-year" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="310" r="205" stroke="#e6c579" strokeOpacity=".3" strokeWidth="2"/><circle cx="310" cy="310" r="151" stroke="#e6c579" strokeOpacity=".52" strokeWidth="2"/><circle cx="310" cy="310" r="98" stroke="#fff0c8" strokeWidth="2"/><path d="M310 210v105l81 49" stroke="#f4d68d" strokeWidth="6" strokeLinecap="round"/><circle cx="310" cy="310" r="10" fill="#f4d68d"/>{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 310 310)`}><path d="M310 73v20" stroke="#e9ce89" strokeWidth="3" strokeLinecap="round"/></g>)}<path d="m119 167 10 23 24 1-19 15 7 23-22-14-21 14 7-23-19-15 24-1 9-23Zm370 116 7 15 16 1-13 10 5 16-15-10-14 10 5-16-13-10 16-1 6-15Z" fill="#f4d68d"/></svg></div>;
  if (id === 'mothers-day') return <div className="culture-art__mothers" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M310 500V255m0 102c-70-9-108-47-101-103 55-6 91 28 101 103Zm0-69c67-18 92-63 68-114-53 8-80 46-68 114Zm0 166c-65-18-116-17-154 3m154-3c65-18 116-17 154 3" stroke="#91a878" strokeWidth="6" strokeLinecap="round"/><path d="M310 175c-37 39-37 80 0 119 37-39 37-80 0-119Zm-72 46c-6 49 17 77 67 83 6-49-17-77-67-83Zm144 0c6 49-17 77-67 83-6-49 17-77 67-83Zm-106-94c-22 44-9 78 38 99 22-44 9-78-38-99Z" fill="#e9a79f"/><path d="M95 520c66-30 137-45 215-45s149 15 215 45" stroke="#e4c882" strokeWidth="3"/></svg></div>;
  if (id === 'fathers-day') return <div className="culture-art__fathers" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M190 155h240l-17 284c-2 35-31 62-66 62h-74c-35 0-64-27-66-62l-17-284Z" stroke="#d6c18b" strokeWidth="3"/><path d="M190 155h240v69H190z" fill="#d6c18b" fillOpacity=".18" stroke="#e8d6aa" strokeWidth="3"/><path d="m270 224 40 52 40-52-19 168-21 28-21-28-19-168Z" fill="#c87d69"/><path d="M310 276v144" stroke="#f4e9cd" strokeWidth="3"/><path d="M142 508h336M165 110h290" stroke="#d6c18b" strokeWidth="2"/><circle cx="310" cy="109" r="7" fill="#f1d997"/></svg></div>;
  if (id === 'friendship-day') return <div className="culture-art__friendship" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M114 313c0-100 81-181 181-181h42c94 0 169 76 169 169 0 48-39 87-87 87h-44" stroke="#e8c77d" strokeWidth="24" strokeLinecap="round"/><path d="M506 307c0 100-81 181-181 181h-42c-94 0-169-76-169-169 0-48 39-87 87-87h44" stroke="#d98070" strokeWidth="24" strokeLinecap="round"/><path d="m245 310 44-44m42 88 44-44" stroke="#f7ead0" strokeWidth="5" strokeLinecap="round"/><circle cx="310" cy="310" r="13" fill="#e8c77d"/><circle cx="180" cy="154" r="5" fill="#f5d888"/><circle cx="443" cy="468" r="5" fill="#f5d888"/></svg></div>;
  if (id === 'childrens-day') return <div className="culture-art__children" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M310 116 440 240 310 364 180 240l130-124Z" fill="#e3ad59" fillOpacity=".24" stroke="#efd18a" strokeWidth="4"/><path d="m310 116 0 248m-130-124h260" stroke="#fff1d0" strokeWidth="3"/><path d="M310 364c-13 53 23 55 8 96-10 29-41 43-49 74m40-74c10 37 48 34 65 64" stroke="#d88c72" strokeWidth="4" strokeLinecap="round"/><path d="M85 164c30-21 64-24 96-8m260 318c31-19 65-20 96-3" stroke="#8eb0a0" strokeWidth="4" strokeLinecap="round"/><circle cx="106" cy="252" r="5" fill="#f3d487"/><circle cx="498" cy="174" r="6" fill="#f3d487"/></svg></div>;
  if (id === 'independence-day' || id === 'republic-day') return <div className={`culture-art__national culture-art__national--${id}`} aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="310" r="205" stroke="#e5c781" strokeOpacity=".3" strokeWidth="2"/><circle cx="310" cy="310" r="150" stroke="#e5c781" strokeOpacity=".6" strokeWidth="2"/><path d="M310 142v336" stroke="#f3e6c9" strokeOpacity=".8" strokeWidth="2"/><path d="M180 222h260m-260 176h260" stroke="#f0a361" strokeWidth="26" strokeLinecap="round"/><path d="M200 310h220" stroke="#71987b" strokeWidth="26" strokeLinecap="round"/><circle className="national__chakra" cx="310" cy="310" r="42" stroke="#f3dfad" strokeWidth="3"/><circle cx="310" cy="310" r="8" fill="#f3dfad"/>{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 310 310)`}><path d="M310 272v-17" stroke="#f3dfad" strokeWidth="2"/></g>)}</svg></div>;
  if (id === 'easter') return <div className="culture-art__easter" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M310 475c-88-52-120-151-70-231 43-69 95-127 70-185 81 69 144 154 142 246-2 86-60 155-142 170Z" fill="#a8b28a" fillOpacity=".22" stroke="#c5d6a8" strokeWidth="3"/><path d="M310 475V118m0 144c-48-49-91-57-129-38m129 94c49-53 91-64 129-45" stroke="#d7c27e" strokeWidth="4"/><ellipse cx="207" cy="387" rx="42" ry="54" fill="#e6b7a5"/><ellipse cx="413" cy="387" rx="42" ry="54" fill="#e4cf87"/><path d="M177 386h60m-30-43v88m176-45h60m-30-43v88" stroke="#fff0df" strokeWidth="4"/><circle cx="150" cy="213" r="5" fill="#edd38c"/><circle cx="458" cy="190" r="5" fill="#edd38c"/></svg></div>;
  if (id === 'dhanteras') return <div className="culture-art__dhanteras" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="316" r="218" stroke="#e4bf72" strokeOpacity=".42" strokeWidth="2"/><circle cx="310" cy="316" r="166" stroke="#f3dfab" strokeOpacity=".48" strokeWidth="1.5"/><path d="m310 150 133 166-133 166-133-166 133-166Z" fill="#d3a956" fillOpacity=".12" stroke="#efd084" strokeWidth="3"/><path d="m310 207 77 109-77 109-77-109 77-109Z" fill="#e8c477" fillOpacity=".22" stroke="#fff0c9" strokeWidth="2"/><circle cx="310" cy="316" r="50" fill="#dbb45f"/><path d="M282 316h56m-28-28v56" stroke="#fff4d6" strokeWidth="5" strokeLinecap="round"/><path d="M310 82v26m0 416v26M76 316h26m416 0h26M145 151l19 19m292 292 19 19m0-330-19 19m-292 292-19 19" stroke="#e9c77b" strokeWidth="5" strokeLinecap="round"/></svg></div>;
  if (id === 'janmashtami') return <div className="culture-art__janmashtami" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="284" r="191" stroke="#d8bd7c" strokeOpacity=".35" strokeWidth="2"/><circle cx="310" cy="284" r="138" stroke="#d8bd7c" strokeOpacity=".28" strokeWidth="2"/><path d="M175 412c0-73 60-132 135-132s135 59 135 132v65H175v-65Z" fill="#e6d7ad"/><path d="M175 414c58 30 212 30 270 0" stroke="#fff4d9" strokeWidth="8"/><path d="M225 270c-38 22-59 56-59 100m229-100c38 22 59 56 59 100" stroke="#d8bd7c" strokeWidth="5" strokeLinecap="round"/><path d="M214 253c64 23 128 23 192 0" stroke="#f1d98f" strokeWidth="5" strokeLinecap="round"/><path d="M310 100v30m-130 20 20 23m240-23-20 23M86 251l29 10m419-10-29 10M130 119l19 19m322-19-19 19" stroke="#f2d990" strokeWidth="4" strokeLinecap="round"/><circle cx="310" cy="185" r="8" fill="#efcf79"/><circle cx="190" cy="215" r="5" fill="#efcf79"/><circle cx="431" cy="215" r="5" fill="#efcf79"/></svg></div>;
  if (id === 'ugadi-gudi-padwa') return <div className="culture-art__ugadi" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M100 240c37-73 93-96 151-74 21-81 107-111 157-51 54-34 118-4 126 61 28-4 52 8 68 36" stroke="#e5c77e" strokeWidth="8" strokeLinecap="round"/><path d="M168 210c-28-55-8-103 29-124 44 35 47 78 29 117m89-52c-13-61 18-99 60-109 34 44 22 85-5 113m123 6c0-57 35-91 78-91 25 50 6 88-27 108" fill="#87a56b" stroke="#b9bf7b" strokeWidth="3"/><path d="M320 172v286" stroke="#e8bd63" strokeWidth="7"/><path d="M240 227h160v62H240z" fill="#d9ae54"/><path d="M257 248h126m-126 19h126" stroke="#fff1ce" strokeWidth="5"/><path d="M320 458c-45 0-78 21-99 63h198c-21-42-54-63-99-63Z" fill="#d37a4a"/><path d="M100 515h440" stroke="#ead18c" strokeWidth="3"/></svg></div>;
  if (id === 'eid-al-fitr') return <div className="culture-art__eid-fitr" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="330" cy="284" r="163" stroke="#e0c880" strokeOpacity=".38" strokeWidth="2"/><path d="M367 112c-94 33-133 145-83 231 40 69 122 93 193 55-24 82-100 140-190 140-111 0-202-91-202-203s91-203 203-203c28 0 55 6 79 16Z" fill="#e9d18f"/><path d="m456 143 10 28 29 1-23 18 8 29-24-17-24 17 8-29-23-18 29-1 10-28Z" fill="#fff2c7"/><circle cx="447" cy="267" r="7" fill="#fff2c7"/><circle cx="488" cy="337" r="5" fill="#e9d18f"/><path d="M105 439c70-31 138-31 205 0s137 31 205 0" stroke="#75a696" strokeWidth="4"/><path d="M160 486h300" stroke="#d8bf82" strokeWidth="2"/></svg></div>;
  if (id === 'eid-al-adha') return <div className="culture-art__eid-adha" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M310 90 490 195v208L310 508 130 403V195L310 90Z" stroke="#dfc681" strokeWidth="3"/><path d="m310 145 132 76v156l-132 76-132-76V221l132-76Z" stroke="#f3e6c6" strokeOpacity=".8" strokeWidth="2"/><path d="M310 200 395 310l-85 110-85-110 85-110Z" fill="#dbbd70" fillOpacity=".18" stroke="#e9d18f" strokeWidth="3"/><circle cx="310" cy="310" r="36" fill="#dfbf6f"/><path d="M287 310h46m-23-23v46" stroke="#fff4d8" strokeWidth="4" strokeLinecap="round"/><path d="M310 78v42m-202 190h42m318 0h42M310 500v42" stroke="#c7d2ad" strokeWidth="4" strokeLinecap="round"/></svg></div>;
  if (id === 'ramadan') return <div className="culture-art__ramadan" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M117 160h77v23l15 22v130c0 38-25 66-53 66s-53-28-53-66V205l14-22v-23Zm296 0h77v23l15 22v130c0 38-25 66-53 66s-53-28-53-66V205l14-22v-23Z" fill="#d8bd77" fillOpacity=".2" stroke="#e7ce8d" strokeWidth="4"/><path d="M130 235h65m232 0h65M156 215v162m296-162v162" stroke="#f4e8c5" strokeWidth="3"/><path d="M310 99c-88 30-130 127-97 208 27 68 98 106 169 92-27 58-85 98-153 98-94 0-170-76-170-170s76-170 170-170c29 0 57 7 81 20Z" fill="#e5cb83"/><path d="M309 461v38m-63-16v48m126-48v48" stroke="#dfc57e" strokeWidth="4" strokeLinecap="round"/><circle cx="403" cy="168" r="5" fill="#fff2cb"/><circle cx="448" cy="224" r="4" fill="#fff2cb"/><circle cx="214" cy="160" r="4" fill="#fff2cb"/></svg></div>;
  if (id === 'pongal') return <div className="culture-art__pongal" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M205 293h210l-18 159c-3 26-25 46-51 46h-72c-26 0-48-20-51-46l-18-159Z" fill="#c87446"/><path d="M191 293h238v39H191z" fill="#e8ad5a"/><path d="M215 282c18-34 43-44 76-31 27-51 83-42 93 6 29-9 53 10 55 35H205c0-4 3-7 10-10Z" fill="#fff2d1"/><path d="M228 347h164M239 390h142" stroke="#f1c780" strokeWidth="7" strokeLinecap="round"/><path d="M153 498c-9-104-23-201-54-294m68 294c11-124 27-225 69-333m259 333c9-104 23-201 54-294m-68 294c-11-124-27-225-69-333" stroke="#8da267" strokeWidth="10" strokeLinecap="round"/><path d="M95 204c25-22 57-28 84-16m-12-39c24-13 50-15 73-7m284 62c-25-22-57-28-84-16m12-39c-24-13-50-15-73-7" stroke="#d5b966" strokeWidth="5" strokeLinecap="round"/><path d="M115 521c120-50 270-50 390 0" stroke="#e6c873" strokeWidth="3"/></svg></div>;
  if (id === 'lohri') return <div className="culture-art__lohri" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="315" cy="360" r="205" stroke="#efad55" strokeOpacity=".27" strokeWidth="2"/><circle cx="315" cy="360" r="158" stroke="#efad55" strokeOpacity=".4" strokeWidth="2"/><path d="M225 455c-37-46-20-76 3-112 17-26 28-47 19-78 51 34 64 71 55 102 31-27 41-55 37-87 60 51 93 103 55 164-37 60-123 65-169 11Z" fill="#e56d43"/><path d="M270 452c-17-27-5-46 8-66 10-15 16-30 13-46 26 21 40 44 31 69 18-12 25-28 24-44 29 31 37 58 19 83-21 30-72 31-95 4Z" fill="#f4c36a"/><path d="m197 482 245-8m-206-31 166 66m-127-91-83 73m155-36 91 65" stroke="#8d5b3e" strokeWidth="12" strokeLinecap="round"/><path d="M134 240c32-15 70-16 101-3m-67-60c27-12 59-12 86 0m210 63c-32-15-70-16-101-3m67-60c-27-12-59-12-86 0" stroke="#e8c579" strokeWidth="4" strokeLinecap="round"/><circle cx="129" cy="320" r="5" fill="#f7d58b"/><circle cx="470" cy="284" r="6" fill="#f7d58b"/><circle cx="435" cy="205" r="4" fill="#f7d58b"/></svg></div>;
  if (id === 'onam') return <div className="culture-art__onam" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="330" r="225" stroke="#e7ca7c" strokeWidth="2"/><circle cx="310" cy="330" r="185" stroke="#f5e7b8" strokeWidth="2"/><circle cx="310" cy="330" r="130" stroke="#e7ca7c" strokeWidth="2"/>{Array.from({length:24},(_,i)=><g key={i} transform={`rotate(${i*15} 310 330)`}><path d="M310 105c-22 29-22 54 0 76 22-22 22-47 0-76Z" fill={i%3===0?'#d78354':i%3===1?'#f1d276':'#7d9e68'}/></g>)}{Array.from({length:16},(_,i)=><circle key={`dot-${i}`} cx={310+Math.cos(i*Math.PI/8)*156} cy={330+Math.sin(i*Math.PI/8)*156} r="5" fill="#f6e7b7"/>)}<circle cx="310" cy="330" r="57" fill="#d9ad55" fillOpacity=".82"/><path d="M310 283c-24 28-24 62 0 94 24-32 24-66 0-94Z" fill="#fff2d5"/></svg></div>;
  if (id === 'baisakhi') return <div className="culture-art__baisakhi" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none">{Array.from({length:11},(_,i)=><g key={i} transform={`translate(${80+i*45} 0) rotate(${i%2?8:-8} 280 420)`}><path d={`M280 520V${175+(i%3)*26}`} stroke="#d7b75b" strokeWidth="5"/><path d={`M280 235c-65-30-75-80-56-115 61 8 85 47 56 115Zm0 61c-65-30-75-80-56-115 61 8 85 47 56 115Zm0 61c-65-30-75-80-56-115 61 8 85 47 56 115Z`} fill={i%2?'#9da365':'#d4b44e'} fillOpacity=".76"/></g>)}<path d="M70 525c137-36 343-36 480 0" stroke="#efd584" strokeWidth="3"/></svg></div>;
  if (id === 'bihu') return <div className="culture-art__bihu" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M115 120c100 100 100 280 0 380m390-380c-100 100-100 280 0 380" stroke="#e2bb70" strokeWidth="9"/><path d="M145 170c83 75 83 205 0 280m330-280c-83 75-83 205 0 280" stroke="#c65f4b" strokeWidth="15"/><path d="M175 217c62 52 62 154 0 206m270-206c-62 52-62 154 0 206" stroke="#f4e5c4" strokeWidth="7"/><path d="M220 240c30-39 67-60 90-56 22 4 32 30 15 49l-33 36m108-29c-29-34-67-56-90-52-22 4-32 30-15 49l33 36M222 400c31 38 66 57 89 54 22-4 32-30 15-49l-33-35m108 30c-29 34-67 55-90 51-22-4-32-29-15-48l33-34" stroke="#d6ab54" strokeWidth="8" strokeLinecap="round"/><circle cx="310" cy="312" r="53" fill="#c96e4b"/><path d="M275 309h70m-57-18h44m-44 36h44" stroke="#f8e8c6" strokeWidth="5" strokeLinecap="round"/></svg></div>;
  if (id === 'raksha-bandhan') return <div className="culture-art__threads" aria-hidden="true">
    <svg viewBox="0 0 650 620" fill="none"><path d="M705 125C520 40 440 205 335 260S116 348-45 255" stroke="#e8bf72" strokeWidth="11"/><path d="M704 170C520 80 437 244 330 300S118 390-43 300" stroke="#d95b71" strokeWidth="8"/><path d="M701 217C510 125 432 289 324 345S116 435-40 345" stroke="#88b9bf" strokeWidth="7"/><circle cx="326" cy="302" r="54" stroke="#f6d998" strokeWidth="3"/><circle cx="326" cy="302" r="28" fill="#d95b71"/><path d="M326 249l15 38 40 15-40 15-15 40-15-40-40-15 40-15 15-38Z" fill="#f2cd7f"/></svg>
  </div>;
  if (id === 'ganesh-chaturthi') return <div className="culture-art__modak" aria-hidden="true"><svg viewBox="0 0 560 640" fill="none"><path d="M280 110c-33 71-118 121-118 230 0 87 52 145 118 145s118-58 118-145c0-109-85-159-118-230Z" fill="#edc57d"/><path d="M280 110v375M218 163l62 72 62-72M180 220l100 90 100-90M165 275l115 95 115-95M175 335l105 80 105-80" stroke="#a85a39" strokeWidth="8" strokeLinecap="round"/><path d="M122 500c36-71 86-109 158-109s122 38 158 109c-85 82-231 82-316 0Z" fill="#8ca77a"/><path d="M280 391c-37 39-37 76 0 109 37-33 37-70 0-109Z" fill="#fff2d8"/></svg></div>;
  if (id === 'navratri') return <div className="culture-art__mandala" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="310" cy="310" r="230" stroke="#e9bd70" strokeWidth="2"/><circle cx="310" cy="310" r="184" stroke="#e9bd70" strokeWidth="1.5"/><circle cx="310" cy="310" r="118" stroke="#f7dfad" strokeWidth="2"/>{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 310 310)`}><path d="M310 76c-54 59-51 111 0 158 51-47 54-99 0-158Z" fill={i%2?'#c35e66':'#e7b15d'} fillOpacity=".78"/><path d="M310 122v112" stroke="#fff0d5" strokeWidth="2"/></g>)}<circle cx="310" cy="310" r="37" fill="#f2cf87"/><circle cx="310" cy="310" r="12" fill="#72304e"/></svg></div>;
  if (id === 'durga-puja') return <div className="culture-art__arch" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><path d="M90 600V290C90 153 188 55 310 55s220 98 220 235v310" stroke="#e8c57e" strokeWidth="9"/><path d="M132 600V300c0-112 78-190 178-190s178 78 178 190v300" stroke="#fff0d6" strokeWidth="2"/><path d="M194 600V326c0-73 48-122 116-122s116 49 116 122v274" stroke="#d9786b" strokeWidth="6"/><path d="M244 600V350c0-43 25-70 66-70s66 27 66 70v250" stroke="#e8c57e" strokeWidth="4"/><path d="M310 70v-36m-42 48-27-27m111 27 27-27M130 216l-38-12m398 12 38-12" stroke="#f1cb7c" strokeWidth="5" strokeLinecap="round"/><path d="M80 600h460" stroke="#e8c57e" strokeWidth="8"/></svg></div>;
  return <div className="culture-art__sun" aria-hidden="true"><svg viewBox="0 0 620 620" fill="none"><circle cx="340" cy="265" r="145" fill="#e5a64f" fillOpacity=".15"/><circle cx="340" cy="265" r="112" stroke="#f0c66f" strokeWidth="3"/>{Array.from({length:16},(_,i)=><path key={i} d="M340 76v-38" transform={`rotate(${i*22.5} 340 265)`} stroke="#f0c66f" strokeWidth="4" strokeLinecap="round"/>)}<path d="M340 174v182m-72-91h144" stroke="#fff2d2" strokeWidth="3"/><path d="M85 494c85-82 170-123 255-123s170 41 255 123" stroke="#e5a64f" strokeWidth="3"/><path d="M34 560c102-91 210-137 306-137s204 46 306 137" stroke="#f1d9aa" strokeWidth="2"/></svg></div>;
}

export default function FestivalCultureScene({ theme }: { theme: FestivalTheme }) {
  const root = useRef<HTMLElement>(null);
  const id = theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '';
  const art = ART_DIRECTION[id] || ART_DIRECTION['raksha-bandhan'];
  const visual = festivalVisual(theme);
  const link = theme.ctaLink?.startsWith('/') && !theme.ctaLink.startsWith('//') ? theme.ctaLink : '/catalogue';
  const style = {
    '--culture-primary': festivalColor(theme.palette?.primary, art.defaults[0]),
    '--culture-accent': festivalColor(theme.palette?.accent, art.defaults[1]),
    '--culture-surface': festivalColor(theme.palette?.surface, art.defaults[2]),
    '--culture-text': festivalColor(theme.palette?.text, art.defaults[3]),
  } as CSSProperties;

  useGSAP(() => {
    if (!root.current || theme.reducedMotionPreview || !visual.motion || visual.intensity === 'off' || visual.recipe === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const speed = (visual.speed === 'slow' ? 1.2 : visual.speed === 'fast' ? .82 : 1) * (visual.recipe === 'minimal' ? .72 : 1);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.culture-scene__art', { opacity: 0, scale: .88, y: 24, duration: .95 * speed })
      .from('.culture-scene__eyebrow', { opacity: 0, y: 18, duration: .5 * speed }, .18)
      .from('.culture-scene__title', { opacity: 0, y: 34, duration: .76 * speed }, .28)
      .from('.culture-scene__copy, .culture-scene__offer, .culture-scene__cta', { opacity: 0, y: 16, stagger: .1, duration: .55 * speed }, .58);
    const choreography = MOTION[id] || MOTION['raksha-bandhan'];
    const motion = visual.recipe === 'minimal' ? null : gsap.to(choreography.target, { ...choreography.values, duration: choreography.duration * speed, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    const replay = (event: MessageEvent) => { if (event.source === window.parent && event.data?.type === 'ORBIT_FESTIVAL_REPLAY') tl.restart(); };
    window.addEventListener('message', replay);
    const visibility = () => { if (!motion) return; if (document.hidden) motion.pause(); else motion.resume(); };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => { window.removeEventListener('message', replay); document.removeEventListener('visibilitychange', visibility); motion?.kill(); };
  }, { scope: root, dependencies: [id, theme.reducedMotionPreview, visual.motion, visual.intensity, visual.recipe, visual.speed], revertOnUpdate: true });

  return <section ref={root} className={`culture-scene culture-scene--${art.className}`} style={style} data-typography={visual.typography} data-button={visual.buttonStyle} aria-label={`${theme.name || 'Festival'} collection`}>
    <div className="culture-scene__backdrop" aria-hidden="true" />
    <div className="culture-scene__art"><SceneArt id={id} />{theme.imageUrl && !theme.imageUrl.startsWith('/festivals/') && <img src={theme.imageUrl} alt="" />}</div>
    <div className="culture-scene__content">
      <span className="culture-scene__eyebrow"><i aria-hidden="true" />{visual.eyebrow}</span>
      <h1 className="culture-scene__title">{theme.greeting || art.title}</h1>
      {theme.message && <p className="culture-scene__copy">{theme.message}</p>}
      {theme.offerLabel && theme.couponCode && <div className="culture-scene__offer">{theme.offerLabel} · {theme.couponCode}</div>}
      <Link href={link} className="culture-scene__cta">{theme.ctaText || 'Shop the collection'}<span aria-hidden="true">↗</span></Link>
    </div>
    <span className="culture-scene__footnote">{art.foot}</span>
  </section>;
}
