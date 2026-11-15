import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppContext, type Appointment, type CircleMember, type Dose, type DoseStatus, type Language, type Medication } from '../../context/AppContext';
import { languageNames, translate } from '../../i18n';

type ModalType = 'medication' | 'appointment' | 'member' | null;
type Tone = 'green' | 'amber' | 'red' | 'gray' | 'lavender';

const permissionOptions = [
  'View healthcare profile',
  'View medication schedules',
  'Add medication records',
  'Edit medication schedules',
  'View adherence reports',
  'Manage appointments',
  'Manage notifications',
];

const sectionTitles: Record<string, string> = {
  dashboard: 'overview',
  medications: 'medications',
  schedule: 'schedule',
  appointments: 'appointments',
  members: 'members',
  notifications: 'notifications',
  insights: 'insights',
  assistant: 'assistant',
  activity: 'activity',
  profile: 'profile',
  healthcare: 'healthcare',
  security: 'security',
  reminders: 'reminders',
  integrations: 'integrations',
  accessibility: 'accessibility',
  help: 'help',
  settings: 'settings',
};

function Icon({ children, className = '' }: { children: string; className?: string }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-heading-action">{action}</div>}</div>;
}

function StatusPill({ children, tone = 'gray' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>;
}

function EmptyState({ icon, title, copy, action }: { icon: string; title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon material-symbols-outlined">{icon}</span><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-heading"><div><span className="eyebrow">CARECIRCLE WORKSPACE</span><h2 id="modal-heading">{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><Icon>close</Icon></button></div>
      {children}
    </section>
  </div>;
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function dateInputValue(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function statusTone(status: DoseStatus): Tone {
  if (status === 'taken') return 'green';
  if (status === 'skipped') return 'red';
  if (status === 'due') return 'amber';
  if (status === 'unconfirmed') return 'lavender';
  return 'gray';
}

export default function WorkspacePage() {
  const { section = 'dashboard', medicationId, appointmentId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [modal, setModal] = useState<ModalType>(null);
  const [editingMedication, setEditingMedication] = useState<Medication>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment>();
  const [editingMember, setEditingMember] = useState<CircleMember>();
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('active');
  const [period, setPeriod] = useState('7 days');
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [appointmentView, setAppointmentView] = useState('upcoming');
  const [scheduleOffset, setScheduleOffset] = useState(0);
  const [scheduleCalendar, setScheduleCalendar] = useState(false);
  const language = state.preference.language;
  const t = (key: string) => translate(key, language);
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const takenCount = state.doses.filter((dose) => dose.status === 'taken').length;
  const completion = state.doses.length ? Math.round((takenCount / state.doses.length) * 100) : 0;
  const title = t(sectionTitles[section] ?? 'overview');
  const currentMedication = medicationId ? state.medications.find((item) => item.id === medicationId) : undefined;
  const currentAppointment = appointmentId ? state.appointments.find((item) => item.id === appointmentId) : undefined;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  }

  function closeModal() {
    setModal(null);
    setEditingMedication(undefined);
    setEditingAppointment(undefined);
    setEditingMember(undefined);
  }

  function saveMedication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const medication: Medication = {
      id: editingMedication?.id ?? `med-${Date.now()}`,
      name: String(data.get('name') ?? '').trim(),
      dosage: String(data.get('dosage') ?? '').trim(),
      frequency: String(data.get('frequency') ?? '').trim(),
      times: [String(data.get('time') ?? '')].filter(Boolean),
      startDate: String(data.get('startDate') ?? ''),
      endDate: String(data.get('endDate') ?? '') || undefined,
      instructions: String(data.get('instructions') ?? '').trim(),
      prescriber: String(data.get('prescriber') ?? '').trim(),
      status: 'active',
    };
    if (editingMedication) dispatch({ type: 'UPDATE_MEDICATION', payload: medication });
    else dispatch({ type: 'ADD_MEDICATION', payload: medication });
    closeModal();
    notify(editingMedication ? 'Medication details updated in this demo.' : 'Medication added to the sample care plan.');
  }

  function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const appointment: Appointment = {
      id: editingAppointment?.id ?? `apt-${Date.now()}`,
      title: String(data.get('title') ?? '').trim(),
      date: String(data.get('date') ?? ''),
      time: String(data.get('time') ?? ''),
      doctor: String(data.get('doctor') ?? '').trim(),
      location: String(data.get('location') ?? '').trim(),
      notes: String(data.get('notes') ?? '').trim(),
    };
    if (editingAppointment) dispatch({ type: 'UPDATE_APPOINTMENT', payload: appointment });
    else dispatch({ type: 'ADD_APPOINTMENT', payload: appointment });
    closeModal();
    notify(editingAppointment ? 'Appointment updated in this demo.' : 'Appointment added to this demo.');
  }

  function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const permissions = data.getAll('permissions').map(String);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    if (editingMember) {
      dispatch({ type: 'UPDATE_MEMBER', payload: { ...editingMember, name, email, permissions, role: String(data.get('role') ?? editingMember.role) } });
      notify('Member permissions updated in this demo.');
    } else {
      dispatch({ type: 'ADD_MEMBER', payload: { id: `member-${Date.now()}`, name, email, role: String(data.get('role') ?? 'Family member'), initials: name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(), color: 'mint', status: 'Invitation pending', permissions, lastActive: 'Invitation pending' } });
      notify('Demo invitation created. Sample join code: 284619. No email was sent.');
    }
    closeModal();
  }

  function recordDose(dose: Dose, status: 'taken' | 'skipped') {
    if (dose.status === 'taken' || dose.status === 'skipped') return;
    dispatch({ type: 'RECORD_DOSE', payload: { id: dose.id, medicationId: dose.medicationId, time: dose.time, status } });
    notify(status === 'taken' ? 'Dose recorded as taken.' : 'Dose recorded as skipped. No follow-up dose is suggested.');
  }

  function deleteMedication(id: string) {
    if (window.confirm('Remove this medication from the sample care plan? This cannot be undone.')) {
      dispatch({ type: 'DELETE_MEDICATION', payload: id });
      navigate('/app/medications');
      notify('Medication removed from this demo.');
    }
  }

  function deleteAppointment(id: string) {
    if (window.confirm('Cancel and remove this appointment from the sample calendar?')) {
      dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
      navigate('/app/appointments');
      notify('Appointment removed from this demo.');
    }
  }

  function openMedication(item?: Medication) {
    setEditingMedication(item);
    setModal('medication');
  }

  function openAppointment(item?: Appointment) {
    setEditingAppointment(item);
    setModal('appointment');
  }

  function exportReport() {
    const header = 'Medication,Time,Status';
    const lines = state.doses.map((dose) => {
      const medication = state.medications.find((item) => item.id === dose.medicationId)?.name ?? 'Unknown';
      return `"${medication.replaceAll('"', '""')}",${dose.time},${dose.status}`;
    });
    const blob = new Blob([[header, ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carecircle-sample-routine-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    notify('Sample activity report downloaded.');
  }

  function askAssistant(question: string) {
    setAssistantQuestion(question);
    const unconfirmed = state.doses.filter((dose) => dose.status === 'upcoming' || dose.status === 'due' || dose.status === 'unconfirmed');
    const nextAppointment = [...state.appointments].sort((a, b) => a.date.localeCompare(b.date))[0];
    let response: string;
    if (question.toLowerCase().includes('appointment')) {
      response = nextAppointment ? `The next appointment in this sample profile is ${nextAppointment.title} with ${nextAppointment.doctor} on ${formatDate(nextAppointment.date)} at ${nextAppointment.time}.` : 'There are no upcoming appointments in this sample profile.';
    } else if (question.toLowerCase().includes('unconfirmed')) {
      response = `${unconfirmed.length} dose${unconfirmed.length === 1 ? '' : 's'} in the sample schedule are not yet recorded as taken or skipped. Unconfirmed does not mean missed.`;
    } else if (question.toLowerCase().includes('adherence') || question.toLowerCase().includes('week')) {
      response = `In today's sample schedule, ${takenCount} of ${state.doses.length} doses are recorded as taken (${completion}%). This is a demonstration summary, not a clinical assessment.`;
    } else {
      response = `The sample schedule has ${state.doses.length} doses today. ${takenCount} are recorded as taken and ${unconfirmed.length} are still unconfirmed. Follow the care plan provided by the clinician.`;
    }
    setAssistantAnswer(response);
  }

  const titleBarAction = section === 'medications' ? <button className="button button-primary" type="button" onClick={() => openMedication()}><Icon>add</Icon>{t('addMedication')}</button>
    : section === 'appointments' ? <button className="button button-primary" type="button" onClick={() => openAppointment()}><Icon>add</Icon>{t('addAppointment')}</button>
      : section === 'members' ? <button className="button button-primary" type="button" onClick={() => { setEditingMember(undefined); setModal('member'); }}><Icon>person_add</Icon>{t('inviteMember')}</button>
        : undefined;

  const filteredMedications = useMemo(() => state.medications.filter((item) =>
    (category === 'active' ? item.status === 'active' : item.status === 'completed')
    && `${item.name} ${item.dosage} ${item.prescriber}`.toLowerCase().includes(search.toLowerCase()),
  ), [state.medications, category, search]);

  if (medicationId) return currentMedication
    ? <MedicationDetails medication={currentMedication} doses={state.doses.filter((dose) => dose.medicationId === currentMedication.id)} onEdit={() => openMedication(currentMedication)} onDelete={() => deleteMedication(currentMedication.id)} />
    : <NotFound title="Medication not found" back="/app/medications" />;

  if (appointmentId) return currentAppointment
    ? <AppointmentDetails appointment={currentAppointment} onEdit={() => openAppointment(currentAppointment)} onDelete={() => deleteAppointment(currentAppointment.id)} />
    : <NotFound title="Appointment not found" back="/app/appointments" />;

  const pageContent = (() => {
    switch (section) {
      case 'dashboard':
        return <Dashboard state={state} completion={completion} takenCount={takenCount} onRecord={recordDose} />;
      case 'medications':
        return <MedicationsPage items={filteredMedications} category={category} search={search} onSearch={setSearch} onCategory={setCategory} onAdd={() => openMedication()} onEdit={openMedication} onDelete={deleteMedication} />;
      case 'schedule':
        return <SchedulePage state={state} offset={scheduleOffset} setOffset={setScheduleOffset} calendar={scheduleCalendar} setCalendar={setScheduleCalendar} onRecord={recordDose} />;
      case 'appointments':
        return <AppointmentsPage appointments={state.appointments} view={appointmentView} setView={setAppointmentView} onAdd={() => openAppointment()} onEdit={openAppointment} onDelete={deleteAppointment} />;
      case 'members':
        return <MembersPage members={state.members} onInvite={() => { setEditingMember(undefined); setModal('member'); }} onEdit={(member) => { setEditingMember(member); setModal('member'); }} onDelete={(id) => { if (window.confirm('Revoke this member’s sample access?')) { dispatch({ type: 'DELETE_MEMBER', payload: id }); notify('Member access removed in this demo.'); } }} />;
      case 'notifications':
        return <NotificationsPage notifications={state.notifications} unreadCount={unreadCount} onRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })} onReadAll={() => state.notifications.forEach((item) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: item.id }))} />;
      case 'insights':
        return <InsightsPage state={state} period={period} setPeriod={setPeriod} completion={completion} onExport={exportReport} />;
      case 'assistant':
        return <AssistantPage question={assistantQuestion} answer={assistantAnswer} onAsk={askAssistant} />;
      case 'activity':
        return <ActivityPage activities={state.activities} />;
      case 'profile':
        return <ProfilePage state={state} onSave={(name, email) => { dispatch({ type: 'UPDATE_USER', payload: { name, email } }); notify('Profile updated in this demo.'); }} />;
      case 'healthcare':
        return <HealthcareProfilePage />;
      case 'security':
        return <SecurityPage onSignOut={() => { dispatch({ type: 'LOGOUT' }); navigate('/login'); }} notify={notify} />;
      case 'reminders':
        return <ReminderSettingsPage notify={notify} />;
      case 'integrations':
        return <IntegrationsPage notify={notify} />;
      case 'accessibility':
        return <AccessibilityPage />;
      case 'help':
        return <HelpPage sent={contactSent} setSent={setContactSent} />;
      case 'settings':
        return <SettingsOverview />;
      default:
        return <NotFound title="This workspace page is not available." back="/app/dashboard" />;
    }
  })();

  return (
    <div className="workspace-page">
      <div className="prototype-banner"><Icon>science</Icon><span><strong>Interactive prototype</strong> · Sample data only. No account, email, calendar, AI, or health service is connected.</span></div>
      {section !== 'dashboard' && section !== 'assistant' && <PageHeading eyebrow="CARECIRCLE WORKSPACE" title={title} description={t(`${section}Description`)} action={titleBarAction} />}
      {pageContent}
      {toast && <div className="toast-message" role="status"><Icon>check_circle</Icon>{toast}</div>}
      {modal === 'medication' && <Modal title={editingMedication ? 'Edit medication' : 'Add a medication'} onClose={closeModal}><MedicationForm initial={editingMedication} onSubmit={saveMedication} onCancel={closeModal} /></Modal>}
      {modal === 'appointment' && <Modal title={editingAppointment ? 'Edit appointment' : 'Add an appointment'} onClose={closeModal}><AppointmentForm initial={editingAppointment} onSubmit={saveAppointment} onCancel={closeModal} /></Modal>}
      {modal === 'member' && <Modal title={editingMember ? 'Manage member access' : 'Invite to your CareCircle'} onClose={closeModal}><MemberForm initial={editingMember} onSubmit={saveMember} onCancel={closeModal} /></Modal>}
    </div>
  );
}

