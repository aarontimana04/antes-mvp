import { useRef, useState } from 'react';
import { CalendarDays, CheckCheck, ChevronLeft, ChevronRight, Coffee, CreditCard, Wallet } from 'lucide-react';

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

const topics = ['costos', 'fechas', 'pagos'] as const;
const topicIcons = [CreditCard, CalendarDays, Wallet];

export function ExampleCarousel() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + topics.length) % topics.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return (
    <section id="ejemplos" className="example-area" aria-label="Ejemplos de costos, fechas y pagos" aria-roledescription="carrusel">
      <div className="example-header"><span>UN ADELANTO DE LA IDEA</span><span className="live-dot" title="Ejemplo interactivo" /></div>
      <div className="topic-tabs" aria-label="Elige un ejemplo">
        {topics.map((topic, index) => {
          const Icon = topicIcons[index];
          return <button key={topic} aria-pressed={active === index} aria-controls="example-carousel-track" onClick={() => goTo(index)} className={active === index ? 'active' : ''}><Icon size={14} />{topic[0].toUpperCase() + topic.slice(1)}</button>;
        })}
      </div>
      <div className="example-carousel-track" id="example-carousel-track" ref={trackRef} tabIndex={0}
        aria-label="Desliza para explorar los ejemplos"
        onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
          }
        }}
        onScroll={event => {
          const track = event.currentTarget;
          setActive(Math.min(topics.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth))));
        }}>
        {topics.map((topic, index) => {
          const example = examples[topic];
          const Icon = example.icon;
          return <div className="example-slide" key={topic} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de 3: ${topic}`} aria-hidden={active !== index}>
            <div className="example-content">
              <div className="example-text"><h2>{example.title}</h2><p>{example.text}</p></div>
              <div className="receipt"><div className="receipt-label"><Icon size={14} />{example.label}</div><strong>{example.amount}</strong><span>{example.detail}</span></div>
            </div>
            <div className="example-bottom"><CheckCheck size={15} /><span>{example.takeaway}</span></div>
          </div>;
        })}
      </div>
      <div className="carousel-navigation">
        <button className="carousel-arrow" aria-label="Ejemplo anterior" onClick={() => goTo(active - 1)}><ChevronLeft size={17} /></button>
        <div className="carousel-position"><span aria-live="polite" aria-atomic="true">0{active + 1} <span>/ 03</span></span><div className="carousel-dots">{topics.map((topic, index) => <button key={topic} aria-label={`Ver ejemplo de ${topic}`} aria-current={active === index ? 'true' : undefined} onClick={() => goTo(index)}><span /></button>)}</div></div>
        <button className="carousel-arrow" aria-label="Siguiente ejemplo" onClick={() => goTo(active + 1)}><ChevronRight size={17} /></button>
      </div>
      <p className="example-disclaimer">Ejemplos ilustrativos. Las condiciones dependen de cada banco y tarjeta.</p>
    </section>
  );
}
