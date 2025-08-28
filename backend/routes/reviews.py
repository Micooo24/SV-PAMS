from fastapi import APIRouter, HTTPException, Body
from typing import List
from models.reviews import Review
from controllers.reviews import (
    get_review_by_id,
    get_reviews_by_cart_id,
    get_all_reviews,
    create_review,
    update_review,
    delete_review
)

router = APIRouter()

@router.get("/reviews", response_model=List[Review])
async def read_reviews():
    return get_all_reviews()

@router.get("/reviews/{review_id}", response_model=Review)
async def read_review(review_id: str):
    return get_review_by_id(review_id)

@router.get("/reviews/cart/{cart_id}", response_model=List[Review])
async def read_reviews_by_cart(cart_id: str):
    return get_reviews_by_cart_id(cart_id)

@router.post("/reviews", response_model=Review)
async def add_review(review: Review = Body(...)):
    return create_review(review)

@router.put("/reviews/{review_id}", response_model=Review)
async def edit_review(review_id: str, review_data: dict = Body(...)):
    return update_review(review_id, review_data)

@router.delete("/reviews/{review_id}")
async def remove_review(review_id: str):
    delete_review(review_id)
    return {"message": "Review deleted successfully"}