function Dashboard({ state, completion, takenCount, onRecord }: { state: ReturnType<typeof useAppContext>['state']; completion: number; takenCount: number; onRecord: (dose: Dose, status: 'taken' | 'skipped') => void }) {
  const t = (key: string) => translate(key, state.preference.language);
  const upcoming = [...state.appointments].sort((a, b) => a.date.localeCompare(b.date))[0];
  const todayLabel = formatLongDate().toUpperCase();

  return <>
    <PageHeading eyebrow={todayLabel} title={t('welcome')} description={t('welcomeCopy')} action={<button className="button button-secondary" type="button" onClick={() => window.print()}><Icon>download</Icon>Print overview</button>} />
    <div className="dashboard-grid">
      <Card className="adherence-card">
        <div className="panel-title-row"><div><span className="eyebrow">TODAY’S ROUTINE</span><h2>Recorded dose activity</h2></div><Link className="text-link" to="/app/insights">View insights <span aria-hidden="true">→</span></Link></div>
        <div className="adherence-main"><div className="adherence-ring" style={{ background: `conic-gradient(var(--green-700) ${completion}%, var(--green-100) ${completion}% 100%)` }}><span><strong>{completion}%</strong><small>recorded</small></span></div><div><h3>{takenCount} of {state.doses.length} doses confirmed</h3><p>Only recorded actions count. Unconfirmed doses are not assumed missed.</p><Link className="text-link" to="/app/schedule">Open today’s schedule <span aria-hidden="true">→</span></Link></div></div>
        <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
        <div className="progress-caption"><span>{takenCount} confirmed taken</span><span>{state.doses.length - takenCount} not yet confirmed</span></div>
      </Card>
      <Card className="dashboard-members-card">
        <div className="panel-title-row"><div><span className="eyebrow">YOUR CARE CIRCLE</span><h2>People, in sync</h2></div><Link className="icon-button" to="/app/members" aria-label="View all members"><Icon>arrow_forward</Icon></Link></div>
        <div className="member-stack">
          {state.members.slice(0, 3).map((member) => <div className="member-row" key={member.id}><span className={`avatar avatar-${member.color}`}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.role}</small></span><StatusPill tone={member.status === 'Invitation pending' ? 'amber' : 'green'}>{member.status}</StatusPill></div>)}
        </div>
        <Link className="text-link" to="/app/members">Manage member access <span aria-hidden="true">→</span></Link>
      </Card>
      <Card className="schedule-card">
        <div className="panel-title-row"><div><span className="eyebrow">TODAY · NOV 15</span><h2>Medication schedule</h2></div><Link className="text-link" to="/app/schedule">Full schedule <span aria-hidden="true">→</span></Link></div>
        <div className="dose-list">
          {state.doses.slice(0, 4).map((dose) => {
            const medication = state.medications.find((item) => item.id === dose.medicationId);
            if (!medication) return null;
            return <DoseRow key={dose.id} dose={dose} medication={medication} language={state.preference.language} onRecord={onRecord} />;
          })}
          {state.doses.length === 0 && <EmptyState icon="medication" title="No doses in today’s schedule" copy="Add a medication to see a routine here." />}
        </div>
      </Card>
      <Card className="appointment-card">
        <div className="panel-title-row"><div><span className="eyebrow">NEXT UP</span><h2>Appointment</h2></div><Link className="icon-button" to="/app/appointments" aria-label="View appointments"><Icon>arrow_forward</Icon></Link></div>
        {upcoming ? <Link className="next-appointment" to={`/app/appointments/${upcoming.id}`}><div className="date-tile"><b>{new Date(`${upcoming.date}T12:00:00`).getDate()}</b><span>{new Date(`${upcoming.date}T12:00:00`).toLocaleString('en', { month: 'short' }).toUpperCase()}</span></div><div><strong>{upcoming.title}</strong><small>{upcoming.doctor}</small><small><Icon>schedule</Icon> {upcoming.time} · {upcoming.location}</small></div><Icon className="appointment-chevron">chevron_right</Icon></Link> : <EmptyState icon="event" title="No appointments listed" copy="Add a visit when you are ready." />}
        <div className="appointment-coordinator"><Icon>group</Icon><span>Care coordination helps everyone arrive prepared.</span></div>
      </Card>
      <Card className="week-card">
        <div className="panel-title-row"><div><span className="eyebrow">SAMPLE ACTIVITY</span><h2>Weekly routine overview</h2></div><Link className="icon-button" to="/app/insights" aria-label="View health insights"><Icon>arrow_forward</Icon></Link></div>
        <WeeklyChart values={[3, 4, 3, 4, 2, 3, takenCount]} />
        <div className="chart-caption"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>TODAY</span></div>
        <small className="sample-caption">Illustrative sample activity · Not a prediction</small>
      </Card>
      <Card className="alerts-card">
        <div className="panel-title-row"><div><span className="eyebrow">A GENTLE HEADS-UP</span><h2>Smart reminders</h2></div><Link to="/app/notifications" className="notification-bubble">{state.notifications.filter((item) => !item.read).length} new</Link></div>
        {state.notifications.slice(0, 2).map((item) => <Link className="alert-row" to="/app/notifications" key={item.id}><span className={`alert-icon alert-${item.type}`}><Icon>{item.type === 'medication' ? 'medication' : item.type === 'appointment' ? 'event' : 'notifications'}</Icon></span><span><strong>{item.title}</strong><small>{item.message}</small></span><Icon>chevron_right</Icon></Link>)}
        <Link className="text-link" to="/app/notifications">Open notifications <span aria-hidden="true">→</span></Link>
      </Card>
      <Card className="assistant-teaser">
        <span className="assistant-symbol material-symbols-outlined">auto_awesome</span><span className="eyebrow">CARE ASSISTANT · SAMPLE</span><h2>A simple summary, grounded in your records.</h2><p>Ask about the schedule, recorded activity, or upcoming appointments. No medical advice or actions.</p><Link className="button button-dark" to="/app/assistant">Open care assistant <span aria-hidden="true">→</span></Link>
      </Card>
      <Card className="activity-card">
        <div className="panel-title-row"><div><span className="eyebrow">RECENT UPDATES</span><h2>Activity history</h2></div><Link className="text-link" to="/app/activity">View all <span aria-hidden="true">→</span></Link></div>
        <ActivityList activities={state.activities.slice(0, 3)} />
      </Card>
    </div>
  </>;
}

