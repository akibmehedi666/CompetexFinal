import { create } from 'zustand';
import { User, Event, Team, ChatMessage } from '@/types';
import { EVENTS, USERS } from '@/constants/mockData';
import { normalizeRole, sanitizeUserData } from '@/lib/auth';
import { API_BASE_URL, ENDPOINTS } from '@/lib/api_config';

interface AppState {
    // Auth
    currentUser: User | null;
    login: (email: string, user?: User) => void;
    logout: () => void;
    initAuth: () => void;

    // Data
    events: Event[];
    filteredEvents: Event[];
    fetchEvents: () => Promise<void>;
    setFilter: (filter: string) => void;

    // Team
    myTeam: Team | null;
    addToTeam: (user: User) => void;
    removeFromTeam: (userId: string) => void;

    // Chat
    messages: ChatMessage[];
    activeDirectMessageUser: User | null;
    setActiveDirectMessageUser: (user: User | null) => void;
    addMessage: (msg: Omit<ChatMessage, "id" | "timestamp" | "recipientId">) => void;
}

// Mock initial data handling... in real app would be API calls
export const useStore = create<AppState>((set, get) => ({
    currentUser: null,
    login: (email, user) => {
        // If real user object is provided (from API login/signup), use it
        if (user) {
            const sanitizedUser = sanitizeUserData(user);
            set({ currentUser: sanitizedUser });
            localStorage.setItem("competex_user_session", JSON.stringify(sanitizedUser));
            return;
        }

        // Check localStorage first for registered users
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("competex_user_session");
            if (stored) {
                try {
                    const userData = JSON.parse(stored);
                    if (userData.email === email) {
                        const sanitizedUser = sanitizeUserData(userData);
                        set({ currentUser: sanitizedUser });
                        // Update storage with sanitized version
                        localStorage.setItem("competex_user_session", JSON.stringify(sanitizedUser));
                        return;
                    }
                } catch (e) {
                    console.error("Error parsing stored user:", e);
                }
            }
        }

        // Fallback to mock users (ONLY if no real user provided or found)
        const existingUser = USERS.find(u => u.email === email);
        const fallbackUser = sanitizeUserData(existingUser || { ...USERS[0], email, name: email.split('@')[0] });

        set({ currentUser: fallbackUser });
        localStorage.setItem("competex_user_session", JSON.stringify(fallbackUser));
    },
    logout: () => {
        set({ currentUser: null });
        localStorage.removeItem("competex_user_session");

        // Clear auth cookies
        document.cookie = "competex_token=; path=/; max-age=0";
        document.cookie = "competex_role=; path=/; max-age=0";

        window.location.href = "/";
    },

    // Initialize from LocalStorage
    initAuth: () => {
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem("competex_user_session");
            if (session) {
                try {
                    const userData = JSON.parse(session);
                    const sanitizedUser = sanitizeUserData(userData);
                    set({ currentUser: sanitizedUser });
                } catch (e) {
                    console.error("Error parsing stored session:", e);
                }
            }
        }
    },

    events: [], // Initial state empty, populated by fetchEvents
    filteredEvents: [],
    fetchEvents: async () => {
        try {
            const response = await fetch(ENDPOINTS.GET_EVENTS);
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            set({ events: data, filteredEvents: data });
        } catch (error) {
            console.error("Error fetching events:", error);
            set({ events: [], filteredEvents: [] }); // Clear events on error instead of showing mock data
        }
    },
    setFilter: (filter) => {
        const { events } = get();
        if (filter === 'All') {
            set({ filteredEvents: events });
        } else {
            set({
                filteredEvents: events.filter(
                    (e) => e.category === filter || e.mode === filter
                ),
            });
        }
    },

    myTeam: {
        id: 'my-team',
        name: 'My Squad',
        members: [],
        maxMembers: 4,
        leaderId: 'u1'
    },
    addToTeam: (user) => set((state) => {
        if (!state.myTeam || state.myTeam.members.length >= state.myTeam.maxMembers) return {};
        return {
            myTeam: {
                ...state.myTeam,
                members: [...state.myTeam.members, user]
            }
        };
    }),
    removeFromTeam: (userId) => set((state) => {
        if (!state.myTeam) return {};
        return {
            myTeam: {
                ...state.myTeam,
                members: state.myTeam.members.filter(m => m.id !== userId)
            }
        };
    }),

    messages: [],
    activeDirectMessageUser: null,
    setActiveDirectMessageUser: (user) => set({ activeDirectMessageUser: user }),
    addMessage: (msg) => set((state) => ({
        messages: [
            ...state.messages,
            {
                ...msg,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                recipientId: msg.channel === "Direct" ? state.activeDirectMessageUser?.id : undefined
            }
        ]
    })),
}));
