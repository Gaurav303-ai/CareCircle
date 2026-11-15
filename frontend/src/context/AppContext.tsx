import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

export type UserRole = 'elderly' | 'caretaker' | 'family';
export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te';
export type DoseStatus = 'taken' | 'upcoming' | 'due' | 'skipped' | 'unconfirmed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions: string;
  prescriber: string;
  status: 'active' | 'completed';
}

export interface Dose {
  id: string;
  medicationId: string;
  time: string;
  status: DoseStatus;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  location: string;
  notes: string;
}

export interface CircleMember {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
  status: string;
  permissions: string[];
  lastActive: string;
}

export interface CareNotification {
  id: string;
  type: 'medication' | 'appointment' | 'member' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Preference {
  language: Language;
  textSize: 'standard' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  simplified: boolean;
}

export interface AppState {
  user?: User;
  medications: Medication[];
  doses: Dose[];
  appointments: Appointment[];
  members: CircleMember[];
  notifications: CareNotification[];
  activities: { id: string; text: string; time: string; icon: string }[];
  preference: Preference;
}

const demoMedications: Medication[] = [
  { id: 'med-1', name: 'Vitamin D3', dosage: '1 tablet · 1000 IU', frequency: 'Once daily', times: ['08:00'], startDate: '2026-10-01', instructions: 'Take with breakfast', prescriber: 'Dr. Meera Shah', status: 'active' },
  { id: 'med-2', name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily', times: ['08:30', '19:00'], startDate: '2026-08-15', instructions: 'Take with food', prescriber: 'Dr. Meera Shah', status: 'active' },
  { id: 'med-3', name: 'Calcium supplement', dosage: '1 tablet · 600 mg', frequency: 'Once daily', times: ['13:00'], startDate: '2026-09-10', instructions: 'Take after lunch', prescriber: 'Dr. Anil Rao', status: 'active' },
  { id: 'med-4', name: 'Eye drops', dosage: '1 drop each eye', frequency: 'Twice daily', times: ['09:00', '21:00'], startDate: '2026-10-20', instructions: 'Use as instructed by clinician', prescriber: 'Dr. Anil Rao', status: 'active' },
];

const preferencesKey = 'carecircle_preferences';

const initialState: AppState = {
  medications: demoMedications,
  doses: [
    { id: 'dose-1', medicationId: 'med-1', time: '08:00', status: 'taken' },
    { id: 'dose-2', medicationId: 'med-2', time: '08:30', status: 'taken' },
    { id: 'dose-3', medicationId: 'med-3', time: '13:00', status: 'upcoming' },
    { id: 'dose-4', medicationId: 'med-4', time: '21:00', status: 'upcoming' },
  ],
  appointments: [
    { id: 'apt-1', title: 'Routine check-up', date: '2026-11-18', time: '10:30', doctor: 'Dr. Meera Shah', location: 'Greenwood Family Clinic', notes: 'Bring the current medication list.' },
    { id: 'apt-2', title: 'Eye care follow-up', date: '2026-11-24', time: '14:00', doctor: 'Dr. Anil Rao', location: 'City Eye Centre', notes: 'Family member coordinating: Priya.' },
  ],
  members: [
    { id: 'member-1', name: 'Priya Sharma', email: 'priya@example.com', role: 'Daughter · Coordinator', initials: 'PS', color: 'lavender', status: 'Active now', permissions: ['View healthcare profile', 'View medication schedules', 'View adherence reports', 'Manage appointments'], lastActive: 'Active now' },
    { id: 'member-2', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'Son · Family member', initials: 'AS', color: 'peach', status: 'Active today', permissions: ['View medication schedules', 'View adherence reports'], lastActive: 'Today, 9:12 AM' },
    { id: 'member-3', name: 'Nina Patel', email: 'nina@example.com', role: 'Professional caretaker', initials: 'NP', color: 'mint', status: 'Invited', permissions: ['View medication schedules', 'Add medication records', 'Manage appointments'], lastActive: 'Invitation pending' },
  ],
  notifications: [
    { id: 'note-1', type: 'medication', title: 'Afternoon dose coming up', message: 'Calcium supplement is scheduled for 1:00 PM.', time: '10 min ago', read: false },
    { id: 'note-2', type: 'appointment', title: 'Appointment this week', message: 'Routine check-up with Dr. Meera Shah · Nov 18 at 10:30 AM.', time: 'Yesterday', read: false },
    { id: 'note-3', type: 'member', title: 'CareCircle invitation sent', message: 'Nina Patel was invited as a professional caretaker.', time: 'Yesterday', read: true },
    { id: 'note-4', type: 'system', title: 'Weekly overview is ready', message: 'Your recorded routine activity for this week is available to review.', time: 'Nov 12', read: true },
  ],
  activities: [
    { id: 'act-1', text: 'Morning dose recorded as taken · Vitamin D3', time: 'Today, 8:02 AM', icon: 'check_circle' },
    { id: 'act-2', text: 'Morning dose recorded as taken · Metformin', time: 'Today, 8:31 AM', icon: 'check_circle' },
    { id: 'act-3', text: 'Eye care follow-up added to appointments', time: 'Yesterday, 4:18 PM', icon: 'event' },
    { id: 'act-4', text: 'Caretaker invitation sent to Nina Patel', time: 'Yesterday, 2:05 PM', icon: 'group_add' },
  ],
  preference: loadPreferences(),
};

function loadPreferences(): Preference {
  const defaults: Preference = { language: 'en', textSize: 'standard', highContrast: false, reducedMotion: false, simplified: false };
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = window.localStorage.getItem(preferencesKey);
    if (!stored) return defaults;
    const value: Partial<Preference> = JSON.parse(stored);
    const languages: Language[] = ['en', 'hi', 'bn', 'ta', 'te'];
    return {
      ...defaults,
      ...value,
      language: languages.includes(value.language as Language) ? value.language as Language : defaults.language,
      textSize: ['standard', 'large', 'extra-large'].includes(value.textSize ?? '') ? value.textSize as Preference['textSize'] : defaults.textSize,
    };
  } catch (error) {
    console.warn('CareCircle preferences could not be loaded.', error);
    return defaults;
  }
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'RECORD_DOSE'; payload: { id: string; medicationId: string; time: string; status: Extract<DoseStatus, 'taken' | 'skipped'> } }
  | { type: 'ADD_MEMBER'; payload: CircleMember }
  | { type: 'UPDATE_MEMBER'; payload: CircleMember }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_PREFERENCE'; payload: Partial<Preference> };

function addActivity(state: AppState, text: string, icon: string): AppState['activities'] {
  return [{ id: `act-${Date.now()}`, text, time: new Date().toLocaleString(), icon }, ...state.activities];
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'LOGOUT':
      return { ...state, user: undefined };
    case 'SET_ROLE':
      return state.user ? { ...state, user: { ...state.user, role: action.payload } } : state;
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [action.payload, ...state.medications],
        doses: action.payload.times.length
          ? [{ id: `dose-${action.payload.id}-0`, medicationId: action.payload.id, time: action.payload.times[0], status: 'upcoming' }, ...state.doses]
          : state.doses,
        activities: addActivity(state, `Medication added · ${action.payload.name}`, 'medication'),
      };
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map((item) => item.id === action.payload.id ? action.payload : item),
        activities: addActivity(state, `Medication updated · ${action.payload.name}`, 'edit'),
      };
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter((item) => item.id !== action.payload),
        doses: state.doses.filter((dose) => dose.medicationId !== action.payload),
        activities: addActivity(state, 'Medication removed from the sample care plan', 'delete'),
      };
    case 'RECORD_DOSE': {
      const dose = state.doses.find((item) => item.id === action.payload.id)
        ?? { id: action.payload.id, medicationId: action.payload.medicationId, time: action.payload.time, status: 'upcoming' as const };
      const medication = state.medications.find((item) => item.id === action.payload.medicationId);
      const event = action.payload.status === 'taken' ? 'recorded as taken' : 'recorded as skipped';
      return {
        ...state,
        doses: state.doses.some((item) => item.id === action.payload.id)
          ? state.doses.map((item) => item.id === action.payload.id ? { ...item, status: action.payload.status } : item)
          : [{ ...dose, status: action.payload.status }, ...state.doses],
        activities: medication
          ? [{ id: `act-${Date.now()}`, text: `${event} · ${medication.name}`, time: new Date().toLocaleString(), icon: action.payload.status === 'taken' ? 'check_circle' : 'do_not_disturb_on' }, ...state.activities]
          : state.activities,
      };
    }
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload], activities: addActivity(state, `CareCircle invitation created · ${action.payload.name}`, 'group_add') };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((member) => member.id === action.payload.id ? action.payload : member),
        activities: addActivity(state, `Member permissions updated · ${action.payload.name}`, 'admin_panel_settings'),
      };
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter((member) => member.id !== action.payload),
        activities: addActivity(state, 'CareCircle member access revoked', 'person_remove'),
      };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload].sort((a, b) => a.date.localeCompare(b.date)),
        activities: addActivity(state, `Appointment added · ${action.payload.title}`, 'event'),
      };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map((item) => item.id === action.payload.id ? action.payload : item),
        activities: addActivity(state, `Appointment updated · ${action.payload.title}`, 'edit_calendar'),
      };
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter((item) => item.id !== action.payload),
        activities: addActivity(state, 'Appointment removed from the sample calendar', 'event_busy'),
      };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map((item) => item.id === action.payload ? { ...item, read: true } : item) };
    case 'SET_PREFERENCE': {
      const preference = { ...state.preference, ...action.payload };
      try {
        window.localStorage.setItem(preferencesKey, JSON.stringify(preference));
      } catch (error) {
        console.warn('CareCircle preferences could not be saved.', error);
      }
      return { ...state, preference };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