function DoseRow({ dose, medication, language, onRecord }: { dose: Dose; medication: Medication; language: Language; onRecord: (dose: Dose, status: 'taken' | 'skipped') => void }) {
  const locked = dose.status === 'taken' || dose.status === 'skipped';
  const statusLabel = dose.status === 'taken' ? 'taken' : dose.status === 'skipped' ? 'skipped' : dose.status === 'due' ? 'due' : dose.status === 'unconfirmed' ? 'unconfirmed' : 'upcoming';
  return <div className="dose-row">
    <div className="dose-time"><strong>{dose.time}</strong><span className={`dose-time-dot tone-${statusTone(dose.status)}`} /></div>
    <div className="dose-info"><strong>{medication.name}</strong><small>{medication.dosage} · {medication.instructions}</small></div>
    <StatusPill tone={statusTone(dose.status)}>{translate(statusLabel, language)}</StatusPill>
    {!locked && <div className="dose-actions"><button className="dose-action dose-taken" type="button" onClick={() => onRecord(dose, 'taken')} aria-label={`${translate('markTaken', language)}: ${medication.name}`}><Icon>check</Icon><span>{translate('markTaken', language)}</span></button><button className="dose-action" type="button" onClick={() => onRecord(dose, 'skipped')} aria-label={`${translate('markSkipped', language)}: ${medication.name}`}><Icon>close</Icon><span className="sr-only">{translate('markSkipped', language)}</span></button></div>}
  </div>;
}

function WeeklyChart({ values }: { values: number[] }) {
  return <div className="bar-chart" aria-label="Sample weekly dose activity chart">{values.map((value, index) => <div className="bar-column" key={`${index}-${value}`}><span className="bar-value">{value}/4</span><div className="bar-track"><span style={{ height: `${Math.min(100, value * 25)}%` }} /></div></div>)}</div>;
}

function ActivityList({ activities }: { activities: ReturnType<typeof useAppContext>['state']['activities'] }) {
  if (!activities.length) return <EmptyState icon="history" title="No activity yet" copy="Actions recorded in the demo will appear here." />;
  return <div className="activity-list">{activities.map((item) => <div className="activity-row" key={item.id}><span className="activity-icon"><Icon>{item.icon}</Icon></span><span><strong>{item.text}</strong><small>{item.time}</small></span></div>)}</div>;
}

