from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt
from flasgger import swag_from
from config.blibs import *

login_bp = Blueprint('login_bp', __name__)
register_bp = Blueprint('register_bp', __name__)
db = get_db()

SECRET_KEY = 'Makiz-Code'

@login_bp.route('/', methods=['POST'])
@swag_from({
    'summary': 'Login to the application',
    'description': 'This endpoint allows users to login by providing a username and password. If the credentials are valid, a JWT token is returned.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {
                        'type': 'string',
                        'example': 'johndoe'
                    },
                    'password': {
                        'type': 'string',
                        'example': 'password123'
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Login successful',
            'examples': {
                'application/json': {
                    'data': {
                        'token': 'JWT_TOKEN',
                        'role': 'user'
                    }
                }
            }
        },
        401: {
            'description': 'Invalid credentials or account deactivated',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'danger', 
                        'msg': 'Failed to login: invalid credentials or account deactivated'
                    }
                }
            }
        }
    }
})
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    account = db.accounts.find_one({'username': username})
    if not account or not check_password_hash(account.get('password'), password):
        return jsonify({
            'notif': {
                'type': "danger", 
                'msg': f"Failed to login<b data-time='{get_time()}'></b>: invalid credentials",
            },
        })

    if not account.get('state'):
        return jsonify({
            'notif': {
                'type': "danger", 
                'msg': f"Failed to login<b data-time='{get_time()}'></b>: account deactivated",
            },
        })
    
    payload = {
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return jsonify({
        'data': {
            'token': token,
            'role': account.get('role'),
        },
    })

@register_bp.route('/', methods=['POST'])
@swag_from({
    'summary': 'Register a new account',
    'description': 'This endpoint allows new users to register by providing a username and password. If the username already exists, an error message is returned.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {
                        'type': 'string',
                        'example': 'johndoe'
                    },
                    'password': {
                        'type': 'string',
                        'example': 'password123'
                    },
                    'role': {
                        'type': 'string',
                        'example': '1'
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Registration successful',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success', 
                        'msg': 'Successfully registered: account created'
                    }
                }
            }
        },
        400: {
            'description': 'Username already exists',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'danger', 
                        'msg': 'Failed to register: username already exists'
                    }
                }
            }
        }
    }
})
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')  
    # Check if the username already exists
    if db.accounts.find_one({'username': username}):
        return jsonify({
            'notif': {
                'type': "danger", 
                'msg': f"Failed to register<b data-time='{get_time()}'></b>: username already exists",
            },
        })

    # Hash the password and create the new account
    hashed_password = generate_password_hash(password)
    new_account = {
        'username': username,
        'password': hashed_password,
        'role': role,
        'state': True,  # Assuming new accounts are active by default
        'created_at': datetime.datetime.utcnow(),
    }
    db.accounts.insert_one(new_account)

    return jsonify({
        'notif': {
            'type': "success", 
                'msg': f"Successfully registered<b data-time='{get_time()}'></b>: account created",
        },
    })
