import { useEffect, useState } from 'react';
import { ArrowRight, Bell, CalendarDays, ChevronLeft, ChevronRight, GraduationCap, Menu, Phone, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './home.css';

const slides = [
  { image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2200&q=85', eyebrow: 'EXCELLENCE • CHARACTER • FUTURE', title: 'Where every learner is prepared to thrive.', text: 'A modern school experience that brings academics, character, communication and technology together.' },
  { image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2200&q=85', eyebrow: 'INSPIRED LEARNING', title: 'Curiosity becomes confidence.', text: 'Give students an environment where great teaching, meaningful assessment and individual progress work together.' },
  { image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=2200&q=85', eyebrow: 'A CONNECTED SCHOOL', title: 'One platform. One school community.', text: 'Keep school leadership, teachers, students and families connected throughout the academic journey.' },
  { image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=2200&q=85', eyebrow: 'BUILDING TOMORROW', title: 'Education designed for the future.', text: 'A refined digital experience for managing learning, results, attendance, fees, communication and more.' },
];

const highlights = [
  { icon: GraduationCap, title: 'Academic Excellence', text: 'Manage classes, subjects, assessments, grading and results from one connected platform.' },
  { icon: Users, title: 'Student & Family', text: 'Keep students, parents, guardians and teachers connected to the information that matters.' },
  { icon: CalendarDays, title: 'School Operations', text: 'Coordinate attendance, timetables, admissions, fees and day-to-day school administration.' },
  { icon: ShieldCheck, title: 'Secure by Design', text: 'Role-based access and protected school data help keep every part of the platform accountable.' },
];

const publicNotices = [
  { date: 'ADMISSIONS', title: 'A simpler path from application to enrollment', text: 'Give prospective families a clear, professional admission experience.' },
  { date: 'ACADEMICS', title: 'Keep learning and assessment connected', text: 'Bring teaching, examinations, grading and published results into one workflow.' },
  { date: 'COMMUNITY', title: 'Keep families informed', text: 'Share important school communications through the Vaxad announcement experience.' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const previous = () => setSlide(current => (current - 1 + slides.length) % slides.length);
  const next = () => setSlide(current => (current + 1) % slides.length);

  return (
    <main className="public-home">
      <header className="public-nav">
        <Link to="/" className="public-brand" onClick={() => setMobileOpen(false)}><span className="public-brand-mark">V</span><span><strong>VAXAD</strong><small>SCHOOL PLATFORM</small></span></Link>
        <nav className={`public-links ${mobileOpen ? 'open' : ''}`}>
          <a href="/admissions/apply">Apply for Admission</a><a href="#about" onClick={() => setMobileOpen(false)}>About</a><a href="#academics" onClick={() => setMobileOpen(false)}>Academics</a><a href="#admissions" onClick={() => setMobileOpen(false)}>Admissions</a><a href="#announcements" onClick={() => setMobileOpen(false)}>Announcements</a><a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
          <Link className="nav-login" to="/login" onClick={() => setMobileOpen(false)}>Sign in <ArrowRight size={15} /></Link>
        </nav>
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>

      <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {slides.map((item, index) => <div key={item.title} className={`hero-slide ${index === slide ? 'active' : ''}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(8,18,34,.86) 0%, rgba(8,18,34,.58) 43%, rgba(8,18,34,.12) 100%), url("${item.image}")` }} aria-hidden={index !== slide} />)}
        <div className="hero-inner"><div className="hero-copy"><div className="hero-eyebrow"><Sparkles size={14} /> {slides[slide].eyebrow}</div><h1>{slides[slide].title}</h1><p>{slides[slide].text}</p><div className="hero-actions"><Link className="button button-primary" to="/login">Enter School Portal <ArrowRight size={17} /></Link><a className="button button-ghost" href="#about">Discover Vaxad</a></div></div></div>
        <div className="hero-controls"><button onClick={previous} aria-label="Previous slide"><ChevronLeft size={20} /></button><div className="hero-dots">{slides.map((item, index) => <button key={item.title} className={index === slide ? 'active' : ''} onClick={() => setSlide(index)} aria-label={`Go to slide ${index + 1}`} />)}</div><button onClick={next} aria-label="Next slide"><ChevronRight size={20} /></button></div>
        <div className="hero-progress"><span key={`${slide}-${paused}`} className={paused ? 'paused' : ''} /></div><div className="hero-counter">0{slide + 1} <span>/ 0{slides.length}</span></div>
      </section>

      <section className="intro" id="about"><div className="section-label">THE VAXAD EXPERIENCE</div><div className="intro-grid"><div><h2>A classic school experience, connected by modern technology.</h2></div><div><p>Vaxad is designed to give schools a refined digital foundation for managing the complete academic and administrative journey. From admission to results, fees to communication, the school community stays connected.</p><a className="text-link" href="#academics">Explore the platform <ArrowRight size={16} /></a></div></div></section>

      <section className="highlights" id="academics"><div className="section-heading"><div><div className="section-label">ONE CONNECTED SCHOOL</div><h2>Everything your school needs to move with confidence.</h2></div><p>Built around the people and processes that make a school work.</p></div><div className="highlight-grid">{highlights.map(item => { const Icon = item.icon; return <article className="highlight-card" key={item.title}><div className="highlight-icon"><Icon size={22} /></div><h3>{item.title}</h3><p>{item.text}</p></article>; })}</div></section>

      <section className="admissions-band" id="admissions"><div><div className="section-label light">ADMISSIONS & ENROLLMENT</div><h2>Make the first school experience feel exceptional.</h2><p>Present a professional admission journey while keeping your administrative team in control.</p></div><Link className="button button-light" to="/login">Open School Portal <ArrowRight size={17} /></Link></section>

      <section className="notices" id="announcements"><div className="section-heading"><div><div className="section-label">SCHOOL COMMUNICATION</div><h2>Important things, clearly communicated.</h2></div><Link className="text-link" to="/login">View portal announcements <ArrowRight size={16} /></Link></div><div className="notice-grid">{publicNotices.map(item => <article className="notice-card" key={item.title}><div className="notice-date"><Bell size={14} /> {item.date}</div><h3>{item.title}</h3><p>{item.text}</p><Link to="/login">Learn more <ArrowRight size={15} /></Link></article>)}</div></section>

      <section className="contact-band" id="contact"><div><div className="section-label light">LET'S CONNECT</div><h2>Ready to bring your school together?</h2><p>Sign in to your Vaxad school portal or speak with your school administrator.</p></div><div className="contact-actions"><Link className="button button-light" to="/login">Sign in <ArrowRight size={17} /></Link><a className="contact-phone" href="tel:+2340000000000"><Phone size={17} /> Contact School</a></div></section>

      <footer className="public-footer"><div className="footer-brand"><span className="public-brand-mark">V</span><div><strong>VAXAD</strong><span>School Platform</span></div></div><p>Education, administration and communication — beautifully connected.</p><span>© {new Date().getFullYear()} Vaxad School Platform</span></footer>
    </main>
  );
}