function MedicationsPage({ items, category, search, onSearch, onCategory, onAdd, onEdit, onDelete }: { items: Medication[]; category: string; search: string; onSearch: (value: string) => void; onCategory: (value: string) => void; onAdd: () => void; onEdit: (item: Medication) => void; onDelete: (id: string) => void }) {
  return <>
    <Card>
      <div className="list-toolbar"><div className="segmented-control" role="tablist" aria-label="Medication status">{[['active', 'Active'], ['completed', 'Completed']].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={category === value} className={category === value ? 'selected' : ''} onClick={() => onCategory(value)}>{label}</button>)}</div><label className="inline-search"><Icon>search</Icon><span className="sr-only">Search medications</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search medication or clinician" /></label></div>
      {items.length ? <div className="medication-list">{items.map((item) => <article className="medication-item" key={item.id}>
        <span className="medication-symbol"><Icon>medication</Icon></span>
        <div className="medication-copy"><Link to={`/app/medications/${item.id}`}><strong>{item.name}</strong></Link><small>{item.dosage} · {item.frequency}</small><span className="medication-instruction">{item.instructions}</span></div>
        <div className="medication-time"><small>DAILY ROUTINE</small><span>{item.times.join(' · ') || 'No time set'}</span></div>
        <div className="medication-prescriber"><small>PRESCRIBED BY</small><span>{item.prescriber || 'Not specified'}</span></div>
        <StatusPill tone={item.status === 'active' ? 'green' : 'gray'}>{item.status === 'active' ? 'Active' : 'Completed'}</StatusPill>
        <div className="item-actions"><button className="icon-button" type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Icon>edit</Icon></button><button className="icon-button" type="button" onClick={() => onDelete(item.id)} aria-label={`Remove ${item.name}`}><Icon>delete</Icon></button></div>
      </article>)}</div> : <EmptyState icon="medication" title={search ? 'No matching medication' : `No ${category} medications`} copy={search ? 'Try another medicine name or clinician.' : 'Add a medication when you are ready.'} action={!search && category === 'active' ? <button className="button button-primary" type="button" onClick={onAdd}>Add medication</button> : undefined} />}
    </Card>
    <div className="notice-inline"><Icon>info</Icon><span>Enter medication details exactly as provided by a qualified clinician. CareCircle does not recommend or change treatment.</span></div>
  </>;
}

function MedicationDetails({ medication, doses, onEdit, onDelete }: { medication: Medication; doses: Dose[]; onEdit: () => void; onDelete: () => void }) {
  return <>
    <Link to="/app/medications" className="back-link"><Icon>arrow_back</Icon> Back to medications</Link>
    <PageHeading eyebrow="MEDICATION DETAILS" title={medication.name} description={`${medication.dosage} · ${medication.frequency}`} action={<><button className="button button-secondary" type="button" onClick={onEdit}><Icon>edit</Icon>Edit details</button><button className="button button-quiet" type="button" onClick={onDelete}>Remove</button></>} />
    <div className="detail-grid"><Card><div className="detail-header"><span className="medication-symbol"><Icon>medication</Icon></span><div><h2>{medication.name}</h2><StatusPill tone="green">Active</StatusPill></div></div><div className="detail-fields"><DetailField label="Dosage">{medication.dosage}</DetailField><DetailField label="Frequency">{medication.frequency}</DetailField><DetailField label="Administration time">{medication.times.join(', ') || 'Not specified'}</DetailField><DetailField label="Instructions">{medication.instructions || 'No instructions recorded'}</DetailField><DetailField label="Prescribing clinician">{medication.prescriber || 'Not specified'}</DetailField><DetailField label="Started">{formatDate(medication.startDate)}</DetailField><DetailField label="End date">{medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}</DetailField></div></Card><Card><PanelHeading overline="RECENT RECORDS" title="Dose activity" /><div className="dose-history">{doses.length ? doses.map((dose) => <div key={dose.id}><span>{dose.time}</span><StatusPill tone={statusTone(dose.status)}>{dose.status}</StatusPill></div>) : <p>No dose records for this medication yet.</p>}</div><div className="notice-inline"><Icon>info</Icon><span>These records reflect the sample schedule only. They are not medical advice.</span></div></Card></div>
  </>;
}

function SchedulePage({ state, offset, setOffset, calendar, setCalendar, onRecord }: { state: ReturnType<typeof useAppContext>['state']; offset: number; setOffset: (value: number) => void; calendar: boolean; setCalendar: (value: boolean) => void; onRecord: (dose: Dose, status: 'taken' | 'skipped') => void }) {
  const groups = [
    { label: 'Morning', icon: 'wb_twilight', range: (time: string) => time < '12:00' },
    { label: 'Afternoon', icon: 'light_mode', range: (time: string) => time >= '12:00' && time < '17:00' },
    { label: 'Evening & night', icon: 'dark_mode', range: (time: string) => time >= '17:00' },
  ];
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + offset);
  const isToday = offset === 0;
  return <>
    <Card className="schedule-controls"><div className="schedule-date"><button className="icon-button" type="button" aria-label="Previous day" onClick={() => setOffset(offset - 1)}><Icon>chevron_left</Icon></button><div><span className="eyebrow">{new Intl.DateTimeFormat('en', { weekday: 'long' }).format(selectedDate).toUpperCase()}</span><strong>{formatLongDate(selectedDate)}</strong></div><button className="icon-button" type="button" aria-label="Next day" onClick={() => setOffset(offset + 1)}><Icon>chevron_right</Icon></button></div><button className={`button ${isToday ? 'button-secondary' : 'button-quiet'}`} type="button" onClick={() => setOffset(0)}>Today</button><button className="button button-quiet" type="button" onClick={() => setCalendar(!calendar)}><Icon>calendar_month</Icon>{calendar ? 'List view' : 'Calendar view'}</button></Card>
    {calendar ? <CalendarView appointments={state.appointments} /> : isToday ? <div className="schedule-timeline">{groups.map((group) => {
      const doses = state.doses.filter((dose) => group.range(dose.time));
      return <section className="timeline-group" key={group.label}><div className="timeline-label"><span className="timeline-icon"><Icon>{group.icon}</Icon></span><div><h2>{group.label}</h2><small>{doses.length} scheduled</small></div></div><div className="timeline-doses">{doses.length ? doses.map((dose) => {
        const medication = state.medications.find((item) => item.id === dose.medicationId);
        return medication ? <DoseRow dose={dose} medication={medication} language={state.preference.language} onRecord={onRecord} key={dose.id} /> : null;
      }) : <div className="timeline-empty">No sample doses scheduled for this part of the day.</div>}</div></section>;
    })}</div> : <Card><EmptyState icon="event_note" title="No sample dose data for this day" copy="This prototype only includes a demonstration schedule for today. It does not infer a missed or skipped dose." /></Card>}
    <div className="notice-inline"><Icon>health_and_safety</Icon><span>Never repeat or change a dose based on this prototype. Follow instructions from the prescribing clinician.</span></div>
  </>;
}

function CalendarView({ appointments }: { appointments: Appointment[] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const rawDay = index - firstWeekday + 1;
    if (rawDay < 1) return { day: previousMonthDays + rawDay, date: new Date(year, month - 1, previousMonthDays + rawDay), muted: true };
    if (rawDay > daysInMonth) return { day: rawDay - daysInMonth, date: new Date(year, month + 1, rawDay - daysInMonth), muted: true };
    return { day: rawDay, date: new Date(year, month, rawDay), muted: false };
  });
  return <Card><PanelHeading overline={new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(today).toUpperCase()} title="Appointment calendar" /><div className="calendar-grid">{days.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}{cells.map(({ day, date, muted }, index) => {
    const appointment = appointments.find((item) => {
      const appointmentDate = new Date(`${item.date}T12:00:00`);
      return appointmentDate.getFullYear() === date.getFullYear() && appointmentDate.getMonth() === date.getMonth() && appointmentDate.getDate() === day;
    });
    const isToday = !muted && date.toDateString() === today.toDateString();
    return <div className={`calendar-day${muted ? ' muted-day' : ''}${isToday ? ' current-day' : ''}`} key={`${date.toISOString()}-${index}`}><span>{day}</span>{appointment && <small title={`${appointment.title} · ${appointment.time}`}>{appointment.title}</small>}</div>;
  })}</div></Card>;
}

