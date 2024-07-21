import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTicketsAsync,
  toggleTicketActivationAsync,
} from "../redux/issues/actions"; // Adjust the path as necessary
import NotificationAlert from "react-notification-alert";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/JiraTicket.css";
import { Pagination, Modal, Button, Form } from "react-bootstrap";

function JiraTickets() {
  const notificationAlertRef = useRef(null);
  const notify = (notif, place) => {
    var options = {
      message: <div dangerouslySetInnerHTML={{ __html: notif.msg }}></div>,
      type: notif.type,
      place: place,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 5,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const { tickets, notif } = useSelector((state) => state.jira);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
  const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(5);
  const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);
  const pageNumberLimit = 5;

  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    project: "",
    type: "",
    resolution: "",
  });

  useEffect(() => {
    dispatch(getTicketsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (notif?.msg) {
      notify(notif, "tr");
    }
  }, [notif]);

  const handleToggleActivation = async (id) => {
    await dispatch(toggleTicketActivationAsync(id));
    dispatch(getTicketsAsync()); // Refresh the tickets list after toggling activation
  };

  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Get unique filter options from tickets
  const getUniqueFilterOptions = (field) => {
    return [...new Set(tickets.map((ticket) => ticket[field]))];
  };

  const filterOptions = {
    project: getUniqueFilterOptions("Project"),
    type: getUniqueFilterOptions("Type"),
    resolution: getUniqueFilterOptions("Resolution"),
  };

  // Filter tickets based on filter state
  const filteredTickets = tickets.filter((ticket) => {
    return (
      (filters.project ? ticket.Project === filters.project : true) &&
      (filters.type ? ticket.Type === filters.type : true) &&
      (filters.resolution ? ticket.Resolution === filters.resolution : true)
    );
  });

  // Get current tickets
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextbtn = () => {
    setCurrentPage(currentPage + 1);
    if (currentPage + 1 > maxPageNumberLimit) {
      setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
    }
  };

  const handlePrevbtn = () => {
    setCurrentPage(currentPage - 1);
    if ((currentPage - 1) % pageNumberLimit === 0) {
      setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
    }
  };

  return (
    <div className="container-fluid">
      <NotificationAlert ref={notificationAlertRef} />
      <div className="row mb-3">
        <div className="col-md-4">
          <Form.Group controlId="filterProject">
            <Form.Label>Project</Form.Label>
            <Form.Control
              as="select"
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {filterOptions.project.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group controlId="filterType">
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {filterOptions.type.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group controlId="filterResolution">
            <Form.Label>Resolution</Form.Label>
            <Form.Control
              as="select"
              name="resolution"
              value={filters.resolution}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {filterOptions.resolution.map((resolution) => (
                <option key={resolution} value={resolution}>
                  {resolution}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="table-responsive">
            <table className="table table-hover table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">TITLE</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">PROJECT</th>
                  <th scope="col">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(currentTickets) &&
                  currentTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>{ticket.Title}</td>
                      <td>{ticket.Status}</td>
                      <td>{ticket.Project}</td>
                      <td className="d-flex">
                        <button
                          className="btn btn-primary btn-sm mr-2"
                          onClick={() => handleShowModal(ticket)}
                        >
                          View Details
                        </button>
                        <button
                          className={`btn ${
                            ticket.activated ? "btn-danger" : "btn-success"
                          } btn-sm`}
                          onClick={() => handleToggleActivation(ticket._id)}
                        >
                          {ticket.activated ? (
                            <>
                              <FaToggleOff className="mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <FaToggleOn className="mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <Pagination>
            <Pagination.Prev
              onClick={handlePrevbtn}
              disabled={currentPage === 1}
            />
            {Array.from(
              { length: Math.ceil(filteredTickets.length / ticketsPerPage) },
              (_, index) => {
                const page = index + 1;
                if (page <= maxPageNumberLimit && page > minPageNumberLimit) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                }
                return null;
              }
            )}
            <Pagination.Next
              onClick={handleNextbtn}
              disabled={
                currentPage ===
                Math.ceil(filteredTickets.length / ticketsPerPage)
              }
            />
          </Pagination>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedTicket?.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Description:</strong> {selectedTicket?.Description}
          </p>
          <p>
            <strong>Status:</strong> {selectedTicket?.Status}
          </p>
          <p>
            <strong>Project:</strong> {selectedTicket?.Project}
          </p>
          <p>
            <strong>Component:</strong> {selectedTicket?.Component}
          </p>
          <p>
            <strong>Resolution:</strong> {selectedTicket?.Resolution}
          </p>
          <p>
            <strong>Type:</strong> {selectedTicket?.Type}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default JiraTickets;
