import re
from typing import List, Dict, Any

class Account:
    def __init__(self, username: str, password: str, role: str, state: bool = True, projects: List[str] = None):
        self.username = self.validate_username(username)
        self.password = self.validate_password(password)
        self.role = self.validate_role(role)
        self.state = state
        self.projects = projects if projects is not None else []

    def to_dict(self) -> Dict[str, Any]:
        return {
            'username': self.username,
            'password': self.password,
            'role': self.role,
            'state': self.state,
            'projects': self.projects
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Account':
        return Account(
            username=data.get('username', ''),
            password=data.get('password', ''),
            role=data.get('role', ''),
            state=data.get('state', True),
            projects=data.get('projects', [])
        )

    @staticmethod
    def validate_username(username: str) -> str:
        if re.match(r'^[A-Za-z_]{1,30}$', username):
            return username
        else:
            raise ValueError("Invalid username format: Must be 1-30 characters long, containing only letters and underscores")

    @staticmethod
    def validate_password(password: str) -> str:
        if re.match(r'^.{8,200}$', password):
            return password
        else:
            raise ValueError("Invalid password format: Must be between 8 and 200 characters long")

    @staticmethod
    def validate_role(role: str) -> str:
        if role in ['1', '2', '3']:
            return role
        else:
            raise ValueError("Invalid role format: Must be one of '1', '2', or '3'")

    def add_project(self, project_key: str):
        if project_key not in self.projects:
            self.projects.append(project_key)
        else:
            raise ValueError("Project already added to this account")

    def remove_project(self, project_key: str):
        if project_key in self.projects:
            self.projects.remove(project_key)
        else:
            raise ValueError("Project not found in this account")

    def get_projects(self) -> List[str]:
        return self.projects