function AppointmentsPage({ appointments, view, setView, onAdd, onEdit, onDelete }: { appointments: Appointment[]; view: string; setView: (value: string) => void; onAdd: () => void; onEdit: (item: Appointment) => void; onDelete: (id: string) => void }) {
  const sorted = [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return <>
    <Card className="list-toolbar-card"><div className="segmented-control" role="tablist" aria-label="Appointment view">{[['upcoming', 'Upcoming'], ['past', 'Past'], ['calendar', 'Calendar']].map(([value, label]) => <button className={view === value ? 'selected' : ''} role="tab" aria-selected={view === value} type="button" key={value} onClick={() => setView(value)}>{label}</button>)}</div><button className="button button-secondary" type="button" onClick={() => window.alert('Calendar sync is not connected. Connect it from Settings → Integrations in a future backend release.') }><Icon>sync</Icon> Google Calendar · Not connected</button></Card>
    {view === 'calendar' ? <CalendarView appointments={appointments} /> : view === 'past' ? <Card><EmptyState icon="event_busy" title="No past visits in the sample" copy="Completed appointment history will appear here when available." /></Card> : sorted.length ? <div className="appointment-list">{sorted.map((item) => <article className="appointment-row panel" key={item.id}><div className="date-tile"><b>{new Date(`${item.date}T12:00:00`).getDate()}</b><span>{new Date(`${item.date}T12:00:00`).toLocaleString('en', { month: 'short' }).toUpperCase()}</span></div><div className="appointment-row-main"><Link to={`/app/appointments/${item.id}`}><h2>{item.title}</h2></Link><p>{item.doctor}</p><div className="appointment-meta"><span><Icon>schedule</Icon>{item.time}</span><span><Icon>location_on</Icon>{item.location}</span></div>{item.notes && <small>{item.notes}</small>}</div><StatusPill tone="green">Scheduled</StatusPill><div className="item-actions"><button className="icon-button" type="button" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}><Icon>edit</Icon></button><button className="icon-button" type="button" aria-label={`Cancel ${item.title}`} onClick={() => onDelete(item.id)}><Icon>event_busy</Icon></button></div></article>)}</div> : <Card><EmptyState icon="event" title="No appointments yet" copy="Add a visit to start coordinating your care." action={<button className="button button-primary" type="button" onClick={onAdd}>Add appointment</button>} /></Card>}
    <Card className="integration-callout"><span className="integration-icon"><Icon>calendar_month</Icon></span><div><span className="eyebrow">COMING TO A CONNECTED PRODUCT</span><h3>Google Calendar, when you’re ready.</h3><p>Calendar access is disconnected in this prototype. A future integration should request consent and explain the data shared.</p></div><StatusPill>Not connected</StatusPill></Card>
  </>;
}

function AppointmentDetails({ appointment, onEdit, onDelete }: { appointment: Appointment; onEdit: () => void; onDelete: () => void }) {
  return <>
    <Link to="/app/appointments" className="back-link"><Icon>arrow_back</Icon> Back to appointments</Link>
    <PageHeading eyebrow="APPOINTMENT DETAILS" title={appointment.title} description={`${formatDate(appointment.date)} · ${appointment.time}`} action={<><button className="button button-secondary" type="button" onClick={onEdit}><Icon>edit</Icon>Edit</button><button className="button button-quiet" type="button" onClick={onDelete}>Cancel appointment</button></>} />
    <div className="detail-grid"><Card><PanelHeading overline="VISIT INFORMATION" title={appointment.doctor} /><div className="detail-fields"><DetailField label="Date">{formatDate(appointment.date)}</DetailField><DetailField label="Time">{appointment.time}</DetailField><DetailField label="Clinic">{appointment.location}</DetailField><DetailField label="Coordinating member">Priya Sharma · sample</DetailField><DetailField label="Preparation notes">{appointment.notes || 'No notes added.'}</DetailField></div></Card><Card><PanelHeading overline="REMINDERS" title="A timely nudge" /><p>Appointment reminders are shown here as a design preview. No email or push notification is sent.</p><StatusPill tone="amber">Reminder service not connected</StatusPill><div className="notice-inline"><Icon>info</Icon><span>Confirm visit details directly with the clinic.</span></div></Card></div>
  </>;
}

function MembersPage({ members, onInvite, onEdit, onDelete }: { members: CircleMember[]; onInvite: () => void; onEdit: (member: CircleMember) => void; onDelete: (id: string) => void }) {
  return <>
    <div className="owner-note"><Icon>shield_person</Icon><span><strong>Owner-led access</strong> · Eleanor remains at the center. Invitations do not automatically provide access.</span></div>
    <div className="member-cards">{members.map((member) => <Card className="circle-member-card" key={member.id}><div className="member-card-top"><span className={`avatar avatar-${member.color}`}>{member.initials}</span><StatusPill tone={member.status === 'Invitation pending' ? 'amber' : 'green'}>{member.status}</StatusPill></div><h2>{member.name}</h2><p>{member.role}</p><a className="member-email" href={`mailto:${member.email}`}>{member.email}</a><div className="permission-preview"><strong>{member.permissions.length} permissions</strong>{member.permissions.slice(0, 3).map((permission) => <span key={permission}><Icon>check</Icon>{permission}</span>)}{member.permissions.length > 3 && <small>+{member.permissions.length - 3} more</small>}</div><div className="member-card-actions"><button className="button button-secondary" type="button" onClick={() => onEdit(member)}><Icon>tune</Icon>Manage access</button><button className="icon-button" type="button" aria-label={`Revoke access for ${member.name}`} onClick={() => onDelete(member.id)}><Icon>person_remove</Icon></button></div></Card>)}
      <button className="add-member-card" type="button" onClick={onInvite}><span className="add-member-icon"><Icon>person_add</Icon></span><strong>Invite someone you trust</strong><small>Choose a role and the access they need.</small><span className="text-link">Create invitation <span aria-hidden="true">→</span></span></button>
    </div>
    <Card className="access-management-note"><Icon>key</Icon><div><strong>Invitation codes are not access tokens.</strong><p>A production service must verify identity, require explicit acceptance, enforce permissions on every server request, and let the profile owner revoke access.</p></div><button className="button button-secondary" type="button" onClick={onInvite}>Generate demo invitation</button></Card>
  </>;
}

