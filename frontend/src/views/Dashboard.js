import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Row, Col, Pagination } from 'react-bootstrap';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [filters, setFilters] = useState({ status: '', project: '', startDate: '', endDate: '' });
  const [statuses, setStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 3;

  useEffect(() => {
    const fetchBestMatches = async () => {
      try {
        const response = await fetch('http://localhost:5000/best_matches_bp');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Filter directly using the fetched data
        const filtered = (data.data || []).filter(issue => issue.best_matches && issue.best_matches.length > 0);
        setMatches(filtered); // Set only filtered matches
        setFilteredMatches(filtered);

        const uniqueStatuses = [...new Set(filtered.map(item => item.issue.Status))];
        setStatuses(uniqueStatuses);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching best matches:', error);
        setLoading(false);
      }
    };

    fetchBestMatches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, matches]);

  const handleShowSimilarities = (path) => {
    const similarIssues = filteredMatches.filter((match) =>
      match.best_matches && match.best_matches.some((bm) => bm.path === path || bm.path.startsWith(path + ' ->') || path.startsWith(bm.path + ' ->'))
    );

    setSimilarIssues(similarIssues);
    setSelectedPath(path);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPath(null);
  };

  const handleShowQuestionModal = (issue) => {
    setSelectedIssue(issue);
    setShowQuestionModal(true);
  };

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false);
    setQuestion('');
    setAnswer('');
    setSelectedIssue(null);
  };

  const handleShowSummaryModal = (issue) => {
    setSelectedIssue(issue);
    setShowSummaryModal(true);
  };

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setSelectedIssue(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    let filtered = matches;

    if (filters.status) {
      filtered = filtered.filter(match => match.issue.Status === filters.status);
    }

    if (filters.project) {
      filtered = filtered.filter(match => match.issue.Project === filters.project);
    }

    if (filters.startDate) {
      filtered = filtered.filter(match => new Date(match.issue.Created) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(match => new Date(match.issue.Created) <= new Date(filters.endDate));
    }

    setFilteredMatches(filtered);
    setCurrentPage(1);
  };

  const renderIssueDetails = (issue) => {
    const issueDetails = {
      'Jira ID': issue.ID,
      'Title': issue.Title,
      'Description': issue.Description,
      'Created': new Date(issue.Created).toLocaleString(),
      'Updated': new Date(issue.Updated).toLocaleString(),
      'Status': issue.Status,
      'Project': issue.Project,
      'Component': issue.Component,
      'Type': issue.Type,
      'Resolution': issue.Resolution,
      'Summary Description': issue.SumDesc,
      'Summary Comments': issue.SumComm,
    };

    return Object.entries(issueDetails).map(([key, value]) => 
      value ? (
        <div key={key} className="mb-2">
          <strong>{key}:</strong> <span>{value}</span>
        </div>
      ) : null
    );
  };

  const handleAskQuestion = async () => {
    if (!question || !selectedIssue) return;
    
    try {
      const response = await fetch('http://localhost:5000/question-answering/answer_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, ticket_id: selectedIssue.issue.ID }),
      });

      if (!response.ok) {
        throw new Error('Failed to get the answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error getting the answer:', error);
      setAnswer('Failed to get the answer');
    }
  };

  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);

  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const renderStars = (score) => {
    const maxStars = 5;
    const filledStars = Math.round(score * maxStars);
    return '⭐'.repeat(filledStars) + '☆'.repeat(maxStars - filledStars);
  };

  const handleViewDetailedTicket = (issue) => {
    setSelectedIssue(issue);
    setShowSummaryModal(true);
  };

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Best Matches</h1>
      <Form className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group controlId="filterStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control as="select" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="filterProject">
              <Form.Label>Project</Form.Label>
              <Form.Control type="text" name="project" value={filters.project} onChange={handleFilterChange} placeholder="Enter project name" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="filterStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="filterEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <h4 className="mb-3">Loading Matches...</h4>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <p className="text-center">No best matches found.</p>
      ) : (
        <>
          <div className="row">
            {currentMatches.map((match, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title">
                        {match.ticket_summary} the main point of the description are : {match.description_summary} and they are talking about {match.comments_summary}
                      </h5>
                    </div>
                    {match.best_matches && match.best_matches.length > 0 && (
                      <div>
                        <p className="card-text" style={{ fontSize: '0.9rem' }}>
                          <strong>Best Match:</strong> {match.best_matches[0].path}
                        </p>
                        <div className="d-flex justify-content-around mt-2 card-buttons">
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowSimilarities(match.best_matches[0].path)}
                          >
                            Show Similarities
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowQuestionModal(match)}
                          >
                            Ask a Question
                          </Button>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowSummaryModal(match)}
                          >
                            Show Summary
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination className="d-flex justify-content-center">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
            {getPageNumbers().map(pageNumber => (
              <Pagination.Item key={pageNumber} active={pageNumber === currentPage} onClick={() => setCurrentPage(pageNumber)}>
                {pageNumber}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Similar Issues</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {similarIssues.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Similarity Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {similarIssues.map((issue, index) => (
                  <tr key={index}>
                    <td className="text-truncate" style={{ maxWidth: '300px' }}>{issue.issue.ID}</td>
                    <td>{renderStars(issue.best_matches[0].similarity_score)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleViewDetailedTicket(issue)}
                        style={{ borderRadius: '20px', padding: '5px 15px', fontWeight: 'bold' }}
                      >
                        View Detailed Ticket
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No similar issues found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showQuestionModal} onHide={handleCloseQuestionModal} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Ask a Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="question">
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
              />
            </Form.Group>
          </Form>
          {answer && (
            <div className="mt-3">
              <strong>Answer:</strong> <span>{answer}</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQuestionModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAskQuestion}>
            Ask
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSummaryModal} onHide={handleCloseSummaryModal} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Issue Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIssue && (
            <div>
              {renderIssueDetails(selectedIssue.issue)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSummaryModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
