from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from models import Customer, User, Payment
from schemas.customer import CustomerCreate, CustomerUpdate


async def get_customer_by_id(db: AsyncSession, customer_id: int) -> Optional[Customer]:
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.owner))
        .filter(Customer.id == customer_id)
    )
    return result.scalar_one_or_none()


async def get_customer_by_email(db: AsyncSession, email: str) -> Optional[Customer]:
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.owner))
        .filter(Customer.email == email)
    )
    return result.scalar_one_or_none()


async def get_customers_by_owner(db: AsyncSession, owner_id: int) -> List[Customer]:
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.owner))
        .filter(Customer.owner_id == owner_id)
        .order_by(Customer.created_at.desc())
    )
    return result.scalars().all()


async def get_all_customers(db: AsyncSession) -> List[Customer]:
    result = await db.execute(
        select(Customer)
        .options(selectinload(Customer.owner))
    )
    return result.scalars().all()


async def create_customer(db: AsyncSession, customer: CustomerCreate) -> Customer:
    db_customer = Customer(
        name=customer.name,
        email=customer.email,
        total_spent=customer.total_spent,
        total_purchases=customer.total_purchases,
        last_purchase=customer.last_purchase,
        join_date=customer.join_date,
        status=customer.status,
        owner_id=customer.owner_id
    )
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer


async def update_customer(db: AsyncSession, customer_id: int, customer_update: CustomerUpdate) -> Optional[Customer]:
    db_customer = await get_customer_by_id(db, customer_id)
    if not db_customer:
        return None
    
    for field, value in customer_update.dict(exclude_unset=True).items():
        setattr(db_customer, field, value)
    
    db_customer.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_customer)
    return db_customer


async def delete_customer(db: AsyncSession, customer_id: int) -> bool:
    db_customer = await get_customer_by_id(db, customer_id)
    if not db_customer:
        return False
    
    await db.delete(db_customer)
    await db.commit()
    return True


async def update_customer_stats(db: AsyncSession, customer_email: str, amount: float, payment_status: str) -> Optional[Customer]:
    if payment_status != "completed":
        return None
        
    result = await db.execute(
        select(Customer)
        .filter(Customer.email == customer_email)
    )
    db_customer = result.scalar_one_or_none()
    
    if db_customer:
        # Update existing customer stats
        db_customer.total_spent += amount
        db_customer.total_purchases += 1
        db_customer.last_purchase = datetime.utcnow()
        await db.commit()
        await db.refresh(db_customer)
    else:
        # Create new customer if doesn't exist
        db_customer = Customer(
            name=customer_email.split('@')[0],  # Use email prefix as name if not provided
            email=customer_email,
            total_spent=amount,
            total_purchases=1,
            last_purchase=datetime.utcnow(),
            join_date=datetime.utcnow(),
            status="active",
            owner_id=1  # Default to first user, this should be updated based on context
        )
        db.add(db_customer)
        await db.commit()
        await db.refresh(db_customer)
    
    return db_customer