function NotificationsPage({ notifications, unreadCount, onRead, onReadAll }: { notifications: ReturnType<typeof useAppContext>['state']['notifications']; unreadCount: number; onRead: (id: string) => void; onReadAll: () => void }) {
  const [filter, setFilter] = useState('all');
  const filtered = notifications.filter((item) => filter === 'all' || (filter === 'unread' ? !item.read : item.type === filter));
  return <>
    <div className="notification-summary"><div><span className="eyebrow">YOUR CARE CIRCLE</span><h2>{unreadCount} unread {unreadCount === 1 ? 'update' : 'updates'}</h2></div><button className="button button-secondary" type="button" onClick={onReadAll} disabled={!unreadCount}>Mark all as read</button></div>
    <div className="notification-filters">{[['all', 'All'], ['unread', 'Unread'], ['medication', 'Medication'], ['appointment', 'Appointments'], ['member', 'Family activity']].map(([value, label]) => <button type="button" key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
    {filtered.length ? <Card className="notification-list">{filtered.map((item) => <article className={`notification-item${item.read ? '' : ' unread'}`} key={item.id}><span className={`alert-icon alert-${item.type}`}><Icon>{item.type === 'medication' ? 'medication' : item.type === 'appointment' ? 'event' : item.type === 'member' ? 'group' : 'info'}</Icon></span><div><div className="notification-item-title"><h3>{item.title}</h3>{!item.read && <span className="unread-dot" aria-label="Unread" />}</div><p>{item.message}</p><small>{item.time}</small></div>{!item.read && <button className="button button-quiet" type="button" onClick={() => onRead(item.id)}>Mark read</button>}</article>)}</Card> : <Card><EmptyState icon="notifications_off" title="Nothing to show here" copy="Try a different filter or check back later." /></Card>}
    <Card className="email-preview"><span className="email-preview-icon"><Icon>mail</Icon></span><div><span className="eyebrow">EMAIL REMINDERS · DESIGN PREVIEW</span><h3>Helpful updates, only when they’re needed.</h3><p>Upcoming dose and appointment email examples are not sent by this prototype. Configure delivery through a secure backend before launch.</p></div><Link className="text-link" to="/app/reminders">Preferences <span aria-hidden="true">→</span></Link></Card>
  </>;
}

function InsightsPage({ state, period, setPeriod, completion, onExport }: { state: ReturnType<typeof useAppContext>['state']; period: string; setPeriod: (value: string) => void; completion: number; onExport: () => void }) {
  const recorded = state.doses.filter((dose) => dose.status === 'taken' || dose.status === 'skipped').length;
  const skipped = state.doses.filter((dose) => dose.status === 'skipped').length;
  const unconfirmed = state.doses.filter((dose) => dose.status === 'upcoming' || dose.status === 'due' || dose.status === 'unconfirmed').length;
  return <>
    <div className="insights-toolbar"><span className="sample-caption"><Icon>science</Icon> Sample data · Not a clinical assessment</span><div className="period-picker" aria-label="Select report period">{['7 days', '30 days', '90 days'].map((value) => <button type="button" key={value} className={period === value ? 'selected' : ''} onClick={() => setPeriod(value)}>{value}</button>)}</div><button className="button button-primary" type="button" onClick={onExport}><Icon>download</Icon>Export sample CSV</button></div>
    <div className="insights-grid"><Card className="insights-score"><span className="eyebrow">TODAY · RECORDED ACTIVITY</span><div className="adherence-ring" style={{ background: `conic-gradient(var(--green-700) ${completion}%, var(--green-100) ${completion}% 100%)` }}><span><strong>{completion}%</strong><small>recorded</small></span></div><h2>{state.doses.filter((dose) => dose.status === 'taken').length} of {state.doses.length} sample doses recorded as taken</h2><p>This percentage describes only the current prototype schedule.</p></Card>
      <Card className="insights-trend"><PanelHeading overline={`ROUTINE ACTIVITY · ${period.toUpperCase()}`} title="Recorded doses by day" /><WeeklyChart values={period === '7 days' ? [2, 4, 3, 4, 3, 2, state.doses.filter((dose) => dose.status === 'taken').length] : period === '30 days' ? [3, 3, 4, 2, 4, 3, 4] : [2, 4, 3, 3, 4, 2, 4]} /><div className="chart-caption"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>TODAY</span></div></Card>
      <Card><PanelHeading overline="CURRENT SAMPLE SCHEDULE" title="Dose status breakdown" /><div className="breakdown-list"><Breakdown label="Recorded taken" value={state.doses.filter((dose) => dose.status === 'taken').length} total={state.doses.length} tone="green" /><Breakdown label="Recorded skipped" value={skipped} total={state.doses.length} tone="red" /><Breakdown label="Still unconfirmed" value={unconfirmed} total={state.doses.length} tone="amber" /><Breakdown label="Recorded outcomes" value={recorded} total={state.doses.length} tone="lavender" /></div></Card>
      <Card><PanelHeading overline="APPOINTMENTS" title="Care coordination" /><div className="analytics-stat"><strong>{state.appointments.length}</strong><span>visits in the sample schedule</span></div><Link className="text-link" to="/app/appointments">Review appointments <span aria-hidden="true">→</span></Link><div className="notice-inline"><Icon>info</Icon><span>No predictions or clinical conclusions are generated.</span></div></Card>
    </div>
  </>;
}

function Breakdown({ label, value, total, tone }: { label: string; value: number; total: number; tone: Tone }) {
  return <div className="breakdown-row"><div><span className={`breakdown-marker tone-${tone}`} /><span>{label}</span><strong>{value}</strong></div><div className="progress-track"><span className={`fill-${tone}`} style={{ width: `${total ? value / total * 100 : 0}%` }} /></div></div>;
}

function AssistantPage({ question, answer, onAsk }: { question: string; answer: string; onAsk: (question: string) => void }) {
  const suggestions = ['What medications are scheduled for today?', 'Summarize this week’s medication activity.', 'Which doses are still unconfirmed?', 'What appointments are coming up?', 'Give me a simple healthcare routine summary.'];
  const { state } = useAppContext();
  return <div className="assistant-workspace">
    <aside className="assistant-aside"><div className="assistant-aside-title"><span className="assistant-symbol material-symbols-outlined">auto_awesome</span><div><strong>Care companion</strong><small>Sample-data mode</small></div></div><span className="nav-section-label">RECENT TOPICS</span><button type="button" onClick={() => onAsk(suggestions[0])}><Icon>chat_bubble_outline</Icon>Today’s routine</button><button type="button" onClick={() => onAsk(suggestions[3])}><Icon>event</Icon>Upcoming visit</button><div className="assistant-scope"><Icon>shield_lock</Icon><strong>Data scope</strong><p>Only the sample records displayed in this prototype are used. No external AI service is connected.</p></div></aside>
    <section className="assistant-main"><div className="assistant-heading"><span className="eyebrow">CARECIRCLE ASSISTANT</span><h1>A little clarity, from your care records.</h1><p>Ask about schedules, recorded activity, and appointments. This assistant does not diagnose or recommend treatment.</p></div>
      <div className="assistant-conversation"><div className="assistant-message"><span className="assistant-avatar material-symbols-outlined">auto_awesome</span><div><strong>CareCircle assistant</strong><p>Hello{state.user?.name ? `, ${state.user.name.split(' ')[0]}` : ''}. I can summarize the sample schedule or appointments shown in this prototype. I can’t offer medical advice or change a record.</p><small>Grounded in sample records · Not clinical guidance</small></div></div>
        {question && <><div className="user-message">{question}</div><div className="assistant-message"><span className="assistant-avatar material-symbols-outlined">auto_awesome</span><div><strong>CareCircle assistant · Sample response</strong><p>{answer}</p><div className="assistant-sources"><Link to="/app/schedule"><Icon>medication</Icon>View medication schedule</Link><Link to="/app/appointments"><Icon>event</Icon>View appointments</Link></div></div></div></>}
      </div>
      <div className="suggested-questions"><span>TRY ASKING</span><div>{suggestions.map((item) => <button key={item} type="button" onClick={() => onAsk(item)}>{item}<Icon>arrow_outward</Icon></button>)}</div></div>
      <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const value = String(data.get('question') ?? '').trim(); if (value) onAsk(value); event.currentTarget.reset(); }}><label className="sr-only" htmlFor="assistant-query">Ask about your sample care records</label><input id="assistant-query" name="question" placeholder="Ask about your sample care records…" maxLength={300} /><button className="button button-primary" type="submit" aria-label="Send question"><Icon>arrow_upward</Icon></button><small>Answers are templated from sample data. No medical recommendations.</small></form>
    </section>
  </div>;
}

function ActivityPage({ activities }: { activities: ReturnType<typeof useAppContext>['state']['activities'] }) {
  return <Card><div className="panel-title-row"><div><span className="eyebrow">AUDIT TIMELINE · SAMPLE</span><h2>Recent changes</h2></div><StatusPill>Local prototype history</StatusPill></div>{activities.length ? <div className="activity-timeline">{activities.map((item) => <div key={item.id} className="timeline-activity"><span className="activity-icon"><Icon>{item.icon}</Icon></span><div><strong>{item.text}</strong><p>Recorded in this browser session</p><small>{item.time} · Sample member</small></div></div>)}</div> : <EmptyState icon="history" title="No recorded changes" copy="Updates will appear here when actions are taken." />}<div className="notice-inline"><Icon>info</Icon><span>This is a temporary demo timeline, not a tamper-resistant security audit log.</span></div></Card>;
}

function ProfilePage({ state, onSave }: { state: ReturnType<typeof useAppContext>['state']; onSave: (name: string, email: string) => void }) {
  return <div className="settings-grid"><Card><PanelHeading overline="ACCOUNT DETAILS" title="Your profile" /><form className="stack-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave(String(data.get('name') ?? '').trim(), String(data.get('email') ?? '').trim()); }}><label>Full name<input name="name" defaultValue={state.user?.name} autoComplete="name" maxLength={100} required /></label><label>Email address<input name="email" type="email" defaultValue={state.user?.email} autoComplete="email" maxLength={254} required /></label><label>Contact number<input name="phone" type="tel" placeholder="Not added" autoComplete="tel" maxLength={30} /></label><button className="button button-primary" type="submit">Save profile</button></form></Card><Card><PanelHeading overline="ACCOUNT" title="Profile overview" /><div className="profile-large"><span className="avatar avatar-lavender">{state.user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'PS'}</span><div><strong>{state.user?.name}</strong><small>{state.user?.role} · Sample role</small></div></div><div className="notice-inline"><Icon>science</Icon><span>Profile updates only apply to this browser session.</span></div></Card></div>;
}

