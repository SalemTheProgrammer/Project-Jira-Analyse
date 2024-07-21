import React from 'react';
import Pagination from 'react-bootstrap/Pagination';
import '../style/CustomPagination.css';
const CustomPagination = ({ currentPage, totalPages, paginate }) => {
  const pageNumbers = [];

  // Determine the range of page numbers to display
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  // Adjust if we are at the beginning or end of the page range
  if (currentPage === 1) {
    endPage = Math.min(totalPages, 3);
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination className="custom-pagination">
      <Pagination.Prev 
        onClick={() => paginate(currentPage - 1)} 
        disabled={currentPage === 1} 
      />
      {pageNumbers.map((number) => (
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      ))}
      <Pagination.Next 
        onClick={() => paginate(currentPage + 1)} 
        disabled={currentPage === totalPages} 
      />
    </Pagination>
  );
};

export default CustomPagination;
