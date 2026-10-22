import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Streamlit } from 'streamlit-component-lib';
import { ArrowUpRight, ArrowRight, Check, CheckCheck, ChevronRight, CreditCard, CalendarDays, Wallet, Sparkles, X, LockKeyhole, Wifi, Coffee, ShoppingBag, BookOpen, CircleHelp, Download } from 'lucide-react';
import './styles.css';

type Topic = 'costos' | 'fechas' | 'pagos';
type InterestEvent = { type: 'interest' | 'email'; at: string; email?: string };
const STORAGE_KEY = 'antes-mvp-events-v1';

function readEvents(): InterestEvent[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter((e): e is InterestEvent => !!e && (e.type === 'interest' || e.type === 'email') && typeof e.at === 'string') : [];
  } catch { return []; }
}

const examples = {
  costos: {
    tag: '01 / COSTOS', title: 'Un café no siempre cuesta solo un café.',
    text: 'Si una tarjeta cobra mantenimiento, ese cargo puede sumarse a lo que compras. Pregunta qué comisiones tiene y cuándo se aplican.',
    amount: 'S/ 15', label: 'Tu café', icon: Coffee,
    detail: '+ cargos, si corresponden', takeaway: 'Mira el costo completo, no solo la compra.',
  },
  fechas: {
    tag: '02 / FECHAS', title: 'El cierre y el pago son dos días distintos.',
    text: 'El cierre reúne las compras de un periodo. La fecha de pago es el límite para pagar ese estado de cuenta. Ubica ambas antes de usar tu tarjeta.',
    amount: '10 → 28', label: 'Cierre → fecha de pago', icon: CalendarDays,
    detail: 'Ejemplo de un mes', takeaway: 'Dos fechas que conviene tener en tu calendario.',
  },
  pagos: {
    tag: '03 / PAGOS', title: 'El pago mínimo no borra toda tu deuda.',
    text: 'Imagina que tu estado de cuenta es de S/ 200 y pagas S/ 40. Todavía quedan S/ 160, antes de posibles intereses o cargos.',
    amount: 'S/ 160', label: 'Aún pendientes', icon: Wallet,
    detail: 'S/ 200 − S/ 40 pagados', takeaway: 'Distingue el pago mínimo del pago total.',
  },
};

