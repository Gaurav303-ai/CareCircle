import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

const featureCards = [
  { icon: 'medication', title: 'Medication routines', copy: 'Keep schedules, instructions, and dose confirmations together.' },
  { icon: 'event_available', title: 'Appointments, together', copy: 'Coordinate visits, reminders, and who is helping with the day.' },
  { icon: 'group', title: 'A shared care circle', copy: 'Invite family and caretakers with clear, owner-controlled access.' },
  { icon: 'insights', title: 'A clearer picture', copy: 'Review recorded activity and routine trends without clinical predictions.' },
  { icon: 'notifications_active', title: 'Thoughtful reminders', copy: 'See upcoming and unconfirmed routines at a glance.' },
  { icon: 'translate', title: 'Made more accessible', copy: 'Choose a language, larger text, and a calmer interface.' },
];

const faqs = [
  ['How do I invite family or a caretaker?', 'Create an invitation from CareCircle Members. In this prototype, invitation codes are simulated; a real service must verify identity and permissions on its server.'],
  ['Does a reminder confirm that a dose was taken?', 'No. A reminder is only a prompt. A dose stays unconfirmed until a person records an outcome.'],
  ['Can a family member edit a care profile?', 'Access should be granted by the profile owner. Permission settings in this prototype demonstrate the experience, not server-enforced authorization.'],
  ['Can I synchronize appointments to Google Calendar?', 'The integrations screen is a connection-ready prototype. No Google account is connected and no calendar data is sent.'],
  ['Is this application medical advice?', 'No. CareCircle is a coordination concept and is not a substitute for advice from a qualified clinician or emergency services.'],
];

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="landing-page">
      <section className="hero-section page-width">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A calmer way to coordinate everyday care</div>
          <h1>Better care starts with staying <span>connected.</span></h1>
          <p>Manage medications, coordinate appointments, and keep the people who matter informed — all from one connected care platform.</p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/demo">Try live demo <span aria-hidden="true">↗</span></Link>
            <a className="button button-secondary button-large" href="#features">Explore CareCircle</a>
          </div>
          <div className="trust-line"><span className="material-symbols-outlined" aria-hidden="true">verified_user</span> Owner-led access · Clear dose status · Designed for real families</div>
        </div>
        <div className="hero-preview" aria-label="Sample CareCircle dashboard preview">
          <div className="preview-heading">
            <div><div className="preview-kicker">SAMPLE CARE CIRCLE</div><h2>Eleanor’s care, at a glance</h2></div>
            <div className="avatar-stack" aria-label="Three care circle members"><span>PS</span><span>AS</span><span>NP</span></div>
          </div>
          <div className="preview-grid">
            <article className="preview-card preview-adherence">
              <span className="card-overline">TODAY’S ROUTINE</span>
              <div className="progress-ring"><strong>2/4</strong></div>
              <p>confirmations recorded</p>
              <small>Unconfirmed is not the same as missed.</small>
            </article>
            <article className="preview-card preview-dose">
              <span className="card-overline">UP NEXT · 1:00 PM</span>
              <div className="preview-icon"><span className="material-symbols-outlined" aria-hidden="true">medication</span></div>
              <strong>Calcium supplement</strong><small>1 tablet · After lunch</small>
              <span className="status-pill status-upcoming">Upcoming</span>
            </article>
            <article className="preview-card preview-appointment">
              <div className="date-tile"><b>18</b><span>NOV</span></div>
              <div><span className="card-overline">NEXT APPOINTMENT</span><strong>Routine check-up</strong><small>Dr. Meera Shah · 10:30 AM</small></div>
            </article>
            <article className="preview-card preview-note">
              <span className="material-symbols-outlined" aria-hidden="true">shield_person</span>
              <div><strong>Care, in sync</strong><small>Shared with permission. Always centered on Eleanor.</small></div>
            </article>
          </div>
          <div className="preview-foot"><span className="material-symbols-outlined" aria-hidden="true">science</span> Sample data · Not connected to a health record</div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="page-width proof-inner"><span>ONE SHARED VIEW</span><b>Medication routines</b><i /> <b>Appointments</b><i /> <b>Family coordination</b><i /> <b>Accessible by design</b></div>
      </section>

      <section className="section-block page-width" id="why-carecircle">
        <div className="section-heading">
          <span className="eyebrow">WHY CARECIRCLE</span>
          <h2>Care is shared. The information should be, too.</h2>
          <p>When updates are scattered across calls, notes, and memories, it’s easy for a family to lose the thread.</p>
        </div>
        <div className="problem-grid">
          <article><span className="material-symbols-outlined">schedule</span><h3>Routines are hard to keep in sync</h3><p>Make schedules visible, and keep each dose’s status honest and clear.</p></article>
          <article><span className="material-symbols-outlined">forum</span><h3>Care happens across conversations</h3><p>Give family and caretakers one shared place to coordinate updates.</p></article>
          <article><span className="material-symbols-outlined">distance</span><h3>Distance can mean less peace of mind</h3><p>Share the right information with the people who have been invited.</p></article>
        </div>
      </section>

      <section className="section-block section-tint" id="features">
        <div className="page-width">
          <div className="section-heading section-heading-row">
            <div><span className="eyebrow">A CONNECTED CARE WORKSPACE</span><h2>Practical tools for everyday coordination.</h2></div>
            <p>Purposeful features that support—not replace—the people and clinicians involved in care.</p>
          </div>
          <div className="feature-grid">{featureCards.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <span className={`feature-icon feature-icon-${index}`}><span className="material-symbols-outlined" aria-hidden="true">{feature.icon}</span></span>
              <h3>{feature.title}</h3><p>{feature.copy}</p>
              <Link to="/demo" aria-label={`Explore ${feature.title}`}>Explore <span aria-hidden="true">→</span></Link>
            </article>
          ))}</div>
        </div>
      </section>

      <section className="section-block page-width" id="how-it-works">
        <div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>Start with the people. Build a routine around them.</h2></div>
        <div className="steps-grid">
          {[
            ['01', 'Create a care profile', 'Set up the details your family chooses to share.'],
            ['02', 'Invite your circle', 'Give each person a clear role and the access they need.'],
            ['03', 'Add routines together', 'Keep medication schedules and appointment details in one place.'],
            ['04', 'Stay informed', 'Review what has been recorded and what still needs attention.'],
          ].map(([number, title, copy]) => <article className="step-card" key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
        </div>
      </section>

      <section className="section-block mission-section" id="about">
        <div className="page-width mission-grid">
          <div><span className="eyebrow">OUR MISSION</span><h2>More connected care, with the older adult at the center.</h2></div>
          <div><p className="mission-quote">“To make elderly healthcare more accessible, coordinated, and reliable by connecting the people involved in everyday care.”</p><p>We’re building a thoughtful coordination experience that respects agency, makes collaboration easier, and keeps everyday care understandable.</p><Link className="text-link" to="/demo">See the prototype <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      <section className="section-block page-width" id="privacy">
        <div className="privacy-panel">
          <div className="privacy-copy"><span className="eyebrow">BUILT AROUND TRUST</span><h2>Care access should always be intentional.</h2><p>The profile owner stays at the center of every circle. Clear roles, scoped permissions, and a visible activity history are part of the product design.</p><Link className="text-link" to="/demo">Explore member access <span aria-hidden="true">→</span></Link></div>
          <div className="privacy-list">
            {['Invitations don’t grant blanket access', 'Permissions are visible and owner-led', 'Changes can be reviewed in an activity log', 'Prototype data stays in this browser session'].map((item) => <div key={item}><span className="material-symbols-outlined" aria-hidden="true">check_circle</span>{item}</div>)}
          </div>
        </div>
      </section>

      <section className="section-block section-tint accessibility-section">
        <div className="page-width accessibility-grid">
          <div><span className="eyebrow">ACCESS FOR EVERYDAY USE</span><h2>Comfortable to read. Simple to navigate.</h2><p>CareCircle is designed for larger text, clear status labels, high contrast, and a choice of English, Hindi, Bengali, Tamil, or Telugu.</p><Link className="text-link" to="/demo">Try the accessibility controls <span aria-hidden="true">→</span></Link></div>
          <div className="accessibility-points"><span><span className="material-symbols-outlined">text_fields</span> Adjustable text size</span><span><span className="material-symbols-outlined">contrast</span> High-contrast option</span><span><span className="material-symbols-outlined">touch_app</span> Clear, comfortable controls</span><span><span className="material-symbols-outlined">translate</span> Five local languages</span></div>
        </div>
      </section>

      <section className="section-block page-width" id="faq">
        <div className="section-heading"><span className="eyebrow">GOOD TO KNOW</span><h2>Questions, answered.</h2></div>
        <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span className="material-symbols-outlined" aria-hidden="true">add</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="section-block page-width contact-section" id="contact">
        <div><span className="eyebrow">GET IN TOUCH</span><h2>Let’s make everyday care feel more connected.</h2><p>This demo form does not send or store your message. Connect it to a secure backend before launch.</p></div>
        <form className="contact-form" onSubmit={handleContact}>
          <label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>How can we help?<textarea name="message" rows={3} required maxLength={1000} /></label>
          <button className="button button-primary" type="submit">Send message <span aria-hidden="true">→</span></button>
          {submitted && <p className="form-success" role="status">Thanks for reaching out. This prototype hasn’t sent or saved your message.</p>}
        </form>
      </section>
    </div>
  );
}