function HealthcareProfilePage() {
  const data = [
    ['Care profile', 'Eleanor Vance · Sample profile'],
    ['Emergency contact', 'Not provided in this demo'],
    ['Allergies', 'Not provided in this demo'],
    ['Health information', 'No personal clinical information is stored'],
    ['Prescribing clinicians', 'Dr. Meera Shah · Dr. Anil Rao (sample names)'],
    ['Authorized care members', 'Access overview available in CareCircle Members'],
  ];
  return <><Card><div className="notice-inline"><Icon>privacy_tip</Icon><span>This screen illustrates profile sections only. Do not enter real health information; this local prototype has no secure backend.</span></div><div className="health-profile-list">{data.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong><button className="icon-button" type="button" aria-label={`Edit ${label}`} onClick={() => window.alert('Profile editing will be available when a secure backend is connected.') }><Icon>edit</Icon></button></div>)}</div></Card><div className="notice-inline"><Icon>person</Icon><span>The older adult should remain in control of which profile information is shared.</span></div></>;
}

function SecurityPage({ onSignOut, notify }: { onSignOut: () => void; notify: (message: string) => void }) {
  return <div className="settings-grid"><Card><PanelHeading overline="ACCESS & PRIVACY" title="Account security" /><div className="settings-item"><span className="settings-icon"><Icon>key</Icon></span><div><strong>Password</strong><small>Password management is not connected in this demo.</small></div><button className="button button-secondary" type="button" onClick={() => notify('Password updates require a secure authentication service.')}>Manage</button></div><div className="settings-item"><span className="settings-icon"><Icon>devices</Icon></span><div><strong>Active sessions</strong><small>This demonstration session is stored in memory only.</small></div><StatusPill tone="green">This device</StatusPill></div><div className="settings-item"><span className="settings-icon"><Icon>history</Icon></span><div><strong>Access history</strong><small>Review local sample events in Activity History.</small></div><Link className="button button-secondary" to="/app/activity">Review</Link></div><div className="settings-item"><span className="settings-icon"><Icon>verified_user</Icon></span><div><strong>Invitation access</strong><small>Manage circle members and their sample permissions.</small></div><Link className="button button-secondary" to="/app/members">Members</Link></div></Card><Card className="security-callout"><Icon>shield_lock</Icon><h3>Prototype, not a secure account service.</h3><p>There is no password verification, session server, encryption, or permission enforcement in this frontend alone.</p><button className="button button-danger" type="button" onClick={onSignOut}>Sign out of demo</button></Card></div>;
}

function ReminderSettingsPage({ notify }: { notify: (message: string) => void }) {
  const [toggles, setToggles] = useState({ doses: true, appointments: true, escalation: false, email: false });
  const toggle = (key: keyof typeof toggles) => setToggles((value) => ({ ...value, [key]: !value[key] }));
  const items: [keyof typeof toggles, string, string][] = [
    ['doses', 'Upcoming dose reminders', 'Offer a gentle reminder before a scheduled dose.'],
    ['appointments', 'Appointment reminders', 'Get a reminder before a scheduled appointment.'],
    ['escalation', 'Unconfirmed-dose follow-up', 'Escalate only after a person reviews an unconfirmed dose.'],
    ['email', 'Email notifications', 'Send reminder messages to recipients you choose.'],
  ];
  return <><Card><div className="notice-inline"><Icon>info</Icon><span>Controls are local examples. This prototype does not send emails, push notifications, or escalation alerts.</span></div>{items.map(([key, title, copy]) => <div className="settings-item" key={key}><span className="settings-icon"><Icon>{key === 'appointments' ? 'event' : key === 'email' ? 'mail' : 'notifications_active'}</Icon></span><div><strong>{title}</strong><small>{copy}</small></div><button className={`toggle-switch${toggles[key] ? ' on' : ''}`} type="button" role="switch" aria-checked={toggles[key]} aria-label={title} onClick={() => toggle(key)}><span /></button></div>)}<div className="settings-item"><span className="settings-icon"><Icon>schedule</Icon></span><div><strong>Escalation timing</strong><small>Set a delay for review—not an automatic assumption that a dose was missed.</small></div><select aria-label="Escalation timing"><option>After caregiver review</option><option>30 minutes</option><option>1 hour</option></select></div><button className="button button-primary" type="button" onClick={() => notify('Reminder preferences saved in this demo.')}>Save preferences</button></Card></>;
}

function IntegrationsPage({ notify }: { notify: (message: string) => void }) {
  const services = [
    ['calendar_month', 'Google Calendar', 'See appointments alongside your personal calendar. Consent and scoped permissions would be required.', 'Not connected'],
    ['translate', 'Google Cloud Translation', 'Support additional languages through a server-side translation adapter. No API key is used in this browser.', 'Local language resources active'],
    ['account_circle', 'Google / Firebase Authentication', 'Add secure sign-in while preserving invitation review and profile-owner consent.', 'Not connected'],
    ['cloud', 'Google Cloud / Firebase', 'Future hosting, notification delivery, or backend services—configured outside the client.', 'Not connected'],
  ];
  return <div className="integrations-grid">{services.map(([icon, name, description, status]) => <Card className="integration-card" key={name}><span className="integration-icon"><Icon>{icon}</Icon></span><StatusPill tone={status.includes('Local') ? 'green' : 'gray'}>{status}</StatusPill><h2>{name}</h2><p>{description}</p><button className="button button-secondary" type="button" onClick={() => notify(`${name} is not connected. No credentials or data were sent.`)}>{status.includes('Local') ? 'View language settings' : 'Connection not configured'}</button></Card>)}</div>;
}

function AccessibilityPage() {
  const { state, dispatch } = useAppContext();
  const preference = state.preference;
  const t = (key: string) => translate(key, preference.language);
  const languageOptions: Language[] = ['en', 'hi', 'bn', 'ta', 'te'];
  const toggleOptions = [
    ['highContrast', 'highContrast', 'highContrastDescription'],
    ['reducedMotion', 'reduceMotion', 'reduceMotionDescription'],
    ['simplified', 'simplified', 'simplifiedDescription'],
  ] as const;

  return <div className="settings-grid"><Card><PanelHeading overline={t('personalizeExperience')} title={t('accessibility')} />
    <div className="settings-item"><span className="settings-icon"><Icon>translate</Icon></span><div><strong>{t('applicationLanguage')}</strong><small>{t('languageResourcesNote')}</small></div><select aria-label={t('applicationLanguage')} value={preference.language} onChange={(event) => dispatch({ type: 'SET_PREFERENCE', payload: { language: event.target.value as Language } })}>{languageOptions.map((language) => <option value={language} key={language}>{languageNames[language]}</option>)}</select></div>
    <div className="text-size-setting"><div><strong>{t('textSize')}</strong><small>{t('comfortableReadingSize')}</small></div><div className="text-size-options" role="group" aria-label={t('textSize')}>{(['standard', 'large', 'extra-large'] as const).map((size) => <button type="button" key={size} className={preference.textSize === size ? 'selected' : ''} aria-pressed={preference.textSize === size} onClick={() => dispatch({ type: 'SET_PREFERENCE', payload: { textSize: size } })}>{size === 'standard' ? 'A' : size === 'large' ? 'A+' : 'A++'}<small>{t(size === 'extra-large' ? 'extraLarge' : size)}</small></button>)}</div></div>
    {toggleOptions.map(([key, labelKey, descriptionKey]) => <div className="settings-item" key={key}><span className="settings-icon"><Icon>{key === 'highContrast' ? 'contrast' : key === 'reducedMotion' ? 'motion_photos_off' : 'filter_alt'}</Icon></span><div><strong>{t(labelKey)}</strong><small>{t(descriptionKey)}</small></div><button className={`toggle-switch${preference[key] ? ' on' : ''}`} type="button" role="switch" aria-checked={preference[key]} aria-label={t(labelKey)} onClick={() => dispatch({ type: 'SET_PREFERENCE', payload: { [key]: !preference[key] } })}><span /></button></div>)}
  </Card><Card className="accessibility-preview"><PanelHeading overline={t('accessibilityPreview')} title={t('comfortableDesign')} /><p>{t('accessibilityPreviewCopy')}</p><div className="preview-access-card"><Icon>favorite</Icon><div><strong>Care, at your pace</strong><small>{t('deviceOnlyPreference')}</small></div></div><div className="notice-inline"><Icon>info</Icon><span>Language and accessibility choices are stored locally. Healthcare data is not.</span></div></Card></div>;
}

