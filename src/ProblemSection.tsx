import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Quote } from 'lucide-react';
import './problem-section.css';

const concerns = [
  { id: 'budget', number: '01', label: 'INGRESOS QUE CAMBIAN', title: '¿Y si un mes no me alcanza?', description: 'Quieres empezar tu historial, pero te preocupa asumir un pago que después no puedas cubrir.' },
  { id: 'terms', number: '02', label: 'CONDICIONES CONFUSAS', title: '¿Qué me van a cobrar realmente?', description: 'Intereses, comisiones, fechas… Cuesta dar el paso cuando no tienes claro qué estarías aceptando.' },
  { id: 'later', number: '03', label: 'EL PRIMER PASO SE APLAZA', title: 'Quiero hacerlo. Lo veo el otro mes.', description: 'Sabes para qué quieres un historial. Aun así, buscar información y decidir se sigue quedando para después.' },
] as const;

function ConcernArt({ kind }: { kind: typeof concerns[number]['id'] }) {
  return <svg className={`concern-art concern-art-${kind}`} viewBox="0 0 260 120" fill="none" aria-hidden="true">
    <ellipse cx="132" cy="108" rx="81" ry="7" fill="#d9e8ef" opacity=".65" />
    {kind === 'budget' && <>
      <g className="art-main" transform="rotate(-7 120 70)">
        <rect x="55" y="36" width="130" height="68" rx="12" fill="#263c48" />
        <path d="M58 51h122" stroke="#4d6875" />
        <rect x="78" y="21" width="86" height="48" rx="6" fill="#6bdcff" />
        <path d="M89 32h27m-27 8h17" stroke="#1384a6" strokeWidth="3" strokeLinecap="round" />
        <rect x="55" y="53" width="130" height="51" rx="10" fill="#314e5d" />
        <path d="M57 65h126" stroke="#456776" strokeDasharray="3 4" />
        <path d="M57 91h126" stroke="#456776" strokeDasharray="3 4" />
        <rect x="157" y="66" width="37" height="24" rx="7" fill="#1c323e" />
        <circle cx="168" cy="78" r="3" fill="#00bfff" />
      </g>
      <g className="art-detail"><circle cx="195" cy="34" r="21" fill="white" stroke="#c6e1ec" /><text x="188" y="42" fontSize="25" fontFamily="Arial, sans-serif" fill="#007b9e" fontWeight="600">?</text></g>
      <circle cx="67" cy="91" r="13" fill="#8cdff6" stroke="#f7fcff" strokeWidth="3" /><path d="M67 84v14m4-11h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4h-7" stroke="#227e9b" strokeWidth="1.5" strokeLinecap="round" />
    </>}
    {kind === 'terms' && <>
      <g className="art-main" transform="rotate(7 130 61)">
        <path d="M89 11h88v93l-8-4-7 4-7-4-7 4-7-4-7 4-7-4-7 4-7-4-8 4-8-4-8 4V11Z" fill="white" stroke="#c8dfe9" />
        <rect x="103" y="25" width="57" height="5" rx="2.5" fill="#d8e9f1" /><path d="M103 43h29m-29 14h39m-39 14h34m-34 14h21" stroke="#d6e5ed" strokeWidth="3" strokeLinecap="round" />
        <path d="M149 43h13m-9 14h9m-14 14h14m-21 14h21" stroke="#80d9f2" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="art-detail"><rect x="39" y="38" width="65" height="25" rx="8" fill="#263c48" transform="rotate(-8 39 38)" /><text x="51" y="53" fontSize="11" fill="white" fontFamily="Arial, sans-serif" fontWeight="600">TCEA ¿?</text></g>
      <g transform="rotate(-8 192 82)"><circle cx="184" cy="73" r="22" fill="#dcf4ff" fillOpacity=".8" stroke="#087e9e" strokeWidth="4" /><path d="m200 91 15 17" stroke="#263c48" strokeWidth="9" strokeLinecap="round" /><path d="M174 69h17m-17 8h10" stroke="#78cce6" strokeWidth="3" strokeLinecap="round" /></g>
    </>}
    {kind === 'later' && <>
      <g className="art-main" transform="rotate(-6 129 64)">
        <rect x="78" y="22" width="103" height="83" rx="10" fill="white" stroke="#c8dfe9" />
        <path d="M78 32a10 10 0 0 1 10-10h83a10 10 0 0 1 10 10v17H78V32Z" fill="#88e0fa" />
        <path d="M99 16v16m60-16v16" stroke="#2f5366" strokeWidth="5" strokeLinecap="round" />
        <text x="101" y="69" fontFamily="Arial, sans-serif" fontSize="10" fill="#7b929f" letterSpacing="2">EL OTRO</text><text x="103" y="92" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="#263c48" letterSpacing="1">MES</text>
      </g>
      <g className="art-detail"><path d="M188 37a34 34 0 0 1 9 53" stroke="#5cb9d6" strokeWidth="2" strokeDasharray="4 4" /><path d="m197 80 1 11 11-2" stroke="#007b9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="61" cy="66" r="17" fill="#263c48" /><path d="M57 61v11m8-11v11" stroke="#7fe1fc" strokeWidth="3" strokeLinecap="round" /></g>
    </>}
  </svg>;
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    const frame = window.location.hash === '#te-suena' ? requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start' })) : undefined;
    return () => { observer.disconnect(); if (frame !== undefined) cancelAnimationFrame(frame); };
  }, []);

  return <section id="te-suena" className="problem-section" aria-labelledby="problem-title" ref={sectionRef} data-seen={seen}>
    <div className="problem-heading">
      <div><p className="problem-eyebrow"><span /> ¿TE SUENA?</p><h2 id="problem-title">La tienes en mente.<br /><span>Pero el paso se hace esperar.</span></h2></div>
      <p className="problem-intro">Quieres construir tu historial. Pero cuando piensas en tu primera tarjeta, también aparecen estas dudas.</p>
    </div>
    <div className="concern-grid">{concerns.map(concern => <article className="concern-card" key={concern.id}>
      <div className="concern-art-wrap"><span className="concern-number">{concern.number}</span><ConcernArt kind={concern.id} /></div>
      <div className="concern-copy"><p className="concern-label">{concern.label}</p><h3>{concern.title}</h3><p className="concern-description">{concern.description}</p></div>
    </article>)}</div>
    <div className="research-strip">
      <div className="research-quote"><span className="quote-icon"><Quote size={18} /></span><div><blockquote>“Ya llevo un año postergándolo. Me da miedo sacarla porque mi trabajo todavía es un poco inestable.”</blockquote><p>Estudiante de UTEC · Entrevistas del Equipo 06</p></div></div>
      <div className="research-context"><div className="sample-dots" aria-hidden="true">{Array.from({length:6},(_,i)=><span key={i} className={i<2?'highlight':''} />)}</div><p><strong>El 33,3 % de los entrevistados</strong> señaló la postergación de su primera tarjeta como su problema principal.</p><span>Exploración inicial con 6 entrevistados; no representa a todo el campus.</span></div>
    </div>
    <div className="problem-bridge"><span>Empezamos por aclarar los costos, las fechas y los pagos.</span><span>Tú decides cuándo dar el siguiente paso. <ArrowDown size={14} /></span></div>
  </section>;
}
