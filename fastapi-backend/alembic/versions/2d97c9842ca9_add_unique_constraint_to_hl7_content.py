"""add_unique_constraint_to_hl7_content

Revision ID: 2d97c9842ca9
Revises: 2ae880efafd4
Create Date: 2025-09-27 00:16:25.783860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d97c9842ca9'
down_revision = '2ae880efafd4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add unique constraint to original_hl7_content column in saved_conversions table
    op.create_index('ix_saved_conversions_original_hl7_content_hash', 
                    'saved_conversions', 
                    [sa.text('MD5(original_hl7_content)')], 
                    unique=True)


def downgrade() -> None:
    # Remove the unique constraint
    op.drop_index('ix_saved_conversions_original_hl7_content_hash', table_name='saved_conversions')