function App() {
  const [topic, setTopic] = useState<Topic>('costos');
  const [modal, setModal] = useState<'interest' | 'about' | 'metrics' | null>(null);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [events, setEvents] = useState(readEvents);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const example = examples[topic];
  const ExampleIcon = example.icon;

  useEffect(() => {
    if (window.parent === window) return;
    const resize = () => Streamlit.setFrameHeight(Math.ceil(document.getElementById('root')!.getBoundingClientRect().height));
    Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, resize);
    Streamlit.setComponentReady();
    const observer = new ResizeObserver(resize);
    observer.observe(document.getElementById('root')!);
    resize();
    return () => { observer.disconnect(); Streamlit.events.removeEventListener(Streamlit.RENDER_EVENT, resize); };
  }, []);

  useEffect(() => {
    if (!modal) return;
    triggerRef.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, input, a[href]');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      triggerRef.current?.focus();
    };
  }, [modal]);

  function record(event: InterestEvent) {
    const next = [...readEvents(), event];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setEvents(next);
      setStorageError(false);
      return true;
    } catch { setStorageError(true); return false; }
  }

  function showInterest() {
    record({ type: 'interest', at: new Date().toISOString() });
    setSaved(false);
    setEmail('');
    setModal('interest');
  }

  function exportEvents() {
    const blob = new Blob([JSON.stringify(readEvents(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'antes-interes-local.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearEvents() {
    if (!window.confirm('¿Borrar los registros de esta prueba en este navegador? Puedes exportarlos antes de continuar.')) return;
    try { localStorage.removeItem(STORAGE_KEY); setEvents([]); setStorageError(false); }
    catch { setStorageError(true); }
  }

  return (
    <div className="site-shell">
      <header className="header">
        <a className="brand" href="#" aria-label="antes, inicio">antes<span>.</span><span className="brand-star">✳</span></a>
        <div className="header-caption">DE ESTUDIANTES, PARA ESTUDIANTES.<br /><strong><span className="campus-name">UTEC</span> · LIMA, PERÚ</strong></div>
        <button className="header-link" onClick={() => setModal('about')}>La idea detrás <ArrowUpRight size={17} /></button>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span /> UTEC / TU PRIMERA TARJETA</div>
            <h1 id="hero-title">Tu primer crédito.<br />Con las cosas<br /><span className="clear-word">claras.<svg viewBox="0 0 350 20" aria-hidden="true"><path d="M5 12 Q160 -1 342 9 M20 18 Q180 5 322 15" /></svg></span><span className="title-spark" aria-hidden="true">✳</span></h1>
            <p className="hero-description">Que las condiciones del banco no te frenen.<br className="desktop-break" /> Entiende <strong>costos, fechas y pagos</strong> con ejemplos de tu día a día, antes de solicitar tu tarjeta.</p>
            <div className="cta-row"><button className="primary-button" onClick={showInterest}>Quiero esto <ArrowUpRight size={22} /></button><span className="cta-note">Primero entender.<br />Después decidir.</span></div>
            <div className="reassurance"><LockKeyhole size={13} /><span>Sin conectar tu banco. Sin solicitar una tarjeta.</span></div>
            <div className="audience-note"><span className="audience-icon"><BookOpen size={17} /></span><p>Pensado para estudiantes de <strong>UTEC</strong><br /><span>que quieren empezar su historial.</span></p></div>
          </div>

          <div className="visual-panel">
            <div className="visual-topline"><span>EL BANCO DICE…</span><span className="visual-top-right">TÚ LO ENTIENDES. <ArrowUpRight size={14} /></span></div>
            <div className="visual-stage" role="img" aria-label="Ilustración de una tarjeta de crédito y una explicación de sus condiciones en lenguaje cotidiano">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="floating-label label-left"><span className="tiny-dot" /> Sin letra pequeña</div>
              <div className="credit-card">
                <div className="card-heading"><span>tu primer<br /><strong>gran paso.</strong></span><span className="card-star">✳</span></div>
                <div className="card-chip-row"><svg className="chip" viewBox="0 0 45 33" aria-hidden="true"><rect x="1" y="1" width="43" height="31" rx="7" /><path d="M16 1v10H1m43 0H29V1M16 32V22H1m43 0H29v10M16 11h13v11H16z" /></svg><Wifi size={25} /></div>
                <div className="card-bottom"><span>MENOS DUDAS. MÁS CLARIDAD.</span><CreditCard size={26} strokeWidth={1.3} /></div>
              </div>
              <div className="translation-card"><div className="translation-icon"><ShoppingBag size={19} /></div><div><span>“Fecha de cierre”</span><p>El día en que el banco<br /><strong>hace la cuenta del mes.</strong></p></div><span className="translation-check"><Check size={15} /></span></div>
              <div className="round-stamp" aria-hidden="true"><ArrowUpRight size={34} /><span>A TU RITMO</span></div>
              <div className="stage-caption"><span className="hand-arrow">↳</span> Del lenguaje del banco al tuyo.</div>
            </div>

            <div className="example-area">
              <div className="example-header"><span>UN ADELANTO DE LA IDEA</span><span className="live-dot" title="Ejemplo interactivo" /></div>
              <div className="topic-tabs" aria-label="Elige un ejemplo">{(['costos', 'fechas', 'pagos'] as Topic[]).map((t) => <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)} className={topic === t ? 'active' : ''}>{t === 'costos' ? <CreditCard size={14} /> : t === 'fechas' ? <CalendarDays size={14} /> : <Wallet size={14} />}{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
              <div className="example-content" key={topic}>
                <div className="example-text"><h2>{example.title}</h2><p>{example.text}</p></div>
                <div className="receipt"><div className="receipt-label"><ExampleIcon size={14} />{example.label}</div><strong>{example.amount}</strong><span>{example.detail}</span></div>
              </div>
              <div className="example-bottom"><CheckCheck size={15} /><span>{example.takeaway}</span><ChevronRight size={15} /></div>
              <p className="example-disclaimer">Ejemplos ilustrativos. Las condiciones dependen de cada banco y tarjeta.</p>
            </div>
          </div>
        </section>

        <div className="bottom-strip"><span className="strip-label">ANTES DE DECIDIR</span><span><span className="step-number">01</span> Entiende lo que pagas</span><span><span className="step-number">02</span> Ubica tus fechas</span><span><span className="step-number">03</span> Decide con claridad <ArrowUpRight size={16} /></span></div>
      </main>
      <footer><span>antes<span className="accent">.</span> <span className="footer-divider">/</span> UTEC · Equipo 06</span><span>Proyecto académico independiente · Hecho por estudiantes</span><button onClick={() => { setEvents(readEvents()); setModal('metrics'); }}>Prueba local <ArrowUpRight size={12} /></button></footer>

      {modal && <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
          <button className="close-button" aria-label="Cerrar" ref={closeRef} onClick={() => setModal(null)}><X size={21} /></button>
          {modal === 'interest' && <>
            <div className="modal-symbol"><Sparkles size={27} /></div>
            <span className="modal-eyebrow">PRIMERO, LAS COSAS CLARAS</span>
            <h2 id="modal-title">Tu interés es<br />el primer paso<span className="accent">.</span></h2>
            {storageError ? <p className="error-message" role="alert">El navegador no permitió guardar los datos. Puedes seguir viendo los ejemplos.</p> : <p>Registramos tu clic en este navegador. Estamos probando esta idea, y saber que te interesa nos ayuda a darle forma.</p>}
            {!saved ? <form onSubmit={(e) => { e.preventDefault(); if (record({ type: 'email', at: new Date().toISOString(), email: email.trim().toLowerCase() })) setSaved(true); }}>
              <label htmlFor="email">¿Quieres dejar tu correo? <span>(opcional)</span></label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" maxLength={254} required />
              <p className="privacy-note">Al guardarlo, aceptas almacenarlo en este navegador para la prueba académica. Este prototipo no envía correos ni transmite tus datos.</p>
              <button className="primary-button" type="submit">Guardar mi interés <ArrowRight size={18} /></button>
            </form> : <div className="success-box" role="status"><Check size={22} /><div><strong>¡Listo! Tu correo quedó guardado.</strong><span>Solo en este navegador, para esta prueba.</span></div></div>}
            <button className="text-button" onClick={() => setModal(null)}>{saved ? 'Volver a los ejemplos' : 'Seguir sin dejar mi correo'} <ArrowRight size={15} /></button>
          </>}
          {modal === 'about' && <>
            <div className="modal-symbol"><CircleHelp size={27} /></div><span className="modal-eyebrow">EL PORQUÉ DE ANTES.</span><h2 id="modal-title">Entender antes<br />de comprometerte<span className="accent">.</span></h2>
            <p>Para estudiantes de UTEC que buscan su primera tarjeta para iniciar su historial, pero la postergan porque las condiciones del banco son confusas, explicamos los costos, fechas y pagos con ejemplos de la vida diaria, para que reconozcan qué compromiso asumirán antes de solicitarla.</p>
            <div className="about-note"><BookOpen size={20} /><p>Esta página es el MVP de la promesa del Equipo 06. El botón permite explorar si la propuesta despierta interés.</p></div><button className="primary-button" onClick={showInterest}>Quiero esto <ArrowUpRight size={20} /></button>
          </>}
          {modal === 'metrics' && <>
            <div className="modal-symbol"><CreditCard size={27} /></div><span className="modal-eyebrow">VALIDACIÓN DEL MVP</span><h2 id="modal-title">De la idea<br />a una señal<span className="accent">.</span></h2><p>Registros de este navegador. Los clics incluyen repeticiones; no equivalen a personas únicas.</p>
            <div className="metrics-grid"><div><strong>{events.filter(e => e.type === 'interest').length}</strong><span>Clics en «Quiero esto»</span></div><div><strong>{events.filter(e => e.type === 'email').length}</strong><span>Correos registrados</span></div></div>
            <button className="primary-button" onClick={exportEvents}>Exportar registros <Download size={18} /></button><p className="privacy-note">El archivo JSON incluye fechas y los correos que se hayan guardado. No hay un registro compartido entre dispositivos.</p><button className="text-button" onClick={clearEvents}>Borrar registros de esta prueba</button>{storageError && <p role="alert" className="error-message">No se pudieron borrar los registros del navegador.</p>}
          </>}
        </div>
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
