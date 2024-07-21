import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';

export default function Model() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [bestMatch, setBestMatch] = useState('');
  const [treePaths, setTreePaths] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [progress, setProgress] = useState(0);
  const [ticketDetails, setTicketDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/best_matches_bp');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data fetched:', data.data);
        setIssues(data.data || []);

        if (!data.data || data.data.length === 0) {
          runModel();
        }
        setLoading(false); // Ensure loading state is updated
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    const fetchTreePaths = async () => {
      try {
        const response = await fetch('http://localhost:5000/tree');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTreePaths(extractPaths(data.data || {}));
      } catch (error) {
        console.error('Error fetching tree paths:', error);
      }
    };

    fetchTreePaths();
  }, []);

  const runModel = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/tree-classification/match_issues');
      if (!response.ok) {
        throw new Error('Failed to run the model');
      }
      const data = await response.json();
      console.log('Model run successfully:', data);
      // Update the issues or any other state based on the response
      setLoading(false);
    } catch (error) {
      console.error('Error running the model:', error);
      setLoading(false);
    }
  };

  const handleUpdateNoMatchIssue = (issue) => {
    setSelectedIssue(issue);
    setBestMatch('');
    setShowModal(true);
  };

  const handleSaveUpdate = async () => {
    try {
      if (!selectedIssue || !bestMatch) {
        alert('Please select a best match.');
        return;
      }

      const updatedIssue = { id: selectedIssue._id, best_match: bestMatch, similarity_score: 0.0 };
      const response = await fetch('http://localhost:5000/best_matches_bp/update_no_match_issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIssue),
      });

      if (!response.ok) {
        throw new Error('Failed to update no match issue');
      }

      const result = await response.json();
      alert(result.notif.msg);
      setShowModal(false);

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === updatedIssue.id ? { ...issue, best_matches: [{ path: bestMatch, similarity_score: 0.0 }] } : issue
        )
      );
    } catch (error) {
      console.error('Error updating no match issue:', error);
    }
  };

  const handleViewDetails = (issue) => {
    setTicketDetails(issue);
    setShowDetailsModal(true);
  };

  const extractPaths = (node, currentPath = 'Root') => {
    if (!node.children || node.children.length === 0) {
      return [currentPath];
    }
    let paths = [];
    for (let child of node.children) {
      paths = paths.concat(extractPaths(child, `${currentPath} -> ${child.name}`));
    }
    return paths;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return issues.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(issues.length / itemsPerPage);
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="container">
      <h1 className="my-4 text-center">Issue Matching Progress</h1>
      <button className="btn btn-primary mt-3" onClick={runModel}>Run the model again</button>
      {loading ? (
        <div className="text-center">
          <ProgressBar animated now={100} />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Best Match</th>
                <th>Similarity Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().map((issue, index) => {
                const bestMatch = issue.best_matches && issue.best_matches.length > 0 ? issue.best_matches[0].path : 'No match';
                const similarityScore = issue.best_matches && issue.best_matches.length > 0 ? issue.best_matches[0].similarity_score : null;

                return (
                  <tr key={index}>
                    <td className="text-truncate" style={{ maxWidth: '300px' }}>{issue.issue.ID}</td>
                    <td>{bestMatch}</td>
                    <td>{similarityScore !== null && similarityScore > 0 ? similarityScore.toFixed(2) : '--'}</td>
                    <td className="d-flex">
                      <button
                        className={`btn btn-sm text-white ${bestMatch === 'No match' ? 'btn-danger' : 'btn-primary'} mr-2`}
                        onClick={() => handleUpdateNoMatchIssue(issue)}
                        style={{ backgroundColor: bestMatch === 'No match' ? '#dc3545' : '#007bff' }}
                      >
                        Update Match
                      </button>
                      <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => handleViewDetails(issue)}
                        style={{ backgroundColor: '#17a2b8' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <nav>
            <ul className="pagination justify-content-center">
              {getPageNumbers().map((pageNumber) => (
                <li key={pageNumber} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pageNumber)}>
                    {pageNumber}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update No Match Issue</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="bestMatch">Best Match</label>
                  <select
                    id="bestMatch"
                    className="form-control"
                    value={bestMatch}
                    onChange={(e) => setBestMatch(e.target.value)}
                  >
                    <option value="">Select best match</option>
                    {treePaths.map((path, index) => (
                      <option key={index} value={path}>
                        {path}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveUpdate}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ticket Details</h5>
                <button type="button" className="close" onClick={() => setShowDetailsModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {ticketDetails && (
                  <div>
                    <p><strong>ID:</strong> {ticketDetails.issue.ID}</p>
                    <p><strong>Title:</strong> {ticketDetails.issue.Title}</p>
                    <p><strong>Description:</strong> {ticketDetails.issue.Description}</p>
                    <p><strong>Status:</strong> {ticketDetails.issue.Status}</p>
                    <p><strong>Project:</strong> {ticketDetails.issue.Project}</p>
                    <p><strong>Component:</strong> {ticketDetails.issue.Component}</p>
                    <p><strong>Type:</strong> {ticketDetails.issue.Type}</p>
                    <p><strong>Resolution:</strong> {ticketDetails.issue.Resolution}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
