"""Convert financial fields to cents, add promo codes and shipping method.

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # promo_codes
    op.create_table(
        'promo_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('code', sa.String(32), unique=True, index=True, nullable=False),
        sa.Column('discount_percent', sa.Integer, nullable=True),
        sa.Column('discount_amount_cents', sa.Integer, nullable=True),
        sa.Column('min_quantity', sa.Integer, default=0, nullable=False),
        sa.Column('max_uses', sa.Integer, nullable=True),
        sa.Column('uses_count', sa.Integer, default=0, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('applies_to_b2b_only', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # products: price -> price_cents
    op.alter_column('products', 'price', new_column_name='price_cents', type_=sa.Integer,
                    postgresql_using='(price * 100)::integer')

    # orders: add cents fields and shipping method
    op.alter_column('orders', 'total_amount', new_column_name='total_cents', type_=sa.Integer,
                    postgresql_using='(total_amount * 100)::integer')
    op.add_column('orders', sa.Column('subtotal_cents', sa.Integer, nullable=True))
    op.add_column('orders', sa.Column('discount_cents', sa.Integer, default=0, nullable=False))
    op.add_column('orders', sa.Column('tax_cents', sa.Integer, default=0, nullable=False))
    op.add_column('orders', sa.Column('shipping_cents', sa.Integer, nullable=True))
    op.add_column('orders', sa.Column('shipping_method', sa.String(16), default='standard', nullable=False))
    op.add_column('orders', sa.Column('promo_code_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('promo_codes.id'), nullable=True))

    # backfill subtotal_cents and shipping_cents for existing rows
    op.execute("UPDATE orders SET subtotal_cents = total_cents, shipping_cents = 0 WHERE subtotal_cents IS NULL")
    op.alter_column('orders', 'subtotal_cents', nullable=False)
    op.alter_column('orders', 'shipping_cents', nullable=False)

    # order_items: unit_price -> unit_price_cents
    op.alter_column('order_items', 'unit_price', new_column_name='unit_price_cents', type_=sa.Integer,
                    postgresql_using='(unit_price * 100)::integer')

    # payments: amount -> amount_cents
    op.alter_column('payments', 'amount', new_column_name='amount_cents', type_=sa.Integer,
                    postgresql_using='(amount * 100)::integer')

    # seed default promo codes
    op.execute("""
        INSERT INTO promo_codes (code, discount_percent, min_quantity, max_uses, uses_count, applies_to_b2b_only, expires_at)
        VALUES
            ('EARLY10', 10, 1, NULL, 0, FALSE, NOW() + INTERVAL '1 year'),
            ('B2B15', 15, 1, NULL, 0, TRUE, NOW() + INTERVAL '1 year'),
            ('BULK10', 10, 2, NULL, 0, FALSE, NOW() + INTERVAL '1 year')
    """)


def downgrade() -> None:
    op.alter_column('payments', 'amount_cents', new_column_name='amount', type_=sa.Numeric(12, 2),
                    postgresql_using='(amount_cents / 100.0)::numeric(12,2)')
    op.alter_column('order_items', 'unit_price_cents', new_column_name='unit_price', type_=sa.Numeric(12, 2),
                    postgresql_using='(unit_price_cents / 100.0)::numeric(12,2)')
    op.drop_column('orders', 'promo_code_id')
    op.drop_column('orders', 'shipping_method')
    op.drop_column('orders', 'shipping_cents')
    op.drop_column('orders', 'tax_cents')
    op.drop_column('orders', 'discount_cents')
    op.drop_column('orders', 'subtotal_cents')
    op.alter_column('orders', 'total_cents', new_column_name='total_amount', type_=sa.Numeric(12, 2),
                    postgresql_using='(total_cents / 100.0)::numeric(12,2)')
    op.alter_column('products', 'price_cents', new_column_name='price', type_=sa.Numeric(12, 2),
                    postgresql_using='(price_cents / 100.0)::numeric(12,2)')
    op.drop_table('promo_codes')
