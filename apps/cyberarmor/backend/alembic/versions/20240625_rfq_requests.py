"""Add RFQ requests table.

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'a7b8c9d0e1f2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'rfq_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('contact_email', sa.String(255), nullable=False, index=True),
        sa.Column('company_name', sa.String(128), nullable=True),
        sa.Column('first_name', sa.String(128), nullable=True),
        sa.Column('last_name', sa.String(128), nullable=True),
        sa.Column('phone', sa.String(64), nullable=True),
        sa.Column('seats_min', sa.Integer, default=0, nullable=False),
        sa.Column('seats_max', sa.Integer, nullable=True),
        sa.Column('infrastructure', sa.String(32), nullable=True),
        sa.Column('compliance_frameworks', sa.String(255), nullable=True),
        sa.Column('use_case', sa.Text, nullable=True),
        sa.Column('timeline', sa.String(32), nullable=True),
        sa.Column('urgency_score', sa.Integer, default=0, nullable=False),
        sa.Column('status', sa.String(32), default='new', nullable=False),
        sa.Column('crm_status', sa.String(32), nullable=True),
        sa.Column('crm_payload', sa.Text, nullable=True),
        sa.Column('is_converted', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('rfq_requests')
