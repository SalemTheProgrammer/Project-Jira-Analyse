import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { downloadJiraTicketsAsync } from "../redux/jira/actions";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Form, Spinner } from "react-bootstrap";
import { saveAs } from 'file-saver';
import { useHistory } from 'react-router-dom';  // Import useHistory

const JiraTickets = () => {
  const dispatch = useDispatch();
  const { notif } = useSelector((state) => state.jira);
  const history = useHistory();  // Initialize useHistory

  const [jiraData, setJiraData] = useState({
    jira_server: "",
    jira_username: "",
    jira_api_token: "",
    jira_project_key: "",
    jql_query: ""
  });

  const [showJQLModal, setShowJQLModal] = useState(false);
  const [jqlQuery, setJqlQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJiraData({
      ...jiraData,
      [name]: value,
    });
  };

  const handleJQLChange = (e) => {
    setJqlQuery(e.target.value);
  };

  const handleDownloadAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(downloadJiraTicketsAsync(jiraData));
      if (result.issues) {
        const blob = new Blob([JSON.stringify(result.issues, null, 2)], { type: 'application/json' });
        saveAs(blob, `jira_tickets_${jiraData.jira_project_key}.json`);
        toast.success(`Downloaded ${result.issues.length} issues from JIRA project ${jiraData.jira_project_key}`);
        history.push('/busi-admin/model');  // Navigate to /model route
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred while downloading tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJQL = async (e) => {
    // ignore the default functionality of the event button click
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(downloadJiraTicketsAsync({ ...jiraData, jql_query: jqlQuery }));
      if (result.issues) {
        const blob = new Blob([JSON.stringify(result.issues, null, 2)], { type: 'application/json' });
        saveAs(blob, `jira_tickets_jql_${jiraData.jira_project_key}.json`);
        toast.success(`Downloaded ${result.issues.length} issues from JIRA with JQL query`);
        history.push('/model');  // Navigate to /model route
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred while downloading tickets');
    } finally {
      setLoading(false);
      setShowJQLModal(false);
    }
  };

  const handleShowJQLModal = (e) => {
    e.preventDefault();
    setShowJQLModal(true);
  };

  const handleCloseJQLModal = (e) => {
    e.preventDefault();
    setShowJQLModal(false);
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4">Import Tickets from JIRA</h1>
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card shadow-sm p-4" style={{ backgroundColor: 'white' }}>
            <Form>
              <Form.Group className="mb-3" controlId="jira_server">
                <Form.Label>JIRA Server URL</Form.Label>
                <Form.Control
                  type="text"
                  name="jira_server"
                  onChange={handleInputChange}
                  placeholder="Enter JIRA Server URL"
                  value={jiraData.jira_server}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="jira_username">
                <Form.Label>JIRA Username</Form.Label>
                <Form.Control
                  type="text"
                  name="jira_username"
                  onChange={handleInputChange}
                  placeholder="Enter JIRA Username"
                  value={jiraData.jira_username}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="jira_api_token">
                <Form.Label>JIRA API Token</Form.Label>
                <Form.Control
                  type="password"
                  name="jira_api_token"
                  onChange={handleInputChange}
                  placeholder="Enter JIRA API Token"
                  value={jiraData.jira_api_token}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="jira_project_key">
                <Form.Label>JIRA Project Key</Form.Label>
                <Form.Control
                  type="text"
                  name="jira_project_key"
                  onChange={handleInputChange}
                  placeholder="Enter JIRA Project Key"
                  value={jiraData.jira_project_key}
                />
              </Form.Group>
              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: '#007bff', color: 'white', border: 'none' }}
                  onClick={handleDownloadAll}
                  disabled={loading}
                >
                  {loading && <Spinner animation="border" size="sm" className="me-2" />}
                  Learn from All Tickets
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none' }}
                  onClick={handleShowJQLModal}
                  disabled={loading}
                >
                  Learn from Specific Ticket
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <Modal show={showJQLModal} onHide={handleCloseJQLModal}>
        <Modal.Header closeButton>
          <Modal.Title>Download Tickets by JQL</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="jqlQuery">
            <Form.Label>JQL Query</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter JQL query"
              value={jqlQuery}
              onChange={handleJQLChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none' }}
            onClick={handleCloseJQLModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ backgroundColor: '#007bff', color: 'white', border: 'none' }}
            onClick={handleDownloadJQL}
            disabled={loading}
          >
            {loading && <Spinner animation="border" size="sm" className="me-2" />}
            Download
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JiraTickets;
