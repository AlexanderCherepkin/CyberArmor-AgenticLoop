from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)


def require_internal_token(credentials: HTTPAuthorizationCredentials | None = Security(security)) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing authorization")
    return credentials.credentials
