import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tickets: [],
    notif: {}
};

const jiraSlice = createSlice({
    name: 'jira',
    initialState,
    reducers: {
        getTickets(state, action) {
            state.tickets = action.payload;
        },
        addTicket(state, action) {
            state.tickets.push(action.payload);
        },
        updateTicket(state, action) {
            const index = state.tickets.findIndex(ticket => ticket._id === action.payload._id);
            if (index !== -1) {
                state.tickets[index] = action.payload;
            }
        },
        deleteTicket(state, action) {
            state.tickets = state.tickets.filter(ticket => ticket._id !== action.payload);
        },
        toggleTicketActivation(state, action) {
            const ticket = state.tickets.find(ticket => ticket._id === action.payload.ticketId);
            if (ticket) {
                ticket.activated = action.payload.activated;
            }
        }
    }
});

export const { getTickets, addTicket, updateTicket, deleteTicket, toggleTicketActivation } = jiraSlice.actions;

export default jiraSlice.reducer;
