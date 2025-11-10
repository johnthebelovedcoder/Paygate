from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Index, Boolean
from sqlalchemy.sql import func
from config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # User who performed the action (nullable for system actions)
    action = Column(String(100), nullable=False, index=True)  # Type of action (create, update, delete, login, etc.)
    resource_type = Column(String(100), nullable=False, index=True)  # Type of resource (user, content, payment, etc.)
    resource_id = Column(Integer, nullable=True, index=True)  # ID of the resource that was acted upon
    old_values = Column(JSON, nullable=True)  # Previous values before update (as JSON)
    new_values = Column(JSON, nullable=True)  # New values after update (as JSON)
    ip_address = Column(String(45), nullable=True)  # IP address of the user
    user_agent = Column(Text, nullable=True)  # User agent string
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # When the action occurred
    success = Column(Boolean, default=True, index=True)  # Whether the action was successful
    details = Column(Text, nullable=True)  # Additional details about the action

    # Compound indexes for common queries
    __table_args__ = (
        Index('idx_audit_user_timestamp', 'user_id', 'timestamp'),  # For user activity queries
        Index('idx_audit_resource', 'resource_type', 'resource_id'),  # For resource change tracking
        Index('idx_audit_action_timestamp', 'action', 'timestamp'),  # For action-based queries
        Index('idx_audit_success_timestamp', 'success', 'timestamp'),  # For success/error queries
    )


class DataChangeLog(Base):
    """
    More detailed change log for tracking modifications to sensitive data
    """
    __tablename__ = "data_change_logs"

    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), nullable=False, index=True)  # Name of the table
    record_id = Column(Integer, nullable=False, index=True)  # ID of the record
    field_name = Column(String(100), nullable=False, index=True)  # Name of the field that changed
    old_value = Column(Text, nullable=True)  # Previous value (encrypted if sensitive)
    new_value = Column(Text, nullable=True)  # New value (encrypted if sensitive)
    changed_by = Column(Integer, nullable=True, index=True)  # User ID who made the change
    change_type = Column(String(20), nullable=False, index=True)  # INSERT, UPDATE, DELETE
    ip_address = Column(String(45), nullable=True)  # IP address
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    reason = Column(Text, nullable=True)  # Reason for the change (optional)

    # Compound indexes for common queries
    __table_args__ = (
        Index('idx_change_record', 'table_name', 'record_id', 'timestamp'),  # For tracking changes to a specific record
        Index('idx_change_user', 'changed_by', 'timestamp'),  # For user change history
        Index('idx_change_field', 'table_name', 'field_name', 'timestamp'),  # For tracking changes to specific fields
    )