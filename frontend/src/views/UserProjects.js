import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountsAsync,
  assignProjectAsync,
  getProjectsForAccountAsync,
} from "../redux/account/actions"; // Adjust the path as necessary
import { getTicketsAsync } from "../redux/issues/actions"; // Adjust the path as necessary
import { Form, Button, Alert, Container, Row, Col, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import '../style/UserProjects.css'; // Import custom CSS for additional styling

const UserProject = () => {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.account.accounts);
  const projects = useSelector((state) => state.account.projects);
  const notif = useSelector((state) => state.account.notif);
  const tickets = useSelector((state) => state.jira.tickets);

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [assignedProjects, setAssignedProjects] = useState({});

  useEffect(() => {
    dispatch(getAccountsAsync());
    dispatch(getTicketsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (selectedAccountId) {
      dispatch(getProjectsForAccountAsync(selectedAccountId));
    }
  }, [dispatch, selectedAccountId]);

  const handleAssignProject = (accountId) => {
    if (accountId && projectName) {
      dispatch(assignProjectAsync(accountId, projectName));
      setAssignedProjects((prev) => ({
        ...prev,
        [accountId]: [...(prev[accountId] || []), projectName],
      }));
      setProjectName(''); // Clear project name input after assigning
    }
  };

  return (
    <Container>
      <h1 className="text-center my-4">User Project Management</h1>

      {notif && notif.msg && (
        <Alert variant={notif.type} className="text-center">
          <div dangerouslySetInnerHTML={{ __html: notif.msg }}></div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h2>Assign Project to User</h2>
          <Form>
            <Form.Group controlId="projectName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                as="select"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              >
                <option value="">Select Project</option>
                {Array.from(new Set(tickets.map((ticket) => ticket.Project))).map(
                  (project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  )
                )}
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2>Users</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Assigned Projects</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={account._id}>
                  <td>{index + 1}</td>
                  <td>{account.username}</td>
                  <td>
                    {assignedProjects[account._id] && assignedProjects[account._id].length > 0 ? (
                      <ul>
                        {assignedProjects[account._id].map((project, idx) => (
                          <li key={idx}>{project}</li>
                        ))}
                      </ul>
                    ) : (
                      "No projects assigned"
                    )}
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-${account._id}`}>Assign project to {account.username}</Tooltip>}
                    >
                      <Button
                        variant="success"
                        className="assign-button"
                        onClick={() => handleAssignProject(account._id)}
                        disabled={!projectName}
                      >
                        <i className="bi bi-check-circle"></i> Assign
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {selectedAccountId && (
        <Row>
          <Col>
            <h2>Projects for Selected User</h2>
            <ul>
              {projects.map((project, index) => (
                <li key={index}>{project}</li>
              ))}
            </ul>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UserProject;
