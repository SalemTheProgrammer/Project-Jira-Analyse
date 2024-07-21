class JiraTicket:
    def __init__(self, Key: str, Title: str, Created: int, Updated: int, Status: str, Project: str, Component: str, 
                 TicketType: str, Resolution: str, Description: str, Comments: str, SumDesc: str, SumComm: str, 
                 TicketSum: str, Embedding: list, Activated: bool = True):
        self.Key = Key
        self.Title = Title
        self.Created = Created
        self.Updated = Updated
        self.Status = Status
        self.Project = Project
        self.Component = Component
        self.TicketType = TicketType
        self.Resolution = Resolution
        self.Description = Description
        self.Comments = Comments
        self.SumDesc = SumDesc
        self.SumComm = SumComm
        self.TicketSum = TicketSum
        self.Embedding = Embedding
        self.Activated = Activated

    def to_dict(self) -> dict:
        return {
            'Key': self.Key,
            'Title': self.Title,
            'Created': self.Created,
            'Updated': self.Updated,
            'Status': self.Status,
            'Project': self.Project,
            'Component': self.Component,
            'TicketType': self.TicketType,
            'Resolution': self.Resolution,
            'Description': self.Description,
            'Comments': self.Comments,
            'SumDesc': self.SumDesc,
            'SumComm': self.SumComm,
            'TicketSum': self.TicketSum,
            'Embedding': self.Embedding,
            'Activated': self.Activated,
        }

    @staticmethod
    def from_dict(data: dict) -> 'JiraTicket':
        return JiraTicket(
            Key=data.get('ID', ''),
            Title=data.get('Title', ''),
            Created=data.get('Created', 0),
            Updated=data.get('Updated', 0),
            Status=data.get('Status', ''),
            Project=data.get('Project', ''),
            Component=data.get('Component', ''),
            TicketType=data.get('Type', ''),
            Resolution=data.get('Resolution', ''),
            Description=data.get('Description', ''),
            Comments=data.get('Comments', ''),
            SumDesc=data.get('SumDesc', ''),
            SumComm=data.get('SumComm', ''),
            Activated=data.get('Activated', True)
        )
