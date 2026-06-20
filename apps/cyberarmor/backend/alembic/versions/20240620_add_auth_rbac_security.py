"""Add auth, RBAC, session and security audit tables.

Revision ID: b2c3d4e5f6a7
Revises: 9a1b2c3d4e5f
Create Date: 2026-06-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'b2c3d4e5f6a7'
down_revision = '9a1b2c3d4e5f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users updates
    op.add_column('users', sa.Column('email_verified', sa.Boolean, default=False, nullable=False))
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))
    op.drop_column('users', 'device_serial_numbers')

    # roles
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('name', sa.String(64), unique=True, nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # role_assignments
    op.create_table(
        'role_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('roles.id'), nullable=False),
        sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # user_sessions
    op.create_table(
        'user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('jti', sa.String(64), unique=True, nullable=False, index=True),
        sa.Column('ip_address', sa.String(64), nullable=True),
        sa.Column('user_agent_hash', sa.String(128), nullable=True),
        sa.Column('status', sa.String(16), default='active', nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # security_events
    op.create_table(
        'security_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('event_type', sa.String(32), nullable=False, index=True),
        sa.Column('ip_address', sa.String(64), nullable=True),
        sa.Column('user_agent_hash', sa.String(128), nullable=True),
        sa.Column('metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # seed default roles
    op.execute("INSERT INTO roles (name, description) VALUES ('b2c_user', 'Individual SecureKey owner')")
    op.execute("INSERT INTO roles (name, description) VALUES ('b2b_admin', 'Enterprise deployment manager')")
    op.execute("INSERT INTO roles (name, description) VALUES ('b2b_user', 'Enterprise key holder')")


def downgrade() -> None:
    op.drop_table('security_events')
    op.drop_table('user_sessions')
    op.drop_table('role_assignments')
    op.drop_table('roles')
    op.add_column('users', sa.Column('device_serial_numbers', sa.String(1024), nullable=True))
    op.drop_column('users', 'last_login_at')
    op.drop_column('users', 'email_verified')
