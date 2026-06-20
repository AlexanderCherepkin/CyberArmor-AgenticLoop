"""Add payment, shipping address and order workflow fields.

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # payments
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id'), unique=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('provider', sa.String(16), nullable=False),
        sa.Column('provider_tx_id', sa.String(255), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD', nullable=False),
        sa.Column('status', sa.String(16), default='pending', nullable=False),
        sa.Column('metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )

    # shipping_addresses
    op.create_table(
        'shipping_addresses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id'), unique=True, nullable=False),
        sa.Column('recipient_name', sa.String(255), nullable=False),
        sa.Column('line_1', sa.String(255), nullable=False),
        sa.Column('line_2', sa.String(255), nullable=True),
        sa.Column('city', sa.String(128), nullable=False),
        sa.Column('postal_code', sa.String(32), nullable=False),
        sa.Column('country', sa.String(2), nullable=False),
        sa.Column('fulfillment_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_scrubbed', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # orders: drop old nullable user, shipping_address string; make user_id non-null
    op.alter_column('orders', 'user_id', nullable=False)
    op.drop_column('orders', 'shipping_address')


def downgrade() -> None:
    op.add_column('orders', sa.Column('shipping_address', sa.String(512), nullable=True))
    op.alter_column('orders', 'user_id', nullable=True)
    op.drop_table('shipping_addresses')
    op.drop_table('payments')
