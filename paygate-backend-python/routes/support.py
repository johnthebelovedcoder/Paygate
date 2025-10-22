from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import SupportCategory, SupportTicket, SupportTicketResponse, User
from schemas import *
from services import support_service
from utils.auth import get_current_user
from utils.pagination import PaginationParams, create_paginated_response
from typing import List

router = APIRouter()


# Support Categories
@router.get("/support/categories", response_model=List[SupportCategory])
async def get_support_categories(db: AsyncSession = Depends(get_db)):
    categories = await support_service.get_all_active_support_categories(db)
    return categories


@router.post("/support/categories", response_model=SupportCategory)
async def create_support_category(
    category: SupportCategoryCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create support categories"
        )
    created_category = await support_service.create_support_category(db, category)
    return created_category


# Support Tickets
@router.get("/support/tickets", response_model=List[SupportTicket])
async def get_user_tickets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tickets = await support_service.get_tickets_by_user(db, current_user.id)
    return tickets


@router.post("/support/tickets", response_model=SupportTicket)
async def create_support_ticket(
    ticket: SupportTicketCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure user can only create ticket for themselves
    if ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create ticket for another user"
        )
    created_ticket = await support_service.create_support_ticket(db, ticket)
    return created_ticket


@router.get("/support/tickets/{ticket_id}", response_model=SupportTicket)
async def get_ticket(
    ticket_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ticket = await support_service.get_support_ticket_by_id(db, ticket_id)
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    return ticket


@router.put("/support/tickets/{ticket_id}", response_model=SupportTicket)
async def update_ticket(
    ticket_id: int,
    ticket_update: SupportTicketCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ticket = await support_service.get_support_ticket_by_id(db, ticket_id)
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    # In a real implementation, you'd update the ticket with ticket_update data
    # For now, just return the existing ticket
    return ticket


# Ticket Responses
@router.get("/support/tickets/{ticket_id}/responses", response_model=List[SupportTicketResponse])
async def get_ticket_responses(
    ticket_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ticket = await support_service.get_support_ticket_by_id(db, ticket_id)
    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    responses = await support_service.get_responses_by_ticket(db, ticket_id)
    return responses


@router.post("/support/tickets/{ticket_id}/responses", response_model=SupportTicketResponse)
async def add_ticket_response(
    ticket_id: int,
    response: SupportTicketResponseCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ticket = await support_service.get_support_ticket_by_id(db, ticket_id)
    if not ticket or (ticket.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    if response.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot add response as another user"
        )
    created_response = await support_service.create_ticket_response(db, response)
    return created_response