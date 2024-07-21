import re
from pymongo import MongoClient
from bson import ObjectId  # Correct import for ObjectId

class TreeNode:
    def __init__(self, id, name, children=None, activated=True):
        self.id = self.validate_id(id)
        self.name = self.validate_name(name)
        self.activated = activated
        self.children = [TreeNode.from_dict(child) for child in children] if children else []

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'activated': self.activated,
            'children': [child.to_dict() for child in self.children]
        }

    @staticmethod
    def from_dict(data):
        return TreeNode(
            id=data.get('id', 0),
            name=data.get('name', ''),
            activated=data.get('activated', True),
            children=data.get('children', [])
        )

    @staticmethod
    def validate_id(id):
        if isinstance(id, int) and id > 0:
            return id
        else:
            raise Exception("id: Invalid id format")

    @staticmethod
    def validate_name(name):
        return name
