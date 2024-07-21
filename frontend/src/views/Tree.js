import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { getTreeAsync, saveTree } from '../redux/tree/actions';  // Adjust the import path as needed
import '../style/Tree.css';
import '../style/main.css';

const MAX_CHILDREN = 9;

const HierarchyView = () => {
  const dispatch = useDispatch();
  const tree = useSelector((state) => state.tree.tree);
  const [showModal, setShowModal] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [newName, setNewName] = useState('');
  const [visibleNodes, setVisibleNodes] = useState(new Set());

  useEffect(() => {
    console.log('Fetching initial tree');
    dispatch(getTreeAsync());
  }, [dispatch]);

  const toggleVisibility = (node) => {
    const newVisibleNodes = new Set(visibleNodes);
    if (newVisibleNodes.has(node.id)) {
      newVisibleNodes.delete(node.id);
    } else {
      newVisibleNodes.add(node.id);
    }
    setVisibleNodes(newVisibleNodes);
  };

  const handleAddChild = (node) => {
    if (node.children.length < MAX_CHILDREN) {
      const newChild = { id: Date.now(), name: 'Keyword', children: [] };
      const newTree = addChildToTree(tree, node.id, newChild);
      console.log('Adding child:', newTree);
      dispatch(saveTree(newTree));
      setVisibleNodes(new Set(visibleNodes).add(node.id));
    }
  };

  const addChildToTree = (tree, parentId, newChild) => {
    if (tree.id === parentId) {
      return { ...tree, children: [...tree.children, newChild] };
    }
    return {
      ...tree,
      children: tree.children.map(child => addChildToTree(child, parentId, newChild))
    };
  };

  const handleEditName = (node) => {
    setCurrentNode(node);
    setNewName(node.name);
    setShowModal(true);
  };

  const handleUpdateName = () => {
    const newTree = updateNodeName(tree, currentNode.id, newName);
    console.log('Updating node name:', newTree);
    dispatch(saveTree(newTree));
    setShowModal(false);
  };

  const updateNodeName = (tree, nodeId, newName) => {
    if (tree.id === nodeId) {
      return { ...tree, name: newName };
    }
    return {
      ...tree,
      children: tree.children.map(child => updateNodeName(child, nodeId, newName))
    };
  };

  const handleDeleteNode = (nodeId) => {
    const newTree = deleteNodeFromTree(tree, nodeId);
    console.log('Deleting node:', newTree);
    dispatch(saveTree(newTree));
  };

  const deleteNodeFromTree = (tree, nodeId) => {
    if (tree.id === nodeId) {
      return null;
    }
    return {
      ...tree,
      children: tree.children
        .map(child => deleteNodeFromTree(child, nodeId))
        .filter(Boolean)
    };
  };

  const renderTree = (node, parent = null, level = 0) => {
    if (!node) return null;

    return (
      <div key={node.id} className="hv-item" style={{ margin: '5px', paddingLeft: `${level * 15}px` }}>
        <div className="hv-item-parent" style={{ backgroundColor: getColor(level) }}>
          <div className="simple-card">
            <span>{node.name}</span>
            <div className="crud-icons">
              <FaPlus size={12} onClick={() => handleAddChild(node)} />
              <FaEdit size={12} onClick={() => handleEditName(node)} />
              {parent && <FaTrash size={12} onClick={() => handleDeleteNode(node.id)} />}
              {node.children.length > 0 && (
                visibleNodes.has(node.id) ? (
                  <FaEyeSlash size={12} onClick={() => toggleVisibility(node)} />
                ) : (
                  <FaEye size={12} onClick={() => toggleVisibility(node)} />
                )
              )}
            </div>
          </div>
        </div>
        {visibleNodes.has(node.id) && node.children.length > 0 && (
          <div className="hv-item-children">
            {node.children.map(child => renderTree(child, node, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getColor = (level) => {
    const colors = [
      '#ffcccb', '#add8e6', '#90ee90', '#ffb6c1', '#dda0dd', '#f0e68c', '#e0ffff', '#faebd7', '#d3d3d3'
    ];
    return colors[level % colors.length];
  };

  const handleSave = () => {
    console.log('handleSave called');
    console.log('Tree structure to save:', tree);
    dispatch(saveTree(tree));
  };

  return (
    <div className="hv-container">
      <div className="header">
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
      <div className="hv-wrapper">
        {renderTree(tree)}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Node Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateName}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HierarchyView;
