import re
from flask import Blueprint, request, jsonify
from config.blibs import get_db
from flasgger import swag_from
from transformers import BertTokenizer, BertModel
import torch

tree_model_bp = Blueprint('tree_model_bp', __name__)
db = get_db()

# Load pre-trained BERT model and tokenizer once
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

class TreeNode:
    def __init__(self, id, name, children=None, embedding=None):
        self.id = id
        self.name = name
        self.embedding = embedding
        self.children = [TreeNode.from_dict(child) for child in children] if children else []

    def to_dict(self, remove_embedding=False):
        return {
            'id': self.id,
            'name': self.name,
            'embedding': None if remove_embedding else (self.embedding.tolist() if self.embedding is not None else None),
            'children': [child.to_dict(remove_embedding=remove_embedding) for child in self.children]
        }

    @staticmethod
    def from_dict(data):
        return TreeNode(
            id=data['id'],
            name=data['name'],
            embedding=torch.tensor(data['embedding']) if data.get('embedding') is not None else None,
            children=data.get('children', [])
        )

    def compute_embedding(self):
        inputs = tokenizer(self.name, return_tensors='pt')
        with torch.no_grad():
            outputs = model(**inputs)
        self.embedding = outputs.last_hidden_state.mean(dim=1).squeeze()

        for child in self.children:
            child.compute_embedding()

@tree_model_bp.route('/', methods=['POST'])
@swag_from({
    'summary': 'Save/Update tree',
    'description': 'Save or update the tree structure in the database.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer', 'example': 1},
                    'name': {'type': 'string', 'example': 'Root'},
                    'children': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer', 'example': 2},
                                'name': {'type': 'string', 'example': 'Child'},
                                'children': {
                                    'type': 'array',
                                    'items': {'type': 'object'}
                                }
                            }
                        }
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Tree saved/updated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'notif': {
                        'type': 'object',
                        'properties': {
                            'type': {'type': 'string', 'example': 'success'},
                            'msg': {'type': 'string', 'example': 'Tree saved/updated successfully'}
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Failed to save tree',
            'schema': {
                'type': 'object',
                'properties': {
                    'notif': {
                        'type': 'object',
                        'properties': {
                            'msg': {'type': 'string', 'example': 'Failed to save tree'}
                        }
                    },
                    'error': {
                        'type': 'object',
                        'properties': {
                            'field': {'type': 'string'},
                            'msg': {'type': 'string'}
                        }
                    }
                }
            }
        }
    }
})
def save_tree():
    try:
        tree_data = request.json
        tree = TreeNode.from_dict(tree_data)
        tree.compute_embedding()
        tree_dict = tree.to_dict()

        db.classification_tree.replace_one({}, tree_dict, upsert=True)
        return jsonify({
            'notif': {
                'type': "success",
                'msg': "Tree saved/updated successfully"
            }
        })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to save tree: {e}",
            },
            'error': {
                'field': 'General',
                'msg': str(e),
            }
        }), 400

@tree_model_bp.route('/', methods=['GET'])
@swag_from({
    'summary': 'Load tree',
    'description': 'Load the tree structure from the database.',
    'responses': {
        200: {
            'description': 'Tree loaded successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'data': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer', 'example': 1},
                            'name': {'type': 'string', 'example': 'Root'},
                            'children': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'id': {'type': 'integer', 'example': 2},
                                        'name': {'type': 'string', 'example': 'Child'},
                                        'children': {
                                            'type': 'array',
                                            'items': {'type': 'object'}
                                        }
                                    }
                                }
                            }
                        }
                    },
                    'notif': {
                        'type': 'object',
                        'properties': {
                            'type': {'type': 'string', 'example': 'success'},
                            'msg': {'type': 'string', 'example': 'Tree loaded successfully'}
                        }
                    }
                }
            }
        },
        404: {
            'description': 'No tree found in the database',
            'schema': {
                'type': 'object',
                'properties': {
                    'notif': {
                        'type': 'object',
                        'properties': {
                            'type': {'type': 'string', 'example': 'warning'},
                            'msg': {'type': 'string', 'example': 'No tree found in the database'}
                        }
                    }
                }
            }
        }
    }
})
def load_tree():
    tree_data = db.classification_tree.find_one()
    if tree_data:
        tree = TreeNode.from_dict(tree_data)
        return jsonify({
            'data': tree.to_dict(remove_embedding=True),
            'notif': {
                'type': "success",
                'msg': "Tree loaded successfully"
            }
        })
    else:
        return jsonify({
            'notif': {
                'type': "warning",
                'msg': "No tree found in the database"
            }
        })

