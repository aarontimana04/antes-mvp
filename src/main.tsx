import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Streamlit } from 'streamlit-component-lib';
import { ArrowUpRight, ArrowRight, Check, CheckCheck, ChevronRight, CreditCard, CalendarDays, Wallet, Sparkles, X, LockKeyhole, Wifi, Coffee, ShoppingBag, BookOpen, CircleHelp } from 'lucide-react';
import './styles.css';

type Topic = 'costos' | 'fechas' | 'pagos';
type Metrics = { clicks: number; emails: number; submissions: number; updated_at: string };
type ServerArgs = { stats: Metrics | null; available: boolean; admin_url: string; response?: { id: string; ok: boolean; error?: string; stats?: Metrics } };
type Action = { type: 'interest' | 'email' | 'refresh'; email?: string };

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
  const [server, setServer] = useState<ServerArgs | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [interestState, setInterestState] = useState<'pending' | 'saved' | 'error'>('pending');
  const pendingRef = useRef<{ id: string; resolve: () => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null>(null);
  const failedRef = useRef<{ signature: string; id: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const example = examples[topic];
  const ExampleIcon = example.icon;

  useEffect(() => {
    if (window.parent === window) return;
    const resize = () => Streamlit.setFrameHeight(Math.ceil(document.getElementById('root')!.getBoundingClientRect().height));
    const render = (event: Event) => {
      const args = (event as CustomEvent<{ args: ServerArgs }>).detail.args;
      setServer(args);
      const response = args.response;
      if (response && pendingRef.current?.id === response.id) {
        const pending = pendingRef.current;
        pendingRef.current = null;
        clearTimeout(pending.timer);
        setBusy(false);
        if (response.ok) {
          failedRef.current = null;
          if (response.stats) setServer(previous => previous ? { ...previous, stats: response.stats! } : previous);
          pending.resolve();
        } else pending.reject(new Error(response.error || 'No pudimos confirmar el registro.'));
      }
      resize();
    };
    Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, render);
    Streamlit.setComponentReady();
    const observer = new ResizeObserver(resize);
    observer.observe(document.getElementById('root')!);
    resize();
    return () => {
      observer.disconnect(); Streamlit.events.removeEventListener(Streamlit.RENDER_EVENT, render);
      if (pendingRef.current) { clearTimeout(pendingRef.current.timer); pendingRef.current.reject(new Error('Se interrumpió la conexión.')); }
    };
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

  function sendAction(action: Action): Promise<void> {
    if (window.parent === window) return Promise.reject(new Error('Abre la versión de Streamlit para participar en la prueba global.'));
    if (pendingRef.current) return Promise.reject(new Error('Espera a que termine el registro anterior.'));
    const signature = JSON.stringify(action);
    const id = failedRef.current?.signature === signature ? failedRef.current.id : crypto.randomUUID();
    const requestId = crypto.randomUUID();
    failedRef.current = { signature, id };
    setBusy(true);
    setError('');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRef.current = null;
        setBusy(false);
        reject(new Error('La confirmación está tardando. Puedes volver a intentar sin duplicar el evento.'));
      }, 45000);
      pendingRef.current = { id: requestId, resolve, reject, timer };
      Streamlit.setComponentValue({ ...action, id, request_id: requestId });
    });
  }

  async function showInterest() {
    setSaved(false); setEmail(''); setError(''); setInterestState('pending'); setModal('interest');
    try { await sendAction({ type: 'interest' }); setInterestState('saved'); }
    catch (err) { setInterestState('error'); setError((err as Error).message); }
  }

  async function saveEmail() {
    try { await sendAction({ type: 'email', email: email.trim().toLowerCase() }); setSaved(true); }
    catch (err) { setError((err as Error).message); }
  }

  async function refreshMetrics() {
    setError(''); setModal('metrics');
    try { await sendAction({ type: 'refresh' }); }
    catch (err) { setError((err as Error).message); }
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
            <div className="cta-row"><button className="primary-button" onClick={showInterest} disabled={busy}>Quiero esto <ArrowUpRight size={22} /></button><span className="cta-note">Primero entender.<br />Después decidir.</span></div>
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
      <footer><span>antes<span className="accent">.</span> <span className="footer-divider">/</span> UTEC · Equipo 06</span><span>Proyecto académico independiente · Hecho por estudiantes</span><button onClick={refreshMetrics} disabled={busy}>Resultados globales <ArrowUpRight size={12} /></button></footer>

      {modal && <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
          <button className="close-button" aria-label="Cerrar" ref={closeRef} onClick={() => setModal(null)}><X size={21} /></button>
          {modal === 'interest' && <>
            <div className="modal-symbol"><Sparkles size={27} /></div>
            <span className="modal-eyebrow">PRIMERO, LAS COSAS CLARAS</span>
            <h2 id="modal-title">Tu interés es<br />el primer paso<span className="accent">.</span></h2>
            <p aria-live="polite">{interestState === 'pending' ? 'Estamos registrando tu interés…' : interestState === 'saved' ? 'Tu clic se guardó en el registro global. Estamos probando esta idea, y saber que te interesa nos ayuda a darle forma.' : 'No pudimos confirmar tu clic.'}</p>
            {error && <p className="error-message" role="alert">{error}</p>}
            {interestState === 'error' && <button className="text-button" disabled={busy} onClick={showInterest}>Volver a intentar</button>}
            {!saved ? <form onSubmit={(e) => { e.preventDefault(); if (!busy && interestState === 'saved') void saveEmail(); }}>
              <label htmlFor="email">¿Quieres dejar tu correo? <span>(opcional)</span></label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" maxLength={254} required />
              <p className="privacy-note">Al guardar, aceptas que el Equipo 06 almacene tu correo en el registro central para validar esta propuesta académica. No enviamos correos automáticos.</p>
              <button className="primary-button" type="submit" disabled={busy || interestState !== 'saved'}>{busy ? 'Guardando…' : 'Guardar mi interés'} <ArrowRight size={18} /></button>
            </form> : <div className="success-box" role="status"><Check size={22} /><div><strong>¡Listo! Tu correo quedó guardado.</strong><span>En el registro central del Equipo 06.</span></div></div>}
            <button className="text-button" onClick={() => setModal(null)}>{saved ? 'Volver a los ejemplos' : 'Seguir sin dejar mi correo'} <ArrowRight size={15} /></button>
          </>}
          {modal === 'about' && <>
            <div className="modal-symbol"><CircleHelp size={27} /></div><span className="modal-eyebrow">EL PORQUÉ DE ANTES.</span><h2 id="modal-title">Entender antes<br />de comprometerte<span className="accent">.</span></h2>
            <p>Para estudiantes de UTEC que buscan su primera tarjeta para iniciar su historial, pero la postergan porque las condiciones del banco son confusas, explicamos los costos, fechas y pagos con ejemplos de la vida diaria, para que reconozcan qué compromiso asumirán antes de solicitarla.</p>
            <div className="about-note"><BookOpen size={20} /><p>Esta página es el MVP de la promesa del Equipo 06. El botón permite explorar si la propuesta despierta interés.</p></div><button className="primary-button" onClick={showInterest} disabled={busy}>Quiero esto <ArrowUpRight size={20} /></button>
          </>}
          {modal === 'metrics' && <>
            <div className="modal-symbol"><CreditCard size={27} /></div><span className="modal-eyebrow">VALIDACIÓN DEL MVP</span><h2 id="modal-title">De la idea<br />a una señal<span className="accent">.</span></h2><p>Resultados acumulados de todos los dispositivos. Los clics incluyen repeticiones; un mismo correo cuenta una sola vez como correo único.</p>
            <div className="metrics-grid"><div><strong>{server?.stats?.clicks ?? '—'}</strong><span>Clics en «Quiero esto»</span></div><div><strong>{server?.stats?.emails ?? '—'}</strong><span>Correos únicos</span></div></div>
            {error && <p role="alert" className="error-message">{error}</p>}
            {!server?.available && !error && <p className="privacy-note">{server ? 'No se pudo conectar con el registro central. Pulsa Actualizar contadores para volver a intentar.' : 'Conectando con el registro central…'}</p>}
            <button className="primary-button" onClick={refreshMetrics} disabled={busy}>{busy ? 'Actualizando…' : 'Actualizar contadores'} <ArrowRight size={18} /></button>
            {server?.admin_url && <a className="text-button" href={server.admin_url} target="_blank" rel="noopener noreferrer">Ver correos y descargar Excel <ArrowUpRight size={16} /></a>}
            <p className="privacy-note">El panel con correos y la descarga de Excel son privados. Necesitas entrar con la cuenta de ChatGPT del responsable del proyecto. Los registros anteriores guardados en cada navegador no se importan automáticamente.</p>
          </>}
        </div>
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
