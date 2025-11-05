from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from models import SupportCategory, SupportTicket, SupportTicketResponse
from schemas.support import SupportCategoryCreate, SupportTicketCreate, SupportTicketResponseCreate


# Support Category Services
async def get_support_category_by_id(db: AsyncSession, category_id: int) -> Optional[SupportCategory]:
    result = await db.execute(select(SupportCategory).filter(SupportCategory.id == category_id))
    return result.scalar_one_or_none()


async def get_all_active_support_categories(db: AsyncSession) -> List[SupportCategory]:
    result = await db.execute(
        select(SupportCategory)
        .filter(SupportCategory.is_active == True)
        .order_by(SupportCategory.name)
    )
    return result.scalars().all()


async def create_support_category(db: AsyncSession, category: SupportCategoryCreate) -> SupportCategory:
    db_category = SupportCategory(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category


# Support Ticket Services
async def get_support_ticket_by_id(db: AsyncSession, ticket_id: int) -> Optional[SupportTicket]:
    result = await db.execute(select(SupportTicket).filter(SupportTicket.id == ticket_id))
    return result.scalar_one_or_none()


async def get_tickets_by_user(db: AsyncSession, user_id: int) -> List[SupportTicket]:
    result = await db.execute(
        select(SupportTicket)
        .filter(SupportTicket.user_id == user_id)
        .order_by(SupportTicket.created_at.desc())
    )
    return result.scalars().all()


async def get_tickets_by_status(db: AsyncSession, status: str) -> List[SupportTicket]:
    result = await db.execute(
        select(SupportTicket)
        .filter(SupportTicket.status == status)
        .order_by(SupportTicket.created_at.desc())
    )
    return result.scalars().all()


async def create_support_ticket(db: AsyncSession, ticket: SupportTicketCreate) -> SupportTicket:
    db_ticket = SupportTicket(**ticket.model_dump())
    db.add(db_ticket)
    await db.commit()
    await db.refresh(db_ticket)
    return db_ticket


async def update_ticket_status(db: AsyncSession, ticket_id: int, status: str) -> Optional[SupportTicket]:
    ticket = await get_support_ticket_by_id(db, ticket_id)
    if ticket:
        ticket.status = status
        ticket.updated_at = datetime.utcnow()
        if status in ["resolved", "closed"] and not ticket.resolved_at:
            ticket.resolved_at = datetime.utcnow()
        if status == "closed" and not ticket.closed_at:
            ticket.closed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(ticket)
    return ticket


# Support Ticket Response Services
async def get_responses_by_ticket(db: AsyncSession, ticket_id: int) -> List[SupportTicketResponse]:
    result = await db.execute(
        select(SupportTicketResponse)
        .filter(SupportTicketResponse.ticket_id == ticket_id)
        .order_by(SupportTicketResponse.created_at.asc())
    )
    return result.scalars().all()


async def create_ticket_response(db: AsyncSession, response: SupportTicketResponseCreate) -> SupportTicketResponse:
    db_response = SupportTicketResponse(**response.model_dump())
    db.add(db_response)
    await db.commit()
    await db.refresh(db_response)
    return db_response


# Support Statistics Services
async def get_support_statistics(db: AsyncSession) -> dict:
    """Get overall support statistics for admin users"""
    # Total tickets
    total_result = await db.execute(select(SupportTicket))
    total_tickets = len(total_result.scalars().all())
    
    # Open tickets
    open_result = await db.execute(select(SupportTicket).filter(SupportTicket.status == "open"))
    open_tickets = len(open_result.scalars().all())
    
    # Closed tickets
    closed_result = await db.execute(select(SupportTicket).filter(SupportTicket.status.in_(["resolved", "closed"])))
    closed_tickets = len(closed_result.scalars().all())
    
    # Average response time (simplified calculation)
    # Note: A more sophisticated implementation would track first response time
    average_response_time = 0  # Placeholder
    
    # Satisfaction rating (placeholder - would come from ticket feedback)
    satisfaction_rating = 0  # Placeholder
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "closed_tickets": closed_tickets,
        "average_response_time": average_response_time,
        "satisfaction_rating": satisfaction_rating
    }


async def get_user_support_statistics(db: AsyncSession, user_id: int) -> dict:
    """Get support statistics for a specific user"""
    # Total tickets for user
    total_result = await db.execute(
        select(SupportTicket).filter(SupportTicket.user_id == user_id)
    )
    total_tickets = len(total_result.scalars().all())
    
    # Open tickets for user
    open_result = await db.execute(
        select(SupportTicket).filter(
            SupportTicket.user_id == user_id,
            SupportTicket.status == "open"
        )
    )
    open_tickets = len(open_result.scalars().all())
    
    # Closed tickets for user
    closed_result = await db.execute(
        select(SupportTicket).filter(
            SupportTicket.user_id == user_id,
            SupportTicket.status.in_(["resolved", "closed"])
        )
    )
    closed_tickets = len(closed_result.scalars().all())
    
    # Average response time (placeholder)
    average_response_time = 0
    
    # Satisfaction rating (placeholder)
    satisfaction_rating = 0
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "closed_tickets": closed_tickets,
        "average_response_time": average_response_time,
        "satisfaction_rating": satisfaction_rating
    }