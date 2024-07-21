from flask import Flask, Blueprint, request, jsonify
from bson.objectid import ObjectId
from flasgger import Swagger, swag_from
from config.DBs import get_db

app = Flask(__name__)
swagger = Swagger(app)

best_matches_bp = Blueprint('best_matches_bp', __name__)
db = get_db()

@best_matches_bp.route('/', methods=['POST'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Add a new best match',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'issue': {'type': 'string'},
                    'best_match': {'type': 'string'},
                    'similarity_score': {'type': 'number'}
                },
                'required': ['issue', 'best_match', 'similarity_score']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Best match added successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Best match added successfully'
                    }
                }
            }
        },
        '400': {
            'description': 'Failed to add best match'
        }
    }
})
def add_best_match():
    try:
        match_data = request.json
        result = db.matched_issues.insert_one(match_data)
        if result.inserted_id:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': "Best match added successfully",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to add best match: {str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        })

@best_matches_bp.route('/', methods=['GET'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Get all best matches',
    'responses': {
        '200': {
            'description': 'A list of best matches',
            'examples': {
                'application/json': {
                    'data': [
                        {
                            'issue': 'Issue description here...',
                            'best_match': 'Root > Node > Subnode',
                            'similarity_score': 0.95
                        }
                    ]
                }
            }
        }
    }
})
def get_best_matches():
    matches = []
    for match in db.matched_issues.find():
        match['_id'] = str(match['_id'])
        matches.append(match)
    return jsonify({
        'data': matches
    })

@best_matches_bp.route('/<id>', methods=['GET'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Get a best match by ID',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'string',
            'required': True
        }
    ],
    'responses': {
        '200': {
            'description': 'Best match details',
            'examples': {
                'application/json': {
                    'data': {
                        'issue': 'Issue description here...',
                        'best_match': 'Root > Node > Subnode',
                        'similarity_score': 0.95
                    }
                }
            }
        },
        '404': {
            'description': 'Best match not found'
        }
    }
})
def get_best_match(id):
    match = db.matched_issues.find_one({'_id': ObjectId(id)})
    if match:
        match['_id'] = str(match['_id'])
        return jsonify({
            'data': match
        })
    else:
        return jsonify({
            'notif': {
                'type': "warning",
                'msg': f"Unable to get best match: id {id} not found",
            }
        })

@best_matches_bp.route('/<id>', methods=['PUT'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Update a best match by ID',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'string',
            'required': True
        },
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'issue': {'type': 'string'},
                    'best_match': {'type': 'string'},
                    'similarity_score': {'type': 'number'}
                },
                'required': ['issue', 'best_match', 'similarity_score']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Best match updated successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Best match updated successfully'
                    }
                }
            }
        },
        '400': {
            'description': 'Failed to update best match'
        }
    }
})
def update_best_match(id):
    try:
        match_data = request.json
        result = db.matched_issues.update_one({'_id': ObjectId(id)}, {'$set': match_data})
        if result.matched_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': "Best match updated successfully",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to update best match: id {id} not found",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to update best match: {str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        })

@best_matches_bp.route('/<id>', methods=['DELETE'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Delete a best match by ID',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'type': 'string',
            'required': True
        }
    ],
    'responses': {
        '200': {
            'description': 'Best match deleted successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Best match deleted successfully'
                    }
                }
            }
        },
        '404': {
            'description': 'Best match not found'
        }
    }
})
def delete_best_match(id):
    try:
        result = db.matched_issues.delete_one({'_id': ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': "Best match deleted successfully",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to delete best match: id {id} not found",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to delete best match: {str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        })

@best_matches_bp.route('/no_match', methods=['GET'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Get all issues with no match',
    'responses': {
        '200': {
            'description': 'A list of issues with no match',
            'examples': {
                'application/json': {
                    'data': [
                        {
                            'issue': 'Issue description here...',
                            'reason': 'No paths with sufficient similarity'
                        }
                    ]
                }
            }
        }
    }
})
def get_no_match_issues():
    no_match_issues = []
    for issue in db.matched_issues.find({'best_matches': None}):
        issue['_id'] = str(issue['_id'])
        no_match_issues.append(issue)
    return jsonify({
        'data': no_match_issues
    })

@best_matches_bp.route('/update_no_match_issue', methods=['POST'])
@swag_from({
    'tags': ['Best Matches'],
    'description': 'Update a no match issue by adding a best match',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},
                    'best_match': {'type': 'string'},
                    'similarity_score': {'type': 'number'}
                },
                'required': ['id', 'best_match', 'similarity_score']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'No match issue updated successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'No match issue updated successfully'
                    }
                }
            }
        },
        '400': {
            'description': 'Failed to update no match issue'
        }
    }
})
def update_no_match_issue():
    try:
        match_data = request.json
        issue_id = match_data.get('id')
        best_match = match_data.get('best_match')
        similarity_score = match_data.get('similarity_score')
        
        if not issue_id or not best_match or similarity_score is None:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': "Invalid input data",
                }
            }), 400

        result = db.matched_issues.update_one(
            {'_id': ObjectId(issue_id)},
            {'$set': {'best_matches': [{'path': best_match, 'similarity_score': similarity_score}]}}
        )
        if result.matched_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': "No match issue updated successfully",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to update no match issue: id {issue_id} not found",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to update no match issue: {str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        })

app.register_blueprint(best_matches_bp, url_prefix='/best_matches')


