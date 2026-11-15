import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppContext, type UserRole } from '../../context/AppContext';

const steps = ['Your role', 'Care profile', 'Invite your circle', 'You’re all set'];

export default function OnboardingPage({ initialStep }: { initialStep?: string }) {
  const { step: routeStep } = useParams();
  const step = routeStep ?? initialStep ?? 'role';
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [message, setMessage] = useState('');
  const [invitationReviewed, setInvitationReviewed] = useState(false);
  const [role, setRole] = useState<UserRole>(state.user?.role ?? 'family');
  const stepIndex = step === 'profile' ? 1 : step === 'invite' ? 2 : step === 'complete' ? 3 : 0;

  function continueOnboarding(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (step === 'role') {
      dispatch({ type: 'SET_ROLE', payload: role });
      navigate('/onboarding/profile');
    } else if (step === 'profile') {
      navigate('/onboarding/invite');
    } else {
      navigate('/onboarding/complete');
    }
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (String(formData.get('code') ?? '').replaceAll(' ', '') !== '284619') {
      setInvitationReviewed(false);
      setMessage('That is not the sample invitation code. Try 284619.');
      return;
    }
    setInvitationReviewed(true);
    setMessage('Sample invitation preview loaded. No profile access has been granted.');
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="onboarding-top"><Link to="/" className="brand-lockup"><span className="brand-mark material-symbols-outlined">health_and_safety</span><span><strong>CareCircle</strong><small>Connected Care</small></span></Link><span className="demo-tag">PROTOTYPE</span></div>
        <div className="step-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
          {steps.map((label, index) => <div className={index <= stepIndex ? 'step active' : 'step'} key={label}><span>{index < stepIndex ? '✓' : index + 1}</span><small>{label}</small></div>)}
        </div>
        {step === 'join' ? (
          <div className="onboarding-content">
            <span className="eyebrow">JOIN A CARE CIRCLE</span><h1>Enter your invitation code.</h1>
            <p>A code is only a request to join. The profile owner must still choose which access to grant.</p>
            <form className="stack-form" onSubmit={verifyCode}><label>Invitation code<input name="code" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={8} required placeholder="Try sample code 284619" /></label><button className="button button-primary" type="submit">Review invitation <span aria-hidden="true">→</span></button></form>
            {message && <div className="prototype-notice" role="status">{message}</div>}
            {invitationReviewed && <>
              <div className="join-preview"><span className="avatar avatar-lavender">EV</span><div><strong>Eleanor Vance’s CareCircle</strong><small>Invited by Priya Sharma · Requested: family member</small></div></div>
              <div className="permission-note"><span className="material-symbols-outlined">shield_person</span><span>This invitation requests access to the profile and medication schedule only. An invitation code never grants unrestricted access.</span></div>
              <div className="invitation-actions"><button className="button button-quiet" type="button" onClick={() => { setInvitationReviewed(false); setMessage('Invitation declined in this demo. No access was granted.'); }}>Decline invitation</button><button className="button button-primary" type="button" onClick={() => { dispatch({ type: 'LOGIN', payload: { id: 'demo-invitee', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'family' } }); navigate('/app/dashboard'); }}>Accept sample invitation</button></div>
            </>}
          </div>
        ) : step === 'complete' ? (
          <div className="onboarding-content onboarding-complete">
            <span className="complete-icon material-symbols-outlined">check_circle</span><span className="eyebrow">READY WHEN YOU ARE</span>
            <h1>Your care circle is ready to explore.</h1>
            <p>This prototype uses sample information. You can try the medication schedule, member permissions, and appointment workspace.</p>
            <Link className="button button-primary" to="/app/dashboard">Open CareCircle <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <form className="onboarding-content" onSubmit={continueOnboarding}>
            {step === 'role' ? <>
              <span className="eyebrow">STEP 1 · YOUR PLACE IN THE CIRCLE</span><h1>How will you use CareCircle?</h1><p>We’ll shape the workspace around your role. The older adult stays at the center of every care decision.</p>
              <div className="role-options">
                {([
                  ['elderly', 'I’m managing my own care', 'Stay in control of your routines and choose who can help.', 'person'],
                  ['caretaker', 'I’m a caretaker', 'Coordinate routines with the profile owner’s permission.', 'volunteer_activism'],
                  ['family', 'I’m a family member', 'Stay informed and help coordinate with your circle.', 'family_restroom'],
                ] as const).map(([value, title, copy, icon]) => <label className={`role-option ${role === value ? 'selected' : ''}`} key={value}><input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} /><span className="material-symbols-outlined">{icon}</span><span><strong>{title}</strong><small>{copy}</small></span></label>)}
              </div>
            </> : step === 'invite' ? <>
              <span className="eyebrow">STEP 3 · INVITE YOUR CIRCLE</span><h1>Care is easier when it’s shared.</h1><p>Invite a trusted family member or caretaker. In this prototype, no email will be sent.</p>
              <div className="stack-form"><label>Invite by email<input name="inviteEmail" type="email" autoComplete="email" maxLength={254} placeholder="name@example.com" /></label><div className="prototype-notice"><span className="material-symbols-outlined">shield_person</span><span>Choose specific access for each person. The profile owner can review and revoke invitations.</span></div></div>
            </> : <>
              <span className="eyebrow">STEP 2 · CARE PROFILE</span><h1>Start with the essentials.</h1><p>Only add details the profile owner chooses to share. Optional information can be added later.</p>
              <div className="stack-form"><label>Care profile name<input name="profileName" placeholder="e.g. Eleanor’s care profile" maxLength={100} /></label><label>Preferred way to be addressed<input name="preferredName" placeholder="Preferred name" maxLength={80} /></label><div className="prototype-notice"><span className="material-symbols-outlined">lock</span><span>Health details and emergency contacts are optional. This demo does not save personal health information.</span></div></div>
            </>}
            <div className="onboarding-actions"><Link className="button button-quiet" to={step === 'profile' ? '/onboarding/role' : '/app/dashboard'}>{step === 'profile' ? 'Back' : 'Skip for now'}</Link><button className="button button-primary" type="submit">Continue <span aria-hidden="true">→</span></button></div>
          </form>
        )}
      </div>
      <p className="onboarding-footnote">For this prototype, profile updates are not sent to a server.</p>
    </div>
  );
}
