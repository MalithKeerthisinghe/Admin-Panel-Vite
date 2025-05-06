
import React from 'react';
import { Badge } from 'react-bootstrap';
import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const variant = STATUS_COLORS[status.toLowerCase()] || 'secondary';
  
  return (
    <Badge bg={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export { StatusBadge };

// src/components/common/ConfirmationModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmText, cancelText }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText || 'Cancel'}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmText || 'Confirm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { ConfirmationModal };

// src/components/common/DataTable.js
import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';

const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  actionColumn,
  onRowClick,
  keyField = 'id'
}) => {
  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
          {actionColumn && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actionColumn ? 1 : 0)} className="text-center">
              No data available
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr 
              key={item[keyField]} 
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((column) => (
                <td key={`${item[keyField]}-${column.key}`}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actionColumn && (
                <td>
                  {actionColumn(item)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export { DataTable };