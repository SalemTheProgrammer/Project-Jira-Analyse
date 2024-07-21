import axios from 'axios';
import {
    getTickets,
    addTicket,
    updateTicket,
    deleteTicket,
    toggleTicketActivation
} from './reducers'; // Adjust the path as necessary

const API = '/jira';

export const getTicketsAsync = () => async (dispatch) => {
    try {
        const response = await axios.get(`${API}/`);
        console.log("Fetched tickets response:", response.data); // Debug log
        dispatch(getTickets(response.data.data)); // Update this line
    } catch (error) {
        console.error('Error fetching tickets:', error);
    }
};

export const addTicketAsync = (ticket) => async (dispatch) => {
    try {
        const response = await axios.post(`${API}/`, ticket);
        console.log("Added ticket:", response.data); // Debug log
        dispatch(addTicket(response.data));
    } catch (error) {
        console.error('Error adding ticket:', error);
    }
};

export const updateTicketAsync = (ticketId, updatedTicket) => async (dispatch) => {
    try {
        const response = await axios.put(`${API}/${ticketId}`, updatedTicket);
        console.log("Updated ticket:", response.data); // Debug log
        dispatch(updateTicket(response.data));
    } catch (error) {
        console.error('Error updating ticket:', error);
    }
};

export const deleteTicketAsync = (ticketId) => async (dispatch) => {
    try {
        await axios.delete(`${API}/${ticketId}`);
        console.log("Deleted ticket ID:", ticketId); // Debug log
        dispatch(deleteTicket(ticketId));
    } catch (error) {
        console.error('Error deleting ticket:', error);
    }
};

export const toggleTicketActivationAsync = (ticketId) => async (dispatch) => {
    try {
        const response = await axios.patch(`${API}/${ticketId}/toggle-activation`);
        console.log("Toggled ticket activation:", response.data); // Debug log
        dispatch(toggleTicketActivation({ ticketId, activated: response.data.activated }));
    } catch (error) {
        console.error('Error toggling ticket activation:', error);
    }
};
