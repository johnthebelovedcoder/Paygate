"""
AB Testing Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import select as sqlalchemy_select
from models.ab_test import ABTest as ABTestModel, ABTestVariant as ABTestVariantModel, ABTestStatus, ABTestType, ABTestObjective
from schemas.ab_test_schema import ABTestCreate, ABTestUpdate, ABTestVariantCreate
from typing import List, Optional
from datetime import datetime, date
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)


async def get_ab_tests_by_owner(db: AsyncSession, owner_id: int) -> List[ABTestModel]:
    """Get all AB tests for a specific owner"""
    result = await db.execute(
        select(ABTestModel)
        .filter(ABTestModel.owner_id == owner_id)
        .options(selectinload(ABTestModel.variants))
        .order_by(ABTestModel.created_at.desc())
    )
    return result.scalars().all()


async def get_ab_test_by_id(db: AsyncSession, test_id: int, owner_id: int) -> Optional[ABTestModel]:
    """Get a specific AB test by ID for the owner"""
    result = await db.execute(
        select(ABTestModel)
        .filter(ABTestModel.id == test_id)
        .filter(ABTestModel.owner_id == owner_id)
        .options(selectinload(ABTestModel.variants))
    )
    return result.scalar_one_or_none()


async def create_ab_test(db: AsyncSession, ab_test: ABTestCreate, owner_id: int) -> ABTestModel:
    """Create a new AB test with its variants"""
    from models.ab_test import ABTest as ABTestModel, ABTestVariant as ABTestVariantModel
    
    # Validate that variant weights sum to approximately 1.0
    total_weight = sum([v.weight for v in ab_test.variants])
    if not (0.99 <= total_weight <= 1.01):  # Allow small floating point differences
        raise ValueError(f"Variant weights must sum to 1.0, got {total_weight}")
    
    # Create the AB test
    db_ab_test = ABTestModel(
        owner_id=owner_id,
        name=ab_test.name,
        description=ab_test.description,
        type=ab_test.type,
        objective=ab_test.objective,
        start_date=ab_test.start_date,
        end_date=ab_test.end_date,
        status=ABTestStatus.DRAFT,  # Start as draft until activated
        current_sample=0,
        is_winner_determined=False
    )
    
    db.add(db_ab_test)
    await db.flush()  # Flush to get the ID for the test
    
    # Create variants
    for variant_data in ab_test.variants:
        variant = ABTestVariantModel(
            test_id=db_ab_test.id,
            name=variant_data.name,
            description=variant_data.description,
            weight=variant_data.weight,
            converted_count=0,
            total_visitors=0
        )
        db.add(variant)
    
    await db.commit()
    await db.refresh(db_ab_test, attribute_names=['variants'])
    
    return db_ab_test


async def update_ab_test(db: AsyncSession, test_id: int, owner_id: int, test_update: ABTestUpdate) -> Optional[ABTestModel]:
    """Update an existing AB test"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return None
    
    # Update allowed fields
    update_data = test_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ab_test, field, value)
    
    await db.commit()
    await db.refresh(db_ab_test)
    return db_ab_test


async def delete_ab_test(db: AsyncSession, test_id: int, owner_id: int) -> bool:
    """Delete an AB test"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return False
    
    await db.delete(db_ab_test)
    await db.commit()
    return True


async def activate_ab_test(db: AsyncSession, test_id: int, owner_id: int) -> Optional[ABTestModel]:
    """Activate an AB test (change status to running)"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return None
    
    if db_ab_test.status != ABTestStatus.DRAFT:
        raise ValueError("Cannot activate test that is not in draft status")
    
    db_ab_test.status = ABTestStatus.RUNNING
    db_ab_test.start_date = db_ab_test.start_date or date.today()  # Set start date if not already set
    
    await db.commit()
    await db.refresh(db_ab_test)
    return db_ab_test