function SettingsOverview() {
  return <div className="settings-overview-grid">{[
    ['account_circle', 'My profile', 'Name and account details', '/app/profile'],
    ['clinical_notes', 'Healthcare profile', 'Profile structure and emergency details', '/app/healthcare'],
    ['shield', 'Account & security', 'Sessions, invitations, and privacy', '/app/security'],
    ['notifications_active', 'Reminder preferences', 'Dose and appointment reminders', '/app/reminders'],
    ['hub', 'Integrations', 'Calendar and language service connections', '/app/integrations'],
    ['accessibility_new', 'Language & accessibility', 'Language, text size, contrast, and motion', '/app/accessibility'],
    ['help', 'Help & support', 'Guides and accessibility assistance', '/app/help'],
  ].map(([icon, title, copy, path]) => <Link className="settings-overview-card" to={path} key={title}><span className="settings-icon"><Icon>{icon}</Icon></span><strong>{title}</strong><small>{copy}</small><Icon>arrow_forward</Icon></Link>)}</div>;
}

function HelpPage({ sent, setSent }: { sent: boolean; setSent: (value: boolean) => void }) {
  return <div className="help-grid"><Card><PanelHeading overline="HELP CENTER" title="How can we help?" /><div className="help-link-list"><Link to="/app/schedule"><Icon>medication</Icon><span><strong>Reviewing a medication schedule</strong><small>Find today’s routines and record what happened.</small></span><Icon>arrow_forward</Icon></Link><Link to="/app/members"><Icon>group</Icon><span><strong>Managing your CareCircle</strong><small>Review access and invite trusted people.</small></span><Icon>arrow_forward</Icon></Link><Link to="/app/accessibility"><Icon>accessibility_new</Icon><span><strong>Accessibility and language</strong><small>Choose the settings that feel comfortable.</small></span><Icon>arrow_forward</Icon></Link></div></Card><Card><PanelHeading overline="CONTACT SUPPORT" title="Send a note" /><p className="muted-copy">This local sample form does not deliver messages or store your details.</p><form className="stack-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Topic<select><option>Using the prototype</option><option>Accessibility support</option><option>Technical issue</option></select></label><label>Message<textarea rows={4} maxLength={1000} required placeholder="Describe what you need help with." /></label><button className="button button-primary" type="submit">Submit demo request</button>{sent && <p className="form-success" role="status">Thanks. No message was sent; connect a secure support service before launch.</p>}</form></Card></div>;
}

function MedicationForm({ initial, onSubmit, onCancel }: { initial?: Medication; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form className="modal-form" onSubmit={onSubmit}>
    <div className="form-grid"><label>Medication name<input name="name" required maxLength={100} defaultValue={initial?.name} placeholder="e.g. Vitamin D3" /></label><label>Dosage<input name="dosage" required maxLength={80} defaultValue={initial?.dosage} placeholder="As provided by clinician" /></label><label>Frequency<select name="frequency" defaultValue={initial?.frequency ?? 'Once daily'}><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As instructed</option><option>Other</option></select></label><label>Scheduled time<input type="time" name="time" defaultValue={initial?.times[0] ?? '08:00'} required /></label><label>Start date<input type="date" name="startDate" defaultValue={initial?.startDate ?? dateInputValue()} required /></label><label>End date <span className="muted-copy">(optional)</span><input type="date" name="endDate" defaultValue={initial?.endDate} /></label><label className="full-width">Prescribing clinician<input name="prescriber" maxLength={100} defaultValue={initial?.prescriber} placeholder="Name on the prescription" /></label><label className="full-width">Instructions<textarea name="instructions" rows={2} maxLength={250} defaultValue={initial?.instructions} placeholder="Enter the instructions provided by your clinician" /></label></div>
    <div className="notice-inline"><Icon>info</Icon><span>Double-check details with the prescription. This prototype does not validate medicines or provide medical guidance.</span></div>
    <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{initial ? 'Save changes' : 'Add medication'}</button></div>
  </form>;
}

function AppointmentForm({ initial, onSubmit, onCancel }: { initial?: Appointment; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form className="modal-form" onSubmit={onSubmit}><div className="form-grid">
    <label className="full-width">Appointment title<input name="title" required maxLength={120} defaultValue={initial?.title} placeholder="e.g. Routine check-up" /></label><label>Clinician<input name="doctor" required maxLength={100} defaultValue={initial?.doctor} placeholder="Clinician name" /></label><label>Clinic or location<input name="location" required maxLength={120} defaultValue={initial?.location} placeholder="Clinic name" /></label><label>Date<input name="date" type="date" min={dateInputValue()} required defaultValue={initial?.date} /></label><label>Time<input name="time" type="time" required defaultValue={initial?.time ?? '10:00'} /></label><label className="full-width">Preparation notes<textarea name="notes" rows={3} maxLength={500} defaultValue={initial?.notes} placeholder="Optional notes to help the circle coordinate" /></label>
  </div><div className="modal-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{initial ? 'Save appointment' : 'Add appointment'}</button></div></form>;
}

function MemberForm({ initial, onSubmit, onCancel }: { initial?: CircleMember; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  const currentPermissions = initial?.permissions ?? ['View medication schedules', 'View adherence reports'];
  return <form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><label>Full name<input name="name" required maxLength={100} defaultValue={initial?.name} placeholder="Member name" /></label><label>Email address<input name="email" type="email" required maxLength={254} defaultValue={initial?.email} placeholder="name@example.com" /></label><label className="full-width">Role<select name="role" defaultValue={initial?.role ?? 'Family member'}><option>Family member</option><option>Professional caretaker</option><option>Healthcare coordinator</option></select></label></div>
    <fieldset className="permission-fieldset"><legend>Choose specific permissions</legend><p>The profile owner can review or revoke access at any time.</p><div className="permission-checkboxes">{permissionOptions.map((permission) => <label key={permission}><input type="checkbox" name="permissions" value={permission} defaultChecked={currentPermissions.includes(permission)} />{permission}</label>)}</div></fieldset>
    <div className="notice-inline"><Icon>shield</Icon><span>This demonstration does not create a real invitation or enforce permissions on a server.</span></div>
    <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{initial ? 'Save permissions' : 'Create demo invitation'}</button></div>
  </form>;
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="detail-field"><small>{label}</small><strong>{children}</strong></div>;
}

function PanelHeading({ overline, title }: { overline: string; title: string }) {
  return <div className="panel-heading"><span className="eyebrow">{overline}</span><h2>{title}</h2></div>;
}

function NotFound({ title, back }: { title: string; back: string }) {
  return <Card><EmptyState icon="search_off" title={title} copy="The sample record may have been removed." action={<Link className="button button-primary" to={back}>Go back</Link>} /></Card>;
}
