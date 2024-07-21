from flask import Flask, Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flasgger import Swagger, swag_from
import config.blibs as blibs
import datetime

app = Flask(__name__)
swagger = Swagger(app)

account_bp = Blueprint('account_bp', __name__)
db = blibs.get_db()

def get_time():
    # Define the get_time function here if it's used
    return datetime.datetime.utcnow().isoformat()

@account_bp.route('/', methods=['POST'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Add a new account',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string'},
                    'password': {'type': 'string'},
                    'role': {'type': 'string'}
                },
                'required': ['username', 'password']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Account added successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Account <b data-time=\'time\'>username</b> Added Successfully'
                    }
                }
            }
        },
        '400': {
            'description': 'Failed to add account'
        }
    }
})
def addAccount():
    try:
        account_data = request.json
        existing_account = db.accounts.find_one({'username': account_data['username']})
        if existing_account and check_password_hash(existing_account.get('password'), account_data['password']):
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to add account: Username <b data-time='{get_time()}'>{account_data['username']}</b> already exists",
                }
            })

        account = {
            'username': account_data['username'],
            'password': generate_password_hash(account_data['password']),
            'role': account_data.get('role', 'user'),
            'state': True,
            'created_at': datetime.datetime.utcnow(),
        }

        result = db.accounts.insert_one(account)
        if result.inserted_id:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Account <b data-time='{get_time()}'>{account_data['username']}</b> Added Successfully",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to add account: <b data-time='{get_time()}'></b>{str(e)}",
            }
        })

@account_bp.route('/', methods=['GET'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Get all accounts',
    'responses': {
        '200': {
            'description': 'A list of accounts',
            'examples': {
                'application/json': {
                    'data': [
                        {
                            'username': 'username1',
                            'role': 'role1'
                        }
                    ]
                }
            }
        }
    }
})
def getAccounts():
    accounts = []
    for account in db.accounts.find({'role': {'$ne': '0'}}):
        account['_id'] = str(account['_id'])
        accounts.append(account)
    return jsonify({
        'data': accounts
    })

@account_bp.route('/<id>', methods=['GET'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Get an account by ID',
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
            'description': 'Account details',
            'examples': {
                'application/json': {
                    'data': {
                        'username': 'username1',
                        'role': 'role1'
                    }
                }
            }
        },
        '404': {
            'description': 'Account not found'
        }
    }
})
def getAccount(id):
    account = db.accounts.find_one({'_id': ObjectId(id)})
    if account:
        account['_id'] = str(account['_id'])
        return jsonify({
            'data': account
        })
    else:
        return jsonify({
            'notif': {
                'type': "warning",
                'msg': f"Unable to get account: id <b data-time='{get_time()}'>{id}</b> not found",
            }
        })

@account_bp.route('/<id>', methods=['PUT'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Update an account by ID',
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
                    'username': {'type': 'string'},
                    'password': {'type': 'string'},
                    'role': {'type': 'string'}
                },
                'required': ['username', 'password']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Account updated successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Account <b data-time=\'time\'>username</b> Updated Successfully'
                    }
                }
            }
        },
        '400': {
            'description': 'Failed to update account'
        }
    }
})
def updateAccount(id):
    try:
        account_data = request.json
        existing_account = db.accounts.find_one({'username': account_data['username']})
        if existing_account and check_password_hash(existing_account.get('password'), account_data['password']) and str(existing_account['_id']) != id:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to update account: Username <b data-time='{get_time()}'>{account_data['username']}</b> already exists",
                }
            })

        account = {
            'username': account_data['username'],
            'password': account_data['password'],
            'role': account_data.get('role', 'user'),
            'state': True,
            'created_at': datetime.datetime.utcnow(),
        }
        if len(account['password']) != 64 and 'scrypt' not in account['password']:
            account['password'] = generate_password_hash(account['password'])

        result = db.accounts.update_one({'_id': ObjectId(id)}, {'$set': account})
        if result.modified_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Account <b data-time='{get_time()}'>{account_data['username']}</b> Updated Successfully",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to update account: id <b data-time='{id}'>{id}</b> not found",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to update account: <b data-time='{get_time()}'></b>{str(e)}",
            }
        })

@account_bp.route('/<id>', methods=['DELETE'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Delete an account by ID',
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
            'description': 'Account deleted successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Account <b data-time=\'time\'>username</b> Deleted Successfully'
                    }
                }
            }
        },
        '404': {
            'description': 'Account not found'
        }
    }
})
def deleteAccount(id):
    account = db.accounts.find_one({'_id': ObjectId(id)})
    if account:
        result = db.accounts.delete_one({'_id': ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Account <b data-time='{get_time()}'>{account.get('username')}</b> Deleted Successfully",
                }
            })
    else:
        return jsonify({
            'notif': {
                'type': "warning",
                'msg': f"Unable to delete account: id <b data-time='{get_time()}'>{id}</b> not found",
            }
        })

@account_bp.route('/<id>/assign_project', methods=['POST'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Assign a project to an account by project name',
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
                    'project_name': {'type': 'string'}
                },
                'required': ['project_name']
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Project assigned successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Project assigned successfully'
                    }
                }
            }
        },
        '404': {
            'description': 'Account or project not found'
        },
        '400': {
            'description': 'Failed to assign project'
        }
    }
})
def assignProjectByName(id):
    try:
        project_name = request.json.get('project_name')
        if not project_name:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': "Project name is required"
                }
            }), 400

        account = db.accounts.find_one({'_id': ObjectId(id)})
        if not account:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to find account: id <b data-time='{get_time()}'>{id}</b> not found",
                }
            }), 404

        project = db.jira_tickets.find_one({'Project': project_name})
        if not project:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to find project: name <b data-time='{get_time()}'>{project_name}</b> not found",
                }
            }), 404

        if 'projects' not in account:
            account['projects'] = []

        if project_name in account['projects']:
            return jsonify({
                'notif': {
                    'type': "info",
                    'msg': f"Project already assigned to account: id <b data-time='{get_time()}'>{id}</b>"
                }
            }), 200

        account['projects'].append(project_name)
        result = db.accounts.update_one({'_id': ObjectId(id)}, {'$set': {'projects': account['projects']}})

        if result.modified_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Project assigned to account <b data-time='{get_time()}'>{account['username']}</b> successfully",
                }
            }), 200

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to assign project: <b data-time='{get_time()}'></b>{str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        }), 400

@account_bp.route('/<id>/projects', methods=['GET'])
@swag_from({
    'tags': ['Accounts'],
    'description': 'Get all project names assigned to an account',
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
            'description': 'A list of project names',
            'examples': {
                'application/json': {
                    'projects': [
                        'project1',
                        'project2'
                    ]
                }
            }
        },
        '404': {
            'description': 'Account not found'
        }
    }
})
def getProjectsForAccount(id):
    try:
        account = db.accounts.find_one({'_id': ObjectId(id)}, {'projects': 1, '_id': 0})
        if not account:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to find account: id <b data-time='{get_time()}'>{id}</b> not found",
                }
            }), 404

        projects = account.get('projects', [])
        return jsonify({
            'projects': projects
        }), 200

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to get projects: <b data-time='{get_time()}'></b>{str(e)}",
            },
            'error': {
                'field': str(e).split(": ")[0],
                'msg': str(e).split(": ")[1],
            }
        }), 400

app.register_blueprint(account_bp, url_prefix='/accounts')

if __name__ == '__main__':
    app.run(debug=True)