async def pause_ab_test(db: AsyncSession, test_id: int, owner_id: int) -> Optional[ABTestModel]:
    """Pause an AB test"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return None
    
    if db_ab_test.status != ABTestStatus.RUNNING:
        raise ValueError("Cannot pause test that is not running")
    
    db_ab_test.status = ABTestStatus.PAUSED
    await db.commit()
    await db.refresh(db_ab_test)
    return db_ab_test


async def complete_ab_test(db: AsyncSession, test_id: int, owner_id: int) -> Optional[ABTestModel]:
    """Complete an AB test"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return None
    
    if db_ab_test.status not in [ABTestStatus.RUNNING, ABTestStatus.PAUSED]:
        raise ValueError("Cannot complete test that is not running or paused")
    
    db_ab_test.status = ABTestStatus.COMPLETED
    db_ab_test.end_date = db_ab_test.end_date or date.today()  # Set end date if not already set
    
    # Determine winner based on conversion rate
    variants_result = await db.execute(
        select(ABTestVariantModel)
        .filter(ABTestVariantModel.test_id == test_id)
    )
    variants = variants_result.scalars().all()
    
    if variants:
        # Find variant with highest conversion rate
        best_variant = max(variants, key=lambda v: (v.converted_count / v.total_visitors) if v.total_visitors > 0 else 0)
        db_ab_test.winner_variant_id = best_variant.id
        db_ab_test.is_winner_determined = True
    
    await db.commit()
    await db.refresh(db_ab_test)
    return db_ab_test


async def update_variant_metrics(
    db: AsyncSession, 
    test_id: int, 
    variant_id: int, 
    owner_id: int,
    increment_visitors: int = 0, 
    increment_conversions: int = 0
) -> Optional[ABTestVariantModel]:
    """Update metrics for a specific variant"""
    # Verify the variant belongs to the owner's test
    result = await db.execute(
        select(ABTestVariantModel)
        .join(ABTestModel)
        .filter(ABTestVariantModel.id == variant_id)
        .filter(ABTestModel.id == test_id)
        .filter(ABTestModel.owner_id == owner_id)
    )
    variant = result.scalar_one_or_none()
    
    if not variant:
        return None
    
    variant.total_visitors += increment_visitors
    variant.converted_count += increment_conversions
    
    await db.commit()
    await db.refresh(variant)
    return variant


async def get_ab_test_results(db: AsyncSession, test_id: int, owner_id: int) -> Optional[dict]:
    """Get results for a specific AB test"""
    db_ab_test = await get_ab_test_by_id(db, test_id, owner_id)
    if not db_ab_test:
        return None
    
    # Get all variants for this test
    variants_result = await db.execute(
        select(ABTestVariantModel)
        .filter(ABTestVariantModel.test_id == test_id)
    )
    variants = variants_result.scalars().all()
    
    # Calculate conversion rates and other metrics
    conversion_rates = []
    total_sample = 0
    for variant in variants:
        conversion_rate = (variant.converted_count / variant.total_visitors * 100) if variant.total_visitors > 0 else 0
        conversion_rates.append({
            'variant_id': variant.id,
            'variant_name': variant.name,
            'conversion_rate': round(conversion_rate, 2),
            'sample_size': variant.total_visitors,
            'conversions': variant.converted_count
        })
        total_sample += variant.total_visitors
    
    # Determine statistical significance (simplified calculation)
    # In a real implementation, you'd want to use proper statistical tests
    stat_sig = 0.0
    if len(variants) >= 2:
        # Simple comparison - this is a simplified version
        conversion_rates_sorted = sorted(conversion_rates, key=lambda x: x['conversion_rate'], reverse=True)
        if len(conversion_rates_sorted) >= 2:
            best_rate = conversion_rates_sorted[0]['conversion_rate']
            second_best_rate = conversion_rates_sorted[1]['conversion_rate']
            # A simplified statistical significance calculation
            if total_sample > 100 and best_rate > 0:  # Minimum sample size
                # This is a simplified calculation; real A/B testing requires proper statistical tests
                relative_improvement = ((best_rate - second_best_rate) / second_best_rate) if second_best_rate > 0 else 0
                # Statistical significance based on sample size and effect size
                if relative_improvement > 0.05 and total_sample > 500:  # 5% improvement with 500+ samples
                    stat_sig = 0.05  # Significant at 95%
                else:
                    stat_sig = 0.15  # Not significant
    
    winner_variant_id = None
    if db_ab_test.winner_variant_id:
        winner_variant_id = db_ab_test.winner_variant_id
    elif len(conversion_rates) > 0:
        # If no winner is set in DB, determine winner based on current data
        winner_variant_id = conversion_rates[0]['variant_id'] if conversion_rates else None
    
    return {
        'test_id': test_id,
        'winner_variant_id': winner_variant_id,
        'statistical_significance': stat_sig,
        'conversion_rates': conversion_rates,
        'total_sample': total_sample
    }